"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function StoreHeroClient({ 
  settings, 
  heroStyle, 
  showHeroText, 
  splitBgColor, 
  heroTitleColor, 
  heroSubtitleColor, 
  buttonRadius, 
  isDark, 
  overlayColor55, 
  heroBgColor 
}: any) {
  
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const rawBanners = settings.hero_banners && settings.hero_banners.length > 0 
    ? settings.hero_banners 
    : [
        {
          desktop_url: settings.hero_image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200',
          mobile_url: settings.hero_image_mobile_url || settings.hero_image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200',
          title: settings.hero_title || 'REDEFINA SEU CONCEITO',
          subtitle: settings.hero_subtitle || 'Explore nossa curadoria especial para elevar sua experiência.',
          button_text: 'SAIBA MAIS',
          button_url: '?view=produtos'
        }
      ]

  const banners = rawBanners.map((b: any) => {
    const desktop_url = b.desktop_url || b.hero_image_url || b.image_url || settings.hero_image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200'
    const mobile_url = b.mobile_url || b.mobile_image_url || b.hero_image_mobile_url || b.image_mobile_url || settings.hero_image_mobile_url || desktop_url
    return {
      ...b,
      desktop_url,
      mobile_url,
    }
  })

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(true)

  useEffect(() => {
    if (banners.length <= 1) return
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setCurrentBannerIndex((prev) => prev + 1)
    }, 5000)
    return () => clearInterval(interval)
  }, [banners.length])

  useEffect(() => {
    if (currentBannerIndex === banners.length) {
      const timer = setTimeout(() => {
        setIsTransitioning(false)
        setCurrentBannerIndex(0)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [currentBannerIndex, banners.length])

  useEffect(() => {
    if (!isTransitioning && currentBannerIndex === 0) {
      const timer = setTimeout(() => {
        setIsTransitioning(true)
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isTransitioning, currentBannerIndex])

  const getBannerUrl = (banner: any) => {
    if (!banner) return ''
    if (isMobile && banner.mobile_url) return banner.mobile_url
    return banner.desktop_url || banner.mobile_url
  }

  const activeDotIndex = currentBannerIndex % banners.length
  const currentBanner = banners[activeDotIndex] || banners[0]
  const currentDesktopUrl = currentBanner.desktop_url
  const currentMobileUrl = currentBanner.mobile_url

  const transitionEffect = settings.hero_transition_effect || 'fade'

  // SE NÃO EXIBIR TEXTO NO BANNER (Banner de Imagem Puro como Black Friday / Promoções)
  if (!showHeroText) {
    return (
      <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
        {transitionEffect === 'slide' && banners.length > 1 ? (
          <div style={{
            display: 'flex',
            width: `${(banners.length + 1) * 100}%`,
            transform: `translateX(-${currentBannerIndex * (100 / (banners.length + 1))}%)`,
            transition: isTransitioning ? 'transform 0.5s ease-in-out' : 'none'
          }}>
            {[...banners, banners[0]].map((banner: any, idx: number) => {
              const bannerContent = (
                <picture style={{ width: '100%', display: 'block' }}>
                  <source media="(max-width: 768px)" srcSet={banner.mobile_url || banner.desktop_url} />
                  <img 
                    src={banner.desktop_url} 
                    alt={banner.title || 'Banner'} 
                    style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }} 
                  />
                </picture>
              )
              return (
                <div key={idx} style={{ width: `${100 / (banners.length + 1)}%` }}>
                  {banner.button_url ? (
                    <Link href={banner.button_url} style={{ display: 'block', width: '100%' }}>
                      {bannerContent}
                    </Link>
                  ) : (
                    bannerContent
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ position: 'relative', width: '100%' }}>
            {currentBanner.button_url ? (
              <Link href={currentBanner.button_url} style={{ display: 'block', width: '100%' }}>
                <picture style={{ width: '100%', display: 'block' }}>
                  <source media="(max-width: 768px)" srcSet={currentBanner.mobile_url || currentBanner.desktop_url} />
                  <img 
                    src={currentBanner.desktop_url} 
                    alt={currentBanner.title || 'Banner'} 
                    style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain', transition: 'all 0.5s ease' }} 
                  />
                </picture>
              </Link>
            ) : (
              <picture style={{ width: '100%', display: 'block' }}>
                <source media="(max-width: 768px)" srcSet={currentBanner.mobile_url || currentBanner.desktop_url} />
                <img 
                  src={currentBanner.desktop_url} 
                  alt={currentBanner.title || 'Banner'} 
                  style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain', transition: 'all 0.5s ease' }} 
                />
              </picture>
            )}
          </div>
        )}

        {banners.length > 1 && (
          <div style={{ position: 'absolute', bottom: '1rem', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '0.5rem', zIndex: 10 }}>
            {banners.map((_: any, idx: number) => (
              <button 
                key={idx} 
                onClick={() => { setIsTransitioning(true); setCurrentBannerIndex(idx); }} 
                style={{ 
                  width: activeDotIndex === idx ? '24px' : '8px', 
                  height: '8px', 
                  borderRadius: '4px', 
                  backgroundColor: activeDotIndex === idx ? '#fff' : 'rgba(255,255,255,0.6)', 
                  border: 'none', 
                  cursor: 'pointer', 
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  transition: 'all 0.3s ease' 
                }} 
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <style>{`
        .hero-banner-responsive-fade-split {
          background-image: url("${currentDesktopUrl}");
          background-size: cover;
          background-position: center;
          transition: background-image 0.5s ease-in-out;
        }

        .hero-banner-responsive-fade-left {
          background-image: linear-gradient(90deg, ${splitBgColor} 0%, ${splitBgColor} 40%, transparent 100%), url("${currentDesktopUrl}");
          background-size: cover;
          background-position: center;
          transition: background-image 0.5s ease-in-out;
        }

        .hero-banner-responsive-fade-full {
          background-image: linear-gradient(${overlayColor55}, ${overlayColor55}), url("${currentDesktopUrl}");
          background-size: cover;
          background-position: center;
          transition: background-image 0.5s ease-in-out;
        }

        ${banners.map((b: any, idx: number) => `
          .hero-slide-bg-split-${idx} {
            background-image: url("${b.desktop_url}");
            background-size: cover;
            background-position: center;
          }
          .hero-slide-bg-left-${idx} {
            background-image: linear-gradient(90deg, ${splitBgColor} 0%, ${splitBgColor} 40%, transparent 100%), url("${b.desktop_url}");
            background-size: cover;
            background-position: center;
          }
          .hero-slide-bg-full-${idx} {
            background-image: linear-gradient(${overlayColor55}, ${overlayColor55}), url("${b.desktop_url}");
            background-size: cover;
            background-position: center;
          }
        `).join('\n')}

        @media (max-width: 768px) {
          .hero-banner-responsive-fade-split {
            background-image: url("${currentMobileUrl}") !important;
          }

          .hero-banner-responsive-fade-left {
            background-image: linear-gradient(0deg, ${splitBgColor} 0%, ${splitBgColor} 40%, transparent 100%), url("${currentMobileUrl}") !important;
          }

          .hero-banner-responsive-fade-full {
            background-image: linear-gradient(${overlayColor55}, ${overlayColor55}), url("${currentMobileUrl}") !important;
          }

          ${banners.map((b: any, idx: number) => `
            .hero-slide-bg-split-${idx} {
              background-image: url("${b.mobile_url}") !important;
            }
            .hero-slide-bg-left-${idx} {
              background-image: linear-gradient(0deg, ${splitBgColor} 0%, ${splitBgColor} 40%, transparent 100%), url("${b.mobile_url}") !important;
            }
            .hero-slide-bg-full-${idx} {
              background-image: linear-gradient(${overlayColor55}, ${overlayColor55}), url("${b.mobile_url}") !important;
            }
          `).join('\n')}

          .hero-split-section {
            min-height: auto !important;
            padding: 2rem 1.25rem !important;
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
          .hero-left {
            min-height: auto !important;
            height: auto !important;
            padding: 3rem 1.25rem !important;
          }
          .hero-full {
            min-height: 350px !important;
            height: auto !important;
            padding: 3.5rem 1.25rem !important;
          }
          .hero-minimalist {
            min-height: auto !important;
            height: auto !important;
            padding: 2.5rem 1.25rem !important;
          }
          .hero-title-responsive {
            font-size: clamp(1.5rem, 6.5vw, 2.2rem) !important;
            line-height: 1.25 !important;
            margin-bottom: 0.85rem !important;
            letter-spacing: -0.5px !important;
          }
          .hero-subtitle-responsive {
            font-size: 0.95rem !important;
            line-height: 1.5 !important;
            margin-bottom: 1.5rem !important;
            max-width: 100% !important;
          }
          .hero-split-img {
            display: flex !important;
            width: 100% !important;
            margin-top: 1rem !important;
          }
          .hero-split-img-card {
            aspect-ratio: 1 / 1 !important;
            height: auto !important;
            max-height: 380px !important;
            width: 100% !important;
            border-radius: 16px !important;
          }
          .btn-hero-responsive {
            padding: 0.85rem 2rem !important;
            font-size: 0.8rem !important;
          }
        }
      `}</style>

      {heroStyle === 'split' ? (
        <section className="hero-split-section" style={{ 
          minHeight: '80vh', 
          display: 'grid', 
          gridTemplateColumns: '1.2fr 0.8fr', 
          alignItems: 'center', 
          backgroundColor: splitBgColor, 
          padding: '4rem 8%',
          gap: '4rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ maxWidth: '650px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', margin: '0 auto' }}>
            <h2 className="hero-title-responsive" style={{ fontSize: '4.5rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '2rem', color: heroTitleColor, letterSpacing: '-2px', transition: 'all 0.3s ease' }}>
              {currentBanner.title}
            </h2>
            <p className="hero-subtitle-responsive" style={{ fontSize: '1.15rem', color: heroSubtitleColor, marginBottom: '3.5rem', lineHeight: 1.6, transition: 'all 0.3s ease' }}>
              {currentBanner.subtitle}
            </p>
            <div>
              <Link href={currentBanner.button_url || '?view=produtos'} className="btn-buy-dynamic btn-hero-responsive" style={{ 
                display: 'inline-block',
                padding: '1.2rem 3rem',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 800,
                borderRadius: buttonRadius,
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                {currentBanner.button_text || 'SAIBA MAIS'}
              </Link>
            </div>
          </div>
          <div className="hero-split-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
            <div className={`hero-split-img-card ${transitionEffect === 'fade' ? 'hero-banner-responsive-fade-split' : ''}`} style={{ 
              width: '100%', 
              aspectRatio: '1 / 1',
              maxWidth: '520px',
              maxHeight: '520px',
              margin: '0 auto',
              borderRadius: '24px',
              boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.5)' : '0 20px 40px rgba(0,0,0,0.08)',
              border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.03)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {transitionEffect === 'slide' && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: `${(banners.length + 1) * 100}%`,
                  height: '100%',
                  display: 'flex',
                  transform: `translateX(-${currentBannerIndex * (100 / (banners.length + 1))}%)`,
                  transition: isTransitioning ? 'transform 0.5s ease-in-out' : 'none'
                }}>
                  {[...banners, banners[0]].map((banner: any, idx: number) => {
                    const realIdx = idx % banners.length
                    return (
                      <div 
                        key={idx} 
                        className={`hero-slide-bg-split-${realIdx}`}
                        style={{
                          width: `${100 / (banners.length + 1)}%`,
                          height: '100%'
                        }}
                      />
                    )
                  })}
                </div>
              )}
            </div>
          </div>
          
          {banners.length > 1 && (
            <div style={{ position: 'absolute', bottom: '2rem', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '0.5rem', zIndex: 10 }}>
              {banners.map((_: any, idx: number) => {
                const isActive = activeDotIndex === idx
                return (
                  <button key={idx} onClick={() => { setIsTransitioning(true); setCurrentBannerIndex(idx); }} style={{ width: isActive ? '24px' : '8px', height: '8px', borderRadius: '4px', backgroundColor: isActive ? '#000' : 'rgba(0,0,0,0.2)', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease' }} />
                )
              })}
            </div>
          )}
        </section>
      ) : heroStyle === 'left-aligned' ? (
        <section className={`hero-left ${transitionEffect === 'fade' ? 'hero-banner-responsive-fade-left' : ''}`} style={{ 
          display: 'flex', 
          alignItems: 'center', 
          backgroundColor: splitBgColor,
          padding: '0 8%',
          color: heroTitleColor,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {transitionEffect === 'slide' && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${(banners.length + 1) * 100}%`,
              height: '100%',
              display: 'flex',
              transform: `translateX(-${currentBannerIndex * (100 / (banners.length + 1))}%)`,
              transition: isTransitioning ? 'transform 0.5s ease-in-out' : 'none',
              zIndex: 1
            }}>
              {[...banners, banners[0]].map((banner: any, idx: number) => {
                const realIdx = idx % banners.length
                return (
                  <div 
                    key={idx} 
                    className={`hero-slide-bg-left-${realIdx}`}
                    style={{
                      width: `${100 / (banners.length + 1)}%`,
                      height: '100%'
                    }}
                  />
                )
              })}
            </div>
          )}
          <div style={{ maxWidth: '600px', textAlign: 'left', zIndex: 2 }}>
            <h2 className="hero-title-responsive hero-title-lg" style={{ fontWeight: 900, lineHeight: 1.1, marginBottom: '2rem', color: heroTitleColor, letterSpacing: '-2px', transition: 'all 0.3s ease' }}>
              {currentBanner.title}
            </h2>
            <p className="hero-subtitle-responsive hero-subtitle" style={{ fontSize: '1.15rem', color: heroSubtitleColor, marginBottom: '3.5rem', lineHeight: 1.6, transition: 'all 0.3s ease' }}>
              {currentBanner.subtitle}
            </p>
            <Link href={currentBanner.button_url || '?view=produtos'} className="btn-buy-dynamic btn-hero-responsive" style={{ 
               display: 'inline-block', padding: '1.2rem 3rem', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 800, borderRadius: buttonRadius, textTransform: 'uppercase', letterSpacing: '1px'
            }}>
              {currentBanner.button_text || 'SAIBA MAIS'}
            </Link>
          </div>
          
          {banners.length > 1 && (
            <div style={{ position: 'absolute', bottom: '2rem', left: '8%', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
              {banners.map((_: any, idx: number) => {
                const isActive = activeDotIndex === idx
                return (
                  <button key={idx} onClick={() => { setIsTransitioning(true); setCurrentBannerIndex(idx); }} style={{ width: isActive ? '24px' : '8px', height: '8px', borderRadius: '4px', backgroundColor: isActive ? '#000' : 'rgba(0,0,0,0.2)', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease' }} />
                )
              })}
            </div>
          )}
        </section>
      ) : heroStyle === 'minimalist' ? (
        <section className="hero-minimalist" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: splitBgColor,
          padding: '0 5%',
          textAlign: 'center',
          borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #eaeaea',
          position: 'relative'
        }}>
          <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
            <h2 className="hero-title-responsive hero-title-md" style={{ fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem', color: heroTitleColor, letterSpacing: '-2px', transition: 'all 0.3s ease' }}>
              {currentBanner.title}
            </h2>
            <p className="hero-subtitle-responsive hero-subtitle" style={{ fontSize: '1.2rem', color: heroSubtitleColor, marginBottom: '2.5rem', lineHeight: 1.6, maxWidth: '650px', transition: 'all 0.3s ease' }}>
              {currentBanner.subtitle}
            </p>
            <Link href={currentBanner.button_url || '?view=produtos'} className="btn-buy-dynamic btn-hero-responsive" style={{ 
              display: 'inline-block', padding: '1.2rem 3rem', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 800, borderRadius: buttonRadius, textTransform: 'uppercase', letterSpacing: '1px'
            }}>
              {currentBanner.button_text || 'SAIBA MAIS'}
            </Link>
          </div>
          
          {banners.length > 1 && (
            <div style={{ position: 'absolute', bottom: '2rem', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '0.5rem', zIndex: 10 }}>
              {banners.map((_: any, idx: number) => (
                <button key={idx} onClick={() => setCurrentBannerIndex(idx)} style={{ width: currentBannerIndex === idx ? '24px' : '8px', height: '8px', borderRadius: '4px', backgroundColor: currentBannerIndex === idx ? '#000' : 'rgba(0,0,0,0.2)', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease' }} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className={`hero-full ${transitionEffect === 'fade' ? 'hero-banner-responsive-fade-full' : ''}`} style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '0 5%', 
          backgroundColor: heroBgColor,
          color: heroTitleColor,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {transitionEffect === 'slide' && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${(banners.length + 1) * 100}%`,
              height: '100%',
              display: 'flex',
              transform: `translateX(-${currentBannerIndex * (100 / (banners.length + 1))}%)`,
              transition: isTransitioning ? 'transform 0.5s ease-in-out' : 'none',
              zIndex: 1
            }}>
              {[...banners, banners[0]].map((banner: any, idx: number) => {
                const realIdx = idx % banners.length
                return (
                  <div 
                    key={idx} 
                    className={`hero-slide-bg-full-${realIdx}`}
                    style={{
                      width: `${100 / (banners.length + 1)}%`,
                      height: '100%'
                    }}
                  />
                )
              })}
            </div>
          )}
          <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
            <h2 className="hero-title-responsive hero-title-lg" style={{ fontSize: '4.5rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem', color: heroTitleColor, letterSpacing: '-2px', textShadow: '0 4px 12px rgba(0,0,0,0.3)', transition: 'all 0.3s ease' }}>
              {currentBanner.title}
            </h2>
            <p className="hero-subtitle-responsive hero-subtitle" style={{ fontSize: '1.25rem', color: heroSubtitleColor, marginBottom: '2.5rem', lineHeight: 1.6, textShadow: '0 2px 8px rgba(0,0,0,0.2)', transition: 'all 0.3s ease' }}>
              {currentBanner.subtitle}
            </p>
            <Link href={currentBanner.button_url || '?view=produtos'} className="btn-buy-dynamic btn-hero-responsive" style={{ 
              display: 'inline-block', padding: '1.2rem 3rem', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 800, borderRadius: buttonRadius, textTransform: 'uppercase', letterSpacing: '1px', border: '1px solid rgba(255,255,255,0.3)'
            }}>
              {currentBanner.button_text || 'SAIBA MAIS'}
            </Link>
          </div>
          
          {banners.length > 1 && (
            <div style={{ position: 'absolute', bottom: '2rem', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '0.5rem', zIndex: 10 }}>
              {banners.map((_: any, idx: number) => {
                const isActive = activeDotIndex === idx
                return (
                  <button key={idx} onClick={() => { setIsTransitioning(true); setCurrentBannerIndex(idx); }} style={{ width: isActive ? '24px' : '8px', height: '8px', borderRadius: '4px', backgroundColor: isActive ? '#fff' : 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease' }} />
                )
              })}
            </div>
          )}
        </section>
      )}
    </>
  )
}

