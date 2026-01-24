# 🔐 Authentication Setup Guide

## ✅ What Was Implemented

### 1. **Login Page** (`/login`)
- ✅ Two-step OTP authentication flow
- ✅ Premium dark theme with Cepsa branding
- ✅ Phone number input (Step 1)
- ✅ OTP verification (Step 2)
- ✅ Loading states with spinners
- ✅ Error handling with red alerts
- ✅ Test mode indicator
- ✅ Auto-redirect to `/wallet` on success

### 2. **Protected Wallet Page** (`/wallet`)
- ✅ Authentication check on page load
- ✅ Real profile data from Supabase
- ✅ Display actual `wallet_balance` and `full_name`
- ✅ Gold loading spinner during fetch
- ✅ Logout button in header
- ✅ Arboune toggle with database persistence
- ✅ Loyalty tier badge display

### 3. **Auto Profile Creation**
- ✅ SQL trigger function `handle_new_user()`
- ✅ Automatic profile creation on signup
- ✅ Default values: 0.00 MAD balance, 'Golden Member' name
- ✅ Trigger: `on_auth_user_created`

## 🚀 Setup Instructions

### Step 1: Enable Phone Authentication in Supabase

1. **Go to Supabase Dashboard**:
   ```
   https://supabase.com/dashboard/project/vktqecgylkjogquhsymz/auth/providers
   ```

2. **Enable Phone Provider**:
   - Click on **"Phone"** in the providers list
   - Toggle **"Enable Phone provider"** to ON
   - For testing, you can leave SMS provider unconfigured
   - Click **Save**

3. **Configure Test Mode** (Development):
   - Supabase automatically allows test OTPs in development
   - Any phone number will work
   - Default test OTP: `123456`

### Step 2: Run the Auto Profile Trigger

1. **Open Supabase SQL Editor**:
   ```
   https://supabase.com/dashboard/project/vktqecgylkjogquhsymz/sql
   ```

2. **Run the trigger script**:
   - Open file: `supabase/auto-profile-trigger.sql`
   - Copy all the SQL code
   - Paste into SQL Editor
   - Click **Run** (or Ctrl+Enter)

3. **Verify trigger was created**:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```
   You should see one row returned.

### Step 3: Test the Authentication Flow

1. **Start the dev server** (if not running):
   ```bash
   npm run dev
   ```

2. **Navigate to login**:
   ```
   http://localhost:3000/login
   ```

3. **Test credentials**:
   - **Phone**: `0600000000` (or any Moroccan number)
   - **OTP**: `123456` (Supabase test OTP)

4. **Expected flow**:
   - Enter phone → Click "Send OTP"
   - Enter OTP `123456` → Click "Verify & Login"
   - Redirected to `/wallet`
   - Profile auto-created in database
   - Wallet shows 0.00 MAD balance

## 📊 Database Changes

### New Trigger Function
```sql
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, wallet_balance, loyalty_tier, partial_payment_enabled)
  VALUES (NEW.id, 'Golden Member', 0.00, 'silver', false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Trigger on Auth Table
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

## 🧪 Testing Checklist

- [ ] Phone authentication enabled in Supabase
- [ ] Auto-profile trigger created and verified
- [ ] Login page loads at `/login`
- [ ] Can enter phone number
- [ ] OTP step appears after sending
- [ ] Can verify with OTP `123456`
- [ ] Redirects to `/wallet` on success
- [ ] Profile auto-created in `profiles` table
- [ ] Wallet shows real balance (0.00 MAD initially)
- [ ] Logout button works
- [ ] Arboune toggle persists to database

## 🔍 Verification Queries

### Check if a profile was created
```sql
SELECT 
  p.id,
  p.full_name,
  p.wallet_balance,
  p.loyalty_tier,
  p.created_at,
  u.phone
FROM profiles p
JOIN auth.users u ON u.id = p.id
ORDER BY p.created_at DESC
LIMIT 5;
```

### Check trigger status
```sql
SELECT 
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

### Manually update wallet balance for testing
```sql
UPDATE profiles
SET wallet_balance = 2450.75
WHERE id = 'your-user-id-here';
```

## 🎯 Features Implemented

### Login Page Features
- ✅ Step indicator (1 → 2)
- ✅ Phone input with validation
- ✅ OTP input (6 digits, auto-formatted)
- ✅ Loading spinners during API calls
- ✅ Error messages in red
- ✅ Back button to return to phone step
- ✅ Resend OTP functionality
- ✅ Test mode note with credentials
- ✅ Premium Cepsa branding

### Wallet Page Features
- ✅ Authentication guard (redirects if not logged in)
- ✅ Real-time profile data fetching
- ✅ Display user's full name
- ✅ Display actual wallet balance
- ✅ Loyalty tier badge (Silver/Gold/Platinum)
- ✅ Logout functionality
- ✅ Arboune toggle with DB persistence
- ✅ Payment breakdown when Arboune enabled
- ✅ QR code display toggle
- ✅ Transaction history (sample data)
- ✅ Top-up button (UI only)

## 🚨 Troubleshooting

### Issue: "Invalid OTP" error
**Solution**: Make sure phone authentication is enabled in Supabase dashboard.

### Issue: Profile not created after signup
**Solution**: 
1. Check if trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`
2. Check Supabase logs for errors
3. Manually run the trigger script again

### Issue: Redirected to login immediately
**Solution**: 
1. Check browser console for errors
2. Verify Supabase URL and API key in `.env.local`
3. Clear browser cookies and try again

### Issue: Phone number format error
**Solution**: The app auto-formats Moroccan numbers. Just enter: `0600000000`

## 📱 Phone Number Format

The app automatically handles Moroccan phone numbers:
- **User enters**: `0600000000`
- **App converts to**: `+212600000000` (E.164 format)
- **Supabase receives**: `+212600000000`

## 🔐 Security Notes

- ✅ Row Level Security (RLS) enabled on profiles table
- ✅ Users can only access their own profile
- ✅ Trigger uses SECURITY DEFINER to bypass RLS for creation
- ✅ Phone numbers stored securely in auth.users table
- ✅ OTP codes are single-use and expire

## 🎨 UI/UX Highlights

- **Premium Dark Theme**: #1A1A1A background
- **Cepsa Red Buttons**: #D6001C for primary actions
- **Gold Accents**: #D4AF37 for balance and highlights
- **Glassmorphism**: Backdrop blur effects on cards
- **Smooth Animations**: Loading states and transitions
- **Mobile-First**: Optimized for mobile devices

## 📚 File Structure

```
app/
├── login/
│   └── page.tsx          ✅ OTP authentication flow
└── wallet/
    └── page.tsx          ✅ Protected wallet with real data

supabase/
├── auto-profile-trigger.sql    ✅ Auto profile creation
└── phone-auth-setup.sql        ✅ Setup instructions
```

---

**Ready to test!** Follow the setup steps above and you'll have a fully functional authentication system with automatic profile creation! 🚀
