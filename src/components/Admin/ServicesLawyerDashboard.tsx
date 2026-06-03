"use client"

import { useState, useEffect } from 'react'
import { Users, Briefcase, Star, UserCheck, Loader2, ArrowRight, Scale, Wrench, Mail, Phone, Package, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Props {
  store: any
  layoutModel: string
}

export default function ServicesLawyerDashboard({ store, layoutModel }: Props) {
  const settings = store.settings || {}
  const [loading, setLoading] = useState(true)
  const [totalCustomers, setTotalCustomers] = useState(0)
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalParts, setTotalParts] = useState(0)
  const [recentCustomers, setRecentCustomers] = useState<any[]>([])
  const [totalOrders, setTotalOrders] = useState(0)
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [lowStockParts, setLowStockParts] = useState<any[]>([])

  const teamMembers = settings.team_members || []
  const testimonials = settings.testimonials || []
  const categoriesList = settings.categories || []

  useEffect(() => {
    loadData()
  }, [store])

  const loadData = async () => {
    setLoading(true)
    try {
      const { count: custCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', store.id)
      setTotalCustomers(custCount || 0)

      const { data: custData } = await supabase
        .from('customers')
        .select('name, email, phone, created_at')
        .eq('store_id', store.id)
        .order('created_at', { ascending: false })
        .limit(5)
      setRecentCustomers(custData || [])

      const { count: prodCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', store.id)
        .eq('is_service', true)
      setTotalProducts(prodCount || 0)

      const { count: partsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', store.id)
        .eq('is_service', false)
      setTotalParts(partsCount || 0)

      const { count: orderCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', store.id)
      setTotalOrders(orderCount || 0)

      // 1. Fetch recent orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('id, total_amount, status, created_at, customers(name, email)')
        .eq('store_id', store.id)
        .order('created_at', { ascending: false })
        .limit(3)
      setRecentOrders(ordersData || [])

      // 2. Fetch low stock parts
      const { data: lowStockData } = await supabase
        .from('products')
        .select('name, stock_quantity, category')
        .eq('store_id', store.id)
        .eq('is_service', false)
        .lte('stock_quantity', 5)
        .order('stock_quantity', { ascending: true })
        .limit(4)
      setLowStockParts(lowStockData || [])
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
    } finally {
      setLoading(false)
    }
  }

  const isLawyer = layoutModel === 'lawyer' || layoutModel === 'advocacia' || layoutModel === 'advocacy'

  const statsCards = isLawyer 
    ? [
        {
          label: 'Clientes',
          value: totalCustomers,
          icon: Users,
          color: '#6366f1',
          link: '/admin/customers'
        },
        {
          label: 'Áreas de Atuação',
          value: (settings.practice_areas || categoriesList || []).length || 0,
          icon: Scale,
          color: '#0ea5e9',
          link: null
        },
        {
          label: 'Membros da Equipe',
          value: teamMembers.length,
          icon: UserCheck,
          color: '#22c55e',
          link: '/admin/settings'
        },
        {
          label: 'Depoimentos',
          value: testimonials.length,
          icon: Star,
          color: '#ec4899',
          link: '/admin/settings'
        }
      ]
    : [
        {
          label: 'Serviços',
          value: totalProducts,
          icon: Wrench,
          color: '#6366f1',
          link: '/admin/products'
        },
        {
          label: 'Peças',
          value: totalParts,
          icon: Package,
          color: '#0ea5e9',
          link: '/admin/parts'
        },
        {
          label: 'Orçamentos',
          value: totalOrders,
          icon: ShoppingBag,
          color: '#22c55e',
          link: '/admin/orders'
        },
        {
          label: 'Clientes',
          value: totalCustomers,
          icon: Users,
          color: '#ec4899',
          link: '/admin/customers'
        }
      ]
  ;

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            Dashboard
            {loading && <Loader2 size={24} className="animate-spin" color="#6366f1" />}
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
            {isLawyer ? 'Acompanhe as métricas do seu escritório.' : 'Acompanhe as métricas da sua empresa.'}
          </p>
        </div>
        <Link href="/admin/settings" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#6366f1', color: '#fff', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', height: '46px', whiteSpace: 'nowrap' }}>
          Configurações
          <ArrowRight size={18} />
        </Link>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${statsCards.length}, 1fr)`, gap: '1.5rem' }} className="stats-grid">
        {statsCards.map((card, i) => (
          <div key={i} className="glass-card stat-card" style={{ padding: '1.5rem', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
            <div className="stat-icon-wrapper" style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${card.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color, flexShrink: 0 }}>
              <card.icon size={18} />
            </div>
            <div className="stat-info-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span className="stat-label" style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.label}</span>
              <div className="stat-value" style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.value}</div>
              {card.link && (
                <Link href={card.link} className="stat-link" style={{ fontSize: '0.8rem', color: card.color, textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.25rem' }}>
                  Gerenciar <ArrowRight size={14} />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-two-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {isLawyer ? (
          <>
            <div className="glass-card" style={{ padding: '1.75rem', borderRadius: '16px', display: 'grid', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Membros da Equipe</h3>
                <Link href="/admin/settings" style={{ fontSize: '0.85rem', color: '#6366f1', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  Gerenciar <ArrowRight size={14} />
                </Link>
              </div>
              {teamMembers.length === 0 ? (
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Nenhum membro cadastrado ainda.</p>
              ) : (
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {teamMembers.slice(0, 4).map((member: any, i: number) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '10px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `linear-gradient(135deg, #6366f1, #8b5cf6)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem', overflow: 'hidden', flexShrink: 0 }}>
                        {member.photo ? <img src={member.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (member.name?.charAt(0) || '?')}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.name || 'Sem nome'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.role || ''}</div>
                      </div>
                    </div>
                  ))}
                  {teamMembers.length > 4 && (
                    <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--muted)' }}>+{teamMembers.length - 4} outros</div>
                  )}
                </div>
              )}
            </div>

            <div className="glass-card" style={{ padding: '1.75rem', borderRadius: '16px', display: 'grid', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Depoimentos</h3>
                <Link href="/admin/settings" style={{ fontSize: '0.85rem', color: '#6366f1', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  Gerenciar <ArrowRight size={14} />
                </Link>
              </div>
              {testimonials.length === 0 ? (
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Nenhum depoimento cadastrado ainda.</p>
              ) : (
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {testimonials.slice(0, 3).map((t: any, i: number) => (
                    <div key={i} style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{t.name || 'Anônimo'}</span>
                        {t.rating && (
                          <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>{'★'.repeat(t.rating)}</span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {t.text || t.desc || ''}
                      </p>
                    </div>
                  ))}
                  {testimonials.length > 3 && (
                    <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--muted)' }}>+{testimonials.length - 3} outros</div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="glass-card" style={{ padding: '1.75rem', borderRadius: '16px', display: 'grid', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Últimos Orçamentos</h3>
                <Link href="/admin/orders" style={{ fontSize: '0.85rem', color: '#6366f1', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  Ver Todos <ArrowRight size={14} />
                </Link>
              </div>
              {recentOrders.length === 0 ? (
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Nenhum orçamento cadastrado ainda.</p>
              ) : (
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {recentOrders.map((order: any, i: number) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: '10px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>#{order.id.slice(0, 8).toUpperCase()}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{order.customers?.name || 'Cliente'}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#6366f1' }}>R$ {order.total_amount?.toFixed(2).replace('.', ',')}</div>
                        <div style={{ fontSize: '0.75rem', color: order.status === 'Pago' ? '#22c55e' : '#f59e0b', fontWeight: 700 }}>{order.status || 'Pendente'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-card" style={{ padding: '1.75rem', borderRadius: '16px', display: 'grid', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Alerta de Estoque (Peças)</h3>
                <Link href="/admin/products" style={{ fontSize: '0.85rem', color: '#6366f1', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  Ver Estoque <ArrowRight size={14} />
                </Link>
              </div>
              {lowStockParts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--muted)', fontSize: '0.85rem' }}>
                  Estoque de peças saudável!
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {lowStockParts.map((part: any, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: '10px', backgroundColor: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{part.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{part.category || 'Peças'}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#ef4444' }}>{part.stock_quantity} un</div>
                        <div style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 700 }}>{part.stock_quantity === 0 ? 'Sem estoque' : 'Estoque Baixo'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="glass-card table-card" style={{ padding: '1.75rem', borderRadius: '16px', display: 'grid', gap: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Últimos Clientes</h3>
          <Link href="/admin/customers" style={{ fontSize: '0.85rem', color: '#6366f1', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Ver Todos <ArrowRight size={14} />
          </Link>
        </div>
        {recentCustomers.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Nenhum cliente cadastrado ainda.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem', color: 'var(--muted)', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nome</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem', color: 'var(--muted)', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>E-mail</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem', color: 'var(--muted)', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Telefone</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem', color: 'var(--muted)', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Data</th>
                </tr>
              </thead>
              <tbody>
                {recentCustomers.map((c: any, i: number) => (
                  <tr key={c.id || i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{c.name || '—'}</td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--muted)' }}>{c.email || '—'}</td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--muted)' }}>{c.phone || '—'}</td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--muted)', fontSize: '0.85rem' }}>{c.created_at ? new Date(c.created_at).toLocaleDateString('pt-BR') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .stat-card {
          display: flex !important;
          flex-direction: column !important;
          justify-content: space-between !important;
          gap: 1rem !important;
        }
        .stat-icon-wrapper {
          align-self: flex-start !important;
        }
        .stat-info-wrapper {
          display: flex !important;
          flex-direction: column !important;
          gap: 0.25rem !important;
        }

        /* Responsividade para o painel de serviços / advocacia */
        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 1.25rem !important;
            margin-bottom: 1.5rem !important;
          }
          .dashboard-header a {
            width: 100% !important;
            justify-content: center !important;
          }
          .stats-grid {
            grid-template-columns: 1fr !important;
            gap: 0.75rem !important;
          }
          .stat-card {
            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-between !important;
            padding: 1rem !important;
            gap: 0.75rem !important;
          }
          .stat-info-wrapper {
            flex: 1 !important;
            min-width: 0 !important;
          }
          .stat-card .stat-value {
            font-size: 1.35rem !important;
          }
          .dashboard-two-cols {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
          .table-card {
            margin-left: -1.25rem !important;
            margin-right: -1.25rem !important;
            border-radius: 0 !important;
            border-left: none !important;
            border-right: none !important;
          }
        }
      `}</style>
    </div>
  )
}
