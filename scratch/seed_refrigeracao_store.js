const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://schcpfbnochnevsivtaj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaGNwZmJub2NobmV2c2l2dGFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODYyNTExMSwiZXhwIjoyMDk0MjAxMTExfQ.8hx8SdAr75mA9xv0cp3e5zKkFwo65isL6rGmtJAC4AY'; // service role

const supabase = createClient(supabaseUrl, supabaseKey);

const storeId = 'c18d94c0-54a8-4221-a7b6-c5c8f6cfbc83';
const catServicesId = 'e33b0bb9-efd5-45d6-8488-466d7ef11082';
const catPartsId = 'f78716b1-0f72-4d2d-8e65-728b71d9d936';

const storeData = {
  id: storeId,
  name: 'RefriService Prime',
  subdomain: 'refri',
  custom_domain: '',
  settings: {
    name: 'RefriService Prime',
    plan: 'pro',
    email: 'contato@refriservice.com.br',
    niche: 'Climatização & Peças',
    phone: '5511999994444',
    active: true,
    is_demo: true,
    whatsapp: '5511999994444',
    subdomain: 'refri',
    admin_user: 'admin@refriservice.com.br',
    description: 'Especialistas em climatização residencial e comercial. Agende serviços de instalação e manutenção, ou compre peças e acessórios originais.',
    button_color: '#0284c7',
    layout_model: 'services',
    primary_color: '#0284c7',
    admin_password: 'senha123',
    billing_enabled: true,
    footer_description: 'RefriService Prime - Soluções em Climatização e Peças.',
    top_bar_announcement: '❄️ PRECISE DE SUPORTE? AGENDE SUA INSTALAÇÃO OU MANUTENÇÃO PELO WHATSAPP!',
    hero_title: 'CONFORTO E AR PURO PARA SUA CASA',
    hero_subtitle: 'Instalação, higienização e manutenção preventiva de ar condicionado com técnicos qualificados.',
    hero_image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
    logo_url: '',
    show_hero_text: true,
    show_new_arrivals: true
  }
};

const categoriesData = [
  {
    id: catServicesId,
    store_id: storeId,
    name: 'Serviços Técnicos',
    image_url: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: catPartsId,
    store_id: storeId,
    name: 'Peças e Acessórios',
    image_url: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=300&q=80'
  }
];

const productsData = [
  {
    id: 'd601b1a1-a4b5-4a6c-b7d8-e9f0a1b2c3d4',
    store_id: storeId,
    name: 'Instalação Completa Split (Até 12.000 BTUs)',
    slug: 'instalacao-completa-split-ate-12000-btus',
    short_description: 'Instalação técnica autorizada com garantia de 1 ano.',
    description: 'Serviço profissional de instalação de ar condicionado tipo Split High Wall de até 12.000 BTUs. Inclui: até 3 metros de linha frigorígena em cobre, isolamento térmico blindado, suporte de fixação externo da condensadora, cabo de interligação PP, furo em alvenaria e vácuo na tubulação conforme manual do fabricante.',
    price: 399.00,
    sale_price: 349.00,
    stock_quantity: 999,
    images: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80'],
    sku: 'SERV-INST-12',
    category: 'Serviços Técnicos',
    category_id: catServicesId,
    is_active: true,
    is_featured: true
  },
  {
    id: 'd601b2a2-a4b5-4a6c-b7d8-e9f0a1b2c3d4',
    store_id: storeId,
    name: 'Higienização Completa e Limpeza Química',
    slug: 'higienizacao-completa-e-limpeza-quimica',
    short_description: 'Limpeza profunda de evaporadora e condensadora contra fungos e bactérias.',
    description: 'Serviço de limpeza e higienização completa para ar condicionado split de qualquer marca. Inclui: desmontagem da carenagem, limpeza química dos filtros e serpentinas com bactericida e fungicida homologados pela ANVISA, desobstrução do dreno de água e limpeza geral da unidade externa (condensadora). Melhora o rendimento do ar e previne problemas respiratórios.',
    price: 150.00,
    sale_price: null,
    stock_quantity: 999,
    images: ['https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&w=600&q=80'],
    sku: 'SERV-HIGI-SPLIT',
    category: 'Serviços Técnicos',
    category_id: catServicesId,
    is_active: true,
    is_featured: true
  },
  {
    id: 'd601b3a3-a4b5-4a6c-b7d8-e9f0a1b2c3d4',
    store_id: storeId,
    name: 'Carga de Gás Refrigerante Ecológico (R410A / R22)',
    slug: 'carga-de-gas-refrigerante-ecologico-r410a-r22',
    short_description: 'Recarga de gás refrigerante com correção de vazamentos inclusa.',
    description: 'Serviço técnico para medição de pressão e recarga de gás refrigerante (fluido refrigerante R410A ecológico ou R22) para sistemas de ar condicionado residencial de até 18.000 BTUs. Inclui localização e correção de pequenos vazamentos nas flanges, vácuo no sistema antes da carga e testes finais de rendimento.',
    price: 220.00,
    sale_price: null,
    stock_quantity: 999,
    images: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80'],
    sku: 'SERV-GAS-R410',
    category: 'Serviços Técnicos',
    category_id: catServicesId,
    is_active: true,
    is_featured: false
  },
  {
    id: 'd601b4a4-a4b5-4a6c-b7d8-e9f0a1b2c3d4',
    store_id: storeId,
    name: 'Controle Remoto Universal para Ar Condicionado',
    slug: 'controle-remoto-universal-para-ar-condicionado',
    short_description: 'Compatível com mais de 1000 marcas de ar condicionado split.',
    description: 'Controle remoto universal de altíssima qualidade com display LCD e busca automática de códigos. Compatível com as principais marcas do mercado nacional e importado (Split, Cassete, Piso Teto). Fácil configuração, longo alcance e baixo consumo de pilhas.',
    price: 49.90,
    sale_price: 39.90,
    stock_quantity: 45,
    images: ['https://images.unsplash.com/photo-1572715655204-47e297d38a5f?auto=format&fit=crop&w=600&q=80'],
    sku: 'PEC-CTRL-UNIV',
    category: 'Peças e Acessórios',
    category_id: catPartsId,
    is_active: true,
    is_featured: true
  },
  {
    id: 'd601b5a5-a4b5-4a6c-b7d8-e9f0a1b2c3d4',
    store_id: storeId,
    name: 'Suporte de Parede Reforçado para Condensadora (Metal)',
    slug: 'suporte-de-parede-reforcado-para-condensadora-metal',
    short_description: 'Suporte em aço carbono para condensadoras de 7.000 a 12.000 BTUs.',
    description: 'Par de suportes de parede reforçados em aço carbono com pintura eletrostática epóxi branca, resistente a intempéries e corrosão. Ideal para instalação de unidades condensadoras externas de ar condicionado de até 12.000 BTUs. Acompanha kit de amortecedores de borracha, parafusos e arruelas para fixação.',
    price: 85.00,
    sale_price: null,
    stock_quantity: 20,
    images: ['https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=600&q=80'],
    sku: 'PEC-SUP-WHITE',
    category: 'Peças e Acessórios',
    category_id: catPartsId,
    is_active: true,
    is_featured: false
  },
  {
    id: 'd601b6a6-a4b5-4a6c-b7d8-e9f0a1b2c3d4',
    store_id: storeId,
    name: 'Defletor de Acrílico para Ar Condicionado Split',
    slug: 'defletor-de-acrilico-para-ar-condicionado-split',
    short_description: 'Direciona o fluxo de ar gelado evitando o vento direto no corpo.',
    description: 'Defletor de ar condicionado split em acrílico transparente de alta resistência. Evita que o vento gelado sopre diretamente sobre as pessoas na cama, sofá ou mesa de trabalho. Fácil instalação por encaixe direto na evaporadora, sem necessidade de furar a parede ou o aparelho.',
    price: 120.00,
    sale_price: 99.00,
    stock_quantity: 15,
    images: ['https://images.unsplash.com/photo-1608220179579-3994e0737149?auto=format&fit=crop&w=600&q=80'],
    sku: 'PEC-DEFL-ACRI',
    category: 'Peças e Acessórios',
    category_id: catPartsId,
    is_active: true,
    is_featured: true
  }
];

