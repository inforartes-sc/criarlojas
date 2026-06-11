"use client"

import { useState, useEffect } from 'react'
import { ShoppingBag, Mail, Phone, Calendar, Loader2, Search, X, MessageSquare, ChevronLeft, MapPin, Hash, Trash2, Crown, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { getAbsoluteUrl } from '@/lib/getDomainSuffix'
import toast from 'react-hot-toast'

export default function AbandonedCartsPage() {
  const { store } = useAdminAuth()
  const [loading, setLoading] = useState(true)
  const [carts, setCarts] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCart, setSelectedCart] = useState<any>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const isPremium = store?.settings?.plan === 'premium'

  useEffect(() => {
    if (store && isPremium) {
      fetchAbandonedCarts()
    } else {
      setLoading(false)
    }
  }, [store, isPremium])

  const fetchAbandonedCarts = async () => {
    if (!store) return
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('abandoned_carts')
        .select('*')
        .eq('store_id', store.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCarts(data || [])
    } catch (error: any) {
      console.error('Error fetching abandoned carts:', error.message)
      toast.error('Erro ao carregar carrinhos abandonados.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Deseja realmente excluir este registro de carrinho abandonado?')) return

    try {
      setDeletingId(id)
      const { error } = await supabase
        .from('abandoned_carts')
        .delete()
        .eq('id', id)

      if (error) throw error
      setCarts(prev => prev.filter(c => c.id !== id))
      toast.success('Carrinho abandonado removido.')
      if (selectedCart?.id === id) {
        setShowDetails(false)
      }
    } catch (err: any) {
      console.error('Delete error:', err)
      toast.error('Erro ao remover carrinho.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleRecoverClick = (cart: any, e: React.MouseEvent) => {
    e.stopPropagation()
    
    const checkoutUrl = getAbsoluteUrl(store.subdomain, `/checkout?cart=${cart.id}`)
    
    // Get product name for placeholder messaging
    let firstProductName = 'itens adicionados'
    if (cart.items && Array.isArray(cart.items) && cart.items.length > 0) {
      firstProductName = cart.items[0].name
      if (cart.items.length > 1) {
        firstProductName += ` e mais ${cart.items.length - 1} produto(s)`
      }
    }

    const messageText = 
      `Olá, ${cart.customer_name || 'Cliente'}! Tudo bem?\n\n` +
      `Vimos que você deixou alguns itens no seu carrinho na loja *${store.name}* (como o produto _${firstProductName}_).\n\n` +
      `Para sua conveniência, nós salvamos seu carrinho exatamente como você o deixou! Você pode finalizar sua compra com facilidade clicando neste link exclusivo:\n` +
      `${checkoutUrl}\n\n` +
      `Caso tenha qualquer dúvida sobre formas de envio ou pagamento, fique à vontade para me chamar por aqui! 😊`

    const cleanPhone = (cart.customer_phone || '').replace(/\D/g, '')
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`
    
    window.open(whatsappUrl, '_blank')
  }

  const viewDetails = (cart: any) => {
    setSelectedCart(cart)
    setShowDetails(true)
  }

  const filteredCarts = carts.filter((cart: any) => 
    (cart.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (cart.customer_email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cart.customer_phone || '').includes(searchTerm)
  )

  // BORDER/BACKGROUND PRESETS
  const primaryColor = store?.settings?.primary_color || '#6366f1'

  // SE NÃO FOR PREMIUM, MOSTRA UPSELL
  if (!isPremium) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', minHeight: '60vh', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #e0f2fe, #f0fdf4)', color: primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', boxShadow: '0 10px 25px rgba(99, 102, 241, 0.15)' }}>
          <Crown size={42} style={{ color: '#eab308' }} />
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1rem', color: 'var(--foreground)' }}>Recuperação de Carrinhos Abandonados</h1>
        <p style={{ color: 'var(--muted)', fontSize: '1.1rem', maxWidth: '600px', lineHeight: 1.6, marginBottom: '2.5rem' }}>
          Recupere vendas perdidas entrando em contato diretamente com clientes que deixaram produtos no carrinho. Envie mensagens personalizadas com links de checkout prontos com apenas 1 clique no WhatsApp.
        </p>

        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)', borderRadius: '24px', padding: '2.5rem', maxWidth: '600px', width: '100%', display: 'grid', gap: '1.5rem', marginBottom: '3rem', textAlign: 'left' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 800 }}>✓</div>
            <div>
              <h4 style={{ fontWeight: 800, margin: '0 0 0.25rem 0', color: 'var(--foreground)' }}>Link de Checkout Reconstrutivo</h4>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>Seu cliente clica no link recebido e é levado direto para o checkout com os produtos e informações preenchidas.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 800 }}>✓</div>
            <div>
              <h4 style={{ fontWeight: 800, margin: '0 0 0.25rem 0', color: 'var(--foreground)' }}>Sem custos adicionais de envio</h4>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>Os envios são disparados abrindo o seu próprio WhatsApp Web ou App. Zero taxas extras ou cobranças por mensagem.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 800 }}>✓</div>
            <div>
              <h4 style={{ fontWeight: 800, margin: '0 0 0.25rem 0', color: 'var(--foreground)' }}>Aumento real de faturamento</h4>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>Recupere em média de 15% a 30% dos pedidos que seriam perdidos na finalização de compra.</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a href="/admin/subscription" style={{ textDecoration: 'none', padding: '1rem 2.5rem', background: 'linear-gradient(135deg, #10b981, #0ea5e9)', color: 'white', borderRadius: '12px', fontWeight: 800, fontSize: '1.05rem', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} />
            <span>Fazer Upgrade para Premium</span>
          </a>
        </div>
      </div>
    )
  }

  if (loading) return (
    <div style={{ padding: '10rem 5rem', textAlign: 'center' }}>
      <Loader2 className="animate-spin" size={40} style={{ margin: '0 auto', color: primaryColor }} />
      <p style={{ marginTop: '1rem', color: 'var(--muted)', fontSize: '1rem', fontWeight: 600 }}>Buscando carrinhos abandonados...</p>
      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )

  return (
    <div className="abandoned-carts-container" style={{ display: 'grid', gap: '2.5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Carrinhos Abandonados</h1>
          <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>Acompanhe os clientes que deixaram produtos no checkout e recupere suas compras.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input 
              type="text" 
              placeholder="Buscar por nome, email ou telefone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                padding: '0.75rem 1rem 0.75rem 2.5rem', 
                backgroundColor: 'var(--input-bg)', 
                border: '1px solid var(--border)', 
                borderRadius: '12px',
                color: 'var(--foreground)',
                outline: 'none',
                width: '320px',
                fontSize: '0.95rem',
                transition: 'all 0.2s'
              }} 
            />
            {searchTerm && <X size={16} onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--muted)' }} />}
          </div>
        </div>
      </header>

      {/* Tabela de Carrinhos */}
      <div className="glass-card" style={{ overflow: 'hidden', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '750px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '1.25rem', fontWeight: 700, color: 'var(--foreground)', fontSize: '0.9rem' }}>Cliente</th>
                <th style={{ padding: '1.25rem', fontWeight: 700, color: 'var(--foreground)', fontSize: '0.9rem' }}>Contato</th>
                <th style={{ padding: '1.25rem', fontWeight: 700, color: 'var(--foreground)', fontSize: '0.9rem' }}>Produtos Adicionados</th>
                <th style={{ padding: '1.25rem', fontWeight: 700, color: 'var(--foreground)', fontSize: '0.9rem' }}>Faturamento Perdido</th>
                <th style={{ padding: '1.25rem', fontWeight: 700, color: 'var(--foreground)', fontSize: '0.9rem' }}>Status</th>
                <th style={{ padding: '1.25rem', fontWeight: 700, color: 'var(--foreground)', fontSize: '0.9rem', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredCarts.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '6rem', textAlign: 'center', color: 'var(--muted)' }}>
                    <ShoppingBag size={48} style={{ marginBottom: '1.5rem', opacity: 0.1, margin: '0 auto' }} />
                    <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Nenhum carrinho abandonado listado.</p>
                  </td>
                </tr>
              ) : (
                filteredCarts.map((cart: any) => {
                  // Render summary of products
                  const itemsCount = cart.items?.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0) || 0
                  let itemsSummary = 'Vazio'
                  if (cart.items && cart.items.length > 0) {
                    itemsSummary = cart.items[0].name
                    if (cart.items.length > 1) {
                      itemsSummary += ` (+ ${cart.items.length - 1} item/itens)`
                    }
                  }

                  return (
                    <tr 
                      key={cart.id} 
                      onClick={() => viewDetails(cart)}
                      style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: '0.2s' }} 
                      className="table-row-hover"
                    >
                      <td style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ 
                            width: '40px', 
                            height: '40px', 
                            borderRadius: '12px', 
                            backgroundColor: cart.recovered ? 'rgba(16, 185, 129, 0.1)' : `${primaryColor}15`, 
                            color: cart.recovered ? '#10b981' : primaryColor,
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            fontSize: '1rem', 
                            fontWeight: 800,
                            flexShrink: 0
                          }}>
                            {(cart.customer_name || 'C').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span style={{ fontWeight: 700, color: 'var(--foreground)', display: 'block' }}>
                              {cart.customer_name || 'Cliente Sem Identificação'}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                              <Calendar size={12} />
                              {new Date(cart.created_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.85rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--foreground)', fontWeight: 500 }}>
                            <Phone size={14} style={{ color: 'var(--muted)' }} />
                            {cart.customer_phone || 'Não informado'}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--muted)' }}>
                            <Mail size={14} />
                            {cart.customer_email || 'Não informado'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '1.25rem', color: 'var(--foreground)', fontSize: '0.9rem', fontWeight: 600 }}>
                        <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={itemsSummary}>
                          {itemsSummary}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block', marginTop: '0.15rem' }}>
                          Total de {itemsCount} unidade(s)
                        </span>
                      </td>
                      <td style={{ padding: '1.25rem', color: 'var(--foreground)', fontSize: '1.1rem', fontWeight: 900 }}>
                        R$ {parseFloat(cart.total_amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '1.25rem' }}>
                        <span style={{ 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '20px', 
                          fontSize: '0.75rem', 
                          fontWeight: 700,
                          backgroundColor: cart.recovered ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: cart.recovered ? '#10b981' : '#f59e0b',
                          border: cart.recovered ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(245, 158, 11, 0.2)'
                        }}>
                          {cart.recovered ? 'Recuperado' : 'Pendente'}
                        </span>
                      </td>
                      <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={(e) => handleRecoverClick(cart, e)} 
                            disabled={!cart.customer_phone}
                            style={{ 
                              background: cart.customer_phone ? '#25D366' : 'rgba(0,0,0,0.05)', 
                              border: 'none', 
                              color: cart.customer_phone ? 'white' : 'var(--muted)', 
                              padding: '0.55rem 1rem', 
                              borderRadius: '8px', 
                              cursor: cart.customer_phone ? 'pointer' : 'not-allowed', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '0.4rem', 
                              fontWeight: 700, 
                              fontSize: '0.8rem',
                              boxShadow: cart.customer_phone ? '0 4px 12px rgba(37, 211, 102, 0.2)' : 'none'
                            }} 
                            title={cart.customer_phone ? "Enviar mensagem de recuperação no WhatsApp" : "Telefone do cliente não cadastrado"}
                          >
                            <MessageSquare size={16} />
                            <span>Recuperar</span>
                          </button>
                          <button 
                            onClick={(e) => handleDelete(cart.id, e)} 
                            disabled={deletingId === cart.id}
                            style={{ 
                              background: 'transparent', 
                              border: '1px solid var(--border)', 
                              color: '#ef4444', 
                              padding: '0.55rem', 
                              borderRadius: '8px', 
                              cursor: 'pointer', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center'
                            }} 
                            title="Excluir Registro"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalhes do Carrinho */}
      {showDetails && selectedCart && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
          <div className="glass-card" style={{ maxWidth: '650px', width: '100%', padding: '2.5rem', position: 'relative', borderRadius: '16px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border)' }}>
            <button 
              onClick={() => setShowDetails(false)} 
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--muted)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                backgroundColor: selectedCart.recovered ? 'rgba(16, 185, 129, 0.1)' : `${primaryColor}15`, 
                color: selectedCart.recovered ? '#10b981' : primaryColor,
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '1.25rem', 
                fontWeight: 800
              }}>
                {(selectedCart.customer_name || 'C').charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--foreground)' }}>
                  {selectedCart.customer_name || 'Cliente não identificado'}
                </h3>
                <span style={{ 
                  display: 'inline-block', 
                  padding: '2px 8px', 
                  borderRadius: '100px', 
                  backgroundColor: selectedCart.recovered ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                  color: selectedCart.recovered ? '#10b981' : '#f59e0b', 
                  fontSize: '0.75rem', 
                  fontWeight: 700, 
                  marginTop: '0.25rem' 
                }}>
                  {selectedCart.recovered ? 'Carrinho Recuperado' : 'Carrinho Abandonado'}
                </span>
              </div>
            </div>

            {/* Informações Básicas */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>E-mail</span>
                <span style={{ fontWeight: 600, color: 'var(--foreground)', fontSize: '0.9rem', wordBreak: 'break-all' }}>{selectedCart.customer_email || 'Não informado'}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Telefone / WhatsApp</span>
                <span style={{ fontWeight: 600, color: 'var(--foreground)', fontSize: '0.9rem' }}>{selectedCart.customer_phone || 'Não informado'}</span>
              </div>
            </div>

            {/* Produtos no Carrinho */}
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--foreground)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingBag size={18} style={{ color: primaryColor }} />
              <span>Itens no Carrinho</span>
            </h4>

            <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '2.5rem' }}>
              {selectedCart.items && selectedCart.items.length > 0 ? (
                selectedCart.items.map((item: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px solid var(--border)', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', minWidth: 0 }}>
                      <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                        {item.image && <img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: 'var(--foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                          {item.quantity}x R$ {parseFloat(item.price).toFixed(2).replace('.', ',')}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, color: 'var(--foreground)' }}>
                      R$ {(item.quantity * item.price).toFixed(2).replace('.', ',')}
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--muted)', textAlign: 'center' }}>Sem itens registrados.</p>
              )}
            </div>

            {/* Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                <Calendar size={14} />
                <span>Registrado em {new Date(selectedCart.created_at).toLocaleString()}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>Total do Faturamento Perdido</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 900, color: primaryColor }}>
                  R$ {parseFloat(selectedCart.total_amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Ações */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowDetails(false)} 
                style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', fontWeight: 600, cursor: 'pointer' }}
              >
                Fechar
              </button>
              {selectedCart.customer_phone && (
                <button 
                  onClick={(e) => handleRecoverClick(selectedCart, e)} 
                  style={{ 
                    padding: '0.75rem 2rem', 
                    background: '#25D366', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '10px', 
                    fontWeight: 800, 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)' 
                  }}
                >
                  <MessageSquare size={18} />
                  <span>Disparar Mensagem WhatsApp</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .table-row-hover:hover {
          background-color: rgba(255, 255, 255, 0.01) !important;
        }
      `}</style>
    </div>
  )
}
