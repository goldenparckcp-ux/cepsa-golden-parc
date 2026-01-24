# 🎯 CEPSA GOLDEN PARK - MASTER PLAN IMPLEMENTATION

## **PROJECT VISION**

**Cepsa Golden Park** is a Premium Highway Service Station (Oasis) designed for tired travelers and families who need efficiency, comfort, and speed. This is not just a gas station - it's a complete ecosystem of services.

---

## **1. CORE IDENTITY**

### **Design Language: "Premium Industrial"**
- **Background:** Deep Navy Blue (`#0f172a`)
- **Surfaces:** Navy Surface (`#1e293b`)
- **Primary Actions:** Cepsa Red (`#D6001C`)
- **Text Accents:** Gold (`#EAB308` - yellow-400)
- **Typography:** Space Grotesk (headings), Noto Sans (body)

### **Key Principles:**
✅ **Guest-First Flow** - No forced login/registration  
✅ **Browse → Customize → Confirm → Verify (OTP)**  
✅ **Simple Order Tracking** - No wallet, no profile pages  
✅ **Real-time Information** - Fuel prices, prep times, slot availability  

---

## **2. THE 6 VERTICALS (Service Ecosystem)**

### **A. RESTAURANT (Gastronomy)**
- **Vibe:** Authentic Moroccan Food
- **Items:** Tagine L7em, Rfissa, Bastilla
- **Logic:** Portion selection (1/4, 1/2, Whole) with instant price updates
- **Data:** Displays prep time (e.g., 30 mins)
- **URL:** `/menu?tab=restaurant`

### **B. CAFÉ (The "Machine" Logic)**
- **Vibe:** High-tech Barista experience
- **Items:** Za3za3 Royal, Panaché, Nouss Nouss
- **UX:** Precision customization (Sugar Stepper 0-4, Milk Toggles, Herb Selectors)
- **URL:** `/menu?tab=cafe`

### **C. LAVAGE (Car Wash)**
- **Logic:** Slot-based booking system
- **Flow:** Vehicle Type → Wash Type → Time Slot (scrollable)
- **Services:** Express (30min, 40 DH), Complete (60min, 80 DH), Vapeur (90min, 250 DH)
- **URL:** `/services/wash`

### **D. SIYANA (Mechanic)**
- **Services:** Vidange, Pneu, Clim
- **Logic:** Urgency Selector (Immediate vs Appointment)
- **URL:** `/services/maintenance`

### **E. HOTEL (Quick Sleep)**
- **Goal:** Resting, not vacation
- **Flow:** Simple toggle [Tonight] vs [Tomorrow]
- **URL:** `/rooms`

### **F. POOL & LOUNGE (Leisure)**
- **Status:** ACTIVE
- **Flow:** Book sunbed or lounge access for specific duration
- **URL:** `/pool`

---

## **3. QR CODE TABLE ORDERING (On-Premise Feature)**

### **The Flow:**
1. Customer scans QR code on table → Opens `/menu?table=5`
2. Menu page detects `table` parameter → Switches to **Dine-In Mode**
3. Displays banner: "📍 Ordering for Table 5"
4. User customizes order → Confirms
5. Order sent to kitchen with `table_number: 5` and `service_type: 'dine-in'`

### **Kitchen Display System (KDS) Logic:**
- **GREEN Border/Badge:** Dine-In orders (e.g., "Table 5")
- **ORANGE Border/Badge:** Takeaway orders (e.g., "Takeaway")
- **Button Text:** "Serve to Table" vs "Ready for Pickup"

### **Database Structure:**
```typescript
{
  table_number: string | null,  // "5" for dine-in, null for takeaway
  service_type: 'dine-in' | 'takeaway',
  // ... other order fields
}
```

---

## **4. TECHNICAL ARCHITECTURE**

### **Core Pages Rebuilt:**

#### **`app/page.tsx` - Landing Page**
- Station Cepsa header with real-time fuel prices
- 6-card service grid with images
- Premium Industrial design
- Navigation: [Home] [Menu] [Services] [My Orders]

#### **`app/menu/page.tsx` - Restaurant & Café**
- QR Code table detection (`?table={id}`)
- Dine-in mode banner
- Two tabs: RESTAURANT | CAFÉ
- Category filters (beldi, tagine, grill, italian, soup, drinks, breakfast)
- Prep time display on cards
- Cart with estimated pickup time
- Inline authentication at checkout

#### **`app/services/page.tsx` - Services Summary**
- Lavage and Siyana cards
- Service details (duration, price)
- Links to booking pages

#### **`app/orders/page.tsx` - Order Tracking**
- Guest-first: Inline auth if not logged in
- Distinguishes dine-in (GREEN) vs takeaway (ORANGE)
- Progress bar (Confirmed → Preparing → Ready → Done)
- Estimated pickup time for takeaway
- "Serving to your table" for dine-in

#### **`app/staff/kitchen/page.tsx` - Kitchen Display**
- Real-time order cards
- GREEN border for dine-in (Table X)
- ORANGE border for takeaway
- Time elapsed tracker
- "Serve to Table" vs "Ready for Pickup" buttons

