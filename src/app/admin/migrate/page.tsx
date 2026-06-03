"use client"

import { useState } from 'react'
import { Database, CheckCircle2, AlertCircle, ExternalLink, Copy, Loader2 } from 'lucide-react'

const SQL_MIGRATION = `-- Migrações necessárias para o banco de dados
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_service BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight NUMERIC(10,3);
ALTER TABLE products ADD COLUMN IF NOT EXISTS length NUMERIC(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS width NUMERIC(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS height NUMERIC(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS has_variations BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS variation_options JSONB DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS variation_skus JSONB DEFAULT '[]'::jsonb;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_street TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_number TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_complement TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_neighborhood TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_city TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_state TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_zip TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT;
NOTIFY pgrst, 'reload schema';`

export default function MigrationPage() {
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  const runMigration = async () => {
    setRunning(true)
    setResult(null)
    try {
      const res = await fetch('/api/migrate')
      const data = await res.json()
      setResult(data)
    } catch (e: any) {
      setResult({ error: e.message })
    } finally {
      setRunning(false)
    }
  }

  const copySQL = () => {
    navigator.clipboard.writeText(SQL_MIGRATION)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Database size={28} color="var(--primary)" />
          Migração do Banco de Dados
        </h1>
        <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>
          Adicione colunas obrigatórias que podem estar faltando no banco de dados.
        </p>
      </div>

      {/* Tentativa automática */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>🔄 Executar Automaticamente</h3>
        <p style={{ color: 'var(--muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          Tente executar as migrações automaticamente. Pode não funcionar se o banco não tiver a função <code>exec_sql</code>.
        </p>
        <button
          onClick={runMigration}
          disabled={running}
          style={{
            padding: '0.875rem 2rem',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: running ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            opacity: running ? 0.7 : 1
          }}
        >
          {running ? <Loader2 size={20} className="animate-spin" /> : <Database size={20} />}
          {running ? 'Executando...' : 'Executar Migrações'}
        </button>

        {result && (
          <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: result.errorCount > 0 ? 'rgba(239, 68, 68, 0.05)' : 'rgba(34, 197, 94, 0.05)', borderRadius: '12px', border: `1px solid ${result.errorCount > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', fontWeight: 700 }}>
              {result.errorCount > 0 ? <AlertCircle size={20} color="#ef4444" /> : <CheckCircle2 size={20} color="#22c55e" />}
              {result.message}
            </div>
            {result.results && (
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {result.results.map((r: any, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                    {r.status === 'ok' ? <CheckCircle2 size={14} color="#22c55e" /> : <AlertCircle size={14} color="#ef4444" />}
                    <code style={{ fontFamily: 'monospace' }}>{r.label}</code>
                    {r.error && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>— {r.error.slice(0, 100)}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SQL Manual */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>📋 Executar Manualmente no Supabase</h3>
        <p style={{ color: 'var(--muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          Se a execução automática falhar, copie o SQL abaixo e execute no{' '}
          <a
            href="https://supabase.com/dashboard/project/schcpfbnochnevsivtaj/sql"
            target="_blank"
            style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}
          >
            SQL Editor do Supabase <ExternalLink size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
          </a>
        </p>

        <div style={{ position: 'relative' }}>
          <pre style={{
            background: '#0f172a',
            color: '#e2e8f0',
            padding: '1.5rem',
            borderRadius: '12px',
            fontSize: '0.85rem',
            overflowX: 'auto',
            lineHeight: 1.6,
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all'
          }}>
            {SQL_MIGRATION}
          </pre>
          <button
            onClick={copySQL}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: copied ? '#22c55e' : 'rgba(255,255,255,0.1)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: '0.2s'
            }}
          >
            {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
            {copied ? 'Copiado!' : 'Copiar SQL'}
          </button>
        </div>

        <div style={{ marginTop: '1.5rem', padding: '1rem 1.5rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.15)' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--foreground)', margin: 0 }}>
            📌 Passos:
          </p>
          <ol style={{ margin: '0.75rem 0 0', paddingLeft: '1.5rem', fontSize: '0.875rem', color: 'var(--muted)', display: 'grid', gap: '0.4rem' }}>
            <li>Clique no link do SQL Editor acima</li>
            <li>Copie e cole todo o SQL no editor</li>
            <li>Clique em &quot;Run&quot; para executar</li>
            <li>Volte para o painel e recarregue a página</li>
          </ol>
        </div>
      </div>

      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        code { background: rgba(99,102,241,0.1); padding: 2px 6px; border-radius: 4px; color: var(--primary); }
      `}</style>
    </div>
  )
}
