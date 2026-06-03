"use client"

import { useState, useEffect } from 'react'
import { Save, Loader2, Truck, Package, MapPin, DollarSign, Store } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { useAdminAuth } from '@/context/AdminAuthContext'

export default function ShippingPage() {
  const { store } = useAdminAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [storeId, setStoreId] = useState('')
  const [activeTab, setActiveTab] = useState('melhorenvio')

  const [shipping, setShipping] = useState({
    origin_zip: '',
    origin_address: '',
    origin_city: '',
    origin_state: '',
    melhorenvio: {
      active: true,
      client_id: '',
      client_secret: '',
      bearer_token: '',
      mode: 'sandbox' // sandbox, live
    },
    frenet: {
      active: false,
      api_token: '',
      password: '',
      mode: 'sandbox'
    },
    correios: {
      active: false,
      cod_administrativo: '',
      password: '',
      cartao_postagem: '',
      mode: 'sandbox'
    },
    custom_rules: {
      active: true,
      fixed_rate: 15.00,
      free_shipping_min: 299.00,
      enable_store_pickup: true,
      pickup_message: 'Retirada em até 1 dia útil após confirmação do pagamento.'
    }
  })

  useEffect(() => {
    if (store) {
      fetchShippingSettings()
    }
  }, [store])

  const fetchShippingSettings = async () => {
    if (!store) return
    try {
      setStoreId(store.id)
      const s = store.settings || {}
      if (s.shipping_gateways) {
        setShipping({
          origin_zip: s.shipping_gateways.origin_zip || s.origin_zip || '',
          origin_address: s.shipping_gateways.origin_address || s.origin_address || '',
          origin_city: s.shipping_gateways.origin_city || s.origin_city || '',
          origin_state: s.shipping_gateways.origin_state || s.origin_state || '',
          melhorenvio: { ...shipping.melhorenvio, ...s.shipping_gateways.melhorenvio },
          frenet: { ...shipping.frenet, ...s.shipping_gateways.frenet },
          correios: { ...shipping.correios, ...s.shipping_gateways.correios },
          custom_rules: { ...shipping.custom_rules, ...s.shipping_gateways.custom_rules }
        })
      }
    } catch (error: any) {
      console.error('Erro ao buscar frete:', error.message)
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
          settings: { ...currentSettings, shipping_gateways: shipping }
        })
        .eq('id', store.id)

      if (updateError) throw updateError
      toast.success('Configurações de frete e envio salvas com sucesso!')
    } catch (error: any) {
      toast.error('Erro ao salvar frete: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '5rem', textAlign: 'center' }}>
        <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto', color: '#6366f1' }} />
        <p style={{ marginTop: '1rem', color: 'var(--muted)' }}>Carregando métodos de envio...</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1000px' }} className="shipping-page-container">
      <header className="shipping-header" style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ minWidth: '280px', flex: '1' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Métodos de Envio e Frete</h1>
          <p style={{ color: 'var(--muted)' }}>Configure integrações com transportadoras, Correios e regras de frete grátis.</p>
        </div>
        <button 
          onClick={handleSubmit} 
          disabled={saving} 
          className="btn-save-settings btn-save-shipping" 
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
          <span>Salvar Envio</span>
        </button>
      </header>
 
      <div className="shipping-layout-grid" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '3rem' }}>
        <nav className="shipping-nav" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { id: 'melhorenvio', label: 'Melhor Envio', icon: Truck, active: shipping.melhorenvio.active },
            { id: 'frenet', label: 'Frenet', icon: Package, active: shipping.frenet.active },
            { id: 'correios', label: 'Correios (Contrato)', icon: Truck, active: shipping.correios.active },
            { id: 'custom', label: 'Frete Fixo / Retirada', icon: Store, active: shipping.custom_rules.active },
            { id: 'origin', label: 'CEP de Origem', icon: MapPin, active: !!shipping.origin_zip }
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

        <div style={{ display: 'grid', gap: '2rem' }}>
          {/* MELHOR ENVIO */}
          {activeTab === 'melhorenvio' && (
            <div className="glass-card" style={{ padding: '2.5rem', display: 'grid', gap: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Melhor Envio</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Cotação simultânea com Correios, Jadlog, Azul Cargo e outras transportadoras.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: shipping.melhorenvio.active ? '#10b981' : 'var(--muted)' }}>
                    {shipping.melhorenvio.active ? 'Ativo' : 'Inativo'}
                  </span>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={shipping.melhorenvio.active} 
                      onChange={e => setShipping({ ...shipping, melhorenvio: { ...shipping.melhorenvio, active: e.target.checked } })} 
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Modo de Operação</label>
                <div className="shipping-modes-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', border: shipping.melhorenvio.mode === 'sandbox' ? '2px solid var(--primary)' : '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', backgroundColor: shipping.melhorenvio.mode === 'sandbox' ? 'rgba(99, 102, 241, 0.05)' : 'transparent' }}>
                    <input 
                      type="radio" 
                      name="me_mode" 
                      checked={shipping.melhorenvio.mode === 'sandbox'} 
                      onChange={() => setShipping({ ...shipping, melhorenvio: { ...shipping.melhorenvio, mode: 'sandbox' } })} 
                    />
                    <div>
                      <div style={{ fontWeight: 700 }}>Ambiente Sandbox</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Simulação de fretes sem gerar etiquetas reais.</div>
                    </div>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', border: shipping.melhorenvio.mode === 'live' ? '2px solid #10b981' : '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', backgroundColor: shipping.melhorenvio.mode === 'live' ? 'rgba(16, 185, 129, 0.05)' : 'transparent' }}>
                    <input 
                      type="radio" 
                      name="me_mode" 
                      checked={shipping.melhorenvio.mode === 'live'} 
                      onChange={() => setShipping({ ...shipping, melhorenvio: { ...shipping.melhorenvio, mode: 'live' } })} 
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: '#10b981' }}>Ambiente Produção</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Cotação e compra de frete oficial.</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="shipping-fields-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label>Client ID</label>
                  <input 
                    type="text" 
                    placeholder="1234" 
                    value={shipping.melhorenvio.client_id} 
                    onChange={e => setShipping({ ...shipping, melhorenvio: { ...shipping.melhorenvio, client_id: e.target.value } })} 
                  />
                </div>
                <div className="form-group">
                  <label>Client Secret</label>
                  <input 
                    type="password" 
                    placeholder="Sua secret key..." 
                    value={shipping.melhorenvio.client_secret} 
                    onChange={e => setShipping({ ...shipping, melhorenvio: { ...shipping.melhorenvio, client_secret: e.target.value } })} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Bearer Token (Token de Acesso API)</label>
                <textarea 
                  rows={3} 
                  placeholder="eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIs..." 
                  value={shipping.melhorenvio.bearer_token} 
                  onChange={e => setShipping({ ...shipping, melhorenvio: { ...shipping.melhorenvio, bearer_token: e.target.value } })} 
                />
              </div>
            </div>
          )}

          {/* FRENET */}
          {activeTab === 'frenet' && (
            <div className="glass-card" style={{ padding: '2.5rem', display: 'grid', gap: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Frenet</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Gateway de fretes com regras avançadas e múltiplas transportadoras.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: shipping.frenet.active ? '#10b981' : 'var(--muted)' }}>
                    {shipping.frenet.active ? 'Ativo' : 'Inativo'}
                  </span>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={shipping.frenet.active} 
                      onChange={e => setShipping({ ...shipping, frenet: { ...shipping.frenet, active: e.target.checked } })} 
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Token de Acesso (Chave de API)</label>
                <input 
                  type="password" 
                  placeholder="Token da sua conta Frenet..." 
                  value={shipping.frenet.api_token} 
                  onChange={e => setShipping({ ...shipping, frenet: { ...shipping.frenet, api_token: e.target.value } })} 
                />
              </div>

              <div className="form-group">
                <label>Senha de Acesso API (Opcional)</label>
                <input 
                  type="password" 
                  placeholder="Senha da API Frenet..." 
                  value={shipping.frenet.password} 
                  onChange={e => setShipping({ ...shipping, frenet: { ...shipping.frenet, password: e.target.value } })} 
                />
              </div>
            </div>
          )}

          {/* CORREIOS */}
          {activeTab === 'correios' && (
            <div className="glass-card" style={{ padding: '2.5rem', display: 'grid', gap: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Correios (Contrato / SIGEP Web)</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Integração direta com contrato dos Correios para SEDEX e PAC com desconto.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: shipping.correios.active ? '#10b981' : 'var(--muted)' }}>
                    {shipping.correios.active ? 'Ativo' : 'Inativo'}
                  </span>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={shipping.correios.active} 
                      onChange={e => setShipping({ ...shipping, correios: { ...shipping.correios, active: e.target.checked } })} 
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Código Administrativo</label>
                <input 
                  type="text" 
                  placeholder="Ex: 08082650" 
                  value={shipping.correios.cod_administrativo} 
                  onChange={e => setShipping({ ...shipping, correios: { ...shipping.correios, cod_administrativo: e.target.value } })} 
                />
              </div>

              <div className="form-group">
                <label>Senha do Contrato</label>
                <input 
                  type="password" 
                  placeholder="Sua senha dos Correios..." 
                  value={shipping.correios.password} 
                  onChange={e => setShipping({ ...shipping, correios: { ...shipping.correios, password: e.target.value } })} 
                />
              </div>

              <div className="form-group">
                <label>Cartão de Postagem</label>
                <input 
                  type="text" 
                  placeholder="Ex: 0067599079" 
                  value={shipping.correios.cartao_postagem} 
                  onChange={e => setShipping({ ...shipping, correios: { ...shipping.correios, cartao_postagem: e.target.value } })} 
                />
              </div>
            </div>
          )}

          {/* FRETE FIXO / RETIRADA */}
          {activeTab === 'custom' && (
            <div className="glass-card" style={{ padding: '2.5rem', display: 'grid', gap: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Regras Customizadas e Retirada</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Configure frete fixo, gatilho de frete grátis e opção de retirar na loja.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: shipping.custom_rules.active ? '#10b981' : 'var(--muted)' }}>
                    {shipping.custom_rules.active ? 'Ativo' : 'Inativo'}
                  </span>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={shipping.custom_rules.active} 
                      onChange={e => setShipping({ ...shipping, custom_rules: { ...shipping.custom_rules, active: e.target.checked } })} 
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>

              <div className="shipping-fields-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label>Valor do Frete Fixo (R$)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="15.00" 
                    value={shipping.custom_rules.fixed_rate} 
                    onChange={e => setShipping({ ...shipping, custom_rules: { ...shipping.custom_rules, fixed_rate: Number(e.target.value) } })} 
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.25rem' }}>Cobrado caso as APIs falhem ou como opção padrão.</span>
                </div>
                <div className="form-group">
                  <label>Valor Mínimo para Frete Grátis (R$)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="299.00" 
                    value={shipping.custom_rules.free_shipping_min} 
                    onChange={e => setShipping({ ...shipping, custom_rules: { ...shipping.custom_rules, free_shipping_min: Number(e.target.value) } })} 
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.25rem' }}>Pedidos acima deste valor terão frete gratuito.</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem', display: 'grid', gap: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontWeight: 700, margin: 0 }}>Permitir Retirada na Loja</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.25rem' }}>Cliente não paga frete e retira o produto presencialmente.</p>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={shipping.custom_rules.enable_store_pickup} 
                      onChange={e => setShipping({ ...shipping, custom_rules: { ...shipping.custom_rules, enable_store_pickup: e.target.checked } })} 
                    />
                    <span className="slider round"></span>
                  </label>
                </div>

                {shipping.custom_rules.enable_store_pickup && (
                  <div className="form-group">
                    <label>Instruções para Retirada</label>
                    <input 
                      type="text" 
                      placeholder="Retirada em até 1 dia útil após confirmação..." 
                      value={shipping.custom_rules.pickup_message} 
                      onChange={e => setShipping({ ...shipping, custom_rules: { ...shipping.custom_rules, pickup_message: e.target.value } })} 
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CEP DE ORIGEM */}
          {activeTab === 'origin' && (
            <div className="glass-card" style={{ padding: '2.5rem', display: 'grid', gap: '2rem' }}>
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>CEP e Endereço de Origem</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Utilizado pelas transportadoras para calcular a distância e o valor do frete até o cliente.</p>
              </div>

              <div className="shipping-address-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label>CEP de Origem</label>
                  <input 
                    type="text" 
                    placeholder="01001-000" 
                    value={shipping.origin_zip} 
                    onChange={e => setShipping({ ...shipping, origin_zip: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label>Endereço de Postagem (Rua, Número)</label>
                  <input 
                    type="text" 
                    placeholder="Av. Principal, 1000" 
                    value={shipping.origin_address} 
                    onChange={e => setShipping({ ...shipping, origin_address: e.target.value })} 
                  />
                </div>
              </div>

              <div className="shipping-address-grid-2" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label>Cidade</label>
                  <input 
                    type="text" 
                    placeholder="São Paulo" 
                    value={shipping.origin_city} 
                    onChange={e => setShipping({ ...shipping, origin_city: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label>Estado (UF)</label>
                  <input 
                    type="text" 
                    placeholder="SP" 
                    maxLength={2}
                    value={shipping.origin_state} 
                    onChange={e => setShipping({ ...shipping, origin_state: e.target.value.toUpperCase() })} 
                  />
                </div>
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
        input, select, textarea { width: 100%; min-width: 0; background: var(--input-bg); border: 1px solid var(--border); border-radius: 8px; padding: 0.75rem 1rem; color: var(--foreground); outline: none; }
        input:focus, select:focus, textarea:focus { border-color: var(--primary); }
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
          .shipping-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 1.25rem !important;
            margin-bottom: 2rem !important;
          }
          .btn-save-shipping {
            width: 100% !important;
            justify-content: center !important;
          }
          .shipping-layout-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
          .shipping-nav {
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
          .shipping-settings-card {
            padding: 1.5rem !important;
            gap: 1.5rem !important;
          }
          .shipping-settings-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 1rem !important;
          }
          .shipping-modes-grid,
          .shipping-fields-grid,
          .shipping-address-grid-1,
          .shipping-address-grid-2 {
            grid-template-columns: 1fr !important;
          }
          .mode-label {
            padding: 1rem !important;
          }
        }

        @media (max-width: 768px) {
          .glass-card {
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
