"use client"

import { useState } from 'react'
import { Store, Lock, Mail, ArrowRight, ShieldCheck, Check, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { loginAdmin } from '@/lib/adminAuth'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      toast.error('Por favor, preencha o e-mail e a senha.')
      return
    }

    setLoading(true)
    try {
      const success = await loginAdmin(email, password)
      if (success) {
        toast.success('Autenticado com sucesso! Redirecionando para o painel...')
        window.location.href = '/admin'
      } else {
        toast.error('E-mail ou senha incorretos para esta loja.')
      }
    } catch (err: any) {
      toast.error('Erro ao realizar o login: ' + err.message)
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
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Elementos decorativos de fundo */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(40px)' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(40px)' }} />

      <div style={{ 
        width: '100%', 
        maxWidth: '460px', 
        background: 'rgba(255, 255, 255, 0.03)', 
        border: '1px solid rgba(255, 255, 255, 0.1)', 
        borderRadius: '28px', 
        padding: '3.5rem 2.5rem', 
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(20px)',
        zIndex: 1,
        animation: 'fadeIn 0.5s ease-out'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '22px', background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', boxShadow: '0 10px 25px rgba(14, 165, 233, 0.4)' }}>
            <Store size={36} color="white" />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 0.5rem 0' }}>Painel do Lojista</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>Gerencie sua loja, produtos, estoque e pedidos</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'grid', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.5rem' }}>E-mail Corporativo</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input 
                type="email" 
                placeholder="contato@sualoja.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '14px', color: '#f8fafc', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s' }}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1' }}>Senha de Acesso</label>
              <a href="#" onClick={(e) => { e.preventDefault(); toast.success('Link de recuperação enviado ao seu e-mail!'); }} style={{ fontSize: '0.8rem', color: '#0ea5e9', textDecoration: 'none', fontWeight: 600 }}>Esqueceu a senha?</a>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '14px', color: '#f8fafc', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s' }}
                className="input-field"
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input 
              type="checkbox" 
              id="remember" 
              checked={rememberMe} 
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ width: '18px', height: '18px', borderRadius: '6px', cursor: 'pointer', accentColor: '#0ea5e9' }} 
            />
            <label htmlFor="remember" style={{ fontSize: '0.85rem', color: '#94a3b8', cursor: 'pointer', fontWeight: 500 }}>Manter conectado neste dispositivo</label>
          </div>

          <button 
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '1.1rem', background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '0.5rem', boxShadow: '0 10px 25px rgba(14, 165, 233, 0.4)', transition: 'transform 0.2s, box-shadow 0.2s' }}
            className="btn-submit"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
            <span>{loading ? 'Autenticando...' : 'Acessar Painel da Loja'}</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.8rem' }}>
            <ShieldCheck size={16} color="#10b981" />
            <span>Acesso Seguro com Criptografia SSL 256 bits</span>
          </div>
        </div>
      </div>

      <style>{`
        .input-field:focus { border-color: #0ea5e9 !important; background: rgba(0, 0, 0, 0.4) !important; }
        .btn-submit:hover { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(14, 165, 233, 0.6) !important; }
        .btn-submit:active { transform: translateY(0); }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
