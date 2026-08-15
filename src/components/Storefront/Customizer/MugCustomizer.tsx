"use client"

import { useState, useRef, useEffect, useMemo } from 'react'
import { Coffee, Check, ShoppingCart, Sparkles, ZoomIn, ZoomOut, MessageCircle, Maximize2, Minimize2 } from 'lucide-react'
import { addToCart } from '@/lib/cartStore'
import toast from 'react-hot-toast'

interface BaseColor {
  id: string
  name: string
  hex: string
  image_url?: string
  image_url_back?: string
}

interface PrintItem {
  id: string
  title: string
  category: string
  image_url: string
  extra_price?: number
  type?: 'shirt' | 'mug' | 'both'
}

interface MugCustomizerProps {
  product: any
  settings: any
  primaryColor?: string
  buttonRadius?: string
  onClose?: () => void
}

const DEFAULT_MUG_COLORS: BaseColor[] = [
  {
    id: 'm1',
    name: 'Caneca Branca Tradicional',
    hex: '#FFFFFF',
  },
  {
    id: 'm2',
    name: 'Caneca Alça & Interior Preto',
    hex: '#18181b',
  }
]

const DEFAULT_PRINTS: PrintItem[] = [
  {
    id: 'p1',
    title: 'Café & Código',
    category: 'Geek',
    image_url: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&auto=format&fit=crop&q=80',
    extra_price: 0,
    type: 'mug'
  },
  {
    id: 'p2',
    title: 'Frase Motivacional',
    category: 'Frases',
    image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=80',
    extra_price: 0,
    type: 'mug'
  }
]

