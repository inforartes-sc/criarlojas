import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const domainParam = searchParams.get('domain')

    if (!domainParam) {
      return NextResponse.json({ error: 'Domínio é obrigatório.' }, { status: 400 })
    }

    // Limpar o domínio
    let domain = domainParam
      .trim()
      .toLowerCase()
      .replace(/^(https?:\/\/)?(www\.)?/, '') // Remove http, https e www
      .replace(/[^a-z0-9.-]/g, '') // Remove caracteres inválidos

    if (!domain) {
      return NextResponse.json({ error: 'Digite um domínio válido.' }, { status: 400 })
    }

    // Se o usuário digitou apenas a palavra (ex: "minhamarca"), adiciona .com.br por padrão
    if (!domain.includes('.')) {
      domain = `${domain}.com.br`
    }

    const tld = domain.split('.').pop()
    if (!tld || tld.length < 2) {
      return NextResponse.json({ error: 'Formato de domínio inválido.' }, { status: 400 })
    }

    const isBr = domain.endsWith('.br')

    if (isBr) {
      // Usar a API oficial do Registro.br para domínios .br
      try {
        const response = await fetch(`https://registro.br/v2/ajax/avail/c/${domain}`, {
          headers: { 
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json'
          },
          signal: AbortSignal.timeout(4000)
        })
        
        if (response.ok) {
          const data = await response.json()
          // status = 0 significa disponível para registro
          const available = data.status === 0
          const message = available 
            ? 'Domínio disponível para registro imediato!' 
            : data.status === 1 
            ? 'Domínio já está registrado (indisponível para novo registro).' 
            : 'Domínio indisponível ou reservado.'

          return NextResponse.json({ 
            domain, 
            available, 
            status: data.status,
            message,
            source: 'registro.br' 
          })
        }
      } catch (err) {
        console.error('Erro ao consultar Registro.br:', err)
      }
    }

    // Para domínios internacionais ou se o Registro.br falhar, usar RDAP (protocolo oficial sucessor do Whois)
    try {
      const rdapResponse = await fetch(`https://rdap.org/domain/${domain}`, {
        method: 'GET',
        headers: { 'Accept': 'application/rdap+json' },
        signal: AbortSignal.timeout(4000)
      })

      if (rdapResponse.status === 404) {
        return NextResponse.json({ 
          domain, 
          available: true, 
          message: 'Domínio disponível para registro!',
          source: 'rdap' 
        })
      } else if (rdapResponse.status === 200) {
        return NextResponse.json({ 
          domain, 
          available: false, 
          message: 'Domínio já está registrado.',
          source: 'rdap' 
        })
      }
    } catch (err) {
      console.error('Erro ao consultar RDAP:', err)
    }

    // Fallback usando o DNS do Google HTTPS para verificar se existem servidores de nomes (NS) ou registros A
    try {
      const dnsResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=NS`, {
        signal: AbortSignal.timeout(4000)
      })
      if (dnsResponse.ok) {
        const dnsData = await dnsResponse.json()
        const hasNS = !!dnsData.Answer && dnsData.Answer.length > 0
        
        if (!hasNS) {
          const dnsAResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=A`, {
            signal: AbortSignal.timeout(4000)
          })
          if (dnsAResponse.ok) {
            const dnsAData = await dnsAResponse.json()
            const hasA = !!dnsAData.Answer && dnsAData.Answer.length > 0
            return NextResponse.json({ 
              domain, 
              available: !hasA, 
              message: !hasA ? 'Domínio aparentemente disponível!' : 'Domínio já possui registros DNS ativos.',
              source: 'google-dns-a' 
            })
          }
        }

        return NextResponse.json({ 
          domain, 
          available: !hasNS, 
          message: !hasNS ? 'Domínio aparentemente disponível!' : 'Domínio já possui servidores DNS ativos.',
          source: 'google-dns-ns' 
        })
      }
    } catch (err) {
      console.error('Erro ao consultar Google DNS Fallback:', err)
    }

    return NextResponse.json({ 
      error: 'Não foi possível verificar a disponibilidade no momento. Verifique se o nome do domínio está correto.' 
    }, { status: 500 })

  } catch (error: any) {
    console.error('Erro na rota de checagem de domínio:', error)
    return NextResponse.json({ error: error.message || 'Erro interno ao verificar domínio.' }, { status: 500 })
  }
}

