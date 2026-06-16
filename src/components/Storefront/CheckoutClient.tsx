"use client"

import { useState, useEffect } from 'react'
import { ShoppingBag, CreditCard, ShieldCheck, Truck, Loader2, ArrowRight, CheckCircle2, Copy, QrCode, Tag, Lock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { getCart, clearCart, updateQuantity, removeFromCart, CartItem } from '@/lib/cartStore'
import { supabase } from '@/lib/supabase'
import { processCheckoutAction, saveAbandonedCartAction } from '@/app/actions/checkout'
import { loginCustomerAction, updateCustomerPasswordAction, registerCustomerAction } from '@/app/actions/auth'
import StoreHeader from './StoreHeader'
import StoreFooter from './StoreFooter'
import { calculateShippingAction } from '@/app/actions/shipping'

interface CheckoutClientProps {
  store: any
  categories: any[]
}

export default function CheckoutClient({ store, categories }: CheckoutClientProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [successOrder, setSuccessOrder] = useState<any>(null)
  const [homePath, setHomePath] = useState('/')
  
  const settings = store?.settings || {}
  const primaryColor = settings.primary_color || '#6366f1'

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  })

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | 'boleto' | 'whatsapp'>('pix')
  
  // Card Simulation State
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  })

  // Auth States
  const [authStep, setAuthStep] = useState<'auth' | 'checkout'>('auth')
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authName, setAuthName] = useState('')
  const [authPhone, setAuthPhone] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [abandonedCartId, setAbandonedCartId] = useState<string | null>(null)

  // Coupon State
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)

  // Shipping Calculation State
  const [shippingOptions, setShippingOptions] = useState<any[]>([])
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<any>(null)
  const [calculatingShipping, setCalculatingShipping] = useState(false)

  useEffect(() => {
    const cleanCep = formData.cep.replace(/\D/g, '')
    if (cleanCep.length === 8) {
      calculateShipping(cleanCep)
    } else {
      setShippingOptions([])
      setSelectedShippingMethod(null)
    }
  }, [formData.cep])

  const calculateShipping = async (cep: string) => {
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
        cep,
        items: formattedItems
      })

      if (res.success && res.options) {
        setShippingOptions(res.options)
        setSelectedShippingMethod(res.options[0])
      } else {
        toast.error(res.error || 'Erro ao calcular frete.')
      }
    } catch (err) {
      console.error(err)
      toast.error('Erro ao calcular opções de frete.')
    } finally {
      setCalculatingShipping(false)
    }
  }

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search)
    const cartParam = queryParams.get('cart')

    if (cartParam) {
      supabase
        .from('abandoned_carts')
        .select('*')
        .eq('id', cartParam)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error(error)
            setCartItems(getCart())
            return
          }
          if (data && data.items && Array.isArray(data.items)) {
            setCartItems(data.items)
            setAbandonedCartId(data.id)
            setFormData(prev => ({
              ...prev,
              name: data.customer_name || prev.name,
              email: data.customer_email || prev.email,
              phone: data.customer_phone || prev.phone
            }))
            setAuthStep('checkout')
          } else {
            setCartItems(getCart())
          }
        })
    } else {
      setCartItems(getCart())
    }

    const savedUser = localStorage.getItem('store_current_user')
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser)
        setCurrentUser(parsed)
        setFormData(prev => ({
          ...prev,
          name: parsed.name || prev.name || '',
          email: parsed.email || prev.email || '',
          phone: parsed.phone || prev.phone || ''
        }))
        setAuthStep('checkout')
      } catch (e) {
        console.error('Erro ao ler usuario do localStorage', e)
      }
    }

    if (typeof window !== 'undefined') {
      const path = window.location.pathname
      const segments = path.split('/').filter(Boolean)
      let baseHome = '/'
      if (segments.length >= 2 && segments[0] === 'stores') {
        baseHome = `/stores/${segments[1]}`
      }
      setHomePath(baseHome)
    }
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
  
  // Pix extra discount (e.g. 5%)
  let pixDiscount = 0
  if (paymentMethod === 'pix' && settings.pix_discount_percentage) {
    pixDiscount = (subtotal - discountAmount) * (settings.pix_discount_percentage / 100)
  }

  const shippingCost = selectedShippingMethod ? selectedShippingMethod.cost : 0
  const finalTotal = Math.max(0, subtotal - discountAmount - pixDiscount + (selectedShippingMethod ? shippingCost : 0))

  const saveAbandonedCartDraft = async (updatedData = formData) => {
    if ((updatedData.name || updatedData.phone || updatedData.email) && cartItems.length > 0) {
      try {
        const result = await saveAbandonedCartAction({
          id: abandonedCartId,
          storeId: store.id,
          name: updatedData.name,
          email: updatedData.email,
          phone: updatedData.phone,
          cartItems: cartItems.map(item => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            image: item.image || ''
          })),
          totalAmount: finalTotal
        })
        if (result.success && result.id) {
          setAbandonedCartId(result.id)
        }
      } catch (err) {
        console.error('Erro ao salvar rascunho de carrinho abandonado:', err)
      }
    }
  }

  const handleInputBlur = () => {
    saveAbandonedCartDraft()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCardData(prev => ({ ...prev, [name]: value }))
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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authEmail.trim()) return toast.error('Por favor, informe seu e-mail.')
    if (!authPassword.trim()) return toast.error('Por favor, informe sua senha.')
    
    setAuthLoading(true)
    try {
      const res = await loginCustomerAction(authEmail.trim())
      if (!res.success && res.error) {
        throw new Error(res.error)
      }

      if (res.found && res.customer) {
        const customer = res.customer
        if (customer.password && customer.password !== authPassword.trim()) {
          return toast.error('Senha incorreta. Por favor, tente novamente.')
        }

        if (!customer.password) {
          await updateCustomerPasswordAction(customer.id, authPassword.trim())
          customer.password = authPassword.trim()
        }

        localStorage.setItem('store_current_user', JSON.stringify(customer))
        setCurrentUser(customer)
        const updated = {
          ...formData,
          name: customer.name || '',
          email: customer.email || '',
          phone: customer.phone || ''
        }
        setFormData(updated)
        setAuthStep('checkout')
        saveAbandonedCartDraft(updated)
        toast.success(`Bem-vindo de volta, ${customer.name || 'Cliente'}!`)
      } else {
        toast.error('E-mail não encontrado. Por favor, faça seu cadastro abaixo.')
        setAuthMode('register')
      }
    } catch (err: any) {
      console.error('Login error:', err.message || err)
      toast.error(err.message || 'Erro ao buscar conta. Tente novamente.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authName.trim() || !authEmail.trim() || !authPhone.trim() || !authPassword.trim()) {
      return toast.error('Por favor, preencha todos os campos.')
    }

    setAuthLoading(true)
    try {
      const res = await registerCustomerAction({
        name: authName.trim(),
        email: authEmail.trim(),
        phone: authPhone.trim(),
        password: authPassword.trim(),
        storeId: store?.id
      })

      if (!res.success) {
        throw new Error(res.error || 'Erro ao realizar cadastro.')
      }

      const customer = res.customer
      if (res.existing) {
        if (customer.password && customer.password !== authPassword.trim()) {
          return toast.error('Este e-mail já está cadastrado. Por favor, faça login com sua senha.')
        }

        if (!customer.password) {
          await updateCustomerPasswordAction(customer.id, authPassword.trim())
          customer.password = authPassword.trim()
        }

        toast.success('Você já possui cadastro! Entrando na sua conta...')
      } else {
        toast.success('Cadastro realizado com sucesso!')
      }

      localStorage.setItem('store_current_user', JSON.stringify(customer))
      setCurrentUser(customer)
      const updated = {
        ...formData,
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || ''
      }
      setFormData(updated)
      setAuthStep('checkout')
      saveAbandonedCartDraft(updated)
    } catch (err: any) {
      console.error('Register error:', err.message || err)
      toast.error(err.message || 'Erro ao realizar cadastro. Tente novamente.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('store_current_user')
    setCurrentUser(null)
    setAuthStep('auth')
    toast.success('Você saiu da sua conta.')
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.street.trim() || !formData.number.trim() || !formData.city.trim() || !formData.state.trim()) {
      return toast.error('Por favor, preencha todos os campos obrigatórios do endereço e contato.')
    }

    if (paymentMethod === 'card' && (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv)) {
      return toast.error('Por favor, preencha os dados do cartão de crédito.')
    }

    setLoading(true)

    try {
      const fullAddress = `${formData.street}, ${formData.number} ${formData.complement ? `(${formData.complement})` : ''} - ${formData.neighborhood}, ${formData.city}/${formData.state}`
      
      const result = await processCheckoutAction({
        storeId: store?.id,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: fullAddress,
        paymentMethod,
        finalTotal,
        cartItems,
        appliedCouponCode: appliedCoupon ? appliedCoupon.code : null,
        abandonedCartId
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      // Clear Cart & Show Success
      clearCart()
      setCartItems([])
      setSuccessOrder({
        ...result.order,
        address: fullAddress,
        paymentMethod: paymentMethod === 'pix' ? 'Pix' : paymentMethod === 'card' ? 'Cartão de Crédito' : paymentMethod === 'boleto' ? 'Boleto Bancário' : 'WhatsApp'
      })
      toast.success('Pedido realizado com sucesso!')

    } catch (err: any) {
      console.error('Checkout Error:', err)
      toast.error(err.message || 'Erro ao finalizar pedido. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (successOrder) {
    const isWhatsAppMethod = successOrder.paymentMethod === 'WhatsApp'
    const whatsappMsg = encodeURIComponent(
      `Olá! Acabei de realizar o pedido *#${successOrder.order_number || successOrder.id.slice(0,8).toUpperCase()}* na loja ${store?.name}.\n\n` +
      `*Total do Pedido:* R$ ${parseFloat(successOrder.total_amount).toFixed(2).replace('.', ',')}\n` +
      `*Forma de Pagamento:* ${successOrder.paymentMethod}\n` +
      `*Endereço de Entrega:* ${successOrder.address}\n\n` +
      (isWhatsAppMethod ? `Gostaria de combinar o pagamento e o envio do meu pedido!` : `Gostaria de acompanhar o envio!`)
    )

    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
        <StoreHeader store={store} settings={settings} primaryColor={primaryColor} categories={categories} />
        
        <main style={{ flex: 1, maxWidth: '800px', margin: '3rem auto', padding: '0 2rem', width: '100%' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '3rem', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: `${primaryColor}15`, color: primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', boxShadow: `0 10px 25px ${primaryColor}30` }}>
              <CheckCircle2 size={48} />
            </div>

            <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem' }}>Pedido Realizado com Sucesso!</h1>
            <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '2.5rem' }}>Obrigado pela sua compra. Seu pedido foi processado e já está sendo preparado para envio.</p>

            <div style={{ backgroundColor: '#f1f5f9', borderRadius: '16px', padding: '2rem', textAlign: 'left', marginBottom: '2.5rem', display: 'grid', gap: '1.5rem', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Número do Pedido</span>
                <span style={{ fontWeight: 800, color: '#0f172a' }}>#{successOrder.order_number || successOrder.id.slice(0,8).toUpperCase()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Forma de Pagamento</span>
                <span style={{ fontWeight: 800, color: '#0f172a' }}>{successOrder.paymentMethod}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Endereço de Entrega</span>
                <span style={{ fontWeight: 600, color: '#0f172a', textAlign: 'right', maxWidth: '300px' }}>{successOrder.address}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', alignItems: 'center' }}>
                <span style={{ color: '#0f172a', fontWeight: 800, fontSize: '1.2rem' }}>{isWhatsAppMethod ? 'Total a Pagar' : 'Total Pago'}</span>
                <span style={{ fontWeight: 950, color: primaryColor, fontSize: '1.6rem' }}>R$ {parseFloat(successOrder.total_amount).toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            {successOrder.paymentMethod === 'Pix' && (
              <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '16px', padding: '2rem', marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065f46', fontWeight: 800, fontSize: '1.2rem' }}>
                  <QrCode size={24} /> Escaneie o QR Code ou Copie o Código Pix
                </div>
                <div style={{ width: '200px', height: '200px', backgroundColor: '#fff', padding: '1rem', borderRadius: '12px', border: '1px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#10b981', textAlign: 'center' }}>
                  [ QR CODE PIX SIMULADO ]
                </div>
                <button 
                  onClick={() => { navigator.clipboard.writeText('00020126580014br.gov.bcb.pix0136pix@lojavirtual.com.br5204000053039865802BR5913Loja Virtual6009Sao Paulo62070503***63041234'); toast.success('Código Pix copiado!'); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
                >
                  <Copy size={18} /> Copiar Código Pix Copia e Cola
                </button>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
              {settings.whatsapp && (
                <a 
                  href={`https://wa.me/${settings.whatsapp.replace(/\D/g,'')}?text=${whatsappMsg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.2rem 2rem', backgroundColor: '#25D366', color: '#fff', textDecoration: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '1.1rem', boxShadow: '0 10px 20px rgba(37, 211, 102, 0.3)' }}
                >
                  {isWhatsAppMethod ? 'Combinar Pagamento e Entrega via WhatsApp' : 'Acompanhar via WhatsApp'}
                </a>
              )}
              <Link 
                href={homePath} 
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.2rem 2rem', backgroundColor: '#f1f5f9', color: '#0f172a', textDecoration: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '1.1rem', border: '1px solid #cbd5e1' }}
              >
                Voltar para a Loja
              </Link>
            </div>
          </div>
        </main>

        <StoreFooter store={store} settings={settings} primaryColor={primaryColor} />
      </div>
    )
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
          <span style={{ color: '#0f172a', fontWeight: 800 }}>Finalizar Compra</span>
        </div>

        {authStep === 'auth' ? (
          <div style={{ maxWidth: '550px', margin: '2rem auto 5rem', backgroundColor: '#fff', borderRadius: '24px', padding: '3.5rem 3rem', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: `${primaryColor}15`, color: primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <Lock size={32} />
              </div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem' }}>Acesse sua Conta</h1>
              <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>Para prosseguir com a compra, faça login ou cadastre-se rapidamente.</p>
            </div>

            {/* ABAS / TABS */}
            <div style={{ display: 'flex', backgroundColor: '#f1f5f9', borderRadius: '16px', padding: '0.5rem', marginBottom: '2.5rem' }}>
              <button 
                type="button"
                onClick={() => setAuthMode('login')}
                style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: 'none', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s ease', backgroundColor: authMode === 'login' ? '#fff' : 'transparent', color: authMode === 'login' ? primaryColor : '#64748b', boxShadow: authMode === 'login' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none' }}
              >
                Já tenho cadastro
              </button>
              <button 
                type="button"
                onClick={() => { setAuthMode('register'); setAuthEmail(''); }}
                style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: 'none', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s ease', backgroundColor: authMode === 'register' ? '#fff' : 'transparent', color: authMode === 'register' ? primaryColor : '#64748b', boxShadow: authMode === 'register' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none' }}
              >
                Quero me cadastrar
              </button>
            </div>

            {/* FORMULÁRIO DE LOGIN */}
            {authMode === 'login' ? (
              <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>Seu E-mail *</label>
                  <input 
                    type="email" 
                    required 
                    value={authEmail} 
                    onChange={(e) => setAuthEmail(e.target.value)} 
                    placeholder="seunome@email.com" 
                    style={{ width: '100%', padding: '1rem 1.2rem', borderRadius: '14px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', outline: 'none', fontSize: '1rem', fontWeight: 600, color: '#0f172a' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>Sua Senha *</label>
                  <input 
                    type="password" 
                    required 
                    value={authPassword} 
                    onChange={(e) => setAuthPassword(e.target.value)} 
                    placeholder="••••••••" 
                    style={{ width: '100%', padding: '1rem 1.2rem', borderRadius: '14px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', outline: 'none', fontSize: '1rem', fontWeight: 600, color: '#0f172a' }} 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={authLoading}
                  style={{ width: '100%', padding: '1.2rem', backgroundColor: primaryColor, color: '#fff', border: 'none', borderRadius: '14px', fontWeight: 900, fontSize: '1.05rem', cursor: authLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', boxShadow: `0 10px 25px ${primaryColor}40`, transition: 'all 0.2s ease', opacity: authLoading ? 0.7 : 1, marginTop: '0.5rem' }}
                >
                  {authLoading ? <Loader2 className="animate-spin" size={24} /> : <>Entrar na Minha Conta <ArrowRight size={20} /></>}
                </button>
              </form>
            ) : (
              /* FORMULÁRIO DE CADASTRO */
              <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>Nome Completo *</label>
                  <input 
                    type="text" 
                    required 
                    value={authName} 
                    onChange={(e) => setAuthName(e.target.value)} 
                    placeholder="Digite seu nome completo" 
                    style={{ width: '100%', padding: '1rem 1.2rem', borderRadius: '14px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', outline: 'none', fontSize: '1rem', fontWeight: 600, color: '#0f172a' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>E-mail *</label>
                  <input 
                    type="email" 
                    required 
                    value={authEmail} 
                    onChange={(e) => setAuthEmail(e.target.value)} 
                    placeholder="seunome@email.com" 
                    style={{ width: '100%', padding: '1rem 1.2rem', borderRadius: '14px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', outline: 'none', fontSize: '1rem', fontWeight: 600, color: '#0f172a' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>WhatsApp / Telefone *</label>
                  <input 
                    type="tel" 
                    required 
                    value={authPhone} 
                    onChange={(e) => setAuthPhone(e.target.value)} 
                    placeholder="(11) 99999-9999" 
                    style={{ width: '100%', padding: '1rem 1.2rem', borderRadius: '14px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', outline: 'none', fontSize: '1rem', fontWeight: 600, color: '#0f172a' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>Crie uma Senha *</label>
                  <input 
                    type="password" 
                    required 
                    value={authPassword} 
                    onChange={(e) => setAuthPassword(e.target.value)} 
                    placeholder="••••••••" 
                    style={{ width: '100%', padding: '1rem 1.2rem', borderRadius: '14px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', outline: 'none', fontSize: '1rem', fontWeight: 600, color: '#0f172a' }} 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={authLoading}
                  style={{ width: '100%', padding: '1.2rem', backgroundColor: primaryColor, color: '#fff', border: 'none', borderRadius: '14px', fontWeight: 900, fontSize: '1.05rem', cursor: authLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', boxShadow: `0 10px 25px ${primaryColor}40`, transition: 'all 0.2s ease', opacity: authLoading ? 0.7 : 1, marginTop: '0.5rem' }}
                >
                  {authLoading ? <Loader2 className="animate-spin" size={24} /> : <>Criar Conta e Continuar <ArrowRight size={20} /></>}
                </button>
              </form>
            )}
          </div>
        ) : (
          <form onSubmit={handleCheckout} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem', alignItems: 'start' }}>
            {/* COLUNA ESQUERDA: FORMULÁRIO DE CLIENTE E PAGAMENTO */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              {/* 1. DADOS DE CONTATO E ENDEREÇO */}
              <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.5rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: `${primaryColor}15`, color: primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>1</div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Identificação e Entrega</h2>
                </div>

                {currentUser && (
                  <div style={{ backgroundColor: '#f1f5f9', borderRadius: '16px', padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #cbd5e1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: primaryColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem' }}>
                        {currentUser?.name ? currentUser.name[0].toUpperCase() : 'C'}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{currentUser?.name}</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{currentUser?.email}</div>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={handleLogout}
                      style={{ padding: '0.6rem 1.2rem', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '10px', color: '#ef4444', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}
                    >
                      Sair / Trocar de Conta
                    </button>
                  </div>
                )}

                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>Nome Completo *</label>
                      <input type="text" name="name" required value={formData.name} onChange={handleInputChange} onBlur={handleInputBlur} placeholder="Digite seu nome completo" style={{ width: '100%', padding: '0.85rem 1.2rem', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', outline: 'none', fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>E-mail *</label>
                      <input type="email" name="email" required value={formData.email} onChange={handleInputChange} onBlur={handleInputBlur} placeholder="seunome@email.com" style={{ width: '100%', padding: '0.85rem 1.2rem', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', outline: 'none', fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>WhatsApp / Telefone *</label>
                      <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} onBlur={handleInputBlur} placeholder="(11) 99999-9999" style={{ width: '100%', padding: '0.85rem 1.2rem', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', outline: 'none', fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>CEP *</label>
                      <input type="text" name="cep" required value={formData.cep} onChange={handleInputChange} placeholder="00000-000" style={{ width: '100%', padding: '0.85rem 1.2rem', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', outline: 'none', fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>Endereço (Rua, Av) *</label>
                      <input type="text" name="street" required value={formData.street} onChange={handleInputChange} placeholder="Nome da rua" style={{ width: '100%', padding: '0.85rem 1.2rem', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', outline: 'none', fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>Número *</label>
                      <input type="text" name="number" required value={formData.number} onChange={handleInputChange} placeholder="123" style={{ width: '100%', padding: '0.85rem 1.2rem', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', outline: 'none', fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>Complemento</label>
                      <input type="text" name="complement" value={formData.complement} onChange={handleInputChange} placeholder="Apto 42, Bloco B" style={{ width: '100%', padding: '0.85rem 1.2rem', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', outline: 'none', fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>Bairro *</label>
                      <input type="text" name="neighborhood" required value={formData.neighborhood} onChange={handleInputChange} placeholder="Centro" style={{ width: '100%', padding: '0.85rem 1.2rem', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', outline: 'none', fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>Cidade / UF *</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
                        <input type="text" name="city" required value={formData.city} onChange={handleInputChange} placeholder="Cidade" style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', outline: 'none', fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }} />
                        <input type="text" name="state" required value={formData.state} onChange={handleInputChange} placeholder="UF" style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', outline: 'none', fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', textTransform: 'uppercase' }} maxLength={2} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seleção de Frete */}
                {shippingOptions.length > 0 && (
                  <div style={{ marginTop: '2rem', borderTop: '1px solid #f1f5f9', paddingTop: '2rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Truck size={20} color={primaryColor} /> Modalidade de Envio
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                  </div>
                )}
                {calculatingShipping && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
                    <Loader2 className="animate-spin" size={16} /> Calculando opções de frete...
                  </div>
                )}
              </div>

              {/* 2. FORMA DE PAGAMENTO */}
              <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.5rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: `${primaryColor}15`, color: primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>2</div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Forma de Pagamento</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
                  {[
                    { id: 'pix', label: 'Pix', icon: QrCode, highlight: settings.pix_discount_percentage ? `-${settings.pix_discount_percentage}%` : null },
                    { id: 'card', label: 'Cartão', icon: CreditCard },
                    { id: 'boleto', label: 'Boleto', icon: ShieldCheck },
                    { id: 'whatsapp', label: 'WhatsApp', icon: Truck }
                  ].map((method) => {
                    const Icon = method.icon
                    const isSelected = paymentMethod === method.id
                    return (
                      <div 
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id as any)}
                        style={{ 
                          position: 'relative',
                          padding: '1.5rem 1rem', 
                          borderRadius: '16px', 
                          border: isSelected ? `2px solid ${primaryColor}` : '1px solid #cbd5e1', 
                          backgroundColor: isSelected ? `${primaryColor}08` : '#fff', 
                          cursor: 'pointer', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          gap: '0.75rem', 
                          transition: 'all 0.2s ease',
                          boxShadow: isSelected ? `0 10px 20px ${primaryColor}15` : 'none'
                        }}
                      >
                        <Icon size={28} color={isSelected ? primaryColor : '#64748b'} />
                        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: isSelected ? primaryColor : '#334155' }}>{method.label}</span>
                        {method.highlight && (
                          <span style={{ position: 'absolute', top: '-10px', right: '-10px', backgroundColor: '#10b981', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '100px', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)' }}>
                            {method.highlight}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* DETALHES DA FORMA ESCOLHIDA */}
                {paymentMethod === 'pix' && (
                  <div style={{ backgroundColor: '#f8fafc', borderRadius: '16px', padding: '2rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '16px', backgroundColor: '#10b98115', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <QrCode size={32} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>Pagamento Instantâneo via Pix</h4>
                      <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
                        {settings.pix_discount_percentage ? `Ganhe ${settings.pix_discount_percentage}% de desconto extra no Pix! ` : ''}O QR Code e o código Pix Copia e Cola serão gerados na próxima tela.
                      </p>
                    </div>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div style={{ backgroundColor: '#f8fafc', borderRadius: '16px', padding: '2rem', border: '1px solid #e2e8f0', display: 'grid', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 700 }}>
                      <Lock size={16} color="#10b981" /> AMBIENTE SEGURO E CRIPTOGRAFADO
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>Número do Cartão *</label>
                      <input type="text" name="number" required value={cardData.number} onChange={handleCardChange} placeholder="0000 0000 0000 0000" style={{ width: '100%', padding: '0.85rem 1.2rem', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#fff', outline: 'none', fontSize: '0.95rem', fontWeight: 600 }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>Nome Impresso no Cartão *</label>
                      <input type="text" name="name" required value={cardData.name} onChange={handleCardChange} placeholder="NOME DO TITULAR" style={{ width: '100%', padding: '0.85rem 1.2rem', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#fff', outline: 'none', fontSize: '0.95rem', fontWeight: 600, textTransform: 'uppercase' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>Validade (MM/AA) *</label>
                        <input type="text" name="expiry" required value={cardData.expiry} onChange={handleCardChange} placeholder="MM/AA" style={{ width: '100%', padding: '0.85rem 1.2rem', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#fff', outline: 'none', fontSize: '0.95rem', fontWeight: 600 }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>CVV *</label>
                        <input type="text" name="cvv" required value={cardData.cvv} onChange={handleCardChange} placeholder="123" style={{ width: '100%', padding: '0.85rem 1.2rem', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#fff', outline: 'none', fontSize: '0.95rem', fontWeight: 600 }} maxLength={4} />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'boleto' && (
                  <div style={{ backgroundColor: '#f8fafc', borderRadius: '16px', padding: '2rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '16px', backgroundColor: '#6366f115', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <ShieldCheck size={32} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>Boleto Bancário</h4>
                      <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
                        O boleto será gerado na próxima tela. A confirmação do pagamento pode levar até 2 dias úteis.
                      </p>
                    </div>
                  </div>
                )}

                {paymentMethod === 'whatsapp' && (
                  <div style={{ backgroundColor: '#f8fafc', borderRadius: '16px', padding: '2rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '16px', backgroundColor: '#25d36615', color: '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Truck size={32} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>Combinar Entrega via WhatsApp</h4>
                      <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
                        Seu pedido será reservado e você será redirecionado para o WhatsApp da loja para combinar o pagamento e entrega diretamente com o vendedor.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* COLUNA DIREITA: RESUMO DO PEDIDO E CUPOM */}
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

              {/* RESUMO DO PEDIDO */}
              <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '2rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.5rem' }}>Resumo do Pedido</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {cartItems.map((item) => (
                    <div key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.5rem' }}>
                      <div style={{ width: '60px', height: '60px', borderRadius: '12px', backgroundColor: '#f1f5f9', backgroundImage: `url(${item.image})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h4>
                        {item.variations && Object.entries(item.variations).length > 0 && (
                          <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', color: '#64748b' }}>
                            {Object.entries(item.variations).map(([k, v]) => `${k}: ${v}`).join(', ')}
                          </p>
                        )}
                        <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Qtd: {item.quantity}</div>
                      </div>
                      <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                        R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* TOTAIS */}
                <div style={{ display: 'grid', gap: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', marginBottom: '2.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '1rem', fontWeight: 600 }}>
                    <span>Subtotal</span>
                    <span style={{ color: '#0f172a', fontWeight: 700 }}>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontSize: '1rem', fontWeight: 700 }}>
                      <span>Cupom de Desconto</span>
                      <span>- R$ {discountAmount.toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}

                  {pixDiscount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontSize: '1rem', fontWeight: 700 }}>
                      <span>Desconto Pix ({settings.pix_discount_percentage}%)</span>
                      <span>- R$ {pixDiscount.toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '1rem', fontWeight: 600 }}>
                    <span>Frete</span>
                    <span style={{ color: selectedShippingMethod ? (shippingCost === 0 ? '#10b981' : '#0f172a') : '#64748b', fontWeight: 700 }}>
                      {selectedShippingMethod ? (shippingCost === 0 ? 'GRÁTIS' : `R$ ${shippingCost.toFixed(2).replace('.', ',')}`) : 'A calcular'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0f172a', fontSize: '1.25rem', fontWeight: 900, borderTop: '1px dashed #cbd5e1', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                    <span>Total</span>
                    <span style={{ color: primaryColor, fontSize: '1.6rem' }}>R$ {finalTotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  style={{ 
                    width: '100%', 
                    padding: '1.4rem', 
                    backgroundColor: primaryColor, 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '16px', 
                    fontWeight: 900, 
                    fontSize: '1.1rem', 
                    cursor: loading ? 'not-allowed' : 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '0.75rem', 
                    boxShadow: `0 10px 25px ${primaryColor}40`,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    transition: 'all 0.2s ease',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={24} /> Processando Pedido...
                    </>
                  ) : (
                    <>
                      Finalizar Pedido <ArrowRight size={24} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </main>

      <StoreFooter store={store} settings={settings} primaryColor={primaryColor} />

      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
