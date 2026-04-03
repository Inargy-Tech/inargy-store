'use client'

import Link from 'next/link'
import { Logo } from '../../assets/logo'
import { SITE, CONTACT } from '../../config'
import { Mail, Phone, MessageCircle } from 'lucide-react'

export default function StoreFooter() {
  return (
    <footer className="bg-slate-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Logo height={28} className="text-white mb-4" />
            <p className="text-white/60 text-sm leading-relaxed">
              Affordable solar energy systems for Nigerian homes and businesses. Flexible payment plans available.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">
              Shop
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/catalog" className="text-sm text-white/60 hover:text-volt transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=solar-panels" className="text-sm text-white/60 hover:text-volt transition-colors">
                  Solar Panels
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=inverters" className="text-sm text-white/60 hover:text-volt transition-colors">
                  Inverters
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=batteries" className="text-sm text-white/60 hover:text-volt transition-colors">
                  Batteries
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">
              Account
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/dashboard/orders" className="text-sm text-white/60 hover:text-volt transition-colors">
                  My Orders
                </Link>
              </li>
              <li>
                <Link href="/dashboard/profile" className="text-sm text-white/60 hover:text-volt transition-colors">
                  Profile
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="text-sm text-white/60 hover:text-volt transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="flex items-center gap-2 text-sm text-white/60 hover:text-volt transition-colors"
                >
                  <Mail size={14} /> {CONTACT.email}
                </a>
              </li>
              <li>
                <a
                  href={CONTACT.phoneTel}
                  className="flex items-center gap-2 text-sm text-white/60 hover:text-volt transition-colors"
                >
                  <Phone size={14} /> {CONTACT.phone}
                </a>
              </li>
              <li>
                <a
                  href={CONTACT.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-white/60 hover:text-volt transition-colors"
                >
                  <MessageCircle size={14} /> WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} {SITE.company}. All rights reserved.
          </p>
          <a
            href={SITE.marketingSite}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-white/40 hover:text-volt transition-colors"
          >
            Committed to clean energy since 2022.
          </a>
        </div>
      </div>
    </footer>
  )
}
