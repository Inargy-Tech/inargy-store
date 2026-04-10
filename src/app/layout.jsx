import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './Providers'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata = {
  metadataBase: new URL('https://store.inargy.tech'),
  title: {
    default: 'Inargy Store — Solar Energy Systems for Nigeria',
    template: '%s — Inargy Store',
  },
  description: 'Affordable solar energy systems for Nigerian homes and businesses. Solar panels, inverters, batteries and more with flexible payment plans.',
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    siteName: 'Inargy Store',
    title: 'Inargy Store — Solar Energy Systems for Nigeria',
    description: 'Affordable solar energy systems for Nigerian homes and businesses. Solar panels, inverters, batteries and more with flexible payment plans.',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Inargy Store — Solar Energy Systems for Nigeria' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inargy Store — Solar Energy Systems for Nigeria',
    description: 'Affordable solar energy systems for Nigerian homes and businesses.',
    images: ['/og-default.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Inargy Store',
  url: 'https://store.inargy.tech',
  description: 'Affordable solar energy systems for Nigerian homes and businesses.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
