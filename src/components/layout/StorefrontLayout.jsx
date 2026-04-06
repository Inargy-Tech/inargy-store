import { Outlet } from 'react-router'
import StoreNavbar from './StoreNavbar'
import StoreFooter from './StoreFooter'
import CartDrawer from '../storefront/CartDrawer'

export default function StorefrontLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <StoreNavbar />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
      <StoreFooter />
      <CartDrawer />
    </div>
  )
}
