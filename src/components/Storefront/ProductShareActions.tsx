"use client"

import { Share2 } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const WhatsappIcon = ({ size = 20, color = "white" }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
)

export default function ProductShareActions({ 
  product, 
  storeMode, 
  storeWhatsapp, 
  buttonRadius,
  layoutModel
}: { 
  product: any
  storeMode: string
  storeWhatsapp: string
  buttonRadius: string
  layoutModel?: string
}) {
  const isLawyer = layoutModel === 'lawyer' || layoutModel === 'advocacia' || layoutModel === 'advocacy'

  const handleShare = async () => {
    const shareData = {
      title: product?.name || 'Área jurídica',
      text: product?.short_description || 'Confira esta área de atuação jurídica.',
      url: window.location.href
    }

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Link copiado para a área de transferência!')
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Link copiado para a área de transferência!')
      }
    }
  }

  const gridColumns = isLawyer ? '1fr' : (storeMode === 'catalogo' ? '1fr' : '1fr 1fr')

  return (
    <div style={{ display: 'grid', gridTemplateColumns: gridColumns, gap: '1rem', marginTop: '1rem' }}>
      {!isLawyer && storeMode !== 'catalogo' && (
        <Link 
          href={storeWhatsapp ? `https://wa.me/${storeWhatsapp.replace(/\D/g,'')}?text=${encodeURIComponent(`Olá! Gostaria de tirar dúvidas sobre o produto: *${product?.name}*`)}` : '#'} 
          target="_blank"
          style={{ 
            height: '3.5rem',
            padding: '0 1.2rem', 
            backgroundColor: '#25D366', 
            color: 'white', 
            border: 'none', 
            borderRadius: buttonRadius, 
            fontSize: '1rem', 
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(37, 211, 102, 0.2)',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.filter = 'none'}
        >
          <WhatsappIcon size={22} />
          Dúvidas no WhatsApp
        </Link>
      )}
      
      <button 
        onClick={handleShare}
        style={{ 
          height: '3.5rem',
          padding: '0 1.2rem', 
          backgroundColor: isLawyer ? 'transparent' : '#fff', 
          color: isLawyer ? 'var(--accent-gold)' : '#0f172a', 
          border: isLawyer ? '1px solid var(--accent-gold-border)' : '1px solid #cbd5e1', 
          borderRadius: buttonRadius, 
          fontSize: '1rem', 
          fontWeight: 800,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          boxShadow: isLawyer ? 'none' : '0 2px 6px rgba(0,0,0,0.05)',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => {
          if (isLawyer) {
            e.currentTarget.style.backgroundColor = 'var(--accent-gold-light)'
            e.currentTarget.style.color = '#ffffff'
          } else {
            e.currentTarget.style.backgroundColor = '#f8fafc'
          }
        }}
        onMouseOut={(e) => {
          if (isLawyer) {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = 'var(--accent-gold)'
          } else {
            e.currentTarget.style.backgroundColor = '#fff'
          }
        }}
      >
        <Share2 size={20} />
        {isLawyer ? 'Compartilhar Especialidade' : 'Compartilhar Produto'}
      </button>
    </div>
  )
}
