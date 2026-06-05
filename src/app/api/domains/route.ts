import { NextResponse } from 'next/server'

// Vercel API base URL
const VERCEL_API_URL = 'https://api.vercel.com'

export async function POST(request: Request) {
  try {
    const { domain, action, oldDomain } = await request.json()

    const token = process.env.VERCEL_TOKEN
    const projectId = process.env.VERCEL_PROJECT_ID

    if (!token || !projectId) {
      console.error('Vercel API credentials not configured in environment variables.')
      return NextResponse.json(
        { error: 'Credenciais da API da Vercel não configuradas no servidor.' },
        { status: 500 }
      )
    }

    if (!domain) {
      return NextResponse.json({ error: 'Domínio é obrigatório.' }, { status: 400 })
    }

    // 1. Se houver um domínio antigo configurado e ele for diferente do novo, removemos da Vercel
    if (action === 'add' && oldDomain && oldDomain !== domain) {
      try {
        console.log(`Removendo domínio antigo da Vercel: ${oldDomain}`)
        await fetch(`${VERCEL_API_URL}/v9/projects/${projectId}/domains/${oldDomain}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      } catch (err) {
        console.error('Erro ao deletar domínio antigo da Vercel:', err)
      }
    }

    // 2. Executa a ação solicitada (add / remove)
    if (action === 'add') {
      console.log(`Adicionando novo domínio na Vercel: ${domain}`)
      const response = await fetch(`${VERCEL_API_URL}/v9/projects/${projectId}/domains`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: domain }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Se o domínio já existir no projeto, não consideramos um erro impeditivo
        if (data.error?.code === 'domain_already_in_use') {
          return NextResponse.json({ success: true, message: 'Domínio já configurado no projeto.' })
        }
        throw new Error(data.error?.message || 'Erro ao adicionar domínio na Vercel')
      }

      return NextResponse.json({ success: true, data })
    } else if (action === 'remove') {
      console.log(`Removendo domínio da Vercel: ${domain}`)
      const response = await fetch(`${VERCEL_API_URL}/v9/projects/${projectId}/domains/${domain}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        // Se o domínio não estiver cadastrado no projeto, consideramos a remoção um sucesso
        if (response.status === 404 || data.error?.code === 'not_found') {
          return NextResponse.json({ success: true, message: 'Domínio não estava cadastrado no projeto Vercel.' })
        }
        throw new Error(data.error?.message || 'Erro ao remover domínio na Vercel')
      }

      return NextResponse.json({ success: true, data })
    }

    return NextResponse.json({ error: 'Ação inválida.' }, { status: 400 })
  } catch (error: any) {
    console.error('Erro na rota de domínios:', error.message)
    return NextResponse.json({ error: error.message || 'Erro interno do servidor.' }, { status: 500 })
  }
}
