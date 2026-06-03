const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://schcpfbnochnevsivtaj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaGNwZmJub2NobmV2c2l2dGFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODYyNTExMSwiZXhwIjoyMDk0MjAxMTExfQ.8hx8SdAr75mA9xv0cp3e5zKkFwo65isL6rGmtJAC4AY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateAddress() {
  console.log('Buscando pedidos para atualizar endereço...');
  const { data: orders, error } = await supabase.from('orders').select('*');
  
  if (error) {
    console.error('Erro ao buscar:', error);
    return;
  }

  const mockAddress = 'Rua das Flores, 123 (Apto 42) - Centro, São Paulo/SP';
  let count = 0;

  for (const order of orders) {
    if (!order.status.includes('| Endereço:')) {
      const newStatus = `${order.status} | Endereço: ${mockAddress}`;
      const { error: updateErr } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', order.id);
        
      if (updateErr) {
        console.error(`Erro ao atualizar pedido ${order.id}:`, updateErr);
      } else {
        console.log(`Pedido ${order.id} atualizado com endereço!`);
        count++;
      }
    }
  }
  console.log(`Concluído! ${count} pedidos antigos atualizados com endereço fictício.`);
}

updateAddress();
