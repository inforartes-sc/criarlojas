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
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        {products.map((product, index) => (
          <Link 
            key={product.id} 
            href={`/product/${product.slug}`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: index === currentIndex ? 1 : 0,
              visibility: index === currentIndex ? 'visible' : 'hidden',
              transition: 'all 0.8s ease-in-out',
              textDecoration: 'none'
            }}
          >
            <img 
              src={product.images?.[0]} 
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            
            {/* Overlay com nome do produto na base */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '3rem 2rem 2rem',
              background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
              color: 'white',
              transform: index === currentIndex ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.8s ease-out 0.2s',
              opacity: index === currentIndex ? 1 : 0
            }}>
              <h4 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{product.name}</h4>
              <p style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.5rem' }}>Ver detalhes do produto</p>
            </div>
          </Link>
        ))}
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
