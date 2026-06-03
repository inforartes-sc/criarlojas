"use client"

import { useState, useEffect } from 'react'
import { 
  Store, 
  UserPlus, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Eye, 
  Check, 
  X, 
  Send, 
  Clock, 
  Layers, 
  Palette, 
  Phone, 
  Mail, 
  Calendar,
  Loader2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

export default function SuperAdminRequests() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Estado para o Modal de Detalhes da Solicitação
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [activatingId, setActivatingId] = useState<string | null>(null)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const storesList = data || []
      // Filtra apenas os registros que são solicitações pendentes de criação OU de cancelamento
      const pendingList = storesList.filter(store => store.settings?.is_pending_request === true || store.settings?.is_pending_cancellation === true)
      setRequests(pendingList)
    } catch (err: any) {
      console.error('Erro ao buscar solicitações:', err)
      toast.error('Erro ao carregar solicitações de lojas.')
    } finally {
      setLoading(false)
    }
  }

  // Filtragem
  const filteredRequests = requests.filter(req => {
    const s = req.settings || {}
    const nameMatch = (s.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    const userMatch = (s.admin_user || '').toLowerCase().includes(searchTerm.toLowerCase())
    const emailMatch = (s.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    const subMatch = (s.subdomain || '').toLowerCase().includes(searchTerm.toLowerCase())
    return nameMatch || userMatch || emailMatch || subMatch
  })

  // Função para Aprovar e Ativar a Loja (Onboarding)
  const handleApproveStore = async (req: any) => {
    setActivatingId(req.id)
    try {
      const s = req.settings || {}
      const updatedSettings = {
        ...s,
        is_pending_request: false, // Remove flag de solicitação
        active: true,              // Ativa a loja
        billing_enabled: true,     // Ativa o faturamento
        admin_password: s.admin_password || 'mudar123', // Senha padrão caso não tenha
        plan: s.plan || 'pro',
        model: s.model || 'modern',
        primaryColor: s.primaryColor || '#10b981',
        activated_at: new Date().toISOString()
      }

      // Atualiza no Supabase: muda o subdomínio real (tira o req-) e atualiza settings
      const cleanSubdomain = s.subdomain || req.subdomain.replace(/^req-/, '').replace(/-\d+$/, '')

      const { error } = await supabase
        .from('stores')
        .update({ 
          subdomain: cleanSubdomain,
          name: s.name || req.name,
          settings: updatedSettings 
        })
        .eq('id', req.id)

      if (error) throw error

      toast.success(`Loja "${s.name || req.name}" ativada e criada com sucesso!`)
      setShowModal(false)
      setSelectedRequest(null)
      // Atualiza a lista local
      setRequests(prev => prev.filter(item => item.id !== req.id))
    } catch (err: any) {
      console.error('Erro ao ativar loja:', err)
      toast.error('Erro ao ativar a loja. Verifique se o subdomínio já está em uso.')
    } finally {
      setActivatingId(null)
    }
  }

  // Função para Confirmar Cancelamento de Plano
  const handleApproveCancellation = async (req: any) => {
    if (!confirm(`Tem certeza que deseja confirmar o cancelamento do plano da loja "${req.settings?.name || req.name}"? A loja será desativada.`)) return

    setActivatingId(req.id)
    try {
      const s = req.settings || {}
      const updatedSettings = {
        ...s,
        is_pending_cancellation: false,
        active: false,
        billing_enabled: false,
        plan_status: 'cancelled',
        cancelled_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('stores')
        .update({ settings: updatedSettings })
        .eq('id', req.id)

      if (error) throw error

      toast.success(`Cancelamento da loja "${s.name || req.name}" processado com sucesso! A loja foi desativada.`)
      setShowModal(false)
      setSelectedRequest(null)
      setRequests(prev => prev.filter(item => item.id !== req.id))
    } catch (err: any) {
      console.error('Erro ao cancelar loja:', err)
      toast.error('Erro ao processar o cancelamento.')
    } finally {
      setActivatingId(null)
    }
  }

  // Função para Recusar / Excluir Solicitação de Criação
  const handleRejectRequest = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja recusar e excluir a solicitação da loja "${name}"?`)) return

    try {
      const { error } = await supabase.from('stores').delete().eq('id', id)
      if (error) throw error

      toast.success('Solicitação excluída com sucesso.')
      setShowModal(false)
      setSelectedRequest(null)
      setRequests(prev => prev.filter(item => item.id !== id))
    } catch (err: any) {
      console.error('Erro ao excluir solicitação:', err)
      toast.error('Erro ao excluir a solicitação.')
    }
  }

  // Monta link do WhatsApp para avisar o cliente da aprovação
  const getApprovalWhatsappLink = (req: any) => {
    const s = req.settings || {}
    const phone = (s.whatsapp || s.phone || '').replace(/\D/g, '')
    const cleanSub = s.subdomain || req.subdomain.replace(/^req-/, '').replace(/-\d+$/, '')
    const text = `Olá ${s.admin_user || 'Lojista'}! 🎉 Parabéns, sua loja virtual *${s.name || req.name}* foi APROVADA e ativada com sucesso na plataforma Criar Lojas!%0A%0A*🌐 URL da sua Loja:* http://${cleanSub}.localhost:3000%0A*🔐 Painel Administrativo:* http://${cleanSub}.localhost:3000/admin%0A*✉️ Usuário:* ${s.email}%0A*🔑 Senha temporária:* mudar123%0A%0ARecomendamos alterar sua senha no primeiro acesso. Boas vendas! 🚀`
    return `https://wa.me/${phone}?text=${text}`
  }

  return (
    <div style={{ display: 'grid', gap: '2.5rem' }}>
      {/* Cabeçalho */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <UserPlus size={26} color="#10b981" />
            <span>Solicitações & Onboarding (Lojas e Cancelamentos)</span>
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Gerencie, analise e aprove as solicitações de novas lojas virtuais e pedidos de cancelamento de plano enviados pelos clientes.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '320px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input 
              type="text" 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              placeholder="Buscar por loja, responsável, e-mail..."
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', outline: 'none', fontSize: '0.9rem' }}
            />
          </div>
        </div>
      </header>

      {/* Cards de Resumo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
            <Clock size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Aguardando Análise</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981' }}>{requests.length} {requests.length === 1 ? 'solicitação' : 'solicitações'}</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(14, 165, 233, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9' }}>
            <Store size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Setup & Gestão</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--foreground)' }}>100% Integrado</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Status do Módulo</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#6366f1' }}>Ativo & Operacional</span>
          </div>
        </div>
      </div>

      {/* Tabela de Solicitações */}
      <div className="glass-card" style={{ padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
        {loading ? (
          <div style={{ padding: '5rem', textAlign: 'center' }}><Loader2 size={32} className="animate-spin" color="#10b981" style={{ margin: '0 auto' }} /></div>
        ) : filteredRequests.length === 0 ? (
          <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--muted)', background: 'var(--input-bg)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
            Nenhuma solicitação pendente no momento.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '1rem', fontWeight: 700 }}>Loja / Solicitação</th>
                  <th style={{ padding: '1rem', fontWeight: 700 }}>Responsável & Contato</th>
                  <th style={{ padding: '1rem', fontWeight: 700 }}>Modelo (Vitrine)</th>
                  <th style={{ padding: '1rem', fontWeight: 700 }}>Plano Escolhido</th>
                  <th style={{ padding: '1rem', fontWeight: 700 }}>Data</th>
                  <th style={{ padding: '1rem', fontWeight: 700, textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '0.95rem' }}>
                {filteredRequests.map(req => {
                  const s = req.settings || {}
                  const planName = s.plan === 'premium' ? 'Premium Ilimitado' : s.plan === 'pro' ? 'Plano Profissional' : 'Plano Básico'
                  const modelName = s.model === 'fashion' ? 'Moda & Boutique' : s.model === 'tech' ? 'Tecnologia & Eletrônicos' : 'Moderno / Geral'
                  const isCancel = s.is_pending_cancellation === true

                  return (
                    <tr key={req.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'background 0.2s' }} className="request-row">
                      <td style={{ padding: '1.25rem 1rem' }}>
                        <div style={{ fontWeight: 800, color: 'var(--foreground)', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Store size={18} color={isCancel ? "#ef4444" : "#10b981"} />
                          <span>{s.name || req.name}</span>
                        </div>
                        <div style={{ margin: '0.35rem 0' }}>
                          {isCancel ? (
                            <span style={{ padding: '0.2rem 0.6rem', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', borderRadius: '6px', fontWeight: 800, fontSize: '0.75rem', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <AlertTriangle size={12} />
                              Solicitação de Cancelamento
                            </span>
                          ) : (
                            <span style={{ padding: '0.2rem 0.6rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderRadius: '6px', fontWeight: 800, fontSize: '0.75rem', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Sparkles size={12} />
                              Nova Loja (Onboarding)
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Subdomínio: {s.subdomain || req.subdomain}</div>
                      </td>
                      <td style={{ padding: '1.25rem 1rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--foreground)' }}>{s.admin_user || 'Não informado'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.2rem' }}>
                          <span>📱 {s.whatsapp || s.phone || 'Sem tel'}</span>
                          <span>✉️ {s.email || 'Sem e-mail'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1.25rem 1rem', fontWeight: 600, color: 'var(--foreground)' }}>
                        <span style={{ padding: '0.35rem 0.75rem', borderRadius: '20px', background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9', border: '1px solid rgba(14, 165, 233, 0.2)', fontSize: '0.8rem' }}>
                          {modelName}
                        </span>
                      </td>
                      <td style={{ padding: '1.25rem 1rem', fontWeight: 700 }}>
                        <span style={{ padding: '0.35rem 0.75rem', borderRadius: '20px', background: s.plan === 'premium' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)', color: s.plan === 'premium' ? '#10b981' : '#6366f1', border: s.plan === 'premium' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(99, 102, 241, 0.2)', fontSize: '0.8rem' }}>
                          {planName}
                        </span>
                      </td>
                      <td style={{ padding: '1.25rem 1rem', color: 'var(--muted)', fontSize: '0.85rem' }}>
                        {isCancel ? (
                          s.cancellation_request_date ? new Date(s.cancellation_request_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleDateString('pt-BR')
                        ) : (
                          s.request_date ? new Date(s.request_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : new Date(req.created_at).toLocaleDateString('pt-BR')
                        )}
                      </td>
                      <td style={{ padding: '1.25rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => { setSelectedRequest(req); setShowModal(true); }}
                            title="Ver Detalhes da Solicitação" 
                            style={{ padding: '0.6rem 1rem', background: 'var(--input-bg)', color: 'var(--foreground)', border: '1px solid var(--border)', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
                            className="btn-action"
                          >
                            <Eye size={16} />
                            <span>Analisar</span>
                          </button>
                          {isCancel ? (
                            <button 
                              onClick={() => handleApproveCancellation(req)}
                              disabled={activatingId === req.id}
                              title="Confirmar Cancelamento da Loja" 
                              style={{ padding: '0.6rem 1rem', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
                              className="btn-action"
                            >
                              {activatingId === req.id ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                              <span>Cancelar Plano</span>
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleApproveStore(req)}
                              disabled={activatingId === req.id}
                              title="Aprovar e Criar Loja Imediatamente" 
                              style={{ padding: '0.6rem 1rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
                              className="btn-action"
                            >
                              {activatingId === req.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                              <span>Aprovar</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DE DETALHES DA SOLICITAÇÃO */}
      {showModal && selectedRequest && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '24px', width: '100%', maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto', padding: '2.5rem', boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)', position: 'relative' }}>
            <button 
              onClick={() => { setShowModal(false); setSelectedRequest(null); }}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#ffffff', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '1.5rem' }}>
              <div style={{ width: '54px', height: '54px', borderRadius: '16px', background: selectedRequest.settings?.is_pending_cancellation ? 'rgba(239, 68, 68, 0.15)' : 'linear-gradient(135deg, #10b981, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: selectedRequest.settings?.is_pending_cancellation ? '#ef4444' : 'white', boxShadow: selectedRequest.settings?.is_pending_cancellation ? '0 4px 15px rgba(239, 68, 68, 0.3)' : '0 4px 15px rgba(16, 185, 129, 0.4)', border: selectedRequest.settings?.is_pending_cancellation ? '2px solid rgba(239, 68, 68, 0.3)' : 'none' }}>
                {selectedRequest.settings?.is_pending_cancellation ? <AlertTriangle size={28} /> : <Store size={28} />}
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  {selectedRequest.settings?.is_pending_cancellation ? `Solicitação de Cancelamento: ${selectedRequest.settings?.name || selectedRequest.name}` : `Solicitação de Loja: ${selectedRequest.settings?.name || selectedRequest.name}`}
                </h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
                  Enviada em {selectedRequest.settings?.is_pending_cancellation ? (
                    selectedRequest.settings?.cancellation_request_date ? new Date(selectedRequest.settings.cancellation_request_date).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR')
                  ) : (
                    selectedRequest.settings?.request_date ? new Date(selectedRequest.settings.request_date).toLocaleString('pt-BR') : new Date(selectedRequest.created_at).toLocaleString('pt-BR')
                  )}
                </p>
              </div>
            </div>

            {selectedRequest.settings?.is_pending_cancellation ? (
              /* DETALHES DO CANCELAMENTO */
              <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1.5rem', borderRadius: '16px' }}>
                  <div style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertTriangle size={16} />
                    <span>Motivo Informado pelo Lojista</span>
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc' }}>{selectedRequest.settings?.cancellation_reason || 'Não especificado'}</div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '1.5rem', borderRadius: '16px' }}>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Comentários / Detalhes Adicionais</div>
                  <p style={{ color: '#f8fafc', margin: 0, fontSize: '1rem', lineHeight: 1.5 }}>
                    {selectedRequest.settings?.cancellation_notes || 'Nenhum comentário adicional fornecido.'}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Responsável da Loja</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>{selectedRequest.settings?.admin_user || 'Não informado'}</div>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>WhatsApp de Contato</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0ea5e9' }}>{selectedRequest.settings?.whatsapp || selectedRequest.settings?.phone || 'Não informado'}</div>
                  </div>
                </div>
              </div>
            ) : (
              /* DETALHES DO ONBOARDING (NOVA LOJA) */
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Store size={14} color="#10b981" />
                    <span>Nome da Loja</span>
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>{selectedRequest.settings?.name || selectedRequest.name}</div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ExternalLink size={14} color="#0ea5e9" />
                    <span>Subdomínio Desejado</span>
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0ea5e9' }}>{selectedRequest.settings?.subdomain || selectedRequest.subdomain.replace(/^req-/, '').replace(/-\d+$/, '')}.localhost:3000</div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <UserPlus size={14} color="#6366f1" />
                    <span>Responsável (Proprietário)</span>
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>{selectedRequest.settings?.admin_user || 'Não informado'}</div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Phone size={14} color="#f59e0b" />
                    <span>WhatsApp de Contato</span>
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f59e0b' }}>{selectedRequest.settings?.whatsapp || selectedRequest.settings?.phone || 'Não informado'}</div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Mail size={14} color="#ec4899" />
                    <span>E-mail de Cadastro</span>
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>{selectedRequest.settings?.email || 'Não informado'}</div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Layers size={14} color="#10b981" />
                    <span>Plano & Vitrine Modelo</span>
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#10b981' }}>{selectedRequest.settings?.plan === 'premium' ? 'Premium' : selectedRequest.settings?.plan === 'pro' ? 'Pro' : 'Básico'}</span>
                    <span style={{ color: '#94a3b8' }}>•</span>
                    <span style={{ color: '#0ea5e9' }}>{selectedRequest.settings?.model === 'fashion' ? 'Moda' : selectedRequest.settings?.model === 'tech' ? 'Tech' : 'Moderno'}</span>
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Palette size={14} color="#8b5cf6" />
                    <span>Identidade Visual (Cor Principal)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: selectedRequest.settings?.primaryColor || '#10b981', border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }} />
                    <span style={{ fontWeight: 800, fontFamily: 'monospace', fontSize: '1.1rem', color: '#ffffff' }}>{selectedRequest.settings?.primaryColor || '#10b981'}</span>
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>📝 Observações do Cliente</div>
                  <p style={{ color: '#ffffff', margin: 0, fontSize: '0.95rem', lineHeight: 1.5 }}>
                    {selectedRequest.settings?.notes || 'Nenhuma observação adicional enviada.'}
                  </p>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '2rem' }}>
              {selectedRequest.settings?.is_pending_cancellation ? (
                <>
                  <button 
                    onClick={() => { setShowModal(false); setSelectedRequest(null); }}
                    style={{ padding: '0.8rem 1.5rem', background: 'transparent', color: '#cbd5e1', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Voltar
                  </button>
                  <button 
                    onClick={() => handleApproveCancellation(selectedRequest)}
                    disabled={activatingId === selectedRequest.id}
                    style={{ padding: '0.8rem 2rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)' }}
                  >
                    {activatingId === selectedRequest.id ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
                    <span>Confirmar Cancelamento (Desativar Loja)</span>
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => handleRejectRequest(selectedRequest.id, selectedRequest.settings?.name || selectedRequest.name)}
                    style={{ padding: '0.8rem 1.5rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <XCircle size={18} />
                    <span>Recusar Solicitação</span>
                  </button>

                  <a 
                    href={getApprovalWhatsappLink(selectedRequest)}
                    target="_blank" 
                    rel="noreferrer"
                    style={{ textDecoration: 'none', padding: '0.8rem 1.5rem', background: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9', border: '1px solid rgba(14, 165, 233, 0.3)', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Send size={18} />
                    <span>Avisar no WhatsApp</span>
                  </a>

                  <button 
                    onClick={() => handleApproveStore(selectedRequest)}
                    disabled={activatingId === selectedRequest.id}
                    style={{ padding: '0.8rem 2rem', background: 'linear-gradient(135deg, #10b981, #0ea5e9)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' }}
                  >
                    {activatingId === selectedRequest.id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                    <span>Aprovar & Ativar Loja</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
