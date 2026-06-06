'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ArrowRight, Sparkles, Shield, Cpu, Star, MessageSquare, Send, X, Wrench, Menu, ShoppingBag, ShieldCheck, Zap } from 'lucide-react'
import BenefitIcon from '@/components/BenefitIcon'
import StoreHeader from './StoreHeader'
import StoreFooter from './StoreFooter'
import ProductCard from './ProductCard'

interface ServicesStorefrontClientProps {
  store: any
  products: any[]
  categories: any[]
  resolvedSearchParams: any
}

// Sub-component for an animated counter
function AnimatedCounter({ target, suffix = '', duration = 2000 }: { target: number, suffix?: string, duration?: number }) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const elementRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true)
        }
      },
      { threshold: 0.1 }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current)
      }
    }
  }, [hasStarted])

  useEffect(() => {
    if (!hasStarted) return

    let start = 0
    const end = target
    const totalSteps = 60
    const stepTime = duration / totalSteps
    let step = 0

    const timer = setInterval(() => {
      step++
      const progress = step / totalSteps
      // Ease out quad
      const current = end * (progress * (2 - progress))
      
      if (step >= totalSteps) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(current)
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [hasStarted, target, duration])

  const formatCount = () => {
    if (target % 1 === 0) {
      return Math.round(count).toLocaleString('pt-BR')
    }
    return count.toFixed(1).replace('.', ',')
  }

  return (
    <span ref={elementRef} className="stat-number">
      {formatCount()}{suffix}
    </span>
  )
}

export default function ServicesStorefrontClient({
  store,
  products,
  categories,
  resolvedSearchParams
}: ServicesStorefrontClientProps) {
  const settings = store.settings || {}
  const activeCampaign = settings.promotions?.active_campaign || { active: false, title: '', subtitle: '', bg_color: '#ef4444', text_color: '#ffffff', product_ids: [] }
  const campaignProducts = activeCampaign.active && activeCampaign.product_ids?.length > 0
    ? products.filter(p => activeCampaign.product_ids.includes(p.id))
    : []

  const [searchQuery, setSearchQuery] = useState('')
  const [activeService, setActiveService] = useState<any>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showAllProducts, setShowAllProducts] = useState(false)

  // Read category filter from URL
  const urlCategoryFilter = (resolvedSearchParams?.category as string) || ''
  const [selectedCategory, setSelectedCategory] = useState(urlCategoryFilter)

  // Service Lead Form State
  const [leadFormData, setLeadFormData] = useState({
    name: '',
    phone: '',
    email: '',
    urgency: 'medio',
    details: ''
  })

  // Theme settings mapping
  const primaryColor = settings.primary_color || '#0284c7'
  const secondaryColor = settings.secondary_color || primaryColor
  const buttonColor = settings.button_color || '#000000'
  const buttonTextColor = settings.button_text_color || '#ffffff'
  const buttonHoverColor = settings.button_hover_color || '#333333'
  const buttonHoverTextColor = settings.button_hover_text_color || '#ffffff'
  const buttonVariant = settings.button_variant || 'filled'
  const buttonHoverVariant = settings.button_hover_variant || 'filled'
  const salePriceColor = settings.sale_price_color || '#ef4444'
  const normalPriceColor = settings.normal_price_color || '#bbbbbb'
  const defaultPriceColor = settings.default_price_color || '#000000'
  const buttonRadius = settings.button_style === 'pill' ? '100px' : settings.button_style === 'sharp' ? '0px' : '8px'
  const heroStyle = settings.hero_style || 'split'
  const showHeroText = settings.show_hero_text !== undefined ? settings.show_hero_text : true

  const layoutModel = settings.layout_model || 'services'
  const themeMode = settings.theme_mode || 'light'
  const isDark = themeMode === 'dark'
  const heroBgColor = settings.hero_bg_color || (isDark ? '#0a0a0a' : 'transparent')
  const splitBgColor = settings.hero_bg_color && settings.hero_bg_color !== 'transparent' ? settings.hero_bg_color : (isDark ? '#0a0a0a' : '#ffffff')
  const heroTitleColor = settings.hero_title_color || (isDark ? '#ffffff' : '#111111')
  const heroSubtitleColor = settings.hero_subtitle_color || (isDark ? '#cbd5e1' : '#555555')

  // Helper to convert hex to RGBA
  const hexToRgba = (hex: string, alpha: number) => {
    const cleanHex = hex.replace('#', '')
    const r = parseInt(cleanHex.substring(0, 2), 16)
    const g = parseInt(cleanHex.substring(2, 4), 16)
    const b = parseInt(cleanHex.substring(4, 6), 16)
    return `rgba(${isNaN(r) ? 0 : r}, ${isNaN(g) ? 0 : g}, ${isNaN(b) ? 0 : b}, ${alpha})`
  }

  const overlayColor85 = hexToRgba(splitBgColor, 0.85)
  const overlayColor40 = hexToRgba(splitBgColor, 0.40)
  const overlayColor55 = hexToRgba(splitBgColor, 0.55)

  const storeMode = settings.store_mode || 'loja'
  const storeWhatsapp = settings.whatsapp || ''
  const isCatalogo = storeMode === 'catalogo'

  // Scroll reveal animation handler
  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active')
          }
        });
      },
      { threshold: 0.1 }
    )

    revealElements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // Scroll to products section when category is selected via URL
  useEffect(() => {
    if (urlCategoryFilter) {
      setTimeout(() => {
        const el = document.getElementById('produtos')
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 300)
    }
  }, [urlCategoryFilter])

  // Scroll to services section when view query parameter is selected
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const view = searchParams.get('view');
      if (view === 'servicos' || view === 'serviços') {
        setTimeout(() => {
          const el = document.getElementById('services');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      } else if (view === 'sobre' || view === 'about' || view === 'quem-somos') {
        setTimeout(() => {
          const el = document.getElementById('about');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    }
  }, [resolvedSearchParams])

  // Helper to determine if a product is a service
  const isService = (product: any) => product.is_service === true || product.is_service === 'true'

  // Filter products into Services and Physical Products/Parts
  const servicesList = products.filter(p => isService(p))
  const physicalProducts = products.filter(p => !isService(p))

  // Get unique product categories for filter chips
  const productCategories = [...new Set(physicalProducts.map(p => p.category).filter(Boolean))]

  // Apply category + search query filter to physical products
  let filteredProducts = physicalProducts

  if (selectedCategory) {
    filteredProducts = filteredProducts.filter(p => p.category === selectedCategory)
  }

  if (searchQuery) {
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }

  // Handle service lead submission
  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const formattedWhatsapp = storeWhatsapp.replace(/\D/g, '') || '5511999999999'
    const urgencyLabels: Record<string, string> = {
      baixo: 'Planejamento Inicial (Sem pressa)',
      medio: 'Médio Prazo (Próximas semanas)',
      alto: 'Urgente (Imediato)'
    }

    let message = `Olá! Gostaria de solicitar um orçamento para o serviço de *${activeService.name}*:\n\n`
    message += `*Nome:* ${leadFormData.name}\n`
    message += `*Telefone:* ${leadFormData.phone}\n`
    message += `*E-mail:* ${leadFormData.email}\n`
    message += `*Urgência:* ${urgencyLabels[leadFormData.urgency]}\n`
    message += `*Detalhes do Projeto:* ${leadFormData.details ? leadFormData.details : 'Não informado'}\n\n`
    message += `Aguardando retorno para agendar alinhamento técnico!`

    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${formattedWhatsapp}?text=${encodedMessage}`

    window.open(whatsappUrl, '_blank')
    setActiveService(null)
    setLeadFormData({
      name: '',
      phone: '',
      email: '',
      urgency: 'medio',
      details: ''
    })
  }

  // Standard Testimonials List (Tailored dynamically to niche if needed)
  const testimonials = (settings.testimonials?.length > 0 ? settings.testimonials : [
    {
      id: 1,
      name: "Renato Albuquerque",
      role: "Diretor de Operações na VeloTech",
      text: settings.testimonial_1 || "Contratamos a empresa para reformular a climatização e manutenção preventiva da nossa sede corporativa. O resultado foi um aumento visível na produtividade e bem-estar dos colaboradores.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80"
    },
    {
      id: 2,
      name: "Mariana Costa",
      role: "Arquiteta e Designer de Interiores",
      text: settings.testimonial_2 || "Como arquiteta, sou extremamente exigente com a integração estética e a qualidade técnica das instalações de ar condicionado. O acabamento deles é impecável e as soluções ficam super discretas.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"
    },
    {
      id: 3,
      name: "Dr. André Castelo",
      role: "Proprietário Residencial",
      text: settings.testimonial_3 || "A instalação dos aparelhos Split Inverter em minha casa ficou espetacular. O sistema de climatização integrada funciona de forma muito silenciosa e eficiente. Suporte pós-venda nota dez.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80"
    }
  ]).map((t: any, i: number) => ({ ...t, id: t.id || i + 1 }))

  const featuresList: { id: number, icon: string, title: string, desc: string }[] = settings.features || [
    { id: 1, icon: 'Headphones', title: 'Atendimento Especializado', desc: 'Consultores técnicos prontos para analisar o seu projeto do zero ao acabamento.' },
    { id: 3, icon: 'Award', title: 'Garantia de Qualidade', desc: 'Instalação credenciada com manutenção de garantia original dos fabricantes.' },
    { id: 4, icon: 'Heart', title: 'Suporte Personalizado', desc: 'Acompanhamento dedicado pós-venda e atendimento emergencial prioritário.' },
    { id: 5, icon: 'ShieldCheck', title: 'Técnicos Credenciados', desc: 'Profissionais qualificados pelas principais marcas do mercado de climatização.' }
  ]

  const benefits = settings.benefits || [
    { title: 'Entrega Rápida', subtitle: 'Calcule o prazo no checkout' },
    { title: 'Compra Segura', subtitle: 'Ambiente 100% protegido' },
    { title: 'Troca Fácil', subtitle: '7 dias para devolução' },
    { title: 'Pagamento Facilitado', subtitle: 'Em até 12x no cartão' }
  ]

  return (
    <div className="services-template" style={{ 
      backgroundColor: 'var(--bg-dark)',
      color: 'var(--text-primary)',
      minHeight: '100vh',
      fontFamily: 'var(--font-body)'
    }}>
      {/* Dynamic CSS Variables Injection */}
      <style>{`
        .services-template {
          --accent-cyan: ${primaryColor};
          --accent-blue: ${primaryColor};
          --primary-color: ${primaryColor};
          --secondary-color: ${secondaryColor};
          --radius-md: ${settings.button_style === 'pill' ? '16px' : settings.button_style === 'sharp' ? '0px' : '12px'};
          --radius-lg: ${settings.button_style === 'pill' ? '24px' : settings.button_style === 'sharp' ? '0px' : '16px'};
          ${settings.body_bg_color ? `--bg-dark: ${settings.body_bg_color} !important;` : ''}
          ${settings.body_bg_color ? `--bg-glass: ${settings.body_bg_color} !important;` : ''}
          ${settings.card_bg_color ? `--bg-card: ${settings.card_bg_color} !important;` : ''}
          ${settings.card_bg_color ? `--bg-card-hover: ${settings.card_bg_color} !important;` : ''}
          ${!isDark ? `
            --text-primary: #1e293b !important;
            --text-secondary: #475569 !important;
            --text-muted: #64748b !important;
            --border-glass: rgba(0, 0, 0, 0.08) !important;
          ` : ''}
        }
        /* Feature Cards - cores dinâmicas baseadas na paleta do lojista */
        .feature-card.feat-sky {
          background: linear-gradient(135deg, ${hexToRgba(primaryColor, 0.06)} 0%, ${hexToRgba(primaryColor, 0.12)} 50%, ${hexToRgba(secondaryColor, 0.18)} 100%) !important;
          border: 1px solid ${hexToRgba(primaryColor, 0.22)} !important;
          box-shadow: 0 10px 25px ${hexToRgba(primaryColor, 0.07)} !important;
        }
        .feature-card.feat-sky:hover {
          transform: translateY(-6px);
          background: linear-gradient(135deg, ${hexToRgba(primaryColor, 0.12)} 0%, ${hexToRgba(primaryColor, 0.2)} 50%, ${hexToRgba(secondaryColor, 0.28)} 100%) !important;
          border-color: ${hexToRgba(primaryColor, 0.42)} !important;
          box-shadow: 0 20px 40px ${hexToRgba(primaryColor, 0.14)} !important;
        }
        .feature-card.feat-sky .feature-icon-wrapper {
          background: ${hexToRgba(primaryColor, 0.1)} !important;
          color: ${primaryColor} !important;
          border-color: ${hexToRgba(primaryColor, 0.22)} !important;
        }
        /* Testimonial Cards - cores dinâmicas baseadas na paleta do lojista */
        .testimonial-card-v2 {
          background: linear-gradient(135deg, ${hexToRgba(primaryColor, 0.05)} 0%, ${hexToRgba(primaryColor, 0.1)} 50%, ${hexToRgba(secondaryColor, 0.15)} 100%) !important;
          border: 1px solid ${hexToRgba(primaryColor, 0.2)} !important;
          box-shadow: 0 4px 20px ${hexToRgba(primaryColor, 0.04)} !important;
        }
        .testimonial-card-v2::before {
          background: linear-gradient(180deg, ${primaryColor} 0%, ${secondaryColor} 100%) !important;
        }
        .testimonial-card-v2:hover {
          background: linear-gradient(135deg, ${hexToRgba(primaryColor, 0.1)} 0%, ${hexToRgba(primaryColor, 0.18)} 50%, ${hexToRgba(secondaryColor, 0.26)} 100%) !important;
          border-color: ${hexToRgba(primaryColor, 0.4)} !important;
          box-shadow: 0 25px 45px ${hexToRgba(primaryColor, 0.12)} !important;
        }
        .quote-icon-wrapper {
          background: ${hexToRgba(primaryColor, 0.07)} !important;
        }

        .btn-buy-dynamic {
          background-color: ${buttonVariant === 'filled' ? buttonColor : 'transparent'} !important;
          color: ${buttonVariant === 'filled' ? buttonTextColor : buttonColor} !important;
          border: ${buttonVariant === 'outline' ? `2px solid ${buttonColor}` : 'none'} !important;
          border-radius: ${buttonRadius} !important;
          transition: all 0.3s ease !important;
        }
        .btn-buy-dynamic:hover {
          background-color: ${buttonHoverVariant === 'filled' ? buttonHoverColor : 'transparent'} !important;
          color: ${buttonHoverVariant === 'filled' ? buttonHoverTextColor : buttonHoverColor} !important;
          border: ${buttonHoverVariant === 'outline' ? `2px solid ${buttonHoverColor}` : 'none'} !important;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .products-grid-4col {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
        }
        @media (max-width: 1100px) {
          .products-grid-4col { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .products-grid-4col { grid-template-columns: 1fr; }
        }
        .stat-card {
          background-color: ${primaryColor} !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          transition: all 0.3s ease !important;
        }
        .stat-number {
          background: none !important;
          -webkit-background-clip: initial !important;
          -webkit-text-fill-color: initial !important;
          color: #ffffff !important;
        }
        .stat-label {
          color: rgba(255, 255, 255, 0.8) !important;
        }
        .stat-card:hover {
          border-color: rgba(255, 255, 255, 0.25) !important;
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15) !important;
          transform: translateY(-4px) !important;
        }
        .cta-desc {
          color: rgba(255, 255, 255, 0.9) !important;
        }
        .benefits-grid-container {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          padding: 1.5rem 3rem;
          background-color: ${settings.benefits_bg_color || '#f9fafb'} !important;
          border-radius: 16px;
          border: 1px solid #eaeaea;
        }
        @media (max-width: 1024px) {
          .benefits-grid-container {
            grid-template-columns: repeat(2, 1fr);
            padding: 1.5rem 2rem;
          }
        }
        @media (max-width: 640px) {
          .benefits-grid-container {
            grid-template-columns: repeat(2, 1fr);
            padding: 1rem;
            gap: 1rem;
          }
        }
        @media (max-width: 768px) {
          #home {
            grid-template-columns: 1fr !important;
            padding: 5rem 1.5rem !important;
            gap: 2rem !important;
            min-height: auto !important;
          }
          .hero-title {
            font-size: 2.25rem !important;
          }
          .hero-description {
            margin-bottom: 2rem !important;
          }
          .hero-actions {
            flex-direction: column;
            width: 100%;
            gap: 1rem;
          }
          .hero-actions a {
            width: 100%;
            text-align: center;
          }
          .services-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
          .container {
            padding: 0 1.25rem !important;
          }
        }
        .whatsapp-floating-btn:hover {
          transform: scale(1.1) rotate(5deg) !important;
          filter: brightness(1.1);
        }
        @media (max-width: 768px) {
          .cta-buttons {
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
            gap: 1rem !important;
            align-items: center !important;
          }
          .cta-buttons a {
            width: 100% !important;
            max-width: 400px !important;
            text-align: center !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
          }
        }
      `}</style>

      {/* 1. HEADER */}
      <StoreHeader store={store} settings={settings} primaryColor={primaryColor} categories={categories} />

      {/* 2. HERO */}
      {!isCatalogo && (
        heroStyle === 'split' ? (
          <section id="home" style={{ 
            minHeight: '80vh', 
            display: 'grid', 
            gridTemplateColumns: showHeroText ? '1.2fr 0.8fr' : '1fr', 
            alignItems: 'center', 
            backgroundColor: splitBgColor, 
            padding: '4rem 8%',
            gap: '4rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Content side (Left) */}
            {showHeroText && (
              <div style={{ maxWidth: '650px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', margin: '0 auto' }}>
                <div className="hero-badge" style={{ justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <Sparkles size={14} style={{ color: primaryColor }} />
                  <span>{settings.hero_badge || 'Tecnologia & Conforto Térmico'}</span>
                </div>
                <h1 className="hero-title" style={{ color: heroTitleColor, fontSize: '3.5rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '2rem', letterSpacing: '-2px' }}>
                  {settings.hero_title || 'Climatização Inteligente. Alta Performance.'}
                </h1>
                <p className="hero-description" style={{ fontSize: '1.15rem', color: heroSubtitleColor, marginBottom: '3.5rem', lineHeight: 1.6 }}>
                  {settings.hero_subtitle || 'Elevamos a qualidade do seu ar e o conforto dos seus ambientes através de projetos de climatização de ponta e assistência técnica premium.'}
                </p>
                <div className="hero-actions" style={{ justifyContent: 'center' }}>
                  <a href="#services" className="btn btn-primary" style={{ borderRadius: buttonRadius }}>
                    <span>Agendar Serviço</span>
                    <ArrowRight size={18} />
                  </a>
                  {physicalProducts.length > 0 && (
                    <a href="#produtos" className="btn btn-secondary" style={{ borderRadius: buttonRadius }}>
                      <span>Comprar Peças</span>
                    </a>
                  )}
                </div>
              </div>
            )}
            {/* Image Card side (Right) */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '100%', 
              height: '100%' 
            }}>
              <div style={{ 
                width: '100%', 
                height: '55vh',
                backgroundImage: `url(${settings.hero_image_url || '/hero_smart_space.png'})`, 
                backgroundSize: 'cover', 
                backgroundPosition: 'center',
                borderRadius: '24px',
                boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.5)' : '0 20px 40px rgba(0,0,0,0.08)',
                border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.03)'
              }} />
            </div>
          </section>
        ) : heroStyle === 'left-aligned' ? (
          <section id="home" style={{ 
            height: '80vh', 
            display: 'flex', 
            alignItems: 'center', 
            backgroundColor: splitBgColor,
            backgroundImage: `linear-gradient(90deg, ${splitBgColor} 0%, ${splitBgColor} 40%, transparent 100%), url(${settings.hero_image_url || '/hero_smart_space.png'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            padding: '0 8%',
            color: heroTitleColor
          }}>
            {showHeroText && (
              <div style={{ maxWidth: '600px', textAlign: 'left' }}>
                <div className="hero-badge" style={{ marginBottom: '1.5rem', alignSelf: 'flex-start' }}>
                  <Sparkles size={14} style={{ color: primaryColor }} />
                  <span>{settings.hero_badge || 'Tecnologia & Conforto Térmico'}</span>
                </div>
                <h1 className="hero-title" style={{ color: heroTitleColor, fontSize: '3.5rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '2rem', letterSpacing: '-2px' }}>
                  {settings.hero_title || 'Climatização Inteligente. Alta Performance.'}
                </h1>
                <p className="hero-description" style={{ fontSize: '1.15rem', color: heroSubtitleColor, marginBottom: '3.5rem', lineHeight: 1.6 }}>
                  {settings.hero_subtitle || 'Elevamos a qualidade do seu ar e o conforto dos seus ambientes através de projetos de climatização de ponta e assistência técnica premium.'}
                </p>
                <div className="hero-actions" style={{ justifyContent: 'flex-start' }}>
                  <a href="#services" className="btn btn-primary" style={{ borderRadius: buttonRadius }}>
                    <span>Agendar Serviço</span>
                    <ArrowRight size={18} />
                  </a>
                  {physicalProducts.length > 0 && (
                    <a href="#produtos" className="btn btn-secondary" style={{ borderRadius: buttonRadius }}>
                      <span>Comprar Peças</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </section>
        ) : heroStyle === 'minimalist' ? (
          <section id="home" style={{ 
            height: '60vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: splitBgColor,
            padding: '0 5%',
            textAlign: 'center',
            borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #eaeaea'
          }}>
            {showHeroText && (
              <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="hero-badge" style={{ justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <Sparkles size={14} style={{ color: primaryColor }} />
                  <span>{settings.hero_badge || 'Tecnologia & Conforto Térmico'}</span>
                </div>
                <h1 className="hero-title" style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem', color: heroTitleColor, letterSpacing: '-2px' }}>
                  {settings.hero_title || 'Climatização Inteligente. Alta Performance.'}
                </h1>
                <p className="hero-description" style={{ fontSize: '1.2rem', color: heroSubtitleColor, marginBottom: '2.5rem', lineHeight: 1.6, maxWidth: '650px' }}>
                  {settings.hero_subtitle || 'Elevamos a qualidade do seu ar e o conforto dos seus ambientes através de projetos de climatização de ponta e assistência técnica premium.'}
                </p>
                <div className="hero-actions" style={{ justifyContent: 'center' }}>
                  <a href="#services" className="btn btn-primary" style={{ borderRadius: buttonRadius }}>
                    <span>Agendar Serviço</span>
                    <ArrowRight size={18} />
                  </a>
                  {physicalProducts.length > 0 && (
                    <a href="#produtos" className="btn btn-secondary" style={{ borderRadius: buttonRadius }}>
                      <span>Comprar Peças</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </section>
        ) : (
          // Default "full" / full width banner
          <section id="home" style={{ 
            height: '80vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '0 5%', 
            backgroundImage: showHeroText ? `linear-gradient(${overlayColor55}, ${overlayColor55}), url(${settings.hero_image_url || '/hero_smart_space.png'})` : `url(${settings.hero_image_url || '/hero_smart_space.png'})`, 
            backgroundColor: showHeroText ? heroBgColor : 'transparent',
            backgroundSize: 'cover', 
            backgroundPosition: 'center', 
            color: heroTitleColor,
            textAlign: 'center'
          }}>
            {showHeroText && (
              <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="hero-badge" style={{ justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <Sparkles size={14} style={{ color: primaryColor }} />
                  <span>{settings.hero_badge || 'Tecnologia & Conforto Térmico'}</span>
                </div>
                <h1 className="hero-title" style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '2rem', letterSpacing: '-2px', color: heroTitleColor }}>
                  {settings.hero_title || 'Climatização Inteligente. Alta Performance.'}
                </h1>
                <p className="hero-description" style={{ fontSize: '1.25rem', marginBottom: '3.5rem', opacity: 0.95, maxWidth: '700px', margin: '0 auto 3.5rem auto', lineHeight: 1.7, color: heroSubtitleColor }}>
                  {settings.hero_subtitle || 'Elevamos a qualidade do seu ar e o conforto dos seus ambientes através de projetos de climatização de ponta e assistência técnica premium.'}
                </p>
                <div className="hero-actions" style={{ justifyContent: 'center' }}>
                  <a href="#services" className="btn btn-primary" style={{ borderRadius: buttonRadius }}>
                    <span>Agendar Serviço</span>
                    <ArrowRight size={18} />
                  </a>
                  {physicalProducts.length > 0 && (
                    <a href="#produtos" className="btn btn-secondary" style={{ borderRadius: buttonRadius }}>
                      <span>Comprar Peças</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </section>
        )
      )}

      {/* 2.5 BENEFITS */}
      <section style={{ padding: '3rem 0' }}>
        <div className="container">
          <div className="benefits-grid-container">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ color: primaryColor }}><BenefitIcon name={benefits[0]?.icon} color={primaryColor} /></div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.3rem' }}>{benefits[0]?.title || 'Entrega Rápida'}</p>
                <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.4 }}>{benefits[0]?.subtitle || 'Calcule o prazo no checkout'}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ color: primaryColor }}><BenefitIcon name={benefits[1]?.icon} color={primaryColor} /></div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.3rem' }}>{benefits[1]?.title || 'Compra Segura'}</p>
                <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.4 }}>{benefits[1]?.subtitle || 'Ambiente 100% protegido'}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ color: primaryColor }}><BenefitIcon name={benefits[2]?.icon} color={primaryColor} /></div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.3rem' }}>{benefits[2]?.title || 'Troca Fácil'}</p>
                <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.4 }}>{benefits[2]?.subtitle || '7 dias para devolução'}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ color: primaryColor }}><BenefitIcon name={benefits[3]?.icon} color={primaryColor} /></div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.3rem' }}>{benefits[3]?.title || 'Pagamento Facilitado'}</p>
                <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.4 }}>{benefits[3]?.subtitle || 'Em até 12x no cartão'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2.6 ACTIVE CAMPAIGN */}
      {campaignProducts.length > 0 && (
        <section style={{ padding: '5rem 2rem', backgroundColor: activeCampaign.bg_color || '#ef4444', color: activeCampaign.text_color || '#ffffff' }}>
          <div className="container">
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.4rem 1.2rem', borderRadius: '100px', marginBottom: '1.25rem', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
                  <Zap size={16} /> Campanha Especial
                </div>
                <h3 style={{ fontSize: '3.5rem', fontWeight: 900, margin: '0 0 1rem 0', letterSpacing: '-1.5px' }}>{activeCampaign.title || 'Promoção Especial'}</h3>
                {activeCampaign.subtitle && <p style={{ fontSize: '1.2rem', opacity: 0.9, maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>{activeCampaign.subtitle}</p>}
              </div>
              <div className="products-grid-4col">
                {campaignProducts.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    buttonRadius={buttonRadius} 
                    salePriceColor={salePriceColor} 
                    normalPriceColor={normalPriceColor} 
                    defaultPriceColor={defaultPriceColor} 
                    layoutModel="modern" 
                    storeMode={storeMode} 
                    storeWhatsapp={storeWhatsapp} 
                    isCampaign={true} 
                    campaignBgColor={activeCampaign.bg_color || '#ef4444'} 
                    primaryColor={buttonColor}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. FEATURES */}
      <section className="section" style={{ background: '#ffffff', borderTop: '1px solid var(--border-glass)', borderBottom: '1px solid var(--border-glass)' }}>
        <div className="container">
          <div className="features-grid">
            {featuresList.map((feat, idx) => {
              return (
                <div key={feat.id || `feat-${idx}`} className="feature-card feat-sky reveal active">
                  <div className="feature-icon-wrapper" style={{ color: primaryColor, border: `1px solid ${primaryColor}33`, background: `linear-gradient(135deg, ${primaryColor}1a 0%, ${primaryColor}05 100%)` }}>
                    <BenefitIcon name={feat.icon} color={primaryColor} size={24} />
                  </div>
                  <h3 className="feature-title">{feat.title}</h3>
                  <p className="feature-desc">{feat.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 4. SERVICES */}
      {servicesList.length > 0 && (
        <section id="services" className="section" style={{ borderTop: '1px solid var(--border-glass)' }}>
          <div className="container">
            <div className="section-header reveal active">
              <span className="section-tag" style={{ color: primaryColor }}>{settings.services_tag || 'Nossos Serviços'}</span>
              <h2 className="section-title">{settings.services_title || 'Serviços de Climatização & Engenharia'}</h2>
              <p className="section-subtitle">
                {settings.services_subtitle || 'Desenvolvemos soluções completas sob medida para residências e empresas exigentes.'}
              </p>
            </div>

            <div className="services-grid">
              {servicesList.map((service) => (
                <div key={service.id} className="service-card reveal active">
                  <div className="service-img-container">
                    <img src={service.images?.[0] || service.image_url || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=500&q=80'} alt={service.name} className="service-img" />
                    <div className="service-overlay">
                      <span className="badge badge-service" style={{ color: '#fff', background: primaryColor, borderColor: `${primaryColor}b3` }}>
                        {service.category || 'Serviço'}
                      </span>
                    </div>
                  </div>
                  <div className="service-body">
                    <h3 className="service-title">{service.name}</h3>
                    <p className="service-desc">{service.description || 'Serviço especializado com técnicos certificados e garantia inclusa.'}</p>
                    {(() => {
                      const parsedPrice = parseFloat(String(service.price || '').replace(',', '.'));
                      return !isNaN(parsedPrice) && parsedPrice > 0 ? (
                        <div style={{ marginBottom: '1.25rem' }}>
                          <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block' }}>A partir de</span>
                          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: primaryColor }}>
                            R$ {parsedPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ) : null;
                    })()}
                    <div className="service-footer">
                      <button 
                        onClick={() => setActiveService(service)} 
                        className="btn btn-full"
                        style={{ 
                          borderRadius: buttonRadius, 
                          backgroundColor: primaryColor, 
                          color: '#ffffff',
                          border: 'none',
                          padding: '0.85rem 1.5rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <span>Orçamento e Detalhes</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. PRODUCTS / PARTS */}
      {physicalProducts.length > 0 && (
        <section id="produtos" className="section" style={{ borderTop: '1px solid var(--border-glass)', borderBottom: '1px solid var(--border-glass)', background: '#ffffff' }}>
          <div className="container">
            <div className="section-header reveal active" style={{ marginBottom: '3rem' }}>
              <span className="section-tag" style={{ color: primaryColor }}>Loja de Peças</span>
              <h2 className="section-title">{settings.products_title || 'Peças e Acessórios Originais'}</h2>
              <p className="section-subtitle">
                {settings.products_subtitle || 'Compre componentes homologados com total segurança e envio garantido.'}
              </p>
            </div>

            {/* Filter Search box */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                <input
                  type="text"
                  placeholder="Pesquisar peças e acessórios..."
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem 0.85rem 2.75rem',
                    borderRadius: buttonRadius,
                    border: '1px solid #cbd5e1',
                    fontSize: '0.95rem'
                  }}
                />
                <ShoppingBag 
                  size={18} 
                  style={{ 
                    position: 'absolute', 
                    left: '1rem', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: '#64748b' 
                  }} 
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Chips */}
            {productCategories.length > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '2.5rem' }}>
                <button
                  onClick={() => setSelectedCategory('')}
                  style={{
                    padding: '0.5rem 1.25rem',
                    borderRadius: buttonRadius,
                    border: `1.5px solid ${!selectedCategory ? primaryColor : '#cbd5e1'}`,
                    backgroundColor: !selectedCategory ? primaryColor : 'transparent',
                    color: !selectedCategory ? '#ffffff' : '#64748b',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease'
                  }}
                >
                  Todos
                </button>
                {productCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                    style={{
                      padding: '0.5rem 1.25rem',
                      borderRadius: buttonRadius,
                      border: `1.5px solid ${selectedCategory === cat ? primaryColor : '#cbd5e1'}`,
                      backgroundColor: selectedCategory === cat ? primaryColor : 'transparent',
                      color: selectedCategory === cat ? '#ffffff' : '#64748b',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            <div className="products-grid-4col">
              {(showAllProducts ? filteredProducts : filteredProducts.slice(0, 4)).map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  buttonRadius={buttonRadius} 
                  salePriceColor={salePriceColor} 
                  normalPriceColor={normalPriceColor} 
                  defaultPriceColor={defaultPriceColor} 
                  layoutModel="modern" 
                  storeMode={storeMode} 
                  storeWhatsapp={storeWhatsapp}
                  primaryColor={buttonColor}
                />
              ))}
            </div>
            
            {filteredProducts.length === 0 && (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b' }}>
                Nenhuma peça encontrada para sua busca.
              </div>
            )}

            {/* Ver todos os produtos button */}
            {filteredProducts.length > 0 && (
              <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
                <a
                  href="/produtos"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '1rem 2.5rem',
                    borderRadius: buttonRadius,
                    border: `2px solid ${primaryColor}`,
                    background: 'transparent',
                    color: primaryColor,
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    letterSpacing: '0.02em',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLAnchorElement
                    el.style.background = primaryColor
                    el.style.color = '#ffffff'
                    el.style.transform = 'translateY(-2px)'
                    el.style.boxShadow = `0 8px 24px ${primaryColor}40`
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLAnchorElement
                    el.style.background = 'transparent'
                    el.style.color = primaryColor
                    el.style.transform = 'translateY(0)'
                    el.style.boxShadow = 'none'
                  }}
                >
                  <span>Ver todos os produtos ({filteredProducts.length})</span>
                  <ArrowRight size={18} />
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 6. INSTITUTIONAL / ABOUT */}
      <section id="about" className="section" style={{ borderTop: '1px solid var(--border-glass)' }}>
         <div className="container">
           <div className="about-grid">
             {/* LEFT STORY CONTENT */}
             <div className="about-content reveal active">
               <span className="section-tag" style={{ color: primaryColor }}>Quem Somos</span>
               <h2 className="section-title">{settings.about_title || 'Compromisso com o Clima e Conforto'}</h2>
               <p className="about-subtitle">
                 {settings.about_subtitle || 'Criamos ambientes perfeitamente climatizados que respondem às suas necessidades com segurança.'}
               </p>
               <p className="about-text">
                 {settings.about_description_1 || `Fundada com foco em excelência, a ${store.name} nasceu da fusão entre a engenharia de refrigeração de alta eficiência e o suporte ágil ao consumidor. Acreditamos que um sistema de ar condicionado funcional melhora a qualidade de vida, a saúde do ar e a produtividade nos ambientes corporativos.`}
               </p>
               <p className="about-text">
                 {settings.about_description_2 || 'Desde a instalação de aparelhos residenciais split inverter até contratos de manutenção em grandes edifícios comerciais, nossa equipe técnica credenciada entrega diagnósticos precisos e laudos oficiais que mantêm a garantia de fábrica dos seus aparelhos intacta.'}
               </p>
             </div>
 
             {/* RIGHT STRUCTURE IMAGE */}
             <div className="about-visual reveal active">
               <div className="about-img-frame">
                 <img 
                   src={settings.about_image_url || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80'} 
                   alt={store.name} 
                   className="about-img"
                 />
               </div>
             </div>
           </div>

           {/* ANIMATED STATISTICS */}
           <div className="about-stats" style={{ marginTop: '4rem' }}>
             <div className="stat-card">
               <AnimatedCounter target={Number(settings.stat_count_1) || 1200} suffix={settings.stat_suffix_1 !== undefined ? settings.stat_suffix_1 : "+"} />
               <span className="stat-label">{settings.stat_label_1 || 'Clientes Satisfeitos'}</span>
             </div>
             <div className="stat-card">
               <AnimatedCounter target={Number(settings.stat_count_2) || 450} suffix={settings.stat_suffix_2 !== undefined ? settings.stat_suffix_2 : "+"} />
               <span className="stat-label">{settings.stat_label_2 || 'Serviços Realizados'}</span>
             </div>
             <div className="stat-card">
               <AnimatedCounter target={Number(settings.stat_count_3) || 8} suffix={settings.stat_suffix_3 !== undefined ? settings.stat_suffix_3 : " anos"} />
               <span className="stat-label">{settings.stat_label_3 || 'De Experiência'}</span>
             </div>
             <div className="stat-card">
               <AnimatedCounter target={Number(settings.stat_count_4) || 4.9} suffix={settings.stat_suffix_4 !== undefined ? settings.stat_suffix_4 : "/5"} />
               <span className="stat-label">{settings.stat_label_4 || 'Nota de Avaliação'}</span>
             </div>
           </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS */}
      <section id="testimonials" className="section" style={{ background: '#ffffff', borderTop: '1px solid var(--border-glass)', borderBottom: '1px solid var(--border-glass)' }}>
        <div className="container">
          <div className="section-header reveal active" style={{ marginBottom: '4rem' }}>
            <span className="section-tag" style={{ color: primaryColor }}>{settings.testimonials_tag || 'Depoimentos'}</span>
            <h2 className="section-title">{settings.testimonials_title || 'Reconhecimento e Satisfação'}</h2>
            <p className="section-subtitle">
              {settings.testimonials_subtitle || 'Veja a opinião de clientes que contrataram nossos engenheiros técnicos para a manutenção e instalação de seus aparelhos.'}
            </p>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((test: any) => (
              <div key={test.id} className="testimonial-card-v2">
                <div className="testimonial-card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <div className="stars-group" style={{ display: 'flex', gap: '0.2rem' }}>
                    {[...Array(Number(test.rating) || 5)].map((_, i) => (
                      <Star key={i} size={14} fill="#fbbf24" stroke="#fbbf24" />
                    ))}
                  </div>
                  <div className="quote-icon-wrapper">
                    <MessageSquare size={16} style={{ color: primaryColor, opacity: 0.6 }} />
                  </div>
                </div>
                
                <blockquote className="testimonial-body-text" style={{ fontSize: '0.95rem', color: '#475569', fontStyle: 'italic', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  "{test.text}"
                </blockquote>

                <div className="testimonial-user-profile" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img src={test.avatar} alt={test.name} className="testimonial-user-avatar" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div className="testimonial-user-info">
                    <h4 className="testimonial-user-name" style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{test.name}</h4>
                    <span className="testimonial-user-role" style={{ fontSize: '0.8rem', color: '#64748b' }}>{test.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. CTA SECTION */}
      <section className="cta-section" style={{ borderTop: '1px solid var(--border-glass)' }}>
        <div className="container">
          <div className="cta-card reveal active" style={{ 
            background: settings.cta_use_gradient
              ? `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
              : (settings.cta_bg_color || primaryColor)
          }}>

            <h2 className="cta-title" style={{ color: settings.cta_title_color || '#ffffff' }}>
              {settings.cta_title ? settings.cta_title : (
                <>
                  Pronto para Climatizar o Seu <span className="gradient-text-neon" style={{ background: '#fff', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Espaço?</span>
                </>
              )}
            </h2>
            <p className="cta-desc" style={{ color: settings.cta_desc_color || '#ffffff' }}>
              {settings.cta_subtitle || settings.cta_desc || 'Agende uma reunião com nossa equipe técnica pelo WhatsApp ou compre suas peças e componentes online hoje mesmo com suporte técnico especializado.'}
            </p>
            <div className="cta-buttons">
              <a 
                href={`https://wa.me/55${storeWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Gostaria de agendar um serviço ou tirar dúvidas técnicas.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-lg"
                style={{ 
                  padding: '1rem 2.5rem', 
                  fontSize: '1.1rem', 
                  borderRadius: buttonRadius,
                  backgroundColor: settings.cta_button_bg_color || '#25D366',
                  color: settings.cta_button_text_color || '#ffffff',
                  border: 'none'
                }}
              >
                <MessageSquare size={20} />
                <span>{settings.cta_btn_text_1 || 'Chamar Consultor Técnico'}</span>
              </a>
              {physicalProducts.length > 0 && (
                <a 
                  href="#produtos" 
                  className="btn btn-secondary"
                  style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: buttonRadius, backgroundColor: 'rgba(255, 255, 255, 0.2)', border: '1px solid rgba(255, 255, 255, 0.3)', color: '#fff' }}
                >
                  <span>{settings.cta_btn_text_2 || 'Ver Peças e Acessórios'}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <StoreFooter store={store} settings={settings} primaryColor={primaryColor} buttonRadius={buttonRadius} />

      {/* 10. LEAD MODAL */}
      {activeService && (
        <div className="modal-overlay open" onClick={() => setActiveService(null)} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '1rem'
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            background: '#fff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '560px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Close Button */}
            <div style={{ position: 'relative' }}>
              <button 
                className="modal-close" 
                onClick={() => setActiveService(null)} 
                aria-label="Fechar"
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'rgba(0, 0, 0, 0.3)',
                  color: '#fff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 20
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Banner */}
            <div 
              className="modal-hero-img" 
              style={{ 
                backgroundImage: `url(${activeService.images?.[0] || activeService.image_url || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '180px',
                width: '100%',
                position: 'relative'
              }}
            />

            {/* Modal Body & Budget Form */}
            <div className="modal-body" style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <span className="modal-service-tag" style={{ color: '#ffffff', background: primaryColor, padding: '0.35rem 0.85rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', display: 'inline-block', marginBottom: '0.75rem' }}>
                  {activeService.category || 'Serviço Especializado'}
                </span>
                <h2 className="modal-service-title" style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0', color: '#0f172a', lineHeight: 1.3 }}>
                  {activeService.name}
                </h2>
              </div>

              <p className="modal-service-desc" style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                {activeService.description || 'Solicite um orçamento sob medida para este serviço. Preencha os dados abaixo e entraremos em contato via WhatsApp.'}
              </p>
              
              <h3 className="modal-form-title" style={{ fontSize: '1.1rem', fontWeight: 800, borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
                Solicitar Proposta de Serviço
              </h3>
              
              <form onSubmit={handleLeadSubmit} className="modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label htmlFor="form-name" className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Nome Completo</label>
                  <input
                    id="form-name"
                    name="name"
                    type="text"
                    placeholder="Ex: João da Silva"
                    className="form-input"
                    value={leadFormData.name}
                    onChange={(e) => setLeadFormData(prev => ({ ...prev, name: e.target.value }))}
                    style={{ padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: buttonRadius, fontSize: '0.95rem' }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label htmlFor="form-phone" className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Celular / WhatsApp</label>
                    <input
                      id="form-phone"
                      name="phone"
                      type="tel"
                      placeholder="Ex: (11) 99999-9999"
                      className="form-input"
                      value={leadFormData.phone}
                      onChange={(e) => setLeadFormData(prev => ({ ...prev, phone: e.target.value }))}
                      style={{ padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: buttonRadius, fontSize: '0.95rem' }}
                      required
                    />
                  </div>
                  
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label htmlFor="form-email" className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>E-mail</label>
                    <input
                      id="form-email"
                      name="email"
                      type="email"
                      placeholder="Ex: joao@empresa.com"
                      className="form-input"
                      value={leadFormData.email}
                      onChange={(e) => setLeadFormData(prev => ({ ...prev, email: e.target.value }))}
                      style={{ padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: buttonRadius, fontSize: '0.95rem' }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label htmlFor="form-urgency" className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Urgência do Serviço</label>
                  <select
                    id="form-urgency"
                    name="urgency"
                    className="form-select"
                    value={leadFormData.urgency}
                    onChange={(e) => setLeadFormData(prev => ({ ...prev, urgency: e.target.value }))}
                    style={{ padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: buttonRadius, fontSize: '0.95rem', background: '#fff' }}
                  >
                    <option value="baixo">Planejamento Inicial (Sem pressa)</option>
                    <option value="medio">Médio Prazo (Próximas semanas)</option>
                    <option value="alto">Urgente (Imediato)</option>
                  </select>
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label htmlFor="form-details" className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Detalhes Adicionais (Opcional)</label>
                  <textarea
                    id="form-details"
                    name="details"
                    placeholder="Ex: Descreva detalhes sobre o ar condicionado (marca, BTUs) ou o local..."
                    className="form-textarea"
                    value={leadFormData.details}
                    onChange={(e) => setLeadFormData(prev => ({ ...prev, details: e.target.value }))}
                    style={{ padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: buttonRadius, fontSize: '0.95rem', minHeight: '80px', fontFamily: 'inherit' }}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-whatsapp btn-full" 
                  style={{ marginTop: '0.5rem', borderRadius: buttonRadius, padding: '0.85rem' }}
                >
                  <Send size={16} />
                  <span>Enviar Solicitação no WhatsApp</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* BOTÃO DO WHATSAPP FLUTUANTE DO LOJISTA */}
      {storeWhatsapp && (
        <a 
          href={`https://wa.me/55${storeWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Gostaria de saber mais sobre os serviços e produtos da loja.')}`}
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
          title="Fale com a Loja pelo WhatsApp"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="white"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.245 3.478 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
        </a>
      )}
    </div>
  )
}
