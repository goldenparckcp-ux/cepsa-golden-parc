-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  phone text unique,
  email text, -- For Google Auth users
  avatar_url text,
  role text default 'user', -- 'user', 'admin', 'kitchen', 'staff'
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. RESTAURANT ORDERS
create table if not exists public.restaurant_orders (
  id uuid default uuid_generate_v4() primary key,
  order_number text not null,
  user_id uuid references public.profiles(id),
  customer_phone text,
  items jsonb not null, -- Stores array of items + meta (table number, takeout details)
  status text default 'pending', -- 'pending', 'preparing', 'ready', 'completed'
  subtotal numeric,
  total_price numeric,
  payment_method text default 'cash',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. SERVICE BOOKINGS (Lavage / Mecanique)
create table if not exists public.service_bookings (
  id uuid default uuid_generate_v4() primary key,
  booking_number text,
  user_id uuid references public.profiles(id),
  customer_phone text,
  service_type text, -- 'lavage', 'mecanique'
  service_name text,
  vehicle_info text,
  scheduled_at timestamp with time zone,
  status text default 'scheduled', -- 'scheduled', 'in_progress', 'completed'
  notes text,
  time_slot text, -- For timelines e.g. "10:00"
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. POOL BOOKINGS
create table if not exists public.pool_bookings (
  id uuid default uuid_generate_v4() primary key,
  booking_number text,
  user_id uuid references public.profiles(id),
  customer_phone text,
  booking_date date,
  time_slot text,
  adults int default 1,
  children int default 0,
  total_price numeric,
  status text default 'active', -- 'active', 'checked_in', 'completed'
  checked_in_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. HOTEL RESERVATIONS
create table if not exists public.hotel_reservations (
  id uuid default uuid_generate_v4() primary key,
  booking_number text,
  user_id uuid references public.profiles(id),
  customer_phone text,
  check_in_time timestamp with time zone,
  duration text, -- 'full_night', 'nap'
  room_type text,
  room_number text,
  status text default 'reserved', -- 'reserved', 'checked_in', 'checked_out'
  total_price numeric,
  checked_in_at timestamp with time zone,
  checked_out_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- ENABLE ROW LEVEL SECURITY (Optional - Allow public access for easy demo, secure later)
alter table public.profiles enable row level security;
alter table public.restaurant_orders enable row level security;
alter table public.service_bookings enable row level security;
alter table public.pool_bookings enable row level security;
alter table public.hotel_reservations enable row level security;

-- POLICIES (Allow All for now to avoid permission errors during demo)
-- Drop existing policies to avoid errors
drop policy if exists "Public Usage" on public.profiles;
drop policy if exists "Public Usage" on public.restaurant_orders;
drop policy if exists "Public Usage" on public.service_bookings;
drop policy if exists "Public Usage" on public.pool_bookings;
drop policy if exists "Public Usage" on public.hotel_reservations;

create policy "Public Usage" on public.profiles for all using (true) with check (true);
create policy "Public Usage" on public.restaurant_orders for all using (true) with check (true);
create policy "Public Usage" on public.service_bookings for all using (true) with check (true);
create policy "Public Usage" on public.pool_bookings for all using (true) with check (true);
create policy "Public Usage" on public.hotel_reservations for all using (true) with check (true);
