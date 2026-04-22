-- SalonFlow SQL Schema
-- Generated for SalonFlow application

-- =============================================================================
-- EXTENSIONS
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TABLES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. SALONS
-- -----------------------------------------------------------------------------
CREATE TABLE salons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    business_hours JSONB,
    description TEXT,
    owner_id UUID,
    plan TEXT DEFAULT 'starter',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 2. SERVICES
-- -----------------------------------------------------------------------------
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES salons ON DELETE CASCADE,
    name TEXT NOT NULL,
    duration_minutes INT NOT NULL,
    price_cents INT NOT NULL,
    category TEXT,
    active BOOLEAN DEFAULT true
);

-- -----------------------------------------------------------------------------
-- 3. STYLISTS
-- -----------------------------------------------------------------------------
CREATE TABLE stylists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES salons ON DELETE CASCADE,
    name TEXT NOT NULL,
    avatar_url TEXT,
    active BOOLEAN DEFAULT true
);

-- -----------------------------------------------------------------------------
-- 4. CUSTOMERS
-- -----------------------------------------------------------------------------
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES salons ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 5. BOOKINGS
-- -----------------------------------------------------------------------------
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES salons ON DELETE CASCADE,
    customer_id UUID REFERENCES customers ON DELETE SET NULL,
    stylist_id UUID REFERENCES stylists ON DELETE SET NULL,
    service_id UUID REFERENCES services ON DELETE SET NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'confirmed',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 6. APPOINTMENT_REQUESTS
-- -----------------------------------------------------------------------------
CREATE TABLE appointment_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID NOT NULL,
    client_name TEXT NOT NULL,
    client_email TEXT,
    client_phone TEXT,
    requested_time TIMESTAMPTZ NOT NULL,
    service_name TEXT,
    source TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX idx_services_salon_id ON services(salon_id);
CREATE INDEX idx_stylists_salon_id ON stylists(salon_id);
CREATE INDEX idx_customers_salon_id ON customers(salon_id);
CREATE INDEX idx_bookings_salon_id ON bookings(salon_id);
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_stylist_id ON bookings(stylist_id);
CREATE INDEX idx_bookings_start_time ON bookings(start_time);
CREATE INDEX idx_appointment_requests_salon_id ON appointment_requests(salon_id);
CREATE INDEX idx_appointment_requests_status ON appointment_requests(status);
