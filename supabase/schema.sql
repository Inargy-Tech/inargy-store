-- ─── Inargy Store — Supabase Schema ─────────────────────────────────────────
-- Run this in the Supabase SQL editor to set up all required tables.
-- Enable Row Level Security (RLS) on all tables after creation.

-- ─── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Profiles ─────────────────────────────────────────────────────────────────
-- Created automatically when a user signs up via a trigger.
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  phone       text,
  address     text,
  role        text not null default 'customer' check (role in ('customer', 'admin')),
  created_at  timestamptz not null default now()
);

-- Trigger: create profile row on new auth user
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$ language plpgsql security definer
   set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Products ─────────────────────────────────────────────────────────────────
create table if not exists products (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  category    text,                        -- 'solar-panels' | 'inverters' | 'batteries' | 'controllers' | 'accessories'
  description text,
  image_url   text,
  price_kobo  bigint not null check (price_kobo >= 0),
  stock       integer not null default 0 check (stock >= 0),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists products_category_idx on products(category);
create index if not exists products_slug_idx on products(slug);
create index if not exists products_is_active_idx on products(is_active);

-- ─── Orders ──────────────────────────────────────────────────────────────────
create table if not exists orders (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references profiles(id) on delete restrict,
  status              text not null default 'pending'
                        check (status in ('pending','processing','shipped','delivered','cancelled')),
  total_kobo          bigint not null check (total_kobo >= 0),
  delivery_address    jsonb not null,          -- {full_name, phone, address, city, state}
  payment_method      text not null default 'bank_transfer'
                        check (payment_method in ('bank_transfer','card','installment')),
  payment_reference   text unique,             -- Paystack transaction reference (card payments)
  notes               text,
  created_at          timestamptz not null default now()
);

create index if not exists orders_user_id_idx on orders(user_id);
create index if not exists orders_status_idx on orders(status);
create index if not exists orders_created_at_idx on orders(created_at desc);

-- ─── Order Items ─────────────────────────────────────────────────────────────
create table if not exists order_items (
  id            uuid primary key default uuid_generate_v4(),
  order_id      uuid not null references orders(id) on delete cascade,
  product_id    uuid references products(id) on delete set null,
  product_name  text not null,               -- denormalised snapshot
  image_url     text,                        -- denormalised snapshot
  price_kobo    bigint not null check (price_kobo >= 0),
  quantity      integer not null check (quantity > 0)
);

create index if not exists order_items_order_id_idx on order_items(order_id);

-- ─── Installments ─────────────────────────────────────────────────────────────
create table if not exists installments (
  id             uuid primary key default uuid_generate_v4(),
  order_id       uuid not null references orders(id) on delete cascade,
  user_id        uuid not null references profiles(id) on delete restrict,
  total_kobo     bigint not null check (total_kobo >= 0),
  paid_kobo      bigint not null default 0 check (paid_kobo >= 0),
  months         integer not null default 12 check (months > 0),
  status         text not null default 'active'
                   check (status in ('active','paid','overdue')),
  next_due_date  date,
  created_at     timestamptz not null default now()
);

create index if not exists installments_user_id_idx on installments(user_id);
create index if not exists installments_status_idx on installments(status);

-- ─── Messages ────────────────────────────────────────────────────────────────
create table if not exists messages (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  subject     text not null default 'General Enquiry',
  body        text not null,
  from_admin  boolean not null default false,
  read        boolean not null default false,
  parent_id   uuid references messages(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists messages_user_id_idx on messages(user_id);
create index if not exists messages_from_admin_idx on messages(from_admin);
create index if not exists messages_read_idx on messages(read);

-- ─── Row Level Security ──────────────────────────────────────────────────────
-- Enable RLS on all tables
alter table profiles   enable row level security;
alter table products   enable row level security;
alter table orders     enable row level security;
alter table order_items enable row level security;
alter table installments enable row level security;
alter table messages   enable row level security;

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable
   set search_path = public;

-- Profiles policies
create policy "Users can view own profile"   on profiles for select using (id = auth.uid());
create policy "Users can update own profile" on profiles for update using (id = auth.uid());
create policy "Admins can view all profiles" on profiles for select using (public.is_admin());

-- Products policies
create policy "Anyone can view active products"  on products for select using (is_active = true);
create policy "Admins can manage products"       on products for all using (public.is_admin());

-- Orders policies
-- No direct insert policy for customers: orders must go through place_order() RPC
-- which runs as SECURITY DEFINER and validates pricing/stock server-side.
create policy "Users can view own orders"    on orders for select using (user_id = auth.uid());
create policy "Admins can manage all orders" on orders for all using (public.is_admin());

-- Order items policies
-- No direct insert policy for customers: order items are created by place_order().
create policy "Users can view own order items" on order_items for select
  using (order_id in (select id from orders where user_id = auth.uid()));
create policy "Admins can manage all order items" on order_items for all using (public.is_admin());

-- Installments policies
create policy "Users can view own installments"    on installments for select using (user_id = auth.uid());
create policy "Admins can manage all installments" on installments for all using (public.is_admin());

-- Messages policies
create policy "Users can view own messages"    on messages for select using (user_id = auth.uid());
create policy "Users can send messages"        on messages for insert with check (user_id = auth.uid() and from_admin = false);
create policy "Admins can manage all messages" on messages for all using (public.is_admin());

-- ─── Secure order placement RPC ──────────────────────────────────────────────
-- Accepts only product IDs + quantities; recomputes prices from `products`,
-- validates stock, decrements it atomically, and creates the order + items
-- (plus an installment plan when payment_method = 'installment').
create or replace function public.place_order(
  p_items jsonb,
  p_delivery_address jsonb,
  p_payment_method text default 'bank_transfer',
  p_notes text default null
)
returns jsonb as $$
declare
  v_user_id uuid := auth.uid();
  v_order_id uuid;
  v_total_kobo bigint := 0;
  v_item record;
  v_product record;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Order must contain at least one item';
  end if;

  if p_payment_method not in ('bank_transfer', 'card', 'installment') then
    raise exception 'Invalid payment method';
  end if;

  -- Validate required delivery address fields
  if p_delivery_address is null
     or p_delivery_address->>'full_name' is null
     or p_delivery_address->>'phone' is null
     or p_delivery_address->>'address' is null
     or p_delivery_address->>'city' is null
     or p_delivery_address->>'state' is null then
    raise exception 'Delivery address must include full_name, phone, address, city, and state';
  end if;

  -- Lock each product row, validate availability, accumulate total.
  -- For card payments, stock is reserved but not decremented until payment is confirmed.
  for v_item in select * from jsonb_to_recordset(p_items) as x(product_id uuid, quantity int)
  loop
    select * into v_product
      from products
     where id = v_item.product_id and is_active = true
       for update;

    if not found then
      raise exception 'Product % is unavailable', v_item.product_id;
    end if;

    if v_item.quantity <= 0 then
      raise exception 'Quantity must be at least 1';
    end if;

    if v_product.stock < v_item.quantity then
      raise exception 'Insufficient stock for "%" (available: %, requested: %)',
        v_product.name, v_product.stock, v_item.quantity;
    end if;

    v_total_kobo := v_total_kobo + (v_product.price_kobo * v_item.quantity);

    -- Decrement stock immediately for non-card payments.
    -- Card orders decrement on payment confirmation via process_confirmed_payment().
    if p_payment_method <> 'card' then
      update products set stock = stock - v_item.quantity
       where id = v_item.product_id;
    end if;
  end loop;

  -- Create order
  insert into orders (user_id, total_kobo, delivery_address, payment_method, notes, status)
  values (v_user_id, v_total_kobo, p_delivery_address, p_payment_method, p_notes, 'pending')
  returning id into v_order_id;

  -- Create order items with denormalised product snapshots
  insert into order_items (order_id, product_id, product_name, image_url, price_kobo, quantity)
  select v_order_id, x.product_id, p.name, p.image_url, p.price_kobo, x.quantity
    from jsonb_to_recordset(p_items) as x(product_id uuid, quantity int)
    join products p on p.id = x.product_id;

  -- Auto-create installment plan when paying by installment
  if p_payment_method = 'installment' then
    insert into installments (order_id, user_id, total_kobo, months, next_due_date)
    values (v_order_id, v_user_id, v_total_kobo, 12, (current_date + interval '1 month')::date);
  end if;

  return jsonb_build_object('id', v_order_id, 'total_kobo', v_total_kobo);
end;
$$ language plpgsql security definer
   set search_path = public;

-- ─── Card payment confirmation ────────────────────────────────────────────────
-- All card payment confirmations go through process_confirmed_payment() below,
-- which is called by server-side API routes (webhook + confirm) that verify
-- payment with Paystack before invoking it.  There is no client-callable RPC
-- for confirming card payments — this prevents users from faking references.

-- ─── Service-role payment confirmation RPC ───────────────────────────────────
-- Called by the /api/paystack/confirm route and the webhook handler (both run
-- with the service role key, so auth.uid() is not available).
-- Atomically: checks the order is still pending, decrements stock, confirms.
create or replace function public.process_confirmed_payment(
  p_order_id uuid,
  p_payment_reference text
)
returns jsonb as $$
declare
  v_order record;
  v_item  record;
begin
  -- Lock the order row; abort if it is no longer pending
  select * into v_order
    from orders
   where id = p_order_id
     and status = 'pending'
     and payment_method = 'card'
     for update;

  if not found then
    -- Already confirmed (webhook / client race) — idempotent success
    return jsonb_build_object('ok', true, 'message', 'already_confirmed');
  end if;

  -- Decrement stock for each order item; abort if any product has insufficient stock
  for v_item in
    select oi.product_id, oi.product_name, oi.quantity
      from order_items oi
     where oi.order_id = p_order_id
  loop
    update products
       set stock = stock - v_item.quantity
     where id = v_item.product_id
       and stock >= v_item.quantity;

    if not found then
      raise exception 'Insufficient stock for "%" (order %) — payment received but cannot fulfil',
        v_item.product_name, p_order_id;
    end if;
  end loop;

  -- Confirm the order
  update orders
     set status = 'processing',
         payment_reference = p_payment_reference
   where id = p_order_id;

  return jsonb_build_object('ok', true);
end;
$$ language plpgsql security definer
   set search_path = public;

-- ─── Prevent customers from escalating their own role ────────────────────────
create or replace function public.protect_role_field()
returns trigger as $$
begin
  -- auth.uid() is null when called from service role or SQL editor — allow it
  if auth.uid() is not null
     and new.role is distinct from old.role
     and not public.is_admin() then
    raise exception 'Only admins can change user roles';
  end if;
  return new;
end;
$$ language plpgsql security definer
   set search_path = public;

drop trigger if exists protect_role_update on profiles;
create trigger protect_role_update
  before update on profiles
  for each row execute function public.protect_role_field();

-- ─── Sample seed data (optional) ─────────────────────────────────────────────
-- Uncomment and run to populate your store with sample products.
--
-- insert into products (name, slug, category, description, price_kobo, stock) values
--   ('400W Monocrystalline Solar Panel', '400w-mono-solar-panel', 'solar-panels',
--    'High-efficiency monocrystalline silicon panel. 400W peak output. IP67 rated. 25-year power output warranty.',
--    15000000, 50),
--   ('5kVA Hybrid Inverter', '5kva-hybrid-inverter', 'inverters',
--    'Pure sine wave hybrid inverter with built-in MPPT solar charge controller. Supports lithium and AGM batteries.',
--    42000000, 20),
--   ('200Ah LiFePO4 Battery', '200ah-lifepo4-battery', 'batteries',
--    'Lithium Iron Phosphate deep cycle battery. 6000+ cycle life. Built-in BMS. 5-year warranty.',
--    38000000, 30),
--   ('60A MPPT Solar Charge Controller', '60a-mppt-controller', 'controllers',
--    'Maximum Power Point Tracking controller. 12/24/48V auto-detect. LCD display. Bluetooth monitoring.',
--    8500000, 40)
-- on conflict (slug) do nothing;
