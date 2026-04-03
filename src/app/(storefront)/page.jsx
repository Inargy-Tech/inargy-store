import CatalogContent from './CatalogContent'

import { SITE } from '../../config'

export const metadata = {
  title: 'Shop Solar Panels, Inverters & Batteries',
  description: 'Browse affordable solar energy products for Nigerian homes and businesses. Free delivery on select items.',
  alternates: { canonical: SITE.url },
}

export default function HomePage() {
  return <CatalogContent />
}
