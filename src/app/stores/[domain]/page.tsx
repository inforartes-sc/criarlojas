import { ShoppingCart, Search, Menu, ShoppingBag, Plus, Star, Zap, ShieldCheck, Truck, Headphones, RefreshCw, CreditCard } from 'lucide-react'
import Link from 'next/link'
import BenefitIcon from '@/components/BenefitIcon'
import StoreHeader from '@/components/Storefront/StoreHeader'

export const dynamic = 'force-dynamic'
import ProductCard from '@/components/Storefront/ProductCard'
import FeaturedCarousel from '@/components/Storefront/FeaturedCarousel'
import StoreFooter from '@/components/Storefront/StoreFooter'
import { supabase } from '@/lib/supabase'
import ServicesStorefrontClient from '@/components/Storefront/ServicesStorefrontClient'
import LawyerStorefrontClient from '@/components/Storefront/LawyerStorefrontClient'
import WhatsAppFloatingButton from '@/components/Storefront/WhatsAppFloatingButton'
import OfferPopup from '@/components/Storefront/OfferPopup'

async function getStoreData(domain: string) {
  const subdomainOnly = domain.split('.')[0]
  const { data } = await supabase
    .from('stores')
    .select('*')
    .or(`subdomain.eq.${subdomainOnly},subdomain.eq.${domain},custom_domain.eq.${domain}`)
    .single()
  return data
}

async function getPlatformSettings() {
  const { data } = await supabase
    .from('stores')
    .select('settings')
    .eq('subdomain', 'platform-settings')
    .maybeSingle()
  return data?.settings || {}
}

async function getProducts(storeId: string) {
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', storeId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  return data || []
}

async function getCategories(storeId: string) {
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('store_id', storeId)
    .order('name')
  return data || []
}

