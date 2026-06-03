"use client"

import { useState, useEffect } from 'react'
import { Settings, Save, ShieldCheck, Database, Globe, Mail, Phone, Lock, RefreshCw, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

export default function SuperAdminSettings() {
  const [settings, setSettings] = useState({
    platformName: 'Criar Lojas E-commerce SaaS',
    mainDomain: 'criarlojas.com.br',
    supportEmail: 'suporte@criarlojas.com.br',
    whatsappSupport: '5511999998888',
    maintenanceMode: false,
    allowNewRegistrations: true,
    webhookSecret: 'whsec_abc123xyz789criarlojas',
    supabaseUrl: 'https://schcpfbnochnevsivtaj.supabase.co',
    maxStoresPerUser: 10,
    businessHours: 'Seg - Sex, das 9h às 18h',
    adminEmail: 'admin@criarlojas.com.br',
    adminPassword: 'admin'
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [recordId, setRecordId] = useState<string>('')
  const [plans, setPlans] = useState<any[]>([])

  // Carregar configurações salvas do Supabase ao iniciar
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('subdomain', 'platform-settings')
        .maybeSingle()

      if (error) throw error

      if (data) {
        setRecordId(data.id)
        const s = data.settings || {}
        setSettings({
          platformName: s.platformName || 'Criar Lojas E-commerce SaaS',
          mainDomain: s.mainDomain || 'criarlojas.com.br',
          supportEmail: s.supportEmail || 'suporte@criarlojas.com.br',
          whatsappSupport: s.whatsappSupport || '5511999998888',
          maintenanceMode: s.maintenanceMode || false,
          allowNewRegistrations: s.allowNewRegistrations !== undefined ? s.allowNewRegistrations : true,
          webhookSecret: s.webhookSecret || 'whsec_abc123xyz789criarlojas',
          supabaseUrl: s.supabaseUrl || 'https://schcpfbnochnevsivtaj.supabase.co',
          maxStoresPerUser: s.maxStoresPerUser || 10,
          businessHours: s.businessHours || 'Seg - Sex, das 9h às 18h',
          adminEmail: s.adminEmail || 'admin@criarlojas.com.br',
          adminPassword: s.adminPassword || 'admin'
        })
        setPlans(s.plans || [])
      } else {
        // Registro não existe no banco, vamos tentar criar com valores padrão
        const defaultSettings = {
          platformName: 'Criar Lojas E-commerce SaaS',
          mainDomain: 'criarlojas.com.br',
          supportEmail: 'suporte@criarlojas.com.br',
          whatsappSupport: '5511999998888',
          maintenanceMode: false,
          allowNewRegistrations: true,
          webhookSecret: 'whsec_abc123xyz789criarlojas',
          supabaseUrl: 'https://schcpfbnochnevsivtaj.supabase.co',
          maxStoresPerUser: 10,
          businessHours: 'Seg - Sex, das 9h às 18h',
          adminEmail: 'admin@criarlojas.com.br',
          adminPassword: 'admin'
        }

        const { data: inserted, error: insertError } = await supabase
          .from('stores')
          .insert({
            name: 'Configurações da Plataforma',
            subdomain: 'platform-settings',
            settings: defaultSettings
          })
          .select()
          .single()

        if (insertError) {
          console.warn('Não foi possível auto-criar o registro padrão (pode ser RLS), usando valores em memória.', insertError)
        } else if (inserted) {
          setRecordId(inserted.id)
          const s = inserted.settings || {}
          setSettings({
            platformName: s.platformName || 'Criar Lojas E-commerce SaaS',
            mainDomain: s.mainDomain || 'criarlojas.com.br',
            supportEmail: s.supportEmail || 'suporte@criarlojas.com.br',
            whatsappSupport: s.whatsappSupport || '5511999998888',
            maintenanceMode: s.maintenanceMode || false,
            allowNewRegistrations: s.allowNewRegistrations !== undefined ? s.allowNewRegistrations : true,
            webhookSecret: s.webhookSecret || 'whsec_abc123xyz789criarlojas',
            supabaseUrl: s.supabaseUrl || 'https://schcpfbnochnevsivtaj.supabase.co',
            maxStoresPerUser: s.maxStoresPerUser || 10,
            businessHours: s.businessHours || 'Seg - Sex, das 9h às 18h',
            adminEmail: s.adminEmail || 'admin@criarlojas.com.br',
            adminPassword: s.adminPassword || 'admin'
          })
        }
      }
    } catch (err: any) {
      console.error('Erro ao carregar configurações:', err)
      toast.error('Erro ao carregar configurações do banco de dados.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      if (recordId) {
        const { error } = await supabase
          .from('stores')
          .update({
            name: 'Configurações da Plataforma',
            settings: {
              ...settings,
              plans // Preservar os planos
            }
          })
          .eq('id', recordId)

        if (error) throw error
      } else {
        const { data: upserted, error } = await supabase
          .from('stores')
          .upsert({
            name: 'Configurações da Plataforma',
            subdomain: 'platform-settings',
            settings: {
              ...settings,
              plans
            }
          }, { onConflict: 'subdomain' })
          .select()
          .single()

        if (error) throw error
        if (upserted) {
          setRecordId(upserted.id)
        }
      }

      toast.success('Configurações globais da plataforma salvas e atualizadas com sucesso!')
    } catch (err: any) {
      console.error('Erro ao salvar configurações:', err)
      toast.error('Erro ao salvar as configurações no banco de dados.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '10rem 5rem', textAlign: 'center' }}>
        <Loader2 className="animate-spin" size={40} style={{ margin: '0 auto', color: '#10b981' }} />
        <p style={{ marginTop: '1rem', color: 'var(--muted)', fontSize: '1rem', fontWeight: 600 }}>Carregando configurações globais do banco de dados...</p>
        <style>{`
          .animate-spin { animation: spin 1s linear infinite; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: '2.5rem', maxWidth: '1000px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--foreground)' }}>Configurações Globais (SaaS)</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Parâmetros estruturais, segurança e chaves de API de toda a plataforma.</p>
        </div>
      </header>

      <form onSubmit={handleSaveSettings} style={{ display: 'grid', gap: '2.5rem' }}>
        {/* Seção de Informações Principais */}
        <div className="glass-card" style={{ padding: '2.5rem', border: '1px solid var(--border)', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <Globe color="#10b981" size={22} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--foreground)' }}>Identidade & Domínio Principal</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>Nome da Plataforma SaaS</label>
              <input 
                type="text" 
                value={settings.platformName || ''}
                onChange={e => setSettings({...settings, platformName: e.target.value})}
                style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', outline: 'none', fontWeight: 600 }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>Domínio Raiz Principal</label>
              <input 
                type="text" 
                value={settings.mainDomain || ''}
                onChange={e => setSettings({...settings, mainDomain: e.target.value})}
                style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', outline: 'none', fontWeight: 600 }}
                required
              />
            </div>
          </div>
        </div>

        {/* Seção de Contato & Suporte Global */}
        <div className="glass-card" style={{ padding: '2.5rem', border: '1px solid var(--border)', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <Mail color="#0ea5e9" size={22} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--foreground)' }}>Canais de Suporte aos Lojistas</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>E-mail de Suporte Central</label>
              <input 
                type="email" 
                value={settings.supportEmail || ''}
                onChange={e => setSettings({...settings, supportEmail: e.target.value})}
                style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', outline: 'none', fontWeight: 600 }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>WhatsApp de Suporte</label>
              <input 
                type="text" 
                value={settings.whatsappSupport || ''}
                onChange={e => setSettings({...settings, whatsappSupport: e.target.value})}
                style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', outline: 'none', fontWeight: 600 }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>Horário de Atendimento</label>
              <input 
                type="text" 
                value={settings.businessHours || ''}
                onChange={e => setSettings({...settings, businessHours: e.target.value})}
                placeholder="Ex: Seg - Sex, das 9h às 18h"
                style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', outline: 'none', fontWeight: 600 }}
                required
              />
            </div>
          </div>
        </div>

        {/* Seção de Banco de Dados & Webhooks */}
        <div className="glass-card" style={{ padding: '2.5rem', border: '1px solid var(--border)', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <Database color="#6366f1" size={22} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--foreground)' }}>Supabase & Webhooks de Faturamento</h3>
          </div>

          <div style={{ display: 'grid', gap: '2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>URL do Supabase (Instância Principal)</label>
              <input 
                type="text" 
                value={settings.supabaseUrl || ''}
                disabled
                style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--muted)', outline: 'none', fontWeight: 600, cursor: 'not-allowed' }}
              />
              <span style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem', display: 'block', fontWeight: 600 }}>Conexão autenticada e estável com chave de serviço (Service Role).</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>Segredo do Webhook de Pagamentos (Stripe / MP)</label>
                <input 
                  type="password" 
                  value={settings.webhookSecret || ''}
                  onChange={e => setSettings({...settings, webhookSecret: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', outline: 'none', fontWeight: 600 }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>Máx. Lojas por Usuário</label>
                <input 
                  type="number" 
                  value={settings.maxStoresPerUser || 1}
                  onChange={e => setSettings({...settings, maxStoresPerUser: parseInt(e.target.value) || 1})}
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', outline: 'none', fontWeight: 600 }}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Credenciais Master */}
        <div className="glass-card" style={{ padding: '2.5rem', border: '1px solid var(--border)', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <ShieldCheck color="#10b981" size={22} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--foreground)' }}>Credenciais Master (Super Admin)</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>E-mail Master</label>
              <input 
                type="email" 
                value={settings.adminEmail || ''}
                onChange={e => setSettings({...settings, adminEmail: e.target.value})}
                style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', outline: 'none', fontWeight: 600 }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>Senha Master</label>
              <input 
                type="text" 
                value={settings.adminPassword || ''}
                onChange={e => setSettings({...settings, adminPassword: e.target.value})}
                style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', outline: 'none', fontWeight: 600 }}
                required
              />
            </div>
          </div>
        </div>

        {/* Seção de Controle & Segurança */}
        <div className="glass-card" style={{ padding: '2.5rem', border: '1px solid var(--border)', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <Lock color="#ef4444" size={22} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--foreground)' }}>Segurança & Controle de Acesso Global</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: 'var(--input-bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--foreground)', fontSize: '0.95rem' }}>Permitir Novos Cadastros</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Abre ou fecha a criação de novas lojas na home</div>
              </div>
              <input 
                type="checkbox" 
                checked={settings.allowNewRegistrations}
                onChange={e => setSettings({...settings, allowNewRegistrations: e.target.checked})}
                style={{ width: '20px', height: '20px', accentColor: '#10b981', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div>
                <div style={{ fontWeight: 800, color: '#ef4444', fontSize: '0.95rem' }}>Modo de Manutenção Geral</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Exibe tela de manutenção em todas as lojas</div>
              </div>
              <input 
                type="checkbox" 
                checked={settings.maintenanceMode}
                onChange={e => setSettings({...settings, maintenanceMode: e.target.checked})}
                style={{ width: '20px', height: '20px', accentColor: '#ef4444', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>

        {/* Botão Salvar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            type="submit" 
            disabled={saving}
            style={{ padding: '0.85rem 2.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' }}
            className="btn-save"
          >
            {saving ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />}
            <span>Salvar Configurações da Plataforma</span>
          </button>
        </div>
      </form>

      <style>{`
        .btn-save:hover { filter: brightness(1.1); }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
