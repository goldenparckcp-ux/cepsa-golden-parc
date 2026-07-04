# Product Requirements Document (PRD) - Golden Park Station

## 1. Product Overview
**Name**: Golden Park Station (Cepsa)
**Description**: Golden Park Station is a comprehensive multi-service web application for a premium service station and rest area. It digitizes the customer experience across four main verticals: Restaurant, Swimming Pool, Car Wash & Lubricants, and Hotel. The platform allows customers to order food, book services, and manage their reservations via a unified interface, while providing staff and administrators with dedicated tools to manage operations, validate tickets, and analyze performance.

## 2. Target Audience & User Roles
1. **Customers (End Users)**: Visitors to the station who want to order food, book a pool session, reserve a hotel room, or schedule a car wash.
2. **Staff (Employees)**: Waiters, pool attendants, and service workers who need to receive orders, update order statuses, and scan QR code tickets.
3. **Administrators (Management)**: Station managers who need a bird's-eye view of revenue, operations, and the ability to modify website content (e.g., gallery, hero sections).
4. **Developer (Super Admin)**: Technical maintainers with access to emergency controls (Dev Control Panel) to toggle maintenance mode per service.

## 3. Core Features & Verticals

### 3.1 Restaurant (/restaurant)
- **Digital Menu**: Browse categories (Burgers, Pizzas, Drinks, etc.) with high-quality images and dynamic pricing.
- **Cart & Checkout**: Add items to a global cart, specify dining location (On-site, Takeaway, Delivery to Car), and checkout.
- **Order Tracking**: Real-time status updates (Pending, Preparing, Ready, Completed).

### 3.2 Swimming Pool (/services/pool)
- **Ticketing System**: Purchase daily passes for adults and children.
- **QR Code Generation**: Each successful booking generates a unique QR code.
- **Validation**: Staff can scan the QR code at the entrance to mark the ticket as consumed.

### 3.3 Car Wash & Lubricants (/services/lubrifiants)
- **Service Booking**: Schedule a car wash or oil change.
- **Vehicle Details**: Input vehicle model and license plate for tailored service.

### 3.4 Hotel (/hotel)
- **Room Booking**: Browse available room types (Single, Double, Suite).
- **Reservation System**: Select check-in and check-out dates.

### 3.5 Global User Features
- **OTP Authentication**: Passwordless login using a phone number and OTP.
- **User Profile (/profile)**: View order history across all services, cancel pending orders, and edit profile information.
- **Multilingual Support**: Available in French, Arabic, and English.
- **AI Chatbot**: A floating assistant widget to answer customer queries.

### 3.6 Admin & Staff Tools
- **Admin Dashboard (/admin)**: Financial insights, recent orders table, and content management system (CMS) to edit homepage galleries and hero banners.
- **Staff Dashboard (/staff)**: Simplified view to manage active orders, change statuses, and a built-in QR code scanner for pool tickets.
- **Dev Control Panel (/dev-control)**: A secure, master-key protected page to independently toggle maintenance mode for the Restaurant, Pool, Hotel, Car Wash, or the entire site in real-time.

## 4. User Flows

### Flow 1: Customer Ordering Food
1. User navigates to `/restaurant`.
2. Adds items to the cart and clicks checkout.
3. If not authenticated, prompted to log in via Phone OTP.
4. Selects table number or "delivery to car".
5. Submits order. Redirected to `/profile` to view the active order.

### Flow 2: Pool Ticket Purchase & Validation
1. User navigates to `/services/pool` and purchases 2 Adult tickets.
2. Order is confirmed, and a QR code is generated in their profile.
3. User arrives at the pool and shows the QR code.
4. Staff member logs into `/staff`, clicks "Scanner", and scans the customer's QR code.
5. System validates the ticket and marks it as used.

### Flow 3: Developer Emergency Maintenance
1. Developer navigates to `/dev-control`.
2. Enters the master secret key.
3. Toggles the "Restaurant" switch to OFF.
4. Any user visiting `/restaurant` is instantly redirected to `/maintenance`.

## 5. Technical Stack
- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Framer Motion (Animations), Lucide React (Icons).
- **Backend**: Next.js API Routes (Serverless).
- **Database**: Supabase (PostgreSQL) with Row Level Security (RLS).
- **State Management**: React Context API (CartContext, AuthProvider).
- **Caching & Real-time Flags**: Upstash Redis (used for high-speed rate limiting and maintenance mode toggling).
- **Authentication**: Custom Phone OTP flow + JWT tokens (jose) for Staff/Admin edge-middleware validation.

## 6. Testing Instructions for Automated Tools
- **Bypass Authentication**: If testing restricted areas, the system includes a demo user bypass (`test-user-id` or phone `0600000000`).
- **Edge Cases to Test**:
  - Attempting to access `/admin` without a valid `staff_token` JWT should show the PIN login screen.
  - Adding an item to the cart from the Restaurant, navigating to the Pool, and verifying the cart persists.
  - Toggling maintenance mode for the Hotel and verifying `/hotel` redirects to `/maintenance`, while `/restaurant` remains accessible.
