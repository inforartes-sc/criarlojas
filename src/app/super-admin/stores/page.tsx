"use client"

import { useState, useEffect } from 'react'
import { Store, Search, Filter, ExternalLink, ShieldAlert, CheckCircle2, Lock, Unlock, Loader2, Eye, X, Plus, Sparkles, Copy, Edit, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { getDomainSuffix, getAbsoluteUrl } from '@/lib/getDomainSuffix'

export default function SuperAdminStores() {
  const [loading, setLoading] = useState(true)
  const [stores, setStores] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedStore, setSelectedStore] = useState<any>(null)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [domainSuffix, setDomainSuffix] = useState('.localhost:3000')

  useEffect(() => {
    setDomainSuffix(getDomainSuffix())
  }, [])
  const [updating, setUpdating] = useState(false)
  const [storeToDelete, setStoreToDelete] = useState<any>(null)

  // Estado para o Modal de Edição de Loja
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null)
  const [editStoreData, setEditStoreData] = useState({
    name: '',
    subdomain: '',
    email: '',
    whatsapp: '',
    adminUser: '',
    adminPassword: '',
    plan: 'basic',
    layoutModel: 'modern',
    primaryColor: '#0ea5e9',
    isDemo: false,
    billingEnabled: true,
    niche: 'Moda & Acessórios Premium',
    description: 'Loja virtual premium configurada com alta conversão.'
  })

  const handleOpenEdit = (store: any) => {
    const s = store.settings || {}
    setEditingStoreId(store.id)
    setEditStoreData({
      name: store.name || '',
      subdomain: store.subdomain || '',
      email: s.email || '',
      whatsapp: s.whatsapp || s.phone || '',
      adminUser: s.admin_user || '',
      adminPassword: s.admin_password || '',
      plan: s.plan || 'basic',
      layoutModel: s.layout_model || 'modern',
      primaryColor: s.primary_color || '#0ea5e9',
      isDemo: s.is_demo || false,
      billingEnabled: s.billing_enabled !== false,
      niche: s.niche || s.description || 'Moda & Acessórios Premium',
      description: s.description || s.hero_subtitle || 'Loja virtual premium configurada com alta conversão.'
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingStoreId) return
    setUpdating(true)

    try {
      const cleanSubdomain = editStoreData.subdomain.toLowerCase().trim().replace(/[^a-z0-9]/g, '')
      if (!cleanSubdomain) {
        toast.error('Digite um subdomínio válido apenas com letras e números.')
        setUpdating(false)
        return
      }

      const { data: existing, error: checkErr } = await supabase
        .from('stores')
        .select('id')
        .eq('subdomain', cleanSubdomain)
        .neq('id', editingStoreId)
        .limit(1)

      if (checkErr) throw checkErr
      if (existing && existing.length > 0) {
        toast.error('Este subdomínio já está em uso por outra loja.')
        setUpdating(false)
        return
      }

      const currentStore = stores.find(s => s.id === editingStoreId)
      const currentSettings = currentStore?.settings || {}

      const updatedSettings = {
        ...currentSettings,
        name: editStoreData.name,
        email: editStoreData.email,
        phone: editStoreData.whatsapp,
        whatsapp: editStoreData.whatsapp,
        subdomain: cleanSubdomain,
        layout_model: editStoreData.layoutModel,
        primary_color: editStoreData.primaryColor,
        button_color: editStoreData.primaryColor,
        is_demo: editStoreData.isDemo,
        billing_enabled: editStoreData.billingEnabled,
        admin_user: editStoreData.adminUser,
        admin_password: editStoreData.adminPassword,
        plan: editStoreData.plan,
        niche: editStoreData.niche,
        description: editStoreData.description
      }

      const { error: updateErr } = await supabase
        .from('stores')
        .update({
          name: editStoreData.name,
          subdomain: cleanSubdomain,
          settings: updatedSettings
        })
        .eq('id', editingStoreId)

      if (updateErr) throw updateErr

      setStores(prev => prev.map(s => s.id === editingStoreId ? { ...s, name: editStoreData.name, subdomain: cleanSubdomain, settings: updatedSettings } : s))
      toast.success('Cadastro da loja atualizado com sucesso!')
      setShowEditModal(false)
    } catch (error: any) {
      console.error('Erro ao atualizar loja:', error.message)
      toast.error('Erro ao atualizar os dados da loja.')
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteStore = (store: any) => {
    setStoreToDelete(store)
  }

  const confirmDeleteStore = async () => {
    if (!storeToDelete) return
    setUpdating(true)
    try {
      const { error } = await supabase
        .from('stores')
        .delete()
        .eq('id', storeToDelete.id)

      if (error) throw error

      setStores(prev => prev.filter(s => s.id !== storeToDelete.id))
      toast.success(`Loja "${storeToDelete.name}" excluída e dados apagados com sucesso!`)
      setShowEditModal(false)
    } catch (error: any) {
      console.error('Erro ao excluir loja:', error.message)
      toast.error('Erro ao excluir a loja do banco de dados.')
    } finally {
      setUpdating(false)
      setStoreToDelete(null)
    }
  }

  // Estado para o Modal de Criação / Clonagem de Loja (Onboarding)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creatingStore, setCreatingStore] = useState(false)
  const [newStoreData, setNewStoreData] = useState({
    name: '',
    subdomain: '',
    email: '',
    whatsapp: '',
    adminUser: '',
    adminPassword: 'senha123',
    plan: 'basic',
    layoutModel: 'modern',
    primaryColor: '#0ea5e9',
    isDemo: false,
    billingEnabled: true,
    cloneFromSettings: null as any,
    cloneFromStoreId: null as string | null,
    niche: 'Moda & Acessórios Premium',
    description: 'Loja virtual premium configurada com alta conversão.'
  })

  useEffect(() => {
    fetchStores()
  }, [])

  const fetchStores = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setStores(data || [])
    } catch (error: any) {
      console.error('Erro ao buscar lojas:', error.message)
      toast.error('Erro ao carregar lojas da plataforma.')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (store: any) => {
    setUpdating(true)
    try {
      const currentSettings = store.settings || {}
      const newActiveState = currentSettings.active !== undefined ? !currentSettings.active : false

      const updatedSettings = { ...currentSettings, active: newActiveState }

      const { error } = await supabase
        .from('stores')
        .update({ settings: updatedSettings })
        .eq('id', store.id)

      if (error) throw error

      setStores(prev => prev.map(s => s.id === store.id ? { ...s, settings: updatedSettings } : s))
      toast.success(newActiveState ? 'Loja ativada com sucesso!' : 'Loja suspensa/bloqueada com sucesso!')
      if (selectedStore?.id === store.id) {
        setSelectedStore({ ...store, settings: updatedSettings })
      }
    } catch (error: any) {
      console.error('Erro ao alterar status da loja:', error.message)
      toast.error('Erro ao alterar status da loja.')
    } finally {
      setUpdating(false)
    }
  }

  const handleOpenClone = (store: any) => {
    const s = store.settings || {}
    setNewStoreData({
      name: `${store.name} (Cópia)`,
      subdomain: `${store.subdomain}copia`,
      email: '',
      whatsapp: '',
      adminUser: s.admin_user || '',
      adminPassword: s.admin_password || 'senha123',
      plan: 'pro',
      layoutModel: s.layout_model || 'modern',
      primaryColor: s.primary_color || '#0ea5e9',
      isDemo: false,
      billingEnabled: s.billing_enabled !== false,
      cloneFromSettings: s,
      cloneFromStoreId: store.id,
      niche: s.niche || 'Moda & Acessórios Premium',
      description: s.description || 'Loja virtual premium configurada com alta conversão.'
    })
    setShowCreateModal(true)
    toast.success(`Clonando layout, cores, produtos e banners de ${store.name}!`)
  }

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreatingStore(true)

    try {
      const cleanSubdomain = newStoreData.subdomain.toLowerCase().trim().replace(/[^a-z0-9]/g, '')
      if (!cleanSubdomain) {
        toast.error('Digite um subdomínio válido apenas com letras e números.')
        setCreatingStore(false)
        return
      }

      // Verificar se subdomínio já existe
      const { data: existing, error: checkErr } = await supabase
        .from('stores')
        .select('id')
        .eq('subdomain', cleanSubdomain)
        .limit(1)

      if (checkErr) throw checkErr
      if (existing && existing.length > 0) {
        toast.error('Este subdomínio já está em uso por outra loja.')
        setCreatingStore(false)
        return
      }

      // Base de settings (se estiver clonando, mescla as configurações visuais do modelo)
      const baseSettings = newStoreData.cloneFromSettings || {}

      const initialSettings = {
        address: "Rua Principal, 100",
        benefits: [
          { title: "Entrega Rápida", subtitle: "Calcule o prazo no checkout" },
          { title: "Compra Segura", subtitle: "Ambiente 100% protegido" },
          { title: "Troca Fácil", subtitle: "7 dias para devolução" },
          { title: "Pagamento Facilitado", subtitle: "Em até 12x no cartão" }
        ],
        facebook: "#",
        instagram: "#",
        hero_style: "split",
        hero_title: "BEM-VINDO À " + newStoreData.name.toUpperCase(),
        promotions: {
          coupons: [],
          active_campaign: { active: false }
        },
        store_mode: "loja",
        description: newStoreData.description || "Loja virtual premium configurada com sucesso!",
        niche: newStoreData.niche || "Moda & Acessórios Premium",
        font_family: "Inter",
        button_style: "pill",
        footer_links: [
          { url: "?view=produtos", label: "Produtos" },
          { url: "#colecao-premium", label: "Destaques" }
        ],
        header_links: [
          { url: "/", label: "Home" },
          { url: "?view=produtos", label: "Produtos" }
        ],
        header_style: "center_menu",
        hero_bg_color: "#141414",
        hero_subtitle: "As melhores peças com os melhores preços.",
        button_variant: "filled",
        show_hero_text: true,
        footer_bg_color: "#171717",
        header_bg_color: "#bab5b5",
        hero_title_color: "#f5f5f5",
        sale_price_color: "#e60000",
        top_bar_bg_color: "#000000",
        button_text_color: "#ffffff",
        flash_deals_title: "Ofertas do Dia",
        footer_text_color: "#ffffff",
        header_icon_color: "#171716",
        show_new_arrivals: true,
        button_hover_color: "#030303",
        footer_description: "Loja virtual premium desenvolvida na plataforma Criar Lojas.",
        new_arrivals_title: "Novidades",
        normal_price_color: "#bbbbbb",
        top_bar_text_color: "#ffffff",
        default_price_color: "#000000",
        hero_subtitle_color: "#d10000",
        top_bar_announcement: "FRETE GRÁTIS PARA TODO O BRASIL EM COMPRAS ACIMA DE R$ 299",
        ...baseSettings,
        name: newStoreData.name,
        email: newStoreData.email,
        phone: newStoreData.whatsapp,
        whatsapp: newStoreData.whatsapp,
        subdomain: cleanSubdomain,
        layout_model: newStoreData.layoutModel,
        primary_color: newStoreData.primaryColor,
        button_color: newStoreData.primaryColor,
        active: true,
        is_demo: newStoreData.isDemo,
        billing_enabled: newStoreData.billingEnabled,
        admin_user: newStoreData.adminUser || newStoreData.email,
        admin_password: newStoreData.adminPassword || 'senha123'
      }

      const { data: newStoreDataRes, error: insertErr } = await supabase
        .from('stores')
        .insert({
          name: newStoreData.name,
          subdomain: cleanSubdomain,
          settings: initialSettings
        })
        .select()
        .single()

      if (insertErr) throw insertErr

      // Clonar Produtos e Categorias se houver um cloneFromStoreId definido
      if (newStoreData.cloneFromStoreId) {
        // 1. Buscar e clonar Categorias
        const { data: originalCategories } = await supabase
          .from('categories')
          .select('*')
          .eq('store_id', newStoreData.cloneFromStoreId)

        if (originalCategories && originalCategories.length > 0) {
          const categoriesToInsert = originalCategories.map(cat => ({
            name: cat.name,
            image_url: cat.image_url,
            store_id: newStoreDataRes.id
          }))
          await supabase.from('categories').insert(categoriesToInsert)
        }

        // 2. Buscar e clonar Produtos
        const { data: originalProducts } = await supabase
          .from('products')
          .select('*')
          .eq('store_id', newStoreData.cloneFromStoreId)

        if (originalProducts && originalProducts.length > 0) {
          const productsToInsert = originalProducts.map(prod => ({
            store_id: newStoreDataRes.id,
            name: prod.name,
            slug: prod.slug,
            price: prod.price,
            short_description: prod.short_description,
            description: prod.description,
            stock_quantity: prod.stock_quantity,
            sku: prod.sku,
            category: prod.category,
            sale_price: prod.sale_price,
            weight: prod.weight,
            length: prod.length,
            width: prod.width,
            height: prod.height,
            is_active: prod.is_active,
            is_featured: prod.is_featured,
            is_service: prod.is_service,
            images: prod.images,
            has_variations: prod.has_variations,
            variation_options: prod.variation_options,
            variation_skus: prod.variation_skus
          }))
          await supabase.from('products').insert(productsToInsert)
        }
      }

      setStores(prev => [newStoreDataRes, ...prev])
      toast.success(`Loja criada com sucesso! Acesse em ${cleanSubdomain}${domainSuffix}`)
      setShowCreateModal(false)
      setNewStoreData({
        name: '',
        subdomain: '',
        email: '',
        whatsapp: '',
        adminUser: '',
        adminPassword: 'senha123',
        plan: 'basic',
        layoutModel: 'modern',
        primaryColor: '#0ea5e9',
        isDemo: false,
        billingEnabled: true,
        cloneFromSettings: null,
        cloneFromStoreId: null,
        niche: 'Moda & Acessórios Premium',
        description: 'Loja virtual premium configurada com alta conversão.'
      })
    } catch (error: any) {
      console.error('Erro ao criar/clonar loja:', error.message)
      toast.error('Erro ao cadastrar nova loja no banco de dados.')
    } finally {
      setCreatingStore(false)
    }
  }


  const filteredStores = stores.filter(store => {
    const matchesSearch = !searchTerm || 
      store.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      store.subdomain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.id.toLowerCase().includes(searchTerm.toLowerCase())

    const isActive = store.settings?.active !== false
    const isDemoStore = store.settings?.is_demo === true

    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && isActive) || 
      (statusFilter === 'blocked' && !isActive) ||
      (statusFilter === 'demo' && isDemoStore)

    return matchesSearch && matchesStatus
  })

  return (
    <div style={{ display: 'grid', gap: '2.5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--foreground)' }}>Lojas Cadastradas & Vitrines</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Gerencie tenants reais e crie Lojas Modelo (Vitrines) para encantar futuros clientes.</p>
        </div>
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input 
              type="text" 
              placeholder="Buscar loja ou subdomínio..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', outline: 'none', fontSize: '0.9rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--input-bg)', padding: '0.25rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
            {[
              { id: 'all', label: 'Todas' }, 
              { id: 'active', label: 'Ativas' }, 
              { id: 'demo', label: '🌟 Lojas Modelo' }, 
              { id: 'blocked', label: 'Bloqueadas' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  padding: '0.5rem 0.85rem',
                  border: 'none',
                  borderRadius: '8px',
                  background: statusFilter === tab.id ? '#10b981' : 'transparent',
                  color: statusFilter === tab.id ? 'white' : 'var(--muted)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: '0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button 
            onClick={() => {
              setNewStoreData({
                name: '',
                subdomain: '',
                email: '',
                whatsapp: '',
                adminUser: '',
                adminPassword: 'senha123',
                plan: 'basic',
                layoutModel: 'modern',
                primaryColor: '#0ea5e9',
                isDemo: false,
                billingEnabled: true,
                cloneFromSettings: null,
                niche: 'Moda & Acessórios Premium',
                description: 'Loja virtual premium configurada com alta conversão.'
              })
              setShowCreateModal(true)
            }}
            style={{ padding: '0.75rem 1.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)', whiteSpace: 'nowrap' }}
            className="btn-create"
          >
            <Plus size={20} />
            <span>Cadastrar Loja</span>
          </button>
        </div>
      </header>

      {/* Tabela Completa de Lojas */}
      <div className="glass-card" style={{ padding: '2.5rem' }}>
        {loading ? (
          <div style={{ padding: '5rem', textAlign: 'center' }}><Loader2 size={32} className="animate-spin" color="#10b981" style={{ margin: '0 auto' }} /></div>
        ) : filteredStores.length === 0 ? (
          <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--muted)', background: 'var(--input-bg)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
            Nenhuma loja encontrada com os filtros atuais.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted)', fontSize: '0.85rem' }}>
                <th style={{ paddingBottom: '1.25rem', fontWeight: 700 }}>LOJA / ID</th>
                <th style={{ paddingBottom: '1.25rem', fontWeight: 700 }}>CONTATO</th>
                <th style={{ paddingBottom: '1.25rem', fontWeight: 700 }}>TIPO / CADASTRO</th>
                <th style={{ paddingBottom: '1.25rem', fontWeight: 700 }}>STATUS</th>
                <th style={{ paddingBottom: '1.25rem', fontWeight: 700, textAlign: 'right' }}>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {filteredStores.map(store => {
                const isActive = store.settings?.active !== false
                const isDemoStore = store.settings?.is_demo === true
                const contactEmail = store.settings?.email || 'contato@' + store.subdomain + '.com.br'
                const contactPhone = store.settings?.phone || store.settings?.whatsapp || 'Não informado'

                return (
                  <tr key={store.id} style={{ borderBottom: '1px solid var(--border)' }} className="store-row">
                    <td style={{ padding: '1.5rem 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'var(--input-bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          {store.settings?.logo_url ? <img src={store.settings.logo_url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <Store size={22} color="var(--muted)" />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: 'var(--foreground)', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>{store.name}</span>
                            {isDemoStore && (
                              <span style={{ padding: '0.2rem 0.5rem', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.25rem', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                                <Sparkles size={12} />
                                Vitrine Modelo
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>ID: {store.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--foreground)', fontSize: '0.9rem' }}>{contactEmail}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Tel: {contactPhone}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: isDemoStore ? '#f59e0b' : 'var(--muted)', fontSize: '0.85rem' }}>
                        {isDemoStore ? 'Loja Demonstrativa' : 'Tenant Comercial'}
                      </div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 500 }}>{new Date(store.created_at).toLocaleDateString()}</div>
                    </td>
                    <td>
                      <span style={{ 
                        padding: '0.35rem 0.85rem', 
                        borderRadius: '20px', 
                        fontSize: '0.75rem', 
                        fontWeight: 800, 
                        backgroundColor: isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                        color: isActive ? '#10b981' : '#ef4444', 
                        border: isActive ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)' 
                      }}>
                        {isActive ? 'Ativa' : 'Bloqueada'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => handleOpenClone(store)}
                          style={{ padding: '0.5rem 0.75rem', background: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.2)', borderRadius: '8px', color: '#0ea5e9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.8rem' }}
                          className="btn-action"
                          title="Criar nova loja copiando este layout"
                        >
                          <Copy size={14} />
                          <span>Clonar</span>
                        </button>

                        <button 
                          onClick={() => handleOpenEdit(store)}
                          style={{ padding: '0.5rem 0.75rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '8px', color: '#f59e0b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.8rem' }}
                          className="btn-action"
                          title="Editar dados cadastrais desta loja"
                        >
                          <Edit size={14} />
                          <span>Editar</span>
                        </button>

                        <a 
                          href={getAbsoluteUrl(store.subdomain)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ padding: '0.5rem 0.75rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.8rem' }}
                          className="btn-action"
                          title="Visualizar loja ao vivo"
                        >
                          <Eye size={14} />
                          <span>Ver</span>
                        </a>

                        <button 
                          onClick={() => handleToggleStatus(store)}
                          disabled={updating}
                          style={{ 
                            padding: '0.5rem 0.75rem', 
                            background: isActive ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                            border: isActive ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)', 
                            borderRadius: '8px', 
                            color: isActive ? '#ef4444' : '#10b981', 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.4rem', 
                            fontWeight: 700, 
                            fontSize: '0.8rem' 
                          }}
                          className="btn-action"
                        >
                          {isActive ? <Lock size={14} /> : <Unlock size={14} />}
                          <span>{isActive ? 'Bloquear' : 'Desbloquear'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de Cadastro de Nova Loja (Onboarding) */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(9, 13, 22, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <div className="glass-card" style={{ maxWidth: '750px', width: '100%', padding: '2.5rem', position: 'relative', borderRadius: '16px', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setShowCreateModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--muted)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}>
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: newStoreData.cloneFromSettings ? 'linear-gradient(135deg, #0ea5e9, #6366f1)' : 'linear-gradient(135deg, #10b981, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                {newStoreData.cloneFromSettings ? <Copy size={26} /> : <Store size={26} />}
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--foreground)' }}>
                  {newStoreData.cloneFromSettings ? 'Clonar Loja / Vitrine Modelo' : 'Cadastrar Nova Loja (Tenant)'}
                </h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                  {newStoreData.cloneFromSettings 
                    ? `Criando uma nova loja herdando o layout e identidade visual de ${newStoreData.cloneFromSettings.name || 'modelo'}.`
                    : 'Crie o ambiente completo de e-commerce para um novo lojista contratante ou vitrine.'}
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateStore} style={{ display: 'grid', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>Nome da Loja / Vitrine</label>
                  <input 
                    type="text" 
                    value={newStoreData.name}
                    onChange={e => setNewStoreData({...newStoreData, name: e.target.value})}
                    placeholder="Ex: Loja Modelo Fashion"
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', outline: 'none', fontWeight: 600 }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>Subdomínio da URL</label>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
                    <input 
                      type="text" 
                      value={newStoreData.subdomain}
                      onChange={e => setNewStoreData({...newStoreData, subdomain: e.target.value})}
                      placeholder="modelofashion"
                      style={{ width: '100%', padding: '0.75rem 1rem', background: 'transparent', border: 'none', color: 'var(--foreground)', outline: 'none', fontWeight: 600 }}
                      required
                    />
                    <span style={{ padding: '0 1rem', color: 'var(--muted)', fontSize: '0.85rem', fontWeight: 600, background: 'rgba(0,0,0,0.2)', height: '100%', display: 'flex', alignItems: 'center' }}>{domainSuffix}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>E-mail de Contato</label>
                  <input 
                    type="email" 
                    value={newStoreData.email}
                    onChange={e => setNewStoreData({...newStoreData, email: e.target.value, adminUser: newStoreData.adminUser || e.target.value})}
                    placeholder="contato@lojamodelo.com.br"
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', outline: 'none', fontWeight: 600 }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>WhatsApp Comercial</label>
                  <input 
                    type="text" 
                    value={newStoreData.whatsapp}
                    onChange={e => setNewStoreData({...newStoreData, whatsapp: e.target.value})}
                    placeholder="11999998888"
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', outline: 'none', fontWeight: 600 }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', background: 'rgba(16, 185, 129, 0.05)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#10b981', marginBottom: '0.5rem' }}>🔐 Usuário de Acesso (Painel Admin)</label>
                  <input 
                    type="text" 
                    value={newStoreData.adminUser}
                    onChange={e => setNewStoreData({...newStoreData, adminUser: e.target.value})}
                    placeholder="admin@sualoja.com.br"
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', outline: 'none', fontWeight: 600 }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#10b981', marginBottom: '0.5rem' }}>🔑 Senha Padrão Inicial</label>
                  <input 
                    type="text" 
                    value={newStoreData.adminPassword}
                    onChange={e => setNewStoreData({...newStoreData, adminPassword: e.target.value})}
                    placeholder="senha123"
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', outline: 'none', fontWeight: 600 }}
                    required
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.25rem', display: 'block' }}>O lojista poderá alterar esta senha no painel dele.</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', background: 'var(--input-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>Plano Associado</label>
                  <select 
                    value={newStoreData.plan}
                    onChange={e => setNewStoreData({...newStoreData, plan: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', outline: 'none', fontWeight: 600, cursor: 'pointer' }}
                  >
                    <option value="basic">Plano Básico</option>
                    <option value="pro">Plano Profissional</option>
                    <option value="premium">Premium Ilimitado</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>Layout Inicial</label>
                  <select 
                    value={newStoreData.layoutModel}
                    onChange={e => setNewStoreData({...newStoreData, layoutModel: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', outline: 'none', fontWeight: 600, cursor: 'pointer' }}
                  >
                    <option value="modern">Moderno (Geral)</option>
                    <option value="fashion">Fashion & Moda</option>
                    <option value="tech">Tech & Eletrônicos</option>
                    <option value="services">Serviços & Peças</option>
                    <option value="lawyer">Advocacia (Serviço)</option>
                    <option value="electrician">Eletricista (Serviço)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>Cor Primária</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--background)', padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: '10px' }}>
                    <input 
                      type="color" 
                      value={newStoreData.primaryColor}
                      onChange={e => setNewStoreData({...newStoreData, primaryColor: e.target.value})}
                      style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                    />
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--foreground)' }}>{newStoreData.primaryColor}</span>
                  </div>
                </div>
              </div>

              {/* Informações da Vitrine / Nicho */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', background: 'var(--input-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>Categoria / Nicho (Tag)</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Moda, Tecnologia, Esportes..." 
                    value={newStoreData.niche}
                    onChange={e => setNewStoreData({...newStoreData, niche: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', outline: 'none', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>Breve Descrição do Nicho</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Layout focado em apelo visual e alta conversão..." 
                    value={newStoreData.description}
                    onChange={e => setNewStoreData({...newStoreData, description: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', outline: 'none', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              {/* Opções de Loja Modelo e Faturamento */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(245, 158, 11, 0.08)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  <input 
                    type="checkbox" 
                    id="isDemoCheck"
                    checked={newStoreData.isDemo}
                    onChange={e => setNewStoreData({...newStoreData, isDemo: e.target.checked, billingEnabled: !e.target.checked})}
                    style={{ width: '20px', height: '20px', accentColor: '#f59e0b', cursor: 'pointer' }}
                  />
                  <div>
                    <label htmlFor="isDemoCheck" style={{ fontWeight: 800, color: '#f59e0b', cursor: 'pointer', display: 'block', fontSize: '0.95rem' }}>
                      Definir como Loja Modelo / Vitrine 🌟
                    </label>
                    <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                      Marca como vitrine demonstrativa para clientes.
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(16, 185, 129, 0.08)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <input 
                    type="checkbox" 
                    id="billingCheck"
                    checked={newStoreData.billingEnabled}
                    onChange={e => setNewStoreData({...newStoreData, billingEnabled: e.target.checked})}
                    style={{ width: '20px', height: '20px', accentColor: '#10b981', cursor: 'pointer' }}
                  />
                  <div>
                    <label htmlFor="billingCheck" style={{ fontWeight: 800, color: '#10b981', cursor: 'pointer', display: 'block', fontSize: '0.95rem' }}>
                      Ativar Gerenciamento de Faturamento / Pagamento 💳
                    </label>
                    <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                      Gera faturas mensais e exibe o cliente em Lojistas & Usuários SaaS.
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', fontWeight: 600, cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={creatingStore} style={{ padding: '0.75rem 2.5rem', background: newStoreData.cloneFromSettings ? '#0ea5e9' : '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: newStoreData.cloneFromSettings ? '0 4px 15px rgba(14, 165, 233, 0.4)' : '0 4px 15px rgba(16, 185, 129, 0.4)' }}>
                  {creatingStore ? <Loader2 size={20} className="animate-spin" /> : null}
                  <span>{newStoreData.cloneFromSettings ? 'Confirmar & Clonar Loja' : 'Confirmar & Criar Loja'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Configurações da Loja */}
      {showConfigModal && selectedStore && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(9, 13, 22, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <div className="glass-card" style={{ maxWidth: '800px', width: '100%', padding: '2.5rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setShowConfigModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--muted)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}>
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'var(--input-bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {selectedStore.settings?.logo_url ? <img src={selectedStore.settings.logo_url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <Store size={32} color="var(--muted)" />}
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--foreground)' }}>{selectedStore.name}</h3>
                <span style={{ fontSize: '0.85rem', color: '#0ea5e9', fontWeight: 600 }}>{selectedStore.subdomain}{getDomainSuffix()}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
              <div style={{ background: 'var(--input-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem 0', color: 'var(--foreground)' }}>Identidade Visual</h4>
                <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>Cor Primária:</span> <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '14px', height: '14px', borderRadius: '3px', background: selectedStore.settings?.primary_color || '#ff0000' }} />{selectedStore.settings?.primary_color || '#ff0000'}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>Modelo de Layout:</span> <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>{selectedStore.settings?.layout_model || 'modern'}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>Modo da Loja:</span> <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>{selectedStore.settings?.store_mode || 'loja'}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>Estilo do Botão:</span> <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>{selectedStore.settings?.button_style || 'pill'}</span></div>
                </div>
              </div>

              <div style={{ background: 'var(--input-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem 0', color: 'var(--foreground)' }}>Contato & Suporte</h4>
                <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>E-mail:</span> <span style={{ fontWeight: 600 }}>{selectedStore.settings?.email || 'Não cadastrado'}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>WhatsApp:</span> <span style={{ fontWeight: 600 }}>{selectedStore.settings?.whatsapp || 'Não cadastrado'}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>Telefone:</span> <span style={{ fontWeight: 600 }}>{selectedStore.settings?.phone || 'Não cadastrado'}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>Endereço:</span> <span style={{ fontWeight: 600 }}>{selectedStore.settings?.address || 'Não cadastrado'}</span></div>
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#10b981', margin: '0 0 0.25rem 0' }}>Status do Tenant: {selectedStore.settings?.active !== false ? 'Ativo' : 'Bloqueado'}</h4>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: 0 }}>Use as ações da tabela para bloquear ou desbloquear o acesso público a esta loja.</p>
              </div>
              <button onClick={() => setShowConfigModal(false)} style={{ padding: '0.75rem 1.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Loja */}
      {showEditModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(9, 13, 22, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <div className="glass-card" style={{ maxWidth: '750px', width: '100%', padding: '2.5rem', position: 'relative', borderRadius: '16px', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setShowEditModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--muted)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}>
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <Edit size={26} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--foreground)' }}>Editar Cadastro da Loja</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>Altere as informações de domínio, contato, plano e credenciais de acesso.</p>
              </div>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'grid', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>Nome da Loja / Vitrine</label>
                  <input 
                    type="text" 
                    value={editStoreData.name}
                    onChange={e => setEditStoreData({...editStoreData, name: e.target.value})}
                    placeholder="Ex: Loja Modelo Fashion"
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', outline: 'none', fontWeight: 600 }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>Subdomínio da URL</label>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
                    <input 
                      type="text" 
                      value={editStoreData.subdomain}
                      onChange={e => setEditStoreData({...editStoreData, subdomain: e.target.value})}
                      placeholder="modelofashion"
                      style={{ width: '100%', padding: '0.75rem 1rem', background: 'transparent', border: 'none', color: 'var(--foreground)', outline: 'none', fontWeight: 600 }}
                      required
                    />
                    <span style={{ padding: '0 1rem', color: 'var(--muted)', fontSize: '0.85rem', fontWeight: 600, background: 'rgba(0,0,0,0.2)', height: '100%', display: 'flex', alignItems: 'center' }}>{domainSuffix}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>E-mail de Contato</label>
                  <input 
                    type="email" 
                    value={editStoreData.email}
                    onChange={e => setEditStoreData({...editStoreData, email: e.target.value})}
                    placeholder="contato@lojamodelo.com.br"
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', outline: 'none', fontWeight: 600 }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>WhatsApp Comercial</label>
                  <input 
                    type="text" 
                    value={editStoreData.whatsapp}
                    onChange={e => setEditStoreData({...editStoreData, whatsapp: e.target.value})}
                    placeholder="11999998888"
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', outline: 'none', fontWeight: 600 }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', background: 'rgba(16, 185, 129, 0.05)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#10b981', marginBottom: '0.5rem' }}>🔐 Usuário de Acesso (Painel Admin)</label>
                  <input 
                    type="text" 
                    value={editStoreData.adminUser}
                    onChange={e => setEditStoreData({...editStoreData, adminUser: e.target.value})}
                    placeholder="admin@sualoja.com.br"
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', outline: 'none', fontWeight: 600 }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#10b981', marginBottom: '0.5rem' }}>🔑 Senha Padrão Inicial</label>
                  <input 
                    type="text" 
                    value={editStoreData.adminPassword}
                    onChange={e => setEditStoreData({...editStoreData, adminPassword: e.target.value})}
                    placeholder="senha123"
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', outline: 'none', fontWeight: 600 }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', background: 'var(--input-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>Plano Associado</label>
                  <select 
                    value={editStoreData.plan}
                    onChange={e => setEditStoreData({...editStoreData, plan: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', outline: 'none', fontWeight: 600, cursor: 'pointer' }}
                  >
                    <option value="basic">Plano Básico</option>
                    <option value="pro">Plano Profissional</option>
                    <option value="premium">Premium Ilimitado</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>Layout Inicial</label>
                  <select 
                    value={editStoreData.layoutModel}
                    onChange={e => setEditStoreData({...editStoreData, layoutModel: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', outline: 'none', fontWeight: 600, cursor: 'pointer' }}
                  >
                    <option value="modern">Moderno (Geral)</option>
                    <option value="fashion">Fashion & Moda</option>
                    <option value="tech">Tech & Eletrônicos</option>
                    <option value="services">Serviços & Peças</option>
                    <option value="lawyer">Advocacia (Serviço)</option>
                    <option value="electrician">Eletricista (Serviço)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>Cor Primária</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--background)', padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: '10px' }}>
                    <input 
                      type="color" 
                      value={editStoreData.primaryColor}
                      onChange={e => setEditStoreData({...editStoreData, primaryColor: e.target.value})}
                      style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                    />
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--foreground)' }}>{editStoreData.primaryColor}</span>
                  </div>
                </div>
              </div>

              {/* Informações da Vitrine / Nicho */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', background: 'var(--input-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>Categoria / Nicho (Tag)</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Moda, Tecnologia, Esportes..." 
                    value={editStoreData.niche}
                    onChange={e => setEditStoreData({...editStoreData, niche: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', outline: 'none', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>Breve Descrição do Nicho</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Layout focado em apelo visual e alta conversão..." 
                    value={editStoreData.description}
                    onChange={e => setEditStoreData({...editStoreData, description: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', outline: 'none', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(245, 158, 11, 0.08)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  <input 
                    type="checkbox" 
                    id="isDemoCheckEdit"
                    checked={editStoreData.isDemo}
                    onChange={e => setEditStoreData({...editStoreData, isDemo: e.target.checked, billingEnabled: !e.target.checked})}
                    style={{ width: '20px', height: '20px', accentColor: '#f59e0b', cursor: 'pointer' }}
                  />
                  <div>
                    <label htmlFor="isDemoCheckEdit" style={{ fontWeight: 800, color: '#f59e0b', cursor: 'pointer', display: 'block', fontSize: '0.95rem' }}>
                      Definir como Loja Modelo / Vitrine 🌟
                    </label>
                    <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                      Marca como vitrine demonstrativa para clientes.
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(16, 185, 129, 0.08)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <input 
                    type="checkbox" 
                    id="billingCheckEdit"
                    checked={editStoreData.billingEnabled}
                    onChange={e => setEditStoreData({...editStoreData, billingEnabled: e.target.checked})}
                    style={{ width: '20px', height: '20px', accentColor: '#10b981', cursor: 'pointer' }}
                  />
                  <div>
                    <label htmlFor="billingCheckEdit" style={{ fontWeight: 800, color: '#10b981', cursor: 'pointer', display: 'block', fontSize: '0.95rem' }}>
                      Ativar Gerenciamento de Faturamento / Pagamento 💳
                    </label>
                    <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                      Gera faturas mensais e exibe o cliente em Lojistas & Usuários SaaS.
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  onClick={() => editingStoreId ? handleDeleteStore({ id: editingStoreId, name: editStoreData.name }) : null}
                  disabled={updating}
                  style={{ padding: '0.75rem 1.5rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', color: '#ef4444', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  className="btn-action"
                  title="Excluir loja e apagar todos os dados"
                >
                  <Trash2 size={18} />
                  <span>Excluir Loja Permanentemente</span>
                </button>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" onClick={() => setShowEditModal(false)} style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', fontWeight: 600, cursor: 'pointer' }}>
                    Cancelar
                  </button>
                  <button type="submit" disabled={updating} style={{ padding: '0.75rem 2.5rem', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)' }}>
                    {updating ? <Loader2 size={20} className="animate-spin" /> : null}
                    <span>Salvar Alterações</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão Customizado */}
      {storeToDelete && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(9, 13, 22, 0.85)', 
          backdropFilter: 'blur(10px)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1100, 
          padding: '2rem' 
        }}>
          <div className="glass-card" style={{ 
            maxWidth: '500px', 
            width: '100%', 
            padding: '2.5rem', 
            borderRadius: '24px', 
            border: '1px solid rgba(239, 68, 68, 0.3)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(239, 68, 68, 0.1)',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(30, 20, 20, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)'
          }}>
            <div style={{ 
              width: '70px', 
              height: '70px', 
              borderRadius: '50%', 
              background: 'rgba(239, 68, 68, 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 1.5rem',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              <ShieldAlert size={36} color="#ef4444" />
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 1rem 0', color: '#f8fafc' }}>
              Confirmar Exclusão
            </h3>
            
            <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.6', margin: '0 0 2rem 0' }}>
              Tem certeza que deseja excluir a loja <strong style={{ color: '#ef4444' }}>"{storeToDelete.name.toUpperCase()}"</strong>? 
              <br /><br />
              Esta ação apagará a loja e todas as suas informações do banco de dados para liberar espaço. <span style={{ fontWeight: 700, color: '#f8fafc' }}>Esta operação é irreversível!</span>
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                type="button" 
                onClick={() => setStoreToDelete(null)} 
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  border: '1px solid var(--border)', 
                  borderRadius: '12px', 
                  color: 'var(--foreground)', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  transition: '0.2s' 
                }}
                className="btn-action"
              >
                Cancelar
              </button>
              <button 
                type="button" 
                onClick={confirmDeleteStore} 
                disabled={updating}
                style={{ 
                  padding: '0.75rem 2rem', 
                  background: '#ef4444', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '12px', 
                  fontWeight: 800, 
                  cursor: 'pointer',
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
                  transition: '0.2s'
                }}
                className="btn-action"
              >
                {updating ? <Loader2 size={18} className="animate-spin" /> : null}
                <span>Sim, Excluir</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .store-row:hover { background-color: rgba(255, 255, 255, 0.01); }
        .link-hover:hover { text-decoration: underline !important; }
        .btn-action:hover { filter: brightness(1.1); }
        .btn-create:hover { filter: brightness(1.1); }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
