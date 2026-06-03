"use client"

import { useState, useEffect } from 'react'
import { Users, Search, Mail, ExternalLink, ShieldCheck, Loader2, Store } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

export default function SuperAdminMerchants() {
  const [loading, setLoading] = useState(true)
  const [merchants, setMerchants] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchMerchants()
  }, [])

  const fetchMerchants = async () => {
    setLoading(true)
    try {
      // Buscamos as lojas para derivar os lojistas/proprietários
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const storesList = data || []
      // Filtra apenas lojistas que têm o Gerenciamento de Faturamento ativado
      const activeBillingStores = storesList.filter(store => {
        if (store.settings?.billing_enabled !== undefined) {
          return store.settings.billing_enabled === true
        }
        // Fallback legado para lojas antigas: se for loja modelo/demo, não fatura
        const isDemo = store.settings?.is_demo === true
        return !isDemo
      })

      const merchantsList = activeBillingStores.map(store => ({
        id: store.id,
        name: store.name || store.settings?.name || store.settings?.admin_user || 'Lojista',
        email: store.settings?.email || `contato@${store.subdomain}.com.br`,
        phone: store.settings?.phone || store.settings?.whatsapp || 'Não informado',
        storeName: store.name || store.settings?.name || 'Loja Virtual',
        subdomain: store.subdomain,
        plan: store.settings?.plan === 'premium' ? 'Premium Ilimitado' : store.settings?.plan === 'pro' ? 'Plano Profissional' : 'Plano Básico',
        status: store.settings?.active !== false ? 'Ativo' : 'Bloqueado',
        createdAt: store.created_at
      }))

      setMerchants(merchantsList)
    } catch (error: any) {
      console.error('Erro ao buscar lojistas:', error.message)
      toast.error('Erro ao carregar lojistas da plataforma.')
    } finally {
      setLoading(false)
    }
  }

  const filteredMerchants = merchants.filter(m => 
    !searchTerm || 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.storeName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSendMail = (email: string) => {
    window.location.href = `mailto:${email}`
  }

  return (
    <div style={{ display: 'grid', gap: '2.5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--foreground)' }}>Lojistas & Usuários SaaS</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Gestão de contas dos proprietários de lojas virtuais na plataforma.</p>
        </div>
        <div style={{ position: 'relative', width: '350px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
          <input 
            type="text" 
            placeholder="Buscar por nome, e-mail ou loja..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', outline: 'none', fontSize: '0.9rem' }}
          />
        </div>
      </header>

      {/* Tabela de Lojistas */}
      <div className="glass-card" style={{ padding: '2.5rem' }}>
        {loading ? (
          <div style={{ padding: '5rem', textAlign: 'center' }}><Loader2 size={32} className="animate-spin" color="#10b981" style={{ margin: '0 auto' }} /></div>
        ) : filteredMerchants.length === 0 ? (
          <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--muted)', background: 'var(--input-bg)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
            Nenhum lojista encontrado.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted)', fontSize: '0.85rem' }}>
                <th style={{ paddingBottom: '1.25rem', fontWeight: 700 }}>LOJISTA (PROPRIETÁRIO)</th>
                <th style={{ paddingBottom: '1.25rem', fontWeight: 700 }}>CONTATO</th>
                <th style={{ paddingBottom: '1.25rem', fontWeight: 700 }}>LOJA ASSOCIADA</th>
                <th style={{ paddingBottom: '1.25rem', fontWeight: 700 }}>PLANO ATIVO</th>
                <th style={{ paddingBottom: '1.25rem', fontWeight: 700 }}>CADASTRO</th>
                <th style={{ paddingBottom: '1.25rem', fontWeight: 700, textAlign: 'right' }}>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {filteredMerchants.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }} className="merchant-row">
                  <td style={{ padding: '1.5rem 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a5b4fc)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800 }}>
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--foreground)', fontSize: '1.05rem' }}>{m.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>ID: {m.id.slice(0,8).toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--foreground)', fontSize: '0.9rem' }}>{m.email}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Tel: {m.phone}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0ea5e9' }}>
                      <Store size={16} />
                      <span>{m.storeName}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, backgroundColor: m.plan.includes('Premium') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)', color: m.plan.includes('Premium') ? '#10b981' : '#6366f1', border: m.plan.includes('Premium') ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(99, 102, 241, 0.2)' }}>
                      {m.plan}
                    </span>
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: '0.9rem', fontWeight: 500 }}>{new Date(m.createdAt).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => handleSendMail(m.email)}
                        style={{ padding: '0.5rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--foreground)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.85rem' }}
                        className="btn-action"
                      >
                        <Mail size={16} />
                        <span>E-mail</span>
                      </button>

                      <a 
                        href={`http://${m.subdomain}.localhost:3000`} 
                        target="_blank" 
                        style={{ padding: '0.5rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '8px', color: '#10b981', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.85rem' }}
                        className="btn-action"
                      >
                        <ExternalLink size={16} />
                        <span>Ver Loja</span>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style>{`
        .merchant-row:hover { background-color: rgba(255, 255, 255, 0.01); }
        .btn-action:hover { filter: brightness(1.1); border-color: #10b981 !important; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
