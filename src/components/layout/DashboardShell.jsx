'use client'

import dynamic from 'next/dynamic'
import StoreNavbar from './StoreNavbar'
import CustomerSidebar from './CustomerSidebar'
import ProtectedRoute from './ProtectedRoute'

const CartDrawer = dynamic(() => import('../storefront/CartDrawer'), { ssr: false })

export default function DashboardShell({ children }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <StoreNavbar />
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <CustomerSidebar />
            <div className="flex-1 min-w-0">
              {children}
            </div>
          </div>
        </div>
        <CartDrawer />
      </div>
    </ProtectedRoute>
  )
}
