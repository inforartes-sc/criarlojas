"use client"

import { useState, useEffect } from 'react'
import { Shirt, Palette, Layers, Plus, Trash2, Save, Loader2, Sparkles, CheckCircle2, Lock, Crown, ArrowRight, Upload, Tag, Pencil, X } from 'lucide-react'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface BaseColor {
  id: string
  name: string
  hex: string
  image_url?: string
  image_url_back?: string
  model_type?: 'todos' | 'masculino' | 'feminino' | 'infantil' | string
  model_types?: string[]
}

const getColorModels = (c: BaseColor): string[] => {
  if (Array.isArray(c.model_types) && c.model_types.length > 0) {
    return c.model_types
  }
  if (typeof c.model_type === 'string') {
    if (c.model_type === 'todos' || !c.model_type) {
      return ['masculino', 'feminino', 'infantil']
    }
    return [c.model_type]
  }
  return ['masculino', 'feminino', 'infantil']
}

interface PrintItem {
  id: string
  title: string
  category: string
  image_url: string
  extra_price?: number
  target_audience?: 'todos' | 'masculino' | 'feminino' | 'infantil' | string | string[]
  target_audiences?: string[]
}

const getPrintAudiences = (p: PrintItem): string[] => {
  if (Array.isArray(p.target_audiences) && p.target_audiences.length > 0) {
    return p.target_audiences
  }
  if (Array.isArray(p.target_audience)) {
    return p.target_audience as string[]
  }
  if (typeof p.target_audience === 'string') {
    if (p.target_audience === 'todos' || !p.target_audience) {
      return ['masculino', 'feminino', 'infantil']
    }
    return [p.target_audience]
  }
  return ['masculino', 'feminino', 'infantil']
}

const DEFAULT_BASE_COLORS: BaseColor[] = [
  { id: '1', name: 'Branca Tradicional', hex: '#ffffff', image_url: '', image_url_back: '', model_type: 'todos' },
  { id: '2', name: 'Preta Premium', hex: '#18181b', image_url: '', image_url_back: '', model_type: 'todos' },
  { id: '3', name: 'Cinza Mescla', hex: '#9ca3af', image_url: '', image_url_back: '', model_type: 'todos' },
  { id: '4', name: 'Vermelha', hex: '#ef4444', image_url: '', image_url_back: '', model_type: 'todos' },
  { id: '5', name: 'Azul Marinho', hex: '#1e3a8a', image_url: '', image_url_back: '', model_type: 'todos' },
  { id: '6', name: 'Verde Militar', hex: '#3f6212', image_url: '', image_url_back: '', model_type: 'todos' },
]

const DEFAULT_PRINTS: PrintItem[] = [
  {
    id: 'p1',
    title: 'Caveira Rock',
    category: 'Música & Rock',
    image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=80',
    extra_price: 0,
    target_audience: 'todos'
  },
  {
    id: 'p2',
    title: 'Astronauta Chill',
    category: 'Geek & Arte',
    image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
    extra_price: 0,
    target_audience: 'todos'
  }
]