export default async function StoreFront({ params, searchParams }: { params: Promise<{ domain: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const categoryFilter = resolvedSearchParams.category as string | undefined
  const [store, platformSettings] = await Promise.all([
    getStoreData(resolvedParams.domain),
    getPlatformSettings()
  ])

  if (platformSettings?.maintenanceMode) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#f8fafc',
        fontFamily: 'Inter, system-ui, sans-serif',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '500px',
          width: '100%',
          padding: '3rem',
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(16px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '2px solid #f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 2rem',
            color: '#f59e0b',
            animation: 'pulse 2s infinite'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-1px' }}>Manutenção Temporária</h2>
          <p style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            Nossa plataforma está passando por uma manutenção programada para melhoria dos nossos serviços. Voltaremos a operar normalmente em breve!
          </p>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Agradecemos a sua paciência e compreensão.
          </div>
        </div>
        <style>{`
          @keyframes pulse {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
            70% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(245, 158, 11, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
          }
        `}</style>
      </div>
    )
  }

  if (!store) return <div style={{ textAlign: 'center', padding: '5rem' }}>Loja não encontrada</div>

  const [allProductsRaw, categories] = await Promise.all([
    getProducts(store.id),
    getCategories(store.id)
  ])

  // Aplicar filtro de categoria se selecionado
  const searchFilter = resolvedSearchParams.search as string | undefined

  let allProducts = categoryFilter 
    ? allProductsRaw.filter(p => p.category === categoryFilter) 
    : allProductsRaw

  if (searchFilter) {
    const searchLower = searchFilter.toLowerCase()
    allProducts = allProducts.filter(p => 
      p.name.toLowerCase().includes(searchLower) || 
      (p.description && p.description.toLowerCase().includes(searchLower))
    )
  }

  const newArrivals = allProductsRaw.slice(0, 4) // Mantém as novidades originais mesmo com filtro
  const flashDeals = allProducts.filter(p => {
    if (p.sale_price) return true
    if (p.has_variations && p.variation_skus?.length > 0) {
      return p.variation_skus.some((v: any) => v.sale_price && parseFloat(v.sale_price) > 0)
    }
    return false
  }).slice(0, 4)
  const featuredProducts = allProductsRaw.filter(p => p.is_featured)
  const settings = store.settings || {}

  // Estilos Dinâmicos
  const primaryColor = settings.primary_color || '#6366f1'
  const buttonColor = settings.button_color || '#000000'
  const buttonTextColor = settings.button_text_color || '#ffffff'
  const buttonHoverColor = settings.button_hover_color || '#333333'
  const buttonHoverTextColor = settings.button_hover_text_color || '#ffffff'
  const buttonVariant = settings.button_variant || 'filled'
  const buttonHoverVariant = settings.button_hover_variant || 'filled'
  
  const salePriceColor = settings.sale_price_color || '#ef4444'
  const normalPriceColor = settings.normal_price_color || '#888888'
  const defaultPriceColor = settings.default_price_color || '#000000'
  const headerBg = settings.header_bg_color || '#ffffff'
  const topBarBg = settings.top_bar_bg_color || '#000000'
  const topBarText = settings.top_bar_text_color || '#ffffff'
  const fontFamily = settings.font_family || 'Inter'
  const buttonRadius = settings.button_style === 'pill' ? '100px' : settings.button_style === 'sharp' ? '0px' : '8px'
  const headerStyle = settings.header_style || 'modern'
  const heroStyle = settings.hero_style || 'split'
  const showNewArrivals = settings.show_new_arrivals !== undefined ? settings.show_new_arrivals : true
  const newArrivalsTitle = settings.new_arrivals_title || 'Novidades'
  const flashDealsTitle = settings.flash_deals_title || 'Ofertas do Dia'
  const heroBgImage = settings.hero_image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1600'
  const showHeroText = settings.show_hero_text !== undefined ? settings.show_hero_text : true
  const layoutModel = settings.layout_model || 'modern'
  const themeMode = settings.theme_mode || (layoutModel === 'tech' ? 'dark' : 'light')
  const isDark = themeMode === 'dark'
  const heroBgColor = settings.hero_bg_color || (settings.body_bg_color || (isDark ? '#0a0a0a' : layoutModel === 'fashion' ? '#f8f8f8' : 'transparent'))
  const splitBgColor = settings.hero_bg_color && settings.hero_bg_color !== 'transparent' ? settings.hero_bg_color : (settings.body_bg_color || (isDark ? '#0a0a0a' : '#f1f5f9e6'))
  const heroTitleColor = settings.hero_title_color || (isDark ? '#ffffff' : '#111111')
  const heroSubtitleColor = settings.hero_subtitle_color || (isDark ? '#cbd5e1' : '#555555')
  const plan = store?.settings?.plan || 'basic'
  const storeMode = plan === 'basic' ? 'catalogo' : (settings.store_mode || 'loja')
  const storeWhatsapp = settings.whatsapp || ''
  const isCatalogo = storeMode === 'catalogo'
  const isProductsView = resolvedSearchParams.view === 'produtos' || !!categoryFilter

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

  const benefits = settings.benefits || [
    { title: 'Entrega Rápida', subtitle: 'Calcule o prazo no checkout' },
    { title: 'Compra Segura', subtitle: 'Ambiente 100% protegido' },
    { title: 'Troca Fácil', subtitle: '7 dias para devolução' },
    { title: 'Pagamento Facilitado', subtitle: 'Em até 12x no cartão' }
  ]

  if (layoutModel === 'services' || layoutModel === 'aura' || layoutModel === 'electrician') {
    return (
      <ServicesStorefrontClient
        store={store}
        products={allProductsRaw}
        categories={categories}
        resolvedSearchParams={resolvedSearchParams}
      />
    )
  }



  if (layoutModel === 'lawyer' || layoutModel === 'advocacia' || layoutModel === 'advocacy') {
    return (
      <LawyerStorefrontClient
        store={store}
        products={allProductsRaw}
        categories={categories}
        resolvedSearchParams={resolvedSearchParams}
      />
    )
  }

  const activeCampaign = settings.promotions?.active_campaign || { active: false, title: '', subtitle: '', bg_color: '#ef4444', text_color: '#ffffff', product_ids: [] }
  const campaignProducts = activeCampaign.active && activeCampaign.product_ids?.length > 0
    ? allProductsRaw.filter(p => activeCampaign.product_ids.includes(p.id))
    : []

  return (
    <div style={{ 
      backgroundColor: settings.body_bg_color || (isDark ? '#0a0a0a' : '#f1f5f9e6'), 
      color: isDark ? '#f8fafc' : '#111', 
      minHeight: '100vh', 
      fontFamily: `${fontFamily}, system-ui, sans-serif` 
    }}>
      {/* Injeção de CSS Dinâmico para Hover e Variantes */}
      <style>{`
        body { background-color: ${settings.body_bg_color || (isDark ? '#0a0a0a' : '#f1f5f9e6')} !important; }
        .product-card-wrapper {
          ${settings.card_bg_color ? `background-color: ${settings.card_bg_color} !important;` : ''}
          ${settings.card_bg_color ? `padding: 1.25rem !important; border-radius: 16px !important; border: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'} !important;` : ''}
        }

        .btn-buy-dynamic {
          background-color: ${buttonVariant === 'filled' ? buttonColor : 'transparent'} !important;
          color: ${buttonVariant === 'filled' ? buttonTextColor : buttonColor} !important;
          border: ${buttonVariant === 'outline' ? `2px solid ${buttonColor}` : 'none'} !important;
          transition: all 0.3s ease !important;
        }
        .btn-buy-dynamic:hover {
          background-color: ${buttonHoverVariant === 'filled' ? buttonHoverColor : 'transparent'} !important;
          color: ${buttonHoverVariant === 'filled' ? buttonHoverTextColor : buttonHoverColor} !important;
          border: ${buttonHoverVariant === 'outline' ? `2px solid ${buttonHoverColor}` : 'none'} !important;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .btn-fashion-hero:hover {
          background-color: ${primaryColor} !important;
        }
        .category-card { transition: all 0.3s ease; }
        .category-card:hover { transform: translateY(-5px); }
        .category-img-container { transition: all 0.4s ease; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 2px solid transparent !important; }
        .category-card:hover .category-img-container { box-shadow: 0 12px 25px rgba(0,0,0,0.08); border-color: ${primaryColor} !important; }
        .category-card img { transition: transform 0.5s ease; }
        .category-card:hover .category-title { color: ${primaryColor} !important; }
         section { background-color: ${settings.body_bg_color || (isDark ? '#0a0a0a' : '#f1f5f9e6')}; color: ${isDark ? '#f8fafc' : '#111'}; }
         .glass-card { background-color: ${isDark ? '#0a0a0a' : '#ffffff'} !important; color: ${isDark ? '#f8fafc' : '#111'} !important; }
        .product-card { 
          border-color: ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'} !important; 
          background-color: ${isDark ? 'rgba(255,255,255,0.03)' : '#ffffff'} !important; 
        }

        /* ============================================================
           RESPONSIVIDADE MOBILE — LOJA VIRTUAL
        ============================================================ */

        /* Grids de produtos: 4 colunas → 2 colunas no mobile */
        .products-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 3rem;
        }
        .products-grid-4-wide {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 5rem 3rem;
        }

        /* Benefits: 4 → 2 colunas no mobile */
        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          padding: 1.5rem 3rem;
          background-color: ${settings.benefits_bg_color || (isDark ? 'rgba(255,255,255,0.03)' : '#f9fafb')} !important;
          border-radius: 16px;
          border: ${isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #eaeaea'};
        }

        /* Hero split: 2 colunas → 1 coluna no mobile */
        .hero-split-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          align-items: center;
          gap: 4rem;
        }

        /* Featured carousel section */
        .featured-two-col {
          display: grid;
          grid-template-columns: 1fr 500px;
          gap: 4rem;
          align-items: center;
        }

        /* Section padding padrão */
        .section-pad { padding: 8rem 2rem; }
        .section-pad-sm { padding: 3rem 2rem 6rem 2rem; }
        .section-pad-flash { padding: 6rem 2rem; }

        /* Hero heights */
        .hero-full { height: 80vh; }
        .hero-minimalist { height: 60vh; }
        .hero-left { height: 80vh; }

        /* Hero title sizes */
        .hero-title-lg { font-size: 4.5rem; }
        .hero-title-md { font-size: 4rem; }
        .section-title-lg { font-size: 3.5rem; }
        .section-title-md { font-size: 2.5rem; }
        .premium-title { font-size: 4rem; }
        .campaign-title { font-size: 3.5rem; }

        /* Category scroll row on mobile */
        .categories-row {
          display: flex;
          justify-content: center;
          gap: 4rem;
          overflow-x: auto;
          padding-bottom: 1rem;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          ${settings.hero_image_mobile_url ? `
            .hero-full {
              background-image: ${showHeroText ? `linear-gradient(${overlayColor55}, ${overlayColor55}), url(${settings.hero_image_mobile_url})` : `url(${settings.hero_image_mobile_url})`} !important;
            }
            .hero-left {
              background-image: linear-gradient(0deg, ${splitBgColor} 0%, ${splitBgColor} 40%, transparent 100%), url(${settings.hero_image_mobile_url}) !important;
            }
            .hero-split-img-card {
              background-image: url(${settings.hero_image_mobile_url}) !important;
            }
          ` : ''}

          /* Grids → 2 colunas */
          .products-grid-4,
          .products-grid-4-wide {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 1rem !important;
          }

          /* Benefits → 2 colunas */
          .benefits-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 1.25rem !important;
            padding: 1.25rem !important;
          }

          /* Hero split → coluna única */
          .hero-split-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }

          /* Ocultar imagem do hero split no mobile */
          .hero-split-img { display: none !important; }

          /* Featured 2 cols → 1 col */
          .featured-two-col {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }

          /* Padding reduzido */
          .section-pad { padding: 3rem 1rem !important; }
          .section-pad-sm { padding: 2rem 1rem 3rem 1rem !important; }
          .section-pad-flash { padding: 3rem 1rem !important; }

          /* Altura do hero reduzida */
          .hero-full { height: 55vh !important; }
          .hero-minimalist { height: auto !important; min-height: 280px !important; padding: 3rem 1.5rem !important; }
          .hero-left { height: auto !important; min-height: 300px !important; padding: 3rem 1.5rem !important; }

          /* Fontes menores */
          .hero-title-lg { font-size: 2.2rem !important; letter-spacing: -1px !important; }
          .hero-title-md { font-size: 2rem !important; letter-spacing: -1px !important; }
          .section-title-lg { font-size: 2rem !important; letter-spacing: -1px !important; }
          .section-title-md { font-size: 1.6rem !important; letter-spacing: -0.5px !important; }
          .premium-title { font-size: 2rem !important; letter-spacing: -1px !important; }
          .campaign-title { font-size: 2rem !important; letter-spacing: -1px !important; }

          /* Título da seção all products */
          .all-products-title { font-size: 2rem !important; letter-spacing: -1px !important; }

          /* Categorias */
          .categories-row {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 2rem 1rem !important;
            justify-items: center !important;
            padding-left: 0 !important;
          }

          /* Seção de novidades e all products: padding menor */
          #produtos { padding: 3rem 1rem !important; }

          /* Nova seção Toda a Loja */
          .toda-loja-section { padding: 3rem 1rem !important; }

          /* Hero subtitle */
          .hero-subtitle { font-size: 0.95rem !important; margin-bottom: 2rem !important; }

          /* Seção premium */
          .premium-section { padding: 4rem 1rem !important; }

          /* Campaign section */
          .campaign-section { padding: 3rem 1rem !important; }

          /* Section header (título + link ver mais) */
          .section-header-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 0.75rem !important;
            margin-bottom: 2rem !important;
          }

          /* WhatsApp floating btn */
          .whatsapp-floating-btn {
            width: 52px !important;
            height: 52px !important;
            bottom: 1.25rem !important;
            right: 1rem !important;
          }
          .back-to-top-floating {
            bottom: 5rem !important;
            right: 1rem !important;
            width: 44px !important;
            height: 44px !important;
          }
        }

        @media (max-width: 480px) {
          .products-grid-4,
          .products-grid-4-wide {
            gap: 0.75rem !important;
          }
          .hero-title-lg { font-size: 1.9rem !important; }
          .section-title-lg { font-size: 1.75rem !important; }
        }
      `}</style>
      
      {/* 1. INTERACTIVE HEADER */}
      <StoreHeader store={store} settings={settings} primaryColor={primaryColor} categories={categories} />


      <main>
        {!isProductsView && (
          <>
            {/* 2. HERO BANNER */}
            {!isCatalogo && (
                  heroStyle === 'split' ? (
                  <section style={{ 
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
                        <h2 style={{ fontSize: '4.5rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '2rem', color: heroTitleColor, letterSpacing: '-2px' }}>
                          {settings.hero_title || 'REDEFINA SEU CONCEITO'}
                        </h2>
                        <p style={{ fontSize: '1.15rem', color: heroSubtitleColor, marginBottom: '3.5rem', lineHeight: 1.6 }}>
                          {settings.hero_subtitle || 'Explore nossa curadoria especial para elevar sua experiência.'}
                        </p>
                        <div>
                          <Link href="?view=produtos" className="btn-buy-dynamic" style={{ 
                            display: 'inline-block',
                            padding: '1.2rem 3rem',
                            textDecoration: 'none',
                            fontSize: '0.85rem',
                            fontWeight: 800,
                            borderRadius: buttonRadius,
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                          }}>
                            SAIBA MAIS
                          </Link>
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
                      <div className="hero-split-img-card" style={{ 
                        width: '100%', 
                        height: '55vh',
                        backgroundImage: `url(${heroBgImage})`, 
                        backgroundSize: 'cover', 
                        backgroundPosition: 'center',
                        borderRadius: '24px',
                        boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.5)' : '0 20px 40px rgba(0,0,0,0.08)',
                        border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.03)'
                      }} />
                    </div>
                  </section>
                ) : heroStyle === 'left-aligned' ? (
                  <section className="hero-left" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    backgroundColor: splitBgColor,
                    backgroundImage: `linear-gradient(90deg, ${splitBgColor} 0%, ${splitBgColor} 40%, transparent 100%), url(${heroBgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    padding: '0 8%',
                    color: heroTitleColor
                  }}>
                    {showHeroText && (
                      <div style={{ maxWidth: '600px', textAlign: 'left' }}>
                        <h2 className="hero-title-lg" style={{ fontWeight: 900, lineHeight: 1.1, marginBottom: '2rem', color: heroTitleColor, letterSpacing: '-2px' }}>
                          {settings.hero_title || 'REDEFINA SEU CONCEITO'}
                        </h2>
                        <p className="hero-subtitle" style={{ fontSize: '1.15rem', color: heroSubtitleColor, marginBottom: '3.5rem', lineHeight: 1.6 }}>
                          {settings.hero_subtitle || 'Explore nossa curadoria especial para elevar sua experiência.'}
                        </p>
                        <Link href="?view=produtos" className="btn-buy-dynamic" style={{ 
                           display: 'inline-block',
                           padding: '1.2rem 3rem',
                           textDecoration: 'none',
                           fontSize: '0.85rem',
                           fontWeight: 800,
                           borderRadius: buttonRadius,
                           textTransform: 'uppercase',
                           letterSpacing: '1px'
                        }}>
                          SAIBA MAIS
                        </Link>
                      </div>
                    )}
                  </section>
                ) : heroStyle === 'minimalist' ? (
                  <section className="hero-minimalist" style={{ 
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
                        <h2 className="hero-title-md" style={{ fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem', color: heroTitleColor, letterSpacing: '-2px' }}>
                          {settings.hero_title || 'REDEFINA SEU CONCEITO'}
                        </h2>
                        <p className="hero-subtitle" style={{ fontSize: '1.2rem', color: heroSubtitleColor, marginBottom: '2.5rem', lineHeight: 1.6, maxWidth: '650px' }}>
                          {settings.hero_subtitle || 'Explore nossa curadoria especial para elevar sua experiência.'}
                        </p>
                        <Link href="?view=produtos" className="btn-buy-dynamic" style={{ 
                          display: 'inline-block',
                          padding: '1.2rem 3rem',
                          textDecoration: 'none',
                          fontSize: '0.85rem',
                          fontWeight: 800,
                          borderRadius: buttonRadius,
                          textTransform: 'uppercase',
                          letterSpacing: '1px'
                        }}>
                          SAIBA MAIS
                        </Link>
                      </div>
                    )}
                  </section>
                ) : (
                  // Default "full" / full width banner
                  <section className="hero-full" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    padding: '0 5%', 
                    backgroundImage: showHeroText ? `linear-gradient(${overlayColor55}, ${overlayColor55}), url(${heroBgImage})` : `url(${heroBgImage})`, 
                    backgroundColor: showHeroText ? heroBgColor : 'transparent',
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center', 
                    color: heroTitleColor,
                    textAlign: 'center'
                  }}>
                    {showHeroText && (
                      <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <h2 className="hero-title-lg" style={{ fontWeight: 900, lineHeight: 1.1, marginBottom: '2rem', letterSpacing: '-2px', color: heroTitleColor }}>
                          {settings.hero_title || 'REDEFINA SEU CONCEITO'}
                        </h2>
                        <p className="hero-subtitle" style={{ fontSize: '1.25rem', marginBottom: '3.5rem', opacity: 0.95, maxWidth: '700px', margin: '0 auto 3.5rem auto', lineHeight: 1.7, color: heroSubtitleColor }}>
                          {settings.hero_subtitle || 'Explore nossa curadoria especial para elevar sua experiência.'}
                        </p>
                        <Link href="?view=produtos" className="btn-buy-dynamic" style={{ 
                          display: 'inline-block', 
                          padding: '1.2rem 3rem', 
                          borderRadius: buttonRadius, 
                          fontWeight: 800, 
                          fontSize: '0.85rem', 
                          cursor: 'pointer', 
                          letterSpacing: '2px', 
                          textTransform: 'uppercase',
                          textDecoration: 'none'
                        }}>
                          SAIBA MAIS
                        </Link>
                      </div>
                    )}
                  </section>
                )
            )}

        {/* 2.1 BENEFITS (Movido para cima para dar espaçamento perfeito entre o banner e a campanha) */}
        {!isCatalogo && (
          <section style={{ padding: '2rem 1rem' }}>
            <div className="benefits-grid" style={{ maxWidth: '1400px', margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ color: primaryColor }}><BenefitIcon name={benefits[0]?.icon} color={primaryColor} /></div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.3rem' }}>{benefits[0]?.title || 'Entrega Rápida'}</p>
                  <p style={{ fontSize: '0.85rem', color: isDark ? '#cbd5e1' : '#666', lineHeight: 1.4 }}>{benefits[0]?.subtitle || 'Calcule o prazo no checkout'}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ color: primaryColor }}><BenefitIcon name={benefits[1]?.icon} color={primaryColor} /></div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.3rem' }}>{benefits[1]?.title || 'Compra Segura'}</p>
                  <p style={{ fontSize: '0.85rem', color: isDark ? '#cbd5e1' : '#666', lineHeight: 1.4 }}>{benefits[1]?.subtitle || 'Ambiente 100% protegido'}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ color: primaryColor }}><BenefitIcon name={benefits[2]?.icon} color={primaryColor} /></div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.3rem' }}>{benefits[2]?.title || 'Troca Fácil'}</p>
                  <p style={{ fontSize: '0.85rem', color: isDark ? '#cbd5e1' : '#666', lineHeight: 1.4 }}>{benefits[2]?.subtitle || '7 dias para devolução'}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ color: primaryColor }}><BenefitIcon name={benefits[3]?.icon} color={primaryColor} /></div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.3rem' }}>{benefits[3]?.title || 'Pagamento Facilitado'}</p>
                  <p style={{ fontSize: '0.85rem', color: isDark ? '#cbd5e1' : '#666', lineHeight: 1.4 }}>{benefits[3]?.subtitle || 'Em até 12x no cartão'}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 2.2 CAMPANHA / PROMOÇÃO ATIVA */}
        {!isCatalogo && campaignProducts.length > 0 && (
          <section style={{ padding: '5rem 2rem', backgroundColor: activeCampaign.bg_color || '#ef4444', color: activeCampaign.text_color || '#ffffff' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.4rem 1.2rem', borderRadius: '100px', marginBottom: '1.25rem', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
                  <Zap size={16} /> Campanha Especial
                </div>
                <h3 style={{ fontSize: '3.5rem', fontWeight: 900, margin: '0 0 1rem 0', letterSpacing: '-1.5px' }}>{activeCampaign.title || 'Promoção Especial'}</h3>
                {activeCampaign.subtitle && <p style={{ fontSize: '1.2rem', opacity: 0.9, maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>{activeCampaign.subtitle}</p>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '3rem' }}>
                {campaignProducts.map(product => <ProductCard key={product.id} product={product} buttonRadius={buttonRadius} salePriceColor={salePriceColor} normalPriceColor={normalPriceColor} defaultPriceColor={defaultPriceColor} layoutModel={layoutModel} storeMode={storeMode} storeWhatsapp={storeWhatsapp} isCampaign={true} campaignBgColor={activeCampaign.bg_color || '#ef4444'} primaryColor={buttonColor} themeMode={themeMode} />)}
              </div>
            </div>
          </section>
        )}

        {/* 3. CATEGORIES */}
        {!isCatalogo && categories.length > 0 && (
          <section style={{ padding: '3rem 1.5rem 2rem 1.5rem' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
              <div className="categories-row">
                {categories.map(cat => (
                  <Link key={cat.id} href={`?category=${cat.name}#produtos`} className="category-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', textAlign: 'center', cursor: 'pointer', minWidth: '110px' }}>
                    <div className="category-img-container" style={{ width: layoutModel === 'fashion' ? '140px' : '110px', height: layoutModel === 'fashion' ? '140px' : '110px', borderRadius: buttonRadius, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff', border: '1px solid rgba(0,0,0,0.05)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                      {cat.image_url ? <img src={cat.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ShoppingBag size={28} color="#999" />}
                    </div>
                    <span className="category-title" style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: isDark ? '#cbd5e1' : '#333' }}>{cat.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 3.1 FEATURED CAROUSEL (CARROSSEL DE DESTAQUES AUTOMÁTICO) */}
        {!isCatalogo && featuredProducts.length > 0 && (
          <section className="section-pad" style={{ overflow: 'hidden' }}>
            <div className="featured-two-col" style={{ maxWidth: '1200px', margin: '0 auto', justifyContent: 'center' }}>
              {/* Texto de Destaque */}
              <div className="animate-fade-in" style={{ paddingLeft: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: primaryColor, marginBottom: '1.5rem' }}>
                  <Star size={24} fill={primaryColor} />
                  <span style={{ fontWeight: 900, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '3px' }}>Exclusivo</span>
                </div>
                <h3 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '2rem', lineHeight: 1.1, letterSpacing: '-2px' }}>
                  Nossa Seleção <br />
                  <span style={{ color: primaryColor }}>Premium</span>
                </h3>
                <p style={{ fontSize: '1.2rem', color: isDark ? '#cbd5e1' : '#666', lineHeight: 1.8, marginBottom: '3rem', maxWidth: '450px' }}>
                  Descubra itens selecionados para elevar sua experiência. Uma curadoria especial pensada no seu estilo.
                </p>
                <Link href="#colecao-premium" style={{ 
                  display: 'inline-block',
                  padding: '1rem 2.5rem',
                  border: `2px solid ${primaryColor}`,
                  color: primaryColor,
                  textDecoration: 'none',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  borderRadius: buttonRadius,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  transition: '0.3s'
                }}>
                  Ver Toda a Coleção
                </Link>
              </div>

              {/* Carrossel Automático */}
              <FeaturedCarousel products={featuredProducts} primaryColor={primaryColor} />
            </div>
          </section>
        )}

        {/* 3.5. NEW ARRIVALS (NOVIDADES) */}
        {showNewArrivals && newArrivals.length > 0 && (
          <section className="section-pad-sm" style={{ backgroundColor: settings.body_bg_color || (isDark ? 'transparent' : '#e2e8f0') }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
              <div className="section-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: primaryColor, marginBottom: '0.75rem' }}>
                    <Star size={22} fill={primaryColor} />
                    <span style={{ fontWeight: 900, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Recém Chegados</span>
                  </div>
                  <h3 className="section-title-md" style={{ fontWeight: 900, margin: 0, letterSpacing: '-1.5px' }}>{newArrivalsTitle}</h3>
                </div>
              </div>
              <div className="products-grid-4">
                 {newArrivals.map(product => <ProductCard key={product.id} product={product} buttonRadius={buttonRadius} salePriceColor={salePriceColor} normalPriceColor={normalPriceColor} defaultPriceColor={defaultPriceColor} layoutModel={layoutModel} storeMode={storeMode} storeWhatsapp={storeWhatsapp} primaryColor={buttonColor} themeMode={themeMode} />)}
              </div>
            </div>
          </section>
        )}


        {/* 4. FLASH DEALS */}
        {!isCatalogo && flashDeals.length > 0 && (
          <section className="section-pad-flash">
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
              <div className="section-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: salePriceColor, marginBottom: '0.75rem' }}><Zap size={22} fill={salePriceColor} /><span style={{ fontWeight: 900, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Ofertas Imperdíveis</span></div>
                  <h3 className="section-title-md" style={{ fontWeight: 900, margin: 0, letterSpacing: '-1.5px' }}>{flashDealsTitle}</h3>
                </div>
              </div>
              <div className="products-grid-4">
                 {flashDeals.map(product => <ProductCard key={product.id} product={product} buttonRadius={buttonRadius} salePriceColor={salePriceColor} normalPriceColor={normalPriceColor} defaultPriceColor={defaultPriceColor} layoutModel={layoutModel} storeMode={storeMode} storeWhatsapp={storeWhatsapp} primaryColor={buttonColor} themeMode={themeMode} />)}
              </div>
            </div>
          </section>
        )}

        </>
        )}

        {/* 5. ALL PRODUCTS */}
        <section id="produtos" className="toda-loja-section" style={{ padding: '8rem 2rem' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h3 className="section-title-lg all-products-title" style={{ fontWeight: 900, marginBottom: '1.25rem', letterSpacing: '-2.5px' }}>
                {categoryFilter ? `Categoria: ${categoryFilter}` : 'Toda a Loja'}
              </h3>
              {categoryFilter && (
                <Link href="?#produtos" style={{ color: primaryColor, textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', display: 'block', marginBottom: '1rem' }}>
                  Remover Filtro (Ver Todos)
                </Link>
              )}
              <div style={{ width: '80px', height: '5px', backgroundColor: primaryColor, margin: '0 auto' }} />
            </div>
            <div className="products-grid-4-wide">
               {allProducts.map(product => <ProductCard key={product.id} product={product} buttonRadius={buttonRadius} salePriceColor={salePriceColor} normalPriceColor={normalPriceColor} defaultPriceColor={defaultPriceColor} layoutModel={layoutModel} storeMode={storeMode} storeWhatsapp={storeWhatsapp} primaryColor={buttonColor} themeMode={themeMode} />)}
            </div>
          </div>
        </section>
        {/* 6. COLEÇÃO PREMIUM (PERMANENTE NO FINAL) */}
        {!isCatalogo && featuredProducts.length > 0 && (
          <section id="colecao-premium" className="premium-section" style={{ padding: '8rem 2rem', backgroundColor: settings.body_bg_color || (isDark ? 'transparent' : '#fafafa') }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.8rem', color: primaryColor, marginBottom: '1rem' }}>
                  <Star size={24} fill={primaryColor} />
                  <span style={{ fontWeight: 900, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '4px' }}>Exclusivo</span>
                </div>
                <h3 className="premium-title" style={{ fontWeight: 900, marginBottom: '1.5rem', letterSpacing: '-3px' }}>Coleção Premium</h3>
                <p style={{ color: isDark ? '#cbd5e1' : '#666', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>A seleção definitiva dos nossos melhores produtos, escolhidos para você.</p>
              </div>
              <div className="products-grid-4-wide">
                 {featuredProducts.map(product => <ProductCard key={product.id} product={product} buttonRadius={buttonRadius} salePriceColor={salePriceColor} normalPriceColor={normalPriceColor} defaultPriceColor={defaultPriceColor} layoutModel={layoutModel} storeMode={storeMode} storeWhatsapp={storeWhatsapp} primaryColor={buttonColor} themeMode={themeMode} />)}
              </div>
            </div>
          </section>
        )}


        {/* 7. FOOTER (RODAPÉ) */}
        <StoreFooter store={store} settings={settings} primaryColor={primaryColor} buttonRadius={buttonRadius} />
      </main>

      <WhatsAppFloatingButton settings={settings} />
      <OfferPopup settings={settings} />
    </div>
  )
}
