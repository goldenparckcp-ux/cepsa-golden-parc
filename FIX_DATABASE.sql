-- 1. Relax RLS for 'orders' table to allow Guest/Dev checkouts (where user_id is null)
-- DROP existing strict policy if it exists
drop policy if exists "Users can create orders" on public.orders;

-- CREATE new permissive insert policy
create policy "Allow everyone to create orders" 
on public.orders for insert 
with check (true);

-- 2. Allow reading guest orders (where user_id is null)
drop policy if exists "Users can view their own orders" on public.orders;
create policy "Users can view their own orders OR guest orders" 
on public.orders for select 
using (
  (auth.uid() = user_id) OR (user_id is null)
);

-- 3. Ensure 'user_id' column allows NULLs (it usually does by default, but just in case)
alter table public.orders alter column user_id drop not null;
