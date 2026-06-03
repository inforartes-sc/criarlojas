// Script para mover os 5 produtos para a loja refri e deletar os errados
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://schcpfbnochnevsivtaj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaGNwZmJub2NobmV2c2l2dGFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODYyNTExMSwiZXhwIjoyMDk0MjAxMTExfQ.8hx8SdAr75mA9xv0cp3e5zKkFwo65isL6rGmtJAC4AY'
)

const REFRI_STORE_ID = 'c18d94c0-54a8-4221-a7b6-c5c8f6cfbc83'
const MODA_STORE_ID  = '127c8481-2392-41a0-b781-6ca81341623b'

const wrongIds = [
  '4b801b33-4c48-4c73-9083-d4c5dac0919d',
  'b5497a43-6914-4b8a-8539-bd6701da20e8',
  '99778a9a-6ac3-4ce1-a08c-6bcbd11d08b8',
  '69f999af-a072-43bd-a191-a444271631bd',
  'f6142cff-c752-4ee1-a7a3-05969425decb'
]

async function main() {
  // Deletar os produtos inseridos na loja errada
  const { error: delErr } = await supabase
    .from('products')
    .delete()
    .in('id', wrongIds)
  
  if (delErr) { console.error('Erro ao deletar:', delErr.message); return }
  console.log('✅ Produtos removidos da loja incorreta.')

  // Inserir na loja certa (refri)
  const produtos = [
    {
      store_id: REFRI_STORE_ID,
      name: 'Filtro de Ar para Split 9.000 a 12.000 BTUs',
      slug: 'filtro-ar-split-9000-12000-btus',
      price: 29.90,
      sale_price: null,
      short_description: 'Filtro original lavável para splits de 9.000 a 12.000 BTUs. Compatível com as principais marcas.',
      description: 'Filtro de ar lavável de alta eficiência para ar condicionados split de 9.000 a 12.000 BTUs. Retém poeira, ácaros e partículas finas. Material: polipropileno. Compatível com Springer, Consul, Electrolux, LG, Samsung e outras marcas.',
      stock_quantity: 50,
      sku: 'FILTRO-SPLIT-12K',
      category: 'Peças e Acessórios',
      is_active: true,
      is_featured: false,
      images: ['https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=400&q=80'],
      has_variations: false,
      variation_options: [],
      variation_skus: []
    },
    {
      store_id: REFRI_STORE_ID,
      name: 'Cabo de Força para Ar Condicionado 2,5m (10A)',
      slug: 'cabo-forca-ar-condicionado-25m-10a',
      price: 44.90,
      sale_price: 34.90,
      short_description: 'Cabo de força NBR certificado 2,5m com plugue 10A para ar condicionado Split e janela.',
      description: 'Cabo de força tripolar padrão NBR 14136, comprimento 2,5 metros. Tensão: 127V/220V. Corrente nominal: 10A. Plugue INMETRO certificado. Compatível com todos os modelos de ar condicionado split e de janela até 12.000 BTUs.',
      stock_quantity: 30,
      sku: 'CABO-10A-25M',
      category: 'Peças e Acessórios',
      is_active: true,
      is_featured: false,
      images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80'],
      has_variations: false,
      variation_options: [],
      variation_skus: []
    },
    {
      store_id: REFRI_STORE_ID,
      name: 'Válvula de Expansão Termostática Universal',
      slug: 'valvula-expansao-termostatica-universal',
      price: 189.00,
      sale_price: null,
      short_description: 'Válvula de expansão termostática para sistemas de refrigeração de até 18.000 BTUs.',
      description: 'Válvula de expansão termostática (TXV) universal compatível com sistemas de ar condicionado split de 9.000 a 18.000 BTUs. Material: latão niquelado. Fluido: R410A / R22. Acompanha bulbo, equalizador e conexões de instalação.',
      stock_quantity: 12,
      sku: 'VET-UNIV-18K',
      category: 'Peças e Acessórios',
      is_active: true,
      is_featured: true,
      images: ['https://images.unsplash.com/photo-1609592424693-25f3a1a01fb1?auto=format&fit=crop&w=400&q=80'],
      has_variations: false,
      variation_options: [],
      variation_skus: []
    },
    {
      store_id: REFRI_STORE_ID,
      name: 'Placa Eletrônica Evaporadora Springer Midea 9.000 BTUs',
      slug: 'placa-eletronica-evaporadora-springer-midea-9000-btus',
      price: 320.00,
      sale_price: 279.00,
      short_description: 'Placa eletrônica original para unidade evaporadora Springer Midea 9.000 BTUs.',
      description: 'Placa de circuito impresso original para unidade interna (evaporadora) Springer Midea 9.000 BTUs. Código de referência: 201337290201. Tensão: 220V. Inclui sensor de temperatura NTC. Compatível com modelos: Blanc, Piso-Teto e Cassete.',
      stock_quantity: 8,
      sku: 'PCB-SPRINGER-9K',
      category: 'Peças e Acessórios',
      is_active: true,
      is_featured: false,
      images: ['https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80'],
      has_variations: false,
      variation_options: [],
      variation_skus: []
    },
    {
      store_id: REFRI_STORE_ID,
      name: 'Suporte de Teto para Condensadora (Par)',
      slug: 'suporte-teto-condensadora-par',
      price: 115.00,
      sale_price: null,
      short_description: 'Par de suportes reforçados de teto para fixação da condensadora em parede ou laje.',
      description: 'Kit com 2 suportes de teto fabricados em aço galvanizado de alta resistência. Capacidade de carga: até 250 kg. Comprimento regulável de 35 a 55 cm. Acompanha parafusos de fixação. Indicado para condensadoras de 9.000 a 60.000 BTUs.',
      stock_quantity: 25,
      sku: 'SUPORTE-TETO-PAR',
      category: 'Peças e Acessórios',
      is_active: true,
      is_featured: false,
      images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=400&q=80'],
      has_variations: false,
      variation_options: [],
      variation_skus: []
    }
  ]

  const { data, error } = await supabase.from('products').insert(produtos).select('id, name')
  
  if (error) {
    console.error('\n❌ Erro ao inserir produtos:', error.message)
  } else {
    console.log('\n✅ Produtos cadastrados na loja REFRI com sucesso:')
    data.forEach(p => console.log(`  - ${p.name} (ID: ${p.id})`))
  }
}

main()
