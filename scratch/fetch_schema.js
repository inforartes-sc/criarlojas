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

async function fetchSchema() {
  console.log('Buscando esquema do PostgREST do Supabase...');
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.statusText}`);
    }
    
    const data = await response.json();
    const paths = Object.keys(data.paths || {});
    console.log('Endpoints e RPCs encontrados:');
    paths.forEach(p => {
      if (p.includes('/rpc/')) {
        console.log('RPC:', p);
      } else {
        console.log('Tabela/View:', p);
      }
    });
  } catch (err) {
    console.error('Erro:', err);
  }
}

fetchSchema();
