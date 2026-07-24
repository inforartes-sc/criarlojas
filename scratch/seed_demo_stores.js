const dotenv = require('dotenv');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

dotenv.config({ path: path.join(__dirname, '../.env') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const demoStoresToInsert = [
  {
    id: 'fashion',
    name: 'Boutique Elegance',
    subdomain: 'moda',
    settings: {
      is_demo: true,
      niche: 'Moda & Vestuário',
      hero_image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80',
      primary_color: '#f43f5e',
      description: 'Design clean e minimalista, perfeito para marcas de roupa e acessórios conceituais.',
      layout_model: 'fashion'
    }
  },
  {
    id: 'cosmetics',
    name: 'Glow Cosmetics',
    subdomain: 'cosmeticos',
    settings: {
      is_demo: true,
      niche: 'Cosméticos & Maquiagem',
      hero_image_url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80',
      primary_color: '#10b981',
      description: 'Cores suaves e foco visual em texturas, ideal para produtos de beleza e bem-estar.',
      layout_model: 'modern'
    }
  },
  {
    id: 'jewelry',
    name: 'Aurum Semijoias',
    subdomain: 'semijoias',
    settings: {
      is_demo: true,
      niche: 'Semijoias & Joias',
      hero_image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
      primary_color: '#f59e0b',
      description: 'Sofisticação escura e iluminação de contraste para destacar detalhes luxuosos das peças.',
      layout_model: 'modern'
    }
  },
  {
    id: 'pet',
    name: 'PetFamily Store',
    subdomain: 'pet',
    settings: {
      is_demo: true,
      niche: 'Pet Shop',
      hero_image_url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80',
      primary_color: '#0ea5e9',
      description: 'Navegação descontraída e amigável para petiscos, brinquedos e acessórios para pets.',
      layout_model: 'modern'
    }
  },
  {
    id: 'doces',
    name: 'Cacau Gourmet',
    subdomain: 'doces',
    settings: {
      is_demo: true,
      niche: 'Doces & Confeitaria',
      hero_image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
      primary_color: '#ec4899',
      description: 'Cardápio irresistível focado em fotos grandes e finalização ágil via Pix.',
      layout_model: 'modern'
    }
  },
  {
    id: 'auto',
    name: 'Piston Autopeças',
    subdomain: 'autopecas',
    settings: {
      is_demo: true,
      niche: 'Autopeças & Moto',
      hero_image_url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80',
      primary_color: '#334155',
      description: 'Grade técnica robusta, filtragem direta e compatibilidade de componentes visível.',
      layout_model: 'services'
    }
  },
  {
    id: 'dropshipping',
    name: 'Express Imports',
    subdomain: 'dropshipping',
    settings: {
      is_demo: true,
      niche: 'Dropshipping Geral',
      hero_image_url: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80',
      primary_color: '#6366f1',
      description: 'Elementos fortes de prova social, escassez imediata e ofertas integradas de alta conversão.',
      layout_model: 'modern'
    }
  }
];

async function insertDemoStores() {
  console.log('Inserting/syncing concept stores into database...');
  for (const store of demoStoresToInsert) {
    try {
      // Check if store exists by subdomain first
      const { data: existing } = await supabase
        .from('stores')
        .select('id')
        .eq('subdomain', store.subdomain)
        .maybeSingle();

      if (existing) {
        console.log(`Store with subdomain "${store.subdomain}" already exists. Updating settings...`);
        await supabase
          .from('stores')
          .update({
            name: store.name,
            settings: store.settings
          })
          .eq('id', existing.id);
      } else {
        console.log(`Inserting new store: ${store.name} (${store.subdomain})`);
        await supabase
          .from('stores')
          .insert({
            name: store.name,
            subdomain: store.subdomain,
            settings: store.settings
          });
      }
    } catch (e) {
      console.error(`Failed to sync store ${store.name}:`, e.message);
    }
  }
  console.log('Concept stores synchronized successfully!');
}

insertDemoStores();
