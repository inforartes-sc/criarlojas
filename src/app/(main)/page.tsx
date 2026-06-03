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
  Globe,
  Palette,
  Clock,
  MessageCircle,
  Loader2
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

export default function SaaSCommercialPortal() {
  // Ref e função para o Carrossel Horizontal de Vitrines
  const carouselRef = useRef<HTMLDivElement>(null)
  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const firstCard = carouselRef.current.children[0] as HTMLElement
      if (firstCard) {
        const cardWidth = firstCard.offsetWidth + 40 // 40px de gap (2.5rem)
        const scrollAmount = direction === 'left' ? -cardWidth : cardWidth
        carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
      }
    }
  }

  // Ref e função para o Carrossel Horizontal de Clientes Ativos
  const clientsCarouselRef = useRef<HTMLDivElement>(null)
  const scrollClientsCarousel = (direction: 'left' | 'right') => {
    if (clientsCarouselRef.current) {
      const firstCard = clientsCarouselRef.current.children[0] as HTMLElement
      if (firstCard) {
        const cardWidth = firstCard.offsetWidth + 40 // 40px de gap (2.5rem)
        const scrollAmount = direction === 'left' ? -cardWidth : cardWidth
        clientsCarouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
      }
    }
  }

  // Estado para os clientes ativos / em faturamento
  const [activeClientsList, setActiveClientsList] = useState<any[]>([])

  // Estado para as configurações globais de contato (conectado com o Super Admin)
  const [platformSettings, setPlatformSettings] = useState({
    supportEmail: 'contato@criarlojas.com.br',
    whatsappSupport: '(11) 99999-8888',
    businessHours: 'Seg - Sex, das 9h às 18h'
  })

  useEffect(() => {
    async function fetchPlatformSettings() {
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
            businessHours: s.businessHours || 'Seg - Sex, das 9h às 18h'
          })
          return
        }
      } catch (err) {
        console.error('Erro ao carregar configurações da plataforma do Supabase:', err)
      }

      // Fallback para localStorage/padrões em caso de falha na rede
      try {
        const saved = localStorage.getItem('superadmin_global_settings')
        if (saved) {
          const parsed = JSON.parse(saved)
          setPlatformSettings({
            supportEmail: parsed.supportEmail || 'contato@criarlojas.com.br',
            whatsappSupport: parsed.whatsappSupport || '(11) 99999-8888',
            businessHours: parsed.businessHours || 'Seg - Sex, das 9h às 18h'
          })
        }
      } catch (e) {
        console.error('Erro ao carregar configurações globais do localStorage:', e)
      }
    }

    fetchPlatformSettings()
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Função auxiliar para calcular o contraste ideal do texto (branco ou escuro) com base na cor de fundo
  const getContrastTextColor = (hexColor: string) => {
    const cleanHex = hexColor.replace('#', '')
    const r = parseInt(cleanHex.substring(0, 2), 16) || 0
    const g = parseInt(cleanHex.substring(2, 4), 16) || 0
    const b = parseInt(cleanHex.substring(4, 6), 16) || 0
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000
    return yiq >= 128 ? '#0f172a' : '#ffffff'
  }

  // Formata o número do WhatsApp sem duplicar o DDI 55
  const formatWhatsappNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.startsWith('55') && cleaned.length >= 12) {
      return cleaned
    }
    return '55' + cleaned
  }

  // Estado da categoria selecionada para filtro
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Estado para ciclo de cobrança dos planos (Mensal vs Anual com 20% OFF)
  const [billingCycle, setBillingCycle] = useState<'mensal' | 'anual'>('mensal')

  // Estado para a Calculadora de ROI
  const [monthlyOrders, setMonthlyOrders] = useState(250)
  const [averageTicket, setAverageTicket] = useState(150)

  // Estado para o FAQ
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  // Estado para o Modal de Solicitação / Contratação de Loja
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [leadData, setLeadData] = useState({
    name: '',
    whatsapp: '',
    email: '',
    storeName: '', // Nome da Loja
    subdomain: '', // Subdomínio
    primaryColor: '#10b981', // Cor Padrão (Esmeralda por padrão)
    selectedModel: 'modern', // modern, fashion, tech
    selectedPlan: 'pro',
    notes: '',
    wantsConcierge: false
  })
  const [isSubmittingLead, setIsSubmittingLead] = useState(false)
  const [leadSubmitted, setLeadSubmitted] = useState(false)

  // Função para abrir o modal pré-selecionando modelo ou plano
  const handleOpenLeadModal = (modelKey: string = 'modern', planKey: string = 'pro', concierge: boolean = false) => {
    setLeadData(prev => ({
      ...prev,
      selectedModel: modelKey,
      selectedPlan: planKey,
      wantsConcierge: concierge
    }))
    setLeadSubmitted(false)
    setShowLeadModal(true)
  }

  // Estado para o Modal de Solicitação de Registro de Domínio Próprio
  const [showDomainModal, setShowDomainModal] = useState(false)
  const [domainData, setDomainData] = useState({
    name: '',
    whatsapp: '',
    email: '',
    domainName: '', // ex: minhamarca.com.br
    notes: ''
  })
  const [isSubmittingDomain, setIsSubmittingDomain] = useState(false)
  const [domainSubmitted, setDomainSubmitted] = useState(false)
  const [localChecking, setLocalChecking] = useState(false)
  const [localCheckResult, setLocalCheckResult] = useState<any>(null)

  const handleOpenDomainModal = () => {
    setDomainSubmitted(false)
    setShowDomainModal(true)
  }

  // Paleta de Cores Rápidas para o Seletor de Identidade Visual
  const colorPresets = [
    { name: 'Esmeralda', hex: '#10b981' },
    { name: 'Azul Oceano', hex: '#0ea5e9' },
    { name: 'Violeta / Roxo', hex: '#6366f1' },
    { name: 'Rosa Elegante', hex: '#f43f5e' },
    { name: 'Dourado / Laranja', hex: '#f59e0b' },
    { name: 'Grafite Premium', hex: '#334155' },
  ]

  const defaultPlans = [
    {
      id: 'basic',
      name: 'Plano Básico',
      priceMonthly: 49.00,
      priceAnnual: 39.20, // 20% OFF
      desc: 'Ideal para quem está começando a sua primeira loja virtual com baixo investimento.',
      features: ['Até 50 produtos cadastrados', 'Taxa de transação de 2.0%', 'Suporte via E-mail', 'Certificado SSL Grátis', 'Gateway Mercado Pago', 'Checkout Transparente'],
      popular: false,
      buttonText: 'Contratar Plano Básico'
    },
    {
      id: 'pro',
      name: 'Plano Profissional',
      priceMonthly: 149.00,
      priceAnnual: 119.20, // 20% OFF
      desc: 'Perfeito para lojistas em expansão com alto volume de vendas e tráfego pago.',
      features: ['Até 500 produtos cadastrados', 'Taxa de transação de 1.0%', 'Suporte Prioritário WhatsApp', 'Todos os Gateways de Pagamento', 'Integração de Frete Avançada', 'Recuperação de Carrinho Abandonado', 'Vitrine Personalizada'],
      popular: true,
      buttonText: 'Contratar Plano Pro'
    },
    {
      id: 'premium',
      name: 'Premium Ilimitado',
      priceMonthly: 299.00,
      priceAnnual: 239.20, // 20% OFF
      desc: 'Para redes de lojas, grandes marcas e operações de e-commerce escaláveis.',
      features: ['Produtos e Variações Ilimitadas', 'Taxa de transação ZERO (0%)', 'Suporte VIP 24/7 Dedicado', 'Gerente de Contas Exclusivo', 'Acesso Antecipado a Novas Features', 'Servidor Dedicado de Alta Performance', 'Multi-Lojas e Filiais'],
      popular: false,
      buttonText: 'Contratar Premium VIP'
    }
  ]

  const [plans, setPlans] = useState<any[]>([])
  const [loadingPlans, setLoadingPlans] = useState(true)

  useEffect(() => {
    async function loadPlans() {
      try {
        const { data, error } = await supabase
          .from('stores')
          .select('*')
          .eq('subdomain', 'platform-settings')
          .single()

        if (data && data.settings && data.settings.plans && Array.isArray(data.settings.plans)) {
          const dbPlans = data.settings.plans.map((p: any) => {
            const price = Number(p.price || 0)
            return {
              id: p.id,
              name: p.name,
              priceMonthly: price,
              priceAnnual: Number((price * 0.8).toFixed(2)),
              desc: p.desc || '',
              features: p.features || [],
              popular: p.popular || false,
              buttonText: p.buttonText || `Contratar ${p.name}`
            }
          })
          setPlans(dbPlans)
        } else {
          setPlans(defaultPlans)
        }
      } catch (err) {
        console.error('Erro ao carregar planos da plataforma:', err)
        setPlans(defaultPlans)
      } finally {
        setLoadingPlans(false)
      }
    }
    loadPlans()
  }, [])

  // Vitrines / Lojas Modelo para Demonstração
  const initialDemoStores = [
    {
      id: 'fashion',
      name: 'Naila Shop Mix',
      subdomain: 'teste',
      niche: 'Moda & Acessórios Premium',
      img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80',
      color: '#0ea5e9',
      desc: 'Layout focado em apelo visual, lookbooks e alta conversão para o nicho de moda.'
    },
    {
      id: 'tech',
      name: 'TechStore Prime',
      subdomain: 'tech',
      niche: 'Tecnologia & Eletrônicos',
      img: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80',
      color: '#10b981',
      desc: 'Estrutura moderna com especificações técnicas detalhadas e destaque para gadgets.'
    },
    {
      id: 'modern',
      name: 'Boutique Elegance',
      subdomain: 'moda',
      niche: 'Vestuário & Alta Costura',
      img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80',
      color: '#f43f5e',
      desc: 'Design minimalista e sofisticado, ideal para marcas conceituais e produtos premium.'
    }
  ]

  const [demoStoresList, setDemoStoresList] = useState(initialDemoStores)

  useEffect(() => {
    async function fetchDemoStores() {
      try {
        const { data, error } = await supabase
          .from('stores')
          .select('*')
        
        if (error || !data) return

        // Map database stores by subdomain
        const dbStoresMap = new Map<string, any>()
        data.forEach((store: any) => {
          if (store.subdomain) {
            dbStoresMap.set(store.subdomain, store)
          }
        })

        // Build the demo list
        const demoList: any[] = []

        // First, check the database for any store with is_demo === true and active !== false
        data.forEach((store: any) => {
          const isActive = store.settings?.active !== false
          const isDemoStore = store.settings?.is_demo === true
          if (isActive && isDemoStore) {
            const s = store.settings || {}
            let specialId = store.subdomain || store.id
            if (store.subdomain === 'teste') specialId = 'fashion'
            if (store.subdomain === 'tech') specialId = 'tech'
            if (store.subdomain === 'moda') specialId = 'modern'

            demoList.push({
              id: specialId,
              name: store.name || s.name || store.subdomain || 'Loja Modelo',
              subdomain: store.subdomain || 'demo',
              niche: s.niche || 'Geral / Conceito',
              img: s.hero_image_url || s.logo_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80',
              color: s.primary_color || s.button_color || '#10b981',
              desc: s.description || s.hero_subtitle || 'Loja virtual premium configurada com alta conversão.'
            })
          }
        })

        // For the hardcoded ones, if they are NOT in the database at all, we can include them as fallbacks
        initialDemoStores.forEach(fallback => {
          if (!dbStoresMap.has(fallback.subdomain)) {
            demoList.push(fallback)
          }
        })

        setDemoStoresList(demoList)

        // Filtra as lojas que estão ativas, NÃO SÃO demo / modelo e têm faturamento ativo (billing_enabled === true)
        const fetchedClients = data.filter((store: any) => {
          const isActive = store.settings?.active !== false
          const isDemoStore = store.settings?.is_demo === true
          const hasBilling = store.settings?.billing_enabled === true
          return isActive && !isDemoStore && hasBilling
        })

        const formattedClients = fetchedClients.map((store: any) => {
          const s = store.settings || {}
          return {
            id: store.id,
            name: store.name || s.name || store.subdomain || 'Loja Parceira',
            subdomain: store.subdomain,
            niche: s.niche || 'E-commerce Verificado',
            img: s.hero_image_url || s.logo_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80',
            color: s.primary_color || s.button_color || '#3b82f6',
            desc: s.description || 'Loja virtual em pleno faturamento na plataforma Criar Lojas.',
            ordersCount: 'Em Faturamento 🚀'
          }
        })

        setActiveClientsList(formattedClients)
      } catch (err) {
        console.error('Erro ao buscar lojas modelo:', err)
      }
    }
    fetchDemoStores()
  }, [])

  // Garantir que o carrossel de modelos sempre inicie no slide 0
  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = 0
    }
  }, [demoStoresList])

  // FAQs
  const faqs = [
    {
      q: 'Como faço para ter uma loja na plataforma Criar Lojas?',
      a: 'O processo é focado em consultoria e qualidade. Você escolhe uma de nossas Lojas Modelo (Vitrines), entra em contato com nossa equipe solicitando o modelo desejado, e nosso Admin Master cria sua estrutura e entrega a loja pronta para você. A partir daí, você tem total autonomia para alterar banners, produtos e cores no seu painel exclusivo.'
    },
    {
      q: 'Por que não posso criar a loja sozinho no site?',
      a: 'Para garantir que todo lojista receba uma infraestrutura de banco de dados perfeitamente configurada, com gateways de pagamento ativados e layout de alta conversão sem erros. Nosso setup assistido garante que você comece a vender em pouco tempo com padrão profissional.'
    },
    {
      q: 'Posso conectar meu próprio domínio personalizado?',
      a: 'Sim! Você pode usar nosso subdomínio gratuito (ex: sualoja.suaplataforma.com.br) ou apontar seu próprio domínio próprio (ex: www.sualoja.com.br) diretamente no painel de configurações da sua loja após a entrega.'
    },
    {
      q: 'Quais gateways de pagamento estão disponíveis?',
      a: 'Oferecemos integração nativa com Mercado Pago, Asaas, Stripe e Pagar.me. Você recebe pagamentos via PIX instantâneo, Cartão de Crédito em até 12x e Boleto Bancário com baixa automática.'
    }
  ]

  // Cálculo da Calculadora de ROI
  const totalRevenue = monthlyOrders * averageTicket
  const otherPlatformCost = (totalRevenue * 0.05) + (monthlyOrders * 1)
  const storeproCost = totalRevenue * 0.01
  const monthlySavings = otherPlatformCost - storeproCost
  const annualSavings = monthlySavings * 12

  // Envio do formulário de solicitação (Lead)
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!leadData.name.trim() || !leadData.whatsapp.trim() || !leadData.email.trim() || !leadData.storeName.trim() || !leadData.subdomain.trim()) {
      toast.error('Por favor, preencha todos os campos obrigatórios da solicitação.')
      return
    }

    setIsSubmittingLead(true)
    try {
      const cleanSub = leadData.subdomain.toLowerCase().replace(/[^a-z0-9]/g, '')
      const { error } = await supabase.from('stores').insert({
        name: leadData.storeName.trim(),
        subdomain: `req-${cleanSub}-${Date.now().toString().slice(-6)}`,
        settings: {
          is_pending_request: true,
          name: leadData.storeName.trim(),
          subdomain: cleanSub,
          admin_user: leadData.name.trim(),
          email: leadData.email.trim(),
          whatsapp: leadData.whatsapp.trim(),
          plan: leadData.selectedPlan,
          model: leadData.selectedModel,
          primaryColor: leadData.primaryColor,
          notes: leadData.notes,
          wants_concierge: leadData.wantsConcierge,
          request_date: new Date().toISOString()
        }
      })

      if (error) throw error

      setLeadSubmitted(true)
      toast.success('Solicitação enviada com sucesso ao Admin Master!')
    } catch (err: any) {
      console.error('Erro ao enviar solicitação:', err)
      toast.error('Erro ao enviar solicitação. Tente novamente ou use o WhatsApp.')
    } finally {
      setIsSubmittingLead(false)
    }
  }

  // Monta mensagem completa para WhatsApp direto do Admin
  const getWhatsappLink = () => {
    const cleanSub = leadData.subdomain.toLowerCase().replace(/[^a-z0-9]/g, '')
    const selectedStoreObj = demoStoresList.find(s => s.id === leadData.selectedModel) || { name: leadData.selectedModel }
    const text = `Olá Admin Criar Lojas! Gostaria de solicitar a criação da minha loja virtual com setup assistido.%0A%0A*👤 Responsável:* ${leadData.name}%0A*📱 WhatsApp:* ${leadData.whatsapp}%0A*✉️ E-mail:* ${leadData.email}%0A%0A*🛍️ Nome da Loja:* ${leadData.storeName}%0A*🌐 Subdomínio Desejado:* ${cleanSub}.localhost:3000%0A*🎨 Cor Padrão Escolhida:* ${leadData.primaryColor}%0A%0A*📁 Vitrine Modelo:* ${selectedStoreObj.name} (${leadData.selectedModel})%0A*💎 Plano Escolhido:* ${leadData.selectedPlan}%0A*🛠️ Serviço VIP Concierge:* ${leadData.wantsConcierge ? 'SIM (Quero Setup VIP Chave na Mão)' : 'NÃO (Vou personalizar sozinho)'}%0A%0A*📝 Observações:* ${leadData.notes || 'Nenhuma'}`
    const formattedPhone = formatWhatsappNumber(platformSettings.whatsappSupport)
    return `https://wa.me/${formattedPhone}?text=${text}`
  }

  // Envio do formulário de solicitação de Registro de Domínio
  const handleDomainSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!domainData.name.trim() || !domainData.whatsapp.trim() || !domainData.email.trim() || !domainData.domainName.trim()) {
      toast.error('Por favor, preencha todos os campos obrigatórios para o registro de domínio.')
      return
    }

    setIsSubmittingDomain(true)
    try {
      const cleanDomain = domainData.domainName.toLowerCase().replace(/[^a-z0-9.-]/g, '')
      const { error } = await supabase.from('stores').insert({
        name: `Registro de Domínio: ${cleanDomain}`,
        subdomain: `dom-${Date.now().toString().slice(-6)}`,
        settings: {
          is_domain_request: true,
          is_pending_request: true,
          domain_requested: cleanDomain,
          admin_user: domainData.name.trim(),
          email: domainData.email.trim(),
          whatsapp: domainData.whatsapp.trim(),
          notes: domainData.notes,
          request_date: new Date().toISOString()
        }
      })

      if (error) throw error

      setDomainSubmitted(true)
      toast.success('Solicitação de registro de domínio enviada com sucesso!')
    } catch (err: any) {
      console.error('Erro ao enviar solicitação de domínio:', err)
      toast.error('Erro ao enviar solicitação. Tente novamente ou use o WhatsApp.')
    } finally {
      setIsSubmittingDomain(false)
    }
  }

  const handleCheckDomainCommercial = async () => {
    const domain = domainData.domainName.trim()
    if (!domain) {
      toast.error('Por favor, digite um domínio primeiro.')
      return
    }

    setLocalChecking(true)
    setLocalCheckResult(null)

    try {
      const response = await fetch(`/api/domain/check?domain=${encodeURIComponent(domain)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao consultar domínio.')
      }

      setLocalCheckResult(data)
    } catch (err: any) {
      setLocalCheckResult({ error: err.message || 'Erro ao verificar disponibilidade.' })
    } finally {
      setLocalChecking(false)
    }
  }

  const getDomainWhatsappLink = () => {
    const cleanDomain = domainData.domainName.toLowerCase().replace(/[^a-z0-9.-]/g, '')
    const text = `Olá Admin Criar Lojas! Gostaria de solicitar o registro e configuração do meu domínio próprio.%0A%0A*👤 Lojista / Responsável:* ${domainData.name}%0A*📱 WhatsApp:* ${domainData.whatsapp}%0A*✉️ E-mail:* ${domainData.email}%0A%0A*🌐 Domínio Desejado:* ${cleanDomain}%0A%0A*📝 Observações:* ${domainData.notes || 'Nenhuma'}`
    const formattedPhone = formatWhatsappNumber(platformSettings.whatsappSupport)
    return `https://wa.me/${formattedPhone}?text=${text}`
  }

  return (
    <div style={{ backgroundColor: '#090d16', color: '#f8fafc', minHeight: '100vh', fontFamily: 'var(--font-sans), sans-serif', overflowX: 'hidden' }}>
      {/* NAVBAR PREMIUM */}
      <nav className="saas-navbar" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(9, 13, 22, 0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', padding: '1rem 0' }}>
        <div className="saas-nav-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #10b981, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)' }}>
              <ShoppingBag size={22} color="#ffffff" />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(to right, #10b981, #0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>
              Criar Lojas
            </span>
          </div>

          <div className="saas-nav-links" style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
            <a href="#funcionalidades" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600, transition: 'color 0.2s' }} className="nav-link">Funcionalidades</a>
            <a href="#vitrine" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600, transition: 'color 0.2s' }} className="nav-link">Lojas Modelo</a>
            <a href="#calculadora" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600, transition: 'color 0.2s' }} className="nav-link">Calculadora de ROI</a>
            <a href="#precos" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600, transition: 'color 0.2s' }} className="nav-link">Planos</a>
          </div>

          <div className="saas-nav-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <a href="http://teste.localhost:3000/admin" style={{ color: '#0ea5e9', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 700, padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(14, 165, 233, 0.3)', transition: 'all 0.2s' }} className="login-btn">
              Login do Lojista
            </a>
            <button onClick={() => handleOpenLeadModal('modern', 'pro')} style={{ background: 'linear-gradient(135deg, #10b981, #0ea5e9)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 800, padding: '0.65rem 1.5rem', borderRadius: '10px', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)', transition: 'all 0.2s' }} className="cta-btn">
              Solicitar Minha Loja
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION DE ALTO IMPACTO */}
      <section style={{ padding: '12rem 0 8rem 0', position: 'relative', overflow: 'hidden' }} className="saas-hero-section">
        <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(14, 165, 233, 0.1) 40%, transparent 70%)', zIndex: 1 }} />
        
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 10, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.4rem 1.25rem', borderRadius: '30px', marginBottom: '2rem' }}>
            <Sparkles size={16} color="#10b981" />
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Plataforma Premium com Setup Assistido
            </span>
          </div>

          <h1 className="saas-hero-title" style={{ fontSize: '4.5rem', fontWeight: 900, marginBottom: '1.5rem', lineHeight: 1.1, letterSpacing: '-1px' }}>
            Escolha seu Modelo e Receba sua <br />
            <span style={{ background: 'linear-gradient(to right, #10b981, #0ea5e9, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Loja Virtual Pronta para Vender
            </span>
          </h1>

          <p className="saas-hero-desc" style={{ fontSize: '1.3rem', color: '#94a3b8', maxWidth: '800px', margin: '0 auto 3.5rem', lineHeight: 1.6 }}>
            Chega de quebrar a cabeça configurando sistemas do zero. Escolha uma de nossas vitrines de alta conversão, fale com nosso especialista e receba seu e-commerce completo, veloz e integrado em pouco tempo.
          </p>

          <div className="saas-hero-buttons" style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', alignItems: 'center' }}>
            <button onClick={() => handleOpenLeadModal('modern', 'pro')} style={{ padding: '1.25rem 3rem', background: 'linear-gradient(135deg, #10b981, #0ea5e9)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 800, borderRadius: '12px', boxShadow: '0 8px 25px rgba(16, 185, 129, 0.5)', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', transition: 'all 0.2s' }} className="hero-btn">
              <span>Quero Solicitar Minha Loja</span>
              <ArrowRight size={20} />
            </button>
            
            <a href="#vitrine" style={{ padding: '1.25rem 2.5rem', background: 'rgba(255, 255, 255, 0.05)', color: '#f8fafc', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 700, borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', transition: 'all 0.2s' }} className="demo-btn">
              <Play size={18} color="#0ea5e9" />
              <span>Ver Lojas Modelo</span>
            </a>
          </div>

          <div className="saas-hero-checks" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '3rem', marginTop: '5rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} color="#10b981" />
              <span>Setup assistido pelo Admin Master</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} color="#10b981" />
              <span>Infraestrutura robusta e isolada</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} color="#10b981" />
              <span>Sem taxa de adesão ou surpresas</span>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO DE VITRINES / LOJAS MODELO (CARROSSEL HORIZONTAL) */}
      <section id="vitrine" style={{ padding: '6rem 0', background: 'rgba(255, 255, 255, 0.02)', borderTop: '1px solid rgba(255, 255, 255, 0.05)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.75rem 0', color: '#f8fafc' }}>Explore Nossas Lojas Modelo (Vitrines Prontas)</h2>
              <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '700px', margin: 0 }}>
                Navegue pelos e-commerces conceito criados na plataforma Criar Lojas. Ao solicitar sua loja, nosso Admin clona toda a estrutura visual e técnica para você começar com o pé direito.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button 
                onClick={() => scrollCarousel('left')}
                style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
                onMouseEnter={e => e.currentTarget.style.background = '#10b981'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(15, 23, 42, 0.8)'}
                aria-label="Anterior"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={() => scrollCarousel('right')}
                style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: '#10b981', 
                  border: 'none', 
                  color: '#ffffff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  cursor: 'pointer', 
                  transition: 'all 0.2s', 
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' 
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                aria-label="Próximo"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          {/* BARRA DE FILTRO POR CATEGORIA */}
          <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '2.5rem', scrollbarWidth: 'none', msOverflowStyle: 'none' }} className="no-scrollbar">
            {['all', ...Array.from(new Set(demoStoresList.map(s => s.niche)))].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.6rem 1.5rem',
                  borderRadius: '30px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: selectedCategory === cat ? 'linear-gradient(135deg, #10b981, #0ea5e9)' : 'rgba(255, 255, 255, 0.05)',
                  color: selectedCategory === cat ? '#ffffff' : '#94a3b8',
                  border: selectedCategory === cat ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: selectedCategory === cat ? '0 4px 15px rgba(16, 185, 129, 0.3)' : 'none'
                }}
              >
                {cat === 'all' ? 'Todas as Categorias' : cat}
              </button>
            ))}
          </div>

          <div 
            ref={carouselRef}
            style={{ 
              display: 'flex', 
              gap: '2.5rem', 
              overflowX: 'auto', 
              scrollBehavior: 'smooth', 
              scrollSnapType: 'x mandatory', 
              paddingBottom: '2rem',
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none' 
            }} 
            className="carousel-container no-scrollbar"
          >
            {demoStoresList
              .filter(store => selectedCategory === 'all' || store.niche === selectedCategory)
              .map((store) => (
              <div 
                key={store.id} 
                style={{ 
                  background: 'rgba(15, 23, 42, 0.6)', 
                  borderRadius: '16px', 
                  border: '1px solid rgba(255, 255, 255, 0.08)', 
                  overflow: 'hidden', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between', 
                  transition: 'all 0.3s'
                }} 
                className="demo-card demo-card-slide"
              >
                <div>
                  <div style={{ height: '240px', overflow: 'hidden', position: 'relative' }}>
                    <img src={store.img} alt={store.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} className="demo-img" />
                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: store.color, backdropFilter: 'blur(8px)', padding: '0.35rem 1rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, color: getContrastTextColor(store.color), border: '1px solid rgba(255, 255, 255, 0.3)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)' }}>
                      {store.niche}
                    </div>
                  </div>

                  <div style={{ padding: '2rem 2rem 1rem 2rem' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#f8fafc' }}>{store.name}</h3>
                    <p style={{ color: '#0ea5e9', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>{store.subdomain}.localhost:3000</p>
                    <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>{store.desc}</p>
                  </div>
                </div>

                <div style={{ padding: '0 2rem 2rem 2rem', display: 'grid', gap: '1rem' }}>
                  <div>
                    <a 
                      href={`http://${store.subdomain}.localhost:3000`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ width: '100%', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', color: '#cbd5e1', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 700, borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                      className="btn-admin"
                    >
                      <ExternalLink size={18} />
                      <span>Ver Vitrine</span>
                    </a>
                  </div>

                  <button 
                    onClick={() => handleOpenLeadModal(store.id, 'pro')}
                    style={{ width: '100%', padding: '0.85rem', background: 'linear-gradient(135deg, #10b981, #0ea5e9)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)', transition: 'all 0.2s' }}
                    className="btn-visit"
                  >
                    <Sparkles size={18} />
                    <span>Quero Contratar Este Modelo</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO DE CLIENTES ATIVOS / EM FATURAMENTO (CARROSSEL HORIZONTAL) */}
      <section id="clientes" style={{ padding: '6rem 0', background: 'rgba(15, 23, 42, 0.3)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.3)', padding: '0.35rem 1rem', borderRadius: '20px', marginBottom: '1rem' }}>
                <Sparkles size={14} color="#0ea5e9" />
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '1px' }}>Lojas Reais em Operação</span>
              </div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.75rem 0', color: '#f8fafc' }}>Casos de Sucesso em Faturamento</h2>
              <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '700px', margin: 0 }}>
                Conheça lojistas reais que utilizam a plataforma Criar Lojas diariamente para gerenciar seus estoques, processar pagamentos via Pix e escalar suas vendas com alta performance.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button 
                onClick={() => scrollClientsCarousel('left')}
                style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
                onMouseEnter={e => e.currentTarget.style.background = '#0ea5e9'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(15, 23, 42, 0.8)'}
                aria-label="Anterior"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={() => scrollClientsCarousel('right')}
                style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
                onMouseEnter={e => e.currentTarget.style.background = '#0ea5e9'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(15, 23, 42, 0.8)'}
                aria-label="Próximo"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          <div 
            ref={clientsCarouselRef}
            style={{ 
              display: 'flex', 
              gap: '2.5rem', 
              overflowX: 'auto', 
              scrollBehavior: 'smooth', 
              scrollSnapType: 'x mandatory', 
              paddingBottom: '2rem',
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none' 
            }} 
            className="carousel-container no-scrollbar"
          >
            {activeClientsList.map((store) => (
              <div 
                key={store.id} 
                style={{ 
                  background: 'rgba(15, 23, 42, 0.6)', 
                  borderRadius: '16px', 
                  border: '1px solid rgba(255, 255, 255, 0.08)', 
                  overflow: 'hidden', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between', 
                  transition: 'all 0.3s'
                }} 
                className="demo-card demo-card-slide"
              >
                <div>
                  <div style={{ height: '240px', overflow: 'hidden', position: 'relative' }}>
                    <img src={store.img} alt={store.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} className="demo-img" />
                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: store.color, backdropFilter: 'blur(8px)', padding: '0.35rem 1rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, color: getContrastTextColor(store.color), border: '1px solid rgba(255, 255, 255, 0.3)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)' }}>
                      {store.niche}
                    </div>
                    <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', background: 'rgba(16, 185, 129, 0.9)', backdropFilter: 'blur(8px)', padding: '0.35rem 0.85rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <CheckCircle2 size={14} />
                      <span>{store.ordersCount}</span>
                    </div>
                  </div>

                  <div style={{ padding: '2rem 2rem 1rem 2rem' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#f8fafc' }}>{store.name}</h3>
                    <p style={{ color: '#0ea5e9', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>{store.subdomain}.localhost:3000</p>
                    <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>{store.desc}</p>
                  </div>
                </div>

                <div style={{ padding: '0 2rem 2rem 2rem', display: 'grid', gap: '1rem' }}>
                  <div>
                    <a 
                      href={`http://${store.subdomain}.localhost:3000`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ width: '100%', padding: '0.85rem', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: 'white', textDecoration: 'none', fontSize: '1rem', fontWeight: 800, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(14, 165, 233, 0.3)', transition: 'all 0.2s' }}
                      className="btn-visit"
                    >
                      <ExternalLink size={18} />
                      <span>Acessar Loja do Cliente</span>
                    </a>
                  </div>

                  <button 
                    onClick={() => handleOpenLeadModal(store.id, 'pro')}
                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', color: '#cbd5e1', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                    className="btn-admin"
                  >
                    <Sparkles size={18} />
                    <span>Quero uma Loja Igual a Esta</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FUNCIONALIDADES / PROPOSTA DE VALOR */}
      <section id="funcionalidades" style={{ padding: '8rem 0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 1rem 0', color: '#f8fafc' }}>Por Que Escolher a Plataforma Criar Lojas?</h2>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto' }}>
              Nossa infraestrutura foi desenhada do zero para maximizar suas vendas e simplificar a gestão operacional do seu negócio.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '2.5rem', transition: 'all 0.3s' }} className="feature-card">
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <Rocket size={28} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.75rem 0', color: '#f8fafc' }}>Performance Extrema</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                Lojas otimizadas com pontuação máxima no Google PageSpeed. Carregamento instantâneo que reduz a taxa de rejeição e dispara suas conversões.
              </p>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '2.5rem', transition: 'all 0.3s' }} className="feature-card">
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(14, 165, 233, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9', marginBottom: '1.5rem', border: '1px solid rgba(14, 165, 233, 0.2)' }}>
                <Shield size={28} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.75rem 0', color: '#f8fafc' }}>Isolamento e Segurança RLS</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                Seus dados, clientes e pedidos ficam 100% blindados e isolados através de uma infraestrutura em nuvem dedicada com criptografia de ponta e nível bancário.
              </p>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '2.5rem', transition: 'all 0.3s' }} className="feature-card">
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', marginBottom: '1.5rem', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                <Zap size={28} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.75rem 0', color: '#f8fafc' }}>Checkout Transparente</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                Experiência de pagamento nativa e sem redirecionamentos. Aceite PIX, Boleto e Cartão com as menores taxas do mercado.
              </p>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '2.5rem', transition: 'all 0.3s' }} className="feature-card">
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <Layers size={28} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.75rem 0', color: '#f8fafc' }}>Variações Ilimitadas</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                Cadastre produtos com múltiplas opções de cores, tamanhos, voltagens e especificações de forma simples e intuitiva.
              </p>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '2.5rem', transition: 'all 0.3s' }} className="feature-card">
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <Smartphone size={28} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.75rem 0', color: '#f8fafc' }}>100% Responsivo & Mobile First</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                Mais de 80% das compras ocorrem no celular. Nossas vitrines oferecem uma navegação fluida e perfeita em qualquer dispositivo.
              </p>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '2.5rem', transition: 'all 0.3s' }} className="feature-card">
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(14, 165, 233, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9', marginBottom: '1.5rem', border: '1px solid rgba(14, 165, 233, 0.2)' }}>
                <TrendingUp size={28} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.75rem 0', color: '#f8fafc' }}>Ferramentas de Marketing</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                Cupons de desconto, banners promocionais, contadores de urgência e integração com Pixel do Facebook e Google Analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CALCULADORA DE ROI INTERATIVA */}
      <section id="calculadora" style={{ padding: '8rem 0', background: 'rgba(255, 255, 255, 0.02)', borderTop: '1px solid rgba(255, 255, 255, 0.05)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.3)', padding: '0.4rem 1.25rem', borderRadius: '30px', marginBottom: '1.5rem' }}>
                <DollarSign size={16} color="#0ea5e9" />
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Simule Seus Ganhos Reais
                </span>
              </div>

              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 1.5rem 0', color: '#f8fafc', lineHeight: 1.2 }}>
                Quanto Você Economiza com as <br />
                <span style={{ color: '#10b981' }}>Taxas Ultrabaixas da Criar Lojas?</span>
              </h2>

              <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
                Plataformas tradicionais cobram até 5% de comissão mais tarifas fixas por cada venda realizada. Na Criar Lojas, você tem previsibilidade financeira e margem de lucro maximizada.
              </p>

              <div style={{ display: 'grid', gap: '2rem', background: 'rgba(15, 23, 42, 0.6)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <label style={{ fontWeight: 700, color: '#cbd5e1' }}>Pedidos por Mês:</label>
                    <span style={{ fontWeight: 800, color: '#0ea5e9', fontSize: '1.1rem' }}>{monthlyOrders} pedidos</span>
                  </div>
                  <input 
                    type="range" 
                    min={10} 
                    max={2000} 
                    step={10}
                    value={monthlyOrders}
                    onChange={e => setMonthlyOrders(parseInt(e.target.value))}
                    style={{ width: '100%', accentColor: '#0ea5e9', cursor: 'pointer' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <label style={{ fontWeight: 700, color: '#cbd5e1' }}>Ticket Médio por Pedido:</label>
                    <span style={{ fontWeight: 800, color: '#10b981', fontSize: '1.1rem' }}>R$ {averageTicket.toFixed(2)}</span>
                  </div>
                  <input 
                    type="range" 
                    min={30} 
                    max={1000} 
                    step={10}
                    value={averageTicket}
                    onChange={e => setAverageTicket(parseInt(e.target.value))}
                    style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', padding: '3.5rem', borderRadius: '24px', border: '1px solid rgba(16, 185, 129, 0.3)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, background: '#10b981', color: 'white', padding: '0.5rem 2rem', fontSize: '0.8rem', fontWeight: 800, borderRadius: '0 0 0 20px', textTransform: 'uppercase' }}>
                Economia Comprovada
              </div>

              <div style={{ marginBottom: '2.5rem' }}>
                <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Faturamento Mensal Simulado</span>
                <span className="roi-monthly-value" style={{ fontSize: '2.2rem', fontWeight: 900, color: '#f8fafc' }}>R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem', padding: '1.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '16px' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Taxas Outras Plataformas</span>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ef4444', textDecoration: 'line-through' }}>R$ {otherPlatformCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Taxa Criar Lojas (1%)</span>
                  <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#10b981' }}>R$ {storeproCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '2px solid #10b981', padding: '2rem', borderRadius: '16px', marginBottom: '2.5rem' }}>
                <span style={{ fontSize: '0.95rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Sua Economia Anual Estimada</span>
                <span className="roi-annual-value" style={{ fontSize: '3rem', fontWeight: 900, color: '#10b981', display: 'block', lineHeight: 1.1 }}>
                  R$ {annualSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.5rem', display: 'block' }}>Dinheiro direto no seu bolso para investir em estoque e anúncios!</span>
              </div>

              <button onClick={() => handleOpenLeadModal('modern', 'pro')} style={{ width: '100%', padding: '1.25rem', background: '#10b981', color: 'white', border: 'none', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 800, borderRadius: '12px', display: 'inline-block', boxShadow: '0 8px 20px rgba(16, 185, 129, 0.4)', transition: 'all 0.2s' }} className="calc-btn">
                Solicitar Loja & Garantir Economia
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* PLANOS & PREÇOS */}
      <section id="precos" style={{ padding: '8rem 0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 1rem 0', color: '#f8fafc' }}>Planos Transparentes Para Todos os Tamanhos</h2>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto 2.5rem' }}>
              Escolha o pacote ideal para o momento do seu negócio. Contratação assistida e sem fidelidade.
            </p>

            {/* Seletor Mensal / Anual */}
            <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255, 255, 255, 0.05)', padding: '0.5rem', borderRadius: '30px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <button 
                onClick={() => setBillingCycle('mensal')}
                style={{ padding: '0.65rem 2rem', background: billingCycle === 'mensal' ? 'linear-gradient(135deg, #10b981, #0ea5e9)' : 'transparent', color: billingCycle === 'mensal' ? 'white' : '#94a3b8', border: 'none', borderRadius: '25px', fontWeight: 800, cursor: 'pointer', fontSize: '0.95rem', transition: 'all 0.2s' }}
              >
                Mensal
              </button>
              <button 
                onClick={() => setBillingCycle('anual')}
                style={{ padding: '0.65rem 2rem', background: billingCycle === 'anual' ? 'linear-gradient(135deg, #10b981, #0ea5e9)' : 'transparent', color: billingCycle === 'anual' ? 'white' : '#94a3b8', border: 'none', borderRadius: '25px', fontWeight: 800, cursor: 'pointer', fontSize: '0.95rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <span>Anual</span>
                <span style={{ background: '#ef4444', color: 'white', fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '10px', fontWeight: 900 }}>20% OFF</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem' }}>
            {loadingPlans ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="plan-card-skeleton" style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '24px', padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '520px' }}>
                  <div className="skeleton-line" style={{ width: '60%', height: '24px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px' }} />
                  <div className="skeleton-line" style={{ width: '100%', height: '60px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px' }} />
                  <div className="skeleton-line" style={{ width: '45%', height: '40px', background: 'rgba(255,255,255,0.06)', borderRadius: '8px' }} />
                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1 }}>
                    <div className="skeleton-line" style={{ width: '80%', height: '14px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px' }} />
                    <div className="skeleton-line" style={{ width: '70%', height: '14px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px' }} />
                    <div className="skeleton-line" style={{ width: '90%', height: '14px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px' }} />
                    <div className="skeleton-line" style={{ width: '85%', height: '14px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px' }} />
                  </div>
                  <div className="skeleton-line" style={{ width: '100%', height: '48px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px' }} />
                </div>
              ))
            ) : (
              plans.map((plan) => {
                const price = billingCycle === 'mensal' ? plan.priceMonthly : plan.priceAnnual

                return (
                  <div key={plan.id} style={{ background: 'rgba(15, 23, 42, 0.6)', border: plan.popular ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', padding: '3rem 2.5rem', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.3s, box-shadow 0.3s' }} className="plan-card-portal">
                    {plan.popular && (
                      <div style={{ position: 'absolute', top: 0, right: 0, background: 'linear-gradient(135deg, #10b981, #0ea5e9)', color: 'white', fontSize: '0.75rem', fontWeight: 800, padding: '0.4rem 1.5rem', borderRadius: '0 24px 0 16px', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Star size={14} fill="white" />
                        <span>Mais Escolhido</span>
                      </div>
                    )}

                    <div>
                      <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 1rem 0', color: '#f8fafc' }}>{plan.name}</h3>
                      <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.5 }}>{plan.desc}</p>

                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '2.5rem' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#94a3b8' }}>R$</span>
                        <span style={{ fontSize: '3.5rem', fontWeight: 900, color: '#f8fafc', lineHeight: 1 }}>{price.toFixed(2)}</span>
                        <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 600 }}>/mês</span>
                      </div>

                      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '2rem', marginBottom: '3rem' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#cbd5e1', textTransform: 'uppercase', marginBottom: '1.5rem', letterSpacing: '1px' }}>O que está incluído:</div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '1rem' }}>
                          {plan.features.map((f: any, i: number) => {
                            const isExcluded = typeof f === 'string' && (f.startsWith('[-] ') || f.startsWith('[-]'));
                            const cleanText = typeof f === 'string' ? (isExcluded ? f.replace(/^\[-\]\s*/, '') : f) : '';

                            return (
                              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', color: isExcluded ? '#64748b' : '#e2e8f0', fontWeight: 500, textDecoration: isExcluded ? 'line-through' : 'none', opacity: isExcluded ? 0.75 : 1 }}>
                                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: isExcluded ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isExcluded ? '#ef4444' : '#10b981', flexShrink: 0 }}>
                                  {isExcluded ? <X size={14} /> : <Check size={14} />}
                                </div>
                                <span style={{ lineHeight: 1.3 }}>{cleanText}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleOpenLeadModal('modern', plan.id)}
                      style={{ width: '100%', padding: '1.25rem', background: plan.popular ? 'linear-gradient(135deg, #10b981, #0ea5e9)' : 'rgba(255, 255, 255, 0.05)', color: plan.popular ? 'white' : '#f8fafc', border: plan.popular ? 'none' : '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', fontWeight: 800, fontSize: '1.05rem', cursor: 'pointer', textAlign: 'center', display: 'block', boxShadow: plan.popular ? '0 8px 20px rgba(16, 185, 129, 0.4)' : 'none', transition: 'all 0.2s' }}
                      className="plan-btn"
                    >
                      {plan.buttonText}
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </section>

      {/* SEÇÃO DE SERVIÇO DE PERSONALIZAÇÃO VIP (CONCIERGE) */}
      <section id="concierge" style={{ padding: '8rem 0', background: 'rgba(16, 185, 129, 0.03)', borderTop: '1px solid rgba(16, 185, 129, 0.1)', borderBottom: '1px solid rgba(16, 185, 129, 0.1)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem' }}>
          
          {/* TOPO CENTRALIZADO (TÍTULO E SUBTÍTULO) */}
          <div style={{ textAlign: 'center', maxWidth: '850px', margin: '0 auto 5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.4rem 1.25rem', borderRadius: '30px', marginBottom: '1.5rem' }}>
              <Sparkles size={16} color="#10b981" />
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Serviço Especializado de Implementação
              </span>
            </div>

            <h2 style={{ fontSize: '2.8rem', fontWeight: 800, margin: '0 0 1.5rem 0', color: '#f8fafc', lineHeight: 1.2 }}>
              Não tem tempo? Contrate nosso <br />
              <span style={{ color: '#10b981' }}>Serviço de Personalização VIP (Concierge)</span>
            </h2>

            <p style={{ color: '#94a3b8', fontSize: '1.2rem', margin: 0, lineHeight: 1.6 }}>
              A plataforma Criar Lojas entrega a infraestrutura completa e a vitrine modelo pronta para você mesmo personalizar com suas cores, banners e produtos. Porém, se você deseja economizar tempo e ter uma loja virtual com design de classe mundial feito por nossos especialistas, o serviço de <strong>Concierge VIP</strong> é a escolha perfeita.
            </p>
          </div>

          {/* GRID NO MEIO EM 2 COLUNAS (INFORMAÇÕES DE UM LADO E IMAGEM DO OUTRO) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', marginBottom: '5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1.5rem' }}>O que está incluído no Setup VIP?</h3>
              <p style={{ color: '#cbd5e1', fontSize: '1.05rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
                Nós cuidamos do cadastro inicial de produtos, criação de banners sob medida focados em conversão e configuração completa de frete e meios de pagamento para você receber a loja 100% pronta para vender.
              </p>

              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', flexShrink: 0, marginTop: '0.25rem' }}>
                    <Check size={22} />
                  </div>
                  <div>
                    <div style={{ color: '#10b981', fontWeight: 800, fontSize: '1.15rem', marginBottom: '0.35rem' }}>Setup Chave na Mão</div>
                    <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>Sua loja entregue perfeitamente configurada, com produtos iniciais cadastrados e todos os métodos de pagamento e frete ativados.</p>
                  </div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(14, 165, 233, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9', flexShrink: 0, marginTop: '0.25rem' }}>
                    <Check size={22} />
                  </div>
                  <div>
                    <div style={{ color: '#0ea5e9', fontWeight: 800, fontSize: '1.15rem', marginBottom: '0.35rem' }}>Design Profissional de Alta Conversão</div>
                    <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>Banners conceituais e identidade visual refinada criados por designers com vasta experiência no mercado de e-commerce brasileiro.</p>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)', transform: 'scale(1.2)', zIndex: 1 }} />
              <img 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80" 
                alt="Serviço de Personalização VIP e Concierge" 
                style={{ width: '100%', borderRadius: '24px', border: '1px solid rgba(16, 185, 129, 0.3)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', position: 'relative', zIndex: 2 }}
              />
            </div>
          </div>

          {/* BOTÃO CTA CENTRALIZADO NA PARTE INFERIOR */}
          <div style={{ textAlign: 'center' }}>
            <button 
              onClick={() => handleOpenLeadModal('modern', 'pro', true)} 
              style={{ padding: '1.35rem 3.5rem', background: '#10b981', color: 'white', border: 'none', cursor: 'pointer', fontSize: '1.15rem', fontWeight: 800, borderRadius: '14px', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 8px 30px rgba(16, 185, 129, 0.4)', transition: 'all 0.2s' }}
              className="cta-btn"
            >
              <Sparkles size={24} />
              <span>Solicitar Personalização VIP da Minha Loja</span>
            </button>
          </div>

        </div>
      </section>

      {/* SEÇÃO DE REGISTRO E CONFIGURAÇÃO DE DOMÍNIO PRÓPRIO */}
      <section id="dominio" style={{ padding: '8rem 0', background: 'rgba(14, 165, 233, 0.03)', borderBottom: '1px solid rgba(14, 165, 233, 0.1)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem' }}>
          
          {/* TOPO CENTRALIZADO (TÍTULO E SUBTÍTULO) */}
          <div style={{ textAlign: 'center', maxWidth: '850px', margin: '0 auto 5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.3)', padding: '0.4rem 1.25rem', borderRadius: '30px', marginBottom: '1.5rem' }}>
              <Globe size={16} color="#0ea5e9" />
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Expansão e Autoridade de Marca
              </span>
            </div>

            <h2 style={{ fontSize: '2.8rem', fontWeight: 800, margin: '0 0 1.5rem 0', color: '#f8fafc', lineHeight: 1.2 }}>
              Quer passar mais credibilidade? <br />
              <span style={{ color: '#0ea5e9' }}>Registre seu Domínio Próprio (.com.br)</span>
            </h2>

            <p style={{ color: '#94a3b8', fontSize: '1.2rem', margin: 0, lineHeight: 1.6 }}>
              Você pode começar sua loja utilizando nosso subdomínio gratuito (ex: <em>sualoja.criarlojas.com.br</em>) pelo tempo que quiser. Porém, quando sua marca começar a crescer, ter um endereço próprio como <strong>www.sualoja.com.br</strong> aumenta drasticamente a confiança dos seus clientes e as taxas de conversão.
            </p>
          </div>

          {/* GRID NO MEIO EM 2 COLUNAS (INFORMAÇÕES DE UM LADO E IMAGEM DO OUTRO) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', marginBottom: '5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1.5rem' }}>Por que registrar com a Criar Lojas?</h3>
              <p style={{ color: '#cbd5e1', fontSize: '1.05rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
                Em vez de lidar com configurações complexas de DNS, apontamento CNAME e propagação em servidores externos, deixe nossa equipe de infraestrutura registrar e configurar tudo para você de forma transparente e imediata!
              </p>

              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(14, 165, 233, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9', flexShrink: 0, marginTop: '0.25rem' }}>
                    <Check size={22} />
                  </div>
                  <div>
                    <div style={{ color: '#0ea5e9', fontWeight: 800, fontSize: '1.15rem', marginBottom: '0.35rem' }}>Registro Oficial em Seu Nome</div>
                    <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>Garantimos o registro da sua marca (.com.br ou .com) diretamente nos órgãos oficiais, garantindo que você seja o único titular e proprietário do domínio.</p>
                  </div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', flexShrink: 0, marginTop: '0.25rem' }}>
                    <Check size={22} />
                  </div>
                  <div>
                    <div style={{ color: '#10b981', fontWeight: 800, fontSize: '1.15rem', marginBottom: '0.35rem' }}>Apontamento & SSL Automáticos</div>
                    <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>Configuração de servidores de nomes (DNS), ativação de certificado de segurança (SSL) e otimização de rotas realizadas direto pela nossa equipe.</p>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, rgba(14, 165, 233, 0.2) 0%, transparent 70%)', transform: 'scale(1.2)', zIndex: 1 }} />
              <img 
                src="https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=800&q=80" 
                alt="Registro de Domínio Próprio .com.br" 
                style={{ width: '100%', borderRadius: '24px', border: '1px solid rgba(14, 165, 233, 0.3)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', position: 'relative', zIndex: 2 }}
              />
            </div>
          </div>

          {/* BOTÃO CTA CENTRALIZADO NA PARTE INFERIOR */}
          <div style={{ textAlign: 'center' }}>
            <button 
              onClick={handleOpenDomainModal} 
              style={{ padding: '1.35rem 3.5rem', background: '#0ea5e9', color: 'white', border: 'none', cursor: 'pointer', fontSize: '1.15rem', fontWeight: 800, borderRadius: '14px', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 8px 30px rgba(14, 165, 233, 0.4)', transition: 'all 0.2s' }}
              className="cta-btn-blue"
            >
              <Globe size={24} />
              <span>Solicitar Registro de Domínio Próprio</span>
            </button>
          </div>

        </div>
      </section>

      {/* SEÇÃO DE CHAMADA PARA AÇÃO */}
      <section id="onboarding" style={{ padding: '8rem 0', background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.1) 0%, rgba(9, 13, 22, 1) 70%)', position: 'relative' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem' }}>
          <div className="saas-onboarding-card" style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '24px', padding: '5rem 4rem', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: 'linear-gradient(to right, #10b981, #0ea5e9, #6366f1)' }} />

            <div style={{ width: '72px', height: '72px', borderRadius: '18px', background: 'linear-gradient(135deg, #10b981, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)' }}>
              <MessageSquare size={36} color="white" />
            </div>

            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0 0 1rem 0', color: '#f8fafc', letterSpacing: '-0.5px' }}>
              Pronto Para Ter Sua Loja Virtual Premium?
            </h2>

            <p style={{ color: '#94a3b8', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto 3.5rem', lineHeight: 1.6 }}>
              Nossa equipe de especialistas está pronta para provisionar seu banco de dados, configurar seu gateway de pagamento e entregar a vitrine modelo idêntica à que você escolher.
            </p>

            <div className="saas-onboarding-buttons" style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', alignItems: 'center' }}>
              <button 
                onClick={() => handleOpenLeadModal('modern', 'pro')}
                style={{ padding: '1.35rem 3.5rem', background: 'linear-gradient(135deg, #10b981, #0ea5e9)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '1.15rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 8px 25px rgba(16, 185, 129, 0.5)', transition: 'all 0.2s' }}
                className="cta-btn"
              >
                <span>Falar com Especialista & Solicitar Loja</span>
                <ArrowRight size={22} />
              </button>

              <a 
                href={`https://wa.me/${formatWhatsappNumber(platformSettings.whatsappSupport)}?text=${encodeURIComponent('Olá! Gostaria de entender mais sobre a plataforma Criar Lojas e solicitar a minha loja modelo.')}`}
                target="_blank" 
                rel="noopener noreferrer"
                style={{ padding: '1.35rem 2.5rem', background: 'rgba(255, 255, 255, 0.05)', color: '#cbd5e1', textDecoration: 'none', fontSize: '1.15rem', fontWeight: 700, borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', transition: 'all 0.2s' }}
                className="btn-admin"
              >
                <Phone size={20} color="#10b981" />
                <span>WhatsApp Direto</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ INTERATIVO */}
      <section id="faq" style={{ padding: '8rem 0', background: 'rgba(255, 255, 255, 0.02)', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.4rem 1.25rem', borderRadius: '30px', marginBottom: '1.5rem' }}>
              <HelpCircle size={16} color="#f59e0b" />
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Tire Suas Dúvidas
              </span>
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 1rem 0', color: '#f8fafc' }}>Perguntas Frequentes (FAQ)</h2>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem', margin: 0 }}>Tudo o que você precisa saber sobre a plataforma Criar Lojas antes de começar.</p>
          </div>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index

              return (
                <div key={index} style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', overflow: 'hidden', transition: 'all 0.2s' }}>
                  <button 
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    style={{ width: '100%', padding: '2rem', background: 'transparent', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', textAlign: 'left', color: '#f8fafc', fontWeight: 800, fontSize: '1.15rem' }}
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={22} color="#10b981" /> : <ChevronDown size={22} color="#64748b" />}
                  </button>

                  {isOpen && (
                    <div style={{ padding: '0 2rem 2rem 2rem', color: '#94a3b8', fontSize: '1rem', lineHeight: 1.6, borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1.5rem' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* MODAL DE SOLICITAÇÃO DE LOJA (LEAD FORM 100% DA TELA COM CAMPOS EMPILHADOS E ESPAÇOSOS) */}
      {showLeadModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(9, 13, 22, 0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '24px', width: '95vw', maxWidth: '1400px', padding: '4rem', position: 'relative', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', maxHeight: '92vh', overflowY: 'auto' }}>
            <button onClick={() => setShowLeadModal(false)} style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', cursor: 'pointer', padding: '0.75rem', borderRadius: '50%', display: 'flex', transition: 'all 0.2s' }} className="close-btn">
              <X size={24} />
            </button>

            {leadSubmitted ? (
              <div style={{ textAlign: 'center', padding: '6rem 0', animation: 'fadeIn 0.5s' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', margin: '0 auto 3rem', border: '2px solid #10b981' }}>
                  <CheckCircle2 size={60} />
                </div>
                <h3 style={{ fontSize: '2.8rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1.5rem' }}>Solicitação Recebida com Sucesso! 🎉</h3>
                <p style={{ color: '#94a3b8', fontSize: '1.3rem', marginBottom: '4rem', lineHeight: 1.6, maxWidth: '850px', margin: '0 auto 4rem' }}>
                  Nosso Master Admin já foi notificado no painel para criar a loja <strong>"{leadData.storeName}"</strong> no subdomínio <strong>{leadData.subdomain}.localhost:3000</strong> com a cor padrão escolhida. Em breve, entraremos em contato via WhatsApp para entregar os dados de acesso.
                </p>

                <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '500px', margin: '0 auto' }}>
                  <a 
                    href={getWhatsappLink()} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ padding: '1.5rem', background: '#10b981', color: 'white', textDecoration: 'none', fontSize: '1.15rem', fontWeight: 800, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', boxShadow: '0 8px 30px rgba(16, 185, 129, 0.4)' }}
                  >
                    <Phone size={24} />
                    <span>Enviar também via WhatsApp Direto</span>
                  </a>

                  <button 
                    onClick={() => setShowLeadModal(false)}
                    style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.05)', color: '#cbd5e1', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', fontWeight: 700, cursor: 'pointer', fontSize: '1.1rem' }}
                  >
                    Fechar e Voltar ao Site
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '2rem' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'linear-gradient(135deg, #10b981, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 25px rgba(16, 185, 129, 0.4)' }}>
                    <Store size={32} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '2.2rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>Solicitação de Loja Virtual (Setup Assistido)</h3>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem', margin: '0.35rem 0 0 0' }}>Preencha os dados da sua marca e contato para o Admin Master clonar sua loja com perfeição.</p>
                  </div>
                </div>

                <form onSubmit={handleLeadSubmit}>
                  {/* GRID PRINCIPAL EM 2 COLUNAS DE 100% DE LARGURA (MAX 1400PX) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3.5rem', marginBottom: '3.5rem' }} className="modal-grid">
                    
                    {/* COLUNA DA ESQUERDA: DADOS DA LOJA E ESCOLHAS COMERCIAIS */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                      
                      {/* 1. IDENTIDADE E DOMÍNIO DA LOJA */}
                      <div style={{ background: 'rgba(9, 13, 22, 0.5)', padding: '3rem', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column', gap: '2.25rem' }}>
                        <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1.25rem' }}>
                          <ShoppingBag size={24} color="#10b981" />
                          <span>1. Identidade e Domínio da Loja</span>
                        </h4>

                        <div>
                          <label style={{ display: 'block', fontSize: '1rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.75rem' }}>Nome da Loja Desejada</label>
                          <div style={{ position: 'relative' }}>
                            <Store size={22} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                            <input 
                              type="text" 
                              value={leadData.storeName}
                              onChange={e => setLeadData({...leadData, storeName: e.target.value})}
                              placeholder="Ex: Minha Loja Premium"
                              style={{ width: '100%', padding: '1.15rem 1.5rem 1.15rem 3.75rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', color: '#f8fafc', outline: 'none', fontSize: '1.1rem', fontWeight: 600 }}
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '1rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.75rem' }}>Subdomínio Desejado</label>
                          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                            <Globe size={22} style={{ marginLeft: '1.5rem', color: '#64748b' }} />
                            <input 
                              type="text" 
                              value={leadData.subdomain}
                              onChange={e => setLeadData({...leadData, subdomain: e.target.value})}
                              placeholder="minhaloja"
                              style={{ flex: 1, padding: '1.15rem 0.5rem 1.15rem 0.75rem', background: 'transparent', border: 'none', color: '#f8fafc', outline: 'none', fontSize: '1.1rem', fontWeight: 700 }}
                              required
                            />
                            <span style={{ padding: '1.15rem 1.5rem', background: 'rgba(255, 255, 255, 0.03)', color: '#0ea5e9', fontWeight: 800, borderLeft: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '1.05rem' }}>
                              .localhost:3000
                            </span>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#94a3b8', background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <span style={{ color: '#0ea5e9', fontWeight: 800 }}>💡 Dica:</span>
                            <span>Se você já possui um domínio próprio registrado (ex: www.sualoja.com.br), por favor informe o seu domínio no campo de "Observações" abaixo para realizarmos a configuração.</span>
                          </div>
                        </div>

                        {/* SELETOR DE COR PADRÃO */}
                        <div>
                          <label style={{ display: 'block', fontSize: '1rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '1.25rem' }}>
                            Cor Padrão / Identidade Visual da Loja
                          </label>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
                            {colorPresets.map(preset => (
                              <button
                                key={preset.hex}
                                type="button"
                                onClick={() => setLeadData({...leadData, primaryColor: preset.hex})}
                                style={{ 
                                  padding: '1rem', 
                                  background: leadData.primaryColor === preset.hex ? `${preset.hex}25` : 'rgba(255, 255, 255, 0.03)', 
                                  border: leadData.primaryColor === preset.hex ? `2px solid ${preset.hex}` : '1px solid rgba(255, 255, 255, 0.1)', 
                                  borderRadius: '14px', 
                                  color: '#f8fafc', 
                                  fontWeight: 700, 
                                  fontSize: '1rem', 
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.75rem',
                                  transition: 'all 0.2s'
                                }}
                              >
                                <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: preset.hex, display: 'inline-block', boxShadow: `0 0 12px ${preset.hex}80` }} />
                                <span>{preset.name}</span>
                              </button>
                            ))}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '1rem 1.5rem', borderRadius: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <Palette size={22} color="#94a3b8" />
                              <span style={{ fontSize: '1.05rem', color: '#cbd5e1', fontWeight: 600 }}>Cor Customizada:</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <input 
                                type="color" 
                                value={leadData.primaryColor}
                                onChange={e => setLeadData({...leadData, primaryColor: e.target.value})}
                                style={{ width: '42px', height: '42px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                              />
                              <span style={{ fontFamily: 'monospace', fontSize: '1.1rem', color: '#0ea5e9', fontWeight: 700 }}>{leadData.primaryColor}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 3. ESCOLHAS COMERCIAIS */}
                      <div style={{ background: 'rgba(9, 13, 22, 0.6)', padding: '3rem', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column', gap: '2.25rem' }}>
                        <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1.25rem' }}>
                          <Sparkles size={24} color="#f59e0b" />
                          <span>3. Pacote Comercial & Modelo</span>
                        </h4>

                        <div>
                          <label style={{ display: 'block', fontSize: '1rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.75rem' }}>Vitrine / Modelo Desejado</label>
                          <select 
                            value={leadData.selectedModel}
                            onChange={e => setLeadData({...leadData, selectedModel: e.target.value})}
                            style={{ width: '100%', padding: '1.15rem 1.5rem', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', color: '#f8fafc', outline: 'none', fontSize: '1.05rem', fontWeight: 600, cursor: 'pointer' }}
                          >
                            {demoStoresList.map(store => (
                              <option key={store.id} value={store.id}>
                                {store.name} ({store.niche})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '1rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.75rem' }}>Plano de Interesse</label>
                          <select 
                            value={leadData.selectedPlan}
                            onChange={e => setLeadData({...leadData, selectedPlan: e.target.value})}
                            style={{ width: '100%', padding: '1.15rem 1.5rem', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', color: '#f8fafc', outline: 'none', fontSize: '1.05rem', fontWeight: 600, cursor: 'pointer' }}
                          >
                            {plans.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.name} (R$ {p.priceMonthly || p.price}/mês)
                              </option>
                            ))}
                          </select>
                        </div>

                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1.5rem', borderRadius: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                            <input 
                              type="checkbox" 
                              id="conciergeCheckModal"
                              checked={leadData.wantsConcierge}
                              onChange={e => setLeadData({...leadData, wantsConcierge: e.target.checked})}
                              style={{ width: '22px', height: '22px', accentColor: '#10b981', marginTop: '0.25rem', cursor: 'pointer' }}
                            />
                            <div>
                              <label htmlFor="conciergeCheckModal" style={{ display: 'block', fontSize: '1.05rem', fontWeight: 800, color: '#10b981', cursor: 'pointer', marginBottom: '0.25rem' }}>
                                🛠️ Contratar Serviço de Personalização VIP (Concierge)
                              </label>
                              <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
                                Nossa equipe de especialistas fará toda a personalização de banners, paleta de cores, cadastro inicial de produtos e meios de pagamento para você.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* COLUNA DA DIREITA: DADOS DO RESPONSÁVEL E OBSERVAÇÕES */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                      
                      {/* 2. DADOS DO RESPONSÁVEL (TODOS OS CAMPOS 100% LARGOS E EMPILHADOS) */}
                      <div style={{ background: 'rgba(9, 13, 22, 0.5)', padding: '3rem', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column', gap: '2.25rem' }}>
                        <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1.25rem' }}>
                          <User size={24} color="#0ea5e9" />
                          <span>2. Dados do Responsável / Lojista</span>
                        </h4>

                        <div>
                          <label style={{ display: 'block', fontSize: '1rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.75rem' }}>Seu Nome Completo</label>
                          <div style={{ position: 'relative' }}>
                            <User size={22} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                            <input 
                              type="text" 
                              value={leadData.name}
                              onChange={e => setLeadData({...leadData, name: e.target.value})}
                              placeholder="Carlos Eduardo Silva"
                              style={{ width: '100%', padding: '1.15rem 1.5rem 1.15rem 3.75rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', color: '#f8fafc', outline: 'none', fontSize: '1.1rem', fontWeight: 600 }}
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '1rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.75rem' }}>WhatsApp (Para Entrega da Loja)</label>
                          <div style={{ position: 'relative' }}>
                            <Phone size={22} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                            <input 
                              type="text" 
                              value={leadData.whatsapp}
                              onChange={e => setLeadData({...leadData, whatsapp: e.target.value})}
                              placeholder="(11) 99999-8888"
                              style={{ width: '100%', padding: '1.15rem 1.5rem 1.15rem 3.75rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', color: '#f8fafc', outline: 'none', fontSize: '1.1rem', fontWeight: 600 }}
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '1rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.75rem' }}>E-mail Profissional</label>
                          <div style={{ position: 'relative' }}>
                            <Mail size={22} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                            <input 
                              type="email" 
                              value={leadData.email}
                              onChange={e => setLeadData({...leadData, email: e.target.value})}
                              placeholder="carlos@empresa.com.br"
                              style={{ width: '100%', padding: '1.15rem 1.5rem 1.15rem 3.75rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', color: '#f8fafc', outline: 'none', fontSize: '1.1rem', fontWeight: 600 }}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* OBSERVAÇÕES */}
                      <div style={{ background: 'rgba(9, 13, 22, 0.5)', padding: '3rem', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <label style={{ display: 'block', fontSize: '1rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '1rem' }}>Observações / Algum pedido especial? (Opcional)</label>
                        <textarea 
                          value={leadData.notes}
                          onChange={e => setLeadData({...leadData, notes: e.target.value})}
                          placeholder="Ex: Gostaria de integrar com minha transportadora atual ou habilitar um gateway específico."
                          style={{ width: '100%', flex: 1, minHeight: '140px', padding: '1.25rem 1.5rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', color: '#f8fafc', outline: 'none', fontSize: '1.05rem', resize: 'none' }}
                        />
                      </div>

                    </div>
                  </div>

                  {/* BOTÕES DE AÇÃO DO MODAL */}
                  <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'flex-end', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '2.5rem' }}>
                    <button 
                      type="button" 
                      onClick={() => setShowLeadModal(false)}
                      style={{ padding: '1.15rem 2.5rem', background: 'transparent', color: '#cbd5e1', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', transition: 'all 0.2s' }}
                      className="cancel-btn"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      disabled={isSubmittingLead}
                      style={{ padding: '1.15rem 4rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 800, fontSize: '1.15rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 8px 30px rgba(16, 185, 129, 0.4)', transition: 'all 0.2s' }}
                      className="submit-lead-btn"
                    >
                      {isSubmittingLead ? (
                        <>
                          <div className="animate-spin" style={{ width: '22px', height: '22px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }} />
                          <span>Processando...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={22} />
                          <span>Confirmar Solicitação de Loja</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* RODAPÉ PREMIUM */}
      <footer style={{ background: '#070a12', borderTop: '1px solid rgba(255, 255, 255, 0.08)', padding: '6rem 0 4rem 0', color: '#94a3b8' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem', display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr', gap: '4rem', marginBottom: '6rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #10b981, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingBag size={20} color="#ffffff" />
              </div>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.5px' }}>Criar Lojas</span>
            </div>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '350px' }}>
              A plataforma SaaS de e-commerce definitiva para lojistas e empreendedores que buscam alta conversão e estabilidade com setup assistido.
            </p>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              © 2026 Criar Lojas Inc. Todos os direitos reservados.
            </div>
          </div>

          <div>
            <h4 style={{ color: '#f8fafc', fontSize: '1.05rem', fontWeight: 800, marginBottom: '1.5rem' }}>Produto</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '1rem', fontSize: '0.95rem' }}>
              <li><a href="#funcionalidades" style={{ color: '#94a3b8', textDecoration: 'none' }} className="footer-link">Funcionalidades</a></li>
              <li><a href="#vitrine" style={{ color: '#94a3b8', textDecoration: 'none' }} className="footer-link">Lojas Modelo</a></li>
              <li><a href="#calculadora" style={{ color: '#94a3b8', textDecoration: 'none' }} className="footer-link">Calculadora de ROI</a></li>
              <li><a href="#precos" style={{ color: '#94a3b8', textDecoration: 'none' }} className="footer-link">Planos de Assinatura</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#f8fafc', fontSize: '1.05rem', fontWeight: 800, marginBottom: '1.5rem' }}>Contato Direto</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '1.25rem', fontSize: '0.95rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#94a3b8' }}>
                <Mail size={18} color="#0ea5e9" style={{ flexShrink: 0 }} />
                <span>{platformSettings.supportEmail}</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#94a3b8' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#10b981" viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
                  <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.158-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.089-.088.197-.23.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.13 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                </svg>
                <span>{platformSettings.whatsappSupport}</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#94a3b8' }}>
                <Clock size={18} color="#f59e0b" style={{ flexShrink: 0 }} />
                <span>{platformSettings.businessHours}</span>
              </li>
            </ul>

            <div style={{ marginTop: '2.5rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', padding: '1rem 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
              <Shield size={20} color="#10b981" style={{ flexShrink: 0 }} />
              <span style={{ color: '#10b981', fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.5px' }}>Ambiente 100% Seguro</span>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '3rem', textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
          Infraestrutura robusta em nuvem para criação e gestão de lojas virtuais. Feito com excelência para o mercado de e-commerce brasileiro.
        </div>
      </footer>

      <style>{`
        .nav-link:hover { color: #10b981 !important; }
        .login-btn:hover { background: rgba(14, 165, 233, 0.15); }
        .cta-btn:hover { filter: brightness(1.15); transform: translateY(-1px); }
        .hero-btn:hover { filter: brightness(1.15); transform: translateY(-2px); }
        .demo-btn:hover { background: rgba(255, 255, 255, 0.1); transform: translateY(-2px); }
        .demo-card:hover { transform: translateY(-6px); border-color: rgba(16, 185, 129, 0.3); box-shadow: 0 15px 35px rgba(0,0,0,0.4); }
        .demo-card:hover .demo-img { transform: scale(1.05); }
        .btn-visit:hover { filter: brightness(1.15); transform: scale(1.02); }
        .btn-admin:hover { background: rgba(255, 255, 255, 0.1); }
        .feature-card:hover { transform: translateY(-4px); border-color: rgba(255, 255, 255, 0.2); background: rgba(255, 255, 255, 0.04); }
        .calc-btn:hover { filter: brightness(1.15); transform: translateY(-2px); }
        .plan-card-portal:hover { transform: translateY(-8px); border-color: #10b981; box-shadow: 0 20px 40px rgba(16, 185, 129, 0.2); }
        .plan-btn:hover { filter: brightness(1.15); transform: translateY(-2px); }
        .footer-link:hover { color: #ffffff !important; text-decoration: underline !important; }
        .close-btn:hover { background: rgba(255, 255, 255, 0.1); transform: scale(1.05); }
        .cancel-btn:hover { background: rgba(255, 255, 255, 0.05); border-color: rgba(255, 255, 255, 0.2); }
        .submit-lead-btn:hover { filter: brightness(1.15); transform: translateY(-2px); }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        @media (max-width: 1024px) {
          .modal-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
        }
      `}</style>

      {/* MODAL DE SOLICITAÇÃO DE REGISTRO DE DOMÍNIO PRÓPRIO */}
      {showDomainModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(9, 13, 22, 0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(14, 165, 233, 0.3)', borderRadius: '24px', width: '95vw', maxWidth: '850px', padding: '4rem', position: 'relative', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', maxHeight: '92vh', overflowY: 'auto' }}>
            <button onClick={() => setShowDomainModal(false)} style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', cursor: 'pointer', padding: '0.75rem', borderRadius: '50%', display: 'flex', transition: 'all 0.2s' }} className="close-btn">
              <X size={24} />
            </button>

            {domainSubmitted ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', animation: 'fadeIn 0.5s' }}>
                <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(14, 165, 233, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9', margin: '0 auto 2.5rem', border: '2px solid #0ea5e9' }}>
                  <CheckCircle2 size={50} />
                </div>
                <h3 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1.5rem' }}>Pedido de Domínio Registrado! 🌐</h3>
                <p style={{ color: '#94a3b8', fontSize: '1.15rem', marginBottom: '3rem', lineHeight: 1.6, maxWidth: '650px', margin: '0 auto 3rem' }}>
                  Nossa equipe de infraestrutura já foi notificada para verificar a disponibilidade e registrar o domínio <strong>"{domainData.domainName}"</strong>. Em breve entraremos em contato via WhatsApp para confirmar os valores e a titularidade.
                </p>

                <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '450px', margin: '0 auto' }}>
                  <a 
                    href={getDomainWhatsappLink()} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ padding: '1.35rem', background: '#0ea5e9', color: 'white', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 800, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', boxShadow: '0 8px 25px rgba(14, 165, 233, 0.4)' }}
                  >
                    <Phone size={22} />
                    <span>Acelerar Atendimento via WhatsApp</span>
                  </a>

                  <button 
                    onClick={() => setShowDomainModal(false)}
                    style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.05)', color: '#cbd5e1', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', fontWeight: 700, cursor: 'pointer', fontSize: '1.05rem' }}
                  >
                    Fechar e Voltar ao Site
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '2rem' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 20px rgba(14, 165, 233, 0.4)' }}>
                    <Globe size={28} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>Registro & Configuração de Domínio</h3>
                    <p style={{ color: '#94a3b8', fontSize: '1.05rem', margin: '0.25rem 0 0 0' }}>Garanta seu endereço próprio na web sem complicações técnicas.</p>
                  </div>
                </div>

                <form onSubmit={handleDomainSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '1rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.75rem' }}>Domínio Desejado</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <Globe size={22} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                        <input 
                          type="text" 
                          value={domainData.domainName}
                          onChange={e => {
                            setDomainData({...domainData, domainName: e.target.value})
                            setLocalCheckResult(null)
                          }}
                          placeholder="Ex: minhamarca.com.br"
                          style={{ width: '100%', padding: '1.15rem 1.5rem 1.15rem 3.75rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', color: '#f8fafc', outline: 'none', fontSize: '1.1rem', fontWeight: 600 }}
                          required
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleCheckDomainCommercial}
                        disabled={localChecking}
                        style={{
                          padding: '0 2rem',
                          background: 'rgba(14, 165, 233, 0.15)',
                          border: '1px solid rgba(14, 165, 233, 0.3)',
                          borderRadius: '14px',
                          color: '#0ea5e9',
                          fontWeight: 700,
                          fontSize: '1rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          transition: 'all 0.2s'
                        }}
                      >
                        {localChecking ? <Loader2 className="animate-spin" size={18} /> : 'Verificar'}
                      </button>
                    </div>

                    {localCheckResult && (
                      <div style={{ marginTop: '0.75rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem', animation: 'fadeIn 0.2s' }}>
                        {localCheckResult.error ? (
                          <span style={{ color: '#ef4444', fontWeight: 600 }}>⚠️ {localCheckResult.error}</span>
                        ) : localCheckResult.available ? (
                          <span style={{ color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            🎉 Excelente! O domínio está livre e disponível para registro!
                          </span>
                        ) : (
                          <span style={{ color: '#f43f5e', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            ❌ Este domínio já está registrado por outra pessoa.
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '1rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.75rem' }}>Seu Nome Completo</label>
                    <div style={{ position: 'relative' }}>
                      <User size={22} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                      <input 
                        type="text" 
                        value={domainData.name}
                        onChange={e => setDomainData({...domainData, name: e.target.value})}
                        placeholder="Carlos Eduardo Silva"
                        style={{ width: '100%', padding: '1.15rem 1.5rem 1.15rem 3.75rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', color: '#f8fafc', outline: 'none', fontSize: '1.1rem', fontWeight: 600 }}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '1rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.75rem' }}>WhatsApp (Para envio de valores)</label>
                      <div style={{ position: 'relative' }}>
                        <Phone size={22} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                        <input 
                          type="text" 
                          value={domainData.whatsapp}
                          onChange={e => setDomainData({...domainData, whatsapp: e.target.value})}
                          placeholder="(11) 99999-8888"
                          style={{ width: '100%', padding: '1.15rem 1.5rem 1.15rem 3.75rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', color: '#f8fafc', outline: 'none', fontSize: '1.1rem', fontWeight: 600 }}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '1rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.75rem' }}>E-mail Profissional</label>
                      <div style={{ position: 'relative' }}>
                        <Mail size={22} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                        <input 
                          type="email" 
                          value={domainData.email}
                          onChange={e => setDomainData({...domainData, email: e.target.value})}
                          placeholder="carlos@empresa.com.br"
                          style={{ width: '100%', padding: '1.15rem 1.5rem 1.15rem 3.75rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', color: '#f8fafc', outline: 'none', fontSize: '1.1rem', fontWeight: 600 }}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '1rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.75rem' }}>Observações (Opcional)</label>
                    <textarea 
                      value={domainData.notes}
                      onChange={e => setDomainData({...domainData, notes: e.target.value})}
                      placeholder="Ex: Já possuo o domínio registrado no Registro.br e quero apenas que façam o apontamento."
                      style={{ width: '100%', minHeight: '100px', padding: '1.25rem 1.5rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', color: '#f8fafc', outline: 'none', fontSize: '1.05rem', resize: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'flex-end', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '2rem', marginTop: '1rem' }}>
                    <button 
                      type="button" 
                      onClick={() => setShowDomainModal(false)}
                      style={{ padding: '1.15rem 2.5rem', background: 'transparent', color: '#cbd5e1', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', transition: 'all 0.2s' }}
                      className="cancel-btn"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      disabled={isSubmittingDomain}
                      style={{ padding: '1.15rem 3.5rem', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 800, fontSize: '1.15rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 8px 30px rgba(14, 165, 233, 0.4)', transition: 'all 0.2s' }}
                      className="submit-lead-btn"
                    >
                      {isSubmittingDomain ? (
                        <>
                          <div className="animate-spin" style={{ width: '22px', height: '22px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }} />
                          <span>Processando...</span>
                        </>
                      ) : (
                        <>
                          <Globe size={22} />
                          <span>Enviar Solicitação de Domínio</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* BOTÃO DO WHATSAPP FLUTUANTE (COMERCIAL) */}
      <a 
        href={`https://wa.me/${formatWhatsappNumber(platformSettings.whatsappSupport)}?text=${encodeURIComponent('Olá equipe Criar Lojas! Gostaria de tirar dúvidas sobre a criação da minha loja virtual.')}`}
        target="_blank" 
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          bottom: '6.5rem',
          right: '2rem',
          background: '#25D366',
          color: 'white',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 35px rgba(37, 211, 102, 0.5)',
          zIndex: 9999,
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        className="whatsapp-floating-btn"
        title="Fale Conosco pelo WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="white"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.245 3.478 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
      </a>

      {/* BOTÃO VOLTAR PARA O TOPO */}
      {showScrollTop && (
        <button 
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            background: 'rgba(15, 23, 42, 0.9)',
            color: '#10b981',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            backdropFilter: 'blur(10px)'
          }}
          className="scroll-top-btn"
          title="Voltar para o Topo"
        >
          <ChevronUp size={28} />
        </button>
      )}

      <style>{`
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.25; }
        }
        .skeleton-line {
          animation: skeleton-pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @media (max-width: 768px) {
          .saas-navbar {
            padding: 0.75rem 0 !important;
          }
          .saas-nav-container {
            padding: 0 1rem !important;
          }
          .saas-nav-links {
            display: none !important;
          }
          .saas-nav-actions .login-btn {
            display: none !important;
          }
          .saas-nav-actions .cta-btn {
            padding: 0.5rem 1rem !important;
            font-size: 0.85rem !important;
          }

          .saas-hero-section {
            padding: 8rem 0 4rem 0 !important;
          }
          .saas-hero-title {
            font-size: 2.2rem !important;
            line-height: 1.2 !important;
            margin-bottom: 1rem !important;
          }
          .saas-hero-desc {
            font-size: 1rem !important;
            margin-bottom: 2.5rem !important;
          }
          .saas-hero-buttons {
            flex-direction: column !important;
            gap: 1rem !important;
            padding: 0 1rem !important;
          }
          .saas-hero-buttons button, 
          .saas-hero-buttons a {
            width: 100% !important;
            justify-content: center !important;
            padding: 1rem !important;
            font-size: 1rem !important;
          }
          .saas-hero-checks {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 0.85rem !important;
            margin-top: 3.5rem !important;
            padding: 0 1rem !important;
          }

          #vitrine h2, #clientes h2, #funcionalidades h2, #calculadora h2, #precos h2, #concierge h2, #dominio h2, #faq h2, #onboarding h2 {
            font-size: 1.8rem !important;
            line-height: 1.25 !important;
          }
          #vitrine p, #clientes p, #funcionalidades p, #calculadora p, #precos p, #concierge p, #dominio p, #faq p, #onboarding p {
            font-size: 0.95rem !important;
            line-height: 1.5 !important;
          }

          .demo-card-slide {
            min-width: 290px !important;
            width: 290px !important;
          }

          #funcionalidades div[style*="gridTemplateColumns"],
          #funcionalidades div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
          .feature-card {
            padding: 1.75rem !important;
          }

          #calculadora div[style*="gridTemplateColumns"],
          #calculadora div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          #calculadora div[style*="padding: '3.5rem'"],
          #calculadora div[style*="padding: 3.5rem"] {
            padding: 1.5rem !important;
          }
          #calculadora div[style*="padding: '2rem'"],
          #calculadora div[style*="padding: 2rem"] {
            padding: 1.25rem !important;
          }
          .roi-annual-value {
            font-size: 1.9rem !important;
          }
          .roi-monthly-value {
            font-size: 1.7rem !important;
          }

          #precos div[style*="gridTemplateColumns"],
          #precos div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .plan-card-portal {
            padding: 2rem 1.5rem !important;
          }

          #concierge div[style*="gridTemplateColumns"],
          #concierge div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
          }

          #dominio div[style*="gridTemplateColumns"],
          #dominio div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
          }

          .saas-onboarding-card {
            padding: 2.5rem 1.5rem !important;
          }
          .saas-onboarding-buttons {
            flex-direction: column !important;
            gap: 1rem !important;
          }
          .saas-onboarding-buttons button, 
          .saas-onboarding-buttons a {
            width: 100% !important;
            justify-content: center !important;
            padding: 1rem !important;
            font-size: 1rem !important;
          }

          #faq button {
            padding: 1.25rem !important;
            font-size: 1rem !important;
          }
        }
      `}</style>
    </div>
  )
}

