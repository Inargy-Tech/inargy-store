'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../ui/LoadingSpinner'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAdmin, loading, profileLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isSettled = !loading && !profileLoading

  useEffect(() => {
    if (!isSettled) return
    if (!user) {
      router.replace('/auth/login')
    } else if (adminOnly && !isAdmin) {
      router.replace('/dashboard/orders')
    }
  }, [user, isAdmin, isSettled, adminOnly, router, pathname])

  if (!isSettled) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) return null
  if (adminOnly && !isAdmin) return null

  return children
}
