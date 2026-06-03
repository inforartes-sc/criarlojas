"use client"

import SuperAdminSidebar from '@/components/SuperAdmin/SuperAdminSidebar'
import { ExternalLink, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { Toaster } from 'react-hot-toast'
import { usePathname } from 'next/navigation'

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname() || ''
  const isLoginPage = pathname.includes('/super-admin/login')

  if (isLoginPage) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
        {children}
        <Toaster position="top-right" />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      <SuperAdminSidebar />
      <main style={{ 
        flex: 1, 
        marginLeft: '280px', 
        padding: '2.5rem',
        backgroundColor: 'var(--background)' 
      }}>
        {/* Header Superior do Super Admin */}
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '3rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid var(--border)'
        }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              Administração Geral (SaaS)
              <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', fontWeight: 700 }}>
                Nível: Super Admin
              </span>
            </h1>
            <p style={{ color: 'var(--muted)', margin: '0.25rem 0 0 0', fontSize: '0.95rem' }}>
              Gerencie todas as lojas, lojistas, planos e a saúde global da infraestrutura Criar Lojas.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <a 
              href="/" 
              target="_blank" 
              style={{ 
                textDecoration: 'none',
                padding: '0.6rem 1.2rem',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                color: 'var(--foreground)',
                fontSize: '0.875rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--input-bg)',
                transition: '0.2s'
              }}
              className="btn-portal"
            >
              <ExternalLink size={16} />
              Portal Comercial (Home)
            </a>

            <div className="glass-card" style={{ padding: '0.6rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)', backgroundColor: 'rgba(16, 185, 129, 0.05)' }}>
              <CheckCircle2 size={18} color="#10b981" />
              <span style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: 700 }}>Infraestrutura 100% OK</span>
            </div>

            <div style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #10b981, #0ea5e9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: 'white',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}>
              SA
            </div>
          </div>
        </header>

        {children}
      </main>
      <Toaster position="top-right" />

      <style>{`
        .btn-portal:hover {
          border-color: #10b981 !important;
          color: #10b981 !important;
        }
      `}</style>
    </div>
  )
}
