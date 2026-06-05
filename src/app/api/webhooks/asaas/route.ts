import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Inicializar cliente do Supabase com Service Role Key para contornar RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const event = body.event
    const payment = body.payment

    if (!event || !payment) {
      console.log('Notificação do Asaas inválida ou vazia, ignorando.')
      return NextResponse.json({ received: true })
    }

    console.log(`Recebida notificação do Asaas: Evento ${event}, Cobrança ${payment.id}`)

    // 1. Verificar se o evento indica pagamento confirmado/recebido
    const isPaymentConfirmed = ['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED'].includes(event)

    if (isPaymentConfirmed) {
      const externalReference = payment.externalReference

      if (!externalReference) {
        console.log(`Cobrança ${payment.id} confirmada, mas sem externalReference. Ignorando.`)
        return NextResponse.json({ received: true })
      }

      const nowStr = new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

      // A. Verificar se é uma fatura avulsa (UUID ou ID inteiro sem dois-pontos ':')
      if (!externalReference.includes(':')) {
        const customInvoiceId = externalReference
        console.log(`Baixa de fatura avulsa confirmada via Asaas: ID ${customInvoiceId}`)

        const { error: updateError } = await supabaseAdmin
          .from('custom_invoices')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
            payment_method: 'Asaas'
          })
          .eq('id', customInvoiceId)

        if (updateError) throw updateError
      } 
      // B. Se for fatura de mensalidade padrão (formato "storeId:invoiceId")
      else {
        const [storeId, invoiceId] = externalReference.split(':')
        console.log(`Baixa de mensalidade confirmada via Asaas: Loja ${storeId}, Fatura ${invoiceId}`)

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
              paymentMethod: 'Asaas'
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
      console.log(`Evento ${event} recebido para cobrança ${payment.id}. Baixa não executada.`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Erro no webhook do Asaas:', error.message)
    // Retornamos status 200 para evitar que o Asaas continue reenviando em loop
    return NextResponse.json({ error: error.message }, { status: 200 })
  }
}
