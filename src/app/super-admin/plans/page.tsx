"use client"

import { useState, useEffect } from 'react'
import { Layers, Check, Edit2, X, Plus, DollarSign, ShieldCheck, Star, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

export default function SuperAdminPlans() {
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [recordId, setRecordId] = useState<string>('')
  const [globalSettings, setGlobalSettings] = useState<any>({})

  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    fetchPlansAndSettings()
  }, [])

  const fetchPlansAndSettings = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('subdomain', 'platform-settings')
        .maybeSingle()

      if (error) throw error

      const defaultPlans = [
        {
          id: 'basic',
          name: 'Plano Básico',
          price: 29.90,
          billingCycle: 'mensal',
          desc: 'Ideal para quem está começando a sua primeira loja virtual com baixo investimento (Catálogo Digital via WhatsApp).',
          features: ['Até 50 produtos cadastrados', 'Taxa de transação de 2.0%', 'Suporte via E-mail', 'Certificado SSL Grátis', '[-] Carrinho de Compras & Checkout', '[-] Integração de Envio Correios/Melhor Envio', '[-] Botão do WhatsApp Personalizado'],
          active: true,
          subscribers: 0,
          popular: false,
          buttonText: 'Contratar Plano Básico',
          comissionRate: 2.0
        },
        {
          id: 'pro',
          name: 'Plano Profissional',
          price: 34.90,
          billingCycle: 'mensal',
          desc: 'Perfeito para lojistas em expansão com alto volume de vendas, checkout e frete integrado.',
          features: ['Até 500 produtos cadastrados', 'Taxa de transação de 1.0%', 'Suporte Prioritário WhatsApp', 'Checkout Transparente e Carrinho', 'Gateways Mercado Pago & Asaas', 'Cálculo de Frete Integrado', 'Botão do WhatsApp Personalizado', '[-] Cupons de Desconto & Pixels'],
          active: true,
          subscribers: 0,
          popular: true,
          buttonText: 'Contratar Plano Pro',
          comissionRate: 1.0
        },
        {
          id: 'premium',
          name: 'Premium Ilimitado',
          price: 47.90,
          billingCycle: 'mensal',
          desc: 'Para marcas e operações completas que exigem cupons, pixels, reviews e promoções.',
          features: ['Produtos e Variações Ilimitadas', 'Taxa de transação ZERO (0%)', 'Suporte VIP 24/7 Dedicado', 'Cupons de Desconto', 'Avaliação de Produtos (Reviews)', 'Pixels de Rastreamento (Meta/Google)', 'Campanhas de Promoções', 'Botão do WhatsApp Personalizado'],
          active: true,
          subscribers: 0,
          popular: false,
          buttonText: 'Contratar Premium VIP',
          comissionRate: 0.0
        }
      ]

      if (data) {
        setRecordId(data.id)
        const s = data.settings || {}
        setGlobalSettings(s)
        
        if (!s.plans || !Array.isArray(s.plans) || s.plans.length === 0) {
          const updatedSettings = { ...s, plans: defaultPlans }
          const { error: updateError } = await supabase
            .from('stores')
            .update({ settings: updatedSettings })
            .eq('id', data.id)
          
          if (updateError) console.error('Erro ao salvar planos iniciais:', updateError)
          
          setGlobalSettings(updatedSettings)
          setPlans(defaultPlans)
        } else {
          const updatedPlans = s.plans.map((p: any) => {
            const features = p.features || []
            const hasFeature = features.some((f: any) => typeof f === 'string' && f.includes('Botão do WhatsApp Personalizado'));
            if (!hasFeature) {
              return {
                ...p,
                features: [
                  ...features,
                  p.id === 'basic' ? '[-] Botão do WhatsApp Personalizado' : 'Botão do WhatsApp Personalizado'
                ]
              };
            }
            return p;
          });
          setPlans(updatedPlans)
        }
      } else {
        const newSettings = {
          plans: defaultPlans,
          platformName: 'Criar Lojas E-commerce SaaS',
          mainDomain: 'criarlojas.com.br',
          supportEmail: 'suporte@criarlojas.com.br',
          whatsappSupport: '5511999998888',
          maintenanceMode: false,
          allowNewRegistrations: true,
          webhookSecret: 'whsec_abc123xyz789criarlojas',
          supabaseUrl: 'https://schcpfbnochnevsivtaj.supabase.co',
          maxStoresPerUser: 10,
          businessHours: 'Seg - Sex, das 9h às 18h',
          adminEmail: 'admin@criarlojas.com.br',
          adminPassword: 'admin'
        }

        const { data: insertedData, error: insertError } = await supabase
          .from('stores')
          .insert({
            subdomain: 'platform-settings',
            name: 'Configurações da Plataforma',
            settings: newSettings
          })
          .select()
          .maybeSingle()

        if (insertError) throw insertError

        if (insertedData) {
          setRecordId(insertedData.id)
          setGlobalSettings(newSettings)
          setPlans(defaultPlans)
        }
      }
    } catch (err: any) {
      console.error('Erro ao carregar planos:', err)
      toast.error('Erro ao carregar os planos do banco de dados.')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenEdit = (plan: any) => {
    setSelectedPlan({ ...plan })
    setIsCreating(false)
    setShowEditModal(true)
  }

  const handleOpenCreate = () => {
    setSelectedPlan({
      id: `plan_${Date.now()}`,
      name: 'Novo Plano Customizado',
      price: 99.00,
      billingCycle: 'mensal',
      desc: 'Descrição completa dos diferenciais e público-alvo deste plano comercial.',
      features: ['Benefício exclusivo 1', 'Benefício exclusivo 2', 'Suporte prioritário', 'Integração completa'],
      active: true,
      subscribers: 0,
      popular: false,
      buttonText: 'Assinar Agora',
      comissionRate: 1.5
    })
    setIsCreating(true)
    setShowEditModal(true)
  }

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validação básica
    if (!selectedPlan.name.trim()) {
      toast.error('O nome do plano é obrigatório.')
      return
    }

    let updatedPlans = []
    if (isCreating) {
      updatedPlans = [...plans, selectedPlan]
    } else {
      updatedPlans = plans.map(p => p.id === selectedPlan.id ? selectedPlan : p)
    }

    try {
      // Buscar configurações mais recentes do banco para não perder outros campos (como gatewayConfig)
      const { data: dbData, error: fetchErr } = await supabase
        .from('stores')
        .select('settings')
        .eq('subdomain', 'platform-settings')
        .maybeSingle()

      if (fetchErr) throw fetchErr
      const currentSettings = dbData?.settings || {}

      const { data: updatedRows, error } = await supabase
        .from('stores')
        .update({
          settings: {
            ...currentSettings,
            plans: updatedPlans
          }
        })
        .eq('id', recordId)
        .select()

      if (error) throw error

      if (!updatedRows || updatedRows.length === 0) {
        throw new Error('Nenhuma linha foi alterada. O Supabase pode estar bloqueando a atualização via RLS.')
      }

      setPlans(updatedPlans)
      setGlobalSettings((prev: any) => ({ ...prev, ...currentSettings, plans: updatedPlans }))
      toast.success(isCreating ? 'Novo plano comercial criado com sucesso!' : 'Todas as informações do card atualizadas com sucesso!')
      setShowEditModal(false)
    } catch (err: any) {
      console.error('Erro ao salvar plano:', err)
      toast.error('Erro ao salvar o plano no banco de dados: ' + (err.message || 'Erro desconhecido'))
    }
  }

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Tem certeza que deseja remover este plano comercial?')) return

    const updatedPlans = plans.filter(p => p.id !== planId)

    try {
      // Buscar configurações mais recentes do banco para não perder outros campos (como gatewayConfig)
      const { data: dbData, error: fetchErr } = await supabase
        .from('stores')
        .select('settings')
        .eq('subdomain', 'platform-settings')
        .maybeSingle()

      if (fetchErr) throw fetchErr
      const currentSettings = dbData?.settings || {}

      const { data: updatedRows, error } = await supabase
        .from('stores')
        .update({
          settings: {
            ...currentSettings,
            plans: updatedPlans
          }
        })
        .eq('id', recordId)
        .select()

      if (error) throw error

      if (!updatedRows || updatedRows.length === 0) {
        throw new Error('Nenhuma linha foi alterada. O Supabase pode estar bloqueando a atualização via RLS.')
      }

      setPlans(updatedPlans)
      setGlobalSettings((prev: any) => ({ ...prev, ...currentSettings, plans: updatedPlans }))
      toast.success('Plano removido com sucesso.')
      setShowEditModal(false)
    } catch (err: any) {
      console.error('Erro ao remover plano:', err)
      toast.error('Erro ao remover o plano no banco de dados: ' + (err.message || 'Erro desconhecido'))
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '10rem 5rem', textAlign: 'center' }}>
        <Loader2 className="animate-spin" size={40} style={{ margin: '0 auto', color: '#10b981' }} />
        <p style={{ marginTop: '1rem', color: 'var(--muted)', fontSize: '1rem', fontWeight: 600 }}>Carregando planos de assinatura do banco de dados...</p>
        <style>{`
          .animate-spin { animation: spin 1s linear infinite; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: '2.5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--foreground)' }}>Planos de Assinatura (SaaS)</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Gerencie pacotes, preços, ciclos, botões e todos os benefícios exibidos nos cards da plataforma.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          style={{ padding: '0.75rem 1.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
          className="btn-create"
        >
          <Plus size={20} />
          <span>Criar Novo Plano</span>
        </button>
      </header>

      {/* Grid de Planos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
        {plans.map((plan) => (
          <div key={plan.id} className="glass-card plan-card" style={{ padding: '2.5rem', border: plan.popular ? '2px solid #10b981' : '1px solid var(--border)', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: '16px', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s' }}>
            {plan.popular && (
              <div style={{ position: 'absolute', top: 0, right: 0, background: 'linear-gradient(135deg, #10b981, #0ea5e9)', color: 'white', fontSize: '0.75rem', fontWeight: 800, padding: '0.35rem 1.25rem', borderRadius: '0 0 0 16px', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Star size={12} fill="white" />
                <span>Mais Escolhido</span>
              </div>
            )}

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--foreground)' }}>{plan.name}</h3>
                <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: '20px', background: plan.active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: plan.active ? '#10b981' : '#ef4444', fontWeight: 700, border: plan.active ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)' }}>
                  {plan.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.4 }}>{plan.desc}</p>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '2rem' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--muted)' }}>R$</span>
                <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--foreground)' }}>{plan.price.toFixed(2)}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>/{plan.billingCycle}</span>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginBottom: '2.5rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.5px' }}>Recursos e Benefícios</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.85rem' }}>
                  {plan.features.map((f: any, i: number) => {
                    const isExcluded = typeof f === 'string' && (f.startsWith('[-] ') || f.startsWith('[-]'));
                    const cleanText = typeof f === 'string' ? (isExcluded ? f.replace(/^\[-\]\s*/, '') : f) : '';
                    
                    return (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: isExcluded ? 'var(--muted)' : 'var(--foreground)', fontWeight: 500, textDecoration: isExcluded ? 'line-through' : 'none', opacity: isExcluded ? 0.75 : 1 }}>
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: isExcluded ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isExcluded ? '#ef4444' : '#10b981', flexShrink: 0 }}>
                          {isExcluded ? <X size={12} /> : <Check size={12} />}
                        </div>
                        <span style={{ lineHeight: 1.3 }}>{cleanText}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            <div>


              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', background: 'rgba(14, 165, 233, 0.08)', border: '1px solid rgba(14, 165, 233, 0.2)', borderRadius: '10px', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>Taxa de Comissão (Split):</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0ea5e9' }}>{plan.comissionRate ?? 0}%</span>
              </div>

              <div style={{ padding: '0.85rem 1rem', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '10px', color: '#10b981', fontWeight: 800, fontSize: '0.9rem', textAlign: 'center', marginBottom: '1.25rem' }}>
                Botão: "{plan.buttonText || 'Assinar Agora'}"
              </div>

              <button 
                onClick={() => handleOpenEdit(plan)}
                style={{ width: '100%', padding: '0.85rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: '0.2s' }}
                className="btn-edit"
              >
                <Edit2 size={16} />
                <span>Editar Card Completo</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Tabela Comparativa de Recursos */}
      <section className="glass-card" style={{ padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--border)', marginTop: '1rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={24} style={{ color: '#10b981' }} />
            <span>Matriz de Recursos & Comparativo de Planos</span>
          </h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Compare de forma transparente todas as funcionalidades e limites de cada pacote disponível para os lojistas.</p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '1.25rem 1rem', fontWeight: 700, color: 'var(--muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Funcionalidade / Recurso</th>
                <th style={{ padding: '1.25rem 1rem', fontWeight: 800, color: 'var(--foreground)', fontSize: '1rem', textAlign: 'center', width: '22%' }}>Básico <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--muted)', marginTop: '0.25rem' }}>R$ 29,90/mês</span></th>
                <th style={{ padding: '1.25rem 1rem', fontWeight: 800, color: '#10b981', fontSize: '1rem', textAlign: 'center', width: '22%' }}>Profissional <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--muted)', marginTop: '0.25rem' }}>R$ 34,90/mês</span></th>
                <th style={{ padding: '1.25rem 1rem', fontWeight: 800, color: '#0ea5e9', fontSize: '1rem', textAlign: 'center', width: '22%' }}>Premium <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--muted)', marginTop: '0.25rem' }}>R$ 47,90/mês</span></th>
              </tr>
            </thead>
            <tbody style={{ fontSize: '0.95rem' }}>
              {[
                {
                  cat: 'Vendas & Checkout',
                  items: [
                    { name: 'Catálogo Digital (Pedidos via WhatsApp)', basic: true, pro: true, premium: true },
                    { name: 'Carrinho de Compras & Checkout Online', basic: false, pro: true, premium: true },
                    { name: 'Integração de Gateways (Mercado Pago, Asaas)', basic: false, pro: true, premium: true },
                    { name: 'Cálculo de Envio & Frete (Correios/Melhor Envio)', basic: false, pro: true, premium: true }
                  ]
                },
                {
                  cat: 'Marketing & Conversão',
                  items: [
                    { name: 'Cupons de Desconto Personalizados', basic: false, pro: false, premium: true },
                    { name: 'Avaliação de Produtos (Reviews de Clientes)', basic: false, pro: false, premium: true },
                    { name: 'Campanhas de Promoção & Banner Superior', basic: false, pro: false, premium: true },
                    { name: 'Pixels de Rastreamento (Meta, Google, TikTok)', basic: false, pro: false, premium: true },
                    { name: 'Botão do WhatsApp Personalizado', basic: false, pro: true, premium: true }
                  ]
                },
                {
                  cat: 'Limites & Taxas',
                  items: [
                    { name: 'Cadastro de Produtos', basic: 'Até 50', pro: 'Até 500', premium: 'Ilimitado' },
                    { name: 'Taxa de Transação da Plataforma', basic: '2.0% de comissão', pro: '1.0% de comissão', premium: 'Taxa Zero (0.0%)' },
                    { name: 'Suporte Técnico', basic: 'E-mail', pro: 'WhatsApp Prioritário', premium: 'WhatsApp VIP 24/7' }
                  ]
                }
              ].map((category, idx) => (
                <optgroup key={idx} label={category.cat} style={{ display: 'table-row-group' }}>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                    <td colSpan={4} style={{ padding: '0.75rem 1rem', fontWeight: 800, color: '#10b981', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--border)' }}>
                      {category.cat}
                    </td>
                  </tr>
                  {category.items.map((item, itemIdx) => (
                    <tr key={itemIdx} style={{ borderBottom: '1px solid var(--border)' }} className="table-row-hover">
                      <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--foreground)' }}>{item.name}</td>
                      {[item.basic, item.pro, item.premium].map((val, valIdx) => (
                        <td key={valIdx} style={{ padding: '1rem', textAlign: 'center' }}>
                          {typeof val === 'boolean' ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: val ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: val ? '#10b981' : '#ef4444' }}>
                              {val ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
                            </div>
                          ) : (
                            <span style={{ fontWeight: 700, color: valIdx === 0 ? 'var(--foreground)' : valIdx === 1 ? '#10b981' : '#0ea5e9' }}>
                              {val}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </optgroup>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal de Edição / Criação do Plano */}
      {showEditModal && selectedPlan && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(9, 13, 22, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <div className="glass-card" style={{ maxWidth: '750px', width: '100%', padding: '2.5rem', position: 'relative', borderRadius: '16px', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setShowEditModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--muted)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}>
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <Layers size={26} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--foreground)' }}>
                  {isCreating ? 'Criar Novo Plano de Assinatura' : `Editar Card: ${selectedPlan.name}`}
                </h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                  {isCreating ? 'Configure todas as informações e diferenciais do novo pacote comercial.' : 'Altere preços, ciclos, benefícios e o visual exibido no card da plataforma.'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSavePlan} style={{ display: 'grid', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>Nome do Plano</label>
                  <input 
                    type="text" 
                    value={selectedPlan.name}
                    onChange={e => setSelectedPlan({...selectedPlan, name: e.target.value})}
                    placeholder="Ex: Plano Profissional"
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', outline: 'none', fontWeight: 600 }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>Preço (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={selectedPlan.price}
                    onChange={e => setSelectedPlan({...selectedPlan, price: parseFloat(e.target.value) || 0})}
                    placeholder="149.00"
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', outline: 'none', fontWeight: 600 }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>Ciclo</label>
                  <select 
                    value={selectedPlan.billingCycle}
                    onChange={e => setSelectedPlan({...selectedPlan, billingCycle: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', outline: 'none', fontWeight: 600, cursor: 'pointer' }}
                  >
                    <option value="mensal">Mensal</option>
                    <option value="trimestral">Trimestral</option>
                    <option value="semestral">Semestral</option>
                    <option value="anual">Anual</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>Comissão (%)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={selectedPlan.comissionRate ?? 0}
                    onChange={e => setSelectedPlan({...selectedPlan, comissionRate: parseFloat(e.target.value) || 0})}
                    placeholder="2.0"
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', outline: 'none', fontWeight: 600 }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>Descrição Comercial</label>
                <textarea 
                  rows={2}
                  value={selectedPlan.desc}
                  onChange={e => setSelectedPlan({...selectedPlan, desc: e.target.value})}
                  placeholder="Perfeito para lojistas em expansão com alto volume de vendas."
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', outline: 'none', fontWeight: 500, resize: 'none' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>Texto do Botão de Ação</label>
                <input 
                  type="text" 
                  value={selectedPlan.buttonText || ''}
                  onChange={e => setSelectedPlan({...selectedPlan, buttonText: e.target.value})}
                  placeholder="Ex: Assinar Plano Pro"
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', outline: 'none', fontWeight: 600 }}
                  required
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)' }}>Lista de Recursos / Benefícios</label>
                  <span style={{ fontSize: '0.75rem', color: '#0ea5e9', fontWeight: 600 }}>Escreva [-] no início da linha para exibir como "Não Acompanha" (X vermelho)</span>
                </div>
                <textarea 
                  rows={6}
                  value={selectedPlan.features?.join('\n') || ''}
                  onChange={e => setSelectedPlan({
                    ...selectedPlan, 
                    features: e.target.value.split('\n').filter(line => line.trim() !== '')
                  })}
                  placeholder="Até 500 produtos cadastrados&#10;Taxa de transação de 1.0%&#10;[-] Integração de ERP Externa&#10;[-] Gerente de Contas Dedicado"
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', outline: 'none', fontWeight: 500, resize: 'vertical', lineHeight: 1.5 }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', background: 'var(--input-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>Destaque de Popularidade</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <input 
                      type="checkbox" 
                      id="popularCheck"
                      checked={selectedPlan.popular || false}
                      onChange={e => setSelectedPlan({...selectedPlan, popular: e.target.checked})}
                      style={{ width: '20px', height: '20px', accentColor: '#10b981', cursor: 'pointer' }}
                    />
                    <label htmlFor="popularCheck" style={{ fontWeight: 700, color: 'var(--foreground)', cursor: 'pointer', fontSize: '0.9rem' }}>
                      🌟 Exibir selo "Mais Escolhido" e borda verde no card
                    </label>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>Status Comercial do Plano</label>
                  <select 
                    value={selectedPlan.active ? 'true' : 'false'}
                    onChange={e => setSelectedPlan({...selectedPlan, active: e.target.value === 'true'})}
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', outline: 'none', fontWeight: 600, cursor: 'pointer' }}
                  >
                    <option value="true">Ativo (Disponível para novas assinaturas)</option>
                    <option value="false">Inativo (Oculto para novos clientes)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', marginTop: '1rem' }}>
                <div>
                  {!isCreating && (
                    <button 
                      type="button" 
                      onClick={() => handleDeletePlan(selectedPlan.id)} 
                      style={{ padding: '0.75rem 1.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '10px', color: '#ef4444', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Remover Plano
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" onClick={() => setShowEditModal(false)} style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', fontWeight: 600, cursor: 'pointer' }}>
                    Cancelar
                  </button>
                  <button type="submit" style={{ padding: '0.75rem 2.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' }}>
                    {isCreating ? 'Confirmar & Criar Plano' : 'Salvar Todas as Alterações'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .btn-create:hover { filter: brightness(1.1); }
        .btn-edit:hover { background: var(--background) !important; border-color: #10b981 !important; color: #10b981 !important; }
        .plan-card:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.3); }
      `}</style>
    </div>
  )
}
