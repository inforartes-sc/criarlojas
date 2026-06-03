import Link from 'next/link'
import ProductCard from '@/components/Storefront/ProductCard'
import StoreHeader from '@/components/Storefront/StoreHeader'
import StoreFooter from '@/components/Storefront/StoreFooter'
import { supabase } from '@/lib/supabase'
import { ShoppingBag, ArrowLeft } from 'lucide-react'

async function getStoreData(domain: string) {
  const subdomainOnly = domain.split('.')[0]
  const { data } = await supabase
    .from('stores')
    .select('*')
    .or(`subdomain.eq.${subdomainOnly},subdomain.eq.${domain},custom_domain.eq.${domain}`)
    .single()
  return data
}

async function getProducts(storeId: string) {
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', storeId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  return data || []
}

async function getCategories(storeId: string) {
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('store_id', storeId)
    .order('name')
  return data || []
}

export default async function ProdutosPage({
  params,
  searchParams
}: {
  params: Promise<{ domain: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams

  const store = await getStoreData(resolvedParams.domain)
  if (!store) return <div style={{ textAlign: 'center', padding: '5rem' }}>Loja não encontrada</div>

  const [allProducts, categories] = await Promise.all([
    getProducts(store.id),
    getCategories(store.id)
  ])

  const settings = store.settings || {}
  const primaryColor = settings.primary_color || '#0284c7'
  const buttonColor = settings.button_color || '#000000'
  const buttonTextColor = settings.button_text_color || '#ffffff'
  const buttonHoverColor = settings.button_hover_color || '#333333'
  const buttonHoverTextColor = settings.button_hover_text_color || '#ffffff'
  const buttonVariant = settings.button_variant || 'filled'
  const buttonHoverVariant = settings.button_hover_variant || 'filled'
  const salePriceColor = settings.sale_price_color || '#ef4444'
  const normalPriceColor = settings.normal_price_color || '#bbbbbb'
  const defaultPriceColor = settings.default_price_color || '#000000'
  const buttonRadius = settings.button_style === 'pill' ? '100px' : settings.button_style === 'sharp' ? '0px' : '8px'
  const storeMode = settings.store_mode || 'loja'
  const storeWhatsapp = settings.whatsapp || ''

  const categoryFilter = resolvedSearchParams.category as string | undefined
  const searchFilter = resolvedSearchParams.search as string | undefined

  // Filter products
  const physicalProducts = allProducts.filter((p: any) => {
    const catName = p.category?.toLowerCase() || ''
    return !catName.includes('serviço') && !catName.includes('service') && p.is_service !== true
  })

  let filteredProducts = categoryFilter
    ? physicalProducts.filter((p: any) => p.category === categoryFilter)
    : physicalProducts

  if (searchFilter) {
    const q = searchFilter.toLowerCase()
    filteredProducts = filteredProducts.filter((p: any) =>
      p.name.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q))
    )
  }

  const uniqueCategories = [...new Set(physicalProducts.map((p: any) => p.category).filter(Boolean))]

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'var(--font-body, "Plus Jakarta Sans", Inter, system-ui, sans-serif)' }}>
      <style>{`
        .btn-buy-dynamic {
          background-color: ${buttonVariant === 'filled' ? buttonColor : 'transparent'} !important;
          color: ${buttonVariant === 'filled' ? buttonTextColor : buttonColor} !important;
          border: ${buttonVariant === 'outline' ? `2px solid ${buttonColor}` : 'none'} !important;
          transition: all 0.3s ease !important;
        }
        .btn-buy-dynamic:hover {
          background-color: ${buttonHoverVariant === 'filled' ? buttonHoverColor : 'transparent'} !important;
          color: ${buttonHoverVariant === 'filled' ? buttonHoverTextColor : buttonHoverColor} !important;
          border: ${buttonHoverVariant === 'outline' ? `2px solid ${buttonHoverColor}` : 'none'} !important;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .cat-pill { display: inline-flex; align-items: center; padding: 0.45rem 1.1rem; border-radius: 100px; font-size: 0.8rem; font-weight: 700; border: 2px solid transparent; cursor: pointer; text-decoration: none; transition: all 0.2s ease; }
        .cat-pill.active { background: ${primaryColor}; color: #fff; border-color: ${primaryColor}; }
        .cat-pill.inactive { background: #fff; color: #475569; border-color: #e2e8f0; }
        .cat-pill.inactive:hover { border-color: ${primaryColor}; color: ${primaryColor}; }
        .search-bar { width: 100%; max-width: 420px; padding: 0.85rem 1rem 0.85rem 3rem; border: 1px solid #e2e8f0; border-radius: ${buttonRadius}; font-size: 0.95rem; outline: none; background: #fff; }
        .search-bar:focus { border-color: ${primaryColor}; box-shadow: 0 0 0 3px ${primaryColor}20; }
        .products-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; }
        @media (max-width: 1100px) { .products-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px) { .products-grid { grid-template-columns: 1fr; } }
      `}</style>

      {/* Header */}
      <StoreHeader store={store} settings={settings} primaryColor={primaryColor} categories={categories} />

      <main style={{ maxWidth: '1300px', margin: '0 auto', padding: '3rem 2rem 6rem' }}>

        {/* Page Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <Link
            href="/"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 600, marginBottom: '1.25rem' }}
          >
            <ArrowLeft size={16} />
            Voltar para a Loja
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <ShoppingBag size={28} color={primaryColor} />
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', margin: 0 }}>
              Peças e Acessórios
            </h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
            {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
            {categoryFilter ? ` em "${categoryFilter}"` : ''}
          </p>
        </div>

        {/* Filters Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2.5rem', padding: '1.25rem 1.5rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          {/* Category Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            <Link href="/produtos" className={`cat-pill ${!categoryFilter ? 'active' : 'inactive'}`}>
              Todos
            </Link>
            {uniqueCategories.map((cat: any) => (
              <Link
                key={cat}
                href={`/produtos?category=${encodeURIComponent(cat)}`}
                className={`cat-pill ${categoryFilter === cat ? 'active' : 'inactive'}`}
              >
                {cat}
              </Link>
            ))}
          </div>

          {/* Search box */}
          <form method="GET" action="/produtos" style={{ position: 'relative', flexShrink: 0 }}>
            {categoryFilter && <input type="hidden" name="category" value={categoryFilter} />}
            <ShoppingBag size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
            <input
              type="text"
              name="search"
              defaultValue={searchFilter || ''}
              placeholder="Buscar produtos..."
              className="search-bar"
            />
          </form>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="products-grid">
            {filteredProducts.map((product: any) => (
              <ProductCard
                key={product.id}
                product={product}
                buttonRadius={buttonRadius}
                salePriceColor={salePriceColor}
                normalPriceColor={normalPriceColor}
                defaultPriceColor={defaultPriceColor}
                layoutModel="modern"
                storeMode={storeMode}
                storeWhatsapp={storeWhatsapp}
                primaryColor={primaryColor}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '6rem 2rem', color: '#94a3b8' }}>
            <ShoppingBag size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Nenhum produto encontrado.</p>
            <Link href="/produtos" style={{ color: primaryColor, fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>
              Limpar filtros
            </Link>
          </div>
        )}
      </main>

      <StoreFooter store={store} settings={settings} primaryColor={primaryColor} buttonRadius={buttonRadius} />
    </div>
  )
}
