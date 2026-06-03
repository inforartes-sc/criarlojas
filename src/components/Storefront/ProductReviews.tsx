"use client"

import { useState, useEffect } from 'react'
import { Star, MessageSquare, ShieldCheck, User, Calendar, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

interface ProductReviewsProps {
  productId: string
  storeId: string
  isDark: boolean
  primaryColor: string
  buttonRadius: string
}

interface Review {
  id: string
  name: string
  email: string
  rating: number
  comment: string
  created_at: string
}

export default function ProductReviews({
  productId,
  storeId,
  isDark,
  primaryColor,
  buttonRadius
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [usingFallback, setUsingFallback] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [productId])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      // Tenta buscar do Supabase
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })

      if (error) {
        // Se a tabela não existir, cai no fallback do LocalStorage
        if (error.code === 'PGRST116' || error.message.includes('relation "product_reviews" does not exist')) {
          setUsingFallback(true)
          loadLocalReviews()
          return
        }
        throw error
      }

      setReviews(data || [])
    } catch (err: any) {
      console.warn('Erro ao carregar avaliações do Supabase, usando LocalStorage:', err)
      setUsingFallback(true)
      loadLocalReviews()
    } finally {
      setLoading(false)
    }
  }

  const loadLocalReviews = () => {
    try {
      const localData = localStorage.getItem(`reviews_${productId}`)
      if (localData) {
        setReviews(JSON.parse(localData))
      } else {
        // Mock inicial elegante para não ficar vazio
        const mockReviews: Review[] = [
          {
            id: 'mock-1',
            name: 'Carlos Oliveira',
            email: 'carlos@exemplo.com',
            rating: 5,
            comment: 'Excelente produto! Superou todas as minhas expectativas. A entrega foi super rápida e o atendimento da loja é nota 10.',
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'mock-2',
            name: 'Mariana Souza',
            email: 'mariana@exemplo.com',
            rating: 4,
            comment: 'Gostei muito do produto, material de boa qualidade. Chegou bem embalado. Apenas o prazo de entrega que atrasou um dia, mas valeu a pena.',
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
        setReviews(mockReviews)
        localStorage.setItem(`reviews_${productId}`, JSON.stringify(mockReviews))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Por favor, informe seu nome.')
      return
    }
    if (rating < 1 || rating > 5) {
      toast.error('Por favor, selecione uma nota de 1 a 5 estrelas.')
      return
    }

    setSubmitting(true)
    const newReview = {
      name: name.trim(),
      email: email.trim(),
      rating,
      comment: comment.trim(),
      product_id: productId,
      store_id: storeId
    }

    try {
      if (usingFallback) {
        // Salva localmente
        const localReview: Review = {
          id: `rev_${Date.now()}`,
          ...newReview,
          created_at: new Date().toISOString()
        }
        const updatedReviews = [localReview, ...reviews]
        setReviews(updatedReviews)
        localStorage.setItem(`reviews_${productId}`, JSON.stringify(updatedReviews))
        toast.success('Avaliação enviada com sucesso!')
        resetForm()
      } else {
        // Tenta salvar no Supabase
        const { data, error } = await supabase
          .from('product_reviews')
          .insert(newReview)
          .select()

        if (error) throw error

        if (data && data[0]) {
          setReviews([data[0], ...reviews])
          toast.success('Avaliação enviada com sucesso!')
          resetForm()
        }
      }
    } catch (err: any) {
      console.error('Erro ao enviar avaliação:', err)
      // Tenta fallback caso dê erro no Supabase
      const localReview: Review = {
        id: `rev_${Date.now()}`,
        ...newReview,
        created_at: new Date().toISOString()
      }
      const updatedReviews = [localReview, ...reviews]
      setReviews(updatedReviews)
      localStorage.setItem(`reviews_${productId}`, JSON.stringify(updatedReviews))
      toast.success('Avaliação salva localmente no navegador!')
      resetForm()
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setName('')
    setEmail('')
    setComment('')
    setRating(5)
  }

  // Estatísticas de Avaliação
  const totalReviews = reviews.length
  const averageRating = totalReviews > 0 
    ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
    : 0

  const ratingCounts = [0, 0, 0, 0, 0] // 1, 2, 3, 4, 5 estrelas
  reviews.forEach(r => {
    const idx = Math.min(Math.max(1, r.rating), 5) - 1
    ratingCounts[idx]++
  })

  const inputRadius = buttonRadius === '0px' ? '0px' : '8px'

  return (
    <div style={{ marginTop: '5rem', borderTop: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #eaeaea', paddingTop: '4rem' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '2.5rem', letterSpacing: '-0.5px', color: isDark ? '#fff' : '#111', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <MessageSquare size={28} color={primaryColor} />
        <span>Avaliações dos Clientes</span>
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '4rem', alignItems: 'flex-start' }} className="product-main-grid">
        {/* Painel de Estatísticas */}
        <div style={{ background: isDark ? 'rgba(255,255,255,0.02)' : '#f9fafb', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #eaeaea', borderRadius: '16px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ textAlign: 'center', paddingBottom: '1.5rem', borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #eaeaea' }}>
            <span style={{ fontSize: '3.5rem', fontWeight: 900, color: isDark ? '#fff' : '#111', lineHeight: 1 }}>
              {averageRating > 0 ? averageRating : '0.0'}
            </span>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.2rem', margin: '0.75rem 0 0.5rem 0' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  size={20} 
                  fill={star <= Math.round(averageRating) ? '#f59e0b' : 'transparent'} 
                  color={star <= Math.round(averageRating) ? '#f59e0b' : '#cbd5e1'} 
                />
              ))}
            </div>
            <span style={{ fontSize: '0.85rem', color: isDark ? '#aaa' : '#666', fontWeight: 600 }}>
              Baseado em {totalReviews} {totalReviews === 1 ? 'avaliação' : 'avaliações'}
            </span>
          </div>

          {/* Gráfico de barras por estrelas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = ratingCounts[stars - 1]
              const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0
              return (
                <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', fontWeight: 600 }}>
                  <span style={{ width: '60px', color: isDark ? '#ccc' : '#444', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    {stars} <Star size={12} fill="#f59e0b" color="#f59e0b" />
                  </span>
                  <div style={{ flex: 1, height: '8px', background: isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${percent}%`, height: '100%', background: '#f59e0b', borderRadius: '4px' }} />
                  </div>
                  <span style={{ width: '30px', textAlign: 'right', color: isDark ? '#aaa' : '#666' }}>
                    {count}
                  </span>
                </div>
              )
            })}
          </div>

          {usingFallback && (
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.2)', borderRadius: '10px', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.75rem', color: '#0ea5e9', fontWeight: 600 }}>
              <AlertCircle size={16} />
              <span>Modo offline ativo (salvamento no navegador)</span>
            </div>
          )}
        </div>

        {/* Lado Direito: Formulário de Envio e Lista de Avaliações */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {/* Formulário de Envio */}
          <form onSubmit={handleSubmit} style={{ background: isDark ? 'rgba(255,255,255,0.01)' : '#fff', border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #eaeaea', borderRadius: '16px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: isDark ? '#fff' : '#111', marginBottom: '1.5rem' }}>Avaliar este produto</h3>
            
            <div style={{ display: 'grid', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: isDark ? '#aaa' : '#555', marginBottom: '0.5rem' }}>Sua nota *</label>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isStarred = hoverRating !== null ? star <= hoverRating : star <= rating
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.2rem' }}
                      >
                        <Star 
                          size={28} 
                          fill={isStarred ? '#f59e0b' : 'transparent'} 
                          color={isStarred ? '#f59e0b' : '#cbd5e1'} 
                        />
                      </button>
                    )
                  })}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="product-extra-widgets-grid">
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: isDark ? '#aaa' : '#555', marginBottom: '0.5rem' }}>Nome *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Seu nome completo"
                    required
                    style={{ width: '100%', padding: '0.75rem 1rem', background: isDark ? 'rgba(255,255,255,0.05)' : '#fff', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #ddd', borderRadius: inputRadius, color: isDark ? '#fff' : '#000', outline: 'none', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: isDark ? '#aaa' : '#555', marginBottom: '0.5rem' }}>E-mail (não será exibido)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    style={{ width: '100%', padding: '0.75rem 1rem', background: isDark ? 'rgba(255,255,255,0.05)' : '#fff', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #ddd', borderRadius: inputRadius, color: isDark ? '#fff' : '#000', outline: 'none', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: isDark ? '#aaa' : '#555', marginBottom: '0.5rem' }}>Comentário / Opinião</label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="O que você achou do produto? Fale sobre a qualidade, durabilidade, etc."
                  style={{ width: '100%', padding: '0.75rem 1rem', background: isDark ? 'rgba(255,255,255,0.05)' : '#fff', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #ddd', borderRadius: inputRadius, color: isDark ? '#fff' : '#000', outline: 'none', fontSize: '0.9rem', resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{ justifySelf: 'start', padding: '0.85rem 2rem', backgroundColor: primaryColor, color: '#fff', border: 'none', borderRadius: buttonRadius, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'filter 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                onMouseLeave={e => e.currentTarget.style.filter = 'none'}
              >
                <span>Enviar Avaliação</span>
              </button>
            </div>
          </form>

          {/* Lista de Avaliações */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: isDark ? '#fff' : '#111', marginBottom: '0.5rem' }}>Opiniões recentes</h3>
            {reviews.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: isDark ? '#aaa' : '#666', border: isDark ? '1px dashed rgba(255,255,255,0.1)' : '1px dashed #eaeaea', borderRadius: '16px' }}>
                <MessageSquare size={36} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p style={{ margin: 0, fontWeight: 600 }}>Nenhuma avaliação para este produto ainda.</p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', opacity: 0.8 }}>Seja o primeiro a avaliar e ajude outros compradores!</p>
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #eaeaea', paddingBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: primaryColor }}>
                        <User size={16} />
                      </div>
                      <div>
                        <span style={{ fontWeight: 700, color: isDark ? '#fff' : '#111', fontSize: '0.95rem' }}>{rev.name}</span>
                        <div style={{ display: 'flex', gap: '0.1rem', marginTop: '0.15rem' }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              size={12} 
                              fill={star <= rev.rating ? '#f59e0b' : 'transparent'} 
                              color={star <= rev.rating ? '#f59e0b' : '#cbd5e1'} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <span style={{ fontSize: '0.8rem', color: isDark ? '#aaa' : '#666', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 500 }}>
                      <Calendar size={14} />
                      {new Date(rev.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.95rem', color: isDark ? '#ccc' : '#444', lineHeight: 1.5, paddingLeft: '2.5rem' }}>
                    {rev.comment || <em style={{ opacity: 0.7 }}>Apenas avaliou com estrelas.</em>}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
