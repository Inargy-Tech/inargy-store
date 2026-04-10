import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'

const ALLOWED_CATEGORIES = ['solar-panels', 'inverters', 'batteries', 'controllers', 'accessories']
const ALLOWED_FIELDS = ['name', 'slug', 'category', 'description', 'image_url', 'price_kobo', 'stock', 'is_active', 'featured']

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

function validateProductUpdate(data) {
  const errors = []

  if ('name' in data) {
    if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
      errors.push('name must not be empty')
    } else if (data.name.trim().length > 200) {
      errors.push('name must be 200 characters or less')
    }
  }

  if ('slug' in data) {
    if (!data.slug || typeof data.slug !== 'string' || !data.slug.trim()) {
      errors.push('slug must not be empty')
    } else if (!/^[a-z0-9-]+$/.test(data.slug.trim())) {
      errors.push('slug must only contain lowercase letters, numbers, and hyphens')
    } else if (data.slug.trim().length > 200) {
      errors.push('slug must be 200 characters or less')
    }
  }

  if ('price_kobo' in data) {
    if (!Number.isInteger(data.price_kobo) || data.price_kobo < 0) {
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

export async function PATCH(request, { params }) {
  const user = await getAdminUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const errors = validateProductUpdate(body)
  if (errors.length > 0) return Response.json({ error: errors.join(', ') }, { status: 400 })

  // Only pick known, allowed fields to prevent mass-assignment
  const productData = {}
  for (const key of ALLOWED_FIELDS) {
    if (key in body) productData[key] = body[key]
  }

  if (Object.keys(productData).length === 0) {
    return Response.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const supabase = getServiceSupabase()
  const { data, error } = await supabase.from('products').update(productData).eq('id', id).select().single()
  if (error) return Response.json({ error: error.message || 'Failed to update product' }, { status: 500 })
  return Response.json({ data })
}

export async function DELETE(request, { params }) {
  const user = await getAdminUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const supabase = getServiceSupabase()
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) return Response.json({ error: error.message || 'Failed to delete product' }, { status: 500 })
  return Response.json({ ok: true })
}
