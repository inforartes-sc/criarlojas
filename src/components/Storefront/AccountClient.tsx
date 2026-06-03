"use client"

import { useState, useEffect } from 'react'
import { User, Lock, Mail, Phone, MapPin, ShoppingBag, Calendar, CreditCard, Package, Loader2, LogOut, CheckCircle2, ArrowRight, ShieldCheck, Eye } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { loginCustomerAction, updateCustomerPasswordAction, updateCustomerProfileAction, registerCustomerAction } from '@/app/actions/auth'
import StoreHeader from './StoreHeader'
import StoreFooter from './StoreFooter'

interface AccountClientProps {
  store: any
  categories: any[]
}

export default function AccountClient({ store, categories }: AccountClientProps) {
  const settings = store?.settings || {}
  const primaryColor = settings.primary_color || '#6366f1'

  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loadingInit, setLoadingInit] = useState(true)
  const [homePath, setHomePath] = useState('/')

  // Auth Screen States
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authName, setAuthName] = useState('')
  const [authPhone, setAuthPhone] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  // Dashboard States
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'security'>('orders')
  const [orders, setOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)

  // Profile Form States
  const [profileData, setProfileData] = useState({
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
  const [updatingProfile, setUpdatingProfile] = useState(false)

  // Security Form States
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [updatingPassword, setUpdatingPassword] = useState(false)

  useEffect(() => {
    const savedUser = localStorage.getItem('store_current_user')
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser)
        setCurrentUser(parsed)
        setProfileData({
          name: parsed.name || '',
          email: parsed.email || '',
          phone: parsed.phone || '',
          cep: parsed.cep || '',
          street: parsed.street || '',
          number: parsed.number || '',
          complement: parsed.complement || '',
          neighborhood: parsed.neighborhood || '',
          city: parsed.city || '',
          state: parsed.state || ''
        })
        fetchOrders(parsed.id, parsed.email)
      } catch (e) {
        console.error('Erro ao ler usuario do localStorage', e)
      }
    }
    setLoadingInit(false)

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

  const fetchOrders = async (customerId: string, customerEmail: string) => {
    setLoadingOrders(true)
    try {
      // Busca pedidos pelo customer_id ou pelo email como fallback de segurança
      const { data, error } = await supabase
        .from('orders')
        .select('*, customers(name, email, phone)')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Para cada pedido, buscar itens
      const ordersWithItems = await Promise.all((data || []).map(async (o: any) => {
        const { data: items } = await supabase
          .from('order_items')
          .select('*, products(name, images)')
          .eq('order_id', o.id)
        return { ...o, items: items || [] }
      }))

      setOrders(ordersWithItems)
    } catch (err: any) {
      console.error('Erro ao buscar pedidos:', err)
    } finally {
      setLoadingOrders(false)
    }
  }

  const getStatusColor = (status: string) => {
    if (!status) return '#94a3b8'
    const s = status.toLowerCase()
    if (s.startsWith('pago')) return '#22c55e'
    if (s.startsWith('pendente')) return '#f59e0b'
    if (s.startsWith('enviado')) return '#6366f1'
    if (s.startsWith('entregue')) return '#10b981'
    if (s.startsWith('cancelado')) return '#ef4444'
    return '#94a3b8'
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
        setProfileData({
          name: customer.name || '',
          email: customer.email || '',
          phone: customer.phone || '',
          cep: customer.cep || '',
          street: customer.street || '',
          number: customer.number || '',
          complement: customer.complement || '',
          neighborhood: customer.neighborhood || '',
          city: customer.city || '',
          state: customer.state || ''
        })
        fetchOrders(customer.id, customer.email)
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
      return toast.error('Por favor, preencha todos os campos obrigatórios.')
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
      setProfileData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        cep: customer.cep || '',
        street: customer.street || '',
        number: customer.number || '',
        complement: customer.complement || '',
        neighborhood: customer.neighborhood || '',
        city: customer.city || '',
        state: customer.state || ''
      })
      fetchOrders(customer.id, customer.email)
    } catch (err: any) {
      console.error('Register error:', err.message || err)
      toast.error(err.message || 'Erro ao realizar cadastro. Tente novamente.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profileData.name.trim() || !profileData.phone.trim()) {
      return toast.error('Nome e Telefone são obrigatórios.')
    }

    setUpdatingProfile(true)
    try {
      const res = await updateCustomerProfileAction({
        customerId: currentUser.id,
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        cep: profileData.cep,
        street: profileData.street,
        number: profileData.number,
        complement: profileData.complement,
        neighborhood: profileData.neighborhood,
        city: profileData.city,
        state: profileData.state
      })

      if (!res.success) {
        throw new Error(res.error || 'Erro ao atualizar perfil.')
      }

      const updated = res.customer
      localStorage.setItem('store_current_user', JSON.stringify(updated))
      setCurrentUser(updated)
      toast.success('Dados atualizados com sucesso!')
    } catch (err: any) {
      console.error('Update profile error:', err)
      toast.error(err.message || 'Erro ao atualizar dados.')
    } finally {
      setUpdatingProfile(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword.trim() || !confirmPassword.trim()) {
      return toast.error('Preencha as senhas.')
    }
    if (newPassword !== confirmPassword) {
      return toast.error('As senhas não coincidem.')
    }

    setUpdatingPassword(true)
    try {
      const res = await updateCustomerPasswordAction(currentUser.id, newPassword.trim())
      if (!res.success) {
        throw new Error(res.error || 'Erro ao atualizar senha.')
      }

      const updated = { ...currentUser, password: newPassword.trim() }
      localStorage.setItem('store_current_user', JSON.stringify(updated))
      setCurrentUser(updated)
      setNewPassword('')
      setConfirmPassword('')
      toast.success('Senha alterada com sucesso!')
    } catch (err: any) {
      console.error('Update password error:', err)
      toast.error(err.message || 'Erro ao alterar senha.')
    } finally {
      setUpdatingPassword(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('store_current_user')
    setCurrentUser(null)
    toast.success('Você saiu da sua conta.')
  }

  if (loadingInit) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <StoreHeader store={store} settings={settings} primaryColor={primaryColor} categories={categories} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 size={32} className="animate-spin" color={primaryColor} />
        </div>
        <StoreFooter store={store} settings={settings} primaryColor={primaryColor} />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      <StoreHeader store={store} settings={settings} primaryColor={primaryColor} categories={categories} />

      <main style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '3rem 2rem' }}>
        {!currentUser ? (
          /* TELA DE LOGIN / CADASTRO */
          <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: 'white', padding: '2.5rem', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: `${primaryColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <User size={32} color={primaryColor} />
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>Minha Conta</h2>
              <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
                {authMode === 'login' ? 'Faça login para gerenciar seus pedidos e perfil' : 'Crie sua conta para acompanhar seus pedidos'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#f1f5f9', padding: '0.35rem', borderRadius: '16px', marginBottom: '2rem' }}>
              <button 
                onClick={() => setAuthMode('login')}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: 'none', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', transition: '0.2s', backgroundColor: authMode === 'login' ? 'white' : 'transparent', color: authMode === 'login' ? '#0f172a' : '#64748b', boxShadow: authMode === 'login' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none' }}
              >
                Entrar
              </button>
              <button 
                onClick={() => setAuthMode('register')}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: 'none', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', transition: '0.2s', backgroundColor: authMode === 'register' ? 'white' : 'transparent', color: authMode === 'register' ? '#0f172a' : '#64748b', boxShadow: authMode === 'register' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none' }}
              >
                Cadastrar
              </button>
            </div>

            {authMode === 'login' ? (
              <form onSubmit={handleLoginSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>E-mail</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                      type="email" 
                      placeholder="seu.email@exemplo.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.75rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Senha</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.75rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem' }}
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={authLoading}
                  style={{ width: '100%', padding: '1rem', backgroundColor: primaryColor, color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem', boxShadow: `0 4px 15px ${primaryColor}40` }}
                >
                  {authLoading ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
                  Entrar na Minha Conta
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Nome Completo</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                      type="text" 
                      placeholder="Digite seu nome completo"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.75rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>E-mail</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                      type="email" 
                      placeholder="seu.email@exemplo.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.75rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Telefone / WhatsApp</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                      type="text" 
                      placeholder="(11) 98888-7777"
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.75rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Crie uma Senha</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.75rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem' }}
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={authLoading}
                  style={{ width: '100%', padding: '1rem', backgroundColor: primaryColor, color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem', boxShadow: `0 4px 15px ${primaryColor}40` }}
                >
                  {authLoading ? <Loader2 size={20} className="animate-spin" /> : <ShieldCheck size={20} />}
                  Criar Minha Conta
                </button>
              </form>
            )}
          </div>
        ) : (
          /* PAINEL DO USUÁRIO LOGADO */
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2.5rem', alignItems: 'start' }}>
            {/* SIDEBAR DE NAVEGAÇÃO */}
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: `${primaryColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <User size={36} color={primaryColor} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>{currentUser.name}</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>{currentUser.email}</p>
              </div>

              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <button 
                  onClick={() => setActiveTab('orders')}
                  style={{ width: '100%', padding: '1rem 1.25rem', borderRadius: '14px', border: 'none', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', transition: '0.2s', backgroundColor: activeTab === 'orders' ? `${primaryColor}15` : 'transparent', color: activeTab === 'orders' ? primaryColor : '#475569', textAlign: 'left' }}
                >
                  <ShoppingBag size={20} />
                  Meus Pedidos
                </button>

                <button 
                  onClick={() => setActiveTab('profile')}
                  style={{ width: '100%', padding: '1rem 1.25rem', borderRadius: '14px', border: 'none', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', transition: '0.2s', backgroundColor: activeTab === 'profile' ? `${primaryColor}15` : 'transparent', color: activeTab === 'profile' ? primaryColor : '#475569', textAlign: 'left' }}
                >
                  <MapPin size={20} />
                  Meus Dados & Endereço
                </button>

                <button 
                  onClick={() => setActiveTab('security')}
                  style={{ width: '100%', padding: '1rem 1.25rem', borderRadius: '14px', border: 'none', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', transition: '0.2s', backgroundColor: activeTab === 'security' ? `${primaryColor}15` : 'transparent', color: activeTab === 'security' ? primaryColor : '#475569', textAlign: 'left' }}
                >
                  <Lock size={20} />
                  Alterar Senha
                </button>

                <div style={{ margin: '1rem 0', height: '1px', backgroundColor: '#f1f5f9' }} />

                <button 
                  onClick={handleLogout}
                  style={{ width: '100%', padding: '1rem 1.25rem', borderRadius: '14px', border: 'none', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', transition: '0.2s', backgroundColor: '#fee2e2', color: '#ef4444', textAlign: 'left' }}
                >
                  <LogOut size={20} />
                  Sair da Conta
                </button>
              </div>
            </div>

            {/* CONTEÚDO DA ABA ATIVA */}
            <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
              {activeTab === 'orders' && (
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShoppingBag size={24} color={primaryColor} />
                    Meus Pedidos
                  </h2>

                  {loadingOrders ? (
                    <div style={{ padding: '4rem', textAlign: 'center' }}><Loader2 size={32} className="animate-spin" color={primaryColor} style={{ margin: '0 auto' }} /></div>
                  ) : orders.length === 0 ? (
                    <div style={{ padding: '4rem 2rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                      <Package size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', margin: '0 0 0.5rem 0' }}>Nenhum pedido encontrado</h3>
                      <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0 0 1.5rem 0' }}>Você ainda não realizou nenhuma compra em nossa loja.</p>
                      <Link href={homePath} style={{ display: 'inline-block', padding: '0.85rem 1.75rem', backgroundColor: primaryColor, color: 'white', fontWeight: 700, borderRadius: '12px', textDecoration: 'none' }}>Explorar Produtos</Link>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                      {orders.map((order) => {
                        const isExpanded = expandedOrderId === order.id
                        const statusColor = getStatusColor(order.status)
                        const statusLabel = order.status ? order.status.split('|')[0].trim() : 'Pendente'

                        return (
                          <div key={order.id} style={{ border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#fff', transition: '0.2s', boxShadow: isExpanded ? '0 10px 25px rgba(0,0,0,0.05)' : 'none' }}>
                            <div 
                              onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                              style={{ padding: '1.5rem', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                            >
                              <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                <div>
                                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Pedido</span>
                                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>#{order.order_number || order.id.slice(0, 8).toUpperCase()}</span>
                                </div>
                                <div>
                                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Data</span>
                                  <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <Calendar size={14} /> {new Date(order.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                                <div>
                                  <span style={{ fontSize: '0.75-rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Total</span>
                                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: primaryColor }}>R$ {order.total_amount?.toFixed(2).replace('.', ',')}</span>
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <span style={{ padding: '6px 14px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800, backgroundColor: `${statusColor}15`, color: statusColor, textTransform: 'uppercase', border: `1px solid ${statusColor}30` }}>
                                  {statusLabel}
                                </span>
                                <button style={{ background: 'white', border: '1px solid #cbd5e1', padding: '0.5rem', borderRadius: '10px', color: '#475569', display: 'flex' }}>
                                  <Eye size={18} />
                                </button>
                              </div>
                            </div>

                            {isExpanded && (
                              <div style={{ padding: '1.5rem', borderTop: '1px solid #e2e8f0', display: 'grid', gap: '1.5rem' }}>
                                {order.status && order.status.includes('|') && (
                                  <div style={{ backgroundColor: '#f1f5f9', padding: '1rem 1.25rem', borderRadius: '12px', fontSize: '0.9rem', color: '#334155' }}>
                                    <span style={{ fontWeight: 800, color: '#0f172a', display: 'block', marginBottom: '0.25rem' }}>Detalhes do Status / Rastreio:</span>
                                    {order.status}
                                  </div>
                                )}

                                <div>
                                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Itens do Pedido</h4>
                                  <div style={{ display: 'grid', gap: '1rem' }}>
                                    {(order.items || []).map((item: any, idx: number) => (
                                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                          <div style={{ width: '50px', height: '50px', borderRadius: '8px', backgroundColor: '#e2e8f0', backgroundImage: `url(${item.products?.images?.[0] || ''})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                                          <div>
                                            <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>{item.products?.name || item.product_name || 'Produto'}</h5>
                                            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Qtd: {item.quantity} x R$ {item.unit_price?.toFixed(2).replace('.', ',')}</span>
                                          </div>
                                        </div>
                                        <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>R$ {(item.quantity * item.unit_price)?.toFixed(2).replace('.', ',')}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'profile' && (
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={24} color={primaryColor} />
                    Meus Dados & Endereço
                  </h2>

                  <form onSubmit={handleUpdateProfile} style={{ display: 'grid', gap: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Nome Completo *</label>
                        <input 
                          type="text" 
                          value={profileData.name} 
                          onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                          style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem' }} 
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>E-mail (Login) *</label>
                        <input 
                          type="email" 
                          value={profileData.email} 
                          disabled
                          style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', color: '#94a3b8', outline: 'none', fontSize: '0.95rem' }} 
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Telefone / WhatsApp *</label>
                        <input 
                          type="text" 
                          value={profileData.phone} 
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem' }} 
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>CEP</label>
                        <input 
                          type="text" 
                          value={profileData.cep} 
                          onChange={(e) => setProfileData({...profileData, cep: e.target.value})}
                          placeholder="00000-000"
                          style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem' }} 
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Endereço (Rua/Av)</label>
                        <input 
                          type="text" 
                          value={profileData.street} 
                          onChange={(e) => setProfileData({...profileData, street: e.target.value})}
                          placeholder="Rua das Flores"
                          style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem' }} 
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Número</label>
                        <input 
                          type="text" 
                          value={profileData.number} 
                          onChange={(e) => setProfileData({...profileData, number: e.target.value})}
                          placeholder="123"
                          style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem' }} 
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Complemento</label>
                        <input 
                          type="text" 
                          value={profileData.complement} 
                          onChange={(e) => setProfileData({...profileData, complement: e.target.value})}
                          placeholder="Apto 42, Bloco B"
                          style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem' }} 
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Bairro</label>
                        <input 
                          type="text" 
                          value={profileData.neighborhood} 
                          onChange={(e) => setProfileData({...profileData, neighborhood: e.target.value})}
                          placeholder="Centro"
                          style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem' }} 
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Cidade / UF</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
                          <input 
                            type="text" 
                            value={profileData.city} 
                            onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                            placeholder="São Paulo"
                            style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem' }} 
                          />
                          <input 
                            type="text" 
                            value={profileData.state} 
                            onChange={(e) => setProfileData({...profileData, state: e.target.value})}
                            placeholder="SP"
                            maxLength={2}
                            style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem', textTransform: 'uppercase' }} 
                          />
                        </div>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={updatingProfile}
                      style={{ padding: '1rem 2rem', backgroundColor: primaryColor, color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: 'fit-content', marginTop: '1rem', boxShadow: `0 4px 15px ${primaryColor}40` }}
                    >
                      {updatingProfile ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
                      Salvar Alterações
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Lock size={24} color={primaryColor} />
                    Alterar Senha
                  </h2>

                  <form onSubmit={handleUpdatePassword} style={{ display: 'grid', gap: '1.5rem', maxWidth: '400px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Nova Senha</label>
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem' }} 
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Confirmar Nova Senha</label>
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem' }} 
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={updatingPassword}
                      style={{ padding: '1rem 2rem', backgroundColor: primaryColor, color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: 'fit-content', marginTop: '0.5rem', boxShadow: `0 4px 15px ${primaryColor}40` }}
                    >
                      {updatingPassword ? <Loader2 size={20} className="animate-spin" /> : <ShieldCheck size={20} />}
                      Atualizar Senha
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <StoreFooter store={store} settings={settings} primaryColor={primaryColor} />
    </div>
  )
}
