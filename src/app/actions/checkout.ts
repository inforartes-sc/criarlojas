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
  appliedCouponCode,
  abandonedCartId
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
  abandonedCartId?: string | null
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
      if (storeData && storeData.settings) {
        const settings = storeData.settings
        let updatedCoupons = null
        let path = ''

        if (settings.promotions && settings.promotions.coupons) {
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

    // 5. Mark abandoned cart as recovered if applicable
    if (abandonedCartId) {
      await supabase.from('abandoned_carts').update({ recovered: true }).eq('id', abandonedCartId)
    }

    return { success: true, order: orderObj }
  } catch (error: any) {
    console.error('Server Action Checkout Error:', error)
    return { success: false, error: error.message || 'Erro desconhecido ao processar pedido' }
  }
}

export async function saveAbandonedCartAction({
  id,
  storeId,
  name,
  email,
  phone,
  cartItems,
  totalAmount
}: {
  id?: string | null
  storeId: string
  name: string
  email: string
  phone: string
  cartItems: any[]
  totalAmount: number
}) {
  const supabase = getAdminSupabase()
  try {
    const cartData = {
      customer_name: name.trim(),
      customer_email: email.trim(),
      customer_phone: phone.trim(),
      items: cartItems,
      total_amount: totalAmount,
    }

    if (id) {
      const { data, error } = await supabase
        .from('abandoned_carts')
        .update(cartData)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return { success: true, id: data.id }
    } else {
      const { data, error } = await supabase
        .from('abandoned_carts')
        .insert({
          store_id: storeId,
          ...cartData
        })
        .select()
        .single()
      if (error) throw error
      return { success: true, id: data.id }
    }
  } catch (error: any) {
    console.error('Error saving abandoned cart:', error)
    return { success: false, error: error.message }
  }
}
