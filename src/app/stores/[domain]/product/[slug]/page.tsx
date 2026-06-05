import { ShoppingCart, ShieldCheck, Truck, RefreshCw, ChevronRight, Share2, CreditCard, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import BenefitIcon from '@/components/BenefitIcon'
import { supabase } from '@/lib/supabase'
import StoreHeader from '@/components/Storefront/StoreHeader'
import ProductGallery from '@/components/Storefront/ProductGallery'
import ProductActions from '@/components/Storefront/ProductActions'
import ProductShareActions from '@/components/Storefront/ProductShareActions'
import ProductCard from '@/components/Storefront/ProductCard'
import StoreFooter from '@/components/Storefront/StoreFooter'
import ProductReviews from '@/components/Storefront/ProductReviews'

export const dynamic = 'force-dynamic'

async function getProductData(domain: string, slug: string) {
  const subdomainOnly = domain.split('.')[0]
  const decodedSlug = decodeURIComponent(slug)

  // Encontrar o ID da loja pelo domínio
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id')
    .or(`subdomain.eq.${subdomainOnly},subdomain.eq.${domain},custom_domain.eq.${domain}`)
    .single()

  if (storeError || !store) return null

  // Buscar o produto isolado por loja e slug
  const { data, error } = await supabase
    .from('products')
    .select('*, stores(*)')
    .eq('store_id', store.id)
    .eq('slug', decodedSlug)
    .maybeSingle()

  if (error || !data) return null
  return data
}

async function getCategories(storeId: string) {
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('store_id', storeId)
    .order('name')
  return data || []
}

async function getRelatedProducts(storeId: string, currentProductId: string, category: string) {
  let query = supabase
    .from('products')
    .select('*')
    .eq('store_id', storeId)
    .eq('is_active', true)
    .neq('id', currentProductId)
    .limit(5)

  if (category) {
    query = query.eq('category', category)
  }

  const { data } = await query

  if (!data || data.length < 5) {
    const { data: moreData } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', storeId)
      .eq('is_active', true)
      .neq('id', currentProductId)
      .limit(5 - (data?.length || 0))
    
    const all = [...(data || [])]
    if (moreData) {
      for (const p of moreData) {
        if (!all.find(x => x.id === p.id)) all.push(p)
      }
    }
    return all.slice(0, 5)
  }

  return data
}

export default async function ProductPage({ 
  params 
}: { 
  params: Promise<{ domain: string, slug: string }> 
}) {
  const resolvedParams = await params
  const product = await getProductData(resolvedParams.domain, resolvedParams.slug)

  const isLocalSubpath = !resolvedParams.domain.includes('.') && resolvedParams.domain !== 'localhost'
  const homePath = isLocalSubpath ? `/stores/${resolvedParams.domain}` : '/'

  if (!product) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Produto não encontrado</h1>
        <Link href={homePath} style={{ padding: '1rem 2rem', backgroundColor: '#111', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: 600 }}>Voltar para a loja</Link>
      </div>
    )
  }

  const store = product.stores
  const settings = store?.settings || {}
  const categories = await getCategories(store.id)

  const primaryColor = settings.primary_color || '#6366f1'
  const buttonColor = settings.button_color || '#000000'
  const buttonTextColor = settings.button_text_color || '#ffffff'
  const buttonHoverColor = settings.button_hover_color || '#333333'
  const buttonHoverTextColor = settings.button_hover_text_color || '#ffffff'
  const buttonVariant = settings.button_variant || 'filled'
  const buttonHoverVariant = settings.button_hover_variant || 'filled'
  const buttonRadius = settings.button_style === 'pill' ? '100px' : settings.button_style === 'sharp' ? '0px' : '8px'
  const fontFamily = settings.font_family || 'Inter'

  const salePriceColor = settings.sale_price_color || '#ef4444'
  const normalPriceColor = settings.normal_price_color || '#bbbbbb'
  const defaultPriceColor = settings.default_price_color || '#000000'
  
  const storeMode = settings.store_mode || 'loja'
  const storeWhatsapp = settings.whatsapp || ''

  const benefits = settings.benefits || [
    { title: 'Entrega Rápida', subtitle: 'Calcule o prazo no checkout' },
    { title: 'Compra Segura', subtitle: 'Ambiente 100% protegido' },
    { title: 'Troca Fácil', subtitle: '7 dias para devolução' },
    { title: 'Pagamento Facilitado', subtitle: 'Em até 12x no cartão' }
  ]

  const layoutModel = settings.layout_model || 'modern'
  const themeMode = settings.theme_mode || (layoutModel === 'tech' ? 'dark' : 'light')
  const isDark = themeMode === 'dark'

  const relatedProducts = await getRelatedProducts(store.id, product.id, product.category)

  const priceParts = parseFloat(product.price).toFixed(2).split('.')
  const salePrice = product.sale_price ? parseFloat(product.sale_price).toFixed(2).split('.') : null

  return (
    <div style={{ backgroundColor: isDark ? '#0a0a0a' : '#f4f5f7', color: isDark ? '#f8fafc' : '#1a1a1a', minHeight: '100vh', fontFamily: `${fontFamily}, system-ui, sans-serif` }}>
      {/* Injeção de CSS Dinâmico */}
      <style>{`
        body { background-color: ${isDark ? '#0a0a0a' : '#f4f5f7'} !important; }
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
        .whatsapp-floating-btn:hover {
          transform: scale(1.1) rotate(5deg) !important;
          filter: brightness(1.1);
        }
        @media (max-width: 1024px) {
          .product-main-grid {
            grid-template-columns: 1fr !important;
            gap: 3rem !important;
          }
          .product-benefits-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 1.5rem !important;
            padding: 1.5rem !important;
          }
          .related-products-grid {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 1.5rem !important;
          }
        }
        @media (max-width: 768px) {
          .product-extra-widgets-grid {
            grid-template-columns: 1fr !important;
          }
          .product-benefits-grid {
            grid-template-columns: 1fr !important;
            padding: 1.25rem !important;
          }
          .related-products-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 1rem !important;
          }
          .product-page-main {
            padding: 0 1rem !important;
            margin-top: 1.5rem !important;
          }
          .related-products-title {
            font-size: 1.4rem !important;
          }
          .related-products-header {
            align-items: center !important;
          }
        }
      `}</style>

      {/* HEADER INTERATIVO */}
      <StoreHeader store={store} settings={settings} primaryColor={primaryColor} categories={categories} />

      <main className="product-page-main" style={{ maxWidth: '1300px', margin: '3rem auto 6rem auto', padding: '0 2rem' }}>
        
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.85rem', color: isDark ? '#aaa' : '#666', marginBottom: '2rem', fontWeight: 600 }}>
          <Link href={homePath} style={{ color: isDark ? '#aaa' : '#666', textDecoration: 'none' }}>Início</Link>
          <ChevronRight size={14} />
          {product.category && (
            <>
              <Link href={`${homePath === '/' ? '' : homePath}/?category=${product.category}#produtos`} style={{ color: isDark ? '#aaa' : '#666', textDecoration: 'none' }}>{product.category}</Link>
              <ChevronRight size={14} />
            </>
          )}
          <span style={{ color: isDark ? '#fff' : '#111', wordBreak: 'break-word' }}>{product.name}</span>
        </div>

        <div className="product-main-grid" style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: '5rem', alignItems: 'flex-start' }}>
          
          {/* Lado Esquerdo: Galeria Interativa */}
          <ProductGallery images={product.images || []} hasSale={!!salePrice} salePriceColor={salePriceColor} />

          {/* Lado Direito: Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: primaryColor, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', backgroundColor: `${primaryColor}15`, padding: '0.4rem 0.8rem', borderRadius: '4px' }}>
                {product.category || 'NOVIDADE'}
              </span>
              <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: '1rem 0 1rem 0', lineHeight: 1.2, letterSpacing: '-0.5px', color: isDark ? '#fff' : 'inherit' }}>{product.name}</h1>
              <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem', fontWeight: 500, letterSpacing: '0.5px' }}>SKU: {product.sku || product.id.slice(0,8).toUpperCase()}</p>
              
            </div>

            {/* Preço, Variações e Ações (Client Component Dinâmico) */}
            <ProductActions 
              product={product}
              storeMode={storeMode}
              storeWhatsapp={storeWhatsapp}
              buttonRadius={buttonRadius}
              primaryColor={primaryColor}
              settings={settings}
            />

            {/* Calcular Frete e Cupom de Desconto */}
            {storeMode !== 'catalogo' && layoutModel !== 'lawyer' && layoutModel !== 'advocacia' && layoutModel !== 'advocacy' && (
              <div className="product-extra-widgets-grid" style={{ marginTop: '1.5rem', marginBottom: '0.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Calcular Frete */}
                <div style={{ padding: '1.25rem', backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f9fafb', borderRadius: '12px', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #eaeaea', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem', color: isDark ? '#fff' : '#111', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Truck size={18} color={primaryColor} /> Calcular Frete
                    </p>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <input 
                        type="text" 
                        placeholder="00000-000" 
                        style={{ width: '100%', minWidth: 0, padding: '0.7rem 0.8rem', borderRadius: buttonRadius, border: '1px solid #ddd', outline: 'none', fontSize: '0.85rem', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff', color: isDark ? '#fff' : '#000' }} 
                      />
                      <button 
                        style={{ padding: '0.7rem 1rem', backgroundColor: isDark ? '#fff' : '#111', color: isDark ? '#000' : '#fff', border: 'none', borderRadius: buttonRadius, fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        OK
                      </button>
                    </div>
                  </div>
                  <Link href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" style={{ fontSize: '0.75rem', color: primaryColor, textDecoration: 'underline', display: 'inline-block', marginTop: '0.75rem', fontWeight: 600 }}>Não sei meu CEP</Link>
                </div>

                {/* Cupom de Desconto */}
                <div style={{ padding: '1.25rem', backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f9fafb', borderRadius: '12px', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #eaeaea', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem', color: isDark ? '#fff' : '#111', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ display: 'inline-block', transform: 'rotate(-45deg)' }}>🏷️</span> Cupom de Desconto
                    </p>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <input 
                        type="text" 
                        placeholder="CÓDIGO" 
                        style={{ width: '100%', minWidth: 0, padding: '0.7rem 0.8rem', borderRadius: buttonRadius, border: '1px solid #ddd', outline: 'none', fontSize: '0.85rem', textTransform: 'uppercase', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff', color: isDark ? '#fff' : '#000' }} 
                      />
                      <button 
                        style={{ padding: '0.7rem 1rem', backgroundColor: primaryColor, color: '#fff', border: 'none', borderRadius: buttonRadius, fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        Aplicar
                      </button>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: isDark ? '#ccc' : '#666', display: 'inline-block', marginTop: '0.75rem' }}>Insira seu código promocional</span>
                </div>
              </div>
            )}

            {/* Botões de Dúvidas e Compartilhamento (Client Component) */}
            <ProductShareActions 
              product={product}
              storeMode={storeMode}
              storeWhatsapp={storeWhatsapp}
              buttonRadius={buttonRadius}
              layoutModel={layoutModel}
            />


            
          </div>
        </div>

        {/* Benefícios (Full Width) */}
        <div className="product-benefits-grid" style={{ marginTop: '4rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', padding: '1.5rem 3rem', backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f9fafb', borderRadius: '16px', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #eaeaea' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ color: primaryColor }}><BenefitIcon name={benefits[0]?.icon} color={primaryColor} /></div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.3rem', color: isDark ? '#fff' : '#111' }}>{benefits[0]?.title || 'Entrega Rápida'}</p>
              <p style={{ fontSize: '0.85rem', color: isDark ? '#ccc' : '#666', lineHeight: 1.4 }}>{benefits[0]?.subtitle || 'Calcule o prazo no checkout'}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ color: primaryColor }}><BenefitIcon name={benefits[1]?.icon} color={primaryColor} /></div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.3rem', color: isDark ? '#fff' : '#111' }}>{benefits[1]?.title || 'Compra Segura'}</p>
              <p style={{ fontSize: '0.85rem', color: isDark ? '#ccc' : '#666', lineHeight: 1.4 }}>{benefits[1]?.subtitle || 'Ambiente 100% protegido'}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ color: primaryColor }}><BenefitIcon name={benefits[2]?.icon} color={primaryColor} /></div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.3rem', color: isDark ? '#fff' : '#111' }}>{benefits[2]?.title || 'Troca Fácil'}</p>
              <p style={{ fontSize: '0.85rem', color: isDark ? '#ccc' : '#666', lineHeight: 1.4 }}>{benefits[2]?.subtitle || '7 dias para devolução'}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ color: primaryColor }}><BenefitIcon name={benefits[3]?.icon} color={primaryColor} /></div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.3rem', color: isDark ? '#fff' : '#111' }}>{benefits[3]?.title || 'Pagamento Facilitado'}</p>
              <p style={{ fontSize: '0.85rem', color: isDark ? '#ccc' : '#666', lineHeight: 1.4 }}>{benefits[3]?.subtitle || 'Em até 12x no cartão'}</p>
            </div>
          </div>
        </div>

        {/* Descrição Detalhada */}
        <div style={{ marginTop: '5rem', borderTop: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #eaeaea', paddingTop: '4rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '2rem', letterSpacing: '-0.5px', color: isDark ? '#fff' : '#111' }}>Detalhes do Produto</h2>
          <div style={{ 
            color: isDark ? '#ccc' : '#444', 
            lineHeight: 1.8, 
            fontSize: '1.1rem',
            maxWidth: '900px'
          }}>
            {product.description ? (
              <div dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br />') }} />
            ) : (
              <p>Nenhuma descrição detalhada informada.</p>
            )}
          </div>
        </div>

        {/* Especificações Técnicas */}
        {(product.weight || product.length || product.width || product.height) && (
          <div style={{ marginTop: '4rem', borderTop: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #eaeaea', paddingTop: '3rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', color: isDark ? '#fff' : '#111' }}>Especificações</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              {product.weight && (
                <div style={{ padding: '1rem', backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f9fafb', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #eee' }}>
                  <span style={{ fontSize: '0.85rem', color: '#888', display: 'block' }}>Peso</span>
                  <strong style={{ fontSize: '1.1rem', color: isDark ? '#fff' : '#111' }}>{product.weight} kg</strong>
                </div>
              )}
              {product.length && (
                <div style={{ padding: '1rem', backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f9fafb', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #eee' }}>
                  <span style={{ fontSize: '0.85rem', color: '#888', display: 'block' }}>Comprimento</span>
                  <strong style={{ fontSize: '1.1rem', color: isDark ? '#fff' : '#111' }}>{product.length} cm</strong>
                </div>
              )}
              {product.width && (
                <div style={{ padding: '1rem', backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f9fafb', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #eee' }}>
                  <span style={{ fontSize: '0.85rem', color: '#888', display: 'block' }}>Largura</span>
                  <strong style={{ fontSize: '1.1rem', color: isDark ? '#fff' : '#111' }}>{product.width} cm</strong>
                </div>
              )}
              {product.height && (
                <div style={{ padding: '1rem', backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f9fafb', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #eee' }}>
                  <span style={{ fontSize: '0.85rem', color: '#888', display: 'block' }}>Altura</span>
                  <strong style={{ fontSize: '1.1rem', color: isDark ? '#fff' : '#111' }}>{product.height} cm</strong>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Avaliações do Produto */}
        {layoutModel !== 'lawyer' && layoutModel !== 'advocacia' && layoutModel !== 'landing-page' && (
          <ProductReviews
            productId={product.id}
            storeId={store.id}
            isDark={isDark}
            primaryColor={primaryColor}
            buttonRadius={buttonRadius}
          />
        )}

        <div style={{ marginTop: '6rem' }}>
          <div className="related-products-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
            <h2 className="related-products-title" style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.5px', margin: 0, color: isDark ? '#fff' : '#111' }}>Você também pode gostar</h2>
            <Link href="/?view=produtos" style={{ color: primaryColor, textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>Ver toda a loja</Link>
          </div>
          
          <div className="related-products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '2.5rem' }}>
            {relatedProducts.length > 0 ? (
              relatedProducts.map(relProduct => (
                <ProductCard 
                  key={relProduct.id} 
                  product={relProduct} 
                  buttonRadius={buttonRadius} 
                  salePriceColor={salePriceColor} 
                  normalPriceColor={normalPriceColor} 
                  defaultPriceColor={defaultPriceColor} 
                  layoutModel={layoutModel}
                  storeMode={storeMode}
                  storeWhatsapp={storeWhatsapp}
                  primaryColor={buttonColor}
                  themeMode={themeMode}
                />
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f9fafb', borderRadius: '16px', gridColumn: '1 / -1', color: isDark ? '#ccc' : '#666' }}>
                Nenhum produto relacionado encontrado.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* FOOTER (RODAPÉ COM BOTÃO VOLTAR AO TOPO) */}
      <StoreFooter store={store} settings={settings} primaryColor={primaryColor} buttonRadius={buttonRadius} />

      {/* BOTÃO DO WHATSAPP FLUTUANTE DO LOJISTA */}
      {storeWhatsapp && (
        <a 
          href={`https://wa.me/55${storeWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá! Gostaria de saber mais sobre o produto *${product.name}*.`)}`}
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            position: 'fixed',
            bottom: '6.5rem',
            right: '2rem',
            background: '#25D366',
            color: 'white',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 35px rgba(37, 211, 102, 0.5)',
            zIndex: 9999,
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
          className="whatsapp-floating-btn"
          title="Fale com a Loja pelo WhatsApp"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="white"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.245 3.478 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
        </a>
      )}
    </div>
  )
}
