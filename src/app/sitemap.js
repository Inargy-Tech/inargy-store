import { createServerSupabase } from '../lib/supabase-server'

export const revalidate = 3600

const BASE_URL = 'https://store.inargy.tech'

export default async function sitemap() {
  const supabase = createServerSupabase()
  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('is_active', true)

  const productPages = (products || []).map((p) => ({
    url: `${BASE_URL}/product/${p.slug}`,
    lastModified: p.updated_at || new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [
    { url: BASE_URL, lastModified: new Date().toISOString(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/catalog`, lastModified: new Date().toISOString(), changeFrequency: 'daily', priority: 0.9 },
    ...productPages,
  ]
}
