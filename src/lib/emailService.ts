import nodemailer from 'nodemailer'

export interface EmailConfig {
  provider?: 'resend' | 'brevo' | 'smtp'
  resend_api_key?: string
  resend_from?: string
  brevo_api_key?: string
  brevo_sender_email?: string
  brevo_sender_name?: string
  host?: string
  port?: number | string
  user?: string
  pass?: string
  from?: string
  secure?: boolean
}

export function getTransporter(customConfig?: EmailConfig) {
  const host = customConfig?.host || process.env.SMTP_HOST
  const port = Number(customConfig?.port || process.env.SMTP_PORT || 587)
  const user = customConfig?.user || process.env.SMTP_USER
  const pass = customConfig?.pass || process.env.SMTP_PASS
  const secure = customConfig?.secure !== undefined ? customConfig.secure : (port === 465)

  if (!host || !user || !pass) {
    return null
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    },
    tls: {
      rejectUnauthorized: false
    }
  })
}

export async function sendEmail({
  to,
  subject,
  html,
  customConfig
}: {
  to: string
  subject: string
  html: string
  customConfig?: EmailConfig
}): Promise<{ success: boolean; message: string }> {
  try {
    const provider = customConfig?.provider || 
      (customConfig?.brevo_api_key ? 'brevo' : (customConfig?.resend_api_key ? 'resend' : 'smtp'))

    // 1. Provedor Brevo API (Sendinblue - 300 e-mails/dia grátis)
    const brevoKey = (customConfig?.brevo_api_key || process.env.BREVO_API_KEY || '').trim()
    if (provider === 'brevo' || (brevoKey && !customConfig?.resend_api_key && !customConfig?.host)) {
      if (!brevoKey) {
        return { success: false, message: 'Chave de API do Brevo não configurada. Cole sua chave xkeysib-... no painel.' }
      }

      const senderEmail = (customConfig?.brevo_sender_email || process.env.BREVO_SENDER_EMAIL || customConfig?.from || '').trim()
      if (!senderEmail) {
        return { 
          success: false, 
          message: 'E-mail remetente do Brevo não informado. Insira o e-mail cadastrado ou domínio validado na sua conta Brevo.' 
        }
      }

      const senderName = customConfig?.brevo_sender_name?.trim() || 'Notificações da Loja'

      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': brevoKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: {
            name: senderName,
            email: senderEmail
          },
          to: [
            { email: to.trim() }
          ],
          subject,
          htmlContent: html
        })
      })

      const data = await res.json()
      if (!res.ok) {
        const errorMsg = data?.message || data?.error || JSON.stringify(data)
        throw new Error(errorMsg)
      }

      return { success: true, message: 'E-mail enviado com sucesso via Brevo API!' }
    }

    // 2. Provedor Resend API (3.000 e-mails/mês grátis)
    const resendKey = (customConfig?.resend_api_key || process.env.RESEND_API_KEY || '').trim()
    if (provider === 'resend' || (resendKey && !customConfig?.host)) {
      const fromAddress = customConfig?.resend_from?.trim() || customConfig?.from?.trim() || process.env.RESEND_FROM || 'Notificações de Pedidos <onboarding@resend.dev>'

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [to.trim()],
          subject,
          html
        })
      })

      const data = await res.json()
      if (!res.ok) {
        const errorMsg = data?.message || data?.error || JSON.stringify(data)
        throw new Error(errorMsg)
      }

      return { success: true, message: 'E-mail enviado com sucesso via Resend API!' }
    }

    // 3. Provedor SMTP Tradicional
    const transporter = getTransporter(customConfig)
    if (!transporter) {
      console.warn('[EmailService] Nenhum serviço de e-mail configurado (Brevo, Resend API Key ou SMTP).')
      return { 
        success: false, 
        message: 'Nenhum servidor de e-mail configurado. Selecione Brevo, Resend ou preencha os dados de Host SMTP no painel.' 
      }
    }

    const fromAddress = customConfig?.from || customConfig?.user || process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@criarlojas.com.br'

    await transporter.sendMail({
      from: `"Notificações da Loja" <${fromAddress}>`,
      to: to.trim(),
      subject,
      html
    })

    return { success: true, message: 'E-mail enviado com sucesso via SMTP!' }
  } catch (error: any) {
    console.error('[EmailService] Erro ao enviar e-mail:', error)
    return { success: false, message: error?.message || 'Erro ao enviar e-mail.' }
  }
}

