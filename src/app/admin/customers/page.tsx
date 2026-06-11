"use client"

import { useState, useEffect } from 'react'
import { 
  Users, Mail, Phone, Calendar, Loader2, Search, Download, X, History, 
  ShoppingBag, ArrowRight, Package, CreditCard, ChevronLeft, User, 
  FileText, MapPin, Hash, Plus, Edit2, Trash2, DollarSign, Link2, MessageSquare, Copy 
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { toast } from 'react-hot-toast'
import { getAbsoluteUrl } from '@/lib/getDomainSuffix'

export default function UnifiedCustomersPage() {
  const { store } = useAdminAuth()
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'store' | 'service'>('store')
  const layoutModelLower = (store?.settings?.layout_model || '').toLowerCase().trim()
  const isServicesOnly = ['lawyer', 'advocacia', 'advocacy', 'services', 'service', 'electrician', 'aura'].includes(layoutModelLower)
  const isPureServicesOrLawyer = ['lawyer', 'advocacia', 'advocacy', 'services', 'service', 'electrician'].includes(layoutModelLower)

  useEffect(() => {
    if (store) {
      if (isPureServicesOrLawyer) {
        setActiveTab('service')
      } else {
        setActiveTab('store')
      }
    }
  }, [store, layoutModelLower, isPureServicesOrLawyer])

  // ----------------------------------------------------
  // STATES FOR TABS 1: STORE CUSTOMERS
  // ----------------------------------------------------
  const [loadingStore, setLoadingStore] = useState(true)
  const [storeCustomers, setStoreCustomers] = useState<any[]>([])
  const [searchTermStore, setSearchTermStore] = useState('')
  const [selectedCustomerStore, setSelectedCustomerStore] = useState<any>(null)
  
  // Modals Tab 1
  const [showHistoryStore, setShowHistoryStore] = useState(false)
  const [showRegistrationStore, setShowRegistrationStore] = useState(false)
  
  // History Tab 1
  const [historyLoadingStore, setHistoryLoadingStore] = useState(false)
  const [customerOrdersStore, setCustomerOrdersStore] = useState<any[]>([])
  
  // Order Details inside History Tab 1
  const [selectedOrderStore, setSelectedOrderStore] = useState<any>(null)
  const [showOrderDetailsStore, setShowOrderDetailsStore] = useState(false)
  const [detailsLoadingStore, setDetailsLoadingStore] = useState(false)

  // ----------------------------------------------------
  // STATES FOR TAB 2: SERVICE CLIENTS
  // ----------------------------------------------------
  const [loadingService, setLoadingService] = useState(true)
  const [serviceClients, setServiceClients] = useState<any[]>([])
  const [searchTermService, setSearchTermService] = useState('')
  const [selectedClientService, setSelectedClientService] = useState<any>(null)
  
  // Modals Tab 2
  const [showAddEditModalService, setShowAddEditModalService] = useState(false)
  const [showDetailsModalService, setShowDetailsModalService] = useState(false)
  const [showInvoiceModalService, setShowInvoiceModalService] = useState(false)
  
  // Form Client Tab 2
  const [clientFormService, setClientFormService] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    document: '',
    address: ''
  })

  // Form Invoice Tab 2
  const [invoiceFormService, setInvoiceFormService] = useState({
    title: '',
    description: '',
    amount: '',
    due_date: '',
    status: 'pending'
  })

  // Invoice History Tab 2
  const [clientInvoicesService, setClientInvoicesService] = useState<any[]>([])
  const [invoicesLoadingService, setInvoicesLoadingService] = useState(false)
  const [invoiceSubmittingService, setInvoiceSubmittingService] = useState(false)

  // ----------------------------------------------------
  // LOADERS / FETCHERS
  // ----------------------------------------------------
  useEffect(() => {
    if (store) {
      if (!isPureServicesOrLawyer) {
        fetchStoreCustomers()
      }
      if (isServicesOnly) {
        fetchServiceClients()
      }
    }
  }, [store, layoutModelLower, isPureServicesOrLawyer, isServicesOnly])

  const fetchStoreCustomers = async () => {
    if (!store) return
    try {
      setLoadingStore(true)
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('store_id', store.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setStoreCustomers(data || [])
    } catch (error: any) {
      console.error('Fetch Store Customers Error:', error.message)
    } finally {
      setLoadingStore(false)
    }
  }

  const fetchServiceClients = async () => {
    if (!store) return
    try {
      setLoadingService(true)
      const { data, error } = await supabase
        .from('service_clients')
        .select('*')
        .eq('store_id', store.id)
        .order('name', { ascending: true })

      if (error) throw error
      setServiceClients(data || [])
    } catch (error: any) {
      console.error('Fetch Service Clients Error:', error.message)
      toast.error('Erro ao buscar clientes de serviço.')
    } finally {
      setLoadingService(false)
    }
  }

  // ----------------------------------------------------
  // HANDLERS FOR TAB 1: STORE CUSTOMERS
  // ----------------------------------------------------
  const viewHistoryStore = async (customer: any) => {
    setSelectedCustomerStore(customer)
    setShowHistoryStore(true)
    setShowRegistrationStore(false)
    setHistoryLoadingStore(true)
    setShowOrderDetailsStore(false)
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', customer.id)
        .eq('store_id', store.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCustomerOrdersStore(data || [])
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setHistoryLoadingStore(false)
    }
  }

  const viewRegistrationStore = (customer: any) => {
    setSelectedCustomerStore(customer)
    setShowRegistrationStore(true)
    setShowHistoryStore(false)
  }

  const viewOrderDetailsStore = async (order: any) => {
    setSelectedOrderStore(order)
    setShowOrderDetailsStore(true)
    setDetailsLoadingStore(true)
    
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*, products(name, images)')
        .eq('order_id', order.id)

      if (error) throw error
      setSelectedOrderStore({ ...order, items: data || [] })
    } catch (error) {
      console.error('Error fetching order items:', error)
    } finally {
      setDetailsLoadingStore(false)
    }
  }

  const handleExportStore = () => {
    if (storeCustomers.length === 0) return alert('Nenhum cliente para exportar.')
    
    const headers = ['Nome', 'Email', 'Telefone', 'Data de Cadastro']
    const csvContent = [
      headers.join(','),
      ...storeCustomers.map(c => [
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
    link.setAttribute('download', `clientes_site_${new Date().toLocaleDateString()}.csv`)
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

  const filteredStoreCustomers = storeCustomers.filter((customer: any) => 
    customer.name.toLowerCase().includes(searchTermStore.toLowerCase()) || 
    customer.email.toLowerCase().includes(searchTermStore.toLowerCase())
  )

  // ----------------------------------------------------
  // HANDLERS FOR TAB 2: SERVICE CLIENTS
  // ----------------------------------------------------
  const handleOpenAddService = () => {
    setClientFormService({
      id: '',
      name: '',
      email: '',
      phone: '',
      document: '',
      address: ''
    })
    setShowAddEditModalService(true)
  }

  const handleOpenEditService = (client: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setClientFormService({
      id: client.id,
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      document: client.document || '',
      address: client.address || ''
    })
    setShowAddEditModalService(true)
  }

  const handleSaveClientService = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!store) return
    if (!clientFormService.name.trim()) return toast.error('Nome do cliente é obrigatório.')

    try {
      const payload = {
        store_id: store.id,
        name: clientFormService.name.trim(),
        email: clientFormService.email.trim() || null,
        phone: clientFormService.phone.trim() || null,
        document: clientFormService.document.trim() || null,
        address: clientFormService.address.trim() || null
      }

      if (clientFormService.id) {
        const { error } = await supabase
          .from('service_clients')
          .update(payload)
          .eq('id', clientFormService.id)
          .eq('store_id', store.id)

        if (error) throw error
        toast.success('Cliente atualizado com sucesso!')
      } else {
        const { error } = await supabase
          .from('service_clients')
          .insert(payload)

        if (error) throw error
        toast.success('Cliente cadastrado com sucesso!')
      }

      setShowAddEditModalService(false)
      fetchServiceClients()
    } catch (error: any) {
      toast.error('Erro ao salvar cliente: ' + error.message)
    }
  }

  const handleDeleteClientService = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`Tem certeza que deseja excluir o cliente ${name}?`)) return

    try {
      const { error } = await supabase
        .from('service_clients')
        .delete()
        .eq('id', id)
        .eq('store_id', store.id)

      if (error) throw error
      toast.success('Cliente excluído com sucesso!')
      if (selectedClientService?.id === id) {
        setShowDetailsModalService(false)
      }
      fetchServiceClients()
    } catch (error: any) {
      toast.error('Erro ao excluir cliente: ' + error.message)
    }
  }

  const fetchClientInvoicesService = async (clientId: string) => {
    try {
      setInvoicesLoadingService(true)
      const { data, error } = await supabase
        .from('custom_invoices')
        .select('*')
        .eq('client_id', clientId)
        .eq('store_id', store.id)
        .order('due_date', { ascending: false })

      if (error) throw error
      setClientInvoicesService(data || [])
    } catch (error: any) {
      console.error('Error fetching client invoices:', error.message)
    } finally {
      setInvoicesLoadingService(false)
    }
  }

  const handleViewDetailsService = (client: any) => {
    setSelectedClientService(client)
    setShowDetailsModalService(true)
    fetchClientInvoicesService(client.id)
  }

  const handleOpenCreateInvoiceService = () => {
    setInvoiceFormService({
      title: '',
      description: '',
      amount: '',
      due_date: new Date().toISOString().split('T')[0],
      status: 'pending'
    })
    setShowInvoiceModalService(true)
  }

  const handleSaveInvoiceService = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!store || !selectedClientService) return
    if (!invoiceFormService.title.trim() || !invoiceFormService.amount || !invoiceFormService.due_date) {
      return toast.error('Preencha os campos obrigatórios da fatura.')
    }

    setInvoiceSubmittingService(true)
    try {
      const payload = {
        store_id: store.id,
        client_id: selectedClientService.id,
        title: invoiceFormService.title.trim(),
        description: invoiceFormService.description.trim() || null,
        amount: parseFloat(invoiceFormService.amount),
        due_date: invoiceFormService.due_date,
        status: invoiceFormService.status,
        paid_at: invoiceFormService.status === 'paid' ? new Date().toISOString() : null
      }

      const { data, error } = await supabase
        .from('custom_invoices')
        .insert(payload)
        .select()
        .single()

      if (error) throw error

      const financialPayload = {
        store_id: store.id,
        type: 'receivable',
        description: `Fatura: ${invoiceFormService.title.trim()}`,
        amount: parseFloat(invoiceFormService.amount),
        due_date: invoiceFormService.due_date,
        status: invoiceFormService.status,
        category: 'Fatura',
        client_id: selectedClientService.id,
        invoice_id: data.id,
        paid_at: invoiceFormService.status === 'paid' ? new Date().toISOString() : null
      }

      const { error: finError } = await supabase
        .from('financial_entries')
        .insert(financialPayload)

      if (finError) console.error('Erro ao lançar no financeiro:', finError)

      toast.success('Fatura gerada com sucesso!')
      setShowInvoiceModalService(false)
      fetchClientInvoicesService(selectedClientService.id)
    } catch (error: any) {
      toast.error('Erro ao gerar fatura: ' + error.message)
    } finally {
      setInvoiceSubmittingService(false)
    }
  }

  const handleUpdateInvoiceStatusService = async (invoiceId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('custom_invoices')
        .update({ 
          status: newStatus,
          paid_at: newStatus === 'paid' ? new Date().toISOString() : null
        })
        .eq('id', invoiceId)
        .eq('store_id', store.id)

      if (error) throw error

      const { error: finError } = await supabase
        .from('financial_entries')
        .update({
          status: newStatus,
          paid_at: newStatus === 'paid' ? new Date().toISOString() : null
        })
        .eq('invoice_id', invoiceId)
        .eq('store_id', store.id)

      if (finError) console.error('Erro ao atualizar status no financeiro:', finError)

      toast.success('Status da fatura atualizado!')
      fetchClientInvoicesService(selectedClientService.id)
    } catch (error: any) {
      toast.error('Erro ao atualizar status da fatura: ' + error.message)
    }
  }

  const filteredServiceClients = serviceClients.filter((client: any) => 
    client.name.toLowerCase().includes(searchTermService.toLowerCase()) || 
    (client.email && client.email.toLowerCase().includes(searchTermService.toLowerCase())) ||
    (client.document && client.document.includes(searchTermService))
  )

  const handleExportService = () => {
    if (serviceClients.length === 0) return alert('Nenhum cliente para exportar.')
    
    const headers = ['Nome', 'Email', 'Telefone', 'Documento', 'Endereço', 'Data de Cadastro']
    const csvContent = [
      headers.join(','),
      ...serviceClients.map(c => [
        c.name,
        c.email || '',
        c.phone || '',
        c.document || '',
        c.address || '',
        new Date(c.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `clientes_servico_${new Date().toLocaleDateString()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // ----------------------------------------------------
  // GENERAL LOADING
  // ----------------------------------------------------
  const currentLoading = activeTab === 'store' ? loadingStore : loadingService

  return (
    <div className="customers-page-container">
      
      {/* HEADER PRINCIPAL */}
      <header className="customers-header" style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Clientes</h1>
          <p style={{ color: 'var(--muted)' }}>Gerencie sua base de contatos, histórico de compras e faturamento.</p>
        </div>
        
        <div className="header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          
          {/* BUSCA E EXPORTAÇÃO COMPARTILHADOS/TABULADOS */}
          {activeTab === 'store' ? (
            <>
              <div className="search-wrapper" style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <input 
                  type="text" 
                  placeholder="Buscar clientes do site..." 
                  value={searchTermStore}
                  onChange={(e) => setSearchTermStore(e.target.value)}
                  className="search-input"
                  style={{ 
                    padding: '0.75rem 1rem 0.75rem 2.5rem', 
                    backgroundColor: 'var(--input-bg)', 
                    border: '1px solid var(--border)', 
                    borderRadius: '12px',
                    color: 'var(--foreground)',
                    outline: 'none',
                    width: '300px',
                    fontSize: '0.95rem'
                  }} 
                />
                {searchTermStore && <X size={16} onClick={() => setSearchTermStore('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--muted)' }} />}
              </div>
              <button onClick={handleExportStore} className="btn-secondary export-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', height: '46px' }}>
                <Download size={18} />
                <span>Exportar Site</span>
              </button>
            </>
          ) : (
            <>
              <div className="search-wrapper" style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <input 
                  type="text" 
                  placeholder="Buscar clientes de serviço..." 
                  value={searchTermService}
                  onChange={(e) => setSearchTermService(e.target.value)}
                  className="search-input"
                  style={{ 
                    padding: '0.75rem 1rem 0.75rem 2.5rem', 
                    backgroundColor: 'var(--input-bg)', 
                    border: '1px solid var(--border)', 
                    borderRadius: '12px',
                    color: 'var(--foreground)',
                    outline: 'none',
                    width: '300px',
                    fontSize: '0.95rem'
                  }} 
                />
                {searchTermService && <X size={16} onClick={() => setSearchTermService('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--muted)' }} />}
              </div>
              <button onClick={handleExportService} className="btn-secondary export-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', height: '46px' }}>
                <Download size={18} />
                <span>Exportar Serviços</span>
              </button>
              <button onClick={handleOpenAddService} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(99,102,241,0.25)', height: '46px' }}>
                <Plus size={18} />
                <span>Cadastrar Cliente</span>
              </button>
            </>
          )}

        </div>
      </header>

      {/* ABAS SE FOR NICHO DE SERVIÇOS */}
      {isServicesOnly && !isPureServicesOrLawyer && (
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '2rem', gap: '2rem' }}>
          <button 
            onClick={() => setActiveTab('store')}
            style={{ 
              padding: '0.75rem 0.5rem', 
              background: 'none', 
              border: 'none', 
              borderBottom: activeTab === 'store' ? '3px solid var(--primary)' : '3px solid transparent',
              color: activeTab === 'store' ? 'var(--foreground)' : 'var(--muted)',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              transition: '0.2s'
            }}
          >
            Clientes do Site (Compras)
          </button>
          <button 
            onClick={() => setActiveTab('service')}
            style={{ 
              padding: '0.75rem 0.5rem', 
              background: 'none', 
              border: 'none', 
              borderBottom: activeTab === 'service' ? '3px solid var(--primary)' : '3px solid transparent',
              color: activeTab === 'service' ? 'var(--foreground)' : 'var(--muted)',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              transition: '0.2s'
            }}
          >
            Clientes de Serviço (Faturamento)
          </button>
        </div>
      )}

      {/* RENDERIZADOR DE CONTEÚDO */}
      {currentLoading ? (
        <div style={{ padding: '10rem 5rem', textAlign: 'center' }}>
          <Loader2 className="animate-spin" size={40} style={{ margin: '0 auto', color: 'var(--primary)' }} />
          <p style={{ marginTop: '1rem', color: 'var(--muted)' }}>Carregando dados dos clientes...</p>
        </div>
      ) : activeTab === 'store' ? (
        
        // TAB 1: CLIENTES DO SITE (VENDAS E CHECKOUT)
        <div className="glass-card table-card" style={{ overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '650px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--input-bg)' }}>
                  <th style={{ padding: '1.25rem', fontWeight: 700, fontSize: '0.9rem' }}>Nome Completo</th>
                  <th style={{ padding: '1.25rem', fontWeight: 700, fontSize: '0.9rem' }}>E-mail</th>
                  <th style={{ padding: '1.25rem', fontWeight: 700, fontSize: '0.9rem' }}>Telefone</th>
                  <th style={{ padding: '1.25rem', fontWeight: 700, fontSize: '0.9rem' }}>Desde</th>
                  <th style={{ padding: '1.25rem', fontWeight: 700, fontSize: '0.9rem', textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredStoreCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '6rem', textAlign: 'center', color: 'var(--muted)' }}>
                      <Users size={48} style={{ marginBottom: '1.5rem', opacity: 0.2, margin: '0 auto' }} />
                      <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>Nenhum cliente do site encontrado.</p>
                    </td>
                  </tr>
                ) : (
                  filteredStoreCustomers.map((customer: any) => (
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
                          <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{customer.name}</span>
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
                          <button onClick={() => viewRegistrationStore(customer)} style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--primary)', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap' }} title="Ver Cadastro">
                            <User size={16} />
                            <span className="action-btn-text">Cadastro</span>
                          </button>
                          <button onClick={() => viewHistoryStore(customer)} style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--muted)', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap' }} title="Ver Histórico">
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

      ) : (
        
        // TAB 2: CLIENTES DE SERVIÇO (ORDENS E ORÇAMENTOS MANUAL)
        <div className="glass-card table-card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--input-bg)' }}>
                  <th style={{ padding: '1.25rem', fontWeight: 700, fontSize: '0.9rem' }}>Nome do Cliente</th>
                  <th style={{ padding: '1.25rem', fontWeight: 700, fontSize: '0.9rem' }}>Contato</th>
                  <th style={{ padding: '1.25rem', fontWeight: 700, fontSize: '0.9rem' }}>Documento</th>
                  <th style={{ padding: '1.25rem', fontWeight: 700, fontSize: '0.9rem' }}>Cadastro</th>
                  <th style={{ padding: '1.25rem', fontWeight: 700, fontSize: '0.9rem', textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredServiceClients.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '6rem', textAlign: 'center', color: 'var(--muted)' }}>
                      <Users size={48} style={{ marginBottom: '1.5rem', opacity: 0.2, margin: '0 auto' }} />
                      <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>Nenhum cliente de serviço cadastrado.</p>
                    </td>
                  </tr>
                ) : (
                  filteredServiceClients.map((client) => (
                    <tr key={client.id} onClick={() => handleViewDetailsService(client)} style={{ borderBottom: '1px solid var(--border)', transition: '0.2s', cursor: 'pointer' }} className="table-row-hover">
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
                            boxShadow: '0 4px 10px rgba(99, 102, 241, 0.2)'
                          }}>
                            {client.name.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 700 }}>{client.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Mail size={14} /> {client.email || 'Sem e-mail'}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Phone size={14} /> {client.phone || 'Sem telefone'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1.25rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
                        {client.document || '---'}
                      </td>
                      <td style={{ padding: '1.25rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Calendar size={14} /> {new Date(client.created_at).toLocaleDateString()}</span>
                      </td>
                      <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button onClick={(e) => handleOpenEditService(client, e)} style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--primary)', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }} title="Editar">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={(e) => handleDeleteClientService(client.id, client.name, e)} style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: '#ef4444', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }} title="Excluir">
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
      )}

      {/* ----------------------------------------------------
          MODALS FOR TAB 1: STORE CUSTOMERS
         ---------------------------------------------------- */}
      {showRegistrationStore && selectedCustomerStore && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-card modal-content" style={{ maxWidth: '600px', width: '100%', padding: '2rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setShowRegistrationStore(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.05)', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}><X size={20} /></button>
            
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
                {selectedCustomerStore.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedCustomerStore.name}</h2>
                <span style={{ padding: '4px 12px', borderRadius: '100px', backgroundColor: '#f1f5f9', color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Cliente do Site</span>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '1.25rem' }}>
              <div className="modal-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                    <Mail size={14} /> E-mail
                  </div>
                  <div style={{ fontWeight: 700, wordBreak: 'break-all', fontSize: '0.9rem' }}>{selectedCustomerStore.email}</div>
                </div>
                <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                    <Phone size={14} /> Telefone
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{selectedCustomerStore.phone || 'Não informado'}</div>
                </div>
              </div>

              <div className="modal-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                    <Calendar size={14} /> Cliente desde
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{new Date(selectedCustomerStore.created_at).toLocaleDateString()}</div>
                </div>
                <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                    <Hash size={14} /> ID do Sistema
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>#{selectedCustomerStore.id.slice(0, 8).toUpperCase()}</div>
                </div>
              </div>

              <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  <MapPin size={14} /> Localização Principal
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: selectedCustomerStore.address || (customerOrdersStore && customerOrdersStore.find((o: any) => o.status.includes('| Endereço:'))) ? 'var(--foreground)' : 'var(--muted)', fontStyle: selectedCustomerStore.address || (customerOrdersStore && customerOrdersStore.find((o: any) => o.status.includes('| Endereço:'))) ? 'normal' : 'italic' }}>
                  {selectedCustomerStore.address || (customerOrdersStore && customerOrdersStore.find((o: any) => o.status.includes('| Endereço:')) ? customerOrdersStore.find((o: any) => o.status.includes('| Endereço:')).status.split('| Endereço:')[1].trim() : 'Endereço não cadastrado neste perfil.')}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }} className="modal-actions">
              <button onClick={() => viewHistoryStore(selectedCustomerStore)} style={{ flex: 1, minWidth: '140px', padding: '0.85rem', borderRadius: '12px', border: 'none', backgroundColor: 'var(--primary)', color: 'white', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <ShoppingBag size={18} />
                Ver Pedidos
              </button>
              <button onClick={() => setShowRegistrationStore(false)} style={{ padding: '0.85rem 1.5rem', borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'white', color: 'var(--foreground)', fontWeight: 700, cursor: 'pointer', flex: '1 0 auto' }}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {showHistoryStore && selectedCustomerStore && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-card modal-content" style={{ maxWidth: '800px', width: '100%', padding: '2rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setShowHistoryStore(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.05)', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}><X size={20} /></button>
            
            {!showOrderDetailsStore ? (
              <>
                <div style={{ marginBottom: '2rem', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700 }}>Histórico do Cliente</span>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{selectedCustomerStore.name}</h2>
                  <p style={{ color: 'var(--muted)', margin: 0 }}>{selectedCustomerStore.email}</p>
                </div>

                <div style={{ display: 'grid', gap: '1.25rem' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}><ShoppingBag size={18}/> Pedidos Realizados</h4>
                  
                  {historyLoadingStore ? (
                    <div style={{ padding: '3rem', textAlign: 'center' }}><Loader2 className="animate-spin" /></div>
                  ) : customerOrdersStore.length > 0 ? (
                    customerOrdersStore.map((order: any) => (
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
                            onClick={() => viewOrderDetailsStore(order)}
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
                      <p>Este cliente ainda não realizou pedidos no site.</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div>
                <button 
                  onClick={() => setShowOrderDetailsStore(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', marginBottom: '1.5rem', padding: 0 }}
                >
                  <ChevronLeft size={18} /> Voltar ao histórico
                </button>

                <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700 }}>Detalhes do Pedido</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>#{selectedOrderStore.order_number || selectedOrderStore.id.slice(0, 8).toUpperCase()}</h2>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '8px', 
                        fontSize: '0.7rem', 
                        fontWeight: 800, 
                        backgroundColor: `${getStatusColor(selectedOrderStore.status)}15`,
                        color: getStatusColor(selectedOrderStore.status),
                        textTransform: 'uppercase',
                        border: `1px solid ${getStatusColor(selectedOrderStore.status)}25`
                      }}>
                        {selectedOrderStore.status.split('|')[0].trim()}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '1.25rem', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f1f5f9', borderRadius: '12px' }}>
                    <Calendar size={18} color="var(--muted)" style={{ flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>Data do Pedido</div>
                      <div style={{ fontWeight: 700 }}>{new Date(selectedOrderStore.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f1f5f9', borderRadius: '12px' }}>
                    <CreditCard size={18} color="var(--muted)" style={{ flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>Pagamento</div>
                      <div style={{ fontWeight: 700 }}>{selectedOrderStore.payment_method || (selectedOrderStore.status.includes('WhatsApp') ? 'WhatsApp' : selectedOrderStore.status.includes('Pix') ? 'Pix' : selectedOrderStore.status.includes('Boleto') ? 'Boleto Bancário' : 'Cartão de Crédito (Simulado)')}</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f1f5f9', borderRadius: '12px' }}>
                    <MapPin size={18} color="var(--muted)" style={{ flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>Endereço de Entrega</div>
                      <div style={{ fontWeight: 700 }}>{selectedOrderStore.address || (selectedOrderStore.status.includes('| Endereço:') ? selectedOrderStore.status.split('| Endereço:')[1].trim() : 'Endereço não cadastrado neste pedido.')}</div>
                    </div>
                  </div>
                </div>

                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}><Package size={18}/> Itens</h4>
                
                <div style={{ display: 'grid', gap: '1rem', marginBottom: '2.5rem' }}>
                  {detailsLoadingStore ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}><Loader2 className="animate-spin" /></div>
                  ) : selectedOrderStore.items?.length > 0 ? (
                    selectedOrderStore.items.map((item: any, idx: number) => (
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
                      R$ {parseFloat(selectedOrderStore.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          MODALS FOR TAB 2: SERVICE CLIENTS
         ---------------------------------------------------- */}
      {showDetailsModalService && selectedClientService && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-card modal-content" style={{ maxWidth: '800px', width: '100%', padding: '2rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setShowDetailsModalService(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.05)', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}><X size={20} /></button>
            
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
                {selectedClientService.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>{selectedClientService.name}</h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>CPF/CNPJ: {selectedClientService.document || 'Não cadastrado'}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>Informações de Contato</span>
                <p style={{ margin: '0.5rem 0 0', fontWeight: 600, fontSize: '0.9rem' }}>E-mail: {selectedClientService.email || 'Não informado'}</p>
                <p style={{ margin: '0.25rem 0 0', fontWeight: 600, fontSize: '0.9rem' }}>Telefone: {selectedClientService.phone || 'Não informado'}</p>
              </div>
              <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>Endereço Completo</span>
                <p style={{ margin: '0.5rem 0 0', fontWeight: 600, fontSize: '0.9rem', lineHeight: '1.4' }}>{selectedClientService.address || 'Endereço não informado.'}</p>
              </div>
            </div>

            {/* Invoices List */}
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FileText size={18} /> Faturas e Cobranças</h3>
                <button onClick={handleOpenCreateInvoiceService} style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
                  + Nova Fatura
                </button>
              </div>

              {invoicesLoadingService ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}><Loader2 className="animate-spin" /></div>
              ) : clientInvoicesService.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--input-bg)', borderRadius: '12px', border: '1px dashed var(--border)', color: 'var(--muted)', fontSize: '0.9rem' }}>
                  Nenhuma fatura avulsa gerada para este cliente.
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {clientInvoicesService.map((inv) => (
                    <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '12px', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ minWidth: '200px', flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{inv.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                          Vence em: {new Date(inv.due_date).toLocaleDateString()} {inv.description && `• ${inv.description}`}
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ fontWeight: 800 }}>R$ {inv.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        
                        {inv.status === 'pending' && (
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            <button 
                              onClick={() => {
                                const faturaUrl = getAbsoluteUrl(store.subdomain, `/fatura/${inv.id}`)
                                navigator.clipboard.writeText(faturaUrl)
                                toast.success('Link de pagamento copiado!')
                              }}
                              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', background: 'white', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', color: 'var(--primary)' }}
                              title="Copiar Link de Pagamento"
                            >
                              <Link2 size={14} />
                              <span>Link</span>
                            </button>
                            
                            {selectedClientService.phone && (
                              <button 
                                onClick={() => {
                                  const faturaUrl = getAbsoluteUrl(store.subdomain, `/fatura/${inv.id}`)
                                  const text = encodeURIComponent(
                                    `Olá, ${selectedClientService.name}! Segue o link para pagamento da fatura *${inv.title}* no valor de R$ ${inv.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.\n\n` +
                                    `Acesse o link seguro para efetuar o pagamento via Pix ou Cartão: ${faturaUrl}`
                                  )
                                  const phoneClean = selectedClientService.phone.replace(/\D/g, '')
                                  const ddi = phoneClean.startsWith('55') ? '' : '55'
                                  window.open(`https://wa.me/${ddi}${phoneClean}?text=${text}`, '_blank')
                                }}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', background: '#25D366', border: 'none', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', color: 'white' }}
                                title="Enviar Cobrança por WhatsApp"
                              >
                                <MessageSquare size={14} />
                                <span>WhatsApp</span>
                              </button>
                            )}
                          </div>
                        )}

                        <div>
                          {inv.status === 'paid' ? (
                            <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.2)' }}>PAGO</span>
                          ) : inv.status === 'cancelled' ? (
                            <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>CANCELADO</span>
                          ) : (
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                              <button onClick={() => handleUpdateInvoiceStatusService(inv.id, 'paid')} style={{ padding: '3px 8px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>Pagar</button>
                              <button onClick={() => handleUpdateInvoiceStatusService(inv.id, 'cancelled')} style={{ padding: '3px 8px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>Cancelar</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDetailsModalService(false)} style={{ padding: '0.75rem 2rem', background: 'white', border: '1px solid var(--border)', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
                Fechar Detalhes
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddEditModalService && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-card modal-content" style={{ maxWidth: '550px', width: '100%', padding: '2rem', position: 'relative' }}>
            <button onClick={() => setShowAddEditModalService(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.05)', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}><X size={20} /></button>
            
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={24} color="var(--primary)" />
              {clientFormService.id ? 'Editar Cliente de Serviço' : 'Cadastrar Cliente de Serviço'}
            </h2>

            <form onSubmit={handleSaveClientService} style={{ display: 'grid', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>Nome Completo *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Nome do cliente..." 
                  value={clientFormService.name} 
                  onChange={e => setClientFormService({ ...clientFormService, name: e.target.value })} 
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--input-bg)', color: 'var(--foreground)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>E-mail</label>
                  <input 
                    type="email" 
                    placeholder="email@dominio.com" 
                    value={clientFormService.email} 
                    onChange={e => setClientFormService({ ...clientFormService, email: e.target.value })} 
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--input-bg)', color: 'var(--foreground)' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>Telefone</label>
                  <input 
                    type="text" 
                    placeholder="(99) 99999-9999" 
                    value={clientFormService.phone} 
                    onChange={e => setClientFormService({ ...clientFormService, phone: e.target.value })} 
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--input-bg)', color: 'var(--foreground)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>CPF / CNPJ (Documento)</label>
                <input 
                  type="text" 
                  placeholder="000.000.000-00" 
                  value={clientFormService.document} 
                  onChange={e => setClientFormService({ ...clientFormService, document: e.target.value })} 
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--input-bg)', color: 'var(--foreground)' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>Endereço Completo</label>
                <input 
                  type="text" 
                  placeholder="Rua, Número, Bairro, Cidade/UF..." 
                  value={clientFormService.address} 
                  onChange={e => setClientFormService({ ...clientFormService, address: e.target.value })} 
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--input-bg)', color: 'var(--foreground)' }}
                />
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                <button type="submit" style={{ flex: 1, padding: '0.75rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
                  Salvar Cliente
                </button>
                <button type="button" onClick={() => setShowAddEditModalService(false)} style={{ padding: '0.75rem 1.5rem', background: 'white', border: '1px solid var(--border)', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showInvoiceModalService && selectedClientService && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1rem' }}>
          <div className="glass-card modal-content" style={{ maxWidth: '500px', width: '100%', padding: '2rem', position: 'relative' }}>
            <button onClick={() => setShowInvoiceModalService(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.05)', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}><X size={20} /></button>
            
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={22} color="var(--primary)" /> Nova Fatura
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Gerando cobrança avulsa para <strong>{selectedClientService.name}</strong>.</p>

            <form onSubmit={handleSaveInvoiceService} style={{ display: 'grid', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>Título da Cobrança *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Honorários Mensais, Prestação de Serviços..." 
                  value={invoiceFormService.title} 
                  onChange={e => setInvoiceFormService({ ...invoiceFormService, title: e.target.value })} 
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--input-bg)', color: 'var(--foreground)' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>Descrição (Opcional)</label>
                <input 
                  type="text" 
                  placeholder="Detalhes adicionais sobre a cobrança..." 
                  value={invoiceFormService.description} 
                  onChange={e => setInvoiceFormService({ ...invoiceFormService, description: e.target.value })} 
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
                    value={invoiceFormService.amount} 
                    onChange={e => setInvoiceFormService({ ...invoiceFormService, amount: e.target.value })} 
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--input-bg)', color: 'var(--foreground)' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>Data de Vencimento *</label>
                  <input 
                    type="date" 
                    required
                    value={invoiceFormService.due_date} 
                    onChange={e => setInvoiceFormService({ ...invoiceFormService, due_date: e.target.value })} 
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--input-bg)', color: 'var(--foreground)', cursor: 'pointer' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>Status Inicial</label>
                <select 
                  value={invoiceFormService.status} 
                  onChange={e => setInvoiceFormService({ ...invoiceFormService, status: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--input-bg)', color: 'var(--foreground)', outline: 'none' }}
                >
                  <option value="pending" style={{color:'#000'}}>Pendente (A vencer)</option>
                  <option value="paid" style={{color:'#000'}}>Pago (Lançar como recebido)</option>
                </select>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                <button type="submit" disabled={invoiceSubmittingService} style={{ flex: 1, padding: '0.75rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: invoiceSubmittingService ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {invoiceSubmittingService ? <Loader2 className="animate-spin" size={18} /> : 'Gerar Fatura'}
                </button>
                <button type="button" onClick={() => setShowInvoiceModalService(false)} style={{ padding: '0.75rem 1.5rem', background: 'white', border: '1px solid var(--border)', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STYLES */}
      <style>{`
        .btn-secondary { background: white; border: 1px solid var(--border); border-radius: 12px; color: var(--foreground); cursor: pointer; font-weight: 600; transition: 0.2s; }
        .btn-secondary:hover { background: #f8fafc; border-color: #cbd5e1; }
        .table-row:hover { background-color: #fcfcfc; }
        .table-row-hover:hover { background-color: rgba(99, 102, 241, 0.02) !important; }
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
