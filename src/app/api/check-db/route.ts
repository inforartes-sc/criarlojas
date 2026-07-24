import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('id, name, subdomain, settings')
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const logPath = path.join(process.cwd(), 'scratch/output.txt')
    fs.writeFileSync(logPath, JSON.stringify(data, null, 2))
    
    return NextResponse.json({ success: true, count: data.length, path: logPath })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
