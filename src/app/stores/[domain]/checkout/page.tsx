import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import CheckoutClient from '@/components/Storefront/CheckoutClient'

async function getStoreData(domain: string) {
  const subdomainOnly = domain.split('.')[0]
  const { data } = await supabase
    .from('stores')
    .select('*')
    .or(`subdomain.eq.${subdomainOnly},subdomain.eq.${domain},custom_domain.eq.${domain}`)
    .single()
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

export default async function CheckoutPage({ params }: { params: Promise<{ domain: string }> }) {
  const resolvedParams = await params
  const store = await getStoreData(resolvedParams.domain)
  if (!store) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Loja não encontrada.</div>
  }

  if (store.settings?.plan === 'basic') {
    const isLocalSubpath = !resolvedParams.domain.includes('.') && resolvedParams.domain !== 'localhost'
    const homePath = isLocalSubpath ? `/stores/${resolvedParams.domain}` : '/'
    redirect(homePath)
  }

  const categories = await getCategories(store.id)

  return <CheckoutClient store={store} categories={categories} />
}
