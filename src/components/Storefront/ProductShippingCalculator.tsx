"use client"

import { useState } from 'react'
import { Truck } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { calculateShippingAction } from '@/app/actions/shipping'

export default function ProductShippingCalculator({
  storeId,
  productPrice,
  productWeight,
  productLength,
  productWidth,
  productHeight,
  buttonRadius,
  primaryColor,
  isDark
}: {
  storeId: string
  productPrice: number
  productWeight?: number
  productLength?: number
  productWidth?: number
  productHeight?: number
  buttonRadius: string
  primaryColor: string
  isDark: boolean
}) {
  const [cepInput, setCepInput] = useState('')
  const [calculating, setCalculating] = useState(false)
  const [options, setOptions] = useState<any[]>([])

  const handleCalculate = async () => {
    if (!cepInput.trim() || cepInput.replace(/\D/g, '').length !== 8) {
      return toast.error('Digite um CEP válido com 8 dígitos.')
    }

    setCalculating(true)
    try {
      const res = await calculateShippingAction({
        storeId,
        cep: cepInput,
        items: [
          {
            price: productPrice,
            quantity: 1,
            weight: productWeight,
            length: productLength,
            width: productWidth,
            height: productHeight
          }
        ]
      })

      if (res.success && res.options) {
        setOptions(res.options)
        toast.success('Frete calculado com sucesso!')
      } else {
        toast.error(res.error || 'Erro ao calcular frete.')
      }
    } catch (err) {
      console.error(err)
      toast.error('Erro de conexão ao calcular frete.')
    } finally {
      setCalculating(false)
    }
  }

  return (
    <div style={{ padding: '1.25rem', backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f9fafb', borderRadius: '12px', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #eaeaea', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div>
        <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem', color: isDark ? '#fff' : '#111', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Truck size={18} color={primaryColor} /> Calcular Frete
        </p>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <input 
            type="text" 
            placeholder="00000-000" 
            value={cepInput}
            onChange={(e) => setCepInput(e.target.value)}
            maxLength={9}
            style={{ width: '100%', minWidth: 0, padding: '0.7rem 0.8rem', borderRadius: buttonRadius, border: '1px solid #ddd', outline: 'none', fontSize: '0.85rem', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff', color: isDark ? '#fff' : '#000' }} 
          />
          <button 
            onClick={handleCalculate}
            disabled={calculating}
            style={{ padding: '0.7rem 1rem', backgroundColor: isDark ? '#fff' : '#111', color: isDark ? '#000' : '#fff', border: 'none', borderRadius: buttonRadius, fontWeight: 700, cursor: calculating ? 'default' : 'pointer', fontSize: '0.85rem', opacity: calculating ? 0.7 : 1 }}
          >
            {calculating ? '...' : 'OK'}
          </button>
        </div>
      </div>

      {options.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem', borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #eee', paddingTop: '0.75rem' }}>
          {options.map((opt, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
              <span style={{ color: isDark ? '#ccc' : '#444' }}>{opt.label} ({opt.deadline}):</span>
              <span style={{ color: primaryColor }}>{opt.cost === 0 ? 'Grátis' : `R$ ${opt.cost.toFixed(2).replace('.', ',')}`}</span>
            </div>
          ))}
        </div>
      )}

      <Link href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" style={{ fontSize: '0.75rem', color: primaryColor, textDecoration: 'underline', display: 'inline-block', fontWeight: 600 }}>Não sei meu CEP</Link>
    </div>
  )
}
