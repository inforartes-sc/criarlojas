"use client"

import { Star, ExternalLink } from 'lucide-react'

interface Review {
  id: string
  author_name: string
  author_photo?: string
  rating: number
  relative_time_description: string
  text: string
}

export default function GoogleReviews({ settings, primaryColor, buttonRadius, plan }: any) {
  const isEnabled = settings.google_reviews_enabled === true && plan === 'premium'
  if (!isEnabled) return null

  const businessName = settings.google_business_name || 'Nossa Empresa'
  const placeId = settings.google_place_id || ''
  const rating = parseFloat(settings.google_rating || '4.9')
  const reviewsCount = settings.google_reviews_count || '120'
  const reviews: Review[] = settings.google_reviews || []

  // Rating Stars Helper
  const renderStars = (num: number, size = 16) => {
    return Array.from({ length: 5 }).map((_, i) => {
      const isFilled = i < Math.floor(num)
      const isHalf = !isFilled && i < num
      return (
        <Star
          key={i}
          size={size}
          fill={isFilled ? '#f59e0b' : 'transparent'}
          color={isFilled || isHalf ? '#f59e0b' : '#d1d5db'}
          style={{ marginRight: '2px' }}
        />
      )
    })
  }

  const googleMapsUrl = placeId 
    ? `https://search.google.com/local/writereview?placeid=${placeId}`
    : 'https://google.com'

  return (
    <section style={{ 
      padding: '5rem 0', 
      backgroundColor: settings.theme_mode === 'dark' ? '#0f172a' : '#f8fafc',
      borderTop: settings.theme_mode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
        
        {/* Header Block */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          textAlign: 'center',
          marginBottom: '4rem' 
        }}>
          {/* Google badge */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            marginBottom: '1rem',
            padding: '0.5rem 1.2rem',
            borderRadius: '100px',
            backgroundColor: settings.theme_mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#ffffff',
            boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
            border: settings.theme_mode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0'
          }}>
            <svg viewBox="0 0 24 24" width="18" height="18" style={{ minWidth: '18px' }}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span style={{ 
              fontSize: '0.85rem', 
              fontWeight: 700, 
              color: settings.theme_mode === 'dark' ? '#94a3b8' : '#64748b',
              letterSpacing: '0.5px' 
            }}>AVALIAÇÃO DE CLIENTES</span>
          </div>

          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 800, 
            color: settings.theme_mode === 'dark' ? '#ffffff' : '#0f172a',
            marginBottom: '1rem',
            letterSpacing: '-1px'
          }}>O que dizem sobre nós no Google</h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 900, color: settings.theme_mode === 'dark' ? '#ffffff' : '#0f172a' }}>{rating.toFixed(1)}</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex' }}>
                {renderStars(rating, 20)}
              </div>
              <span style={{ 
                fontSize: '0.85rem', 
                color: settings.theme_mode === 'dark' ? '#94a3b8' : '#64748b',
                marginTop: '2px'
              }}>{reviewsCount} avaliações no Google</span>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '2rem',
          marginBottom: '4rem' 
        }}>
          {reviews.map((review) => (
            <div 
              key={review.id} 
              style={{
                backgroundColor: settings.theme_mode === 'dark' ? '#1e293b' : '#ffffff',
                border: settings.theme_mode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
                transition: 'all 0.3s ease'
              }}
              className="review-card"
            >
              <div>
                {/* Author Block */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                  {review.author_photo ? (
                    <img 
                      src={review.author_photo} 
                      alt={review.author_name} 
                      style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <div style={{ 
                      width: '42px', 
                      height: '42px', 
                      borderRadius: '50%', 
                      backgroundColor: primaryColor,
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '1rem'
                    }}>
                      {review.author_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 style={{ 
                      fontWeight: 700, 
                      fontSize: '0.95rem',
                      color: settings.theme_mode === 'dark' ? '#ffffff' : '#0f172a',
                      margin: 0
                    }}>{review.author_name}</h4>
                    <span style={{ 
                      fontSize: '0.8rem', 
                      color: '#94a3b8' 
                    }}>{review.relative_time_description}</span>
                  </div>
                </div>

                {/* Rating */}
                <div style={{ display: 'flex', marginBottom: '1rem' }}>
                  {renderStars(review.rating, 14)}
                </div>

                {/* Text */}
                <p style={{ 
                  fontSize: '0.925rem', 
                  lineHeight: '1.6', 
                  color: settings.theme_mode === 'dark' ? '#cbd5e1' : '#475569',
                  margin: 0,
                  display: '-webkit-box',
                  WebkitLineClamp: 5,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  "{review.text}"
                </p>
              </div>

              {/* Google Verification Icon */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', color: '#94a3b8' }}>
                <svg viewBox="0 0 24 24" width="14" height="14">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" opacity="0.8" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" opacity="0.8" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" opacity="0.8" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Action */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <a 
            href={googleMapsUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem 2.5rem',
              backgroundColor: primaryColor,
              color: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: 700,
              textDecoration: 'none',
              borderRadius: buttonRadius,
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
            }}
            className="google-action-btn"
          >
            <span>Ver todas as avaliações no Google</span>
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
      <style>{`
        .review-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.06) !important;
        }
        .google-action-btn:hover {
          opacity: 0.9;
          transform: translateY(-2px);
        }
      `}</style>
    </section>
  )
}
