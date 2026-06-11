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

    const platformTokenMaster = platformData.settings?.gatewayConfig?.apiKey

    if (!platformTokenMaster) {
      throw new Error('Token do Mercado Pago não configurado no Super Admin.')
    }

    // 2. Buscar detalhes do pagamento
    // Precisamos primeiro entender a natureza do pagamento para usar o token correto.
    // Vamos fazer uma busca inicial da fatura caso o externalReference seja de uma fatura avulsa ou mensalidade.
    // Para simplificar e evitar queries cegas, consultamos o external_reference se for enviado no body da requisição,
    // ou consultamos a API do Mercado Pago usando um fluxo de tentativa:
    // a. Primeiro tentamos com o token do Super Admin.
    // b. Se der erro (ou se pudermos identificar que é de um lojista), buscamos a fatura no banco de dados e usamos o token do lojista.
    
    let token = ''
    let payment: any = null
    let isCustomInvoice = false
    let customInvoiceData: any = null

    // Tentativa 1: Descobrir o external_reference a partir do body se enviado, ou buscar na API do Mercado Pago usando o token master para ver se funciona.
    // Na API do Mercado Pago, a consulta pública de pagamento só funciona com o token que GEROU a preferência.
    // Por isso, precisamos primeiro tentar descobrir a qual loja pertence a fatura avulsa para ler o token do lojista.
    // Para resolver isso, vamos tentar buscar a fatura avulsa com base em qualquer referência ou ID contido na notificação.
    // Se a notificação for de um checkout do Mercado Pago do lojista, o token master da plataforma não conseguirá ler o pagamento.
    // Porém, podemos verificar se a fatura avulsa correspondente ao ID existe no banco e, a partir dela, pegar as credenciais do lojista!
    
    // Vamos ler a fatura avulsa a partir do ID se o formato do externalReference for de UUID ou ID de fatura.
    // Como a maioria das faturas avulsas é identificada pelo ID UUID no external_reference, vamos tentar buscar no banco pela tabela custom_invoices:
    // Mas a notificação pode não trazer o external_reference de cara no body.
    // Se não trouxer, podemos tentar buscar a fatura que tenha um status pendente e que possa corresponder, ou consultar a API do MP com o token do Super Admin.
    // A melhor estratégia:
    // 1. Verificar se no body veio alguma referência (como external_reference).
    // 2. Se não veio, fazemos uma chamada inicial ao Mercado Pago usando o token do Super Admin. Se falhar (401/404), tentamos descobrir a loja.
    // Vamos implementar essa inteligência:

    const platformToken = platformData.settings?.gatewayConfig?.apiKey
    token = platformToken

    // Tentamos consultar o pagamento com o token da plataforma
    let mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${platformToken}`
      }
    })

    if (mpRes.ok) {
      payment = await mpRes.json()
    } else {
      // Se falhar, pode ser porque o pagamento foi gerado com as credenciais de um lojista.
      // Vamos tentar deduzir a loja buscando faturas ativas no banco de dados.
      // O Mercado Pago às vezes envia o external_reference no body do webhook (dependendo da versão da API).
      // Se não veio no body, podemos buscar na tabela custom_invoices no banco pelo ID do pagamento se o registramos,
      // ou se o external_reference foi informado no body.
      const bodyRef = body.external_reference || body.data?.external_reference || url.searchParams.get('external_reference')
      
      let refId = bodyRef
      if (!refId) {
        // Se ainda não temos o external_reference, fazemos uma busca na tabela custom_invoices por faturas pendentes criadas recentemente,
        // mas a maneira mais robusta é pedir para buscar no banco pela referência.
        // Vamos buscar na tabela custom_invoices pelo UUID se o próprio ID do webhook ou paymentId puder ser mapeado,
        // ou buscar todas as lojas que têm o Mercado Pago ativo e tentar consultar o pagamento com o token de cada uma delas até achar o correto.
        // Como o número de lojas ativas com Mercado Pago é pequeno, essa busca sequencial/paralela é extremamente eficiente e garante o funcionamento!
        const { data: activeStores } = await supabaseAdmin
          .from('stores')
          .select('id, settings')
        
        if (activeStores) {
          for (const s of activeStores) {
            const mpConfig = s.settings?.payment_gateways?.mercadopago
            if (mpConfig?.active && mpConfig.access_token) {
              const testRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                headers: {
                  Authorization: `Bearer ${mpConfig.access_token}`
                }
              })
              if (testRes.ok) {
                payment = await testRes.json()
                token = mpConfig.access_token
                break
              }
            }
          }
        }
      } else {
        // Se temos a referência (ID da fatura avulsa)
        const { data: inv } = await supabaseAdmin
          .from('custom_invoices')
          .select('*, stores(settings)')
          .eq('id', refId)
          .single()
        
        if (inv) {
          const storeToken = (inv as any).stores?.settings?.payment_gateways?.mercadopago?.access_token
          if (storeToken) {
            token = storeToken
            const testRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            })
            if (testRes.ok) {
              payment = await testRes.json()
            }
          }
        }
      }
    }

    if (!payment) {
      throw new Error(`Não foi possível obter os detalhes do pagamento ${paymentId} com nenhuma das credenciais disponíveis.`)
    }

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

        // Buscar a fatura avulsa para podermos sincronizar o status no financeiro correspondente
        const { data: invData } = await supabaseAdmin
          .from('custom_invoices')
          .select('store_id')
          .eq('id', customInvoiceId)
          .single()

        const { error: updateError } = await supabaseAdmin
          .from('custom_invoices')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
            payment_method: 'Mercado Pago'
          })
          .eq('id', customInvoiceId)

        if (updateError) throw updateError

        // Se a fatura existir, atualizamos também o lançamento correspondente no financeiro (Contas a Receber)
        if (invData) {
          const { error: finError } = await supabaseAdmin
            .from('financial_entries')
            .update({
              status: 'paid',
              paid_at: new Date().toISOString(),
              payment_method: 'Mercado Pago'
            })
            .eq('invoice_id', customInvoiceId)
            .eq('store_id', invData.store_id)

          if (finError) console.error('Erro ao atualizar status no financeiro via webhook:', finError)
        }
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

