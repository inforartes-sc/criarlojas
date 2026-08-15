"use client"
import { useState, useEffect, useMemo } from 'react'
import { ShoppingCart, Minus, Plus, MessageCircle, Heart, Shirt, Sparkles, X, Coffee } from 'lucide-react'
import Link from 'next/link'
import { addToCart } from '@/lib/cartStore'
import { toggleFavorite, isFavorited as checkFavorited } from '@/lib/favoriteStore'
import toast from 'react-hot-toast'
import ProductCustomizer from './Customizer/ProductCustomizer'

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
  const [showCustomizerModal, setShowCustomizerModal] = useState(false)

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

  const currentPrice = currentSkuObj 
    ? (currentSkuObj.sale_price ? parseFloat(currentSkuObj.sale_price) : parseFloat(currentSkuObj.price || 0))
    : (product?.sale_price ? parseFloat(product.sale_price) : parseFloat(product?.price || 0))
  const originalPrice = currentSkuObj 
    ? (currentSkuObj.sale_price ? parseFloat(currentSkuObj.price) : null)
    : (product?.sale_price ? parseFloat(product.price) : null)
  const currentStock = product?.has_variations && currentSkuObj ? (parseInt(currentSkuObj.stock_quantity) || 0) : (parseInt(product?.stock_quantity) || 0)
  
  const priceParts = currentPrice.toFixed(2).split('.')
  const origPriceFormatted = originalPrice ? originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : null

  const currentPlan = (settings?.plan || 'pro').toLowerCase()
  const isCustomizerAllowedForPlan = ['pro', 'premium', 'master', 'enterprise'].includes(currentPlan)

  const isCustomizerEnabled = settings?.customizer_enabled && isCustomizerAllowedForPlan

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
      storeId: product.store_id,
      sku: currentSkuObj?.sku || product?.sku
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

  const productPriceFormatted = currentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const productSkuClean = product?.sku?.replace('#hide_stock', '').replace('#hide_price', '') || product?.id?.slice(0, 8).toUpperCase()
  
  const whatsappText = encodeURIComponent(
    `Olá! Gostaria de saber mais sobre o produto:\n\n` +
    `*Produto:* ${product?.name}\n` +
    (product?.has_variations ? `*Variação:* ${Object.entries(selectedOptions).map(([k,v]) => `${k}: ${v}`).join(', ')}\n` : '') +
    `*SKU:* ${productSkuClean}\n` +
    `*Valor:* R$ ${productPriceFormatted}`
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
          {(!product?.sku?.includes('#hide_stock') || currentStock <= 0) && (
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
          )}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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

          {/* Botão de Personalização (abaixo da linha principal de compra) */}
          {isCustomizerEnabled && (
            <button
              onClick={() => setShowCustomizerModal(true)}
              style={{
                width: '100%',
                padding: '1rem 1.25rem',
                borderRadius: buttonRadius,
                fontSize: '0.95rem',
                fontWeight: 800,
                cursor: 'pointer',
                backgroundColor: 'rgba(99, 102, 241, 0.08)',
                color: '#6366f1',
                border: '2px solid #6366f1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.65rem',
                transition: 'all 0.2s ease'
              }}
            >
              <Shirt size={22} color="#6366f1" />
              <span>PERSONALIZAR CAMISETA & ESTAMPA</span>
              <Sparkles size={16} color="#6366f1" />
            </button>
          )}
          
          {currentStock > 0 && (
            <Link 
              href={storeWhatsapp ? `https://wa.me/${storeWhatsapp.replace(/\D/g,'')}?text=${whatsappText}` : '#'}
              target="_blank"
              style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                padding: '1.1rem',
                backgroundColor: '#25D366',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: buttonRadius,
                fontWeight: 800,
                fontSize: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                boxShadow: '0 4px 12px rgba(37, 211, 102, 0.2)'
              }}
            >
              <MessageCircle size={22} />
              Comprar via WhatsApp
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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

          {/* Botão de Personalização (abaixo da linha principal de compra) */}
          {isCustomizerEnabled && (
            <button
              onClick={() => setShowCustomizerModal(true)}
              style={{
                width: '100%',
                padding: '1rem 1.25rem',
                borderRadius: buttonRadius,
                fontSize: '0.95rem',
                fontWeight: 800,
                cursor: 'pointer',
                backgroundColor: 'rgba(99, 102, 241, 0.08)',
                color: '#6366f1',
                border: '2px solid #6366f1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.65rem',
                transition: 'all 0.2s ease'
              }}
            >
              <Shirt size={22} color="#6366f1" />
              <span>PERSONALIZAR CAMISETA & ESTAMPA</span>
              <Sparkles size={16} color="#6366f1" />
            </button>
          )}
        </div>
      )}

      {/* Modal Interativo do Customizador */}
      {showCustomizerModal && (
        <div className="customizer-modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 99999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1.5rem',
          overflowY: 'auto'
        }}>
          <style>{`
            @media (max-width: 768px) {
              .customizer-modal-overlay {
                padding: 0.5rem !important;
              }
              .customizer-modal-container {
                padding: 1.1rem 0.85rem !important;
                border-radius: 14px !important;
                max-height: 96vh !important;
              }
              .customizer-modal-title {
                font-size: 1.1rem !important;
              }
              .customizer-modal-subtitle {
                font-size: 0.75rem !important;
              }
            }
          `}</style>

          <div className="customizer-modal-container" style={{
            width: '100%',
            maxWidth: '1000px',
            maxHeight: '92vh',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflowY: 'auto',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem' }}>
              <div>
                <h2 className="customizer-modal-title" style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                  <Shirt size={24} color="#6366f1" />
                  Personalizador de Camiseta
                </h2>
                <p className="customizer-modal-subtitle" style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
                  Escolha a cor da camisa, selecione a estampa e veja o mockup em tempo real!
                </p>
              </div>

              <button
                onClick={() => setShowCustomizerModal(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#475569'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Customizer Component Body */}
            <ProductCustomizer
              product={product}
              settings={settings}
              primaryColor={primaryColor}
              buttonRadius={buttonRadius}
              onClose={() => setShowCustomizerModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
