const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://schcpfbnochnevsivtaj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaGNwZmJub2NobmV2c2l2dGFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODYyNTExMSwiZXhwIjoyMDk0MjAxMTExfQ.8hx8SdAr75mA9xv0cp3e5zKkFwo65isL6rGmtJAC4AY';
const supabase = createClient(supabaseUrl, supabaseKey);

const modelStores = [
  {
    name: 'Naila Shop Mix',
    subdomain: 'teste',
    settings: {
      is_demo: true,
      billing_enabled: false,
      active: true,
      name: 'Naila Shop Mix',
      subdomain: 'teste',
      email: 'contato@nailashopping.com.br',
      whatsapp: '5511999991111',
      phone: '5511999991111',
      plan: 'pro',
      model: 'modern',
      primaryColor: '#0ea5e9',
      admin_user: 'Naila Admin',
      footer_description: 'Loja virtual premium desenvolvida na plataforma Na Loja Virtual.',
      top_bar_announcement: 'FRETE GRÁTIS PARA TODO O BRASIL EM COMPRAS ACIMA DE R$ 299'
    }
  },
  {
    name: 'TechStore Prime',
    subdomain: 'tech',
    settings: {
      is_demo: true,
      billing_enabled: false,
      active: true,
      name: 'TechStore Prime',
      subdomain: 'tech',
      email: 'contato@techstoreprime.com.br',
      whatsapp: '5511999992222',
      phone: '5511999992222',
      plan: 'pro',
      model: 'tech',
      primaryColor: '#10b981',
      admin_user: 'Tech Admin',
      footer_description: 'Loja virtual premium desenvolvida na plataforma Na Loja Virtual.',
      top_bar_announcement: 'OFERTAS ESPECIAIS EM GADGETS E ELETRÔNICOS'
    }
  },
  {
    name: 'Boutique Elegance',
    subdomain: 'moda',
    settings: {
      is_demo: true,
      billing_enabled: false,
      active: true,
      name: 'Boutique Elegance',
      subdomain: 'moda',
      email: 'contato@boutiqueelegance.com.br',
      whatsapp: '5511999993333',
      phone: '5511999993333',
      plan: 'pro',
      model: 'fashion',
      primaryColor: '#f43f5e',
      admin_user: 'Boutique Admin',
      footer_description: 'Loja virtual premium desenvolvida na plataforma Na Loja Virtual.',
      top_bar_announcement: 'COLEÇÃO OUTONO-INVERNO COM 20% DE DESCONTO'
    }
  }
];

async function seedModelStores() {
  console.log('Verificando e cadastrando as 3 Lojas Modelo no Supabase...');

  for (const store of modelStores) {
    try {
      // Verifica se a loja já existe
      const { data: existing, error: fetchErr } = await supabase
        .from('stores')
        .select('*')
        .eq('subdomain', store.subdomain)
        .single();

      if (fetchErr && fetchErr.code !== 'PGRST116') { // PGRST116 é 404 not found
        throw fetchErr;
      }

      if (existing) {
        console.log(`Loja modelo '${store.subdomain}' já existe. Atualizando as configurações para garantir vínculo e status de Loja Modelo...`);
        const updatedSettings = {
          ...existing.settings,
          ...store.settings
        };

        const { error: updateErr } = await supabase
          .from('stores')
          .update({ name: store.name, settings: updatedSettings })
          .eq('id', existing.id);

        if (updateErr) throw updateErr;
        console.log(`Loja '${store.subdomain}' atualizada com sucesso!`);
      } else {
        console.log(`Loja modelo '${store.subdomain}' não encontrada. Inserindo no banco de dados...`);
        const { error: insertErr } = await supabase
          .from('stores')
          .insert({
            name: store.name,
            subdomain: store.subdomain,
            settings: store.settings
          });

        if (insertErr) throw insertErr;
        console.log(`Loja '${store.subdomain}' inserida com sucesso!`);
      }
    } catch (err) {
      console.error(`Erro ao processar a loja '${store.subdomain}':`, err.message);
    }
  }

  console.log('Processo de Lojas Modelo concluído!');
}

seedModelStores();
