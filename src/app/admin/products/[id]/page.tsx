"use client"

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ArrowLeft, Save, Upload, Loader2, X, Trash2, CheckCircle2, Circle } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { useAdminAuth } from '@/context/AdminAuthContext'

const compressImage = async (file: File): Promise<File | Blob> => {
  if (!file.type.startsWith('image/')) return file
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_WIDTH = 1200
        const MAX_HEIGHT = 1200
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width)
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height)
            height = MAX_HEIGHT
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (ctx) ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                type: 'image/webp',
                lastModified: Date.now()
              })
              resolve(compressedFile)
            } else {
              resolve(file)
            }
          },
          'image/webp',
          0.8
        )
      }
      img.onerror = () => resolve(file)
    }
    reader.onerror = () => resolve(file)
  })
}

export default function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const pathname = usePathname()
  const { store } = useAdminAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [productId, setProductId] = useState('')

  const isPartMode = pathname?.includes('/admin/parts/')
  const isServicesModel = store?.settings?.layout_model === 'services'
  const isLawyerLayout = ['lawyer', 'advocacia', 'advocacy', 'electrician'].includes(store?.settings?.layout_model)
  const isServicesOnly = isPartMode ? false : (isLawyerLayout || isServicesModel)
  const isServiceType = isServicesOnly && !isPartMode

  const [images, setImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [hasVariations, setHasVariations] = useState(false)

  const L = {
    singular: isLawyerLayout ? 'Serviço' : (isPartMode ? 'Peça' : 'Produto'),
    plural: isLawyerLayout ? 'Serviços' : (isPartMode ? 'Peças' : 'Produtos'),
    nameLabel: isLawyerLayout ? 'Nome do Serviço' : (isPartMode ? 'Nome da Peça' : 'Nome do Produto'),
    categoryLabel: isLawyerLayout ? 'Área de Atuação (Categoria)' : 'Categoria',
    categoryPlaceholder: isLawyerLayout ? 'Selecione uma área...' : 'Selecione uma categoria...',
    priceSection: isLawyerLayout ? 'Valores e Parâmetros' : 'Tipo de Produto e Preço',
    priceLabel: isLawyerLayout ? 'Honorários a partir de (R$)' : (hasVariations ? 'Preço Base (R$)' : 'Preço de Venda (R$)'),
    descPlaceholder: isLawyerLayout ? 'Descreva os termos e o escopo de atuação do serviço...' : (isPartMode ? 'Descreva as características da peça...' : 'Descreva as características do produto...'),
    imagesLabel: isLawyerLayout ? 'Imagens do Serviço' : (isPartMode ? 'Imagens da Peça' : 'Imagens do Produto'),
    saveLabel: isLawyerLayout ? 'Salvar Serviço' : (isPartMode ? 'Salvar Peça' : 'Salvar Alterações'),
    pageTitle: isLawyerLayout ? 'Editar Serviço' : (isPartMode ? 'Editar Peça' : 'Editar Produto'),
    deleteLabel: isLawyerLayout ? 'Excluir Serviço' : (isPartMode ? 'Excluir Peça' : 'Excluir Produto'),
    confirmDelete: isLawyerLayout ? 'Tem certeza que deseja excluir este serviço?' : (isPartMode ? 'Tem certeza que deseja excluir esta peça?' : 'Tem certeza que deseja excluir este produto?'),
    deletedMsg: isLawyerLayout ? 'Serviço excluído!' : (isPartMode ? 'Peça excluída!' : 'Produto excluído!'),
    updatedMsg: isLawyerLayout ? 'Serviço atualizado com sucesso!' : (isPartMode ? 'Peça atualizada com sucesso!' : 'Produto atualizado com sucesso!'),
  }
  const [variationOptions, setVariationOptions] = useState<{ name: string, valuesString: string }[]>([
    { name: isServicesOnly ? 'Duração' : 'Tamanho', valuesString: isServicesOnly ? '1 hora, 2 horas' : 'P, M, G' }
  ])
  const [variationSkus, setVariationSkus] = useState<any[]>([])
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    short_description: '',
    description: '',
    stock_quantity: '0',
    sku: '',
    category: '',
    sale_price: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    is_active: true,
    is_featured: false
  })

  useEffect(() => {
    if (store) {
      params.then(p => {
        setProductId(p.id)
        fetchProduct(p.id, store.id)
      })
    }
  }, [params, store])

  const fetchProduct = async (id: string, storeId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('store_id', storeId)
        .single()

      if (error) throw error

      setFormData({
        name: data.name,
        price: data.price.toString(),
        short_description: data.short_description || '',
        description: data.description || '',
        stock_quantity: data.stock_quantity.toString(),
        sku: data.sku || '',
        category: data.category || '',
        sale_price: data.sale_price?.toString() || '',
        weight: data.weight?.toString() || '',
        length: data.length?.toString() || '',
        width: data.width?.toString() || '',
        height: data.height?.toString() || '',
        is_active: data.is_active ?? true,
        is_featured: data.is_featured ?? false
      })
      setHasVariations(data.has_variations ?? false)
      const loadedOpts = data.variation_options || []
      setVariationOptions(loadedOpts.length > 0 ? loadedOpts.map((o: any) => ({ name: o.name, valuesString: (o.values || []).join(', ') })) : [
        { name: 'Tamanho', valuesString: 'P, M, G' }
      ])
      setVariationSkus(data.variation_skus || [])
      setExistingImages(data.images || [])

      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .eq('store_id', storeId)
        .order('name')
      setCategories(catData || [])
    } catch (error: any) {
      toast.error('Erro ao carregar produto: ' + error.message)
      router.push('/admin/products')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setImages([...images, ...newFiles])
      const newPreviews = newFiles.map(file => URL.createObjectURL(file))
      setPreviews([...previews, ...newPreviews])
    }
  }

  const removeExistingImage = (url: string) => {
    setExistingImages(existingImages.filter(img => img !== url))
  }

  const removeNewImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
    setPreviews(previews.filter((_, i) => i !== index))
  }

  const handleDragStart = (index: number) => { setDraggedIndex(index) }
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault() }
  const handleDrop = (index: number) => {
    if (draggedIndex === null) return
    const newImages = [...existingImages]
    const [draggedItem] = newImages.splice(draggedIndex, 1)
    newImages.splice(index, 0, draggedItem)
    setExistingImages(newImages)
    setDraggedIndex(null)
  }

  const generateCombinations = () => {
    const validOptions = variationOptions
      .map(o => ({
        name: o.name.trim(),
        values: o.valuesString.split(',').map(v => v.trim()).filter(Boolean)
      }))
      .filter(o => o.name && o.values.length > 0)

    if (validOptions.length === 0) {
      setVariationSkus([])
      toast.error('Adicione pelo menos uma opção com valores válidos.')
      return
    }

    const combine = (options: { name: string, values: string[] }[], index = 0, current: { [key: string]: string } = {}): { [key: string]: string }[] => {
      if (index === options.length) return [current]
      const opt = options[index]
      const result: { [key: string]: string }[] = []
      for (const val of opt.values) {
        result.push(...combine(options, index + 1, { ...current, [opt.name]: val }))
      }
      return result
    }

    const combos = combine(validOptions)
    const basePrice = formData.price ? parseFloat(formData.price) : 0

    const newSkus = combos.map(combo => {
      const existing = variationSkus.find(ex => JSON.stringify(ex.combination) === JSON.stringify(combo))
      if (existing) return existing
      const comboSlug = Object.values(combo).join('-').toUpperCase()
      return {
        sku: formData.sku ? `${formData.sku}-${comboSlug}` : `${comboSlug}`,
        combination: combo,
        price: basePrice,
        sale_price: null,
        stock_quantity: 10
      }
    })

    setVariationSkus(newSkus)
    toast.success('Combinações geradas com sucesso!')
  }

  const handleDelete = () => {
    setShowDeleteModal(true)
  }

  const executeDelete = async () => {
    if (!store) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('store_id', store.id)
      if (error) throw error
      toast.success(L.deletedMsg)
      router.push('/admin/products')
    } catch (error: any) {
      toast.error('Erro ao excluir: ' + error.message)
      setSaving(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!store) { toast.error('Loja não autenticada.'); return }
    setSaving(true)

    try {
      const newUrls = []
      for (const file of images) {
        const compressed = await compressImage(file)
        const fileName = `${Math.random()}.webp`
        const filePath = `${store.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, compressed)
        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath)
        newUrls.push(publicUrl)
      }

      const allImages = [...existingImages, ...newUrls]
      const parsedVariationOptions = variationOptions
        .map(o => ({ name: o.name.trim(), values: o.valuesString.split(',').map(v => v.trim()).filter(Boolean) }))
        .filter(o => o.name && o.values.length > 0)

      const updatePayload: any = {
        name: formData.name,
        slug: formData.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        price: parseFloat(formData.price) || 0,
        short_description: formData.short_description,
        description: formData.description,
        stock_quantity: hasVariations ? 0 : (parseInt(formData.stock_quantity) || 0),
        sku: formData.sku,
        category: formData.category,
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        length: formData.length ? parseFloat(formData.length) : null,
        width: formData.width ? parseFloat(formData.width) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        images: allImages,
        has_variations: hasVariations,
        variation_options: parsedVariationOptions,
        variation_skus: variationSkus,
      }

      const { error } = await supabase
        .from('products')
        .update(updatePayload)
        .eq('id', productId)
        .eq('store_id', store.id)

      if (error) throw error

      toast.success(L.updatedMsg)
      router.push('/admin/products')
    } catch (error: any) {
      toast.error('Erro ao salvar: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
      <Loader2 className="animate-spin" size={32} />
    </div>
  )

  return (
    <div style={{ width: '100%', maxWidth: '1400px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/admin/products" style={{ color: 'var(--muted)' }}>
            <ArrowLeft size={20} />
          </Link>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>{L.pageTitle}</h1>
        </div>
        <button onClick={handleDelete} className="btn-danger">
          <Trash2 size={20} />
          <span>{L.deleteLabel}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>

        {/* Linha Principal: Duas colunas */}
        <div style={{ display: 'flex', gap: '2rem', width: '100%', alignItems: 'flex-start' }} className="product-form-layout">

          {/* Coluna Esquerda */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: 'calc(40% - 1rem)', flexShrink: 0 }} className="form-col-left">

            {/* Card: Informações Principais */}
            <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                Informações Principais
              </h3>

              <div className="form-group">
                <label>{L.nameLabel}</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div style={{ display: isServicesOnly ? 'block' : 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {!isServicesOnly && (
                  <div className="form-group">
                    <label>SKU (Código)</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({...formData, sku: e.target.value})}
                      placeholder="EX: TN-BLU-42"
                    />
                  </div>
                )}
                <div className="form-group">
                  <label>{L.categoryLabel}</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="" disabled>{L.categoryPlaceholder}</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Card: Tipo e Preço */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  {L.priceSection}
                </h3>

                {!isServicesOnly && (
                  <div className="form-group">
                    <label>Estrutura do Produto</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', border: !hasVariations ? '2px solid var(--primary)' : '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', backgroundColor: !hasVariations ? 'rgba(99, 102, 241, 0.05)' : 'transparent' }}>
                        <input type="radio" checked={!hasVariations} onChange={() => setHasVariations(false)} hidden />
                        <div style={{ fontWeight: 700 }}>Produto Simples</div>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', border: hasVariations ? '2px solid var(--primary)' : '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', backgroundColor: hasVariations ? 'rgba(99, 102, 241, 0.05)' : 'transparent' }}>
                        <input type="radio" checked={hasVariations} onChange={() => setHasVariations(true)} hidden />
                        <div style={{ fontWeight: 700 }}>Com Variações (Cores, Tamanhos...)</div>
                      </label>
                    </div>
                  </div>
                )}

                <div style={{ display: isServicesOnly ? 'block' : 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>{L.priceLabel}</label>
                    <input
                      type="number"
                      step="0.01"
                      required={!isServicesOnly}
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      style={{ width: '100%' }}
                    />
                  </div>
                  {!isServicesOnly && !hasVariations && (
                    <div className="form-group">
                      <label>Qtd. em Estoque</label>
                      <input
                        type="number"
                        required
                        value={formData.stock_quantity}
                        onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
                        style={{ width: '100%' }}
                      />
                    </div>
                  )}
                </div>

                {!hasVariations && (
                  <div className="form-group">
                    <label>Preço Promocional (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.sale_price}
                      onChange={(e) => setFormData({...formData, sale_price: e.target.value})}
                      placeholder="Deixe em branco se não houver promoção"
                      style={{ width: '100%' }}
                    />
                  </div>
                )}

                {/* Opções de Variação */}
                {!isServicesOnly && hasVariations && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontWeight: 700, margin: 0 }}>Opções de Variação</h4>
                      <button
                        type="button"
                        onClick={() => setVariationOptions([...variationOptions, { name: '', valuesString: '' }])}
                        style={{ padding: '0.5rem 1rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                      >
                        + Adicionar Opção
                      </button>
                    </div>

                    {variationOptions.map((opt, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '1rem', alignItems: 'flex-end', background: 'rgba(255,255,255,0.02)', padding: '1.25rem 1rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
                        <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                          <label style={{ lineHeight: 1.2, marginBottom: '0.25rem' }}>Nome (Ex: Tamanho)</label>
                          <input
                            type="text"
                            value={opt.name}
                            onChange={e => {
                              const newO = [...variationOptions]
                              newO[i].name = e.target.value
                              setVariationOptions(newO)
                            }}
                            placeholder="Ex: Cor"
                          />
                        </div>
                        <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                          <label style={{ lineHeight: 1.2, marginBottom: '0.25rem' }}>Valores (separe por vírgula)</label>
                          <input
                            type="text"
                            value={opt.valuesString}
                            onChange={e => {
                              const newO = [...variationOptions]
                              newO[i].valuesString = e.target.value
                              setVariationOptions(newO)
                            }}
                            placeholder="Ex: P, M, G ou Azul, Preto"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setVariationOptions(variationOptions.filter((_, idx) => idx !== i))}
                          style={{ height: '45px', width: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={generateCombinations}
                      style={{ padding: '0.8rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', textAlign: 'center' }}
                    >
                      Gerar / Atualizar Tabela de Variações
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
          {/* FIM Coluna Esquerda */}

          {/* Coluna Direita */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: 'calc(60% - 1rem)', flexShrink: 0 }} className="form-col-right">

            {/* Card: Status e Visibilidade */}
            <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Status e Visibilidade</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <label className="toggle-item">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    hidden
                  />
                  {formData.is_active ? <CheckCircle2 size={20} color="#22c55e" /> : <Circle size={20} color="var(--muted)" />}
                  <span>Produto Ativo na Loja</span>
                </label>
                <label className="toggle-item">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                    hidden
                  />
                  {formData.is_featured ? <CheckCircle2 size={20} color="#f59e0b" /> : <Circle size={20} color="var(--muted)" />}
                  <span>Destaque na Home</span>
                </label>
              </div>
            </div>

            {/* Card: Descrições */}
            <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="form-group">
                <label>{isServicesOnly ? 'Breve Descrição' : 'Breve Descrição (Exibida perto do preço)'}</label>
                <textarea
                  rows={4}
                  value={formData.short_description}
                  onChange={(e) => setFormData({...formData, short_description: e.target.value})}
                  placeholder={isServicesOnly ? 'Ex: Divórcio consensual amigável com partilha de bens.' : 'Ex: Tênis ideal para corrida com amortecimento avançado.'}
                />
              </div>
              <div className="form-group">
                <label>Descrição Detalhada</label>
                <textarea
                  rows={12}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder={L.descPlaceholder}
                />
              </div>
            </div>

            {/* Card: Imagens */}
            <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                {L.imagesLabel}
              </h3>
              <div className="form-group">
                <label>Imagens</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem' }}>
                  {existingImages.map((url, index) => (
                    <div
                      key={`ex-${index}`}
                      className="image-preview"
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(index)}
                      style={{ cursor: 'grab', opacity: draggedIndex === index ? 0.5 : 1 }}
                    >
                      <img src={url} alt="" />
                      <button type="button" onClick={() => removeExistingImage(url)}><X size={14} /></button>
                      {index === 0 && <div className="main-image-badge">CAPA</div>}
                    </div>
                  ))}
                  {previews.map((url, index) => (
                    <div key={`new-${index}`} className="image-preview" style={{ border: '2px solid var(--primary)' }}>
                      <img src={url} alt="" />
                      <button type="button" onClick={() => removeNewImage(index)}><X size={14} /></button>
                    </div>
                  ))}
                  <label className="image-upload-btn">
                    <Upload size={24} />
                    <input type="file" multiple accept="image/*" hidden onChange={handleImageChange} />
                  </label>
                </div>
              </div>
            </div>

            {/* Card: Logística (apenas produtos físicos) */}
            {!isServicesOnly && (
              <div className="glass-card">
                <div style={{ padding: '2.5rem', display: 'grid', gap: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                    Logística e Dimensões
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Peso (kg)</label>
                      <input type="number" step="0.001" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} placeholder="0.000" style={{ width: '100%' }} />
                    </div>
                    <div className="form-group">
                      <label>Comp. (cm)</label>
                      <input type="number" step="0.1" value={formData.length} onChange={(e) => setFormData({...formData, length: e.target.value})} placeholder="0" style={{ width: '100%' }} />
                    </div>
                    <div className="form-group">
                      <label>Larg. (cm)</label>
                      <input type="number" step="0.1" value={formData.width} onChange={(e) => setFormData({...formData, width: e.target.value})} placeholder="0" style={{ width: '100%' }} />
                    </div>
                    <div className="form-group">
                      <label>Alt. (cm)</label>
                      <input type="number" step="0.1" value={formData.height} onChange={(e) => setFormData({...formData, height: e.target.value})} placeholder="0" style={{ width: '100%' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
          {/* FIM Coluna Direita */}

        </div>
        {/* FIM Linha Principal */}

        {/* Tabela de Variações em largura total */}
        {variationSkus.length > 0 && (
          <div className="glass-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Tabela de Variações e Estoque</h3>
              <span style={{ fontSize: '0.9rem', color: 'var(--muted)', background: 'var(--background)', padding: '0.4rem 0.8rem', borderRadius: '20px', border: '1px solid var(--border)' }}>
                {variationSkus.length} {variationSkus.length === 1 ? 'combinação gerada' : 'combinações geradas'}
              </span>
            </div>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {variationSkus.map((skuObj, skuIdx) => (
                <div key={skuIdx} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.2fr 1fr 1fr 1fr 2fr auto', gap: '1.5rem', alignItems: 'flex-end', background: 'var(--background)', padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '12px' }}>
                  <div className="form-group" style={{ height: '45px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Variação</label>
                    <div style={{ fontWeight: 800, fontSize: '1rem' }}>
                      {Object.entries(skuObj.combination).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                    </div>
                  </div>
                  <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                    <label style={{ lineHeight: 1.2, marginBottom: '0.25rem' }}>SKU</label>
                    <input
                      type="text"
                      value={skuObj.sku}
                      onChange={e => {
                        const newS = [...variationSkus]
                        newS[skuIdx].sku = e.target.value
                        setVariationSkus(newS)
                      }}
                      placeholder="SKU"
                    />
                  </div>
                  <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                    <label style={{ lineHeight: 1.2, marginBottom: '0.25rem' }}>Preço (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={skuObj.price}
                      onChange={e => {
                        const newS = [...variationSkus]
                        newS[skuIdx].price = parseFloat(e.target.value) || 0
                        setVariationSkus(newS)
                      }}
                    />
                  </div>
                  <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                    <label style={{ lineHeight: 1.2, marginBottom: '0.25rem' }}>Promocional (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={skuObj.sale_price || ''}
                      onChange={e => {
                        const newS = [...variationSkus]
                        newS[skuIdx].sale_price = e.target.value ? parseFloat(e.target.value) : null
                        setVariationSkus(newS)
                      }}
                      placeholder="Sem desc."
                    />
                  </div>
                  <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                    <label style={{ lineHeight: 1.2, marginBottom: '0.25rem' }}>Estoque</label>
                    <input
                      type="number"
                      value={skuObj.stock_quantity}
                      onChange={e => {
                        const newS = [...variationSkus]
                        newS[skuIdx].stock_quantity = parseInt(e.target.value) || 0
                        setVariationSkus(newS)
                      }}
                    />
                  </div>
                  <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                    <label style={{ lineHeight: 1.2, marginBottom: '0.25rem' }}>Imagem da Variação</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        value={skuObj.image_url || ''}
                        onChange={e => {
                          const newS = [...variationSkus]
                          newS[skuIdx].image_url = e.target.value
                          setVariationSkus(newS)
                        }}
                        placeholder="URL da imagem"
                      />
                      <label style={{ height: '45px', padding: '0 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary)', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        <Upload size={18} />
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            try {
                              const compressed = await compressImage(file)
                              const fileName = `var-${Math.random()}.webp`
                              const filePath = `variations/${fileName}`
                              const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, compressed)
                              if (uploadError) throw uploadError
                              const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(filePath)
                              const newS = [...variationSkus]
                              newS[skuIdx].image_url = publicUrl
                              setVariationSkus(newS)
                              toast.success('Imagem da variação enviada!')
                            } catch(err: any) {
                              toast.error('Erro ao enviar imagem: ' + err.message)
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVariationSkus(variationSkus.filter((_, idx) => idx !== skuIdx))}
                    style={{ height: '45px', width: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="glass-card" style={{ padding: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1.5rem', width: '100%' }}>
          <button type="button" onClick={() => router.back()} className="btn-secondary" style={{ width: '200px' }}>
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="btn-primary" style={{ width: '250px' }}>
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {saving ? 'Salvando...' : L.saveLabel}
          </button>
        </div>

      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}>
          <div className="glass-card" style={{
            maxWidth: '400px',
            width: '100%',
            padding: '2.5rem',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '1.5rem'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Trash2 size={30} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--foreground)' }}>Excluir {L.singular}</h2>
              <p style={{ color: 'var(--muted)', fontSize: '0.975rem', lineHeight: 1.5, margin: 0 }}>
                {L.confirmDelete}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary"
                style={{ flex: 1, padding: '0.875rem', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowDeleteModal(false)
                  await executeDelete()
                }}
                className="btn-danger"
                style={{ flex: 1, padding: '0.875rem', justifyContent: 'center', cursor: 'pointer' }}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        label { font-size: 0.875rem; font-weight: 500; color: var(--muted); }
        input, textarea, select { width: 100%; background: var(--input-bg); border: 1px solid var(--border); border-radius: 8px; padding: 0.75rem 1rem; color: var(--foreground); outline: none; font-size: 1.05rem; font-family: inherit; }
        select { appearance: none; background-repeat: no-repeat; background-position: right 1rem center; background-size: 1.25rem; padding-right: 2.5rem !important; cursor: pointer; }
        input:focus, textarea:focus, select:focus { border-color: var(--primary); }
        .image-preview { position: relative; aspect-ratio: 1/1; border-radius: 8px; overflow: hidden; background: var(--background); border: 1px solid var(--border); }
        .image-preview img { width: 100%; height: 100%; object-fit: cover; }
        .image-preview button { position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.6); border: none; padding: 4px; border-radius: 50%; color: white; cursor: pointer; z-index: 2; }
        .main-image-badge { position: absolute; bottom: 0; left: 0; right: 0; background: var(--primary); color: white; font-size: 10px; font-weight: 800; text-align: center; padding: 2px 0; }
        .image-upload-btn { aspect-ratio: 1/1; border: 2px dashed var(--border); border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--muted); }
        .toggle-item { display: flex; align-items: center; gap: 0.75rem; cursor: pointer; padding: 0.75rem; border-radius: 8px; background: var(--background); border: 1px solid var(--border); }
        .toggle-item:hover { background: var(--card); }
        .btn-primary { padding: 1rem; background: var(--primary); color: white; border-radius: 8px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 0.5rem; border: none; cursor: pointer; transition: all 0.2s ease; }
        .btn-primary:hover { background: var(--primary-hover); }
        .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
        .btn-secondary { padding: 1rem; background: #f1f5f9; color: var(--foreground); border: 1px solid #cbd5e1; border-radius: 8px; cursor: pointer; font-weight: 600; }
        .btn-secondary:hover { background: #e2e8f0; border-color: #94a3b8; }
        .btn-danger { padding: 0.5rem 1rem; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: none; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        /* Media queries for edit product responsivity */
        @media (max-width: 768px) {
          .product-form-layout {
            flex-direction: column !important;
            gap: 1.5rem !important;
          }
          .form-col-left, .form-col-right {
            width: 100% !important;
          }
          
          /* Adjust layout details inside grid cards */
          div[style*="gridTemplateColumns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
          div[style*="gridTemplateColumns: 1.5fr 1.2fr 1fr 1fr 2fr auto"] {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
            padding: 1rem !important;
          }
          
          /* Action buttons card */
          div[style*="justifyContent: flex-end"] {
            flex-direction: column !important;
            width: 100% !important;
            gap: 1rem !important;
          }
          .btn-primary, .btn-secondary {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  )
}
