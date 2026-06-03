-- =====================================================
-- CRIAÇÃO DA TABELA DE COBRANÇAS AVULSAS (custom_invoices)
-- Execute este script no Supabase SQL Editor:
-- =====================================================

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

-- Habilitar Row Level Security (RLS)
ALTER TABLE custom_invoices ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso simples para leitura e escrita
DROP POLICY IF EXISTS "Permitir tudo para todos" ON custom_invoices;
CREATE POLICY "Permitir tudo para todos" ON custom_invoices
  FOR ALL USING (true) WITH CHECK (true);

-- Recarregar o cache de schema do PostgREST
NOTIFY pgrst, 'reload schema';
