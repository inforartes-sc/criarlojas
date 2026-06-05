import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Inicializar cliente do Supabase com Service Role Key para contornar RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function POST(request: Request) {
  try {
    const { invoiceId, storeId, amount, description, isCustom } = await request.json()

    if (!invoiceId || !storeId || !amount) {
      return NextResponse.json({ error: 'Parâmetros insuficientes para gerar a cobrança.' }, { status: 400 })
    }

    // 1. Buscar as configurações de gateway do Super Admin (platform-settings)
    const { data: platformData, error: platformError } = await supabaseAdmin
      .from('stores')
      .select('settings')
      .eq('subdomain', 'platform-settings')
      .single()

    if (platformError || !platformData) {
      throw new Error('Configuração do Super Admin não encontrada.')
    }

    const gatewayConfig = platformData.settings?.gatewayConfig || {}
    const activeGateway = gatewayConfig.activeGateway || 'asaas'
    const apiKey = gatewayConfig.apiKey
    const sandboxMode = gatewayConfig.sandboxMode !== false

    if (!apiKey) {
      return NextResponse.json(
        { error: `Credenciais do gateway ${activeGateway.toUpperCase()} não foram configuradas pelo Super Admin.` },
        { status: 500 }
      )
    }

    // 2. Buscar informações do lojista (email, nome, domínio) para o cadastro do cliente no gateway
    const { data: storeData, error: storeError } = await supabaseAdmin
      .from('stores')
      .select('name, subdomain, custom_domain, settings')
      .eq('id', storeId)
      .single()

    if (storeError || !storeData) {
      throw new Error('Loja correspondente à fatura não encontrada.')
    }

    const storeEmail = storeData.settings?.email || storeData.settings?.admin_user || `financeiro-${storeData.subdomain}@criarlojas.com.br`
    const storeName = storeData.name || `Loja ${storeData.subdomain}`
    const storeDomain = storeData.custom_domain || `${storeData.subdomain}.criarlojas.com.br`

    // URL de retorno após o lojista concluir o pagamento
    const returnUrl = `https://${storeDomain}/admin/subscription`

    // Define a referência externa combinando storeId e invoiceId se for fatura de assinatura
    const externalRef = isCustom ? invoiceId : `${storeId}:${invoiceId}`

    // 3. Gerar a cobrança no gateway ativo
    if (activeGateway === 'mercadopago') {
      const mpUrl = 'https://api.mercadopago.com/checkout/preferences'
      
      const payload = {
        items: [
          {
            id: invoiceId,
            title: description || `Mensalidade Criar Lojas - Fatura ${invoiceId}`,
            quantity: 1,
            unit_price: Number(amount),
            currency_id: 'BRL'
          }
        ],
        payer: {
          email: storeEmail
        },
        back_urls: {
          success: returnUrl,
          failure: returnUrl,
          pending: returnUrl
        },
        auto_return: 'approved',
        external_reference: externalRef,
      }

      console.log('Criando preference no Mercado Pago:', externalRef)
      const res = await fetch(mpUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Erro na API do Mercado Pago')
      }

      // Devolve o link de checkout correto dependendo do modo sandbox
      const checkoutUrl = sandboxMode ? data.sandbox_init_point : data.init_point
      return NextResponse.json({ success: true, checkoutUrl })

    } else if (activeGateway === 'asaas') {
      const baseUrl = sandboxMode ? 'https://sandbox.asaas.com/api/v3' : 'https://api.asaas.com/v3'
      
      // A. Cadastrar ou buscar cliente no Asaas
      console.log('Buscando/Criando cliente no Asaas:', storeEmail)
      const customerRes = await fetch(`${baseUrl}/customers?email=${storeEmail}`, {
        method: 'GET',
        headers: {
          access_token: apiKey,
          'Content-Type': 'application/json'
        }
      })

      let customerId = ''
      if (customerRes.ok) {
        const customerData = await customerRes.json()
        if (customerData.data?.length > 0) {
          customerId = customerData.data[0].id
        }
      }

      if (!customerId) {
        const newCustomerRes = await fetch(`${baseUrl}/customers`, {
          method: 'POST',
          headers: {
            access_token: apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: storeName,
            email: storeEmail,
            notificationDisabled: true
          })
        })

        const newCustomer = await newCustomerRes.json()
        if (!newCustomerRes.ok) {
          throw new Error(newCustomer.errors?.[0]?.description || 'Erro ao criar cliente no Asaas')
        }
        customerId = newCustomer.id
      }

      // Data de vencimento da fatura da Asaas (colocamos vencimento em 3 dias)
      const due = new Date()
      due.setDate(due.getDate() + 3)
      const dueDateStr = due.toISOString().split('T')[0]

      // B. Criar a cobrança do tipo UNDEFINED (permite cartão, boleto ou PIX)
      const paymentPayload = {
        customer: customerId,
        billingType: 'UNDEFINED',
        value: Number(amount),
        dueDate: dueDateStr,
        description: description || `Assinatura Plataforma - ${invoiceId}`,
        externalReference: externalRef
      }

      console.log('Criando cobrança no Asaas:', invoiceId)
      const paymentRes = await fetch(`${baseUrl}/payments`, {
        method: 'POST',
        headers: {
          access_token: apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentPayload)
      })

      const paymentData = await paymentRes.json()

      if (!paymentRes.ok) {
        throw new Error(paymentData.errors?.[0]?.description || 'Erro ao criar cobrança no Asaas')
      }

      // Retorna a URL da fatura hospedada da Asaas
      return NextResponse.json({ success: true, checkoutUrl: paymentData.invoiceUrl })
    }

    return NextResponse.json({ error: 'Gateway de faturamento inválido ou não suportado.' }, { status: 400 })
  } catch (error: any) {
    console.error('Erro na criação de cobrança:', error.message)
    return NextResponse.json({ error: error.message || 'Erro interno do servidor.' }, { status: 500 })
  }
}
