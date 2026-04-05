import CatalogContent from './CatalogContent'
import { SITE } from '../../config'
import { getProducts } from '../../lib/queries'
import { createServerSupabase } from '../../lib/supabase-server'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Shop Solar Panels, Inverters & Batteries',
  description: 'Browse affordable solar energy products for Nigerian homes and businesses. Free delivery on select items.',
  alternates: { canonical: SITE.url },
}

export default async function HomePage() {
  const supabaseServer = await createServerSupabase()
  const { data, count } = await getProducts(
    { category: '', search: '', sort: 'created_at', order: 'desc', page: 1 },
    supabaseServer
  )

  return <CatalogContent initialProducts={data || []} initialTotal={count || 0} />
}
