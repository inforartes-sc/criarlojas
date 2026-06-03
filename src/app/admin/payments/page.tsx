"use client"

import { useState, useEffect } from 'react'
import { Save, Loader2, CreditCard, ShieldCheck, DollarSign, Wallet, CheckCircle2, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { useAdminAuth } from '@/context/AdminAuthContext'

export default function PaymentsPage() {
  const { store } = useAdminAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [storeId, setStoreId] = useState('')
  const [activeTab, setActiveTab] = useState('mercadopago')

  const [gateways, setGateways] = useState({
    mercadopago: {
      active: false,
      public_key: '',
      access_token: '',
      mode: 'sandbox', // sandbox, live
      installments: 12
    },
    pagseguro: {
      active: false,
      email: '',
      token: '',
      mode: 'sandbox',
      installments: 12
    },
    stripe: {
      active: false,
      publishable_key: '',
      secret_key: '',
      mode: 'sandbox'
    },
    pix: {
      active: true,
      pix_key: '',
      pix_key_type: 'cpf', // cpf, cnpj, email, phone, random
      beneficiary_name: '',
      discount_percent: 5
    }
  })

  useEffect(() => {
    if (store) {
      fetchPaymentSettings()
    }
  }, [store])

  const fetchPaymentSettings = async () => {
    if (!store) return
    try {
      setStoreId(store.id)
      const s = store.settings || {}
      if (s.payment_gateways) {
        setGateways({
          mercadopago: { ...gateways.mercadopago, ...s.payment_gateways.mercadopago },
          pagseguro: { ...gateways.pagseguro, ...s.payment_gateways.pagseguro },
          stripe: { ...gateways.stripe, ...s.payment_gateways.stripe },
          pix: { ...gateways.pix, ...s.payment_gateways.pix }
        })
      }
    } catch (error: any) {
      console.error('Erro ao buscar gateways:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!store) return
    setSaving(true)
    try {
      const { data: storeData, error: fetchError } = await supabase
        .from('stores')
        .select('settings')
        .eq('id', store.id)
        .single()

      if (fetchError) throw fetchError

      const currentSettings = storeData.settings || {}

      const { error: updateError } = await supabase
        .from('stores')
        .update({
          settings: { ...currentSettings, payment_gateways: gateways }
        })
        .eq('id', store.id)

      if (updateError) throw updateError
      toast.success('Gateways de pagamento salvos com sucesso!')
    } catch (error: any) {
      toast.error('Erro ao salvar gateways: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '5rem', textAlign: 'center' }}>
        <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto', color: '#6366f1' }} />
        <p style={{ marginTop: '1rem', color: 'var(--muted)' }}>Carregando configurações de pagamento...</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1000px' }} className="payments-page-container">
      <header className="payments-header" style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ minWidth: '280px', flex: '1' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Meios de Pagamento</h1>
          <p style={{ color: 'var(--muted)' }}>Configure os gateways e métodos de pagamento disponíveis no checkout.</p>
        </div>
        <button 
          onClick={handleSubmit} 
          disabled={saving} 
          className="btn-save-settings btn-save-payments" 
          style={{ 
            padding: '1rem 2.5rem', 
            backgroundColor: '#6366f1', 
            color: '#ffffff', 
            border: 'none', 
            borderRadius: '12px', 
            fontWeight: 700, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
            transition: 'all 0.2s ease',
            height: '46px',
            whiteSpace: 'nowrap'
          }}
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          <span>Salvar Pagamentos</span>
        </button>
      </header>

      <div className="payments-layout-grid" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '3rem' }}>
        <nav className="payments-nav" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { id: 'mercadopago', label: 'Mercado Pago', icon: CreditCard, active: gateways.mercadopago.active },
            { id: 'pagseguro', label: 'PagSeguro', icon: Wallet, active: gateways.pagseguro.active },
            { id: 'stripe', label: 'Stripe', icon: DollarSign, active: gateways.stripe.active },
            { id: 'pix', label: 'Pix Direto', icon: ShieldCheck, active: gateways.pix.active }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderRadius: '12px', border: 'none', textAlign: 'left', cursor: 'pointer', fontWeight: 600,
                backgroundColor: activeTab === tab.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--muted)',
                transition: '0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <tab.icon size={20} />
                <span>{tab.label}</span>
              </div>
              {tab.active ? (
                <span className="status-indicator active-status" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} title="Ativo" />
              ) : (
                <span className="status-indicator inactive-status" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} title="Inativo" />
              )}
            </button>
          ))}
        </nav>

        <div className="payments-content-container" style={{ display: 'grid', gap: '2rem' }}>
          {/* MERCADO PAGO */}
          {activeTab === 'mercadopago' && (
            <div className="glass-card payment-settings-card" style={{ padding: '2.5rem', display: 'grid', gap: '2rem' }}>
              <div className="payment-settings-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Mercado Pago</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Aceite cartões de crédito, boleto e Pix via Mercado Pago.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: gateways.mercadopago.active ? '#10b981' : 'var(--muted)' }}>
                    {gateways.mercadopago.active ? 'Gateway Ativo' : 'Gateway Inativo'}
                  </span>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={gateways.mercadopago.active} 
                      onChange={e => setGateways({ ...gateways, mercadopago: { ...gateways.mercadopago, active: e.target.checked } })} 
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Modo de Operação</label>
                <div className="payment-modes-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <label className={`mode-label ${gateways.mercadopago.mode === 'sandbox' ? 'active-sandbox' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', border: gateways.mercadopago.mode === 'sandbox' ? '2px solid var(--primary)' : '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', backgroundColor: gateways.mercadopago.mode === 'sandbox' ? 'rgba(99, 102, 241, 0.05)' : 'transparent' }}>
                    <input 
                      type="radio" 
                      name="mp_mode" 
                      checked={gateways.mercadopago.mode === 'sandbox'} 
                      onChange={() => setGateways({ ...gateways, mercadopago: { ...gateways.mercadopago, mode: 'sandbox' } })} 
                    />
                    <div>
                      <div style={{ fontWeight: 700 }}>Modo Teste (Sandbox)</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Use credenciais de teste para simular pagamentos.</div>
                    </div>
                  </label>
                  <label className={`mode-label ${gateways.mercadopago.mode === 'live' ? 'active-live' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', border: gateways.mercadopago.mode === 'live' ? '2px solid #10b981' : '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', backgroundColor: gateways.mercadopago.mode === 'live' ? 'rgba(16, 185, 129, 0.05)' : 'transparent' }}>
                    <input 
                      type="radio" 
                      name="mp_mode" 
                      checked={gateways.mercadopago.mode === 'live'} 
                      onChange={() => setGateways({ ...gateways, mercadopago: { ...gateways.mercadopago, mode: 'live' } })} 
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: '#10b981' }}>Modo Produção (Live)</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Receba pagamentos reais dos seus clientes.</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Public Key (Chave Pública)</label>
                <input 
                  type="text" 
                  placeholder="APP_USR-xxxx-xxxx-xxxx-xxxx" 
                  value={gateways.mercadopago.public_key} 
                  onChange={e => setGateways({ ...gateways, mercadopago: { ...gateways.mercadopago, public_key: e.target.value } })} 
                />
              </div>

              <div className="form-group">
                <label>Access Token (Token de Acesso)</label>
                <input 
                  type="password" 
                  placeholder="APP_USR-xxxx-xxxx-xxxx-xxxx" 
                  value={gateways.mercadopago.access_token} 
                  onChange={e => setGateways({ ...gateways, mercadopago: { ...gateways.mercadopago, access_token: e.target.value } })} 
                />
              </div>

              <div className="form-group">
                <label>Máximo de Parcelas Permitidas</label>
                <select 
                  value={gateways.mercadopago.installments} 
                  onChange={e => setGateways({ ...gateways, mercadopago: { ...gateways.mercadopago, installments: Number(e.target.value) } })}
                  style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--foreground)', outline: 'none' }}
                >
                  <option value={1} style={{color:'#000'}}>1x (À vista)</option>
                  <option value={3} style={{color:'#000'}}>Até 3x</option>
                  <option value={6} style={{color:'#000'}}>Até 6x</option>
                  <option value={12} style={{color:'#000'}}>Até 12x</option>
                </select>
              </div>
            </div>
          )}

          {/* PAGSEGURO */}
          {activeTab === 'pagseguro' && (
            <div className="glass-card payment-settings-card" style={{ padding: '2.5rem', display: 'grid', gap: '2rem' }}>
              <div className="payment-settings-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>PagSeguro</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Integração com checkout transparente do PagSeguro.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: gateways.pagseguro.active ? '#10b981' : 'var(--muted)' }}>
                    {gateways.pagseguro.active ? 'Gateway Ativo' : 'Gateway Inativo'}
                  </span>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={gateways.pagseguro.active} 
                      onChange={e => setGateways({ ...gateways, pagseguro: { ...gateways.pagseguro, active: e.target.checked } })} 
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Modo de Operação</label>
                <div className="payment-modes-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <label className={`mode-label ${gateways.pagseguro.mode === 'sandbox' ? 'active-sandbox' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', border: gateways.pagseguro.mode === 'sandbox' ? '2px solid var(--primary)' : '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', backgroundColor: gateways.pagseguro.mode === 'sandbox' ? 'rgba(99, 102, 241, 0.05)' : 'transparent' }}>
                    <input 
                      type="radio" 
                      name="ps_mode" 
                      checked={gateways.pagseguro.mode === 'sandbox'} 
                      onChange={() => setGateways({ ...gateways, pagseguro: { ...gateways.pagseguro, mode: 'sandbox' } })} 
                    />
                    <div>
                      <div style={{ fontWeight: 700 }}>Modo Teste (Sandbox)</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Ambiente de testes do PagSeguro.</div>
                    </div>
                  </label>
                  <label className={`mode-label ${gateways.pagseguro.mode === 'live' ? 'active-live' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', border: gateways.pagseguro.mode === 'live' ? '2px solid #10b981' : '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', backgroundColor: gateways.pagseguro.mode === 'live' ? 'rgba(16, 185, 129, 0.05)' : 'transparent' }}>
                    <input 
                      type="radio" 
                      name="ps_mode" 
                      checked={gateways.pagseguro.mode === 'live'} 
                      onChange={() => setGateways({ ...gateways, pagseguro: { ...gateways.pagseguro, mode: 'live' } })} 
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: '#10b981' }}>Modo Produção (Live)</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Ambiente de transações reais.</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>E-mail da Conta PagSeguro</label>
                <input 
                  type="email" 
                  placeholder="seuemail@dominio.com" 
                  value={gateways.pagseguro.email} 
                  onChange={e => setGateways({ ...gateways, pagseguro: { ...gateways.pagseguro, email: e.target.value } })} 
                />
              </div>

              <div className="form-group">
                <label>Token de Integração</label>
                <input 
                  type="password" 
                  placeholder="xxxx-xxxx-xxxx-xxxx" 
                  value={gateways.pagseguro.token} 
                  onChange={e => setGateways({ ...gateways, pagseguro: { ...gateways.pagseguro, token: e.target.value } })} 
                />
              </div>

              <div className="form-group">
                <label>Máximo de Parcelas Permitidas</label>
                <select 
                  value={gateways.pagseguro.installments} 
                  onChange={e => setGateways({ ...gateways, pagseguro: { ...gateways.pagseguro, installments: Number(e.target.value) } })}
                  style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--foreground)', outline: 'none' }}
                >
                  <option value={1} style={{color:'#000'}}>1x (À vista)</option>
                  <option value={3} style={{color:'#000'}}>Até 3x</option>
                  <option value={6} style={{color:'#000'}}>Até 6x</option>
                  <option value={12} style={{color:'#000'}}>Até 12x</option>
                </select>
              </div>
            </div>
          )}

          {/* STRIPE */}
          {activeTab === 'stripe' && (
            <div className="glass-card payment-settings-card" style={{ padding: '2.5rem', display: 'grid', gap: '2rem' }}>
              <div className="payment-settings-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Stripe</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Processamento internacional e cartões de crédito via Stripe.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: gateways.stripe.active ? '#10b981' : 'var(--muted)' }}>
                    {gateways.stripe.active ? 'Gateway Ativo' : 'Gateway Inativo'}
                  </span>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={gateways.stripe.active} 
                      onChange={e => setGateways({ ...gateways, stripe: { ...gateways.stripe, active: e.target.checked } })} 
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Modo de Operação</label>
                <div className="payment-modes-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <label className={`mode-label ${gateways.stripe.mode === 'sandbox' ? 'active-sandbox' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', border: gateways.stripe.mode === 'sandbox' ? '2px solid var(--primary)' : '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', backgroundColor: gateways.stripe.mode === 'sandbox' ? 'rgba(99, 102, 241, 0.05)' : 'transparent' }}>
                    <input 
                      type="radio" 
                      name="st_mode" 
                      checked={gateways.stripe.mode === 'sandbox'} 
                      onChange={() => setGateways({ ...gateways, stripe: { ...gateways.stripe, mode: 'sandbox' } })} 
                    />
                    <div>
                      <div style={{ fontWeight: 700 }}>Modo Teste (Sandbox)</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Chaves de teste (pk_test / sk_test).</div>
                    </div>
                  </label>
                  <label className={`mode-label ${gateways.stripe.mode === 'live' ? 'active-live' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', border: gateways.stripe.mode === 'live' ? '2px solid #10b981' : '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', backgroundColor: gateways.stripe.mode === 'live' ? 'rgba(16, 185, 129, 0.05)' : 'transparent' }}>
                    <input 
                      type="radio" 
                      name="st_mode" 
                      checked={gateways.stripe.mode === 'live'} 
                      onChange={() => setGateways({ ...gateways, stripe: { ...gateways.stripe, mode: 'live' } })} 
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: '#10b981' }}>Modo Produção (Live)</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Chaves de produção (pk_live / sk_live).</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Publishable Key (Chave Pública)</label>
                <input 
                  type="text" 
                  placeholder="pk_test_xxxx ou pk_live_xxxx" 
                  value={gateways.stripe.publishable_key} 
                  onChange={e => setGateways({ ...gateways, stripe: { ...gateways.stripe, publishable_key: e.target.value } })} 
                />
              </div>

              <div className="form-group">
                <label>Secret Key (Chave Secreta)</label>
                <input 
                  type="password" 
                  placeholder="sk_test_xxxx ou sk_live_xxxx" 
                  value={gateways.stripe.secret_key} 
                  onChange={e => setGateways({ ...gateways, stripe: { ...gateways.stripe, secret_key: e.target.value } })} 
                />
              </div>
            </div>
          )}

          {/* PIX DIRETO */}
          {activeTab === 'pix' && (
            <div className="glass-card payment-settings-card" style={{ padding: '2.5rem', display: 'grid', gap: '2rem' }}>
              <div className="payment-settings-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Pix Direto (Sem Taxas)</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Exiba sua chave Pix diretamente no checkout para pagamento manual ou QR Code.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: gateways.pix.active ? '#10b981' : 'var(--muted)' }}>
                    {gateways.pix.active ? 'Pix Ativo' : 'Pix Inativo'}
                  </span>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={gateways.pix.active} 
                      onChange={e => setGateways({ ...gateways, pix: { ...gateways.pix, active: e.target.checked } })} 
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Tipo de Chave Pix</label>
                <select 
                  value={gateways.pix.pix_key_type} 
                  onChange={e => setGateways({ ...gateways, pix: { ...gateways.pix, pix_key_type: e.target.value } })}
                  style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--foreground)', outline: 'none' }}
                >
                  <option value="cpf" style={{color:'#000'}}>CPF</option>
                  <option value="cnpj" style={{color:'#000'}}>CNPJ</option>
                  <option value="email" style={{color:'#000'}}>E-mail</option>
                  <option value="phone" style={{color:'#000'}}>Telefone Celular</option>
                  <option value="random" style={{color:'#000'}}>Chave Aleatória</option>
                </select>
              </div>

              <div className="form-group">
                <label>Chave Pix</label>
                <input 
                  type="text" 
                  placeholder="Sua chave Pix..." 
                  value={gateways.pix.pix_key} 
                  onChange={e => setGateways({ ...gateways, pix: { ...gateways.pix, pix_key: e.target.value } })} 
                />
              </div>

              <div className="form-group">
                <label>Nome do Beneficiário (Titular da Conta)</label>
                <input 
                  type="text" 
                  placeholder="Nome Completo ou Razão Social" 
                  value={gateways.pix.beneficiary_name} 
                  onChange={e => setGateways({ ...gateways, pix: { ...gateways.pix, beneficiary_name: e.target.value } })} 
                />
              </div>

              <div className="form-group">
                <label>Desconto no Pix (%)</label>
                <input 
                  type="number" 
                  min="0" 
                  max="100" 
                  placeholder="5" 
                  value={gateways.pix.discount_percent} 
                  onChange={e => setGateways({ ...gateways, pix: { ...gateways.pix, discount_percent: Number(e.target.value) } })} 
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.25rem' }}>Exemplo: 5 para dar 5% de desconto em pagamentos via Pix.</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .btn-save-settings:hover { background-color: #4f46e5 !important; transform: translateY(-2px); box-shadow: 0 6px 15px rgba(99, 102, 241, 0.4); }
        .btn-save-settings:active { transform: translateY(0); }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        label { font-size: 0.875rem; font-weight: 500; color: var(--muted); }
        input, select { width: 100%; min-width: 0; background: var(--input-bg); border: 1px solid var(--border); border-radius: 8px; padding: 0.75rem 1rem; color: var(--foreground); outline: none; }
        input:focus, select:focus { border-color: var(--primary); }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .switch { position: relative; display: inline-block; width: 44px; height: 24px; flex-shrink: 0; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .3s; }
        .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .3s; }
        input:checked + .slider { background-color: var(--primary); }
        input:checked + .slider:before { transform: translateX(20px); }
        .slider.round { border-radius: 24px; }
        .slider.round:before { border-radius: 50%; }

        @media (max-width: 1024px) {
          .payments-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 1.25rem !important;
            margin-bottom: 2rem !important;
          }
          .btn-save-payments {
            width: 100% !important;
            justify-content: center !important;
          }
          .payments-layout-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
          .payments-nav {
            flex-direction: row !important;
            overflow-x: auto !important;
            width: 100% !important;
            gap: 0.5rem !important;
            padding: 0.25rem !important;
            background: var(--input-bg);
            border-radius: 12px;
            border: 1px solid var(--border);
            -webkit-overflow-scrolling: touch;
          }
          .nav-tab-btn {
            padding: 0.6rem 1rem !important;
            font-size: 0.85rem !important;
            flex-shrink: 0 !important;
          }
          .status-indicator {
            margin-left: 0.5rem !important;
          }
          .payment-settings-card {
            padding: 1.5rem !important;
            gap: 1.5rem !important;
          }
          .payment-settings-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 1rem !important;
          }
          .payment-modes-grid {
            grid-template-columns: 1fr !important;
          }
          .mode-label {
            padding: 1rem !important;
          }
        }

        @media (max-width: 768px) {
          .payment-settings-card {
            padding: 1.25rem !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            border-radius: 12px !important;
            border: 1px solid var(--border) !important;
          }
        }
      `}</style>
    </div>
  )
}
