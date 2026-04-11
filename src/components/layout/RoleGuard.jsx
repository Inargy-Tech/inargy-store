'use client'

import { Lock } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { can } from '../../lib/roles'
import LoadingSpinner from '../ui/LoadingSpinner'

export default function RoleGuard({ section, children }) {
  const { role, loading, profileLoading } = useAuth()

  if (loading || profileLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!can(role, section)) {
    return (
      <div className="bg-white rounded-2xl border border-border p-16 text-center">
        <Lock size={40} strokeWidth={1} className="text-muted mx-auto mb-4" />
        <p className="text-slate-green font-semibold mb-1">Access Denied</p>
        <p className="text-sm text-muted">You don't have permission to view this page.</p>
      </div>
    )
  }

  return children
}
