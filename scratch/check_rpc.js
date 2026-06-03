const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://schcpfbnochnevsivtaj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaGNwZmJub2NobmV2c2l2dGFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODYyNTExMSwiZXhwIjoyMDk0MjAxMTExfQ.8hx8SdAr75mA9xv0cp3e5zKkFwo65isL6rGmtJAC4AY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testRpc() {
  const sql = `
    ALTER TABLE customers 
    ADD COLUMN IF NOT EXISTS cep TEXT,
    ADD COLUMN IF NOT EXISTS street TEXT,
    ADD COLUMN IF NOT EXISTS number TEXT,
    ADD COLUMN IF NOT EXISTS complement TEXT,
    ADD COLUMN IF NOT EXISTS neighborhood TEXT,
    ADD COLUMN IF NOT EXISTS city TEXT,
    ADD COLUMN IF NOT EXISTS state TEXT;
    NOTIFY pgrst, 'reload schema';
  `;
  const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });
  if (error) {
    const { data: d2, error: e2 } = await supabase.rpc('execute_sql', { sql });
    if (e2) console.log('No exec_sql or execute_sql RPC found:', e2.message);
    else console.log('Success execute_sql:', d2);
  } else {
    console.log('Success exec_sql:', data);
  }
}
testRpc();
