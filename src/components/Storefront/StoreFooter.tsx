"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { RefreshCw, ShieldCheck, ChevronUp, MessageCircle, Phone, Mail, MapPin } from 'lucide-react'

export default function StoreFooter({ store, settings, primaryColor, buttonRadius }: any) {
  const [showScroll, setShowScroll] = useState(false)
  const [homePath, setHomePath] = useState('/')
  const secondaryColor = settings?.secondary_color || primaryColor

  useEffect(() => {
    const checkScroll = () => {
      if (!showScroll && window.pageYOffset > 400) {
        setShowScroll(true)
      } else if (showScroll && window.pageYOffset <= 400) {
        setShowScroll(false)
      }
    }

    window.addEventListener('scroll', checkScroll)

    if (typeof window !== 'undefined') {
      const path = window.location.pathname
      const segments = path.split('/').filter(Boolean)
      let baseHome = '/'
      if (segments.length >= 2 && segments[0] === 'stores') {
        baseHome = `/stores/${segments[1]}`
      }
      setHomePath(baseHome)
    }

    return () => window.removeEventListener('scroll', checkScroll)
  }, [showScroll])

  const resolveUrl = (url: string) => {
    if (!url) return '#'
    if (url.startsWith('#')) return url
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    if (url.startsWith('/')) {
      if (homePath === '/') return url
      return `${homePath}${url === '/' ? '' : url}`
    }
    if (url.startsWith('?')) {
      if (homePath === '/') return `/${url}`
      return `${homePath}/${url}`
    }
    return url
  }

  return (
    <footer style={{ backgroundColor: settings.footer_bg_color || '#111', color: settings.footer_text_color || '#fff', padding: '5rem 2rem 3rem 2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '4rem', marginBottom: '4rem' }}>
          <div style={{ maxWidth: '400px' }}>
            {settings.footer_logo_url ? (
              <img src={settings.footer_logo_url} alt={store.name} style={{ height: '50px', objectFit: 'contain', marginBottom: '1.5rem' }} />
            ) : (
              <h4 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1.5rem', background: `linear-gradient(to right, ${settings.footer_text_color || '#fff'}, ${settings.footer_text_color ? settings.footer_text_color + '88' : '#888'})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {store.name}
              </h4>
            )}
            <p style={{ color: settings.footer_text_color ? settings.footer_text_color + 'aa' : '#888', lineHeight: 1.6, fontSize: '1.05rem' }}>
              {settings.footer_description || 'Oferecemos os melhores produtos com qualidade garantida e entrega rápida em todo o Brasil.'}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '8rem', flexWrap: 'wrap' }}>
            <div style={{ minWidth: '150px' }}>
              <h5 style={{ fontWeight: 800, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1.5rem', color: settings.footer_text_color || '#fff' }}>Navegação</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {(settings.footer_links || []).map((link: any, i: number) => {
                  const href = resolveUrl(link.url)
                  return (
                    <Link key={i} href={href} style={{ color: settings.footer_text_color ? settings.footer_text_color + 'aa' : '#888', textDecoration: 'none', fontSize: '1.05rem', transition: '0.3s' }} onMouseOver={(e) => e.currentTarget.style.color = settings.footer_text_color || '#fff'} onMouseOut={(e) => e.currentTarget.style.color = settings.footer_text_color ? settings.footer_text_color + 'aa' : '#888'}>
                      {link.label}
                    </Link>
                  )
                })}
              </div>
            </div>

            <div style={{ minWidth: '200px' }}>
              <h5 style={{ fontWeight: 800, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1.5rem', color: settings.footer_text_color || '#fff' }}>Contato</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
                {settings.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: settings.footer_text_color ? settings.footer_text_color + 'aa' : '#888', fontSize: '1.05rem' }}>
                    <Phone size={20} />
                    <span>{settings.phone}</span>
                  </div>
                )}
                {settings.email && (
                  <a href={`mailto:${settings.email}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: settings.footer_text_color ? settings.footer_text_color + 'aa' : '#888', textDecoration: 'none', fontSize: '1.05rem', transition: '0.3s' }} onMouseOver={(e) => e.currentTarget.style.color = settings.footer_text_color || '#fff'} onMouseOut={(e) => e.currentTarget.style.color = settings.footer_text_color ? settings.footer_text_color + 'aa' : '#888'}>
                    <Mail size={20} />
                    <span>{settings.email}</span>
                  </a>
                )}
                {settings.address && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: settings.footer_text_color ? settings.footer_text_color + 'aa' : '#888', fontSize: '1.05rem', lineHeight: 1.4 }}>
                    <MapPin size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{settings.address}</span>
                  </div>
                )}

                {/* Ícones de Redes Sociais */}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', alignItems: 'center' }}>
                  {settings.whatsapp && (
                    <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', color: settings.footer_text_color ? settings.footer_text_color + 'aa' : '#888', transition: '0.3s' }} onMouseOver={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)' }} onMouseOut={(e) => { e.currentTarget.style.color = settings.footer_text_color ? settings.footer_text_color + 'aa' : '#888'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)' }} title="WhatsApp">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                      </svg>
                    </a>
                  )}
                  {settings.instagram && (
                    <a href={settings.instagram.startsWith('http') ? settings.instagram : `https://instagram.com/${settings.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', color: settings.footer_text_color ? settings.footer_text_color + 'aa' : '#888', transition: '0.3s' }} onMouseOver={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)' }} onMouseOut={(e) => { e.currentTarget.style.color = settings.footer_text_color ? settings.footer_text_color + 'aa' : '#888'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)' }} title="Instagram">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                    </a>
                  )}
                  {settings.facebook && (
                    <a href={settings.facebook} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', color: settings.footer_text_color ? settings.footer_text_color + 'aa' : '#888', transition: '0.3s' }} onMouseOver={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)' }} onMouseOut={(e) => { e.currentTarget.style.color = settings.footer_text_color ? settings.footer_text_color + 'aa' : '#888'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)' }} title="Facebook">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Botão Voltar ao Topo (Removido daqui para ser flutuante abaixo) */}
          <div style={{ display: 'flex', alignItems: 'center', width: '200px' }}>
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${settings.footer_text_color ? settings.footer_text_color + '22' : '#222'}`, paddingTop: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '2rem', color: settings.footer_text_color ? settings.footer_text_color + '88' : '#555', fontSize: '0.75rem', textAlign: 'center' }}>
          <span>© {new Date().getFullYear()} {store.name}. Todos os direitos reservados.</span>
          {settings.show_doc_in_footer && (settings.cnpj || settings.cpf) && (
            <span>
              {settings.cnpj && `CNPJ: ${settings.cnpj}`}
              {settings.cnpj && settings.cpf && ' | '}
              {settings.cpf && `CPF: ${settings.cpf}`}
            </span>
          )}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <ShieldCheck size={18} />
            <span>Pagamento 100% Seguro</span>
          </div>
        </div>
      </div>
      <style>{`
        .back-to-top-floating {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 50px;
          height: 50px;
          background-color: ${primaryColor} !important;
          color: white !important;
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 1000;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
        .back-to-top-floating:hover {
          background-color: ${secondaryColor} !important;
          color: ${primaryColor} !important;
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.3);
          filter: brightness(1.1);
        }
      `}</style>

      {/* Botão Flutuante */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="back-to-top-floating"
        style={{ 
          opacity: showScroll ? 1 : 0, 
          visibility: showScroll ? 'visible' : 'hidden',
          transform: showScroll ? 'scale(1)' : 'scale(0.5)'
        }}
      >
        <ChevronUp size={24} />
      </button>
    </footer>
  )
}
