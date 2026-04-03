'use client'

import StoreNavbar from '../../components/layout/StoreNavbar'
import CustomerSidebar from '../../components/layout/CustomerSidebar'
import CartDrawer from '../../components/storefront/CartDrawer'
import ProtectedRoute from '../../components/layout/ProtectedRoute'

export default function DashboardLayoutShell({ children }) {
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
