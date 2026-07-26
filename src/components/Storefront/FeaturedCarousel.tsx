"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function FeaturedCarousel({ products, primaryColor }: { products: any[], primaryColor: string }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [homePath, setHomePath] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname
      const segments = path.split('/').filter(Boolean)
      if (segments.length >= 2 && (segments[0] === 'stores' || segments[0] === 'modelos')) {
        setHomePath(`/${segments[0]}/${segments[1]}`)
      }
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length)
    }, 5000) // Troca a cada 5 segundos

    return () => clearInterval(timer)
  }, [products.length])

  const next = () => setCurrentIndex((prev) => (prev + 1) % products.length)
  const prev = () => setCurrentIndex((prev) => (prev - 1 + products.length) % products.length)

  if (!products || products.length === 0) return null

  return (
    <div className="carousel-root" style={{ width: '100%', maxWidth: '100%', minWidth: 0, position: 'relative', overflow: 'hidden' }}>
      <div className="carousel-main" style={{ 
        width: '100%', 
        maxWidth: '100%',
        minWidth: 0,
        overflow: 'hidden', 
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          width: `${products.length * 100}%`,
          transform: `translateX(-${currentIndex * (100 / products.length)}%)`,
          transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {products.map((product) => (
            <Link 
              key={product.id} 
              href={`${homePath}/product/${product.slug}`}
              style={{
                width: `${100 / products.length}%`,
                display: 'block',
                flexShrink: 0,
                textDecoration: 'none',
                padding: '2px'
              }}
            >
              {/* Moldura da Imagem com proporção perfeita 1:1 sem esticar */}
              <div style={{
                width: '100%',
                aspectRatio: '1/1',
                maxHeight: '420px',
                borderRadius: '24px',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(0, 0, 0, 0.06)'
              }}>
                <img 
                  src={product.images?.[0]} 
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              
              {/* Apenas o Texto abaixo da Imagem (Sem Fundo) */}
              <div style={{
                marginTop: '1.2rem',
                padding: '0 0.5rem',
                textAlign: 'left'
              }}>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'inherit', lineHeight: 1.3 }}>
                  {product.name}
                </h4>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: primaryColor, marginTop: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  Ver detalhes →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Controles de Navegação */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', alignItems: 'center', justifyContent: 'center' }}>
        <button onClick={prev} className="nav-btn"><ChevronLeft size={20} /></button>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {products.map((_: any, i: number) => (
            <div 
              key={i} 
              onClick={() => setCurrentIndex(i)}
              style={{ 
                width: i === currentIndex ? '30px' : '8px', 
                height: '8px', 
                borderRadius: '4px', 
                backgroundColor: i === currentIndex ? primaryColor : '#eee',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }} 
            />
          ))}
        </div>
        <button onClick={next} className="nav-btn"><ChevronRight size={20} /></button>
      </div>

      <style>{`
        .nav-btn {
          background: white;
          border: 1px solid #eee;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: 0.2s;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .nav-btn:hover {
          background: ${primaryColor};
          color: white;
          border-color: ${primaryColor};
        }
      `}</style>
    </div>
  )
}
