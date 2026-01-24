# 🚀 Supabase Setup Guide for Cepsa Golden Park

## ✅ Step 1: Environment Variables (COMPLETED)
Your `.env.local` file has been created with your Supabase credentials:
- **Project URL**: https://vktqecgylkjogquhsymz.supabase.co
- **Anon Key**: sb_publishable_Z698wcBReZzBGsVRJdVmHg_10KeiSD3

## 📊 Step 2: Create Database Tables

1. **Open Supabase SQL Editor**:
   - Go to https://supabase.com/dashboard
   - Select your project: `vktqecgylkjogquhsymz`
   - Click on **SQL Editor** in the left sidebar

2. **Run the Schema**:
   - Open the file `supabase-schema.sql` in this project
   - Copy ALL the SQL code
   - Paste it into the Supabase SQL Editor
   - Click **Run** (or press Ctrl+Enter)

3. **Verify Tables Created**:
   After running the script, you should see these tables in your database:
   - ✅ `profiles` - User information and wallet
   - ✅ `menu_items` - Restaurant menu (with 10 sample items)
   - ✅ `orders` - Food orders
   - ✅ `pool_bookings` - Pool reservations
   - ✅ `hotel_bookings` - Hotel room bookings
   - ✅ `wallet_transactions` - Payment history

## 🔒 Step 3: Enable Authentication (Optional)

If you want user authentication:

1. Go to **Authentication** → **Providers** in Supabase
2. Enable **Email** provider
3. Configure email templates (optional)

For now, the app works without authentication for testing.

## 🧪 Step 4: Test the Connection

The application is already running at http://localhost:3000

To verify the database connection:

1. Open the browser console (F12)
2. Navigate to the Menu page
3. Check if menu items load from the database

## 📝 What's Included in the Schema

### Sample Menu Items (10 items):
- 🍔 Speedster Smash Burger (12.50 MAD)
- 🥗 Highway Hero Bowl (10.00 MAD)
- ☕ Golden Latte (4.50 MAD)
- 🍟 Crispy Fries (5.00 MAD)
- And 6 more items...

### Security Features:
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Users can only access their own data
- ✅ Public read access for menu items
- ✅ Automatic timestamp updates

### Performance Optimizations:
- ✅ Indexes on frequently queried columns
- ✅ Foreign key constraints
- ✅ Efficient query patterns

## 🔄 Next Steps

1. **Run the SQL schema** (Step 2 above)
2. **Refresh your browser** at http://localhost:3000
3. **Navigate to the Menu page** to see real data from Supabase
4. **Test the wallet, pool, and hotel features**

## 🆘 Troubleshooting

### If menu items don't load:
1. Check browser console for errors
2. Verify the SQL schema ran successfully
3. Check that RLS policies are correct
4. Ensure environment variables are loaded (restart dev server)

### If you see "No data" errors:
1. Make sure the SQL script completed without errors
2. Check the `menu_items` table has data
3. Verify your Supabase URL and API key are correct

## 📚 Database Schema Reference

```sql
-- Quick reference for table structures

profiles:
  - id (UUID, primary key)
  - full_name (TEXT)
  - wallet_balance (DECIMAL)
  - partial_payment_enabled (BOOLEAN)
  - loyalty_tier (TEXT: silver/gold/platinum)

menu_items:
  - id (UUID, primary key)
  - name, description, price
  - category (burger/bowl/drink/side/dessert)
  - prep_time_minutes (INT)
  - available (BOOLEAN)

orders:
  - id (UUID, primary key)
  - user_id (UUID, foreign key)
  - items (JSONB)
  - status (pending/confirmed/preparing/ready/completed)
  - service_type (pickup/dine-in)

pool_bookings:
  - id (UUID, primary key)
  - user_id (UUID, foreign key)
  - spot_id, spot_type (sunbed/cabana)
  - date, time_slot, price

hotel_bookings:
  - id (UUID, primary key)
  - user_id (UUID, foreign key)
  - room_number, check_in, check_out
  - digital_key_enabled (BOOLEAN)

wallet_transactions:
  - id (UUID, primary key)
  - user_id (UUID, foreign key)
  - amount, type (topup/payment/refund)
  - description
```

---

**Need Help?** Check the Supabase documentation: https://supabase.com/docs