async function run() {
  console.log('Iniciando carga de dados da loja de Refrigeração/Serviços...');

  try {
    // 1. Limpar produtos anteriores
    console.log('Removendo produtos antigos...');
    await supabase.from('products').delete().eq('store_id', storeId);

    // 2. Limpar categorias anteriores
    console.log('Removendo categorias antigas...');
    await supabase.from('categories').delete().eq('store_id', storeId);

    // 3. Limpar loja com mesmo subdomínio (caso ID mude ou já exista com o mesmo subdomínio)
    console.log('Verificando loja antiga com subdomínio "refri"...');
    const { data: existingStores } = await supabase
      .from('stores')
      .select('id')
      .eq('subdomain', 'refri');
    
    if (existingStores && existingStores.length > 0) {
      for (const oldStore of existingStores) {
        console.log(`Limpando dependências da loja antiga ID: ${oldStore.id}`);
        await supabase.from('products').delete().eq('store_id', oldStore.id);
        await supabase.from('categories').delete().eq('store_id', oldStore.id);
        await supabase.from('orders').delete().eq('store_id', oldStore.id);
        await supabase.from('customers').delete().eq('store_id', oldStore.id);
        await supabase.from('stores').delete().eq('id', oldStore.id);
      }
    }

    // 4. Inserir Loja
    console.log('Inserindo nova loja "RefriService Prime"...');
    const { error: storeErr } = await supabase
      .from('stores')
      .insert([storeData]);
    
    if (storeErr) throw storeErr;
    console.log('Loja criada com sucesso!');

    // 5. Inserir Categorias
    console.log('Inserindo categorias...');
    const { error: catErr } = await supabase
      .from('categories')
      .insert(categoriesData);
    
    if (catErr) throw catErr;
    console.log('Categorias criadas com sucesso!');

    // 6. Inserir Produtos
    console.log('Inserindo produtos e serviços...');
    const { error: prodErr } = await supabase
      .from('products')
      .insert(productsData);
    
    if (prodErr) throw prodErr;
    console.log('Produtos e serviços criados com sucesso!');

    console.log('\n--- SUCESSO COMPLETO ---');
    console.log('Subdomínio da Loja Modelo: http://refri.localhost:3000');
    console.log('Visualização na plataforma: Ativa!');

  } catch (error) {
    console.error('Erro durante a carga da semente (seed):', error);
  }
}

run();