export default function AdminCustomizerPage() {
  const { store, refreshStore, setStore } = useAdminAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [customizerEnabled, setCustomizerEnabled] = useState(false)
  const [backPrintExtraPrice, setBackPrintExtraPrice] = useState<number>(15)
  const [largePrintExtraPrice, setLargePrintExtraPrice] = useState<number>(10)
  const [baseColors, setBaseColors] = useState<BaseColor[]>(DEFAULT_BASE_COLORS)
  const [prints, setPrints] = useState<PrintItem[]>(DEFAULT_PRINTS)

  // New color form state
  const [newColorName, setNewColorName] = useState('')
  const [newColorHex, setNewColorHex] = useState('#6366f1')
  const [newColorImage, setNewColorImage] = useState('')
  const [newColorImageBack, setNewColorImageBack] = useState('')
  const [newColorModelTypes, setNewColorModelTypes] = useState<string[]>(['masculino', 'feminino', 'infantil'])

  const toggleNewColorModelType = (aud: string) => {
    setNewColorModelTypes(prev => {
      if (prev.includes(aud)) {
        if (prev.length === 1) {
          toast.error('Selecione ao menos um modelo!')
          return prev
        }
        return prev.filter(a => a !== aud)
      } else {
        return [...prev, aud]
      }
    })
  }

  // New print form state
  const [newPrintTitle, setNewPrintTitle] = useState('')
  const [newPrintCategory, setNewPrintCategory] = useState('Geral')
  const [newPrintImage, setNewPrintImage] = useState('')
  const [newPrintExtraPrice, setNewPrintExtraPrice] = useState(0)
  const [newPrintTargetAudiences, setNewPrintTargetAudiences] = useState<string[]>(['masculino', 'feminino', 'infantil'])

  const toggleNewPrintAudience = (aud: string) => {
    setNewPrintTargetAudiences(prev => {
      if (prev.includes(aud)) {
        if (prev.length === 1) {
          toast.error('Selecione ao menos um público-alvo!')
          return prev
        }
        return prev.filter(a => a !== aud)
      } else {
        return [...prev, aud]
      }
    })
  }

  const [uploadingImage, setUploadingImage] = useState(false)

  const currentPlan = (store?.plan || store?.settings?.plan || 'pro').toLowerCase()
  const isAllowedPlan = ['pro', 'premium', 'master', 'enterprise'].includes(currentPlan)

  useEffect(() => {
    if (store) {
      loadCustomizerData()
    }
  }, [store])

  const loadCustomizerData = async () => {
    if (!store) return
    setLoading(true)
    try {
      const settings = store.settings || {}
      setCustomizerEnabled(!!settings.customizer_enabled)
      if (settings.customizer_back_print_extra_price !== undefined) {
        setBackPrintExtraPrice(Number(settings.customizer_back_print_extra_price) || 0)
      }
      if (settings.customizer_large_print_extra_price !== undefined) {
        setLargePrintExtraPrice(Number(settings.customizer_large_print_extra_price) || 0)
      }

      if (settings.customizer_base_colors && Array.isArray(settings.customizer_base_colors)) {
        setBaseColors(settings.customizer_base_colors)
      }
      if (settings.customizer_prints && Array.isArray(settings.customizer_prints)) {
        setPrints(settings.customizer_prints)
      }
    } catch (error: any) {
      console.error('Erro ao carregar dados do customizador:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async (
    updatedEnabled = customizerEnabled,
    updatedColors = baseColors,
    updatedPrints = prints,
    updatedBackFee = backPrintExtraPrice,
    updatedLargeFee = largePrintExtraPrice
  ) => {
    if (!store?.id) return
    setSaving(true)
    try {
      const existingSettings = store.settings || {}
      const updatedSettings = {
        ...existingSettings,
        customizer_enabled: updatedEnabled,
        customizer_back_print_extra_price: updatedBackFee,
        customizer_large_print_extra_price: updatedLargeFee,
        customizer_base_colors: updatedColors,
        customizer_prints: updatedPrints
      }

      const { error } = await supabase
        .from('stores')
        .update({ settings: updatedSettings })
        .eq('id', store.id)

      if (error) {
        throw error
      }

      setStore({
        ...store,
        settings: updatedSettings
      })
      await refreshStore()
      toast.success('Configurações do customizador salvas com sucesso!')
    } catch (error: any) {
      console.error(error)
      toast.error('Erro ao salvar customizador: ' + (error.message || 'Tente novamente.'))
    } finally {
      setSaving(false)
    }
  }

  const handleToggleEnabled = async () => {
    const nextVal = !customizerEnabled
    setCustomizerEnabled(nextVal)
    await handleSaveSettings(nextVal, baseColors, prints)
  }

  const handleAddColor = async () => {
    if (!newColorName.trim()) {
      toast.error('Informe o nome da cor!')
      return
    }

    const newItem: BaseColor = {
      id: Date.now().toString(),
      name: newColorName.trim(),
      hex: newColorHex,
      image_url: newColorImage.trim() || undefined,
      image_url_back: newColorImageBack.trim() || undefined,
      model_types: newColorModelTypes,
      model_type: newColorModelTypes.length === 3 ? 'todos' : (newColorModelTypes[0] as any)
    }

    const nextColors = [...baseColors, newItem]
    setBaseColors(nextColors)
    setNewColorName('')
    setNewColorImage('')
    setNewColorImageBack('')
    setNewColorModelTypes(['masculino', 'feminino', 'infantil'])

    await handleSaveSettings(customizerEnabled, nextColors, prints)
  }

  const handleRemoveColor = async (id: string) => {
    const nextColors = baseColors.filter(c => c.id !== id)
    setBaseColors(nextColors)
    await handleSaveSettings(customizerEnabled, nextColors, prints)
  }

  const handleAddPrint = async () => {
    if (!newPrintTitle.trim() || !newPrintImage.trim()) {
      toast.error('Preencha o título e a imagem da estampa!')
      return
    }

    const newItem: PrintItem = {
      id: Date.now().toString(),
      title: newPrintTitle.trim(),
      category: newPrintCategory.trim() || 'Geral',
      image_url: newPrintImage.trim(),
      extra_price: Number(newPrintExtraPrice) || 0,
      target_audiences: newPrintTargetAudiences,
      target_audience: newPrintTargetAudiences.length === 3 ? 'todos' : (newPrintTargetAudiences[0] as any)
    }

    const nextPrints = [...prints, newItem]
    setPrints(nextPrints)
    setNewPrintTitle('')
    setNewPrintCategory('Geral')
    setNewPrintImage('')
    setNewPrintExtraPrice(0)
    setNewPrintTargetAudiences(['masculino', 'feminino', 'infantil'])

    await handleSaveSettings(customizerEnabled, baseColors, nextPrints)
  }

  const handleRemovePrint = async (id: string) => {
    const nextPrints = prints.filter(p => p.id !== id)
    setPrints(nextPrints)
    await handleSaveSettings(customizerEnabled, baseColors, nextPrints)
  }

  // Edit state
  const [editingColor, setEditingColor] = useState<BaseColor | null>(null)
  const [editingPrint, setEditingPrint] = useState<PrintItem | null>(null)

  const handleUpdateColor = async () => {
    if (!editingColor) return
    if (!editingColor.name.trim()) {
      toast.error('Informe o nome da cor!')
      return
    }

    const nextColors = baseColors.map(c => c.id === editingColor.id ? editingColor : c)
    setBaseColors(nextColors)
    setEditingColor(null)
    await handleSaveSettings(customizerEnabled, nextColors, prints)
    toast.success('Cor atualizada com sucesso!')
  }

  const handleUpdatePrint = async () => {
    if (!editingPrint) return
    if (!editingPrint.title.trim() || !editingPrint.image_url.trim()) {
      toast.error('Preencha o título e a imagem da estampa!')
      return
    }

    const nextPrints = prints.map(p => p.id === editingPrint.id ? editingPrint : p)
    setPrints(nextPrints)
    setEditingPrint(null)
    await handleSaveSettings(customizerEnabled, baseColors, nextPrints)
    toast.success('Estampa atualizada com sucesso!')
  }

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetField: 'color_front' | 'color_back' | 'print' | 'edit_color_front' | 'edit_color_back' | 'edit_print'
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      let finalUrl = ''

      if (store?.id) {
        const fileExt = file.name.split('.').pop() || 'png'
        const fileName = `customizer-${targetField}-${Date.now()}.${fileExt}`
        const filePath = `${store.id}/customizer/${fileName}`

        const { error: uploadError } = await supabase.storage.from('store-assets').upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('store-assets').getPublicUrl(filePath)
          finalUrl = publicUrl
        }
      }

      if (!finalUrl) {
        finalUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      }

      if (targetField === 'color_front') setNewColorImage(finalUrl)
      if (targetField === 'color_back') setNewColorImageBack(finalUrl)
      if (targetField === 'print') setNewPrintImage(finalUrl)

      if (targetField === 'edit_color_front') {
        setEditingColor(prev => prev ? { ...prev, image_url: finalUrl } : null)
      }
      if (targetField === 'edit_color_back') {
        setEditingColor(prev => prev ? { ...prev, image_url_back: finalUrl } : null)
      }
      if (targetField === 'edit_print') {
        setEditingPrint(prev => prev ? { ...prev, image_url: finalUrl } : null)
      }

      toast.success('Imagem enviada com sucesso!')
    } catch (err: any) {
      console.error('Erro upload customizer:', err)
      toast.error('Erro ao enviar imagem: ' + (err.message || 'Tente novamente.'))
    } finally {
      setUploadingImage(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Loader2 className="animate-spin" size={32} color="#6366f1" />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
      {/* Header da Página */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Shirt size={28} color="#6366f1" />
            Customizador de Camisetas & Estampas
          </h1>
          <p style={{ color: 'var(--muted)', margin: '0.35rem 0 0 0', fontSize: '0.95rem' }}>
            Gerencie as cores base de camisetas e a galeria de estampas que os clientes poderão escolher na loja.
          </p>
        </div>

        {/* Toggle Ativar Customizador na Loja */}
        <button
          onClick={handleToggleEnabled}
          disabled={saving || !isAllowedPlan}
          style={{
            padding: '0.75rem 1.4rem',
            backgroundColor: customizerEnabled ? '#22c55e' : '#64748b',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 700,
            cursor: isAllowedPlan ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
          {customizerEnabled ? 'Módulo Ativado na Loja' : 'Módulo Desativado'}
        </button>
      </div>

      {/* Banner de Upgrade Exclusivo se não for Plano Pro/Premium */}
      {!isAllowedPlan && (
        <div style={{
          padding: '1.75rem',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
          border: '1.5px solid rgba(99, 102, 241, 0.4)',
          boxShadow: '0 8px 32px rgba(99, 102, 241, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ padding: '0.6rem', borderRadius: '12px', backgroundColor: '#6366f1', color: '#fff', display: 'flex' }}>
                <Crown size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Recurso Exclusivo dos Planos Pro & Premium
                  <Lock size={16} color="#eab308" />
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: 'var(--muted)' }}>
                  Sua loja está no plano <strong style={{ textTransform: 'capitalize' }}>{currentPlan}</strong>. Faça o upgrade agora para desbloquear o criador de mockups e estampas em tempo real!
                </p>
              </div>
            </div>

            <Link
              href="/admin/subscription"
              style={{
                padding: '0.85rem 1.6rem',
                backgroundColor: '#6366f1',
                color: '#fff',
                fontWeight: 700,
                borderRadius: '10px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                whiteSpace: 'nowrap'
              }}
            >
              FAZER UPGRADE DE PLANO
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      )}

      {/* Banner status */}
      <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '12px', borderLeft: `6px solid ${customizerEnabled ? '#22c55e' : '#f59e0b'}`, backgroundColor: customizerEnabled ? 'rgba(34, 197, 94, 0.05)' : 'rgba(245, 158, 11, 0.05)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={20} color={customizerEnabled ? '#22c55e' : '#f59e0b'} />
          {customizerEnabled ? 'O Customizador de Camisetas está pronto e ativo para seus clientes!' : 'O Customizador está desativado.'}
        </h3>
        <p style={{ color: 'var(--foreground)', fontSize: '0.9rem', lineHeight: 1.5, opacity: 0.9 }}>
          {customizerEnabled
            ? 'Os produtos marcados como personalizáveis exibirão o botão de Personalizar Camiseta na página do produto.'
            : 'Ative a chave acima para disponibilizar a ferramenta de seleção de cores de camiseta e galeria de estampas.'}
        </p>
      </div>

      {/* Card de Configuração do Valor Adicional da Estampa nas Costas */}
      <div className="glass-card admin-customizer-card" style={{ padding: '1.5rem 2rem', borderRadius: '14px', border: '1px solid var(--border)', backgroundColor: 'var(--input-bg)', display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--foreground)' }}>
              <Tag size={22} color="#6366f1" />
              Taxa Adicional para Estampa nas Costas (R$)
            </h3>
            <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.88rem', color: 'var(--muted)' }}>
              Defina o valor adicional cobrado automaticamente quando o cliente escolher adicionar uma estampa nas costas da camiseta.
            </p>
          </div>

          <div className="admin-taxa-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--background)', padding: '0.5rem 1rem', borderRadius: '10px', border: '1.5px solid #6366f1' }}>
              <span style={{ fontWeight: 800, color: '#6366f1', fontSize: '1.1rem' }}>R$</span>
              <input
                type="number"
                step="0.50"
                min="0"
                value={backPrintExtraPrice}
                onChange={e => setBackPrintExtraPrice(Number(e.target.value) || 0)}
                style={{ width: '100px', border: 'none', background: 'transparent', outline: 'none', fontWeight: 900, fontSize: '1.2rem', color: 'var(--foreground)' }}
              />
            </div>
            <button
              onClick={() => handleSaveSettings(customizerEnabled, baseColors, prints, backPrintExtraPrice, largePrintExtraPrice)}
              disabled={saving || !isAllowedPlan}
              style={{
                padding: '0.75rem 1.4rem',
                backgroundColor: '#6366f1',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)'
              }}
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Salvar Taxa das Costas
            </button>
          </div>
        </div>
      </div>

      {/* Card de Configuração do Valor Adicional para Estampa Grande / Panorâmica */}
      <div className="glass-card admin-customizer-card" style={{ padding: '1.5rem 2rem', borderRadius: '14px', border: '1px solid var(--border)', backgroundColor: 'var(--input-bg)', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--foreground)' }}>
              <Sparkles size={22} color="#ec4899" />
              Taxa Adicional para Estampa Grande / Panorâmica (R$)
            </h3>
            <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.88rem', color: 'var(--muted)' }}>
              Defina o valor adicional cobrado quando o cliente optar por aplicar a estampa em tamanho grande (Max Panorâmica) na camiseta.
            </p>
          </div>

          <div className="admin-taxa-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--background)', padding: '0.5rem 1rem', borderRadius: '10px', border: '1.5px solid #ec4899' }}>
              <span style={{ fontWeight: 800, color: '#ec4899', fontSize: '1.1rem' }}>R$</span>
              <input
                type="number"
                step="0.50"
                min="0"
                value={largePrintExtraPrice}
                onChange={e => setLargePrintExtraPrice(Number(e.target.value) || 0)}
                style={{ width: '100px', border: 'none', background: 'transparent', outline: 'none', fontWeight: 900, fontSize: '1.2rem', color: 'var(--foreground)' }}
              />
            </div>
            <button
              onClick={() => handleSaveSettings(customizerEnabled, baseColors, prints, backPrintExtraPrice, largePrintExtraPrice)}
              disabled={saving || !isAllowedPlan}
              style={{
                padding: '0.75rem 1.4rem',
                backgroundColor: '#ec4899',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(236, 72, 153, 0.3)'
              }}
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Salvar Taxa Estampa Grande
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .admin-customizer-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 2rem;
        }

        .admin-thumbnails-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 1rem;
        }

        @media (max-width: 768px) {
          .admin-customizer-grid {
            grid-template-columns: 1fr !important;
            gap: 1.25rem !important;
          }
          .admin-customizer-card {
            padding: 1.1rem 0.85rem !important;
          }
          .admin-form-row {
            grid-template-columns: 1fr !important;
            gap: 0.75rem !important;
          }
          .admin-taxa-actions {
            width: 100% !important;
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .admin-taxa-actions button {
            width: 100% !important;
            justify-content: center !important;
          }
        }

        @media (max-width: 640px) {
          .admin-thumbnails-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.65rem !important;
          }
        }

        @media (max-width: 480px) {
          .admin-upload-row {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .admin-upload-row input[type="text"] {
            width: 100% !important;
          }
          .admin-upload-row label {
            justify-content: center !important;
            width: 100% !important;
            padding: 0.65rem !important;
          }
        }
      `}</style>

      {/* Grid com overlay locked se não tiver plano permitido */}
      <div style={{
        opacity: isAllowedPlan ? 1 : 0.6,
        filter: isAllowedPlan ? 'none' : 'grayscale(30%)',
        pointerEvents: isAllowedPlan ? 'auto' : 'none',
        position: 'relative'
      }}>
      {/* Grid: 2 Colunas (Cores da Camisa + Galeria de Estampas) */}
      <div className="admin-customizer-grid">
        
        {/* Coluna 1: Cores Base da Camiseta */}
        <div className="glass-card admin-customizer-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <Palette size={22} color="#6366f1" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Cores Base da Camiseta</h2>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--muted)', margin: 0 }}>
            Cadastre as cores disponíveis no seu estoque de camisetas. O cliente poderá selecionar qualquer uma delas no mockup.
          </p>

          {/* Form para adicionar nova cor */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem', backgroundColor: 'var(--input-bg)', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Nova Cor Base de Camisa</h4>
            
            <div className="admin-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '0.35rem' }}>Nome da Cor</label>
                <input
                  type="text"
                  placeholder="Ex: Azul Celeste"
                  value={newColorName}
                  onChange={e => setNewColorName(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '0.35rem' }}>Tom HEX</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={e => setNewColorHex(e.target.value)}
                    style={{ width: '36px', height: '36px', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '4px' }}
                  />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{newColorHex}</span>
                </div>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '0.35rem' }}>Modelo / Público (Selecione um ou mais)</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[
                  { id: 'masculino', label: 'Masculino' },
                  { id: 'feminino', label: 'Feminino' },
                  { id: 'infantil', label: 'Infantil' }
                ].map(item => {
                  const isSelected = newColorModelTypes.includes(item.id)
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleNewColorModelType(item.id)}
                      style={{
                        padding: '0.45rem 0.85rem',
                        borderRadius: '20px',
                        border: isSelected ? '1.5px solid #6366f1' : '1px solid var(--border)',
                        backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--background)',
                        color: isSelected ? '#6366f1' : 'var(--muted)',
                        fontSize: '0.8rem',
                        fontWeight: isSelected ? 800 : 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>{isSelected ? '✓' : '+'}</span>
                      <span>{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '0.35rem' }}>Foto da Frente (Camisa)</label>
                <div className="admin-upload-row" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="URL da frente..."
                    value={newColorImage}
                    onChange={e => setNewColorImage(e.target.value)}
                    style={{ flex: 1, padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', fontSize: '0.85rem' }}
                  />
                  <label style={{ padding: '0.6rem 0.9rem', backgroundColor: 'var(--primary)', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}>
                    {uploadingImage ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                    <span>Upload Frente</span>
                    <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'color_front')} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '0.35rem' }}>Foto das Costas (Camisa)</label>
                <div className="admin-upload-row" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="URL do verso..."
                    value={newColorImageBack}
                    onChange={e => setNewColorImageBack(e.target.value)}
                    style={{ flex: 1, padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', fontSize: '0.85rem' }}
                  />
                  <label style={{ padding: '0.6rem 0.9rem', backgroundColor: 'var(--primary)', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}>
                    {uploadingImage ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                    <span>Upload Costas</span>
                    <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'color_back')} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
            </div>

            <button
              onClick={handleAddColor}
              disabled={saving}
              style={{
                marginTop: '0.5rem',
                padding: '0.65rem 1.25rem',
                backgroundColor: 'var(--primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <Plus size={18} />
              Adicionar Cor de Camisa
            </button>
          </div>

          {/* Lista de Cores */}
          <div className="admin-thumbnails-grid">
            {baseColors.map(color => (
              <div
                key={color.id}
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--input-bg)',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem',
                  position: 'relative'
                }}
              >
                <div style={{ position: 'absolute', top: '6px', right: '6px', display: 'flex', gap: '4px', zIndex: 2 }}>
                  <button
                    onClick={() => setEditingColor(color)}
                    title="Editar cor"
                    style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid var(--border)', borderRadius: '4px', padding: '4px', color: '#6366f1', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleRemoveColor(color.id)}
                    title="Remover cor"
                    style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid var(--border)', borderRadius: '4px', padding: '4px', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  {color.image_url ? (
                    <div
                      title="Frente"
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '6px',
                        backgroundImage: `url(${color.image_url})`,
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        border: '1px solid var(--border)',
                        backgroundColor: '#fff'
                      }}
                    />
                  ) : null}
                  {color.image_url_back ? (
                    <div
                      title="Costas"
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '6px',
                        backgroundImage: `url(${color.image_url_back})`,
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        border: '1px solid var(--border)',
                        backgroundColor: '#fff'
                      }}
                    />
                  ) : null}
                  {!color.image_url && !color.image_url_back && (
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        backgroundColor: color.hex,
                        border: '2px solid var(--border)'
                      }}
                    />
                  )}
                </div>

                <span style={{ fontWeight: 700, fontSize: '0.85rem', textAlign: 'center' }}>{color.name}</span>
                <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {getColorModels(color).length === 3 ? (
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      padding: '0.12rem 0.35rem',
                      borderRadius: '4px',
                      backgroundColor: '#6366f115',
                      color: '#6366f1',
                      textTransform: 'uppercase'
                    }}>
                      TODOS OS MODELOS
                    </span>
                  ) : (
                    getColorModels(color).map(aud => (
                      <span key={aud} style={{
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '0.12rem 0.35rem',
                        borderRadius: '4px',
                        backgroundColor: '#6366f115',
                        color: '#6366f1',
                        textTransform: 'uppercase'
                      }}>
                        {aud}
                      </span>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coluna 2: Galeria de Estampas */}
        <div className="glass-card admin-customizer-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <Layers size={22} color="#6366f1" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Galeria de Estampas</h2>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--muted)', margin: 0 }}>
            Suba as imagens das estampas (de preferência em formato PNG transparente). Os clientes poderão escolher qual estampa aplicar na camisa.
          </p>

          {/* Form para adicionar estampa */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem', backgroundColor: 'var(--input-bg)', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Nova Estampa</h4>

            <div className="admin-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 160px', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '0.35rem' }}>Título da Estampa</label>
                <input
                  type="text"
                  placeholder="Ex: Leão Tribal"
                  value={newPrintTitle}
                  onChange={e => setNewPrintTitle(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '0.35rem' }}>Categoria / Tag</label>
                <input
                  type="text"
                  placeholder="Ex: Geek"
                  value={newPrintCategory}
                  onChange={e => setNewPrintCategory(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '0.35rem' }}>Público-Alvo (Selecione um ou mais)</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[
                  { id: 'masculino', label: 'Masculino' },
                  { id: 'feminino', label: 'Feminino' },
                  { id: 'infantil', label: 'Infantil' }
                ].map(item => {
                  const isSelected = newPrintTargetAudiences.includes(item.id)
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleNewPrintAudience(item.id)}
                      style={{
                        padding: '0.45rem 0.85rem',
                        borderRadius: '20px',
                        border: isSelected ? '1.5px solid #6366f1' : '1px solid var(--border)',
                        backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--background)',
                        color: isSelected ? '#6366f1' : 'var(--muted)',
                        fontSize: '0.8rem',
                        fontWeight: isSelected ? 800 : 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>{isSelected ? '✓' : '+'}</span>
                      <span>{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '0.35rem' }}>Imagem da Estampa (PNG Transparente)</label>
              <div className="admin-upload-row" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="URL da imagem da estampa..."
                  value={newPrintImage}
                  onChange={e => setNewPrintImage(e.target.value)}
                  style={{ flex: 1, padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', fontSize: '0.85rem' }}
                />
                <label style={{ padding: '0.6rem 1rem', backgroundColor: 'var(--primary)', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}>
                  {uploadingImage ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                  <span>Upload Estampa</span>
                  <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'print')} style={{ display: 'none' }} />
                </label>
              </div>
            </div>

            <button
              onClick={handleAddPrint}
              disabled={saving}
              style={{
                marginTop: '0.5rem',
                padding: '0.65rem 1.25rem',
                backgroundColor: 'var(--primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <Plus size={18} />
              Adicionar Estampa à Galeria
            </button>
          </div>

          {/* Lista de Estampas */}
          <div className="admin-thumbnails-grid">
            {prints.map(p => (
              <div
                key={p.id}
                style={{
                  padding: '0.85rem',
                  backgroundColor: 'var(--input-bg)',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  position: 'relative'
                }}
              >
                <div style={{ position: 'absolute', top: '6px', right: '6px', display: 'flex', gap: '4px', zIndex: 2 }}>
                  <button
                    onClick={() => setEditingPrint(p)}
                    title="Editar estampa"
                    style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid var(--border)', borderRadius: '4px', padding: '4px', color: '#6366f1', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleRemovePrint(p.id)}
                    title="Remover estampa"
                    style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid var(--border)', borderRadius: '4px', padding: '4px', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div style={{
                  width: '100%',
                  height: '100px',
                  borderRadius: '6px',
                  backgroundColor: '#f1f5f9',
                  backgroundImage: `url(${p.image_url})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  border: '1px solid var(--border)'
                }} />

                <div style={{ textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', gap: '0.2rem', alignItems: 'center' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.85rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{p.category}</span>
                  <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {getPrintAudiences(p).length === 3 ? (
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '0.15rem 0.4rem',
                        borderRadius: '4px',
                        backgroundColor: '#6366f115',
                        color: '#6366f1',
                        textTransform: 'uppercase'
                      }}>
                        TODOS OS PÚBLICOS
                      </span>
                    ) : (
                      getPrintAudiences(p).map(aud => (
                        <span key={aud} style={{
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          padding: '0.12rem 0.35rem',
                          borderRadius: '4px',
                          backgroundColor: '#6366f115',
                          color: '#6366f1',
                          textTransform: 'uppercase'
                        }}>
                          {aud}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
      </div>

      {/* MODAL DE EDIÇÃO DE COR */}
      {editingColor && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(4px)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '520px',
            backgroundColor: 'var(--background, #ffffff)',
            borderRadius: '14px',
            border: '1px solid var(--border)',
            padding: '1.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Palette size={20} color="#6366f1" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Editar Cor da Camisa</h3>
              </div>
              <button onClick={() => setEditingColor(null)} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: '0.35rem' }}>Nome da Cor</label>
                <input
                  type="text"
                  value={editingColor.name}
                  onChange={e => setEditingColor({ ...editingColor, name: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: '0.35rem' }}>Cor Hex (#)</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={editingColor.hex || '#ffffff'}
                      onChange={e => setEditingColor({ ...editingColor, hex: e.target.value })}
                      style={{ width: '38px', height: '38px', padding: '2px', borderRadius: '6px', border: '1px solid var(--border)', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={editingColor.hex}
                      onChange={e => setEditingColor({ ...editingColor, hex: e.target.value })}
                      style={{ flex: 1, padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: '0.35rem' }}>Modelo / Público (Selecione um ou mais)</label>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {[
                      { id: 'masculino', label: 'Masculino' },
                      { id: 'feminino', label: 'Feminino' },
                      { id: 'infantil', label: 'Infantil' }
                    ].map(item => {
                      const currentModels = getColorModels(editingColor)
                      const isSelected = currentModels.includes(item.id)
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            let nextModels: string[]
                            if (isSelected) {
                              if (currentModels.length === 1) {
                                toast.error('Selecione ao menos um modelo!')
                                return
                              }
                              nextModels = currentModels.filter(a => a !== item.id)
                            } else {
                              nextModels = [...currentModels, item.id]
                            }
                            setEditingColor({
                              ...editingColor,
                              model_types: nextModels,
                              model_type: nextModels.length === 3 ? 'todos' : (nextModels[0] as any)
                            })
                          }}
                          style={{
                            padding: '0.4rem 0.75rem',
                            borderRadius: '16px',
                            border: isSelected ? '1.5px solid #6366f1' : '1px solid var(--border)',
                            backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--background)',
                            color: isSelected ? '#6366f1' : 'var(--muted)',
                            fontSize: '0.78rem',
                            fontWeight: isSelected ? 800 : 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          <span>{isSelected ? '✓' : '+'}</span>
                          <span>{item.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: '0.35rem' }}>Foto da Frente (Camisa)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={editingColor.image_url || ''}
                    onChange={e => setEditingColor({ ...editingColor, image_url: e.target.value })}
                    style={{ flex: 1, padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', fontSize: '0.85rem' }}
                  />
                  <label style={{ padding: '0.6rem 0.9rem', backgroundColor: 'var(--primary)', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}>
                    {uploadingImage ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'edit_color_front')} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: '0.35rem' }}>Foto das Costas (Camisa)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={editingColor.image_url_back || ''}
                    onChange={e => setEditingColor({ ...editingColor, image_url_back: e.target.value })}
                    style={{ flex: 1, padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', fontSize: '0.85rem' }}
                  />
                  <label style={{ padding: '0.6rem 0.9rem', backgroundColor: 'var(--primary)', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}>
                    {uploadingImage ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'edit_color_back')} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                onClick={() => setEditingColor(null)}
                style={{ padding: '0.65rem 1.25rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--foreground)', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateColor}
                disabled={saving}
                style={{ padding: '0.65rem 1.5rem', borderRadius: '6px', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE EDIÇÃO DE ESTAMPA */}
      {editingPrint && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(4px)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '520px',
            backgroundColor: 'var(--background, #ffffff)',
            borderRadius: '14px',
            border: '1px solid var(--border)',
            padding: '1.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={20} color="#6366f1" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Editar Estampa da Galeria</h3>
              </div>
              <button onClick={() => setEditingPrint(null)} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: '0.35rem' }}>Título da Estampa</label>
                <input
                  type="text"
                  value={editingPrint.title}
                  onChange={e => setEditingPrint({ ...editingPrint, title: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: '0.35rem' }}>Categoria / Tag</label>
                  <input
                    type="text"
                    value={editingPrint.category}
                    onChange={e => setEditingPrint({ ...editingPrint, category: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: '0.35rem' }}>Público-Alvo (Múltipla Seleção)</label>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {[
                      { id: 'masculino', label: 'Masculino' },
                      { id: 'feminino', label: 'Feminino' },
                      { id: 'infantil', label: 'Infantil' }
                    ].map(item => {
                      const currentAudiences = getPrintAudiences(editingPrint)
                      const isSelected = currentAudiences.includes(item.id)
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            let updated: string[]
                            if (isSelected) {
                              if (currentAudiences.length === 1) {
                                toast.error('Selecione ao menos um público-alvo!')
                                return
                              }
                              updated = currentAudiences.filter(a => a !== item.id)
                            } else {
                              updated = [...currentAudiences, item.id]
                            }
                            setEditingPrint({
                              ...editingPrint,
                              target_audiences: updated,
                              target_audience: updated.length === 3 ? 'todos' : (updated[0] as any)
                            })
                          }}
                          style={{
                            padding: '0.4rem 0.75rem',
                            borderRadius: '20px',
                            border: isSelected ? '1.5px solid #6366f1' : '1px solid var(--border)',
                            backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--background)',
                            color: isSelected ? '#6366f1' : 'var(--muted)',
                            fontSize: '0.78rem',
                            fontWeight: isSelected ? 800 : 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          <span>{isSelected ? '✓' : '+'}</span>
                          <span>{item.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: '0.35rem' }}>Imagem da Estampa (PNG Transparente)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={editingPrint.image_url}
                    onChange={e => setEditingPrint({ ...editingPrint, image_url: e.target.value })}
                    style={{ flex: 1, padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', fontSize: '0.85rem' }}
                  />
                  <label style={{ padding: '0.6rem 0.9rem', backgroundColor: 'var(--primary)', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}>
                    {uploadingImage ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'edit_print')} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                onClick={() => setEditingPrint(null)}
                style={{ padding: '0.65rem 1.25rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--foreground)', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdatePrint}
                disabled={saving}
                style={{ padding: '0.65rem 1.5rem', borderRadius: '6px', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
