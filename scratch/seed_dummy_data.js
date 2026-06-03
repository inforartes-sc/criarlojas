const { createClient } = require('@supabase/supabase-js');

// Hardcoded for one-time seed
const supabaseUrl = 'https://schcpfbnochnevsivtaj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaGNwZmJub2NobmV2c2l2dGFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODYyNTExMSwiZXhwIjoyMDk0MjAxMTExfQ.8hx8SdAr75mA9xv0cp3e5zKkFwo65isL6rGmtJAC4AY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Iniciando semeio de dados fictícios completos...');

  try {
    // 1. Buscar Clientes e Produtos
    const { data: customers, error: custError } = await supabase.from('customers').select('*');
    const { data: products, error: prodError } = await supabase.from('products').select('*');
    
    if (custError || prodError) throw new Error('Erro ao buscar clientes ou produtos');
    if (customers.length === 0) throw new Error('Nenhum cliente encontrado. Rode o seed de clientes primeiro.');
    if (products.length === 0) console.warn('Nenhum produto encontrado. Os itens ficarão vazios.');

    // 2. Criar Pedidos
    const statuses = ['pendente', 'pago', 'enviado', 'cancelado'];
    
    console.log('Criando novos pedidos com itens...');
    
    for (let i = 0; i < 10; i++) {
      const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomAmount = (Math.random() * 450 + 50).toFixed(2);
      
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: randomCustomer.id,
          total_amount: randomAmount,
          status: randomStatus,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (orderError) {
        console.error('Erro ao criar pedido:', orderError.message);
        continue;
      }

      // 3. Criar Itens do Pedido
      if (products.length > 0) {
        const numItems = Math.floor(Math.random() * 3) + 1;
        const orderItems = [];
        for (let j = 0; j < numItems; j++) {
          const randomProduct = products[Math.floor(Math.random() * products.length)];
          orderItems.push({
            order_id: order.id,
            product_id: randomProduct.id,
            quantity: Math.floor(Math.random() * 2) + 1,
            price: (randomAmount / numItems).toFixed(2)
          });
        }
        
        const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
        if (itemsError) console.error('Erro ao criar itens:', itemsError.message);
      }
    }

    console.log('Semeio de pedidos e itens concluído com sucesso!');
  } catch (err) {
    console.error('Erro durante o semeio:', err.message);
  }
}

seed();