export async function sendOrderNotificationToAdmin({
  store,
  order,
  customer,
  items,
  paymentMethod,
  address
}: {
  store: any
  order: any
  customer?: any
  items: any[]
  paymentMethod?: string
  address?: string
}) {
  try {
    const settings = store?.settings || {}
    
    // Verifica se notificações por e-mail estão desativadas
    if (settings.order_notifications_enabled === false) {
      return
    }

    // E-mail de destino (configurado pelo lojista ou fallback para o e-mail da loja)
    const destinationEmail = settings.order_notification_email || store?.email || settings.email
    if (!destinationEmail) {
      console.warn('[EmailService] Nenhum e-mail de notificação configurado para a loja:', store?.name)
      return
    }

    // Configurações personalizadas de e-mail da loja (Brevo, Resend ou SMTP)
    const customConfig: EmailConfig = {
      provider: settings.email_provider || (settings.brevo_api_key ? 'brevo' : (settings.resend_api_key ? 'resend' : 'smtp')),
      brevo_api_key: settings.brevo_api_key,
      brevo_sender_email: settings.brevo_sender_email,
      brevo_sender_name: settings.brevo_sender_name || store?.name,
      resend_api_key: settings.resend_api_key,
      resend_from: settings.resend_from,
      host: settings.smtp_host,
      port: settings.smtp_port,
      user: settings.smtp_user,
      pass: settings.smtp_pass,
      from: settings.smtp_from
    }

    const orderNumber = order?.order_number || order?.id?.slice(0, 8)?.toUpperCase() || 'NOVO'
    const totalFormatted = (Number(order?.total_amount) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    const storeName = store?.name || 'Sua Loja'
    const orderDate = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })

    const itemsHtml = (items || []).map((item: any) => {
      const name = item.name || item.product_name || `Produto ID: ${item.product_id || item.productId}`
      const qty = item.quantity || 1
      const price = (Number(item.price) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      const subtotal = ((Number(item.price) || 0) * qty).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      return `
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b;">
            <strong>${name}</strong>
          </td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; text-align: center; color: #64748b;">
            ${qty}x
          </td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; text-align: right; color: #1e293b;">
            ${price}
          </td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; text-align: right; font-weight: bold; color: #1e293b;">
            ${subtotal}
          </td>
        </tr>
      `
    }).join('')

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Novo Pedido Recebido</title>
      </head>
      <body style="margin: 0; padding: 20px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); padding: 30px 24px; text-align: center; color: #ffffff;">
            <div style="font-size: 32px; margin-bottom: 10px;">🛍️</div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Novo Pedido Recebido!</h1>
            <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">Pedido #${orderNumber} • ${storeName}</p>
          </div>

          <!-- Conteúdo -->
          <div style="padding: 24px;">
            
            <!-- Resumo Rápido -->
            <div style="background-color: #f1f5f9; border-radius: 12px; padding: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Valor Total</span>
                <div style="font-size: 24px; font-weight: 900; color: #16a34a; margin-top: 4px;">${totalFormatted}</div>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Data & Hora</span>
                <div style="font-size: 13px; font-weight: 600; color: #334155; margin-top: 4px;">${orderDate}</div>
              </div>
            </div>

            <!-- Dados do Cliente -->
            <div style="margin-bottom: 24px;">
              <h3 style="font-size: 14px; text-transform: uppercase; color: #475569; letter-spacing: 0.5px; margin: 0 0 12px 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 6px;">
                👤 Dados do Cliente
              </h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 6px 0; color: #64748b; width: 120px;">Nome:</td>
                  <td style="padding: 6px 0; color: #1e293b; font-weight: 600;">${customer?.name || 'Cliente não identificado'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">E-mail:</td>
                  <td style="padding: 6px 0; color: #1e293b;">${customer?.email || 'Não informado'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Telefone:</td>
                  <td style="padding: 6px 0; color: #1e293b;">${customer?.phone || 'Não informado'}</td>
                </tr>
                ${address ? `
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Endereço:</td>
                  <td style="padding: 6px 0; color: #1e293b;">${address}</td>
                </tr>
                ` : ''}
                ${paymentMethod ? `
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Pagamento:</td>
                  <td style="padding: 6px 0; color: #1e293b; text-transform: uppercase; font-weight: 600;">${paymentMethod}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            <!-- Itens do Pedido -->
            <div style="margin-bottom: 24px;">
              <h3 style="font-size: 14px; text-transform: uppercase; color: #475569; letter-spacing: 0.5px; margin: 0 0 12px 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 6px;">
                📦 Produtos Comprados
              </h3>
              <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
                <thead>
                  <tr style="background-color: #f8fafc;">
                    <th style="padding: 8px 12px; text-align: left; font-size: 12px; color: #64748b; text-transform: uppercase;">Item</th>
                    <th style="padding: 8px 12px; text-align: center; font-size: 12px; color: #64748b; text-transform: uppercase;">Qtd</th>
                    <th style="padding: 8px 12px; text-align: right; font-size: 12px; color: #64748b; text-transform: uppercase;">Preço</th>
                    <th style="padding: 8px 12px; text-align: right; font-size: 12px; color: #64748b; text-transform: uppercase;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>

            <!-- Rodapé da Mensagem -->
            <div style="text-align: center; padding-top: 16px; border-top: 1px solid #e2e8f0;">
              <p style="font-size: 13px; color: #64748b; margin: 0 0 16px 0;">
                Acesse o painel administrativo da sua loja para gerenciar o status e envio deste pedido.
              </p>
              <a href="https://${store?.subdomain ? `${store.subdomain}.criarlojas.com.br/admin/orders` : 'https://criarlojas.com.br/admin/orders'}" 
                 style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px;">
                Ver Pedido no Painel Admin →
              </a>
            </div>

          </div>

          <!-- Footer cinza -->
          <div style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
            Notificação automática enviada por <strong>${storeName}</strong> via Loja Virtual.
          </div>

        </div>
      </body>
      </html>
    `

    await sendEmail({
      to: destinationEmail,
      subject: `🛍️ Novo Pedido #${orderNumber} recebido! (${totalFormatted})`,
      html: emailHtml,
      customConfig
    })

  } catch (err) {
    // Nunca interrompe o checkout em caso de falha de envio
    console.error('[EmailService] Falha ao enviar notificação de pedido:', err)
  }
}
