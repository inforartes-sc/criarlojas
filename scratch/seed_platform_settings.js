const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Ler o arquivo .env manualmente
try {
  const envPath = path.join(__dirname, '../.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      process.env[key] = val;
    }
  });
} catch (e) {
  console.log('Erro ao ler .env:', e.message);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const defaultSettings = {
  platformName: 'Criar Lojas E-commerce SaaS',
  mainDomain: 'criarlojas.com.br',
  supportEmail: 'suporte@criarlojas.com.br',
  whatsappSupport: '5511999998888',
  maintenanceMode: false,
  allowNewRegistrations: true,
  webhookSecret: 'whsec_abc123xyz789criarlojas',
  supabaseUrl: supabaseUrl,
  maxStoresPerUser: 10,
  businessHours: 'Seg - Sex, das 9h às 18h',
  plans: [
    {
      id: 'basic',
      name: 'Plano Básico',
      price: 49.00,
      billingCycle: 'mensal',
      desc: 'Ideal para quem está começando a sua primeira loja virtual.',
      features: ['Até 50 produtos cadastrados', 'Taxa de transação de 2.0%', 'Suporte via E-mail', 'Certificado SSL Grátis', 'Gateway Mercado Pago'],
      active: true,
      subscribers: 142,
      popular: false,
      buttonText: 'Começar Agora',
      comissionRate: 2.0
    },
    {
      id: 'pro',
      name: 'Plano Profissional',
      price: 149.00,
      billingCycle: 'mensal',
      desc: 'Perfeito para lojistas em expansão com alto volume de vendas.',
      features: ['Até 500 produtos cadastrados', 'Taxa de transação de 1.0%', 'Suporte Prioritário WhatsApp', 'Todos os Gateways de Pagamento', 'Integração de Frete Avançada'],
      active: true,
      subscribers: 184,
      popular: true,
      buttonText: 'Assinar Plano Pro',
      comissionRate: 1.0
    },
    {
      id: 'premium',
      name: 'Premium Ilimitado',
      price: 299.00,
      billingCycle: 'mensal',
      desc: 'Para redes de lojas e grandes operações de e-commerce.',
      features: ['Produtos e Variações Ilimitadas', 'Taxa de transação ZERO (0%)', 'Suporte VIP 24/7 Dedicado', 'Gerente de Contas Exclusivo', 'Acesso Antecipado a Novas Features'],
      active: true,
      subscribers: 22,
      popular: false,
      buttonText: 'Falar com Especialista VIP',
      comissionRate: 0.0
    }
  ]
};

async function seed() {
  console.log('Verificando se já existe o registro de configurações da plataforma...');
  try {
    const { data: existing, error: selectError } = await supabase
      .from('stores')
      .select('*')
      .eq('subdomain', 'platform-settings')
      .single();

    if (selectError && selectError.code === 'PGRST116') {
      console.log('Registro não existe. Criando novo...');
      const { data, error: insertError } = await supabase
        .from('stores')
        .insert({
          name: 'Configurações da Plataforma',
          subdomain: 'platform-settings',
          settings: defaultSettings
        })
        .select();

      if (insertError) {
        console.error('Erro ao inserir:', insertError.message);
      } else {
        console.log('Registro inserido com sucesso:', data);
      }
    } else if (existing) {
      console.log('Registro já existe. Atualizando para incluir a estrutura padrão...');
      // Merge com as configurações existentes ou cria novos planos se faltar
      const updatedSettings = {
        ...defaultSettings,
        ...existing.settings
      };
      
      // Garantir que planos estejam presentes
      if (!updatedSettings.plans) {
        updatedSettings.plans = defaultSettings.plans;
      }

      const { data, error: updateError } = await supabase
        .from('stores')
        .update({
          name: 'Configurações da Plataforma',
          settings: updatedSettings
        })
        .eq('id', existing.id)
        .select();

      if (updateError) {
        console.error('Erro ao atualizar:', updateError.message);
      } else {
        console.log('Registro atualizado com sucesso:', data);
      }
    } else {
      console.error('Erro no select:', selectError);
    }
  } catch (err) {
    console.error('Erro geral no script:', err);
  }
}

seed();
