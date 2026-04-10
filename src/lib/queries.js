import { supabase } from './supabase'

const PAGE_SIZE = 20

// ─── Products ────────────────────────────────────────────────────────────────

const ALLOWED_SORT_COLUMNS = new Set(['created_at', 'price_kobo', 'name', 'stock'])

export async function getFeaturedProducts(customClient = null) {
  const client = customClient || supabase
  const { data, error } = await client
    .from('products')
    .select('id, slug, name, image_url, category, price_kobo, stock, is_active, featured')
    .eq('is_active', true)
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(8)
  return { data, error }
}

export async function getProducts({ category, search, sort = 'created_at', order = 'desc', page = 1, featured } = {}, customClient = null) {
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const safeSort = ALLOWED_SORT_COLUMNS.has(sort) ? sort : 'created_at'
  const client = customClient || supabase

  let query = client
    .from('products')
    .select('id, slug, name, image_url, category, price_kobo, stock, is_active, featured, created_at', { count: 'exact' })
    .eq('is_active', true)

  if (featured) query = query.eq('featured', true)
  else if (category) query = query.eq('category', category)
  if (search) query = query.ilike('name', `%${search}%`)
  query = query.order(safeSort, { ascending: order === 'asc' }).range(from, to)

  const { data, error, count } = await query
  return { data, error, count }
}

export async function getProductBySlug(slug) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  return { data, error }
}

// Admin: all products including inactive
export async function adminGetProducts({ search, page = 1 } = {}) {
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1
  let query = supabase.from('products').select('*', { count: 'exact' }).order('created_at', { ascending: false })
  if (search) query = query.ilike('name', `%${search}%`)
  query = query.range(from, to)
  const { data, error, count } = await query
  return { data, error, count }
}

export async function adminGetProductById(id) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()
  return { data, error }
}

async function getAdminAuthHeader() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ? `Bearer ${session.access_token}` : ''
}

export async function createProduct(productData) {
  const authorization = await getAdminAuthHeader()
  const res = await fetch('/api/admin/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: authorization },
    body: JSON.stringify(productData),
  })
  const result = await res.json()
  if (!res.ok) return { data: null, error: { message: result.error || 'Request failed' } }
  return { data: result.data, error: null }
}

export async function updateProduct(id, productData) {
  const authorization = await getAdminAuthHeader()
  const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: authorization },
    body: JSON.stringify(productData),
  })
  const result = await res.json()
  if (!res.ok) return { data: null, error: { message: result.error || 'Request failed' } }
  return { data: result.data, error: null }
}

export async function deleteProduct(id) {
  const authorization = await getAdminAuthHeader()
  const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: authorization },
  })
  const result = await res.json()
  if (!res.ok) return { error: { message: result.error || 'Request failed' } }
  return { error: null }
}

export async function uploadProductImage(file) {
  const ext = file.name.split('.').pop()
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) return { url: null, error }
  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(data.path)
  return { url: publicUrl, error: null }
}

export async function getProductsByIds(ids) {
  if (!ids || ids.length === 0) return { data: [], error: null }
  const { data, error } = await supabase
    .from('products')
    .select('id, name, stock, is_active')
    .in('id', ids)
  return { data, error }
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function createOrder({ items, deliveryAddress, paymentMethod, notes }) {
  const { data, error } = await supabase.rpc('place_order', {
    p_items: items.map((item) => ({ product_id: item.id, quantity: item.quantity })),
    p_delivery_address: deliveryAddress,
    p_payment_method: paymentMethod,
    p_notes: notes || null,
  })
  return { data, error }
}

export async function getOrders(userId) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function getOrderById(id, userId) {
  let query = supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)

  if (userId) query = query.eq('user_id', userId)

  const { data, error } = await query.single()
  return { data, error }
}

export async function adminGetOrderById(id) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .single()
  return { data, error }
}

