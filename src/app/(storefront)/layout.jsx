import StoreNavbar from '../../components/layout/StoreNavbar'
import StoreFooter from '../../components/layout/StoreFooter'
import CartDrawer from '../../components/storefront/CartDrawer'

export default function StorefrontLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-slate-green focus:text-white focus:rounded-lg focus:text-sm focus:font-semibold">
        Skip to main content
      </a>
      <StoreNavbar />
      <main id="main-content" className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <StoreFooter />
      <CartDrawer />
    </div>
  )
}
