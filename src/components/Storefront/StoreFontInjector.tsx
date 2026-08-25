"use client"

import React from 'react'

const GOOGLE_FONTS_MAP: Record<string, string> = {
  'Inter': 'Inter:wght@300;400;500;600;700;800;900',
  'Montserrat': 'Montserrat:wght@300;400;500;600;700;800;900',
  'Poppins': 'Poppins:wght@300;400;500;600;700;800;900',
  'Roboto': 'Roboto:wght@300;400;500;700;900',
  'Outfit': 'Outfit:wght@300;400;500;600;700;800;900',
  'Plus Jakarta Sans': 'Plus+Jakarta+Sans:wght@300;400;500;600;700;800',
  'Playfair Display': 'Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400',
  'Lora': 'Lora:ital,wght@0,400;0,500;0,600;0,700;1,400',
  'Cinzel': 'Cinzel:wght@400;600;700;800;900',
  'DM Sans': 'DM+Sans:wght@300;400;500;700;800',
  'Raleway': 'Raleway:wght@300;400;500;600;700;800;900',
  'Nunito': 'Nunito:wght@300;400;600;700;800;900',
  'Work Sans': 'Work+Sans:wght@300;400;500;600;700;800',
  'Syne': 'Syne:wght@400;600;700;800',
}

interface StoreFontInjectorProps {
  fontFamily?: string
}

export default function StoreFontInjector({ fontFamily }: StoreFontInjectorProps) {
  const fontName = fontFamily && fontFamily !== 'system-ui' ? fontFamily : (fontFamily === 'system-ui' ? 'system-ui' : 'Inter')

  if (fontName === 'system-ui') {
    return (
      <style dangerouslySetInnerHTML={{ __html: `
        html, body, button, input, select, textarea, h1, h2, h3, h4, h5, h6, .hero-title, .section-title, .service-title, .product-name, .card-title {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
        }
        :root {
          --font-family: system-ui, sans-serif !important;
          --font-body: system-ui, sans-serif !important;
          --font-heading: system-ui, sans-serif !important;
        }
      ` }} />
    )
  }

  const googleFontParam = GOOGLE_FONTS_MAP[fontName] || `${encodeURIComponent(fontName)}:wght@300;400;500;600;700;800;900`
  const fontUrl = `https://fonts.googleapis.com/css2?family=${googleFontParam}&display=swap`

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href={fontUrl} rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('${fontUrl}');

        html, body, button, input, select, textarea, h1, h2, h3, h4, h5, h6, .hero-title, .section-title, .service-title, .product-name, .card-title, .portfolio-card-title {
          font-family: '${fontName}', var(--font-body, sans-serif), system-ui, -apple-system, sans-serif !important;
        }

        :root {
          --font-family: '${fontName}', sans-serif !important;
          --font-body: '${fontName}', sans-serif !important;
          --font-heading: '${fontName}', sans-serif !important;
        }
      ` }} />
    </>
  )
}
