-- Enable Row Level Security (RLS)
alter table auth.users enable row level security;

-- MENU ITEMS TABLE
create table if not exists public.menu_items (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price decimal not null,
  category text, -- 'beldi', 'tagine', 'grill', 'italian', 'soup', 'drink_hot', 'drink_cold', 'breakfast'
  prepTime integer, -- minutes
  image_url text,
  options jsonb, -- Generic parameters
  available boolean default true
);

-- ORDERS TABLE
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid, -- Can be null for guest checkout if allowed, or strictly auth.users
  order_number text,
  table_number text, -- '5' for table 5, null for takeaway
  service_type text, -- 'dine-in' | 'takeaway'
  items jsonb, -- Array of { name, quantity, price, options }
  total decimal,
  status text default 'pending', -- 'pending', 'preparing', 'ready', 'completed'
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Realtime
alter publication supabase_realtime add table public.orders;

-- RLS POLICIES (Simple version for MVP)
alter table public.orders enable row level security;

-- Allow users to see their own orders
create policy "Users can view their own orders" 
on public.orders for select 
using (auth.uid() = user_id);

-- Allow authenticated users to create orders
create policy "Users can create orders" 
on public.orders for insert 
with check (auth.uid() = user_id);

-- Allow staff (or anyone for this MVP) to update orders (Kitchen Display)
-- In a real app, check for role = 'staff'
create policy "Staff can view all orders" 
on public.orders for select 
using (true);

create policy "Staff can update orders" 
on public.orders for update 
using (true);
