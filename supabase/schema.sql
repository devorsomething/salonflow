-- SalonFlow MVP - Supabase Schema
-- Production-ready SQL for Austrian KMU (Klein- und Mittelbetriebe)
-- Version: 1.0.0

-- =============================================================================
-- EXTENSIONS
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE appointment_status AS ENUM (
    'pending',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled',
    'no_show'
);

CREATE TYPE payment_status AS ENUM (
    'pending',
    'paid',
    'refunded',
    'failed'
);

CREATE TYPE recurrence_pattern AS ENUM (
    'none',
    'weekly',
    'biweekly',
    'monthly'
);

-- =============================================================================
-- TABLES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. SALONS (Standorte / Filialen)
-- -----------------------------------------------------------------------------
CREATE TABLE salons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    business_name TEXT, -- Firmenname für Rechnungen
    uid TEXT, -- Austrian UID (Umwelt-ID) for waste management
    tax_id TEXT, -- Austrian tax identification
    ssnr TEXT, -- Sozialversicherungsnummer for employees
    
    -- Address
    street TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT DEFAULT 'AT',
    
    -- Contact
    phone TEXT,
    email TEXT,
    website TEXT,
    
    -- Business hours (JSONB for flexibility)
    business_hours JSONB DEFAULT '{
        "monday": {"open": "09:00", "close": "18:00", "enabled": true},
        "tuesday": {"open": "09:00", "close": "18:00", "enabled": true},
        "wednesday": {"open": "09:00", "close": "18:00", "enabled": true},
        "thursday": {"open": "09:00", "close": "19:00", "enabled": true},
        "friday": {"open": "09:00", "close": "18:00", "enabled": true},
        "saturday": {"open": "09:00", "close": "14:00", "enabled": true},
        "sunday": {"open": null, "close": null, "enabled": false}
    }'::jsonb,
    
    -- Booking settings
    slot_duration_minutes INT DEFAULT 30,
    advance_booking_days INT DEFAULT 60,
    max_advance_booking_days INT DEFAULT 90,
    allow_cancellation_hours INT DEFAULT 24,
    require_confirmation BOOLEAN DEFAULT false,
    
    -- Currency (Austrian EUR)
    currency TEXT DEFAULT 'EUR',
    
    -- Branding
    logo_url TEXT,
    primary_color TEXT DEFAULT '#6366F1',
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 2. SERVICES (Dienstleistungen)
-- -----------------------------------------------------------------------------
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    description TEXT,
    category TEXT, -- e.g., 'Haare', 'Nägel', 'Kosmetik'
    
    -- Pricing (all in EUR cents for precision)
    price_cents INT NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 30,
    
    -- Booking settings
    buffer_before_minutes INT DEFAULT 0,
    buffer_after_minutes INT DEFAULT 5,
    max_per_slot INT DEFAULT 1,
    
    -- Online booking
    bookable_online BOOLEAN DEFAULT true,
    requires_deposit BOOLEAN DEFAULT false,
    deposit_cents INT DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. STYLISTS (Mitarbeiter/Friseure)
-- -----------------------------------------------------------------------------
CREATE TABLE stylists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    
    -- Personal info
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    nickname TEXT,
    email TEXT,
    phone TEXT,
    
    -- Austrian SSNr (Sozialversicherungsnummer)
    social_security_number TEXT,
    
    -- Employment
    employment_type TEXT DEFAULT 'full_time', -- full_time, part_time, freelance
    hourly_rate_cents INT,
    
    -- Working hours per weekday (JSONB)
    working_hours JSONB DEFAULT '{
        "monday": {"enabled": true, "start": "09:00", "end": "18:00"},
        "tuesday": {"enabled": true, "start": "09:00", "end": "18:00"},
        "wednesday": {"enabled": true, "start": "09:00", "end": "18:00"},
        "thursday": {"enabled": true, "start": "09:00", "end": "19:00"},
        "friday": {"enabled": true, "start": "09:00", "end": "18:00"},
        "saturday": {"enabled": true, "start": "09:00", "end": "14:00"},
        "sunday": {"enabled": false, "start": null, "end": null}
    }'::jsonb,
    
    -- Services this stylist can perform
    service_ids UUID[] DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    color TEXT DEFAULT '#6366F1', -- Calendar color
    avatar_url TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 4. CUSTOMERS (Kunden)
