"use client"

import { useState, useEffect } from 'react'
import { Menu, Search, ShoppingCart, X, ShoppingBag, Phone, MapPin, User, Heart, Plus, Minus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import Script from 'next/script'
import { getCart, removeFromCart, updateQuantity, CartItem } from '@/lib/cartStore'
import { getFavorites, FavoriteItem } from '@/lib/favoriteStore'
import { setStoreSubdomain } from '@/lib/getStoreSubdomain'

const WhatsappIcon = ({ size = 24, color = "currentColor" }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
)

interface StoreHeaderProps {
  store: any
  settings: any
  primaryColor: string
  categories: any[]
}

export default function StoreHeader({ store, settings, primaryColor, categories }: StoreHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false)
  const [isHomePage, setIsHomePage] = useState(true)
  const [homePath, setHomePath] = useState('/')
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([])

  const handleWhatsappClick = () => {
    if (!settings.whatsapp) {
      alert('WhatsApp não configurado pelo lojista.')
      return
    }
    const cleanPhone = settings.whatsapp.replace(/\D/g, '')
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`
    const text = encodeURIComponent(`Olá! Acessei o site da ${store.name || 'loja'} e gostaria de falar com um especialista.`)
    window.open(`https://wa.me/${formattedPhone}?text=${text}`, '_blank')
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname
      const segments = path.split('/').filter(Boolean)
      const isHome = 
        segments.length === 0 || 
        (segments.length === 2 && segments[0] === 'stores')
      
      setIsHomePage(isHome)
      
      let baseHome = '/'
      if (segments.length >= 2 && segments[0] === 'stores') {
        baseHome = `/stores/${segments[1]}`
      }
      setHomePath(baseHome)
    }
  }, [])

  const storeMode = settings.store_mode || 'loja'
  const isCatalogo = storeMode === 'catalogo'

  useEffect(() => {
    if (store?.subdomain) {
      setStoreSubdomain(store.subdomain)
    }
  }, [store?.subdomain])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const faviconUrl = settings.favicon_url || '/favicon.ico';
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = faviconUrl;
    }
  }, [settings.favicon_url])

  useEffect(() => {
    const loadCart = () => {
      setCartItems(getCart())
    }
    loadCart()

    const loadFavorites = () => {
      setFavoriteItems(getFavorites())
    }
    loadFavorites()

    const handleCartUpdated = () => {
      loadCart()
    }
    const handleCartOpened = () => {
      loadCart()
      setIsCartOpen(true)
    }
    const handleFavoritesUpdated = () => {
      loadFavorites()
    }

    window.addEventListener('cartUpdated', handleCartUpdated)
    window.addEventListener('cartOpened', handleCartOpened as EventListener)
    window.addEventListener('favoritesUpdated', handleFavoritesUpdated)
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdated)
      window.removeEventListener('cartOpened', handleCartOpened as EventListener)
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdated)
    }
  }, [])

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0)
  const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)
  const totalFavorites = favoriteItems.length

  const headerStyle = settings.header_style || 'modern'
  const headerBg = settings.header_bg_color || '#ffffff'
  const headerBgTranslucent = (headerBg.startsWith('#') && headerBg.length === 7) ? `${headerBg}e6` : headerBg
  const layoutModel = settings.layout_model || 'modern' // tech, fashion, office, modern
  
  const iconColor = settings.header_icon_color || (layoutModel === 'tech' ? '#ffffff' : (layoutModel === 'office' ? '#334155' : '#000000'))
  const topBarBg = settings.top_bar_bg_color || '#000000'
  const topBarText = settings.top_bar_text_color || '#ffffff'
  const isServicesLayout = layoutModel === 'services' || layoutModel === 'aura' || layoutModel === 'lawyer' || layoutModel === 'advocacia' || layoutModel === 'advocacy' || layoutModel === 'electrician'
  const isApenasServico = ['lawyer', 'advocacia', 'advocacy', 'electrician'].includes(layoutModel)
  const secondaryColor = settings.secondary_color || primaryColor
  const whatsappBtnBg = settings.header_whatsapp_btn_bg || secondaryColor
  const whatsappBtnTextColor = settings.header_whatsapp_btn_text_color || primaryColor
  const whatsappBtnText = settings.header_whatsapp_btn_text || 'Falar com Especialista'
  
  const isDefaultLinks = !settings.header_links || 
    (Array.isArray(settings.header_links) && 
     settings.header_links.length === 3 && 
     settings.header_links[0]?.url === '/' && 
     settings.header_links[1]?.url === '?view=produtos' && 
     settings.header_links[2]?.url === '#');

  const rawHeaderLinks = (isServicesLayout && isDefaultLinks) 
    ? (layoutModel === 'lawyer' || layoutModel === 'advocacia' || layoutModel === 'advocacy'
      ? [
          { label: 'Home', url: '#home' },
          { label: 'Áreas de Atuação', url: '#areas' },
          { label: 'Sobre o Escritório', url: '#sobre' },
          { label: 'Corpo Jurídico', url: '#equipe' },
          { label: 'Depoimentos', url: '#depoimentos' }
        ]
      : [
          { label: 'Home', url: '#home' },
          { label: 'Serviços', url: '#services' },
          { label: 'Produtos', url: '#produtos' },
          { label: 'Sobre Nós', url: '#about' },
          { label: 'Depoimentos', url: '#testimonials' }
        ])
    : (settings.header_links || [
        { label: 'Home', url: '/' },
        { label: 'Produtos', url: '/?view=produtos' },
        { label: 'Categorias', url: '#' }
      ]);

  const headerLinks = rawHeaderLinks.map((link: any) => ({
    ...link,
    url: link.url?.startsWith('?') ? `/${link.url}` : link.url
  }))

  const resolveUrl = (url: string) => {
    if (!url) return ''
    if (url.startsWith('#')) return url
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    if (url.startsWith('/')) {
      if (homePath === '/') return url
      return `${homePath}${url === '/' ? '' : url}`
    }
    return url
  }

  const renderHeaderLink = (link: any, i: number, extraStyle: React.CSSProperties = {}, forceUpperCase = false) => {
    const label = forceUpperCase ? link.label.toUpperCase() : link.label
    if (link.url === '#') {
      return (
        <span 
          key={i} 
          onClick={() => setIsMenuOpen(true)} 
          style={{ cursor: 'pointer', ...extraStyle }}
        >
          {label}
        </span>
      )
    }
    if (link.url?.startsWith('#')) {
      if (isHomePage) {
        return (
          <a 
            key={i} 
            href={link.url} 
            style={{ textDecoration: 'none', color: 'inherit', ...extraStyle }}
          >
            {label}
          </a>
        )
      } else {
        return (
          <Link 
            key={i} 
            href={`${homePath}${link.url}`} 
            style={{ textDecoration: 'none', color: 'inherit', ...extraStyle }}
          >
            {label}
          </Link>
        )
      }
    }
    return (
      <Link 
        key={i} 
        href={resolveUrl(link.url)} 
        style={{ textDecoration: 'none', color: 'inherit', ...extraStyle }}
      >
        {label}
      </Link>
    )
  }

  const renderMobileHeaderLink = (link: any, i: number, extraStyle: React.CSSProperties = {}) => {
    if (link.url?.startsWith('#')) {
      if (isHomePage) {
        return (
          <a 
            key={i} 
            href={link.url} 
            onClick={() => setIsMenuOpen(false)} 
            style={{ textDecoration: 'none', color: '#111', fontSize: '1.1rem', fontWeight: 600, padding: '0.5rem 0', ...extraStyle }}
          >
            {link.label}
          </a>
        )
      } else {
        return (
          <Link 
            key={i} 
            href={`${homePath}${link.url}`} 
            onClick={() => setIsMenuOpen(false)} 
            style={{ textDecoration: 'none', color: '#111', fontSize: '1.1rem', fontWeight: 600, padding: '0.5rem 0', ...extraStyle }}
          >
            {link.label}
          </Link>
        )
      }
    }
    return (
      <Link 
        key={i} 
        href={resolveUrl(link.url)} 
        onClick={() => setIsMenuOpen(false)} 
        style={{ textDecoration: 'none', color: '#111', fontSize: '1.1rem', fontWeight: 600, padding: '0.5rem 0', ...extraStyle }}
      >
        {link.label}
      </Link>
    )
  }

  const TrackingScripts = () => (
    <>
      {/* GTM */}
      {settings.gtm_id && (
        <Script id="gtm-script" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${settings.gtm_id}');
          `}
        </Script>
      )}

      {/* GA4 */}
      {settings.ga_id && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${settings.ga_id}`} strategy="afterInteractive" />
          <Script id="ga4-script" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${settings.ga_id}');
            `}
          </Script>
        </>
      )}

      {/* Google Ads */}
      {settings.google_ads_id && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${settings.google_ads_id}`} strategy="afterInteractive" />
          <Script id="gads-script" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${settings.google_ads_id}');
            `}
          </Script>
        </>
      )}

      {/* Facebook Pixel */}
      {settings.fb_pixel_id && (
        <Script id="fbpixel-script" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${settings.fb_pixel_id}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
    </>
  )

  // 1. TECH (ELETRÔNICOS)
  if (layoutModel === 'tech') {
    return (
      <>
        <style>{`
          @media (max-width: 768px) {
            .desktop-nav, .desktop-only-icons, .header-left-spacer {
              display: none !important;
            }
            .mobile-menu-trigger {
              display: inline-flex !important;
              visibility: visible !important;
              flex-shrink: 0 !important;
            }
            .mobile-only-cart, .mobile-only-favorites {
              display: inline-flex !important;
              visibility: visible !important;
              flex-shrink: 0 !important;
            }
            .store-header-inner {
              padding: 0.5rem 0.75rem !important;
              gap: 0.5rem !important;
            }
            .store-icons-right {
              flex-shrink: 0 !important;
              gap: 0.75rem !important;
            }
            .store-logo-container {
              flex-shrink: 1 !important;
              min-width: 0 !important;
              max-width: 55% !important;
            }
            .store-logo-img {
              height: 28px !important;
              width: auto !important;
              max-width: 110px !important;
              object-fit: contain !important;
            }
            .store-logo-text {
              font-size: 0.9rem !important;
              white-space: nowrap !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              max-width: 130px !important;
            }
          }
          @media (min-width: 769px) {
            .mobile-menu-trigger, .mobile-only-cart, .mobile-only-favorites {
              display: none !important;
            }
          }
        `}</style>
        <TrackingScripts />
        <div style={{ backgroundColor: topBarBg, color: topBarText, padding: '0.65rem', textAlign: 'center', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '1.5px' }}>
          {settings.top_bar_announcement || 'BEM-VINDO À NOSSA LOJA'}
        </div>
        <header style={{ 
          position: 'sticky', top: 0, zIndex: 100, 
          backgroundColor: headerBg, borderBottom: `1px solid ${primaryColor}40`,
          boxShadow: `0 0 20px ${primaryColor}20`
        }}>
          <div className="store-header-inner" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0.5rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', color: iconColor }}>
            <div className="store-logo-container" style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
              <Link href={homePath} style={{ textDecoration: 'none', color: iconColor }}>
                {settings.logo_url ? <img className="store-logo-img" src={settings.logo_url} alt={store.name} style={{ height: '35px', width: 'auto', filter: iconColor === '#ffffff' ? 'brightness(0) invert(1)' : 'none' }} /> : <h1 className="store-logo-text" style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, letterSpacing: '1px', whiteSpace: 'nowrap', color: iconColor }}>{store.name.toUpperCase()}</h1>}
              </Link>
            </div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '2rem' }}>
              <nav className="desktop-nav" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                {headerLinks.map((link: any, i: number) => renderHeaderLink(link, i, { fontWeight: 600, fontSize: '0.9rem' }))}
              </nav>
            </div>
            <div className="store-icons-right" style={{ flexShrink: 0, display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div className="desktop-only-icons" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                {!isCatalogo && (
                  <>
                    <div style={{ cursor: 'pointer' }} onClick={handleWhatsappClick} title="WhatsApp">
                      <WhatsappIcon size={22} color={iconColor} />
                    </div>
                    <div style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/account'} title="Minha Conta">
                      <User size={22} color={iconColor} />
                    </div>
                    <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setIsFavoritesOpen(true)} title="Favoritos">
                      <Heart size={22} color={iconColor} />
                      {totalFavorites > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#ef4444', color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '50%', fontWeight: 800 }}>{totalFavorites}</span>}
                    </div>
                    <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setIsCartOpen(true)}>
                      <ShoppingCart size={22} color={iconColor} />
                      {totalItems > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: primaryColor, color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '50%', fontWeight: 800 }}>{totalItems}</span>}
                    </div>
                  </>
                )}
              </div>
              {!isCatalogo && (
                <>
                  <div className="mobile-only-favorites" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setIsFavoritesOpen(true)} title="Favoritos">
                    <Heart size={22} color={iconColor} />
                    {totalFavorites > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#ef4444', color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '50%', fontWeight: 800 }}>{totalFavorites}</span>}
                  </div>
                  <div className="mobile-only-cart" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setIsCartOpen(true)}>
                    <ShoppingCart size={22} color={iconColor} />
                    {totalItems > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: primaryColor, color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '50%', fontWeight: 800 }}>{totalItems}</span>}
                  </div>
                </>
              )}
              <Menu size={24} color={iconColor} className="mobile-menu-trigger" style={{ cursor: 'pointer', marginLeft: '0.5rem' }} onClick={() => setIsMenuOpen(true)} />
            </div>
          </div>
        </header>
        {renderDrawers()}
      </>
    )
  }

  // 2. FASHION (MODA)
  if (layoutModel === 'fashion') {
    return (
      <>
        <style>{`
          @media (max-width: 768px) {
            .desktop-nav, .desktop-only-icons, .header-left-spacer {
              display: none !important;
            }
            .mobile-menu-trigger {
              display: inline-flex !important;
              visibility: visible !important;
              flex-shrink: 0 !important;
            }
            .mobile-only-cart, .mobile-only-favorites {
              display: inline-flex !important;
              visibility: visible !important;
              flex-shrink: 0 !important;
            }
            .store-header-inner {
              padding: 0.5rem 0.75rem !important;
              gap: 0.5rem !important;
            }
            .store-icons-right {
              flex-shrink: 0 !important;
              gap: 0.75rem !important;
            }
            .store-logo-container {
              flex-shrink: 1 !important;
              min-width: 0 !important;
              max-width: 55% !important;
            }
            .store-logo-img {
              height: 28px !important;
              width: auto !important;
              max-width: 110px !important;
              object-fit: contain !important;
            }
            .store-logo-text {
              font-size: 0.9rem !important;
              white-space: nowrap !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              max-width: 130px !important;
            }
          }
          @media (min-width: 769px) {
            .mobile-menu-trigger, .mobile-only-cart, .mobile-only-favorites {
              display: none !important;
            }
          }
        `}</style>
        <TrackingScripts />
        <div style={{ backgroundColor: topBarBg, color: topBarText, padding: '0.65rem', textAlign: 'center', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '1.5px' }}>
          {settings.top_bar_announcement || 'BEM-VINDO À NOSSA LOJA'}
        </div>
        <header style={{ 
          position: 'sticky', top: 0, zIndex: 100, backgroundColor: headerBg, padding: '0.8rem 0'
        }}>
          <div className="store-header-inner" style={{ 
            maxWidth: '1400px', 
            margin: '0 auto', 
            padding: '0 1.5rem', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            color: iconColor
          }}>
            <div className="store-logo-container" style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
              <Link href={homePath} style={{ textDecoration: 'none', color: iconColor }}>
                 {settings.logo_url ? <img className="store-logo-img" src={settings.logo_url} alt={store.name} style={{ height: '40px', width: 'auto' }} /> : <h1 className="store-logo-text" style={{ fontSize: '1.8rem', fontWeight: 300, margin: 0, letterSpacing: '4px', whiteSpace: 'nowrap', color: iconColor }}>{store.name.toUpperCase()}</h1>}
              </Link>
            </div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '2rem' }}>
              <nav className="desktop-nav" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                {headerLinks.map((link: any, i: number) => renderHeaderLink(link, i, { fontWeight: 600, fontSize: '0.9rem' }))}
              </nav>
            </div>
            <div className="store-icons-right" style={{ flexShrink: 0, display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div className="desktop-only-icons" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                {!isCatalogo && (
                  <>
                    <div style={{ cursor: 'pointer' }} onClick={handleWhatsappClick} title="WhatsApp">
                      <WhatsappIcon size={20} color={iconColor} />
                    </div>
                    <div style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/account'} title="Minha Conta">
                      <User size={20} color={iconColor} />
                    </div>
                    <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setIsFavoritesOpen(true)} title="Favoritos">
                      <Heart size={20} color={iconColor} />
                      {totalFavorites > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#ef4444', color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '50%', fontWeight: 800 }}>{totalFavorites}</span>}
                    </div>
                    <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setIsCartOpen(true)}>
                      <ShoppingBag size={20} color={iconColor} />
                      {totalItems > 0 && <span style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '0.7rem', fontWeight: 700, backgroundColor: primaryColor, color: '#fff', padding: '2px 6px', borderRadius: '50%' }}>{totalItems}</span>}
                    </div>
                  </>
                )}
              </div>
              {!isCatalogo && (
                <>
                  <div className="mobile-only-favorites" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setIsFavoritesOpen(true)} title="Favoritos">
                    <Heart size={20} color={iconColor} />
                    {totalFavorites > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#ef4444', color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '50%', fontWeight: 800 }}>{totalFavorites}</span>}
                  </div>
                  <div className="mobile-only-cart" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setIsCartOpen(true)}>
                    <ShoppingBag size={20} color={iconColor} />
                    {totalItems > 0 && <span style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '0.7rem', fontWeight: 700, backgroundColor: primaryColor, color: '#fff', padding: '2px 6px', borderRadius: '50%' }}>{totalItems}</span>}
                  </div>
                </>
              )}
              <Menu size={24} color={iconColor} className="mobile-menu-trigger" style={{ cursor: 'pointer' }} onClick={() => setIsMenuOpen(true)} />
            </div>
          </div>
        </header>
        {renderDrawers()}
      </>
    )
  }

  // 3. OFFICE (INFORMÁTICA)
  if (layoutModel === 'office') {
    return (
      <>
        <style>{`
          @media (max-width: 768px) {
            .desktop-nav, .desktop-only-icons, .header-left-spacer {
              display: none !important;
            }
            .mobile-menu-trigger {
              display: inline-flex !important;
              visibility: visible !important;
              flex-shrink: 0 !important;
            }
            .mobile-only-cart, .mobile-only-favorites {
              display: inline-flex !important;
              visibility: visible !important;
              flex-shrink: 0 !important;
            }
            .store-header-inner {
              padding: 0.5rem 0.75rem !important;
              gap: 0.5rem !important;
            }
            .store-icons-right {
              flex-shrink: 0 !important;
              gap: 0.75rem !important;
            }
            .store-logo-container {
              flex-shrink: 1 !important;
              min-width: 0 !important;
              max-width: 55% !important;
            }
            .store-logo-img {
              height: 28px !important;
              width: auto !important;
              max-width: 110px !important;
              object-fit: contain !important;
            }
            .store-logo-text {
              font-size: 0.9rem !important;
              white-space: nowrap !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              max-width: 130px !important;
            }
          }
          @media (min-width: 769px) {
            .mobile-menu-trigger, .mobile-only-cart, .mobile-only-favorites {
              display: none !important;
            }
          }
        `}</style>
        <TrackingScripts />
        <div style={{ backgroundColor: topBarBg, color: topBarText, padding: '0.65rem', textAlign: 'center', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '1.5px' }}>
          {settings.top_bar_announcement || 'BEM-VINDO À NOSSA LOJA'}
        </div>
        <header style={{ backgroundColor: headerBg, borderBottom: '2px solid rgba(255,255,255,0.1)', padding: '0.8rem 1.5rem' }}>
           <div className="store-header-inner" style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', color: iconColor }}>
             <div className="store-logo-container" style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
               <Link href={homePath} style={{ textDecoration: 'none', color: iconColor }}>
                    {settings.logo_url ? <img className="store-logo-img" src={settings.logo_url} alt={store.name} style={{ height: '40px', width: 'auto' }} /> : <h1 className="store-logo-text" style={{ fontSize: '2.4rem', fontWeight: 900, color: iconColor, margin: 0, lineHeight: 1, whiteSpace: 'nowrap', letterSpacing: '-1px', fontFamily: 'Arial Black, sans-serif' }}>
                        {store.name}
                       </h1>}
                  </Link>
               </div>
              <div style={{ flex: 1 }}>
              <nav className="desktop-nav" style={{ display: 'flex', gap: '2.5rem', alignItems: 'center', justifyContent: 'center' }}>
                {headerLinks.map((link: any, i: number) => renderHeaderLink(link, i, { fontWeight: 700, fontSize: '0.9rem' }, true))}
              </nav>
            </div>
            <div className="store-icons-right" style={{ flexShrink: 0, display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div className="desktop-only-icons" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                {isCatalogo ? (
                  <Menu size={24} color={iconColor} style={{ cursor: 'pointer' }} onClick={() => setIsMenuOpen(true)} />
                ) : (
                  <>
                    <div style={{ cursor: 'pointer' }} onClick={handleWhatsappClick} title="WhatsApp">
                      <WhatsappIcon size={20} color={iconColor} />
                    </div>
                    <div style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/account'} title="Minha Conta">
                      <User size={20} color={iconColor} />
                    </div>
                    <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setIsFavoritesOpen(true)} title="Favoritos">
                      <Heart size={20} color={iconColor} />
                      {totalFavorites > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#ef4444', color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '50%', fontWeight: 800 }}>{totalFavorites}</span>}
                    </div>
                    <Search size={20} style={{ cursor: 'pointer', color: iconColor }} onClick={() => setIsSearchOpen(true)} />
                    <div onClick={() => setIsCartOpen(true)} style={{ backgroundColor: iconColor, color: headerBg, padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, fontSize: '0.85rem' }}>
                       <ShoppingCart size={18} /> CARRINHO ({totalItems})
                    </div>
                  </>
                )}
              </div>
              {!isCatalogo && (
                <>
                  <div className="mobile-only-favorites" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setIsFavoritesOpen(true)} title="Favoritos">
                    <Heart size={22} color={iconColor} />
                    {totalFavorites > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#ef4444', color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '50%', fontWeight: 800 }}>{totalFavorites}</span>}
                  </div>
                  <div className="mobile-only-cart" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setIsCartOpen(true)}>
                    <ShoppingCart size={22} color={iconColor} />
                    {totalItems > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: primaryColor, color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '50%', fontWeight: 800 }}>{totalItems}</span>}
                  </div>
                </>
              )}
              <Menu size={24} color={iconColor} className="mobile-menu-trigger" style={{ cursor: 'pointer' }} onClick={() => setIsMenuOpen(true)} />
            </div>
          </div>
        </header>
        {renderDrawers()}
      </>
    )
  }

  // DEFAULT / MODERN
  if (headerStyle === 'classic') {
    return (
      <>
        <style>{`
          @media (max-width: 768px) {
            .desktop-nav, .desktop-only-icons, .header-left-spacer {
              display: none !important;
            }
            .mobile-menu-trigger {
              display: inline-flex !important;
              visibility: visible !important;
              flex-shrink: 0 !important;
            }
            .mobile-only-cart, .mobile-only-favorites {
              display: inline-flex !important;
              visibility: visible !important;
              flex-shrink: 0 !important;
            }
            .store-header-inner {
              padding: 0.5rem 0.75rem !important;
              gap: 0.5rem !important;
            }
            .store-icons-right {
              flex-shrink: 0 !important;
              gap: 0.75rem !important;
            }
            .store-logo-container {
              flex-shrink: 1 !important;
              min-width: 0 !important;
              max-width: 55% !important;
            }
            .store-logo-img {
              height: 28px !important;
              width: auto !important;
              max-width: 110px !important;
              object-fit: contain !important;
            }
            .store-logo-text {
              font-size: 0.9rem !important;
              white-space: nowrap !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              max-width: 130px !important;
            }
          }
          @media (min-width: 769px) {
            .mobile-menu-trigger, .mobile-only-cart, .mobile-only-favorites {
              display: none !important;
            }
          }
        `}</style>
        <TrackingScripts />
        <div style={{ backgroundColor: topBarBg, color: topBarText, padding: '0.65rem', textAlign: 'center', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '1.5px' }}>
          {settings.top_bar_announcement || 'BEM-VINDO À NOSSA LOJA'}
        </div>
        <header style={{
          position: 'relative',
          top: 0,
          zIndex: 100,
          backgroundColor: headerBg,
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div className="store-header-inner" style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0.6rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            color: iconColor
          }}>
            <div className="store-logo-container" style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
              <Link href={homePath} style={{ textDecoration: 'none', color: iconColor }}>
                {settings.logo_url ? <img className="store-logo-img" src={settings.logo_url} alt={store.name} style={{ height: '40px', width: 'auto', objectFit: 'contain' }} /> : <h1 className="store-logo-text" style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, lineHeight: 1, whiteSpace: 'nowrap', color: iconColor }}>{store.name}</h1>}
              </Link>
            </div>
            <div className="store-icons-right" style={{ flexShrink: 0, display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div className="desktop-only-icons" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {!isCatalogo && (
                  <>
                    {isApenasServico ? (
                      <button
                        onClick={handleWhatsappClick}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          backgroundColor: whatsappBtnBg,
                          color: whatsappBtnTextColor,
                          border: 'none',
                          padding: '0.55rem 1.1rem',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          boxShadow: `0 4px 12px ${whatsappBtnBg}33`,
                          whiteSpace: 'nowrap'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = `0 6px 16px ${whatsappBtnBg}55`;
                          e.currentTarget.style.filter = 'brightness(1.1)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = `0 4px 12px ${whatsappBtnBg}33`;
                          e.currentTarget.style.filter = 'none';
                        }}
                      >
                        <WhatsappIcon size={16} color={whatsappBtnTextColor} />
                        <span>{whatsappBtnText}</span>
                      </button>
                    ) : (
                      <div style={{ cursor: 'pointer' }} onClick={handleWhatsappClick} title="WhatsApp">
                        <WhatsappIcon size={20} color={iconColor} />
                      </div>
                    )}
                    {!isApenasServico && (
                      <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setIsCartOpen(true)}>
                        <ShoppingCart size={20} color={iconColor} />
                        {totalItems > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: primaryColor, color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '50%', fontWeight: 800 }}>{totalItems}</span>}
                      </div>
                    )}
                  </>
                )}
              </div>
              {!isCatalogo && (
                <>
                  {!isApenasServico && (
                    <>
                      <div className="mobile-only-favorites" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setIsFavoritesOpen(true)} title="Favoritos">
                        <Heart size={20} color={iconColor} />
                        {totalFavorites > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#ef4444', color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '50%', fontWeight: 800 }}>{totalFavorites}</span>}
                      </div>
                      <div className="mobile-only-cart" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setIsCartOpen(true)}>
                        <ShoppingCart size={20} color={iconColor} />
                        {totalItems > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: primaryColor, color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '50%', fontWeight: 800 }}>{totalItems}</span>}
                      </div>
                    </>
                  )}
                </>
              )}
              <Menu size={22} color={iconColor} className="mobile-menu-trigger" style={{ cursor: 'pointer' }} onClick={() => setIsMenuOpen(true)} />
            </div>
          </div>
        </header>
        {renderDrawers()}
      </>
    )
  }
  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav, .desktop-only-icons, .header-left-spacer {
            display: none !important;
          }
          .mobile-menu-trigger {
            display: inline-flex !important;
            visibility: visible !important;
            flex-shrink: 0 !important;
          }
          .mobile-only-cart, .mobile-only-favorites {
            display: inline-flex !important;
            visibility: visible !important;
            flex-shrink: 0 !important;
          }
          .store-header-inner {
            padding: 0.5rem 0.75rem !important;
            gap: 0.5rem !important;
          }
          .store-icons-right {
            flex-shrink: 0 !important;
            gap: 0.75rem !important;
          }
          .store-logo-container {
            flex-shrink: 1 !important;
            min-width: 0 !important;
            max-width: 55% !important;
          }
          .store-logo-img {
            height: 28px !important;
            width: auto !important;
            max-width: 110px !important;
            object-fit: contain !important;
          }
          .store-logo-text {
            font-size: 0.9rem !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            max-width: 130px !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-menu-trigger, .mobile-only-cart, .mobile-only-favorites {
            display: none !important;
          }
        }
      `}</style>
      <TrackingScripts />
      <div style={{ backgroundColor: topBarBg, color: topBarText, padding: '0.65rem', textAlign: 'center', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '1.5px' }}>
          {settings.top_bar_announcement || 'BEM-VINDO À NOSSA LOJA'}
        </div>
      <header style={{
        position: headerStyle === 'modern' ? 'sticky' : 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: headerStyle === 'modern' ? headerBgTranslucent : headerBg,
        backdropFilter: headerStyle === 'modern' ? 'blur(12px)' : 'none',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div className="store-header-inner" style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0.8rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          color: iconColor
        }}>
          {headerStyle === 'modern' ? (
            <>
              {isServicesLayout ? (
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }} className="header-left-spacer">
                  <nav className="desktop-nav" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    {headerLinks.map((link: any, i: number) => renderHeaderLink(link, i, { fontWeight: 600, fontSize: '0.9rem' }))}
                  </nav>
                </div>
              ) : (
                <div style={{ flex: 1 }} className="header-left-spacer" />
              )}
              <div className="store-logo-container" style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                <Link href={homePath} style={{ textDecoration: 'none', color: iconColor }}>
                  {settings.logo_url ? <img className="store-logo-img" src={settings.logo_url} alt={store.name} style={{ height: '45px', width: 'auto', objectFit: 'contain' }} /> : <h1 className="store-logo-text" style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-1px', color: iconColor, margin: 0, lineHeight: 1, whiteSpace: 'nowrap', fontFamily: 'Arial Black, sans-serif' }}>{store.name}</h1>}
                </Link>
              </div>
              <div className="store-icons-right" style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: '1.5rem', alignItems: 'center' }}>
                <div className="desktop-only-icons" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  {!isCatalogo && (
                    <>
                      {isApenasServico ? (
                        <button
                          onClick={handleWhatsappClick}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            backgroundColor: whatsappBtnBg,
                            color: whatsappBtnTextColor,
                            border: 'none',
                            padding: '0.55rem 1.1rem',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: `0 4px 12px ${whatsappBtnBg}33`,
                            whiteSpace: 'nowrap'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = `0 6px 16px ${whatsappBtnBg}55`;
                            e.currentTarget.style.filter = 'brightness(1.1)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = `0 4px 12px ${whatsappBtnBg}33`;
                            e.currentTarget.style.filter = 'none';
                          }}
                        >
                          <WhatsappIcon size={16} color={whatsappBtnTextColor} />
                          <span>{whatsappBtnText}</span>
                        </button>
                      ) : (
                        <div style={{ cursor: 'pointer' }} onClick={handleWhatsappClick} title="WhatsApp">
                          <WhatsappIcon size={22} color={iconColor} />
                        </div>
                      )}
                      {!isApenasServico && (
                        <>
                          <div style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/account'} title="Minha Conta">
                            <User size={22} color={iconColor} />
                          </div>
                          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setIsFavoritesOpen(true)} title="Favoritos">
                            <Heart size={22} color={iconColor} />
                            {totalFavorites > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#ef4444', color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '50%', fontWeight: 800 }}>{totalFavorites}</span>}
                          </div>
                          <Search size={22} style={{ cursor: 'pointer', color: iconColor }} onClick={() => setIsSearchOpen(true)} />
                          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setIsCartOpen(true)}>
                            <ShoppingCart size={22} color={iconColor} />
                            {totalItems > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: primaryColor, color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '50%', fontWeight: 800 }}>{totalItems}</span>}
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
                {!isCatalogo && (
                  <>
                    {!isApenasServico && (
                      <>
                        <div className="mobile-only-favorites" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setIsFavoritesOpen(true)} title="Favoritos">
                          <Heart size={22} color={iconColor} />
                          {totalFavorites > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#ef4444', color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '50%', fontWeight: 800 }}>{totalFavorites}</span>}
                        </div>
                        <div className="mobile-only-cart" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setIsCartOpen(true)}>
                          <ShoppingCart size={22} color={iconColor} />
                          {totalItems > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: primaryColor, color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '50%', fontWeight: 800 }}>{totalItems}</span>}
                        </div>
                      </>
                    )}
                  </>
                )}
                <Menu size={24} color={iconColor} className="mobile-menu-trigger" style={{ cursor: 'pointer' }} onClick={() => setIsMenuOpen(true)} />
              </div>
            </>
          ) : (
            <>
              <div className="store-logo-container" style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                <Link href={homePath} style={{ textDecoration: 'none', color: iconColor }}>
                  {settings.logo_url ? <img className="store-logo-img" src={settings.logo_url} alt={store.name} style={{ height: '45px', width: 'auto', objectFit: 'contain' }} /> : <h1 className="store-logo-text" style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-1px', color: iconColor, margin: 0, lineHeight: 1, whiteSpace: 'nowrap', fontFamily: 'Arial Black, sans-serif' }}>
                    {store.name}
                   </h1>}
                </Link>
              </div>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                <nav className="desktop-nav" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                  {headerLinks.map((link: any, i: number) => renderHeaderLink(link, i, { fontWeight: 600, fontSize: '0.9rem' }))}
                </nav>
              </div>
              <div style={{ flex: 0, display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div className="desktop-only-icons" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  {!isCatalogo && (
                    <>
                      {isApenasServico ? (
                        <button
                          onClick={handleWhatsappClick}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            backgroundColor: whatsappBtnBg,
                            color: whatsappBtnTextColor,
                            border: 'none',
                            padding: '0.55rem 1.1rem',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: `0 4px 12px ${whatsappBtnBg}33`,
                            whiteSpace: 'nowrap'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = `0 6px 16px ${whatsappBtnBg}55`;
                            e.currentTarget.style.filter = 'brightness(1.1)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = `0 4px 12px ${whatsappBtnBg}33`;
                            e.currentTarget.style.filter = 'none';
                          }}
                        >
                          <WhatsappIcon size={16} color={whatsappBtnTextColor} />
                          <span>{whatsappBtnText}</span>
                        </button>
                      ) : (
                        <div style={{ cursor: 'pointer' }} onClick={handleWhatsappClick} title="WhatsApp">
                          <WhatsappIcon size={22} color={iconColor} />
                        </div>
                      )}
                      {!isApenasServico && (
                        <>
                          <div style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/account'} title="Minha Conta">
                            <User size={22} color={iconColor} />
                          </div>
                          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setIsFavoritesOpen(true)} title="Favoritos">
                            <Heart size={22} color={iconColor} />
                            {totalFavorites > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#ef4444', color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '50%', fontWeight: 800 }}>{totalFavorites}</span>}
                          </div>
                          <Search size={22} style={{ cursor: 'pointer', color: iconColor }} onClick={() => setIsSearchOpen(true)} />
                          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setIsCartOpen(true)}>
                            <ShoppingCart size={22} color={iconColor} />
                            {totalItems > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: primaryColor, color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '50%', fontWeight: 800 }}>{totalItems}</span>}
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
                {!isCatalogo && (
                  <>
                    {!isApenasServico && (
                      <>
                        <div className="mobile-only-favorites" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setIsFavoritesOpen(true)} title="Favoritos">
                          <Heart size={22} color={iconColor} />
                          {totalFavorites > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#ef4444', color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '50%', fontWeight: 800 }}>{totalFavorites}</span>}
                        </div>
                        <div className="mobile-only-cart" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setIsCartOpen(true)}>
                          <ShoppingCart size={22} color={iconColor} />
                          {totalItems > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: primaryColor, color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '50%', fontWeight: 800 }}>{totalItems}</span>}
                        </div>
                      </>
                    )}
                  </>
                )}
                <Menu size={24} color={iconColor} className="mobile-menu-trigger" style={{ cursor: 'pointer' }} onClick={() => setIsMenuOpen(true)} />
              </div>
            </>
          )}
        </div>
      </header>
      {renderDrawers()}
    </>
  )

  function renderDrawers() {
    return (
      <>
        {/* OVERLAY GERAL */}
        {(isMenuOpen || isCartOpen || isSearchOpen || isFavoritesOpen) && (
          <div 
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10000, backdropFilter: 'blur(4px)' }}
            onClick={() => { setIsMenuOpen(false); setIsCartOpen(false); setIsSearchOpen(false); setIsFavoritesOpen(false); }}
          />
        )}

        {/* DRAWER DO MENU (ESQUERDA) */}
        <div style={{
          position: 'fixed', 
          top: '15px', 
          left: isMenuOpen ? '15px' : '-320px', 
          height: 'calc(100vh - 30px)', 
          width: '80%', 
          maxWidth: '280px',
          backgroundColor: '#fff', 
          color: '#0f172a',
          zIndex: 10001, 
          transition: 'left 0.3s ease', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          display: 'flex', 
          flexDirection: 'column',
          borderRadius: '16px',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>MENU</h2>
            <button onClick={() => setIsMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0f172a' }}><X size={24} /></button>
          </div>
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
            {headerLinks.map((link: any, i: number) => renderMobileHeaderLink(link, i))}
            {!isApenasServico && (
              <>
                <div style={{ margin: '1rem 0', height: '1px', backgroundColor: '#eee' }} />
                <h3 style={{ fontSize: '0.85rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Categorias</h3>
                {categories.map(cat => (
                  <Link key={cat.id} href={`?category=${encodeURIComponent(cat.name)}#produtos`} onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none', color: '#111', fontSize: '1rem', padding: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {cat.image_url ? <img src={cat.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ShoppingBag size={12} color="#999" />}
                    </div>
                    {cat.name}
                  </Link>
                ))}
              </>
            )}
          </div>
        </div>

        {/* DRAWER DO CARRINHO (DIREITA) */}
        <div style={{
          position: 'fixed', top: 0, right: isCartOpen ? 0 : '-400px', bottom: 0, width: '100%', maxWidth: '400px',
          backgroundColor: '#fff', zIndex: 10001, transition: 'right 0.3s ease', boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
          display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>MEU CARRINHO ({totalItems})</h2>
            <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
          </div>

          {cartItems.length === 0 ? (
            <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#666' }}>
              <ShoppingBag size={48} color="#ddd" style={{ marginBottom: '1rem' }} />
              <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111', marginBottom: '0.5rem' }}>Seu carrinho está vazio</p>
              <p style={{ fontSize: '0.9rem' }}>Adicione produtos para continuar comprando.</p>
              <button onClick={() => setIsCartOpen(false)} style={{ marginTop: '2rem', padding: '1rem 2rem', backgroundColor: primaryColor, color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', width: '100%' }}>
                Continuar Comprando
              </button>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {cartItems.map((item) => (
                  <div key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', borderBottom: '1px solid #f5f5f5', paddingBottom: '1.5rem' }}>
                    <div style={{ width: '70px', height: '70px', borderRadius: '8px', backgroundColor: '#f5f5f5', backgroundImage: `url(${item.image})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', fontWeight: 700, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h4>
                      {item.variations && Object.entries(item.variations).length > 0 && (
                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: '#666' }}>
                          {Object.entries(item.variations).map(([k, v]) => `${k}: ${v}`).join(', ')}
                        </p>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 800, color: primaryColor, fontSize: '0.95rem' }}>
                          R$ {item.price.toFixed(2).replace('.', ',')}
                        </span>
                        
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#fff' }}>
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ padding: '0.2rem 0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                            <Minus size={12} />
                          </button>
                          <span style={{ padding: '0 0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ padding: '0.2rem 0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: '0.5rem' }} title="Remover">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              {/* FOOTER DO CARRINHO (SUBTOTAL + FINALIZAR COMPRA) */}
              <div style={{ padding: '1.5rem', borderTop: '1px solid #eee', backgroundColor: '#f9fafb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#333' }}>Subtotal:</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#111' }}>
                    R$ {totalPrice.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <Link 
                    href="/cart" 
                    onClick={() => setIsCartOpen(false)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      padding: '1rem', 
                      backgroundColor: '#f1f5f9', 
                      color: '#0f172a', 
                      textDecoration: 'none', 
                      borderRadius: '8px', 
                      fontWeight: 800, 
                      fontSize: '0.95rem',
                      border: '1px solid #cbd5e1'
                    }}
                  >
                    Ver Carrinho Completo
                  </Link>
                  <Link 
                    href="/checkout" 
                    onClick={() => setIsCartOpen(false)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      padding: '1.2rem', 
                      backgroundColor: primaryColor, 
                      color: 'white', 
                      textDecoration: 'none', 
                      borderRadius: '8px', 
                      fontWeight: 800, 
                      fontSize: '1rem',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      boxShadow: `0 4px 12px ${primaryColor}40`
                    }}
                  >
                    Finalizar Compra
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* DRAWER DOS FAVORITOS (DIREITA) */}
        <div style={{
          position: 'fixed', top: 0, right: isFavoritesOpen ? 0 : '-400px', bottom: 0, width: '100%', maxWidth: '400px',
          backgroundColor: '#fff', zIndex: 10001, transition: 'right 0.3s ease', boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
          display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>MEUS FAVORITOS ({totalFavorites})</h2>
            <button onClick={() => setIsFavoritesOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
          </div>

          {favoriteItems.length === 0 ? (
            <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#666' }}>
              <Heart size={48} color="#ddd" style={{ marginBottom: '1rem' }} />
              <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111', marginBottom: '0.5rem' }}>Nenhum favorito ainda</p>
              <p style={{ fontSize: '0.9rem' }}>Clique no coração dos produtos que você mais gostar para salvá-los aqui.</p>
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {favoriteItems.map((item) => (
                <div key={item.productId} style={{ display: 'flex', gap: '1rem', alignItems: 'center', borderBottom: '1px solid #f5f5f5', paddingBottom: '1.5rem' }}>
                  <div style={{ width: '70px', height: '70px', borderRadius: '8px', backgroundColor: '#f5f5f5', backgroundImage: `url(${item.image})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link href={`/product/${item.slug}`} onClick={() => setIsFavoritesOpen(false)} style={{ textDecoration: 'none' }}>
                      <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', fontWeight: 700, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h4>
                    </Link>
                    <span style={{ fontWeight: 800, color: primaryColor, fontSize: '0.95rem' }}>
                      R$ {item.price.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <button onClick={() => {
                    import('@/lib/favoriteStore').then(m => m.toggleFavorite(item));
                  }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.5rem' }} title="Remover">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MODAL DE BUSCA (TOPO) */}
        <div style={{
          position: 'fixed', top: isSearchOpen ? 0 : '-200px', left: 0, right: 0,
          backgroundColor: '#fff', zIndex: 10002, transition: 'top 0.3s ease', boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
          padding: '2rem'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Search size={24} color="#666" />
            <input 
              type="text" 
              placeholder="O que você está procurando?" 
              style={{ flex: 1, border: 'none', fontSize: '1.5rem', padding: '0.5rem', outline: 'none' }}
              autoFocus={isSearchOpen}
            />
            <button onClick={() => setIsSearchOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={28} color="#111" /></button>
          </div>
        </div>
      </>
    )
  }
}
