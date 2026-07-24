import { NextResponse } from 'next/server'
import fs from 'fs'

export async function GET() {
  const src = 'C:\\Users\\olzen\\.gemini\\antigravity-ide\\brain\\2f9bec8b-5665-4758-ad3d-f60f2feefe98\\hero_clean_mockup_1784379431236.png'
  const dest = 'f:\\DADOS\\CURSO SITE\\MARKETING DIGITAL\\APP\\LOJA_VIRTUAL\\public\\hero_devices_mockup.png'
  
  try {
    fs.copyFileSync(src, dest)
    return NextResponse.json({ success: true, message: 'Image copied successfully' })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message })
  }
}
