"use client"

import { useState, useEffect } from 'react'
import { Store, Search, Eye, Plus, Edit, Trash2, Loader2, Palette, Sparkles, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { getDomainSuffix } from '@/lib/getDomainSuffix'

export default function SuperAdminLibrary() {
  const [loading, setLoading] = useState(true)
  const [models, setModels] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [domainSuffix, setDomainSuffix] = useState('.localhost:3000')

  // Edit / Create Modal State
  const [showModal, setShowModal] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    layoutModel: 'modern',
    primaryColor: '#10b981',
    niche: '',
    description: '',
    imageUrl: ''
  })

  useEffect(() => {
    setDomainSuffix(getDomainSuffix())
    fetchModels()
  }, [])

  const fetchModels = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Filter stores where is_demo is true
      const demoStores = (data || []).filter(s => s.settings?.is_demo === true)
      setModels(demoStores)
    } catch (err: any) {
      console.error('Error fetching templates:', err.message)
      toast.error('Erro ao carregar os modelos de loja.')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreate = () => {
    setIsEditMode(false)
    setEditingId(null)
    setFormData({
      name: '',
      subdomain: '',
      layoutModel: 'modern',
      primaryColor: '#10b981',
      niche: 'Moda & Acessórios',
      description: 'Modelo de loja virtual clean de alta conversão.',
      imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80'
    })
    setShowModal(true)
  }

  const handleOpenEdit = (model: any) => {
    const s = model.settings || {}
    setIsEditMode(true)
    setEditingId(model.id)
    setFormData({
      name: model.name || '',
      subdomain: model.subdomain || '',
      layoutModel: s.layout_model || 'modern',
      primaryColor: s.primary_color || '#10b981',
      niche: s.niche || '',
      description: s.description || '',
      imageUrl: s.hero_image_url || ''
    })
    setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const cleanSub = formData.subdomain.toLowerCase().trim().replace(/[^a-z0-9]/g, '')
    if (!cleanSub) {
      toast.error('O slug/subdomínio do modelo é obrigatório e deve ter apenas letras/números.')
      return
    }

    setSaving(true)
    try {
      // Check subdomain collision
      const query = supabase
        .from('stores')
        .select('id')
        .eq('subdomain', cleanSub)
      
      if (isEditMode && editingId) {
        query.neq('id', editingId)
      }

      const { data: existing } = await query.limit(1)
      if (existing && existing.length > 0) {
        toast.error('Este slug/subdomínio já está em uso por outro modelo ou loja.')
        setSaving(false)
        return
      }

      if (isEditMode && editingId) {
        // Fetch current settings to merge and not lose existing configurations
        const { data: currentStore, error: fetchErr } = await supabase
          .from('stores')
          .select('settings')
          .eq('id', editingId)
          .single()

        if (fetchErr) throw fetchErr

        const currentSettings = currentStore?.settings || {}
        
        // Sync hero_banners: update the first banner if it exists, or create one
        let updatedBanners = currentSettings.hero_banners || []
        if (formData.imageUrl) {
          if (updatedBanners.length > 0) {
            updatedBanners = [
              {
                ...updatedBanners[0],
                desktop_url: formData.imageUrl,
                mobile_url: updatedBanners[0].mobile_url || formData.imageUrl
              },
              ...updatedBanners.slice(1)
            ]
          } else {
            updatedBanners = [
              {
                desktop_url: formData.imageUrl,
                mobile_url: formData.imageUrl,
                title: 'REDEFINA SEU CONCEITO',
                subtitle: 'Explore nossa curadoria especial para elevar sua experiência.',
                button_text: 'SAIBA MAIS',
                button_url: '?view=produtos'
              }
            ]
          }
        }

        const mergedSettings = {
          ...currentSettings,
          is_demo: true,
          name: formData.name,
          niche: formData.niche,
          description: formData.description,
          layout_model: formData.layoutModel,
          primary_color: formData.primaryColor,
          hero_image_url: formData.imageUrl || currentSettings.hero_image_url || '',
          hero_banners: updatedBanners,
          phone: currentSettings.phone || '11999998888',
          email: currentSettings.email || 'suporte@criarlojas.com.br',
          active: currentSettings.active !== false
        }

        const { error } = await supabase
          .from('stores')
          .update({
            name: formData.name,
            subdomain: cleanSub,
            settings: mergedSettings
          })
          .eq('id', editingId)
        
        if (error) throw error
        toast.success('Modelo atualizado com sucesso!')
      } else {
        // Creating a new model template
        const defaultBanners = formData.imageUrl ? [
          {
            desktop_url: formData.imageUrl,
            mobile_url: formData.imageUrl,
            title: 'REDEFINA SEU CONCEITO',
            subtitle: 'Explore nossa curadoria especial para elevar sua experiência.',
            button_text: 'SAIBA MAIS',
            button_url: '?view=produtos'
          }
        ] : []

        const newSettings = {
          is_demo: true,
          name: formData.name,
          niche: formData.niche,
          description: formData.description,
          layout_model: formData.layoutModel,
          primary_color: formData.primaryColor,
          hero_image_url: formData.imageUrl,
          hero_banners: defaultBanners,
          phone: '11999998888',
          email: 'suporte@criarlojas.com.br',
          active: true
        }

        const { error } = await supabase
          .from('stores')
          .insert({
            name: formData.name,
            subdomain: cleanSub,
            settings: newSettings
          })

        if (error) throw error
        toast.success('Novo modelo adicionado à biblioteca!')
      }

      setShowModal(false)
      fetchModels()
    } catch (err: any) {
      console.error('Error saving template:', err.message)
      toast.error('Erro ao salvar o modelo no banco de dados.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o modelo "${name}"? Esta ação é irreversível.`)) return

    try {
      const { error } = await supabase
        .from('stores')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Modelo removido com sucesso!')
      fetchModels()
    } catch (err: any) {
      console.error('Error deleting template:', err.message)
      toast.error('Erro ao excluir o modelo.')
    }
  }

  const filteredModels = models.filter(m => 
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.subdomain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.settings?.niche?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const colorPresets = [
    '#10b981', '#0ea5e9', '#6366f1', '#f43f5e', '#f59e0b', '#334155', '#ec4899'
  ]

  return (
    <div style={{ display: 'grid', gap: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--foreground)' }}>Biblioteca de Modelos (Templates)</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Gerencie as vitrines conceito que servem de base para a criação rápida das lojas dos clientes.
          </p>
        </div>
        <button 
          onClick={handleOpenCreate}
          style={{ 
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
            color: 'white', 
            border: 'none', 
            padding: '0.75rem 1.5rem', 
            borderRadius: '10px', 
            fontWeight: 800, 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
          }}
        >
          <Plus size={18} />
          <span>Criar Novo Modelo</span>
        </button>
      </div>

      {/* Busca */}
      <div style={{ display: 'flex', gap: '1rem', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '14px', padding: '0.75rem 1.25rem', alignItems: 'center' }}>
        <Search size={20} color="var(--muted)" />
        <input 
          type="text" 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Buscar modelos por nome, nicho ou slug..."
          style={{ flex: 1, border: 'none', background: 'transparent', color: 'var(--foreground)', outline: 'none', fontSize: '0.95rem' }}
        />
      </div>

      {/* Grid de Modelos */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
          <Loader2 size={40} className="animate-spin" color="#10b981" style={{ margin: '0 auto' }} />
          <p style={{ color: 'var(--muted)', marginTop: '1rem', fontWeight: 600 }}>Carregando biblioteca de modelos...</p>
        </div>
      ) : filteredModels.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'var(--card-bg)', border: '1px dashed var(--border)', borderRadius: '16px' }}>
          <Store size={48} color="var(--muted)" style={{ margin: '0 auto 1.5rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--foreground)', margin: '0 0 0.5rem 0' }}>Nenhum modelo encontrado</h3>
          <p style={{ color: 'var(--muted)', margin: 0 }}>Crie o seu primeiro modelo conceito para começar a popular a biblioteca.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
          {filteredModels.map((model) => {
            const s = model.settings || {}
            return (
              <div 
                key={model.id} 
                className="glass-card" 
                style={{ 
                  background: 'var(--card-bg)', 
                  border: '1px solid var(--border)', 
                  borderRadius: '16px', 
                  overflow: 'hidden', 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                }}
              >
                <div>
                  <div style={{ height: '180px', overflow: 'hidden', position: 'relative', background: '#f1f5f9' }}>
                    {s.hero_image_url ? (
                      <img src={s.hero_image_url} alt={model.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--muted)' }}>
                        <Store size={40} />
                      </div>
                    )}
                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: s.primary_color || '#10b981', color: 'white', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 }}>
                      {s.niche || 'Geral'}
                    </div>
                  </div>

                  <div style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: 'var(--foreground)' }}>{model.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#0ea5e9', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem' }}>
                      <span>/modelos/{model.subdomain}</span>
                    </div>
                    <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
                      {s.description || 'Nenhuma descrição fornecida.'}
                    </p>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--muted)' }}>
                      <span style={{ background: 'var(--input-bg)', padding: '0.25rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                        Layout: <strong>{s.layout_model || 'modern'}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '0.75rem', background: 'var(--input-bg)' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => handleOpenEdit(model)}
                      style={{ 
                        flex: 1, 
                        background: '#ffffff', 
                        border: '1px solid #cbd5e1', 
                        color: '#475569', 
                        padding: '0.5rem', 
                        borderRadius: '8px', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        fontWeight: 700,
                        fontSize: '0.85rem'
                      }}
                    >
                      <Edit size={14} />
                      <span>Editar</span>
                    </button>
                    
                    <button 
                      onClick={() => handleDelete(model.id, model.name)}
                      style={{ 
                        background: 'rgba(239, 68, 68, 0.08)', 
                        border: '1px solid rgba(239, 68, 68, 0.2)', 
                        color: '#ef4444', 
                        padding: '0.5rem', 
                        borderRadius: '8px', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700
                      }}
                      title="Excluir Modelo"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <a 
                    href={`/modelos/${model.subdomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ 
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                      color: 'white', 
                      padding: '0.5rem', 
                      borderRadius: '8px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '0.35rem', 
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      textDecoration: 'none'
                    }}
                  >
                    <span>Ver</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-card" style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '20px', width: '100%', maxWidth: '650px', padding: '2.5rem', position: 'relative', marginTop: '5vh', maxHeight: '90vh', overflowY: 'auto' }}>
            <button 
              onClick={() => setShowModal(false)} 
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', cursor: 'pointer', padding: '0.4rem', borderRadius: '50%', display: 'flex' }}
            >
              <Trash2 size={16} /> {/* Simple close fallback */}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <Palette size={24} color="#10b981" />
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                {isEditMode ? 'Editar Modelo Conceito' : 'Criar Novo Modelo Conceito'}
              </h3>
            </div>

            <form onSubmit={handleSave} style={{ display: 'grid', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Nome do Modelo</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: Boutique Elegance"
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', outline: 'none' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Slug de Acesso (Subdomain)</label>
                  <input 
                    type="text" 
                    value={formData.subdomain}
                    onChange={e => setFormData({...formData, subdomain: e.target.value})}
                    placeholder="Ex: moda"
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', outline: 'none' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Nicho do Segmento</label>
                  <input 
                    type="text" 
                    value={formData.niche}
                    onChange={e => setFormData({...formData, niche: e.target.value})}
                    placeholder="Ex: Moda & Vestuário"
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', outline: 'none' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Modelo de Layout (Motor)</label>
                  <select
                    value={formData.layoutModel}
                    onChange={e => setFormData({...formData, layoutModel: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', outline: 'none' }}
                  >
                    <option value="modern">Moderno (E-commerce padrão)</option>
                    <option value="fashion">Fashion (Moda minimalista)</option>
                    <option value="services">Serviços (Instalações, Clínicas, etc.)</option>
                    <option value="lawyer">Advocacia (Institucional/Profissional)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Cor Principal da Marca</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  {colorPresets.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({...formData, primaryColor: c})}
                      style={{ 
                        width: '28px', 
                        height: '28px', 
                        borderRadius: '50%', 
                        background: c, 
                        border: formData.primaryColor === c ? '2px solid #0f172a' : '1px solid #cbd5e1',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                  <input 
                    type="color" 
                    value={formData.primaryColor} 
                    onChange={e => setFormData({...formData, primaryColor: e.target.value})}
                    style={{ border: 'none', background: 'transparent', width: '28px', height: '28px', cursor: 'pointer' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>URL da Imagem Banner</label>
                <input 
                  type="text" 
                  value={formData.imageUrl}
                  onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                  placeholder="URL de imagem do Unsplash"
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Descrição do Modelo</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Explique o nicho e design desse modelo..."
                  style={{ width: '100%', height: '80px', padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', outline: 'none', resize: 'none' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  style={{ padding: '0.65rem 1.5rem', background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  style={{ padding: '0.65rem 2.5rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 800 }}
                >
                  {saving ? 'Gravando...' : 'Salvar Modelo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
