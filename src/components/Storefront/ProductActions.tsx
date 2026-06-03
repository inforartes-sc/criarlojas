"use client"
import { useState, useEffect } from 'react'
import { ShoppingCart, Minus, Plus, MessageCircle, Heart } from 'lucide-react'
import Link from 'next/link'
import { addToCart } from '@/lib/cartStore'
import { toggleFavorite, isFavorited as checkFavorited } from '@/lib/favoriteStore'
import toast from 'react-hot-toast'

export default function ProductActions({ 
  product, 
  storeMode, 
  storeWhatsapp, 
  buttonRadius, 
  primaryColor, 
  settings 
}: { 
  product: any, 
  storeMode: string, 
  storeWhatsapp: string, 
  buttonRadius: string, 
  primaryColor: string, 
  settings: any 
}) {
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({})
  const [isFavorited, setIsFavorited] = useState(false)

  useEffect(() => {
    if (product?.id) {
      setIsFavorited(checkFavorited(product.id))
      const handleFavUpdated = () => {
        setIsFavorited(checkFavorited(product.id))
      }
      window.addEventListener('favoritesUpdated', handleFavUpdated)
      return () => {
        window.removeEventListener('favoritesUpdated', handleFavUpdated)
      }
    }
  }, [product])

  // Initialize selected options with first available values
  useEffect(() => {
    if (product?.has_variations && product?.variation_options?.length > 0) {
      const initial: { [key: string]: string } = {}
      product.variation_options.forEach((opt: any) => {
        if (opt?.values?.length > 0) {
          initial[opt.name] = opt.values[0]
        }
      })
      setSelectedOptions(initial)
    }
  }, [product])

  // Find current sku combination
  let currentSkuObj: any = null
  if (product?.has_variations && product?.variation_skus?.length > 0) {
    currentSkuObj = product.variation_skus.find((skuObj: any) => {
      return Object.entries(selectedOptions).every(([k, v]) => skuObj.combination?.[k] === v)
    })
  }

  useEffect(() => {
    if (currentSkuObj?.image_url) {
      window.dispatchEvent(new CustomEvent('variationImageSelect', { detail: currentSkuObj.image_url }))
    } else {
      window.dispatchEvent(new CustomEvent('variationImageSelect', { detail: null }))
    }
  }, [currentSkuObj])

  const currentPrice = currentSkuObj ? currentSkuObj.price : (product?.sale_price ? parseFloat(product.sale_price) : parseFloat(product?.price || 0))
  const originalPrice = currentSkuObj ? null : (product?.sale_price ? parseFloat(product.price) : null)
  const currentStock = product?.has_variations && currentSkuObj ? (parseInt(currentSkuObj.stock_quantity) || 0) : (parseInt(product?.stock_quantity) || 0)
  
  const priceParts = currentPrice.toFixed(2).split('.')
  const origPriceFormatted = originalPrice ? originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : null

  const handleOptionSelect = (name: string, value: string) => {
    setSelectedOptions(prev => ({ ...prev, [name]: value }))
  }

  const handleAddToCart = () => {
    const item = {
      productId: product.id,
      name: product.name,
      price: currentPrice,
      quantity: quantity,
      image: currentSkuObj?.image_url || product.images?.[0] || '',
      variations: product?.has_variations ? selectedOptions : undefined,
      storeId: product.store_id
    }
    addToCart(item)
    toast.success('Produto adicionado ao carrinho!')
  }

  const handleFavoriteClick = () => {
    const added = toggleFavorite({
      productId: product.id,
      name: product.name,
      price: currentPrice,
      image: currentSkuObj?.image_url || product.images?.[0] || '',
      slug: product?.slug || '',
      storeId: product.store_id
    })
    setIsFavorited(added)
    toast.success(added ? 'Adicionado aos favoritos!' : 'Removido dos favoritos!')
  }

  const whatsappText = encodeURIComponent(
    `Olá! Gostaria de saber mais sobre o produto: *${product?.name}*` +
    (product?.has_variations ? ` (${Object.entries(selectedOptions).map(([k,v]) => `${k}: ${v}`).join(', ')})` : '')
  )

  const layoutModel = settings?.layout_model || 'modern'
  const isLawyer = layoutModel === 'lawyer' || layoutModel === 'advocacia' || layoutModel === 'advocacy'

  const lawyerWhatsappText = encodeURIComponent(
    `Olá! Gostaria de agendar uma consulta jurídica para tratar da área de *${product?.name}*.`
  )

  if (isLawyer) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Short Description */}
        <div style={{ display: 'grid', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem 0' }}>
          <p style={{ color: '#555', lineHeight: 1.7, fontSize: '1.05rem', margin: 0, fontStyle: 'italic' }}>
            {product?.short_description || 'Entre em contato para agendar uma reunião de alinhamento técnico e análise detalhada da sua causa.'}
          </p>
        </div>

        {/* Action Button */}
        <div>
          <Link 
            href={storeWhatsapp ? `https://wa.me/${storeWhatsapp.replace(/\D/g,'')}?text=${lawyerWhatsappText}` : '#'}
            target="_blank"
            className="btn-gold-primary"
            style={{ 
              width: '100%',
              padding: '1.1rem', 
              fontSize: '1rem', 
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              textDecoration: 'none',
              letterSpacing: '0.05em'
            }}
          >
            <MessageCircle size={22} />
            <span>Agendar Consulta Jurídica</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 1. Preço */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {origPriceFormatted ? (
            <>
              <div style={{ display: 'flex', alignItems: 'baseline', color: '#ef4444' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>R$</span>
                <span style={{ fontSize: '3rem', fontWeight: 950 }}>{priceParts[0]}</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>,{priceParts[1]}</span>
              </div>
              <p style={{ fontSize: '1.4rem', color: '#999', textDecoration: 'line-through', margin: 0, fontWeight: 600 }}>
                R$ {origPriceFormatted}
              </p>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'baseline', color: settings.default_price_color || '#111' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>R$</span>
              <span style={{ fontSize: '3rem', fontWeight: 950 }}>{priceParts[0]}</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>,{priceParts[1]}</span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
          <p style={{ fontSize: '0.9rem', color: '#666', margin: 0, fontWeight: 600 }}>
            em até 12x de R$ {(currentPrice / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span style={{ 
            padding: '2px 8px', 
            borderRadius: '4px', 
            fontSize: '0.75rem', 
            fontWeight: 800, 
            backgroundColor: currentStock > 0 ? '#22c55e15' : '#ef444415', 
            color: currentStock > 0 ? '#22c55e' : '#ef4444' 
          }}>
            {currentStock > 0 ? `${currentStock} disponíveis` : 'Sem Estoque'}
          </span>
        </div>
      </div>

      {/* 1.5 Breve Descrição */}
      <div style={{ display: 'grid', gap: '1rem', borderTop: '1px solid #eaeaea', borderBottom: '1px solid #eaeaea', padding: '1.5rem 0' }}>
        <p style={{ color: '#555', lineHeight: 1.6, fontSize: '1rem', margin: 0 }}>
          {product?.short_description || 'Nenhuma descrição breve informada para este produto.'}
        </p>
      </div>

      {/* 2. Variações */}
      {product?.has_variations && product?.variation_options?.map((opt: any, idx: number) => (
        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.95rem', fontWeight: 700, color: '#333' }}>
            {opt.name}: <span style={{ color: primaryColor, fontWeight: 800 }}>{selectedOptions[opt.name]}</span>
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {opt.values?.map((val: string, vIdx: number) => {
              const isSelected = selectedOptions[opt.name] === val
              return (
                <button
                  key={vIdx}
                  onClick={() => handleOptionSelect(opt.name, val)}
                  style={{
                    padding: '0.6rem 1.2rem',
                    border: isSelected ? `2px solid ${primaryColor}` : '1px solid #ddd',
                    backgroundColor: isSelected ? `${primaryColor}10` : '#fff',
                    color: isSelected ? primaryColor : '#444',
                    borderRadius: buttonRadius,
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {val}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* 3. Ações de Compra */}
      {/* 3. Ações de Compra */}
      <style>{`
        .product-actions-grid {
          display: grid !important;
          gap: 1.25rem !important;
          height: auto !important;
        }
        
        @media (min-width: 641px) {
          .product-actions-catalog-grid {
            grid-template-columns: auto 1fr !important;
            height: 3.5rem !important;
          }
          .product-actions-store-grid {
            grid-template-columns: auto 1fr 2fr !important;
            height: 3.5rem !important;
          }
          .action-btn-height {
            height: 100% !important;
          }
        }

        @media (max-width: 768px) {
          .product-actions-catalog-grid {
            grid-template-columns: 1fr !important;
          }
          .product-actions-store-grid {
            grid-template-columns: auto 1fr !important;
          }
          .btn-add-to-cart-wrapper {
            grid-column: span 2 !important;
            height: 3.5rem !important;
          }
          .action-btn-height {
            height: 3.5rem !important;
          }
        }
      `}</style>

      {storeMode === 'catalogo' ? (
        <div className="product-actions-grid product-actions-catalog-grid">
          <button
            onClick={handleFavoriteClick}
            title={isFavorited ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
            className="action-btn-height"
            style={{
              width: '3.5rem',
              borderRadius: buttonRadius,
              border: '2px solid #eaeaea',
              backgroundColor: isFavorited ? '#ef444415' : '#fff',
              color: isFavorited ? '#ef4444' : '#666',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Heart size={24} fill={isFavorited ? '#ef4444' : 'none'} />
          </button>
          {currentStock <= 0 ? (
            <button 
              disabled
              className="action-btn-height"
              style={{ 
                padding: '0 1.2rem', 
                backgroundColor: '#cbd5e1', 
                color: '#64748b', 
                border: 'none', 
                borderRadius: buttonRadius, 
                fontSize: '1.1rem', 
                fontWeight: 800,
                cursor: 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                width: '100%'
              }}
            >
              <MessageCircle size={24} />
              Esgotado
            </button>
          ) : (
            <Link 
              href={storeWhatsapp ? `https://wa.me/${storeWhatsapp.replace(/\D/g,'')}?text=${whatsappText}` : '#'}
              target="_blank"
              className="action-btn-height"
              style={{ 
                padding: '0 1.2rem', 
                backgroundColor: '#25D366', 
                color: 'white', 
                border: 'none', 
                borderRadius: buttonRadius, 
                fontSize: '1.1rem', 
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                textDecoration: 'none',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              <MessageCircle size={24} />
              Comprar via WhatsApp
            </Link>
          )}
        </div>
      ) : (
        <div className="product-actions-grid product-actions-store-grid">
          <button
            onClick={handleFavoriteClick}
            title={isFavorited ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
            className="action-btn-height"
            style={{
              width: '3.5rem',
              borderRadius: buttonRadius,
              border: '2px solid #eaeaea',
              backgroundColor: isFavorited ? '#ef444415' : '#fff',
              color: isFavorited ? '#ef4444' : '#666',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Heart size={22} fill={isFavorited ? '#ef4444' : 'none'} />
          </button>

          <div className="action-btn-height" style={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between', 
            border: '2px solid #eaeaea', 
            borderRadius: buttonRadius,
            overflow: 'hidden',
            backgroundColor: currentStock <= 0 ? '#f1f5f9' : '#fff',
            opacity: currentStock <= 0 ? 0.5 : 1
          }}>
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={currentStock <= 0}
              style={{ height: '100%', padding: '0 0.75rem', background: 'transparent', border: 'none', cursor: currentStock <= 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', color: '#666', transition: 'background-color 0.2s ease', flexShrink: 0 }}
              onMouseOver={(e) => { if(currentStock > 0) e.currentTarget.style.backgroundColor = '#f5f5f5' }}
              onMouseOut={(e) => { if(currentStock > 0) e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              <Minus size={16} />
            </button>
            <span style={{ textAlign: 'center', fontWeight: 800, fontSize: '1.1rem', color: '#111', flexShrink: 0 }}>
              {quantity}
            </span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              disabled={currentStock <= 0 || quantity >= currentStock}
              style={{ height: '100%', padding: '0 0.75rem', background: 'transparent', border: 'none', cursor: currentStock <= 0 || quantity >= currentStock ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', color: '#666', transition: 'background-color 0.2s ease', flexShrink: 0 }}
              onMouseOver={(e) => { if(currentStock > 0 && quantity < currentStock) e.currentTarget.style.backgroundColor = '#f5f5f5' }}
              onMouseOut={(e) => { if(currentStock > 0 && quantity < currentStock) e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              <Plus size={16} />
            </button>
          </div>

          <button 
            onClick={handleAddToCart}
            disabled={currentStock <= 0}
            className={currentStock <= 0 ? "btn-add-to-cart-wrapper" : "btn-buy-dynamic btn-add-to-cart-wrapper"} 
            style={{ 
              width: '100%',
              padding: '0 0.5rem', 
              borderRadius: buttonRadius, 
              fontSize: '0.85rem', 
              fontWeight: 800,
              cursor: currentStock <= 0 ? 'not-allowed' : 'pointer',
              backgroundColor: currentStock <= 0 ? '#cbd5e1' : undefined,
              color: currentStock <= 0 ? '#64748b' : undefined,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              letterSpacing: '0.5px',
              whiteSpace: 'nowrap',
              border: 'none'
            }}
          >
            <ShoppingCart size={20} />
            {currentStock <= 0 ? 'ESGOTADO' : 'ADICIONAR AO CARRINHO'}
          </button>
        </div>
      )}
    </div>
  )
}
