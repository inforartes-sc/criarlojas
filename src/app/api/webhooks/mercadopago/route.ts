import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Inicializar cliente do Supabase com Service Role Key para contornar RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function POST(request: Request) {
  try {
    const url = new URL(request.url)
    const body = await request.json()

    // O ID do pagamento pode vir em query params (?data.id) ou no corpo
    const paymentId = body.data?.id || url.searchParams.get('data.id')
    const action = body.action || url.searchParams.get('action')

    if (!paymentId) {
      console.log('Notificação do Mercado Pago sem ID de pagamento, ignorando.')
      return NextResponse.json({ received: true })
    }

    console.log(`Recebida notificação do Mercado Pago: Pagamento ${paymentId}, Ação ${action}`)

    // 1. Obter a chave de acesso do Mercado Pago (do platform-settings)
    const { data: platformData, error: platformError } = await supabaseAdmin
      .from('stores')
      .select('settings')
      .eq('subdomain', 'platform-settings')
      .single()

    if (platformError || !platformData) {
      throw new Error('Configuração do Super Admin não encontrada para processar o webhook.')
    }

    const token = platformData.settings?.gatewayConfig?.apiKey

    if (!token) {
      throw new Error('Token do Mercado Pago não configurado no Super Admin.')
    }

    // 2. Buscar detalhes do pagamento diretamente na API do Mercado Pago
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!mpRes.ok) {
      throw new Error(`Erro ao consultar pagamento ${paymentId} na API do Mercado Pago.`)
    }

    const payment = await mpRes.json()

    // 3. Verificar se o status é aprovado
    if (payment.status === 'approved') {
      const externalReference = payment.external_reference

      if (!externalReference) {
        console.log(`Pagamento ${paymentId} aprovado, mas sem external_reference. Ignorando.`)
        return NextResponse.json({ received: true })
      }

      const nowStr = new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

      // A. Verificar se é uma fatura avulsa (UUID ou ID inteiro sem dois-pontos ':')
      if (!externalReference.includes(':')) {
        const customInvoiceId = externalReference
        console.log(`Baixa de fatura avulsa confirmada via Mercado Pago: ID ${customInvoiceId}`)

        const { error: updateError } = await supabaseAdmin
          .from('custom_invoices')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
            payment_method: 'Mercado Pago'
          })
          .eq('id', customInvoiceId)

        if (updateError) throw updateError
      } 
      // B. Se for fatura de mensalidade padrão (formato "storeId:invoiceId")
      else {
        const [storeId, invoiceId] = externalReference.split(':')
        console.log(`Baixa de mensalidade confirmada via Mercado Pago: Loja ${storeId}, Fatura ${invoiceId}`)

        // Buscar as configurações atuais da loja para não sobrescrever outros campos do settings
        const { data: storeData, error: storeFetchError } = await supabaseAdmin
          .from('stores')
          .select('settings')
          .eq('id', storeId)
          .single()

        if (storeFetchError || !storeData) {
          throw new Error(`Loja ${storeId} não encontrada para registrar a baixa da fatura.`)
        }

        const currentSettings = storeData.settings || {}
        const currentPaid = currentSettings.paid_invoices || {}

        const updatedSettings = {
          ...currentSettings,
          paid_invoices: {
            ...currentPaid,
            [invoiceId]: {
              paidAt: nowStr,
              paymentMethod: 'Mercado Pago'
            }
          }
        }

        const { error: updateError } = await supabaseAdmin
          .from('stores')
          .update({ settings: updatedSettings })
          .eq('id', storeId)

        if (updateError) throw updateError
      }
    } else {
      console.log(`Pagamento ${paymentId} recebido com status: ${payment.status}. Baixa não executada.`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Erro no webhook do Mercado Pago:', error.message)
    // Retornamos 200/201 mesmo em caso de erro interno para evitar retentativas infinitas do Mercado Pago
    return NextResponse.json({ error: error.message }, { status: 200 })
  }
}
