"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getAuthenticatedStore, logoutAdmin } from '@/lib/adminAuth'

interface AdminAuthContextType {
  store: any | null
  loading: boolean
  logout: () => void
  refresh: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname() || ''

  const checkAuth = async () => {
    try {
      const activeStore = await getAuthenticatedStore()
      if (activeStore) {
        setStore(activeStore)
      } else {
        setStore(null)
        if (!pathname.includes('/admin/login')) {
          router.push('/admin/login')
        }
      }
    } catch (err) {
      console.error('Erro na autenticação admin:', err)
      setStore(null)
      if (!pathname.includes('/admin/login')) {
        router.push('/admin/login')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [pathname])

  const logout = () => {
    logoutAdmin()
    setStore(null)
    router.push('/admin/login')
  }

  return (
    <AdminAuthContext.Provider value={{ store, loading, logout, refresh: checkAuth }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth deve ser usado dentro de um AdminAuthProvider')
  }
  return context
}
