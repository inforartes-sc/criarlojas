"use client"

import { useState, useRef, useEffect, useMemo } from 'react'
import { Shirt, Check, ShoppingCart, Sparkles, Layers, RotateCcw, Palette, Image as ImageIcon, ZoomIn, ZoomOut, CheckCircle2, MessageCircle } from 'lucide-react'
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
}

interface ProductCustomizerProps {
  product: any
  settings: any
  primaryColor?: string
  buttonRadius?: string
  onClose?: () => void
}

const DEFAULT_COLORS: BaseColor[] = [
  { id: '1', name: 'Branca', hex: '#FFFFFF' },
  { id: '2', name: 'Preta', hex: '#18181b' },
  { id: '3', name: 'Cinza Mescla', hex: '#9ca3af' },
  { id: '4', name: 'Vermelha', hex: '#ef4444' },
  { id: '5', name: 'Azul Marinho', hex: '#1e3a8a' },
  { id: '6', name: 'Verde Militar', hex: '#3f6212' }
]

const DEFAULT_PRINTS: PrintItem[] = [
  {
    id: 'p1',
    title: 'Caveira Rock',
    category: 'Música',
    image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=80',
    extra_price: 0
  },
  {
    id: 'p2',
    title: 'Astronauta Chill',
    category: 'Geek',
    image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
    extra_price: 0
  }
]

