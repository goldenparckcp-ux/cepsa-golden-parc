# 🏗️ Cepsa Golden Park - Premium Highway Service Station

A modern, full-stack web application for **Restaurant et Café Cepsa Golden Park** - a premium highway service station featuring unified dining, leisure, and hospitality services with intelligent pre-ordering, digital payments, and seamless booking experiences.

![Cepsa Golden Park](https://img.shields.io/badge/Cepsa-Golden%20Park-D6001C?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnoiIGZpbGw9IiNENEFGMzciLz48L3N2Zz4=)

## 🎨 Brand Identity

### Color Palette (STRICT)
- **Cepsa Red** `#D6001C` - CTAs & Alerts ONLY
- **Premium Gold** `#D4AF37` - Prices, VIP badges, highlights
- **Dark Background** `#1A1A1A` - Industrial luxury aesthetic
- **Surface Dark** `#242424` - Cards & elevated surfaces

### Typography
- **Display Font**: Space Grotesk (600-700 weight) - Headers, CTAs
- **Body Font**: Noto Sans (400-500 weight) - Content, descriptions

## 🚀 Features

### 1. **Unified Dashboard**
- GPS-based ETA tracking to the station
- Real-time distance and time updates
- Service cards grid with live status
- Active order tracker with progress bar
- Quick stats: Wallet balance & loyalty points

### 2. **Smart Wallet (Golden Wallet)**
- Digital wallet with MAD currency
- **Arboune Feature**: Partial payment toggle (30% now, 70% on arrival)
- Transaction history with categorized icons
- QR code generator for station payments
- Top-up functionality

### 3. **Smart Menu & Pre-Ordering**
- GPS-triggered menu activation
- Category filters: Burgers, Bowls, Drinks, Sides
- Prep time badges on each item
- Service type toggle: Pickup / Dine-in
- Sticky cart summary with glassmorphism
- Real-time cart management

### 4. **Pool & Leisure Booking**
- Interactive SVG pool layout (top-down view)
- Visual spot selection with availability indicators
- Date picker with horizontal scroll
- Time slot selection
- Capacity meter with live indicator
- VIP Cabana cards with premium styling

### 5. **Hotel & Digital Key**
- Digital key interface with pulse animation
- Bluetooth status indicator
- Room information display
- WiFi credentials with copy functionality
- Quick actions: Housekeeping, Room Service, Late Checkout
- Check-out countdown timer

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v3.4+
- **Icons**: Lucide React
- **Database**: Supabase
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cepsa-golden-park
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Then edit `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**
   - Open your Supabase SQL Editor: https://supabase.com/dashboard
   - Copy the contents of `supabase-schema.sql`
   - Paste and run in the SQL Editor
   - This will create all tables, RLS policies, and sample data
   
   📖 **See `SUPABASE_SETUP.md` for detailed instructions**

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Schema

### Required Supabase Tables

```sql
-- Users & Auth
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  loyalty_tier TEXT DEFAULT 'silver',
  wallet_balance DECIMAL DEFAULT 0,
  partial_payment_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu Items
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL NOT NULL,
  category TEXT,
  prep_time_minutes INT,
  image_url TEXT,
  available BOOLEAN DEFAULT true
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  items JSONB,
  total DECIMAL,
  status TEXT DEFAULT 'pending',
  service_type TEXT,
  eta_minutes INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pool Bookings
CREATE TABLE pool_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  spot_id TEXT,
  spot_type TEXT,
  date DATE,
  time_slot TEXT,
  price DECIMAL,
  status TEXT DEFAULT 'confirmed'
);

-- Hotel Rooms
CREATE TABLE hotel_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  room_number TEXT,
  check_in DATE,
  check_out DATE,
  digital_key_enabled BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'active'
);

-- Wallet Transactions
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  amount DECIMAL,
  type TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 📱 Project Structure

```
cepsa-golden-park/
├── app/
│   ├── page.tsx              # Unified Dashboard
│   ├── menu/
│   │   └── page.tsx          # Smart Menu
│   ├── pool/
│   │   └── page.tsx          # Pool Booking
│   ├── rooms/
│   │   └── page.tsx          # Hotel & Digital Key
│   ├── wallet/
│   │   └── page.tsx          # Golden Wallet
│   ├── layout.tsx            # Root Layout
│   └── globals.css           # Global Styles
├── components/
│   └── ui/
│       ├── ServiceCard.tsx   # Service Card Component
│       ├── StatusBadge.tsx   # Status Badge Component
│       ├── PriceTag.tsx      # Price Display Component
│       ├── ToggleSwitch.tsx  # Toggle Switch Component
│       ├── OrderProgress.tsx # Order Progress Component
│       └── BottomNav.tsx     # Bottom Navigation
├── lib/
│   ├── supabase.ts           # Supabase Client
│   └── types.ts              # TypeScript Types
└── tailwind.config.ts        # Tailwind Configuration
```

## 🎯 Key Components

### ServiceCard
Reusable card component for displaying services with icons, badges, and CTAs.

### StatusBadge
Dynamic status indicator with color-coded states for orders.

### PriceTag
Formatted price display with gold gradient for large amounts.

### ToggleSwitch
Animated toggle for the Arboune partial payment feature.

### OrderProgress
Step-by-step progress indicator for order tracking.

### BottomNav
Fixed bottom navigation with active state highlighting.

## 🎨 Design Principles

1. **Dark Mode Only** - Premium industrial aesthetic
2. **Generous Spacing** - Minimum 16px padding, 24px gaps
3. **Subtle Shadows** - shadow-xl with low opacity for depth
4. **Rounded Corners** - 12px default, 16px for cards, 24px for hero elements
5. **Glassmorphism** - Backdrop blur effects for modern feel
6. **Smooth Animations** - Transitions and micro-interactions

## 🚨 Critical Don'ts

❌ **Never use orange (#EA2831)** - Only Cepsa Red (#D6001C)  
❌ **No bright blue (#13b6ec)** - Use gold for accents  
❌ **Avoid pure black (#000)** - Use #1A1A1A  
❌ **No localStorage** - Use Supabase for persistence  

## ✅ Success Criteria

- [x] Unified dashboard with GPS ETA
- [x] Functional Arboune toggle in wallet
- [x] Interactive pool map with booking
- [x] Digital key with Bluetooth status
- [x] Real-time order tracking UI
- [x] Responsive on all devices
- [x] Premium dark theme
- [x] Reusable component library

## 📄 License

This project is proprietary and confidential.

## 🤝 Contributing

This is a private project. For questions or support, contact the development team.

---

**Built with ❤️ for Cepsa Golden Park**
