const STORAGE_KEY = 'admin_store_subdomain'

export function getStoreSubdomain(): string {
  if (typeof window === 'undefined') return 'teste'
  const hostname = window.location.hostname
  const parts = hostname.split('.')
  if (parts[0] !== 'localhost' && parts[0] !== '127' && parts[0] !== 'www') {
    return parts[0]
  }
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) return stored
  return 'teste'
}

export function setStoreSubdomain(subdomain: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, subdomain)
}
