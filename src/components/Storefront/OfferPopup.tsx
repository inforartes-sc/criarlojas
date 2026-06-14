"use client"

import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface OfferPopupProps {
  settings: any
}

export default function OfferPopup({ settings }: OfferPopupProps) {
  const [show, setShow] = useState(false)

  const isEnabled = (settings.offer_popup_enabled || false) && settings.plan === 'premium'
  const title = settings.offer_popup_title || "Oferta Exclusiva! 🎉"
  const subtitle = settings.offer_popup_subtitle || "Aproveite esta promoção especial preparada para você hoje."
  const imageUrl = settings.offer_popup_image_url || ""
  const buttonText = settings.offer_popup_button_text || "Aproveitar Agora"
  const buttonLink = settings.offer_popup_button_link || "#"
  const delaySeconds = settings.offer_popup_delay !== undefined ? settings.offer_popup_delay : 5
  const storeId = settings.store_id || "general"
  const layout = settings.offer_popup_layout || "split"

  // Base64 encoding of content values to create a unique identifier
  // If anything changes, the localStorage key changes and shows the popup again
  const contentSignature = typeof window !== 'undefined'
    ? btoa(encodeURIComponent(`${title}-${subtitle}-${imageUrl}-${buttonText}-${buttonLink}-${layout}`))
    : ""

  const storageKey = `offer_popup_closed_${storeId}_${contentSignature}`

  useEffect(() => {
    if (!isEnabled) return

    // Check if the user closed this specific offer version permanently
    const isClosed = localStorage.getItem(storageKey)
    if (isClosed) return

    // Check if there is a temporary dismiss block active
    const dismissUntil = localStorage.getItem(`offer_popup_dismissed_until_${storeId}`)
    if (dismissUntil) {
      const blockedTime = parseInt(dismissUntil, 10)
      if (Date.now() < blockedTime) {
        return // Still in the 15-minute cooldown period
      }
    }

    // Trigger pop-up with a delay
    const timer = setTimeout(() => {
      setShow(true)
    }, delaySeconds * 1000)

    return () => clearTimeout(timer)
  }, [isEnabled, delaySeconds, storageKey, storeId])

  const handleClose = () => {
    setShow(false)
    // Persist closed state permanently for this specific offer signature
    localStorage.setItem(storageKey, "true")
  }

  const handleDismiss = () => {
    setShow(false)
    // Set a temporary block timestamp (15 minutes from now)
    const dismissUntil = Date.now() + 15 * 60 * 1000
    localStorage.setItem(`offer_popup_dismissed_until_${storeId}`, dismissUntil.toString())
  }

  if (!show) return null

  const primaryColor = settings.primary_color || '#6366f1'
  const isDark = settings.theme_mode === 'dark'
  const isFullLayout = layout === 'full' && imageUrl

  return (
    <div 
      onClick={handleDismiss}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: '1.5rem',
        animation: 'offerPopupFadeIn 0.3s ease-out',
        cursor: 'pointer'
      }}
    >
      {/* Modal Card */}
      <div 
        onClick={e => e.stopPropagation()} // Prevent clicking inside card from closing
        style={{
          width: '100%',
          maxWidth: imageUrl ? (isFullLayout ? '480px' : '760px') : '480px',
          background: isDark ? '#1e293b' : '#ffffff',
          color: isDark ? '#ffffff' : '#0f172a',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
          position: 'relative',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: (imageUrl && !isFullLayout) ? '1.1fr 1fr' : '1fr',
          animation: 'offerPopupScaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          fontFamily: 'Inter, system-ui, sans-serif',
          cursor: 'default'
        }}
        className="offer-popup-card"
      >
        {/* Close Button */}
        <button 
          onClick={handleClose}
          aria-label="Fechar"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(15, 23, 42, 0.06)',
            border: 'none',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: isDark ? '#f8fafc' : '#475569',
            zIndex: 10,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.1)'
            e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(15, 23, 42, 0.12)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(15, 23, 42, 0.06)'
          }}
        >
          <X size={18} />
        </button>

        {/* Top Section: Full banner image (Only in full layout) */}
        {imageUrl && isFullLayout && (
          <div style={{
            position: 'relative',
            width: '100%',
            backgroundColor: isDark ? '#0f172a' : '#f8fafc',
            borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'}`,
            display: 'block',
            overflow: 'hidden'
          }} className="offer-popup-banner">
            <img 
              src={imageUrl} 
              alt={title}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
          </div>
        )}

        {/* Left Side: Product Image (Only in split layout) */}
        {imageUrl && !isFullLayout && (
          <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            minHeight: '300px',
            backgroundColor: isDark ? '#0f172a' : '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            borderRight: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'}`
          }} className="offer-popup-image-container">
            <img 
              src={imageUrl} 
              alt={title}
              style={{
                width: '100%',
                height: '100%',
                maxHeight: '360px',
                objectFit: 'contain',
                borderRadius: '12px'
              }}
            />
          </div>
        )}

        {/* Bottom / Right Side: Text & Actions */}
        <div style={{
          padding: isFullLayout ? '2.5rem 2rem 2.25rem 2rem' : '3rem 2.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          textAlign: (imageUrl && !isFullLayout) ? 'left' : 'center',
          gap: '1.5rem'
        }}>
          <div>
            <h4 style={{ 
              margin: 0, 
              fontSize: isFullLayout ? '1.5rem' : '1.5rem', 
              fontWeight: 900, 
              lineHeight: 1.25,
              color: isDark ? '#ffffff' : '#0f172a'
            }}
            className="offer-popup-title"
            >{title}</h4>
            <p style={{ 
              margin: '0.85rem 0 0 0', 
              fontSize: '1rem', 
              lineHeight: 1.6,
              color: isDark ? '#e2e8f0' : '#475569'
            }}>{subtitle}</p>
          </div>

          <a 
            href={buttonLink} 
            onClick={handleClose}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.95rem 1.75rem',
              borderRadius: '14px',
              backgroundColor: primaryColor,
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '1rem',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              boxShadow: `0 8px 24px ${primaryColor}40`
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = `0 12px 28px ${primaryColor}55`
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = `0 8px 24px ${primaryColor}40`
            }}
          >
            {buttonText}
          </a 
          >
        </div>
      </div>

      <style>{`
        @keyframes offerPopupFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes offerPopupScaleUp {
          from { opacity: 0; transform: scale(0.96) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @media (max-width: 640px) {
          .offer-popup-card {
            grid-template-columns: 1fr !important;
            max-width: 440px !important;
          }
          .offer-popup-image-container {
            min-height: 220px !important;
            height: 240px !important;
            border-right: none !important;
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
            padding: 1rem !important;
          }
          .offer-popup-image-container img {
            max-height: 220px !important;
          }
        }
      `}</style>
    </div>
  )
}
