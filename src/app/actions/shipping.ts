"use server"

import { getAdminSupabase } from '@/lib/supabase'

export async function calculateShippingAction({
  storeId,
  cep,
  items
}: {
  storeId: string
  cep: string
  items: Array<{
    weight?: number
    length?: number
    width?: number
    height?: number
    price: number
    quantity: number
  }>
}) {
  const supabase = getAdminSupabase()
  const cleanCep = cep.replace(/\D/g, '')

  if (cleanCep.length !== 8) {
    return { success: false, error: 'CEP inválido.' }
  }

  try {
    const { data: store, error: storeErr } = await supabase
      .from('stores')
      .select('settings')
      .eq('id', storeId)
      .single()

    if (storeErr || !store) {
      throw new Error('Loja não encontrada.')
    }

    const settings = store.settings || {}
    const gateways = settings.shipping_gateways || {}
    const originZip = (gateways.origin_zip || '').replace(/\D/g, '')

    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)

    // Check custom rules first for free shipping
    const customRules = gateways.custom_rules || {}
    const freeShippingMin = customRules.free_shipping_min || settings.free_shipping_threshold || null
    if (customRules.active && freeShippingMin !== null && subtotal >= freeShippingMin) {
      return {
        success: true,
        options: [
          {
            id: 'free_shipping',
            label: 'Frete Grátis',
            cost: 0,
            deadline: '3 a 5 dias úteis'
          }
        ]
      }
    }

    const allOptions: any[] = []

    // 1. FRENET INTEGRATION
    const frenet = gateways.frenet || {}
    if (frenet.active && frenet.api_token) {
      try {
        const shippingItems = items.map(item => ({
          Weight: item.weight && item.weight > 0 ? item.weight : 0.3,
          Length: item.length && item.length > 0 ? item.length : 15,
          Width: item.width && item.width > 0 ? item.width : 15,
          Height: item.height && item.height > 0 ? item.height : 15,
          Quantity: item.quantity
        }))

        const response = await fetch('https://api.frenet.com.br/shipping/quote', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'token': frenet.api_token
          },
          body: JSON.stringify({
            SellerCEP: originZip,
            RecipientCEP: cleanCep,
            ShipmentInvoiceValue: subtotal,
            ShippingItemArray: shippingItems
          })
        })

        if (response.ok) {
          const data = await response.json()
          const rawServices = data.ShippingSevicesArray || data.ShippingServicesArray || []
          
          const options = rawServices
            .filter((s: any) => !s.Error && parseFloat(s.ShippingPrice) >= 0)
            .map((s: any) => ({
              id: `frenet_${s.ServiceDescription.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
              label: `Frenet - ${s.ServiceDescription}`,
              cost: parseFloat(s.ShippingPrice),
              deadline: `${s.DeliveryTime} ${parseInt(s.DeliveryTime) === 1 ? 'dia útil' : 'dias úteis'}`
            }))

          allOptions.push(...options)
        }
      } catch (frenetErr) {
        console.error('Frenet calculation failed:', frenetErr)
      }
    }

    // 2. MELHOR ENVIO INTEGRATION
    const melhorenvio = gateways.melhorenvio || {}
    if (melhorenvio.active && melhorenvio.bearer_token) {
      try {
        const baseUrl = melhorenvio.mode === 'live' 
          ? 'https://melhorenvio.com.br' 
          : 'https://sandbox.melhorenvio.com.br'

        const response = await fetch(`${baseUrl}/api/v2/me/shipment/calculate`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${melhorenvio.bearer_token}`
          },
          body: JSON.stringify({
            from: { postal_code: originZip },
            to: { postal_code: cleanCep },
            products: items.map((item, idx) => ({
              id: String(idx + 1),
              width: item.width && item.width > 0 ? item.width : 15,
              height: item.height && item.height > 0 ? item.height : 15,
              length: item.length && item.length > 0 ? item.length : 15,
              weight: item.weight && item.weight > 0 ? item.weight : 0.3,
              insurance_value: item.price,
              quantity: item.quantity
            }))
          })
        })

        if (response.ok) {
          const data = await response.json()
          if (Array.isArray(data)) {
            const options = data
              .filter((s: any) => !s.error && s.price)
              .map((s: any) => ({
                id: `melhorenvio_${s.id || s.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
                label: `Melhor Envio - ${s.name}`,
                cost: parseFloat(s.price),
                deadline: `${s.delivery_time} ${s.delivery_time === 1 ? 'dia útil' : 'dias úteis'}`
              }))

            allOptions.push(...options)
          }
        }
      } catch (meErr) {
        console.error('Melhor Envio calculation failed:', meErr)
      }
    }

    // 3. CORREIOS SOAP CONTRACT INTEGRATION
    const correios = gateways.correios || {}
    if (correios.active) {
      try {
        const weightSum = items.reduce((acc, item) => acc + ((item.weight || 0.3) * item.quantity), 0)
        const maxLength = Math.max(...items.map(item => item.length || 15))
        const maxWidth = Math.max(...items.map(item => item.width || 15))
        const maxHeight = Math.max(...items.map(item => item.height || 15))
        const nCdServico = '04014,04510' // SEDEX e PAC padrão

        const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <CalcPrecoPrazo xmlns="http://tempuri.org/">
      <nCdEmpresa>${correios.cod_administrativo || ''}</nCdEmpresa>
      <sDsSenha>${correios.password || ''}</sDsSenha>
      <nCdServico>${nCdServico}</nCdServico>
      <sCepOrigem>${originZip}</sCepOrigem>
      <sCepDestino>${cleanCep}</sCepDestino>
      <nVlPeso>${weightSum}</nVlPeso>
      <nCdFormato>1</nCdFormato>
      <nVlComprimento>${maxLength}</nVlComprimento>
      <nVlAltura>${maxHeight}</nVlAltura>
      <nVlLargura>${maxWidth}</nVlLargura>
      <nVlDiametro>0</nVlDiametro>
      <sCdMaoPropria>N</sCdMaoPropria>
      <nVlValorDeclarado>${subtotal}</nVlValorDeclarado>
      <sCdAvisoRecebimento>N</sCdAvisoRecebimento>
    </CalcPrecoPrazo>
  </soap:Body>
</soap:Envelope>`

        const response = await fetch('http://ws.correios.com.br/calculador/CalcPrecoPrazo.asmx', {
          method: 'POST',
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': 'http://tempuri.org/CalcPrecoPrazo'
          },
          body: soapEnvelope
        })

        if (response.ok) {
          const xmlText = await response.text()
          const servicos = xmlText.match(/<cServico>[\s\S]*?<\/cServico>/g) || []
          
          for (const s of servicos) {
            const codigo = s.match(/<Codigo>(.*?)<\/Codigo>/)?.[1]
            const valor = s.match(/<Valor>(.*?)<\/Valor>/)?.[1]?.replace(',', '.')
            const prazo = s.match(/<PrazoEntrega>(.*?)<\/PrazoEntrega>/)?.[1]
            const erro = s.match(/<Erro>(.*?)<\/Erro>/)?.[1]
            
            if (codigo && valor && parseFloat(valor) > 0 && (erro === '0' || !erro)) {
              const label = codigo === '04014' || codigo === '4014' ? 'Correios - SEDEX' : 'Correios - PAC'
              allOptions.push({
                id: `correios_${codigo}`,
                label,
                cost: parseFloat(valor),
                deadline: `${prazo} ${parseInt(prazo || '0') === 1 ? 'dia útil' : 'dias úteis'}`
              })
            }
          }
        }
      } catch (correiosErr) {
        console.error('Correios SOAP calculation failed:', correiosErr)
      }
    }

    // Return all successfully fetched options
    if (allOptions.length > 0) {
      return { success: true, options: allOptions }
    }

    // Fallback to custom flat rate if active, or default to R$ 15,00
    const fixedRate = customRules.active && customRules.fixed_rate !== undefined 
      ? customRules.fixed_rate 
      : (settings.fixed_shipping_cost || 15)

    return {
      success: true,
      options: [
        {
          id: 'custom_standard',
          label: 'Entrega Padrão (Fixo)',
          cost: fixedRate,
          deadline: '5 a 8 dias úteis'
        }
      ]
    }

  } catch (error: any) {
    console.error('Error calculating shipping:', error)
    return { success: false, error: 'Erro ao calcular frete. Usando frete fixo padrão.' }
  }
}
