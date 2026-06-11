import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function POST(request: Request) {
  try {
    const { invoiceId } = await request.json()

    if (!invoiceId) {
      return NextResponse.json({ error: 'ID da fatura não informado.' }, { status: 400 })
    }

    // 1. Buscar a fatura avulsa
    const { data: invoice, error: invoiceErr } = await supabaseAdmin
      .from('custom_invoices')
      .select('*, stores(id, name, subdomain, custom_domain, settings)')
      .eq('id', invoiceId)
      .single()

    if (invoiceErr || !invoice) {
      return NextResponse.json({ error: 'Fatura não encontrada.' }, { status: 404 })
    }

    const store = (invoice as any).stores
    const gateways = store?.settings?.payment_gateways || {}
    const mpConfig = gateways.mercadopago

    if (!mpConfig || !mpConfig.active || !mpConfig.access_token) {
      return NextResponse.json({ error: 'O Mercado Pago não está ativo ou configurado nesta loja.' }, { status: 400 })
    }

    // 2. Definir dados de retorno e payer
    const storeDomain = store.custom_domain || `${store.subdomain}.criarlojas.com.br`
    const returnUrl = `https://${storeDomain}/stores/${store.subdomain}/fatura/${invoiceId}`

    const mpUrl = 'https://api.mercadopago.com/checkout/preferences'
    const payload = {
      items: [
        {
          id: invoiceId,
          title: invoice.title || 'Cobrança de Prestação de Serviços',
          description: invoice.description || 'Fatura avulsa gerada no sistema.',
          quantity: 1,
          unit_price: Number(invoice.amount),
          currency_id: 'BRL'
        }
      ],
      back_urls: {
        success: returnUrl,
        failure: returnUrl,
        pending: returnUrl
      },
      auto_return: 'approved',
      external_reference: invoiceId, // Apenas o ID da fatura avulsa
    }

    const res = await fetch(mpUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${mpConfig.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || 'Erro na API do Mercado Pago do lojista.')
    }

    // Usa o link de sandbox ou live baseado na configuração do lojista
    const checkoutUrl = mpConfig.mode === 'sandbox' ? data.sandbox_init_point : data.init_point
    return NextResponse.json({ success: true, checkoutUrl })

  } catch (error: any) {
    console.error('Erro ao gerar cobrança do lojista:', error.message)
    return NextResponse.json({ error: error.message || 'Erro interno do servidor.' }, { status: 500 })
  }
}
