"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, ShoppingCart } from 'lucide-react'
import { addToCart } from '@/lib/cartStore'
import { toggleFavorite, isFavorited as checkFavorited } from '@/lib/favoriteStore'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

export default function ProductCard({ product, buttonRadius, salePriceColor, normalPriceColor, defaultPriceColor, featured, layoutModel, storeMode, storeWhatsapp, isCampaign, campaignBgColor, primaryColor: propPrimaryColor, themeMode }: any) {
  const primaryColor = propPrimaryColor || '#0284c7'
  const isDark = themeMode === 'dark' || layoutModel === 'tech'
  let displayPrice = parseFloat(product.price || 0)
  let displaySalePrice = product.sale_price ? parseFloat(product.sale_price) : null

  if (product.has_variations && product.variation_skus?.length > 0) {
    const minPrice = Math.min(...product.variation_skus.map((v: any) => parseFloat(v.price) || 0))
    const salePrices = product.variation_skus
      .map((v: any) => parseFloat(v.sale_price))
      .filter((p: number) => !isNaN(p) && p > 0)
    const minSalePrice = salePrices.length > 0 ? Math.min(...salePrices) : null

    displayPrice = minPrice
    displaySalePrice = minSalePrice
  }

  const priceParts = displayPrice.toFixed(2).split('.')
  const salePrice = displaySalePrice ? displaySalePrice.toFixed(2).split('.') : null
  const [isHovered, setIsHovered] = useState(false)
  const [isCardHovered, setIsCardHovered] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [reviewsData, setReviewsData] = useState<{ average: number, count: number } | null>(null)

  useEffect(() => {
    async function loadReviewsCount() {
      try {
        const { data, error } = await supabase
          .from('product_reviews')
          .select('rating')
          .eq('product_id', product.id)

        if (error) throw error

        if (data && data.length > 0) {
          const total = data.length
          const avg = data.reduce((sum, r) => sum + r.rating, 0) / total
          setReviewsData({ average: Number(avg.toFixed(1)), count: total })
        } else {
          loadLocalReviewsCount()
        }
      } catch (err) {
        loadLocalReviewsCount()
      }
    }

    function loadLocalReviewsCount() {
      try {
        const localData = localStorage.getItem(`reviews_${product.id}`)
        if (localData) {
          const localReviews = JSON.parse(localData)
          if (localReviews.length > 0) {
            const total = localReviews.length
            const avg = localReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / total
            setReviewsData({ average: Number(avg.toFixed(1)), count: total })
          }
        }
      } catch (e) {
        console.error(e)
      }
    }

    loadReviewsCount()
  }, [product.id])

  useEffect(() => {
    setIsFavorited(checkFavorited(product.id))
    const handleFavUpdated = () => {
      setIsFavorited(checkFavorited(product.id))
    }
    window.addEventListener('favoritesUpdated', handleFavUpdated)
    return () => {
      window.removeEventListener('favoritesUpdated', handleFavUpdated)
    }
  }, [product.id])

  const totalStock = product.has_variations && product.variation_skus?.length > 0 ? product.variation_skus.reduce((sum: number, v: any) => sum + (parseInt(v.stock_quantity) || 0), 0) : (parseInt(product.stock_quantity) || 0)

  const handleQuickFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const currentPrice = displaySalePrice ? displaySalePrice : displayPrice
    const added = toggleFavorite({
      productId: product.id,
      name: product.name,
      price: currentPrice,
      image: product.images?.[0] || '',
      slug: product.slug,
      storeId: product.store_id
    })
    setIsFavorited(added)
    toast.success(added ? 'Adicionado aos favoritos!' : 'Removido dos favoritos!')
  }

  const handleQuickAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (totalStock <= 0) {
      toast.error('Produto esgotado!')
      return
    }
    const currentPrice = displaySalePrice ? displaySalePrice : displayPrice
    const item = {
      productId: product.id,
      name: product.name,
      price: currentPrice,
      quantity: 1,
      image: product.images?.[0] || '',
      storeId: product.store_id,
      sku: product.sku
    }
    addToCart(item)
    toast.success('Produto adicionado ao carrinho!')
  }

  // Cálculo inteligente de luminância para contraste dinâmico na campanha
  let isDarkBg = false
  if (isCampaign && campaignBgColor) {
    const color = campaignBgColor.charAt(0) === '#' ? campaignBgColor.substring(1, 7) : campaignBgColor
    const r = parseInt(color.substring(0, 2), 16) || 0
    const g = parseInt(color.substring(2, 4), 16) || 0
    const b = parseInt(color.substring(4, 6), 16) || 0
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    isDarkBg = luminance < 0.6
  }

  // Cores dinâmicas baseadas no contraste da campanha ou no layout padrão
  const titleColor = isCampaign ? (isDarkBg ? '#ffffff' : '#1a1a1a') : (isDark ? '#fff' : '#1a1a1a')
  const categoryColor = isCampaign ? (isDarkBg ? 'rgba(255, 255, 255, 0.75)' : '#666666') : (isDark ? '#94a3b8' : '#64748b')
  const oldPriceColor = isCampaign ? (isDarkBg ? 'rgba(255, 255, 255, 0.75)' : normalPriceColor) : normalPriceColor
  const activeDefaultPriceColor = isCampaign ? (isDarkBg ? '#facc15' : defaultPriceColor) : defaultPriceColor
  const activeSalePriceColor = isCampaign ? (isDarkBg ? '#facc15' : salePriceColor) : salePriceColor

  // Cores do botão da campanha (contraste perfeito e efeito hover premium)
  const campaignBtnBg = isDarkBg ? (isHovered ? '#f1f5f9' : '#ffffff') : (isHovered ? '#334155' : '#0f172a')
  const campaignBtnText = isDarkBg ? '#0f172a' : '#ffffff'

  // Estilos dinâmicos para os botões de Favorito e Carrinho
  const favBtnBorderColor = isCampaign && isDarkBg ? '#ffffff' : (isFavorited ? '#ef4444' : primaryColor)
  const favBtnBgColor = isCampaign && isDarkBg ? (isFavorited ? '#ef4444' : 'rgba(255, 255, 255, 0.15)') : (isFavorited ? '#ef4444' : `${primaryColor}18`)
  const favBtnTextColor = isCampaign && isDarkBg ? '#ffffff' : (isFavorited ? '#fff' : primaryColor)

  const cartBtnBorderColor = totalStock <= 0 ? '#cbd5e1' : (isCampaign && isDarkBg ? '#ffffff' : primaryColor)
  const cartBtnBgColor = totalStock <= 0 ? '#e2e8f0' : (isCampaign && isDarkBg ? 'rgba(255, 255, 255, 0.15)' : `${primaryColor}18`)
  const cartBtnTextColor = totalStock <= 0 ? '#94a3b8' : (isCampaign && isDarkBg ? '#ffffff' : primaryColor)

  return (
    <>
      <style>{`
        .product-card-wrapper .product-name {
          font-size: 1.1rem;
          min-height: 3rem;
        }
        .product-card-wrapper .product-buy-btn {
          font-size: 0.75rem;
          padding: 0.8rem 0.5rem;
          letter-spacing: 0.5px;
        }
        .product-card-wrapper .product-price-main {
          font-size: 1.5rem;
        }
        .product-card-wrapper .product-price-prefix {
          font-size: 0.8rem;
        }
        .product-card-wrapper .product-price-cents {
          font-size: 0.9rem;
        }
        .product-card-wrapper .product-old-price {
          font-size: 0.85rem;
        }
        @media (max-width: 768px) {
          .product-card-wrapper .product-name {
            font-size: 0.82rem !important;
            min-height: 2rem !important;
            margin: 0.3rem 0 !important;
          }
          .product-card-wrapper .product-category-label {
            font-size: 0.6rem !important;
            letter-spacing: 1px !important;
          }
          .product-card-wrapper .product-buy-btn {
            font-size: 0.62rem !important;
            padding: 0.55rem 0.3rem !important;
            letter-spacing: 0.3px !important;
          }
          .product-card-wrapper .product-price-main {
            font-size: 1.15rem !important;
          }
          .product-card-wrapper .product-price-prefix {
            font-size: 0.65rem !important;
          }
          .product-card-wrapper .product-price-cents {
            font-size: 0.7rem !important;
          }
          .product-card-wrapper .product-old-price {
            font-size: 0.7rem !important;
          }
          .product-card-wrapper .product-fav-cart-btn {
            width: 28px !important;
            height: 28px !important;
          }
          .product-card-wrapper .product-price-row {
            gap: 0.35rem !important;
            margin-bottom: 0.75rem !important;
          }
        }
      `}</style>
      <div className="product-card-wrapper" style={{ display: 'flex', flexDirection: 'column', textAlign: 'center', height: '100%' }}>
        <Link href={`/product/${product.slug}`} style={{ textDecoration: 'none', color: isDark ? '#fff' : 'inherit', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div 
            onMouseEnter={() => setIsCardHovered(true)}
            onMouseLeave={() => setIsCardHovered(false)}
            style={{ 
              aspectRatio: featured ? '16/9' : '1/1', 
              backgroundColor: '#f1f5f9', 
              marginBottom: '0.75rem', 
              borderRadius: '16px', 
              position: 'relative', 
              border: '1px solid rgba(0,0,0,0.08)', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
              overflow: 'hidden', 
              transition: 'box-shadow 0.2s ease' 
            }}
          >
            {/* Primary Image */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${product.images?.[0] || 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=400&q=80'})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transition: 'opacity 0.4s ease',
              opacity: (isCardHovered && product.images?.length > 1) ? 0 : 1
            }} />
            
            {/* Secondary Image on Hover */}
            {product.images?.length > 1 && (
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${product.images[1]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'opacity 0.4s ease',
                opacity: isCardHovered ? 1 : 0
              }} />
            )}
            {displaySalePrice && <div style={{ position: 'absolute', top: '20px', left: '20px', backgroundColor: salePriceColor, color: '#fff', padding: '6px 14px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '1px', zIndex: 2 }}>OFERTA</div>}
          </div>
          {/* Linha da Categoria com Ícones nas Extremidades */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', margin: '0.25rem 0', padding: '0 0.25rem' }}>
            {/* Esquerda: Favoritos */}
            <button
              onClick={handleQuickFavorite}
              title="Adicionar aos Favoritos"
              className="product-fav-cart-btn"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: favBtnBgColor,
                border: `1.5px solid ${favBtnBorderColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                color: favBtnTextColor
              }}
              onMouseEnter={(e) => {
                if (!isFavorited) {
                  e.currentTarget.style.backgroundColor = isCampaign && isDarkBg ? '#ffffff' : primaryColor
                  e.currentTarget.style.color = isCampaign && isDarkBg ? (campaignBgColor || '#ef4444') : '#fff'
                }
                e.currentTarget.style.transform = 'scale(1.12)'
              }}
              onMouseLeave={(e) => {
                if (!isFavorited) {
                  e.currentTarget.style.backgroundColor = favBtnBgColor
                  e.currentTarget.style.color = favBtnTextColor
                }
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              <Heart size={16} fill={isFavorited ? (isCampaign && isDarkBg ? '#ffffff' : '#fff') : 'none'} />
            </button>

            {/* Centro: Categoria */}
            <span className="product-category-label" style={{ fontSize: featured ? '0.9rem' : '0.75rem', color: categoryColor, textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 800, textAlign: 'center', flex: 1, padding: '0 0.5rem' }}>
              {product.category || 'NOVIDADE'}
            </span>

            {/* Direita: Carrinho (ou div vazia no modo catálogo para manter o centro perfeito) */}
            <button
              onClick={handleQuickAddToCart}
              title={totalStock <= 0 ? 'Esgotado' : 'Adicionar ao Carrinho'}
              disabled={totalStock <= 0}
              className="product-fav-cart-btn"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: cartBtnBgColor,
                border: `1.5px solid ${cartBtnBorderColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: totalStock <= 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                color: cartBtnTextColor
              }}
              onMouseEnter={(e) => {
                if (totalStock > 0) {
                  e.currentTarget.style.backgroundColor = isCampaign && isDarkBg ? '#ffffff' : primaryColor
                  e.currentTarget.style.color = isCampaign && isDarkBg ? (campaignBgColor || '#ef4444') : '#fff'
                  e.currentTarget.style.transform = 'scale(1.12)'
                }
              }}
              onMouseLeave={(e) => {
                if (totalStock > 0) {
                  e.currentTarget.style.backgroundColor = cartBtnBgColor
                  e.currentTarget.style.color = cartBtnTextColor
                  e.currentTarget.style.transform = 'scale(1)'
                }
              }}
            >
              <ShoppingCart size={16} />
            </button>
          </div>
          <h4 className="product-name" style={{ fontSize: featured ? '2rem' : '1.1rem', margin: '0.6rem 0', fontWeight: 900, color: titleColor, letterSpacing: '-0.5px', minHeight: featured ? '4rem' : '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{product.name}</h4>
          
          {reviewsData && reviewsData.count > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', gap: '0.1rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill={star <= Math.round(reviewsData.average) ? '#f59e0b' : 'transparent'}
                    stroke={star <= Math.round(reviewsData.average) ? '#f59e0b' : '#cbd5e1'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <span style={{ fontWeight: 600, color: isDark ? '#ccc' : '#555', fontSize: '0.8rem' }}>
                {reviewsData.average} ({reviewsData.count})
              </span>
            </div>
          ) : (
            <div style={{ height: '20px', marginBottom: '0.75rem' }} />
          )}

          <div className="product-price-row" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem', marginTop: 'auto', flexWrap: 'wrap' }}>
            {product.hide_price === true || product.hide_price === 'true' || product.sku?.includes('#hide_price') ? (
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: primaryColor }}>Sob Consulta</span>
            ) : salePrice ? (
              <><span className="product-old-price" style={{ fontSize: featured ? '1rem' : '0.85rem', color: oldPriceColor, textDecoration: 'line-through', fontWeight: 600 }}>R$ {displayPrice.toFixed(2).replace('.', ',')}</span><div style={{ display: 'flex', alignItems: 'baseline', color: activeSalePriceColor }}><span className="product-price-prefix" style={{ fontSize: featured ? '1.2rem' : '0.8rem', fontWeight: 800 }}>R$</span><span className="product-price-main" style={{ fontSize: featured ? '2.5rem' : '1.5rem', fontWeight: 950 }}>{salePrice[0]}</span><span className="product-price-cents" style={{ fontSize: featured ? '1.2rem' : '0.9rem', fontWeight: 800 }}>,{salePrice[1]}</span></div></>
            ) : (
              <div style={{ display: 'flex', alignItems: 'baseline', color: activeDefaultPriceColor }}><span className="product-price-prefix" style={{ fontSize: featured ? '1.2rem' : '0.8rem', fontWeight: 800 }}>R$</span><span className="product-price-main" style={{ fontSize: featured ? '2.5rem' : '1.5rem', fontWeight: 950 }}>{priceParts[0]}</span><span className="product-price-cents" style={{ fontSize: featured ? '1.2rem' : '0.9rem', fontWeight: 800 }}>,{priceParts[1]}</span></div>
            )}
          </div>
        </Link>
        {storeMode === 'catalogo' ? (
          <button 
            onClick={() => {
              if (!storeWhatsapp) {
                alert('WhatsApp não configurado pelo lojista.')
                return
              }
              const currentPrice = displaySalePrice ? displaySalePrice : displayPrice
              const priceFormatted = currentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              const skuClean = product.sku?.replace('#hide_price', '') || product.id?.slice(0, 8).toUpperCase()
              const text = encodeURIComponent(
                `Olá! Gostaria de saber mais sobre o produto:\n\n` +
                `*Produto:* ${product.name}\n` +
                `*SKU:* ${skuClean}\n` +
                `*Valor:* R$ ${priceFormatted}`
              )
              window.open(`https://wa.me/${storeWhatsapp.replace(/\D/g,'')}?text=${text}`, '_blank')
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            disabled={totalStock <= 0}
            className="product-buy-btn"
            style={{ 
              width: featured ? 'auto' : '100%', alignSelf: featured ? 'center' : 'stretch', padding: featured ? '1.2rem 4rem' : '0.8rem 1rem', borderRadius: buttonRadius, fontWeight: 800, fontSize: featured ? '1rem' : '0.75rem', cursor: totalStock <= 0 ? 'not-allowed' : 'pointer', marginTop: '1rem', letterSpacing: '1px', textTransform: 'uppercase', transition: 'all 0.2s ease', border: 'none',
              backgroundColor: totalStock <= 0 ? '#cbd5e1' : (isCampaign ? campaignBtnBg : '#25D366'), 
              color: totalStock <= 0 ? '#64748b' : (isCampaign ? campaignBtnText : '#fff'),
              transform: isHovered && totalStock > 0 ? 'translateY(-2px)' : 'translateY(0)',
              boxShadow: isHovered && totalStock > 0 ? '0 10px 20px rgba(0,0,0,0.15)' : 'none'
            }}
          >
            {totalStock <= 0 ? 'Esgotado' : 'Comprar via WhatsApp'}
          </button>
        ) : (
          <button 
            onClick={handleQuickAddToCart}
            className={`product-buy-btn ${isCampaign ? "" : (totalStock <= 0 ? "" : "btn-buy-dynamic")}`} 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            disabled={totalStock <= 0}
            style={{ 
              width: featured ? 'auto' : '100%', alignSelf: featured ? 'center' : 'stretch', padding: featured ? '1.2rem 4rem' : '0.8rem 1rem', borderRadius: buttonRadius, fontWeight: 800, fontSize: featured ? '1rem' : '0.75rem', cursor: totalStock <= 0 ? 'not-allowed' : 'pointer', marginTop: '1rem', letterSpacing: '1px', textTransform: 'uppercase', transition: 'all 0.2s ease', border: 'none',
              backgroundColor: totalStock <= 0 ? '#cbd5e1' : (isCampaign ? campaignBtnBg : undefined),
              color: totalStock <= 0 ? '#64748b' : (isCampaign ? campaignBtnText : undefined),
              transform: isHovered && totalStock > 0 ? 'translateY(-2px)' : 'translateY(0)',
              boxShadow: isHovered && totalStock > 0 ? '0 10px 20px rgba(0,0,0,0.15)' : 'none'
            }}
          >
            {totalStock <= 0 ? 'Esgotado' : 'Comprar Agora'}
          </button>
        )}
      </div>
    </>
  )
}
