'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Card } from '@heroui/react/card'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  CreditCard,
  MessageCircle,
  Settings,
  ChevronLeft,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { can } from '../../lib/roles'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true, section: 'dashboard' },
  { href: '/admin/products', label: 'Products', icon: Package, section: 'products' },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart, section: 'orders' },
  { href: '/admin/customers', label: 'Customers', icon: Users, section: 'customers' },
  { href: '/admin/installments', label: 'Installments', icon: CreditCard, section: 'installments' },
  { href: '/admin/messages', label: 'Messages', icon: MessageCircle, section: 'messages' },
  { href: '/admin/settings', label: 'Settings', icon: Settings, section: 'settings' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const { role } = useAuth()

  const visibleItems = navItems.filter(({ section }) => can(role, section))

  const roleLabel = role
    ? role.charAt(0).toUpperCase() + role.slice(1)
    : 'Admin'

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <Card className="p-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted hover:text-slate-green transition-colors mb-4 px-2"
        >
          <ChevronLeft size={16} /> Back to Store
        </Link>

        <div className="px-4 py-2 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-volt bg-slate-green px-2 py-1 rounded-md">
            {roleLabel}
          </span>
        </div>

        <nav className="space-y-1">
          {visibleItems.map(({ href, label, icon: Icon, exact }) => {
            const isActive = exact
              ? pathname === href
              : pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-green text-white'
                    : 'text-muted hover:bg-surface'
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </nav>
      </Card>
    </aside>
  )
}
