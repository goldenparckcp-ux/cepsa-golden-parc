-- ============================================
-- STAFF & AUTHENTICATION
-- ============================================

CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  pin_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('kitchen', 'services', 'hotel', 'admin')),
  name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- ============================================
-- RESTAURANT ORDERS
-- ============================================

CREATE TABLE IF NOT EXISTS restaurant_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(20) UNIQUE NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  items JSONB NOT NULL, -- Array of complete item objects with customizations
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
  subtotal DECIMAL(10,2),
  service_fee DECIMAL(10,2) DEFAULT 10,
  total_price DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_restaurant_orders_customer ON restaurant_orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_restaurant_orders_status ON restaurant_orders(status);
CREATE INDEX IF NOT EXISTS idx_restaurant_orders_created ON restaurant_orders(created_at DESC);

-- ============================================
-- SERVICE BOOKINGS (Lavage + Mécanique)
-- ============================================

CREATE TABLE IF NOT EXISTS service_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_number VARCHAR(20) UNIQUE NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  service_type VARCHAR(20) NOT NULL CHECK (service_type IN ('lavage', 'mecanique')),
  
  -- For Lavage
  service_id INTEGER,
  service_name VARCHAR(100),
  scheduled_date DATE NOT NULL,
  time_slot VARCHAR(10), -- "14:30"
  duration VARCHAR(20),
  
  -- For Mécanique
  services JSONB, -- Array of service names for mecanique
  scheduled_time TIMESTAMP,
  appointment_type VARCHAR(20), -- 'scheduled' or 'urgence'
  
  -- Common
  vehicle_info TEXT,
  notes TEXT,
  price DECIMAL(10,2),
  status VARCHAR(20) NOT NULL CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_service_bookings_customer ON service_bookings(customer_phone);
CREATE INDEX IF NOT EXISTS idx_service_bookings_type ON service_bookings(service_type);
CREATE INDEX IF NOT EXISTS idx_service_bookings_date ON service_bookings(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_service_bookings_status ON service_bookings(status);

-- ============================================
-- HOTEL RESERVATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS hotel_reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id VARCHAR(20) UNIQUE NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  room_number INTEGER NOT NULL,
  room_type VARCHAR(50) CHECK (room_type IN ('single', 'double')),
  check_in_time TIMESTAMP NOT NULL,
  duration VARCHAR(20) CHECK (duration IN ('half_day', 'full_night')),
  price DECIMAL(10,2),
  status VARCHAR(20) NOT NULL CHECK (status IN ('reserved', 'checked_in', 'checked_out', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW(),
  checked_in_at TIMESTAMP,
  checked_out_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hotel_reservations_customer ON hotel_reservations(customer_phone);
CREATE INDEX IF NOT EXISTS idx_hotel_reservations_status ON hotel_reservations(status);
CREATE INDEX IF NOT EXISTS idx_hotel_reservations_checkin ON hotel_reservations(check_in_time);

-- ============================================
-- POOL BOOKINGS
-- ============================================

CREATE TABLE IF NOT EXISTS pool_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_number VARCHAR(20) UNIQUE NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  booking_date DATE NOT NULL,
  time_slot VARCHAR(20) NOT NULL CHECK (time_slot IN ('morning', 'afternoon', 'full_day')),
  adults INTEGER DEFAULT 0 CHECK (adults >= 0),
  children INTEGER DEFAULT 0 CHECK (children >= 0),
  infants INTEGER DEFAULT 0 CHECK (infants >= 0),
  total_price DECIMAL(10,2),
  notes TEXT,
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'checked_in', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW(),
  checked_in_at TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pool_bookings_customer ON pool_bookings(customer_phone);
CREATE INDEX IF NOT EXISTS idx_pool_bookings_date ON pool_bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_pool_bookings_status ON pool_bookings(status);

-- ============================================
-- ACTIVITY LOG (for Admin Dashboard)
-- ============================================

CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  related_table VARCHAR(50), -- 'restaurant_orders', 'service_bookings', etc.
  related_id UUID,
  staff_id UUID REFERENCES staff(id),
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_timestamp ON activity_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_type ON activity_log(activity_type);

-- ============================================
-- AUTOMATIC UPDATED_AT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_restaurant_orders_updated_at ON restaurant_orders;
CREATE TRIGGER update_restaurant_orders_updated_at BEFORE UPDATE
  ON restaurant_orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_bookings_updated_at ON service_bookings;
CREATE TRIGGER update_service_bookings_updated_at BEFORE UPDATE
  ON service_bookings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
