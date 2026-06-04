"use client"

import AdminSidebar from '@/components/Admin/AdminSidebar'
import { ExternalLink, Loader2 } from 'lucide-react'
import { Toaster } from 'react-hot-toast'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getStoreSubdomain } from '@/lib/getStoreSubdomain'
import { getAbsoluteUrl } from '@/lib/getDomainSuffix'
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname() || ''
  const isLoginPage = pathname.includes('/admin/login')

  if (isLoginPage) {
    return (
      <AdminAuthProvider>
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
          {children}
          <Toaster position="top-right" />
        </div>
      </AdminAuthProvider>
    )
  }

  return (
    <AdminAuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminAuthProvider>
  )
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { store, loading } = useAdminAuth()
  const [subdomain, setSubdomain] = useState('teste')
  const layoutModel = store?.settings?.layout_model || ''

  useEffect(() => {
    setSubdomain(getStoreSubdomain())
    // Garantir que todas as colunas do banco de dados existem
    fetch('/api/migrate')
      .then(res => res.json())
      .then(data => {
        if (data.errorCount > 0) {
          console.warn('Aviso: Algumas migrações de banco falharam:', data.results?.filter((r: any) => r.status === 'error'))
        } else {
          console.log('✅ Banco de dados verificado:', data.message)
        }
      })
      .catch(err => console.warn('Migração DB silenciosa:', err))
  }, [])


  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
        <Loader2 size={36} className="animate-spin" color="var(--primary)" />
        <style>{`
          .animate-spin { animation: spin 1s linear infinite; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    )
  }

  if (!store) {
    return null // O context redirecionará para login
  }

  // Pegar iniciais do lojista
  const initials = store.name ? store.name.substring(0, 2).toUpperCase() : 'JD'


  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)' }} className="admin-layout-wrapper">
      <AdminSidebar />
      <main style={{ 
        flex: 1, 
        marginLeft: '280px', 
        padding: '2.5rem',
        backgroundColor: 'var(--background)',
        minWidth: 0
      }} className="admin-main-content">
        {/* Header Superior do Painel */}
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '3rem'
        }} className="admin-header">
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Bem-vindo, {store.name}</h1>
            <p style={{ color: 'var(--muted)' }} className="admin-header-subtitle">Aqui está o resumo da sua loja hoje.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }} className="admin-header-actions">
            <a 
              href={getAbsoluteUrl(subdomain)}
              target="_blank" 
              style={{ 
                textDecoration: 'none',
                padding: '0.6rem 1.2rem',
                border: '1px solid var(--primary)',
                borderRadius: '8px',
                color: 'var(--primary)',
                fontSize: '0.875rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <ExternalLink size={16} />
              <span className="btn-text">Ver Loja</span>
            </a>

            <div className="glass-card header-status-card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
              <span style={{ fontSize: '0.875rem', color: 'var(--foreground)', fontWeight: 500 }}>Loja Online</span>
            </div>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              color: 'white'
            }} className="merchant-avatar">
              {initials}
            </div>
          </div>
        </header>

        {children}
      </main>
      <Toaster position="top-right" />
      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        /* Media query for mobile responsive view */
        @media (max-width: 768px) {
          .admin-layout-wrapper {
            flex-direction: column !important;
          }
          .admin-main-content {
            margin-left: 0 !important;
            padding: 1.25rem 1.25rem 80px 1.25rem !important; /* Bottom padding for bottom navigation bar */
            width: 100% !important;
          }
          .admin-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 1.25rem !important;
            margin-bottom: 2rem !important;
          }
          .admin-header-subtitle {
            font-size: 0.85rem !important;
          }
          .admin-header-actions {
            width: 100% !important;
            justify-content: space-between !important;
            gap: 0.5rem !important;
          }
          .admin-header-actions a {
            flex: 1 !important;
            justify-content: center !important;
            padding: 0.5rem 0.75rem !important;
            font-size: 0.8rem !important;
          }
          .header-status-card {
            display: none !important; /* Hide extra badges to clean UI */
          }
          .btn-text {
            font-size: 0.8rem !important;
          }
        }
      `}</style>
    </div>
  )
}
