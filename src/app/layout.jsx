import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './Providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata = {
  metadataBase: new URL('https://store.inargy.tech'),
  title: {
    default: 'Inargy Store — Affordable Solar Energy for Nigeria',
    template: '%s — Inargy Store',
  },
  description:
    'Shop affordable solar panels, inverters, batteries and charge controllers for Nigerian homes and businesses. Pay with card, bank transfer, or installments.',
  keywords: ['solar panels Nigeria', 'inverter', 'battery', 'solar energy', 'inargy', 'renewable energy'],
  openGraph: {
    type: 'website',
    siteName: 'Inargy Store',
    title: 'Inargy Store — Affordable Solar Energy for Nigeria',
    description:
      'Shop affordable solar panels, inverters, batteries and charge controllers for Nigerian homes and businesses.',
    url: 'https://store.inargy.tech',
    locale: 'en_NG',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inargy Store — Affordable Solar Energy for Nigeria',
    description:
      'Shop affordable solar panels, inverters, batteries and charge controllers for Nigerian homes and businesses.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://store.inargy.tech',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
