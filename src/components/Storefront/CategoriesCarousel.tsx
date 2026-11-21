"use client"

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react'

interface Category {
  id: string
  name: string
  image_url?: string
}

export default function CategoriesCarousel({
  categories,
  layoutModel,
  buttonRadius = '50%',
  isDark = false,
  primaryColor = '#0284c7'
}: {
  categories: Category[]
  layoutModel?: string
  buttonRadius?: string
  isDark?: boolean
  primaryColor?: string
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  const checkScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 10)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true })
      window.addEventListener('resize', checkScroll)
    }
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [categories])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const scrollAmount = 350
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    })
  }

  if (!categories || categories.length === 0) return null

  // Imagem redonda por padrão quando o layout é modern ou fashion
  const imgRadius = buttonRadius === '50%' || layoutModel !== 'tech' ? '50%' : buttonRadius
  const imgSize = layoutModel === 'fashion' ? '125px' : '110px'

  return (
    <div 
      className="categories-carousel-wrapper"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{ position: 'relative', width: '100%', maxWidth: '1400px', margin: '0 auto' }}
    >
      {/* Botão Seta Esquerda */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll('left')}
          aria-label="Rolar para a esquerda"
          style={{
            position: 'absolute',
            left: '-12px',
            top: '40%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: isDark ? '#ffffff' : '#1e293b',
            transition: 'all 0.2s ease',
            opacity: isHovering || canScrollLeft ? 1 : 0.8
          }}
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {/* Botão Seta Direita */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scroll('right')}
          aria-label="Rolar para a direita"
          style={{
            position: 'absolute',
            right: '-12px',
            top: '40%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: isDark ? '#ffffff' : '#1e293b',
            transition: 'all 0.2s ease',
            opacity: isHovering || canScrollRight ? 1 : 0.8
          }}
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Track do Carrossel (Única Linha, Nunca Quebra) */}
      <div
        ref={scrollRef}
        className="categories-carousel-track"
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'nowrap',
          gap: '2.5rem',
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          padding: '0.75rem 0.5rem 1rem 0.5rem',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          justifyContent: categories.length < 8 ? 'center' : 'flex-start'
        }}
      >
        <style>{`
          .categories-carousel-track::-webkit-scrollbar {
            display: none !important;
          }
          .category-carousel-item:hover .category-circle-img {
            transform: translateY(-4px) scale(1.05);
            box-shadow: 0 12px 24px rgba(0,0,0,0.12);
          }
          .category-carousel-item:hover .category-carousel-name {
            color: ${primaryColor} !important;
          }
          @media (max-width: 768px) {
            .categories-carousel-track {
              gap: 1.25rem !important;
              padding-left: 1rem !important;
              padding-right: 1rem !important;
              justify-content: flex-start !important;
            }
            .category-carousel-item {
              min-width: 90px !important;
              max-width: 95px !important;
            }
            .category-circle-img {
              width: 82px !important;
              height: 82px !important;
              margin-bottom: 0.6rem !important;
            }
            .category-carousel-name {
              font-size: 0.72rem !important;
              letter-spacing: 0.5px !important;
            }
          }
        `}</style>

        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`?category=${encodeURIComponent(cat.name)}#produtos`}
            className="category-carousel-item"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textDecoration: 'none',
              textAlign: 'center',
              cursor: 'pointer',
              flex: '0 0 auto',
              minWidth: '110px',
              maxWidth: '125px',
              transition: 'all 0.2s ease'
            }}
          >
            <div
              className="category-circle-img"
              style={{
                width: imgSize,
                height: imgSize,
                borderRadius: imgRadius,
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
                transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease'
              }}
            >
              {cat.image_url ? (
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <ShoppingBag size={32} color={primaryColor} opacity={0.7} />
              )}
            </div>

            <span
              className="category-carousel-name"
              style={{
                fontSize: '0.8rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                color: isDark ? '#cbd5e1' : '#334155',
                lineHeight: 1.3,
                textAlign: 'center',
                wordBreak: 'break-word',
                transition: 'color 0.2s ease',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
