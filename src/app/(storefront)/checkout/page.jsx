'use client'

import dynamic from 'next/dynamic'
import { BrandMark } from '../../../assets/logo'
import ProtectedRoute from '../../../components/layout/ProtectedRoute'

const CheckoutContent = dynamic(() => import('./CheckoutContent'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-20">
      <BrandMark size={48} className="text-volt animate-breathe" />
    </div>
  ),
})

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutContent />
    </ProtectedRoute>
  )
}
