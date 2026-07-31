import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'

type Props = {
  params: Promise<{ domain: string }>
  children: React.ReactNode
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>
}): Promise<Metadata> {
  const resolvedParams = await params
  const rawDomain = resolvedParams?.domain || ''
  const cleanDomain = rawDomain.replace(/^www\./i, '')
  const subdomainOnly = cleanDomain.split('.')[0]

  const { data: store } = await supabase
    .from('stores')
    .select('name, logo_url, settings')
    .or(`subdomain.eq.${subdomainOnly},subdomain.eq.${cleanDomain},custom_domain.eq.${cleanDomain},custom_domain.eq.${rawDomain},custom_domain.eq.www.${cleanDomain}`)
    .maybeSingle()

  const storeName = store?.name || store?.settings?.store_name || store?.settings?.name || ''
  const displayTitle = storeName ? storeName : 'Loja'
  const description = store?.settings?.seo_description || store?.settings?.description || store?.settings?.bio || (storeName ? `Confira as melhores ofertas na ${storeName}` : 'Sua Loja Virtual')
  const iconUrl = store?.settings?.favicon || store?.logo_url

  return {
    title: {
      default: displayTitle,
      template: `%s | ${displayTitle}`,
    },
    description: description,
    icons: iconUrl ? [{ rel: 'icon', url: iconUrl }] : undefined,
    openGraph: {
      title: displayTitle,
      description: description,
      images: store?.logo_url ? [{ url: store.logo_url }] : [],
    },
  }
}

export default function StoreLayout({ children }: Props) {
  return <>{children}</>
}
