"use client"

import { useState, useEffect } from 'react'
import { Users, Mail, Phone, Calendar, Loader2, Search, Download, X, History, ShoppingBag, ArrowRight, Package, CreditCard, ChevronLeft, User, FileText, MapPin, Hash } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAdminAuth } from '@/context/AdminAuthContext'

export default function CustomersPage() {
  const { store } = useAdminAuth()
  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  
  // Modais
  const [showHistory, setShowHistory] = useState(false)
  const [showRegistration, setShowRegistration] = useState(false)
  
  // Dados do Histórico
  const [historyLoading, setHistoryLoading] = useState(false)
  const [customerOrders, setCustomerOrders] = useState<any[]>([])
  
  // Detalhes do Pedido dentro do Histórico
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState(false)

  useEffect(() => {
    if (store) {
      fetchCustomers()
    }
  }, [store])

  const fetchCustomers = async () => {
    if (!store) return
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('store_id', store.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase Error:', error)
        throw error
      }
      setCustomers(data || [])
    } catch (error: any) {
      console.error('Fetch Customers Error:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const viewHistory = async (customer: any) => {
    setSelectedCustomer(customer)
    setShowHistory(true)
    setShowRegistration(false)
    setHistoryLoading(true)
    setShowOrderDetails(false)
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', customer.id)
        .eq('store_id', store.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCustomerOrders(data || [])
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setHistoryLoading(false)
    }
  }

  const viewRegistration = (customer: any) => {
    setSelectedCustomer(customer)
    setShowRegistration(true)
    setShowHistory(false)
  }

  const viewOrderDetails = async (order: any) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)
    setDetailsLoading(true)
    
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*, products(name, images)')
        .eq('order_id', order.id)

      if (error) throw error
      setSelectedOrder({ ...order, items: data || [] })
    } catch (error) {
      console.error('Error fetching order items:', error)
    } finally {
      setDetailsLoading(false)
    }
  }

  const handleExport = () => {
    if (customers.length === 0) return alert('Nenhum cliente para exportar.')
    
    const headers = ['Nome', 'Email', 'Telefone', 'Data de Cadastro']
    const csvContent = [
      headers.join(','),
      ...customers.map(c => [
        c.name,
        c.email,
        c.phone || '',
        new Date(c.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `clientes_loja_${new Date().toLocaleDateString()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return '#22c55e'
      case 'pendente': return '#f59e0b'
      case 'enviado': return '#6366f1'
      case 'cancelado': return '#ef4444'
      default: return '#94a3b8'
    }
  }

  const filteredCustomers = customers.filter((customer: any) => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div style={{ padding: '5rem', textAlign: 'center' }}><Loader2 className="animate-spin" /></div>

  return (
    <div className="customers-page-container">
      <header className="customers-header" style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Clientes</h1>
          <p style={{ color: 'var(--muted)' }}>Gerencie sua base de clientes e contatos.</p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="search-wrapper" style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
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
          <button onClick={handleExport} className="btn-secondary export-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', height: '46px' }}>
            <Download size={18} />
            <span>Exportar CSV</span>
          </button>
        </div>
      </header>

      <div className="glass-card table-card" style={{ overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '650px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: '#f8fafc' }}>
                <th style={{ padding: '1.25rem', fontWeight: 700, color: 'var(--foreground)', fontSize: '0.9rem' }}>Nome Completo</th>
                <th style={{ padding: '1.25rem', fontWeight: 700, color: 'var(--foreground)', fontSize: '0.9rem' }}>E-mail</th>
                <th style={{ padding: '1.25rem', fontWeight: 700, color: 'var(--foreground)', fontSize: '0.9rem' }}>Telefone</th>
                <th style={{ padding: '1.25rem', fontWeight: 700, color: 'var(--foreground)', fontSize: '0.9rem' }}>Desde</th>
                <th style={{ padding: '1.25rem', fontWeight: 700, color: 'var(--foreground)', fontSize: '0.9rem', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '6rem', textAlign: 'center', color: 'var(--muted)' }}>
                    <Users size={48} style={{ marginBottom: '1.5rem', opacity: 0.2, margin: '0 auto' }} />
                    <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>Nenhum cliente encontrado.</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer: any) => (
                  <tr key={customer.id} style={{ borderBottom: '1px solid var(--border)', transition: '0.2s' }} className="table-row">
                    <td style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '12px', 
                          backgroundColor: 'var(--primary)', 
                          color: 'white',
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontSize: '1rem', 
                          fontWeight: 800,
                          boxShadow: '0 4px 10px rgba(99, 102, 241, 0.2)',
                          flexShrink: 0
                        }}>
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 700, color: 'var(--foreground)', whiteSpace: 'nowrap' }}>{customer.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem', color: 'var(--muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                        <Mail size={16} />
                        {customer.email}
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem', color: 'var(--muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                        <Phone size={16} />
                        {customer.phone || 'Não informado'}
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem', color: 'var(--muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                        <Calendar size={16} />
                        {new Date(customer.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => viewRegistration(customer)} style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--primary)', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap' }} title="Ver Cadastro">
                          <User size={16} />
                          <span className="action-btn-text">Cadastro</span>
                        </button>
                        <button onClick={() => viewHistory(customer)} style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--muted)', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap' }} title="Ver Histórico">
                          <History size={16} />
                          <span className="action-btn-text">Histórico</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Cadastro Completo */}
      {showRegistration && selectedCustomer && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-card modal-content" style={{ maxWidth: '600px', width: '100%', padding: '2rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setShowRegistration(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.05)', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}><X size={20} /></button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem', marginTop: '0.5rem' }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '20px', 
                backgroundColor: 'var(--primary)', 
                color: 'white',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '1.75rem', 
                fontWeight: 800,
                boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)',
                flexShrink: 0
              }}>
                {selectedCustomer.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedCustomer.name}</h2>
                <span style={{ padding: '4px 12px', borderRadius: '100px', backgroundColor: '#f1f5f9', color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Cliente Ativo</span>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '1.25rem' }}>
              <div className="modal-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                    <Mail size={14} /> E-mail
                  </div>
                  <div style={{ fontWeight: 700, wordBreak: 'break-all', fontSize: '0.9rem' }}>{selectedCustomer.email}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                    <Phone size={14} /> Telefone
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{selectedCustomer.phone || 'Não informado'}</div>
                </div>
              </div>

              <div className="modal-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                    <Calendar size={14} /> Cliente desde
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{new Date(selectedCustomer.created_at).toLocaleDateString()}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                    <Hash size={14} /> ID do Sistema
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>#{selectedCustomer.id.slice(0, 8).toUpperCase()}</div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  <MapPin size={14} /> Localização Principal
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: selectedCustomer.address || (customerOrders && customerOrders.find((o: any) => o.status.includes('| Endereço:'))) ? 'var(--foreground)' : 'var(--muted)', fontStyle: selectedCustomer.address || (customerOrders && customerOrders.find((o: any) => o.status.includes('| Endereço:'))) ? 'normal' : 'italic' }}>
                  {selectedCustomer.address || (customerOrders && customerOrders.find((o: any) => o.status.includes('| Endereço:')) ? customerOrders.find((o: any) => o.status.includes('| Endereço:')).status.split('| Endereço:')[1].trim() : 'Endereço não cadastrado neste perfil.')}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }} className="modal-actions">
              <button onClick={() => viewHistory(selectedCustomer)} style={{ flex: 1, minWidth: '140px', padding: '0.85rem', borderRadius: '12px', border: 'none', backgroundColor: 'var(--primary)', color: 'white', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <ShoppingBag size={18} />
                Ver Pedidos
              </button>
              <button onClick={() => setShowRegistration(false)} style={{ padding: '0.85rem 1.5rem', borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'white', color: 'var(--foreground)', fontWeight: 700, cursor: 'pointer', flex: '1 0 auto' }}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Histórico */}
      {showHistory && selectedCustomer && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-card modal-content" style={{ maxWidth: '800px', width: '100%', padding: '2rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setShowHistory(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.05)', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}><X size={20} /></button>
            
            {!showOrderDetails ? (
              <>
                <div style={{ marginBottom: '2rem', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700 }}>Histórico do Cliente</span>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{selectedCustomer.name}</h2>
                  <p style={{ color: 'var(--muted)', margin: 0 }}>{selectedCustomer.email}</p>
                </div>

                <div style={{ display: 'grid', gap: '1.25rem' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}><ShoppingBag size={18}/> Pedidos Realizados</h4>
                  
                  {historyLoading ? (
                    <div style={{ padding: '3rem', textAlign: 'center' }}><Loader2 className="animate-spin" /></div>
                  ) : customerOrders.length > 0 ? (
                    customerOrders.map((order: any) => (
                      <div key={order.id} className="history-order-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid var(--border)', gap: '1rem' }}>
                        <div>
                          <div style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>#{order.order_number || order.id.slice(0, 8).toUpperCase()}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Calendar size={14} />
                            {new Date(order.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ 
                            padding: '4px 10px', 
                            borderRadius: '6px', 
                            fontSize: '0.7rem', 
                            fontWeight: 800, 
                            backgroundColor: `${getStatusColor(order.status)}15`,
                            color: getStatusColor(order.status),
                            textTransform: 'uppercase',
                            border: `1px solid ${getStatusColor(order.status)}25`
                          }}>
                            {order.status.split('|')[0].trim()}
                          </span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 900, fontSize: '1.1rem' }}>R$ {parseFloat(order.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                          <button 
                            onClick={() => viewOrderDetails(order)}
                            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end', marginTop: '0.25rem', padding: 0 }}
                          >
                            Ver detalhes <ArrowRight size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '4rem', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', border: '1px dashed var(--border)', color: 'var(--muted)' }}>
                      <ShoppingBag size={40} style={{ opacity: 0.1, margin: '0 auto 1rem' }} />
                      <p>Este cliente ainda não realizou pedidos.</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Detalhes de um pedido específico dentro do histórico
              <div>
                <button 
                  onClick={() => setShowOrderDetails(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', marginBottom: '1.5rem', padding: 0 }}
                >
                  <ChevronLeft size={18} /> Voltar ao histórico
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700 }}>Detalhes do Pedido</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>#{selectedOrder.order_number || selectedOrder.id.slice(0, 8).toUpperCase()}</h2>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '8px', 
                        fontSize: '0.7rem', 
                        fontWeight: 800, 
                        backgroundColor: `${getStatusColor(selectedOrder.status)}15`,
                        color: getStatusColor(selectedOrder.status),
                        textTransform: 'uppercase',
                        border: `1px solid ${getStatusColor(selectedOrder.status)}25`
                      }}>
                        {selectedOrder.status.split('|')[0].trim()}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '1.25rem', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f1f5f9', borderRadius: '12px' }}>
                    <Calendar size={18} color="var(--muted)" style={{ flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>Data do Pedido</div>
                      <div style={{ fontWeight: 700 }}>{new Date(selectedOrder.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f1f5f9', borderRadius: '12px' }}>
                    <CreditCard size={18} color="var(--muted)" style={{ flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>Pagamento</div>
                      <div style={{ fontWeight: 700 }}>{selectedOrder.payment_method || (selectedOrder.status.includes('WhatsApp') ? 'WhatsApp' : selectedOrder.status.includes('Pix') ? 'Pix' : selectedOrder.status.includes('Boleto') ? 'Boleto Bancário' : 'Cartão de Crédito (Simulado)')}</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f1f5f9', borderRadius: '12px' }}>
                    <MapPin size={18} color="var(--muted)" style={{ flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>Endereço de Entrega</div>
                      <div style={{ fontWeight: 700 }}>{selectedOrder.address || (selectedOrder.status.includes('| Endereço:') ? selectedOrder.status.split('| Endereço:')[1].trim() : 'Endereço não cadastrado neste pedido.')}</div>
                    </div>
                  </div>
                </div>

                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}><Package size={18}/> Itens</h4>
                
                <div style={{ display: 'grid', gap: '1rem', marginBottom: '2.5rem' }}>
                  {detailsLoading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}><Loader2 className="animate-spin" /></div>
                  ) : selectedOrder.items?.length > 0 ? (
                    selectedOrder.items.map((item: any, idx: number) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'white', borderRadius: '12px', border: '1px solid var(--border)', gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', minWidth: 0 }}>
                          <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                            {item.products?.images?.[0] && <img src={item.products.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.products?.name || 'Produto Removido'}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{item.quantity}x R$ {parseFloat(item.price).toFixed(2)}</div>
                          </div>
                        </div>
                        <div style={{ fontWeight: 800, flexShrink: 0 }}>R$ {(item.quantity * item.price).toFixed(2)}</div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', background: '#f8fafc', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                      Itens detalhados não encontrados.
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--muted)', fontSize: '0.9rem', fontWeight: 600 }}>Total do Pedido</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary)' }}>
                      R$ {parseFloat(selectedOrder.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .btn-secondary { background: white; border: 1px solid var(--border); border-radius: 12px; color: var(--foreground); cursor: pointer; font-weight: 600; transition: 0.2s; }
        .btn-secondary:hover { background: #f8fafc; border-color: #cbd5e1; }
        .table-row:hover { background-color: #fcfcfc; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .customers-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 1.25rem !important;
            margin-bottom: 2rem !important;
          }
          .header-actions {
            width: 100% !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 0.75rem !important;
          }
          .search-wrapper {
            width: 100% !important;
          }
          .search-input {
            width: 100% !important;
          }
          .export-btn {
            width: 100% !important;
            justify-content: center !important;
          }
          .table-card {
            margin-left: -1.25rem !important;
            margin-right: -1.25rem !important;
            border-radius: 0 !important;
            border-left: none !important;
            border-right: none !important;
          }
          .action-btn-text {
            display: none !important;
          }
          .modal-content {
            padding: 1.5rem !important;
            margin: 0 !important;
            width: 100% !important;
            max-height: 95vh !important;
          }
          .modal-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
          .history-order-card {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 0.75rem !important;
          }
          .history-order-card > div {
            text-align: left !important;
          }
          .history-order-card button {
            justify-content: flex-start !important;
            margin-top: 0.5rem !important;
          }
        }
      `}</style>
    </div>
  )
}
