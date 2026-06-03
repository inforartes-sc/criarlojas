"use client"

import { useState, useEffect } from 'react'
import { Plus, Search, Loader2, Image as ImageIcon, Trash2, X, Upload } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAdminAuth } from '@/context/AdminAuthContext'

export default function CategoriesPage() {
  const { store } = useAdminAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    image_url: ''
  })

  useEffect(() => {
    if (store) {
      fetchData()
    }
  }, [store])

  const fetchData = async () => {
    if (!store) return
    try {
      const { data, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('store_id', store.id)
        .order('name')

      if (catError) throw catError
      setCategories(data || [])
    } catch (error: any) {
      alert('Erro ao carregar categorias: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !store) return

    setSaving(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `cat-${Date.now()}.${fileExt}`
      const filePath = `${store.id}/categories/${fileName}`

      const { error: uploadError } = await supabase.storage.from('store-assets').upload(filePath, file)
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('store-assets').getPublicUrl(filePath)
      setFormData(prev => ({ ...prev, image_url: publicUrl }))
    } catch (error: any) {
      alert('Erro no upload: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!store) return
    setSaving(true)

    try {
      if (formData.id) {
        await supabase
          .from('categories')
          .update({ name: formData.name, image_url: formData.image_url })
          .eq('id', formData.id)
          .eq('store_id', store.id)
      } else {
        await supabase
          .from('categories')
          .insert([{ name: formData.name, image_url: formData.image_url, store_id: store.id }])
      }
      setShowForm(false)
      setFormData({ id: null, name: '', image_url: '' })
      fetchData()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta categoria?')) return
    if (!store) return
    await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('store_id', store.id)
    fetchData()
  }

  if (loading) return <div style={{ padding: '5rem', textAlign: 'center' }}><Loader2 className="animate-spin" /></div>

  return (
    <div>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Categorias</h1>
          <p style={{ color: 'var(--muted)' }}>Organize seus produtos por grupos.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
          <Plus size={20} />
          <span>Nova Categoria</span>
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {categories.map((cat: any) => (
          <div key={cat.id} className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', position: 'relative' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--background)', margin: '0 auto 1rem auto', overflow: 'hidden', border: '1px solid var(--border)' }}>
              {cat.image_url ? <img src={cat.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={24} color="var(--muted)" />}
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>{cat.name}</h3>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button onClick={() => { setFormData(cat); setShowForm(true); }} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>Editar</button>
              <button onClick={() => handleDelete(cat.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Formulário */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '100%', padding: '3rem', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}>
            <button onClick={() => setShowForm(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(0,0,0,0.05)', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}><X size={20} /></button>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '2rem', color: 'var(--foreground)' }}>{formData.id ? 'Editar' : 'Nova'} Categoria</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
              <div className="form-group">
                <label>Ícone/Capa da Categoria</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px dashed var(--border)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {formData.image_url ? <img src={formData.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Upload size={20} color="var(--muted)" />}
                  </div>
                  <label className="btn-secondary" style={{ cursor: 'pointer', padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem' }}>
                    Alterar Foto
                    <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Nome da Categoria</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Ex: Masculino, Inverno, etc" />
              </div>

              <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '1.1rem', marginTop: '1rem', width: '100%', fontSize: '1rem', boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)' }}>
                {saving ? <Loader2 className="animate-spin" size={20} /> : (formData.id ? 'Salvar Alterações' : 'Criar Categoria')}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .form-group { display: flex; flex-direction: column; gap: 0.6rem; }
        label { font-size: 0.9rem; font-weight: 600; color: var(--foreground); opacity: 0.8; }
        input { background: var(--input-bg); border: 1px solid var(--border); border-radius: 10px; padding: 0.875rem 1.1rem; color: var(--foreground); outline: none; transition: 0.2s; font-size: 1rem; }
        input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
        input::placeholder { color: var(--muted); opacity: 0.5; }
        .btn-primary { background: var(--primary); color: white; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
        .btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
        .btn-secondary { background: #f1f5f9; color: var(--foreground); border: 1px solid #cbd5e1; border-radius: 8px; font-weight: 600; transition: 0.2s; }
        .btn-secondary:hover { background: #e2e8f0; border-color: #94a3b8; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
