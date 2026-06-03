"use client"

import { useState, useEffect } from 'react'
import { Save, Loader2, Link2, Plus, Trash2, ArrowUp, ArrowDown, Smartphone, Globe, Eye, User, Image as ImageIcon, Upload, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { useAdminAuth } from '@/context/AdminAuthContext'

interface BioLinkItem {
  id: string
  label: string
  url: string
  is_active: boolean
  icon: string
}

export default function BioLinkPage() {
  const { store } = useAdminAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [storeId, setStoreId] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [subdomain, setSubdomain] = useState('')
  const [publicUrl, setPublicUrl] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined' && subdomain) {
      const host = window.location.host
      const protocol = window.location.protocol
      // Se já está acessando pelo subdomínio da loja, o link é direto /bio
      const isSubdomainAccess = host.startsWith(`${subdomain}.`) || host.split(':')[0] === subdomain
      
      if (isSubdomainAccess) {
        setPublicUrl(`${protocol}//${host}/bio`)
      } else {
        setPublicUrl(`${protocol}//${host}/stores/${subdomain}/bio`)
      }
    }
  }, [subdomain])

  // Configurações do Link da Bio
  const [enabled, setEnabled] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [profileImageUrl, setProfileImageUrl] = useState('')
  const [theme, setTheme] = useState('dark') // dark, glass, primary, pastel, custom
  const [buttonStyle, setButtonStyle] = useState('rounded') // rounded, pill, sharp
  
  // Cores personalizadas
  const [customBgColor, setCustomBgColor] = useState('#0f172a')
  const [customTextColor, setCustomTextColor] = useState('#ffffff')
  const [customButtonBgColor, setCustomButtonBgColor] = useState('#1e293b')
  const [customButtonTextColor, setCustomButtonTextColor] = useState('#ffffff')
  const [primaryColor, setPrimaryColor] = useState('#6366f1') // Da loja

  // Links
  const [links, setLinks] = useState<BioLinkItem[]>([])
  
  // Redes Sociais
  const [socialLinks, setSocialLinks] = useState({
    whatsapp: '',
    instagram: '',
    facebook: '',
    tiktok: '',
    youtube: ''
  })

  // Novo link temporário
  const [newLinkLabel, setNewLinkLabel] = useState('')
  const [newLinkUrl, setNewLinkUrl] = useState('')
  const [newLinkIcon, setNewLinkIcon] = useState('globe')

  useEffect(() => {
    if (store) {
      fetchStoreSettings()
    }
  }, [store])

  const fetchStoreSettings = async () => {
    if (!store) return
    try {
      setStoreId(store.id)
      setLogoUrl(store.settings?.logo_url || '')
      setSubdomain(store.subdomain)
      setPrimaryColor(store.settings?.primary_color || '#6366f1')

      const bio = store.settings?.bio_link || {}
      setEnabled(bio.enabled || false)
      setTitle(bio.title || store.name || '')
      setDescription(bio.description || store.settings?.description || '')
      setProfileImageUrl(bio.profile_image_url || store.settings?.logo_url || '')
      setTheme(bio.theme || 'dark')
      setButtonStyle(bio.button_style || 'rounded')
      
      setCustomBgColor(bio.custom_bg_color || '#0f172a')
      setCustomTextColor(bio.custom_text_color || '#ffffff')
      setCustomButtonBgColor(bio.custom_button_bg_color || '#1e293b')
      setCustomButtonTextColor(bio.custom_button_text_color || '#ffffff')

      setLinks(bio.links || [])
      setSocialLinks(bio.social_links || {
        whatsapp: store.settings?.whatsapp || '',
        instagram: store.settings?.instagram || '',
        facebook: store.settings?.facebook || '',
        tiktok: '',
        youtube: ''
      })

    } catch (error: any) {
      toast.error('Erro ao carregar dados da loja: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !store) return
    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `bio-profile-${Date.now()}.${fileExt}`
      const filePath = `${store.id}/${fileName}`
      
      const { error: uploadError } = await supabase.storage
        .from('store-assets')
        .upload(filePath, file)
        
      if (uploadError) throw uploadError
      
      const { data: { publicUrl } } = supabase.storage
        .from('store-assets')
        .getPublicUrl(filePath)
        
      setProfileImageUrl(publicUrl)
      toast.success('Imagem de perfil enviada com sucesso!')
    } catch (error: any) {
      toast.error('Erro ao enviar imagem: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!store) return
    setSaving(true)
    try {
      const { data: storeData, error: fetchError } = await supabase
        .from('stores')
        .select('settings')
        .eq('id', store.id)
        .single()

      if (fetchError) throw fetchError

      const currentSettings = storeData.settings || {}
      
      const bioLinkData = {
        enabled,
        title,
        description,
        profile_image_url: profileImageUrl,
        theme,
        button_style: buttonStyle,
        custom_bg_color: customBgColor,
        custom_text_color: customTextColor,
        custom_button_bg_color: customButtonBgColor,
        custom_button_text_color: customButtonTextColor,
        links,
        social_links: socialLinks
      }

      const updatedSettings = {
        ...currentSettings,
        bio_link: bioLinkData
      }

      const { error } = await supabase
        .from('stores')
        .update({ settings: updatedSettings })
        .eq('id', store.id)

      if (error) throw error
      toast.success('Configurações do Link da Bio salvas com sucesso!')
    } catch (error: any) {
      toast.error('Erro ao salvar configurações: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  // Ações de Links
  const addLink = () => {
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) {
      toast.error('Preencha o título e a URL do link.')
      return
    }

    let url = newLinkUrl.trim()
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url
    }

    const newItem: BioLinkItem = {
      id: Math.random().toString(36).substring(2, 9),
      label: newLinkLabel.trim(),
      url,
      is_active: true,
      icon: newLinkIcon
    }

    setLinks([...links, newItem])
    setNewLinkLabel('')
    setNewLinkUrl('')
    setNewLinkIcon('globe')
    toast.success('Link adicionado à visualização!')
  }

  const removeLink = (id: string) => {
    setLinks(links.filter(l => l.id !== id))
    toast.success('Link removido!')
  }

  const toggleLinkActive = (id: string) => {
    setLinks(links.map(l => l.id === id ? { ...l, is_active: !l.is_active } : l))
  }

  const moveLink = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= links.length) return

    const newLinks = [...links]
    const temp = newLinks[index]
    newLinks[index] = newLinks[newIndex]
    newLinks[newIndex] = temp
    setLinks(newLinks)
  }

  // Mock de temas para estilo visual do Live Preview
  const getThemePreviewStyles = () => {
    switch (theme) {
      case 'glass':
        return {
          bg: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
          text: '#ffffff',
          buttonBg: 'rgba(255, 255, 255, 0.12)',
          buttonText: '#ffffff',
          buttonBorder: '1px solid rgba(255, 255, 255, 0.2)',
          backdropBlur: 'blur(8px)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
        }
      case 'primary':
        return {
          bg: '#f8fafc',
          text: '#0f172a',
          buttonBg: primaryColor,
          buttonText: '#ffffff',
          buttonBorder: 'none',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
        }
      case 'pastel':
        return {
          bg: 'linear-gradient(135deg, #fed7aa 0%, #fbcfe8 50%, #bfdbfe 100%)',
          text: '#1e293b',
          buttonBg: '#ffffff',
          buttonText: '#1e293b',
          buttonBorder: '1px solid rgba(0,0,0,0.03)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }
      case 'custom':
        return {
          bg: customBgColor,
          text: customTextColor,
          buttonBg: customButtonBgColor,
          buttonText: customButtonTextColor,
          buttonBorder: `1px solid ${customButtonTextColor}20`
        }
      case 'dark':
      default:
        return {
          bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          text: '#ffffff',
          buttonBg: 'rgba(255, 255, 255, 0.08)',
          buttonText: '#ffffff',
          buttonBorder: '1px solid rgba(255, 255, 255, 0.15)'
        }
    }
  }

  const themePreview = getThemePreviewStyles()

  // Estilos comuns reutilizáveis com alto contraste
  const cardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '1.75rem',
    border: '1px solid #cbd5e1',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.25rem'
  }

  const labelStyle = {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: '#334155'
  }

  const inputStyle = {
    width: '100%',
    minWidth: '0',
    padding: '0.65rem 0.85rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontSize: '0.9rem',
    fontWeight: 500,
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s'
  }

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer'
  }

  const inputFocusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#6366f1'
    e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.12)'
  }

  const inputBlurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#cbd5e1'
    e.target.style.boxShadow = 'none'
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '80vh', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={36} className="animate-spin" color="#6366f1" />
      </div>
    )
  }

  // publicUrl agora é gerada dinamicamente via state e useEffect

  return (
    <div className="biolink-page-container" style={{ padding: '2rem', fontFamily: 'Inter, system-ui, sans-serif', color: '#0f172a', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Título Principal */}
      <div className="biolink-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ minWidth: '280px', flex: '1' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 850, margin: 0, letterSpacing: '-0.5px' }}>🔗 Link da Bio (Instagram)</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0.35rem 0 0 0' }}>Configure a página de atração de links da sua loja para colocar nas suas redes sociais.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="btn-save-settings btn-save-biolink"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#6366f1',
            color: '#ffffff',
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(99, 102, 241, 0.2)',
            transition: 'background-color 0.2s',
            height: '40px',
            whiteSpace: 'nowrap'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6366f1'}
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

      {enabled && publicUrl && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          backgroundColor: '#f0fdf4', 
          border: '1px solid #bbf7d0', 
          padding: '1rem 1.5rem', 
          borderRadius: '10px', 
          marginBottom: '2rem' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🚀</span>
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: '#166534', fontSize: '0.9rem' }}>Seu Link da Bio está ativo e publicado!</p>
              <a 
                href={publicUrl} 
                target="_blank" 
                style={{ 
                  color: '#15803d', 
                  fontSize: '0.85rem', 
                  fontWeight: 650, 
                  textDecoration: 'underline',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  marginTop: '0.15rem'
                }}
              >
                {publicUrl} <ChevronRight size={12} />
              </a>
            </div>
          </div>
          <a 
            href={publicUrl} 
            target="_blank"
            style={{
              padding: '0.45rem 1rem',
              backgroundColor: '#166534',
              color: '#ffffff',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: '0.2s'
            }}
          >
            <Eye size={14} /> Visualizar
          </a>
        </div>
      )}

      <div className="biolink-layout-grid" style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '2.5rem', alignItems: 'start' }}>
        
        {/* COLUNA ESQUERDA: CONFIGURAÇÕES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* CARD DE ATIVAÇÃO */}
          <div className="biolink-card" style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 750, color: '#0f172a' }}>Status do Módulo</h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>Ative para tornar o Link da Bio acessível ao público.</p>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '56px', height: '30px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={enabled} 
                  onChange={(e) => setEnabled(e.target.checked)} 
                  style={{ opacity: 0, width: 0, height: 0 }} 
                />
                <span style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: enabled ? '#6366f1' : '#cbd5e1',
                  transition: '.3s', borderRadius: '34px',
                  boxShadow: enabled ? '0 0 10px rgba(99,102,241,0.3)' : 'none'
                }}>
                  <span style={{
                    position: 'absolute', left: '4px', bottom: '4px',
                    backgroundColor: 'white', width: '22px', height: '22px',
                    transition: '.3s', borderRadius: '50%',
                    transform: enabled ? 'translateX(26px)' : 'none'
                  }} />
                </span>
              </label>
            </div>
          </div>
 
          {/* CARD PERFIL */}
          <div className="biolink-card" style={cardStyle}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 750, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>👤 Perfil da Bio</h3>
            
            <div className="biolink-profile-grid" style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '1.5rem', alignItems: 'center' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '50%', 
                backgroundColor: '#f1f5f9', 
                backgroundImage: profileImageUrl ? `url(${profileImageUrl})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #cbd5e1'
              }}>
                {!profileImageUrl && <User size={32} color="#94a3b8" />}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={labelStyle}>Imagem de Perfil / Logo da Bio</label>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <input 
                    type="file" 
                    id="bio-profile-upload"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                    style={{ display: 'none' }}
                  />
                  <label 
                    htmlFor="bio-profile-upload"
                    style={{
                      padding: '0.55rem 1rem',
                      backgroundColor: '#6366f1',
                      color: '#ffffff',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      boxShadow: '0 2px 4px rgba(99, 102, 241, 0.15)',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    {uploading ? 'Enviando...' : 'Subir Nova Foto'}
                  </label>
                  
                  {logoUrl && (
                    <button 
                      type="button"
                      onClick={() => setProfileImageUrl(logoUrl)}
                      style={{
                        padding: '0.55rem 1rem',
                        backgroundColor: '#f1f5f9',
                        color: '#334155',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Usar Logo da Loja
                    </button>
                  )}

                  {profileImageUrl && (
                    <button 
                      type="button"
                      onClick={() => setProfileImageUrl('')}
                      style={{
                        padding: '0.55rem 1rem',
                        backgroundColor: '#fef2f2',
                        color: '#ef4444',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Ou digite a URL de uma foto externa diretamente:</span>
              <input 
                type="text" 
                value={profileImageUrl} 
                onChange={(e) => setProfileImageUrl(e.target.value)} 
                onFocus={inputFocusStyle}
                onBlur={inputBlurStyle}
                placeholder="https://..."
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={labelStyle}>Título Principal</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  onFocus={inputFocusStyle}
                  onBlur={inputBlurStyle}
                  placeholder="Nome da Loja ou Marca"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={labelStyle}>Descrição curta (Bio)</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  onFocus={inputFocusStyle}
                  onBlur={inputBlurStyle}
                  placeholder="Descreva seu negócio de forma concisa e direta..."
                  rows={3}
                  style={{
                    ...inputStyle,
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>
          </div>

          {/* CARD GERENCIADOR DE LINKS */}
          <div className="biolink-card" style={cardStyle}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 750, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>🔗 Gerenciador de Links</h3>
            
            {/* Formulário Novo Link */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#1e293b' }}>Adicionar Novo Link</h4>
              <div className="biolink-add-link-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1fr', gap: '0.75rem', alignItems: 'end' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 700 }}>Título do Botão</span>
                  <input 
                    type="text" 
                    value={newLinkLabel} 
                    onChange={(e) => setNewLinkLabel(e.target.value)} 
                    placeholder="Ex: Fale Conosco" 
                    style={inputStyle} 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 700 }}>URL de Destino</span>
                  <input 
                    type="text" 
                    value={newLinkUrl} 
                    onChange={(e) => setNewLinkUrl(e.target.value)} 
                    placeholder="Ex: wa.me/..." 
                    style={inputStyle} 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 700 }}>Ícone</span>
                  <select value={newLinkIcon} onChange={(e) => setNewLinkIcon(e.target.value)} style={selectStyle}>
                    <option value="globe">🌐 Geral / Site</option>
                    <option value="whatsapp">💬 WhatsApp</option>
                    <option value="instagram">📸 Instagram</option>
                    <option value="shopping-bag">🛍️ Loja / Catálogo</option>
                    <option value="tag">🏷️ Oferta / Cupom</option>
                    <option value="star">⭐ Destaque</option>
                  </select>
                </div>
              </div>
              <button 
                onClick={addLink}
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.825rem',
                  cursor: 'pointer',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1e293b'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0f172a'}
              >
                <Plus size={14} /> Adicionar Link à Lista
              </button>
            </div>

            {/* Listagem de links atuais */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              <label style={labelStyle}>Links Atuais ({links.length})</label>
              {links.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', border: '2px dashed #cbd5e1', borderRadius: '12px', color: '#64748b', fontSize: '0.85rem' }}>
                  Nenhum link adicionado ainda. Preencha o formulário acima para adicionar.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {links.map((link, idx) => (
                    <div 
                      key={link.id} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        padding: '0.75rem 1rem', 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #cbd5e1', 
                        borderRadius: '10px', 
                        gap: '1rem' 
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button 
                          disabled={idx === 0} 
                          onClick={() => moveLink(idx, 'up')}
                          style={{ border: 'none', background: 'none', cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.3 : 0.7 }}
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button 
                          disabled={idx === links.length - 1} 
                          onClick={() => moveLink(idx, 'down')}
                          style={{ border: 'none', background: 'none', cursor: idx === links.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === links.length - 1 ? 0.3 : 0.7 }}
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>{link.label}</span>
                          <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.4rem', backgroundColor: '#f1f5f9', borderRadius: '6px', color: '#475569', fontWeight: 600 }}>
                            {link.icon === 'whatsapp' && '💬 Whatsapp'}
                            {link.icon === 'instagram' && '📸 Instagram'}
                            {link.icon === 'shopping-bag' && '🛍️ Loja'}
                            {link.icon === 'tag' && '🏷️ Cupom'}
                            {link.icon === 'star' && '⭐ Destaque'}
                            {link.icon === 'globe' && '🌐 Site'}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', wordBreak: 'break-all', marginTop: '0.15rem' }}>{link.url}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 650 }}>
                          <input 
                            type="checkbox" 
                            checked={link.is_active} 
                            onChange={() => toggleLinkActive(link.id)} 
                            style={{ cursor: 'pointer' }}
                          />
                          Ativo
                        </label>
                        <button 
                          onClick={() => removeLink(link.id)}
                          style={{
                            border: 'none',
                            background: '#fef2f2',
                            color: '#ef4444',
                            padding: '0.45rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            borderColor: '#fecaca'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CARD APARÊNCIA */}
          <div className="biolink-card" style={cardStyle}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 750, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>🎨 Aparência e Temas</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={labelStyle}>Tema Visual</label>
              <div className="biolink-theme-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {[
                  { id: 'dark', label: '🌑 Dark Premium' },
                  { id: 'glass', label: '🔮 Glassmorphism' },
                  { id: 'primary', label: '🎨 Cor da Loja' },
                  { id: 'pastel', label: '🌸 Soft Pastel' },
                  { id: 'custom', label: '⚙️ Personalizado' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      backgroundColor: theme === t.id ? '#6366f1' : '#f1f5f9',
                      color: theme === t.id ? '#ffffff' : '#334155',
                      border: theme === t.id ? '1px solid #6366f1' : '1px solid #cbd5e1',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transition: '0.2s'
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={labelStyle}>Estilo do Botão</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {[
                  { id: 'rounded', label: 'Arredondado' },
                  { id: 'pill', label: 'Pílula' },
                  { id: 'sharp', label: 'Reto' }
                ].map(b => (
                  <button
                    key={b.id}
                    onClick={() => setButtonStyle(b.id)}
                    style={{
                      padding: '0.65rem',
                      borderRadius: '8px',
                      backgroundColor: buttonStyle === b.id ? '#6366f1' : '#f1f5f9',
                      color: buttonStyle === b.id ? '#ffffff' : '#334155',
                      border: buttonStyle === b.id ? '1px solid #6366f1' : '1px solid #cbd5e1',
                      fontWeight: 650,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transition: '0.2s'
                    }}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {theme === 'custom' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>Cor do Fundo</label>
                  <input type="color" value={customBgColor} onChange={(e) => setCustomBgColor(e.target.value)} style={{ width: '100%', height: '40px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>Cor do Texto</label>
                  <input type="color" value={customTextColor} onChange={(e) => setCustomTextColor(e.target.value)} style={{ width: '100%', height: '40px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>Fundo do Botão</label>
                  <input type="color" value={customButtonBgColor} onChange={(e) => setCustomButtonBgColor(e.target.value)} style={{ width: '100%', height: '40px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>Texto do Botão</label>
                  <input type="color" value={customButtonTextColor} onChange={(e) => setCustomButtonTextColor(e.target.value)} style={{ width: '100%', height: '40px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }} />
                </div>
              </div>
            )}
          </div>

          {/* CARD REDES SOCIAIS */}
          <div style={cardStyle}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 750, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>📱 Redes Sociais do Rodapé</h3>
            
            <div className="biolink-social-grid" style={{ display: 'grid', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={labelStyle}>WhatsApp (Número com DDD)</label>
                <input 
                  type="text" 
                  value={socialLinks.whatsapp} 
                  onChange={(e) => setSocialLinks({ ...socialLinks, whatsapp: e.target.value })} 
                  onFocus={inputFocusStyle}
                  onBlur={inputBlurStyle}
                  placeholder="Ex: 11999999999"
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={labelStyle}>Instagram (Usuário sem @)</label>
                <input 
                  type="text" 
                  value={socialLinks.instagram} 
                  onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })} 
                  onFocus={inputFocusStyle}
                  onBlur={inputBlurStyle}
                  placeholder="Ex: minha.loja"
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={labelStyle}>Facebook (URL da Página)</label>
                <input 
                  type="text" 
                  value={socialLinks.facebook} 
                  onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })} 
                  onFocus={inputFocusStyle}
                  onBlur={inputBlurStyle}
                  placeholder="Ex: facebook.com/minhaloja"
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={labelStyle}>TikTok (Usuário sem @)</label>
                <input 
                  type="text" 
                  value={socialLinks.tiktok} 
                  onChange={(e) => setSocialLinks({ ...socialLinks, tiktok: e.target.value })} 
                  onFocus={inputFocusStyle}
                  onBlur={inputBlurStyle}
                  placeholder="Ex: minha.loja"
                  style={inputStyle}
                />
              </div>
              <div className="biolink-social-full" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: 'span 2' }}>
                <label style={labelStyle}>YouTube (URL do Canal)</label>
                <input 
                  type="text" 
                  value={socialLinks.youtube || ''} 
                  onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })} 
                  onFocus={inputFocusStyle}
                  onBlur={inputBlurStyle}
                  placeholder="Ex: youtube.com/@meucanal"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

        </div>

        {/* COLUNA DIREITA: LIVE PREVIEW DO SMARTPHONE */}
        <div style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569', fontWeight: 700, fontSize: '0.9rem' }}>
            <Smartphone size={18} /> Live Preview (Celular)
          </div>

          {/* FRAME DO CELULAR */}
          <div style={{
            width: '320px',
            height: '600px',
            borderRadius: '40px',
            border: '12px solid #0f172a',
            backgroundColor: '#000',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            userSelect: 'none'
          }}>
            {/* Camera notch */}
            <div style={{
              width: '120px',
              height: '22px',
              backgroundColor: '#0f172a',
              borderRadius: '0 0 16px 16px',
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Lente da camera */}
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#020617' }} />
            </div>

            {/* CONTEÚDO DA BIO NO CELULAR */}
            <div style={{
              flex: 1,
              background: themePreview.bg,
              color: themePreview.text,
              padding: '2.5rem 1.5rem 1.5rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              overflowY: 'auto',
              fontFamily: 'Inter, system-ui, sans-serif',
              position: 'relative'
            }}>
              {/* Perfil */}
              <div style={{ 
                width: '74px', 
                height: '74px', 
                borderRadius: '50%', 
                backgroundColor: 'rgba(255,255,255,0.1)',
                backgroundImage: profileImageUrl ? `url(${profileImageUrl})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                marginBottom: '1rem',
                border: '2px solid rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {!profileImageUrl && <User size={28} color="#94a3b8" />}
              </div>

              <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1rem', fontWeight: 800, textAlign: 'center' }}>
                {title || 'Nome da Loja'}
              </h4>

              <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.75rem', opacity: 0.8, textAlign: 'center', lineHeight: 1.4, maxWidth: '90%' }}>
                {description || 'Esta é a descrição oficial da loja para o link do Instagram.'}
              </p>

              {/* Lista de Botões */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                {links.filter(l => l.is_active).length === 0 ? (
                  <div style={{ fontSize: '0.75rem', opacity: 0.5, textAlign: 'center', margin: 'auto 0' }}>
                    Nenhum link ativo adicionado
                  </div>
                ) : (
                  links.filter(l => l.is_active).map(link => (
                    <div
                      key={link.id}
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        backgroundColor: themePreview.buttonBg,
                        color: themePreview.buttonText,
                        border: themePreview.buttonBorder,
                        borderRadius: buttonStyle === 'pill' ? '100px' : buttonStyle === 'sharp' ? '0px' : '10px',
                        fontSize: '0.825rem',
                        fontWeight: 700,
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        boxShadow: (themePreview as any).boxShadow || 'none',
                        backdropFilter: (themePreview as any).backdropBlur || 'none'
                      }}
                    >
                      {link.icon === 'whatsapp' && '💬'}
                      {link.icon === 'instagram' && '📸'}
                      {link.icon === 'shopping-bag' && '🛍️'}
                      {link.icon === 'tag' && '🏷️'}
                      {link.icon === 'star' && '⭐'}
                      {link.icon === 'globe' && '🌐'}
                      <span>{link.label}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Rodapé Redes Sociais com Ícones Oficiais */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '2rem', paddingBottom: '1rem', flexWrap: 'wrap' }}>
                {socialLinks.whatsapp && (
                  <div style={{ width: '32px', height: '32px', backgroundColor: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', boxShadow: '0 2px 4px rgba(37, 211, 102, 0.2)' }}>
                    <svg viewBox="6.5 7.0 11 10" width="18" height="18">
                      <path fill="white" d="M12.004 7.502c-2.481 0-4.5 2.019-4.5 4.5 0 .783.204 1.543.593 2.22l-.63 2.3 2.35-.615c.65.355 1.378.543 2.124.545h.002c2.481 0 4.5-2.019 4.5-4.5s-2.019-4.5-4.5-4.5zm0 .75c2.068 0 3.75 1.682 3.75 3.75s-1.682 3.75-3.75 3.75c-.655 0-1.294-.171-1.851-.497l-.133-.078-1.377.36.366-1.341-.086-.137c-.356-.566-.544-1.222-.544-1.895-.002-2.068 1.68-3.75 3.75-3.75zm1.968 4.708c-.125-.062-.736-.363-.85-.405-.114-.042-.197-.062-.28.062-.083.125-.32.405-.393.488-.073.083-.145.093-.27.031-.125-.062-.527-.194-.997-.613-.365-.326-.612-.728-.684-.852-.072-.124-.008-.191.054-.253.056-.056.125-.145.187-.218.062-.073.083-.125.125-.208.042-.083.02-.155-.01-.218-.03-.062-.28-.675-.384-.925-.101-.244-.204-.21-.28-.214h-.238c-.083 0-.218.031-.332.155-.114.124-.435.425-.435 1.037 0 .611.445 1.202.507 1.285.062.083.876 1.338 2.12 1.875.297.127.528.203.708.26.299.095.571.081.787.05.24-.035.736-.301.84-.592.104-.29.104-.539.073-.591-.03-.052-.114-.083-.238-.145z"/>
                    </svg>
                  </div>
                )}
                {socialLinks.instagram && (
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(225, 48, 108, 0.2)' }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
                  </div>
                )}
                {socialLinks.facebook && (
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1877F2', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(24, 119, 242, 0.2)' }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </div>
                )}
                {socialLinks.tiktok && (
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="white"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.52-4.06-1.39v7.54c0 2.14-.54 4.39-2.18 5.79-1.92 1.66-4.82 2.05-7.05 1.15-2.52-1.01-4.22-3.66-4.14-6.43.04-2.88 2.09-5.59 4.96-6.19 1.19-.25 2.45-.14 3.58.33v4.06c-.84-.46-1.84-.63-2.77-.33-1.28.37-2.19 1.63-2.11 2.97.06 1.48 1.34 2.81 2.87 2.76 1.51-.01 2.62-1.26 2.62-2.77V.02h.16z"/></svg>
                  </div>
                )}
                {socialLinks.youtube && (
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#FF0000', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(255, 0, 0, 0.2)' }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.002 3.002 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </div>
                )}
              </div>
            </div>
            
            {/* Barra home indicador do celular */}
            <div style={{
              width: '110px',
              height: '4px',
              backgroundColor: '#cbd5e1',
              borderRadius: '2px',
              position: 'absolute',
              bottom: '8px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000
            }} />
          </div>
        </div>

      </div>

      <style>{`
        .biolink-social-grid {
          grid-template-columns: 1fr 1fr;
        }
        @media (max-width: 1024px) {
          .biolink-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 1.25rem !important;
            margin-bottom: 2rem !important;
          }
          .btn-save-biolink {
            width: 100% !important;
            justify-content: center !important;
          }
          .biolink-layout-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .biolink-profile-grid {
            grid-template-columns: 1fr !important;
            justify-items: center !important;
            text-align: center !important;
            gap: 1rem !important;
          }
          .biolink-add-link-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
          .biolink-social-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
          .biolink-social-full {
            grid-column: span 1 !important;
          }
          .biolink-theme-grid {
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)) !important;
          }
        }

        @media (max-width: 768px) {
          .biolink-page-container {
            padding: 0 !important;
          }
          .biolink-social-grid {
            grid-template-columns: 1fr !important;
          }
          .biolink-social-full {
            grid-column: span 1 !important;
          }
          .biolink-card {
            padding: 1.25rem !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            border-radius: 12px !important;
            border: 1px solid #cbd5e1 !important;
            width: 100% !important;
            min-width: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}
