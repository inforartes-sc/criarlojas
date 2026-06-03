"use client"

import { useState } from 'react'
import { Bell, Plus, Trash2, Edit, AlertCircle, Info, CheckCircle2, Clock, X } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function SuperAdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([
    {
      id: '1',
      title: 'Manutenção Programada no Servidor de Banco de Dados',
      message: 'No próximo domingo, dia 24/05 das 02h às 04h, realizaremos um upgrade na infraestrutura do Supabase. Lojas podem apresentar instabilidade momentânea.',
      type: 'warning',
      expiresAt: '2026-05-24',
      active: true,
      createdAt: '2026-05-15'
    },
    {
      id: '2',
      title: 'Nova Funcionalidade: Gestão Avançada de Cupons!',
      message: 'Agora você pode criar cupons com limite de uso por cliente e valor mínimo de pedido diretamente na aba de Promoções do seu painel.',
      type: 'info',
      expiresAt: '2026-06-15',
      active: true,
      createdAt: '2026-05-14'
    },
    {
      id: '3',
      title: 'Integração com Pix Direto Concluída',
      message: 'O gateway de pagamento Pix Direto foi homologado com sucesso e está disponível com taxa zero para todos os lojistas do Plano Premium.',
      type: 'success',
      expiresAt: '2026-05-30',
      active: false,
      createdAt: '2026-05-10'
    }
  ])

  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    message: '',
    type: 'info',
    expiresAt: '',
    active: true
  })

  const handleOpenCreate = () => {
    setFormData({
      id: Date.now().toString(),
      title: '',
      message: '',
      type: 'info',
      expiresAt: new Date(Date.now() + 15*24*60*60*1000).toISOString().split('T')[0],
      active: true
    })
    setShowModal(true)
  }

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault()
    const existing = announcements.find(a => a.id === formData.id)
    if (existing) {
      setAnnouncements(prev => prev.map(a => a.id === formData.id ? { ...formData, createdAt: existing.createdAt } : a))
      toast.success('Aviso atualizado com sucesso!')
    } else {
      setAnnouncements(prev => [{ ...formData, createdAt: new Date().toISOString().split('T')[0] }, ...prev])
      toast.success('Novo aviso global publicado com sucesso!')
    }
    setShowModal(false)
  }

  const handleDelete = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id))
    toast.success('Aviso removido do sistema.')
  }

  const getTypeConfig = (type: string) => {
    switch(type) {
      case 'warning': return { icon: AlertCircle, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', label: 'Manutenção / Alerta' }
      case 'success': return { icon: CheckCircle2, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', label: 'Novo Recurso' }
      default: return { icon: Info, color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.1)', label: 'Informativo' }
    }
  }

  return (
    <div style={{ display: 'grid', gap: '2.5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--foreground)' }}>Avisos Globais do Sistema</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Publique comunicados, banners e alertas que aparecem no painel de todos os lojistas.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          style={{ padding: '0.75rem 1.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
          className="btn-create"
        >
          <Plus size={20} />
          <span>Criar Comunicado</span>
        </button>
      </header>

      {/* Lista de Avisos */}
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {announcements.length === 0 ? (
          <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--muted)', background: 'var(--input-bg)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
            Nenhum comunicado cadastrado no sistema.
          </div>
        ) : (
          announcements.map((ann) => {
            const typeCfg = getTypeConfig(ann.type)

            return (
              <div key={ann.id} className="glass-card" style={{ padding: '2rem', border: '1px solid var(--border)', borderRadius: '16px', position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flex: 1 }}>
                  <div style={{ padding: '0.85rem', background: typeCfg.bg, color: typeCfg.color, borderRadius: '12px', marginTop: '0.25rem' }}>
                    <typeCfg.icon size={28} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--foreground)' }}>{ann.title}</h3>
                      <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: typeCfg.bg, color: typeCfg.color, border: `1px solid ${typeCfg.color}30` }}>
                        {typeCfg.label}
                      </span>
                      <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: ann.active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(148, 163, 184, 0.1)', color: ann.active ? '#10b981' : '#64748b', border: ann.active ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(148, 163, 184, 0.2)' }}>
                        {ann.active ? 'Ativo (Visível)' : 'Inativo (Oculto)'}
                      </span>
                    </div>
                    <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginBottom: '1.25rem', lineHeight: 1.5, maxWidth: '900px' }}>
                      {ann.message}
                    </p>
                    <div style={{ display: 'flex', gap: '2rem', fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>
                      <span>Publicado em: {new Date(ann.createdAt).toLocaleDateString()}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#0ea5e9' }}>
                        <Clock size={14} />
                        Expira em: {new Date(ann.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button 
                    onClick={() => { setFormData({...ann}); setShowModal(true); }}
                    style={{ padding: '0.6rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    className="btn-icon"
                    title="Editar Comunicado"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(ann.id)}
                    style={{ padding: '0.6rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    className="btn-icon-danger"
                    title="Excluir Comunicado"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Modal de Criação / Edição */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(9, 13, 22, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <div className="glass-card" style={{ maxWidth: '700px', width: '100%', padding: '2.5rem', position: 'relative', borderRadius: '16px' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--muted)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}>
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 1.5rem 0', color: 'var(--foreground)' }}>
              {announcements.some(a => a.id === formData.id) ? 'Editar Comunicado' : 'Novo Comunicado Global'}
            </h3>

            <form onSubmit={handleSaveAnnouncement} style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>Título do Comunicado</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="Ex: Instabilidade no gateway ou Nova funcionalidade..."
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', outline: 'none', fontWeight: 600 }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>Classificação / Tipo</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', outline: 'none', fontWeight: 600, cursor: 'pointer' }}
                  >
                    <option value="info">Informativo (Azul)</option>
                    <option value="warning">Manutenção / Alerta (Amarelo)</option>
                    <option value="success">Novo Recurso / Sucesso (Verde)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>Data de Expiração</label>
                  <input 
                    type="date" 
                    value={formData.expiresAt}
                    onChange={e => setFormData({...formData, expiresAt: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', outline: 'none', fontWeight: 600, cursor: 'pointer' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>Mensagem do Comunicado</label>
                <textarea 
                  rows={4}
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  placeholder="Detalhe o aviso que os lojistas irão ler em seus painéis..."
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', outline: 'none', fontWeight: 500, resize: 'none' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>Status de Publicação</label>
                <select 
                  value={formData.active ? 'true' : 'false'}
                  onChange={e => setFormData({...formData, active: e.target.value === 'true'})}
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', outline: 'none', fontWeight: 600, cursor: 'pointer' }}
                >
                  <option value="true">Ativo (Publicar e exibir imediatamente)</option>
                  <option value="false">Inativo (Salvar como rascunho / ocultar)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', fontWeight: 600, cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" style={{ padding: '0.75rem 2rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}>
                  Salvar Comunicado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .btn-create:hover { filter: brightness(1.1); }
        .btn-icon:hover { border-color: #10b981 !important; color: #10b981 !important; }
        .btn-icon-danger:hover { background: #ef4444 !important; color: white !important; }
      `}</style>
    </div>
  )
}
