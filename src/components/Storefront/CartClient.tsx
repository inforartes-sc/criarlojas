"use client"

import { useState, useEffect } from 'react'
import { ShoppingBag, ArrowRight, ArrowLeft, Trash2, Plus, Minus, Tag, CheckCircle2, Truck, MapPin } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { getCart, updateQuantity, removeFromCart, CartItem } from '@/lib/cartStore'
import StoreHeader from './StoreHeader'
import StoreFooter from './StoreFooter'

interface CartClientProps {
  store: any
  categories: any[]
}

export default function CartClient({ store, categories }: CartClientProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [homePath, setHomePath] = useState('/')
  
  const settings = store?.settings || {}
  const primaryColor = settings.primary_color || '#6366f1'

  // Coupon State
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)

  // Shipping Calculator State
  const [cepInput, setCepInput] = useState('')
  const [shippingOptions, setShippingOptions] = useState<any[]>([])
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<any>(null)

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
      if (segments.length >= 2 && segments[0] === 'stores') {
        baseHome = `/stores/${segments[1]}`
      }
      setHomePath(baseHome)
    }

    return () => window.removeEventListener('cartUpdated', handleCartUpdated)
  }, [])

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)

  // Calculate discount
  let discountAmount = 0
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discountAmount = subtotal * (appliedCoupon.value / 100)
    } else {
      discountAmount = appliedCoupon.value
    }
  }

  const baseShippingCost = settings.free_shipping_threshold && subtotal >= settings.free_shipping_threshold ? 0 : (settings.fixed_shipping_cost || 15)
  const shippingCost = selectedShippingMethod ? selectedShippingMethod.cost : baseShippingCost
  const finalTotal = Math.max(0, subtotal - discountAmount + (subtotal > 0 ? shippingCost : 0))

  const handleCalculateShipping = () => {
    if (!cepInput.trim() || cepInput.replace(/\D/g, '').length !== 8) {
      return toast.error('Digite um CEP válido com 8 dígitos.')
    }

    if (settings.free_shipping_threshold && subtotal >= settings.free_shipping_threshold) {
      const freeOption = { id: 'free', label: 'Frete Grátis', cost: 0, deadline: '3 a 5 dias úteis' }
      setShippingOptions([freeOption])
      setSelectedShippingMethod(freeOption)
      toast.success('Parabéns! Você ganhou Frete Grátis!')
      return
    }

    const fixedCost = settings.fixed_shipping_cost || 15
    const options = [
      { id: 'pac', label: 'Entrega Padrão (PAC)', cost: fixedCost, deadline: '5 a 8 dias úteis' },
      { id: 'sedex', label: 'Entrega Expressa (Sedex)', cost: fixedCost + 18.50, deadline: '2 a 3 dias úteis' }
    ]
    setShippingOptions(options)
    setSelectedShippingMethod(options[0])
    toast.success('Opções de frete calculadas para o CEP ' + cepInput)
  }

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return toast.error('Digite o código do cupom.')

    const coupons = settings.coupons || []
    const found = coupons.find((c: any) => c.code.toUpperCase() === couponCode.trim().toUpperCase())

    if (!found) {
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
        
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem' }}>
          <div style={{ textAlign: 'center', maxWidth: '500px', backgroundColor: '#fff', padding: '4rem 3rem', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            <ShoppingBag size={64} color="#cbd5e1" style={{ margin: '0 auto 1.5rem' }} />
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>Seu carrinho está vazio</h2>
            <p style={{ color: '#64748b', marginBottom: '2.5rem', lineHeight: 1.6 }}>Parece que você ainda não adicionou nenhum produto ao seu carrinho. Explore nossa loja e encontre as melhores ofertas!</p>
            <Link 
              href={homePath} 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '1.2rem 2.5rem', backgroundColor: primaryColor, color: '#fff', textDecoration: 'none', borderRadius: '12px', fontWeight: 800, boxShadow: `0 10px 25px ${primaryColor}40` }}
            >
              <ArrowLeft size={20} /> Continuar Comprando
            </Link>
          </div>
        </main>

        <StoreFooter store={store} settings={settings} primaryColor={primaryColor} />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      <StoreHeader store={store} settings={settings} primaryColor={primaryColor} categories={categories} />
      
      <main style={{ flex: 1, maxWidth: '1400px', margin: '3rem auto', padding: '0 2rem', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
          <Link href={homePath} style={{ color: '#64748b', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
            <ArrowLeft size={18} /> Continuar Comprando
          </Link>
          <span style={{ color: '#0f172a', fontWeight: 800 }}>Meu Carrinho</span>
        </div>

        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', marginBottom: '2.5rem' }}>Meu Carrinho ({cartItems.reduce((a,b) => a + b.quantity, 0)})</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '3rem', alignItems: 'start' }}>
          {/* COLUNA ESQUERDA: LISTA DE PRODUTOS */}
          <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {cartItems.map((item) => (
              <div key={item.id} style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '2rem' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '16px', backgroundColor: '#f1f5f9', backgroundImage: `url(${item.image})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>{item.name}</h3>
                  {item.variations && Object.entries(item.variations).length > 0 && (
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#64748b', display: 'flex', gap: '1rem' }}>
                      {Object.entries(item.variations).map(([k, v]) => (
                        <span key={k} style={{ backgroundColor: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: 600 }}>{k}: {v}</span>
                      ))}
                    </p>
                  )}
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#fff' }}>
                      <button onClick={() => handleQuantityChange(item.id, item.quantity - 1)} style={{ padding: '0.5rem 0.8rem', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                        <Minus size={14} />
                      </button>
                      <span style={{ padding: '0 1rem', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{item.quantity}</span>
                      <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)} style={{ padding: '0.5rem 0.8rem', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                        <Plus size={14} />
                      </button>
                    </div>

                    <button onClick={() => handleRemoveItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700 }}>
                      <Trash2 size={16} /> Remover
                    </button>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Preço Unitário: R$ {item.price.toFixed(2).replace('.', ',')}</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: primaryColor }}>
                    R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* COLUNA DIREITA: RESUMO E CUPOM */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', position: 'sticky', top: '2rem' }}>
            {/* CUPOM DE DESCONTO */}
            <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: '#0f172a', fontWeight: 800, fontSize: '1.1rem' }}>
                <Tag size={20} color={primaryColor} /> Cupom de Desconto
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
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
            <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: '#0f172a', fontWeight: 800, fontSize: '1.1rem' }}>
                <Truck size={20} color={primaryColor} /> Calcular Frete e Prazo
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: shippingOptions.length > 0 ? '1.5rem' : 0 }}>
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
                  style={{ padding: '0.85rem 1.5rem', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                >
                  Calcular
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
            <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
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
                  <span style={{ fontWeight: 700, color: shippingCost === 0 ? '#10b981' : '#0f172a' }}>
                    {shippingCost === 0 ? 'Grátis' : `R$ ${shippingCost.toFixed(2).replace('.', ',')}`}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Total Estimado</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 950, color: primaryColor }}>
                    R$ {finalTotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              <Link 
                href="./checkout" 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '1.4rem', backgroundColor: primaryColor, color: '#fff', textDecoration: 'none', borderRadius: '16px', fontWeight: 900, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '1px', boxShadow: `0 10px 25px ${primaryColor}40`, transition: 'all 0.2s ease', textAlign: 'center' }}
              >
                Prosseguir para Checkout <ArrowRight size={22} />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <StoreFooter store={store} settings={settings} primaryColor={primaryColor} />
    </div>
  )
}
