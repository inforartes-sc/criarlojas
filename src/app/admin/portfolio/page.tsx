"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Save, Loader2, ImageIcon, Plus, Trash2, Edit3, ArrowLeft, Upload, Eye, X, CheckCircle, Sparkles, Layers, Image as LucideImage } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { useAdminAuth } from '@/context/AdminAuthContext'

export interface PortfolioItem {
  id: string
  title: string
  description?: string
  cover_image: string
  images: string[]
}

export const defaultServicesPortfolio: PortfolioItem[] = [
  {
    id: 'port-1',
    title: 'Manutenção & Reparos Elétricos',
    description: 'Quadros de distribuição, manutenção preventiva e reparos elétricos de alta precisão em residências e empresas.',
    cover_image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    id: 'port-2',
    title: 'Instalação de Ar Condicionado & Climatização',
    description: 'Instalações de aparelhos Split, VRF e dutos de climatização para salas comerciais e residências.',
    cover_image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    id: 'port-3',
    title: 'Projetos de Iluminação & LED',
    description: 'Projetos luminotécnicos com fitas LED, perfis de alumínio e iluminação de destaque para ambientes modernos.',
    cover_image: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    id: 'port-4',
    title: 'Reformas & Infraestrutura Comercial',
    description: 'Projetos completos de infraestrutura técnica, cabeamento estruturado e adequação para novos negócios.',
    cover_image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80'
    ]
  }
]

