import CatalogContent from '../CatalogContent'
import { SITE } from '../../../config'

export const metadata = {
  title: 'Catalog',
  description: 'Browse our full range of solar panels, inverters, batteries and charge controllers.',
  alternates: { canonical: `${SITE.url}/catalog` },
}

export default function CatalogPage() {
  return <CatalogContent />
}