// Admin: all orders
export async function adminGetOrders({ status, page = 1, search } = {}) {
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  if (search) {
    const term = search.trim().replace(/^#/, '').toLowerCase()
    if (!term) {
      // fall through to normal query below
    } else if (term.includes('@')) {
      // Email search: find matching user IDs from profiles, then fetch their orders
      const { data: matchedProfiles } = await supabase
        .from('profiles')
        .select('id')
        .ilike('email', `%${term}%`)
        .limit(50)
      const userIds = (matchedProfiles || []).map((p) => p.id)
      if (!userIds.length) return { data: [], error: null, count: 0 }
      let q = supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .in('user_id', userIds)
        .order('created_at', { ascending: false })
      if (status) q = q.eq('status', status)
      q = q.range(from, to)
      return await q
    } else {
      // Search by order ID prefix and phone number in parallel, then deduplicate
      const base = () => {
        let q = supabase.from('orders').select('*').order('created_at', { ascending: false })
        if (status) q = q.eq('status', status)
        return q
      }
      const [idRes, phoneRes] = await Promise.all([
        base().filter('id::text', 'ilike', `${term}%`).limit(PAGE_SIZE),
        base().filter('delivery_address->>phone', 'ilike', `%${term}%`).limit(PAGE_SIZE),
      ])
      const seen = new Set()
      const data = []
      for (const row of [...(idRes.data || []), ...(phoneRes.data || [])]) {
        if (!seen.has(row.id)) { seen.add(row.id); data.push(row) }
      }
      return { data, error: idRes.error || phoneRes.error || null, count: data.length }
    }
  }

  let query = supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)
  query = query.range(from, to)

  const { data, error, count } = await query
  return { data, error, count }
}

export async function cancelOrder(orderId) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', orderId)
    .select()
    .single()
  return { data, error }
}

export async function updateOrderStatus(id, status) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

// ─── Installments ─────────────────────────────────────────────────────────────

export async function getInstallments(userId) {
  const { data, error } = await supabase
    .from('installments')
    .select('*, orders(id, created_at, delivery_address)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function adminGetInstallments({ status, page = 1 } = {}) {
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1
  let query = supabase
    .from('installments')
    .select('*, orders(id, created_at), profiles(full_name)', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)
  query = query.range(from, to)
  const { data, error, count } = await query
  return { data, error, count }
}

export async function updateInstallmentStatus(id, fields) {
  const { data, error } = await supabase
    .from('installments')
    .update(fields)
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

// ─── Messages ────────────────────────────────────────────────────────────────

export async function getMessages(userId) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function sendMessage({ userId, subject, body, parentId = null }) {
  const session = await supabase.auth.getSession()
  const token = session?.data?.session?.access_token

  const res = await fetch('/api/messages/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId, subject, body, parentId }),
  })

  let result
  try {
    result = await res.json()
  } catch {
    return { data: null, error: { message: 'Unexpected server response' } }
  }
  if (!res.ok) return { data: null, error: { message: result.error || 'Request failed' } }
  return { data: result.data, error: null }
}

export async function markMessageRead(id) {
  const { error } = await supabase.from('messages').update({ read: true }).eq('id', id)
  return { error }
}

export async function adminGetMessages({ unreadOnly = false, page = 1 } = {}) {
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('messages')
    .select('*, profiles(full_name)', { count: 'exact' })
    .order('created_at', { ascending: false })

  // When unreadOnly, only show unread customer messages (not admin's own replies)
  if (unreadOnly) query = query.eq('read', false).eq('from_admin', false)

  query = query.range(from, to)
  const { data, error, count } = await query
  return { data, error, count }
}

// ─── Profiles ─────────────────────────────────────────────────────────────────

export async function updateProfile(userId, fields) {
  const { role, ...safeFields } = fields
  const { data, error } = await supabase
    .from('profiles')
    .update(safeFields)
    .eq('id', userId)
    .select()
    .single()
  return { data, error }
}

export async function adminGetCustomers({ search, page = 1 } = {}) {
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1
  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .neq('role', 'admin')
    .order('created_at', { ascending: false })
  if (search) query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`)
  query = query.range(from, to)
  const { data, error, count } = await query
  return { data, error, count }
}

// ─── Admin stats ─────────────────────────────────────────────────────────────

export async function adminGetStats() {
  const client = supabase
  const results = await Promise.allSettled([
    client.from('orders').select('*', { count: 'exact', head: true }),
    client.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    client.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin'),
    client.from('orders').select('total_kobo').in('status', ['processing', 'shipped', 'delivered']),
  ])

  const val = (i) => (results[i].status === 'fulfilled' ? results[i].value : {})
  const totalOrders = val(0).count ?? 0
  const pendingOrders = val(1).count ?? 0
  const totalCustomers = val(2).count ?? 0
  const revenueData = val(3).data || []
  const totalRevenueKobo = revenueData.reduce((s, r) => s + (r.total_kobo || 0), 0)

  return { totalOrders, pendingOrders, totalCustomers, totalRevenueKobo }
}