export default function ProductCustomizer({
  product,
  settings,
  primaryColor = '#6366f1',
  buttonRadius = '8px',
  onClose
}: ProductCustomizerProps) {
  const baseColors: BaseColor[] = (settings?.customizer_base_colors && settings.customizer_base_colors.length > 0)
    ? settings.customizer_base_colors
    : DEFAULT_COLORS

  const prints: PrintItem[] = (settings?.customizer_prints && settings.customizer_prints.length > 0)
    ? settings.customizer_prints
    : DEFAULT_PRINTS

  // Dynamically extract sizes configured in product.variation_options (e.g. "Tamanho")
  const availableSizes: string[] = useMemo(() => {
    if (product?.has_variations && Array.isArray(product?.variation_options)) {
      const sizeOpt = product.variation_options.find((opt: any) => 
        opt.name && (
          opt.name.toLowerCase().includes('tamanho') || 
          opt.name.toLowerCase().includes('size') ||
          opt.name.toLowerCase().includes('medida')
        )
      )
      if (sizeOpt && Array.isArray(sizeOpt.values) && sizeOpt.values.length > 0) {
        return sizeOpt.values
      }
      const firstOpt = product.variation_options[0]
      if (firstOpt && Array.isArray(firstOpt.values) && firstOpt.values.length > 0) {
        return firstOpt.values
      }
    }
    return ['P', 'M', 'G', 'GG', 'XG']
  }, [product])

  const [selectedColor, setSelectedColor] = useState<BaseColor>(baseColors[0] || DEFAULT_COLORS[0])
  const [frontPrint, setFrontPrint] = useState<PrintItem | null>(prints[0] || null)
  const [backPrint, setBackPrint] = useState<PrintItem | null>(null)
  const [activePrintSide, setActivePrintSide] = useState<'front' | 'back'>('front')
  const [printSize, setPrintSize] = useState<'normal' | 'grande'>('normal')
  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[0] || 'M')
  const [quantity, setQuantity] = useState<number>(1)
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas')
  const [printScale, setPrintScale] = useState<number>(1.0)
  const [generatingMockup, setGeneratingMockup] = useState<boolean>(false)

  // Ensure selectedSize is updated if availableSizes changes
  useEffect(() => {
    if (availableSizes.length > 0 && !availableSizes.includes(selectedSize)) {
      setSelectedSize(availableSizes[0])
    }
  }, [availableSizes])

  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Taxa da estampa das costas (configuração do produto, da loja ou padrão R$ 15,00)
  const backPrintBaseFee = product?.back_print_extra_price !== undefined && product?.back_print_extra_price !== null
    ? Number(product.back_print_extra_price)
    : (settings?.customizer_back_print_extra_price !== undefined && settings?.customizer_back_print_extra_price !== null
        ? Number(settings.customizer_back_print_extra_price)
        : 15.00)

  // Taxa da estampa grande (configuração da loja ou padrão R$ 10,00)
  const largePrintBaseFee = settings?.customizer_large_print_extra_price !== undefined && settings?.customizer_large_print_extra_price !== null
    ? Number(settings.customizer_large_print_extra_price)
    : 10.00

  // Categories list
  const categories = ['Todas', ...Array.from(new Set(prints.map(p => p.category)))]

  const filteredPrints = selectedCategory === 'Todas'
    ? prints
    : prints.filter(p => p.category === selectedCategory)

  const basePrice = parseFloat(product?.price || 0)
  const frontExtraPrice = frontPrint?.extra_price ? Number(frontPrint.extra_price) : 0
  const backExtraPrice = backPrint ? (Number(backPrint.extra_price || 0) + backPrintBaseFee) : 0
  const largePrintFee = printSize === 'grande' ? largePrintBaseFee : 0
  const unitPrice = basePrice + frontExtraPrice + backExtraPrice + largePrintFee
  const totalPrice = unitPrice * quantity

  const whatsappNumber = (settings?.whatsapp_number || settings?.phone || settings?.whatsapp || '').replace(/\D/g, '')
  const whatsappMsg = encodeURIComponent(`Olá! Gostaria de solicitar uma personalização especial para o produto "${product?.name || 'Camiseta'}"!`)
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${whatsappMsg}`
    : `https://api.whatsapp.com/send?text=${whatsappMsg}`

  // Estampa ativa do lado selecionado na maquete
  const activePrint = activePrintSide === 'back' ? backPrint : frontPrint

  // Draw real-time canvas mockup preview
  useEffect(() => {
    drawMockupCanvas()
  }, [selectedColor, frontPrint, backPrint, printScale, activePrintSide, printSize])

  const drawMockupCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 600
    canvas.height = 650

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const isBack = activePrintSide === 'back'
    const targetPrint = isBack ? backPrint : frontPrint

    const drawPrintOverlay = () => {
      if (targetPrint?.image_url) {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.src = targetPrint.image_url
        img.onload = () => {
          ctx.save()

          const isGrande = printSize === 'grande'
          let baseMaxW = isGrande ? 236 : 195
          let baseMaxH = isGrande ? 320 : 255

          let printWidth = baseMaxW * printScale
          let printHeight = (img.height / img.width) * printWidth
          if (printHeight > baseMaxH * printScale) {
            printHeight = baseMaxH * printScale
            printWidth = (img.width / img.height) * printHeight
          }

          let posX = 300 - printWidth / 2
          let posY = isGrande
            ? (isBack ? 235 - printHeight / 2 : 265 - printHeight / 2)
            : (isBack ? 220 - printHeight / 2 : 255 - printHeight / 2)

          // Soft fabric blend drop shadow
          ctx.shadowColor = 'rgba(0,0,0,0.25)'
          ctx.shadowBlur = 8
          ctx.drawImage(img, posX, posY, printWidth, printHeight)

          ctx.restore()
        }
      }
    }

    const targetShirtUrl = isBack
      ? (selectedColor?.image_url_back || selectedColor?.image_url)
      : selectedColor?.image_url

    if (targetShirtUrl) {
      const shirtImg = new Image()
      shirtImg.crossOrigin = 'anonymous'
      shirtImg.src = targetShirtUrl
      shirtImg.onload = () => {
        ctx.save()
        const aspect = shirtImg.width / shirtImg.height
        let drawWidth = 540
        let drawHeight = drawWidth / aspect
        if (drawHeight > 620) {
          drawHeight = 620
          drawWidth = drawHeight * aspect
        }
        const drawX = (600 - drawWidth) / 2
        const drawY = (650 - drawHeight) / 2

        ctx.drawImage(shirtImg, drawX, drawY, drawWidth, drawHeight)
        ctx.restore()

        drawPrintOverlay()
      }
      shirtImg.onerror = () => {
        drawVectorSilhouette(ctx)
        drawPrintOverlay()
      }
    } else {
      drawVectorSilhouette(ctx)
      drawPrintOverlay()
    }
  }

  const drawVectorSilhouette = (ctx: CanvasRenderingContext2D) => {
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(180, 80)
    ctx.quadraticCurveTo(300, 130, 420, 80)
    ctx.lineTo(540, 150)
    ctx.lineTo(470, 260)
    ctx.lineTo(420, 230)
    ctx.lineTo(430, 580)
    ctx.quadraticCurveTo(300, 600, 170, 580)
    ctx.lineTo(180, 230)
    ctx.lineTo(130, 260)
    ctx.lineTo(60, 150)
    ctx.closePath()

    ctx.fillStyle = selectedColor.hex
    ctx.fill()

    ctx.lineWidth = 4
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)'
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(180, 80)
    ctx.quadraticCurveTo(300, 130, 420, 80)
    ctx.quadraticCurveTo(300, 150, 180, 80)
    ctx.fillStyle = 'rgba(0,0,0,0.08)'
    ctx.fill()
    ctx.restore()
  }

  const handleSelectPrintForCurrentSide = (print: PrintItem | null) => {
    if (activePrintSide === 'front') {
      setFrontPrint(print)
    } else {
      setBackPrint(print)
    }
  }

  const handleAddToCartWithCustomization = () => {
    const canvas = canvasRef.current
    let mockupPreviewUrl = ''
    if (canvas) {
      try {
        mockupPreviewUrl = canvas.toDataURL('image/png')
      } catch (e) {
        mockupPreviewUrl = frontPrint?.image_url || backPrint?.image_url || ''
      }
    }

    let printSummary = ''
    if (frontPrint && backPrint) {
      printSummary = `Estampa Frente (${frontPrint.title}) + Costas (${backPrint.title})`
    } else if (frontPrint) {
      printSummary = `Estampa Frente (${frontPrint.title})`
    } else if (backPrint) {
      printSummary = `Estampa Costas (${backPrint.title})`
    } else {
      printSummary = `Sem estampa`
    }

    const printSizeLabel = printSize === 'grande' ? 'Estampa Grande Panorâmica' : 'Estampa Normal'

    const customizationData = {
      colorName: selectedColor.name,
      colorHex: selectedColor.hex,
      frontPrintId: frontPrint?.id,
      frontPrintTitle: frontPrint?.title,
      frontPrintImageUrl: frontPrint?.image_url,
      backPrintId: backPrint?.id,
      backPrintTitle: backPrint?.title,
      backPrintImageUrl: backPrint?.image_url,
      hasBackPrint: !!backPrint,
      backPrintFee: backPrint ? backPrintBaseFee : 0,
      printSize: printSize,
      largePrintFee: largePrintFee,
      printId: frontPrint?.id || backPrint?.id,
      printTitle: `${printSummary} [${printSizeLabel}]`,
      printImageUrl: frontPrint?.image_url || backPrint?.image_url,
      mockupPreviewUrl: mockupPreviewUrl
    }

    const item = {
      productId: product.id,
      name: `${product.name} - ${printSummary}`,
      price: unitPrice,
      quantity: quantity,
      image: mockupPreviewUrl || product.images?.[0] || '',
      variations: { Tamanho: selectedSize, Cor: selectedColor.name },
      customization: customizationData,
      storeId: product.store_id,
      sku: product?.sku
    }

    addToCart(item)
    toast.success('Camiseta personalizada adicionada ao carrinho!')
    if (onClose) onClose()
  }

  return (
    <div className="customizer-main-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem', alignItems: 'flex-start', padding: '0.5rem 0' }}>
      <style>{`
        @media (max-width: 768px) {
          .customizer-main-grid {
            grid-template-columns: 1fr !important;
            gap: 1.25rem !important;
          }
          .customizer-canvas-card {
            max-width: 100% !important;
            aspect-ratio: 1 / 1 !important;
            padding: 0.5rem !important;
            border-radius: 12px !important;
          }
          .customizer-print-gallery {
            grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)) !important;
            gap: 0.5rem !important;
            max-height: 200px !important;
            padding: 0.4rem !important;
          }
          .customizer-step-label {
            font-size: 0.88rem !important;
          }
          .customizer-side-tab-btn {
            padding: 0.4rem 0.25rem !important;
            font-size: 0.75rem !important;
          }
          .customizer-size-qty-row {
            grid-template-columns: 1fr !important;
            gap: 0.75rem !important;
          }
        }
      `}</style>

      {/* Visual Canvas Mockup Real-time Engine */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
        <div className="customizer-canvas-card" style={{
          width: '100%',
          maxWidth: '520px',
          aspectRatio: '1/1.05',
          backgroundColor: '#f8fafc',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1rem',
          position: 'relative',
          boxShadow: '0 10px 30px rgba(0,0,0,0.06)'
        }}>
          <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />

          {/* Badge Preview Status */}
          <div style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            backgroundColor: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(8px)',
            padding: '0.4rem 0.8rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 800,
            color: '#334155',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <Sparkles size={14} color={primaryColor} />
            <span>VISUALIZAÇÃO: {activePrintSide === 'front' ? 'FRENTE' : 'COSTAS'}</span>
          </div>
        </div>

        {/* Position & Zoom Controls */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center', width: '100%', paddingBottom: '0.2rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', whiteSpace: 'nowrap' }}>Visualizar Lado:</span>
          <button
            onClick={() => setActivePrintSide('front')}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: buttonRadius,
              border: activePrintSide === 'front' ? `2px solid ${primaryColor}` : '1px solid #cbd5e1',
              backgroundColor: activePrintSide === 'front' ? `${primaryColor}15` : '#fff',
              color: activePrintSide === 'front' ? primaryColor : '#475569',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              whiteSpace: 'nowrap'
            }}
          >
            <Shirt size={15} />
            <span>Frente</span>
          </button>
          <button
            onClick={() => setActivePrintSide('back')}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: buttonRadius,
              border: activePrintSide === 'back' ? `2px solid ${primaryColor}` : '1px solid #cbd5e1',
              backgroundColor: activePrintSide === 'back' ? `${primaryColor}15` : '#fff',
              color: activePrintSide === 'back' ? primaryColor : '#475569',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              whiteSpace: 'nowrap'
            }}
          >
            <Shirt size={15} style={{ transform: 'scaleX(-1)' }} />
            <span>Costas</span>
          </button>
        </div>

        {/* Observação para Estampas Maiores / WhatsApp */}
        <div style={{
          marginTop: '0.85rem',
          padding: '0.85rem 1rem',
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
          alignItems: 'center',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#166534', fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.4 }}>
            <MessageCircle size={18} color="#22c55e" style={{ flexShrink: 0 }} />
            <span>Para estampas maiores ou personalização sob medida, solicite via WhatsApp:</span>
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1.1rem',
              backgroundColor: '#25D366',
              color: '#ffffff',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 800,
              textDecoration: 'none',
              boxShadow: '0 3px 10px rgba(37,211,102,0.3)'
            }}
          >
            <MessageCircle size={16} />
            <span>SOLICITAR VIA WHATSAPP</span>
          </a>
        </div>
      </div>

      {/* Customizer Controls Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        
        {/* Step 1: Cor da Camiseta */}
        <div>
          <label style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Palette size={18} color={primaryColor} />
            <span>1. Escolha a Cor da Camiseta:</span>
            <strong style={{ color: primaryColor, marginLeft: 'auto', fontSize: '0.85rem' }}>{selectedColor.name}</strong>
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {baseColors.map(color => {
              const isSelected = selectedColor.id === color.id
              return (
                <button
                  key={color.id}
                  onClick={() => setSelectedColor(color)}
                  title={color.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.85rem',
                    borderRadius: '30px',
                    border: isSelected ? `2px solid ${primaryColor}` : '1px solid #cbd5e1',
                    backgroundColor: isSelected ? `${primaryColor}10` : '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: color.hex,
                    border: '1px solid rgba(0,0,0,0.15)',
                    display: 'inline-block'
                  }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isSelected ? primaryColor : '#334155' }}>
                    {color.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Step 2: Escolha as Estampas (Frente e Costas) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <label style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} color={primaryColor} />
              <span>2. Escolha as Estampas:</span>
            </label>
          </div>

          {/* Abas de Seleção de Lado (Frente / Costas) */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem', backgroundColor: '#f1f5f9', padding: '0.25rem', borderRadius: '10px' }}>
            <button
              className="customizer-side-tab-btn"
              onClick={() => setActivePrintSide('front')}
              style={{
                flex: 1,
                padding: '0.55rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activePrintSide === 'front' ? '#ffffff' : 'transparent',
                color: activePrintSide === 'front' ? primaryColor : '#64748b',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: activePrintSide === 'front' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.15rem'
              }}
            >
              <span>FRENTE</span>
              <small style={{ fontSize: '0.7rem', fontWeight: 600, color: frontPrint ? primaryColor : '#94a3b8' }}>
                {frontPrint ? frontPrint.title : 'Sem estampa'}
              </small>
            </button>
            <button
              className="customizer-side-tab-btn"
              onClick={() => setActivePrintSide('back')}
              style={{
                flex: 1,
                padding: '0.55rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activePrintSide === 'back' ? '#ffffff' : 'transparent',
                color: activePrintSide === 'back' ? primaryColor : '#64748b',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: activePrintSide === 'back' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.15rem'
              }}
            >
              <span>COSTAS (+R$ {backPrintBaseFee.toFixed(2)})</span>
              <small style={{ fontSize: '0.7rem', fontWeight: 600, color: backPrint ? primaryColor : '#94a3b8' }}>
                {backPrint ? backPrint.title : 'Adicionar estampa'}
              </small>
            </button>
          </div>

          {/* Botão de Remover Estampa do Lado Atual */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>
              Selecionando estampa para: <strong>{activePrintSide === 'front' ? 'Frente' : 'Costas'}</strong>
            </span>
            <button
              onClick={() => handleSelectPrintForCurrentSide(null)}
              style={{
                padding: '0.2rem 0.6rem',
                borderRadius: '4px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                color: '#ef4444',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Sem estampa {activePrintSide === 'front' ? 'na Frente' : 'nas Costas'}
            </button>
          </div>

          {/* Category Filter Pills */}
          {categories.length > 2 && (
            <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '0.3rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    border: selectedCategory === cat ? 'none' : '1px solid #e2e8f0',
                    backgroundColor: selectedCategory === cat ? primaryColor : '#f1f5f9',
                    color: selectedCategory === cat ? '#fff' : '#64748b',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Print Gallery Grid */}
          <div className="customizer-print-gallery" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
            gap: '0.85rem',
            maxHeight: '260px',
            overflowY: 'auto',
            padding: '0.5rem',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            {filteredPrints.map(p => {
              const isSelected = activePrint?.id === p.id
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectPrintForCurrentSide(p)}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '8px',
                    border: isSelected ? `2px solid ${primaryColor}` : '1px solid #e2e8f0',
                    backgroundColor: isSelected ? `${primaryColor}10` : '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isSelected && (
                    <div style={{ position: 'absolute', top: '4px', right: '4px', backgroundColor: primaryColor, color: '#fff', borderRadius: '50%', padding: '2px' }}>
                      <Check size={12} />
                    </div>
                  )}

                  <div style={{
                    width: '100%',
                    aspectRatio: '1/1',
                    borderRadius: '6px',
                    backgroundImage: `url(${p.image_url})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    marginBottom: '0.4rem'
                  }} />

                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', color: isSelected ? primaryColor : '#334155' }}>
                    {p.title}
                  </span>
                  {p.extra_price ? (
                    <small style={{ fontSize: '0.65rem', fontWeight: 800, color: '#16a34a' }}>+R$ {p.extra_price.toFixed(2)}</small>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step 3: Tamanho/Dimensão da Aplicação da Estampa */}
        <div>
          <label style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
            <Sparkles size={18} color="#ec4899" />
            <span>3. Escolha o Tamanho da Estampa:</span>
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              onClick={() => setPrintSize('normal')}
              style={{
                padding: '0.75rem 0.6rem',
                borderRadius: '12px',
                border: printSize === 'normal' ? `2px solid ${primaryColor}` : '1px solid #cbd5e1',
                backgroundColor: printSize === 'normal' ? `${primaryColor}10` : '#fff',
                color: printSize === 'normal' ? primaryColor : '#475569',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem',
                textAlign: 'center',
                transition: 'all 0.2s ease',
                boxShadow: printSize === 'normal' ? `0 4px 12px ${primaryColor}20` : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontWeight: 800, fontSize: '0.88rem' }}>Estampa Normal</span>
                {printSize === 'normal' && <Check size={14} />}
              </div>
              <small style={{ fontSize: '0.72rem', color: '#64748b' }}>Padrão (Sem acréscimo)</small>
            </button>

            <button
              onClick={() => setPrintSize('grande')}
              style={{
                padding: '0.75rem 0.6rem',
                borderRadius: '12px',
                border: printSize === 'grande' ? `2px solid #ec4899` : '1px solid #cbd5e1',
                backgroundColor: printSize === 'grande' ? 'rgba(236, 72, 153, 0.08)' : '#fff',
                color: printSize === 'grande' ? '#db2777' : '#475569',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem',
                textAlign: 'center',
                transition: 'all 0.2s ease',
                boxShadow: printSize === 'grande' ? '0 4px 12px rgba(236, 72, 153, 0.2)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={14} color="#ec4899" />
                <span style={{ fontWeight: 800, fontSize: '0.88rem' }}>Estampa Grande</span>
                {printSize === 'grande' && <Check size={14} color="#db2777" />}
              </div>
              <small style={{ fontSize: '0.72rem', fontWeight: 700, color: '#db2777' }}>
                Max Panorâmica {largePrintBaseFee > 0 ? `(+R$ ${largePrintBaseFee.toFixed(2)})` : ''}
              </small>
            </button>
          </div>
        </div>

        {/* Step 4: Tamanho da Camiseta & Quantidade */}
        <div className="customizer-size-qty-row" style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.5rem' }}>
              Tamanho:
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {availableSizes.map(sz => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  style={{
                    flex: 1,
                    minWidth: '40px',
                    padding: '0.5rem 0.25rem',
                    border: selectedSize === sz ? `2px solid ${primaryColor}` : '1px solid #cbd5e1',
                    backgroundColor: selectedSize === sz ? `${primaryColor}10` : '#fff',
                    color: selectedSize === sz ? primaryColor : '#475569',
                    borderRadius: buttonRadius,
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.5rem' }}>
              Qtd:
            </label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: buttonRadius,
                border: '1px solid #cbd5e1',
                textAlign: 'center',
                fontWeight: 800,
                fontSize: '0.95rem'
              }}
            />
          </div>
        </div>

        {/* Total & Action Button */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
          
          {/* Detalhamento do Preço */}
          <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>Camiseta Base:</span>
              <strong>R$ {basePrice.toFixed(2)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>Estampa Frente ({frontPrint ? frontPrint.title : 'Sem estampa'}):</span>
              <strong>{frontPrint ? (frontExtraPrice > 0 ? `+R$ ${frontExtraPrice.toFixed(2)}` : 'Incluída') : 'R$ 0,00'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: backPrint ? primaryColor : '#64748b', fontWeight: backPrint ? 700 : 400 }}>
              <span>Estampa Costas ({backPrint ? backPrint.title : 'Sem estampa'}):</span>
              <strong>{backPrint ? `+R$ ${backExtraPrice.toFixed(2)}` : 'R$ 0,00'}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#64748b' }}>Preço Total:</span>
            <div style={{ display: 'flex', alignItems: 'baseline', color: primaryColor }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, marginRight: '0.2rem' }}>R$</span>
              <span style={{ fontSize: '2rem', fontWeight: 950 }}>{totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <button
            onClick={handleAddToCartWithCustomization}
            style={{
              width: '100%',
              padding: '0.8rem 1rem',
              backgroundColor: primaryColor,
              color: '#ffffff',
              border: 'none',
              borderRadius: buttonRadius,
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.65rem',
              letterSpacing: '0.3px',
              boxShadow: `0 6px 16px ${primaryColor}40`,
              transition: 'all 0.2s ease',
              lineHeight: 1.25,
              textAlign: 'center'
            }}
          >
            <ShoppingCart size={20} style={{ flexShrink: 0 }} />
            <span>
              ADICIONAR PERSONALIZADA<br />AO CARRINHO
            </span>
          </button>
        </div>

      </div>
    </div>
  )
}
