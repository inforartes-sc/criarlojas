const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase com a Chave de Serviço (Service Role Key) para permissões administrativas
const supabaseUrl = 'https://schcpfbnochnevsivtaj.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaGNwZmJub2NobmV2c2l2dGFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODYyNTExMSwiZXhwIjoyMDk0MjAxMTExfQ.8hx8SdAr75mA9xv0cp3e5zKkFwo65isL6rGmtJAC4AY';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createSuperAdmin() {
  const email = 'superadmin@nalojavirtual.com.br';
  const password = 'masterpassword2026';

  console.log(`⏳ Criando usuário Super Admin (${email})...`);

  try {
    // 1. Criar o usuário no Supabase Auth usando a API Admin
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Já confirma o e-mail automaticamente
      user_metadata: {
        role: 'superadmin',
        name: 'Gestor Master SaaS'
      }
    });

    if (authError) {
      if (authError.message.includes('already exists') || authError.status === 422) {
        console.log('⚠️ O usuário Super Admin já existe no Supabase Auth.');
      } else {
        throw authError;
      }
    } else {
      console.log('✅ Usuário criado com sucesso no Supabase Auth!');
      console.log(`ID do Usuário (UUID): ${authData.user.id}`);
    }

    console.log('\n🎉 Super Admin configurado com sucesso! Credenciais de acesso:');
    console.log(`📧 E-mail: ${email}`);
    console.log(`🔑 Senha: ${password}`);

  } catch (err) {
    console.error('❌ Erro ao criar Super Admin:', err);
  }
}

createSuperAdmin();
