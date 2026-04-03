import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "node:crypto";

const PAYSTACK_SECRET = Deno.env.get("PAYSTACK_SECRET_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function verifySignature(body: string, signature: string): boolean {
  const hash = createHmac("sha512", PAYSTACK_SECRET)
    .update(body)
    .digest("hex");
  return hash === signature;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const body = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";

  if (!verifySignature(body, signature)) {
    return new Response("Invalid signature", { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(body);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (event.event !== "charge.success") {
    return new Response("OK", { status: 200 });
  }

  const { reference, amount, currency, metadata } = event.data;

  if (currency !== "NGN") {
    return new Response("OK", { status: 200 });
  }

  const orderId = metadata?.order_id;

  if (!orderId) {
    console.error("Webhook missing order_id in metadata", { reference });
    return new Response("OK", { status: 200 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("id, total_kobo, status, payment_method")
    .eq("id", orderId)
    .single();

  if (fetchError || !order) {
    console.error("Order not found for webhook", { orderId, fetchError });
    return new Response("OK", { status: 200 });
  }

  if (order.payment_method !== "card") {
    console.warn("Webhook for non-card order", { orderId });
    return new Response("OK", { status: 200 });
  }

  if (order.status !== "pending") {
    return new Response("OK", { status: 200 });
  }

  if (amount < order.total_kobo) {
    console.error("Amount too low", {
      orderId,
      expected: order.total_kobo,
      received: amount,
      reference,
    });
    return new Response("OK", { status: 200 });
  }

  const { data: rpcResult, error: rpcError } = await supabase.rpc(
    "process_confirmed_payment",
    { p_order_id: orderId, p_payment_reference: reference },
  );

  if (rpcError) {
    console.error("process_confirmed_payment failed", {
      orderId,
      rpcError,
    });
    return new Response("Update failed", { status: 500 });
  }

  console.log("Payment confirmed", {
    orderId,
    reference,
    result: rpcResult?.message ?? "ok",
  });

  return new Response("OK", { status: 200 });
});
