import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/emailService'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { storeId, email, customConfig } = await req.json()

    if (!email) {
      return NextResponse.json({ success: false, message: 'Informe um endereço de e-mail válido para o teste.' }, { status: 400 })
    }

    let storeName = 'Sua Loja'
    if (storeId) {
      const { data: store } = await supabase.from('stores').select('name').eq('id', storeId).single()
      if (store?.name) storeName = store.name
    }

    const testHtml = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="margin: 0; padding: 20px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 550px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          <div style="width: 60px; height: 60px; border-radius: 50%; background-color: #dcfce7; color: #16a34a; font-size: 30px; line-height: 60px; margin: 0 auto 16px;">
            ✓
          </div>
          <h2 style="margin: 0 0 8px 0; color: #1e293b; font-size: 22px; font-weight: 800;">E-mail de Teste Bem-sucedido!</h2>
          <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
            As notificações por e-mail da loja <strong>${storeName}</strong> estão configuradas e funcionando perfeitamente!
          </p>
          <div style="background-color: #f1f5f9; border-radius: 10px; padding: 14px; font-size: 13px; color: #334155; text-align: left; margin-bottom: 24px;">
            📌 <strong>O que acontece agora:</strong> Toda vez que um cliente concluir um pedido ou realizar um pagamento na sua loja, um aviso detalhado com os produtos, valor e dados do comprador será enviado para este endereço de e-mail.
          </div>
          <div style="font-size: 12px; color: #94a3b8;">
            Disparado via Painel Administrativo de ${storeName}.
          </div>
        </div>
      </body>
      </html>
    `

    const result = await sendEmail({
      to: email,
      subject: `🔔 Teste de Notificação - ${storeName}`,
      html: testHtml,
      customConfig
    })

    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Erro interno ao processar teste.' }, { status: 500 })
  }
}
