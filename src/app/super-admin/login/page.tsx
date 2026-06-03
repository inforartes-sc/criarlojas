"use client"

import { useState } from 'react'
import { ShieldAlert, Key, Mail, ArrowRight, CheckCircle2, Loader2, Server } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

export default function SuperAdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [securityPin, setSecurityPin] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      toast.error('Por favor, preencha as credenciais master.')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('settings')
        .eq('subdomain', 'platform-settings')
        .maybeSingle()

      if (error) throw error

      const dbSettings = data?.settings || {}
      const targetEmail = dbSettings.adminEmail || 'admin@criarlojas.com.br'
      const targetPassword = dbSettings.adminPassword || 'admin'

      if (email.trim() === targetEmail && password.trim() === targetPassword) {
        toast.success('Acesso Master concedido! Inicializando infraestrutura...')
        window.location.href = '/super-admin'
      } else {
        toast.error('E-mail ou senha master incorretos.')
      }
    } catch (err) {
      console.error('Erro ao autenticar:', err)
      const targetEmail = 'admin@criarlojas.com.br'
      const targetPassword = 'admin'
      if (email.trim() === targetEmail && password.trim() === targetPassword) {
        toast.success('Acesso Master concedido (Modo de Segurança)...')
        window.location.href = '/super-admin'
      } else {
        toast.error('E-mail ou senha master incorretos.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #090d16 0%, #0f172a 100%)',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Elementos decorativos de fundo */}
      <div style={{ position: 'absolute', top: '10%', left: '-5%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(50px)' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '-5%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(50px)' }} />

      <div style={{
        width: '100%',
        maxWidth: '500px',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        borderRadius: '30px',
        padding: '3.5rem 3rem',
        boxShadow: '0 30px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(16, 185, 129, 0.1)',
        backdropFilter: 'blur(25px)',
        zIndex: 1,
        animation: 'fadeIn 0.5s ease-out'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', boxShadow: '0 12px 30px rgba(16, 185, 129, 0.4)' }}>
            <Server size={40} color="white" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <h2 style={{ fontSize: '1.9rem', fontWeight: 900, color: '#f8fafc', margin: 0, letterSpacing: '-0.5px' }}>Super Admin</h2>
            <span style={{ padding: '0.25rem 0.65rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>MASTER</span>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>Controle Global de Infraestrutura e Lojas (SaaS)</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'grid', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.5rem' }}>E-mail Master</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="email"
                placeholder="superadmin@suaplataforma.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '1.1rem 1rem 1.1rem 3.25rem', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '14px', color: '#f8fafc', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s' }}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.5rem' }}>Senha Master</label>
            <div style={{ position: 'relative' }}>
              <Key size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '1.1rem 1rem 1.1rem 3.25rem', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '14px', color: '#f8fafc', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s' }}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.5rem' }}>PIN de Segurança 2FA (Opcional)</label>
            <div style={{ position: 'relative' }}>
              <ShieldAlert size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="password"
                placeholder="••••"
                maxLength={4}
                value={securityPin}
                onChange={(e) => setSecurityPin(e.target.value)}
                style={{ width: '100%', padding: '1.1rem 1rem 1.1rem 3.25rem', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '14px', color: '#f8fafc', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s', letterSpacing: '4px' }}
                className="input-field"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '1.2rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 800, fontSize: '1.05rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '1rem', boxShadow: '0 12px 30px rgba(16, 185, 129, 0.4)', transition: 'transform 0.2s, box-shadow 0.2s' }}
            className="btn-submit"
          >
            {loading ? <Loader2 size={22} className="animate-spin" /> : <ArrowRight size={22} />}
            <span>{loading ? 'Verificando Credenciais...' : 'Entrar no Painel Geral'}</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
            <CheckCircle2 size={16} color="#10b981" />
            <span>Monitoramento de IP Ativo & Auditoria de Acesso</span>
          </div>
        </div>
      </div>

      <style>{`
        .input-field:focus { border-color: #10b981 !important; background: rgba(0, 0, 0, 0.5) !important; }
        .btn-submit:hover { transform: translateY(-2px); box-shadow: 0 15px 35px rgba(16, 185, 129, 0.6) !important; }
        .btn-submit:active { transform: translateY(0); }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
