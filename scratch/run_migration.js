const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load .env
dotenv.config({ path: path.join(__dirname, '../.env') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function run() {
  const sql = `
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'custom_invoices' OR table_name = 'financial_entries';
  `;

  console.log('Running SQL migration on Supabase...');
  try {
    const response = await fetch(`${SUPABASE_URL}/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query: sql })
    });

    const text = await response.text();
    console.log('Response Status:', response.status);
    console.log('Response:', text);
  } catch (err) {
    console.error('Error running SQL:', err);
  }
}

run();
