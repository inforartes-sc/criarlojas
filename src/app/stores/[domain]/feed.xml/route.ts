import { supabase } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ domain: string }> }
) {
  const resolvedParams = await params
  const domain = resolvedParams.domain

  const subdomainOnly = domain.split('.')[0]
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .or(`subdomain.eq.${subdomainOnly},subdomain.eq.${domain},custom_domain.eq.${domain}`)
    .single()

  if (!store) {
    return new Response('<error>Loja nao encontrada</error>', {
      status: 404,
      headers: { 'Content-Type': 'application/xml' }
    })
  }

  // Buscar produtos ativos da loja
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', store.id)
    .eq('is_active', true)

  const storeHost = store.custom_domain || `${store.subdomain}.criarlojas.com`
  const baseUrl = `https://${storeHost}`

  let xmlItems = ''
  if (products) {
    for (const prod of products) {
      const prodUrl = `${baseUrl}/product/${encodeURIComponent(prod.slug || prod.id)}`
      const imgUrl = prod.images?.[0] || `${baseUrl}/placeholder.png`
      const price = parseFloat(prod.price || '0').toFixed(2)
      const salePrice = prod.sale_price ? parseFloat(prod.sale_price).toFixed(2) : ''
      const desc = prod.short_description || prod.name || ''

      xmlItems += `
    <item>
      <g:id>${prod.id}</g:id>
      <g:title><![CDATA[${prod.name}]]></g:title>
      <g:description><![CDATA[${desc}]]></g:description>
      <g:link>${prodUrl}</g:link>
      <g:image_link>${imgUrl}</g:image_link>
      <g:brand><![CDATA[${store.name}]]></g:brand>
      <g:condition>new</g:condition>
      <g:availability>in stock</g:availability>
      <g:price>${price} BRL</g:price>
      ${salePrice ? `<g:sale_price>${salePrice} BRL</g:sale_price>` : ''}
      <g:google_product_category>166</g:google_product_category>
    </item>`
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title><![CDATA[${store.name}]]></title>
    <link>${baseUrl}</link>
    <description><![CDATA[Catálogo de Produtos - ${store.name}]]></description>
    ${xmlItems}
  </channel>
</rss>`

  return new Response(xml.trim(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate'
    }
  })
}
