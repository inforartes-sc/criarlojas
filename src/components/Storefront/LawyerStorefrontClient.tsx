'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ArrowRight, Sparkles, Shield, Scale, Award, Clock, MessageSquare, Send, X, Users, Handshake, BookOpen, FileText, CheckCircle, Star } from 'lucide-react'
import BenefitIcon from '@/components/BenefitIcon'
import StoreHeader from './StoreHeader'
import StoreFooter from './StoreFooter'
import WhatsAppFloatingButton from './WhatsAppFloatingButton'
import OfferPopup from './OfferPopup'

interface LawyerStorefrontClientProps {
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
    <span ref={elementRef} className="lawyer-stat-number">
      {formatCount()}{suffix}
    </span>
  )
}

export default function LawyerStorefrontClient({
  store,
  products,
  categories,
  resolvedSearchParams
}: LawyerStorefrontClientProps) {
  const settings = store.settings || {}
  const [activeService, setActiveService] = useState<any>(null)
  
  // Case Intake Lead Form State
  const [leadFormData, setLeadFormData] = useState({
    name: '',
    phone: '',
    email: '',
    urgency: 'medio',
    details: ''
  })

  // Theme settings mapping
  const primaryColor = settings.primary_color || '#c5a059' // Gold by default for law firms
  const buttonColor = settings.button_color || '#c5a059'
  const buttonTextColor = settings.button_text_color || '#000000'
  const buttonHoverColor = settings.button_hover_color || '#d5b26f'
  const buttonHoverTextColor = settings.button_hover_text_color || '#000000'
  const buttonRadius = settings.button_style === 'pill' ? '100px' : settings.button_style === 'sharp' ? '0px' : '4px'
  const heroStyle = settings.hero_style || 'split'
  const showHeroText = settings.show_hero_text !== undefined ? settings.show_hero_text : true
  const storeWhatsapp = settings.whatsapp || ''
  const storeMode = settings.store_mode || 'loja'
  const isCatalogo = storeMode === 'catalogo'

  const layoutModel = settings.layout_model || 'lawyer'
  const themeMode = settings.theme_mode || 'dark'
  const isDark = themeMode === 'dark'
  const heroBgColor = settings.hero_bg_color || (isDark ? '#0b1315' : 'transparent')
  const splitBgColor = settings.hero_bg_color && settings.hero_bg_color !== 'transparent' ? settings.hero_bg_color : (isDark ? '#0b1315' : '#fcfbf7')
  const heroTitleColor = settings.hero_title_color || (isDark ? '#f2efeb' : '#111111')
  const heroSubtitleColor = settings.hero_subtitle_color || (isDark ? '#94a3b8' : '#555555')

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

  // Scroll to practice areas section when view query parameter is selected
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const view = searchParams.get('view');
      if (view === 'servicos' || view === 'serviços') {
        setTimeout(() => {
          const el = document.getElementById('areas');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      } else if (view === 'sobre' || view === 'about' || view === 'quem-somos') {
        setTimeout(() => {
          const el = document.getElementById('sobre');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    }
  }, [resolvedSearchParams])

  // Standard Legal Testimonials List
  const testimonials = (settings.testimonials?.length > 0 ? settings.testimonials : [
    {
      id: 1,
      name: settings.testimonial_1_name || "Roberto Camargo",
      role: settings.testimonial_1_role || "Diretor Executivo na Vanguarda Tech",
      text: settings.testimonial_1 || "A atuação do escritório na reestruturação societária da nossa empresa foi impecável. Conduziram o processo com discrição, ética e um nível de detalhismo que evitou passivos futuros significativos.",
      rating: 5,
      avatar: settings.testimonial_1_avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
    },
    {
      id: 2,
      name: settings.testimonial_2_name || "Heloísa Albuquerque",
      role: settings.testimonial_2_role || "Arquiteta e Sócia do Studio H+A",
      text: settings.testimonial_2 || "Fui assessorado no processo de partilha de bens e inventário familiar. Toda a equipe se mostrou extremamente humana, sensível ao momento delicado e focada em resolver tudo de forma amigável.",
      rating: 5,
      avatar: settings.testimonial_2_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
    },
    {
      id: 3,
      name: settings.testimonial_3_name || "Carlos Mendes",
      role: settings.testimonial_3_role || "Diretor do Grupo Mendes & Cia",
      text: settings.testimonial_3 || "Excelente suporte na defesa de uma autuação fiscal injusta. O profundo conhecimento técnico do Dr. Marcus fez toda a diferença na vitória administrativa junto ao conselho fiscal.",
      rating: 5,
      avatar: settings.testimonial_3_avatar || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
    }
  ]).map((t: any, i: number) => ({ ...t, id: t.id || i + 1 }))

  // Determine what services are displayable
  const servicesList = products.filter(p => p.is_service === true || p.is_service === 'true')

  // Handle legal case intake submission
  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const formattedWhatsapp = storeWhatsapp.replace(/\D/g, '') || '5511999999999'
    const urgencyLabels: Record<string, string> = {
      baixo: 'Consulta Preventiva (Planejamento / Dúvidas)',
      medio: 'Medida Judicial Recomendada',
      alto: 'Prazo Processual Correndo / Intimação / URGENTE!'
    }

    let message = `Olá! Gostaria de agendar uma consulta jurídica para a área de *${activeService.name}*:\n\n`
    message += `*Nome Completo:* ${leadFormData.name}\n`
    message += `*WhatsApp:* ${leadFormData.phone}\n`
    message += `*E-mail:* ${leadFormData.email}\n`
    message += `*Gravidade/Urgência:* ${urgencyLabels[leadFormData.urgency]}\n`
    message += `*Resumo da Situação:* ${leadFormData.details ? leadFormData.details : 'Não detalhado'}\n\n`
    message += `Solicito retorno para agendamento de consulta (presencial ou por vídeoconferência).`

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

  const featuresList = [
    {
      id: 1,
      icon: <Scale size={26} />,
      title: settings.differential_1_title || "Ética & Transparência",
      desc: settings.differential_1_desc || "Conduzimos cada caso com o mais alto padrão moral, mantendo o cliente informado em todas as etapas de forma clara."
    },
    {
      id: 2,
      icon: <Shield size={26} />,
      title: settings.differential_2_title || "Sigilo & Confiança",
      desc: settings.differential_2_desc || "Garantia de confidencialidade absoluta em todas as consultas e processos judiciais sob nossa responsabilidade."
    },
    {
      id: 3,
      icon: <Award size={26} />,
      title: settings.differential_3_title || "Foco em Resultados",
      desc: settings.differential_3_desc || "Aliamos profundo conhecimento técnico com estratégia jurídica focada para maximizar as chances de sucesso."
    },
    {
      id: 4,
      icon: <Clock size={26} />,
      title: settings.differential_4_title || "Atendimento Ágil",
      desc: settings.differential_4_desc || "Respostas rápidas e suporte contínuo para garantir tranquilidade e segurança aos nossos representados."
    }
  ]

  const benefits = settings.benefits || [
    { title: 'Entrega Rápida', subtitle: 'Calcule o prazo no checkout' },
    { title: 'Compra Segura', subtitle: 'Ambiente 100% protegido' },
    { title: 'Troca Fácil', subtitle: '7 dias para devolução' },
    { title: 'Pagamento Facilitado', subtitle: 'Em até 12x no cartão' }
  ]

  // Lawyer Team list
  const teamList = (settings.team_members?.length > 0 ? settings.team_members : [
    {
      id: 1,
      name: settings.team_member_1_name || "Dr. Alexandre Goldmann",
      role: settings.team_member_1_role || "Sócio Fundador - Direito Empresarial",
      desc: settings.team_member_1_desc || "Mestre em Direito Comercial pela USP, com mais de 15 anos de experiência em reestruturações societárias e fusões de grandes corporações.",
      avatar: settings.team_member_1_avatar || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80"
    },
    {
      id: 2,
      name: settings.team_member_2_name || "Dra. Beatriz D'Angelo",
      role: settings.team_member_2_role || "Sócia - Direito Civil e Contratos",
      desc: settings.team_member_2_desc || "Especialista em Direito Processual Civil, atuante na assessoria de contratos nacionais e internacionais de alta complexidade e direito de família.",
      avatar: settings.team_member_2_avatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80"
    },
    {
      id: 3,
      name: settings.team_member_3_name || "Dr. Marcus Vinícius Prado",
      role: settings.team_member_3_role || "Associado Sênior - Direito Tributário",
      desc: settings.team_member_3_desc || "Pós-graduado em Gestão Tributária, focado em planejamento fiscal preventivo para grandes grupos econômicos e contencioso administrativo.",
      avatar: settings.team_member_3_avatar || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80"
    }
  ]).map((m: any, i: number) => ({ ...m, id: m.id || i + 1 }))

  return (
    <div className="lawyer-template" style={{ 
      backgroundColor: 'var(--bg-dark)',
      color: 'var(--text-primary)',
      minHeight: '100vh',
      fontFamily: 'var(--font-body)'
    }}>
      {/* Dynamic CSS Variables Injection to override primary legal gold if client customized the colors */}
      <style>{`
        .lawyer-template {
          --accent-gold: ${primaryColor};
          --accent-gold-hover: ${buttonHoverColor};
          --accent-gold-light: ${primaryColor}1f;
          --accent-gold-border: ${primaryColor}40;
          --radius-sm: ${buttonRadius};
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
        .btn-gold-primary {
          background-color: ${buttonColor} !important;
          color: ${buttonTextColor} !important;
          border: 1px solid ${buttonColor} !important;
          border-radius: ${buttonRadius} !important;
          transition: all 0.3s ease !important;
        }
        .btn-gold-primary:hover {
          background-color: ${buttonHoverColor} !important;
          color: ${buttonHoverTextColor} !important;
          border-color: ${buttonHoverColor} !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px ${primaryColor}40;
        }
        .btn-gold-secondary {
          color: ${primaryColor} !important;
          border: 1px solid ${primaryColor}40 !important;
          border-radius: ${buttonRadius} !important;
          transition: all 0.3s ease !important;
        }
        .btn-gold-secondary:hover {
          background-color: ${primaryColor}14 !important;
          border-color: ${primaryColor} !important;
          color: #ffffff !important;
          transform: translateY(-2px);
        }
        .lawyer-whatsapp-float:hover {
          transform: scale(1.1) rotate(5deg) !important;
          filter: brightness(1.1);
        }
        .lawyer-cta .btn-gold-primary {
          background-color: ${settings.cta_button_bg_color || '#25D366'} !important;
          color: ${settings.cta_button_text_color || '#ffffff'} !important;
          border-color: ${settings.cta_button_bg_color || '#25D366'} !important;
        }
        .lawyer-cta .btn-gold-primary:hover {
          background-color: ${settings.cta_button_bg_color || '#25D366'} !important;
          color: ${settings.cta_button_text_color || '#ffffff'} !important;
          border-color: ${settings.cta_button_bg_color || '#25D366'} !important;
          filter: brightness(0.9);
        }
        .lawyer-cta .btn-gold-secondary {
          color: ${settings.cta_button_2_text_color || primaryColor} !important;
          border-color: ${settings.cta_button_2_text_color || (primaryColor + '40')} !important;
        }
        .lawyer-cta .btn-gold-secondary:hover {
          background-color: ${settings.cta_button_2_text_color ? (settings.cta_button_2_text_color + '14') : (primaryColor + '14')} !important;
          border-color: ${settings.cta_button_2_text_color || primaryColor} !important;
          color: ${settings.cta_button_2_text_color || '#ffffff'} !important;
        }
        .lawyer-cta-title {
          color: ${settings.cta_title_color || '#ffffff'} !important;
        }
        .lawyer-cta-desc {
          color: ${settings.cta_desc_color || 'var(--text-secondary)'} !important;
        }
        @media (max-width: 768px) {
          ${settings.hero_image_mobile_url ? `
            .lawyer-hero-full {
              background-image: ${showHeroText ? `linear-gradient(${overlayColor55}, ${overlayColor55}), url(${settings.hero_image_mobile_url})` : `url(${settings.hero_image_mobile_url})`} !important;
            }
            .lawyer-hero-left {
              background-image: linear-gradient(0deg, ${splitBgColor} 0%, ${splitBgColor} 40%, transparent 100%), url(${settings.hero_image_mobile_url}) !important;
            }
            .lawyer-hero-split-img-card {
              background-image: url(${settings.hero_image_mobile_url}) !important;
            }
          ` : ''}

          .lawyer-cta-buttons {
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
            gap: 1rem !important;
            align-items: center !important;
          }
          .lawyer-cta-buttons a {
            width: 100% !important;
            max-width: 400px !important;
            text-align: center !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
          }
        }

        .lawyer-benefits-section {
          padding: 3rem 2rem;
        }
        .lawyer-benefits-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2.5rem 2rem;
          padding: 2.25rem 3.5rem;
          background-color: ${settings.benefits_bg_color || '#efece6'} !important;
          border-radius: 24px !important;
          border: none !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);
          width: 100%;
        }
        .lawyer-benefits-grid .benefit-title {
          font-family: var(--font-body), sans-serif !important;
          font-weight: 700 !important;
          font-size: 1.15rem !important;
          color: #1e293b !important;
          margin-bottom: 0.25rem !important;
          line-height: 1.3 !important;
        }
        .lawyer-benefits-grid .benefit-subtitle {
          font-family: var(--font-body), sans-serif !important;
          font-weight: 400 !important;
          font-size: 0.95rem !important;
          color: #64748b !important;
          line-height: 1.4 !important;
        }
        @media (max-width: 991px) {
          .lawyer-benefits-section {
            padding: 2rem 1.5rem !important;
          }
          .lawyer-benefits-section .lawyer-container {
            padding: 0 0.5rem !important;
          }
          .lawyer-benefits-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 2rem 1.5rem !important;
            padding: 2rem 2.25rem !important;
          }
        }
        @media (max-width: 576px) {
          .lawyer-benefits-section {
            padding: 1.5rem 0.75rem !important;
          }
          .lawyer-benefits-section .lawyer-container {
            padding: 0 0.25rem !important;
          }
          .lawyer-benefits-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 1.5rem 0.75rem !important;
            padding: 1.5rem 1rem !important;
          }
          .lawyer-benefits-grid .benefit-title {
            font-size: 1.05rem !important;
          }
          .lawyer-benefits-grid .benefit-subtitle {
            font-size: 0.85rem !important;
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
                <div className="lawyer-hero-badge" style={{ justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <Sparkles size={14} style={{ color: primaryColor }} />
                  <span>{settings.hero_badge || 'Advocacia & Assessoria Jurídica'}</span>
                </div>
                <h1 className="lawyer-hero-title" style={{ color: heroTitleColor, fontSize: '3.5rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '2rem', letterSpacing: '-2px' }}>
                  {settings.hero_title || 'Excelência Jurídica e Defesa Definitiva Dos Seus Direitos.'}
                </h1>
                <p className="lawyer-hero-description" style={{ fontSize: '1.15rem', color: heroSubtitleColor, marginBottom: '3.5rem', lineHeight: 1.6 }}>
                  {settings.hero_subtitle || 'Oferecemos soluções jurídicas estratégicas com alto padrão de ética, transparência e comprometimento absoluto com os resultados e a segurança de nossos representados.'}
                </p>
                <div className="lawyer-hero-actions" style={{ justifyContent: 'center' }}>
                  <a href="#areas" className="btn-gold-primary" onClick={(e) => { e.preventDefault(); document.getElementById('areas')?.scrollIntoView({ behavior: 'smooth' }) }}>
                    <span>Áreas de Atuação</span>
                    <ArrowRight size={16} />
                  </a>
                  <a href="#sobre" className="btn-gold-secondary" onClick={(e) => { e.preventDefault(); document.getElementById('sobre')?.scrollIntoView({ behavior: 'smooth' }) }}>
                    <span>Conhecer Escritório</span>
                  </a>
                </div>
              </div>
            )}
            {/* Image Card side (Right) */}
            <div className="hero-split-img" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '100%', 
              height: '100%' 
            }}>
              <div className="lawyer-hero-split-img-card" style={{ 
                width: '100%', 
                height: '55vh',
                backgroundImage: `url(${settings.hero_image_url || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600'})`, 
                backgroundSize: 'cover', 
                backgroundPosition: 'center',
                borderRadius: '24px',
                boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.5)' : '0 20px 40px rgba(0,0,0,0.08)',
                border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.03)'
              }} />
            </div>
          </section>
        ) : heroStyle === 'left-aligned' ? (
          <section id="home" className="lawyer-hero-left" style={{ 
            height: '80vh', 
            display: 'flex', 
            alignItems: 'center', 
            backgroundColor: splitBgColor,
            backgroundImage: `linear-gradient(90deg, ${splitBgColor} 0%, ${splitBgColor} 40%, transparent 100%), url(${settings.hero_image_url || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            padding: '0 8%',
            color: heroTitleColor
          }}>
            {showHeroText && (
              <div style={{ maxWidth: '600px', textAlign: 'left' }}>
                <div className="lawyer-hero-badge" style={{ marginBottom: '1.5rem', alignSelf: 'flex-start' }}>
                  <Sparkles size={14} style={{ color: primaryColor }} />
                  <span>{settings.hero_badge || 'Advocacia & Assessoria Jurídica'}</span>
                </div>
                <h1 className="lawyer-hero-title" style={{ color: heroTitleColor, fontSize: '3.5rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '2rem', letterSpacing: '-2px' }}>
                  {settings.hero_title || 'Excelência Jurídica e Defesa Definitiva Dos Seus Direitos.'}
                </h1>
                <p className="lawyer-hero-description" style={{ fontSize: '1.15rem', color: heroSubtitleColor, marginBottom: '3.5rem', lineHeight: 1.6 }}>
                  {settings.hero_subtitle || 'Oferecemos soluções jurídicas estratégicas com alto padrão de ética, transparência e comprometimento absoluto com os resultados e a segurança de nossos representados.'}
                </p>
                <div className="lawyer-hero-actions" style={{ justifyContent: 'flex-start' }}>
                  <a href="#areas" className="btn-gold-primary" onClick={(e) => { e.preventDefault(); document.getElementById('areas')?.scrollIntoView({ behavior: 'smooth' }) }}>
                    <span>Áreas de Atuação</span>
                    <ArrowRight size={16} />
                  </a>
                  <a href="#sobre" className="btn-gold-secondary" onClick={(e) => { e.preventDefault(); document.getElementById('sobre')?.scrollIntoView({ behavior: 'smooth' }) }}>
                    <span>Conhecer Escritório</span>
                  </a>
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
                <div className="lawyer-hero-badge" style={{ justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <Sparkles size={14} style={{ color: primaryColor }} />
                  <span>{settings.hero_badge || 'Advocacia & Assessoria Jurídica'}</span>
                </div>
                <h1 className="lawyer-hero-title" style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem', color: heroTitleColor, letterSpacing: '-2px' }}>
                  {settings.hero_title || 'Excelência Jurídica e Defesa Definitiva Dos Seus Direitos.'}
                </h1>
                <p className="lawyer-hero-description" style={{ fontSize: '1.2rem', color: heroSubtitleColor, marginBottom: '2.5rem', lineHeight: 1.6, maxWidth: '650px' }}>
                  {settings.hero_subtitle || 'Oferecemos soluções jurídicas estratégicas com alto padrão de ética, transparência e comprometimento absoluto com os resultados e a segurança de nossos representados.'}
                </p>
                <div className="lawyer-hero-actions" style={{ justifyContent: 'center' }}>
                  <a href="#areas" className="btn-gold-primary" onClick={(e) => { e.preventDefault(); document.getElementById('areas')?.scrollIntoView({ behavior: 'smooth' }) }}>
                    <span>Áreas de Atuação</span>
                    <ArrowRight size={16} />
                  </a>
                  <a href="#sobre" className="btn-gold-secondary" onClick={(e) => { e.preventDefault(); document.getElementById('sobre')?.scrollIntoView({ behavior: 'smooth' }) }}>
                    <span>Conhecer Escritório</span>
                  </a>
                </div>
              </div>
            )}
          </section>
        ) : (
          // Default "full" / full width banner
          <section id="home" className="lawyer-hero-full" style={{ 
            height: '80vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '0 5%', 
            backgroundImage: showHeroText ? `linear-gradient(${overlayColor55}, ${overlayColor55}), url(${settings.hero_image_url || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600'})` : `url(${settings.hero_image_url || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600'})`, 
            backgroundColor: showHeroText ? heroBgColor : 'transparent',
            backgroundSize: 'cover', 
            backgroundPosition: 'center', 
            color: heroTitleColor,
            textAlign: 'center'
          }}>
            {showHeroText && (
              <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="lawyer-hero-badge" style={{ justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <Sparkles size={14} style={{ color: primaryColor }} />
                  <span>{settings.hero_badge || 'Advocacia & Assessoria Jurídica'}</span>
                </div>
                <h1 className="lawyer-hero-title" style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '2rem', letterSpacing: '-2px', color: heroTitleColor }}>
                  {settings.hero_title || 'Excelência Jurídica e Defesa Definitiva Dos Seus Direitos.'}
                </h1>
                <p className="lawyer-hero-description" style={{ fontSize: '1.25rem', marginBottom: '3.5rem', opacity: 0.95, maxWidth: '700px', margin: '0 auto 3.5rem auto', lineHeight: 1.7, color: heroSubtitleColor }}>
                  {settings.hero_subtitle || 'Oferecemos soluções jurídicas estratégicas com alto padrão de ética, transparência e comprometimento absoluto com os resultados e a segurança de nossos representados.'}
                </p>
                <div className="lawyer-hero-actions" style={{ justifyContent: 'center' }}>
                  <a href="#areas" className="btn-gold-primary" onClick={(e) => { e.preventDefault(); document.getElementById('areas')?.scrollIntoView({ behavior: 'smooth' }) }}>
                    <span>Áreas de Atuação</span>
                    <ArrowRight size={16} />
                  </a>
                  <a href="#sobre" className="btn-gold-secondary" onClick={(e) => { e.preventDefault(); document.getElementById('sobre')?.scrollIntoView({ behavior: 'smooth' }) }}>
                    <span>Conhecer Escritório</span>
                  </a>
                </div>
              </div>
            )}
          </section>
        )
      )}

      {/* 2.5 BENEFITS */}
      <section className="lawyer-benefits-section" style={{ backgroundColor: 'var(--bg-dark)' }}>
        <div className="lawyer-container">
          <div className="lawyer-benefits-grid" style={{ 
            maxWidth: '1400px', 
            margin: '0 auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ color: primaryColor }}><BenefitIcon name={benefits[0]?.icon} color={primaryColor} /></div>
              <div>
                <p className="benefit-title">{benefits[0]?.title || 'Entrega Rápida'}</p>
                <p className="benefit-subtitle">{benefits[0]?.subtitle || 'Calcule o prazo no checkout'}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ color: primaryColor }}><BenefitIcon name={benefits[1]?.icon} color={primaryColor} /></div>
              <div>
                <p className="benefit-title">{benefits[1]?.title || 'Compra Segura'}</p>
                <p className="benefit-subtitle">{benefits[1]?.subtitle || 'Ambiente 100% protegido'}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ color: primaryColor }}><BenefitIcon name={benefits[2]?.icon} color={primaryColor} /></div>
              <div>
                <p className="benefit-title">{benefits[2]?.title || 'Troca Fácil'}</p>
                <p className="benefit-subtitle">{benefits[2]?.subtitle || '7 dias para devolução'}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ color: primaryColor }}><BenefitIcon name={benefits[3]?.icon} color={primaryColor} /></div>
              <div>
                <p className="benefit-title">{benefits[3]?.title || 'Pagamento Facilitado'}</p>
                <p className="benefit-subtitle">{benefits[3]?.subtitle || 'Em até 12x no cartão'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DIFFERENTIALS (VALUES) */}
      <section className="lawyer-section" style={{ backgroundColor: 'var(--bg-dark)' }}>
        <div className="lawyer-container">
          <div className="lawyer-values-grid">
            {featuresList.map((feat) => (
              <div key={feat.id} className="lawyer-value-card reveal active">
                <div className="lawyer-value-icon">
                  {feat.icon}
                </div>
                <h3 className="lawyer-value-title">{feat.title}</h3>
                <p className="lawyer-value-desc">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PRACTICE AREAS (SERVICES) */}
      <section id="areas" className="lawyer-section" style={{ backgroundColor: settings.body_bg_color ? 'var(--bg-card)' : 'rgb(8, 14, 25)' }}>
        <div className="lawyer-container">
          <div className="lawyer-section-header reveal active">
            <span className="lawyer-section-tag">Áreas de Prática</span>
            <h2 className="lawyer-section-title">{settings.services_title || 'Nossas Especialidades Jurídicas'}</h2>
            <div className="gold-separator"></div>
            <p className="lawyer-section-subtitle">
              {settings.services_subtitle || 'Prestamos assessoria de alta performance voltada à mitigação de riscos e defesa de direitos.'}
            </p>
          </div>

          <div className="lawyer-practice-grid">
            {servicesList.map((service: any) => (
              <div key={service.id} className="lawyer-practice-card reveal active">
                <div className="lawyer-practice-img-container">
                  <img 
                    src={service.images?.[0] || service.image_url || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80'} 
                    alt={service.name} 
                    className="lawyer-practice-img" 
                  />
                  <div className="lawyer-practice-badge">
                    {service.category || 'Área de Direito'}
                  </div>
                </div>
                
                <div className="lawyer-practice-body">
                  <h3 className="lawyer-practice-title">{service.name}</h3>
                  <p className="lawyer-practice-desc">
                    {service.description || 'Defesa especializada com representação robusta, acompanhamento integral do processo e relatórios de progresso.'}
                  </p>
                  
                  {service.price > 0 && service.hide_price !== true && service.hide_price !== 'true' && !service.sku?.includes('#hide_price') && (
                    <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Honorários sob consulta a partir de</span>
                      <span style={{ fontSize: '1.4rem', fontWeight: 700, color: primaryColor }}>
                        R$ {service.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  
                  <div className="lawyer-practice-footer">
                    <button 
                      onClick={() => setActiveService(service)}
                      className="btn-gold-primary"
                      style={{ width: '100%', padding: '0.85rem' }}
                    >
                      <MessageSquare size={16} />
                      <span>Agendar Análise</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. ABOUT THE FIRM */}
      <section id="sobre" className="lawyer-section" style={{ backgroundColor: 'var(--bg-dark)' }}>
        <div className="lawyer-container">
          <div className="lawyer-about-grid">
            {/* LEFT FRAME IMAGE */}
            <div className="lawyer-about-visual reveal active">
              <div className="lawyer-about-frame">
                <img 
                  src={settings.about_image_url || 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80'} 
                  alt={store.name} 
                  className="lawyer-about-img"
                />
              </div>
            </div>

            {/* RIGHT TEXT */}
            <div className="lawyer-about-content reveal active">
              <span className="lawyer-section-tag" style={{ textAlign: 'left' }}>O Escritório</span>
              <h2 className="lawyer-section-title" style={{ textAlign: 'left' }}>{settings.about_title || 'Excelência e Solidez Jurídica'}</h2>
              <div className="gold-separator-left"></div>
              
              <p className="lawyer-about-text highlight">
                {settings.about_subtitle || '"Nosso compromisso fundamental é a segurança jurídica absoluta de nossos clientes nas decisões mais importantes da vida e dos negócios."'}
              </p>
              
              <p className="lawyer-about-text">
                {settings.about_description_1 || `Fundado sobre os pilares da ética corporativa e rigor técnico acadêmico, o escritório ${store.name} nasceu para preencher a necessidade de uma advocacia verdadeiramente focada nas peculiaridades de cada cliente. Não trabalhamos com soluções genéricas ou em massa.`}
              </p>
              
              <p className="lawyer-about-text">
                {settings.about_description_2 || 'Nosso corpo de advogados assessora de forma preventiva, desenvolvendo planejamentos estratégicos contratuais, civis e tributários que impedem conflitos judiciais futuros. Em matérias contenciosas, representamos os clientes de maneira vigorosa e combativa em todas as instâncias do Poder Judiciário.'}
              </p>
            </div>
          </div>

          {/* ANIMATED STATISTICS ROW */}
          <div className="lawyer-stats-row reveal active">
            <div className="lawyer-stat-card">
              <AnimatedCounter target={settings.stat_count_1 || 98} suffix="%" />
              <span className="lawyer-stat-label">{settings.stat_label_1 || 'Casos de Sucesso'}</span>
            </div>
            <div className="lawyer-stat-card">
              <AnimatedCounter target={settings.stat_count_2 || 1500} suffix="+" />
              <span className="lawyer-stat-label">{settings.stat_label_2 || 'Clientes Atendidos'}</span>
            </div>
            <div className="lawyer-stat-card">
              <AnimatedCounter target={settings.stat_count_3 || 12} suffix=" anos" />
              <span className="lawyer-stat-label">{settings.stat_label_3 || 'De Atuação'}</span>
            </div>
            <div className="lawyer-stat-card">
              <AnimatedCounter target={settings.stat_count_4 || 15} suffix=" adv." />
              <span className="lawyer-stat-label">{settings.stat_label_4 || 'Especialistas'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CORP JURÍDICO (TEAM) */}
      <section id="equipe" className="lawyer-section" style={{ backgroundColor: settings.body_bg_color ? 'var(--bg-card)' : 'rgb(8, 14, 25)' }}>
        <div className="lawyer-container">
          <div className="lawyer-section-header reveal active">
            <span className="lawyer-section-tag">{settings.team_tag || "Corpo Jurídico"}</span>
            <h2 className="lawyer-section-title">{settings.team_title || "Sócios & Associados Sêniores"}</h2>
            <div className="gold-separator"></div>
            <p className="lawyer-section-subtitle">
              {settings.team_subtitle || "Conheça os especialistas dedicados a prover representação jurídica do mais alto escalão técnico."}
            </p>
          </div>

          {settings.team_layout === 'individual' && teamList.length > 0 ? (
            <div className="lawyer-about-grid" style={{ alignItems: 'center' }}>
              {/* LEFT COLUMN: LARGE PHOTO */}
              <div className="lawyer-about-visual reveal active">
                <div className="lawyer-about-frame" style={{ maxWidth: '440px', padding: '12px', border: '1px solid var(--accent-gold-border)' }}>
                  <img 
                    src={teamList[0].avatar} 
                    alt={teamList[0].name} 
                    className="lawyer-about-img"
                    style={{ borderRadius: 'var(--radius-card)', width: '100%', aspectRatio: '1 / 1', objectFit: 'cover' }}
                  />
                </div>
              </div>
              
              {/* RIGHT COLUMN: BIOGRAPHY / DETAILS */}
              <div className="lawyer-about-content reveal active" style={{ textAlign: 'left' }}>
                <span className="lawyer-team-role" style={{ fontSize: '0.95rem', letterSpacing: '0.15em', marginBottom: '0.5rem', display: 'inline-block' }}>
                  {teamList[0].role}
                </span>
                <h3 className="lawyer-team-name" style={{ fontSize: '2.5rem', fontWeight: 600, color: '#ffffff', marginBottom: '1.25rem', fontFamily: 'var(--font-title)' }}>
                  {teamList[0].name}
                </h3>
                <div className="gold-separator-left"></div>
                
                <p className="lawyer-about-text" style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginTop: '1.5rem' }}>
                  {teamList[0].desc}
                </p>
              </div>
            </div>
          ) : (
            <div className="lawyer-team-grid">
              {teamList.map((member: any) => (
                <div key={member.id} className="lawyer-team-card reveal active">
                  <div className="lawyer-team-img-container">
                    <img src={member.avatar} alt={member.name} className="lawyer-team-img" />
                  </div>
                  <div className="lawyer-team-info">
                    <h3 className="lawyer-team-name">{member.name}</h3>
                    <span className="lawyer-team-role">{member.role}</span>
                    <div className="gold-separator" style={{ width: '40px', margin: '0.75rem auto' }}></div>
                    <p className="lawyer-team-desc">{member.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 7. TESTIMONIALS */}
      <section id="depoimentos" className="lawyer-section" style={{ backgroundColor: 'var(--bg-dark)' }}>
        <div className="lawyer-container">
          <div className="lawyer-section-header reveal active">
            <span className="lawyer-section-tag">{settings.testimonials_tag || "Reconhecimento"}</span>
            <h2 className="lawyer-section-title">{settings.testimonials_title || "Depoimentos dos Representados"}</h2>
            <div className="gold-separator"></div>
            <p className="lawyer-section-subtitle">
              {settings.testimonials_subtitle || "A confiança demonstrada por nossos clientes individuais e corporativos reflete nosso compromisso com a integridade."}
            </p>
          </div>

          <div className="lawyer-testimonials-grid">
            {testimonials.map((test: any) => (
              <div key={test.id} className="lawyer-testimonial-card reveal active">
                <div className="lawyer-testimonial-stars">
                  {[...Array(test.rating)].map((_, i) => (
                    <Star key={i} size={15} fill={primaryColor} stroke={primaryColor} />
                  ))}
                </div>
                
                <blockquote className="lawyer-testimonial-quote">
                  "{test.text}"
                </blockquote>
                
                <div className="lawyer-testimonial-user">
                  <img src={test.avatar} alt={test.name} className="lawyer-testimonial-avatar" />
                  <div>
                    <h4 className="lawyer-testimonial-name">{test.name}</h4>
                    <span className="lawyer-testimonial-company">{test.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. CTA CALLOUT */}
      <section className="lawyer-cta" style={{
        backgroundColor: settings.cta_bg_color || undefined,
        backgroundImage: settings.cta_bg_color ? 'none' : undefined,
        borderTop: settings.cta_bg_color ? 'none' : undefined,
        borderBottom: settings.cta_bg_color ? 'none' : undefined
      }}>
        <div className="lawyer-container">
          <div className="lawyer-cta-card reveal active">
            <h2 className="lawyer-cta-title" style={{ color: settings.cta_title_color || undefined }}>
              {settings.cta_title || "Necessita de Defesa ou Consultoria Especializada?"}
            </h2>
            <p className="lawyer-cta-desc" style={{ color: settings.cta_desc_color || undefined }}>
              {settings.cta_subtitle || "Relate os fatos iniciais de sua causa para nossa equipe jurídica realizar uma triagem prévia confidencial ou agende um alinhamento online com nossos sócios especialistas."}
            </p>
            <div className="lawyer-cta-buttons">
              <a 
                href={`https://wa.me/55${storeWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Gostaria de agendar uma consulta jurídica para avaliar um caso.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold-primary gold-pulse"
                style={{ 
                  display: 'inline-flex', 
                  gap: '0.5rem', 
                  padding: '1rem 2.5rem',
                  backgroundColor: settings.cta_button_bg_color || undefined,
                  color: settings.cta_button_text_color || undefined,
                  borderColor: settings.cta_button_bg_color || undefined
                }}
              >
                <MessageSquare size={18} />
                <span>{settings.cta_btn_text_1 || "Conversar com Advogado"}</span>
              </a>
              <a 
                href="#areas"
                className="btn-gold-secondary"
                style={{ 
                  padding: '1rem 2.5rem',
                  color: settings.cta_button_2_text_color || undefined,
                  borderColor: settings.cta_button_2_text_color || undefined
                }}
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById('areas')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                <span>{settings.cta_btn_text_2 || "Ver Áreas de Atuação"}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <StoreFooter store={store} settings={settings} primaryColor={primaryColor} buttonRadius={buttonRadius} />

      {/* 10. CASE INTAKE LEAD MODAL */}
      {activeService && (
        <div className="modal-overlay open" onClick={() => setActiveService(null)} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(5, 8, 15, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '1rem'
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-card)',
            border: '1px solid var(--accent-gold-border)',
            width: '100%',
            maxWidth: '560px',
            overflow: 'hidden',
            boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.8)',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            
            {/* Modal Hero Banner */}
            <div 
              style={{ 
                backgroundImage: `linear-gradient(180deg, rgba(20, 30, 48, 0.4) 0%, rgba(20, 30, 48, 0.95) 100%), url(${activeService.images?.[0] || activeService.image_url || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '160px',
                width: '100%',
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '1.5rem'
              }}
            >
              {/* Close Button */}
              <button 
                onClick={() => setActiveService(null)} 
                aria-label="Fechar"
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'rgba(10, 17, 30, 0.8)',
                  border: '1px solid var(--accent-gold-border)',
                  color: 'var(--accent-gold)',
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

              <div>
                <span style={{ color: '#000000', background: primaryColor, padding: '0.2rem 0.75rem', borderRadius: '2px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', display: 'inline-block', marginBottom: '0.5rem' }}>
                  {activeService.category || 'Especialidade'}
                </span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 600, margin: '0', color: '#ffffff', lineHeight: 1.2 }}>
                  {activeService.name}
                </h3>
              </div>
            </div>

            {/* Modal Form */}
            <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem', fontStyle: 'italic' }}>
                {activeService.description || 'Preencha o formulário confidencial de triagem de caso abaixo. As informações serão remetidas de forma direta e protegida ao nosso WhatsApp corporativo.'}
              </p>
              
              <h4 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid var(--accent-gold-border)', paddingBottom: '0.4rem', marginBottom: '1.25rem', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Relatório de Consulta Inicial
              </h4>
              
              <form onSubmit={handleLeadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label htmlFor="form-name" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nome Completo</label>
                  <input
                    id="form-name"
                    name="name"
                    type="text"
                    placeholder="Ex: Dr. José da Silva"
                    value={leadFormData.name}
                    onChange={(e) => setLeadFormData(prev => ({ ...prev, name: e.target.value }))}
                    style={{ padding: '0.75rem', border: '1px solid var(--accent-gold-border)', borderRadius: '4px', fontSize: '0.9rem', backgroundColor: 'var(--bg-dark)', color: '#ffffff' }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label htmlFor="form-phone" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>WhatsApp</label>
                    <input
                      id="form-phone"
                      name="phone"
                      type="tel"
                      placeholder="Ex: (11) 99999-9999"
                      value={leadFormData.phone}
                      onChange={(e) => setLeadFormData(prev => ({ ...prev, phone: e.target.value }))}
                      style={{ padding: '0.75rem', border: '1px solid var(--accent-gold-border)', borderRadius: '4px', fontSize: '0.9rem', backgroundColor: 'var(--bg-dark)', color: '#ffffff' }}
                      required
                    />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label htmlFor="form-email" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>E-mail</label>
                    <input
                      id="form-email"
                      name="email"
                      type="email"
                      placeholder="Ex: jose@email.com"
                      value={leadFormData.email}
                      onChange={(e) => setLeadFormData(prev => ({ ...prev, email: e.target.value }))}
                      style={{ padding: '0.75rem', border: '1px solid var(--accent-gold-border)', borderRadius: '4px', fontSize: '0.9rem', backgroundColor: 'var(--bg-dark)', color: '#ffffff' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label htmlFor="form-urgency" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Urgência do Caso</label>
                  <select
                    id="form-urgency"
                    name="urgency"
                    value={leadFormData.urgency}
                    onChange={(e) => setLeadFormData(prev => ({ ...prev, urgency: e.target.value }))}
                    style={{ padding: '0.75rem', border: '1px solid var(--accent-gold-border)', borderRadius: '4px', fontSize: '0.9rem', backgroundColor: 'var(--bg-dark)', color: '#ffffff', cursor: 'pointer' }}
                  >
                    <option value="baixo" style={{ background: 'var(--bg-dark)' }}>Consulta Preventiva / Dúvidas Gerais</option>
                    <option value="medio" style={{ background: 'var(--bg-dark)' }}>Recomendação de Medida Legal Recente</option>
                    <option value="alto" style={{ background: 'var(--bg-dark)' }}>Prazo Processual Correndo / Urgente!</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label htmlFor="form-details" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resumo da Causa (Opcional)</label>
                  <textarea
                    id="form-details"
                    name="details"
                    placeholder="Ex: Descreva resumidamente os fatos ou data de recebimento da intimação..."
                    value={leadFormData.details}
                    onChange={(e) => setLeadFormData(prev => ({ ...prev, details: e.target.value }))}
                    style={{ padding: '0.75rem', border: '1px solid var(--accent-gold-border)', borderRadius: '4px', fontSize: '0.9rem', backgroundColor: 'var(--bg-dark)', color: '#ffffff', minHeight: '80px', fontFamily: 'inherit', resize: 'vertical' }}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-gold-primary" 
                  style={{ width: '100%', padding: '0.9rem', marginTop: '0.5rem' }}
                >
                  <Send size={16} />
                  <span>Transmitir Relatório ao WhatsApp</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING WHATSAPP BUTTON */}
      <WhatsAppFloatingButton settings={settings} />

      {/* PROMOTIONAL POP-UP */}
      <OfferPopup settings={settings} />
    </div>
  )
}
