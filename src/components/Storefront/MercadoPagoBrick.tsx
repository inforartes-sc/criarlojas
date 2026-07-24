"use client"

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import { Loader2 } from 'lucide-react'

interface MercadoPagoBrickProps {
  publicKey: string
  amount: number
  email: string
  maxInstallments?: number
  onPaymentSubmit: (formData: any) => Promise<void>
}

declare global {
  interface Window {
    MercadoPago: any
    paymentBrickController: any
  }
}

export default function MercadoPagoBrick({
  publicKey,
  amount,
  email,
  maxInstallments = 12,
  onPaymentSubmit
}: MercadoPagoBrickProps) {
  const [sdkLoaded, setSdkLoaded] = useState(false)
  const [loading, setLoading] = useState(true)
  const brickMountedRef = useRef(false)

  const initBrick = async () => {
    if (!window.MercadoPago || brickMountedRef.current) return
    brickMountedRef.current = true

    try {
      const mp = new window.MercadoPago(publicKey, { locale: 'pt-BR' })
      const bricksBuilder = mp.bricks()

      const renderPaymentBrick = async (builder: any) => {
        const settings = {
          initialization: {
            amount: Number(amount.toFixed(2)),
            payer: {
              email: email || 'cliente@exemplo.com'
            }
          },
          customization: {
            paymentMethods: {
              ticket: 'all',
              bankTransfer: 'all',
              creditCard: 'all',
              maxInstallments: maxInstallments
            }
          },
          callbacks: {
            onReady: () => {
              setLoading(false)
            },
            onSubmit: async ({ selectedPaymentMethod, formData }: any) => {
              return new Promise<void>((resolve, reject) => {
                onPaymentSubmit(formData)
                  .then(() => resolve())
                  .catch((err) => reject(err))
              })
            },
            onError: (error: any) => {
              console.error('Mercado Pago Brick Error:', error)
            }
          }
        }

        window.paymentBrickController = await builder.create(
          'payment',
          'paymentBrick_container',
          settings
        )
      }

      await renderPaymentBrick(bricksBuilder)
    } catch (err) {
      console.error('Error mounting MP Brick:', err)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (window.MercadoPago) {
      setSdkLoaded(true)
      initBrick()
    }
  }, [])

  return (
    <div style={{ width: '100%', minHeight: '300px' }}>
      <Script
        src="https://sdk.mercadopago.com/js/v2"
        onLoad={() => {
          setSdkLoaded(true)
          initBrick()
        }}
      />
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '0.75rem', color: '#64748b' }}>
          <Loader2 className="animate-spin" size={24} />
          <span>Carregando gateway seguro do Mercado Pago...</span>
        </div>
      )}
      <div id="paymentBrick_container" />
    </div>
  )
}
