// Script para verificar o email do super admin no Supabase
const SUPABASE_URL = 'https://schcpfbnochnevsivtaj.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaGNwZmJub2NobmV2c2l2dGFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODYyNTExMSwiZXhwIjoyMDk0MjAxMTExfQ.8hx8SdAr75mA9xv0cp3e5zKkFwo65isL6rGmtJAC4AY'

async function checkSuperAdmin() {
  console.log('=== VERIFICANDO SUPER ADMIN ===\n')

  // 1. Verificar auth.users (tabela de autenticação do Supabase)
  console.log('1. Consultando auth.users via Admin API...')
  const authRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?per_page=50`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    }
  })

  if (authRes.ok) {
    const authData = await authRes.json()
    const users = authData.users || authData
    console.log(`\n📧 Usuários cadastrados no Supabase Auth (${users.length} total):`)
    users.forEach((u, i) => {
      console.log(`  ${i+1}. Email: ${u.email}`)
      console.log(`     Role: ${u.role || 'user'}`)
      console.log(`     Criado em: ${u.created_at}`)
      console.log(`     Confirmado: ${u.email_confirmed_at ? 'Sim' : 'Não'}`)
      console.log('')
    })
  } else {
    const err = await authRes.text()
    console.log('Erro ao acessar auth.users:', err)
  }

  // 2. Verificar tabela super_admins se existir
  console.log('\n2. Verificando tabela super_admins...')
  const saRes = await fetch(`${SUPABASE_URL}/rest/v1/super_admins?select=*`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    }
  })
  if (saRes.ok) {
    const saData = await saRes.json()
    console.log('Registros em super_admins:', JSON.stringify(saData, null, 2))
  } else {
    console.log('Tabela super_admins não encontrada ou sem acesso.')
  }

  // 3. Verificar tabela stores para admin_email
  console.log('\n3. Verificando tabela stores...')
  const storesRes = await fetch(`${SUPABASE_URL}/rest/v1/stores?select=id,name,subdomain,settings,admin_email,owner_email`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    }
  })
  if (storesRes.ok) {
    const stores = await storesRes.json()
    console.log(`\n🏪 Lojas cadastradas (${stores.length}):`)
    stores.forEach((s, i) => {
      console.log(`  ${i+1}. Nome: ${s.name} | Subdomínio: ${s.subdomain}`)
      if (s.admin_email) console.log(`     Admin Email: ${s.admin_email}`)
      if (s.owner_email) console.log(`     Owner Email: ${s.owner_email}`)
      if (s.settings) {
        const settings = typeof s.settings === 'string' ? JSON.parse(s.settings) : s.settings
        if (settings.email) console.log(`     Settings Email: ${settings.email}`)
        if (settings.admin_user) console.log(`     Admin User: ${settings.admin_user}`)
        if (settings.admin_email) console.log(`     Settings Admin Email: ${settings.admin_email}`)
      }
    })
  } else {
    console.log('Erro ao acessar stores:', await storesRes.text())
  }

  // 4. Verificar tabela profiles
  console.log('\n4. Verificando tabela profiles...')
  const profRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*&limit=20`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    }
  })
  if (profRes.ok) {
    const profiles = await profRes.json()
    if (profiles.length > 0) {
      console.log('Perfis encontrados:', JSON.stringify(profiles, null, 2))
    } else {
      console.log('Tabela profiles vazia.')
    }
  } else {
    console.log('Tabela profiles não encontrada.')
  }
}

checkSuperAdmin().catch(console.error)
