-- Migration: initial schema
-- Created: 2026-03-31
-- Description: All tables, RLS policies, functions, and triggers for Inargy Store

-- ─── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Profiles ─────────────────────────────────────────────────────────────────
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  phone       text,
  address     text,
  role        text not null default 'customer' check (role in ('customer', 'admin')),
  created_at  timestamptz not null default now()
);

-- ─── Products ─────────────────────────────────────────────────────────────────
create table if not exists products (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  category    text,
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
  delivery_address    jsonb not null,
  payment_method      text not null default 'bank_transfer'
                        check (payment_method in ('bank_transfer','card','installment')),
  payment_reference   text unique,
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
  product_name  text not null,
  image_url     text,
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
alter table profiles    enable row level security;
alter table products    enable row level security;
alter table orders      enable row level security;
alter table order_items enable row level security;
alter table installments enable row level security;
alter table messages    enable row level security;

-- ─── Helper functions ─────────────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable
   set search_path = public;

-- ─── Policies: profiles ───────────────────────────────────────────────────────
create policy "Users can view own profile"   on profiles for select using (id = auth.uid());
create policy "Users can update own profile" on profiles for update using (id = auth.uid());
create policy "Admins can view all profiles" on profiles for select using (public.is_admin());

-- ─── Policies: products ───────────────────────────────────────────────────────
create policy "Anyone can view active products" on products for select using (is_active = true);
create policy "Admins can manage products"      on products for all   using (public.is_admin());

-- ─── Policies: orders ─────────────────────────────────────────────────────────
create policy "Users can view own orders"    on orders for select using (user_id = auth.uid());
create policy "Admins can manage all orders" on orders for all    using (public.is_admin());

-- ─── Policies: order_items ───────────────────────────────────────────────────
create policy "Users can view own order items"    on order_items for select
  using (order_id in (select id from orders where user_id = auth.uid()));
create policy "Admins can manage all order items" on order_items for all using (public.is_admin());

-- ─── Policies: installments ───────────────────────────────────────────────────
create policy "Users can view own installments"    on installments for select using (user_id = auth.uid());
create policy "Admins can manage all installments" on installments for all   using (public.is_admin());

-- ─── Policies: messages ───────────────────────────────────────────────────────
create policy "Users can view own messages"    on messages for select using (user_id = auth.uid());
create policy "Users can send messages"        on messages for insert
  with check (user_id = auth.uid() and from_admin = false);
create policy "Admins can manage all messages" on messages for all using (public.is_admin());

-- ─── Trigger: auto-create profile on signup ───────────────────────────────────
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

-- ─── Trigger: prevent role self-escalation ────────────────────────────────────
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

-- ─── RPC: place_order ─────────────────────────────────────────────────────────
create or replace function public.place_order(
  p_items jsonb,
  p_delivery_address jsonb,
  p_payment_method text default 'bank_transfer',
  p_notes text default null
)
returns jsonb as $$
declare
  v_user_id    uuid := auth.uid();
  v_order_id   uuid;
  v_total_kobo bigint := 0;
  v_item       record;
  v_product    record;
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

  if p_delivery_address is null
     or p_delivery_address->>'full_name' is null
     or p_delivery_address->>'phone' is null
     or p_delivery_address->>'address' is null then
    raise exception 'Delivery address must include full_name, phone, and address';
  end if;

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

    if p_payment_method <> 'card' then
      update products set stock = stock - v_item.quantity
       where id = v_item.product_id;
    end if;
  end loop;

  insert into orders (user_id, total_kobo, delivery_address, payment_method, notes, status)
  values (v_user_id, v_total_kobo, p_delivery_address, p_payment_method, p_notes, 'pending')
  returning id into v_order_id;

  insert into order_items (order_id, product_id, product_name, image_url, price_kobo, quantity)
  select v_order_id, x.product_id, p.name, p.image_url, p.price_kobo, x.quantity
    from jsonb_to_recordset(p_items) as x(product_id uuid, quantity int)
    join products p on p.id = x.product_id;

  if p_payment_method = 'installment' then
    insert into installments (order_id, user_id, total_kobo, months, next_due_date)
    values (v_order_id, v_user_id, v_total_kobo, 12, (current_date + interval '1 month')::date);
  end if;

  return jsonb_build_object('id', v_order_id, 'total_kobo', v_total_kobo);
end;
$$ language plpgsql security definer
   set search_path = public;

-- ─── RPC: process_confirmed_payment ───────────────────────────────────────────
create or replace function public.process_confirmed_payment(
  p_order_id          uuid,
  p_payment_reference text
)
returns jsonb as $$
declare
  v_order record;
  v_item  record;
begin
  select * into v_order
    from orders
   where id = p_order_id
     and status = 'pending'
     and payment_method = 'card'
     for update;

  if not found then
    return jsonb_build_object('ok', true, 'message', 'already_confirmed');
  end if;

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

  update orders
     set status = 'processing',
         payment_reference = p_payment_reference
   where id = p_order_id;

  return jsonb_build_object('ok', true);
end;
$$ language plpgsql security definer
   set search_path = public;
