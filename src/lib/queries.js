import { supabase } from './supabase'

const PAGE_SIZE = 20

// ─── Products ────────────────────────────────────────────────────────────────

const ALLOWED_SORT_COLUMNS = new Set(['created_at', 'price_kobo', 'name', 'stock'])

export async function getProducts({ category, search, sort = 'created_at', order = 'desc', page = 1 } = {}, customClient = null) {
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const safeSort = ALLOWED_SORT_COLUMNS.has(sort) ? sort : 'created_at'
  const client = customClient || supabase

  let query = client
    .from('products')
    .select('*', { count: 'exact' })
    .eq('is_active', true)

  if (category) query = query.eq('category', category)
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

export async function createProduct(productData) {
  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select()
    .single()
  return { data, error }
}

export async function updateProduct(id, productData) {
  const { data, error } = await supabase
    .from('products')
    .update(productData)
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export async function deleteProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', id)
  return { error }
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
export async function adminGetOrders({ status, page = 1 } = {}) {
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1
  let query = supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)
  query = query.range(from, to)

  const { data, error, count } = await query
  return { data, error, count }
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

export async function adminGetCustomers({ page = 1 } = {}) {
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1
  const { data, error, count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .neq('role', 'admin')
    .order('created_at', { ascending: false })
    .range(from, to)
  return { data, error, count }
}

// ─── Admin stats ─────────────────────────────────────────────────────────────

export async function adminGetStats() {
  const results = await Promise.allSettled([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin'),
    supabase.from('orders').select('total_kobo').in('status', ['processing', 'shipped', 'delivered']),
  ])

  const val = (i) => (results[i].status === 'fulfilled' ? results[i].value : {})
  const totalOrders = val(0).count ?? 0
  const pendingOrders = val(1).count ?? 0
  const totalCustomers = val(2).count ?? 0
  const revenueData = val(3).data || []
  const totalRevenueKobo = revenueData.reduce((s, r) => s + (r.total_kobo || 0), 0)

  return { totalOrders, pendingOrders, totalCustomers, totalRevenueKobo }
}
