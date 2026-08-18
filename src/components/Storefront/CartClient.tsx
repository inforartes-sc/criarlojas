"use client"

import { useState, useEffect } from 'react'
import { ShoppingBag, ArrowRight, ArrowLeft, Trash2, Plus, Minus, Tag, CheckCircle2, Truck, MapPin, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { getCart, updateQuantity, removeFromCart, CartItem } from '@/lib/cartStore'
import StoreHeader from './StoreHeader'
import StoreFooter from './StoreFooter'
import { calculateShippingAction } from '@/app/actions/shipping'

interface CartClientProps {
  store: any
  categories: any[]
}

export default function CartClient({ store, categories }: CartClientProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [homePath, setHomePath] = useState('/')
  
  const settings = store?.settings || {}
  const primaryColor = settings.primary_color || '#6366f1'
  const plan = settings.plan || 'basic'
  const storeMode = (plan === 'basic' || plan === 'free') ? 'catalogo' : (settings.store_mode || 'loja')
  const isCatalogo = storeMode === 'catalogo'

  const handleCheckoutWhatsapp = () => {
    if (!settings.whatsapp) {
      toast.error('WhatsApp não configurado pelo lojista.')
      return
    }

    const cleanPhone = settings.whatsapp.replace(/\D/g, '')
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`
    
    let message = `Olá! Gostaria de fazer um pedido/cotação dos seguintes itens:\n\n`
    cartItems.forEach((item, index) => {
      message += `*${index + 1}. ${item.name}*\n`
      message += `   Qtd: ${item.quantity}\n`
      if (item.variations && Object.keys(item.variations).length > 0) {
        const variationsStr = Object.entries(item.variations)
          .map(([key, val]) => `${key}: ${val}`)
          .join(', ')
        message += `   Variações: ${variationsStr}\n`
      }
      if (item.customization) {
        if (item.customization.colorName) message += `   Cor da Camisa: ${item.customization.colorName}\n`
        if (item.customization.printTitle) message += `   Estampa: ${item.customization.printTitle}\n`
      }
      if (item.sku) {
        message += `   SKU: ${item.sku}\n`
      }
      message += `   Preço unitário: R$ ${item.price.toFixed(2).replace('.', ',')}\n`
      message += `   Subtotal: R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}\n\n`
    })

    if (appliedCoupon) {
      message += `*Cupom Aplicado:* ${appliedCoupon.code.toUpperCase()} (Desconto: R$ ${discountAmount.toFixed(2).replace('.', ',')})\n`
    }

    if (selectedShippingMethod) {
      message += `*Frete:* ${selectedShippingMethod.label} (Prazo: ${selectedShippingMethod.deadline}) - ${shippingCost === 0 ? 'Grátis' : `R$ ${shippingCost.toFixed(2).replace('.', ',')}`}\n`
    }
    
    message += `\n*Total Estimado: R$ ${finalTotal.toFixed(2).replace('.', ',')}*`
    
    const text = encodeURIComponent(message)
    window.open(`https://wa.me/${formattedPhone}?text=${text}`, '_blank')
  }

  // Coupon State
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)

  // Shipping Calculator State
  const [cepInput, setCepInput] = useState('')
  const [shippingOptions, setShippingOptions] = useState<any[]>([])
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<any>(null)
  const [calculatingShipping, setCalculatingShipping] = useState(false)

  useEffect(() => {
    setCartItems(getCart())
    const handleCartUpdated = () => {
      setCartItems(getCart())
    }
    window.addEventListener('cartUpdated', handleCartUpdated)

    if (typeof window !== 'undefined') {
      const path = window.location.pathname
      const segments = path.split('/').filter(Boolean)
      let baseHome = '/'
      if (segments.length >= 2 && (segments[0] === 'stores' || segments[0] === 'modelos')) {
        baseHome = `/${segments[0]}/${segments[1]}`
      }
      setHomePath(baseHome)
    }

    return () => window.removeEventListener('cartUpdated', handleCartUpdated)
  }, [])

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)

  // Calculate discount
  let discountAmount = 0
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percent' || appliedCoupon.type === 'percentage') {
      discountAmount = subtotal * (appliedCoupon.value / 100)
    } else {
      discountAmount = appliedCoupon.value
    }
  }

  const shippingCost = selectedShippingMethod ? selectedShippingMethod.cost : 0
  const finalTotal = Math.max(0, subtotal - discountAmount + (subtotal > 0 && selectedShippingMethod ? shippingCost : 0))

  const handleCalculateShipping = async () => {
    if (!cepInput.trim() || cepInput.replace(/\D/g, '').length !== 8) {
      return toast.error('Digite um CEP válido com 8 dígitos.')
    }

    setCalculatingShipping(true)
    try {
      const formattedItems = cartItems.map(item => ({
        price: item.price,
        quantity: item.quantity,
        weight: (item as any).weight,
        length: (item as any).length,
        width: (item as any).width,
        height: (item as any).height
      }))

      const res = await calculateShippingAction({
        storeId: store.id,
        cep: cepInput,
        items: formattedItems
      })

      if (res.success && res.options) {
        setShippingOptions(res.options)
        setSelectedShippingMethod(res.options[0])
        toast.success('Opções de frete calculadas com sucesso!')
      } else {
        toast.error(res.error || 'Erro ao calcular frete.')
      }
    } catch (err) {
      console.error(err)
      toast.error('Erro na conexão com o servidor de frete.')
    } finally {
      setCalculatingShipping(false)
    }
  }

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return toast.error('Digite o código do cupom.')

    const coupons = settings.promotions?.coupons || settings.coupons || []
    const found = coupons.find((c: any) => c.code.toUpperCase() === couponCode.trim().toUpperCase())

    if (!found || found.active === false) {
      return toast.error('Cupom inválido ou inexistente.')
    }

    if (found.expiry && new Date(found.expiry) < new Date()) {
      return toast.error('Este cupom já expirou.')
    }

    if (found.threshold && subtotal < found.threshold) {
      return toast.error(`Pedido mínimo de R$ ${found.threshold.toFixed(2)} para usar este cupom.`)
    }

    if (found.limit && (found.used || 0) >= found.limit) {
      return toast.error('Este cupom atingiu o limite de usos.')
    }

    setAppliedCoupon(found)
    toast.success('Cupom aplicado com sucesso!')
  }

  const handleQuantityChange = (id: string, newQty: number) => {
    if (newQty < 1) return
    updateQuantity(id, newQty)
  }

  const handleRemoveItem = (id: string) => {
    removeFromCart(id)
    toast.success('Produto removido do carrinho.')
  }

  if (cartItems.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
        <StoreHeader store={store} settings={settings} primaryColor={primaryColor} categories={categories} />
        
        <main className="cart-empty-container">
          <div className="cart-empty-card">
            <ShoppingBag size={64} color="#cbd5e1" style={{ margin: '0 auto 1.5rem' }} />
            <h2>Seu carrinho está vazio</h2>
            <p>Parece que você ainda não adicionou nenhum produto ao seu carrinho. Explore nossa loja e encontre as melhores ofertas!</p>
            <Link 
              href={homePath} 
              className="cart-empty-btn"
              style={{ backgroundColor: primaryColor, boxShadow: `0 10px 25px ${primaryColor}40` }}
            >
              <ArrowLeft size={20} /> Continuar Comprando
            </Link>
          </div>
        </main>

        <StoreFooter store={store} settings={settings} primaryColor={primaryColor} />

        <style>{`
          .cart-empty-container {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 4rem 2rem;
            width: 100%;
            box-sizing: border-box;
          }
          .cart-empty-card {
            text-align: center;
            max-width: 500px;
            width: 100%;
            background-color: #fff;
            padding: 4rem 3rem;
            border-radius: 24px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.05);
            border: 1px solid #e2e8f0;
            box-sizing: border-box;
          }
          .cart-empty-card h2 {
            font-size: 1.8rem;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 0.75rem;
          }
          .cart-empty-card p {
            color: #64748b;
            margin-bottom: 2.5rem;
            line-height: 1.6;
          }
          .cart-empty-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            padding: 1.2rem 2.5rem;
            color: #fff;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 800;
          }
          @media (max-width: 640px) {
            .cart-empty-container {
              padding: 2rem 1rem;
            }
            .cart-empty-card {
              padding: 2.5rem 1.5rem;
              border-radius: 20px;
            }
            .cart-empty-card h2 {
              font-size: 1.4rem;
            }
            .cart-empty-btn {
              width: 100%;
              padding: 1rem 1.5rem;
            }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      <StoreHeader store={store} settings={settings} primaryColor={primaryColor} categories={categories} />
      
      <main className="cart-main-container">
        <div className="cart-header-nav">
          <Link href={homePath} style={{ color: '#64748b', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
            <ArrowLeft size={18} /> Continuar Comprando
          </Link>
          <span style={{ color: '#0f172a', fontWeight: 800 }}>Meu Carrinho</span>
        </div>

        <h1 className="cart-page-title">Meu Carrinho ({cartItems.reduce((a,b) => a + b.quantity, 0)})</h1>

        <div className="cart-grid-layout">
          {/* COLUNA ESQUERDA: LISTA DE PRODUTOS */}
          <div className="cart-items-card">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item-row">
                <div className="cart-item-image" style={{ backgroundImage: `url(${item.image})` }} />
                
                <div className="cart-item-info">
                  <h3 className="cart-item-title">{item.name}</h3>
                  {item.variations && Object.entries(item.variations).length > 0 && (
                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#64748b', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {Object.entries(item.variations).map(([k, v]) => (
                        <span key={k} style={{ backgroundColor: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: 600 }}>{k}: {v}</span>
                      ))}
                    </p>
                  )}
                  {item.customization && (
                    <div style={{ margin: '0 0 1rem 0', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      {item.customization.colorName && (
                        <span style={{ fontSize: '0.75rem', backgroundColor: '#e0e7ff', color: '#3730a3', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          Cor: {item.customization.colorName}
                        </span>
                      )}
                      {item.customization.printTitle && (
                        <span style={{ fontSize: '0.75rem', backgroundColor: '#fef3c7', color: '#92400e', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 700 }}>
                          Estampa: {item.customization.printTitle}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="cart-item-actions-row">
                    <div className="cart-qty-picker">
                      <button onClick={() => handleQuantityChange(item.id, item.quantity - 1)} aria-label="Diminuir quantidade">
                        <Minus size={14} />
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)} aria-label="Aumentar quantidade">
                        <Plus size={14} />
                      </button>
                    </div>

                    <button onClick={() => handleRemoveItem(item.id)} className="cart-remove-btn">
                      <Trash2 size={16} /> <span className="cart-remove-text">Remover</span>
                    </button>
                  </div>
                </div>

                <div className="cart-item-price-col">
                  <div className="cart-unit-price">Preço Unitário: R$ {item.price.toFixed(2).replace('.', ',')}</div>
                  <div className="cart-subtotal-price" style={{ color: primaryColor }}>
                    R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* COLUNA DIREITA: RESUMO E CUPOM */}
          <div className="cart-sidebar-col">
            {/* CUPOM DE DESCONTO */}
            <div className="cart-card-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: '#0f172a', fontWeight: 800, fontSize: '1.1rem' }}>
                <Tag size={20} color={primaryColor} /> Cupom de Desconto
              </div>

              <div className="cart-input-btn-group">
                <input 
                  type="text" 
                  value={couponCode} 
                  onChange={(e) => setCouponCode(e.target.value)} 
                  placeholder="CÓDIGO" 
                  style={{ flex: 1, padding: '0.85rem 1.2rem', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', outline: 'none', fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase' }} 
                />
                <button 
                  type="button" 
                  onClick={handleApplyCoupon} 
                  style={{ padding: '0.85rem 1.5rem', backgroundColor: primaryColor, color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', boxShadow: `0 4px 12px ${primaryColor}40` }}
                >
                  Aplicar
                </button>
              </div>

              {appliedCoupon && (
                <div style={{ marginTop: '1.25rem', padding: '1rem', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065f46', fontWeight: 700 }}>
                    <CheckCircle2 size={18} /> Cupom {appliedCoupon.code.toUpperCase()} Ativo
                  </div>
                  <button type="button" onClick={() => setAppliedCoupon(null)} style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>Remover</button>
                </div>
              )}
            </div>

            {/* CÁLCULO DE FRETE */}
            <div className="cart-card-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: '#0f172a', fontWeight: 800, fontSize: '1.1rem' }}>
                <Truck size={20} color={primaryColor} /> Calcular Frete e Prazo
              </div>

              <div className="cart-input-btn-group" style={{ marginBottom: shippingOptions.length > 0 ? '1.5rem' : 0 }}>
                <input 
                  type="text" 
                  value={cepInput} 
                  onChange={(e) => setCepInput(e.target.value)} 
                  placeholder="00000-000" 
                  maxLength={9}
                  style={{ flex: 1, padding: '0.85rem 1.2rem', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', outline: 'none', fontSize: '0.95rem', fontWeight: 800 }} 
                />
                <button 
                  type="button" 
                  onClick={handleCalculateShipping} 
                  disabled={calculatingShipping}
                  style={{ padding: '0.85rem 1.5rem', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: calculatingShipping ? 'default' : 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', opacity: calculatingShipping ? 0.7 : 1 }}
                >
                  {calculatingShipping ? 'Calculando...' : 'Calcular'}
                </button>
              </div>

              {shippingOptions.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Selecione a modalidade:</div>
                  {shippingOptions.map(option => {
                    const isSelected = selectedShippingMethod?.id === option.id
                    return (
                      <div 
                        key={option.id}
                        onClick={() => setSelectedShippingMethod(option)}
                        style={{ padding: '1.2rem', borderRadius: '14px', border: isSelected ? `2px solid ${primaryColor}` : '1px solid #e2e8f0', backgroundColor: isSelected ? `${primaryColor}08` : '#f8fafc', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s ease' }}
                      >
                        <div>
                          <div style={{ fontWeight: 800, color: isSelected ? primaryColor : '#0f172a', fontSize: '0.95rem', marginBottom: '0.2rem' }}>{option.label}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Prazo estimado: {option.deadline}</div>
                        </div>
                        <div style={{ fontWeight: 900, fontSize: '1.1rem', color: option.cost === 0 ? '#10b981' : '#0f172a' }}>
                          {option.cost === 0 ? 'Grátis' : `R$ ${option.cost.toFixed(2).replace('.', ',')}`}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* RESUMO DO PEDIDO E CHECKOUT */}
            <div className="cart-card-box" style={{ display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '2rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.5rem' }}>Resumo da Compra</h2>

              <div style={{ display: 'grid', gap: '1.25rem', marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '1.05rem' }}>
                  <span>Subtotal dos Produtos</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </div>

                {appliedCoupon && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontSize: '1.05rem' }}>
                    <span>Desconto ({appliedCoupon.code})</span>
                    <span style={{ fontWeight: 700 }}>- R$ {discountAmount.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}

                 <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '1.05rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.5rem' }}>
                  <span>Frete Estimado</span>
                  <span style={{ fontWeight: 700, color: selectedShippingMethod ? (shippingCost === 0 ? '#10b981' : '#0f172a') : '#64748b' }}>
                    {selectedShippingMethod ? (shippingCost === 0 ? 'Grátis' : `R$ ${shippingCost.toFixed(2).replace('.', ',')}`) : 'A calcular'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Total Estimado</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 950, color: primaryColor }}>
                    R$ {finalTotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              {isCatalogo ? (
                <button 
                  onClick={handleCheckoutWhatsapp}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '0.75rem', 
                    padding: '1.4rem', 
                    backgroundColor: '#25D366', 
                    color: '#fff', 
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '16px', 
                    fontWeight: 900, 
                    fontSize: '1.1rem', 
                    textTransform: 'uppercase', 
                    letterSpacing: '1px', 
                    boxShadow: '0 10px 25px rgba(37, 211, 102, 0.4)', 
                    transition: 'all 0.2s ease', 
                    textAlign: 'center',
                    width: '100%'
                  }}
                >
                  Finalizar por WhatsApp <MessageCircle size={22} />
                </button>
              ) : (
                <Link 
                  href={`${homePath === '/' ? '' : homePath}/checkout`} 
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '1.4rem', backgroundColor: primaryColor, color: '#fff', textDecoration: 'none', borderRadius: '16px', fontWeight: 900, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '1px', boxShadow: `0 10px 25px ${primaryColor}40`, transition: 'all 0.2s ease', textAlign: 'center' }}
                >
                  Prosseguir para Checkout <ArrowRight size={22} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>

      <StoreFooter store={store} settings={settings} primaryColor={primaryColor} />

      <style>{`
        .cart-main-container {
          flex: 1;
          max-width: 1400px;
          margin: 3rem auto;
          padding: 0 2rem;
          width: 100%;
          box-sizing: border-box;
        }

        .cart-header-nav {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2.5rem;
        }

        .cart-page-title {
          font-size: 2.2rem;
          font-weight: 900;
          color: #0f172a;
          margin-bottom: 2.5rem;
        }

        .cart-grid-layout {
          display: grid;
          grid-template-columns: 1.8fr 1fr;
          gap: 3rem;
          align-items: start;
        }

        .cart-items-card {
          background-color: #fff;
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .cart-item-row {
          display: flex;
          gap: 1.5rem;
          align-items: center;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 2rem;
        }
        .cart-item-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .cart-item-image {
          width: 100px;
          height: 100px;
          border-radius: 16px;
          background-color: #f1f5f9;
          background-size: cover;
          background-position: center;
          flex-shrink: 0;
        }

        .cart-item-info {
          flex: 1;
          min-width: 0;
        }

        .cart-item-title {
          margin: 0 0 0.5rem 0;
          font-size: 1.15rem;
          font-weight: 800;
          color: #0f172a;
        }

        .cart-item-actions-row {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .cart-qty-picker {
          display: flex;
          align-items: center;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          overflow: hidden;
          background-color: #fff;
        }

        .cart-qty-picker button {
          padding: 0.5rem 0.8rem;
          background: none;
          border: none;
          cursor: pointer;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cart-qty-picker span {
          padding: 0 1rem;
          font-size: 1rem;
          font-weight: 800;
          color: #0f172a;
        }

        .cart-remove-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #ef4444;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.85rem;
          font-weight: 700;
        }

        .cart-item-price-col {
          text-align: right;
          flex-shrink: 0;
        }

        .cart-unit-price {
          font-size: 0.85rem;
          color: #64748b;
          margin-bottom: 0.25rem;
        }

        .cart-subtotal-price {
          font-size: 1.3rem;
          font-weight: 900;
        }

        .cart-sidebar-col {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
          position: sticky;
          top: 2rem;
        }

        .cart-card-box {
          background-color: #fff;
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
          border: 1px solid #e2e8f0;
        }

        .cart-input-btn-group {
          display: flex;
          gap: 0.75rem;
        }

        @media (max-width: 1024px) {
          .cart-grid-layout {
            grid-template-columns: 1.5fr 1fr;
            gap: 2rem;
          }
        }

        @media (max-width: 992px) {
          .cart-grid-layout {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .cart-sidebar-col {
            position: static;
          }
        }

        @media (max-width: 768px) {
          .cart-main-container {
            margin: 1.5rem auto;
            padding: 0 1.25rem;
          }
          .cart-header-nav {
            margin-bottom: 1.5rem;
          }
          .cart-page-title {
            font-size: 1.6rem;
            margin-bottom: 1.5rem;
          }
          .cart-items-card, .cart-card-box {
            padding: 1.5rem;
            border-radius: 18px;
          }
          .cart-item-row {
            padding-bottom: 1.5rem;
          }
        }

        @media (max-width: 640px) {
          .cart-main-container {
            padding: 0 1rem;
          }
          .cart-items-card, .cart-card-box {
            padding: 1.25rem;
            border-radius: 16px;
            gap: 1.25rem;
          }

          .cart-item-row {
            display: grid;
            grid-template-columns: 75px 1fr;
            grid-template-areas:
              "img info"
              "actions price";
            gap: 0.75rem 1rem;
            align-items: center;
          }

          .cart-item-image {
            grid-area: img;
            width: 75px;
            height: 75px;
            border-radius: 12px;
          }

          .cart-item-info {
            grid-area: info;
          }

          .cart-item-title {
            font-size: 1rem;
          }

          .cart-item-actions-row {
            grid-area: actions;
            gap: 0.75rem;
          }

          .cart-item-price-col {
            grid-area: price;
            text-align: right;
          }

          .cart-unit-price {
            display: none;
          }

          .cart-subtotal-price {
            font-size: 1.15rem;
          }

          .cart-qty-picker button {
            padding: 0.4rem 0.6rem;
          }

          .cart-qty-picker span {
            padding: 0 0.6rem;
            font-size: 0.9rem;
          }
        }

        @media (max-width: 480px) {
          .cart-main-container {
            padding: 0 0.75rem;
          }
          .cart-input-btn-group {
            flex-direction: column;
          }
          .cart-input-btn-group button {
            width: 100%;
          }
          .cart-remove-text {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}