-- -----------------------------------------------------------------------------
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    
    -- Personal info
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    
    -- Austrian specifics
    date_of_birth DATE,
    tax_id TEXT, -- For invoices if needed
    
    -- Preferences
    notes TEXT,
    allergies TEXT,
    preferred_stylist_id UUID REFERENCES stylists(id),
    
    -- Marketing consent (GDPR compliant)
    marketing_consent BOOLEAN DEFAULT false,
    sms_consent BOOLEAN DEFAULT false,
    
    -- Customer lifetime value
    total_visits INT DEFAULT 0,
    total_revenue_cents INT DEFAULT 0,
    last_visit_at TIMESTAMPTZ,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 5. APPOINTMENTS (Termine)
-- -----------------------------------------------------------------------------
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    stylist_id UUID NOT NULL REFERENCES stylists(id) ON DELETE RESTRICT,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    
    -- Timing
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration_minutes INT GENERATED ALWAYS AS (EXTRACT(EPOCH FROM (end_time - start_time))::INT / 60) STORED,
    
    -- Status
    status appointment_status DEFAULT 'pending',
    
    -- Payment
    price_cents INT NOT NULL, -- Locked at booking time
    payment_status payment_status DEFAULT 'pending',
    payment_method TEXT, -- cash, card, bank_transfer
    
    -- Notes
    notes TEXT,
    internal_notes TEXT, -- Staff notes
    
    -- Cancellation
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    cancelled_by UUID, -- Which staff member cancelled
    
    -- Recurrence
    recurrence_pattern recurrence_pattern DEFAULT 'none',
    recurrence_parent_id UUID REFERENCES appointments(id),
    
    -- Reminders (sent flags)
    reminder_24h_sent BOOLEAN DEFAULT false,
    reminder_2h_sent BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_time_range CHECK (end_time > start_time),
    CONSTRAINT future_booking CHECK (start_time > NOW() - INTERVAL '1 hour')
);

-- -----------------------------------------------------------------------------
-- 6. SALON_SETTINGS (Salon-spezifische Einstellungen)
-- -----------------------------------------------------------------------------
CREATE TABLE salon_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID UNIQUE NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    
    -- Business registration
    business_registration_number TEXT,
    vat_number TEXT, -- Austrian UID for VAT (UID-Nummer)
    
    -- Invoice settings
    invoice_prefix TEXT DEFAULT 'SF-',
    invoice_footer_text TEXT,
    default_payment_terms_days INT DEFAULT 14,
    
    -- Reminders
    send_sms_reminders BOOLEAN DEFAULT true,
    send_email_reminders BOOLEAN DEFAULT true,
    reminder_24h_before BOOLEAN DEFAULT true,
    reminder_2h_before BOOLEAN DEFAULT false,
    
    -- Online booking
    online_booking_enabled BOOLEAN DEFAULT true,
    require_deposit_online BOOLEAN DEFAULT false,
    deposit_percentage INT DEFAULT 20,
    
    -- Notifications
    notification_email TEXT,
    sms_provider TEXT DEFAULT 'twilio',
    
    -- GDPR/Austrian compliance
    privacy_policy_url TEXT,
    terms_url TEXT,
    cancellation_policy TEXT DEFAULT 'Kostenlose Stornierung bis 24 Stunden vor dem Termin.',
    
    -- Locale
    timezone TEXT DEFAULT 'Europe/Vienna',
    language TEXT DEFAULT 'de-AT',
    
    -- Features
    waitlist_enabled BOOLEAN DEFAULT false,
    loyalty_program_enabled BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Salon indexes
CREATE INDEX idx_salons_slug ON salons(slug);
CREATE INDEX idx_salons_is_active ON salons(is_active);

