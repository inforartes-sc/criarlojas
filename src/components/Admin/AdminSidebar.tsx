"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { LayoutDashboard, ShoppingBag, Settings, Users, LogOut, Package, CreditCard, Truck, Tag, Link2, Star, Menu, X, DollarSign, Crown } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAdminAuth } from '@/context/AdminAuthContext'

export default function AdminSidebar() {
  const pathname = usePathname()
  const { store, logout } = useAdminAuth()
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  
  const isServicesOnly = ['lawyer', 'advocacia', 'advocacy', 'services', 'electrician', 'aura'].includes(store?.settings?.layout_model)
  const isLawyerLayout = ['lawyer', 'advocacia', 'advocacy'].includes(store?.settings?.layout_model)
  const isServicesModel = store?.settings?.layout_model === 'services'
  const isElectricianLayout = store?.settings?.layout_model === 'electrician'

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    ...(isServicesModel ? [
      { icon: Package, label: 'Serviços', href: '/admin/products' },
      { icon: ShoppingBag, label: 'Peças', href: '/admin/parts' },
    ] : [
      { icon: Package, label: (isLawyerLayout || isElectricianLayout) ? 'Serviços' : 'Produtos', href: '/admin/products' },
    ]),
    { icon: LayoutDashboard, label: 'Categorias', href: '/admin/categories' },
    { icon: ShoppingBag, label: 'Pedidos', href: '/admin/orders' },
    { icon: ShoppingBag, label: 'Carrinhos Abandonados', href: '/admin/abandoned-carts' },
    { icon: Users, label: 'Clientes', href: '/admin/customers' },
    ...(isServicesOnly ? [
      { icon: DollarSign, label: 'Financeiro', href: '/admin/financial' },
    ] : []),
    { icon: Star, label: 'Avaliações', href: '/admin/reviews' },
    { icon: CreditCard, label: 'Pagamentos', href: '/admin/payments' },
    { icon: Truck, label: 'Envio / Frete', href: '/admin/shipping' },
    { icon: Tag, label: 'Promoções', href: '/admin/promotions' },
    { icon: Link2, label: 'Link da Bio', href: '/admin/bio-link' },
    { icon: CreditCard, label: 'Meu Plano', href: '/admin/subscription' },
    { icon: Settings, label: 'Configurações', href: '/admin/settings' },
  ]

  const plan = store?.settings?.plan || 'basic'

  const filteredMenuItems = menuItems.filter(item => {
    if (isLawyerLayout) {
      // Removed 'Pagamentos' so lawyers can configure Pix and Mercado Pago
      const excludedLabels = ['Categorias', 'Pedidos', 'Envio / Frete', 'Promoções', 'Avaliações', 'Carrinhos Abandonados']
      if (excludedLabels.includes(item.label)) return false
    }
    if (isElectricianLayout) {
      // Removed 'Pagamentos' so electricians can configure payments
      const excludedLabels = ['Pedidos', 'Envio / Frete', 'Promoções', 'Avaliações', 'Carrinhos Abandonados']
      if (excludedLabels.includes(item.label)) return false
    }
    
    // Restrições de planos:
    // Plano Básico: oculta Avaliações, Pagamentos, Envio / Frete, Promoções, Carrinhos Abandonados
    // Plano Pro: oculta Avaliações, Promoções
    if (plan === 'basic') {
      const basicExcluded = ['Avaliações', 'Pagamentos', 'Envio / Frete', 'Promoções', 'Carrinhos Abandonados']
      if (basicExcluded.includes(item.label)) return false
    } else if (plan === 'pro') {
      const proExcluded = ['Avaliações', 'Promoções']
      if (proExcluded.includes(item.label)) return false
    }
    return true
  })

  const handleLogout = () => {
    toast.success('Você saiu do painel da loja com sucesso.')
    setTimeout(() => {
      logout()
    }, 500)
  }

  // Prevent body scroll and hide main content when mobile menu is open to prevent GPU compositing flicker
  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden'
      document.body.classList.add('mobile-menu-active')
    } else {
      document.body.style.overflow = ''
      document.body.classList.remove('mobile-menu-active')
    }
    return () => {
      document.body.style.overflow = ''
      document.body.classList.remove('mobile-menu-active')
    }
  }, [showMobileMenu])

  const bottomItemStyle = (href: string): React.CSSProperties => {
    const isActive = !showMobileMenu && (pathname === href || (href !== '/admin' && pathname?.startsWith(href)))
    return {
      color: isActive ? '#6366f1' : '#94a3b8',
      textDecoration: 'none',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0.5rem',
      flex: 1,
      transition: 'color 0.2s'
    }
  }

  return (
    <>
      {/* Sidebar for Desktop */}
      <aside className="admin-sidebar" style={{ 
        width: '280px', 
        height: '100vh', 
        position: 'fixed',
        left: 0,
        top: 0,
        backgroundColor: '#0f172a',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100
      }}>
        <div className="sidebar-logo" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ 
              fontSize: '1.4rem', 
              background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              fontWeight: 800,
              margin: 0
            }}>
              Criar Lojas
            </h2>
            <span style={{ fontSize: '0.75rem', color: '#0ea5e9', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
              Painel Lojista
            </span>
            <div style={{ marginTop: '0.35rem', fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
              Modelo: <strong style={{ color: '#6366f1', textTransform: 'capitalize' }}>{store?.settings?.layout_model || 'não definido'}</strong>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', marginBottom: '0.5rem' }} className="sidebar-nav">
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }} className="sidebar-menu-list">
            {filteredMenuItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href))
              
              return (
                <li key={item.label} style={{ marginBottom: '0.2rem' }} className="menu-list-item">
                  <Link href={item.href} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.85rem',
                    padding: '0.6rem 1rem',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    backgroundColor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                    textDecoration: 'none',
                    borderRadius: '10px',
                    transition: 'all 0.2s ease',
                    fontSize: '0.95rem',
                    fontWeight: isActive ? 600 : 500,
                    border: isActive ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent'
                  }} className="nav-item">
                    <item.icon size={20} style={{ color: isActive ? '#6366f1' : 'inherit' }} className="nav-icon" />
                    <span className="nav-text">{item.label}</span>
                    {item.label === 'Carrinhos Abandonados' && plan === 'pro' && (
                      <Crown size={14} style={{ color: '#fbbf24', marginLeft: 'auto' }} />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }} className="sidebar-footer">
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
              borderRadius: '10px',
              width: '100%',
              textAlign: 'left',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem',
              transition: '0.2s'
            }}
            className="auth-btn-logout"
          >
            <LogOut size={20} />
            <span className="nav-text">Sair do Painel</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Bar */}
      <div className="mobile-bottom-bar" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '65px',
        backgroundColor: '#0f172a',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 10000,
        padding: '0 0.5rem'
      }}>
        <button 
          onClick={() => setShowMobileMenu(!showMobileMenu)} 
          style={{
            background: 'none',
            border: 'none',
            color: showMobileMenu ? '#6366f1' : '#94a3b8',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: '0.5rem',
            flex: 1
          }}
        >
          <Menu size={20} />
          <span style={{ fontSize: '0.7rem', marginTop: '2px' }}>Menu</span>
        </button>
        <Link href="/admin/orders" onClick={() => setShowMobileMenu(false)} style={bottomItemStyle('/admin/orders')}>
          <ShoppingBag size={20} />
          <span style={{ fontSize: '0.7rem', marginTop: '2px' }}>Pedidos</span>
        </Link>
        <Link href="/admin/customers" onClick={() => setShowMobileMenu(false)} style={bottomItemStyle('/admin/customers')}>
          <Users size={20} />
          <span style={{ fontSize: '0.7rem', marginTop: '2px' }}>Clientes</span>
        </Link>
        <Link href="/admin" onClick={() => setShowMobileMenu(false)} style={bottomItemStyle('/admin')}>
          <LayoutDashboard size={20} />
          <span style={{ fontSize: '0.7rem', marginTop: '2px' }}>Dashboard</span>
        </Link>
      </div>

      {/* Mobile Menu Popup Modal */}
      {showMobileMenu && (
        <>
          <style>{`
            main {
              display: none !important;
            }
          `}</style>
          {/* Backdrop */}
          <div className="mobile-menu-backdrop" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: '65px',
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            zIndex: 9998,
            transform: 'translate3d(0, 0, 0)',
            WebkitTransform: 'translate3d(0, 0, 0)'
          }} onClick={() => setShowMobileMenu(false)} />

          {/* Centered Modal Card */}
          <div className="mobile-menu-modal" style={{
            position: 'fixed',
            top: 'calc(50% - 32px)',
            left: '50%',
            transform: 'translate(-50%, -50%) translate3d(0, 0, 0)',
            WebkitTransform: 'translate(-50%, -50%) translate3d(0, 0, 0)',
            backgroundColor: '#ffffff',
            background: 'white',
            borderRadius: '24px',
            width: '90%',
            maxWidth: '360px',
            padding: '1.25rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            maxHeight: '75vh',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            overflowY: 'auto',
            zIndex: 9999,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            boxSizing: 'border-box'
          }} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '0.6rem' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Menu Principal</h3>
                <span style={{ fontSize: '0.65rem', color: '#6366f1', fontWeight: 700 }}>{store?.name}</span>
              </div>
              <button onClick={() => setShowMobileMenu(false)} style={{
                background: 'rgba(0,0,0,0.04)',
                border: 'none',
                color: '#64748b',
                borderRadius: '50%',
                padding: '0.35rem',
                display: 'flex',
                cursor: 'pointer'
              }}>
                <X size={16} />
              </button>
            </div>

            {/* Grid of Other Modules - Vertical List for 100% compatibility and premium look */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              width: '100%'
            }}>
              {filteredMenuItems
                .filter(item => !['Dashboard', 'Pedidos', 'Clientes'].includes(item.label))
                .map(item => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setShowMobileMenu(false)}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid rgba(0,0,0,0.05)',
                      borderRadius: '12px',
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      textDecoration: 'none',
                      color: '#334155',
                      transition: 'all 0.2s',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                    className="mobile-grid-item"
                  >
                    <item.icon size={20} style={{ color: '#6366f1', flexShrink: 0 }} />
                    <span style={{ 
                      fontSize: '0.85rem', 
                      fontWeight: 700, 
                      color: '#334155',
                      flex: 1,
                      textAlign: 'left'
                    }}>
                      {item.label}
                    </span>
                    {item.label === 'Carrinhos Abandonados' && plan === 'pro' && (
                      <Crown size={14} style={{ color: '#fbbf24', marginRight: '0.5rem' }} />
                    )}
                    <span style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 600 }}>&rarr;</span>
                  </Link>
                ))}
            </div>

            {/* Footer Logout */}
            <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '0.6rem' }}>
              <button
                onClick={() => {
                  setShowMobileMenu(false)
                  handleLogout()
                }}
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                  color: '#ef4444',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  cursor: 'pointer'
                }}
              >
                <LogOut size={14} />
                <span>Sair do Painel</span>
              </button>
            </div>
          </div>
      </>)}

      <style>{`
        .nav-item:hover {
          background: rgba(255, 255, 255, 0.05) !important;
          color: #ffffff !important;
        }
        .auth-btn-logout:hover {
          background: rgba(239, 68, 68, 0.1) !important;
        }
        .mobile-grid-item:hover {
          background: rgba(99, 102, 241, 0.05) !important;
          border-color: rgba(99, 102, 241, 0.2) !important;
        }

        body.mobile-menu-active .admin-main-content {
          display: none !important;
        }

        @media (min-width: 768.01px) {
          .mobile-bottom-bar {
            display: none !important;
          }
        }

        @media (max-width: 768px) {
          .admin-sidebar {
            display: none !important;
          }
        }
      `}</style>
    </>
  )
}

