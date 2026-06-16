"use client"

import { useState, useEffect } from 'react'
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Package, 
  Plus, 
  Wand2, 
  CheckCircle2, 
  Loader2,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Calendar,
  RefreshCw,
  Filter
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAdminAuth } from '@/context/AdminAuthContext'
import ServicesLawyerDashboard from '@/components/Admin/ServicesLawyerDashboard'

export default function AdminDashboard() {
  const { store } = useAdminAuth()
  const layoutModel = store?.settings?.layout_model || ''
  const isServiceOrLawyer = ['services', 'aura', 'lawyer', 'advocacia', 'advocacy', 'electrician'].includes(layoutModel)



  if (isServiceOrLawyer && store) {
    return <ServicesLawyerDashboard store={store} layoutModel={layoutModel} />
  }

  const [loadingData, setLoadingData] = useState(true)
  const [allOrders, setAllOrders] = useState<any[]>([])
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([])
  const [totalCustomersCount, setTotalCustomersCount] = useState(0)

  // Filtros de Tempo
  const [timeFilter, setTimeFilter] = useState('7d')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  // Estado Calculado para o Gráfico e Cards
  const [calcStats, setCalcStats] = useState({
    totalRevenue: 0,
    totalOrdersCount: 0,
    averageTicket: 0,
    chartLabels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'],
    chartValues: [0, 0, 0, 0, 0, 0, 0]
  })

  useEffect(() => {
    if (store) {
      fetchDashboardBaseData()
    }
  }, [store])

  useEffect(() => {
    filterAndCalculate(allOrders, timeFilter, customStartDate, customEndDate)
  }, [allOrders, timeFilter, customStartDate, customEndDate])

  const fetchDashboardBaseData = async () => {
    if (!store) return
    setLoadingData(true)
    try {
      // 1. Buscar Todos os Pedidos Reais
      const { data: ordersData, error: ordersErr } = await supabase
        .from('orders')
        .select('id, total_amount, status, created_at, customers(name, email)')
        .eq('store_id', store.id)
        .order('created_at', { ascending: false })

      if (ordersErr) throw ordersErr

      // Garantir compatibilidade com ordem numérica para exibição
      const orders = (ordersData || []).map((o: any, idx: number) => ({
        ...o,
        order_number: o.order_number || null,
        _displayId: o.id.slice(0, 8).toUpperCase()
      }))
      setAllOrders(orders)
      setRecentOrders(orders.slice(0, 5))

      // 2. Buscar Contagem de Clientes Reais
      const { count: customersCount, error: custErr } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', store.id)

      if (custErr) console.error('Erro clientes:', custErr)
      setTotalCustomersCount(customersCount || 0)

      // 3. Buscar Produtos para Alerta de Estoque (verificando variações)
      const { data: productsData, error: prodErr } = await supabase
        .from('products')
        .select('name, stock_quantity, category, has_variations, variation_skus')
        .eq('store_id', store.id)

      if (prodErr) console.error('Erro produtos:', prodErr)
      
      const allProds = productsData || []
      const calculatedProds = allProds.map(p => {
        let currentStock = p.stock_quantity || 0
        if (p.has_variations && p.variation_skus && p.variation_skus.length > 0) {
          currentStock = p.variation_skus.reduce((sum: number, v: any) => sum + (parseInt(v.stock_quantity) || 0), 0)
        }
        return {
          name: p.name,
          category: p.category,
          stock_quantity: currentStock
        }
      })

      // Filtrar apenas estoque crítico (<= 5) e ordenar
      const lowStock = calculatedProds
        .filter(p => p.stock_quantity <= 5)
        .sort((a, b) => a.stock_quantity - b.stock_quantity)
        .slice(0, 5)

      setLowStockProducts(lowStock)

    } catch (err: any) {
      console.error('Erro ao carregar dashboard:', err)
    } finally {
      setLoadingData(false)
    }
  }

  const filterAndCalculate = (ordersList: any[], filterType: string, startStr: string, endStr: string) => {
    if (!ordersList) return

    const validOrders = ordersList.filter(o => !o.status?.toLowerCase().includes('cancelado'))
    const now = new Date()
    let filteredOrders = validOrders
    let chartLabels: string[] = []
    let chartValues: number[] = []

    if (filterType === 'hoje') {
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      filteredOrders = validOrders.filter(o => new Date(o.created_at) >= startOfToday)
      
      chartLabels = ['00h-06h', '06h-12h', '12h-18h', '18h-24h']
      chartValues = [0, 0, 0, 0]
      filteredOrders.forEach(o => {
        const hour = new Date(o.created_at).getHours()
        if (hour < 6) chartValues[0] += (o.total_amount || 0)
        else if (hour < 12) chartValues[1] += (o.total_amount || 0)
        else if (hour < 18) chartValues[2] += (o.total_amount || 0)
        else chartValues[3] += (o.total_amount || 0)
      })

    } else if (filterType === '7d') {
      const startOf7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      filteredOrders = validOrders.filter(o => new Date(o.created_at) >= startOf7d)
      
      chartLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom']
      chartValues = [0, 0, 0, 0, 0, 0, 0]
      filteredOrders.forEach(o => {
        const date = new Date(o.created_at)
        const dayIndex = (date.getDay() + 6) % 7 // Seg=0 ... Dom=6
        chartValues[dayIndex] += (o.total_amount || 0)
      })

    } else if (filterType === '30d') {
      const startOf30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      filteredOrders = validOrders.filter(o => new Date(o.created_at) >= startOf30d)

      chartLabels = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4']
      chartValues = [0, 0, 0, 0]
      filteredOrders.forEach(o => {
        const diffDays = Math.floor((now.getTime() - new Date(o.created_at).getTime()) / (24 * 60 * 60 * 1000))
        if (diffDays <= 7) chartValues[3] += (o.total_amount || 0)
        else if (diffDays <= 14) chartValues[2] += (o.total_amount || 0)
        else if (diffDays <= 21) chartValues[1] += (o.total_amount || 0)
        else chartValues[0] += (o.total_amount || 0)
      })

    } else if (filterType === '90d') {
      const startOf90d = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      filteredOrders = validOrders.filter(o => new Date(o.created_at) >= startOf90d)

      chartLabels = ['Mês -2', 'Mês -1', 'Mês Atual']
      chartValues = [0, 0, 0]
      filteredOrders.forEach(o => {
        const diffDays = Math.floor((now.getTime() - new Date(o.created_at).getTime()) / (24 * 60 * 60 * 1000))
        if (diffDays <= 30) chartValues[2] += (o.total_amount || 0)
        else if (diffDays <= 60) chartValues[1] += (o.total_amount || 0)
        else chartValues[0] += (o.total_amount || 0)
      })

    } else if (filterType === 'custom') {
      if (startStr && endStr) {
        const start = new Date(`${startStr}T00:00:00`)
        const end = new Date(`${endStr}T23:59:59`)
        filteredOrders = validOrders.filter(o => {
          const d = new Date(o.created_at)
          return d >= start && d <= end
        })
      } else {
        filteredOrders = validOrders
      }

      chartLabels = ['Início', 'Parte 2', 'Meio', 'Parte 4', 'Fim']
      chartValues = [0, 0, 0, 0, 0]
      if (filteredOrders.length > 0) {
        const times = filteredOrders.map(o => new Date(o.created_at).getTime())
        const minT = Math.min(...times)
        const maxT = Math.max(...times, minT + 1000)
        const span = maxT - minT
        filteredOrders.forEach(o => {
          const t = new Date(o.created_at).getTime()
          const index = Math.min(4, Math.floor(((t - minT) / span) * 5))
          chartValues[index] += (o.total_amount || 0)
        })
      }
    }

    const totalRev = filteredOrders.reduce((acc, o) => acc + (o.total_amount || 0), 0)
    const totalCount = filteredOrders.length
    const avgTicket = totalCount > 0 ? totalRev / totalCount : 0

    setCalcStats({
      totalRevenue: totalRev,
      totalOrdersCount: totalCount,
      averageTicket: avgTicket,
      chartLabels,
      chartValues
    })
  }



  const statsConfig = [
    { 
      label: 'Faturamento Total', 
      value: `R$ ${calcStats.totalRevenue.toFixed(2).replace('.', ',')}`, 
      icon: DollarSign, 
      color: '#22c55e', 
      trend: timeFilter === 'hoje' ? 'Hoje' : timeFilter === '7d' ? '7 Dias' : timeFilter === '30d' ? '30 Dias' : timeFilter === '90d' ? '90 Dias' : 'Personalizado', 
      isUp: true 
    },
    { 
      label: 'Pedidos Realizados', 
      value: `${calcStats.totalOrdersCount}`, 
      icon: ShoppingBag, 
      color: '#6366f1', 
      trend: timeFilter === 'hoje' ? 'Hoje' : timeFilter === '7d' ? '7 Dias' : timeFilter === '30d' ? '30 Dias' : timeFilter === '90d' ? '90 Dias' : 'Personalizado', 
      isUp: true 
    },
    { 
      label: 'Ticket Médio', 
      value: `R$ ${calcStats.averageTicket.toFixed(2).replace('.', ',')}`, 
      icon: TrendingUp, 
      color: '#0ea5e9', 
      trend: timeFilter === 'hoje' ? 'Hoje' : timeFilter === '7d' ? '7 Dias' : timeFilter === '30d' ? '30 Dias' : timeFilter === '90d' ? '90 Dias' : 'Personalizado', 
      isUp: true 
    },
    { 
      label: 'Clientes Cadastrados', 
      value: `${totalCustomersCount}`, 
      icon: Users, 
      color: '#ec4899', 
      trend: 'Total', 
      isUp: true 
    },
  ]

  const getStatusBadge = (status: string) => {
    if (!status) return { label: 'Pendente', bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }
    const s = status.toLowerCase()
    if (s.startsWith('pago')) return { label: status.split('|')[0].trim(), bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }
    if (s.startsWith('pendente')) return { label: status.split('|')[0].trim(), bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }
    if (s.startsWith('enviado')) return { label: status.split('|')[0].trim(), bg: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }
    if (s.startsWith('entregue')) return { label: status.split('|')[0].trim(), bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }
    if (s.startsWith('cancelado')) return { label: status.split('|')[0].trim(), bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }
    return { label: status.split('|')[0].trim(), bg: 'rgba(148, 163, 184, 0.1)', color: '#64748b' }
  }

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            Resumo Executivo
            {loadingData && <Loader2 size={24} className="animate-spin" color="#6366f1" />}
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>Acompanhe as métricas e atividades reais da sua loja em tempo real.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={fetchDashboardBaseData} 
            disabled={loadingData} 
            style={{ background: 'white', border: '1px solid var(--border)', padding: '0.75rem 1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
          >
            <RefreshCw size={18} className={loadingData ? "animate-spin" : ""} color="#6366f1" />
            Atualizar Dados
          </button>

        </div>
      </header>

      {/* Cards de Métricas Reais */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }} className="stats-grid">
        {statsConfig.map((stat) => (
          <div key={stat.label} className="glass-card stat-card" style={{ padding: '1.5rem', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
            <div className="stat-icon-wrapper" style={{ padding: '0.5rem', backgroundColor: `${stat.color}15`, borderRadius: '10px', color: stat.color, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px' }}>
              <stat.icon size={20} />
            </div>
            <div className="stat-info-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div className="stat-label" style={{ color: 'var(--muted)', fontSize: '0.85rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stat.label}</div>
              <div className="stat-value" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {loadingData ? <Loader2 size={24} className="animate-spin" color="#6366f1" /> : stat.value}
              </div>
            </div>
            <div className="stat-trend" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', fontWeight: 700, color: stat.isUp ? '#22c55e' : '#ef4444', backgroundColor: stat.isUp ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '20px', whiteSpace: 'nowrap' }}>
              {stat.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico e Alertas de Estoque Reais */}
      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Gráfico de Vendas */}
        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Evolução de Vendas</h3>
              <Filter size={16} color="var(--muted)" />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {timeFilter === 'custom' && (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'var(--background)', padding: '0.25rem 0.5rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <input 
                    type="date" 
                    value={customStartDate} 
                    onChange={e => setCustomStartDate(e.target.value)}
                    style={{ background: 'transparent', border: 'none', fontSize: '0.8rem', color: 'var(--foreground)', outline: 'none', cursor: 'pointer' }}
                  />
                  <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>até</span>
                  <input 
                    type="date" 
                    value={customEndDate} 
                    onChange={e => setCustomEndDate(e.target.value)}
                    style={{ background: 'transparent', border: 'none', fontSize: '0.8rem', color: 'var(--foreground)', outline: 'none', cursor: 'pointer' }}
                  />
                </div>
              )}

              <select 
                value={timeFilter}
                onChange={e => setTimeFilter(e.target.value)}
                style={{ background: 'var(--background)', border: '1px solid var(--border)', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--foreground)', cursor: 'pointer', outline: 'none' }}
              >
                <option value="hoje">Hoje (Por Período)</option>
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
                <option value="custom">Personalizado (Escolher Datas)</option>
              </select>
            </div>
          </div>
          
          <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch', marginTop: 'auto' }}>
            <div style={{ height: '240px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '1rem 1rem 0 1rem', position: 'relative', minWidth: '460px' }}>
              {calcStats.chartValues.map((val, i) => {
                const maxVal = Math.max(...calcStats.chartValues, 100)
                const heightPx = val === 0 ? 8 : Math.max((val / maxVal) * 190, 28)
                const label = calcStats.chartLabels[i] || ''

                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '55px', zIndex: 1 }}>
                    <div style={{ 
                      width: '100%', 
                      height: `${heightPx}px`, 
                      background: val > 0 ? 'linear-gradient(to top, var(--primary), #a5b4fc)' : '#e2e8f0', 
                      borderRadius: '6px 6px 0 0',
                      position: 'relative',
                      transition: 'height 0.5s ease, background 0.5s ease'
                    }}>
                       <div style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.7rem', fontWeight: 800, color: val > 0 ? 'var(--primary)' : '#94a3b8', whiteSpace: 'nowrap' }}>
                         R$ {val.toFixed(0)}
                       </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: val > 0 ? 'var(--primary)' : 'var(--muted)', fontWeight: val > 0 ? 800 : 600, whiteSpace: 'nowrap' }}>
                      {label}
                    </span>
                  </div>
                )
              })}
              {/* Linhas de grade */}
              <div style={{ position: 'absolute', inset: '0 0 35px 0', borderBottom: '1px solid var(--border)', opacity: 0.3, zIndex: 0 }} />
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderBottom: '1px solid var(--border)', opacity: 0.3, zIndex: 0 }} />
              <div style={{ position: 'absolute', top: '0%', left: 0, right: 0, borderBottom: '1px solid var(--border)', opacity: 0.3, zIndex: 0 }} />
            </div>
          </div>
        </div>

        {/* Alertas de Estoque Reais */}
        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <AlertCircle color="#ef4444" size={20} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Atenção ao Estoque (Real)</h3>
          </div>
          
          <div style={{ display: 'grid', gap: '1rem', flex: 1 }}>
            {loadingData ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                <Loader2 size={28} className="animate-spin" color="#ef4444" />
              </div>
            ) : lowStockProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b', fontSize: '0.9rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={32} color="#22c55e" style={{ marginBottom: '0.5rem' }} />
                <p style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>Estoque Saudável!</p>
                <p style={{ margin: 0, fontSize: '0.8rem' }}>Nenhum produto com estoque crítico (≤ 5 unidades).</p>
              </div>
            ) : (
              lowStockProducts.map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{p.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{p.category || 'Geral'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ef4444' }}>{p.stock_quantity} un</div>
                    <div style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 600 }}>{p.stock_quantity === 0 ? 'ESGOTADO' : 'CRÍTICO'}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          <Link href="/admin/products" style={{ display: 'block', textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
            Gerenciar Produtos →
          </Link>
        </div>
      </div>

      {/* Tabela de Pedidos Recentes Reais */}
      <div className="glass-card table-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Últimas Atividades (Pedidos Reais)</h3>
          <Link href="/admin/orders" style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', textDecoration: 'none' }}>
            Ver Todos os Pedidos →
          </Link>
        </div>
        
        {loadingData ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}><Loader2 size={32} className="animate-spin" color="#6366f1" style={{ margin: '0 auto' }} /></div>
        ) : recentOrders.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            Nenhum pedido realizado ainda no sistema.
          </div>
        ) : (
          <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem 0', color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 600 }}>PEDIDO</th>
                <th style={{ padding: '1rem 0', color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 600 }}>CLIENTE</th>
                <th style={{ padding: '1rem 0', color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 600 }}>STATUS</th>
                <th style={{ padding: '1rem 0', color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 600 }}>VALOR</th>
                <th style={{ padding: '1rem 0', color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 600 }}>DATA</th>
                <th style={{ padding: '1rem 0' }}></th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, i) => {
                const badge = getStatusBadge(order.status)
                const orderIdDisplay = `#${order.order_number || order.id.slice(0, 8).toUpperCase()}`
                const customerName = order.customers?.name || 'Cliente'
                const amountDisplay = `R$ ${order.total_amount?.toFixed(2).replace('.', ',')}`
                const dateDisplay = new Date(order.created_at).toLocaleDateString() + ' ' + new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})

                return (
                  <tr key={order.id} style={{ borderBottom: i === recentOrders.length - 1 ? 'none' : '1px solid var(--border)' }}>
                    <td style={{ padding: '1.25rem 0', fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>{orderIdDisplay}</td>
                    <td style={{ padding: '1.25rem 0', fontSize: '0.95rem', color: '#334155', fontWeight: 600 }}>{customerName}</td>
                    <td style={{ padding: '1.25rem 0' }}>
                      <span style={{ 
                        padding: '0.35rem 0.75rem', 
                        borderRadius: '20px', 
                        fontSize: '0.75rem', 
                        fontWeight: 800,
                        backgroundColor: badge.bg,
                        color: badge.color,
                        border: `1px solid ${badge.color}30`,
                        textTransform: 'uppercase'
                      }}>
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 0', fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>{amountDisplay}</td>
                    <td style={{ padding: '1.25rem 0', color: 'var(--muted)', fontSize: '0.85rem', fontWeight: 500 }}>{dateDisplay}</td>
                    <td style={{ padding: '1.25rem 0', textAlign: 'right' }}>
                      <Link href="/admin/orders" style={{ color: 'var(--muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <MoreVertical size={18} />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>

      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .stat-card {
          display: grid !important;
          grid-template-areas: 
            "icon trend"
            "info info" !important;
          grid-template-columns: auto 1fr !important;
          align-items: center !important;
          gap: 0.75rem !important;
        }
        .stat-icon-wrapper {
          grid-area: icon !important;
        }
        .stat-trend {
          grid-area: trend !important;
          justify-self: end !important;
        }
        .stat-info-wrapper {
          grid-area: info !important;
          margin-top: 0.5rem !important;
        }

        /* Media queries for dashboard responsiveness */
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr !important;
            gap: 0.75rem !important;
          }
          .stat-card {
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-between !important;
            padding: 1rem !important;
            gap: 0.75rem !important;
          }
          .stat-info-wrapper {
            flex: 1 !important;
            margin-top: 0 !important;
            min-width: 0 !important;
          }
          .stat-card .stat-value {
            font-size: 1.35rem !important;
          }
          
          /* Adjust layout grids that might have 2 columns */
          .dashboard-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
            max-width: 100% !important;
            min-width: 0 !important;
            overflow: hidden !important;
          }
          .table-card {
            margin-left: -1.25rem !important;
            margin-right: -1.25rem !important;
            border-radius: 0 !important;
            border-left: none !important;
            border-right: none !important;
            max-width: calc(100% + 2.5rem) !important;
          }
        }
      `}</style>
    </div>
  )
}