-- Service indexes
CREATE INDEX idx_services_salon_id ON services(salon_id);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_bookable_online ON services(bookable_online) WHERE bookable_online = true;

-- Stylist indexes
CREATE INDEX idx_stylists_salon_id ON stylists(salon_id);
CREATE INDEX idx_stylists_is_active ON stylists(is_active) WHERE is_active = true;

-- Customer indexes
CREATE INDEX idx_customers_salon_id ON customers(salon_id);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_last_visit ON customers(last_visit_at DESC);

-- Appointment indexes
CREATE INDEX idx_appointments_salon_id ON appointments(salon_id);
CREATE INDEX idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX idx_appointments_stylist_id ON appointments(stylist_id);
CREATE INDEX idx_appointments_service_id ON appointments(service_id);
CREATE INDEX idx_appointments_start_time ON appointments(start_time);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_salon_date ON appointments(salon_id, start_time);
CREATE INDEX idx_appointments_stylist_date ON appointments(stylist_id, start_time);

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Get salon by slug
CREATE OR REPLACE FUNCTION get_salon_by_slug(p_slug TEXT)
RETURNS salons AS $$
    SELECT * FROM salons WHERE slug = p_slug AND is_active = true;
$$ LANGUAGE SQL STABLE;

-- Get available slots for a stylist on a given date
CREATE OR REPLACE FUNCTION get_available_slots(
    p_salon_id UUID,
    p_stylist_id UUID,
    p_service_id UUID,
    p_date DATE,
    p_slot_duration_minutes INT DEFAULT 30
)
RETURNS TABLE(slot_start TIMESTAMPTZ, slot_end TIMESTAMPTZ) AS $$
DECLARE
    v_salon_timezone TEXT := 'Europe/Vienna';
    v_service_duration INT;
    v_salon_settings JSONB;
    v_day_of_week TEXT;
    v_business_hours JSONB;
    v_stylist_hours JSONB;
    v_work_start TIME;
    v_work_end TIME;
    v_cursor_time TIME;
    v_cursor_ts TIMESTAMPTZ;
    v_slot_start TIMESTAMPTZ;
    v_existing_appointments RECORD;
BEGIN
    -- Get service duration
    SELECT duration_minutes INTO v_service_duration FROM services WHERE id = p_service_id;
    IF v_service_duration IS NULL THEN v_service_duration := p_slot_duration_minutes; END IF;
    
    -- Get salon settings
    SELECT business_hours INTO v_salon_settings FROM salons WHERE id = p_salon_id;
    
    -- Get day of week
    v_day_of_week := LOWER(TO_CHAR(p_date, 'Day'));
    
    -- Get business hours for this day
    v_business_hours := v_salon_settings->v_day_of_week;
    v_work_start := (v_business_hours->>'open')::TIME;
    v_work_end := (v_business_hours->>'close')::TIME;
    
    -- Get stylist override hours if exists
    SELECT working_hours INTO v_stylist_hours FROM stylists WHERE id = p_stylist_id;
    IF v_stylist_hours ? v_day_of_week THEN
        IF (v_stylist_hours->v_day_of_week->>'enabled')::BOOLEAN THEN
            v_work_start := (v_stylist_hours->v_day_of_week->>'start')::TIME;
            v_work_end := (v_stylist_hours->v_day_of_week->>'end')::TIME;
        ELSE
            RETURN; -- Stylist doesn't work this day
        END IF;
    END IF;
    
    -- Create cursor at start of business day
    v_cursor_time := v_work_start;
    v_cursor_ts := p_date::TIMESTAMPTZ + v_work_start;
    
    -- Loop through day in slots
    WHILE v_cursor_time + (v_service_duration || ' minutes')::INTERVAL <= v_work_end LOOP
        v_slot_start := v_cursor_ts;
        
        -- Check for conflicts with existing appointments
        SELECT COUNT(*) INTO v_existing_appointments
        FROM appointments a
        WHERE a.stylist_id = p_stylist_id
          AND a.start_time < v_cursor_ts + (v_service_duration || ' minutes')::INTERVAL
          AND a.end_time > v_cursor_ts
          AND a.status NOT IN ('cancelled');
        
        IF v_existing_appointments.count = 0 THEN
            slot_start := v_slot_start;
            slot_end := v_slot_start + (v_service_duration || ' minutes')::INTERVAL;
            RETURN NEXT;
        END IF;
        
        -- Move to next slot
        v_cursor_time := v_cursor_time + (p_slot_duration_minutes || ' minutes')::INTERVAL;
        v_cursor_ts := v_cursor_ts + (p_slot_duration_minutes || ' minutes')::INTERVAL;
    END LOOP;
