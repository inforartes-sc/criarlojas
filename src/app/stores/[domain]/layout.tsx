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
  const domain = resolvedParams?.domain || ''
  const subdomainOnly = domain.split('.')[0]

  const { data: store } = await supabase
    .from('stores')
    .select('name, logo_url, settings')
    .or(`subdomain.eq.${subdomainOnly},subdomain.eq.${domain},custom_domain.eq.${domain}`)
    .maybeSingle()

  if (!store) {
    return {
      title: 'Loja',
    }
  }

  const storeName = store.name || 'Loja'
  const description = store.settings?.seo_description || store.settings?.description || store.settings?.bio || `Confira as melhores ofertas na ${storeName}`
  const iconUrl = store.settings?.favicon || store.logo_url

  return {
    title: {
      default: storeName,
      template: `%s | ${storeName}`,
    },
    description: description,
    icons: iconUrl ? [{ rel: 'icon', url: iconUrl }] : undefined,
    openGraph: {
      title: storeName,
      description: description,
      images: store.logo_url ? [{ url: store.logo_url }] : [],
    },
  }
}

export default function StoreLayout({ children }: Props) {
  return <>{children}</>
}
