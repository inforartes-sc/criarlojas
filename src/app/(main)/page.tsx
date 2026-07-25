"use client"

import { useState, useEffect, useRef } from 'react'
import { 
  ShoppingBag, 
  Rocket, 
  Shield, 
  Users, 
  ArrowRight, 
  Check, 
  Star, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft,
  ChevronRight,
  Play, 
  Zap, 
  Monitor, 
  DollarSign, 
  Award, 
  TrendingUp, 
  HelpCircle, 
  Laptop, 
  Smartphone, 
  Lock,
  Layers,
  CheckCircle2,
  ExternalLink,
  Store,
  MessageSquare,
  Phone,
  Mail,
  User,
  X,
  Menu,
  Globe,
  Palette,
  Clock,
  MessageCircle,
  Loader2,
  ArrowUpRight,
  CheckCircle,
  ThumbsUp,
  Brain,
  Sparkle,
  CreditCard
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { getDomainSuffix, getAbsoluteUrl } from '@/lib/getDomainSuffix'

// Vitrines / Lojas Modelo (Fallback Estático)
const initialDemoStores = [
  {
    id: 'fashion',
    name: 'Boutique Elegance',
    subdomain: 'moda',
    niche: 'Moda & Vestuário',
    img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80',
    color: '#f43f5e',
    desc: 'Design clean e minimalista, perfeito para marcas de roupa e acessórios conceituais.'
  },
  {
    id: 'cosmetics',
    name: 'Glow Cosmetics',
    subdomain: 'cosmeticos',
    niche: 'Cosméticos & Maquiagem',
    img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80',
    color: '#10b981',
    desc: 'Cores suaves e foco visual em texturas, ideal para produtos de beleza e bem-estar.'
  },
  {
    id: 'jewelry',
    name: 'Aurum Semijoias',
    subdomain: 'semijoias',
    niche: 'Semijoias & Joias',
    img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
    color: '#f59e0b',
    desc: 'Sofisticação escura e iluminação de contraste para destacar detalhes luxuosos das peças.'
  },
  {
    id: 'pet',
    name: 'PetFamily Store',
    subdomain: 'pet',
    niche: 'Pet Shop',
    img: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80',
    color: '#0ea5e9',
    desc: 'Navegação descontraída e amigável para petiscos, brinquedos e acessórios para pets.'
  },
  {
    id: 'doces',
    name: 'Cacau Gourmet',
    subdomain: 'doces',
    niche: 'Doces & Confeitaria',
    img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
    color: '#ec4899',
    desc: 'Cardápio irresistível focado em fotos grandes e finalização ágil via Pix.'
  },
  {
    id: 'auto',
    name: 'Piston Autopeças',
    subdomain: 'autopecas',
    niche: 'Autopeças & Moto',
    img: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80',
    color: '#334155',
    desc: 'Grade técnica robusta, filtragem direta e compatibilidade de componentes visível.'
  },
  {
    id: 'dropshipping',
    name: 'Express Imports',
    subdomain: 'dropshipping',
    niche: 'Dropshipping Geral',
    img: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80',
    color: '#6366f1',
    desc: 'Elementos fortes de prova social, escassez imediata e ofertas integradas de alta conversão.'
  }
]

export default function SaaSCommercialPortal() {
  const [domainSuffix, setDomainSuffix] = useState('.localhost:3000')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  
  // Mocks interativos do celular (Hero Showcase)
  const [mockCartCount, setMockCartCount] = useState(0)
  const [showMockCheckout, setShowMockCheckout] = useState(false)
  const [mockCheckoutStep, setMockCheckoutStep] = useState(0) // 0: add to cart, 1: details, 2: success/Pix

  // Segmento selecionado para a seção "Transforme sua ideia em negócio"
  const [activeSegmentTab, setActiveSegmentTab] = useState('todos')
  const [demoStores, setDemoStores] = useState<any[]>([])
  const [loadingStores, setLoadingStores] = useState(true)
  const [visibleDemoLimit, setVisibleDemoLimit] = useState(3)
  useEffect(() => {
    setDomainSuffix(getDomainSuffix())
    
    async function loadDemoStores() {
      try {
        const { data, error } = await supabase
          .from('stores')
          .select('*')
          .order('created_at', { ascending: true })
        
        let dbFormatted: any[] = []
        if (!error && data) {
          const dbDemos = data.filter(s => s.settings?.is_demo === true)
          dbFormatted = dbDemos.map(s => {
            const settings = s.settings || {}
            return {
              id: s.id,
              name: s.name || settings.name,
              subdomain: s.subdomain,
              niche: settings.niche || 'Moda & Acessórios',
              img: settings.hero_image_url || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80',
              color: settings.primary_color || '#10b981',
              desc: settings.description || 'Loja conceito de alta conversão.'
            }
          })
        }
        setDemoStores(dbFormatted)
      } catch (err) {
        console.error('Error loading demo stores:', err)
        setDemoStores([])
      } finally {
        setLoadingStores(false)
      }
    }
    loadDemoStores()
  }, [])
  // Ref e função para o Carrossel Horizontal de Lojas Modelo
  const carouselRef = useRef<HTMLDivElement>(null)
  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const firstCard = carouselRef.current.children[0] as HTMLElement
      if (firstCard) {
        const cardWidth = firstCard.offsetWidth + 40 // 40px de gap
        const scrollAmount = direction === 'left' ? -cardWidth : cardWidth
        carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
      }
    }
  }

  // Estado para as configurações globais de contato (conectado com o Super Admin)
  const [platformSettings, setPlatformSettings] = useState({
    supportEmail: 'contato@criarlojas.com.br',
    whatsappSupport: '(11) 99999-8888',
    businessHours: 'Seg - Sex, das 9h às 18h',
    landingPageTheme: 'light'
  })

  // Estado para os planos dinâmicos carregados do banco
  const [plans, setPlans] = useState<any[]>([])

  useEffect(() => {
    async function fetchPlatformSettingsAndPlans() {
      try {
        const { data, error } = await supabase
          .from('stores')
          .select('settings')
          .eq('subdomain', 'platform-settings')
          .maybeSingle()
        
        if (data && data.settings) {
          const s = data.settings
          setPlatformSettings({
            supportEmail: s.supportEmail || 'contato@criarlojas.com.br',
            whatsappSupport: s.whatsappSupport || '5511999998888',
            businessHours: s.businessHours || 'Seg - Sex, das 9h às 18h',
            landingPageTheme: 'light'
          })

          if (s.plans && Array.isArray(s.plans) && s.plans.length > 0) {
            // Filtrar apenas planos ativos
            const activePlans = s.plans.filter((p: any) => p.active !== false)
            const mapped = activePlans.map((p: any) => ({
              id: p.id,
              name: p.name,
              priceMonthly: p.price,
              priceAnnual: p.price * 0.8, // 20% de desconto
              desc: p.desc,
              features: p.features || [],
              popular: p.popular || false,
              buttonText: p.buttonText || 'Começar Agora'
            }))
            setPlans(mapped)
          } else {
            setPlans(fallbackPlans)
          }
        } else {
          setPlans(fallbackPlans)
        }
      } catch (err) {
        console.error('Erro ao carregar configurações/planos:', err)
        setPlans(fallbackPlans)
      }
    }
    fetchPlatformSettingsAndPlans()
  }, [])

  // Estado e efeito para o botão Voltar para o Topo
  const [showScrollTop, setShowScrollTop] = useState(false)
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true)
      } else {
        setShowScrollTop(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const formatWhatsappNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.startsWith('55') && cleaned.length >= 12) {
      return cleaned
    }
    return '55' + cleaned
  }

  const [billingCycle, setBillingCycle] = useState<'mensal' | 'anual'>('mensal')

  // FAQ
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  // Calculadora de Economia e Tabela Comparativa
  const [salesPerMonth, setSalesPerMonth] = useState(250)
  const [averageTicket, setAverageTicket] = useState(150)
  const [showFullComparison, setShowFullComparison] = useState(true)

  // Estado para o Modal de Domínio Próprio
  const [showDomainModal, setShowDomainModal] = useState(false)
  const [isCheckingDomain, setIsCheckingDomain] = useState(false)
  const [isSubmittingDomain, setIsSubmittingDomain] = useState(false)
  const [domainData, setDomainData] = useState({
    desiredDomain: '',
    fullName: '',
    whatsapp: '',
    email: '',
    notes: ''
  })

  const handleVerifyDomain = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!domainData.desiredDomain) {
      toast.error('Digite o domínio desejado para verificar.')
      return
    }
    setIsCheckingDomain(true)
    setTimeout(() => {
      setIsCheckingDomain(false)
      toast.success('Domínio disponível para registro!')
    }, 1200)
  }

  const handleDomainSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingDomain(true)
    setTimeout(() => {
      setIsSubmittingDomain(false)
      setShowDomainModal(false)
      setDomainData({
        desiredDomain: '',
        fullName: '',
        whatsapp: '',
        email: '',
        notes: ''
      })
      toast.success('Solicitação enviada! Entraremos em contato via WhatsApp com as opções.')
    }, 1500)
  }

  // Estado para o Modal de Solicitação / Contratação de Loja
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [leadData, setLeadData] = useState({
    name: '',
    whatsapp: '',
    email: '',
    storeName: '',
    subdomain: '',
    primaryColor: '#10b981',
    selectedModel: '', // Será preenchido na abertura
    selectedPlan: 'free', // Default is free!
    password: '',
    notes: '',
    wantsConcierge: true
  })
  const [isSubmittingLead, setIsSubmittingLead] = useState(false)
  const [leadSubmitted, setLeadSubmitted] = useState(false)
  const [checkoutPending, setCheckoutPending] = useState(false)
  const [createdStoreData, setCreatedStoreData] = useState<any>(null)

  const handleOpenLeadModal = (modelKey: string = 'fashion', planKey: string = 'free', concierge: boolean = true) => {
    const matchedModel = demoStores.find(s => s.id === modelKey || s.subdomain === modelKey)
    const finalModelKey = matchedModel ? matchedModel.id : (demoStores[0]?.id || '')

    setLeadData(prev => ({
      ...prev,
      selectedModel: finalModelKey,
      selectedPlan: planKey,
      wantsConcierge: concierge,
      password: ''
    }))
    setCheckoutPending(false)
    setLeadSubmitted(false)
    setShowLeadModal(true)
  }

  const colorPresets = [
    { name: 'Esmeralda', hex: '#10b981' },
    { name: 'Azul Oceano', hex: '#0ea5e9' },
    { name: 'Violeta / Roxo', hex: '#6366f1' },
    { name: 'Rosa Elegante', hex: '#f43f5e' },
    { name: 'Dourado / Laranja', hex: '#f59e0b' },
    { name: 'Grafite Premium', hex: '#334155' },
  ]

  // Estrutura de planos padrão (fallback)
  const fallbackPlans = [
    {
      id: 'inicial',
      name: 'Plano Inicial',
      priceMonthly: 29.90,
      priceAnnual: 23.92,
      desc: 'Ideal para autônomos e iniciantes que vendem pelo catálogo do WhatsApp.',
      features: ['Seu Instagram vira vitrine', 'Receba pedidos direto no WhatsApp', 'Produtos cadastrados ilimitados', 'Seus clientes compram com segurança (SSL incluso)', 'Botão do WhatsApp integrado', 'Suporte por e-mail e painel', '[-] Checkout integrado na loja', '[-] Recuperação de carrinho por IA', '[-] Domínio personalizado próprio'],
      popular: false,
      buttonText: 'Começar Agora'
    },
    {
      id: 'pro',
      name: 'Plano Profissional',
      priceMonthly: 34.90,
      priceAnnual: 27.92,
      desc: 'Loja virtual completa com checkout integrado para quem quer faturamento profissional.',
      features: ['Tudo do Plano Inicial', 'Mais confiança com Checkout Transparente', 'Pagamentos em PIX e Cartão de Crédito', 'Cálculo de frete automático (Correios/Melhor Envio)', 'Use seu domínio próprio (ex: www.suamarca.com.br)', 'Cupons de desconto para alavancar vendas', 'Relatório completo de faturamento', '[-] Descrições de produtos geradas por IA'],
      popular: true,
      buttonText: 'Começar Grátis'
    },
    {
      id: 'business',
      name: 'Plano Business',
      priceMonthly: 47.90,
      priceAnnual: 38.32,
      desc: 'Para negócios estruturados que precisam de ferramentas avançadas de marketing e escala.',
      features: ['Tudo do Plano Profissional', 'Recuperação automática de carrinho abandonado', 'Pixels de rastreamento (Facebook, Google, TikTok)', 'Banner inteligente e Pop-up de ofertas', 'Avaliações e reviews de clientes na loja', 'Suporte prioritário VIP no WhatsApp', 'Setup VIP Assistido incluso', '[-] Inteligência Artificial integrada'],
      popular: false,
      buttonText: 'Assinar Business'
    },
    {
      id: 'ia',
      name: 'Plano IA (Cérebro)',
      priceMonthly: 69.90,
      priceAnnual: 55.92,
      desc: 'A tecnologia do futuro no seu negócio: descrições, SEO, posts e banners gerados automaticamente.',
      features: ['Tudo do Plano Business', 'Gerador de descrição de produtos por IA', 'SEO automatizado para aparecer no Google', 'Criador de campanhas e posts de vendas por IA', 'Sugestão inteligente de preços e categorias', 'Banner rotativo gerado por IA', 'Suporte VIP com Engenheiro de Onboarding dedicado', 'Atualizações prioritárias grátis'],
      popular: false,
      buttonText: 'Assinar Plano IA'
    }
  ]

  // Vitrines / Lojas Modelo carregadas dinamicamente

  // FAQs
  const faqs = [
    {
      q: 'Preciso saber programar ou contratar um desenvolvedor?',
      a: 'Não! Absolutamente nada. A CriarLojas foi criada especificamente para quem não entende de tecnologia. Nós entregamos um negócio praticamente montado e pronto para você colocar seus produtos e começar a vender em poucos minutos.'
    },
    {
      q: 'Posso conectar meu domínio próprio (.com.br)?',
      a: 'Sim! Você receberá um subdomínio gratuito (ex: sualoja.criarlojas.com.br) para usar imediatamente. A qualquer momento, você pode apontar o seu domínio próprio (.com.br ou .com) no painel administrativo de forma simples, ou deixar que nossa equipe configure para você.'
    },
    {
      q: 'A plataforma aceita PIX e Cartão com checkout transparente?',
      a: 'Sim. Oferecemos checkout integrado e transparente. Seus clientes pagam por PIX ou cartão sem sair da sua loja virtual, aumentando em até 3x a chance de finalizar a compra sem abandono de carrinho.'
    },
    {
      q: 'Tem integração automática de cálculo de frete e Correios?',
      a: 'Sim! A loja calcula automaticamente o valor do frete e o prazo de entrega com base no CEP do cliente. Oferecemos suporte aos Correios e integradores de etiqueta de desconto (como Melhor Envio) para você economizar nos despachos.'
    },
    {
      q: 'Quanto tempo leva para minha loja virtual ficar ativa?',
      a: 'Imediato. Logo após a confirmação dos dados na plataforma, o nosso Admin Master clona e provisiona toda a sua vitrine conceito. Você recebe os acessos do painel e do site no mesmo dia.'
    },
    {
      q: 'Posso cancelar minha assinatura quando quiser?',
      a: 'Sim. Nossos planos não possuem fidelidade ou multas de cancelamento. Você pode solicitar o cancelamento diretamente no painel administrativo a qualquer momento.'
    },
    {
      q: 'Tenho suporte técnico caso precise de ajuda?',
      a: 'Com certeza! Nosso suporte é 100% humano e feito em português via e-mail, painel e WhatsApp direto. Não usamos robôs ineficientes que te deixam sem resposta por dias.'
    },
    {
      q: 'Posso vender qualquer tipo de produto na plataforma?',
      a: 'Sim, você pode vender produtos físicos (roupas, perfumes, eletrônicos, doces, autopeças, etc.) ou digitais, sem qualquer limite de variações de tamanho, cor ou voltagem.'
    }
  ]

  const getPlanPrice = (planCode: string) => {
    switch (planCode) {
      case 'basic': return 29.90
      case 'pro': return 34.90
      case 'premium': return 47.90
      default: return 0.00
    }
  }

  const getPlanName = (planCode: string) => {
    switch (planCode) {
      case 'basic': return 'Plano Básico'
      case 'pro': return 'Plano Profissional'
      case 'premium': return 'Premium Ilimitado'
      default: return 'Plano Gratuito'
    }
  }

  const createAndProvisionStore = async (cleanSub: string, planCode: string) => {
    try {
      setIsSubmittingLead(true)
      
      // Buscar as configurações e dados da loja modelo
      const selectedModelId = leadData.selectedModel
      let modelStore: any = null

      if (selectedModelId) {
        const { data: dbModel } = await supabase
          .from('stores')
          .select('*')
          .eq('id', selectedModelId)
          .maybeSingle()
        modelStore = dbModel
      } else if (demoStores.length > 0) {
        // Se nenhum selecionado, pega o primeiro
        const { data: dbModel } = await supabase
          .from('stores')
          .select('*')
          .eq('id', demoStores[0].id)
          .maybeSingle()
        modelStore = dbModel
      }

      const baseSettings = modelStore?.settings || {}

      const initialSettings = {
        address: "Rua Principal, 100",
        benefits: [
          { title: "Entrega Rápida", subtitle: "Calcule o prazo no checkout" },
          { title: "Compra Segura", subtitle: "Ambiente 100% protegido" },
          { title: "Troca Fácil", subtitle: "7 dias para devolução" },
          { title: "Pagamento Facilitado", subtitle: "Em até 12x no cartão" }
        ],
        facebook: "#",
        instagram: "#",
        hero_style: "split",
        hero_title: "BEM-VINDO À " + leadData.storeName.toUpperCase(),
        promotions: {
          coupons: [],
          active_campaign: { active: false }
        },
        store_mode: planCode === 'free' ? "catalogo" : "loja",
        description: "Sua loja virtual configurada com sucesso!",
        niche: baseSettings.niche || "Moda & Acessórios Premium",
        font_family: "Inter",
        button_style: "pill",
        footer_links: [
          { url: "?view=produtos", label: "Produtos" },
        ],
        header_links: [
          { url: "/", label: "Home" },
          { url: "?view=produtos", label: "Produtos" }
        ],
        header_style: "center_menu",
        hero_bg_color: "#141414",
        hero_subtitle: "As melhores peças com os melhores preços.",
        button_variant: "filled",
        show_hero_text: true,
        footer_bg_color: "#171717",
        header_bg_color: "#ffffff",
        hero_title_color: "#f5f5f5",
        sale_price_color: "#e60000",
        top_bar_bg_color: "#000000",
        button_text_color: "#ffffff",
        flash_deals_title: "Ofertas do Dia",
        footer_text_color: "#ffffff",
        header_icon_color: "#171716",
        show_new_arrivals: true,
        button_hover_color: "#030303",
        footer_description: "Loja virtual premium desenvolvida na plataforma Criar Lojas.",
        new_arrivals_title: "Novidades",
        normal_price_color: "#bbbbbb",
        top_bar_text_color: "#ffffff",
        default_price_color: "#000000",
        hero_subtitle_color: "#d10000",
        top_bar_announcement: "FRETE GRÁTIS PARA TODO O BRASIL EM COMPRAS ACIMA DE R$ 299",
        ...baseSettings,
        name: leadData.storeName,
        email: leadData.email,
        phone: leadData.whatsapp,
        whatsapp: leadData.whatsapp,
        subdomain: cleanSub,
        primary_color: leadData.primaryColor,
        button_color: leadData.primaryColor,
        active: true,
        plan: planCode,
        is_demo: false,
        billing_enabled: planCode !== 'free',
        admin_user: leadData.email,
        admin_password: leadData.password
      }

      // Inserir a nova loja
      const { data: newStore, error: insertErr } = await supabase
        .from('stores')
        .insert({
          name: leadData.storeName,
          subdomain: cleanSub,
          settings: initialSettings
        })
        .select()
        .single()

      if (insertErr) throw insertErr

      // Clonar Produtos e Categorias se houver modelo
      if (modelStore) {
        // 1. Clonar Categorias
        const { data: originalCategories } = await supabase
          .from('categories')
          .select('*')
          .eq('store_id', modelStore.id)

        if (originalCategories && originalCategories.length > 0) {
          const categoriesToInsert = originalCategories.map(cat => ({
            name: cat.name,
            image_url: cat.image_url,
            store_id: newStore.id
          }))
          await supabase.from('categories').insert(categoriesToInsert)
        }

        // 2. Clonar Produtos
        const { data: originalProducts } = await supabase
          .from('products')
          .select('*')
          .eq('store_id', modelStore.id)

        if (originalProducts && originalProducts.length > 0) {
          const productsToClone = planCode === 'free' ? originalProducts.slice(0, 25) : originalProducts
          const productsToInsert = productsToClone.map(prod => ({
            store_id: newStore.id,
            name: prod.name,
            slug: prod.slug,
            price: prod.price,
            short_description: prod.short_description,
            description: prod.description,
            stock_quantity: prod.stock_quantity,
            sku: prod.sku,
            category: prod.category,
            sale_price: prod.sale_price,
            weight: prod.weight,
            length: prod.length,
            width: prod.width,
            height: prod.height,
            is_active: prod.is_active,
            is_featured: prod.is_featured,
            is_service: prod.is_service,
            images: prod.images,
            has_variations: prod.has_variations,
            variation_options: prod.variation_options,
            variation_skus: prod.variation_skus
          }))
          await supabase.from('products').insert(productsToInsert)
        }
      }

      setCreatedStoreData(newStore)
      setLeadSubmitted(true)
      setCheckoutPending(false)
      toast.success('Sua loja virtual foi criada e configurada com sucesso!')
    } catch (err: any) {
      console.error('Erro no provisionamento da loja:', err)
      toast.error('Erro ao provisionar a loja: ' + err.message)
    } finally {
      setIsSubmittingLead(false)
    }
  }

  // Envio do Lead / Criação de Loja
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!leadData.name.trim() || !leadData.whatsapp.trim() || !leadData.email.trim() || !leadData.storeName.trim() || !leadData.subdomain.trim() || !leadData.password.trim()) {
      toast.error('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    setIsSubmittingLead(true)
    try {
      const cleanSub = leadData.subdomain.toLowerCase().replace(/[^a-z0-9]/g, '')
      
      // Validar se subdomínio já existe
      const { data: existing, error: checkErr } = await supabase
        .from('stores')
        .select('id')
        .eq('subdomain', cleanSub)
        .limit(1)

      if (checkErr) throw checkErr
      if (existing && existing.length > 0) {
        toast.error('Este subdomínio já está em uso por outra loja.')
        setIsSubmittingLead(false)
        return
      }

      if (leadData.selectedPlan === 'free') {
        await createAndProvisionStore(cleanSub, 'free')
      } else {
        setCheckoutPending(true)
        setIsSubmittingLead(false)
      }
    } catch (err: any) {
      console.error('Erro na validação da loja:', err)
      toast.error('Erro ao processar criação da loja: ' + err.message)
      setIsSubmittingLead(false)
    }
  }

  const getWhatsappLink = () => {
    const cleanSub = leadData.subdomain.toLowerCase().replace(/[^a-z0-9]/g, '')
    const selectedStoreObj = demoStores.find(s => s.id === leadData.selectedModel) || { name: leadData.selectedModel }
    const text = `Olá Admin Criar Lojas! Acabei de solicitar a criação da minha loja virtual pronta.%0A%0A*👤 Responsável:* ${leadData.name}%0A*📱 WhatsApp:* ${leadData.whatsapp}%0A*✉️ E-mail:* ${leadData.email}%0A%0A*🛍️ Nome da Loja:* ${leadData.storeName}%0A*🌐 Subdomínio Desejado:* ${cleanSub}${domainSuffix}%0A*🎨 Cor Escolhida:* ${leadData.primaryColor}%0A%0A*📁 Modelo:* ${selectedStoreObj.name}%0A*💎 Plano:* ${leadData.selectedPlan}%0A*🛠️ Setup Assistido VIP:* ${leadData.wantsConcierge ? 'SIM' : 'NÃO'}`
    return `https://wa.me/${formatWhatsappNumber(platformSettings.whatsappSupport)}?text=${text}`
  }

  return (
    <div 
      className="light-theme"
      style={{ 
        backgroundColor: '#f8fafc', 
        color: '#0f172a', 
        minHeight: '100vh', 
        fontFamily: 'Inter, system-ui, sans-serif', 
        overflowX: 'hidden' 
      }}
    >
      {/* CSS CUSTOMIZADO PARA DESIGN CLEAN PREMIUM (LIGHT THEME) */}
      <style>{`
        html {
          scroll-behavior: smooth;
        }
        
        /* Clean Light Card */
        .glass-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.01);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .glass-card:hover {
          border-color: #10b981;
          box-shadow: 0 20px 35px -5px rgba(16, 185, 129, 0.08), 0 4px 12px -2px rgba(16, 185, 129, 0.02);
          transform: translateY(-4px);
        }

        .gradient-text-green {
          background: linear-gradient(135deg, #059669 0%, #0284c7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .btn-premium-green {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
          transition: all 0.2s ease;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
        .btn-premium-green:hover {
          background: #059669;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
        }

        .btn-premium-outline {
          background: #ffffff;
          color: #475569;
          border: 1px solid #cbd5e1;
          transition: all 0.2s ease;
        }
        .btn-premium-outline:hover {
          background: #f8fafc;
          border-color: #0ea5e9;
          color: #0ea5e9;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.15);
        }

        /* Smartphone Bezel Prateado e Clean */
        .phone-mockup {
          border: 12px solid #cbd5e1;
          border-radius: 40px;
          box-shadow: 0 25px 60px -12px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05) inset;
          overflow: hidden;
          background: #ffffff;
          position: relative;
        }

        .phone-notch {
          width: 120px;
          height: 25px;
          background: #cbd5e1;
          border-radius: 0 0 16px 16px;
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          z-index: 99;
        }

        .carousel-container {
          display: flex;
          gap: 2.5rem;
          overflow-x: auto;
          scroll-behavior: smooth;
          scroll-snap-type: x mandatory;
          padding-bottom: 2rem;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .carousel-container::-webkit-scrollbar {
          display: none;
        }

        .demo-card-slide {
          flex: 0 0 calc((100% - 5rem) / 3);
          scroll-snap-align: start;
        }

        @media (max-width: 1024px) {
          .demo-card-slide {
            flex: 0 0 calc((100% - 2.5rem) / 2);
          }
        }

        @media (max-width: 640px) {
          .demo-card-slide {
            flex: 0 0 100%;
          }
        }

        /* Comparativo Table Styles */
        .comparison-table th, .comparison-table td {
          padding: 1.25rem;
          border-bottom: 1px solid #e2e8f0;
        }
        .comparison-table tr:hover td {
          background: #f8fafc;
        }

        /* Pulsing animation */
        @keyframes subtle-pulse {
          0%, 100% { transform: scale(1); opacity: 0.95; }
          50% { transform: scale(1.03); opacity: 1; }
        }
        .pulse-effect {
          animation: subtle-pulse 2s infinite ease-in-out;
        }
        
        .whatsapp-floating-btn:hover {
          transform: scale(1.1) rotate(5deg);
        }

        /* Grid layouts */
        .grid-custom-3 {
          display: grid !important;
          grid-template-columns: repeat(3, 1fr) !important;
          gap: 2.5rem;
        }
        @media (max-width: 768px) {
          .grid-custom-3 { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e2e8f0', padding: '1.25rem 0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #10b981, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>
              <ShoppingBag size={22} color="#ffffff" />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
              CriarLojas
            </span>
          </div>

          <div className="saas-nav-links" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <a href="#comece" style={{ color: '#475569', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600, transition: 'color 0.2s' }}>Modelos Prontos</a>
            <a href="#funcionamento" style={{ color: '#475569', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600, transition: 'color 0.2s' }}>Como Funciona</a>
            <a href="#beneficios" style={{ color: '#475569', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600, transition: 'color 0.2s' }}>Vantagens</a>
            <a href="#comparacao" style={{ color: '#475569', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600, transition: 'color 0.2s' }}>Comparativo</a>
            <a href="#planos" style={{ color: '#475569', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600, transition: 'color 0.2s' }}>Planos</a>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button 
              onClick={() => handleOpenLeadModal('fashion', 'pro')} 
              className="btn-premium-green desktop-only-btn"
              style={{ padding: '0.65rem 1.5rem', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 800, border: 'none', cursor: 'pointer' }}
            >
              Criar Loja Grátis
            </button>
            <button 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#0f172a', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'none' }}
              className="mobile-menu-toggle-btn"
            >
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {showMobileMenu && (
        <div style={{ position: 'fixed', top: '75px', left: 0, right: 0, background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '1.5rem 2rem', zIndex: 99, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <a href="#comece" onClick={() => setShowMobileMenu(false)} style={{ color: '#475569', textDecoration: 'none', fontSize: '1rem', fontWeight: 600 }}>Modelos Prontos</a>
          <a href="#funcionamento" onClick={() => setShowMobileMenu(false)} style={{ color: '#475569', textDecoration: 'none', fontSize: '1rem', fontWeight: 600 }}>Como Funciona</a>
          <a href="#beneficios" onClick={() => setShowMobileMenu(false)} style={{ color: '#475569', textDecoration: 'none', fontSize: '1rem', fontWeight: 600 }}>Vantagens</a>
          <a href="#comparacao" onClick={() => setShowMobileMenu(false)} style={{ color: '#475569', textDecoration: 'none', fontSize: '1rem', fontWeight: 600 }}>Comparativo</a>
          <a href="#planos" onClick={() => setShowMobileMenu(false)} style={{ color: '#475569', textDecoration: 'none', fontSize: '1rem', fontWeight: 600 }}>Planos</a>
          <button 
            onClick={() => { setShowMobileMenu(false); handleOpenLeadModal('fashion', 'pro'); }}
            className="btn-premium-green"
            style={{ width: '100%', padding: '0.85rem', borderRadius: '10px', fontWeight: 800, fontSize: '1rem', border: 'none', cursor: 'pointer' }}
          >
            Criar Loja Grátis
          </button>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="hero-section" style={{ padding: '11rem 0 8rem 0', position: 'relative', overflow: 'hidden', background: 'radial-gradient(circle at 50% -20%, rgba(16, 185, 129, 0.06) 0%, rgba(14, 165, 233, 0.04) 50%, transparent 80%)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '4rem', alignItems: 'center' }} className="hero-grid-responsive">
          <div style={{ position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#e6fcf5', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.5rem 1.25rem', borderRadius: '30px', marginBottom: '2rem' }}>
              <Sparkles size={16} color="#059669" />
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Setup Assistido: Sua loja já nasce pronta
              </span>
            </div>

            <h1 style={{ fontSize: '4.2rem', fontWeight: 900, marginBottom: '1.5rem', lineHeight: 1.15, letterSpacing: '-1.5px', color: '#0f172a' }} className="hero-title-responsive">
              Sua loja virtual <br />
              <span className="gradient-text-green">pronta para vender</span> <br />
              em poucos minutos.
            </h1>

            <p style={{ fontSize: '1.3rem', color: '#475569', maxWidth: '650px', marginBottom: '3.5rem', lineHeight: 1.6 }}>
              Chega de perder tempo configurando sistemas complexos do zero. Com a CriarLojas, você não precisa contratar um programador ou entender de tecnologia. Nós entregamos o seu negócio praticamente pronto para vender.
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }} className="hero-buttons-responsive">
              <button 
                onClick={() => handleOpenLeadModal('fashion', 'pro')}
                className="btn-premium-green"
                style={{ padding: '1.25rem 3.2rem', borderRadius: '14px', fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem', border: 'none', cursor: 'pointer' }}
              >
                <span>Criar Minha Loja Grátis</span>
                <ArrowRight size={20} />
              </button>
              
              <a 
                href="#comece"
                className="btn-premium-outline"
                style={{ padding: '1.25rem 2.5rem', borderRadius: '14px', fontSize: '1.15rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Play size={18} />
                <span>Ver Demonstrações</span>
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', marginTop: '4.5rem', color: '#64748b', fontSize: '0.9rem' }} className="hero-features-responsive">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={18} color="#10b981" />
                <span>Sem taxa de adesão</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={18} color="#10b981" />
                <span>Suporte Humano no Brasil</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={18} color="#10b981" />
                <span>Integração de PIX Direto</span>
              </div>
            </div>
          </div>

          {/* MOCKUP EXCLUSIVO DE CELULAR (SMARTPHONE DE ALTA FIDELIDADE COM 4 PRODUTOS) */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '540px' }}>
            {/* Glow / Glow Effect atrás do Celular */}
            <div style={{ position: 'absolute', width: '300px', height: '520px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, rgba(99, 102, 241, 0.12) 50%, transparent 80%)', filter: 'blur(40px)', zIndex: 0 }} />

            {/* Estrutura do Smartphone (Moldura de Celular) */}
            <div style={{
              position: 'relative',
              zIndex: 2,
              width: '285px',
              height: '590px',
              backgroundColor: '#0f172a',
              borderRadius: '46px',
              padding: '12px',
              boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1) inset, 0 10px 20px -5px rgba(0, 0, 0, 0.3)',
              border: '4px solid #1e293b'
            }}>
              {/* Dynamic Island / Câmera Notch do Celular */}
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '85px',
                height: '20px',
                backgroundColor: '#0f172a',
                borderRadius: '20px',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: '8px'
              }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#1e293b' }} />
              </div>

              {/* Tela do Celular (Display da Loja Virtual) */}
              <div style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#ffffff',
                borderRadius: '36px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)'
              }}>
                {/* Top Bar da Loja no Celular */}
                <div style={{ backgroundColor: '#ffffff', padding: '34px 14px 8px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '6px', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <ShoppingBag size={12} />
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#0f172a' }}>Minha Loja</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      <ShoppingBag size={13} color="#0f172a" />
                      <span style={{ position: 'absolute', top: '-2px', right: '-2px', backgroundColor: '#10b981', color: '#fff', fontSize: '0.5rem', fontWeight: 900, width: '13px', height: '13px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>4</span>
                    </div>
                  </div>
                </div>

                {/* Banner Promocional no Celular */}
                <div style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', padding: '10px 14px', color: '#fff' }}>
                  <span style={{ fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '8px' }}>Nova Coleção</span>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 900, margin: '2px 0 1px 0' }}>Descontos de até 30%</h4>
                  <p style={{ fontSize: '0.55rem', margin: 0, opacity: 0.9 }}>Pix com Aprovação Instantânea</p>
                </div>

                {/* Grid de 4 Produtos na Tela do Celular (2x2) */}
                <div style={{ flex: 1, padding: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', backgroundColor: '#f8fafc', overflowY: 'hidden' }}>
                  {/* Produto 1 */}
                  <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '6px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ width: '100%', height: '62px', borderRadius: '6px', backgroundColor: '#f1f5f9', backgroundImage: 'url(https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Camiseta Premium</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 900, color: '#10b981' }}>R$ 79,90</span>
                      <span style={{ fontSize: '0.48rem', backgroundColor: '#ecfdf5', color: '#047857', fontWeight: 800, padding: '1px 3px', borderRadius: '3px' }}>Pix</span>
                    </div>
                  </div>

                  {/* Produto 2 */}
                  <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '6px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ width: '100%', height: '62px', borderRadius: '6px', backgroundColor: '#f1f5f9', backgroundImage: 'url(https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Tênis Sport Pro</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 900, color: '#10b981' }}>R$ 189,90</span>
                      <span style={{ fontSize: '0.48rem', backgroundColor: '#ecfdf5', color: '#047857', fontWeight: 800, padding: '1px 3px', borderRadius: '3px' }}>Grátis</span>
                    </div>
                  </div>

                  {/* Produto 3 */}
                  <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '6px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ width: '100%', height: '62px', borderRadius: '6px', backgroundColor: '#f1f5f9', backgroundImage: 'url(https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Relógio Smartwatch</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 900, color: '#10b981' }}>R$ 149,90</span>
                      <span style={{ fontSize: '0.48rem', backgroundColor: '#ecfdf5', color: '#047857', fontWeight: 800, padding: '1px 3px', borderRadius: '3px' }}>Pix</span>
                    </div>
                  </div>

                  {/* Produto 4 */}
                  <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '6px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ width: '100%', height: '62px', borderRadius: '6px', backgroundColor: '#f1f5f9', backgroundImage: 'url(https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Fone Bluetooth</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 900, color: '#10b981' }}>R$ 99,90</span>
                      <span style={{ fontSize: '0.48rem', backgroundColor: '#ecfdf5', color: '#047857', fontWeight: 800, padding: '1px 3px', borderRadius: '3px' }}>Pix</span>
                    </div>
                  </div>
                </div>

                {/* Botão Flutuante de Comprar no Celular */}
                <div style={{ padding: '6px 10px 10px 10px', backgroundColor: '#fff', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ backgroundColor: '#10b981', color: '#fff', borderRadius: '10px', padding: '8px', textAlign: 'center', fontWeight: 800, fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}>
                    <ShoppingBag size={12} /> Comprar R$ 519,60
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* SEÇÃO "COMECE DO JEITO CERTO" */}
      <section id="comece" style={{ padding: '4rem 0', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem', flexWrap: 'wrap', gap: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '2.8rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem 0', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
                Comece do jeito certo: Escolha seu modelo
              </h2>
              <p style={{ color: '#475569', fontSize: '1.1rem', maxWidth: '700px', margin: 0 }}>
                Nossas vitrines foram criadas por designers e especialistas em vendas. Selecione a que melhor combina com seu negócio e nossa equipe clona a estrutura para você.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button 
                className="icon-btn"
                onClick={() => scrollCarousel('left')}
                style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <ChevronLeft size={24} color="#0f172a" />
              </button>
              <button 
                className="icon-btn"
                onClick={() => scrollCarousel('right')}
                style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#10b981', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}
              >
                <ChevronRight size={24} color="#ffffff" />
              </button>
            </div>
          </div>

          <div ref={carouselRef} className="carousel-container">
            {loadingStores ? (
              // Skeleton cards durante o carregamento
              [...Array(4)].map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="glass-card demo-card-slide"
                  style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                >
                  <div>
                    <div style={{
                      height: '240px',
                      background: 'linear-gradient(90deg, #f0f4f8 25%, #e2e8f0 50%, #f0f4f8 75%)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 1.5s infinite'
                    }} />
                    <div style={{ padding: '2rem' }}>
                      <div style={{ height: '1.6rem', width: '60%', borderRadius: '8px', background: 'linear-gradient(90deg, #f0f4f8 25%, #e2e8f0 50%, #f0f4f8 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', marginBottom: '0.75rem' }} />
                      <div style={{ height: '1rem', width: '40%', borderRadius: '8px', background: 'linear-gradient(90deg, #f0f4f8 25%, #e2e8f0 50%, #f0f4f8 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', marginBottom: '1rem' }} />
                      <div style={{ height: '0.875rem', width: '90%', borderRadius: '6px', background: 'linear-gradient(90deg, #f0f4f8 25%, #e2e8f0 50%, #f0f4f8 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', marginBottom: '0.5rem' }} />
                      <div style={{ height: '0.875rem', width: '75%', borderRadius: '6px', background: 'linear-gradient(90deg, #f0f4f8 25%, #e2e8f0 50%, #f0f4f8 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                    </div>
                  </div>
                  <div style={{ padding: '0 2rem 2rem 2rem', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }} className="demo-card-buttons">
                    <div style={{ height: '2.75rem', borderRadius: '10px', background: 'linear-gradient(90deg, #f0f4f8 25%, #e2e8f0 50%, #f0f4f8 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                    <div style={{ height: '2.75rem', borderRadius: '10px', background: 'linear-gradient(90deg, #f0f4f8 25%, #e2e8f0 50%, #f0f4f8 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                  </div>
                </div>
              ))
            ) : demoStores.map((store) => (
              <div 
                key={store.id} 
                className="glass-card demo-card-slide"
                style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  <div style={{ height: '240px', overflow: 'hidden', position: 'relative' }}>
                    <img src={store.img} alt={store.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: store.color, padding: '0.4rem 1.1rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)' }}>
                      {store.niche}
                    </div>
                  </div>

                  <div style={{ padding: '2rem' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#0f172a' }}>{store.name}</h3>
                    <p style={{ color: '#0ea5e9', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>/modelos/{store.subdomain}</p>
                    <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>{store.desc}</p>
                  </div>
                </div>

                <div style={{ padding: '0 2rem 2rem 2rem', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }} className="demo-card-buttons">
                  <button 
                    onClick={() => handleOpenLeadModal(store.id, 'pro')}
                    className="btn-premium-green"
                    style={{ padding: '0.85rem', borderRadius: '10px', fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: 'none', cursor: 'pointer' }}
                  >
                    <Sparkles size={16} />
                    <span>Usar modelo</span>
                  </button>

                  <a 
                    href={`/modelos/${store.subdomain}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-premium-outline"
                    style={{ padding: '0.85rem', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', textDecoration: 'none' }}
                  >
                    <span>Visualizar</span>
                    <ArrowUpRight size={16} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO "COMO FUNCIONA" */}
      <section id="funcionamento" style={{ padding: '4rem 0', background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#e0f2fe', border: '1px solid rgba(14, 165, 233, 0.3)', padding: '0.5rem 1.25rem', borderRadius: '30px', marginBottom: '1.5rem' }}>
              <Rocket size={16} color="#0284c7" />
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Simples e Sem Complicações
              </span>
            </div>
            <h2 style={{ fontSize: '2.8rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem 0', letterSpacing: '-0.5px', lineHeight: 1.2 }}>Como funciona a CriarLojas?</h2>
            <p style={{ color: '#475569', fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto' }}>
              Nosso processo foi desenhado para você começar a faturar hoje, delegando toda a parte complexa para nossa equipe.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2.5rem' }} className="steps-grid-responsive">
            {[
              { num: 1, title: 'Escolha seu segmento', text: 'Navegue pelas vitrines modelo e selecione o design perfeito para os seus produtos.', color: '#10b981' },
              { num: 2, title: 'Personalize', text: 'Escolha as cores, envie seu logo e diga suas preferências operacionais.', color: '#0ea5e9' },
              { num: 3, title: 'Cadastre produtos', text: 'Insira os produtos com preço e estoque de forma intuitiva pelo celular.', color: '#a855f7' },
              { num: 4, title: 'Comece a vender', text: 'Compartilhe o link e receba pagamentos via PIX ou cartão diretamente na sua conta.', color: '#ec4899' }
            ].map(step => (
              <div key={step.num} className="glass-card" style={{ padding: '2.5rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: `${step.color}15`, border: `1px solid ${step.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: step.color, fontWeight: 900, fontSize: '1.25rem', marginBottom: '1.5rem' }}>
                  {step.num}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>{step.title}</h3>
                <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO "TUDO QUE SUA LOJA PRECISA" (BENEFÍCIOS) */}
      <section id="beneficios" style={{ padding: '4rem 0', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '2.8rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem 0', letterSpacing: '-0.5px', lineHeight: 1.2 }}>Tudo o que você precisa para faturar alto</h2>
            <p style={{ color: '#475569', fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto' }}>
              Nós focamos em entregar soluções de conversão para você vender mais e melhor todos os dias.
            </p>
          </div>

          <div className="grid-custom-3">
            {[
              { icon: <Zap size={24} />, title: 'Receba pagamentos por PIX na hora', text: 'Ofereça o PIX como pagamento instantâneo e receba o dinheiro diretamente na sua conta na hora, sem comissões extras.', color: '#10b981' },
              { icon: <Lock size={24} />, title: 'Mais confiança para finalizar a compra', text: 'Nosso checkout transparente mantém o cliente dentro da sua loja na hora de pagar, minimizando desistências.', color: '#0ea5e9' },
              { icon: <Rocket size={24} />, title: 'Frete automático inteligente', text: 'Cálculo de frete baseado no peso do produto e no CEP. Emissão fácil de etiquetas com descontos Correios.', color: '#f59e0b' },
              { icon: <Smartphone size={24} />, title: 'Gerenciamento total pelo celular', text: 'Controle estoque, altere preços, cadastre produtos e responda a clientes de forma totalmente móvel.', color: '#6366f1' },
              { icon: <Globe size={24} />, title: 'Sua loja pode aparecer no Google', text: 'Estrutura de código leve, rápida e otimizada para SEO, facilitando que compradores te achem na internet.', color: '#ec4899' },
              { icon: <Shield size={24} />, title: 'Seus clientes compram com segurança', text: 'Certificado de segurança SSL integrado. Seus clientes inserem dados em ambiente blindado e criptografado.', color: '#ef4444' }
            ].map((item, index) => (
              <div key={index} className="glass-card" style={{ padding: '2.5rem' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: `${item.color}10`, border: `1px solid ${item.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, marginBottom: '1.5rem' }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>{item.title}</h3>
                <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO COMPARAÇÃO VISUAL */}
      <section id="comparacao" style={{ padding: '4rem 0', background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '2.8rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem 0', letterSpacing: '-0.5px', lineHeight: 1.2 }}>Por que a CriarLojas é diferente?</h2>
            <p style={{ color: '#475569', fontSize: '1.1rem' }}>Compare e veja por que somos a escolha inteligente para pequenos negócios.</p>
          </div>

          <div style={{ overflowX: 'auto', background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '1rem' }}>
            <table className="comparison-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1' }}>
                  <th style={{ color: '#0f172a', fontSize: '1.1rem', fontWeight: 800 }}>Diferencial</th>
                  <th style={{ color: '#059669', fontSize: '1.1rem', fontWeight: 800, textAlign: 'center', background: '#e6fcf5', borderRadius: '12px 12px 0 0' }}>CriarLojas</th>
                  <th style={{ color: '#475569', fontSize: '1.1rem', fontWeight: 600, textAlign: 'center' }}>Outras Plataformas</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Setup Assistido (Entregamos pronta)', ours: true, others: false },
                  { label: 'Facilidade de início', ours: 'Imediato, sem código', others: 'Complexo, faça você mesmo' },
                  { label: 'Modelos Prontos de Alta Conversão', ours: true, others: false },
                  { label: 'Suporte Técnico Humano', ours: 'Direto no WhatsApp', others: 'E-mails e Chats em Inglês' },
                  { label: 'Mensalidade e Preço', ours: 'Sem taxas abusivas', others: 'Cobram comissões por venda' },
                  { label: 'Tempo para começar a faturar', ours: 'Menos de 30 minutos', others: 'Dias configurando do zero' }
                ].map((row, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700, color: '#334155' }}>{row.label}</td>
                    <td style={{ textAlign: 'center', background: '#e6fcf5', color: '#059669', fontWeight: 800 }}>
                      {typeof row.ours === 'boolean' ? (row.ours ? <CheckCircle size={22} color="#059669" style={{ margin: '0 auto' }} /> : '❌') : row.ours}
                    </td>
                    <td style={{ textAlign: 'center', color: '#64748b' }}>
                      {typeof row.others === 'boolean' ? (row.others ? <CheckCircle size={22} color="#64748b" style={{ margin: '0 auto' }} /> : <X size={22} color="#ef4444" style={{ margin: '0 auto' }} />) : row.others}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SEÇÃO "TRANSFORME SUA IDEIA EM NEGÓCIO" */}
      <section id="segmentos" style={{ padding: '4rem 0', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '2.8rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem 0', letterSpacing: '-0.5px', lineHeight: 1.2 }}>Transforme sua ideia em faturamento real</h2>
            <p style={{ color: '#475569', fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto' }}>
              Não importa o que você vende, nós temos a estrutura perfeita para o seu nicho começar a converter.
            </p>

            <div className="categories-filter-responsive" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2.5rem' }}>
              <button
                onClick={() => setActiveSegmentTab('todos')}
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  borderRadius: '30px', 
                  fontWeight: 700, 
                  border: '1px solid #cbd5e1',
                  background: activeSegmentTab === 'todos' ? '#10b981' : '#ffffff',
                  color: activeSegmentTab === 'todos' ? 'white' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                🌐 Todos
              </button>
              {Array.from(new Set(demoStores.map(s => s.niche || 'Moda & Roupa'))).map((nicheName: any) => {
                const isSelected = activeSegmentTab === nicheName.toLowerCase().replace(/[^a-z0-9]/g, '')
                return (
                  <button
                    key={nicheName}
                    onClick={() => setActiveSegmentTab(nicheName.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                    style={{ 
                      padding: '0.75rem 1.5rem', 
                      borderRadius: '30px', 
                      fontWeight: 700, 
                      border: '1px solid #cbd5e1',
                      background: isSelected ? '#10b981' : '#ffffff',
                      color: isSelected ? 'white' : '#475569',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {nicheName}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid-custom-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            {demoStores.filter(store => {
              if (activeSegmentTab === 'todos') return true
              const formattedNiche = (store.niche || 'Moda & Roupa').toLowerCase().replace(/[^a-z0-9]/g, '')
              return formattedNiche === activeSegmentTab
            }).slice(0, visibleDemoLimit).map((store) => (
              <div 
                key={store.id}
                className="glass-card" 
                style={{ 
                  width: '100%', 
                  margin: '0 auto', 
                  borderRadius: '24px', 
                  overflow: 'hidden', 
                  border: '1px solid #cbd5e1', 
                  boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%'
                }}
              >
                <div style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></span>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }}></span>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></span>
                  </div>
                  <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '20px', padding: '0.2rem 1.5rem', fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                    {store.subdomain}{domainSuffix}
                  </div>
                  <div style={{ width: '30px' }}></div>
                </div>

                <div style={{ background: '#ffffff', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 900, color: store.color || '#0f172a', fontSize: '1rem', letterSpacing: '-0.5px' }}>{store.name}</span>
                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.7rem', fontWeight: 700, color: '#475569' }}>
                      <span>Home</span>
                      <span>Produtos</span>
                    </div>
                  </div>

                  {/* Stacked Showcase inside the store preview */}
                  <div style={{ padding: '1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                    <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', height: '160px', border: '1px solid #cbd5e1' }}>
                      <img src={store.img} alt={store.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: store.color || '#10b981', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 800 }}>
                        {store.niche}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
                      <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.2, marginBottom: '0.5rem' }}>
                          {store.name}
                        </h4>
                        <p style={{ color: '#475569', fontSize: '0.8rem', lineHeight: 1.4, marginBottom: '1rem' }}>
                          {store.desc}
                        </p>
                      </div>
                      <div className="card-buttons-container" style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => handleOpenLeadModal(store.id, 'pro')}
                          className="btn-premium-green" 
                          style={{ flex: 1, padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 850, border: 'none', background: store.color || '#10b981', cursor: 'pointer' }}
                        >
                          Criar Loja
                        </button>
                        <a 
                          href={`/modelos/${store.subdomain}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="btn-premium-outline"
                          style={{ flex: 1, padding: '0.5rem 0.85rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'center' }}
                        >
                          <span>Ver Demo</span>
                          <ArrowUpRight size={12} />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Bottom section displaying sample products / layout details */}
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                      {[1, 2, 3].map((num) => (
                        <div key={num} style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.5rem', textAlign: 'center' }}>
                          <div style={{ height: '50px', background: '#f8fafc', borderRadius: '6px', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShoppingBag size={14} color={store.color || '#10b981'} style={{ opacity: 0.6 }} />
                          </div>
                          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#334155', marginBottom: '0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Item #{num}</div>
                          <div style={{ fontSize: '0.7rem', fontWeight: 950, color: store.color || '#10b981' }}>R$ 149</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {demoStores.filter(store => {
            if (activeSegmentTab === 'todos') return true
            const formattedNiche = (store.niche || 'Moda & Roupa').toLowerCase().replace(/[^a-z0-9]/g, '')
            return formattedNiche === activeSegmentTab
          }).length > visibleDemoLimit && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3.5rem' }}>
              <button 
                onClick={() => setVisibleDemoLimit(prev => prev + 3)}
                className="btn-premium"
                style={{ 
                  padding: '0.75rem 2.5rem', 
                  borderRadius: '30px', 
                  fontSize: '0.9rem', 
                  fontWeight: 800, 
                  background: '#10b981', 
                  color: '#ffffff', 
                  border: 'none', 
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                  transition: '0.2s'
                }}
              >
                Carregar Mais Modelos +
              </button>
            </div>
          )}
        </div>
      </section>

      {/* SEÇÃO 1: REGISTRO DE DOMÍNIO PRÓPRIO */}
      <section id="dominio-proprio" style={{ padding: '4rem 0', background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#e0f2fe', border: '1px solid rgba(14, 165, 233, 0.3)', padding: '0.5rem 1.25rem', borderRadius: '30px', marginBottom: '1.5rem' }}>
              <Globe size={16} color="#0284c7" />
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Expansão e Autoridade de Marca
              </span>
            </div>
            <h2 style={{ fontSize: '2.8rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem 0', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
              Quer passar mais credibilidade? <br />
              <span style={{ color: '#0ea5e9' }}>Registre seu Domínio Próprio (.com.br)</span>
            </h2>
            <p style={{ color: '#475569', fontSize: '1.15rem', maxWidth: '750px', margin: '0 auto', lineHeight: 1.6 }}>
              Você pode começar sua loja utilizando nosso subdomínio gratuito (ex: sualoja.criarlojas.com.br) pelo tempo que quiser. Porém, quando sua marca começar a crescer, ter um endereço próprio como www.sualoja.com.br aumenta drasticamente a confiança dos seus clientes e as taxas de conversão.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '4rem', alignItems: 'center' }} className="segment-card-responsive">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Por que registrar com a Criar Lojas?</h3>
              <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.6, margin: 0 }}>
                Em vez de lidar com configurações complexas de DNS, apontamento CNAME e propagação em servidores externos, deixe nossa equipe de infraestrutura registrar e configurar tudo para você de forma transparente e imediata!
              </p>

              <div className="feature-list-card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '16px', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9', flexShrink: 0 }}>✓</div>
                <div>
                  <h4 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem', margin: '0 0 0.25rem 0' }}>Registro Oficial em Seu Nome</h4>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Garantimos o registro da sua marca (.com.br ou .com) diretamente nos órgãos oficiais, garantindo que você seja o único titular e proprietário do domínio.</p>
                </div>
              </div>

              <div className="feature-list-card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '16px', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e6fcf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', flexShrink: 0 }}>✓</div>
                <div>
                  <h4 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem', margin: '0 0 0.25rem 0' }}>Apontamento & SSL Automáticos</h4>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Configuração de servidores de nomes (DNS), ativação de certificado de segurança (SSL) e otimização de rotas realizadas direto pela nossa equipe.</p>
                </div>
              </div>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=700&q=80" 
                alt="Registro de Domínio Próprio" 
                style={{ width: '100%', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 20px 40px rgba(0,0,0,0.06)' }} 
              />
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '4rem' }}>
            <button 
              onClick={() => setShowDomainModal(true)}
              className="btn-premium-green" 
              style={{ padding: '1.2rem 3.5rem', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 800, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#0ea5e9', boxShadow: '0 8px 24px rgba(14, 165, 233, 0.25)' }}
            >
              <Globe size={18} />
              <span>Solicitar Registro de Domínio Próprio</span>
            </button>
          </div>
        </div>
      </section>

      {/* SEÇÃO 2: SERVIÇO DE PERSONALIZAÇÃO VIP (CONCIERGE) */}
      <section id="personalizacao-vip" style={{ padding: '4rem 0', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#e6fcf5', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.5rem 1.25rem', borderRadius: '30px', marginBottom: '1.5rem' }}>
              <Sparkles size={16} color="#059669" />
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Serviço Especializado de Implementação
              </span>
            </div>
            <h2 style={{ fontSize: '2.8rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem 0', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
              Não tem tempo? Contrate nosso <br />
              <span style={{ color: '#10b981' }}>Serviço de Personalização VIP (Concierge)</span>
            </h2>
            <p style={{ color: '#475569', fontSize: '1.15rem', maxWidth: '750px', margin: '0 auto', lineHeight: 1.6 }}>
              A plataforma Criar Lojas entrega a infraestrutura completa e a vitrine modelo pronta para você mesmo personalizar com suas cores, banners e produtos. Porém, se você deseja economizar tempo e ter uma loja virtual com design de classe mundial feito por nossos especialistas, o serviço de Concierge VIP é a escolha perfeita.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '4rem', alignItems: 'center' }} className="segment-card-responsive">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>O que está incluído no Setup VIP?</h3>
              <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.6, margin: 0 }}>
                Nós cuidamos do cadastro inicial de produtos, criação de banners sob medida focados em conversão e configuração completa de frete e meios de pagamento para você receber a loja 100% pronta para vender.
              </p>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '16px', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e6fcf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', flexShrink: 0 }}>✓</div>
                <div>
                  <h4 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem', margin: '0 0 0.25rem 0' }}>Setup Chave na Mão</h4>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Sua loja entregue perfeitamente configurada, com produtos iniciais cadastrados e todos os métodos de pagamento e frete ativos.</p>
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '16px', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9', flexShrink: 0 }}>✓</div>
                <div>
                  <h4 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem', margin: '0 0 0.25rem 0' }}>Design Profissional de Alta Conversão</h4>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Banners conceituais e identidade visual refinada criados por designers com vasta experiência no mercado de e-commerce brasileiro.</p>
                </div>
              </div>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=700&q=80" 
                alt="Serviço de Personalização VIP" 
                style={{ width: '100%', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 20px 40px rgba(0,0,0,0.06)' }} 
              />
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '4rem' }}>
            <button 
              onClick={() => handleOpenLeadModal('fashion', 'pro', true)}
              className="btn-premium-green" 
              style={{ padding: '1.2rem 3.5rem', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 800, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#10b981', boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)' }}
            >
              <Sparkles size={18} />
              <span>Solicitar Personalização VIP da Minha Loja</span>
            </button>
          </div>
        </div>
      </section>

      {/* SEÇÃO 3: CALCULADORA DE ECONOMIA */}
      <section id="calculadora-taxas" style={{ padding: '4rem 0', background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
        <div className="calc-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '5rem', alignItems: 'center' }} className="calculator-grid-responsive">
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#e0f2fe', border: '1px solid rgba(14, 165, 233, 0.3)', padding: '0.5rem 1.25rem', borderRadius: '30px', marginBottom: '1.5rem' }}>
                <DollarSign size={16} color="#0284c7" />
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Simule Seus Ganhos Reais
                </span>
              </div>
              <h2 style={{ fontSize: '2.8rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem 0', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
                Quanto Você Economiza com as Taxas Ultrabaixas da Criar Lojas?
              </h2>
              <p style={{ color: '#475569', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '3rem' }}>
                Plataformas tradicionais cobram até 5% de comissão mais tarifas fixas por cada venda realizada. Na Criar Lojas, você tem previsibilidade financeira e margem de lucro maximizada.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem', fontSize: '1.05rem' }}>
                    <span>Pedidos por Mês:</span>
                    <span style={{ color: '#0ea5e9', fontSize: '1.2rem' }}>{salesPerMonth} pedidos</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="1000" 
                    step="10"
                    value={salesPerMonth}
                    onChange={(e) => setSalesPerMonth(parseInt(e.target.value))}
                    style={{ width: '100%', height: '6px', borderRadius: '4px', accentColor: '#0ea5e9', cursor: 'pointer' }}
                  />
                </div>

                <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem', fontSize: '1.05rem' }}>
                    <span>Ticket Médio por Pedido:</span>
                    <span style={{ color: '#10b981', fontSize: '1.2rem' }}>R$ {averageTicket.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <input 
                    type="range" 
                    min="20" 
                    max="1000" 
                    step="10"
                    value={averageTicket}
                    onChange={(e) => setAverageTicket(parseInt(e.target.value))}
                    style={{ width: '100%', height: '6px', borderRadius: '4px', accentColor: '#10b981', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>

            <div className="calc-result-box" style={{ background: '#10b981', borderRadius: '24px', padding: '3.5rem 3rem', color: '#ffffff', boxShadow: '0 20px 40px rgba(16, 185, 129, 0.25)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'inline-block', background: '#0f172a', color: '#ffffff', fontSize: '0.75rem', fontWeight: 900, padding: '0.4rem 0.85rem', borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.25rem', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                Economia Comprovada
              </div>

              <span className="calc-small-label" style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.85, display: 'block' }}>Faturamento Mensal Simulado</span>
              <div className="calc-big-value" style={{ fontSize: '2.5rem', fontWeight: 950, margin: '0.25rem 0 2rem 0', lineHeight: 1 }}>
                R$ {(salesPerMonth * averageTicket).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>

              <div className="calc-sub-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '1.5rem', marginBottom: '2.5rem' }}>
                <div>
                  <span className="calc-mini-label" style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.8, display: 'block' }}>Taxas Outras Plataformas (5%)</span>
                  <span className="calc-medium-value" style={{ fontSize: '1.25rem', fontWeight: 900, display: 'block', marginTop: '0.25rem', textDecoration: 'line-through', opacity: 0.8 }}>
                    R$ {(salesPerMonth * averageTicket * 0.05).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="calc-mini-label" style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.8, display: 'block' }}>Taxa Criar Lojas (1,25%)</span>
                  <span className="calc-medium-value" style={{ fontSize: '1.25rem', fontWeight: 900, display: 'block', marginTop: '0.25rem' }}>
                    R$ {(salesPerMonth * averageTicket * 0.0125).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="calc-savings-box" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', padding: '1.75rem', borderRadius: '16px', marginBottom: '2.5rem' }}>
                <span className="calc-small-label" style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', opacity: 0.9, display: 'block' }}>Sua Economia Anual Estimada:</span>
                <span className="calc-huge-value" style={{ fontSize: '2.2rem', fontWeight: 950, display: 'block', marginTop: '0.25rem', lineHeight: 1 }}>
                  R$ {((salesPerMonth * averageTicket * 0.05 - salesPerMonth * averageTicket * 0.0125) * 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="calc-desc" style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: '0.5rem', display: 'block' }}>Dinheiro direto no seu bolso para investir em estoque e anúncios!</span>
              </div>

              <button 
                onClick={() => handleOpenLeadModal('fashion', 'pro')}
                style={{ width: '100%', padding: '1.2rem', background: '#ffffff', color: '#10b981', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 900, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 10px 25px rgba(0,0,0,0.06)' }}
              >
                Solicitar Loja & Garantir Economia
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO PLANOS */}
      <section id="planos" style={{ padding: '4rem 0', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '2.8rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem 0', letterSpacing: '-0.5px', lineHeight: 1.2 }}>Planos Sob Medida Para Seu Sucesso</h2>
            <p style={{ color: '#475569', fontSize: '1.1rem', marginBottom: '2.5rem' }}>Escolha o pacote ideal para começar hoje. Sem fidelidades ou taxas ocultas.</p>

            <div style={{ display: 'inline-flex', alignItems: 'center', background: '#ffffff', padding: '0.4rem', borderRadius: '30px', border: '1px solid #cbd5e1' }}>
              <button 
                onClick={() => setBillingCycle('mensal')}
                style={{ padding: '0.65rem 2rem', background: billingCycle === 'mensal' ? '#10b981' : 'transparent', color: billingCycle === 'mensal' ? 'white' : '#475569', border: 'none', borderRadius: '25px', fontWeight: 800, cursor: 'pointer', fontSize: '0.95rem', transition: 'all 0.2s' }}
              >
                Mensal
              </button>
              <button 
                onClick={() => setBillingCycle('anual')}
                style={{ padding: '0.65rem 2rem', background: billingCycle === 'anual' ? '#10b981' : 'transparent', color: billingCycle === 'anual' ? 'white' : '#475569', border: 'none', borderRadius: '25px', fontWeight: 800, cursor: 'pointer', fontSize: '0.95rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <span>Anual</span>
                <span style={{ background: '#ef4444', color: 'white', fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '10px', fontWeight: 900 }}>20% OFF</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${plans.length || 4}, 1fr)`, gap: '1.5rem' }} className="plans-grid-responsive">
            {plans.map((plan) => {
              const price = billingCycle === 'mensal' ? plan.priceMonthly : plan.priceAnnual
              const isPopular = plan.popular
              
              return (
                <div 
                  key={plan.id} 
                  className="glass-card"
                  style={{ 
                    padding: '3rem 2rem', 
                    position: 'relative', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    border: isPopular ? '2px solid #10b981' : '1px solid #cbd5e1'
                  }}
                >
                  {isPopular && (
                    <div 
                      className="popular-badge-responsive"
                      style={{ position: 'absolute', top: 0, right: 0, background: '#10b981', color: 'white', fontSize: '0.75rem', fontWeight: 800, padding: '0.4rem 1rem', borderRadius: '0 18px 0 16px', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Star size={12} fill="white" stroke="none" />
                      <span>Recomendado</span>
                    </div>
                  )}

                  <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: '0 0 1rem 0' }}>{plan.name}</h3>
                    <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.5, minHeight: '45px' }}>{plan.desc}</p>

                    <div className="price-display" style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '2.5rem' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#94a3b8' }}>R$</span>
                      <span style={{ fontSize: '3rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{price.toFixed(2).replace('.', ',')}</span>
                      <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 600 }}>/mês</span>
                    </div>

                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '2rem', marginBottom: '3rem' }}>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '1rem' }}>
                        {plan.features.map((f: any, i: number) => {
                          const isExcluded = typeof f === 'string' && (f.startsWith('[-] ') || f.startsWith('[-]'));
                          let cleanText = typeof f === 'string' ? (isExcluded ? f.replace(/^\[-\]\s*/, '') : f) : '';

                          return (
                            <li key={i} className="plan-feature-item" style={{ display: 'flex', gap: '0.75rem', color: isExcluded ? '#cbd5e1' : '#475569', textDecoration: isExcluded ? 'line-through' : 'none' }}>
                              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: isExcluded ? '#f1f5f9' : '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isExcluded ? '#94a3b8' : 'white', flexShrink: 0 }}>
                                {isExcluded ? <X size={12} /> : <Check size={12} />}
                              </div>
                              <span className="plan-feature-text" style={{ fontSize: 'inherit', lineHeight: 1.3 }}>{cleanText}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleOpenLeadModal('fashion', plan.id)}
                    className="btn-premium-green"
                    style={{ width: '100%', padding: '1.1rem', borderRadius: '10px', fontWeight: 800, fontSize: '1rem', border: 'none', cursor: 'pointer' }}
                  >
                    {plan.id === 'free' ? 'Começar grátis' : 'Contratar este'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* SEÇÃO 4: TABELA COMPARATIVA DE RECURSOS/PLANOS COMPLETA */}
      <section id="comparacao-planos" style={{ padding: '4rem 0', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.8rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem 0', letterSpacing: '-0.5px', lineHeight: 1.2 }}>Tabela Comparativa de Recursos</h2>
            <p style={{ color: '#475569', fontSize: '1.1rem' }}>Veja detalhadamente o que está incluso em cada uma das opções abaixo.</p>
            
            <button 
              onClick={() => setShowFullComparison(!showFullComparison)}
              className="btn-premium-outline"
              style={{ marginTop: '2rem', padding: '0.85rem 2.5rem', borderRadius: '30px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              {showFullComparison ? 'Ocultar Comparação Completa ▲' : 'Visualizar Comparação Completa ▼'}
            </button>
          </div>

          {showFullComparison && (
            <div style={{ overflowX: 'auto', background: '#ffffff', borderRadius: '24px', border: '1px solid #cbd5e1', padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.04)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #cbd5e1', height: '60px' }}>
                    <th style={{ color: '#0f172a', fontSize: '1.05rem', fontWeight: 900, width: '30%' }}>Recurso / Funcionalidade</th>
                    <th style={{ color: '#94a3b8', fontSize: '1.05rem', fontWeight: 800, textAlign: 'center', width: '15%' }}>Gratuito</th>
                    <th style={{ color: '#475569', fontSize: '1.05rem', fontWeight: 800, textAlign: 'center', width: '15%' }}>Básico</th>
                    <th style={{ color: '#0284c7', fontSize: '1.05rem', fontWeight: 800, textAlign: 'center', width: '20%' }}>Profissional (Pro)</th>
                    <th style={{ color: '#059669', fontSize: '1.05rem', fontWeight: 900, textAlign: 'center', width: '20%', background: '#e6fcf5', borderRadius: '12px 12px 0 0' }}>Premium</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ backgroundColor: '#f8fafc', height: '40px' }}>
                    <td colSpan={5} style={{ fontWeight: 800, color: '#64748b', fontSize: '0.75rem', paddingLeft: '1rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Vendas e Estrutura</td>
                  </tr>
                  {[
                    { label: 'Catálogo via WhatsApp', free: '✓', basic: '✓', pro: '✓', premium: '✓' },
                    { label: 'Checkout Transparente na Loja', free: '❌', basic: '❌', pro: '✓', premium: '✓' },
                    { label: 'Produtos Cadastrados', free: 'Até 25 produtos', basic: 'Ilimitado', pro: 'Ilimitado', premium: 'Ilimitado' },
                    { label: 'Domínio Próprio ou Subdomínio Grátis', free: 'Subdomínio apenas', basic: '✓', pro: '✓', premium: '✓' },
                    { label: 'Link da Bio (Vitrine Integrada)', free: '❌', basic: '✓', pro: '✓', premium: '✓' },
                    { label: 'Loja do Instagram (Integração Sacolinha)', free: '❌', basic: '❌', pro: '✓', premium: '✓' },
                    { label: 'Taxa de Transação (Comissão)', free: 'Não aplicável', basic: 'Não aplicável (sem checkout)', pro: '1,75% por venda', premium: '1,25% por venda' }
                  ].map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', height: '52px' }}>
                      <td style={{ fontWeight: 700, color: '#334155', paddingLeft: '1rem' }}>{row.label}</td>
                      <td style={{ textAlign: 'center', color: row.free === '❌' ? '#ef4444' : '#0f172a', fontWeight: 700 }}>{row.free}</td>
                      <td style={{ textAlign: 'center', color: row.basic === '❌' ? '#ef4444' : '#0f172a', fontWeight: 700 }}>{row.basic}</td>
                      <td style={{ textAlign: 'center', color: '#0284c7', fontWeight: 700 }}>{row.pro}</td>
                      <td style={{ textAlign: 'center', color: '#059669', fontWeight: 800, background: '#e6fcf5' }}>{row.premium}</td>
                    </tr>
                  ))}

                  <tr style={{ backgroundColor: '#f8fafc', height: '40px' }}>
                    <td colSpan={5} style={{ fontWeight: 800, color: '#64748b', fontSize: '0.75rem', paddingLeft: '1rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Logística e Integrações</td>
                  </tr>
                  {[
                    { label: 'Cálculo Automático de Frete', free: '❌', basic: '❌', pro: '✓', premium: '✓' },
                    { label: 'Correios e Melhor Envio', free: '❌', basic: '❌', pro: '✓', premium: '✓' },
                    { label: 'Mercado Pago / Gateways', free: '❌', basic: '❌', pro: '✓', premium: '✓' }
                  ].map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', height: '52px' }}>
                      <td style={{ fontWeight: 700, color: '#334155', paddingLeft: '1rem' }}>{row.label}</td>
                      <td style={{ textAlign: 'center', color: row.free === '❌' ? '#ef4444' : '#0f172a', fontWeight: 700 }}>{row.free}</td>
                      <td style={{ textAlign: 'center', color: row.basic === '❌' ? '#ef4444' : '#0f172a', fontWeight: 700 }}>{row.basic}</td>
                      <td style={{ textAlign: 'center', color: '#0284c7', fontWeight: 700 }}>{row.pro}</td>
                      <td style={{ textAlign: 'center', color: '#059669', fontWeight: 800, background: '#e6fcf5' }}>{row.premium}</td>
                    </tr>
                  ))}

                  <tr style={{ backgroundColor: '#f8fafc', height: '40px' }}>
                    <td colSpan={5} style={{ fontWeight: 800, color: '#64748b', fontSize: '0.75rem', paddingLeft: '1rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Marketing e Conversão</td>
                  </tr>
                  {[
                    { label: 'Cupons de Desconto', free: '❌', basic: '❌', pro: '❌', premium: '✓' },
                    { label: 'Pixels (Facebook, Google, etc.)', free: '❌', basic: '❌', pro: '❌', premium: '✓' }
                  ].map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', height: '52px' }}>
                      <td style={{ fontWeight: 700, color: '#334155', paddingLeft: '1rem' }}>{row.label}</td>
                      <td style={{ textAlign: 'center', color: row.free === '❌' ? '#ef4444' : '#0f172a', fontWeight: 700 }}>{row.free}</td>
                      <td style={{ textAlign: 'center', color: row.basic === '❌' ? '#ef4444' : '#0f172a', fontWeight: 700 }}>{row.basic}</td>
                      <td style={{ textAlign: 'center', color: row.pro === '❌' ? '#ef4444' : '#0284c7', fontWeight: 700 }}>{row.pro}</td>
                      <td style={{ textAlign: 'center', color: '#059669', fontWeight: 800, background: '#e6fcf5', borderRadius: idx === 1 ? '0 0 12px 12px' : '0' }}>{row.premium}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* PROVA SOCIAL */}
      <section style={{ padding: '4rem 0', background: '#ffffff', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', textAlign: 'center', marginBottom: '4rem' }} className="stats-grid-responsive">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <Rocket size={32} color="#10b981" />
              <div className="stat-value-display" style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', marginTop: '0.5rem' }}>1 Hora</div>
              <div className="stat-desc-text" style={{ color: '#475569', fontSize: '0.95rem', fontWeight: 600 }}>Loja pronta para vender</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={32} color="#0ea5e9" />
              <div className="stat-value-display" style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', marginTop: '0.5rem' }}>100% Seguro</div>
              <div className="stat-desc-text" style={{ color: '#475569', fontSize: '0.95rem', fontWeight: 600 }}>SSL e infraestrutura protegida</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={32} color="#f59e0b" />
              <div className="stat-value-display" style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', marginTop: '0.5rem' }}>PIX • Cartão • Boleto</div>
              <div className="stat-desc-text" style={{ color: '#475569', fontSize: '0.95rem', fontWeight: 600 }}>Receba sem complicação</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <Smartphone size={32} color="#6366f1" />
              <div className="stat-value-display" style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', marginTop: '0.5rem' }}>100% Responsivo</div>
              <div className="stat-desc-text" style={{ color: '#475569', fontSize: '0.95rem', fontWeight: 600 }}>Funciona em qualquer dispositivo</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }} className="testimonials-grid-responsive">
            <div className="glass-card" style={{ padding: '2.5rem', position: 'relative' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '150px' }}>
                  <h4 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem', margin: 0 }}>Amanda Melo</h4>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>Dona da Amanda Store - Semijoias</p>
                </div>
                <div style={{ display: 'flex', color: '#f59e0b', gap: '2px' }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#f59e0b" stroke="none" />)}
                </div>
              </div>
              <p style={{ color: '#475569', fontStyle: 'italic', lineHeight: 1.6, margin: 0, fontSize: '0.95rem' }}>
                "Antes de conhecer a CriarLojas eu vendia pelo direct do Instagram e era um caos. Perdia metade das vendas calculando frete e enviando chave PIX. Agora os clientes compram sozinhos na minha loja e eu só envio o produto. Setup assistido salvou minha vida!"
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2.5rem', position: 'relative' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '150px' }}>
                  <h4 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem', margin: 0 }}>Júlio Santos</h4>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>Fundador da Piston Autopeças</p>
                </div>
                <div style={{ display: 'flex', color: '#f59e0b', gap: '2px' }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#f59e0b" stroke="none" />)}
                </div>
              </div>
              <p style={{ color: '#475569', fontStyle: 'italic', lineHeight: 1.6, margin: 0, fontSize: '0.95rem' }}>
                "Estava com medo de criar a loja porque não entendo nada de códigos e servidores. O pessoal da CriarLojas fez toda a montagem visual, me entregou em menos de 1 hora e o suporte pelo WhatsApp responde na hora. Meus clientes adoram a rapidez da loja!"
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2.5rem', position: 'relative' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '150px' }}>
                  <h4 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem', margin: 0 }}>Camila Vieira</h4>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>Proprietária da Cacau Gourmet</p>
                </div>
                <div style={{ display: 'flex', color: '#f59e0b', gap: '2px' }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#f59e0b" stroke="none" />)}
                </div>
              </div>
              <p style={{ color: '#475569', fontStyle: 'italic', lineHeight: 1.6, margin: 0, fontSize: '0.95rem' }}>
                "Minha confeitaria artesanal decolou! Os clientes adoram a facilidade de ver os doces e fechar o pedido direto no Pix. O suporte técnico pelo WhatsApp sempre me responde muito rápido e resolve tudo. Vale cada centavo investido!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" style={{ padding: '4rem 0', background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '2.8rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem 0', letterSpacing: '-0.5px', lineHeight: 1.2 }}>Dúvidas Frequentes</h2>
            <p style={{ color: '#475569', fontSize: '1.1rem' }}>Tudo o que você precisa saber para começar a vender online hoje.</p>
          </div>

          <div style={{ display: 'grid', gap: '1.25rem' }}>
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index
              return (
                <div 
                  key={index} 
                  style={{ 
                    background: '#ffffff', 
                    border: isOpen ? '1px solid #10b981' : '1px solid #cbd5e1', 
                    borderRadius: '16px', 
                    overflow: 'hidden', 
                    transition: 'all 0.3s' 
                  }}
                >
                  <button 
                    className="faq-title-btn"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    style={{ width: '100%', padding: '1.75rem 2rem', background: 'transparent', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', textAlign: 'left', color: '#0f172a', fontWeight: 800, fontSize: '1.1rem' }}
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={20} color="#10b981" /> : <ChevronDown size={20} color="#94a3b8" />}
                  </button>

                  {isOpen && (
                    <div className="faq-body-text" style={{ padding: '0 2rem 2.0rem 2rem', color: '#475569', fontSize: '1rem', lineHeight: 1.6, borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: '4rem 0', background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.06) 0%, #f8fafc 80%)', overflow: 'hidden' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem', textAlign: 'center', position: 'relative', zIndex: 10 }}>
          <h2 style={{ fontSize: '2.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem', lineHeight: 1.2, letterSpacing: '-0.5px' }}>
            Comece hoje. <br />
            Sua loja pronta para vender.
          </h2>

          <p style={{ color: '#475569', fontSize: '1.25rem', maxWidth: '650px', margin: '0 auto 3.5rem', lineHeight: 1.6 }}>
            Pare de adiar o crescimento do seu negócio. Escolha o seu nicho e tenha sua vitrine virtual profissional ativa e configurada em poucos minutos.
          </p>

          <button 
            onClick={() => handleOpenLeadModal('fashion', 'pro')}
            className="btn-premium-green"
            style={{ padding: '1.35rem 4rem', borderRadius: '12px', fontSize: '1.2rem', fontWeight: 800, border: 'none', cursor: 'pointer' }}
          >
            Criar Minha Loja
          </button>
        </div>
      </section>

      {/* MODAL DE SOLICITAÇÃO (LEAD FORM / AUTOPROVISIONAMENTO) */}
      {showLeadModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-card lead-modal-card" style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '24px', width: '95vw', maxWidth: '1100px', padding: '3.5rem', position: 'relative', maxHeight: '92vh', overflowY: 'auto' }}>
            <button onClick={() => setShowLeadModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}>
              <X size={20} />
            </button>

            {leadSubmitted ? (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#e6fcf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', margin: '0 auto 2rem', border: '1px solid #10b981' }}>
                  <CheckCircle size={45} />
                </div>
                <h3 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '1rem' }}>Sua Loja Está Pronta! 🎉</h3>
                <p style={{ color: '#475569', fontSize: '1.15rem', marginBottom: '3rem', lineHeight: 1.6, maxWidth: '750px', margin: '0 auto' }}>
                  A loja virtual <strong>"{leadData.storeName}"</strong> foi criada e ativada com sucesso no <strong>{getPlanName(leadData.selectedPlan)}</strong>!
                </p>

                <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '2rem', maxWidth: '650px', margin: '0 auto 3rem', textAlign: 'left', display: 'grid', gap: '1rem' }}>
                  <div>
                    <strong style={{ color: '#0f172a' }}>🌐 Link de Acesso da sua Loja:</strong>
                    <div style={{ marginTop: '0.25rem' }}>
                      <a href={`http://${leadData.subdomain.toLowerCase().replace(/[^a-z0-9]/g, '')}${domainSuffix}`} target="_blank" rel="noopener noreferrer" style={{ color: '#10b981', fontWeight: 800, fontSize: '1.1rem', wordBreak: 'break-all' }}>
                        http://{leadData.subdomain.toLowerCase().replace(/[^a-z0-9]/g, '')}{domainSuffix}
                      </a>
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                    <strong style={{ color: '#0f172a' }}>🔑 Acesso ao Painel Administrativo:</strong>
                    <div style={{ marginTop: '0.25rem' }}>
                      <a href={`http://${leadData.subdomain.toLowerCase().replace(/[^a-z0-9]/g, '')}${domainSuffix}/admin/login`} target="_blank" rel="noopener noreferrer" style={{ color: '#0ea5e9', fontWeight: 800, fontSize: '1.1rem', wordBreak: 'break-all' }}>
                        http://{leadData.subdomain.toLowerCase().replace(/[^a-z0-9]/g, '')}{domainSuffix}/admin/login
                      </a>
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="modal-grid-responsive">
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 700, display: 'block' }}>E-MAIL DE ACESSO:</span>
                      <strong style={{ color: '#0f172a', fontSize: '1rem' }}>{leadData.email}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 700, display: 'block' }}>SENHA CADASTRADA:</span>
                      <strong style={{ color: '#0f172a', fontSize: '1rem' }}>{leadData.password}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '1rem', maxWidth: '450px', margin: '0 auto' }}>
                  <a 
                    href={`http://${leadData.subdomain.toLowerCase().replace(/[^a-z0-9]/g, '')}${domainSuffix}/admin/login`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ padding: '1.25rem', background: '#10b981', color: 'white', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 800, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 8px 24px rgba(16, 185, 129, 0.2)' }}
                  >
                    <ArrowRight size={20} />
                    <span>Acessar Painel do Lojista</span>
                  </a>

                  <button 
                    onClick={() => setShowLeadModal(false)}
                    className="btn-premium-outline"
                    style={{ padding: '1.1rem', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}
                  >
                    Fechar e Voltar ao Site
                  </button>
                </div>
              </div>
            ) : checkoutPending ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <h3 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginBottom: '1rem' }}>Checkout da Assinatura</h3>
                <p style={{ color: '#475569', fontSize: '1.1rem', marginBottom: '2.5rem' }}>
                  Você selecionou o <strong>{getPlanName(leadData.selectedPlan)}</strong>. Para ativar todos os recursos da sua loja, realize o pagamento simulado da mensalidade abaixo:
                </p>

                <div className="glass-card" style={{ maxWidth: '500px', margin: '0 auto 2.5rem', padding: '2rem', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#475569' }}>Valor da Assinatura:</span>
                  <span style={{ fontSize: '2.8rem', fontWeight: 950, color: '#10b981', lineHeight: 1 }}>
                    R$ {getPlanPrice(leadData.selectedPlan).toFixed(2).replace('.', ',')} <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 600 }}>/mês</span>
                  </span>

                  <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=00020101021226770014br.gov.bcb.pix2555financeiro@criarlojas.com.br52040000530398654050${getPlanPrice(leadData.selectedPlan).toFixed(2)}5802BR5910CriarLojas6009SaoPaulo62070503***6304`} 
                      alt="PIX QR Code" 
                      style={{ width: '180px', height: '180px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                    <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textAlign: 'center' }}>
                      Escaneie o QR Code acima com o app do seu banco ou use a chave PIX:
                    </div>
                    <code style={{ background: '#e2e8f0', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 700, color: '#334155', wordBreak: 'break-all', display: 'block', width: '100%', textAlign: 'center' }}>
                      financeiro@criarlojas.com.br
                    </code>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button 
                    onClick={() => setCheckoutPending(false)}
                    className="btn-premium-outline"
                    style={{ padding: '1rem 2rem', borderRadius: '12px', fontWeight: 700, fontSize: '1.05rem', cursor: 'pointer' }}
                  >
                    Voltar e Alterar Plano
                  </button>
                  <button 
                    onClick={() => createAndProvisionStore(leadData.subdomain.toLowerCase().replace(/[^a-z0-9]/g, ''), leadData.selectedPlan)}
                    disabled={isSubmittingLead}
                    className="btn-premium-green"
                    style={{ padding: '1rem 3rem', borderRadius: '12px', fontWeight: 800, fontSize: '1.05rem', border: 'none', cursor: 'pointer' }}
                  >
                    {isSubmittingLead ? 'Ativando...' : 'Confirmar Pagamento Simulado ✓'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="modal-header-responsive" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <Store size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0, color: '#0f172a' }}>Monte Sua Loja Virtual</h3>
                    <p style={{ color: '#475569', fontSize: '1rem', margin: '0.25rem 0 0 0' }}>Preencha os dados e receba seu negócio pronto para vender.</p>
                  </div>
                </div>

                <form onSubmit={handleLeadSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }} className="modal-grid-responsive">
                    {/* Coluna 1 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Nome do seu Negócio / Loja</label>
                        <input 
                          type="text" 
                          value={leadData.storeName}
                          onChange={e => setLeadData({...leadData, storeName: e.target.value})}
                          placeholder="Ex: Boutique da Lu"
                          style={{ width: '100%', padding: '1rem 1.25rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', color: '#0f172a', outline: 'none', fontSize: '1rem' }}
                          required
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Endereço da Loja Desejado (Subdomínio)</label>
                        <div className="subdomain-input-wrapper" style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', overflow: 'hidden' }}>
                          <input 
                            type="text" 
                            value={leadData.subdomain}
                            onChange={e => setLeadData({...leadData, subdomain: e.target.value})}
                            placeholder="boutiquedalu"
                            style={{ flex: 1, padding: '1rem 1.25rem', background: 'transparent', border: 'none', color: '#0f172a', outline: 'none', fontSize: '1rem' }}
                            required
                          />
                          <span className="subdomain-suffix" style={{ background: '#f1f5f9', padding: '1rem 1.25rem', borderLeft: '1px solid #cbd5e1', color: '#0ea5e9', fontWeight: 800 }}>
                            {domainSuffix}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Modelo de Loja / Segmento</label>
                        <select 
                          value={leadData.selectedModel}
                          onChange={e => setLeadData({...leadData, selectedModel: e.target.value})}
                          style={{ width: '100%', padding: '1rem 1.25rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', color: '#0f172a', outline: 'none', fontSize: '1rem', cursor: 'pointer', fontWeight: 600 }}
                        >
                          {demoStores.map(store => (
                            <option key={store.id} value={store.id}>{store.name} ({store.niche})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#475569', marginBottom: '0.75rem' }}>Escolha a cor principal da sua marca</label>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                          {colorPresets.map(preset => (
                            <button
                              key={preset.hex}
                              type="button"
                              onClick={() => setLeadData({...leadData, primaryColor: preset.hex})}
                              style={{ 
                                width: '32px', 
                                height: '32px', 
                                borderRadius: '50%', 
                                background: preset.hex, 
                                border: leadData.primaryColor === preset.hex ? '3px solid #0f172a' : '1px solid #cbd5e1',
                                cursor: 'pointer',
                                transition: 'transform 0.2s'
                              }}
                              title={preset.name}
                            />
                          ))}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                          <span style={{ fontSize: '0.9rem', color: '#475569' }}>Cor Customizada:</span>
                          <input 
                            type="color" 
                            value={leadData.primaryColor} 
                            onChange={e => setLeadData({...leadData, primaryColor: e.target.value})}
                            style={{ border: 'none', background: 'transparent', width: '32px', height: '32px', cursor: 'pointer' }}
                          />
                          <span style={{ fontFamily: 'monospace', color: '#10b981', fontWeight: 700 }}>{leadData.primaryColor}</span>
                        </div>
                      </div>
                    </div>

                    {/* Coluna 2 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Seu Nome Completo</label>
                        <input 
                          type="text" 
                          value={leadData.name}
                          onChange={e => setLeadData({...leadData, name: e.target.value})}
                          placeholder="Ex: Luciana Melo"
                          style={{ width: '100%', padding: '1rem 1.25rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', color: '#0f172a', outline: 'none', fontSize: '1rem' }}
                          required
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="modal-grid-responsive">
                        <div>
                          <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>WhatsApp</label>
                          <input 
                            type="text" 
                            value={leadData.whatsapp}
                            onChange={e => setLeadData({...leadData, whatsapp: e.target.value})}
                            placeholder="(11) 99999-8888"
                            style={{ width: '100%', padding: '1rem 1.25rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', color: '#0f172a', outline: 'none', fontSize: '1rem' }}
                            required
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>E-mail</label>
                          <input 
                            type="email" 
                            value={leadData.email}
                            onChange={e => setLeadData({...leadData, email: e.target.value})}
                            placeholder="lu@exemplo.com"
                            style={{ width: '100%', padding: '1rem 1.25rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', color: '#0f172a', outline: 'none', fontSize: '1rem' }}
                            required
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }} className="modal-grid-responsive">
                        <div>
                          <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Senha de Acesso ao Painel</label>
                          <input 
                            type="password" 
                            value={leadData.password}
                            onChange={e => setLeadData({...leadData, password: e.target.value})}
                            placeholder="Defina sua senha"
                            style={{ width: '100%', padding: '1rem 1.25rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', color: '#0f172a', outline: 'none', fontSize: '1rem', fontWeight: 600 }}
                            required
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Escolha o seu Plano</label>
                          <select 
                            value={leadData.selectedPlan}
                            onChange={e => setLeadData({...leadData, selectedPlan: e.target.value})}
                            style={{ width: '100%', padding: '1rem 1.25rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', color: '#0f172a', outline: 'none', fontSize: '1rem', cursor: 'pointer', fontWeight: 600 }}
                          >
                            <option value="free">Plano Gratuito (R$ 0,00)</option>
                            <option value="basic">Plano Básico (R$ 29,90/mês)</option>
                            <option value="pro">Plano Profissional (R$ 34,90/mês)</option>
                            <option value="premium">Premium VIP (R$ 47,90/mês)</option>
                          </select>
                        </div>
                      </div>

                    </div>
                  </div>

                  <div className="modal-footer-buttons" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '2rem', marginTop: '2.5rem' }}>
                    <button 
                      type="button" 
                      onClick={() => setShowLeadModal(false)}
                      className="btn-premium-outline"
                      style={{ padding: '0.85rem 2rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      disabled={isSubmittingLead}
                      className="btn-premium-green"
                      style={{ padding: '0.85rem 3rem', borderRadius: '10px', fontWeight: 800, fontSize: '0.95rem', border: 'none', cursor: 'pointer' }}
                    >
                      {isSubmittingLead ? 'Preparando...' : 'Confirmar e Criar Loja 🚀'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE SOLICITAÇÃO DE REGISTRO E CONFIGURAÇÃO DE DOMÍNIO */}
      {showDomainModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-card domain-modal-card" style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '24px', width: '95vw', maxWidth: '680px', padding: '3rem', position: 'relative', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
            
            {/* Botão de Fechar */}
            <button onClick={() => setShowDomainModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}>
              <X size={20} />
            </button>

            {/* Cabeçalho */}
            <div className="modal-header-responsive" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                <Globe size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0, color: '#0f172a', letterSpacing: '-0.5px' }}>Registro & Configuração de Domínio</h3>
                <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0.25rem 0 0 0', fontWeight: 500 }}>Garanta seu endereço próprio na web sem complicações técnicas.</p>
              </div>
            </div>

            {/* Formulário */}
            <form onSubmit={handleDomainSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Campo Domínio Desejado com botão Verificar */}
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800, color: '#334155', marginBottom: '0.5rem' }}>Domínio Desejado</label>
                <div className="domain-input-row" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '0 1rem' }}>
                    <Globe size={18} color="#64748b" style={{ marginRight: '0.75rem' }} />
                    <input 
                      type="text" 
                      value={domainData.desiredDomain}
                      onChange={e => setDomainData({...domainData, desiredDomain: e.target.value})}
                      placeholder="Ex: minhamarca.com.br"
                      style={{ flex: 1, padding: '1rem 0', background: 'transparent', border: 'none', color: '#0f172a', outline: 'none', fontSize: '1rem', fontWeight: 500 }}
                      required
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={handleVerifyDomain}
                    disabled={isCheckingDomain}
                    style={{ padding: '1rem 2rem', background: '#e0f2fe', color: '#0ea5e9', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', transition: '0.2s', height: '54px', minWidth: '110px' }}
                  >
                    {isCheckingDomain ? 'Verificando...' : 'Verificar'}
                  </button>
                </div>
              </div>

              {/* Seu Nome Completo */}
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800, color: '#334155', marginBottom: '0.5rem' }}>Seu Nome Completo</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '0 1rem' }}>
                  <User size={18} color="#64748b" style={{ marginRight: '0.75rem' }} />
                  <input 
                    type="text" 
                    value={domainData.fullName}
                    onChange={e => setDomainData({...domainData, fullName: e.target.value})}
                    placeholder="Carlos Eduardo Silva"
                    style={{ flex: 1, padding: '1rem 0', background: 'transparent', border: 'none', color: '#0f172a', outline: 'none', fontSize: '1rem', fontWeight: 500 }}
                    required
                  />
                </div>
              </div>

              {/* Duas colunas para WhatsApp e E-mail */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }} className="modal-grid-responsive">
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800, color: '#334155', marginBottom: '0.5rem' }}>WhatsApp (Para envio de valores)</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '0 1rem' }}>
                    <Phone size={18} color="#64748b" style={{ marginRight: '0.75rem' }} />
                    <input 
                      type="text" 
                      value={domainData.whatsapp}
                      onChange={e => setDomainData({...domainData, whatsapp: e.target.value})}
                      placeholder="(11) 99999-8888"
                      style={{ flex: 1, padding: '1rem 0', background: 'transparent', border: 'none', color: '#0f172a', outline: 'none', fontSize: '1rem', fontWeight: 500 }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800, color: '#334155', marginBottom: '0.5rem' }}>E-mail Profissional</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '0 1rem' }}>
                    <Mail size={18} color="#64748b" style={{ marginRight: '0.75rem' }} />
                    <input 
                      type="email" 
                      value={domainData.email}
                      onChange={e => setDomainData({...domainData, email: e.target.value})}
                      placeholder="carlos@empresa.com.br"
                      style={{ flex: 1, padding: '1rem 0', background: 'transparent', border: 'none', color: '#0f172a', outline: 'none', fontSize: '1rem', fontWeight: 500 }}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800, color: '#334155', marginBottom: '0.5rem' }}>Observações (Opcional)</label>
                <textarea 
                  value={domainData.notes}
                  onChange={e => setDomainData({...domainData, notes: e.target.value})}
                  placeholder="Ex: Já possuo o domínio registrado no Registro.br e quero apenas que façam o apontamento."
                  style={{ width: '100%', padding: '1rem 1.25rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', color: '#0f172a', outline: 'none', fontSize: '1rem', minHeight: '100px', resize: 'vertical', fontFamily: 'inherit', fontWeight: 500 }}
                />
              </div>

              {/* Botões de Ação */}
              <div className="modal-footer-buttons" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '2rem', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowDomainModal(false)}
                  className="btn-premium-outline"
                  style={{ padding: '0.85rem 2.5rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmittingDomain}
                  className="btn-premium-green"
                  style={{ padding: '0.85rem 3rem', borderRadius: '12px', fontWeight: 800, fontSize: '0.95rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#0ea5e9', boxShadow: '0 8px 24px rgba(14, 165, 233, 0.2)' }}
                >
                  {isSubmittingDomain ? 'Enviando...' : (
                    <>
                      <Globe size={18} />
                      <span>Enviar Solicitação de Domínio</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WHATSAPP FLOATING BUTTON */}
      <a 
        href={`https://wa.me/${formatWhatsappNumber(platformSettings.whatsappSupport)}?text=${encodeURIComponent('Olá equipe Criar Lojas! Gostaria de tirar dúvidas sobre a criação da minha loja virtual.')}`}
        target="_blank" 
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: '#25D366',
          color: 'white',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 30px rgba(37, 211, 102, 0.4)',
          zIndex: 9999,
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        className="whatsapp-floating-btn"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="white"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.245 3.478 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
      </a>

      {/* SCROLL TO TOP BUTTON */}
      {showScrollTop && (
        <button 
          className="icon-btn"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            position: 'fixed',
            bottom: '6.5rem',
            right: '2.3rem',
            background: '#10b981',
            color: 'white',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
            zIndex: 9999,
            cursor: 'pointer',
            border: 'none',
            transition: 'all 0.3s'
          }}
          title="Voltar para o Topo"
        >
          <ChevronUp size={24} color="#ffffff" />
        </button>
      )}

      {/* FOOTER */}
      <footer style={{ background: '#0f172a', borderTop: '1px solid #e2e8f0', padding: '6rem 0 3rem 0', color: '#94a3b8' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem', display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr', gap: '4rem' }} className="footer-grid-responsive">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #10b981, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingBag size={20} color="#ffffff" />
              </div>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>CriarLojas</span>
            </div>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '350px', color: '#cbd5e1' }}>
              Nós não vendemos apenas softwares. Entregamos soluções e negócios estruturados prontos para vender pela internet.
            </p>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              © 2026 CriarLojas Inc. Todos os direitos reservados.
            </div>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1.05rem', fontWeight: 800, marginBottom: '1.5rem' }}>Plataforma</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '1rem', fontSize: '0.95rem' }}>
              <li><a href="#comece" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Modelos</a></li>
              <li><a href="#beneficios" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Benefícios</a></li>
              <li><a href="#planos" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Planos</a></li>
              <li><a href="#faq" style={{ color: '#cbd5e1', textDecoration: 'none' }}>FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1.05rem', fontWeight: 800, marginBottom: '1.5rem' }}>Suporte Humano</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '1rem', fontSize: '0.95rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} color="#0ea5e9" />
                <span style={{ color: '#cbd5e1' }}>{platformSettings.supportEmail}</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={16} color="#10b981" />
                <span style={{ color: '#cbd5e1' }}>{platformSettings.whatsappSupport}</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={16} color="#f59e0b" />
                <span style={{ color: '#cbd5e1' }}>{platformSettings.businessHours}</span>
              </li>
            </ul>
          </div>
        </div>
      </footer>

      {/* MOBILE ADAPTATIVE CSS INJECTED */}
      <style>{`
        @media (max-width: 1024px) {
          .hero-grid-responsive {
            grid-template-columns: 1fr !important;
            text-align: center !important;
            gap: 3rem !important;
          }
          .hero-features-responsive {
            justify-content: center !important;
            flex-wrap: wrap !important;
            gap: 1.5rem !important;
          }
          .hero-buttons-responsive {
            justify-content: center !important;
          }
        }
        @media (max-width: 768px) {
          /* Reduzir paddings de todas as seções do site */
          section {
            padding: 4rem 0 !important;
          }
          .hero-section {
            padding: 8rem 0 4rem 0 !important;
          }
          
          /* Ajustar cabeçalho principal e títulos das seções */
          h2 {
            font-size: 1.8rem !important;
            line-height: 1.3 !important;
            margin-bottom: 0.75rem !important;
          }
          
          p {
            font-size: 0.95rem !important;
            line-height: 1.5 !important;
          }

          /* Botões menores e mais cleans */
          button:not(.icon-btn), .btn-premium-green, .btn-premium-outline, a.btn-premium-outline, a.btn-premium-green {
            padding: 0.75rem 1.5rem !important;
            font-size: 0.9rem !important;
            border-radius: 8px !important;
          }

          button.icon-btn {
            padding: 0 !important;
          }

          .hero-title-responsive {
            font-size: 2.1rem !important;
            line-height: 1.2 !important;
          }
          .hero-buttons-responsive button, .hero-buttons-responsive a {
            width: 100% !important;
            justify-content: center !important;
            padding: 0.75rem 1.5rem !important;
            font-size: 0.9rem !important;
          }
          
          /* Diferenciais */
          .stats-grid-responsive {
            grid-template-columns: 1fr 1fr !important;
            gap: 1.5rem !important;
            margin-bottom: 2.5rem !important;
          }
          .stats-grid-responsive .stat-value-display {
            font-size: 1.3rem !important;
          }
          .stats-grid-responsive .stat-desc-text {
            font-size: 0.85rem !important;
          }
          
          /* Depoimentos */
          .testimonials-grid-responsive {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
          .testimonials-grid-responsive .glass-card {
            padding: 1.5rem !important;
          }
          .testimonials-grid-responsive p {
            font-size: 0.85rem !important;
          }

          /* Cards de passos e segmentos */
          .categories-filter-responsive {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 0.5rem !important;
          }
          .categories-filter-responsive button {
            width: 100% !important;
            padding: 0.6rem 0.25rem !important;
            font-size: 0.75rem !important;
            line-height: 1.1 !important;
            white-space: normal !important;
            height: 100% !important;
          }
          .demo-card-buttons {
            grid-template-columns: 1fr !important;
            gap: 0.75rem !important;
          }
          .steps-grid-responsive {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
          .steps-grid-responsive .glass-card {
            padding: 1.5rem !important;
          }
          
          .segment-card-responsive {
            grid-template-columns: 1fr !important;
            padding: 0 !important;
            gap: 1.5rem !important;
          }
          .feature-list-card {
            padding: 1rem !important;
            gap: 0.75rem !important;
          }
          .segment-card-responsive h3 {
            font-size: 1.4rem !important;
          }
          .card-buttons-container {
            flex-direction: column !important;
          }
          
          /* Modal Responsivo */
          .lead-modal-card, .domain-modal-card {
            padding: 1.5rem 1rem !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
          }
          .lead-modal-card input, .lead-modal-card select, .domain-modal-card input, .domain-modal-card select, .domain-modal-card textarea {
            padding: 0.75rem 1rem !important;
            font-size: 0.95rem !important;
          }
          .subdomain-input-wrapper input {
            padding: 0.75rem 0.5rem !important;
            font-size: 0.9rem !important;
          }
          .subdomain-suffix {
            padding: 0.75rem 0.5rem !important;
            font-size: 0.85rem !important;
          }
          .modal-grid-responsive {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
          .domain-input-row {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 0.5rem !important;
          }
          .domain-input-row button {
            width: 100% !important;
            padding: 0.85rem !important;
          }
          .modal-footer-buttons {
            flex-direction: column-reverse !important;
            gap: 0.75rem !important;
          }
          .modal-footer-buttons button, .modal-footer-buttons a {
            width: 100% !important;
            justify-content: center !important;
          }
          .modal-header-responsive {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 0.75rem !important;
          }
          .modal-header-responsive h3 {
            font-size: 1.5rem !important;
          }

          /* IA Grid */
          .ia-grid-responsive {
            grid-template-columns: 1fr !important;
            gap: 1.25rem !important;
          }

          /* FAQs */
          .faq-title-btn {
            font-size: 1rem !important;
            padding: 1.25rem 1.5rem !important;
          }
          .faq-body-text {
            font-size: 0.9rem !important;
            padding: 0 1.5rem 1.5rem 1.5rem !important;
          }

          /* Planos */
          .plans-grid-responsive {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
          .plans-grid-responsive .glass-card {
            padding: 2.2rem 1.25rem !important;
          }
          .plans-grid-responsive h3 {
            font-size: 1.15rem !important;
            margin-bottom: 0.5rem !important;
          }
          .plans-grid-responsive p {
            font-size: 0.82rem !important;
            margin-bottom: 1rem !important;
            min-height: auto !important;
          }
           /* Reduzir tamanho dos preços e listagem no mobile */
          .price-display span:nth-child(2) {
            font-size: 1.7rem !important;
          }
          .plans-grid-responsive .plan-feature-item {
            gap: 0.5rem !important;
            align-items: flex-start !important;
          }
          .plans-grid-responsive .plan-feature-item div {
            width: 14px !important;
            height: 14px !important;
            margin-top: 2px !important;
          }
          .plans-grid-responsive .plan-feature-item div svg {
            width: 9px !important;
            height: 9px !important;
          }
          /* Override general sizing strictly on spans to avoid inheriting tailwind sizes */
          .plan-feature-text, 
          .plans-grid-responsive .plan-feature-text,
          .plans-grid-responsive .plan-feature-item .plan-feature-text {
            font-size: 0.8rem !important;
            line-height: 1.35 !important;
          }
          .popular-badge-responsive {
            font-size: 0.6rem !important;
            padding: 0.2rem 0.6rem !important;
            border-radius: 0 16px 0 10px !important;
            top: 0px !important;
            right: 0px !important;
            width: auto !important;
          }
          .popular-badge-responsive span {
            font-size: 0.6rem !important;
          }
          .popular-badge-responsive svg {
            width: 10px !important;
            height: 10px !important;
          }

          /* Calculadora de Economia no Mobile */
          .calc-container {
            padding: 0 1rem !important;
          }
          .calculator-grid-responsive {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
            padding: 0 !important;
          }
          .calc-result-box {
            padding: 2rem 1.5rem !important;
            border-radius: 20px !important;
          }
          .calc-big-value {
            font-size: 1.8rem !important;
            margin-bottom: 1.5rem !important;
          }
          .calc-huge-value {
            font-size: 1.7rem !important;
          }
          .calc-savings-box {
            padding: 1.25rem !important;
            margin-bottom: 1.75rem !important;
          }
          .calc-sub-grid {
            gap: 1rem !important;
            margin-bottom: 1.75rem !important;
          }
          .calc-medium-value {
            font-size: 1.05rem !important;
          }
          .calc-mini-label {
            font-size: 0.68rem !important;
          }
          .calc-desc {
            font-size: 0.75rem !important;
          }

          /* Modais e Formulários */
          .modal-grid-responsive {
            grid-template-columns: 1fr !important;
            gap: 1.25rem !important;
          }
          .glass-card[style*="width: '95vw'"] {
            padding: 1.5rem !important;
            border-radius: 16px !important;
          }
          
          .footer-grid-responsive {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
            padding: 0 1rem !important;
          }
          .saas-nav-links {
            display: none !important;
          }
          .mobile-menu-toggle-btn {
            display: inline-block !important;
          }
          .desktop-only-btn {
            display: none !important;
          }
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}
