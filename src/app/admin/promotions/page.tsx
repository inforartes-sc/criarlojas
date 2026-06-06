"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Save, Loader2, Tag, Percent, Sparkles, X, Check, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { useAdminAuth } from '@/context/AdminAuthContext'

export default function PromotionsPage() {
  const { store } = useAdminAuth()
  const plan = store?.settings?.plan || 'basic'
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [storeId, setStoreId] = useState('')
  const [activeTab, setActiveTab] = useState('campaign')
  const [products, setProducts] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const [promotions, setPromotions] = useState({
    active_campaign: {
      active: false,
      title: 'Semana do Consumidor',
      subtitle: 'Aproveite nossa seleção com descontos exclusivos por tempo limitado!',
      bg_color: '#ef4444',
      text_color: '#ffffff',
      product_ids: [] as string[]
    },
    coupons: [
      { code: 'BEMVINDO10', type: 'percent', value: 10, min_order: 100, active: true, uses: 0, max_uses: 100 },
      { code: 'FRETEOFF', type: 'fixed', value: 20, min_order: 250, active: true, uses: 12, max_uses: 50 }
    ]
  })

  useEffect(() => {
    if (store) {
      fetchPromotionsAndProducts()
    }
  }, [store])

  const fetchPromotionsAndProducts = async () => {
    if (!store) return
    setLoading(true)
    try {
      setStoreId(store.id)
      const s = store.settings || {}
      if (s.promotions) {
        setPromotions({
          active_campaign: { ...promotions.active_campaign, ...s.promotions.active_campaign },
          coupons: s.promotions.coupons || promotions.coupons
        })
      }

      // Fetch products filtered by store.id to avoid data leaks
      try {
        const { data: prodData, error: prodError } = await supabase
          .from('products')
          .select('*')
          .eq('store_id', store.id)
          .order('created_at', { ascending: false })

        if (!prodError && prodData) {
          setProducts(prodData)
        }
      } catch (err) {
        console.warn('Products fetch warning:', err)
      }

    } catch (error: any) {
      console.error('Erro geral ao buscar promoções:', error.message)
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
          settings: { ...currentSettings, promotions }
        })
        .eq('id', store.id)

      if (updateError) throw updateError
      toast.success('Promoções e Cupons salvos com sucesso!')
    } catch (error: any) {
      toast.error('Erro ao salvar promoções: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const toggleProductInCampaign = (productId: string) => {
    const currentIds = promotions.active_campaign.product_ids || []
    const exists = currentIds.includes(productId)
    const newIds = exists ? currentIds.filter(id => id !== productId) : [...currentIds, productId]
    
    setPromotions({
      ...promotions,
      active_campaign: {
        ...promotions.active_campaign,
        product_ids: newIds
      }
    })
  }

  const filteredProducts = products.filter(p => (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()))

  if (loading) {
    return (
      <div style={{ padding: '5rem', textAlign: 'center' }}>
        <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto', color: '#6366f1' }} />
        <p style={{ marginTop: '1rem', color: 'var(--muted)' }}>Carregando promoções e cupons...</p>
      </div>
    )
  }

  if (plan !== 'premium') {
    return (
      <div className="glass-card" style={{ padding: '3.5rem 2.5rem', textAlign: 'center', maxWidth: '600px', margin: '4rem auto', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#6366f1' }}>
          <Sparkles size={32} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--foreground)', marginBottom: '0.75rem' }}>Recurso Exclusivo do Plano Premium</h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '2rem' }}>
          Campanhas de promoções e cupons de desconto não estão ativos no seu plano atual (<strong>{plan === 'pro' ? 'Profissional' : 'Básico'}</strong>). Faça um upgrade agora mesmo para liberar todas as ferramentas de conversão da plataforma.
        </p>
        <Link href="/admin/subscription" style={{ display: 'inline-block', padding: '0.85rem 2rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)', transition: '0.2s' }}>
          Ver Planos & Fazer Upgrade
        </Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1000px', width: '100%' }} className="promotions-page-container">
      <header className="promotions-header" style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ minWidth: '280px', flex: '1' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Promoções e Cupons</h1>
          <p style={{ color: 'var(--muted)' }}>Crie campanhas de destaque na página inicial e gerencie cupons de desconto.</p>
        </div>
        <button 
          onClick={handleSubmit} 
          disabled={saving} 
          className="btn-save-settings btn-save-promotions" 
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
          <span>Salvar Promoções</span>
        </button>
      </header>

      <div className="promotions-layout-grid" style={{ display: 'grid', gridTemplateColumns: '220px minmax(0, 1fr)', gap: '2rem' }}>
        <nav className="promotions-nav" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { id: 'campaign', label: 'Campanha de Ofertas', icon: Sparkles, active: promotions.active_campaign.active },
            { id: 'coupons', label: 'Cupons de Desconto', icon: Percent, active: promotions.coupons.some(c => c.active) }
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

        <div style={{ display: 'grid', gap: '2rem', minWidth: 0, width: '100%' }}>
          {/* CAMPANHAS DE OFERTAS */}
          {activeTab === 'campaign' && (
            <div className="glass-card" style={{ padding: '2.5rem', display: 'grid', gap: '2rem', minWidth: 0, width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
                <div style={{ flex: '1', minWidth: '280px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Vitrine de Campanha Especial</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    Quando ativa e com produtos selecionados, cria automaticamente uma seção exclusiva no topo da loja.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setPromotions({ ...promotions, active_campaign: { ...promotions.active_campaign, active: !promotions.active_campaign.active } })}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '100px',
                      border: promotions.active_campaign.active ? '2px solid #10b981' : '2px solid var(--border)',
                      backgroundColor: promotions.active_campaign.active ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                      color: promotions.active_campaign.active ? '#10b981' : 'var(--muted)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: promotions.active_campaign.active ? '#10b981' : 'var(--muted)' }} />
                    <span>{promotions.active_campaign.active ? 'Campanha Ativa no Site' : 'Campanha Inativa'}</span>
                  </button>
                </div>
              </div>

              <div className="promotions-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div className="form-group">
                  <label>Título da Campanha</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Semana do Consumidor" 
                    value={promotions.active_campaign.title} 
                    onChange={e => setPromotions({ ...promotions, active_campaign: { ...promotions.active_campaign, title: e.target.value } })} 
                  />
                </div>
                <div className="form-group">
                  <label>Subtítulo / Descrição</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Aproveite nossa seleção com descontos..." 
                    value={promotions.active_campaign.subtitle} 
                    onChange={e => setPromotions({ ...promotions, active_campaign: { ...promotions.active_campaign, subtitle: e.target.value } })} 
                  />
                </div>
              </div>

              <div className="promotions-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div className="form-group">
                  <label>Cor de Fundo da Seção</label>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <input 
                      type="color" 
                      value={promotions.active_campaign.bg_color} 
                      onChange={e => setPromotions({ ...promotions, active_campaign: { ...promotions.active_campaign, bg_color: e.target.value } })} 
                      style={{ width: '50px', height: '50px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    />
                    <input 
                      type="text" 
                      value={promotions.active_campaign.bg_color} 
                      onChange={e => setPromotions({ ...promotions, active_campaign: { ...promotions.active_campaign, bg_color: e.target.value } })} 
                      style={{ flex: 1, fontFamily: 'monospace' }}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Cor do Texto da Seção</label>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <input 
                      type="color" 
                      value={promotions.active_campaign.text_color} 
                      onChange={e => setPromotions({ ...promotions, active_campaign: { ...promotions.active_campaign, text_color: e.target.value } })} 
                      style={{ width: '50px', height: '50px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    />
                    <input 
                      type="text" 
                      value={promotions.active_campaign.text_color} 
                      onChange={e => setPromotions({ ...promotions, active_campaign: { ...promotions.active_campaign, text_color: e.target.value } })} 
                      style={{ flex: 1, fontFamily: 'monospace' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Produtos na Campanha ({promotions.active_campaign.product_ids?.length || 0})</h4>
                    <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Selecione quais produtos farão parte desta vitrine especial usando a barra de pesquisa abaixo.</p>
                  </div>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <input 
                      type="text" 
                      placeholder="Digite o nome do produto para buscar e adicionar à campanha..." 
                      value={searchQuery} 
                      onChange={e => setSearchQuery(e.target.value)}
                      style={{ width: '100%', padding: '1rem 1.5rem 1rem 3.5rem', borderRadius: '12px', border: '2px solid var(--border)', background: 'var(--input-bg)', color: 'var(--foreground)', fontSize: '1rem', outline: 'none', transition: 'all 0.2s ease' }}
                    />
                    <Search size={22} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                  </div>
                </div>

                <div className="promotions-products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {filteredProducts.map(product => {
                    const isSelected = (promotions.active_campaign.product_ids || []).includes(product.id)
                    const imgUrl = product.image_url || product.images?.[0]
                    return (
                      <div 
                        key={product.id}
                        onClick={() => toggleProductInCampaign(product.id)}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '1rem', 
                          padding: '1rem', 
                          borderRadius: '12px', 
                          border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                          backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.05)' : 'rgba(255,255,255,0.01)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)', flexShrink: 0 }}>
                          {imgUrl ? <img src={imgUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Tag size={24} color="var(--muted)" style={{ margin: '13px' }} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</div>
                          <div style={{ fontSize: '0.8rem', color: product.sale_price ? '#ef4444' : 'var(--muted)', fontWeight: 600, marginTop: '0.2rem' }}>
                            {product.sale_price ? `R$ ${Number(product.sale_price).toFixed(2)}` : `R$ ${Number(product.price).toFixed(2)}`}
                          </div>
                        </div>
                        <div style={{ width: '24px', height: '24px', borderRadius: '6px', border: isSelected ? 'none' : '2px solid var(--border)', backgroundColor: isSelected ? 'var(--primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {isSelected && <Check size={16} color="#fff" />}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* CUPONS DE DESCONTO */}
          {activeTab === 'coupons' && (
            <div className="glass-card" style={{ padding: '2.5rem', display: 'grid', gap: '2rem', minWidth: 0, width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
                <div style={{ flex: '1', minWidth: '280px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Cupons de Desconto</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Crie códigos promocionais para seus clientes utilizarem no carrinho ou checkout.</p>
                </div>
                <button 
                  onClick={() => setPromotions({ ...promotions, coupons: [...promotions.coupons, { code: 'NOVO' + Math.floor(Math.random()*1000), type: 'percent', value: 10, min_order: 100, active: true, uses: 0, max_uses: 100 }] })}
                  style={{ padding: '0.75rem 1.5rem', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  + Novo Cupom
                </button>
              </div>

              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {promotions.coupons.map((coupon, index) => (
                  <div key={index} style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'rgba(255,255,255,0.01)', display: 'grid', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ padding: '0.4rem 1rem', borderRadius: '6px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', fontWeight: 800, fontFamily: 'monospace', fontSize: '1.1rem' }}>
                          {coupon.code}
                        </span>
                        <label className="switch">
                          <input 
                            type="checkbox" 
                            checked={coupon.active} 
                            onChange={e => {
                              const newC = [...promotions.coupons];
                              newC[index].active = e.target.checked;
                              setPromotions({ ...promotions, coupons: newC });
                            }} 
                          />
                          <span className="slider round"></span>
                        </label>
                        <span style={{ fontSize: '0.85rem', color: coupon.active ? '#10b981' : 'var(--muted)', fontWeight: 600 }}>
                          {coupon.active ? 'Cupom Ativo' : 'Cupom Inativo'}
                        </span>
                      </div>
                      <button 
                        onClick={() => {
                          const newC = promotions.coupons.filter((_, i) => i !== index);
                          setPromotions({ ...promotions, coupons: newC });
                        }}
                        style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                        title="Excluir Cupom"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                      <div className="form-group">
                        <label>Código do Cupom</label>
                        <input 
                          type="text" 
                          value={coupon.code} 
                          onChange={e => {
                            const newC = [...promotions.coupons];
                            newC[index].code = e.target.value.toUpperCase().replace(/\s+/g, '');
                            setPromotions({ ...promotions, coupons: newC });
                          }} 
                        />
                      </div>
                      <div className="form-group">
                        <label>Tipo de Desconto</label>
                        <select 
                          value={coupon.type} 
                          onChange={e => {
                            const newC = [...promotions.coupons];
                            newC[index].type = e.target.value;
                            setPromotions({ ...promotions, coupons: newC });
                          }}
                          style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--foreground)', outline: 'none' }}
                        >
                          <option value="percent" style={{color:'#000'}}>Percentual (%)</option>
                          <option value="fixed" style={{color:'#000'}}>Valor Fixo (R$)</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>{coupon.type === 'percent' ? 'Desconto (%)' : 'Desconto (R$)'}</label>
                        <input 
                          type="number" 
                          min="0"
                          value={coupon.value} 
                          onChange={e => {
                            const newC = [...promotions.coupons];
                            newC[index].value = Number(e.target.value);
                            setPromotions({ ...promotions, coupons: newC });
                          }} 
                        />
                      </div>
                      <div className="form-group">
                        <label>Pedido Mínimo (R$)</label>
                        <input 
                          type="number" 
                          min="0"
                          value={coupon.min_order} 
                          onChange={e => {
                            const newC = [...promotions.coupons];
                            newC[index].min_order = Number(e.target.value);
                            setPromotions({ ...promotions, coupons: newC });
                          }} 
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--muted)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                      <span>Utilizado: <strong>{coupon.uses}</strong> vezes</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>Limite de Usos:</span>
                        <input 
                          type="number" 
                          value={coupon.max_uses} 
                          onChange={e => {
                            const newC = [...promotions.coupons];
                            newC[index].max_uses = Number(e.target.value);
                            setPromotions({ ...promotions, coupons: newC });
                          }}
                          style={{ width: '80px', padding: '0.3rem 0.5rem', fontSize: '0.85rem' }} 
                        />
                      </div>
                    </div>
                  </div>
                ))}
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
          .promotions-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 1.25rem !important;
            margin-bottom: 2rem !important;
          }
          .btn-save-promotions {
            width: 100% !important;
            justify-content: center !important;
          }
          .promotions-layout-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
          .promotions-nav {
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
          .promotions-products-grid,
          .promotions-form-grid {
            grid-template-columns: minmax(0, 1fr) !important;
            width: 100% !important;
          }
          .form-group {
            width: 100% !important;
            min-width: 0 !important;
          }
        }

        @media (max-width: 768px) {
          .glass-card {
            padding: 1.25rem !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            border-radius: 12px !important;
            border: 1px solid var(--border) !important;
            width: 100% !important;
            min-width: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}
