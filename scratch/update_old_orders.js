const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://schcpfbnochnevsivtaj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaGNwZmJub2NobmV2c2l2dGFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODYyNTExMSwiZXhwIjoyMDk0MjAxMTExfQ.8hx8SdAr75mA9xv0cp3e5zKkFwo65isL6rGmtJAC4AY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function update() {
  console.log('Buscando pedidos pendentes...');
  const { data: orders, error } = await supabase.from('orders').select('*').eq('status', 'pendente');
  
  if (error) {
    console.error('Erro ao buscar:', error);
    return;
  }

  console.log(`Encontrados ${orders.length} pedidos com status 'pendente'. Atualizando para 'pendente (WhatsApp)'...`);

  for (const order of orders) {
    const { error: updateErr } = await supabase
      .from('orders')
      .update({ status: 'pendente (WhatsApp)' })
      .eq('id', order.id);
      
    if (updateErr) {
      console.error(`Erro ao atualizar pedido ${order.id}:`, updateErr);
    } else {
      console.log(`Pedido ${order.id} atualizado com sucesso!`);
    }
  }
  console.log('Concluído!');
}

update();
