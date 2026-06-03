"use client"
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function ProductGallery({ images, hasSale, salePriceColor }: { images: string[], hasSale?: boolean, salePriceColor?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [variationImg, setVariationImg] = useState<string | null>(null)

  useEffect(() => {
    const handleVariation = (e: any) => {
      if (e.detail) {
        setVariationImg(e.detail)
        setCurrentIndex(0)
      }
    }
    window.addEventListener('variationImageSelect', handleVariation)
    return () => window.removeEventListener('variationImageSelect', handleVariation)
  }, [])

  const activeImages = variationImg ? [variationImg, ...(images || []).filter(img => img !== variationImg)] : (images || [])

  if (!activeImages || activeImages.length === 0) {
    return <div style={{ aspectRatio: '1/1', backgroundColor: '#f3f4f6', borderRadius: '16px' }} />
  }

  const mainImage = activeImages[currentIndex]

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % activeImages.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + activeImages.length) % activeImages.length)
  }

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <div style={{ 
        aspectRatio: '1/1', 
        backgroundColor: '#f9fafb', 
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid #eaeaea',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative'
      }}>
        {mainImage && <img src={mainImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        {hasSale && (
          <div style={{ position: 'absolute', top: '20px', left: '20px', backgroundColor: salePriceColor || '#ef4444', color: '#fff', padding: '6px 14px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 900, letterSpacing: '1px', zIndex: 10 }}>
            OFERTA
          </div>
        )}
        
        {activeImages.length > 1 && (
          <>
            <button onClick={prevImage} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              <ChevronLeft size={24} />
            </button>
            <button onClick={nextImage} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>
      
      {activeImages.length > 1 && (
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {activeImages.map((img, i) => (
            <div 
              key={i} 
              onClick={() => setCurrentIndex(i)}
              style={{ 
                width: '80px', height: '80px', flexShrink: 0,
                borderRadius: '8px',
                border: currentIndex === i ? '2px solid #111' : '1px solid #eaeaea',
                overflow: 'hidden',
                cursor: 'pointer',
                opacity: currentIndex === i ? 1 : 0.6,
                transition: 'all 0.2s ease'
              }}
            >
              <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
