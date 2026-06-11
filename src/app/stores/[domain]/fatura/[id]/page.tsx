"use client"

import { useState, useEffect, use } from 'react'
import { FileText, Calendar, CreditCard, ShieldCheck, QrCode, Loader2, CheckCircle2, AlertCircle, Copy, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

interface FaturaClientPageProps {
  params: Promise<{
    domain: string
    id: string
  }>
}

export default function FaturaClientPage({ params }: FaturaClientPageProps) {
  const resolvedParams = use(params)
  const [loading, setLoading] = useState(true)
  const [invoice, setInvoice] = useState<any>(null)
  const [store, setStore] = useState<any>(null)
  const [loadingPayment, setLoadingPayment] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'mp' | 'pix'>('pix')
  const [copiedPix, setCopiedPix] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInvoiceDetails(resolvedParams.id)
  }, [resolvedParams.id])

  const fetchInvoiceDetails = async (invoiceId: string) => {
    try {
      setLoading(true)
      setError(null)
      // Buscar a fatura
      const { data: inv, error: invErr } = await supabase
        .from('custom_invoices')
        .select('*, service_clients(*)')
        .eq('id', invoiceId)
        .single()

      if (invErr) throw invErr
      setInvoice(inv)

      // Buscar a loja correspondente
      const { data: st, error: stErr } = await supabase
        .from('stores')
        .select('*')
        .eq('id', inv.store_id)
        .single()

      if (stErr) throw stErr
      setStore(st)

      // Definir método inicial baseado na disponibilidade do Mercado Pago ou Pix
      const mpConfig = st.settings?.payment_gateways?.mercadopago
      if (mpConfig?.active) {
        setPaymentMethod('mp')
      } else {
        setPaymentMethod('pix')
      }

    } catch (error: any) {
      console.error('Erro ao carregar fatura:', error.message)
      setError(error.message || String(error))
      toast.error('Não foi possível carregar os dados desta fatura.')
    } finally {
      setLoading(false)
    }
  }

  const handlePayMercadoPago = async () => {
    setLoadingPayment(true)
    try {
      const res = await fetch('/api/billing/create-client-charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invoice.id })
      })

      const data = await res.json()
      if (res.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        toast.error(data.error || 'Erro ao gerar checkout do Mercado Pago.')
      }
    } catch (err: any) {
      console.error(err)
      toast.error('Erro de conexão ao redirecionar para o pagamento.')
    } finally {
      setLoadingPayment(false)
    }
  }

  // Gera o Payload Pix Estático EMV BR Code usando os dados do lojista
  const getPixPayload = () => {
    if (!store) return ''
    const pixConfig = store.settings?.payment_gateways?.pix || {}
    const key = pixConfig.pix_key || ''
    const beneficiary = pixConfig.beneficiary_name || store.name || 'Lojista'
    const amt = Number(invoice.amount).toFixed(2)

    const pixGui = 'br.gov.bcb.pix'
    const pixKeyInfo = `01${String(key.length).padStart(2, '0')}${key}`
    const merchantAccountInfo = `0014${pixGui}${pixKeyInfo}`

    const merchantName = beneficiary.toUpperCase().slice(0, 25)
    const merchantCity = 'SAO PAULO'

    let payload = '000201' 
    payload += '010211'   
    payload += `26${String(merchantAccountInfo.length).padStart(2, '0')}${merchantAccountInfo}`
    payload += '52040000' 
    payload += '5303986'  
    payload += `54${String(amt.length).padStart(2, '0')}${amt}` 
    payload += '5802BR'   
    payload += `59${String(merchantName.length).padStart(2, '0')}${merchantName}` 
    payload += `60${String(merchantCity.length).padStart(2, '0')}${merchantCity}` 
    payload += '62070503***' 
    payload += '6304'      

    // CRC16 CCITT
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

  const handleCopyPix = () => {
    const code = getPixPayload()
    navigator.clipboard.writeText(code)
    setCopiedPix(true)
    toast.success('Código Pix copiado!')
    setTimeout(() => setCopiedPix(false), 3000)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto', color: '#6366f1' }} />
          <p style={{ marginTop: '1rem', color: '#64748b', fontWeight: 600 }}>Carregando dados da fatura...</p>
        </div>
      </div>
    )
  }

  if (!invoice || !store) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '2rem' }}>
        <div style={{ maxWidth: '450px', width: '100%', textAlign: 'center', backgroundColor: '#fff', padding: '3rem 2rem', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 1.5rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>Fatura não encontrada</h2>
          <p style={{ color: '#64748b', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            O link de faturamento acessado pode estar incorreto ou a cobrança foi removida do sistema.
          </p>
          {error && (
            <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', color: '#991b1b', fontSize: '0.8rem', textAlign: 'left', wordBreak: 'break-all', fontFamily: 'monospace' }}>
              Erro detalhado: {error}
            </div>
          )}
        </div>
      </div>
    )
  }

  const isPaid = invoice.status === 'paid'
  const isCancelled = invoice.status === 'cancelled'
  const stSettings = store.settings || {}
  const gateways = stSettings.payment_gateways || {}
  const hasMp = gateways.mercadopago?.active
  const hasPix = gateways.pix?.active && gateways.pix?.pix_key

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '3rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '600px', width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Cabeçalho da Loja */}
        <div style={{ textAlign: 'center' }}>
          {stSettings.logo_url ? (
            <img src={stSettings.logo_url} alt={store.name} style={{ maxHeight: '64px', margin: '0 auto 1rem', display: 'block' }} />
          ) : (
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.5rem' }}>{store.name}</h1>
          )}
          <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>Fatura do Cliente • Portal de Cobrança Seguro</p>
        </div>

        {/* Detalhes da Cobrança */}
        <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden' }}>
          
          {/* Status Badge */}
          <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
            {isPaid ? (
              <span style={{ padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.2)' }}>PAGO</span>
            ) : isCancelled ? (
              <span style={{ padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>CANCELADO</span>
            ) : (
              <span style={{ padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)' }}>AGUARDANDO PAGAMENTO</span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: '#6366f1' }}>
            <FileText size={24} />
            <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Fatura Avulsa</span>
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.5rem' }}>{invoice.title}</h2>
          {invoice.description && <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0 0 2rem', lineHeight: 1.5 }}>{invoice.description}</p>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '1.5rem 0', marginBottom: '2rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>CLIENTE</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#334155' }}>{invoice.service_clients?.name}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>VENCIMENTO</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Calendar size={16} />
                {new Date(invoice.due_date).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Valor da Cobrança</span>
            <span style={{ fontSize: '2rem', fontWeight: 950, color: '#6366f1' }}>R$ {Number(invoice.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>

          {/* Fluxo de Pagamento */}
          {!isPaid && !isCancelled && (
            <div>
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '2rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '1rem' }}>Forma de Pagamento</span>
                
                <div style={{ display: 'grid', gridTemplateColumns: hasMp && hasPix ? '1fr 1fr' : '1fr', gap: '1rem' }}>
                  {hasMp && (
                    <button 
                      onClick={() => setPaymentMethod('mp')}
                      style={{ padding: '1rem', borderRadius: '12px', border: paymentMethod === 'mp' ? '2px solid #6366f1' : '1px solid #cbd5e1', backgroundColor: paymentMethod === 'mp' ? 'rgba(99, 102, 241, 0.05)' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 700, color: paymentMethod === 'mp' ? '#6366f1' : '#64748b' }}
                    >
                      <CreditCard size={20} />
                      Mercado Pago
                    </button>
                  )}
                  {hasPix && (
                    <button 
                      onClick={() => setPaymentMethod('pix')}
                      style={{ padding: '1rem', borderRadius: '12px', border: paymentMethod === 'pix' ? '2px solid #6366f1' : '1px solid #cbd5e1', backgroundColor: paymentMethod === 'pix' ? 'rgba(99, 102, 241, 0.05)' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 700, color: paymentMethod === 'pix' ? '#6366f1' : '#64748b' }}
                    >
                      <QrCode size={20} />
                      Pix Direto
                    </button>
                  )}
                </div>
              </div>

              {/* Detalhe do Meio Selecionado */}
              {paymentMethod === 'mp' && hasMp && (
                <button 
                  onClick={handlePayMercadoPago}
                  disabled={loadingPayment}
                  style={{ width: '100%', padding: '1.2rem', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 900, fontSize: '1.1rem', cursor: loadingPayment ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)', transition: '0.2s' }}
                >
                  {loadingPayment ? <Loader2 className="animate-spin" size={24} /> : 'Pagar via Mercado Pago'}
                </button>
              )}

              {paymentMethod === 'pix' && hasPix && (
                <div style={{ display: 'grid', gap: '1.25rem', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                    <QrCode size={20} /> Pagamento Instantâneo via Pix
                  </span>
                  
                  {/* QR Code Placeholder */}
                  <div style={{ width: '160px', height: '160px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: '#10b981', fontSize: '0.8rem', fontWeight: 700 }}>
                    [ QR CODE PIX ]
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#065f46', fontWeight: 600 }}>
                    Beneficiário: <strong>{gateways.pix.beneficiary_name || store.name}</strong>
                  </div>

                  <button 
                    onClick={handleCopyPix}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', margin: '0 auto', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
                  >
                    <Copy size={18} />
                    {copiedPix ? 'Copiado!' : 'Copiar Pix Copia e Cola'}
                  </button>
                </div>
              )}

              {!hasMp && !hasPix && (
                <div style={{ padding: '1.5rem', backgroundColor: '#f1f5f9', borderRadius: '12px', textAlign: 'center', border: '1px solid #cbd5e1', color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
                  Nenhum meio de pagamento online foi configurado pelo lojista. Entre em contato diretamente com a loja.
                </div>
              )}
            </div>
          )}

          {isPaid && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '1rem 1.25rem', color: '#065f46', fontSize: '0.9rem', fontWeight: 700 }}>
              <CheckCircle2 size={20} />
              <span>O pagamento desta fatura foi confirmado com sucesso. Nenhuma ação adicional é necessária.</span>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
