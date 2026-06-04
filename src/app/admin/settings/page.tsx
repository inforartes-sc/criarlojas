"use client"

import { useState, useEffect } from 'react'
import { Save, Loader2, Palette, Globe, Store, Type, Layout, Image as ImageIcon, Upload, X, Lock, ShoppingBag, Scale, Truck, ShieldCheck, RefreshCw, CreditCard, Heart, Star, Zap, Package, Headphones, Award, Shield, Clock, ThumbsUp, CheckCircle, Smile, TrendingUp, DollarSign, Phone, MessageSquare, Users, ShoppingCart, Gift, Tag, Percent, Wallet, Banknote, PiggyBank, Gem, Leaf, Box, Sparkles, Wrench } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { getDomainSuffix } from '@/lib/getDomainSuffix'

export default function SettingsPage() {
  const { store: authStore } = useAdminAuth()
  const storeId = authStore?.id || ''
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('nicho')
  const [confirmModal, setConfirmModal] = useState<{ message: string; onConfirm: () => void } | null>(null)
  const [domainSuffix, setDomainSuffix] = useState('.localhost:3000')

  useEffect(() => {
    setDomainSuffix(getDomainSuffix())
  }, [])

  const isServicesOnly = () => ['lawyer', 'advocacia', 'advocacy', 'services', 'electrician'].includes(formData.layout_model)
  
  const [formData, setFormData] = useState<Record<string, any>>({
    name: '',
    subdomain: '',
    custom_domain: '',
    logo_url: '',
    favicon_url: '',
    primary_color: '#6366f1',
    secondary_color: '#06b6d4',
    theme_mode: 'light',
    cta_bg_color: '#6366f1',
    cta_use_gradient: false,
    cta_title_color: '#ffffff',
    cta_desc_color: '#ffffff',
    cta_button_bg_color: '#25D366',
    cta_button_text_color: '#ffffff',
    button_color: '#000000',
    button_text_color: '#ffffff',
    button_hover_color: '#333333',
    button_hover_text_color: '#ffffff',
    sale_price_color: '#ef4444',
    normal_price_color: '#bbbbbb',
    default_price_color: '#000000',
    header_bg_color: '#ffffff',
    header_icon_color: '#000000',
    header_links: [
      { label: 'Home', url: '/' },
      { label: 'Produtos', url: '?view=produtos' },
      { label: 'Categorias', url: '#' }
    ],
    top_bar_bg_color: '#000000',
    top_bar_text_color: '#ffffff',
    top_bar_announcement: 'FRETE GRÁTIS PARA TODO O BRASIL EM COMPRAS ACIMA DE R$ 299',
    description: '',
    hero_title: 'REDEFINA SEU CONCEITO DE MODA',
    hero_subtitle: 'Descubra peças selecionadas que unem conforto e sofisticação.',
    font_family: 'Inter',
    button_style: 'rounded',
    button_variant: 'filled',
    button_hover_variant: 'filled',
    header_style: 'modern',
    hero_style: 'split',
    layout_model: 'modern', // tech, fashion, office, modern
    store_mode: 'loja', // loja, catalogo
    benefits: [
      { title: 'Entrega Rápida', subtitle: 'Calcule o prazo no checkout', icon: 'Truck' },
      { title: 'Compra Segura', subtitle: 'Ambiente 100% protegido', icon: 'ShieldCheck' },
      { title: 'Troca Fácil', subtitle: '7 dias para devolução', icon: 'RefreshCw' },
      { title: 'Pagamento Facilitado', subtitle: 'Em até 12x no cartão', icon: 'CreditCard' }
    ],
    features: [
      { icon: 'Headphones', title: 'Atendimento Especializado', desc: 'Consultores técnicos prontos para analisar o seu projeto do zero ao acabamento.' },
      { icon: 'Award', title: 'Garantia de Qualidade', desc: 'Instalação credenciada com manutenção de garantia original dos fabricantes.' },
      { icon: 'Heart', title: 'Suporte Personalizado', desc: 'Acompanhamento dedicado pós-venda e atendimento emergencial prioritário.' },
      { icon: 'ShieldCheck', title: 'Técnicos Credenciados', desc: 'Profissionais qualificados pelas principais marcas do mercado de climatização.' }
    ],
    flash_deals_title: 'Ofertas do Dia',
    show_new_arrivals: true,
    new_arrivals_title: 'Novidades',
    hero_image_url: '',
    hero_bg_color: '#ffffff',
    hero_title_color: '#111111',
    hero_subtitle_color: '#555555',
    show_hero_text: true,
    footer_description: '',
    footer_logo_url: '',
    footer_bg_color: '#111111',
    footer_text_color: '#ffffff',
    footer_links: [
      { label: 'Produtos', url: '?view=produtos' },
      { label: 'Destaques', url: '#colecao-premium' },
      { label: 'Privacidade', url: '#' },
      { label: 'Termos', url: '#' },
      { label: 'Contato', url: '#' }
    ],
    whatsapp: '',
    instagram: '',
    facebook: '',
    phone: '',
    email: '',
    address: '',
    admin_user: '',
    admin_password: '',
    gtm_id: '',
    ga_id: '',
    google_ads_id: '',
    fb_pixel_id: '',
    // Modelo Advocacia fields
    hero_badge: 'Advocacia & Assessoria Jurídica',
    services_title: 'Nossas Especialidades Jurídicas',
    services_subtitle: 'Prestamos assessoria de alta performance voltada à mitigação de riscos e defesa de direitos.',
    services_tag: 'Nossos Serviços',
    about_image_url: '',
    about_title: 'Excelência e Solidez Jurídica',
    about_subtitle: '"Nosso compromisso fundamental é a segurança jurídica absoluta de nossos clientes nas decisões mais importantes da vida e dos negócios."',
    about_description_1: 'Fundado sobre os pilares da ética corporativa e rigor técnico acadêmico, o escritório nasceu para preencher a necessidade de uma advocacia verdadeiramente focada nas peculiaridades de cada cliente. Não trabalhamos com soluções genéricas ou em massa.',
    about_description_2: 'Nosso corpo de advogados assessora de forma preventiva, desenvolvendo planejamentos estratégicos contratuais, civis e tributários que impedem conflitos judiciais futuros. Em matérias contenciosas, representamos os clientes de maneira vigorosa e combativa em todas as instâncias do Poder Judiciário.',
    stat_count_1: '98',
    stat_label_1: 'Casos de Sucesso',
    stat_count_2: '1500',
    stat_label_2: 'Clientes Atendidos',
    stat_count_3: '12',
    stat_label_3: 'De Atuação',
    stat_count_4: '15',
    stat_label_4: 'Especialistas',
    stat_suffix_1: '+',
    stat_suffix_2: '+',
    stat_suffix_3: ' anos',
    stat_suffix_4: '/5',
    testimonial_1: 'A atuação do escritório na reestruturação societária da nossa empresa foi impecável. Conduziram o processo com discrição, ética e um nível de detalhismo que evitou passivos futuros significativos.',
    testimonial_1_name: 'Roberto Camargo',
    testimonial_1_role: 'Diretor Executivo na Vanguarda Tech',
    testimonial_1_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    testimonial_2: 'Fui assessorado no processo de partilha de bens e inventário familiar. Toda a equipe se mostrou extremamente humana, sensível ao momento delicado e focada em resolver tudo de forma amigável.',
    testimonial_2_name: 'Heloísa Albuquerque',
    testimonial_2_role: 'Arquiteta e Sócia do Studio H+A',
    testimonial_2_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    testimonial_3: 'Excelente suporte na defesa de uma autuação fiscal injusta. O profundo conhecimento técnico do Dr. Marcus fez toda a diferença na vitória administrativa junto ao conselho fiscal.',
    testimonial_3_name: 'Carlos Mendes',
    testimonial_3_role: 'Diretor do Grupo Mendes & Cia',
    testimonial_3_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    team_member_1_name: 'Dr. Alexandre Goldmann',
    team_member_1_role: 'Sócio Fundador - Direito Empresarial',
    team_member_1_desc: 'Mestre em Direito Comercial pela USP, com mais de 15 anos de experiência em reestruturações societárias e fusões de grandes corporações.',
    team_member_1_avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
    team_member_2_name: "Dra. Beatriz D'Angelo",
    team_member_2_role: 'Sócia - Direito Civil e Contratos',
    team_member_2_desc: 'Especialista em Direito Processual Civil, atuante na assessoria de contratos nacionais e internacionais de alta complexidade e direito de família.',
    team_member_2_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    team_member_3_name: 'Dr. Marcus Vinícius Prado',
    team_member_3_role: 'Associado Sênior - Direito Tributário',
    team_member_3_desc: 'Pós-graduado em Gestão Tributária, focado em planejamento fiscal preventivo para grandes grupos econômicos e contencioso administrativo.',
    team_member_3_avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
    differential_1_title: 'Ética & Transparência',
    differential_1_desc: 'Conduzimos cada caso com o mais alto padrão moral, mantendo o cliente informado em todas as etapas de forma clara.',
    differential_2_title: 'Sigilo & Confiança',
    differential_2_desc: 'Garantia de confidencialidade absoluta em todas as consultas e processos judiciais sob nossa responsabilidade.',
    differential_3_title: 'Foco em Resultados',
    differential_3_desc: 'Aliamos profundo conhecimento técnico com estratégia jurídica focada para maximizar as chances de sucesso.',
    differential_4_title: 'Atendimento Ágil',
    differential_4_desc: 'Respostas rápidas e suporte contínuo para garantir tranquilidade e segurança aos nossos representados.',
    team_tag: 'Corpo Jurídico',
    team_title: 'Sócios & Associados Sêniores',
    team_subtitle: 'Conheça os especialistas dedicados a prover representação jurídica do mais alto escalão técnico.',
    testimonials_tag: 'Reconhecimento',
    testimonials_title: 'Depoimentos dos Representados',
    testimonials_subtitle: 'A confiança demonstrada por nossos clientes individuais e corporativos reflete nosso compromisso com a integridade.',
    cta_title: 'Necessita de Defesa ou Consultoria Especializada?',
    cta_subtitle: 'Relate os fatos iniciais de sua causa para nossa equipe jurídica realizar uma triagem prévia confidencial ou agende um alinhamento online com nossos sócios especialistas.',
    cta_btn_text_1: 'Conversar com Advogado',
    cta_btn_text_2: 'Ver Áreas de Atuação',
    team_members: [
      { name: 'Dr. Alexandre Goldmann', role: 'Sócio Fundador - Direito Empresarial', desc: 'Mestre em Direito Comercial pela USP, com mais de 15 anos de experiência em reestruturações societárias e fusões de grandes corporações.', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80' },
      { name: "Dra. Beatriz D'Angelo", role: 'Sócia - Direito Civil e Contratos', desc: 'Especialista em Direito Processual Civil, atuante na assessoria de contratos nacionais e internacionais de alta complexidade e direito de família.', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80' },
      { name: 'Dr. Marcus Vinícius Prado', role: 'Associado Sênior - Direito Tributário', desc: 'Pós-graduado em Gestão Tributária, focado em planejamento fiscal preventivo para grandes grupos econômicos e contencioso administrativo.', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80' }
    ],
    testimonials: [
      { name: 'Roberto Camargo', role: 'Diretor Executivo na Vanguarda Tech', text: 'A atuação do escritório na reestruturação societária da nossa empresa foi impecável. Conduziram o processo com discrição, ética e um nível de detalhismo que evitou passivos futuros significativos.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
      { name: 'Heloísa Albuquerque', role: 'Arquiteta e Sócia do Studio H+A', text: 'Fui assessorado no processo de partilha de bens e inventário familiar. Toda a equipe se mostrou extremamente humana, sensível ao momento delicada e focada em resolver tudo de forma amigável.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
      { name: 'Carlos Mendes', role: 'Diretor do Grupo Mendes & Cia', text: 'Excelente suporte na defesa de uma autuação fiscal injusta. O profundo conhecimento técnico do Dr. Marcus fez toda a diferença na vitória administrativa junto ao conselho fiscal.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' }
    ]
  })

  useEffect(() => {
    if (authStore?.id) {
      fetchStoreSettings()
    }
  }, [authStore])

  const fetchStoreSettings = async () => {
    if (!authStore?.id) return
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', authStore.id)
        .single()

      if (error) throw error

      const s = data.settings || {}
      setFormData({
        name: data.name,
        subdomain: data.subdomain,
        custom_domain: data.custom_domain || s.custom_domain || '',
        logo_url: s.logo_url || '',
        favicon_url: s.favicon_url || '',
        primary_color: s.primary_color || '#6366f1',
        secondary_color: s.secondary_color || '#06b6d4',
        theme_mode: s.theme_mode || 'light',
        cta_bg_color: s.cta_bg_color || s.primary_color || '#6366f1',
        cta_use_gradient: s.cta_use_gradient || false,
        cta_title_color: s.cta_title_color || '#ffffff',
        cta_desc_color: s.cta_desc_color || '#ffffff',
        cta_button_bg_color: s.cta_button_bg_color || '#25D366',
        cta_button_text_color: s.cta_button_text_color || '#ffffff',
        button_color: s.button_color || '#000000',
        button_text_color: s.button_text_color || '#ffffff',
        button_hover_color: s.button_hover_color || '#333333',
        button_hover_text_color: s.button_hover_text_color || '#ffffff',
        sale_price_color: s.sale_price_color || '#ef4444',
        normal_price_color: s.normal_price_color || '#bbbbbb',
        default_price_color: s.default_price_color || '#000000',
        header_bg_color: s.header_bg_color || '#ffffff',
        header_icon_color: s.header_icon_color || '#000000',
        header_links: s.header_links || [
          { label: 'Home', url: '/' },
          { label: 'Produtos', url: '?view=produtos' },
          { label: 'Categorias', url: '#' }
        ],
        top_bar_bg_color: s.top_bar_bg_color || '#000000',
        top_bar_text_color: s.top_bar_text_color || '#ffffff',
        top_bar_announcement: s.top_bar_announcement || 'FRETE GRÁTIS PARA TODO O BRASIL EM COMPRAS ACIMA DE R$ 299',
        description: s.description || '',
        hero_title: s.hero_title || 'REDEFINA SEU CONCEITO DE MODA',
        hero_subtitle: s.hero_subtitle || 'Descubra peças selecionadas que unem conforto e sofisticação.',
        font_family: s.font_family || 'Inter',
        button_style: s.button_style || 'rounded',
        button_variant: s.button_variant || 'filled',
        button_hover_variant: s.button_hover_variant || 'filled',
        header_style: s.header_style || 'modern',
        hero_style: s.hero_style || 'split',
        layout_model: s.layout_model || 'modern',
        store_mode: s.store_mode || 'loja',
        benefits: s.benefits || [
          { title: 'Entrega Rápida', subtitle: 'Calcule o prazo no checkout', icon: 'Truck' },
          { title: 'Compra Segura', subtitle: 'Ambiente 100% protegido', icon: 'ShieldCheck' },
          { title: 'Troca Fácil', subtitle: '7 dias para devolução', icon: 'RefreshCw' },
          { title: 'Pagamento Facilitado', subtitle: 'Em até 12x no cartão', icon: 'CreditCard' }
        ],
        features: s.features || [
          { icon: 'Headphones', title: 'Atendimento Especializado', desc: 'Consultores técnicos prontos para analisar o seu projeto do zero ao acabamento.' },
          { icon: 'Award', title: 'Garantia de Qualidade', desc: 'Instalação credenciada com manutenção de garantia original dos fabricantes.' },
          { icon: 'Heart', title: 'Suporte Personalizado', desc: 'Acompanhamento dedicado pós-venda e atendimento emergencial prioritário.' },
          { icon: 'ShieldCheck', title: 'Técnicos Credenciados', desc: 'Profissionais qualificados pelas principais marcas do mercado de climatização.' }
        ],
        flash_deals_title: s.flash_deals_title || 'Ofertas do Dia',
        show_new_arrivals: s.show_new_arrivals !== undefined ? s.show_new_arrivals : true,
        new_arrivals_title: s.new_arrivals_title || 'Novidades',
        hero_image_url: s.hero_image_url || '',
        hero_bg_color: s.hero_bg_color || '#ffffff',
        hero_title_color: s.hero_title_color || '#111111',
        hero_subtitle_color: s.hero_subtitle_color || '#555555',
        show_hero_text: s.show_hero_text !== undefined ? s.show_hero_text : true,
        footer_description: s.footer_description || '',
        footer_logo_url: s.footer_logo_url || '',
        footer_bg_color: s.footer_bg_color || '#111111',
        footer_text_color: s.footer_text_color || '#ffffff',
        footer_links: s.footer_links || [
          { label: 'Produtos', url: '?view=produtos' },
          { label: 'Destaques', url: '#colecao-premium' },
          { label: 'Privacidade', url: '#' },
          { label: 'Termos', url: '#' },
          { label: 'Contato', url: '#' }
        ],
        whatsapp: s.whatsapp || '',
        instagram: s.instagram || '',
        facebook: s.facebook || '',
        phone: s.phone || '',
        email: s.email || '',
        address: s.address || '',
        admin_user: s.admin_user || data.email || '',
        admin_password: s.admin_password || 'senha123',
        gtm_id: s.gtm_id || '',
        ga_id: s.ga_id || '',
        google_ads_id: s.google_ads_id || '',
        fb_pixel_id: s.fb_pixel_id || '',
        // Modelo Advocacia loaders
        hero_badge: s.hero_badge || 'Advocacia & Assessoria Jurídica',
        services_title: s.services_title || 'Nossas Especialidades Jurídicas',
        services_subtitle: s.services_subtitle || 'Prestamos assessoria de alta performance voltada à mitigação de riscos e defesa de direitos.',
        services_tag: s.services_tag || 'Nossos Serviços',
        about_image_url: s.about_image_url || '',
        about_title: s.about_title || 'Excelência e Solidez Jurídica',
        about_subtitle: s.about_subtitle || '"Nosso compromisso fundamental é a segurança jurídica absoluta de nossos clientes nas decisões mais importantes da vida e dos negócios."',
        about_description_1: s.about_description_1 || 'Fundado sobre os pilares da ética corporativa e rigor técnico acadêmico, o escritório nasceu para preencher a necessidade de uma advocacia verdadeiramente focada nas peculiaridades de cada cliente. Não trabalhamos com soluções genéricas ou em massa.',
        about_description_2: s.about_description_2 || 'Nosso corpo de advogados assessora de forma preventiva, desenvolvendo planejamentos estratégicos contratuais, civis e tributários que impedem conflitos judiciais futuros. Em matérias contenciosas, representamos os clientes de maneira vigorosa e combativa em todas as instâncias do Poder Judiciário.',
        stat_count_1: s.stat_count_1 || '98',
        stat_label_1: s.stat_label_1 || 'Casos de Sucesso',
        stat_count_2: s.stat_count_2 || '1500',
        stat_label_2: s.stat_label_2 || 'Clientes Atendidos',
        stat_count_3: s.stat_count_3 || '12',
        stat_label_3: s.stat_label_3 || 'De Atuação',
        stat_count_4: s.stat_count_4 || '15',
        stat_label_4: s.stat_label_4 || 'Especialistas',
        stat_suffix_1: s.stat_suffix_1 || '+',
        stat_suffix_2: s.stat_suffix_2 || '+',
        stat_suffix_3: s.stat_suffix_3 || ' anos',
        stat_suffix_4: s.stat_suffix_4 || '/5',
        testimonial_1: s.testimonial_1 || 'A atuação do escritório na reestruturação societária da nossa empresa foi impecável. Conduziram o processo com discrição, ética e um nível de detalhismo que evitou passivos futuros significativos.',
        testimonial_1_name: s.testimonial_1_name || 'Roberto Camargo',
        testimonial_1_role: s.testimonial_1_role || 'Diretor Executivo na Vanguarda Tech',
        testimonial_1_avatar: s.testimonial_1_avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        testimonial_2: s.testimonial_2 || 'Fui assessorado no processo de partilha de bens e inventário familiar. Toda a equipe se mostrou extremamente humana, sensível ao momento delicado e focada em resolver tudo de forma amigável.',
        testimonial_2_name: s.testimonial_2_name || 'Heloísa Albuquerque',
        testimonial_2_role: s.testimonial_2_role || 'Arquiteta e Sócia do Studio H+A',
        testimonial_2_avatar: s.testimonial_2_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        testimonial_3: s.testimonial_3 || 'Excelente suporte na defesa de uma autuação fiscal injusta. O profundo conhecimento técnico do Dr. Marcus fez toda a diferença na vitória administrativa junto ao conselho fiscal.',
        testimonial_3_name: s.testimonial_3_name || 'Carlos Mendes',
        testimonial_3_role: s.testimonial_3_role || 'Diretor do Grupo Mendes & Cia',
        testimonial_3_avatar: s.testimonial_3_avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
        team_member_1_name: s.team_member_1_name || 'Dr. Alexandre Goldmann',
        team_member_1_role: s.team_member_1_role || 'Sócio Fundador - Direito Empresarial',
        team_member_1_desc: s.team_member_1_desc || 'Mestre em Direito Comercial pela USP, com mais de 15 anos de experiência em reestruturações societárias e fusões de grandes corporações.',
        team_member_1_avatar: s.team_member_1_avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
        team_member_2_name: s.team_member_2_name || "Dra. Beatriz D'Angelo",
        team_member_2_role: s.team_member_2_role || 'Sócia - Direito Civil e Contratos',
        team_member_2_desc: s.team_member_2_desc || 'Especialista em Direito Processual Civil, atuante na assessoria de contratos nacionais e internacionais de alta complexidade e direito de família.',
        team_member_2_avatar: s.team_member_2_avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
        team_member_3_name: s.team_member_3_name || 'Dr. Marcus Vinícius Prado',
        team_member_3_role: s.team_member_3_role || 'Associado Sênior - Direito Tributário',
        team_member_3_desc: s.team_member_3_desc || 'Pós-graduado em Gestão Tributária, focado em planejamento fiscal preventivo para grandes grupos econômicos e contencioso administrativo.',
        team_member_3_avatar: s.team_member_3_avatar || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
        differential_1_title: s.differential_1_title || 'Ética & Transparência',
        differential_1_desc: s.differential_1_desc || 'Conduzimos cada caso com o mais alto padrão moral, mantendo o cliente informado em todas as etapas de forma clara.',
        differential_2_title: s.differential_2_title || 'Sigilo & Confiança',
        differential_2_desc: s.differential_2_desc || 'Garantia de confidencialidade absoluta em todas as consultas e processos judiciais sob nossa responsabilidade.',
        differential_3_title: s.differential_3_title || 'Foco em Resultados',
        differential_3_desc: s.differential_3_desc || 'Aliamos profundo conhecimento técnico com estratégia jurídica focada para maximizar as chances de sucesso.',
        differential_4_title: s.differential_4_title || 'Atendimento Ágil',
        differential_4_desc: s.differential_4_desc || 'Respostas rápidas e suporte contínuo para garantir tranquilidade e segurança aos nossos representados.',
        team_tag: s.team_tag || 'Corpo Jurídico',
        team_title: s.team_title || 'Sócios & Associados Sêniores',
        team_subtitle: s.team_subtitle || 'Conheça os especialistas dedicados a prover representação jurídica do mais alto escalão técnico.',
        testimonials_tag: s.testimonials_tag || 'Reconhecimento',
        testimonials_title: s.testimonials_title || 'Depoimentos dos Representados',
        testimonials_subtitle: s.testimonials_subtitle || 'A confiança demonstrada por nossos clientes individuais e corporativos reflete nosso compromisso com a integridade.',
        cta_title: s.cta_title || 'Necessita de Defesa ou Consultoria Especializada?',
        cta_subtitle: s.cta_subtitle || 'Relate os fatos iniciais de sua causa para nossa equipe jurídica realizar uma triagem prévia confidencial ou agende um alinhamento online com nossos sócios especialistas.',
        cta_btn_text_1: s.cta_btn_text_1 || 'Conversar com Advogado',
        cta_btn_text_2: s.cta_btn_text_2 || 'Ver Áreas de Atuação',
        team_members: s.team_members?.length > 0 ? s.team_members : [
          {
            name: s.team_member_1_name || 'Dr. Alexandre Goldmann',
            role: s.team_member_1_role || 'Sócio Fundador - Direito Empresarial',
            desc: s.team_member_1_desc || 'Mestre em Direito Comercial pela USP, com mais de 15 anos de experiência em reestruturações societárias e fusões de grandes corporações.',
            avatar: s.team_member_1_avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80'
          },
          {
            name: s.team_member_2_name || "Dra. Beatriz D'Angelo",
            role: s.team_member_2_role || 'Sócia - Direito Civil e Contratos',
            desc: s.team_member_2_desc || 'Especialista em Direito Processual Civil, atuante na assessoria de contratos nacionais e internacionais de alta complexidade e direito de família.',
            avatar: s.team_member_2_avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
          },
          {
            name: s.team_member_3_name || 'Dr. Marcus Vinícius Prado',
            role: s.team_member_3_role || 'Associado Sênior - Direito Tributário',
            desc: s.team_member_3_desc || 'Pós-graduado em Gestão Tributária, focado em planejamento fiscal preventivo para grandes grupos econômicos e contencioso administrativo.',
            avatar: s.team_member_3_avatar || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80'
          }
        ],
        testimonials: s.testimonials?.length > 0 ? s.testimonials : [
          {
            name: s.testimonial_1_name || 'Roberto Camargo',
            role: s.testimonial_1_role || 'Diretor Executivo na Vanguarda Tech',
            text: s.testimonial_1 || 'A atuação do escritório na reestruturação societária da nossa empresa foi impecável. Conduziram o processo com discrição, ética e um nível de detalhismo que evitou passivos futuros significativos.',
            avatar: s.testimonial_1_avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
          },
          {
            name: s.testimonial_2_name || 'Heloísa Albuquerque',
            role: s.testimonial_2_role || 'Arquiteta e Sócia do Studio H+A',
            text: s.testimonial_2 || 'Fui assessorado no processo de partilha de bens e inventário familiar. Toda a equipe se mostrou extremamente humana, sensível ao momento delicada e focada em resolver tudo de forma amigável.',
            avatar: s.testimonial_2_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
          },
          {
            name: s.testimonial_3_name || 'Carlos Mendes',
            role: s.testimonial_3_role || 'Diretor do Grupo Mendes & Cia',
            text: s.testimonial_3 || 'Excelente suporte na defesa de uma autuação fiscal injusta. O profundo conhecimento técnico do Dr. Marcus fez toda a diferença na vitória administrativa junto ao conselho fiscal.',
            avatar: s.testimonial_3_avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
          }
        ]
      })
    } catch (error: any) {
      console.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSaving(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `logo-${Date.now()}.${fileExt}`
      const filePath = `${storeId}/${fileName}`
      const { error: uploadError } = await supabase.storage.from('store-assets').upload(filePath, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('store-assets').getPublicUrl(filePath)
      setFormData(prev => ({ ...prev, logo_url: publicUrl }))
      toast.success('Logo atualizado!')
    } catch (error: any) {
      toast.error('Erro no upload: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSaving(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `favicon-${Date.now()}.${fileExt}`
      const filePath = `${storeId}/${fileName}`
      const { error: uploadError } = await supabase.storage.from('store-assets').upload(filePath, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('store-assets').getPublicUrl(filePath)
      setFormData(prev => ({ ...prev, favicon_url: publicUrl }))
      toast.success('Favicon atualizado!')
    } catch (error: any) {
      toast.error('Erro no upload: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSaving(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `hero-${Date.now()}.${fileExt}`
      const filePath = `${storeId}/${fileName}`
      const { error: uploadError } = await supabase.storage.from('store-assets').upload(filePath, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('store-assets').getPublicUrl(filePath)
      setFormData(prev => ({ ...prev, hero_image_url: publicUrl }))
      toast.success('Banner atualizado!')
    } catch (error: any) {
      toast.error('Erro no upload: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleFooterLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSaving(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `footer-logo-${Date.now()}.${fileExt}`
      const filePath = `${storeId}/${fileName}`
      const { error: uploadError } = await supabase.storage.from('store-assets').upload(filePath, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('store-assets').getPublicUrl(filePath)
      setFormData(prev => ({ ...prev, footer_logo_url: publicUrl }))
      toast.success('Logo do rodapé atualizado!')
    } catch (error: any) {
      toast.error('Erro no upload: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleGenericImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSaving(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${fieldName}-${Date.now()}.${fileExt}`
      const filePath = `${storeId}/${fileName}`
      const { error: uploadError } = await supabase.storage.from('store-assets').upload(filePath, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('store-assets').getPublicUrl(filePath)
      setFormData(prev => ({ ...prev, [fieldName]: publicUrl }))
      toast.success('Imagem enviada com sucesso!')
    } catch (error: any) {
      toast.error('Erro no upload: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleTeamImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSaving(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `team-${index}-${Date.now()}.${fileExt}`
      const filePath = `${storeId}/${fileName}`
      const { error: uploadError } = await supabase.storage.from('store-assets').upload(filePath, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('store-assets').getPublicUrl(filePath)
      const updated = [...formData.team_members]
      updated[index] = { ...updated[index], avatar: publicUrl }
      setFormData(prev => ({ ...prev, team_members: updated }))
      toast.success('Foto enviada!')
    } catch (error: any) {
      toast.error('Erro no upload: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleTestimonialImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSaving(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `testimonial-${index}-${Date.now()}.${fileExt}`
      const filePath = `${storeId}/${fileName}`
      const { error: uploadError } = await supabase.storage.from('store-assets').upload(filePath, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('store-assets').getPublicUrl(filePath)
      const updated = [...formData.testimonials]
      updated[index] = { ...updated[index], avatar: publicUrl }
      setFormData(prev => ({ ...prev, testimonials: updated }))
      toast.success('Foto enviada!')
    } catch (error: any) {
      toast.error('Erro no upload: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const addTeamMember = () => {
    setFormData(prev => ({
      ...prev,
      team_members: [...prev.team_members, { name: '', role: '', desc: '', avatar: '' }]
    }))
  }

  const removeTeamMember = (index: number) => {
    setConfirmModal({
      message: 'Tem certeza que deseja excluir este advogado?',
      onConfirm: () => {
        setFormData(prev => ({
          ...prev,
          team_members: prev.team_members.filter((_: any, i: number) => i !== index)
        }))
        setConfirmModal(null)
      }
    })
  }

  const updateTeamMember = (index: number, field: string, value: string) => {
    const updated = [...formData.team_members]
    updated[index] = { ...updated[index], [field]: value }
    setFormData(prev => ({ ...prev, team_members: updated }))
  }

  const addTestimonial = () => {
    setFormData(prev => ({
      ...prev,
      testimonials: [...prev.testimonials, { name: '', role: '', text: '', avatar: '', rating: 5 }]
    }))
  }

  const removeTestimonial = (index: number) => {
    setConfirmModal({
      message: 'Tem certeza que deseja excluir este depoimento?',
      onConfirm: () => {
        setFormData(prev => ({
          ...prev,
          testimonials: prev.testimonials.filter((_: any, i: number) => i !== index)
        }))
        setConfirmModal(null)
      }
    })
  }

  const updateTestimonial = (index: number, field: string, value: string) => {
    const updated = [...formData.testimonials]
    updated[index] = { ...updated[index], [field]: value }
    setFormData(prev => ({ ...prev, testimonials: updated }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { error } = await supabase
        .from('stores')
        .update({
          name: formData.name,
          custom_domain: formData.custom_domain || null,
          settings: { ...formData }
        })
        .eq('id', storeId)
      if (error) throw error

      // Se o nicho selecionado for Eletricista (electrician), semear categorias e especialidades padrão se não houver nenhuma
      if (formData.layout_model === 'electrician') {
        const { data: existingCats, error: catFetchError } = await supabase
          .from('categories')
          .select('id')
          .eq('store_id', storeId)
        
        if (!catFetchError && (!existingCats || existingCats.length === 0)) {
          const defaultCategories = [
            { store_id: storeId, name: 'Instalações', slug: 'instalacoes' },
            { store_id: storeId, name: 'Manutenções', slug: 'manutencoes' },
            { store_id: storeId, name: 'Laudos & Projetos', slug: 'laudos-projetos' },
            { store_id: storeId, name: 'Emergencial 24h', slug: 'emergencial-24h' }
          ]
          await supabase.from('categories').insert(defaultCategories)
        }

        const { count, error: countError } = await supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('store_id', storeId)

        if (!countError && count === 0) {
          const defaultServices = [
            {
              store_id: storeId,
              name: 'Instalação de Chuveiro Elétrico',
              slug: 'instalacao-chuveiro-eletrico',
              price: 120,
              short_description: 'Instalação completa e segura de chuveiros elétricos com verificação da fiação e disjuntores adequados.',
              description: 'Instalação completa e segura de chuveiros elétricos com verificação da fiação e disjuntores adequados.',
              stock_quantity: 9999,
              sku: 'serv-chuveiro',
              category: 'Instalações',
              is_service: true,
              is_active: true,
              is_featured: false,
              images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80']
            },
            {
              store_id: storeId,
              name: 'Manutenção de Quadro de Distribuição',
              slug: 'manutencao-quadro-distribuicao',
              price: 250,
              short_description: 'Revisão, troca de disjuntores antigos e organização do quadro elétrico residencial ou comercial para maior segurança.',
              description: 'Revisão, troca de disjuntores antigos e organização do quadro elétrico residencial ou comercial para maior segurança.',
              stock_quantity: 9999,
              sku: 'serv-quadro',
              category: 'Manutenções',
              is_service: true,
              is_active: true,
              is_featured: false,
              images: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80']
            },
            {
              store_id: storeId,
              name: 'Projeto de Iluminação e Fiação',
              slug: 'projeto-iluminacao-fiacao',
              price: 0,
              short_description: 'Planejamento e execução de toda a rede de iluminação e fiação estruturada para novas construções ou reformas.',
              description: 'Planejamento e execução de toda a rede de iluminação e fiação estruturada para novas construções ou reformas.',
              stock_quantity: 9999,
              sku: 'serv-projeto',
              category: 'Laudos & Projetos',
              is_service: true,
              is_active: true,
              is_featured: false,
              images: ['https://images.unsplash.com/photo-1565538810844-1e119ad16f43?auto=format&fit=crop&w=600&q=80']
            },
            {
              store_id: storeId,
              name: 'Atendimento de Emergência 24h',
              slug: 'atendimento-emergencia-24h',
              price: 150,
              short_description: 'Visita técnica emergencial para identificação e solução de curtos-circuitos, quedas de energia parciais ou panes elétricas gerais.',
              description: 'Visita técnica emergencial para identificação e solução de curtos-circuitos, quedas de energia parciais ou panes elétricas gerais.',
              stock_quantity: 9999,
              sku: 'serv-emergencial',
              category: 'Emergencial 24h',
              is_service: true,
              is_active: true,
              is_featured: true,
              images: ['https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=600&q=80']
            }
          ]
          await supabase.from('products').insert(defaultServices)
          toast.success('Modelo de serviços de eletricista carregado com sucesso!')
        }
      }

      // Se o nicho selecionado for Advocacia (lawyer), semear categorias e especialidades padrão se não houver nenhuma
      if (formData.layout_model === 'lawyer') {
        const { data: existingCats, error: catFetchError } = await supabase
          .from('categories')
          .select('id')
          .eq('store_id', storeId)
        
        if (!catFetchError && (!existingCats || existingCats.length === 0)) {
          const defaultCategories = [
            { store_id: storeId, name: 'Direito Civil', slug: 'direito-civil' },
            { store_id: storeId, name: 'Direito Trabalhista', slug: 'direito-trabalhista' },
            { store_id: storeId, name: 'Direito Corporativo', slug: 'direito-corporativo' },
            { store_id: storeId, name: 'Previdenciário', slug: 'previdenciario' }
          ]
          await supabase.from('categories').insert(defaultCategories)
        }

        const { count, error: countError } = await supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('store_id', storeId)

        if (!countError && count === 0) {
          const defaultServices = [
            {
              store_id: storeId,
              name: 'Direito Civil e Família',
              slug: 'direito-civil-e-familia',
              price: 0,
              short_description: 'Assessoria jurídica em inventários, divórcios, partilha de bens, contratos, responsabilidade civil e direitos do consumidor com foco em soluções consensuais e contenciosas.',
              description: 'Assessoria jurídica em inventários, divórcios, partilha de bens, contratos, responsabilidade civil e direitos do consumidor com foco em soluções consensuais e contenciosas.',
              stock_quantity: 9999,
              sku: 'serv-civil',
              category: 'Direito Civil',
              is_service: true,
              is_active: true,
              is_featured: false,
              images: ['https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80']
            },
            {
              store_id: storeId,
              name: 'Direito do Trabalho',
              slug: 'direito-do-trabalho',
              price: 0,
              short_description: 'Defesa dos direitos trabalhistas de colaboradores e assessoria preventiva para empresas, com foco em redução de passivos jurídicos e negociações de acordos.',
              description: 'Defesa dos direitos trabalhistas de colaboradores e assessoria preventiva para empresas, com foco em redução de passivos jurídicos e negociações de acordos.',
              stock_quantity: 9999,
              sku: 'serv-trabalho',
              category: 'Direito Trabalhista',
              is_service: true,
              is_active: true,
              is_featured: false,
              images: ['https://images.unsplash.com/photo-1521791136368-1a8b27526d56?auto=format&fit=crop&w=600&q=80']
            },
            {
              store_id: storeId,
              name: 'Direito Empresarial e Tributário',
              slug: 'direito-empresarial-e-tributario',
              price: 0,
              short_description: 'Consultoria estratégica para estruturação de empresas, planejamento tributário, contratos societários e defesa em processos administrativos ou judiciais fiscais.',
              description: 'Consultoria estratégica para estruturação de empresas, planejamento tributário, contratos societários e defesa em processos administrativos ou judiciais fiscais.',
              stock_quantity: 9999,
              sku: 'serv-empresarial',
              category: 'Direito Corporativo',
              is_service: true,
              is_active: true,
              is_featured: false,
              images: ['https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80']
            },
            {
              store_id: storeId,
              name: 'Direito Previdenciário',
              slug: 'direito-previdenciario',
              price: 0,
              short_description: 'Acompanhamento completo para concessão de aposentadorias por tempo de contribuição, idade, invalidez, pensões e revisões de benefícios junto ao INSS.',
              description: 'Acompanhamento completo para concessão de aposentadorias por tempo de contribuição, idade, invalidez, pensões e revisões de benefícios junto ao INSS.',
              stock_quantity: 9999,
              sku: 'serv-previdenciario',
              category: 'Previdenciário',
              is_service: true,
              is_active: true,
              is_featured: false,
              images: ['https://images.unsplash.com/photo-1473186578172-c141e6798cf4?auto=format&fit=crop&w=600&q=80']
            }
          ]
          await supabase.from('products').insert(defaultServices)
          toast.success('Modelo de especialidades jurídicas carregado com sucesso!')
        }
      }

      toast.success('Configurações salvas!')
    } catch (error: any) {
      toast.error('Erro: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div style={{ padding: '5rem', textAlign: 'center' }}><Loader2 className="animate-spin" /></div>

  return (
    <div className="settings-page-container" style={{ maxWidth: '1000px', width: '100%', margin: '0 auto', padding: '0 1rem' }}>
      <style>{`
        @media (max-width: 768px) {
          .settings-header {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 1.25rem;
            margin-bottom: 2rem !important;
          }
          .settings-header h1 {
            font-size: 1.75rem !important;
          }
          .btn-save-settings {
            width: 100%;
            justify-content: center;
          }
          .settings-layout-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .settings-nav-sidebar {
            flex-direction: row !important;
            overflow-x: auto;
            white-space: nowrap;
            padding-bottom: 0.75rem;
            border-bottom: 1px solid var(--border);
            -webkit-overflow-scrolling: touch;
            gap: 0.5rem !important;
          }
          .settings-nav-sidebar button {
            flex-shrink: 0;
            padding: 0.75rem 1.25rem !important;
            font-size: 0.9rem;
          }
          .glass-card {
            padding: 1.5rem !important;
          }
          .glass-card div[style*="display: flex"],
          .glass-card div[style*="display:flex"],
          .glass-card div[style*="display: 'flex'"],
          .glass-card div[style*="display:'flex'"] {
            flex-wrap: wrap !important;
            gap: 1.25rem !important;
          }
          .glass-card div[style*="gridTemplateColumns:"],
          .glass-card div[style*="grid-template-columns:"] {
            grid-template-columns: 1fr !important;
            gap: 1.25rem !important;
          }
        }
      `}</style>

      <header className="settings-header" style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Customização da Loja</h1>
          <p style={{ color: 'var(--muted)' }}>Configurações visuais e de marca.</p>
        </div>
        <button 
          onClick={handleSubmit} 
          disabled={saving} 
          className="btn-save-settings" 
          style={{ 
            padding: '1rem 2.5rem', 
            backgroundColor: '#6366f1', 
            color: '#ffffff', 
            border: 'none', 
            borderRadius: '12px', 
            fontWeight: 700, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
            transition: 'all 0.2s ease'
          }}
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          <span>Salvar Tudo</span>
        </button>
      </header>

      <div className="settings-layout-grid" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '3rem' }}>
        <nav className="settings-nav-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { id: 'identidade', label: 'Identidade', icon: Store },
            { id: 'visual', label: 'Cores e Fontes', icon: Palette },
            { id: 'nicho', label: 'Nicho da Loja', icon: Globe },
            { id: 'topo', label: 'Cabeçalho e Topo', icon: Layout },
            ...(formData.layout_model === 'lawyer' || formData.layout_model === 'advocacia' || formData.layout_model === 'advocacy' ? [{ id: 'advocacia', label: 'Modelo Advocacia', icon: Scale }] : []),
            ...(formData.layout_model === 'services' || formData.layout_model === 'electrician' ? [{ id: 'services_tab', label: 'Modelo Serviços', icon: Wrench }] : []),
            { id: 'banner', label: 'Banner Hero', icon: ImageIcon },
            { id: 'secoes', label: 'Seções da Home', icon: Layout },
            { id: 'rodape', label: 'Rodapé', icon: Layout },
            { id: 'layout', label: 'Estrutura', icon: Layout },
            { id: 'dominios', label: 'Domínios & Roteamento', icon: Globe },
            { id: 'seguranca', label: 'Segurança & Acesso', icon: Lock },
            ...(isServicesOnly() ? [] : [{ id: 'integracoes', label: 'Integrações & Pixels', icon: ShoppingBag }])
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderRadius: '12px', border: 'none', textAlign: 'left', cursor: 'pointer', fontWeight: 600,
                backgroundColor: activeTab === tab.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--muted)',
                transition: '0.2s'
              }}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </nav>

        <div style={{ display: 'grid', gap: '2rem' }}>
          {activeTab === 'identidade' && (
            <div className="glass-card" style={{ padding: '2.5rem', display: 'grid', gap: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Marca</h3>
              <div className="form-group">
                <label>Logotipo da Loja</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  <div style={{ width: '120px', height: '120px', borderRadius: '12px', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                    {formData.logo_url ? <img src={formData.logo_url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <Store size={32} color="var(--muted)" />}
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <label className="btn-secondary" style={{ cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.75rem 1.5rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
                      <Upload size={18} />
                      Selecionar Imagem
                      <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
                    </label>
                    {formData.logo_url && (
                      <button onClick={() => setFormData({...formData, logo_url: ''})} style={{ padding: '0.75rem 1.25rem', border: '1px solid #ef4444', borderRadius: '8px', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                        <X size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Favicon da Loja (Ícone do navegador - formato recomendado: png ou ico quadrado)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  <div style={{ width: '120px', height: '120px', borderRadius: '12px', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                    {formData.favicon_url ? <img src={formData.favicon_url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <ImageIcon size={32} color="var(--muted)" />}
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <label className="btn-secondary" style={{ cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.75rem 1.5rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
                      <Upload size={18} />
                      Selecionar Imagem
                      <input type="file" hidden accept="image/*,image/x-icon" onChange={handleFaviconUpload} />
                    </label>
                    {formData.favicon_url && (
                      <button onClick={() => setFormData({...formData, favicon_url: ''})} style={{ padding: '0.75rem 1.25rem', border: '1px solid #ef4444', borderRadius: '8px', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                        <X size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Nome da Loja</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              {!isServicesOnly() && (
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Modo de Funcionamento</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', border: formData.store_mode === 'loja' ? '2px solid var(--primary)' : '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', backgroundColor: formData.store_mode === 'loja' ? 'rgba(99, 102, 241, 0.05)' : 'transparent' }}>
                    <input type="radio" name="store_mode" checked={formData.store_mode === 'loja'} onChange={() => setFormData({...formData, store_mode: 'loja'})} />
                    <div>
                      <div style={{ fontWeight: 700 }}>Loja Virtual Completa</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Carrinho, checkout e layout completo com banners.</div>
                    </div>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', border: formData.store_mode === 'catalogo' ? '2px solid var(--primary)' : '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', backgroundColor: formData.store_mode === 'catalogo' ? 'rgba(99, 102, 241, 0.05)' : 'transparent' }}>
                    <input type="radio" name="store_mode" checked={formData.store_mode === 'catalogo'} onChange={() => setFormData({...formData, store_mode: 'catalogo'})} />
                    <div>
                      <div style={{ fontWeight: 700 }}>Catálogo Digital</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Vitrine direta e botão de comprar pelo WhatsApp.</div>
                    </div>
                  </label>
                </div>
              </div>
              )}
            </div>
          )}

          {activeTab === 'advocacia' && (
            <div className="glass-card" style={{ padding: '2.5rem', display: 'grid', gap: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--foreground)' }}>Modelo Advocacia</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>Configure todos os conteúdos e elementos visuais da sua landing page jurídica institucional.</p>
                </div>
              </div>

              {/* 1. SEÇÃO HERO / APRESENTAÇÃO */}
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>1. Seção Inicial (Apresentação / Hero)</h4>
                
                <div className="form-group">
                  <label>Badge de Destaque (Texto menor no topo)</label>
                  <input type="text" value={formData.hero_badge} onChange={e => setFormData({...formData, hero_badge: e.target.value})} placeholder="Ex: Advocacia & Assessoria Jurídica" />
                </div>
                
                <div className="form-group">
                  <label>Título Principal</label>
                  <input type="text" value={formData.hero_title} onChange={e => setFormData({...formData, hero_title: e.target.value})} placeholder="Ex: Excelência Jurídica e Defesa Dos Seus Direitos." />
                </div>

                <div className="form-group">
                  <label>Descrição Principal (Subtítulo)</label>
                  <textarea rows={3} value={formData.hero_subtitle} onChange={e => setFormData({...formData, hero_subtitle: e.target.value})} placeholder="Descreva sucintamente a missão ou diferencial do escritório..." />
                </div>
              </div>

              {/* 2. ÁREAS DE ATUAÇÃO / SERVIÇOS */}
              <div style={{ display: 'grid', gap: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>2. Especialidades Jurídicas (Seção de Serviços)</h4>
                
                <div className="form-group">
                  <label>Título da Seção</label>
                  <input type="text" value={formData.services_title} onChange={e => setFormData({...formData, services_title: e.target.value})} placeholder="Ex: Nossas Especialidades Jurídicas" />
                </div>
                
                <div className="form-group">
                  <label>Subtítulo / Descrição da Seção</label>
                  <input type="text" value={formData.services_subtitle} onChange={e => setFormData({...formData, services_subtitle: e.target.value})} placeholder="Ex: Prestamos assessoria de alta performance voltada à mitigação de riscos." />
                </div>
              </div>

              {/* DIFERENCIAIS / VALORES */}
              <div style={{ display: 'grid', gap: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>Diferenciais & Valores do Escritório (4 Itens)</h4>
                
                {[1, 2, 3, 4].map((num) => {
                  const titleKey = `differential_${num}_title`
                  const descKey = `differential_${num}_desc`
                  return (
                    <div key={num} style={{ padding: '1.25rem 1.5rem', border: '1px solid var(--border)', borderRadius: '12px', display: 'grid', gap: '1rem', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                      <h5 style={{ fontWeight: 700, margin: 0 }}>Diferencial {num}</h5>
                      <div className="form-group">
                        <label>Título</label>
                        <input type="text" value={formData[titleKey as keyof typeof formData] as string} onChange={e => setFormData({...formData, [titleKey]: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>Descrição</label>
                        <input type="text" value={formData[descKey as keyof typeof formData] as string} onChange={e => setFormData({...formData, [descKey]: e.target.value})} />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* 3. SOBRE O ESCRITÓRIO */}
              <div style={{ display: 'grid', gap: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>3. Sobre o Escritório</h4>
                
                <div className="form-group">
                  <label>Foto Oficial do Escritório (ou Fachada)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ width: '120px', height: '120px', borderRadius: '12px', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                      {formData.about_image_url ? <img src={formData.about_image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={32} color="var(--muted)" />}
                    </div>
                    <label className="btn-secondary" style={{ cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.75rem 1.5rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
                      <Upload size={18} />
                      Selecionar Imagem
                      <input type="file" hidden accept="image/*" onChange={(e) => handleGenericImageUpload(e, 'about_image_url')} />
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Título Principal do "Sobre"</label>
                  <input type="text" value={formData.about_title} onChange={e => setFormData({...formData, about_title: e.target.value})} placeholder="Ex: Excelência e Solidez Jurídica" />
                </div>

                <div className="form-group">
                  <label>Citação / Frase em Destaque</label>
                  <input type="text" value={formData.about_subtitle} onChange={e => setFormData({...formData, about_subtitle: e.target.value})} placeholder="Ex: 'Nosso compromisso é a segurança jurídica...'" />
                </div>

                <div className="form-group">
                  <label>Parágrafo de Descrição 1</label>
                  <textarea rows={4} value={formData.about_description_1} onChange={e => setFormData({...formData, about_description_1: e.target.value})} />
                </div>

                <div className="form-group">
                  <label>Parágrafo de Descrição 2</label>
                  <textarea rows={4} value={formData.about_description_2} onChange={e => setFormData({...formData, about_description_2: e.target.value})} />
                </div>
              </div>

              {/* 4. INDICADORES / CONTADORES */}
              <div style={{ display: 'grid', gap: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>4. Indicadores de Desempenho (Estatísticas Animadas)</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label>Indicador 1 (Número final / Meta)</label>
                    <input type="number" value={formData.stat_count_1} onChange={e => setFormData({...formData, stat_count_1: e.target.value})} placeholder="98" />
                  </div>
                  <div className="form-group">
                    <label>Indicador 1 (Rótulo / Descrição)</label>
                    <input type="text" value={formData.stat_label_1} onChange={e => setFormData({...formData, stat_label_1: e.target.value})} placeholder="Casos de Sucesso" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label>Indicador 2 (Número final / Meta)</label>
                    <input type="number" value={formData.stat_count_2} onChange={e => setFormData({...formData, stat_count_2: e.target.value})} placeholder="1500" />
                  </div>
                  <div className="form-group">
                    <label>Indicador 2 (Rótulo / Descrição)</label>
                    <input type="text" value={formData.stat_label_2} onChange={e => setFormData({...formData, stat_label_2: e.target.value})} placeholder="Clientes Atendidos" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label>Indicador 3 (Número final / Meta)</label>
                    <input type="number" value={formData.stat_count_3} onChange={e => setFormData({...formData, stat_count_3: e.target.value})} placeholder="12" />
                  </div>
                  <div className="form-group">
                    <label>Indicador 3 (Rótulo / Descrição)</label>
                    <input type="text" value={formData.stat_label_3} onChange={e => setFormData({...formData, stat_label_3: e.target.value})} placeholder="Anos de Atuação" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label>Indicador 4 (Número final / Meta)</label>
                    <input type="number" value={formData.stat_count_4} onChange={e => setFormData({...formData, stat_count_4: e.target.value})} placeholder="15" />
                  </div>
                  <div className="form-group">
                    <label>Indicador 4 (Rótulo / Descrição)</label>
                    <input type="text" value={formData.stat_label_4} onChange={e => setFormData({...formData, stat_label_4: e.target.value})} placeholder="Especialistas" />
                  </div>
                </div>
              </div>

              {/* 5. CORPO JURÍDICO */}
              <div style={{ display: 'grid', gap: '2rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>5. Corpo Jurídico (Advogados Principais)</h4>
                
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Tag de Categoria da Seção</label>
                    <input type="text" value={formData.team_tag} onChange={e => setFormData({...formData, team_tag: e.target.value})} placeholder="Ex: Corpo Jurídico" />
                  </div>
                  <div className="form-group">
                    <label>Título da Seção de Equipe</label>
                    <input type="text" value={formData.team_title} onChange={e => setFormData({...formData, team_title: e.target.value})} placeholder="Ex: Sócios & Associados Sêniores" />
                  </div>
                  <div className="form-group">
                    <label>Subtítulo / Descrição da Seção de Equipe</label>
                    <input type="text" value={formData.team_subtitle} onChange={e => setFormData({...formData, team_subtitle: e.target.value})} placeholder="Ex: Conheça os especialistas dedicados..." />
                  </div>
                </div>
                
                {formData.team_members.map((member: any, index: number) => (
                  <div key={index} style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '12px', display: 'grid', gap: '1rem', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h5 style={{ fontWeight: 700, margin: 0 }}>Advogado {index + 1}</h5>
                      <button
                        type="button"
                        onClick={() => removeTeamMember(index)}
                        style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: '0.5rem', display: 'flex' }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                    
                    <div className="form-group">
                      <label>Foto do Profissional</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                          {member.avatar ? <img src={member.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={24} color="var(--muted)" />}
                        </div>
                        <label className="btn-secondary" style={{ cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem' }}>
                          <Upload size={16} />
                          Fazer Upload
                          <input type="file" hidden accept="image/*" onChange={(e) => handleTeamImageUpload(e, index)} />
                        </label>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label>Nome Completo</label>
                        <input type="text" value={member.name} onChange={e => updateTeamMember(index, 'name', e.target.value)} placeholder="Ex: Dr. Alexandre Goldmann" />
                      </div>
                      <div className="form-group">
                        <label>Cargo / Especialidade</label>
                        <input type="text" value={member.role} onChange={e => updateTeamMember(index, 'role', e.target.value)} placeholder="Ex: Sócio Fundador - Direito Empresarial" />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Biografia / Descrição Curta</label>
                      <textarea rows={3} value={member.desc} onChange={e => updateTeamMember(index, 'desc', e.target.value)} placeholder="Formação e experiência resumidas..." />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addTeamMember}
                  style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', border: '1px dashed var(--primary)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', width: '100%' }}
                >
                  + Adicionar Advogado
                </button>
              </div>

              {/* 6. DEPOIMENTOS */}
              <div style={{ display: 'grid', gap: '2rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>6. Depoimentos dos Representados (Clientes)</h4>
                
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Tag de Categoria da Seção</label>
                    <input type="text" value={formData.testimonials_tag} onChange={e => setFormData({...formData, testimonials_tag: e.target.value})} placeholder="Ex: Reconhecimento" />
                  </div>
                  <div className="form-group">
                    <label>Título da Seção de Depoimentos</label>
                    <input type="text" value={formData.testimonials_title} onChange={e => setFormData({...formData, testimonials_title: e.target.value})} placeholder="Ex: Depoimentos dos Representados" />
                  </div>
                  <div className="form-group">
                    <label>Subtítulo / Descrição da Seção de Depoimentos</label>
                    <input type="text" value={formData.testimonials_subtitle} onChange={e => setFormData({...formData, testimonials_subtitle: e.target.value})} placeholder="Ex: A confiança demonstrada por nossos clientes..." />
                  </div>
                </div>
                
                {formData.testimonials.map((testimonial: any, index: number) => (
                  <div key={index} style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '12px', display: 'grid', gap: '1rem', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h5 style={{ fontWeight: 700, margin: 0 }}>Depoimento {index + 1}</h5>
                      <button
                        type="button"
                        onClick={() => removeTestimonial(index)}
                        style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: '0.5rem', display: 'flex' }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                    
                    <div className="form-group">
                      <label>Foto do Cliente</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                          {testimonial.avatar ? <img src={testimonial.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={24} color="var(--muted)" />}
                        </div>
                        <label className="btn-secondary" style={{ cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem' }}>
                          <Upload size={16} />
                          Fazer Upload
                          <input type="file" hidden accept="image/*" onChange={(e) => handleTestimonialImageUpload(e, index)} />
                        </label>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label>Nome do Autor</label>
                        <input type="text" value={testimonial.name} onChange={e => updateTestimonial(index, 'name', e.target.value)} placeholder="Ex: Roberto Camargo" />
                      </div>
                      <div className="form-group">
                        <label>Empresa / Cargo</label>
                        <input type="text" value={testimonial.role} onChange={e => updateTestimonial(index, 'role', e.target.value)} placeholder="Ex: Diretor Executivo na Vanguarda Tech" />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Texto da Avaliação</label>
                      <textarea rows={3} value={testimonial.text} onChange={e => updateTestimonial(index, 'text', e.target.value)} placeholder="Descrição do depoimento..." />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addTestimonial}
                  style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', border: '1px dashed var(--primary)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', width: '100%' }}
                >
                  + Adicionar Depoimento
                </button>
              </div>

              {/* 7. CHAMADA PARA AÇÃO (CTA) */}
              <div style={{ display: 'grid', gap: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>7. Chamada para Ação (CTA)</h4>
                <div className="form-group">
                  <label>Título da Chamada</label>
                  <input type="text" value={formData.cta_title} onChange={e => setFormData({...formData, cta_title: e.target.value})} placeholder="Ex: Necessita de Defesa ou Consultoria Especializada?" />
                </div>
                <div className="form-group">
                  <label>Subtítulo da Chamada</label>
                  <textarea rows={3} value={formData.cta_subtitle} onChange={e => setFormData({...formData, cta_subtitle: e.target.value})} placeholder="Ex: Relate os fatos iniciais..." />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Texto do Botão 1 (WhatsApp)</label>
                    <input type="text" value={formData.cta_btn_text_1} onChange={e => setFormData({...formData, cta_btn_text_1: e.target.value})} placeholder="Ex: Conversar com Advogado" />
                  </div>
                  <div className="form-group">
                    <label>Texto do Botão 2 (Áreas de Atuação)</label>
                    <input type="text" value={formData.cta_btn_text_2} onChange={e => setFormData({...formData, cta_btn_text_2: e.target.value})} placeholder="Ex: Ver Áreas de Atuação" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'services_tab' && (
            <div className="glass-card" style={{ padding: '2.5rem', display: 'grid', gap: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--foreground)' }}>Modelo Serviços & Peças</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>Configure todos os conteúdos e elementos visuais da sua página de serviços.</p>
                </div>
              </div>

              {/* 1. SEÇÃO HERO / APRESENTAÇÃO */}
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>1. Seção Hero (Apresentação)</h4>
                
                <div className="form-group">
                  <label>Badge de Destaque (Texto menor no topo)</label>
                  <input 
                    type="text" 
                    value={formData.hero_badge} 
                    onChange={e => setFormData({...formData, hero_badge: e.target.value})} 
                    placeholder="Ex: Tecnologia & Conforto Térmico" 
                  />
                </div>
              </div>

              {/* 2. QUEM SOMOS */}
              <div style={{ display: 'grid', gap: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>2. Seção Quem Somos (Sobre Nós)</h4>
                
                <div className="form-group">
                  <label>Imagem Representativa</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ width: '120px', height: '120px', borderRadius: '12px', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                      {formData.about_image_url ? <img src={formData.about_image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={32} color="var(--muted)" />}
                    </div>
                    <label className="btn-secondary" style={{ cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.75rem 1.5rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
                      <Upload size={18} />
                      Selecionar Imagem
                      <input type="file" hidden accept="image/*" onChange={(e) => handleGenericImageUpload(e, 'about_image_url')} />
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Título Principal do "Sobre"</label>
                  <input 
                    type="text" 
                    value={formData.about_title} 
                    onChange={e => setFormData({...formData, about_title: e.target.value})} 
                    placeholder="Ex: Compromisso com o Clima e Conforto" 
                  />
                </div>

                <div className="form-group">
                  <label>Subtítulo / Citação em Destaque</label>
                  <input 
                    type="text" 
                    value={formData.about_subtitle} 
                    onChange={e => setFormData({...formData, about_subtitle: e.target.value})} 
                    placeholder="Ex: Criamos ambientes perfeitamente climatizados..." 
                  />
                </div>

                <div className="form-group">
                  <label>Primeiro Parágrafo de Descrição</label>
                  <textarea 
                    rows={4} 
                    value={formData.about_description_1} 
                    onChange={e => setFormData({...formData, about_description_1: e.target.value})} 
                    placeholder="Escreva a introdução sobre sua empresa..."
                  />
                </div>

                <div className="form-group">
                  <label>Segundo Parágrafo de Descrição</label>
                  <textarea 
                    rows={4} 
                    value={formData.about_description_2} 
                    onChange={e => setFormData({...formData, about_description_2: e.target.value})} 
                    placeholder="Escreva detalhes adicionais ou histórico..."
                  />
                </div>
              </div>

              {/* 3. INDICADORES / CONTADORES */}
              <div style={{ display: 'grid', gap: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>3. Estatísticas & Indicadores (Contadores Animados)</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label>Estatística 1 (Número)</label>
                    <input 
                      type="number" 
                      value={formData.stat_count_1} 
                      onChange={e => setFormData({...formData, stat_count_1: e.target.value})} 
                      placeholder="Ex: 1200" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Sufixo / Símbolo</label>
                    <input 
                      type="text" 
                      value={formData.stat_suffix_1} 
                      onChange={e => setFormData({...formData, stat_suffix_1: e.target.value})} 
                      placeholder="Ex: +, % ou anos" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Estatística 1 (Rótulo / Descrição)</label>
                    <input 
                      type="text" 
                      value={formData.stat_label_1} 
                      onChange={e => setFormData({...formData, stat_label_1: e.target.value})} 
                      placeholder="Ex: Clientes Satisfeitos" 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label>Estatística 2 (Número)</label>
                    <input 
                      type="number" 
                      value={formData.stat_count_2} 
                      onChange={e => setFormData({...formData, stat_count_2: e.target.value})} 
                      placeholder="Ex: 450" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Sufixo / Símbolo</label>
                    <input 
                      type="text" 
                      value={formData.stat_suffix_2} 
                      onChange={e => setFormData({...formData, stat_suffix_2: e.target.value})} 
                      placeholder="Ex: +, % ou anos" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Estatística 2 (Rótulo / Descrição)</label>
                    <input 
                      type="text" 
                      value={formData.stat_label_2} 
                      onChange={e => setFormData({...formData, stat_label_2: e.target.value})} 
                      placeholder="Ex: Serviços Realizados" 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label>Estatística 3 (Número)</label>
                    <input 
                      type="number" 
                      value={formData.stat_count_3} 
                      onChange={e => setFormData({...formData, stat_count_3: e.target.value})} 
                      placeholder="Ex: 8" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Sufixo / Símbolo</label>
                    <input 
                      type="text" 
                      value={formData.stat_suffix_3} 
                      onChange={e => setFormData({...formData, stat_suffix_3: e.target.value})} 
                      placeholder="Ex: +, % ou anos" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Estatística 3 (Rótulo / Descrição)</label>
                    <input 
                      type="text" 
                      value={formData.stat_label_3} 
                      onChange={e => setFormData({...formData, stat_label_3: e.target.value})} 
                      placeholder="Ex: De Experiência" 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label>Estatística 4 (Número)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={formData.stat_count_4} 
                      onChange={e => setFormData({...formData, stat_count_4: e.target.value})} 
                      placeholder="Ex: 4.9" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Sufixo / Símbolo</label>
                    <input 
                      type="text" 
                      value={formData.stat_suffix_4} 
                      onChange={e => setFormData({...formData, stat_suffix_4: e.target.value})} 
                      placeholder="Ex: +, % ou /5" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Estatística 4 (Rótulo / Descrição)</label>
                    <input 
                      type="text" 
                      value={formData.stat_label_4} 
                      onChange={e => setFormData({...formData, stat_label_4: e.target.value})} 
                      placeholder="Ex: Nota de Avaliação" 
                    />
                  </div>
                </div>
              </div>

              {/* 4. DEPOIMENTOS */}
              <div style={{ display: 'grid', gap: '2rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>4. Depoimentos de Clientes</h4>
                
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Tag de Categoria da Seção</label>
                    <input type="text" value={formData.testimonials_tag} onChange={e => setFormData({...formData, testimonials_tag: e.target.value})} placeholder="Ex: Depoimentos" />
                  </div>
                  <div className="form-group">
                    <label>Título da Seção de Depoimentos</label>
                    <input type="text" value={formData.testimonials_title} onChange={e => setFormData({...formData, testimonials_title: e.target.value})} placeholder="Ex: Reconhecimento e Satisfação" />
                  </div>
                  <div className="form-group">
                    <label>Subtítulo / Descrição da Seção de Depoimentos</label>
                    <input type="text" value={formData.testimonials_subtitle} onChange={e => setFormData({...formData, testimonials_subtitle: e.target.value})} placeholder="Ex: Veja a opinião de clientes..." />
                  </div>
                </div>
                
                {formData.testimonials.map((testimonial: any, index: number) => (
                  <div key={index} style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '12px', display: 'grid', gap: '1rem', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h5 style={{ fontWeight: 700, margin: 0 }}>Depoimento {index + 1}</h5>
                      <button
                        type="button"
                        onClick={() => removeTestimonial(index)}
                        style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: '0.5rem', display: 'flex' }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                    
                    <div className="form-group">
                      <label>Foto do Cliente</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                          {testimonial.avatar ? <img src={testimonial.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={24} color="var(--muted)" />}
                        </div>
                        <label className="btn-secondary" style={{ cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem' }}>
                          <Upload size={16} />
                          Fazer Upload
                          <input type="file" hidden accept="image/*" onChange={(e) => handleTestimonialImageUpload(e, index)} />
                        </label>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label>Nome do Autor</label>
                        <input type="text" value={testimonial.name} onChange={e => updateTestimonial(index, 'name', e.target.value)} placeholder="Ex: Roberto Camargo" />
                      </div>
                      <div className="form-group">
                        <label>Empresa / Cargo</label>
                        <input type="text" value={testimonial.role} onChange={e => updateTestimonial(index, 'role', e.target.value)} placeholder="Ex: Diretor Executivo" />
                      </div>
                      <div className="form-group">
                        <label>Avaliação (Estrelas)</label>
                        <select 
                          value={testimonial.rating || 5} 
                          onChange={e => updateTestimonial(index, 'rating', e.target.value)} 
                          style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--foreground)', outline: 'none' }}
                        >
                          <option value={5} style={{color:'#000'}}>5 Estrelas</option>
                          <option value={4} style={{color:'#000'}}>4 Estrelas</option>
                          <option value={3} style={{color:'#000'}}>3 Estrelas</option>
                          <option value={2} style={{color:'#000'}}>2 Estrelas</option>
                          <option value={1} style={{color:'#000'}}>1 Estrela</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Texto da Avaliação</label>
                      <textarea rows={3} value={testimonial.text} onChange={e => updateTestimonial(index, 'text', e.target.value)} placeholder="Descrição do depoimento..." />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addTestimonial}
                  style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', border: '1px dashed var(--primary)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', width: '100%' }}
                >
                  + Adicionar Depoimento
                </button>
              </div>

              {/* 5. CHAMADA PARA AÇÃO (CTA) */}
              <div style={{ display: 'grid', gap: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>5. Chamada para Ação (CTA Final)</h4>
                <div className="form-group">
                  <label>Título da Chamada</label>
                  <input type="text" value={formData.cta_title} onChange={e => setFormData({...formData, cta_title: e.target.value})} placeholder="Ex: Pronto para Climatizar o Seu Espaço?" />
                </div>
                <div className="form-group">
                  <label>Subtítulo da Chamada</label>
                  <textarea rows={3} value={formData.cta_subtitle} onChange={e => setFormData({...formData, cta_subtitle: e.target.value})} placeholder="Ex: Agende uma reunião com nossa equipe técnica..." />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Texto do Botão Principal (WhatsApp)</label>
                    <input type="text" value={formData.cta_btn_text_1} onChange={e => setFormData({...formData, cta_btn_text_1: e.target.value})} placeholder="Ex: Chamar Consultor Técnico" />
                  </div>
                  <div className="form-group">
                    <label>Texto do Botão Secundário</label>
                    <input type="text" value={formData.cta_btn_text_2} onChange={e => setFormData({...formData, cta_btn_text_2: e.target.value})} placeholder="Ex: Ver Peças e Acessórios" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'visual' && (
            <div className="glass-card" style={{ padding: '2.5rem', display: 'grid', gap: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Estilo</h3>
              
              <div className="form-group">
                <label>Tema Visual da Loja</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', border: formData.theme_mode === 'light' ? '2px solid var(--primary)' : '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', backgroundColor: formData.theme_mode === 'light' ? 'rgba(99, 102, 241, 0.05)' : 'transparent' }}>
                    <input type="radio" name="theme_mode" checked={formData.theme_mode === 'light'} onChange={() => setFormData({...formData, theme_mode: 'light'})} style={{ cursor: 'pointer' }} />
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--foreground)' }}>Tema Claro</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Fundo claro com textos escuros.</div>
                    </div>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', border: formData.theme_mode === 'dark' ? '2px solid var(--primary)' : '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', backgroundColor: formData.theme_mode === 'dark' ? 'rgba(99, 102, 241, 0.05)' : 'transparent' }}>
                    <input type="radio" name="theme_mode" checked={formData.theme_mode === 'dark'} onChange={() => setFormData({...formData, theme_mode: 'dark'})} style={{ cursor: 'pointer' }} />
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--foreground)' }}>Tema Escuro</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Fundo escuro (ideal para academia, suplementos, etc.).</div>
                    </div>
                  </label>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ background: 'rgba(99,102,241,0.06)', borderRadius: '12px', padding: '1.25rem', border: '1px solid rgba(99,102,241,0.15)' }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>🎨 Paleta de Cores da Loja</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <ColorInput label="Cor Primária" value={formData.primary_color} onChange={(v:any) => setFormData({...formData, primary_color: v})} />
                    <ColorInput label="Cor Secundária" value={formData.secondary_color} onChange={(v:any) => setFormData({...formData, secondary_color: v})} />
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.75rem', lineHeight: 1.5 }}>A Cor Primária define o estilo geral (botões, ícones, destaques). A Cor Secundária é usada nos gradientes e efeitos hover dos cards.</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <ColorInput label="Preço em Oferta" value={formData.sale_price_color} onChange={(v:any) => setFormData({...formData, sale_price_color: v})} />
                <ColorInput label="Preço Normal (Sem Oferta)" value={formData.default_price_color} onChange={(v:any) => setFormData({...formData, default_price_color: v})} />
              </div>
              <ColorInput label="Preço Riscado (Valor Antigo)" value={formData.normal_price_color} onChange={(v:any) => setFormData({...formData, normal_price_color: v})} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <ColorInput label="Fundo do Botão" value={formData.button_color} onChange={(v:any) => setFormData({...formData, button_color: v})} />
                <ColorInput label="Texto do Botão" value={formData.button_text_color} onChange={(v:any) => setFormData({...formData, button_text_color: v})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <ColorInput label="Fundo (Hover)" value={formData.button_hover_color} onChange={(v:any) => setFormData({...formData, button_hover_color: v})} />
                <ColorInput label="Texto (Hover)" value={formData.button_hover_text_color} onChange={(v:any) => setFormData({...formData, button_hover_text_color: v})} />
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '1.5rem', display: 'grid', gap: '1.5rem' }}>
                <h4 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--foreground)' }}>Seção CTA (Final da Página)</h4>

                {/* Gradient Toggle */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: formData.cta_use_gradient ? 'rgba(99,102,241,0.06)' : 'transparent', border: formData.cta_use_gradient ? '1px solid rgba(99,102,241,0.25)' : '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '36px', height: '20px', borderRadius: '40px', background: formData.cta_use_gradient ? 'linear-gradient(90deg, ' + formData.primary_color + ', ' + formData.secondary_color + ')' : '#e2e8f0', position: 'relative', transition: 'background 0.3s', flexShrink: 0 }}>
                        <div style={{ position: 'absolute', top: '2px', left: formData.cta_use_gradient ? '18px' : '2px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--foreground)' }}>Usar Gradiente no Fundo do CTA</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.15rem' }}>Aplica um degradê entre a Cor Primária e Secundária</div>
                      </div>
                    </div>
                    <input type="checkbox" checked={formData.cta_use_gradient} onChange={e => setFormData({...formData, cta_use_gradient: e.target.checked})} style={{ display: 'none' }} />
                  </label>

                  {/* Preview */}
                  <div style={{ height: '56px', borderRadius: '12px', background: formData.cta_use_gradient ? `linear-gradient(135deg, ${formData.primary_color} 0%, ${formData.secondary_color} 100%)` : formData.cta_bg_color, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#fff', letterSpacing: '0.5px', textShadow: '0 1px 3px rgba(0,0,0,0.3)', gap: '0.5rem', transition: 'background 0.4s' }}>
                    <span>✨</span> Preview do Card CTA
                  </div>

                  {/* Solid color picker (hidden when gradient is on) */}
                  {!formData.cta_use_gradient && (
                    <ColorInput label="Cor de Fundo do Card CTA" value={formData.cta_bg_color} onChange={(v:any) => setFormData({...formData, cta_bg_color: v})} />
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <ColorInput label="Cor do Título CTA" value={formData.cta_title_color} onChange={(v:any) => setFormData({...formData, cta_title_color: v})} />
                  <ColorInput label="Cor da Descrição CTA" value={formData.cta_desc_color} onChange={(v:any) => setFormData({...formData, cta_desc_color: v})} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <ColorInput label="Fundo do Botão CTA (WhatsApp)" value={formData.cta_button_bg_color} onChange={(v:any) => setFormData({...formData, cta_button_bg_color: v})} />
                  <ColorInput label="Texto do Botão CTA" value={formData.cta_button_text_color} onChange={(v:any) => setFormData({...formData, cta_button_text_color: v})} />
                </div>
              </div>

              <div className="form-group" style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                <label>Família de Fontes</label>
                <select value={formData.font_family} onChange={e => setFormData({...formData, font_family: e.target.value})} style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--foreground)', outline: 'none' }}>
                  <option value="Inter" style={{color:'#000'}}>Moderna (Inter)</option>
                  <option value="Montserrat" style={{color:'#000'}}>Impacto (Montserrat)</option>
                  <option value="Playfair Display" style={{color:'#000'}}>Clássica (Playfair)</option>
                  <option value="system-ui" style={{color:'#000'}}>Sistema (Minimalista)</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'nicho' && (
            <div className="glass-card" style={{ padding: '2.5rem', display: 'grid', gap: '2rem' }}>
              <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Nicho da Loja</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Escolha o modelo que melhor se adapta ao seu negócio. Isso mudará a estrutura e o estilo visual base da sua loja.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>
                  <Lock size={14} />
                  Alteração bloqueada pelo administrador
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {[
                  { id: 'tech', label: 'Eletrônicos (Tech)', icon: '⚡', desc: 'Design focado em tecnologia, com tons escuros e destaque para performance.' },
                  { id: 'fashion', label: 'Confecções (Moda)', icon: '👕', desc: 'Elegância e minimalismo. Foco em fotografias grandes e fontes refinadas.' },
                  { id: 'office', label: 'Informática / Escritório', icon: '💻', desc: 'Layout corporativo e sério. Ideal para produtividade e hardware.' },
                  { id: 'modern', label: 'Moderno (Geral)', icon: '✨', desc: 'Visual vibrante e versátil. Adapta-se bem a qualquer tipo de produto.' },
                  { id: 'services', label: 'Serviços & Peças', icon: '🔧', desc: 'Estrutura voltada à prestação de serviços com formulários de orçamentos rápidos e venda de peças.' },
                  { id: 'lawyer', label: 'Advocacia (Legal)', icon: '⚖️', desc: 'Layout editorial luxuoso exclusivo para escritórios jurídicos e advogados de alta credibilidade.' },
                  { id: 'electrician', label: 'Eletricista (Serviços)', icon: '🔌', desc: 'Estrutura voltada inteiramente à prestação de serviços de eletricidade e orçamentos rápidos.' }
                ].map(niche => (
                  <button 
                    key={niche.id}
                    type="button"
                    onClick={() => {
                      toast.error('Somente o Super Administrador pode alterar o nicho da loja. Entre em contato para solicitar a alteração.');
                    }}
                    style={{
                      padding: '2rem',
                      borderRadius: '20px',
                      border: formData.layout_model === niche.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                      backgroundColor: formData.layout_model === niche.id ? 'rgba(99, 102, 241, 0.05)' : 'var(--input-bg)',
                      textAlign: 'left',
                      cursor: 'not-allowed',
                      opacity: formData.layout_model === niche.id ? 1 : 0.6,
                      transition: '0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      position: 'relative'
                    }}
                  >
                    {formData.layout_model === niche.id && (
                      <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', color: 'var(--primary)' }}>
                        <Lock size={16} />
                      </div>
                    )}
                    <span style={{ fontSize: '2.5rem' }}>{niche.icon}</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--foreground)', marginBottom: '0.25rem' }}>{niche.label}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: '1.4' }}>{niche.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'topo' && (
            <div className="glass-card" style={{ padding: '2.5rem', display: 'grid', gap: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Configuração do Topo</h3>
              <div className="form-group">
                <label>Texto da Barra de Anúncio</label>
                <input type="text" value={formData.top_bar_announcement} onChange={e => setFormData({...formData, top_bar_announcement: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <ColorInput label="Fundo da Barra" value={formData.top_bar_bg_color} onChange={(v:any) => setFormData({...formData, top_bar_bg_color: v})} />
                <ColorInput label="Texto da Barra" value={formData.top_bar_text_color} onChange={(v:any) => setFormData({...formData, top_bar_text_color: v})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <ColorInput label="Fundo do Menu (Cabeçalho)" value={formData.header_bg_color} onChange={(v:any) => setFormData({...formData, header_bg_color: v})} />
                <ColorInput label="Cor dos Ícones e Links" value={formData.header_icon_color} onChange={(v:any) => setFormData({...formData, header_icon_color: v})} />
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Links do Menu (Cabeçalho)</h4>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {formData.header_links.map((link: any, index: number) => (
                    <div key={index} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        placeholder="Nome do Link" 
                        value={link.label} 
                        onChange={(e) => {
                          const newLinks = [...formData.header_links];
                          newLinks[index].label = e.target.value;
                          setFormData({...formData, header_links: newLinks});
                        }} 
                        style={{ flex: 1 }}
                      />
                      <input 
                        type="text" 
                        placeholder="URL (ex: / ou ?view=produtos)" 
                        value={link.url} 
                        onChange={(e) => {
                          const newLinks = [...formData.header_links];
                          newLinks[index].url = e.target.value;
                          setFormData({...formData, header_links: newLinks});
                        }} 
                        style={{ flex: 2 }}
                      />
                      <button 
                        onClick={() => {
                          const newLinks = formData.header_links.filter((_:any, i:number) => i !== index);
                          setFormData({...formData, header_links: newLinks});
                        }}
                        style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => setFormData({...formData, header_links: [...formData.header_links, { label: 'Novo Link', url: '#' }]})}
                    style={{ padding: '0.75rem', border: '1px dashed var(--border)', background: 'transparent', borderRadius: '8px', cursor: 'pointer', color: 'var(--muted)', fontWeight: 600 }}
                  >
                    + Adicionar Link
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'banner' && (
            <div className="glass-card" style={{ padding: '2.5rem', display: 'grid', gap: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Banner Hero</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Exibir Texto no Banner</span>
                  <label className="switch">
                    <input type="checkbox" checked={formData.show_hero_text} onChange={e => setFormData({...formData, show_hero_text: e.target.checked})} />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>

              <div className="form-group" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '2rem' }}>
                <label style={{ marginBottom: '1rem', display: 'block', fontWeight: 700 }}>Modelo de Layout do Banner</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  {[
                    { id: 'full', label: 'Tela Cheia (E-commerce)', desc: 'Imagem cobrindo 100% de fundo com texto centralizado e sobreposição escura.' },
                    { id: 'split', label: 'Dividido (Serviços/Moderno)', desc: 'Imagem de um lado (lado direito/fundo) e texto de outro com cores contrastantes.' },
                    { id: 'left-aligned', label: 'Texto à Esquerda', desc: 'Imagem de fundo com texto alinhado à esquerda e degradê de transição suave.' },
                    { id: 'minimalist', label: 'Minimalista (Apenas Cores)', desc: 'Fundo sólido ou gradiente sem imagem, com texto limpo centralizado.' }
                  ].map(model => (
                    <label key={model.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1.25rem', border: formData.hero_style === model.id ? '2px solid var(--primary)' : '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', backgroundColor: formData.hero_style === model.id ? 'rgba(99, 102, 241, 0.05)' : 'transparent' }}>
                      <input type="radio" name="hero_style" checked={formData.hero_style === model.id} onChange={() => setFormData({...formData, hero_style: model.id})} style={{ marginTop: '0.25rem' }} />
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--foreground)' }}>{model.label}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.25rem', lineHeight: '1.4' }}>{model.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label>Imagem de Fundo do Banner</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ width: '100%', height: '200px', borderRadius: '12px', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.02)', position: 'relative' }}>
                    {formData.hero_image_url ? (
                      <img src={formData.hero_image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
                        <ImageIcon size={32} style={{ margin: '0 auto 0.5rem' }} />
                        <span style={{ fontSize: '0.875rem' }}>Nenhuma imagem selecionada</span>
                      </div>
                    )}
                  </div>
                  <label className="btn-secondary" style={{ cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center', padding: '0.75rem 1.5rem', border: '1px solid var(--border)', borderRadius: '8px', alignSelf: 'flex-start' }}>
                    <Upload size={18} />
                    Fazer Upload de Imagem
                    <input type="file" hidden accept="image/*" onChange={handleHeroImageUpload} />
                  </label>
                </div>
              </div>

              {formData.show_hero_text && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                      <label>Título do Banner</label>
                      <input type="text" value={formData.hero_title} onChange={e => setFormData({...formData, hero_title: e.target.value})} />
                    </div>
                    <ColorInput label="Cor do Título" value={formData.hero_title_color} onChange={(v:any) => setFormData({...formData, hero_title_color: v})} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                      <label>Subtítulo do Banner</label>
                      <textarea rows={3} value={formData.hero_subtitle} onChange={e => setFormData({...formData, hero_subtitle: e.target.value})} />
                    </div>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                      <ColorInput label="Cor do Subtítulo" value={formData.hero_subtitle_color} onChange={(v:any) => setFormData({...formData, hero_subtitle_color: v})} />
                      <ColorInput label="Fundo da Área de Texto" value={formData.hero_bg_color} onChange={(v:any) => setFormData({...formData, hero_bg_color: v})} />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'secoes' && (
            <div className="glass-card" style={{ padding: '2.5rem', display: 'grid', gap: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Seções da Página Inicial</h3>
              
              {!isServicesOnly() && (
              <div style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '12px', display: 'grid', gap: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontWeight: 700 }}>Seção de Novidades</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Mostra os produtos adicionados recentemente.</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" checked={formData.show_new_arrivals} onChange={e => setFormData({...formData, show_new_arrivals: e.target.checked})} />
                    <span className="slider round"></span>
                  </label>
                </div>
                {formData.show_new_arrivals && (
                  <div className="form-group">
                    <label>Título da Seção</label>
                    <input type="text" value={formData.new_arrivals_title} onChange={e => setFormData({...formData, new_arrivals_title: e.target.value})} />
                  </div>
                )}
              </div>
              )}

              {!isServicesOnly() && (
              <div style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '12px', display: 'grid', gap: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontWeight: 700 }}>Seção de Ofertas</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Exibe produtos com preço promocional.</p>
                  </div>
                </div>
                <div className="form-group">
                  <label>Título da Seção</label>
                  <input type="text" value={formData.flash_deals_title} onChange={e => setFormData({...formData, flash_deals_title: e.target.value})} />
                </div>
              </div>
              )}

              <div style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '12px', display: 'grid', gap: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontWeight: 700 }}>Benefícios da Loja</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Aparecem na página inicial e nas páginas de produtos.</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {formData.benefits.map((benefit: any, i: number) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 140px', gap: '0.75rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '8px', alignItems: 'end' }}>
                       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary)15', color: 'var(--primary)', fontSize: '1.5rem' }}>
                         {renderBenefitIcon(benefit.icon || 'Truck')}
                       </div>
                       <div className="form-group">
                         <label>Título</label>
                         <input type="text" value={benefit.title} onChange={e => {
                           const newB = [...formData.benefits];
                           newB[i].title = e.target.value;
                           setFormData({...formData, benefits: newB});
                         }} />
                       </div>
                       <div className="form-group">
                         <label>Subtítulo</label>
                         <input type="text" value={benefit.subtitle} onChange={e => {
                           const newB = [...formData.benefits];
                           newB[i].subtitle = e.target.value;
                           setFormData({...formData, benefits: newB});
                         }} />
                       </div>
                       <div className="form-group">
                         <label>Ícone</label>
                         <select value={benefit.icon || 'Truck'} onChange={e => {
                           const newB = [...formData.benefits];
                           newB[i].icon = e.target.value;
                           setFormData({...formData, benefits: newB});
                         }} style={{ padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--foreground)', fontSize: '0.85rem', cursor: 'pointer', width: '100%' }}>
                           <option value="Truck">Caminhão</option>
                           <option value="ShieldCheck">Escudo Seguro</option>
                           <option value="RefreshCw">Seta Troca</option>
                           <option value="CreditCard">Cartão</option>
                           <option value="ShoppingBag">Sacola</option>
                           <option value="ShoppingCart">Carrinho</option>
                           <option value="Gift">Presente</option>
                           <option value="Tag">Etiqueta</option>
                           <option value="Percent">Porcentagem</option>
                           <option value="Wallet">Carteira</option>
                           <option value="Banknote">Nota</option>
                           <option value="PiggyBank">Cofrinho</option>
                           <option value="Gem">Joia</option>
                           <option value="Box">Caixa</option>
                           <option value="Leaf">Folha (Eco)</option>
                           <option value="Package">Pacote</option>
                           <option value="Sparkles">Brilho</option>
                           <option value="Heart">Coração</option>
                           <option value="Star">Estrela</option>
                           <option value="Zap">Raio</option>
                           <option value="Headphones">Fone</option>
                           <option value="Award">Prêmio</option>
                           <option value="Shield">Escudo</option>
                           <option value="Clock">Relógio</option>
                           <option value="ThumbsUp">Joinha</option>
                           <option value="CheckCircle">Check</option>
                           <option value="Smile">Sorriso</option>
                           <option value="TrendingUp">Gráfico</option>
                           <option value="DollarSign">Dólar</option>
                           <option value="Phone">Telefone</option>
                           <option value="MessageSquare">Mensagem</option>
                           <option value="Users">Usuários</option>
                         </select>
                       </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '12px', display: 'grid', gap: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontWeight: 700 }}>Cartões de Serviço</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Aparecem na página inicial como diferenciais da empresa.</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {(formData.features || []).map((feat: any, i: number) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 140px', gap: '0.75rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '8px', alignItems: 'end' }}>
                       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary)15', color: 'var(--primary)', fontSize: '1.5rem' }}>
                         {renderBenefitIcon(feat.icon || 'Headphones')}
                       </div>
                       <div className="form-group">
                         <label>Título</label>
                         <input type="text" value={feat.title} onChange={e => {
                           const newF = [...formData.features];
                           newF[i].title = e.target.value;
                           setFormData({...formData, features: newF});
                         }} />
                       </div>
                       <div className="form-group">
                         <label>Descrição</label>
                         <input type="text" value={feat.desc} onChange={e => {
                           const newF = [...formData.features];
                           newF[i].desc = e.target.value;
                           setFormData({...formData, features: newF});
                         }} />
                       </div>
                       <div className="form-group">
                         <label>Ícone</label>
                         <select value={feat.icon || 'Headphones'} onChange={e => {
                           const newF = [...formData.features];
                           newF[i].icon = e.target.value;
                           setFormData({...formData, features: newF});
                         }} style={{ padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--foreground)', fontSize: '0.85rem', cursor: 'pointer', width: '100%' }}>
                           <option value="Truck">Caminhão</option>
                           <option value="ShieldCheck">Escudo Seguro</option>
                           <option value="RefreshCw">Seta Troca</option>
                           <option value="CreditCard">Cartão</option>
                           <option value="ShoppingBag">Sacola</option>
                           <option value="ShoppingCart">Carrinho</option>
                           <option value="Gift">Presente</option>
                           <option value="Tag">Etiqueta</option>
                           <option value="Percent">Porcentagem</option>
                           <option value="Wallet">Carteira</option>
                           <option value="Banknote">Nota</option>
                           <option value="PiggyBank">Cofrinho</option>
                           <option value="Gem">Joia</option>
                           <option value="Box">Caixa</option>
                           <option value="Leaf">Folha (Eco)</option>
                           <option value="Package">Pacote</option>
                           <option value="Sparkles">Brilho</option>
                           <option value="Heart">Coração</option>
                           <option value="Star">Estrela</option>
                           <option value="Zap">Raio</option>
                           <option value="Headphones">Fone</option>
                           <option value="Award">Prêmio</option>
                           <option value="Shield">Escudo</option>
                           <option value="Clock">Relógio</option>
                           <option value="ThumbsUp">Joinha</option>
                           <option value="CheckCircle">Check</option>
                           <option value="Smile">Sorriso</option>
                           <option value="TrendingUp">Gráfico</option>
                           <option value="DollarSign">Dólar</option>
                           <option value="Phone">Telefone</option>
                           <option value="MessageSquare">Mensagem</option>
                           <option value="Users">Usuários</option>
                         </select>
                       </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '12px', display: 'grid', gap: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontWeight: 700 }}>Seção de Serviços</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Exibe os serviços oferecidos pela empresa.</p>
                  </div>
                </div>
                <div className="form-group">
                  <label>Tag da Seção</label>
                  <input type="text" value={formData.services_tag || 'Nossos Serviços'} onChange={e => setFormData({...formData, services_tag: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Título da Seção</label>
                  <input type="text" value={formData.services_title || 'Serviços de Climatização & Engenharia'} onChange={e => setFormData({...formData, services_title: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Subtítulo da Seção</label>
                  <input type="text" value={formData.services_subtitle || 'Desenvolvemos soluções completas sob medida para residências e empresas exigentes.'} onChange={e => setFormData({...formData, services_subtitle: e.target.value})} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rodape' && (
            <div className="glass-card" style={{ padding: '2.5rem', display: 'grid', gap: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Configuração do Rodapé</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <ColorInput label="Cor de Fundo do Rodapé" value={formData.footer_bg_color} onChange={(v:any) => setFormData({...formData, footer_bg_color: v})} />
                <ColorInput label="Cor do Texto" value={formData.footer_text_color} onChange={(v:any) => setFormData({...formData, footer_text_color: v})} />
              </div>

              <div className="form-group">
                <label>Logo do Rodapé (Opcional)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  <div style={{ width: '120px', height: '120px', borderRadius: '12px', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: formData.footer_bg_color }}>
                    {formData.footer_logo_url ? <img src={formData.footer_logo_url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <Store size={32} color="var(--muted)" />}
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <label className="btn-secondary" style={{ cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.75rem 1.5rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
                      <Upload size={18} />
                      Selecionar Logo
                      <input type="file" hidden accept="image/*" onChange={handleFooterLogoUpload} />
                    </label>
                    {formData.footer_logo_url && (
                      <button onClick={() => setFormData({...formData, footer_logo_url: ''})} style={{ padding: '0.75rem 1.25rem', border: '1px solid #ef4444', borderRadius: '8px', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                        <X size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Texto de Descrição do Rodapé</label>
                <textarea rows={3} placeholder="Descrição sobre a loja, qualidade e entrega..." value={formData.footer_description} onChange={e => setFormData({...formData, footer_description: e.target.value})} />
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Redes Sociais e Contato</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label>WhatsApp (Apenas números)</label>
                    <input type="text" placeholder="5511999999999" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Telefone Fixo / Celular</label>
                    <input type="text" placeholder="(11) 9999-9999" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label>Instagram (Usuário ou Link)</label>
                    <input type="text" placeholder="@sualoja ou https://instagram.com/..." value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Facebook (Link da Página)</label>
                    <input type="text" placeholder="https://facebook.com/sualoja" value={formData.facebook} onChange={e => setFormData({...formData, facebook: e.target.value})} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label>E-mail de Contato</label>
                    <input type="email" placeholder="contato@sualoja.com.br" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Endereço Físico</label>
                    <input type="text" placeholder="Rua Exemplo, 123 - Cidade/UF" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Links de Navegação do Rodapé</h4>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {(formData.footer_links || []).map((link: any, index: number) => (
                    <div key={index} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        placeholder="Nome do Link" 
                        value={link.label} 
                        onChange={(e) => {
                          const newLinks = [...formData.footer_links];
                          newLinks[index].label = e.target.value;
                          setFormData({...formData, footer_links: newLinks});
                        }} 
                        style={{ flex: 1 }}
                      />
                      <input 
                        type="text" 
                        placeholder="URL (ex: ?view=produtos ou #)" 
                        value={link.url} 
                        onChange={(e) => {
                          const newLinks = [...formData.footer_links];
                          newLinks[index].url = e.target.value;
                          setFormData({...formData, footer_links: newLinks});
                        }} 
                        style={{ flex: 2 }}
                      />
                      <button 
                        onClick={() => {
                          const newLinks = formData.footer_links.filter((_:any, i:number) => i !== index);
                          setFormData({...formData, footer_links: newLinks});
                        }}
                        style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => setFormData({...formData, footer_links: [...(formData.footer_links || []), { label: 'Novo Link', url: '#' }]})}
                    style={{ padding: '0.75rem', border: '1px dashed var(--border)', background: 'transparent', borderRadius: '8px', cursor: 'pointer', color: 'var(--muted)', fontWeight: 600 }}
                  >
                    + Adicionar Link ao Rodapé
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'layout' && (
            <div className="glass-card" style={{ padding: '2.5rem', display: 'grid', gap: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Opções de Estrutura</h3>
              <div className="form-group">
                <label>Estilo do Cabeçalho</label>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', backgroundColor: formData.header_style === 'modern' ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
                    <input type="radio" checked={formData.header_style === 'modern'} onChange={() => setFormData({...formData, header_style: 'modern'})} />
                    <div>
                      <div style={{ fontWeight: 700 }}>Moderno (Sticky)</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Logo no centro e menu hambúrguer. Acompanha o scroll.</div>
                    </div>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', backgroundColor: formData.header_style === 'center_menu' ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
                    <input type="radio" checked={formData.header_style === 'center_menu'} onChange={() => setFormData({...formData, header_style: 'center_menu'})} />
                    <div>
                      <div style={{ fontWeight: 700 }}>Menu Centralizado</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Logo à esquerda e links de navegação no centro.</div>
                    </div>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', backgroundColor: formData.header_style === 'classic' ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
                    <input type="radio" checked={formData.header_style === 'classic'} onChange={() => setFormData({...formData, header_style: 'classic'})} />
                    <div>
                      <div style={{ fontWeight: 700 }}>Clássico</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Menu simples que fica fixo no topo da página.</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '2rem' }}>
                <label>Estilo do Banner Hero</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', backgroundColor: formData.hero_style === 'split' ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
                    <input type="radio" checked={formData.hero_style === 'split'} onChange={() => setFormData({...formData, hero_style: 'split'})} />
                    <div>
                      <div style={{ fontWeight: 700 }}>Lateral (Split)</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Texto à esquerda com imagem de fundo.</div>
                    </div>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', backgroundColor: formData.hero_style === 'centered' ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
                    <input type="radio" checked={formData.hero_style === 'centered'} onChange={() => setFormData({...formData, hero_style: 'centered'})} />
                    <div>
                      <div style={{ fontWeight: 700 }}>Centralizado</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Conteúdo focado no centro da tela.</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seguranca' && (
            <div className="glass-card" style={{ padding: '2.5rem', display: 'grid', gap: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Lock size={26} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--foreground)' }}>Credenciais de Acesso da Loja</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>Gerencie o usuário e a senha utilizados para entrar no painel administrativo.</p>
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--muted)' }}>E-mail / Usuário de Acesso</label>
                <input 
                  type="text" 
                  value={formData.admin_user} 
                  onChange={e => setFormData({...formData, admin_user: e.target.value})} 
                  placeholder="admin@sualoja.com.br"
                  style={{ fontWeight: 600 }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.25rem' }}>Este é o login utilizado na tela inicial do lojista.</span>
              </div>

              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--muted)' }}>Senha de Acesso</label>
                <input 
                  type="text" 
                  value={formData.admin_password} 
                  onChange={e => setFormData({...formData, admin_password: e.target.value})} 
                  placeholder="Digite a nova senha"
                  style={{ fontWeight: 600 }}
                />
                <span style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem', fontWeight: 600 }}>Você pode redefinir sua senha a qualquer momento. Lembre-se de clicar em 'Salvar Tudo' no topo para aplicar.</span>
              </div>
            </div>
          )}

          {activeTab === 'dominios' && (
            <div className="glass-card" style={{ padding: '2.5rem', display: 'grid', gap: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Globe size={26} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--foreground)' }}>Domínios & Roteamento</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>Configure seu domínio próprio personalizado para acessar sua loja virtual.</p>
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--muted)' }}>Subdomínio Padrão (Gratuito)</label>
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--foreground)' }}>{formData.subdomain}</span>
                  <span style={{ color: '#0ea5e9', fontWeight: 700 }}>{domainSuffix}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.25rem' }}>Este subdomínio estará sempre disponível para acesso direto à sua loja.</span>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--foreground)' }}>Domínio Próprio Registrado (Opcional)</label>
                <input 
                  type="text" 
                  value={formData.custom_domain} 
                  onChange={e => setFormData({...formData, custom_domain: e.target.value.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '')})} 
                  placeholder="ex: sualoja.com.br"
                  style={{ fontWeight: 600, fontSize: '1rem' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.25rem' }}>Digite apenas o domínio sem www ou https:// (ex: minhaloja.com.br). Lembre-se de clicar em 'Salvar Tudo' no topo para aplicar.</span>
              </div>

              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1.5rem', borderRadius: '12px', marginTop: '1rem' }}>
                <h4 style={{ color: '#10b981', fontSize: '1.05rem', fontWeight: 800, margin: '0 0 0.75rem 0' }}>📌 Instruções de Apontamento DNS</h4>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
                  Para que o seu domínio próprio funcione corretamente, acesse o painel do seu registrador (Registro.br, GoDaddy, HostGator, Cloudflare) e adicione a seguinte entrada de DNS:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '1rem', background: 'var(--input-bg)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                  <div><strong>TIPO:</strong> CNAME</div>
                  <div><strong>NOME:</strong> @ (ou www)</div>
                  <div><strong>DESTINO:</strong> cname.criarlojas.com.br</div>
                </div>
                <p style={{ color: 'var(--muted)', fontSize: '0.8rem', margin: '1rem 0 0 0' }}>
                  ⏳ Nota: A propagação das alterações de DNS pode levar de 1 a 24 horas dependendo do seu provedor.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'integracoes' && (
            <div className="glass-card" style={{ padding: '2.5rem', display: 'grid', gap: '3rem' }}>
              {/* SEÇÃO 1: PIXELS E TRACKING */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShoppingBag size={26} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--foreground)' }}>Pixels & Rastreamento Avançado</h3>
                    <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>Configure suas tags de tráfego pago e métricas de conversão.</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label style={{ fontWeight: 700, color: 'var(--foreground)' }}>Google Tag Manager (GTM ID)</label>
                    <input 
                      type="text" 
                      placeholder="GTM-XXXXXXX" 
                      value={formData.gtm_id} 
                      onChange={e => setFormData({...formData, gtm_id: e.target.value.toUpperCase()})}
                      style={{ fontWeight: 600, fontFamily: 'monospace' }} 
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Gerencia tags e eventos globais da loja.</span>
                  </div>

                  <div className="form-group">
                    <label style={{ fontWeight: 700, color: 'var(--foreground)' }}>Google Analytics (GA4 ID)</label>
                    <input 
                      type="text" 
                      placeholder="G-XXXXXXXXXX" 
                      value={formData.ga_id} 
                      onChange={e => setFormData({...formData, ga_id: e.target.value.toUpperCase()})}
                      style={{ fontWeight: 600, fontFamily: 'monospace' }} 
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Mede o tráfego, sessões e comportamento do usuário.</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                  <div className="form-group">
                    <label style={{ fontWeight: 700, color: 'var(--foreground)' }}>Google Ads (Tag de Conversão)</label>
                    <input 
                      type="text" 
                      placeholder="AW-XXXXXXXXXX" 
                      value={formData.google_ads_id} 
                      onChange={e => setFormData({...formData, google_ads_id: e.target.value.toUpperCase()})}
                      style={{ fontWeight: 600, fontFamily: 'monospace' }} 
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Rastreia compras e remarketing do Google Ads.</span>
                  </div>

                  <div className="form-group">
                    <label style={{ fontWeight: 700, color: 'var(--foreground)' }}>Facebook Pixel ID</label>
                    <input 
                      type="text" 
                      placeholder="123456789012345" 
                      value={formData.fb_pixel_id} 
                      onChange={e => setFormData({...formData, fb_pixel_id: e.target.value.replace(/\D/g, '')})}
                      style={{ fontWeight: 600, fontFamily: 'monospace' }} 
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Acompanha pageviews, add to cart e compras da Meta.</span>
                  </div>
                </div>
              </div>

              {/* SEÇÃO 2: CATÁLOGO META */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShoppingBag size={26} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--foreground)' }}>Catálogo Instagram & Facebook</h3>
                    <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>Integre seus produtos automaticamente com a Sacolinha do Instagram (Meta Commerce).</p>
                  </div>
                </div>

              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>URL do Feed de Dados (XML)</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
                  Este link contém todo o catálogo de produtos da sua loja em formato XML atualizado em tempo real. Copie-o e cole no Gerenciador de Comércio da Meta.
                </p>
                
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    readOnly
                    value={formData.subdomain ? `https://${formData.custom_domain || `${formData.subdomain}.criarlojas.com`}/feed.xml` : 'Carregando URL...'} 
                    style={{ flex: 1, padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--input-bg)', color: 'var(--foreground)', fontFamily: 'monospace', fontSize: '0.9rem' }} 
                  />
                  <button 
                    type="button" 
                    onClick={() => {
                      const url = formData.subdomain ? `https://${formData.custom_domain || `${formData.subdomain}.criarlojas.com`}/feed.xml` : ''
                      if (url) {
                        navigator.clipboard.writeText(url)
                        toast.success('URL do Feed copiada com sucesso!')
                      }
                    }} 
                    style={{ padding: '1rem 1.5rem', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)' }}
                  >
                    Copiar Link
                  </button>
                </div>
              </div>

              <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--foreground)' }}>Como configurar no Meta Commerce Manager:</h4>
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '1.25rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>1</div>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: '0.25rem', color: 'var(--foreground)' }}>Acesse o Gerenciador de Comércio</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.5 }}>Faça login na sua conta do Facebook Business / Meta Commerce Manager e selecione o catálogo da sua loja (ou crie um novo catálogo de E-commerce).</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1.25rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>2</div>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: '0.25rem', color: 'var(--foreground)' }}>Adicione o Feed de Dados</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.5 }}>Vá no menu lateral em <strong>Catálogo &gt; Fontes de Dados</strong>. Clique em <strong>Adicionar itens</strong> e escolha a option <strong>Feed de Dados (Data Feed)</strong>.</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1.25rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>3</div>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: '0.25rem', color: 'var(--foreground)' }}>Cole a URL e Programe</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.5 }}>Cole o link copiado acima na opção "Programação de URL". Defina a atualização para Diária ou De hora em hora. O Meta importará todos os seus produtos automaticamente!</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>

      <style>{`
        .btn-save-settings:hover { background-color: #4f46e5 !important; transform: translateY(-2px); box-shadow: 0 6px 15px rgba(99, 102, 241, 0.4); }
        .btn-save-settings:active { transform: translateY(0); }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        label { font-size: 0.875rem; font-weight: 500; color: var(--muted); }
        input, textarea { background: var(--input-bg); border: 1px solid var(--border); border-radius: 8px; padding: 0.75rem 1rem; color: var(--foreground); outline: none; }
        input:focus { border-color: var(--primary); }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .switch { position: relative; display: inline-block; width: 50px; height: 24px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .4s; border: 1px solid var(--border); }
        .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 4px; bottom: 3px; background-color: white; transition: .4s; }
        input:checked + .slider { background-color: var(--primary); border-color: var(--primary); }
        input:checked + .slider:before { transform: translateX(24px); }
        .slider.round { border-radius: 34px; }
        .slider.round:before { border-radius: 50%; }
      `}</style>

      {/* Modal de Confirmação */}
      {confirmModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <div style={{ maxWidth: '420px', width: '100%', background: 'var(--card)', borderRadius: '16px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--foreground)' }}>Confirmar Exclusão</h3>
            <p style={{ color: 'var(--muted)', marginBottom: '2rem', lineHeight: 1.5 }}>{confirmModal.message}</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                style={{ padding: '0.75rem 1.5rem', background: '#f1f5f9', color: 'var(--foreground)', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                style={{ padding: '0.75rem 1.5rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

const benefitIconMap: Record<string, any> = {
  Truck, ShieldCheck, RefreshCw, CreditCard, Heart, Star, Zap, Package, Headphones, Award, Shield, Clock, ThumbsUp, CheckCircle, Smile, TrendingUp, DollarSign, Phone, MessageSquare, Users, ShoppingBag, ShoppingCart, Gift, Tag, Percent, Wallet, Banknote, PiggyBank, Gem, Leaf, Box, Sparkles
}

function renderBenefitIcon(iconName: string) {
  const Icon = benefitIconMap[iconName] || Truck
  return <Icon size={20} />
}

function ColorInput({ label, value, onChange }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <label>{label}</label>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <input type="color" value={value} onChange={e => onChange(e.target.value)} style={{ width: '50px', height: '50px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
        <input type="text" value={value} onChange={e => onChange(e.target.value)} style={{ flex: 1, fontFamily: 'monospace' }} />
      </div>
    </div>
  )
}
