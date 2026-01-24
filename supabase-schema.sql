-- CEPSA GOLDEN PARK - COMPLETE DATABASE SCHEMA
-- Run this in your Supabase SQL Editor

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. STAFF & AUTHENTICATION
-- ==========================================
create table public.staff (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null,
    phone text not null unique,
    pin_code text not null, -- In production, hash this!
    role text not null check (role in ('admin', 'kitchen', 'services', 'hotel')),
    avatar_color text default 'bg-blue-600'
);

-- Seed Staff Data
insert into public.staff (name, phone, pin_code, role, avatar_color) values
('Admin Master', '+212600000000', '0000', 'admin', 'bg-red-600'),
('Chef Ahmed', '+212600000001', '0000', 'kitchen', 'bg-yellow-600'),
('Service Manager', '+212600000002', '0000', 'services', 'bg-blue-600'),
('Receptionist', '+212600000003', '0000', 'hotel', 'bg-purple-600')
on conflict (phone) do nothing;


-- ==========================================
-- 2. RESTAURANT ORDERS
-- ==========================================
create table public.orders (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    order_number serial not null,
    customer_phone text,
    status text not null check (status in ('pending', 'preparing', 'ready', 'completed', 'cancelled')) default 'pending',
    total_amount numeric,
    notes text
);

create table public.order_items (
    id uuid default uuid_generate_v4() primary key,
    order_id uuid references public.orders(id) on delete cascade not null,
    item_name text not null,
    quantity integer not null default 1,
    price numeric not null,
    image_url text,
    customizations jsonb, -- Stores: { "Sauce": "Mayo", "Cuisson": "Bien Cuit" }
    prep_time text
);


-- ==========================================
-- 3. SERVICES (LAVAGE & MECHANIC)
-- ==========================================
create table public.service_bookings (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    booking_number serial not null,
    service_type text not null check (service_type in ('lavage', 'mecanique')),
    service_name text not null, -- e.g. "Lavage Complet" or "Vidange"
    customer_phone text not null,
    vehicle_info text not null, -- e.g. "Golf 7 Blanche"
    scheduled_at timestamp with time zone not null,
    status text not null check (status in ('scheduled', 'in_progress', 'completed', 'cancelled')) default 'scheduled',
    notes text,
    mechanic_services text[] -- Array of specific mechanic tasks id applicable
);


-- ==========================================
-- 4. HOTEL RESERVATIONS
-- ==========================================
create table public.hotel_reservations (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    room_number text not null,
    room_type text not null, -- Single, Double, Family
    customer_phone text not null,
    check_in_at timestamp with time zone not null,
    duration_label text not null, -- "Overnight" or "3h"
    price numeric not null,
    status text not null check (status in ('reserved', 'checked_in', 'checked_out', 'cleaning')) default 'reserved'
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- For this demo, we allow public read/write to simplify functionality.
-- In production, lock this down!
-- ==========================================

alter table public.staff enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.service_bookings enable row level security;
alter table public.hotel_reservations enable row level security;

-- Allow Public Access (Simplify Demo)
create policy "Allow public access staff" on public.staff for all using (true);
create policy "Allow public access orders" on public.orders for all using (true);
create policy "Allow public access order_items" on public.order_items for all using (true);
create policy "Allow public access service_bookings" on public.service_bookings for all using (true);
create policy "Allow public access hotel_reservations" on public.hotel_reservations for all using (true);

-- ==========================================
-- REALTIME SUBSCRIPTIONS
-- Enable realtime for all tables so dashboards update instantly
-- ==========================================
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.order_items;
alter publication supabase_realtime add table public.service_bookings;
alter publication supabase_realtime add table public.hotel_reservations;
