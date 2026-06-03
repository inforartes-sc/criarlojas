const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://schcpfbnochnevsivtaj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaGNwZmJub2NobmV2c2l2dGFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODYyNTExMSwiZXhwIjoyMDk0MjAxMTExfQ.8hx8SdAr75mA9xv0cp3e5zKkFwo65isL6rGmtJAC4AY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function listOrders() {
  const { data, error } = await supabase.from('orders').select('id, order_number, total_amount, status, created_at, customers(name, email)').order('created_at', { ascending: true });
  if (error) console.error(error);
  else {
    console.log(`Total orders: ${data.length}`);
    data.forEach(o => {
      console.log(`ID: ${o.id} | OrderNumber: ${o.order_number} | Customer: ${o.customers?.name} (${o.customers?.email}) | Total: ${o.total_amount} | Status: ${o.status} | CreatedAt: ${o.created_at}`);
    });
  }
}

listOrders();
