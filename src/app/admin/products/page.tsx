'use client'

import AdminProductList from '@/components/Admin/AdminProductList'
import { useAdminAuth } from '@/context/AdminAuthContext'

export default function AdminProducts() {
  const { store } = useAdminAuth()
  const isServicesModel = store?.settings?.layout_model === 'services'
  const isLawyerLayout = ['lawyer', 'advocacia', 'advocacy', 'electrician'].includes(store?.settings?.layout_model)
  const isServicesOnly = isServicesModel || isLawyerLayout

  if (isServicesOnly) {
    return <AdminProductList tipo="services" />
  }

  return <AdminProductList tipo="all" />
}