export default function AdminPortfolioPage() {
  const { store: authStore } = useAdminAuth()
  const storeId = authStore?.id || ''

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])

  // Modal / Form state for creating / editing category
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null)
  const [formData, setFormData] = useState<{
    id: string
    title: string
    description: string
    cover_image: string
    images: string[]
  }>({
    id: '',
    title: '',
    description: '',
    cover_image: '',
    images: []
  })

  const [newImageUrl, setNewImageUrl] = useState('')

  useEffect(() => {
    if (storeId) {
      loadPortfolio()
    }
  }, [storeId])

  const loadPortfolio = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('settings')
        .eq('id', storeId)
        .single()

      if (error) throw error

      const existingPortfolio = data?.settings?.portfolio
      if (existingPortfolio && Array.isArray(existingPortfolio) && existingPortfolio.length > 0) {
        setPortfolio(existingPortfolio)
      } else {
        // Fallback default portfolio
        setPortfolio(defaultServicesPortfolio)
      }
    } catch (err: any) {
      console.error('Erro ao carregar portfólio:', err)
      toast.error('Erro ao carregar dados do portfólio.')
      setPortfolio(defaultServicesPortfolio)
    } finally {
      setLoading(false)
    }
  }

  const savePortfolioToDb = async (updatedList: PortfolioItem[]) => {
    setSaving(true)
    try {
      const { data: currentStore, error: fetchErr } = await supabase
        .from('stores')
        .select('settings')
        .eq('id', storeId)
        .single()

      if (fetchErr) throw fetchErr

      const mergedSettings = {
        ...(currentStore?.settings || {}),
        portfolio: updatedList
      }

      const { error: updateErr } = await supabase
        .from('stores')
        .update({ settings: mergedSettings })
        .eq('id', storeId)

      if (updateErr) throw updateErr

      setPortfolio(updatedList)
      toast.success('Portfólio atualizado com sucesso!')
    } catch (err: any) {
      console.error('Erro ao salvar portfólio:', err)
      toast.error('Erro ao salvar portfólio no banco de dados.')
    } finally {
      setSaving(false)
    }
  }

  const openAddModal = () => {
    setEditingItem(null)
    setFormData({
      id: `port-${Date.now()}`,
      title: '',
      description: '',
      cover_image: '',
      images: []
    })
    setIsModalOpen(true)
  }

  const openEditModal = (item: PortfolioItem) => {
    setEditingItem(item)
    setFormData({
      id: item.id,
      title: item.title,
      description: item.description || '',
      cover_image: item.cover_image,
      images: item.images ? [...item.images] : []
    })
    setIsModalOpen(true)
  }

  const handleDeleteCategory = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta categoria do portfólio?')) {
      const updated = portfolio.filter(p => p.id !== id)
      savePortfolioToDb(updated)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isCover: boolean = false) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const uploadedUrls: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `portfolio/${storeId}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('store-assets')
          .upload(fileName, file, { upsert: true })

        if (uploadError) {
          // If storage bucket is missing or fails, toast error
          console.error('Upload Error:', uploadError)
          toast.error(`Falha no upload da imagem ${file.name}`)
          continue
        }

        const { data: { publicUrl } } = supabase.storage
          .from('store-assets')
          .getPublicUrl(fileName)

        if (publicUrl) {
          uploadedUrls.push(publicUrl)
        }
      }

      if (uploadedUrls.length > 0) {
        if (isCover) {
          setFormData(prev => ({
            ...prev,
            cover_image: uploadedUrls[0],
            images: prev.images.length === 0 ? uploadedUrls : prev.images
          }))
          toast.success('Imagem de capa atualizada!')
        } else {
          setFormData(prev => ({
            ...prev,
            cover_image: !prev.cover_image ? uploadedUrls[0] : prev.cover_image,
            images: [...prev.images, ...uploadedUrls]
          }))
          toast.success(`${uploadedUrls.length} imagem(ns) adicionada(s) à galeria!`)
        }
      }
    } catch (err) {
      console.error('Erro no upload:', err)
      toast.error('Erro ao enviar imagem.')
    } finally {
      setUploading(false)
    }
  }

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return
    setFormData(prev => ({
      ...prev,
      cover_image: !prev.cover_image ? newImageUrl.trim() : prev.cover_image,
      images: [...prev.images, newImageUrl.trim()]
    }))
    setNewImageUrl('')
    toast.success('URL de imagem adicionada!')
  }

  const handleRemoveImageFromGallery = (index: number) => {
    setFormData(prev => {
      const newImages = prev.images.filter((_, i) => i !== index)
      const newCover = prev.cover_image === prev.images[index] 
        ? (newImages[0] || '') 
        : prev.cover_image
      return {
        ...prev,
        images: newImages,
        cover_image: newCover
      }
    })
  }

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error('Por favor, informe o título da categoria de serviço.')
      return
    }

    if (!formData.cover_image) {
      toast.error('Por favor, adicione ao menos uma imagem de capa.')
      return
    }

    const newItem: PortfolioItem = {
      id: formData.id || `port-${Date.now()}`,
      title: formData.title.trim(),
      description: formData.description.trim(),
      cover_image: formData.cover_image,
      images: formData.images.length > 0 ? formData.images : [formData.cover_image]
    }

    let updatedList: PortfolioItem[]
    if (editingItem) {
      updatedList = portfolio.map(p => p.id === editingItem.id ? newItem : p)
    } else {
      updatedList = [...portfolio, newItem]
    }

    savePortfolioToDb(updatedList)
    setIsModalOpen(false)
  }

  const handleResetToDefault = () => {
    if (confirm('Deseja restaurar as 4 categorias padrão de demonstração para o nicho de serviços?')) {
      savePortfolioToDb(defaultServicesPortfolio)
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: 'var(--foreground)' }}>
      {/* Header */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid var(--border)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span style={{ 
              padding: '0.35rem 0.85rem', 
              borderRadius: '100px', 
              background: 'rgba(99, 102, 241, 0.1)', 
              color: '#6366f1', 
              fontSize: '0.8rem', 
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Nicho de Serviços
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, margin: 0, background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Galeria & Portfólio de Trabalhos Realizados
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem', margin: '0.35rem 0 0 0' }}>
            Gerencie as categorias de serviços executados com fotos para encantar seus clientes na página inicial da loja.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="button"
            onClick={handleResetToDefault}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--foreground)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Sparkles size={16} />
            <span>Restaurar 4 Padrões</span>
          </button>

          <button
            type="button"
            onClick={openAddModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: '#ffffff',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}
          >
            <Plus size={18} />
            <span>Nova Categoria de Portfólio</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted)' }}>
          <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 1rem' }} />
          <p>Carregando categorias do portfólio...</p>
        </div>
      ) : (
        <div>
          {/* Card Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', 
            gap: '1.5rem',
            marginBottom: '3rem'
          }}>
            {portfolio.map((item, idx) => (
              <div key={item.id || idx} className="glass-card" style={{ 
                borderRadius: '16px', 
                overflow: 'hidden', 
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                backgroundColor: 'var(--card)'
              }}>
                <div style={{ 
                  height: '180px', 
                  position: 'relative', 
                  backgroundImage: `url(${item.cover_image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}>
                  <div style={{ 
                    position: 'absolute', 
                    top: '0.75rem', 
                    right: '0.75rem',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '100px',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(4px)',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}>
                    <LucideImage size={13} />
                    <span>{item.images?.length || 1} fotos</span>
                  </div>
                </div>

                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--foreground)' }}>
                    {item.title}
                  </h3>
                  <p style={{ 
                    fontSize: '0.85rem', 
                    color: 'var(--muted)', 
                    lineHeight: 1.5, 
                    marginBottom: '1.25rem',
                    flex: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {item.description || 'Sem descrição.'}
                  </p>

                  <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                    <button
                      onClick={() => openEditModal(item)}
                      style={{
                        flex: 1,
                        padding: '0.6rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        background: 'rgba(99, 102, 241, 0.08)',
                        color: '#6366f1',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        cursor: 'pointer'
                      }}
                    >
                      <Edit3 size={15} />
                      <span>Editar Fotos</span>
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(item.id)}
                      style={{
                        padding: '0.6rem 0.8rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        cursor: 'pointer'
                      }}
                      title="Excluir Categoria"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {portfolio.length === 0 && (
            <div style={{ 
              padding: '4rem 2rem', 
              textAlign: 'center', 
              border: '2px dashed var(--border)', 
              borderRadius: '16px',
              backgroundColor: 'rgba(255,255,255,0.01)'
            }}>
              <ImageIcon size={48} style={{ color: 'var(--muted)', marginBottom: '1rem', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Nenhum portfólio cadastrado</h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
                Adicione categorias de serviços já realizados para que seus clientes vejam fotos dos seus trabalhos.
              </p>
              <button
                onClick={handleResetToDefault}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#6366f1',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Carregar 4 Categorias Padrão
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal for Create/Edit Category */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.5rem'
        }}>
          <div style={{
            backgroundColor: 'var(--card, #0f172a)',
            border: '1px solid var(--border, #1e293b)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            color: 'var(--foreground, #ffffff)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
                {editingItem ? 'Editar Categoria do Portfólio' : 'Nova Categoria do Portfólio'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveModal} style={{ display: 'grid', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  Nome da Categoria / Serviço *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Instalações Elétricas Residenciais"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    color: 'inherit',
                    fontSize: '0.95rem'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  Descrição Curta do Serviço Realizado
                </label>
                <textarea
                  placeholder="Explique o tipo de trabalho, materiais utilizados ou detalhes técnicos..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    color: 'inherit',
                    fontSize: '0.95rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Cover & Gallery Upload Section */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  Galeria de Fotos do Serviço ({formData.images.length} fotos)
                </label>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '1rem' }}>
                  A primeira foto será usada como capa no card da página inicial.
                </p>

                {/* Upload Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                  <label style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '8px',
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: '#6366f1',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: uploading ? 'wait' : 'pointer'
                  }}>
                    {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                    <span>{uploading ? 'Enviando...' : 'Fazer Upload de Fotos'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={e => handleFileUpload(e, false)}
                      disabled={uploading}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>

                {/* Add Image URL Direct */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <input
                    type="url"
                    placeholder="Ou cole a URL direta de uma imagem (https://...)"
                    value={newImageUrl}
                    onChange={e => setNewImageUrl(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      color: 'inherit',
                      fontSize: '0.85rem'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    style={{
                      padding: '0.65rem 1.25rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'var(--border)',
                      color: 'var(--foreground)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    Adicionar URL
                  </button>
                </div>

                {/* Gallery Images List */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
                  gap: '0.75rem',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  padding: '0.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(0,0,0,0.2)'
                }}>
                  {formData.images.map((imgUrl, i) => (
                    <div key={i} style={{ 
                      aspectRatio: '1/1', 
                      borderRadius: '8px', 
                      position: 'relative',
                      overflow: 'hidden',
                      border: formData.cover_image === imgUrl ? '2px solid #6366f1' : '1px solid var(--border)',
                      backgroundImage: `url(${imgUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}>
                      {formData.cover_image === imgUrl && (
                        <span style={{ 
                          position: 'absolute', 
                          top: '4px', 
                          left: '4px', 
                          background: '#6366f1', 
                          color: '#fff', 
                          fontSize: '0.65rem', 
                          fontWeight: 800, 
                          padding: '2px 6px', 
                          borderRadius: '4px' 
                        }}>
                          Capa
                        </span>
                      )}
                      
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.3rem',
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                      >
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, cover_image: imgUrl }))}
                          style={{
                            padding: '4px 6px',
                            background: '#6366f1',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            cursor: 'pointer'
                          }}
                          title="Definir como capa"
                        >
                          Capa
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveImageFromGallery(i)}
                          style={{
                            padding: '4px',
                            background: '#ef4444',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                          title="Remover foto"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {formData.images.length === 0 && (
                    <div style={{ 
                      gridColumn: '1 / -1', 
                      padding: '2rem', 
                      textAlign: 'center', 
                      color: 'var(--muted)', 
                      fontSize: '0.85rem' 
                    }}>
                      Nenhuma imagem adicionada ainda. Faça upload de fotos dos serviços executados nesta categoria.
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    color: 'inherit',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                  <span>Salvar Categoria</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
