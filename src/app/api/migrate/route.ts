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
