import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'

const ALLOWED_CATEGORIES = ['solar-panels', 'inverters', 'batteries', 'controllers', 'accessories']
const PAGE_SIZE = 20

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

async function getAdminUser() {
  const headersList = await headers()
  const authHeader = headersList.get('authorization')

  const userClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: authHeader || '' } } }
  )

  const { data: { user }, error } = await userClient.auth.getUser()
  if (error || !user) return null

  const { data: profile } = await getServiceSupabase()
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === 'admin' ? user : null
}

function validateProduct(data, isCreate = false) {
  const errors = []

  if (isCreate || 'name' in data) {
    if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
      errors.push('name is required')
    } else if (data.name.trim().length > 200) {
      errors.push('name must be 200 characters or less')
    }
  }

  if (isCreate || 'slug' in data) {
    if (!data.slug || typeof data.slug !== 'string' || !data.slug.trim()) {
      errors.push('slug is required')
    } else if (!/^[a-z0-9-]+$/.test(data.slug.trim())) {
      errors.push('slug must only contain lowercase letters, numbers, and hyphens')
    } else if (data.slug.trim().length > 200) {
      errors.push('slug must be 200 characters or less')
    }
  }

  if (isCreate || 'price_kobo' in data) {
    if (data.price_kobo === undefined || data.price_kobo === null) {
      errors.push('price_kobo is required')
    } else if (!Number.isInteger(data.price_kobo) || data.price_kobo < 0) {
      errors.push('price_kobo must be a non-negative integer')
    }
  }

  if ('category' in data && data.category != null) {
    if (!ALLOWED_CATEGORIES.includes(data.category)) {
      errors.push(`category must be one of: ${ALLOWED_CATEGORIES.join(', ')}`)
    }
  }

  if ('description' in data && data.description != null) {
    if (typeof data.description !== 'string') {
      errors.push('description must be a string')
    } else if (data.description.length > 5000) {
      errors.push('description must be 5000 characters or less')
    }
  }

  if ('stock' in data && data.stock != null) {
    if (!Number.isInteger(data.stock) || data.stock < 0) {
      errors.push('stock must be a non-negative integer')
    }
  }

  if ('image_url' in data && data.image_url != null) {
    if (typeof data.image_url !== 'string' || data.image_url.length > 500) {
      errors.push('image_url must be a string of 500 characters or less')
    }
  }

  if ('featured' in data && data.featured != null) {
    if (typeof data.featured !== 'boolean') {
      errors.push('featured must be a boolean')
    }
  }

  return errors
}

export async function GET(request) {
  const user = await getAdminUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = getServiceSupabase()
  let query = supabase.from('products').select('*', { count: 'exact' }).order('created_at', { ascending: false })
  if (search) query = query.ilike('name', `%${search}%`)
  query = query.range(from, to)

  const { data, error, count } = await query
  if (error) return Response.json({ error: 'Failed to fetch products' }, { status: 500 })
  return Response.json({ data, count })
}

export async function POST(request) {
  const user = await getAdminUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const errors = validateProduct(body, true)
  if (errors.length > 0) return Response.json({ error: errors.join(', ') }, { status: 400 })

  const productData = {
    name: body.name.trim(),
    slug: body.slug.trim(),
    category: body.category || null,
    description: body.description?.trim() || null,
    image_url: body.image_url?.trim() || null,
    price_kobo: body.price_kobo,
    stock: body.stock ?? 0,
    is_active: body.is_active ?? true,
    featured: body.featured ?? false,
  }

  const supabase = getServiceSupabase()
  const { data, error } = await supabase.from('products').insert([productData]).select().single()
  if (error) return Response.json({ error: error.message || 'Failed to create product' }, { status: 500 })
  return Response.json({ data }, { status: 201 })
}