### **Navigation Structure:**
```
Bottom Nav: [Home] [Menu] [Services] [My Orders]
```

### **Color System (Tailwind Config):**
```typescript
'navy-dark': '#0f172a',      // Main background
'navy-surface': '#1e293b',   // Cards
'navy-border': '#475569',    // Borders
'cepsa-red': '#D6001C',      // Primary actions
'premium-gold': '#EAB308',   // Gold accents (yellow-400)
```

---

## **5. USER JOURNEYS**

### **Journey 1: Takeaway Order**
1. User lands on home → Clicks "Restaurant"
2. Browses menu → Adds items to cart
3. Sees "Estimated Pickup: 14:30"
4. Clicks "Confirm Order" → Phone/OTP verification
5. Redirected to `/orders` → Tracks order status

### **Journey 2: Dine-In Order (QR Code)**
1. Customer scans QR code at Table 5 → Opens `/menu?table=5`
2. Sees "📍 Ordering for Table 5" banner
3. Browses menu → Adds items
4. Clicks "Confirm Order" → Phone/OTP verification
5. Order sent to kitchen with table number
6. Kitchen sees GREEN card: "Table 5"
7. Food served to table

### **Journey 3: Car Wash Booking**
1. User clicks "Lavage" → Selects vehicle type
2. Chooses service (Express/Complete/Vapeur)
3. Selects time slot from scrollable list (starts from NOW)
4. Confirms → Phone/OTP verification
5. Booking confirmed → Tracks in "My Orders"

---

## **6. DATABASE SCHEMA UPDATES**

### **Orders Table:**
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  order_number TEXT,
  table_number TEXT,              -- NEW: QR Code table detection
  service_type TEXT,              -- 'dine-in' | 'takeaway'
  items JSONB,
  total DECIMAL,
  status TEXT,                    -- 'pending' | 'preparing' | 'ready' | 'completed'
  estimated_ready_time TEXT,
  created_at TIMESTAMP
);
```

### **Menu Items Table:**
```sql
CREATE TABLE menu_items (
  id UUID PRIMARY KEY,
  name TEXT,
  description TEXT,
  price DECIMAL,
  category TEXT,                  -- 'beldi', 'tagine', 'grill', 'italian', 'soup', 'drink_hot', 'drink_cold', 'breakfast'
  prep_time INTEGER,              -- Minutes
  image_url TEXT,
  options JSONB                   -- Generic parameters (stepper, select, variant, multi)
);
```

---

## **7. IMPLEMENTATION STATUS**

### **✅ Completed:**
- [x] Landing page with 6 service verticals
- [x] Menu page with QR table detection
- [x] Dine-in vs Takeaway logic
- [x] Kitchen Display System with color coding
- [x] Orders tracking page
- [x] Services summary page
- [x] Premium Industrial design system
- [x] Inline authentication flow
- [x] Prep time display and calculation
- [x] Time slot booking system
- [x] Bottom navigation (4 items)

### **🔄 Pending Database Integration:**
- [ ] Connect menu items to Supabase
- [ ] Implement order creation
- [ ] Real-time order updates
- [ ] Fuel price fetching
- [ ] Booking confirmations

### **📋 Future Enhancements:**
- [ ] Hotel booking page
- [ ] Pool/Lounge booking page
- [ ] Mechanic services page
- [ ] Admin dashboard
- [ ] Staff login system
- [ ] Payment integration

---

## **8. KEY FEATURES**

### **Guest-First Authentication:**
- Users browse ALL content without login
- Phone/OTP verification only at checkout
- No persistent profiles or wallets
- Simple order tracking

### **QR Code Innovation:**
- Scan table QR → Instant dine-in mode
- No app download required
- Seamless table service
- Kitchen sees table number immediately

### **Premium Experience:**
- Real-time fuel prices in header
- Prep time on every menu item
- Estimated pickup time in cart
- Slot-based booking (no waiting)
- Visual service type distinction

### **Operational Efficiency:**
- Kitchen Display with color coding
- Table vs Takeaway distinction
- Time elapsed tracking
- One-click status updates

---

## **9. DESIGN PRINCIPLES**

1. **Efficiency First:** Tired travelers need speed
2. **Visual Clarity:** Color coding for instant recognition
3. **No Friction:** Guest-first, minimal steps
4. **Premium Feel:** Industrial Navy + Cepsa Red + Gold
5. **Context Awareness:** Dine-in vs Takeaway modes
6. **Real-time Data:** Fuel prices, prep times, slot availability

---

## **10. NEXT STEPS**

1. **Database Setup:**
   - Run `supabase-schema.sql`
   - Populate menu items with real data
   - Configure RLS policies

2. **Testing:**
   - Test QR code flow with `?table=5`
   - Verify dine-in vs takeaway logic
   - Test inline authentication
   - Validate time slot generation

3. **Production:**
   - Generate QR codes for tables
   - Train staff on KDS
   - Deploy to Vercel
   - Monitor real-time orders

---

**Built with:** Next.js 14, TypeScript, Tailwind CSS, Supabase  
**Design System:** Premium Industrial (Navy/Red/Gold)  
**Target:** Highway travelers seeking efficiency & comfort  

🚗⛽🍽️☕🛏️💦
