const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://schcpfbnochnevsivtaj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaGNwZmJub2NobmV2c2l2dGFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODYyNTExMSwiZXhwIjoyMDk0MjAxMTExfQ.8hx8SdAr75mA9xv0cp3e5zKkFwo65isL6rGmtJAC4AY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  const { data: prods } = await supabase.from('products').select('name, stock_quantity, category');
  console.log('All Products:', JSON.stringify(prods, null, 2));

  const { data: ords } = await supabase.from('orders').select('id, total_amount, created_at, status');
  console.log('All Orders:', JSON.stringify(ords, null, 2));
}
checkData();
