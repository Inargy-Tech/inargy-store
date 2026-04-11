'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Card } from '@heroui/react/card'
import { Package, User, CreditCard, MessageCircle, ChevronLeft } from 'lucide-react'

const navItems = [
  { href: '/dashboard/orders', label: 'My Orders', icon: Package },
  { href: '/dashboard/installments', label: 'Installments', icon: CreditCard },
  { href: '/dashboard/messages', label: 'Messages', icon: MessageCircle },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
]

export default function CustomerSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <Card className="p-4">
        <Link
          href="/catalog"
          className="flex items-center gap-2 text-sm text-muted hover:text-slate-green transition-colors mb-4 px-2"
        >
          <ChevronLeft size={16} /> Back to Store
        </Link>

        <nav className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
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
