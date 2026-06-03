-- =====================================================
-- MIGRAÇÃO COMPLETA DO BANCO DE DADOS - LOJA VIRTUAL
-- Execute este script no Supabase SQL Editor:
-- https://supabase.com/dashboard/project/schcpfbnochnevsivtaj/sql
-- =====================================================

-- 1. TABELA PRODUCTS: Coluna is_service (para lojas de serviços)
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_service BOOLEAN DEFAULT false;

-- 2. TABELA PRODUCTS: Dimensões e logística
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight NUMERIC(10,3);
ALTER TABLE products ADD COLUMN IF NOT EXISTS length NUMERIC(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS width NUMERIC(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS height NUMERIC(10,2);

-- 3. TABELA PRODUCTS: Suporte a variações (cores, tamanhos, etc.)
ALTER TABLE products ADD COLUMN IF NOT EXISTS has_variations BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS variation_options JSONB DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS variation_skus JSONB DEFAULT '[]'::jsonb;

-- 4. TABELA CUSTOMERS: Campos de endereço completo
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_street TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_number TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_complement TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_neighborhood TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_city TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_state TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_zip TEXT;

-- 5. TABELA CUSTOMERS: Hash de senha para login de clientes
ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 6. TABELA ORDERS: Número de pedido e informações de pagamento
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT;

-- 7. Recarregar o cache de schema do PostgREST (IMPORTANTE!)
NOTIFY pgrst, 'reload schema';

-- =====================================================
-- FIM DA MIGRAÇÃO
-- Após executar, atualize a página do painel admin.
-- =====================================================
