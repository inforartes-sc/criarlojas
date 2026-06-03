"use server"

import { getAdminSupabase } from '@/lib/supabase'

export async function loginCustomerAction(email: string) {
  const supabase = getAdminSupabase()
  try {
    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('email', email.trim())
      .maybeSingle()

    if (error) throw error

    if (!customer) {
      return { success: false, found: false }
    }

    return { success: true, found: true, customer }
  } catch (error: any) {
    console.error('Login Action Error:', error)
    return { success: false, error: error.message || 'Erro ao buscar conta no servidor.' }
  }
}

export async function updateCustomerPasswordAction(customerId: string, password: string) {
  const supabase = getAdminSupabase()
  try {
    const { error } = await supabase
      .from('customers')
      .update({ password: password.trim() })
      .eq('id', customerId)

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error('Update Password Action Error:', error)
    return { success: false, error: error.message || 'Erro ao atualizar senha no servidor.' }
  }
}

export async function updateCustomerProfileAction({
  customerId, name, email, phone, cep, street, number, complement, neighborhood, city, state
}: {
  customerId: string, name: string, email: string, phone: string, cep?: string, street?: string, number?: string, complement?: string, neighborhood?: string, city?: string, state?: string
}) {
  const supabase = getAdminSupabase()
  try {
    const { data: updatedCustomer, error } = await supabase
      .from('customers')
      .update({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        cep: cep?.trim(),
        street: street?.trim(),
        number: number?.trim(),
        complement: complement?.trim(),
        neighborhood: neighborhood?.trim(),
        city: city?.trim(),
        state: state?.trim()
      })
      .eq('id', customerId)
      .select()
      .single()

    if (error) throw error

    return { success: true, customer: updatedCustomer }
  } catch (error: any) {
    console.error('Update Profile Action Error:', error)
    return { success: false, error: error.message || 'Erro ao atualizar dados no servidor.' }
  }
}

export async function registerCustomerAction({
  name, email, phone, password, storeId, cep, street, number, complement, neighborhood, city, state
}: {
  name: string, email: string, phone: string, password: string, storeId?: string, cep?: string, street?: string, number?: string, complement?: string, neighborhood?: string, city?: string, state?: string
}) {
  const supabase = getAdminSupabase()
  try {
    // Verifica se já existe
    const { data: existing } = await supabase
      .from('customers')
      .select('*')
      .eq('email', email.trim())
      .maybeSingle()

    if (existing) {
      return { success: true, existing: true, customer: existing }
    }

    // Cria novo cliente usando service_role (ignora RLS)
    const { data: newCustomer, error } = await supabase
      .from('customers')
      .insert({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password: password.trim(),
        store_id: storeId,
        cep: cep?.trim(),
        street: street?.trim(),
        number: number?.trim(),
        complement: complement?.trim(),
        neighborhood: neighborhood?.trim(),
        city: city?.trim(),
        state: state?.trim()
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, existing: false, customer: newCustomer }
  } catch (error: any) {
    console.error('Register Action Error:', error)
    return { success: false, error: error.message || 'Erro ao realizar cadastro no servidor.' }
  }
}
