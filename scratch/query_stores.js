const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://schcpfbnochnevsivtaj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaGNwZmJub2NobmV2c2l2dGFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODYyNTExMSwiZXhwIjoyMDk0MjAxMTExfQ.8hx8SdAr75mA9xv0cp3e5zKkFwo65isL6rGmtJAC4AY'; // service role

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('stores')
    .select('id, name, subdomain, settings')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching stores:', error);
    return;
  }

  console.log('STORES IN DATABASE:');
  data.forEach(store => {
    console.log(`- ID: ${store.id}`);
    console.log(`  Name: ${store.name}`);
    console.log(`  Subdomain: ${store.subdomain}`);
    console.log(`  Settings:`, JSON.stringify(store.settings, null, 2));
    console.log('---');
  });
}

run();
