import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function GET() {
  const supabase = createClient(supabaseUrl, serviceRoleKey)
  try {
    const { data: nailaProducts } = await supabase
      .from('products')
      .select('id, name, store_id')
      .eq('store_id', '9373dc38-9ade-44bf-abeb-54347c220dae')

    const { data: allProducts } = await supabase
      .from('products')
      .select('id, name, store_id')

    return NextResponse.json({
      nailaProducts,
      allProductsCount: allProducts?.length,
      allProducts
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message })
  }
}
