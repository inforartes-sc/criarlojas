'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, ShoppingBag, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAdminAuth } from '@/context/AdminAuthContext'

interface Props {
  tipo: 'services' | 'parts' | 'all'
}

export default function AdminProductList({ tipo }: Props) {
  const { store } = useAdminAuth()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const isServicesModel = store?.settings?.layout_model === 'services'
  const isLawyerLayout = ['lawyer', 'advocacia', 'advocacy', 'electrician'].includes(store?.settings?.layout_model)
  const isServicesOnly = isLawyerLayout || isServicesModel

  const isServiceView = tipo === 'services' || (tipo === 'all' && isServicesOnly)
  const isPartView = tipo === 'parts'

  const labelSingular = isPartView ? 'Peça' : (isLawyerLayout ? 'Serviço' : 'Produto')
  const labelPlural = isPartView ? 'Peças' : (isLawyerLayout ? 'Serviços' : 'Produtos')
  const baseHref = isPartView ? '/admin/parts' : '/admin/products'

  useEffect(() => {
    if (store) {
      fetchProducts()
    }
  }, [store])

  const fetchProducts = async () => {
    if (!store) return
    try {
      let query = supabase
        .from('products')
        .select('id, name, price, stock_quantity, images, has_variations, variation_skus, created_at, is_service, is_active')
        .eq('store_id', store.id)

      if (isServicesModel && tipo !== 'all') {
        query = query.eq('is_service', tipo === 'services')
      }

      const { data, error } = await query.order('created_at', { ascending: false })
      if (error) throw error
      setProducts(data || [])
    } catch (error: any) {
      console.error('Erro ao buscar:', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }} className="top-filter-bar">
        <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '280px' }}>
          <div className="glass-card" style={{
            display: 'flex', alignItems: 'center', padding: '0 1rem', gap: '0.5rem', width: '100%', maxWidth: '400px'
          }}>
            <Search size={18} color="var(--muted)" />
            <input type="text" placeholder={`Buscar ${labelPlural.toLowerCase()}...`}
              style={{ background: 'transparent', border: 'none', padding: '0.75rem 0', color: 'var(--foreground)', width: '100%', outline: 'none' }} />
          </div>
        </div>

        <Link href={`${baseHref}/new`} style={{ textDecoration: 'none' }} className="mobile-full-width">
          <button style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', width: '100%', justifyContent: 'center' }}>
            <Plus size={20} />
            <span>{labelSingular === 'Peça' ? 'Nova' : 'Novo'} {labelSingular}</span>
          </button>
        </Link>
      </div>

      <div className="glass-card" style={{ padding: '2rem', minHeight: '400px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', color: 'var(--muted)' }}>
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <ShoppingBag size={48} color="var(--border)" style={{ marginBottom: '1rem' }} />
            <p style={{ color: 'var(--muted)' }}>Nenhuma {labelSingular.toLowerCase()} cadastrada ainda.</p>
            <Link href={`${baseHref}/new`} style={{ color: 'var(--primary)', textDecoration: 'none', marginTop: '1rem', display: 'inline-block' }}>
              Cadastrar minha primeira {labelSingular.toLowerCase()}
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)', fontSize: '0.9rem', fontWeight: 600 }}>
              <ShoppingBag size={16} color="var(--primary)" />
              <span>Total: {products.length} {products.length === 1 ? labelSingular.toLowerCase() : labelPlural.toLowerCase()} cadastrado{products.length === 1 ? '' : 's'}</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--muted)', fontSize: '0.875rem' }}>
                <th style={{ paddingBottom: '1rem' }}>{labelSingular}</th>
                <th style={{ paddingBottom: '1rem' }}>Preço</th>
                <th style={{ paddingBottom: '1rem' }}>Estoque</th>
                <th style={{ paddingBottom: '1rem' }}>Status</th>
                <th style={{ paddingBottom: '1rem', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1.25rem 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '48px', height: '48px', backgroundColor: 'var(--background)', borderRadius: '8px',
                        backgroundImage: product.images?.[0] ? `url(${product.images[0]})` : 'none',
                        backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid var(--border)'
                      }} />
                      <div>
                        <p style={{ fontWeight: 600 }}>{product.name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>SKU: {product.id.slice(0, 8).toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td>R$ {parseFloat(product.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td>{product.has_variations && product.variation_skus?.length > 0
                    ? product.variation_skus.reduce((sum: number, v: any) => sum + (parseInt(v.stock_quantity) || 0), 0)
                    : product.stock_quantity} un</td>
                  <td>
                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
                      Ativo
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link href={`${baseHref}/${product.id}`}>
                      <button style={{ background: 'var(--input-bg)', color: 'var(--foreground)', cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.875rem' }}>
                        Editar
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .top-filter-bar {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .mobile-full-width {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  )
}
