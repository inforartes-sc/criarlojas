const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://schcpfbnochnevsivtaj.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error("Erro: SUPABASE_SERVICE_ROLE_KEY não encontrada no arquivo .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStores() {
  console.log("Conectando ao Supabase para listar as credenciais das lojas...");
  const { data: stores, error } = await supabase
    .from('stores')
    .select('id, name, subdomain, settings');

  if (error) {
    console.error("Erro ao buscar dados:", error.message);
    return;
  }

  console.log("\n--- CREDENCIAIS DAS LOJAS ---");
  stores.forEach(store => {
    const settings = store.settings || {};
    const adminUser = settings.admin_user || settings.email || 'admin (padrão)';
    const adminPass = settings.admin_password || 'senha123 (padrão)';
    
    console.log(`\nLoja: ${store.name}`);
    console.log(`Subdomínio: ${store.subdomain}`);
    console.log(`Usuário/Email: ${adminUser}`);
    console.log(`Senha: ${adminPass}`);
  });
}

checkStores();
