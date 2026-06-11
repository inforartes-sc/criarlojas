const dotenv = require('dotenv');
const path = require('path');

// Load .env
dotenv.config({ path: path.join(__dirname, '../.env') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function run() {
  console.log('Fetching stores from Supabase...');
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/stores?select=id,name,subdomain,settings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      }
    });

    const data = await response.json();
    console.log('Stores list:');
    data.forEach(s => {
      console.log(`- Subdomain: ${s.subdomain} | Name: ${s.name} | Layout Model: ${s.settings?.layout_model} | Settings Keys: ${Object.keys(s.settings || {})}`);
    });
  } catch (err) {
    console.error('Error fetching stores:', err);
  }
}

run();
