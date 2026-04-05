import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

async function getAuthUser() {
  const headersList = await headers()
  const authHeader = headersList.get('authorization')
  const userClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: authHeader || '' } } }
  )
  const { data: { user }, error } = await userClient.auth.getUser()
  return { user, error }
}

function isRpcNotFoundError(err) {
  const msg = String(err?.message || '').toLowerCase()
  return (
    msg.includes('could not find the function') ||
    msg.includes('function') && msg.includes('does not exist') ||
    msg.includes('no function matches')
  )
}

async function confirmOrderViaRpc(supabase, orderId, reference) {
  const rpcCandidates = [
    { fn: 'process_confirmed_payment', args: { p_order_id: orderId, p_payment_reference: reference } },
    { fn: 'confirm_card_payment', args: { p_order_id: orderId, p_payment_reference: reference } },
  ]

  let lastErr = null
  for (const candidate of rpcCandidates) {
    const { data, error } = await supabase.rpc(candidate.fn, candidate.args)
    if (!error) return { data, error: null }
    lastErr = error
    if (!isRpcNotFoundError(error)) {
      return { data: null, error }
    }
  }
  return { data: null, error: lastErr }
}

export async function POST(request) {
  // 1. Authenticate the calling user
  const { user, error: authErr } = await getAuthUser()
  if (authErr || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { orderId, reference } = body
  if (!orderId || !reference) {
    return Response.json({ error: 'orderId and reference are required' }, { status: 400 })
  }

  // 2. Verify the reference is real with Paystack's API
  const paystackRes = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
  )

  if (!paystackRes.ok) {
    return Response.json({ error: 'Could not verify payment with Paystack' }, { status: 400 })
  }

  const paystackData = await paystackRes.json()
  const paystackTxn = paystackData?.data
  if (!paystackData?.status || paystackTxn?.status !== 'success') {
    return Response.json({ error: 'Payment not successful' }, { status: 400 })
  }

  const supabase = getServiceSupabase()

  // 3. Verify the order belongs to the authenticated user and is still pending
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('id, user_id, total_kobo, status, payment_method')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single()

  if (orderErr || !order) {
    return Response.json({ error: 'Order not found' }, { status: 404 })
  }

  if (order.payment_method !== 'card') {
    return Response.json({ error: 'Order does not use card payment' }, { status: 400 })
  }

  if (order.status !== 'pending') {
    // Already confirmed (webhook may have fired first) — treat as success
    return Response.json({ ok: true })
  }

  // 4. Verify amount: Paystack amount must cover the order total
  const paidAmount = Number(paystackTxn?.amount || 0)
  if (paidAmount < order.total_kobo) {
    console.error(
      `Amount mismatch on confirm: Paystack=${paidAmount}, Order=${order.total_kobo}, ref=${reference}`
    )
    return Response.json({ error: 'Payment amount is less than order total' }, { status: 400 })
  }

  // 5. Use the atomic RPC to decrement stock + confirm (single transaction)
  const { data: rpcResult, error: rpcErr } = await confirmOrderViaRpc(supabase, orderId, reference)

  if (rpcErr) {
    const message = String(rpcErr?.message || '')
    const isStockIssue = message.toLowerCase().includes('insufficient stock')
    console.error('Card payment confirmation RPC failed:', rpcErr)
    if (isStockIssue) {
      return Response.json({ error: 'Payment verified, but stock changed before confirmation.' }, { status: 409 })
    }
    return Response.json({ error: 'Failed to confirm order' }, { status: 500 })
  }

  if (!rpcResult?.ok) {
    // Order was already confirmed between our status check and the RPC call
    return Response.json({ ok: true })
  }

  return Response.json({ ok: true })
}
