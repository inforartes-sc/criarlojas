const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load .env
dotenv.config({ path: path.join(__dirname, '../.env') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function run() {
  let logText = 'Fetching stores from Supabase...\n';
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
    logText += 'Stores list:\n';
    data.forEach(s => {
      if (s.subdomain === 'platform-settings') {
        logText += `PLATFORM-SETTINGS: ${JSON.stringify(s.settings, null, 2)}\n`;
      }
    });
  } catch (err) {
    logText += `Error fetching stores: ${err.message}\n`;
  }
  fs.writeFileSync(path.join(__dirname, 'output.txt'), logText);
}

run();
