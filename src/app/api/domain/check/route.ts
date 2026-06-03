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

    if (!domain.includes('.') || domain.split('.').pop()!.length < 2) {
      return NextResponse.json({ error: 'Formato de domínio inválido.' }, { status: 400 })
    }

    const isBr = domain.endsWith('.br')

    if (isBr) {
      // Usar a API oficial do Registro.br para domínios .br
      try {
        const response = await fetch(`https://registro.br/v2/ajax/avail/c/${domain}`, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          next: { revalidate: 60 } // Cache por 60 segundos
        })
        
        if (response.ok) {
          const data = await response.json()
          // status = 0 significa disponível para registro
          const available = data.status === 0
          return NextResponse.json({ 
            domain, 
            available, 
            status: data.status,
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
        next: { revalidate: 60 }
      })

      if (rdapResponse.status === 404) {
        // Se retornar 404, o domínio não existe nas bases de dados dos registradores, logo está disponível
        return NextResponse.json({ domain, available: true, source: 'rdap' })
      } else if (rdapResponse.status === 200) {
        // Se retornar 200, o domínio está registrado e indisponível
        return NextResponse.json({ domain, available: false, source: 'rdap' })
      }
    } catch (err) {
      console.error('Erro ao consultar RDAP:', err)
    }

    // Fallback usando o DNS do Google HTTPS para verificar se existem servidores de nomes (NS) ou registros A
    try {
      const dnsResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=NS`, {
        next: { revalidate: 60 }
      })
      if (dnsResponse.ok) {
        const dnsData = await dnsResponse.json()
        // Se tiver a propriedade "Answer", o domínio tem servidores DNS configurados e está indisponível
        const hasNS = !!dnsData.Answer && dnsData.Answer.length > 0
        
        // Se não tiver NS, consultar por registro A
        if (!hasNS) {
          const dnsAResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=A`, {
            next: { revalidate: 60 }
          })
          if (dnsAResponse.ok) {
            const dnsAData = await dnsAResponse.json()
            const hasA = !!dnsAData.Answer && dnsAData.Answer.length > 0
            return NextResponse.json({ 
              domain, 
              available: !hasA, 
              source: 'google-dns-a' 
            })
          }
        }

        return NextResponse.json({ 
          domain, 
          available: !hasNS, 
          source: 'google-dns-ns' 
        })
      }
    } catch (err) {
      console.error('Erro ao consultar Google DNS Fallback:', err)
    }

    // Caso todos os métodos falhem por limitações de rede
    return NextResponse.json({ 
      error: 'Não foi possível verificar a disponibilidade no momento. Tente novamente.' 
    }, { status: 500 })

  } catch (error: any) {
    console.error('Erro na rota de checagem de domínio:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
