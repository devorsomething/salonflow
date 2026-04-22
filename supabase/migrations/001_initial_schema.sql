-- SalonFlow Production Schema
-- Supabase Migration

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Salons
CREATE TABLE IF NOT EXISTS salons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  business_hours TEXT,
  description TEXT,
  plan TEXT DEFAULT 'free',
  owner_id UUID,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Services
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  price_cents INTEGER NOT NULL DEFAULT 0,
  category TEXT DEFAULT 'General',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Stylists
CREATE TABLE IF NOT EXISTS stylists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  notes TEXT,
  total_visits INTEGER DEFAULT 0,
  last_visit_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  stylist_id UUID REFERENCES stylists(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','completed','in_progress','no_show')),
  notes TEXT,
  price_cents INTEGER,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Memberships
CREATE TABLE IF NOT EXISTS memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0,
  billing_interval TEXT DEFAULT 'monthly' CHECK (billing_interval IN ('monthly','quarterly','yearly')),
  benefits TEXT,
  services_included TEXT,
  discount_percent INTEGER DEFAULT 0,
  max_members INTEGER,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Customer Memberships
CREATE TABLE IF NOT EXISTS customer_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  membership_id UUID REFERENCES memberships(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','cancelled','expired')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  category TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Coupons
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT DEFAULT 'percent' CHECK (discount_type IN ('percent','fixed')),
  discount_value INTEGER DEFAULT 0,
  min_order_cents INTEGER DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_until TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Campaigns
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  campaign_type TEXT DEFAULT 'email' CHECK (campaign_type IN ('email','sms','push')),
  template_id TEXT,
  target_segment TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','scheduled','sending','sent','failed')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  stats JSONB DEFAULT '{"sent":0,"opened":0,"clicked":0}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  amount_cents INTEGER NOT NULL,
  payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash','card','transfer','insurance')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','completed','failed','refunded')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Customer Forms
CREATE TABLE IF NOT EXISTS customer_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  form_type TEXT NOT NULL,
  form_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Appointments (alias/extended for bookings)
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  stylist_id UUID REFERENCES stylists(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','completed','in_progress','no_show')),
  notes TEXT,
  price_cents INTEGER,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Commissions (for partner system)
CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  commission_percent INTEGER DEFAULT 10,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','paid','cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  paid_at TIMESTAMPTZ
);

-- Marketplace Partners
CREATE TABLE IF NOT EXISTS marketplace_partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  referral_code TEXT UNIQUE,
  commission_rate INTEGER DEFAULT 10,
  applied_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_salon ON bookings(salon_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_start ON bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_services_salon ON services(salon_id);
CREATE INDEX IF NOT EXISTS idx_stylists_salon ON stylists(salon_id);
CREATE INDEX IF NOT EXISTS idx_customers_salon ON customers(salon_id);
CREATE INDEX IF NOT EXISTS idx_products_salon ON products(salon_id);
CREATE INDEX IF NOT EXISTS idx_payments_salon ON payments(salon_id);
CREATE INDEX IF NOT EXISTS idx_appointments_salon ON appointments(salon_id);
CREATE INDEX IF NOT EXISTS idx_commissions_partner ON commissions(partner_id);

-- Row Level Security (RLS)
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE stylists ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_partners ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow all for now - refine per use case)
CREATE POLICY "Enable read for all" ON salons FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON salons FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON salons FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all" ON salons FOR DELETE USING (true);

CREATE POLICY "Enable read for all" ON services FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON services FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON services FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all" ON services FOR DELETE USING (true);

CREATE POLICY "Enable read for all" ON stylists FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON stylists FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON stylists FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all" ON stylists FOR DELETE USING (true);

CREATE POLICY "Enable read for all" ON customers FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON customers FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all" ON customers FOR DELETE USING (true);

CREATE POLICY "Enable read for all" ON bookings FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON bookings FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all" ON bookings FOR DELETE USING (true);

CREATE POLICY "Enable read for all" ON memberships FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON memberships FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON memberships FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all" ON memberships FOR DELETE USING (true);

CREATE POLICY "Enable read for all" ON customer_memberships FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON customer_memberships FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON customer_memberships FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all" ON customer_memberships FOR DELETE USING (true);

CREATE POLICY "Enable read for all" ON products FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON products FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all" ON products FOR DELETE USING (true);

CREATE POLICY "Enable read for all" ON coupons FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON coupons FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON coupons FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all" ON coupons FOR DELETE USING (true);

CREATE POLICY "Enable read for all" ON campaigns FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON campaigns FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON campaigns FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all" ON campaigns FOR DELETE USING (true);

CREATE POLICY "Enable read for all" ON payments FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON payments FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all" ON payments FOR DELETE USING (true);

CREATE POLICY "Enable read for all" ON customer_forms FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON customer_forms FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON customer_forms FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all" ON customer_forms FOR DELETE USING (true);

CREATE POLICY "Enable read for all" ON appointments FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON appointments FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all" ON appointments FOR DELETE USING (true);

CREATE POLICY "Enable read for all" ON commissions FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON commissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON commissions FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all" ON commissions FOR DELETE USING (true);

CREATE POLICY "Enable read for all" ON marketplace_partners FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON marketplace_partners FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON marketplace_partners FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all" ON marketplace_partners FOR DELETE USING (true);

-- Insert demo salon
INSERT INTO salons (id, name, slug, email, phone, address, city, plan) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Studio Mira', 'studio-mira', 'hallo@studiomira.at', '+43 5572 12345', 'Bahnhofstraße 12', 'Bregenz', 'pro')
ON CONFLICT (slug) DO NOTHING;

-- Insert demo services
INSERT INTO services (salon_id, name, duration_minutes, price_cents, category) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Damen Haarschnitt', 45, 4500, 'Haare'),
  ('00000000-0000-0000-0000-000000000001', 'Herren Haarschnitt', 30, 3000, 'Haare'),
  ('00000000-0000-0000-0000-000000000001', 'Farbe', 90, 7500, 'Color'),
  ('00000000-0000-0000-0000-000000000001', 'Maniküre', 30, 2500, 'Nägel'),
  ('00000000-0000-0000-0000-000000000001', 'Massage', 60, 6000, 'Wellness')
ON CONFLICT DO NOTHING;

-- Insert demo stylists
INSERT INTO stylists (salon_id, name, avatar_url) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Lena Mayer', NULL),
  ('00000000-0000-0000-0000-000000000001', 'Max Huber', NULL)
ON CONFLICT DO NOTHING;

-- Insert demo customers
INSERT INTO customers (salon_id, name, email, phone) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Anna Schmidt', 'anna@email.at', '+43 660 1234567'),
  ('00000000-0000-0000-0000-000000000001', 'Tom Müller', 'tom@email.at', '+43 660 7654321')
ON CONFLICT DO NOTHING;

-- Insert demo memberships
INSERT INTO memberships (salon_id, name, description, price_cents, billing_interval, benefits, discount_percent) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Basic', 'Basis-Mitgliedschaft', 2900, 'monthly', 'Haareschneiden, 10% Rabatt', 10),
  ('00000000-0000-0000-0000-000000000001', 'Premium', 'Premium-Mitgliedschaft', 5900, 'monthly', 'Alle Leistungen, 20% Rabatt, Priorität', 20)
ON CONFLICT DO NOTHING;

-- Insert demo coupons
INSERT INTO coupons (salon_id, code, discount_type, discount_value, min_order_cents) VALUES
  ('00000000-0000-0000-0000-000000000001', 'WILLKOMMEN', 'percent', 15, 0),
  ('00000000-0000-0000-0000-000000000001', 'SOMMER10', 'fixed', 1000, 5000)
ON CONFLICT (code) DO NOTHING;
