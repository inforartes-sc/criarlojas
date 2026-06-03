"use client"

import { useState, useEffect } from 'react'
import { ShoppingBag, Eye, Loader2, Filter, Download, Search, X, Package, User, Calendar, CreditCard, MapPin, CheckCircle2, ChevronLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { useAdminAuth } from '@/context/AdminAuthContext'

export default function OrdersPage() {
  const { store } = useAdminAuth()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [fetchingDetails, setFetchingDetails] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [showDeliveryPrompt, setShowDeliveryPrompt] = useState(false)
  const [showCancelPrompt, setShowCancelPrompt] = useState(false)
  const [deliveryDate, setDeliveryDate] = useState('')

  useEffect(() => {
    if (store) {
      fetchOrders()
    }
  }, [store])

  const fetchOrders = async () => {
    if (!store) return
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('orders')
        .select('*, customers(name, email, phone)')
        .eq('store_id', store.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase Error:', error)
        throw error
      }
      setOrders(data || [])
    } catch (error: any) {
      console.error('Fetch Orders Error:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = async (order: any) => {
    setSelectedOrder(order)
    setShowDetails(true)
    setFetchingDetails(true)
    
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*, products(name, images)')
        .eq('order_id', order.id)

      if (!error) {
        setSelectedOrder({ ...order, items: data || [] })
      }
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setFetchingDetails(false)
    }
  }

  const handleUpdateStatus = async (newBaseStatus: string, forecastDate?: string) => {
    if (!selectedOrder) return
    setUpdatingStatus(true)

    try {
      let currentStatus = selectedOrder.status || ''
      let parts = currentStatus.split('|')

      let paymentMethodSub = ''
      if (parts[0].includes('(')) {
        paymentMethodSub = ' ' + parts[0].substring(parts[0].indexOf('(')).trim()
      }

      let newStatusString = newBaseStatus + paymentMethodSub

      const addressPart = parts.find((p: string) => p.includes('Endereço:'))
      if (addressPart) {
        newStatusString += ` | ${addressPart.trim()}`
      }

      if (forecastDate) {
        newStatusString += ` | Previsão: ${forecastDate.trim()}`
      } else {
        const prevPart = parts.find((p: string) => p.includes('Previsão:'))
        if (prevPart) {
          newStatusString += ` | ${prevPart.trim()}`
        }
      }

      const { error } = await supabase
        .from('orders')
        .update({ status: newStatusString })
        .eq('id', selectedOrder.id)
        .eq('store_id', store.id)

      if (error) throw error

      const updatedOrder = { ...selectedOrder, status: newStatusString }
      setSelectedOrder(updatedOrder)
      setOrders((prev: any[]) => prev.map((o: any) => o.id === selectedOrder.id ? { ...o, status: newStatusString } : o))
      toast.success('Status do pedido atualizado com sucesso!')
      setShowDeliveryPrompt(false)
      setDeliveryDate('')
    } catch (error: any) {
      console.error('Update status error:', error)
      toast.error('Erro ao atualizar status do pedido.')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleExport = () => {
    if (orders.length === 0) return alert('Nenhum pedido para exportar.')
    
    const headers = ['ID', 'Cliente', 'Email', 'Data', 'Total', 'Status']
    const csvContent = [
      headers.join(','),
      ...orders.map(o => [
        o.id,
        o.customers?.name,
        o.customers?.email,
        new Date(o.created_at).toLocaleDateString(),
        o.total_amount,
        o.status
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `pedidos_loja_${new Date().toLocaleDateString()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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

  const filteredOrders = orders.filter((order: any) => {
    const searchLower = searchTerm.toLowerCase().trim().replace(/^#/, '')
    const matchesSearch = !searchLower || 
      (order.order_number ? order.order_number.toString().includes(searchLower) : order.id.toLowerCase().slice(0, 8).includes(searchLower)) ||
      (order.customers?.name && order.customers.name.toLowerCase().includes(searchLower)) ||
      (order.customers?.email && order.customers.email.toLowerCase().includes(searchLower))
      
    const matchesStatus = statusFilter === 'all' || (order.status && order.status.toLowerCase().startsWith(statusFilter.toLowerCase()))
    return matchesSearch && matchesStatus
  })

  if (loading) return <div style={{ padding: '5rem', textAlign: 'center' }}><Loader2 className="animate-spin" /></div>

  return (
    <div className="orders-page-container">
      <header style={{ marginBottom: '2.5rem' }} className="orders-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }} className="orders-header-top">
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Pedidos</h1>
            <p style={{ color: 'var(--muted)' }}>Gerenciamento completo das suas vendas.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }} className="header-actions">
            <button onClick={handleExport} className="btn-secondary export-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', height: '46px' }}>
              <Download size={18} />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }} className="orders-header-filters">
          <div style={{ position: 'relative', flex: 1, minWidth: '280px' }} className="search-wrapper">
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input 
              type="text" 
              placeholder="Buscar por ID ou nome do cliente..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              style={{ 
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.5rem', 
                backgroundColor: 'var(--input-bg)', 
                border: '1px solid var(--border)', 
                borderRadius: '12px',
                color: 'var(--foreground)',
                outline: 'none',
                fontSize: '0.95rem'
              }} 
            />
            {searchTerm && <X size={16} onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--muted)' }} />}
          </div>

          <div className="status-tabs-container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--input-bg)', padding: '0.25rem', borderRadius: '12px', border: '1px solid var(--border)', overflowX: 'auto', maxWidth: '100%', WebkitOverflowScrolling: 'touch' }}>
            {['all', 'pendente', 'pago', 'enviado', 'entregue', 'cancelado'].map(s => (
              <button 
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: statusFilter === s ? 'var(--primary)' : 'transparent',
                  color: statusFilter === s ? 'white' : 'var(--muted)',
                  textTransform: 'capitalize',
                  transition: '0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                {s === 'all' ? 'Todos' : s}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="glass-card table-card" style={{ overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: '#f8fafc' }}>
                <th style={{ padding: '1.25rem', fontWeight: 700, color: 'var(--foreground)', fontSize: '0.9rem' }}>ID do Pedido</th>
                <th style={{ padding: '1.25rem', fontWeight: 700, color: 'var(--foreground)', fontSize: '0.9rem' }}>Cliente</th>
                <th style={{ padding: '1.25rem', fontWeight: 700, color: 'var(--foreground)', fontSize: '0.9rem' }}>Data</th>
                <th style={{ padding: '1.25rem', fontWeight: 700, color: 'var(--foreground)', fontSize: '0.9rem' }}>Total</th>
                <th style={{ padding: '1.25rem', fontWeight: 700, color: 'var(--foreground)', fontSize: '0.9rem' }}>Status</th>
                <th style={{ padding: '1.25rem', fontWeight: 700, color: 'var(--foreground)', fontSize: '0.9rem', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '6rem', textAlign: 'center', color: 'var(--muted)' }}>
                    <ShoppingBag size={48} style={{ marginBottom: '1.5rem', opacity: 0.2, margin: '0 auto' }} />
                    <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>Nenhum pedido encontrado.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order: any) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid var(--border)', transition: '0.2s' }} className="table-row">
                    <td style={{ padding: '1.25rem', fontWeight: 700, color: 'var(--primary)', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                      #{order.order_number || order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td style={{ padding: '1.25rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--foreground)', whiteSpace: 'nowrap' }}>{order.customers?.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{order.customers?.email}</div>
                    </td>
                    <td style={{ padding: '1.25rem', color: 'var(--muted)', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1.25rem', fontWeight: 800, color: 'var(--foreground)', whiteSpace: 'nowrap' }}>
                      R$ {parseFloat(order.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '1.25rem', whiteSpace: 'nowrap' }}>
                      <span style={{ 
                        padding: '6px 12px', 
                        borderRadius: '8px', 
                        fontSize: '0.75rem', 
                        fontWeight: 800, 
                        backgroundColor: `${getStatusColor(order.status)}15`,
                        color: getStatusColor(order.status),
                        textTransform: 'uppercase',
                        border: `1px solid ${getStatusColor(order.status)}25`
                      }}>
                        {order.status.split('|')[0].trim()}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                      <button onClick={() => handleViewDetails(order)} style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--muted)', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}>
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalhes */}
      {showDetails && selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-card modal-content" style={{ maxWidth: '1100px', width: '100%', padding: '2rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setShowDetails(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.05)', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}><X size={20} /></button>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem', marginTop: '0.5rem' }}>
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

            <div className="modal-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
              <div>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--muted)' }}><User size={16}/> Cliente</h4>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{selectedOrder.customers?.name}</div>
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{selectedOrder.customers?.email}</div>
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{selectedOrder.customers?.phone || 'Sem telefone'}</div>
              </div>
              <div>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--muted)' }}><Calendar size={16}/> Informações</h4>
                <div style={{ fontWeight: 600 }}>Data: {new Date(selectedOrder.created_at).toLocaleString()}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <CreditCard size={16} color="var(--muted)" />
                  <span>Pagamento: {selectedOrder.payment_method || (selectedOrder.status.includes('WhatsApp') ? 'WhatsApp' : selectedOrder.status.includes('Pix') ? 'Pix' : selectedOrder.status.includes('Boleto') ? 'Boleto Bancário' : 'Cartão de Crédito (Simulado)')}</span>
                </div>
                {selectedOrder.status.includes('| Previsão:') && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', color: 'var(--primary)', fontWeight: 700 }}>
                    <Calendar size={16} />
                    <span>Entrega Prevista: {selectedOrder.status.split('| Previsão:')[1].trim()}</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                <MapPin size={14} /> Endereço de Entrega
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                {selectedOrder.address || (selectedOrder.status.includes('| Endereço:') ? selectedOrder.status.split('| Endereço:')[1].trim() : 'Endereço não cadastrado neste pedido.')}
              </div>
            </div>

            {/* Gerenciamento do Pedido */}
            <div style={{ background: '#f1f5f9', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '2rem' }} className="management-block">
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--foreground)' }}>
                <Package size={18} style={{ color: 'var(--primary)' }} /> Gerenciamento do Pedido
              </h4>

              {showCancelPrompt ? (
                <div style={{ background: '#fef2f2', padding: '1.25rem', borderRadius: '12px', border: '1px solid #f87171', display: 'grid', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#991b1b', fontWeight: 800 }}>
                    <X size={20} />
                    <span>Tem certeza que deseja cancelar este pedido?</span>
                  </div>
                  <p style={{ color: '#7f1d1d', fontSize: '0.85rem', margin: 0 }}>
                    Esta ação marcará o pedido como cancelado no sistema.
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <button onClick={() => setShowCancelPrompt(false)} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} disabled={updatingStatus}>Voltar</button>
                    <button 
                      onClick={() => { setShowCancelPrompt(false); handleUpdateStatus('cancelado'); }} 
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                      disabled={updatingStatus}
                    >
                      {updatingStatus ? <Loader2 size={14} className="animate-spin" /> : null}
                      Sim, Cancelar Pedido
                    </button>
                  </div>
                </div>
              ) : showDeliveryPrompt ? (
                <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'grid', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>Data de Previsão de Entrega (Ex: 25/05/2026 ou 5 dias úteis)</label>
                    <input 
                      type="text" 
                      placeholder="Digite a data ou prazo previsto..." 
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', fontWeight: 600 }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <button onClick={() => setShowDeliveryPrompt(false)} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} disabled={updatingStatus}>Cancelar</button>
                    <button 
                      onClick={() => handleUpdateStatus('enviado', deliveryDate || 'Não informada')} 
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                      disabled={updatingStatus}
                    >
                      {updatingStatus ? <Loader2 size={14} className="animate-spin" /> : null}
                      Confirmar Envio
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }} className="management-buttons">
                  <button 
                    onClick={() => handleUpdateStatus('pago')}
                    style={{ flex: 1, minWidth: '180px', height: '48px', padding: '0 1rem', borderRadius: '12px', border: '1px solid #22c55e', backgroundColor: '#22c55e', color: 'white', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: '0.2s', whiteSpace: 'nowrap', opacity: selectedOrder.status.startsWith('pago') ? 0.5 : 1 }}
                    disabled={updatingStatus || selectedOrder.status.startsWith('pago')}
                  >
                    {updatingStatus ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={18} />}
                    {selectedOrder.status.startsWith('pago') ? 'Pagamento Confirmado' : 'Confirmar Pagamento'}
                  </button>

                  <button 
                    onClick={() => setShowDeliveryPrompt(true)}
                    style={{ flex: 1, minWidth: '180px', height: '48px', padding: '0 1rem', borderRadius: '12px', border: '1px solid #6366f1', backgroundColor: '#6366f1', color: 'white', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: '0.2s', whiteSpace: 'nowrap', opacity: selectedOrder.status.startsWith('enviado') ? 0.5 : 1 }}
                    disabled={updatingStatus || selectedOrder.status.startsWith('enviado')}
                  >
                    {updatingStatus ? <Loader2 size={16} className="animate-spin" /> : <Package size={18} />}
                    {selectedOrder.status.startsWith('enviado') ? 'Pedido Enviado' : 'Informar Envio'}
                  </button>

                  <button 
                    onClick={() => handleUpdateStatus('entregue')}
                    style={{ flex: 1, minWidth: '180px', height: '48px', padding: '0 1rem', borderRadius: '12px', border: '1px solid #10b981', backgroundColor: '#10b981', color: 'white', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: '0.2s', whiteSpace: 'nowrap', opacity: selectedOrder.status.startsWith('entregue') ? 0.5 : 1 }}
                    disabled={updatingStatus || selectedOrder.status.startsWith('entregue')}
                  >
                    {updatingStatus ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={18} />}
                    {selectedOrder.status.startsWith('entregue') ? 'Pedido Entregue' : 'Confirmar Entrega'}
                  </button>

                  <button 
                    onClick={() => setShowCancelPrompt(true)}
                    style={{ flex: 1, minWidth: '180px', height: '48px', padding: '0 1rem', borderRadius: '12px', border: '1px solid #ef4444', backgroundColor: 'transparent', color: '#ef4444', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: '0.2s', whiteSpace: 'nowrap', opacity: selectedOrder.status.startsWith('cancelado') ? 0.5 : 1 }}
                    disabled={updatingStatus || selectedOrder.status.startsWith('cancelado')}
                  >
                    {updatingStatus ? <Loader2 size={16} className="animate-spin" /> : <X size={18} />}
                    Cancelar Pedido
                  </button>
                </div>
              )}
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--muted)' }}><Package size={16}/> Itens do Pedido</h4>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {fetchingDetails ? (
                   <div style={{ padding: '2rem', textAlign: 'center' }}><Loader2 className="animate-spin" /></div>
                ) : selectedOrder.items?.length > 0 ? (
                  selectedOrder.items.map((item: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border)', gap: '1rem' }}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', minWidth: 0 }}>
                         <div style={{ width: '40px', height: '40px', background: 'var(--border)', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                            {item.products?.images?.[0] && <img src={item.products.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                         </div>
                         <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.products?.name || 'Produto Removido'}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Qtd: {item.quantity} x R$ {parseFloat(item.price).toFixed(2)}</div>
                         </div>
                      </div>
                      <div style={{ fontWeight: 700, flexShrink: 0 }}>R$ {(item.quantity * item.price).toFixed(2)}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--muted)', background: '#f8fafc', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                    Nenhum item detalhado encontrado.
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: 'var(--muted)', fontSize: '0.9rem', fontWeight: 600 }}>Total do Pedido</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary)' }}>
                  R$ {parseFloat(selectedOrder.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
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
          .orders-header {
            margin-bottom: 1.5rem !important;
          }
          .orders-header-top {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 1.25rem !important;
            margin-bottom: 1rem !important;
          }
          .header-actions {
            width: 100% !important;
          }
          .export-btn {
            width: 100% !important;
            justify-content: center !important;
          }
          .orders-header-filters {
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
          .status-tabs-container {
            width: 100% !important;
            padding: 0.35rem !important;
          }
          .table-card {
            margin-left: -1.25rem !important;
            margin-right: -1.25rem !important;
            border-radius: 0 !important;
            border-left: none !important;
            border-right: none !important;
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
          .management-buttons button {
            min-width: 100% !important;
          }
        }
      `}</style>
    </div>
  )
}
