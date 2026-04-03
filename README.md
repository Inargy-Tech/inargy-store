# Inargy Store

Ecommerce storefront for solar energy products, built with Next.js 15 (App Router) and Supabase.

## Stack

- **Framework:** Next.js 15, React 19, App Router with hybrid rendering
- **Styling:** Tailwind CSS 4, HeroUI, Lucide icons
- **Backend:** Supabase (Auth, Postgres with RLS, RPCs, Edge Functions)
- **Payments:** Paystack (inline popup + webhook)

## Getting started

### 1. Create a Supabase project

Sign up at [supabase.com](https://supabase.com) and create a new project. Copy the **Project URL** and **anon public** key from Settings > API.

### 2. Configure environment variables

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL (e.g. `https://abc123.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | The `anon` / `public` API key from your Supabase dashboard |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Your Paystack **public** key (starts with `pk_test_` or `pk_live_`) |

### 3. Apply the database schema

Open the **SQL Editor** in your Supabase dashboard and run the contents of [`supabase/schema.sql`](supabase/schema.sql). This creates all tables, indexes, Row Level Security policies, triggers, and the `place_order` RPC.

To populate sample products, uncomment the seed insert at the bottom of the schema file and run it.

### 4. Create an admin user

1. Sign up through the app (or create a user in the Supabase Auth dashboard).
2. In the Supabase **Table Editor**, find the user's row in the `profiles` table and set `role` to `admin`.

Admin promotion is deliberately manual — the `protect_role_field` trigger prevents customers from escalating their own role via the client.

### 5. Install and run

```bash
npm install
npm run dev
```

The app runs on [http://localhost:3000](http://localhost:3000) by default.

## Architecture

### Rendering strategy

The app uses a hybrid rendering approach with Next.js App Router:

- **Server Components** for public pages (`/`, `/catalog`, `/product/[slug]`) — better SEO and initial load performance
- **Client Components** for authenticated areas (`/dashboard/*`, `/admin/*`, `/checkout`, `/auth/*`) — full interactivity with auth context

### Route structure

```
src/app/
  layout.jsx              — root layout with Providers (Auth + Cart contexts)
  not-found.jsx           — 404 page

  (storefront)/           — route group (no URL segment)
    layout.jsx            — StoreNavbar + StoreFooter + CartDrawer
    page.jsx              — / (catalog)
    catalog/page.jsx      — /catalog
    product/[slug]/page.jsx — /product/:slug (server-rendered)
    checkout/page.jsx     — /checkout (client, protected)

  auth/
    login/page.jsx
    signup/page.jsx
    reset-password/page.jsx
    update-password/page.jsx

  dashboard/
    layout.jsx            — protected, with CustomerSidebar
    orders/page.jsx
    orders/[id]/page.jsx
    installments/page.jsx
    messages/page.jsx
    profile/page.jsx

  admin/
    layout.jsx            — protected + adminOnly, with AdminSidebar
    page.jsx              — dashboard
    products/page.jsx
    products/new/page.jsx
    products/[id]/page.jsx
    orders/page.jsx
    orders/[id]/page.jsx
    customers/page.jsx
    installments/page.jsx
    messages/page.jsx
    settings/page.jsx
```

### Security model

All data access goes through the Supabase client with Row Level Security enforced at the database level:

- **Products** are publicly readable when `is_active = true`. Only admins can create, update, or delete.
- **Orders / order items** are scoped to the owning user for reads and inserts. Admins have full access.
- **Installments** are read-only for customers; admins manage them.
- **Messages** follow a similar owner-scoped pattern with admin override.
- **Profiles** can be updated by their owner, but the `role` column is protected by a trigger — only admins can change roles.

### Order placement

Orders are created through the `place_order` Postgres RPC rather than direct inserts from the client. The RPC:

- Accepts only product IDs and quantities (not prices)
- Looks up current prices from the `products` table
- Validates stock availability and decrements it atomically (row-locked)
- Creates the order and order items in a single transaction
- Auto-creates an installment plan when `payment_method = 'installment'`

This prevents price tampering and overselling.

### Payment methods

| Method | Status |
|---|---|
| **Bank Transfer** | Active — order is placed, then payment is arranged offline. The admin updates order status after confirming payment. |
| **Monthly Installment** | Active — creates a 12-month installment plan automatically. |
| **Card (Paystack)** | Active — Paystack popup opens after order creation. On successful payment the order moves to `processing` automatically. |

### Paystack integration

Card payments use the [Paystack Popup](https://paystack.com/docs/payments/accept-payments/#popup) flow:

1. User selects "Debit / Credit Card" at checkout and clicks **Pay Now**.
2. The `place_order` RPC creates the order as `pending` (stock is reserved).
3. The Paystack inline popup opens with the server-computed total.
4. On successful payment, the client calls the `confirm_card_payment` RPC which stores the Paystack reference and sets the order status to `processing`.
5. Paystack also sends a `charge.success` webhook to the Edge Function at `supabase/functions/paystack-webhook/`, which independently verifies the payment signature + amount and updates the order as a safety net.

If the user closes the Paystack popup without paying, the order remains `pending` and the cart is cleared. The admin can cancel or the user can contact support.

#### Setting up the webhook

1. Deploy the Edge Function:

```bash
supabase functions deploy paystack-webhook --no-verify-jwt
```

2. Set the secret key as a Supabase secret:

```bash
supabase secrets set PAYSTACK_SECRET_KEY=sk_live_xxxxx
```

3. In your [Paystack Dashboard](https://dashboard.paystack.com/#/settings/developer) > Settings > API Keys & Webhooks, set the webhook URL to:

```
https://<your-project-ref>.supabase.co/functions/v1/paystack-webhook
```

The `--no-verify-jwt` flag is required because Paystack's webhook requests don't carry a Supabase JWT. The function validates authenticity via the `x-paystack-signature` HMAC header instead.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build to `.next/` |
| `npm run start` | Serve the production build |
| `npm run lint` | Run Next.js lint |
