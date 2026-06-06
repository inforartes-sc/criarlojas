// Arquivo temporário de migração limpo.
import { NextResponse } from 'next/server'
export async function GET() {
  return NextResponse.json({ message: 'Sync finalizado' })
}
