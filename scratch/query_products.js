const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://schcpfbnochnevsivtaj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaGNwZmJub2NobmV2c2l2dGFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODYyNTExMSwiZXhwIjoyMDk0MjAxMTExfQ.8hx8SdAr75mA9xv0cp3e5zKkFwo65isL6rGmtJAC4AY'; // service role

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const storeId = 'a827299a-7a42-4fdb-bbcd-ec15fc2a56cf'; // Advocacia Goldmann

  // Query products
  const { data: products, error: pError } = await supabase
    .from('products')
    .select('id, name, is_service, category, price')
    .eq('store_id', storeId);

  if (pError) {
    console.error('Error fetching products:', pError);
  } else {
    console.log('PRODUCTS/SERVICES:');
    console.log(products);
  }

  // Query categories
  const { data: categories, error: cError } = await supabase
    .from('categories')
    .select('id, name')
    .eq('store_id', storeId);

  if (cError) {
    console.error('Error fetching categories:', cError);
  } else {
    console.log('CATEGORIES/PRACTICE AREAS:');
    console.log(categories);
  }
}

run();
