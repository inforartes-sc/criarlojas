"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function FeaturedCarousel({ products, primaryColor }: { products: any[], primaryColor: string }) {
  const [currentIndex, setCurrentIndex] = useState(0)

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
    <div className="carousel-root" style={{ width: '100%', position: 'relative' }}>
      <div className="carousel-main" style={{ 
        width: '100%', 
        aspectRatio: '1/1', 
        borderRadius: '24px', 
        overflow: 'hidden', 
        position: 'relative',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        border: `3px solid ${primaryColor}22`
      }}>
        <div style={{
          display: 'flex',
          width: `${products.length * 100}%`,
          height: '100%',
          transform: `translateX(-${currentIndex * (100 / products.length)}%)`,
          transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {products.map((product) => (
            <Link 
              key={product.id} 
              href={`/product/${product.slug}`}
              style={{
                width: `${100 / products.length}%`,
                height: '100%',
                display: 'block',
                position: 'relative',
                flexShrink: 0,
                textDecoration: 'none'
              }}
            >
              <img 
                src={product.images?.[0]} 
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              
              {/* Overlay com nome do produto na base - Estilo Glassmorphism Premium */}
              <div className="glass-featured-badge" style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                right: '20px',
                padding: '1.25rem 1.5rem',
                borderRadius: '16px'
              }}>
                <h4 className="glass-featured-title" style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0 }}>{product.name}</h4>
                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: primaryColor, marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Ver detalhes →</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Controles de Navegação */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', alignItems: 'center' }}>
        <button onClick={prev} className="nav-btn"><ChevronLeft size={20} /></button>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {products.map((_, i) => (
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
        .carousel-main {
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.08), 0 0 30px ${primaryColor}15 !important;
        }
        .glass-featured-badge {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        }
        .glass-featured-title {
          color: #0f172a;
        }
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