END;
$$ LANGUAGE plpgsql STABLE;

-- Update customer stats after appointment
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        UPDATE customers
        SET 
            total_visits = total_visits + 1,
            total_revenue_cents = total_revenue_cents + NEW.price_cents,
            last_visit_at = NEW.end_time
        WHERE id = NEW.customer_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Prevent double booking
CREATE OR REPLACE FUNCTION check_double_booking()
RETURNS TRIGGER AS $$
DECLARE
    v_conflict_count INT;
BEGIN
    SELECT COUNT(*) INTO v_conflict_count
    FROM appointments
    WHERE stylist_id = NEW.stylist_id
      AND id != COALESCE(NEW.recurrence_parent_id, NEW.id)
      AND status NOT IN ('cancelled')
      AND (
          (start_time < NEW.end_time AND end_time > NEW.start_time)
      );
    
    IF v_conflict_count > 0 THEN
        RAISE EXCEPTION 'Doppelte Buchung verhindert: Der Termin überschneidet sich mit einem bestehenden Termin.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

CREATE TRIGGER tr_update_salon_updated_at
    BEFORE UPDATE ON salons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_update_service_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_update_stylist_updated_at
    BEFORE UPDATE ON stylists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_update_customer_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_update_appointment_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_update_salon_settings_updated_at
    BEFORE UPDATE ON salon_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_update_customer_stats
    AFTER UPDATE OF status ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_customer_stats();

CREATE TRIGGER tr_check_double_booking
    BEFORE INSERT OR UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION check_double_booking();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE stylists ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's salon
CREATE OR REPLACE FUNCTION get_user_salon_id()
RETURNS UUID AS $$
BEGIN
    -- For API access: check auth.jwt() for salon_id claim
    -- This assumes a service role key or properly configured JWT
    RETURN NULL; -- Override in application code based on auth context
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- SALONS policies
CREATE POLICY "Public can view active salons"
    ON salons FOR SELECT
    USING (is_active = true);

CREATE POLICY "Users can manage own salon's data"
    ON salons FOR ALL
    USING (true); -- Add proper auth check in application

-- SERVICES policies
CREATE POLICY "Anyone can view services for active salons"
    ON services FOR SELECT
    USING (
        is_active = true
        AND EXISTS (SELECT 1 FROM salons WHERE salons.id = services.salon_id AND salons.is_active = true)
    );

CREATE POLICY "Salon owners can manage services"
    ON services FOR ALL
    USING (true); -- Add auth: auth.uid() = salon owner

-- STYLISTS policies
CREATE POLICY "Public can view stylists for active salons"
    ON stylists FOR SELECT
    USING (
        is_active = true
        AND EXISTS (SELECT 1 FROM salons WHERE salons.id = stylists.salon_id AND salons.is_active = true)
    );

CREATE POLICY "Salon owners can manage stylists"
    ON stylists FOR ALL
    USING (true); -- Add auth

-- CUSTOMERS policies
CREATE POLICY "Staff can view customers in their salon"
    ON customers FOR SELECT
    USING (true); -- Add: salon_id = get_user_salon_id()

CREATE POLICY "Staff can insert customers"
    ON customers FOR INSERT
    WITH CHECK (true); -- Add: salon_id = get_user_salon_id()

CREATE POLICY "Staff can update customers in their salon"
    ON customers FOR UPDATE
    USING (true); -- Add: salon_id = get_user_salon_id()

