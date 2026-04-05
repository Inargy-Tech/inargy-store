import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
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
  // 1. Verify Paystack signature
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret) {
    console.error('PAYSTACK_SECRET_KEY not configured')
    return Response.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const body = await request.text()
  const signature = request.headers.get('x-paystack-signature')

  const hash = crypto.createHmac('sha512', secret).update(body).digest('hex')

  if (hash !== signature) {
    console.error('Invalid Paystack webhook signature')
    return Response.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // 2. Parse the event
  let event
  try {
    event = JSON.parse(body)
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // 3. Handle charge.success event
  if (event.event === 'charge.success') {
    const { reference, metadata, amount, currency } = event.data

    if (currency !== 'NGN') {
      return Response.json({ ok: true, message: 'Ignored non-NGN transaction' })
    }

    const orderId = metadata?.order_id
    if (!orderId) {
      console.error('No order_id in Paystack metadata:', reference)
      return Response.json({ ok: true, message: 'No order_id in metadata' })
    }

    const supabase = getServiceSupabase()

    // Fetch the order to validate amount before confirming
    const { data: order, error: fetchErr } = await supabase
      .from('orders')
      .select('id, status, total_kobo, payment_method')
      .eq('id', orderId)
      .single()

    if (fetchErr || !order) {
      console.error('Order not found for webhook:', orderId)
      return Response.json({ ok: true, message: 'Order not found' })
    }

    if (order.status !== 'pending') {
      return Response.json({ ok: true, message: 'Order already processed' })
    }

    if (order.payment_method !== 'card') {
      return Response.json({ ok: true, message: 'Not a card order' })
    }

    // Allow Paystack to charge >= order total (covers customer-borne fee configurations).
    // Reject only if they paid less than the order amount.
    if (amount < order.total_kobo) {
      console.error(`Amount too low: Paystack=${amount}, Order=${order.total_kobo}, ref=${reference}`)
      return Response.json({ ok: true, message: 'Amount below order total' })
    }

    // Atomically decrement stock + confirm the order via the service RPC
    const { data: rpcResult, error: rpcErr } = await confirmOrderViaRpc(supabase, orderId, reference)

    if (rpcErr) {
      console.error('Card payment confirmation RPC failed for webhook:', rpcErr)
      return Response.json({ error: 'Update failed' }, { status: 500 })
    }

    console.log(`Payment confirmed for order ${orderId}: ${reference} (${rpcResult?.message || 'ok'})`)
  }

  // Return 200 for all events (Paystack expects this)
  return Response.json({ ok: true })
}
