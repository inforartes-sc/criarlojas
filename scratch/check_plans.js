const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Ler o arquivo .env manualmente
try {
  const envPath = path.join(__dirname, '../.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      process.env[key] = val;
    }
  });
} catch (e) {
  console.log('Erro ao ler .env:', e.message);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
  console.log('Testando conexão com Supabase...');
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .limit(10);
    
    if (error) {
      console.log('Erro ao consultar a tabela stores:', error.message);
    } else {
      console.log('Tabela stores existe e tem', data.length, 'registros. Segue a estrutura dos registros:');
      data.forEach(store => {
        console.log(`ID: ${store.id}, Nome: ${store.name}, Subdomain: ${store.subdomain}`);
        console.log(`Settings keys:`, store.settings ? Object.keys(store.settings) : 'null');
        console.log('-----------------------------------');
      });
    }
  } catch (err) {
    console.error('Erro de execução:', err);
  }
}

check();
