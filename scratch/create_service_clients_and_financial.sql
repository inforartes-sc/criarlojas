-- =========================================================================
-- SQL MIGRATION: CLIENTES DE SERVIÇO & FLUXO FINANCEIRO
-- Execute este script no painel do Supabase SQL Editor:
-- https://supabase.com/dashboard/project/schcpfbnochnevsivtaj/sql
-- =========================================================================

-- 1. Criar Tabela de Clientes de Serviço
CREATE TABLE IF NOT EXISTS service_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  document TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE service_clients ENABLE ROW LEVEL SECURITY;

-- Política de Acesso Simplificada
DROP POLICY IF EXISTS "Permitir tudo para todos" ON service_clients;
CREATE POLICY "Permitir tudo para todos" ON service_clients 
  FOR ALL USING (true) WITH CHECK (true);

-- 2. Alterar Tabela custom_invoices para Vincular Clientes
ALTER TABLE custom_invoices ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES service_clients(id) ON DELETE SET NULL;

-- 3. Criar Tabela de Fluxo Financeiro (Contas a Pagar/Receber)
CREATE TABLE IF NOT EXISTS financial_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'receivable' ou 'payable'
  description TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' ou 'paid'
  category TEXT,
  client_id UUID REFERENCES service_clients(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES custom_invoices(id) ON DELETE CASCADE,
  payment_method TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE financial_entries ENABLE ROW LEVEL SECURITY;

-- Política de Acesso Simplificada
DROP POLICY IF EXISTS "Permitir tudo para todos" ON financial_entries;
CREATE POLICY "Permitir tudo para todos" ON financial_entries 
  FOR ALL USING (true) WITH CHECK (true);

-- Recarregar o cache de schema do PostgREST
NOTIFY pgrst, 'reload schema';
