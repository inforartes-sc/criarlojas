const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://schcpfbnochnevsivtaj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaGNwZmJub2NobmV2c2l2dGFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODYyNTExMSwiZXhwIjoyMDk0MjAxMTExfQ.8hx8SdAr75mA9xv0cp3e5zKkFwo65isL6rGmtJAC4AY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanFictitiousData() {
  console.log('Starting cleanup of fictitious test orders and customers...');

  const mockEmails = [
    'pedrinho.souza@uol.com.br',
    'joao.silva@email.com',
    'ana.costa@empresa.com.br',
    'carlos.santos@outlook.com',
    'maria.oli@gmail.com'
  ];

  // 1. Find mock customers
  const { data: mockCustomers, error: custErr } = await supabase
    .from('customers')
    .select('id, name, email')
    .in('email', mockEmails);

  if (custErr) {
    console.error('Error finding mock customers:', custErr);
    return;
  }

  console.log(`Found ${mockCustomers.length} mock customers to clean.`);

  const mockCustomerIds = mockCustomers.map(c => c.id);

  if (mockCustomerIds.length > 0) {
    // 2. Delete mock orders (order_items will cascade automatically or we can delete them explicitly if needed)
    // Let's delete orders belonging to these mock customers
    const { data: deletedOrders, error: orderErr } = await supabase
      .from('orders')
      .delete()
      .in('customer_id', mockCustomerIds)
      .select('id, order_number');

    if (orderErr) {
      console.error('Error deleting mock orders:', orderErr);
    } else {
      console.log(`Successfully deleted ${deletedOrders?.length || 0} fictitious orders.`);
    }

    // 3. Delete mock customers
    const { data: deletedCustomers, error: delCustErr } = await supabase
      .from('customers')
      .delete()
      .in('id', mockCustomerIds)
      .select('name');

    if (delCustErr) {
      console.error('Error deleting mock customers:', delCustErr);
    } else {
      console.log(`Successfully deleted ${deletedCustomers?.length || 0} fictitious customers.`);
    }
  } else {
    console.log('No mock customers found. Checking for mock orders by order_number <= 30...');
    const { data: deletedOrders, error: orderErr } = await supabase
      .from('orders')
      .delete()
      .lte('order_number', 30)
      .select('id, order_number');

    if (orderErr) {
      console.error('Error deleting mock orders by number:', orderErr);
    } else {
      console.log(`Successfully deleted ${deletedOrders?.length || 0} fictitious orders by order_number.`);
    }
  }

  console.log('Cleanup complete! Remaining orders in database:');
  const { data: remaining } = await supabase.from('orders').select('order_number, total_amount, customers(name, email)');
  console.log(JSON.stringify(remaining, null, 2));
}

cleanFictitiousData();
