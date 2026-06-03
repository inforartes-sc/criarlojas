import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // 1. Ignorar arquivos estáticos, favicons, chamadas de API e rotas administrativas
  if (
    url.pathname.startsWith('/_next') || 
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/super-admin') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // 2. Definir o domínio principal
  // No localhost, vamos considerar que apenas 'localhost' ou '127.0.0.1' é o site principal
  // Qualquer subdomínio (ex: cliente1.localhost) será tratado como uma loja
  const cleanHostname = hostname.split(':')[0]
  const isMainDomain = 
    cleanHostname === 'localhost' || 
    cleanHostname === '127.0.0.1' || 
    cleanHostname === 'suaplataforma.com.br'

  if (isMainDomain) {
    return NextResponse.next()
  }

  // 3. Roteamento de Loja (Subdomínio ou Domínio Customizado)
  return NextResponse.rewrite(new URL(`/stores/${cleanHostname}${url.pathname}${url.search}`, request.url))
}

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api|_next|_static|_vercel|[\\w-]+\\.\\w+).*)',
  ],
}
