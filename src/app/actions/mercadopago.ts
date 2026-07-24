"use server"

import { getAdminSupabase } from '@/lib/supabase'

export async function processMercadoPagoPaymentAction({
  storeId,
  formData,
  customerData,
  finalTotal,
  cartItems,
  appliedCouponCode,
  abandonedCartId
}: {
  storeId: string
  formData: any
  customerData: {
    name: string
    email: string
    phone: string
    address: string
  }
  finalTotal: number
  cartItems: any[]
  appliedCouponCode: string | null
  abandonedCartId?: string | null
}) {
  const supabase = getAdminSupabase()

  try {
    // 1. Fetch store settings to get Access Token
    const { data: store, error: storeErr } = await supabase
      .from('stores')
      .select('settings, name')
      .eq('id', storeId)
      .single()

    if (storeErr || !store) {
      throw new Error('Loja não encontrada para processar pagamento.')
    }

    const mpSettings = store.settings?.payment_gateways?.mercadopago
    if (!mpSettings || !mpSettings.active || !mpSettings.access_token) {
      throw new Error('Gateway do Mercado Pago não está configurado nesta loja.')
    }

    const accessToken = mpSettings.access_token.trim()

    // 2. Prepare payload for Mercado Pago /v1/payments
    const paymentPayload: any = {
      transaction_amount: Number(finalTotal.toFixed(2)),
      description: `Compra na loja ${store.name || 'Virtual'}`,
      payment_method_id: formData.payment_method_id,
      payer: {
        email: customerData.email,
        first_name: customerData.name.split(' ')[0] || customerData.name,
        last_name: customerData.name.split(' ').slice(1).join(' ') || '',
        phone: {
          area_code: customerData.phone.replace(/\D/g, '').slice(0, 2) || '11',
          number: customerData.phone.replace(/\D/g, '').slice(2) || '999999999'
        }
      }
    }

    if (formData.token) {
      paymentPayload.token = formData.token
    }

    if (formData.installments) {
      paymentPayload.installments = Number(formData.installments)
    }

    if (formData.issuer_id) {
      paymentPayload.issuer_id = formData.issuer_id
    }

    if (formData.payer?.identification) {
      paymentPayload.payer.identification = formData.payer.identification
    }

    // 3. Make request to Mercado Pago API
    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-Idempotency-Key': `${storeId}-${Date.now()}`
      },
      body: JSON.stringify(paymentPayload)
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('Erro no Mercado Pago API:', result)
      const errorMsg = result.cause?.[0]?.description || result.message || 'Erro ao processar pagamento junto ao Mercado Pago.'
      throw new Error(errorMsg)
    }

    // 4. Determine status based on Mercado Pago response
    let statusStr = `Mercado Pago (${result.status})`
    if (result.status === 'approved') {
      statusStr = 'pago (Mercado Pago)'
    } else if (result.status === 'pending' || result.status === 'in_process') {
      statusStr = `pendente (Mercado Pago - ${result.payment_method_id})`
    } else if (result.status === 'rejected') {
      throw new Error('Pagamento recusado pela operadora do cartão. Verifique os dados e tente novamente.')
    }

    if (customerData.address) {
      statusStr += ` | Endereço: ${customerData.address.trim()}`
    }

    // 5. Create Customer in DB if needed
    let customerId = null
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', customerData.email.trim())
      .maybeSingle()

    if (existingCustomer) {
      customerId = existingCustomer.id
      await supabase.from('customers').update({
        name: customerData.name.trim(),
        phone: customerData.phone.trim()
      }).eq('id', customerId)
    } else {
      const { data: newCustomer, error: customerErr } = await supabase
        .from('customers')
        .insert({
          name: customerData.name.trim(),
          email: customerData.email.trim(),
          phone: customerData.phone.trim(),
          store_id: storeId
        })
        .select()
        .single()

      if (!customerErr && newCustomer) {
        customerId = newCustomer.id
      }
    }

    // 6. Create Order in Supabase
    const { data: orderObj, error: orderErr } = await supabase
      .from('orders')
      .insert({
        store_id: storeId,
        customer_id: customerId,
        total_amount: finalTotal,
        status: statusStr,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (orderErr) throw new Error(`Erro ao registrar pedido: ${orderErr.message}`)

    // 7. Order Items
    const itemsData = cartItems.map(item => ({
      order_id: orderObj.id,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price
    }))

    await supabase.from('order_items').insert(itemsData)

    // 8. Coupon usage
    if (appliedCouponCode) {
      if (store.settings) {
        const settings = store.settings
        let updatedCoupons = null
        let path = ''

        if (settings.promotions?.coupons) {
          path = 'promotions'
          updatedCoupons = settings.promotions.coupons.map((c: any) => {
            if (c.code.toUpperCase() === appliedCouponCode.toUpperCase()) {
              return { ...c, used: (c.used || 0) + 1 }
            }
            return c
          })
        } else if (settings.coupons) {
          path = 'direct'
          updatedCoupons = settings.coupons.map((c: any) => {
            if (c.code.toUpperCase() === appliedCouponCode.toUpperCase()) {
              return { ...c, used: (c.used || 0) + 1 }
            }
            return c
          })
        }

        if (updatedCoupons) {
          const newSettings = { ...settings }
          if (path === 'promotions') {
            newSettings.promotions = { ...settings.promotions, coupons: updatedCoupons }
          } else {
            newSettings.coupons = updatedCoupons
          }
          await supabase.from('stores').update({ settings: newSettings }).eq('id', storeId)
        }
      }
    }

    // 9. Abandoned cart
    if (abandonedCartId) {
      await supabase.from('abandoned_carts').update({ recovered: true }).eq('id', abandonedCartId)
    }

    // Extract Pix / Ticket details if present
    let qrCode = null
    let qrCodeBase64 = null
    let ticketUrl = null

    if (result.point_of_interaction?.transaction_data) {
      qrCode = result.point_of_interaction.transaction_data.qr_code
      qrCodeBase64 = result.point_of_interaction.transaction_data.qr_code_base64
      ticketUrl = result.point_of_interaction.transaction_data.ticket_url
    } else if (result.transaction_details?.external_resource_url) {
      ticketUrl = result.transaction_details.external_resource_url
    }

    return {
      success: true,
      status: result.status,
      paymentId: result.id,
      qrCode,
      qrCodeBase64,
      ticketUrl,
      order: orderObj
    }

  } catch (err: any) {
    console.error('Mercado Pago Server Action Error:', err)
    return {
      success: false,
      error: err.message || 'Erro ao processar pagamento no Mercado Pago'
    }
  }
}
