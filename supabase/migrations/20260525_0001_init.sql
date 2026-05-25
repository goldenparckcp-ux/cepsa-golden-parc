-- Golden Park Cepsa - Consolidated schema (app-aligned)
-- Run with Supabase SQL Editor (or Supabase CLI migrations if enabled).

create extension if not exists "uuid-ossp";

-- ==========================================
-- PROFILES
-- ==========================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  phone text unique,
  loyalty_tier text default 'silver',
  wallet_balance numeric default 0,
  partial_payment_enabled boolean default false,
  created_at timestamptz default now()
);

-- ==========================================
-- MENU
-- ==========================================
create table if not exists public.menu_items (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  price numeric not null,
  category text,
  prep_time_minutes int,
  image_url text,
  available boolean default true,
  created_at timestamptz default now()
);

-- ==========================================
-- ORDERS (Restaurant)
-- ==========================================
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  customer_phone text,
  status text not null default 'pending',
  total_amount numeric,
  notes text,
  service_type text, -- 'dine_in' | 'pre_order'
  table_number text,
  arrival_time text
);

create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade not null,
  item_name text not null,
  quantity int not null default 1,
  price numeric not null,
  image_url text,
  customizations jsonb,
  prep_time text
);

-- ==========================================
-- SERVICES (Lavage / Mecanique)
-- ==========================================
create table if not exists public.service_bookings (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  booking_number text,
  service_type text, -- 'lavage' | 'mecanique'
  service_name text,
  customer_phone text,
  vehicle_info text,
  scheduled_at timestamptz,
  time_slot text,
  status text default 'scheduled',
  notes text,
  total_price numeric default 0,
  deposit_amount numeric default 0,
  deposit_paid boolean default false,
  payment_intent_id text
);

-- ==========================================
-- POOL
-- ==========================================
create table if not exists public.pool_bookings (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  booking_number text,
  customer_phone text,
  booking_date date,
  time_slot text,
  adults int default 1,
  children int default 0,
  total_price numeric default 0,
  status text default 'active',
  checked_in_at timestamptz,
  deposit_amount numeric default 0,
  deposit_paid boolean default false,
  payment_intent_id text
);

-- ==========================================
-- HOTEL (app expects hotel_bookings)
-- ==========================================
create table if not exists public.hotel_bookings (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  booking_number text,
  customer_phone text,
  room_number text,
  check_in date,
  check_out date,
  digital_key_enabled boolean default true,
  status text default 'active',
  total_price numeric default 0,
  deposit_amount numeric default 0,
  deposit_paid boolean default false,
  payment_intent_id text
);

-- ==========================================
-- PAYMENTS / TRANSACTIONS
-- ==========================================
create table if not exists public.transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  booking_id uuid,
  booking_table text,
  amount numeric not null,
  currency text default 'MAD',
  gateway text,
  gateway_reference text,
  type text,
  status text default 'pending',
  metadata jsonb,
  created_at timestamptz default now()
);

-- ==========================================
-- RLS (demo-friendly defaults)
-- NOTE: tighten these for production.
-- ==========================================
alter table public.profiles enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.service_bookings enable row level security;
alter table public.pool_bookings enable row level security;
alter table public.hotel_bookings enable row level security;
alter table public.transactions enable row level security;

drop policy if exists "Public Usage" on public.profiles;
drop policy if exists "Public Usage" on public.menu_items;
drop policy if exists "Public Usage" on public.orders;
drop policy if exists "Public Usage" on public.order_items;
drop policy if exists "Public Usage" on public.service_bookings;
drop policy if exists "Public Usage" on public.pool_bookings;
drop policy if exists "Public Usage" on public.hotel_bookings;
drop policy if exists "Public Usage" on public.transactions;

create policy "Public Usage" on public.profiles for all using (true) with check (true);
create policy "Public Usage" on public.menu_items for all using (true) with check (true);
create policy "Public Usage" on public.orders for all using (true) with check (true);
create policy "Public Usage" on public.order_items for all using (true) with check (true);
create policy "Public Usage" on public.service_bookings for all using (true) with check (true);
create policy "Public Usage" on public.pool_bookings for all using (true) with check (true);
create policy "Public Usage" on public.hotel_bookings for all using (true) with check (true);
create policy "Public Usage" on public.transactions for all using (true) with check (true);