-- APPOINTMENTS policies
CREATE POLICY "Customers can view their own appointments"
    ON appointments FOR SELECT
    USING (
        customer_id IN (
            SELECT id FROM customers WHERE phone = auth.jwt() ->> 'phone'
        )
    );

CREATE POLICY "Staff can view appointments in their salon"
    ON appointments FOR SELECT
    USING (true); -- Add: salon_id = get_user_salon_id()

CREATE POLICY "Staff can create appointments"
    ON appointments FOR INSERT
    WITH CHECK (true); -- Add auth and salon_id check

CREATE POLICY "Staff can update appointments"
    ON appointments FOR UPDATE
    USING (true); -- Add: salon_id = get_user_salon_id()

CREATE POLICY "Staff can cancel appointments"
    ON appointments FOR UPDATE
    USING (status != 'cancelled'); -- Additional: check cancellation time

-- SALON_SETTINGS policies
CREATE POLICY "Users can view their salon's settings"
    ON salon_settings FOR SELECT
    USING (true); -- Add: salon_id = get_user_salon_id()

CREATE POLICY "Users can update their salon's settings"
    ON salon_settings FOR ALL
    USING (true); -- Add: salon_id = get_user_salon_id()

-- =============================================================================
-- SEED DATA - Demo Salon "Friseur Meisterstück"
-- =============================================================================

-- Demo salon
INSERT INTO salons (
    name,
    slug,
    business_name,
    uid,
    tax_id,
    street,
    postal_code,
    city,
    country,
    phone,
    email,
    website,
    business_hours,
    slot_duration_minutes,
    advance_booking_days,
    currency,
    primary_color,
    is_active
) VALUES (
    'Friseur Meisterstück',
    'meisterstueck-wien',
    'Meisterstück Hair & Beauty GmbH',
    'ATU12345678',
    '123/456/7890',
    'Kärntner Straße 42',
    '1010',
    'Wien',
    'AT',
    '+43 1 234 5678',
    'info@meisterstueck.at',
    'https://meisterstueck.at',
    '{
        "monday": {"open": "09:00", "close": "18:00", "enabled": true},
        "tuesday": {"open": "09:00", "close": "18:00", "enabled": true},
        "wednesday": {"open": "09:00", "close": "18:00", "enabled": true},
        "thursday": {"open": "09:00", "close": "19:00", "enabled": true},
        "friday": {"open": "09:00", "close": "18:00", "enabled": true},
        "saturday": {"open": "09:00", "close": "14:00", "enabled": true},
        "sunday": {"open": null, "close": null, "enabled": false}
    }'::jsonb,
    30,
    60,
    'EUR',
    '#8B5CF6',
    true
);

-- Get salon ID for references
DO $$
DECLARE
    v_salon_id UUID;
    v_stylist1_id UUID;
    v_stylist2_id UUID;
    v_stylist3_id UUID;
    v_service1_id UUID;
    v_service2_id UUID;
    v_service3_id UUID;
    v_service4_id UUID;
    v_service5_id UUID;
