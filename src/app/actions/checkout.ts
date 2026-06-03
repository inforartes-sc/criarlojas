"use server"

import { getAdminSupabase } from '@/lib/supabase'

export async function processCheckoutAction({
  storeId,
  name,
  email,
  phone,
  address,
  paymentMethod,
  finalTotal,
  cartItems,
  appliedCouponCode
}: {
  storeId: string
  name: string
  email: string
  phone: string
  address: string
  paymentMethod: string
  finalTotal: number
  cartItems: any[]
  appliedCouponCode: string | null
}) {
  const supabase = getAdminSupabase()

  try {
    // 1. Check or Create Customer
    let customerId = null
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', email.trim())
      .maybeSingle()

    if (existingCustomer) {
      customerId = existingCustomer.id
      await supabase.from('customers').update({
        name: name.trim(),
        phone: phone.trim()
      }).eq('id', customerId)
    } else {
      const { data: newCustomer, error: customerErr } = await supabase
        .from('customers')
        .insert({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          store_id: storeId
        })
        .select()
        .single()

      if (customerErr) throw new Error(`Erro ao criar cliente: ${JSON.stringify(customerErr)}`)
      customerId = newCustomer.id
    }

    // 2. Create Order
    let statusStr = paymentMethod === 'pix' || paymentMethod === 'card' ? 'pago' : 'pendente'
    if (paymentMethod === 'whatsapp') statusStr = 'pendente (WhatsApp)'
    else if (paymentMethod === 'pix') statusStr = 'pago (Pix)'
    else if (paymentMethod === 'card') statusStr = 'pago (Cartão)'
    else if (paymentMethod === 'boleto') statusStr = 'pendente (Boleto)'

    if (address) {
      statusStr += ` | Endereço: ${address.trim()}`
    }

    const orderData = {
      store_id: storeId,
      customer_id: customerId,
      total_amount: finalTotal,
      status: statusStr,
      created_at: new Date().toISOString()
    }

    const { data: orderObj, error: orderErr } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (orderErr) throw new Error(`Erro ao criar pedido: ${JSON.stringify(orderErr)}`)

    // 3. Create Order Items
    const itemsData = cartItems.map(item => ({
      order_id: orderObj.id,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price
    }))

    const { error: itemsErr } = await supabase.from('order_items').insert(itemsData)
    if (itemsErr) throw new Error(`Erro ao criar itens do pedido: ${JSON.stringify(itemsErr)}`)

    // 4. Update Coupon Usage if applicable
    if (appliedCouponCode) {
      const { data: storeData } = await supabase.from('stores').select('settings').eq('id', storeId).single()
      if (storeData && storeData.settings && storeData.settings.coupons) {
        const updatedCoupons = storeData.settings.coupons.map((c: any) => {
          if (c.code.toUpperCase() === appliedCouponCode.toUpperCase()) {
            return { ...c, used: (c.used || 0) + 1 }
          }
          return c
        })
        await supabase.from('stores').update({ settings: { ...storeData.settings, coupons: updatedCoupons } }).eq('id', storeId)
      }
    }

    return { success: true, order: orderObj }
  } catch (error: any) {
    console.error('Server Action Checkout Error:', error)
    return { success: false, error: error.message || 'Erro desconhecido ao processar pedido' }
  }
}
