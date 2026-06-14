"use client"

import { useState } from 'react'
import { X, Send } from 'lucide-react'

const WhatsAppIcon = ({ size = 24, color = 'white' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.245 3.478 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
  </svg>
)

export default function WhatsAppFloatingButton({ settings }: { settings: any }) {
  const [isOpen, setIsOpen] = useState(false)
  
  const plan = settings.plan || 'basic'
  const isPremiumOrPro = plan === 'premium' || plan === 'pro'
  const isCustomizedButtonEnabled = settings.whatsapp_floating_enabled !== undefined ? settings.whatsapp_floating_enabled : true

  const mainPhone = settings.whatsapp || ''
  const agents = settings.whatsapp_agents || []
  const title = settings.whatsapp_floating_title || 'Suporte WhatsApp'
  const primaryColor = settings.primary_color || '#6366f1'
  const secondaryColor = settings.secondary_color || '#06b6d4'

  // Traditional direct redirection helper
  const handleOpenDirect = () => {
    if (!mainPhone) return
    const cleanPhone = mainPhone.replace(/\D/g, '')
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`
    const text = encodeURIComponent('Olá! Gostaria de saber mais sobre os produtos da loja.')
    window.open(`https://wa.me/${formattedPhone}?text=${text}`, '_blank')
  }

  // Render traditional direct WhatsApp button if plan is basic OR customized button is disabled
  if (!isPremiumOrPro || !isCustomizedButtonEnabled) {
    if (!mainPhone) return null
    return (
      <button 
        onClick={handleOpenDirect}
        style={{
          position: 'fixed',
          bottom: '2rem',
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
          border: 'none',
          zIndex: 9999,
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        className="whatsapp-floating-btn"
        title={settings.whatsapp_hours_enabled && settings.whatsapp_hours_text 
          ? `Fale Conosco pelo WhatsApp - Horário: ${settings.whatsapp_hours_text}` 
          : "Fale Conosco pelo WhatsApp"}
      >
        <WhatsAppIcon size={34} />
      </button>
    )
  }

  // From here onwards, we are on Pro or Premium with customized button enabled
  const finalAgents = agents.length > 0 
    ? agents 
    : mainPhone 
      ? [{ name: 'Atendimento Geral', phone: mainPhone, role: 'Suporte' }] 
      : []

  if (finalAgents.length === 0) return null

  const handleOpenAgent = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/\D/g, '')
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`
    const text = encodeURIComponent(`Olá, ${name}! Gostaria de tirar algumas dúvidas.`)
    window.open(`https://wa.me/${formattedPhone}?text=${text}`, '_blank')
  }

  return (
    <div className="whatsapp-floating-wrapper" style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999 }}>
      {/* Agents Popup Card */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          bottom: '80px',
          right: '0',
          width: '320px',
          backgroundColor: settings.theme_mode === 'dark' ? '#1e293b' : '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: `1px solid ${settings.theme_mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)'}`,
          overflow: 'hidden',
          transform: 'translateZ(0)',
          WebkitTransform: 'translateZ(0)',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #128C7E 0%, #075E54 100%)',
            padding: '1.25rem',
            color: '#ffffff',
            position: 'relative',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px'
          }}>
            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{title}</h4>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', opacity: 0.9 }}>Selecione um de nossos atendentes abaixo:</p>
            {settings.whatsapp_hours_enabled && settings.whatsapp_hours_text && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.35rem', 
                margin: '0.5rem 0 0 0', 
                fontSize: '0.75rem', 
                opacity: 0.95, 
                backgroundColor: 'rgba(255, 255, 255, 0.15)', 
                padding: '4px 8px', 
                borderRadius: '6px', 
                width: 'fit-content' 
              }}>
                <span style={{ fontSize: '0.85rem' }}>🕒</span>
                <span>{settings.whatsapp_hours_text}</span>
              </div>
            )}
            <button 
              onClick={() => setIsOpen(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                opacity: 0.8,
                padding: 0
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Attendants List */}
          <div style={{
            padding: '1rem',
            maxHeight: '300px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            backgroundColor: settings.theme_mode === 'dark' ? '#0f172a' : '#f8fafc',
            borderBottomLeftRadius: '20px',
            borderBottomRightRadius: '20px'
          }}>
            {finalAgents.map((agent: any, index: number) => (
              <div 
                key={index}
                onClick={() => handleOpenAgent(agent.phone, agent.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  backgroundColor: settings.theme_mode === 'dark' ? '#1e293b' : '#ffffff',
                  border: `1px solid ${settings.theme_mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                className="whatsapp-agent-item"
              >
                {/* Agent Icon / Avatar - Original WhatsApp Icon */}
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#25D366',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <WhatsAppIcon size={20} />
                </div>
                {/* Agent Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    color: settings.theme_mode === 'dark' ? '#f8fafc' : '#0f172a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {agent.name}
                  </div>
                  {agent.role && (
                    <div style={{
                      fontSize: '0.75rem',
                      color: settings.theme_mode === 'dark' ? '#94a3b8' : '#64748b',
                      marginTop: '0.15rem'
                    }}>
                      {agent.role}
                    </div>
                  )}
                </div>
                <Send size={14} style={{ color: '#25D366', flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Button Trigger */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: '#25D366',
          color: 'white',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 35px rgba(37, 211, 102, 0.5)',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        className="whatsapp-floating-btn"
        title="Fale Conosco pelo WhatsApp"
      >
        {isOpen ? (
          <X size={34} />
        ) : (
          <WhatsAppIcon size={34} />
        )}
      </button>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .whatsapp-agent-item:hover {
          background-color: ${settings.theme_mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.02)'} !important;
          transform: translateX(4px);
        }
        .whatsapp-floating-wrapper {
          bottom: 2rem !important;
          right: 2rem !important;
        }
        @media (max-width: 768px) {
          .whatsapp-floating-wrapper {
            bottom: 20px !important;
            right: 16px !important;
          }
          .whatsapp-floating-btn {
            width: 52px !important;
            height: 52px !important;
            bottom: 20px !important;
            right: 16px !important;
          }
        }
      `}</style>
    </div>
  )
}
