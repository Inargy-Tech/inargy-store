'use client'

import StoreNavbar from './StoreNavbar'
import AdminSidebar from './AdminSidebar'
import ProtectedRoute from './ProtectedRoute'

export default function AdminShell({ children }) {
  return (
    <ProtectedRoute adminOnly>
      <div className="min-h-screen flex flex-col">
        <StoreNavbar />
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <AdminSidebar />
            <div className="flex-1 min-w-0">
              {children}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