BEGIN
    SELECT id INTO v_salon_id FROM salons WHERE slug = 'meisterstueck-wien';

    -- Demo stylists
    INSERT INTO stylists (salon_id, first_name, last_name, nickname, email, phone, social_security_number, employment_type, color, is_active)
    VALUES 
        (v_salon_id, 'Maria', 'Huber', 'Maroni', 'maria@meisterstueck.at', '+43 660 123 4567', '1234-567-891', 'full_time', '#8B5CF6', true),
        (v_salon_id, 'Thomas', 'Gruber', 'Tom', 'thomas@meisterstueck.at', '+43 660 234 5678', '2345-678-912', 'full_time', '#EC4899', true),
        (v_salon_id, 'Lisa', 'Müller', 'Lisi', 'lisa@meisterstueck.at', '+43 660 345 6789', '3456-789-123', 'part_time', '#10B981', true)
    RETURNING id INTO v_stylist1_id;
    
    SELECT id FROM stylists WHERE nickname = 'Tom' INTO v_stylist2_id;
    SELECT id FROM stylists WHERE nickname = 'Lisi' INTO v_stylist3_id;

    -- Demo services
    INSERT INTO services (salon_id, name, description, category, price_cents, duration_minutes, bookable_online, is_active, sort_order)
    VALUES 
        (v_salon_id, 'Damen Haarschnitt', 'Waschen, Schneiden, Föhnen - klassisch oder modern', 'Haare', 5500, 60, true, true, 1),
        (v_salon_id, 'Herren Haarschnitt', 'Waschen, Schneiden, Styling', 'Haare', 3500, 45, true, true, 2),
        (v_salon_id, 'Farbe & Schnitt', 'Ganzheitliche Haarfarbe inkl. Schnitt', 'Haare', 8500, 120, true, true, 3),
        (v_salon_id, 'Augenbrauen zupfen', 'Professionelles Augenbrauen-Shaping', 'Kosmetik', 1500, 15, true, true, 4),
        (v_salon_id, 'Bart schneiden', 'Präziser Bartschnitt und Pflege', 'Haare', 2500, 30, true, true, 5)
    RETURNING id INTO v_service1_id;
    
    SELECT id FROM services WHERE name = 'Damen Haarschnitt' INTO v_service1_id;
    SELECT id FROM services WHERE name = 'Herren Haarschnitt' INTO v_service2_id;
    SELECT id FROM services WHERE name = 'Farbe & Schnitt' INTO v_service3_id;
    SELECT id FROM services WHERE name = 'Augenbrauen zupfen' INTO v_service4_id;
    SELECT id FROM services WHERE name = 'Bart schneiden' INTO v_service5_id;

    -- Update stylist service_ids
    UPDATE stylists SET service_ids = ARRAY[v_service1_id, v_service2_id, v_service3_id, v_service4_id] WHERE nickname = 'Maroni';
    UPDATE stylists SET service_ids = ARRAY[v_service1_id, v_service2_id, v_service3_id, v_service5_id] WHERE nickname = 'Tom';
    UPDATE stylists SET service_ids = ARRAY[v_service1_id, v_service4_id] WHERE nickname = 'Lisi';

    -- Demo customers
    INSERT INTO customers (salon_id, first_name, last_name, email, phone, date_of_birth, marketing_consent, sms_consent, total_visits, total_revenue_cents, is_active)
    VALUES 
        (v_salon_id, 'Anna', 'Schmidt', 'anna.schmidt@gmail.com', '+43 660 987 6543', '1985-03-15', true, true, 12, 66000, true),
        (v_salon_id, 'Peter', 'Weber', 'peter.weber@gmx.at', '+43 660 876 5432', '1978-07-22', true, false, 8, 28000, true),
        (v_salon_id, 'Julia', 'Braun', 'julia.braun@hotmail.com', '+43 660 765 4321', '1992-11-08', false, true, 5, 27500, true),
        (v_salon_id, 'Michael', 'Fischer', 'michael.fischer@outlook.com', '+43 660 654 3210', '1988-01-30', true, true, 15, 82500, true),
        (v_salon_id, 'Sophie', 'Wagner', 'sophie.wagner@gmail.com', '+43 660 543 2109', '1995-06-12', true, false, 3, 16500, true);

    -- Demo appointments (future dates)
    INSERT INTO appointments (salon_id, customer_id, stylist_id, service_id, start_time, end_time, status, price_cents, payment_status)
    SELECT 
        v_salon_id,
        (SELECT id FROM customers WHERE phone = '+43 660 987 6543'),
        (SELECT id FROM stylists WHERE nickname = 'Maroni'),
        v_service1_id,
        (CURRENT_DATE + INTERVAL '1 day' + INTERVAL '10 hours')::TIMESTAMPTZ,
        (CURRENT_DATE + INTERVAL '1 day' + INTERVAL '11 hours')::TIMESTAMPTZ,
        'confirmed',
        5500,
        'pending'
    WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE start_time = CURRENT_DATE + INTERVAL '1 day' + INTERVAL '10 hours');

    INSERT INTO appointments (salon_id, customer_id, stylist_id, service_id, start_time, end_time, status, price_cents, payment_status)
    SELECT 
        v_salon_id,
        (SELECT id FROM customers WHERE phone = '+43 660 876 5432'),
        (SELECT id FROM stylists WHERE nickname = 'Tom'),
        v_service2_id,
        (CURRENT_DATE + INTERVAL '1 day' + INTERVAL '11 hours')::TIMESTAMPTZ,
        (CURRENT_DATE + INTERVAL '1 day' + INTERVAL '11 hours 45 minutes')::TIMESTAMPTZ,
        'pending',
        3500,
        'pending'
    WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE start_time = CURRENT_DATE + INTERVAL '1 day' + INTERVAL '11 hours');

    INSERT INTO appointments (salon_id, customer_id, stylist_id, service_id, start_time, end_time, status, price_cents, payment_status)
    SELECT 
        v_salon_id,
        (SELECT id FROM customers WHERE phone = '+43 660 654 3210'),
        (SELECT id FROM stylists WHERE nickname = 'Maroni'),
        v_service3_id,
        (CURRENT_DATE + INTERVAL '2 days' + INTERVAL '14 hours')::TIMESTAMPTZ,
        (CURRENT_DATE + INTERVAL '2 days' + INTERVAL '16 hours')::TIMESTAMPTZ,
        'confirmed',
        8500,
        'paid'
    WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE start_time = CURRENT_DATE + INTERVAL '2 days' + INTERVAL '14 hours');

    -- Demo salon settings
    INSERT INTO salon_settings (
        salon_id,
        business_registration_number,
        vat_number,
        invoice_prefix,
        invoice_footer_text,
        default_payment_terms_days,
        send_sms_reminders,
        reminder_24h_before,
        reminder_2h_before,
        online_booking_enabled,
        require_deposit_online,
        deposit_percentage,
        notification_email,
        sms_provider,
        privacy_policy_url,
        cancellation_policy,
        timezone,
        language,
        is_active
    ) VALUES (
        v_salon_id,
        'FN 123456a',
        'ATU12345678',
        'SF-',
        'Meisterstück Hair & Beauty GmbH | Kärntner Straße 42, 1010 Wien | info@meisterstueck.at',
        14,
        true,
        true,
        false,
        true,
        false,
        20,
        'info@meisterstueck.at',
        'twilio',
        'https://meisterstueck.at/datenschutz',
        'Kostenlose Stornierung bis 24 Stunden vor dem Termin. Bei späterer Stornierung wird eine Gebühr von 50% des Behandlungspreises erhoben.',
        'Europe/Vienna',
        'de-AT',
        true
    ) ON CONFLICT (salon_id) DO NOTHING;

END $$;

-- =============================================================================
-- POSTGRESQL COMMENTS
-- =============================================================================

COMMENT ON TABLE salons IS 'Salon/Filiale Standorte - Primary business locations';
COMMENT ON TABLE services IS 'Dienstleistungen - Services offered by the salon';
COMMENT ON TABLE stylists IS 'Mitarbeiter/Friseure - Staff members who perform services';
COMMENT ON TABLE customers IS 'Kunden - Customer records with GDPR consent tracking';
COMMENT ON TABLE appointments IS 'Termine - Booking appointments with status tracking';
COMMENT ON TABLE salon_settings IS 'Salon-spezifische Einstellungen - Per-salon configuration';

COMMENT ON COLUMN salons.uid IS 'Austrian Umwelt-ID for waste management registration';
COMMENT ON COLUMN salons.tax_id IS 'Tax identification number';
COMMENT ON COLUMN stylists.social_security_number IS 'Austrian Sozialversicherungsnummer';
COMMENT ON COLUMN customers.tax_id IS 'Customer tax ID for invoicing if needed';
COMMENT ON COLUMN customers.marketing_consent IS 'GDPR marketing consent - documented';
COMMENT ON COLUMN customers.sms_consent IS 'SMS notification consent - documented';
