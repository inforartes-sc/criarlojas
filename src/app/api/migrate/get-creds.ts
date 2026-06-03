import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

async function runSQL(sql: string): Promise<any> {
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
  if (response.ok) {
    return response.json()
  }
  
  // Tentar via RPC exec_sql
  const res2 = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ sql })
  })
  if (res2.ok) {
    return res2.json()
  }

  const res3 = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ sql_string: sql })
  })
  if (res3.ok) {
    return res3.json()
  }

  throw new Error('Falha ao rodar SQL via endpoint ou RPC')
}

export async function GET() {
  try {
    const sql = `SELECT id, name, subdomain, settings FROM stores;`
    const data = await runSQL(sql)
    
    const credentials = data.map((store: any) => {
      const settings = store.settings || {}
      return {
        name: store.name,
        subdomain: store.subdomain,
        admin_user: settings.admin_user || settings.email || 'admin (padrão)',
        admin_password: settings.admin_password || 'senha123 (padrão)'
      }
    })

    return NextResponse.json({ success: true, credentials }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
