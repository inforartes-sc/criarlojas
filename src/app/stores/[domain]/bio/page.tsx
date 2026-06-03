import { supabase } from '@/lib/supabase'
import { Globe, ShoppingBag, Tag, Star, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

async function getStoreData(domain: string) {
  const subdomainOnly = domain.split('.')[0]
  const { data } = await supabase
    .from('stores')
    .select('*')
    .or(`subdomain.eq.${subdomainOnly},subdomain.eq.${domain},custom_domain.eq.${domain}`)
    .single()
  return data
}

interface BioLinkItem {
  id: string
  label: string
  url: string
  is_active: boolean
  icon: string
}

export default async function StoreBioPage({ params }: { params: Promise<{ domain: string }> }) {
  const resolvedParams = await params
  const store = await getStoreData(resolvedParams.domain)

  if (!store) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Loja Não Encontrada</h2>
        <p style={{ color: '#94a3b8', marginTop: '0.5rem', textAlign: 'center' }}>O link que você acessou parece não existir ou foi removido.</p>
      </div>
    )
  }

  const bio = store.settings?.bio_link || {}
  const primaryColor = store.settings?.primary_color || '#6366f1'

  if (!bio.enabled) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: 'Inter, system-ui, sans-serif',
        textAlign: 'center'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ef4444',
          marginBottom: '1.5rem'
        }}>
          ⚠️
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Link Indisponível</h2>
        <p style={{ color: '#94a3b8', marginTop: '0.5rem', maxWidth: '360px', lineHeight: 1.5 }}>
          Esta página de links ainda não foi ativada pelo lojista ou está em manutenção.
        </p>
        <Link 
          href={`/stores/${store.subdomain}`}
          style={{
            marginTop: '2rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: primaryColor,
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.9rem'
          }}
        >
          Ir para a Loja Oficial
        </Link>
      </div>
    )
  }

  const title = bio.title || store.name
  const description = bio.description || ''
  const profileImageUrl = bio.profile_image_url || store.settings?.logo_url || ''
  const theme = bio.theme || 'dark'
  const buttonStyle = bio.button_style || 'rounded'
  const links: BioLinkItem[] = bio.links || []
  const socialLinks = bio.social_links || {}

  // Temas CSS
  let bgStyle = 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
  let textColor = '#ffffff'
  let btnBg = 'rgba(255, 255, 255, 0.08)'
  let btnText = '#ffffff'
  let btnBorder = '1px solid rgba(255, 255, 255, 0.15)'
  let backdropFilter = 'none'
  let shadow = 'none'

  if (theme === 'glass') {
    bgStyle = 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)'
    textColor = '#ffffff'
    btnBg = 'rgba(255, 255, 255, 0.12)'
    btnText = '#ffffff'
    btnBorder = '1px solid rgba(255, 255, 255, 0.2)'
    backdropFilter = 'blur(12px)'
    shadow = '0 8px 32px 0 rgba(31, 38, 135, 0.2)'
  } else if (theme === 'primary') {
    bgStyle = '#f8fafc'
    textColor = '#0f172a'
    btnBg = primaryColor
    btnText = '#ffffff'
    btnBorder = 'none'
    shadow = '0 4px 10px rgba(0,0,0,0.05)'
  } else if (theme === 'pastel') {
    bgStyle = 'linear-gradient(135deg, #fed7aa 0%, #fbcfe8 50%, #bfdbfe 100%)'
    textColor = '#1e293b'
    btnBg = '#ffffff'
    btnText = '#1e293b'
    btnBorder = '1px solid rgba(0,0,0,0.03)'
    shadow = '0 4px 6px rgba(0, 0, 0, 0.03)'
  } else if (theme === 'custom') {
    bgStyle = bio.custom_bg_color || '#0f172a'
    textColor = bio.custom_text_color || '#ffffff'
    btnBg = bio.custom_button_bg_color || '#1e293b'
    btnText = bio.custom_button_text_color || '#ffffff'
    btnBorder = `1px solid ${btnText}20`
  }

  // Estilo do botão arredondado
  let borderRadius = '10px'
  if (buttonStyle === 'pill') borderRadius = '100px'
  else if (buttonStyle === 'sharp') borderRadius = '0px'

  // Auxiliar para ícones de Links
  const renderIcon = (type: string) => {
    switch (type) {
      case 'whatsapp': return '💬'
      case 'instagram': return '📸'
      case 'shopping-bag': return '🛍️'
      case 'tag': return '🏷️'
      case 'star': return '⭐'
      case 'globe':
      default:
        return '🌐'
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: bgStyle,
      color: textColor,
      fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '3rem 1.5rem 4rem 1.5rem',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      

      <div style={{
        width: '100%',
        maxWidth: '580px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        {/* Foto de Perfil */}
        {profileImageUrl ? (
          <div style={{
            width: '96px',
            height: '96px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: theme === 'pastel' || theme === 'primary' ? '2px solid rgba(0, 0, 0, 0.05)' : '2px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
            marginBottom: '1.25rem',
            backgroundColor: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img src={profileImageUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ) : (
          <div style={{
            width: '96px',
            height: '96px',
            borderRadius: '50%',
            backgroundColor: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
            border: '2px solid rgba(255, 255, 255, 0.1)'
          }}>
            👤
          </div>
        )}

        {/* Título e Descrição */}
        <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.5px' }}>
          {title}
        </h1>
        
        {description && (
          <p style={{ 
            fontSize: '0.9rem', 
            lineHeight: 1.5, 
            opacity: 0.85, 
            margin: '0 0 2.5rem 0',
            maxWidth: '460px',
            fontWeight: 500
          }}>
            {description}
          </p>
        )}

        {/* Links do Agregador */}
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '3rem'
        }}>
          {links.filter(l => l.is_active).length === 0 ? (
            <div style={{ opacity: 0.5, fontSize: '0.85rem', padding: '3rem 0' }}>
              Nenhum link configurado no momento.
            </div>
          ) : (
            links.filter(l => l.is_active).map(link => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '100%',
                  padding: '1rem 1.5rem',
                  backgroundColor: btnBg,
                  color: btnText,
                  border: btnBorder,
                  borderRadius: borderRadius,
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  boxShadow: shadow,
                  backdropFilter: backdropFilter,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative'
                }}
                className="bio-button"
              >
                <span style={{ fontSize: '1.15rem' }}>{renderIcon(link.icon)}</span>
                <span>{link.label}</span>
              </a>
            ))
          )}
        </div>

        {/* Rodapé Redes Sociais */}
        <div style={{
          display: 'flex',
          gap: '1.25rem',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 'auto',
          flexWrap: 'wrap'
        }}>
          {socialLinks.whatsapp && (
            <a 
              href={`https://wa.me/${socialLinks.whatsapp.replace(/\D/g, '')}`} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                width: '46px',
                height: '46px',
                backgroundColor: '#25D366',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                textDecoration: 'none',
                boxShadow: '0 4px 10px rgba(37, 211, 102, 0.25)',
                borderRadius: '50%'
              }}
              title="WhatsApp"
              className="social-icon"
            >
              <svg viewBox="6.5 7.0 11 10" width="24" height="24">
                <path fill="white" d="M12.004 7.502c-2.481 0-4.5 2.019-4.5 4.5 0 .783.204 1.543.593 2.22l-.63 2.3 2.35-.615c.65.355 1.378.543 2.124.545h.002c2.481 0 4.5-2.019 4.5-4.5s-2.019-4.5-4.5-4.5zm0 .75c2.068 0 3.75 1.682 3.75 3.75s-1.682 3.75-3.75 3.75c-.655 0-1.294-.171-1.851-.497l-.133-.078-1.377.36.366-1.341-.086-.137c-.356-.566-.544-1.222-.544-1.895-.002-2.068 1.68-3.75 3.75-3.75zm1.968 4.708c-.125-.062-.736-.363-.85-.405-.114-.042-.197-.062-.28.062-.083.125-.32.405-.393.488-.073.083-.145.093-.27.031-.125-.062-.527-.194-.997-.613-.365-.326-.612-.728-.684-.852-.072-.124-.008-.191.054-.253.056-.056.125-.145.187-.218.062-.073.083-.125.125-.208.042-.083.02-.155-.01-.218-.03-.062-.28-.675-.384-.925-.101-.244-.204-.21-.28-.214h-.238c-.083 0-.218.031-.332.155-.114.124-.435.425-.435 1.037 0 .611.445 1.202.507 1.285.062.083.876 1.338 2.12 1.875.297.127.528.203.708.26.299.095.571.081.787.05.24-.035.736-.301.84-.592.104-.29.104-.539.073-.591-.03-.052-.114-.083-.238-.145z"/>
              </svg>
            </a>
          )}
          
          {socialLinks.instagram && (
            <a 
              href={`https://instagram.com/${socialLinks.instagram}`} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                textDecoration: 'none',
                boxShadow: '0 4px 10px rgba(225, 48, 108, 0.25)'
              }}
              title="Instagram"
              className="social-icon"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
              </svg>
            </a>
          )}

          {socialLinks.facebook && (
            <a 
              href={socialLinks.facebook.startsWith('http') ? socialLinks.facebook : `https://${socialLinks.facebook}`} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: '#1877F2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                textDecoration: 'none',
                boxShadow: '0 4px 10px rgba(24, 119, 242, 0.25)'
              }}
              title="Facebook"
              className="social-icon"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
          )}

          {socialLinks.tiktok && (
            <a 
              href={`https://tiktok.com/@${socialLinks.tiktok}`} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                textDecoration: 'none',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}
              title="TikTok"
              className="social-icon"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.52-4.06-1.39v7.54c0 2.14-.54 4.39-2.18 5.79-1.92 1.66-4.82 2.05-7.05 1.15-2.52-1.01-4.22-3.66-4.14-6.43.04-2.88 2.09-5.59 4.96-6.19 1.19-.25 2.45-.14 3.58.33v4.06c-.84-.46-1.84-.63-2.77-.33-1.28.37-2.19 1.63-2.11 2.97.06 1.48 1.34 2.81 2.87 2.76 1.51-.01 2.62-1.26 2.62-2.77V.02h.16z"/>
              </svg>
            </a>
          )}

          {socialLinks.youtube && (
            <a 
              href={socialLinks.youtube.startsWith('http') ? socialLinks.youtube : `https://${socialLinks.youtube}`} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: '#FF0000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                textDecoration: 'none',
                boxShadow: '0 4px 10px rgba(255, 0, 0, 0.25)'
              }}
              title="YouTube"
              className="social-icon"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.002 3.002 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          )}
        </div>

        <div style={{ marginTop: '4rem', opacity: 0.5, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
          <span>Desenvolvido com</span>
          <span style={{ color: '#ef4444' }}>❤️</span>
          <span>por {store.name}</span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .bio-button:hover {
          transform: translateY(-3px) scale(1.025);
          box-shadow: 0 10px 20px rgba(0,0,0,0.15) !important;
          opacity: 0.95;
        }
        .social-icon:hover {
          transform: translateY(-4px) scale(1.1);
          filter: brightness(1.1);
        }
      `}} />
    </div>
  )
}
