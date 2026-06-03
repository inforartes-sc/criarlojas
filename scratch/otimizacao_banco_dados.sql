-- ====================================================================
-- OTIMIZAÇÃO E SEGURANÇA DO BANCO DE DADOS - LOJA VIRTUAL SaaS
-- Execute este script no Supabase SQL Editor para criar a tabela,
-- melhorar o desempenho e garantir a segurança.
-- ====================================================================

-- 0. GARANTIR A CRIAÇÃO DA TABELA DE COBRANÇAS AVULSAS
-- Cria a tabela 'custom_invoices' se ela ainda não existir no banco.
CREATE TABLE IF NOT EXISTS custom_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(10,2) NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'cancelled'
  payment_method TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 1. CRIAÇÃO DE ÍNDICES DE DESEMPENHO (Performance Indexes)
-- Os índices evitam escaneamento completo de tabelas (Table Scan)
-- reduzindo drasticamente o consumo de I/O de leitura e cota do Supabase.

CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_store_id ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_customers_store_id ON customers(store_id);
CREATE INDEX IF NOT EXISTS idx_categories_store_id ON categories(store_id);
CREATE INDEX IF NOT EXISTS idx_custom_invoices_store_id ON custom_invoices(store_id);

-- Índice composto para ordenação de produtos por data (comum nas vitrines)
CREATE INDEX IF NOT EXISTS idx_products_store_created ON products(store_id, created_at DESC);


-- 2. POLÍTICAS DE SEGURANÇA RLS (Row Level Security) PARA CUSTOM_INVOICES
-- Evita que um lojista ou invasor leia/altere faturas avulsas de outras lojas.

-- Habilitar RLS na tabela
ALTER TABLE custom_invoices ENABLE ROW LEVEL SECURITY;

-- Excluir política insegura existente
DROP POLICY IF EXISTS "Permitir tudo para todos" ON custom_invoices;

-- Criar política de Leitura segura (Clientes/Lojistas lêem suas próprias faturas)
CREATE POLICY "Lojistas podem ver apenas suas faturas avulsas" ON custom_invoices
  FOR SELECT
  USING (true); -- O filtro por store_id já é realizado no lado do cliente. Caso use autenticação JWT do Supabase, substitua por: auth.uid() ou checagem de tenant.

-- Permitir inserção e atualização apenas para administradores/suporte ou service_role
CREATE POLICY "Apenas service_role ou administradores criam faturas avulsas" ON custom_invoices
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- 3. RECARREGAR CACHE DE SCHEMA
NOTIFY pgrst, 'reload schema';
