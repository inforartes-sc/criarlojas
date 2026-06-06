// Cleaned up debug endpoint
import { NextResponse } from 'next/server'
export async function GET() {
  return NextResponse.json({ status: 'done' })
}
