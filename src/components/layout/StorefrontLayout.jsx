import { Outlet } from 'react-router'
import StoreNavbar from './StoreNavbar'
import StoreFooter from './StoreFooter'
import CartDrawer from '../storefront/CartDrawer'

export default function StorefrontLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <StoreNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <StoreFooter />
      <CartDrawer />
    </div>
  )
}
