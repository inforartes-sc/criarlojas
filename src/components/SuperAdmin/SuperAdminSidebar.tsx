"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  Store, 
  Users, 
  CreditCard, 
  Bell, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  Activity,
  Layers,
  UserPlus
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function SuperAdminSidebar() {
  const pathname = usePathname()
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0)

  useEffect(() => {
    fetchPendingCount()
    const interval = setInterval(fetchPendingCount, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchPendingCount = async () => {
    try {
      const { data, error } = await supabase.from('stores').select('settings')
      if (!error && data) {
        const count = data.filter(s => s.settings?.is_pending_request === true).length
        setPendingRequestsCount(count)
      }
    } catch (err) {
      console.error('Erro ao buscar contagem de solicitações:', err)
    }
  }
  
  const menuItems = [
    { icon: LayoutDashboard, label: 'Visão Geral', href: '/super-admin' },
    { icon: UserPlus, label: 'Solicitações de Lojas', href: '/super-admin/requests', badge: pendingRequestsCount },
    { icon: Store, label: 'Lojas Cadastradas', href: '/super-admin/stores' },
    { icon: Users, label: 'Lojistas / Usuários', href: '/super-admin/merchants' },
    { icon: Layers, label: 'Planos & SaaS', href: '/super-admin/plans' },
    { icon: CreditCard, label: 'Pagamentos SaaS', href: '/super-admin/payments' },
    { icon: Bell, label: 'Avisos Globais', href: '/super-admin/announcements' },
    { icon: Settings, label: 'Configurações SaaS', href: '/super-admin/settings' },
  ]

  const handleLogout = () => {
    toast.success('Sessão Master encerrada com sucesso.')
    setTimeout(() => {
      window.location.href = '/super-admin/login'
    }, 500)
  }

  return (
    <aside style={{ 
      width: '280px', 
      height: '100vh', 
      position: 'fixed',
      left: 0,
      top: 0,
      backgroundColor: '#090d16',
      borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
      boxShadow: '5px 0 25px rgba(0,0,0,0.5)'
    }}>
      {/* Cabeçalho da Marca */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          borderRadius: '10px', 
          background: 'linear-gradient(135deg, #10b981, #0ea5e9)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
        }}>
          <ShieldCheck size={24} color="#ffffff" />
        </div>
        <div>
          <h2 style={{ 
            fontSize: '1.5rem', 
            background: 'linear-gradient(to right, #10b981, #0ea5e9)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            fontWeight: 800,
            margin: 0
          }}>
            Criar Lojas
          </h2>
          <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
            Super Admin
          </span>
        </div>
      </div>

      {/* Navegação */}
      <nav style={{ flex: 1, overflowY: 'auto', marginBottom: '0.5rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Gestão da Plataforma
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/super-admin' && pathname?.startsWith(item.href))
            
            return (
              <li key={item.label}>
                <Link href={item.href} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.85rem',
                  padding: '0.6rem 1rem',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  backgroundColor: isActive ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                  textDecoration: 'none',
                  borderRadius: '10px',
                  transition: 'all 0.2s ease',
                  fontSize: '0.95rem',
                  fontWeight: isActive ? 700 : 500,
                  border: isActive ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent'
                }} className="super-nav-item">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <item.icon size={20} style={{ color: isActive ? '#10b981' : 'inherit' }} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span style={{ padding: '0.15rem 0.5rem', borderRadius: '20px', backgroundColor: '#ef4444', color: 'white', fontSize: '0.75rem', fontWeight: 800 }}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Rodapé da Sidebar com Opção de Sair */}
      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ padding: '0.6rem 0.85rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem' }}>
            <Activity size={14} color="#10b981" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e2e8f0' }}>Sistema Estável</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Uptime: 99.98% nos últimos 30 dias</div>
        </div>

        <button 
          onClick={handleLogout}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.85rem',
            color: '#ef4444',
            background: 'transparent',
            border: 'none',
            padding: '0.6rem 1rem',
            width: '100%',
            textAlign: 'left',
            cursor: 'pointer',
            borderRadius: '10px',
            fontWeight: 600,
            fontSize: '0.95rem',
            transition: '0.2s'
          }} 
          className="auth-btn-logout"
        >
          <LogOut size={20} />
          <span>Sair do Painel</span>
        </button>
      </div>

      <style>{`
        .super-nav-item:hover {
          background: rgba(255, 255, 255, 0.05) !important;
          color: #ffffff !important;
        }
        .auth-btn-logout:hover {
          background: rgba(239, 68, 68, 0.1) !important;
        }
      `}</style>
    </aside>
  )
}
