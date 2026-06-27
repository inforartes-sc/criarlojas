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
  
  const banners = settings.hero_banners && settings.hero_banners.length > 0 
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

  const activeDotIndex = currentBannerIndex % banners.length
  const currentBanner = banners[activeDotIndex] || banners[0]
  const currentBannerUrl = typeof window !== 'undefined' && window.innerWidth <= 768 && currentBanner.mobile_url 
    ? currentBanner.mobile_url 
    : (currentBanner.desktop_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200')

  const transitionEffect = settings.hero_transition_effect || 'fade'

  return (
    <>
      {heroStyle === 'split' ? (
        <section style={{ 
          minHeight: '80vh', 
          display: 'grid', 
          gridTemplateColumns: showHeroText ? '1.2fr 0.8fr' : '1fr', 
          alignItems: 'center', 
          backgroundColor: splitBgColor, 
          padding: '4rem 8%',
          gap: '4rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {showHeroText && (
            <div style={{ maxWidth: '650px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', margin: '0 auto' }}>
              <h2 style={{ fontSize: '4.5rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '2rem', color: heroTitleColor, letterSpacing: '-2px', transition: 'all 0.3s ease' }}>
                {currentBanner.title}
              </h2>
              <p style={{ fontSize: '1.15rem', color: heroSubtitleColor, marginBottom: '3.5rem', lineHeight: 1.6, transition: 'all 0.3s ease' }}>
                {currentBanner.subtitle}
              </p>
              <div>
                <Link href={currentBanner.button_url || '?view=produtos'} className="btn-buy-dynamic" style={{ 
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
          )}
          <div className="hero-split-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
            <div className="hero-split-img-card" style={{ 
              width: '100%', 
              height: '55vh',
              borderRadius: '24px',
              boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.5)' : '0 20px 40px rgba(0,0,0,0.08)',
              border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.03)',
              position: 'relative',
              overflow: 'hidden',
              ...(transitionEffect === 'fade' ? {
                backgroundImage: `url(${currentBannerUrl})`, 
                backgroundSize: 'cover', 
                backgroundPosition: 'center',
                transition: 'background-image 0.5s ease-in-out'
              } : {})
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
                    const bannerUrl = typeof window !== 'undefined' && window.innerWidth <= 768 && banner.mobile_url 
                      ? banner.mobile_url 
                      : (banner.desktop_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200')
                    return (
                      <div 
                        key={idx} 
                        style={{
                          width: `${100 / (banners.length + 1)}%`,
                          height: '100%',
                          backgroundImage: `url(${bannerUrl})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
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
        <section className="hero-left" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          backgroundColor: splitBgColor,
          backgroundImage: transitionEffect === 'fade' ? `linear-gradient(90deg, ${splitBgColor} 0%, ${splitBgColor} 40%, transparent 100%), url(${currentBannerUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '0 8%',
          color: heroTitleColor,
          position: 'relative',
          overflow: 'hidden',
          transition: 'background-image 0.5s ease-in-out'
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
                const bannerUrl = typeof window !== 'undefined' && window.innerWidth <= 768 && banner.mobile_url 
                  ? banner.mobile_url 
                  : (banner.desktop_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200')
                return (
                  <div 
                    key={idx} 
                    style={{
                      width: `${100 / (banners.length + 1)}%`,
                      height: '100%',
                      backgroundImage: `linear-gradient(90deg, ${splitBgColor} 0%, ${splitBgColor} 40%, transparent 100%), url(${bannerUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                )
              })}
            </div>
          )}
          {showHeroText && (
            <div style={{ maxWidth: '600px', textAlign: 'left', zIndex: 2 }}>
              <h2 className="hero-title-lg" style={{ fontWeight: 900, lineHeight: 1.1, marginBottom: '2rem', color: heroTitleColor, letterSpacing: '-2px', transition: 'all 0.3s ease' }}>
                {currentBanner.title}
              </h2>
              <p className="hero-subtitle" style={{ fontSize: '1.15rem', color: heroSubtitleColor, marginBottom: '3.5rem', lineHeight: 1.6, transition: 'all 0.3s ease' }}>
                {currentBanner.subtitle}
              </p>
              <Link href={currentBanner.button_url || '?view=produtos'} className="btn-buy-dynamic" style={{ 
                 display: 'inline-block', padding: '1.2rem 3rem', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 800, borderRadius: buttonRadius, textTransform: 'uppercase', letterSpacing: '1px'
              }}>
                {currentBanner.button_text || 'SAIBA MAIS'}
              </Link>
            </div>
          )}
          
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
          {showHeroText && (
            <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
              <h2 className="hero-title-md" style={{ fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem', color: heroTitleColor, letterSpacing: '-2px', transition: 'all 0.3s ease' }}>
                {currentBanner.title}
              </h2>
              <p className="hero-subtitle" style={{ fontSize: '1.2rem', color: heroSubtitleColor, marginBottom: '2.5rem', lineHeight: 1.6, maxWidth: '650px', transition: 'all 0.3s ease' }}>
                {currentBanner.subtitle}
              </p>
              <Link href={currentBanner.button_url || '?view=produtos'} className="btn-buy-dynamic" style={{ 
                display: 'inline-block', padding: '1.2rem 3rem', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 800, borderRadius: buttonRadius, textTransform: 'uppercase', letterSpacing: '1px'
              }}>
                {currentBanner.button_text || 'SAIBA MAIS'}
              </Link>
            </div>
          )}
          
          {banners.length > 1 && (
            <div style={{ position: 'absolute', bottom: '2rem', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '0.5rem', zIndex: 10 }}>
              {banners.map((_: any, idx: number) => (
                <button key={idx} onClick={() => setCurrentBannerIndex(idx)} style={{ width: currentBannerIndex === idx ? '24px' : '8px', height: '8px', borderRadius: '4px', backgroundColor: currentBannerIndex === idx ? '#000' : 'rgba(0,0,0,0.2)', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease' }} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="hero-full" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '0 5%', 
          backgroundImage: transitionEffect === 'fade' ? (showHeroText ? `linear-gradient(${overlayColor55}, ${overlayColor55}), url(${currentBannerUrl})` : `url(${currentBannerUrl})`) : undefined, 
          backgroundColor: showHeroText ? heroBgColor : 'transparent',
          backgroundSize: 'cover', 
          backgroundPosition: 'center', 
          color: heroTitleColor,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          transition: 'background-image 0.5s ease-in-out'
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
                const bannerUrl = typeof window !== 'undefined' && window.innerWidth <= 768 && banner.mobile_url 
                  ? banner.mobile_url 
                  : (banner.desktop_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200')
                return (
                  <div 
                    key={idx} 
                    style={{
                      width: `${100 / (banners.length + 1)}%`,
                      height: '100%',
                      backgroundImage: showHeroText ? `linear-gradient(${overlayColor55}, ${overlayColor55}), url(${bannerUrl})` : `url(${bannerUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                )
              })}
            </div>
          )}
          {showHeroText && (
            <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
              <h2 className="hero-title-lg" style={{ fontSize: '4.5rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem', color: heroTitleColor, letterSpacing: '-2px', textShadow: '0 4px 12px rgba(0,0,0,0.3)', transition: 'all 0.3s ease' }}>
                {currentBanner.title}
              </h2>
              <p className="hero-subtitle" style={{ fontSize: '1.25rem', color: heroSubtitleColor, marginBottom: '2.5rem', lineHeight: 1.6, textShadow: '0 2px 8px rgba(0,0,0,0.2)', transition: 'all 0.3s ease' }}>
                {currentBanner.subtitle}
              </p>
              <Link href={currentBanner.button_url || '?view=produtos'} className="btn-buy-dynamic" style={{ 
                display: 'inline-block', padding: '1.2rem 3rem', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 800, borderRadius: buttonRadius, textTransform: 'uppercase', letterSpacing: '1px', border: '1px solid rgba(255,255,255,0.3)'
              }}>
                {currentBanner.button_text || 'SAIBA MAIS'}
              </Link>
            </div>
          )}
          
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
