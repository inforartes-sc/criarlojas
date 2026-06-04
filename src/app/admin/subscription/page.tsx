"use client"

import { useState, useEffect } from 'react'
import { 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  DollarSign, 
  Calendar, 
  ShieldCheck, 
  Copy, 
  ExternalLink, 
  Loader2, 
  Sparkles, 
  FileText,
  X,
  Check,
  AlertTriangle,
  Eye,
  Printer
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { useAdminAuth } from '@/context/AdminAuthContext'

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(true)
  const [store, setStore] = useState<any>(null)
  const [invoices, setInvoices] = useState<any[]>([])
  const [customInvoices, setCustomInvoices] = useState<any[]>([])
  const [plansList, setPlansList] = useState<any[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showReactivateModal, setShowReactivateModal] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [processingCancel, setProcessingCancel] = useState(false)
  const [processingReactivate, setProcessingReactivate] = useState(false)
  const [copiedPix, setCopiedPix] = useState(false)
  const [selectedCustomInv, setSelectedCustomInv] = useState<any>(null)
  const [showCustomDetailsModal, setShowCustomDetailsModal] = useState(false)
  const [gatewayConfig, setGatewayConfig] = useState<any>(null)

  // Função para gerar o payload PIX Estático (padrão EMV BR Code) com CRC16
  const generatePixPayload = (pixKey: string, amount: number) => {
    const key = (pixKey || 'financeiro@criarlojas.com.br').trim()
    const amt = amount.toFixed(2)
    
    const pixGui = 'br.gov.bcb.pix'
    const pixKeyInfo = `01${String(key.length).padStart(2, '0')}${key}`
    const merchantAccountInfo = `0014${pixGui}${pixKeyInfo}`
    
    const merchantName = 'Criar Lojas SaaS'
    const merchantCity = 'SAO PAULO'
    
    let payload = '000201' // Payload Indicator
    payload += '010211'   // Point of Initiation (11 = estático)
    payload += `26${String(merchantAccountInfo.length).padStart(2, '0')}${merchantAccountInfo}`
    payload += '52040000' // Merchant Category Code
    payload += '5303986'  // Currency Code (BRL)
    payload += `54${String(amt.length).padStart(2, '0')}${amt}` // Transaction Amount
    payload += '5802BR'   // Country Code
    payload += `59${String(merchantName.length).padStart(2, '0')}${merchantName}` // Merchant Name
    payload += `60${String(merchantCity.length).padStart(2, '0')}${merchantCity}` // Merchant City
    payload += '62070503***' // Additional Data Field
    payload += '6304'      // CRC16 Indicator
    
    // Cálculo do CRC16 CCITT
    let crc = 0xFFFF
    for (let c = 0; c < payload.length; c++) {
      let code = payload.charCodeAt(c)
      crc ^= (code << 8)
      for (let i = 0; i < 8; i++) {
        if (crc & 0x8000) {
          crc = (crc << 1) ^ 0x1021
        } else {
          crc = crc << 1
        }
      }
    }
    crc = crc & 0xFFFF
    const crcHex = crc.toString(16).toUpperCase().padStart(4, '0')
    
    return payload + crcHex
  }

  // Estado para o formulário de cancelamento
  const [cancelData, setCancelData] = useState({
    reason: 'Fechamento da loja',
    notes: ''
  })

  const { store: authStore } = useAdminAuth()

  useEffect(() => {
    if (authStore?.id) {
      fetchSubscriptionData()
    }
  }, [authStore])

  const fetchSubscriptionData = async () => {
    if (!authStore?.id) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', authStore.id)
        .single()

      if (error) throw error

      setStore(data)
      const s = data.settings || {}
      const paidInvoices = s.paid_invoices || {}

      // Buscar os planos configurados de platform-settings
      const { data: platformData, error: platformError } = await supabase
        .from('stores')
        .select('settings')
        .eq('subdomain', 'platform-settings')
        .single()

      let activePlans = []
      if (!platformError && platformData && platformData.settings?.plans) {
        activePlans = platformData.settings.plans
      }
      setPlansList(activePlans)

      if (platformData?.settings?.gatewayConfig) {
        setGatewayConfig(platformData.settings.gatewayConfig)
      }

      // Determina o plano atual
      const planCode = s.plan || 'pro'
      const matchedPlan = activePlans.find((p: any) => p.id === planCode)

      const planName = matchedPlan ? matchedPlan.name : (planCode === 'premium' ? 'Premium Ilimitado' : planCode === 'pro' ? 'Plano Profissional' : 'Plano Básico')
      const amountVal = matchedPlan ? Number(matchedPlan.price) : (planCode === 'premium' ? 299.00 : planCode === 'pro' ? 149.00 : 49.00)

      // Gera lista de faturas do lojista
      const generatedInvoices = [
        {
          id: 'INV-2026-003',
          month: 'Maio / 2026',
          dueDate: '15/05/2026',
          amount: amountVal,
          status: paidInvoices['INV-2026-003'] ? 'paid' : 'pending',
          paidAt: paidInvoices['INV-2026-003']?.paidAt || null,
          paymentMethod: paidInvoices['INV-2026-003']?.paymentMethod || 'PIX'
        },
        {
          id: 'INV-2026-002',
          month: 'Abril / 2026',
          dueDate: '15/04/2026',
          amount: amountVal,
          status: paidInvoices['INV-2026-002'] ? 'paid' : 'paid',
          paidAt: paidInvoices['INV-2026-002']?.paidAt || '15/04/2026 14:20',
          paymentMethod: paidInvoices['INV-2026-002']?.paymentMethod || 'PIX'
        },
        {
          id: 'INV-2026-001',
          month: 'Março / 2026',
          dueDate: '15/03/2026',
          amount: amountVal,
          status: paidInvoices['INV-2026-001'] ? 'paid' : 'paid',
          paidAt: paidInvoices['INV-2026-001']?.paidAt || '15/03/2026 11:45',
          paymentMethod: paidInvoices['INV-2026-001']?.paymentMethod || 'Cartão de Crédito'
        }
      ]

      setInvoices(generatedInvoices)

      // Buscar faturas avulsas (custom_invoices)
      const { data: customData, error: customError } = await supabase
        .from('custom_invoices')
        .select('*')
        .eq('store_id', authStore.id)
        .order('created_at', { ascending: false })

      if (customError) {
        console.warn('Erro ao buscar faturas avulsas:', customError.message)
      } else {
        setCustomInvoices(customData || [])
      }
    } catch (error: any) {
      console.error('Erro ao buscar dados da assinatura:', error.message)
      toast.error('Erro ao carregar informações do plano.')
    } finally {
      setLoading(false)
    }
  }

  // Confirmar pagamento da fatura (Simulação / Envio de Comprovante)
  const handleConfirmPayment = async () => {
    if (!selectedInvoice) return

    setProcessingPayment(true)
    try {
      const nowStr = new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

      if (selectedInvoice.isCustom) {
        const { error } = await supabase
          .from('custom_invoices')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
            payment_method: 'PIX'
          })
          .eq('id', selectedInvoice.id)

        if (error) throw error

        setCustomInvoices(prev => prev.map(inv => {
          if (inv.id === selectedInvoice.id) {
            return { ...inv, status: 'paid', paid_at: new Date().toISOString(), payment_method: 'PIX' }
          }
          return inv
        }))
        toast.success('Pagamento de serviço adicional confirmado com sucesso!')
        setShowPaymentModal(false)
        return
      }

      const currentSettings = store.settings || {}
      const currentPaid = currentSettings.paid_invoices || {}

      const updatedSettings = {
        ...currentSettings,
        paid_invoices: {
          ...currentPaid,
          [selectedInvoice.id]: {
            paidAt: nowStr,
            paymentMethod: 'PIX'
          }
        }
      }

      const { error } = await supabase
        .from('stores')
        .update({ settings: updatedSettings })
        .eq('id', store.id)

      if (error) throw error

      // Atualiza o estado local
      setInvoices(prev => prev.map(inv => {
        if (inv.id === selectedInvoice.id) {
          return { ...inv, status: 'paid', paidAt: nowStr, paymentMethod: 'PIX' }
        }
        return inv
      }))

      setStore({ ...store, settings: updatedSettings })
      toast.success('Pagamento confirmado com sucesso! Fatura quitada.')
      setShowPaymentModal(false)
    } catch (error: any) {
      console.error('Erro ao confirmar pagamento:', error.message)
      toast.error('Erro ao registrar pagamento no banco de dados.')
    } finally {
      setProcessingPayment(false)
    }
  }

  // Enviar solicitação de cancelamento de plano
  const handleRequestCancellation = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessingCancel(true)
    try {
      const currentSettings = store.settings || {}
      const updatedSettings = {
        ...currentSettings,
        is_pending_cancellation: true,
        cancellation_reason: cancelData.reason,
        cancellation_notes: cancelData.notes,
        cancellation_request_date: new Date().toISOString()
      }

      const { error } = await supabase
        .from('stores')
        .update({ settings: updatedSettings })
        .eq('id', store.id)

      if (error) throw error

      setStore({ ...store, settings: updatedSettings })
      toast.success('Solicitação de cancelamento enviada com sucesso para a equipe administrativa.')
      setShowCancelModal(false)
    } catch (error: any) {
      console.error('Erro ao solicitar cancelamento:', error.message)
      toast.error('Erro ao enviar solicitação de cancelamento.')
    } finally {
      setProcessingCancel(false)
    }
  }

  // Desistir do cancelamento / Reativar assinatura
  const handleReactivateSubscription = async () => {
    setProcessingReactivate(true)
    try {
      const currentSettings = store.settings || {}
      const updatedSettings = {
        ...currentSettings,
        is_pending_cancellation: false,
        cancellation_reason: null,
        cancellation_notes: null,
        cancellation_request_date: null
      }

      const { error } = await supabase
        .from('stores')
        .update({ settings: updatedSettings })
        .eq('id', store.id)

      if (error) throw error

      setStore({ ...store, settings: updatedSettings })
      toast.success('Assinatura reativada com sucesso! O cancelamento foi anulado.')
      setShowReactivateModal(false)
    } catch (error: any) {
      console.error('Erro ao reativar plano:', error.message)
      toast.error('Erro ao reativar a assinatura.')
    } finally {
      setProcessingReactivate(false)
    }
  }

  const handleCopyPix = (pixCode: string) => {
    navigator.clipboard.writeText(pixCode)
    setCopiedPix(true)
    toast.success('PIX Copia e Cola copiado!')
    setTimeout(() => setCopiedPix(false), 3000)
  }

  if (loading) {
    return (
      <div style={{ padding: '5rem', textAlign: 'center' }}>
        <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto', color: '#0ea5e9' }} />
        <p style={{ marginTop: '1rem', color: 'var(--muted)' }}>Carregando módulo financeiro e detalhes do plano...</p>
      </div>
    )
  }

  const s = store?.settings || {}
  const planCode = s.plan || 'pro'
  const matchedPlan = plansList.find((p: any) => p.id === planCode)
  const planName = matchedPlan ? matchedPlan.name : (planCode === 'premium' ? 'Premium Ilimitado' : planCode === 'pro' ? 'Plano Profissional' : 'Plano Básico')
  const amountVal = matchedPlan ? Number(matchedPlan.price) : (planCode === 'premium' ? 299.00 : planCode === 'pro' ? 149.00 : 49.00)
  const isPendingCancel = s.is_pending_cancellation === true

  return (
    <div className="subscription-container" style={{ maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '0 1rem' }}>
      <style>{`
        @media (max-width: 768px) {
          .sub-header {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 1.25rem;
            margin-bottom: 2rem !important;
          }
          .sub-header h1 {
            font-size: 1.75rem !important;
            flex-wrap: wrap;
            row-gap: 0.5rem;
          }
          .btn-upgrade {
            width: 100%;
            justify-content: center;
          }
          .plan-card-outer {
            padding: 1.5rem !important;
            margin-bottom: 2rem !important;
          }
          .plan-grid-container {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .plan-stats-grid {
            grid-template-columns: 1fr !important;
            gap: 1.25rem !important;
            padding-top: 1.5rem !important;
          }
          .plan-status-card {
            min-width: 100% !important;
            padding: 1.5rem !important;
          }
          .invoice-table-header {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 0.5rem;
            padding: 1.5rem !important;
          }
          .invoice-table-container {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          .invoice-table {
            min-width: 750px;
          }
          .sub-footer {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 1.25rem;
          }
          .btn-cancel-plan, .btn-reactivate-plan {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <header className="sub-header" style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            Assinatura & Faturas
            {isPendingCancel ? (
              <span style={{ fontSize: '0.75rem', padding: '0.35rem 0.85rem', borderRadius: '20px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <AlertTriangle size={14} />
                Cancelamento Solicitado
              </span>
            ) : (
              <span style={{ fontSize: '0.75rem', padding: '0.35rem 0.85rem', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <ShieldCheck size={14} />
                Assinatura Ativa
              </span>
            )}
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem', margin: '0.25rem 0 0 0' }}>
            Gerencie as mensalidades, faturas em aberto e detalhes do seu plano contratado na plataforma Criar Lojas.
          </p>
        </div>

        <button 
          onClick={() => setShowPlanModal(true)}
          style={{ padding: '0.85rem 1.75rem', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(14, 165, 233, 0.3)', transition: 'all 0.2s' }}
          className="btn-upgrade"
        >
          <Sparkles size={18} />
          <span>Mudar de Plano</span>
        </button>
      </header>

      {/* CARD DO PLANO ATUAL (GLASSMORPHISM) */}
      <div className="plan-card-outer" style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.8))', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px', padding: '3rem', marginBottom: '3rem', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, background: 'linear-gradient(270deg, rgba(14, 165, 233, 0.2), transparent)', width: '300px', height: '100%', pointerEvents: 'none' }} />
        
        <div className="plan-grid-container" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2rem', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#0ea5e9', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={16} />
              <span>Plano Contratado</span>
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 0.5rem 0' }}>{planName}</h2>
            <p style={{ color: '#94a3b8', fontSize: '1.05rem', margin: '0 0 2rem 0', maxWidth: '600px', lineHeight: 1.5 }}>
              Você está aproveitando todos os recursos avançados de e-commerce, infraestrutura em nuvem dedicada e taxa reduzida de transação.
            </p>

            <div className="plan-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '2rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Valor da Mensalidade</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>R$ {amountVal.toFixed(2)} <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 500 }}>/mês</span></span>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Próximo Vencimento</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={18} />
                  15/06/2026
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Forma de Pagamento</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0ea5e9' }}>PIX / Boleto</span>
              </div>
            </div>
          </div>

          <div className="plan-status-card" style={{ background: 'rgba(9, 13, 22, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '20px', padding: '2.5rem', textAlign: 'center', minWidth: '260px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: isPendingCancel ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', color: isPendingCancel ? '#ef4444' : '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', border: isPendingCancel ? '2px solid rgba(239, 68, 68, 0.3)' : '2px solid rgba(16, 185, 129, 0.3)' }}>
              {isPendingCancel ? <AlertTriangle size={32} /> : <ShieldCheck size={32} />}
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 0.5rem 0' }}>{isPendingCancel ? 'Cancelamento em Análise' : 'Status Premium'}</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 1.5rem 0' }}>{isPendingCancel ? 'Sua solicitação foi enviada à equipe.' : 'Sua loja está operando com 100% de performance.'}</p>
            <div style={{ padding: '0.5rem 1rem', background: isPendingCancel ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: isPendingCancel ? '#ef4444' : '#10b981', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, border: isPendingCancel ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)' }}>
              {isPendingCancel ? 'Aguardando Contato' : 'Renovação Automática Ativa'}
            </div>
            {isPendingCancel && (
              <button
                onClick={() => setShowReactivateModal(true)}
                style={{ marginTop: '1.25rem', width: '100%', padding: '0.65rem 1rem', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)', transition: 'all 0.2s' }}
                className="btn-reactivate"
              >
                <ShieldCheck size={16} />
                <span>Desistir do Cancelamento</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SEÇÃO DE FATURAS E HISTÓRICO */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', marginBottom: '3rem' }}>
        <div className="invoice-table-header" style={{ padding: '2rem 2.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileText size={24} color="#0ea5e9" />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--foreground)' }}>Faturas & Histórico de Pagamentos</h2>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>Ciclo de faturamento dia 15 de cada mês</span>
        </div>

        <div className="invoice-table-container">
          <table className="invoice-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255, 255, 255, 0.02)' }}>
                <th style={{ padding: '1.25rem 2.5rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)' }}>FATURA / REFERÊNCIA</th>
                <th style={{ padding: '1.25rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)' }}>VENCIMENTO</th>
                <th style={{ padding: '1.25rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)' }}>VALOR</th>
                <th style={{ padding: '1.25rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)' }}>STATUS</th>
                <th style={{ padding: '1.25rem 2.5rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', textAlign: 'right' }}>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} style={{ borderBottom: '1px solid var(--border)' }} className="invoice-row">
                  <td style={{ padding: '1.5rem 2.5rem' }}>
                    <div style={{ fontWeight: 800, color: 'var(--foreground)', fontSize: '1rem' }}>{inv.month}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>{inv.id}</div>
                  </td>
                  <td style={{ padding: '1.5rem 1rem', fontWeight: 600, color: 'var(--foreground)', fontSize: '0.95rem' }}>
                    {inv.dueDate}
                  </td>
                  <td style={{ padding: '1.5rem 1rem', fontWeight: 800, color: '#0ea5e9', fontSize: '1.05rem' }}>
                    R$ {inv.amount.toFixed(2)}
                  </td>
                  <td style={{ padding: '1.5rem 1rem' }}>
                    {inv.status === 'paid' ? (
                      <div>
                        <span style={{ padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <CheckCircle2 size={12} />
                          Pago
                        </span>
                        {inv.paidAt && <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.25rem', fontWeight: 500 }}>{inv.paidAt}</div>}
                      </div>
                    ) : (
                      <span style={{ padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} />
                        Pendente
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '1.5rem 2.5rem', textAlign: 'right' }}>
                    {inv.status === 'paid' ? (
                      <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>Fatura Quitada</span>
                    ) : (
                      <button
                        onClick={() => { setSelectedInvoice(inv); setShowPaymentModal(true); }}
                        style={{ padding: '0.65rem 1.25rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)', transition: 'all 0.2s' }}
                        className="btn-pay"
                      >
                        <DollarSign size={16} />
                        <span>Pagar Fatura</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
 
      {/* SEÇÃO DE COBRANÇAS AVULSAS / SERVIÇOS ADICIONAIS */}
      {customInvoices.length > 0 && (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', marginBottom: '3rem' }}>
          <div className="invoice-table-header" style={{ padding: '2rem 2.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Sparkles size={24} color="#a855f7" />
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--foreground)' }}>Serviços & Cobranças Adicionais (Avulsos)</h2>
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>Cobranças únicas de serviços sob demanda</span>
          </div>

          <div className="invoice-table-container">
            <table className="invoice-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255, 255, 255, 0.02)' }}>
                  <th style={{ padding: '1.25rem 2.5rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)' }}>SERVIÇO / DETALHES</th>
                  <th style={{ padding: '1.25rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)' }}>VENCIMENTO</th>
                  <th style={{ padding: '1.25rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)' }}>VALOR</th>
                  <th style={{ padding: '1.25rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)' }}>STATUS</th>
                  <th style={{ padding: '1.25rem 2.5rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', textAlign: 'right' }}>AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {customInvoices.map(inv => (
                  <tr key={inv.id} style={{ borderBottom: '1px solid var(--border)' }} className="invoice-row">
                    <td style={{ padding: '1.5rem 2.5rem' }}>
                      <div style={{ fontWeight: 800, color: 'var(--foreground)', fontSize: '1rem' }}>{inv.title}</div>
                      {inv.description && <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>{inv.description}</div>}
                    </td>
                    <td style={{ padding: '1.5rem 1rem', fontWeight: 600, color: 'var(--foreground)', fontSize: '0.95rem' }}>
                      {inv.due_date}
                    </td>
                    <td style={{ padding: '1.5rem 1rem', fontWeight: 800, color: '#a855f7', fontSize: '1.05rem' }}>
                      R$ {inv.amount.toFixed(2)}
                    </td>
                    <td style={{ padding: '1.5rem 1rem' }}>
                      {inv.status === 'paid' ? (
                        <div>
                          <span style={{ padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <CheckCircle2 size={12} />
                            Pago
                          </span>
                          {inv.paid_at && <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.25rem', fontWeight: 500 }}>{new Date(inv.paid_at).toLocaleDateString('pt-BR')}</div>}
                        </div>
                      ) : inv.status === 'cancelled' ? (
                        <span style={{ padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <X size={12} />
                          Cancelado
                        </span>
                      ) : (
                        <span style={{ padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={12} />
                          Pendente
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1.5rem 2.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {inv.status === 'pending' ? (
                          <button
                            onClick={() => {
                              setSelectedInvoice({
                                id: inv.id,
                                month: inv.title,
                                amount: inv.amount,
                                isCustom: true
                              });
                              setShowPaymentModal(true);
                            }}
                            style={{ padding: '0.65rem 1.25rem', background: '#a855f7', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)', transition: 'all 0.2s' }}
                            className="btn-pay"
                          >
                            <DollarSign size={16} />
                            <span>Pagar Serviço</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>
                            {inv.status === 'paid' ? 'Serviço Ativo / Pago' : 'Cobrança Cancelada'}
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => { setSelectedCustomInv(inv); setShowCustomDetailsModal(true); }}
                          title="Visualizar Detalhes"
                          style={{ padding: '0.5rem', background: 'var(--input-bg)', color: 'var(--foreground)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                          className="btn-action"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RODAPÉ DO MÓDULO COM BOTÃO DE CANCELAMENTO / REATIVAÇÃO */}
      <div className="sub-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {isPendingCancel ? (
          <>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--foreground)', margin: '0 0 0.25rem 0' }}>Decidiu continuar conosco?</h4>
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: 0 }}>Você pode cancelar sua solicitação de encerramento e reativar sua assinatura imediatamente.</p>
            </div>
            <button
              onClick={() => setShowReactivateModal(true)}
              style={{ padding: '0.75rem 1.5rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
              className="btn-reactivate-plan"
            >
              <ShieldCheck size={16} />
              <span>Desistir do Cancelamento (Reativar Plano)</span>
            </button>
          </>
        ) : (
          <>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--foreground)', margin: '0 0 0.25rem 0' }}>Precisa encerrar suas atividades?</h4>
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: 0 }}>Você pode solicitar o cancelamento da sua assinatura a qualquer momento sem multas.</p>
            </div>
            <button
              onClick={() => setShowCancelModal(true)}
              style={{ padding: '0.75rem 1.5rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
              className="btn-cancel-plan"
            >
              <AlertTriangle size={16} />
              <span>Solicitar Cancelamento do Plano</span>
            </button>
          </>
        )}
      </div>

      {/* MODAL DE PAGAMENTO (PIX) */}
      {showPaymentModal && selectedInvoice && (() => {
        const pixKey = gatewayConfig?.pixKey || 'financeiro@criarlojas.com.br'
        const isSandbox = gatewayConfig?.sandboxMode !== false // Padrão para sandbox se não configurado
        const pixCode = generatePixPayload(pixKey, selectedInvoice.amount)
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(pixCode)}`

        return (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(9, 13, 22, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 30px 60px rgba(0,0,0,0.6), 0 0 50px rgba(16, 185, 129, 0.15)', backdropFilter: 'blur(20px)' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.02)' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0, color: '#f8fafc', letterSpacing: '-0.5px' }}>Pagamento da Mensalidade</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.8rem', margin: '0.2rem 0 0 0', fontWeight: 600 }}>Fatura {selectedInvoice.id} • {selectedInvoice.month}</p>
                </div>
                <button onClick={() => setShowPaymentModal(false)} style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex', transition: 'all 0.2s' }}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: '1.25rem 1.5rem 2.5rem 1.5rem', textAlign: 'center' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.15rem' }}>Valor a Pagar</span>
                  <span style={{ fontSize: '2.4rem', fontWeight: 900, color: '#10b981' }}>R$ {selectedInvoice.amount.toFixed(2).replace('.', ',')}</span>
                </div>

                {isSandbox ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '0.85rem', borderRadius: '12px', marginBottom: '1.25rem', textAlign: 'left' }}>
                    <AlertTriangle size={18} color="#f59e0b" style={{ flexShrink: 0 }} />
                    <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600, lineHeight: 1.4 }}>
                      ⚠️ MODO HOMOLOGAÇÃO (SANDBOX): Esta é uma fatura de testes. Clique no botão de confirmação para simular a liquidação gratuita.
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.85rem', borderRadius: '12px', marginBottom: '1.25rem', textAlign: 'left' }}>
                    <ShieldCheck size={18} color="#10b981" style={{ flexShrink: 0 }} />
                    <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, lineHeight: 1.4 }}>
                      🔒 PAGAMENTO SEGURO VIA PIX: Escaneie o QR Code abaixo ou copie a chave para efetuar a transferência. O plano é liberado assim que você confirmar.
                    </div>
                  </div>
                )}

                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '1.25rem 1rem', marginBottom: '1.25rem' }}>
                  <div style={{ width: '150px', height: '150px', background: 'white', padding: '8px', borderRadius: '12px', margin: '0 auto 1.25rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <img src={qrCodeUrl} style={{ width: '100%', height: '100%' }} alt="QR Code PIX" />
                  </div>
                  
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Pix Copia e Cola / Chave Pix:</span>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.75rem 0.85rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <span style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.8rem', color: '#0ea5e9', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left', paddingRight: '0.5rem' }}>
                      {pixKey}
                    </span>
                    <button 
                      onClick={() => handleCopyPix(pixCode)}
                      style={{ padding: '0.5rem 0.75rem', background: 'linear-gradient(135deg, #0ea5e9, #2563eb)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 800, fontSize: '0.7rem', boxShadow: '0 4px 10px rgba(14, 165, 233, 0.3)', transition: 'all 0.2s' }}
                      title="Copiar PIX Copia e Cola"
                    >
                      {copiedPix ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleConfirmPayment}
                  disabled={processingPayment}
                  style={{ width: '100%', padding: '1rem', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)', transition: 'all 0.2s', letterSpacing: '0.5px' }}
                >
                  {processingPayment ? <Loader2 className="animate-spin" size={20} /> : (isSandbox ? <Sparkles size={20} /> : <CheckCircle2 size={20} />)}
                  <span>{isSandbox ? 'Simular Pagamento (Homologação)' : 'Confirmar Pagamento Realizado'}</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL DE MUDANÇA DE PLANO (ESTILIZADO PREMIUM E VISÍVEL) */}
      {showPlanModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '24px', width: '100%', maxWidth: '650px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', animation: 'modalEnter 0.3s ease-out' }}>
            <div style={{ padding: '2rem 2.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.02)' }}>
              <div>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>Mudar Plano de Assinatura</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>Escolha o pacote ideal para impulsionar o seu negócio.</p>
              </div>
              <button onClick={() => setShowPlanModal(false)} style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', cursor: 'pointer', padding: '0.6rem', borderRadius: '50%', display: 'flex' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '2.5rem', display: 'grid', gap: '1.5rem', maxHeight: '60vh', overflowY: 'auto' }}>
              {(plansList.length > 0 ? plansList : [
                {
                  id: 'basic',
                  name: 'Plano Básico',
                  price: 49.00,
                  desc: 'Até 50 produtos • Subdomínio grátis • Suporte padrão',
                  buttonText: 'Selecionar'
                },
                {
                  id: 'pro',
                  name: 'Plano Profissional',
                  price: 149.00,
                  desc: 'Produtos ilimitados • Domínio Próprio • Suporte WhatsApp',
                  buttonText: 'Selecionar',
                  popular: true
                },
                {
                  id: 'premium',
                  name: 'Premium Ilimitado',
                  price: 299.00,
                  desc: 'Tudo do Pro + Gerente de Contas + Taxa Zero no PIX',
                  buttonText: 'Fazer Upgrade'
                }
              ]).map((plan: any) => {
                const isCurrent = store?.settings?.plan === plan.id || (!store?.settings?.plan && plan.id === 'pro')
                const isPremium = plan.id === 'premium'

                let borderStyle = '1px solid rgba(255, 255, 255, 0.15)'
                let bgStyle = 'rgba(255, 255, 255, 0.03)'
                let titleColor = '#f8fafc'
                let shadowStyle = 'none'

                if (isCurrent) {
                  borderStyle = '2px solid #0ea5e9'
                  bgStyle = 'rgba(14, 165, 233, 0.08)'
                  titleColor = '#0ea5e9'
                  shadowStyle = '0 4px 20px rgba(14, 165, 233, 0.15)'
                } else if (isPremium) {
                  borderStyle = '2px solid #10b981'
                  bgStyle = 'rgba(16, 185, 129, 0.08)'
                  titleColor = '#10b981'
                  shadowStyle = '0 4px 20px rgba(16, 185, 129, 0.15)'
                }

                return (
                  <div key={plan.id} style={{ border: borderStyle, borderRadius: '20px', padding: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: bgStyle, boxShadow: shadowStyle, transition: 'all 0.2s' }} className="plan-card">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>{plan.name}</h4>
                        {isCurrent && (
                          <span style={{ padding: '0.25rem 0.65rem', background: '#0ea5e9', color: 'white', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>Plano Atual</span>
                        )}
                        {plan.popular && !isCurrent && (
                          <span style={{ padding: '0.25rem 0.65rem', background: '#10b981', color: 'white', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>Popular</span>
                        )}
                      </div>
                      <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>{plan.desc || 'Recursos avançados para sua loja virtual.'}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: titleColor }}>R$ {Number(plan.price).toFixed(2).replace('.', ',')} <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>/mês</span></div>
                      {isCurrent ? (
                        <button disabled style={{ marginTop: '0.75rem', padding: '0.6rem 1.25rem', background: 'rgba(14, 165, 233, 0.2)', color: '#0ea5e9', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'not-allowed', fontSize: '0.85rem' }}>Em Uso</button>
                      ) : (
                        <button 
                          onClick={() => { 
                            setShowPlanModal(false); 
                            toast.success(`Solicitação de alteração para ${plan.name} enviada ao suporte!`); 
                          }} 
                          style={{ 
                            marginTop: '0.75rem', 
                            padding: '0.6rem 1.25rem', 
                            background: isPremium ? '#10b981' : 'rgba(255, 255, 255, 0.1)', 
                            color: 'white', 
                            border: isPremium ? 'none' : '1px solid rgba(255, 255, 255, 0.2)', 
                            borderRadius: '10px', 
                            fontWeight: 700, 
                            cursor: 'pointer', 
                            fontSize: '0.85rem', 
                            transition: 'all 0.2s',
                            boxShadow: isPremium ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
                          }} 
                          className={isPremium ? "btn-upgrade-modal" : "btn-select-plan"}
                        >
                          {plan.buttonText || (isPremium ? 'Fazer Upgrade' : 'Selecionar')}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE SOLICITAÇÃO DE CANCELAMENTO */}
      {showCancelModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '24px', width: '100%', maxWidth: '550px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', animation: 'modalEnter 0.3s ease-out' }}>
            <div style={{ padding: '2rem 2.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(239, 68, 68, 0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>Solicitar Cancelamento</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>Lamentamos ver você partir. Nos conte o motivo abaixo.</p>
                </div>
              </div>
              <button onClick={() => setShowCancelModal(false)} style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', cursor: 'pointer', padding: '0.6rem', borderRadius: '50%', display: 'flex' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRequestCancellation} style={{ padding: '2.5rem', display: 'grid', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.5rem' }}>Motivo Principal</label>
                <select 
                  value={cancelData.reason}
                  onChange={e => setCancelData({ ...cancelData, reason: e.target.value })}
                  style={{ width: '100%', padding: '0.85rem 1rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '12px', color: '#f8fafc', fontSize: '0.95rem', outline: 'none' }}
                >
                  <option value="Fechamento da loja" style={{ background: '#0f172a' }}>Fechamento da loja / Encerramento das atividades</option>
                  <option value="Questões financeiras" style={{ background: '#0f172a' }}>Questões financeiras / Corte de custos</option>
                  <option value="Falta de tempo" style={{ background: '#0f172a' }}>Falta de tempo para gerenciar a loja</option>
                  <option value="Mudança de plataforma" style={{ background: '#0f172a' }}>Mudança para outra plataforma</option>
                  <option value="Outros motivos" style={{ background: '#0f172a' }}>Outros motivos</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.5rem' }}>Detalhes / Comentários Adicionais (Opcional)</label>
                <textarea 
                  rows={4}
                  value={cancelData.notes}
                  onChange={e => setCancelData({ ...cancelData, notes: e.target.value })}
                  placeholder="Por favor, compartilhe qualquer feedback sobre sua experiência conosco..."
                  style={{ width: '100%', padding: '0.85rem 1rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '12px', color: '#f8fafc', fontSize: '0.95rem', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '12px', fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                ⚠️ <strong>Atenção:</strong> Ao confirmar, sua solicitação será enviada ao nosso setor financeiro. Sua loja e painel continuarão acessíveis até o final do ciclo atual pago.
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowCancelModal(false)}
                  style={{ padding: '0.85rem 1.5rem', background: 'transparent', color: '#cbd5e1', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Voltar
                </button>
                <button 
                  type="submit"
                  disabled={processingCancel}
                  style={{ padding: '0.85rem 2rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)' }}
                >
                  {processingCancel ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                  <span>Confirmar Solicitação</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE DESISTÊNCIA DO CANCELAMENTO (REATIVAÇÃO) */}
      {showReactivateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '24px', width: '100%', maxWidth: '520px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', animation: 'modalEnter 0.3s ease-out' }}>
            <div style={{ padding: '2rem 2.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(16, 185, 129, 0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>Reativar Assinatura</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>Ficamos muito felizes em ter você continuando conosco!</p>
                </div>
              </div>
              <button onClick={() => setShowReactivateModal(false)} style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', cursor: 'pointer', padding: '0.6rem', borderRadius: '50%', display: 'flex' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '2.5rem', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', border: '2px solid rgba(16, 185, 129, 0.3)' }}>
                <Sparkles size={40} />
              </div>
              
              <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1rem' }}>Confirmar Desistência de Cancelamento</h4>
              <p style={{ color: '#cbd5e1', fontSize: '0.95', lineHeight: 1.6, marginBottom: '2rem' }}>
                Ao confirmar, sua solicitação de encerramento será cancelada e sua loja continuará operando normalmente com todos os benefícios e recursos do <strong>{planName}</strong>.
              </p>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setShowReactivateModal(false)}
                  style={{ flex: 1, padding: '0.85rem 1.5rem', background: 'transparent', color: '#cbd5e1', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Voltar
                </button>
                <button 
                  type="button"
                  onClick={handleReactivateSubscription}
                  disabled={processingReactivate}
                  style={{ flex: 2, padding: '0.85rem 2rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' }}
                >
                  {processingReactivate ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                  <span>Sim, Continuar com o Plano</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes da Cobrança Avulsa (Visualização Premium do Lojista) */}
      {showCustomDetailsModal && selectedCustomInv && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(9, 13, 22, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <div className="glass-card" style={{ maxWidth: '600px', width: '100%', padding: '2.5rem', position: 'relative', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
            <button onClick={() => setShowCustomDetailsModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--muted)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}>
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
                <FileText size={26} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--foreground)' }}>Fatura {selectedCustomInv.id}</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>Detalhamento de Serviço Adicional/Avulso</p>
              </div>
            </div>

            {/* Recibo Estilizado */}
            <div id="print-custom-invoice-merchant" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border)', borderRadius: '12px', padding: '2rem', marginBottom: '2rem', display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Emitente</span>
                  <span style={{ fontWeight: 800, color: 'var(--foreground)', fontSize: '0.95rem' }}>Criar Lojas SaaS</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Loja Beneficiária</span>
                  <span style={{ fontWeight: 800, color: 'var(--foreground)', fontSize: '0.95rem' }}>{store?.name || 'Sua Loja'}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block' }}>{store?.subdomain || 'subdominio'}</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Serviço Contratado</span>
                <span style={{ fontWeight: 800, color: 'var(--foreground)', fontSize: '1.1rem', display: 'block', marginTop: '0.25rem' }}>{selectedCustomInv.title}</span>
                {selectedCustomInv.description && (
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.4 }}>
                    {selectedCustomInv.description}
                  </p>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Data de Emissão</span>
                  <span style={{ fontWeight: 700, color: 'var(--foreground)', fontSize: '0.9rem' }}>
                    {selectedCustomInv.created_at ? new Date(selectedCustomInv.created_at).toLocaleDateString('pt-BR') : '-'}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Vencimento</span>
                  <span style={{ fontWeight: 700, color: 'var(--foreground)', fontSize: '0.9rem' }}>
                    {selectedCustomInv.due_date ? new Date(selectedCustomInv.due_date + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Status</span>
                  <span style={{ fontWeight: 800, color: selectedCustomInv.status === 'paid' ? '#10b981' : selectedCustomInv.status === 'pending' ? '#f59e0b' : '#ef4444', textTransform: 'uppercase', fontSize: '0.9rem' }}>
                    {selectedCustomInv.status === 'paid' ? 'Pago (Compensado)' : selectedCustomInv.status === 'pending' ? 'Pendente' : 'Cancelado'}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Valor Total</span>
                  <span style={{ fontWeight: 900, color: '#a855f7', fontSize: '1.25rem' }}>
                    R$ {Number(selectedCustomInv.amount).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              {selectedCustomInv.status === 'paid' && (
                <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '8px', display: 'grid', gap: '0.25rem', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase' }}>Informações do Pagamento</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--foreground)', fontWeight: 600 }}>
                    Pago em: {selectedCustomInv.paid_at ? new Date(selectedCustomInv.paid_at).toLocaleString('pt-BR') : '-'}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                    Meio de Pagamento: {selectedCustomInv.payment_method || 'PIX'}
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  const printContents = document.getElementById('print-custom-invoice-merchant')?.innerHTML;
                  if (printContents) {
                    const printWindow = window.open('', '_blank');
                    printWindow?.document.write(`
                      <html>
                        <head>
                          <title>Fatura ${selectedCustomInv.id} - Criar Lojas</title>
                          <style>
                            body { font-family: sans-serif; padding: 2rem; color: #1e293b; background: white; }
                            h2 { color: #a855f7; border-bottom: 2px solid #a855f7; padding-bottom: 1rem; }
                            span { display: block; }
                            p { line-height: 1.5; color: #475569; }
                            div { margin-bottom: 1rem; }
                          </style>
                        </head>
                        <body>
                          <h2>Recibo de Cobrança Avulsa - Criar Lojas</h2>
                          <hr/>
                          ${printContents}
                        </body>
                      </html>
                    `);
                    printWindow?.document.close();
                    printWindow?.print();
                  }
                }}
                style={{ padding: '0.75rem 1.5rem', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Printer size={18} />
                <span>Imprimir Recibo</span>
              </button>
              {selectedCustomInv.status === 'pending' && (
                <button
                  onClick={() => {
                    setShowCustomDetailsModal(false);
                    setSelectedInvoice({
                      id: selectedCustomInv.id,
                      month: selectedCustomInv.title,
                      amount: selectedCustomInv.amount,
                      isCustom: true
                    });
                    setShowPaymentModal(true);
                  }}
                  style={{ padding: '0.75rem 2rem', background: '#a855f7', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}
                >
                  Pagar Agora
                </button>
              )}
              <button 
                onClick={() => setShowCustomDetailsModal(false)}
                style={{ padding: '0.75rem 2rem', background: 'var(--input-bg)', color: 'var(--foreground)', border: '1px solid var(--border)', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .btn-upgrade:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(14, 165, 233, 0.5); }
        .btn-upgrade:active { transform: translateY(0); }
        .btn-pay:hover { background: #059669 !important; transform: translateY(-2px); box-shadow: 0 6px 15px rgba(16, 185, 129, 0.4); }
        .btn-pay:active { transform: translateY(0); }
        .btn-cancel-plan:hover { background: rgba(239, 68, 68, 0.2) !important; transform: translateY(-2px); }
        .btn-cancel-plan:active { transform: translateY(0); }
        .btn-reactivate:hover { background: #047857 !important; transform: translateY(-2px); box-shadow: 0 6px 15px rgba(16, 185, 129, 0.4); }
        .btn-reactivate:active { transform: translateY(0); }
        .btn-reactivate-plan:hover { background: rgba(16, 185, 129, 0.2) !important; transform: translateY(-2px); }
        .btn-reactivate-plan:active { transform: translateY(0); }
        .plan-card:hover { border-color: rgba(255, 255, 255, 0.3) !important; background: rgba(255, 255, 255, 0.05) !important; }
        .btn-select-plan:hover { background: rgba(255, 255, 255, 0.2) !important; }
        .btn-upgrade-modal:hover { background: #059669 !important; transform: translateY(-2px); }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes modalEnter { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  )
}
