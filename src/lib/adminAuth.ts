import { supabase } from './supabase'
import { getStoreSubdomain } from './getStoreSubdomain'

export interface StoreSession {
  id: string
  subdomain: string
  name: string
  settings: any
}

export async function getAuthenticatedStore(): Promise<StoreSession | null> {
  if (typeof window === 'undefined') return null

  const subdomain = getStoreSubdomain()
  if (!subdomain) return null

  const adminUser = localStorage.getItem(`admin_user_${subdomain}`)
  const adminPass = localStorage.getItem(`admin_password_${subdomain}`)

  if (!adminUser || !adminPass) return null

  const { data: store, error } = await supabase
    .from('stores')
    .select('id, name, subdomain, settings')
    .or(`subdomain.eq.${subdomain},subdomain.eq.${subdomain}.localhost`)
    .single()

  if (error || !store) return null

  const settings = store.settings || {}
  const dbUser = settings.admin_user || settings.email || 'admin'
  const dbPass = settings.admin_password || 'senha123'

  if (adminUser === dbUser && adminPass === dbPass) {
    return {
      id: store.id,
      subdomain: store.subdomain,
      name: store.name,
      settings
    }
  }

  return null
}

export async function loginAdmin(user: string, pass: string): Promise<boolean> {
  if (typeof window === 'undefined') return false

  const subdomain = getStoreSubdomain()
  if (!subdomain) return false

  const { data: store, error } = await supabase
    .from('stores')
    .select('id, name, subdomain, settings')
    .or(`subdomain.eq.${subdomain},subdomain.eq.${subdomain}.localhost`)
    .single()

  if (error || !store) return false

  const settings = store.settings || {}
  const dbUser = settings.admin_user || settings.email || 'admin'
  const dbPass = settings.admin_password || 'senha123'

  if (user === dbUser && pass === dbPass) {
    localStorage.setItem(`admin_user_${subdomain}`, user)
    localStorage.setItem(`admin_password_${subdomain}`, pass)
    return true
  }

  return false
}

export function logoutAdmin(): void {
  if (typeof window === 'undefined') return
  const subdomain = getStoreSubdomain()
  if (!subdomain) return
  localStorage.removeItem(`admin_user_${subdomain}`)
  localStorage.removeItem(`admin_password_${subdomain}`)
}
