const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://schcpfbnochnevsivtaj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaGNwZmJub2NobmV2c2l2dGFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODYyNTExMSwiZXhwIjoyMDk0MjAxMTExfQ.8hx8SdAr75mA9xv0cp3e5zKkFwo65isL6rGmtJAC4AY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRequestsTable() {
  const { data, error } = await supabase.from('store_requests').select('*').limit(5);
  console.log('store_requests:', { data, error: error ? error.message : null });

  const { data: d2, error: e2 } = await supabase.from('leads').select('*').limit(5);
  console.log('leads:', { data: d2, error: e2 ? e2.message : null });
}
checkRequestsTable();