export default function MugCustomizer({
  product,
  settings,
  primaryColor = '#6366f1',
  buttonRadius = '8px',
  onClose
}: MugCustomizerProps) {
  const baseColors: BaseColor[] = (settings?.customizer_mug_colors && settings.customizer_mug_colors.length > 0)
    ? settings.customizer_mug_colors
    : DEFAULT_MUG_COLORS

  // Filter prints strictly meant for Mugs (type === 'mug' or type === 'both')
  const prints: PrintItem[] = useMemo(() => {
    const raw: PrintItem[] = (settings?.customizer_prints && settings.customizer_prints.length > 0)
      ? settings.customizer_prints
      : DEFAULT_PRINTS
    const filtered = raw.filter((p: any) => p.type === 'mug' || p.type === 'both')
    return filtered.length > 0 ? filtered : DEFAULT_PRINTS
  }, [settings])

  const [selectedColor, setSelectedColor] = useState<BaseColor>(baseColors[0] || DEFAULT_MUG_COLORS[0])
  const [selectedPrint, setSelectedPrint] = useState<PrintItem | null>(prints[0] || null)
  
  const [scale, setScale] = useState<number>(0.90) // Full height sublimation scale by default
  const [fitMode, setFitMode] = useState<'cover' | 'contain'>('cover') // Default: Full-Wrap Sublimation
  const [activeCategory, setActiveCategory] = useState<string>('Todas')
  const [quantity, setQuantity] = useState<number>(1)
  const [addingToCart, setAddingToCart] = useState(false)

  const canvasFrontRef = useRef<HTMLCanvasElement | null>(null)
  const canvasBackRef = useRef<HTMLCanvasElement | null>(null)

  const categories = useMemo(() => {
    const cats = Array.from(new Set(prints.map(p => p.category)))
    return ['Todas', ...cats]
  }, [prints])

  const filteredPrints = useMemo(() => {
    if (activeCategory === 'Todas') return prints
    return prints.filter(p => p.category === activeCategory)
  }, [prints, activeCategory])

  const activePrintUrl = selectedPrint?.image_url || ''

  // Photorealistic 3D Vector Ceramic Mug Generator
  const draw3DMugBase = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    isBackView: boolean,
    hexColor: string
  ) => {
    // Soft studio background gradient
    const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 40, width / 2, height / 2, width * 0.65)
    bgGrad.addColorStop(0, '#ffffff')
    bgGrad.addColorStop(1, '#f1f5f9')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, width, height)

    // Mug Dimensions
    const bodyW = width * 0.48
    const bodyH = height * 0.62
    const bodyX = (width - bodyW) / 2 + (isBackView ? 22 : -22)
    const bodyY = (height - bodyH) / 2 + 6

    const isBlackMug = hexColor === '#18181b' || hexColor === '#000000' || hexColor.toLowerCase() === 'black'

    // 1. Ceramic Handle
    const handleX = isBackView ? bodyX - 25 : bodyX + bodyW + 25
    const handleY = bodyY + bodyH * 0.20
    const handleR = bodyH * 0.25

    ctx.save()
    ctx.beginPath()
    ctx.arc(handleX, handleY + handleR, handleR, -Math.PI * 0.48, Math.PI * 0.48, isBackView)
    ctx.lineWidth = 26
    ctx.strokeStyle = isBlackMug ? '#27272a' : '#cbd5e1'
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(handleX, handleY + handleR, handleR, -Math.PI * 0.48, Math.PI * 0.48, isBackView)
    ctx.lineWidth = 20
    ctx.strokeStyle = isBlackMug ? '#18181b' : '#ffffff'
    ctx.stroke()
    ctx.restore()

    // 2. Ceramic Mug Body Cylinder
    ctx.save()
    ctx.beginPath()
    ctx.roundRect(bodyX, bodyY, bodyW, bodyH, [4, 4, 16, 16])

    const bodyGrad = ctx.createLinearGradient(bodyX, bodyY, bodyX + bodyW, bodyY)
    if (isBlackMug) {
      bodyGrad.addColorStop(0, '#09090b')
      bodyGrad.addColorStop(0.15, '#27272a')
      bodyGrad.addColorStop(0.45, '#3f3f46')
      bodyGrad.addColorStop(0.75, '#27272a')
      bodyGrad.addColorStop(1, '#09090b')
    } else {
      bodyGrad.addColorStop(0, '#d1d5db')
      bodyGrad.addColorStop(0.12, '#f9fafb')
      bodyGrad.addColorStop(0.35, '#ffffff')
      bodyGrad.addColorStop(0.70, '#f9fafb')
      bodyGrad.addColorStop(1, '#e5e7eb')
    }
    ctx.fillStyle = bodyGrad
    ctx.fill()

    // 3. Top Rim Opening (Interior Color)
    ctx.beginPath()
    ctx.ellipse(bodyX + bodyW / 2, bodyY, bodyW / 2, 10, 0, 0, Math.PI * 2)
    ctx.fillStyle = isBlackMug ? '#09090b' : '#e5e7eb'
    ctx.fill()

    ctx.beginPath()
    ctx.ellipse(bodyX + bodyW / 2, bodyY, bodyW / 2 - 3, 8, 0, 0, Math.PI * 2)
    ctx.fillStyle = isBlackMug ? '#18181b' : '#ffffff'
    ctx.fill()
    ctx.restore()

    return { bodyX, bodyY, bodyW, bodyH }
  }

  // Advanced 3D Sublimation Mug Mockup Renderer
  const drawMugCanvas = (
    canvas: HTMLCanvasElement,
    colorObj: BaseColor,
    printUrl: string,
    currentScale: number,
    currentFitMode: 'cover' | 'contain',
    isBackView: boolean = false
  ) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Render 3D Vector Ceramic Base
    const { bodyX, bodyY, bodyW, bodyH } = draw3DMugBase(
      ctx,
      canvas.width,
      canvas.height,
      isBackView,
      colorObj.hex
    )

    if (!printUrl) return

    const printImg = new Image()
    printImg.crossOrigin = 'anonymous'
    printImg.src = printUrl

    printImg.onload = () => {
      // Calculate Sublimation Zone inside Mug Body
      const subMarginY = bodyH * 0.05
      const subMarginX = bodyW * 0.04

      const targetW = (bodyW - (subMarginX * 2)) * currentScale
      const targetH = (bodyH - (subMarginY * 2)) * currentScale

      const cx = bodyX + (bodyW / 2)
      const cy = bodyY + (bodyH / 2)

      let printX = 0
      let printY = 0
      let printW = 0
      let printH = 0

      let sx = 0
      let sy = 0
      let sw = printImg.width
      let sh = printImg.height

      if (currentFitMode === 'cover') {
        // Full-Wrap Sublimation: fills the entire vertical height & width of the mug body
        printW = targetW
        printH = targetH
        printX = cx - (printW / 2)
        printY = cy - (printH / 2)

        const imgAspect = printImg.width / printImg.height
        const targetAspect = targetW / targetH

        if (imgAspect > targetAspect) {
          // Image is wider: crop sides to fill full height cleanly
          sw = printImg.height * targetAspect
          sx = (printImg.width - sw) / 2
        } else {
          // Image is taller: crop top/bottom to fill full width cleanly
          sh = printImg.width / targetAspect
          sy = (printImg.height - sh) / 2
        }
      } else {
        // Contain mode: scaled proportionally to fill max height/width without cropping
        const imgAspect = printImg.width / printImg.height
        const targetAspect = targetW / targetH

        if (imgAspect > targetAspect) {
          printW = targetW
          printH = printW / imgAspect
        } else {
          printH = targetH
          printW = printH * imgAspect
        }

        printX = cx - (printW / 2)
        printY = cy - (printH / 2)
      }

      ctx.save()

      // 1. Clip to Mug Body shape so ink doesn't bleed outside ceramic mug body
      ctx.beginPath()
      ctx.roundRect(bodyX + 2, bodyY + 3, bodyW - 4, bodyH - 6, [3, 3, 14, 14])
      ctx.clip()

      // 2. Multiply Composite Blend Mode:
      // Makes white ceramic highlights, shadows and reflections blend into ink
      ctx.globalCompositeOperation = 'multiply'

      if (currentFitMode === 'cover') {
        ctx.drawImage(printImg, sx, sy, sw, sh, printX, printY, printW, printH)
      } else {
        ctx.drawImage(printImg, printX, printY, printW, printH)
      }

      // 3. 3D Cylindrical Lighting & Ceramic Reflection Overlay
      ctx.globalCompositeOperation = 'source-over'

      const shadeGrad = ctx.createLinearGradient(bodyX, bodyY, bodyX + bodyW, bodyY)
      shadeGrad.addColorStop(0, 'rgba(0, 0, 0, 0.30)')       // Left curved edge shadow
      shadeGrad.addColorStop(0.12, 'rgba(0, 0, 0, 0.04)')    // Smooth transition
      shadeGrad.addColorStop(0.38, 'rgba(255, 255, 255, 0.40)') // Ceramic glossy highlight
      shadeGrad.addColorStop(0.70, 'rgba(0, 0, 0, 0.04)')    // Smooth transition
      shadeGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.35)')     // Right curved edge shadow

      ctx.fillStyle = shadeGrad
      ctx.fillRect(bodyX, bodyY, bodyW, bodyH)

      ctx.restore()
    }
  }

  // Render Canvas for Front View
  useEffect(() => {
    if (canvasFrontRef.current) {
      drawMugCanvas(
        canvasFrontRef.current,
        selectedColor,
        activePrintUrl,
        scale,
        fitMode,
        false
      )
    }
  }, [selectedColor, activePrintUrl, scale, fitMode])

  // Render Canvas for Back View
  useEffect(() => {
    if (canvasBackRef.current) {
      drawMugCanvas(
        canvasBackRef.current,
        selectedColor,
        activePrintUrl,
        scale,
        fitMode,
        true
      )
    }
  }, [selectedColor, activePrintUrl, scale, fitMode])

  const calculatedPrice = useMemo(() => {
    const basePrice = Number(product?.price || 0)
    const extraPrice = selectedPrint?.extra_price || 0
    return basePrice + extraPrice
  }, [product, selectedPrint])

  const storePhone = settings?.phone || settings?.whatsapp || ''
  const cleanPhone = storePhone.replace(/\D/g, '')
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Olá! Gostaria de solicitar uma estampa/caneca personalizada exclusiva para o produto "${product?.name || 'Caneca'}"`)}`

  const handleAddToCart = () => {
    if (!product) return
    setAddingToCart(true)

    try {
      // Merge front and back canvases into one combined preview image
      const combinedCanvas = document.createElement('canvas')
      combinedCanvas.width = 800
      combinedCanvas.height = 400
      const ctx = combinedCanvas.getContext('2d')

      if (ctx && canvasFrontRef.current && canvasBackRef.current) {
        // Draw clean background
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, 800, 400)

        // Draw Front Canvas on left
        ctx.drawImage(canvasFrontRef.current, 0, 0, 400, 400)
        // Draw Back Canvas on right
        ctx.drawImage(canvasBackRef.current, 400, 0, 400, 400)

        // Add labels
        ctx.fillStyle = '#18181b'
        ctx.font = 'bold 16px sans-serif'
        ctx.fillText('FRENTE DA CANECA', 130, 385)
        ctx.fillText('VERSO DA CANECA', 530, 385)
      }

      const previewDataUrl = combinedCanvas.toDataURL('image/png')

      addToCart({
        productId: product.id,
        name: `${product.name} (Caneca Personalizada - Frente & Verso)`,
        price: calculatedPrice,
        image: previewDataUrl || selectedColor.image_url || product.image_url,
        quantity: quantity,
        storeId: product.store_id || settings?.id || '',
        variations: {
          'Modelo Caneca': selectedColor.name,
          'Estampa': selectedPrint ? selectedPrint.title : 'Estampa Padrão'
        },
        customization: {
          color: selectedColor.name,
          colorName: selectedColor.name,
          colorHex: selectedColor.hex,
          baseImageUrl: selectedColor.image_url,
          printId: selectedPrint?.id || 'custom',
          printTitle: selectedPrint?.title || 'Estampa Personalizada',
          mockupPreviewUrl: previewDataUrl
        }
      })

      toast.success('Caneca personalizada adicionada ao carrinho!')
      if (onClose) onClose()
    } catch (err) {
      console.error(err)
      toast.error('Erro ao adicionar produto ao carrinho.')
    } finally {
      setAddingToCart(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1100px',
        maxHeight: '92vh',
        backgroundColor: 'var(--background, #ffffff)',
        color: 'var(--foreground, #09090b)',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid var(--border, #e4e4e7)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(99, 102, 241, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '10px', backgroundColor: primaryColor, color: '#fff' }}>
              <Coffee size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Personalizar Caneca (Frente & Verso)
                <Sparkles size={16} color="#eab308" />
              </h2>
              <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.85rem', color: 'var(--muted, #71717a)' }}>
                Simulação real 3D do produto pronto em sublimação panorâmica.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'transparent',
              border: '1px solid var(--border, #e4e4e7)',
              borderRadius: '8px',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Fechar
          </button>
        </div>

        {/* Body Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.5rem',
          padding: '1.5rem'
        }}>
          {/* Visualizador Duplo da Caneca (Frente & Verso) */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            alignItems: 'center'
          }}>
            <div style={{
              width: '100%',
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              {/* Card Frente */}
              <div style={{
                flex: '1 1 200px',
                maxWidth: '260px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: '#f8fafc',
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid var(--border, #e4e4e7)'
              }}>
                <span style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.5rem', color: '#6366f1' }}>FRENTE DA CANECA</span>
                <canvas
                  ref={canvasFrontRef}
                  width={400}
                  height={400}
                  style={{ width: '100%', height: 'auto', borderRadius: '8px', backgroundColor: '#fff', border: '1px solid var(--border)' }}
                />
              </div>

              {/* Card Verso */}
              <div style={{
                flex: '1 1 200px',
                maxWidth: '260px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: '#f8fafc',
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid var(--border, #e4e4e7)'
              }}>
                <span style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.5rem', color: '#6366f1' }}>VERSO DA CANECA</span>
                <canvas
                  ref={canvasBackRef}
                  width={400}
                  height={400}
                  style={{ width: '100%', height: 'auto', borderRadius: '8px', backgroundColor: '#fff', border: '1px solid var(--border)' }}
                />
              </div>
            </div>

            {/* Controles de Formato e Zoom da Estampa */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              alignItems: 'center',
              backgroundColor: 'var(--input-bg, #f4f4f5)',
              padding: '0.75rem 1.25rem',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '540px'
            }}>
              {/* Toggle de Modo de Preenchimento */}
              <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                <button
                  onClick={() => setFitMode('cover')}
                  style={{
                    flex: 1,
                    padding: '0.4rem 0.6rem',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    border: fitMode === 'cover' ? `2px solid ${primaryColor}` : '1px solid var(--border)',
                    backgroundColor: fitMode === 'cover' ? 'rgba(99, 102, 241, 0.12)' : '#fff',
                    color: fitMode === 'cover' ? primaryColor : 'inherit',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Maximize2 size={14} />
                  <span>Sublimação Panorâmica (Preencher)</span>
                </button>

                <button
                  onClick={() => setFitMode('contain')}
                  style={{
                    flex: 1,
                    padding: '0.4rem 0.6rem',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    border: fitMode === 'contain' ? `2px solid ${primaryColor}` : '1px solid var(--border)',
                    backgroundColor: fitMode === 'contain' ? 'rgba(99, 102, 241, 0.12)' : '#fff',
                    color: fitMode === 'contain' ? primaryColor : 'inherit',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Minimize2 size={14} />
                  <span>Ajustar ao Centro (Sem Cortar)</span>
                </button>
              </div>

              {/* Slider de Zoom */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, minWidth: '110px' }}>Tamanho da Estampa:</span>
                <button onClick={() => setScale(prev => Math.max(0.4, prev - 0.1))} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><ZoomOut size={18} /></button>
                <input
                  type="range"
                  min="0.4"
                  max="1.3"
                  step="0.05"
                  value={scale}
                  onChange={e => setScale(parseFloat(e.target.value))}
                  style={{ flex: 1, cursor: 'pointer' }}
                />
                <button onClick={() => setScale(prev => Math.min(1.3, prev + 0.1))} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><ZoomIn size={18} /></button>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: '40px', textAlign: 'right' }}>{Math.round(scale * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Configuration Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Model / Color Selector */}
            <div>
              <label style={{ fontSize: '0.9rem', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
                1. Escolha o Modelo / Cor da Caneca:
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {baseColors.map(color => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(color)}
                    style={{
                      padding: '0.6rem 1rem',
                      borderRadius: '8px',
                      border: selectedColor.id === color.id ? `2px solid ${primaryColor}` : '1px solid var(--border, #e4e4e7)',
                      backgroundColor: selectedColor.id === color.id ? 'rgba(99, 102, 241, 0.1)' : 'var(--input-bg, #f4f4f5)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <span style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: color.hex, border: '1px solid #ccc' }} />
                    <span>{color.name}</span>
                    {selectedColor.id === color.id && <Check size={14} color={primaryColor} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Print Selection */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                  2. Selecione a Estampa Única:
                </label>
              </div>

              {/* Categories */}
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '16px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      border: 'none',
                      backgroundColor: activeCategory === cat ? primaryColor : 'var(--input-bg, #f4f4f5)',
                      color: activeCategory === cat ? '#fff' : 'var(--foreground, #09090b)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Prints Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                gap: '0.75rem',
                maxHeight: '200px',
                overflowY: 'auto',
                padding: '0.5rem',
                backgroundColor: 'var(--input-bg, #f4f4f5)',
                borderRadius: '10px'
              }}>
                {filteredPrints.map(p => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPrint(p)}
                    style={{
                      aspectRatio: '1',
                      borderRadius: '8px',
                      backgroundImage: `url(${p.image_url})`,
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                      backgroundColor: '#fff',
                      cursor: 'pointer',
                      border: selectedPrint?.id === p.id ? `3px solid ${primaryColor}` : '1px solid var(--border)',
                      position: 'relative'
                    }}
                  >
                    {selectedPrint?.id === p.id && (
                      <div style={{ position: 'absolute', top: 4, right: 4, backgroundColor: primaryColor, color: '#fff', borderRadius: '50%', padding: '2px' }}>
                        <Check size={12} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Caixa de Solicitacao WhatsApp para Estampas Exclusivas */}
            <div style={{
              padding: '1rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(34, 197, 94, 0.08)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <p style={{ margin: 0, fontSize: '0.825rem', fontWeight: 600, color: 'var(--foreground)' }}>
                Para estampas exclusivas, fotos pessoais ou marcas corporativas, solicite pelo WhatsApp:
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#22c55e',
                  color: '#fff',
                  padding: '0.55rem 1rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  textDecoration: 'none'
                }}
              >
                <MessageCircle size={16} />
                SOLICITAR VIA WHATSAPP
              </a>
            </div>

            {/* Price & Quantity Footer */}
            <div style={{
              marginTop: 'auto',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Preço Total:</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: primaryColor }}>
                    R$ {calculatedPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid var(--border)', fontWeight: 700, cursor: 'pointer' }}
                  >
                    -
                  </button>
                  <span style={{ fontWeight: 700, padding: '0 0.5rem' }}>{quantity}</span>
                  <button
                    onClick={() => setQuantity(prev => prev + 1)}
                    style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid var(--border)', fontWeight: 700, cursor: 'pointer' }}
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  backgroundColor: primaryColor,
                  color: '#fff',
                  border: 'none',
                  borderRadius: buttonRadius,
                  fontWeight: 800,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)'
                }}
              >
                <ShoppingCart size={20} />
                {addingToCart ? 'ADICIONANDO...' : 'ADICIONAR CANECA AO CARRINHO'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
