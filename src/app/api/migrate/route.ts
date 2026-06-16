import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

async function runSQL(sql: string): Promise<{ ok: boolean; error?: string }> {
  try {
    // Supabase expõe o endpoint /sql para executar SQL bruto (requer service_role)
    const response = await fetch(`${SUPABASE_URL}/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query: sql })
    })

    if (response.ok) return { ok: true }
    
    const text = await response.text()
    // Coluna já existe - não é erro
    if (text.includes('42701') || text.includes('already exists')) return { ok: true }
    
    // Tenta via RPC exec_sql (parâmetro 'sql')
    const res2 = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ sql })
    })
    if (res2.ok) return { ok: true }
    const t2 = await res2.text()
    if (t2.includes('42701') || t2.includes('already exists')) return { ok: true }

    // Tenta via RPC com parâmetro 'sql_string'
    const res3 = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ sql_string: sql })
    })
    if (res3.ok) return { ok: true }
    const t3 = await res3.text()
    if (t3.includes('42701') || t3.includes('already exists')) return { ok: true }

    return { ok: false, error: `Todas as tentativas falharam. Último erro: ${t3.slice(0, 300)}` }
  } catch (e: any) {
    return { ok: false, error: e.message }
  }
}

const migrations: { label: string; sql: string }[] = [
  { label: 'products.is_service', sql: `ALTER TABLE products ADD COLUMN IF NOT EXISTS is_service BOOLEAN DEFAULT false` },
  { label: 'products.hide_price', sql: `ALTER TABLE products ADD COLUMN IF NOT EXISTS hide_price BOOLEAN DEFAULT false` },
  { label: 'products.weight', sql: `ALTER TABLE products ADD COLUMN IF NOT EXISTS weight NUMERIC(10,3)` },
  { label: 'products.length', sql: `ALTER TABLE products ADD COLUMN IF NOT EXISTS length NUMERIC(10,2)` },
  { label: 'products.width', sql: `ALTER TABLE products ADD COLUMN IF NOT EXISTS width NUMERIC(10,2)` },
  { label: 'products.height', sql: `ALTER TABLE products ADD COLUMN IF NOT EXISTS height NUMERIC(10,2)` },
  { label: 'products.has_variations', sql: `ALTER TABLE products ADD COLUMN IF NOT EXISTS has_variations BOOLEAN DEFAULT false` },
  { label: 'products.variation_options', sql: `ALTER TABLE products ADD COLUMN IF NOT EXISTS variation_options JSONB DEFAULT '[]'::jsonb` },
  { label: 'products.variation_skus', sql: `ALTER TABLE products ADD COLUMN IF NOT EXISTS variation_skus JSONB DEFAULT '[]'::jsonb` },
  { label: 'customers.address_street', sql: `ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_street TEXT` },
  { label: 'customers.address_number', sql: `ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_number TEXT` },
  { label: 'customers.address_complement', sql: `ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_complement TEXT` },
  { label: 'customers.address_neighborhood', sql: `ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_neighborhood TEXT` },
  { label: 'customers.address_city', sql: `ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_city TEXT` },
  { label: 'customers.address_state', sql: `ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_state TEXT` },
  { label: 'customers.address_zip', sql: `ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_zip TEXT` },
  { label: 'customers.password_hash', sql: `ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_hash TEXT` },
  { label: 'orders.order_number', sql: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number TEXT` },
  { label: 'orders.payment_method', sql: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT` },
  { label: 'orders.payment_status', sql: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT` },
  { label: 'custom_invoices.create_table', sql: `CREATE TABLE IF NOT EXISTS custom_invoices (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), store_id UUID REFERENCES stores(id) ON DELETE CASCADE, title TEXT NOT NULL, description TEXT, amount NUMERIC(10,2) NOT NULL, due_date DATE NOT NULL, status TEXT NOT NULL DEFAULT 'pending', payment_method TEXT, paid_at TIMESTAMP WITH TIME ZONE, created_at TIMESTAMP WITH TIME ZONE DEFAULT now())` },
  { label: 'custom_invoices.rls', sql: `ALTER TABLE custom_invoices ENABLE ROW LEVEL SECURITY` },
  { label: 'custom_invoices.policy', sql: `DROP POLICY IF EXISTS "Permitir tudo para todos" ON custom_invoices; CREATE POLICY "Permitir tudo para todos" ON custom_invoices FOR ALL USING (true) WITH CHECK (true);` },
  { label: 'service_clients.create_table', sql: `CREATE TABLE IF NOT EXISTS service_clients (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), store_id UUID REFERENCES stores(id) ON DELETE CASCADE, name TEXT NOT NULL, email TEXT, phone TEXT, document TEXT, address TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT now())` },
  { label: 'service_clients.rls', sql: `ALTER TABLE service_clients ENABLE ROW LEVEL SECURITY` },
  { label: 'service_clients.policy', sql: `DROP POLICY IF EXISTS "Permitir tudo para todos" ON service_clients; CREATE POLICY "Permitir tudo para todos" ON service_clients FOR ALL USING (true) WITH CHECK (true);` },
  { label: 'custom_invoices.add_client_id', sql: `ALTER TABLE custom_invoices ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES service_clients(id) ON DELETE SET NULL` },
  { label: 'financial_entries.create_table', sql: `CREATE TABLE IF NOT EXISTS financial_entries (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), store_id UUID REFERENCES stores(id) ON DELETE CASCADE, type TEXT NOT NULL, description TEXT NOT NULL, amount NUMERIC(10,2) NOT NULL, due_date DATE NOT NULL, status TEXT NOT NULL DEFAULT 'pending', category TEXT, client_id UUID REFERENCES service_clients(id) ON DELETE SET NULL, payment_method TEXT, paid_at TIMESTAMP WITH TIME ZONE, created_at TIMESTAMP WITH TIME ZONE DEFAULT now())` },
  { label: 'financial_entries.rls', sql: `ALTER TABLE financial_entries ENABLE ROW LEVEL SECURITY` },
  { label: 'financial_entries.policy', sql: `DROP POLICY IF EXISTS "Permitir tudo para todos" ON financial_entries; CREATE POLICY "Permitir tudo para todos" ON financial_entries FOR ALL USING (true) WITH CHECK (true);` },
  { label: 'financial_entries.add_invoice_id', sql: `ALTER TABLE financial_entries ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES custom_invoices(id) ON DELETE CASCADE` },
  { label: 'abandoned_carts.create_table', sql: `CREATE TABLE IF NOT EXISTS abandoned_carts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), store_id UUID REFERENCES stores(id) ON DELETE CASCADE, customer_name TEXT, customer_phone TEXT, customer_email TEXT, items JSONB DEFAULT '[]'::jsonb, total_amount NUMERIC(10,2), recovered BOOLEAN DEFAULT false, created_at TIMESTAMP WITH TIME ZONE DEFAULT now())` },
  { label: 'abandoned_carts.rls', sql: `ALTER TABLE abandoned_carts ENABLE ROW LEVEL SECURITY` },
  { label: 'abandoned_carts.policy', sql: `DROP POLICY IF EXISTS "Permitir tudo para todos" ON abandoned_carts; CREATE POLICY "Permitir tudo para todos" ON abandoned_carts FOR ALL USING (true) WITH CHECK (true);` },
  { label: 'rpc.get_db_size', sql: `CREATE OR REPLACE FUNCTION get_db_size() RETURNS NUMERIC AS $$ BEGIN RETURN pg_database_size(current_database()); END; $$ LANGUAGE plpgsql SECURITY DEFINER;` },
  { label: 'rpc.get_active_connections', sql: `CREATE OR REPLACE FUNCTION get_active_connections() RETURNS INTEGER AS $$ BEGIN RETURN (SELECT count(*)::integer FROM pg_stat_activity); END; $$ LANGUAGE plpgsql SECURITY DEFINER;` },
  { label: 'setup.cascade_delete', sql: `DO $$ DECLARE r RECORD; BEGIN FOR r IN SELECT tc.table_name, kcu.column_name, tc.constraint_name FROM information_schema.table_constraints AS tc JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'stores' AND tc.table_schema = 'public' LOOP BEGIN EXECUTE 'ALTER TABLE ' || quote_ident(r.table_name) || ' DROP CONSTRAINT ' || quote_ident(r.constraint_name); EXECUTE 'ALTER TABLE ' || quote_ident(r.table_name) || ' ADD CONSTRAINT ' || quote_ident(r.constraint_name) || ' FOREIGN KEY (' || quote_ident(r.column_name) || ') REFERENCES stores(id) ON DELETE CASCADE'; EXCEPTION WHEN OTHERS THEN NULL; END; END LOOP; END; $$;` },
  { label: 'pgrst.reload', sql: `NOTIFY pgrst, 'reload schema'` },
]

export async function GET() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 })
  }

  const results: { label: string; status: string; error?: string }[] = []

  for (const m of migrations) {
    const result = await runSQL(m.sql)
    results.push({
      label: m.label,
      status: result.ok ? 'ok' : 'error',
      ...(result.error ? { error: result.error } : {})
    })
  }

  const errors = results.filter(r => r.status === 'error')

  return NextResponse.json({
    message: errors.length === 0
      ? '✅ Todas as migrações executadas com sucesso!'
      : `⚠️ ${errors.length} migração(ões) com erro`,
    sqlEditorUrl: `https://supabase.com/dashboard/project/${SUPABASE_URL.match(/https:\/\/([^.]+)\./)?.[1]}/sql`,
    results,
    errorCount: errors.length
  }, { status: 200 })
}
