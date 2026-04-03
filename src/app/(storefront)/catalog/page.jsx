import CatalogContent from '../CatalogContent'
import { SITE } from '../../../config'
import { getProducts } from '../../../lib/queries'
import { createServerSupabase } from '../../../lib/supabase-server'

export const metadata = {
  title: 'Catalog',
  description: 'Browse our full range of solar panels, inverters, batteries and charge controllers.',
  alternates: { canonical: `${SITE.url}/catalog` },
}

export default async function CatalogPage({ searchParams }) {
  const resolvedParams = await searchParams
  const category = resolvedParams.category || ''
  const search = resolvedParams.search || ''
  const sortRaw = resolvedParams.sort || 'created_at:desc'
  const [sortField, sortOrder] = sortRaw.split(':')
  
  const supabaseServer = await createServerSupabase()
  const { data, count } = await getProducts(
    { category, search, sort: sortField, order: sortOrder, page: 1 }, 
    supabaseServer
  )

  return <CatalogContent initialProducts={data || []} initialTotal={count || 0} />
}
