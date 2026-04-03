import { createServerSupabase } from '../lib/supabase-server'

const SITE_URL = 'https://store.inargy.tech'

export const revalidate = 3600

export default async function sitemap() {
  const staticPages = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/catalog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  ]

  // Fetch active product slugs
  let productPages = []
  try {
    const supabase = await createServerSupabase()
    const { data } = await supabase
      .from('products')
      .select('slug, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    productPages = (data || []).map((p) => ({
      url: `${SITE_URL}/product/${p.slug}`,
      lastModified: new Date(p.created_at),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))
  } catch {
    // Silently fail — return static pages only
  }

  return [...staticPages, ...productPages]
}
