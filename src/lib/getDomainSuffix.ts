export function getDomainSuffix(): string {
  if (typeof window === 'undefined') return '.localhost:3000'
  const host = window.location.host
  const cleanHost = host.split(':')[0]

  if (cleanHost.includes('criarlojas.com.br')) {
    return '.criarlojas.com.br'
  } else if (cleanHost.includes('sistemacriarlojas.vercel.app')) {
    return '.sistemacriarlojas.vercel.app'
  } else if (cleanHost.includes('localhost') || cleanHost.includes('127.0.0.1')) {
    return '.localhost:3000'
  }

  // Generic fallback: check if it's a domain with a subdomain like a.b.c or just a.b
  const parts = cleanHost.split('.')
  if (parts.length >= 2) {
    if (parts[parts.length - 1].match(/^\d+$/)) {
      return '.' + host
    }
    const lastPart = parts[parts.length - 1]
    const prevPart = parts[parts.length - 2]
    // Handle Brazilian domains like .com.br, .net.br
    if (prevPart === 'com' || prevPart === 'net' || prevPart === 'org' || prevPart === 'gov') {
      if (parts.length >= 3) {
        return '.' + parts[parts.length - 3] + '.' + prevPart + '.' + lastPart
      }
    }
    return '.' + prevPart + '.' + lastPart
  }

  return '.' + host
}

export function getFullDomain(subdomain: string): string {
  const suffix = getDomainSuffix()
  return `${subdomain}${suffix}`
}

export function getAbsoluteUrl(subdomain: string, path: string = ''): string {
  if (typeof window === 'undefined') {
    return `http://${subdomain}.localhost:3000${path}`
  }
  const protocol = window.location.protocol
  const host = window.location.host
  const cleanHost = host.split(':')[0]

  // Check if we are currently on a custom domain
  const mainDomains = [
    'criarlojas.com.br',
    'sistemacriarlojas.vercel.app',
    'localhost',
    '127.0.0.1'
  ]
  const isCustomDomain = !mainDomains.some(domain => cleanHost === domain || cleanHost.endsWith('.' + domain))

  if (isCustomDomain) {
    return `${protocol}//${host}${path}`
  }

  const fullDomain = getFullDomain(subdomain)
  return `${protocol}//${fullDomain}${path}`
}
