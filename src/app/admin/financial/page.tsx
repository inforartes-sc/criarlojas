"use client"

import { useState, useEffect } from 'react'
import { DollarSign, Loader2, ArrowUpRight, ArrowDownRight, Search, X, Plus, Filter, Calendar, CheckCircle2, AlertCircle, Edit2, Trash2, Link2, MessageSquare, Check, Send, Eye } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { toast } from 'react-hot-toast'
import { getAbsoluteUrl } from '@/lib/getDomainSuffix'

export default function FinancialPage() {
  const { store } = useAdminAuth()
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [selectedServices, setSelectedServices] = useState<any[]>([])
  
  // Abas e Filtros
  const [activeTab, setActiveTab] = useState<'receivable' | 'payable'>('receivable')
  const [statusFilter, setStatusFilter] = useState('all') // all, pending, paid
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modais
  const [showAddEditModal, setShowAddEditModal] = useState(false)
  
  // Form State
  const [form, setForm] = useState({
    id: '',
    type: 'receivable', // receivable or payable
    description: '',
    amount: '',
    due_date: '',
    status: 'pending',
    category: '',
    client_id: '',
    payment_method: '',
    invoice_description: ''
  })

  useEffect(() => {
    if (store) {
      fetchData()
    }
  }, [store])

  const fetchData = async () => {
    if (!store) return
    try {
      setLoading(true)
      
      // 1. Fetch service clients for the dropdown select
      const { data: clientsData, error: clientsErr } = await supabase
        .from('service_clients')
        .select('id, name')
        .eq('store_id', store.id)
        .order('name', { ascending: true })

      if (clientsErr) throw clientsErr
      setClients(clientsData || [])

      // 1.5 Fetch active services
      const { data: servicesData, error: servicesErr } = await supabase
        .from('products')
        .select('id, name, price')
        .eq('store_id', store.id)
        .eq('is_service', true)
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (servicesErr) throw servicesErr
      setServices(servicesData || [])

      // 2. Fetch financial entries
      const { data: entriesData, error: entriesErr } = await supabase
        .from('financial_entries')
        .select('*, service_clients(name, phone), custom_invoices(description)')
        .eq('store_id', store.id)
        .order('due_date', { ascending: true })

      if (entriesErr) throw entriesErr
      setEntries(entriesData || [])
    } catch (error: any) {
      console.error('Fetch Financial Data Error:', error.message)
      toast.error('Erro ao buscar lançamentos: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAdd = (type: 'receivable' | 'payable') => {
    setForm({
      id: '',
      type,
      description: '',
      amount: '',
      due_date: new Date().toISOString().split('T')[0],
      status: 'pending',
      category: '',
      client_id: '',
      payment_method: '',
      invoice_description: ''
    })
    setSelectedServices([])
    setShowAddEditModal(true)
  }

  const handleOpenEdit = (entry: any, e: React.MouseEvent) => {
    e.stopPropagation()
    let restoredServices = []
    let userNotes = entry.custom_invoices?.description || ''
    if (userNotes.includes('---SERVICES_JSON---')) {
      const parts = userNotes.split('---SERVICES_JSON---')
      try {
        restoredServices = JSON.parse(parts[1])
      } catch (e) {}
      const rawTextBeforeJson = parts[0]
      const notesMatch = rawTextBeforeJson.split('\n\n')
      userNotes = notesMatch.slice(1).join('\n\n').trim()
    }
    setForm({
      id: entry.id,
      type: entry.type,
      description: entry.description,
      amount: String(entry.amount),
      due_date: entry.due_date,
      status: entry.status,
      category: entry.category || '',
      client_id: entry.client_id || '',
      payment_method: entry.payment_method || '',
      invoice_description: userNotes
    })
    setSelectedServices(restoredServices)
    setShowAddEditModal(true)
  }

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!store) return
    if (!form.description.trim() || !form.amount || !form.due_date) {
      return toast.error('Preencha todos os campos obrigatórios (*).')
    }

    try {
      let invoiceId = null

      // Se for receita e tiver cliente, gera/atualiza fatura avulsa para pagamento online
      if (form.type === 'receivable' && form.client_id) {
        let existingInvoiceId = null
        if (form.id) {
          const { data: currentEntry } = await supabase
            .from('financial_entries')
            .select('invoice_id')
            .eq('id', form.id)
            .single()
          existingInvoiceId = currentEntry?.invoice_id
        }

        let finalDescription = form.invoice_description.trim() || `Lançamento financeiro: ${form.description.trim()}`
        if (selectedServices.length > 0) {
          const servicesText = selectedServices.map(s => `- ${s.name}: R$ ${Number(s.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`).join('\n')
          finalDescription = `Serviços:\n${servicesText}\n\n${form.invoice_description.trim()}\n\n---SERVICES_JSON---${JSON.stringify(selectedServices)}`
        }

        const invoicePayload = {
          store_id: store.id,
          client_id: form.client_id,
          title: form.description.trim(),
          description: finalDescription,
          amount: parseFloat(form.amount),
          due_date: form.due_date,
          status: form.status,
          paid_at: form.status === 'paid' ? new Date().toISOString() : null
        }

        if (existingInvoiceId) {
          const { error: invErr } = await supabase
            .from('custom_invoices')
            .update(invoicePayload)
            .eq('id', existingInvoiceId)
          if (invErr) throw invErr
          invoiceId = existingInvoiceId
        } else {
          const { data: newInv, error: invErr } = await supabase
            .from('custom_invoices')
            .insert(invoicePayload)
            .select('id')
            .single()
          if (invErr) throw invErr
          invoiceId = newInv.id
        }
      }

      const payload = {
        store_id: store.id,
        type: form.type,
        description: form.description.trim(),
        amount: parseFloat(form.amount),
        due_date: form.due_date,
        status: form.status,
        category: form.category.trim() || null,
        client_id: form.type === 'receivable' && form.client_id ? form.client_id : null,
        invoice_id: invoiceId,
        payment_method: form.payment_method.trim() || null,
        paid_at: form.status === 'paid' ? new Date().toISOString() : null
      }

      if (form.id) {
        // Edit
        const { error } = await supabase
          .from('financial_entries')
          .update(payload)
          .eq('id', form.id)
          .eq('store_id', store.id)

        if (error) throw error
        toast.success('Lançamento atualizado com sucesso!')
      } else {
        // Create
        const { error } = await supabase
          .from('financial_entries')
          .insert(payload)

        if (error) throw error
        toast.success('Lançamento financeiro cadastrado com sucesso!')
      }

      setShowAddEditModal(false)
      fetchData()
    } catch (error: any) {
      toast.error('Erro ao salvar lançamento: ' + error.message)
    }
  }

  const handleDeleteEntry = async (id: string, description: string, invoiceId: string | null, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`Deseja excluir o lançamento "${description}"?`)) return

    try {
      if (invoiceId) {
        // Deletar a fatura vinculada (excluirá o lançamento em cascata ou ambos)
        const { error } = await supabase
          .from('custom_invoices')
          .delete()
          .eq('id', invoiceId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('financial_entries')
          .delete()
          .eq('id', id)
          .eq('store_id', store.id)
        if (error) throw error
      }
      toast.success('Lançamento excluído com sucesso!')
      fetchData()
    } catch (error: any) {
      toast.error('Erro ao excluir lançamento: ' + error.message)
    }
  }

  const handleToggleStatus = async (entry: any, e: React.MouseEvent) => {
    e.stopPropagation()
    const nextStatus = entry.status === 'paid' ? 'pending' : 'paid'
    try {
      const { error } = await supabase
        .from('financial_entries')
        .update({ 
          status: nextStatus,
          paid_at: nextStatus === 'paid' ? new Date().toISOString() : null
        })
        .eq('id', entry.id)
        .eq('store_id', store.id)

      if (error) throw error

      if (entry.invoice_id) {
        await supabase
          .from('custom_invoices')
          .update({
            status: nextStatus,
            paid_at: nextStatus === 'paid' ? new Date().toISOString() : null
          })
          .eq('id', entry.invoice_id)
      }

      toast.success(nextStatus === 'paid' ? 'Lançamento marcado como Pago!' : 'Lançamento marcado como Pendente!')
      fetchData()
    } catch (error: any) {
      toast.error('Erro ao alterar status: ' + error.message)
    }
  }

  // Estatísticas do Mês
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const currentMonthEntries = entries.filter(e => new Date(e.due_date) >= startOfMonth)

  const stats = {
    receivablePending: entries.filter(e => e.type === 'receivable' && e.status === 'pending').reduce((acc, e) => acc + e.amount, 0),
    payablePending: entries.filter(e => e.type === 'payable' && e.status === 'pending').reduce((acc, e) => acc + e.amount, 0),
    receivedMonth: currentMonthEntries.filter(e => e.type === 'receivable' && e.status === 'paid').reduce((acc, e) => acc + e.amount, 0),
    paidMonth: currentMonthEntries.filter(e => e.type === 'payable' && e.status === 'paid').reduce((acc, e) => acc + e.amount, 0)
  }

  // Filtragem da Lista Principal
  const filteredEntries = entries.filter((e) => {
    const matchesTab = e.type === activeTab
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter
    const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (e.category && e.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (e.service_clients?.name && e.service_clients.name.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesTab && matchesStatus && matchesSearch
  })

  if (loading) {
    return (
      <div style={{ padding: '5rem', textAlign: 'center' }}>
        <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto', color: '#6366f1' }} />
        <p style={{ marginTop: '1rem', color: 'var(--muted)' }}>Carregando lançamentos financeiros...</p>
      </div>
    )
  }

  return (
    <div className="financial-page">
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Fluxo Financeiro</h1>
          <p style={{ color: 'var(--muted)' }}>Controle de Contas a Receber, Contas a Pagar e faturamento do seu negócio.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={() => handleOpenAdd('receivable')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.2)' }}>
            <Plus size={18} />
            <span>Nova Receita</span>
          </button>
          <button onClick={() => handleOpenAdd('payable')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(239,68,68,0.2)' }}>
            <Plus size={18} />
            <span>Nova Despesa</span>
          </button>
        </div>
      </header>

      {/* Indicadores do Topo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--border)' }}>
          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: '#10b981' }}>
            <ArrowUpRight size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>A Receber (Total)</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>R$ {stats.receivablePending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--border)' }}>
          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', color: '#ef4444' }}>
            <ArrowDownRight size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>A Pagar (Total)</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>R$ {stats.payablePending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--border)' }}>
          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.15)', borderRadius: '12px', color: '#10b981' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>Recebido (Mês)</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10b981' }}>R$ {stats.receivedMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--border)' }}>
          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', borderRadius: '12px', color: '#ef4444' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>Pago (Mês)</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ef4444' }}>R$ {stats.paidMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', backgroundColor: 'var(--input-bg)', padding: '0.4rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <button 
            onClick={() => setActiveTab('receivable')}
            style={{ 
              padding: '0.6rem 1.5rem', 
              borderRadius: '8px', 
              border: 'none', 
              fontWeight: 700, 
              fontSize: '0.9rem', 
              cursor: 'pointer',
              backgroundColor: activeTab === 'receivable' ? 'white' : 'transparent',
              color: activeTab === 'receivable' ? '#10b981' : 'var(--muted)',
              boxShadow: activeTab === 'receivable' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            Contas a Receber
          </button>
          <button 
            onClick={() => setActiveTab('payable')}
            style={{ 
              padding: '0.6rem 1.5rem', 
              borderRadius: '8px', 
              border: 'none', 
              fontWeight: 700, 
              fontSize: '0.9rem', 
              cursor: 'pointer',
              backgroundColor: activeTab === 'payable' ? 'white' : 'transparent',
              color: activeTab === 'payable' ? '#ef4444' : 'var(--muted)',
              boxShadow: activeTab === 'payable' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            Contas a Pagar
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="search-wrapper" style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input 
              type="text" 
              placeholder="Buscar por descrição ou categoria..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                padding: '0.6rem 1rem 0.6rem 2.2rem', 
                backgroundColor: 'var(--input-bg)', 
                border: '1px solid var(--border)', 
                borderRadius: '10px',
                color: 'var(--foreground)',
                outline: 'none',
                width: '240px',
                fontSize: '0.9rem'
              }} 
            />
          </div>

          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: '0.6rem 1rem', borderRadius: '10px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--foreground)', outline: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
          >
            <option value="all">Todos os Status</option>
            <option value="pending">Pendente</option>
            <option value="paid">Confirmado / Pago</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="glass-card table-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--input-bg)' }}>
                <th style={{ padding: '1.25rem', fontWeight: 700, fontSize: '0.9rem' }}>Vencimento</th>
                <th style={{ padding: '1.25rem', fontWeight: 700, fontSize: '0.9rem' }}>Descrição</th>
                <th style={{ padding: '1.25rem', fontWeight: 700, fontSize: '0.9rem' }}>Categoria</th>
                {activeTab === 'receivable' && <th style={{ padding: '1.25rem', fontWeight: 700, fontSize: '0.9rem' }}>Cliente</th>}
                <th style={{ padding: '1.25rem', fontWeight: 700, fontSize: '0.9rem' }}>Valor</th>
                <th style={{ padding: '1.25rem', fontWeight: 700, fontSize: '0.9rem' }}>Status</th>
                <th style={{ padding: '1.25rem', fontWeight: 700, fontSize: '0.9rem', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'receivable' ? 7 : 6} style={{ padding: '6rem', textAlign: 'center', color: 'var(--muted)' }}>
                    <AlertCircle size={48} style={{ marginBottom: '1.5rem', opacity: 0.2, margin: '0 auto' }} />
                    <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>Nenhum lançamento financeiro encontrado.</p>
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr key={entry.id} style={{ borderBottom: '1px solid var(--border)', transition: '0.2s' }} className="table-row">
                    <td style={{ padding: '1.25rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Calendar size={14} /> {new Date(entry.due_date).toLocaleDateString()}</span>
                    </td>
                    <td style={{ padding: '1.25rem', fontWeight: 700 }}>
                      {entry.description}
                    </td>
                    <td style={{ padding: '1.25rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
                      {entry.category || '---'}
                    </td>
                    {activeTab === 'receivable' && (
                      <td style={{ padding: '1.25rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
                        {entry.service_clients?.name || '---'}
                      </td>
                    )}
                    <td style={{ padding: '1.25rem', fontWeight: 800, fontSize: '1rem', color: entry.type === 'receivable' ? '#10b981' : '#ef4444' }}>
                      {entry.type === 'receivable' ? '+' : '-'} R$ {entry.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '1.25rem' }}>
                      <button 
                        onClick={(e) => handleToggleStatus(entry, e)}
                        style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          border: 'none',
                          backgroundColor: entry.status === 'paid' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: entry.status === 'paid' ? '#22c55e' : '#f59e0b'
                        }}
                      >
                        {entry.status === 'paid' ? 'Confirmado' : 'Pendente'}
                      </button>
                    </td>
                    <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {entry.type === 'receivable' && entry.invoice_id && entry.status === 'pending' && (
                          <div style={{ display: 'flex', gap: '0.35rem', marginRight: '0.75rem' }}>
                            {/* Dar Baixa Manual (Confirmar Pagamento) */}
                            <button 
                              type="button"
                              onClick={(e) => handleToggleStatus(entry, e)}
                              title="Confirmar Pagamento (Baixa Manual)" 
                              style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', cursor: 'pointer', display: 'flex' }}
                            >
                              <Check size={16} />
                            </button>
                            
                            {/* Cobrar via WhatsApp */}
                            {entry.service_clients?.phone && (
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  const faturaUrl = getAbsoluteUrl(store.subdomain, `/fatura/${entry.invoice_id}`)
                                  const text = encodeURIComponent(
                                    `Olá, ${entry.service_clients.name}! Segue o link para pagamento da fatura no valor de R$ ${entry.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.\n\n` +
                                    `Acesse o link seguro para efetuar o pagamento via Pix ou Cartão: ${faturaUrl}`
                                  )
                                  const phoneClean = entry.service_clients.phone.replace(/\D/g, '')
                                  const ddi = phoneClean.startsWith('55') ? '' : '55'
                                  window.open(`https://wa.me/${ddi}${phoneClean}?text=${text}`, '_blank')
                                }}
                                title="Cobrar via WhatsApp" 
                                style={{ padding: '0.5rem', background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9', border: '1px solid rgba(14, 165, 233, 0.2)', borderRadius: '8px', cursor: 'pointer', display: 'flex' }}
                              >
                                <Send size={16} />
                              </button>
                            )}

                            {/* Visualizar Fatura */}
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                const faturaUrl = getAbsoluteUrl(store.subdomain, `/fatura/${entry.invoice_id}`)
                                window.open(faturaUrl, '_blank')
                              }}
                              title="Visualizar Fatura" 
                              style={{ padding: '0.5rem', background: 'var(--input-bg)', color: 'var(--foreground)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', display: 'flex' }}
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        )}

                        <button onClick={(e) => handleOpenEdit(entry, e)} style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--primary)', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex' }} title="Editar">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={(e) => handleDeleteEntry(entry.id, entry.description, entry.invoice_id, e)} style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: '#ef4444', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex' }} title="Excluir">
                          <Trash2 size={16} />
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

      {/* Modal Lançamento (Receita / Despesa) */}
      {showAddEditModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000, padding: '2rem 1rem', overflowY: 'auto' }}>
          <div className="glass-card modal-content" style={{ maxWidth: '700px', width: '100%', padding: '2rem', position: 'relative', margin: 'auto' }}>
            <button onClick={() => setShowAddEditModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.05)', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}><X size={20} /></button>
            
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: form.type === 'receivable' ? '#10b981' : '#ef4444' }}>
              <DollarSign size={24} />
              {form.id ? 'Editar Lançamento' : (form.type === 'receivable' ? 'Novo Lançamento de Receita' : 'Novo Lançamento de Despesa')}
            </h2>

            <form onSubmit={handleSaveEntry} style={{ display: 'grid', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>Descrição / Título *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Aluguel do escritório, Pagamento de Honorários..." 
                  value={form.description} 
                  onChange={e => setForm({ ...form, description: e.target.value })} 
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--input-bg)', color: 'var(--foreground)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>Valor (R$) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    placeholder="150.00" 
                    value={form.amount} 
                    onChange={e => setForm({ ...form, amount: e.target.value })} 
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--input-bg)', color: 'var(--foreground)' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>Vencimento *</label>
                  <input 
                    type="date" 
                    required
                    value={form.due_date} 
                    onChange={e => setForm({ ...form, due_date: e.target.value })} 
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--input-bg)', color: 'var(--foreground)', cursor: 'pointer' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>Categoria</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Honorários, Infraestrutura..." 
                    value={form.category} 
                    onChange={e => setForm({ ...form, category: e.target.value })} 
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--input-bg)', color: 'var(--foreground)' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>Status Inicial</label>
                  <select 
                    value={form.status} 
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--input-bg)', color: 'var(--foreground)', outline: 'none' }}
                  >
                    <option value="pending" style={{color:'#000'}}>Pendente (Em aberto)</option>
                    <option value="paid" style={{color:'#000'}}>Confirmado / Pago</option>
                  </select>
                </div>
              </div>

              {form.type === 'receivable' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>Adicionar Serviços do Site à Fatura</label>
                    <select 
                      value="" 
                      onChange={e => {
                        const val = e.target.value
                        if (!val) return
                        const svc = services.find(s => s.id === val)
                        if (svc) {
                          const updated = [...selectedServices, { id: svc.id, name: svc.name, price: svc.price }]
                          setSelectedServices(updated)
                          const totalAmt = updated.reduce((sum, item) => sum + parseFloat(item.price || 0), 0)
                          let newDesc = form.description
                          if (!newDesc.trim() || newDesc.startsWith('Serviço: ') || newDesc.startsWith('Fatura de Serviços')) {
                            if (updated.length === 1) {
                              newDesc = `Serviço: ${updated[0].name}`
                            } else {
                              newDesc = `Fatura de Serviços (${updated.length} itens)`
                            }
                          }
                          setForm({ ...form, amount: totalAmt.toFixed(2), description: newDesc })
                        }
                      }}
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--input-bg)', color: 'var(--foreground)', outline: 'none' }}
                    >
                      <option value="" style={{color:'#000'}}>Escolha um serviço para adicionar...</option>
                      {services.map(s => (
                        <option key={s.id} value={s.id} style={{color:'#000'}}>{s.name} - R$ {Number(s.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</option>
                      ))}
                    </select>
                  </div>

                  {selectedServices.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: 'rgba(255,255,255,0.02)', padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)' }}>Serviços Selecionados:</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {selectedServices.map((item, idx) => (
                          <div key={`${item.id}-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', padding: '0.25rem 0' }}>
                            <span style={{ fontWeight: 600 }}>{item.name}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <span style={{ fontWeight: 800, color: '#10b981' }}>R$ {Number(item.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                              <button 
                                type="button" 
                                onClick={() => {
                                  const updated = selectedServices.filter((_, i) => i !== idx)
                                  setSelectedServices(updated)
                                  const totalAmt = updated.reduce((sum, item) => sum + parseFloat(item.price || 0), 0)
                                  let newDesc = form.description
                                  if (updated.length === 0) {
                                    newDesc = ''
                                  } else if (updated.length === 1) {
                                    newDesc = `Serviço: ${updated[0].name}`
                                  } else {
                                    newDesc = `Fatura de Serviços (${updated.length} itens)`
                                  }
                                  setForm({ ...form, amount: totalAmt > 0 ? totalAmt.toFixed(2) : '', description: newDesc })
                                }}
                                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', padding: '0.2rem' }}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>Vincular a um Cliente de Serviço (Opcional)</label>
                    <select 
                      value={form.client_id} 
                      onChange={e => setForm({ ...form, client_id: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--input-bg)', color: 'var(--foreground)', outline: 'none' }}
                    >
                      <option value="" style={{color:'#000'}}>Selecionar Cliente...</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id} style={{color:'#000'}}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {form.client_id && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>Descrição Detalhada da Fatura (Opcional)</label>
                      <textarea 
                        placeholder="Descreva os detalhes dos serviços prestados (aparecerá na fatura do cliente)..." 
                        value={form.invoice_description} 
                        onChange={e => setForm({ ...form, invoice_description: e.target.value })} 
                        rows={3}
                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--input-bg)', color: 'var(--foreground)', outline: 'none', resize: 'vertical', fontSize: '0.9rem' }}
                      />
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>Meio de Transação (Opcional)</label>
                <input 
                  type="text" 
                  placeholder="Ex: Pix, Transferência, Dinheiro..." 
                  value={form.payment_method} 
                  onChange={e => setForm({ ...form, payment_method: e.target.value })} 
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--input-bg)', color: 'var(--foreground)' }}
                />
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                <button type="submit" style={{ flex: 1, padding: '0.75rem', backgroundColor: form.type === 'receivable' ? '#10b981' : '#ef4444', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
                  Salvar Lançamento
                </button>
                <button type="button" onClick={() => setShowAddEditModal(false)} style={{ padding: '0.75rem 1.5rem', background: 'white', border: '1px solid var(--border)', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .table-row:hover {
          background-color: rgba(99, 102, 241, 0.02) !important;
        }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .table-card {
            margin-left: -1.25rem !important;
            margin-right: -1.25rem !important;
            border-radius: 0 !important;
            border-left: none !important;
            border-right: none !important;
          }
          .modal-content {
            padding: 1.5rem !important;
            max-height: none !important;
          }
        }
      `}</style>
    </div>
  )
}
