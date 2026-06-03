"use client"

import { useState, useEffect } from 'react'
import { Search, Loader2, Trash2, Edit2, X, Star, MessageSquare } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAdminAuth } from '@/context/AdminAuthContext'
import toast from 'react-hot-toast'

interface Review {
  id: string
  name: string
  email: string
  rating: number
  comment: string
  created_at: string
  product_id: string
  products?: {
    name: string
  }
}

export default function ReviewsPage() {
  const { store } = useAdminAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showEditForm, setShowEditForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null)
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    rating: 5,
    comment: ''
  })

  useEffect(() => {
    if (store) {
      fetchReviews()
    }
  }, [store])

  const fetchReviews = async () => {
    if (!store) return
    setLoading(true)
    try {
      // 1. Tenta buscar do Supabase
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`
          id,
          name,
          email,
          rating,
          comment,
          created_at,
          product_id,
          products (
            name
          )
        `)
        .eq('store_id', store.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }
      setReviews(data || [])
    } catch (error: any) {
      console.warn('Erro ao carregar avaliações do Supabase, tentando LocalStorage:', error)
      loadLocalReviewsFallback()
    } finally {
      setLoading(false)
    }
  }

  const loadLocalReviewsFallback = async () => {
    if (!store) return
    try {
      const { data: storeProducts } = await supabase
        .from('products')
        .select('id, name')
        .eq('store_id', store.id)

      if (!storeProducts) {
        setReviews([])
        return
      }

      const allLocalReviews: Review[] = []
      
      storeProducts.forEach(prod => {
        const localData = localStorage.getItem(`reviews_${prod.id}`)
        if (localData) {
          try {
            const parsed = JSON.parse(localData)
            parsed.forEach((rev: any) => {
              allLocalReviews.push({
                ...rev,
                products: { name: prod.name }
              })
            });
          } catch (e) {
            console.error(e)
          }
        }
      })

      allLocalReviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setReviews(allLocalReviews)
    } catch (e) {
      console.error('Erro no fallback local de avaliações:', e)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!store) return
    setSaving(true)

    try {
      const { error } = await supabase
        .from('product_reviews')
        .update({
          name: formData.name,
          rating: formData.rating,
          comment: formData.comment
        })
        .eq('id', formData.id)

      if (error) throw error

      toast.success('Avaliação atualizada com sucesso!')
      setShowEditForm(false)
      fetchReviews()
    } catch (error: any) {
      console.warn('Erro ao atualizar no Supabase, tentando localmente:', error)
      
      const targetReviewIndex = reviews.findIndex(r => r.id === formData.id)
      if (targetReviewIndex !== -1) {
        const updated = [...reviews]
        const prodId = updated[targetReviewIndex].product_id
        
        updated[targetReviewIndex] = {
          ...updated[targetReviewIndex],
          name: formData.name,
          rating: formData.rating,
          comment: formData.comment
        }
        
        const productLocalReviews = updated.filter(r => r.product_id === prodId).map(r => ({
          id: r.id,
          name: r.name,
          email: r.email,
          rating: r.rating,
          comment: r.comment,
          created_at: r.created_at,
          product_id: r.product_id,
          store_id: store.id
        }))
        
        localStorage.setItem(`reviews_${prodId}`, JSON.stringify(productLocalReviews))
        setReviews(updated)
        toast.success('Avaliação atualizada localmente!')
        setShowEditForm(false)
      } else {
        toast.error('Erro ao atualizar: ' + error.message)
      }
    } finally {
      setSaving(false)
    }
  }

  const executeDelete = async () => {
    if (!reviewToDelete || !store) return
    setSaving(true)

    try {
      const { error } = await supabase
        .from('product_reviews')
        .delete()
        .eq('id', reviewToDelete.id)

      if (error) throw error

      toast.success('Avaliação excluída com sucesso!')
      fetchReviews()
    } catch (error: any) {
      console.warn('Erro ao deletar no Supabase, removendo localmente:', error)
      
      const prodId = reviewToDelete.product_id
      const localData = localStorage.getItem(`reviews_${prodId}`)
      if (localData) {
        const parsed = JSON.parse(localData)
        const filtered = parsed.filter((r: any) => r.id !== reviewToDelete.id)
        localStorage.setItem(`reviews_${prodId}`, JSON.stringify(filtered))
      }
      
      setReviews(reviews.filter(r => r.id !== reviewToDelete.id))
      toast.success('Avaliação removida localmente!')
    } finally {
      setSaving(false)
      setReviewToDelete(null)
    }
  }

  const filteredReviews = reviews.filter(rev => {
    const term = searchQuery.toLowerCase()
    return (
      rev.name.toLowerCase().includes(term) ||
      (rev.comment && rev.comment.toLowerCase().includes(term)) ||
      (rev.products?.name && rev.products.name.toLowerCase().includes(term))
    )
  })

  if (loading) return <div style={{ padding: '5rem', textAlign: 'center' }}><Loader2 className="animate-spin" /></div>

  return (
    <div>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Avaliações</h1>
          <p style={{ color: 'var(--muted)' }}>Gerencie as opiniões dos clientes enviadas nos produtos.</p>
        </div>
      </header>

      {/* Filtro de Busca */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Search size={20} color="var(--muted)" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Buscar por cliente, produto ou comentário..." 
          style={{ 
            flex: 1, 
            background: 'none', 
            border: 'none', 
            outline: 'none', 
            color: 'var(--foreground)',
            fontSize: '1rem'
          }} 
        />
      </div>

      {/* Lista de Avaliações */}
      {filteredReviews.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
          <MessageSquare size={48} color="var(--muted)" style={{ margin: '0 auto 1.5rem', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Nenhuma avaliação encontrada</h3>
          <p style={{ color: 'var(--muted)', margin: 0 }}>Nossos compradores ainda não enviaram avaliações ou a busca não retornou resultados.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {filteredReviews.map((rev) => (
            <div key={rev.id} className="glass-card review-card" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--foreground)' }}>{rev.name}</strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--muted)', wordBreak: 'break-all' }}>{rev.email}</span>
                  
                  {/* Estrelas */}
                  <div style={{ display: 'flex', gap: '0.1rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        size={16} 
                        fill={star <= rev.rating ? '#f59e0b' : 'transparent'} 
                        color={star <= rev.rating ? '#f59e0b' : '#cbd5e1'} 
                      />
                    ))}
                  </div>
                </div>

                <div style={{ fontSize: '0.9rem', color: 'var(--muted)', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span>Produto:</span>
                  <strong style={{ color: 'var(--foreground)' }}>{rev.products?.name || 'Produto Removido'}</strong>
                  <span>•</span>
                  <span>{new Date(rev.created_at).toLocaleDateString('pt-BR')}</span>
                </div>

                <p style={{ margin: 0, fontSize: '1rem', color: 'var(--foreground)', opacity: 0.9, lineHeight: 1.5, fontStyle: rev.comment ? 'normal' : 'italic' }}>
                  {rev.comment || 'Apenas avaliou com estrelas.'}
                </p>
              </div>

              {/* Ações */}
              <div className="review-actions" style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  onClick={() => {
                    setFormData({
                      id: rev.id,
                      name: rev.name,
                      rating: rev.rating,
                      comment: rev.comment || ''
                    })
                    setShowEditForm(true)
                  }}
                  style={{
                    background: 'rgba(99,102,241,0.1)',
                    border: 'none',
                    color: 'var(--primary)',
                    padding: '0.6rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: '0.2s'
                  }}
                  title="Editar Avaliação"
                  className="review-action-btn"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => setReviewToDelete(rev)}
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: 'none',
                    color: '#ef4444',
                    padding: '0.6rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: '0.2s'
                  }}
                  title="Excluir Avaliação"
                  className="review-action-btn-del"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Edição */}
      {showEditForm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '100%', padding: '3rem', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}>
            <button onClick={() => setShowEditForm(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(0,0,0,0.05)', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}><X size={20} /></button>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '2rem', color: 'var(--foreground)' }}>Editar Avaliação</h2>
            
            <form onSubmit={handleEditSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
              <div className="form-group">
                <label>Nome do Autor</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  required 
                  placeholder="Nome do cliente" 
                />
              </div>

              <div className="form-group">
                <label>Nota (1 a 5 estrelas)</label>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({...formData, rating: star})}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.2rem' }}
                    >
                      <Star 
                        size={28} 
                        fill={star <= formData.rating ? '#f59e0b' : 'transparent'} 
                        color={star <= formData.rating ? '#f59e0b' : '#cbd5e1'} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Comentário / Opinião</label>
                <textarea 
                  rows={4}
                  value={formData.comment} 
                  onChange={e => setFormData({...formData, comment: e.target.value})} 
                  placeholder="Comentário do cliente"
                  style={{
                    background: 'var(--input-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '0.875rem 1.1rem',
                    color: 'var(--foreground)',
                    outline: 'none',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '1.1rem', marginTop: '1rem', width: '100%', fontSize: '1rem', boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)' }}>
                {saving ? <Loader2 className="animate-spin" size={20} /> : 'Salvar Alterações'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão Customizado */}
      {reviewToDelete && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <div className="glass-card" style={{ maxWidth: '450px', width: '100%', padding: '2.5rem', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)', textAlign: 'center' }}>
            <button onClick={() => setReviewToDelete(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(0,0,0,0.05)', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}><X size={20} /></button>
            
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <Trash2 size={30} />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--foreground)' }}>Excluir Avaliação</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              Tem certeza que deseja excluir permanentemente a avaliação de <strong style={{ color: 'var(--foreground)' }}>{reviewToDelete.name}</strong>? Esta ação não poderá ser desfeita.
            </p>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => setReviewToDelete(null)} 
                className="btn-secondary" 
                style={{ flex: 1, padding: '0.85rem', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button 
                onClick={executeDelete} 
                disabled={saving}
                style={{ flex: 1, padding: '0.85rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                onMouseLeave={e => e.currentTarget.style.filter = 'none'}
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .form-group { display: flex; flex-direction: column; gap: 0.6rem; }
        label { font-size: 0.9rem; font-weight: 600; color: var(--foreground); opacity: 0.8; }
        input { background: var(--input-bg); border: 1px solid var(--border); border-radius: 10px; padding: 0.875rem 1.1rem; color: var(--foreground); outline: none; transition: 0.2s; font-size: 1rem; }
        input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
        input::placeholder { color: var(--muted); opacity: 0.5; }
        
        .review-action-btn:hover {
          background: rgba(99,102,241,0.2) !important;
          transform: translateY(-1px);
        }
        .review-action-btn-del:hover {
          background: rgba(239,68,68,0.2) !important;
          transform: translateY(-1px);
        }
        
        .btn-primary { background: var(--primary); color: white; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
        .btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
        
        .btn-secondary { background: var(--input-bg); color: var(--foreground); border: 1px solid var(--border); border-radius: 10px; font-weight: 600; transition: 0.2s; }
        .btn-secondary:hover { background: rgba(0,0,0,0.05); }

        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .review-card {
            flex-direction: column !important;
            align-items: stretch !important;
            padding: 1.25rem !important;
            gap: 1.25rem !important;
          }
          .review-actions {
            width: 100% !important;
            justify-content: flex-end !important;
            border-top: 1px solid var(--border) !important;
            padding-top: 0.75rem !important;
          }
        }
      `}</style>
    </div>
  )
}
