import Database from 'better-sqlite3';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'salonflow.db');

// Ensure data directory exists
if (!existsSync(DB_DIR)) {
  mkdirSync(DB_DIR, { recursive: true });
}

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
    initSchema(_db);
    seedDemoData(_db);
  }
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS salon (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      email TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      description TEXT,
      business_hours TEXT
    );

    CREATE TABLE IF NOT EXISTS stylists (
      id TEXT PRIMARY KEY,
      salon_id TEXT,
      name TEXT NOT NULL,
      avatar_url TEXT,
      active INTEGER DEFAULT 1,
      FOREIGN KEY (salon_id) REFERENCES salon(id)
    );

    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      salon_id TEXT,
      name TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      price_cents INTEGER NOT NULL,
      category TEXT DEFAULT 'other',
      active INTEGER DEFAULT 1,
      FOREIGN KEY (salon_id) REFERENCES salon(id)
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      salon_id TEXT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (salon_id) REFERENCES salon(id)
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      salon_id TEXT NOT NULL,
      customer_id TEXT,
      service_id TEXT NOT NULL,
      stylist_id TEXT,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      notes TEXT,
      customer_name TEXT,
      customer_phone TEXT,
      customer_email TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (salon_id) REFERENCES salon(id),
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (service_id) REFERENCES services(id),
      FOREIGN KEY (stylist_id) REFERENCES stylists(id)
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      salon_id TEXT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      role TEXT DEFAULT 'admin',
      FOREIGN KEY (salon_id) REFERENCES salon(id)
    );
  `);
  initNewSchema(db);
}

function seedDemoData(db: Database.Database) {
  const salonCount = db.prepare('SELECT COUNT(*) as c FROM salon').get() as { c: number };
  if (salonCount.c > 0) return;

  // Seed salon
  db.prepare(`
    INSERT INTO salon (id, name, slug, email, phone, address, city, description, business_hours)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'demo-salon-001',
    'Friseur Meisterstück',
    'demo-salon',
    'info@meisterstueck.at',
    '+43 1 234 5678',
    'Kärntner Straße 42, 1010 Wien',
    'Wien',
    'Ihr Friseur in Wien mit über 20 Jahren Erfahrung',
    'Mo-Fr: 9:00-18:00, Sa: 9:00-14:00'
  );

  // Seed stylists
  const stylists = [
    { id: 'stylist-1', name: 'Maria' },
    { id: 'stylist-2', name: 'Thomas' },
    { id: 'stylist-3', name: 'Lisa' },
  ];
  const insertStylist = db.prepare(`
    INSERT INTO stylists (id, salon_id, name, active) VALUES (?, ?, ?, 1)
  `);
  for (const s of stylists) {
    insertStylist.run(s.id, 'demo-salon-001', s.name);
  }

  // Seed services
  const services = [
    { id: 'svc-1', name: 'Damenschnitt', duration: 45, price: 3500, cat: 'cut' },
    { id: 'svc-2', name: 'Herrenschnitt', duration: 30, price: 2500, cat: 'cut' },
    { id: 'svc-3', name: 'Coloring', duration: 90, price: 6500, cat: 'color' },
    { id: 'svc-4', name: 'Augenbrauen zupfen', duration: 15, price: 1000, cat: 'other' },
    { id: 'svc-5', name: 'Bart schneiden', duration: 20, price: 1500, cat: 'other' },
  ];
  const insertService = db.prepare(`
    INSERT INTO services (id, salon_id, name, duration_minutes, price_cents, category, active)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `);
  for (const s of services) {
    insertService.run(s.id, 'demo-salon-001', s.name, s.duration, s.price, s.cat);
  }

  // Seed demo user
  db.prepare(`
    INSERT INTO users (id, salon_id, email, password_hash, name, role)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('user-1', 'demo-salon-001', 'demo@salonflow.app', 'demo123', 'Demo Admin', 'admin');

  // Seed some demo appointments for today/tomorrow
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const fmt = (d: Date) => d.toISOString().slice(0, 16);

  const appts = [
    {
      id: 'apt-1',
      start: fmt(new Date(today.setHours(10, 0, 0, 0))),
      end: fmt(new Date(today.setHours(10, 45, 0, 0))),
      status: 'confirmed',
      service: 'svc-1',
      stylist: 'stylist-1',
      cname: 'Anna Müller',
      cphone: '+43 650 123 4567',
      cemail: 'anna.mueller@email.at',
    },
    {
      id: 'apt-2',
      start: fmt(new Date(tomorrow.setHours(14, 0, 0, 0))),
      end: fmt(new Date(tomorrow.setHours(14, 30, 0, 0))),
      status: 'pending',
      service: 'svc-2',
      stylist: 'stylist-2',
      cname: 'Bernhard Huber',
      cphone: '+43 660 987 6543',
      cemail: 'b.huber@email.at',
    },
  ];

  const insertAppt = db.prepare(`
    INSERT INTO appointments (id, salon_id, service_id, stylist_id, start_time, end_time, status, customer_name, customer_phone, customer_email, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);
  for (const a of appts) {
    insertAppt.run(a.id, 'demo-salon-001', a.service, a.stylist, a.start, a.end, a.status, a.cname, a.cphone, a.cemail);
  }

  // Seed some customers
  const customers = [
    { id: 'cust-1', name: 'Anna Müller', phone: '+43 650 123 4567', email: 'anna.mueller@email.at' },
    { id: 'cust-2', name: 'Bernhard Huber', phone: '+43 660 987 6543', email: 'b.huber@email.at' },
    { id: 'cust-3', name: 'Clara Schmidt', phone: '+43 664 111 2233', email: 'clara.s@mail.at' },
  ];
  const insertCust = db.prepare(`
    INSERT INTO customers (id, salon_id, name, phone, email, created_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `);
  for (const c of customers) {
    insertCust.run(c.id, 'demo-salon-001', c.name, c.phone, c.email);
  }

  // Seed membership plans
  const plans = [
    { id: 'plan-1', name: 'Basic', desc: '10% discount on all services', days: 30, price: 1999, discount: 10 },
    { id: 'plan-2', name: 'Premium', desc: '20% discount + 2 free eyebrow sessions', days: 90, price: 4999, discount: 20 },
  ];
  const insertPlan = db.prepare(`
    INSERT INTO membership_plans (id, salon_id, name, description, duration_days, price_cents, discount_percent, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `);
  for (const p of plans) {
    insertPlan.run(p.id, 'demo-salon-001', p.name, p.desc, p.days, p.price, p.discount);
  }

  // Seed customer_memberships (linking customers to plans)
  // Note: memberships table has mem-1/mem-2 (Monats-Abo/Jahres-Abo), membership_plans has plan-1/plan-2 (Basic/Premium)
  // customer_memberships.membership_id references memberships.id, so we use mem-1/mem-2
  const customerMemberships = [
    { id: 'cm-1', customer: 'cust-1', membership: 'mem-1', status: 'active' },
    { id: 'cm-2', customer: 'cust-2', membership: 'mem-2', status: 'active' },
  ];
  const insertCustMem = db.prepare(`
    INSERT INTO customer_memberships (id, customer_id, membership_id, start_date, end_date, status)
    VALUES (?, ?, ?, date('now'), date('now', '+' || ? || ' days'), ?)
  `);
  for (const m of customerMemberships) {
    const mem = memberships.find(p => p.id === m.membership);
    insertCustMem.run(m.id, m.customer, m.membership, mem?.days || 30, m.status);
  }

  // Seed coupons
  const coupons = [
    { id: 'coupon-1', code: 'WELCOME10', dtype: 'percent', dvalue: 10, minorder: 0, maxuses: 100, validfrom: null, validuntil: null },
    { id: 'coupon-2', code: 'SUMMER20', dtype: 'percent', dvalue: 20, minorder: 2000, maxuses: 50, validfrom: '2026-06-01', validuntil: '2026-08-31' },
  ];
  const insertCoupon = db.prepare(`
    INSERT INTO coupons (id, salon_id, code, discount_type, discount_value, min_order_cents, max_uses, valid_from, valid_until, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);
  for (const c of coupons) {
    insertCoupon.run(c.id, 'demo-salon-001', c.code, c.dtype, c.dvalue, c.minorder, c.maxuses, c.validfrom, c.validuntil);
  }

  // Seed commissions
  const commissions = [
    { id: 'comm-1', stylist: 'stylist-1', service: 'svc-1', percent: 30 },
    { id: 'comm-2', stylist: 'stylist-1', service: 'svc-3', percent: 40 },
    { id: 'comm-3', stylist: 'stylist-2', service: 'svc-2', percent: 25 },
  ];
  const insertComm = db.prepare(`
    INSERT INTO commissions (id, salon_id, stylist_id, service_id, commission_percent)
    VALUES (?, ?, ?, ?, ?)
  `);
  for (const c of commissions) {
    insertComm.run(c.id, 'demo-salon-001', c.stylist, c.service, c.percent);
  }

  // Seed reminders
  const reminders = [
    { id: 'rem-1', rtype: 'appointment', days: 1, template: 'Hallo {{customer_name}}, wir erinnern Sie an Ihren Termin am {{date}} um {{time}}.' },
    { id: 'rem-2', rtype: 'appointment', days: 7, template: 'Ihr Termin in einer Woche: {{date}} um {{time}}. Wir freuen uns auf Sie!' },
  ];
  const insertRem = db.prepare(`
    INSERT INTO reminders (id, salon_id, reminder_type, timing_days_before, message_template, active)
    VALUES (?, ?, ?, ?, ?, 1)
  `);
  for (const r of reminders) {
    insertRem.run(r.id, 'demo-salon-001', r.rtype, r.days, r.template);
  }

  seedNewData(db);
}

// =============================================================================
// QUERY FUNCTIONS
// =============================================================================

export function _getSalon(slug?: string) {
  const db = getDb();
  if (!slug || slug === 'demo-salon') {
    return db.prepare('SELECT * FROM salon WHERE slug = ?').get('demo-salon');
  }
  return db.prepare('SELECT * FROM salon WHERE slug = ?').get(slug);
}

export function getSalonServices(salonId: string = 'demo-salon-001') {
  const db = getDb();
  return db.prepare('SELECT * FROM services WHERE salon_id = ? AND active = 1').all(salonId);
}

export function getServiceById(id: string) {
  const db = getDb();
  return db.prepare('SELECT * FROM services WHERE id = ?').get(id);
}

export function updateService(id: string, data: Partial<{
  name: string;
  duration_minutes: number;
  duration_min: number;
  price_cents: number;
  category: string;
  active: number;
}>) {
  const db = getDb();
  const sets: string[] = [];
  const vals: any[] = [];

  if (data.name !== undefined) {
    sets.push('name = ?');
    vals.push(data.name);
  }
  if (data.duration_minutes !== undefined || data.duration_min !== undefined) {
    sets.push('duration_minutes = ?');
    vals.push(data.duration_minutes ?? data.duration_min);
  }
  if (data.price_cents !== undefined) {
    sets.push('price_cents = ?');
    vals.push(data.price_cents);
  }
  if (data.category !== undefined) {
    sets.push('category = ?');
    vals.push(data.category);
  }
  if (data.active !== undefined) {
    sets.push('active = ?');
    vals.push(data.active);
  }

  if (sets.length === 0) return getServiceById(id);

  vals.push(id);
  db.prepare(`UPDATE services SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
  return getServiceById(id);
}

export function deleteService(id: string) {
  const db = getDb();
  db.prepare('UPDATE services SET active = 0 WHERE id = ?').run(id);
}

export function getSalonStylists(salonId: string = 'demo-salon-001') {
  const db = getDb();
  return db.prepare('SELECT * FROM stylists WHERE salon_id = ? AND active = 1').all(salonId);
}

export function getAppointments_(opts: { salonId?: string; date?: string; stylistId?: string; startDate?: string; endDate?: string }) {
  const db = getDb();
  const { date, stylistId, salonId = 'demo-salon-001', startDate, endDate } = opts;

  let query = `
    SELECT
      a.id, a.start_time, a.end_time, a.status, a.notes,
      a.customer_id, a.customer_name, a.customer_phone, a.customer_email,
      s.name as service_name, s.price_cents, s.duration_minutes,
      st.name as stylist_name, st.id as stylist_id
    FROM appointments a
    LEFT JOIN services s ON a.service_id = s.id
    LEFT JOIN stylists st ON a.stylist_id = st.id
    WHERE a.salon_id = ?
  `;
  const params: any[] = [salonId];

  // Backward-compatible single-day filter
  if (date) {
    query += ' AND date(a.start_time) = date(?)';
    params.push(date);
  } else {
    // Range filters used by API route (/api/appointments?startDate=...&endDate=...)
    if (startDate && endDate) {
      query += ' AND date(a.start_time) BETWEEN date(?) AND date(?)';
      params.push(startDate, endDate);
    } else if (startDate) {
      query += ' AND date(a.start_time) >= date(?)';
      params.push(startDate);
    } else if (endDate) {
      query += ' AND date(a.start_time) <= date(?)';
      params.push(endDate);
    }
  }

  if (stylistId) {
    query += ' AND a.stylist_id = ?';
    params.push(stylistId);
  }

  query += ' ORDER BY a.start_time ASC';

  return db.prepare(query).all(...params);
}

export function getAppointmentById(id: string) {
  const db = getDb();
  return db.prepare(`
    SELECT
      a.*,
      s.name as service_name, s.price_cents, s.duration_minutes,
      st.name as stylist_name, st.id as stylist_id
    FROM appointments a
    LEFT JOIN services s ON a.service_id = s.id
    LEFT JOIN stylists st ON a.stylist_id = st.id
    WHERE a.id = ?
  `).get(id);
}

export function _createAppointment(data: {
  serviceId: string;
  stylistId?: string;
  startTime: string;
  endTime?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
}) {
  const db = getDb();
  const id = `apt-${Date.now()}`;
  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(data.serviceId) as any;
  if (!service) throw new Error('Service not found');

  const start = new Date(data.startTime);
  const end = data.endTime
    ? new Date(data.endTime)
    : new Date(start.getTime() + service.duration_minutes * 60000);
  const formatLocalDateTime = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };
  const startSql = formatLocalDateTime(start);
  const endSql = formatLocalDateTime(end);

  // Find or create customer
  let customerId: string | null = null;
  if (data.customerPhone) {
    const existing = db.prepare(
      'SELECT id FROM customers WHERE phone = ? AND salon_id = ?'
    ).get(data.customerPhone, 'demo-salon-001') as any;
    if (existing) {
      customerId = existing.id;
    } else {
      customerId = `cust-${Date.now()}`;
      db.prepare(
        'INSERT INTO customers (id, salon_id, name, phone, email) VALUES (?, ?, ?, ?, ?)'
      ).run(customerId, 'demo-salon-001', data.customerName, data.customerPhone, data.customerEmail || null);
    }
  }

  db.prepare(`
    INSERT INTO appointments (id, salon_id, customer_id, service_id, stylist_id, start_time, end_time, status, customer_name, customer_phone, customer_email)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)
  `).run(
    id,
    'demo-salon-001',
    customerId,
    data.serviceId,
    data.stylistId || 'stylist-1',
    startSql,
    endSql,
    data.customerName,
    data.customerPhone,
    data.customerEmail || null
  );

  // Generate verify token = base64 of id
  const token = Buffer.from(id).toString('base64');
  return { id, token, start_time: startSql, end_time: endSql, status: 'pending' };
}

export function updateAppointmentStatus(id: string, status: string, notes?: string) {
  const db = getDb();
  if (notes !== undefined) {
    db.prepare('UPDATE appointments SET status = ?, notes = ? WHERE id = ?').run(status, notes, id);
  } else {
    db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run(status, id);
  }
  return getAppointmentById(id);
}

export function getBookedSlots(date: string, stylistId?: string) {
  const db = getDb();
  const params: any[] = [date];
  let query = `
    SELECT start_time, end_time FROM appointments
    WHERE date(start_time) = ? AND status NOT IN ('cancelled', 'no_show')
  `;
  if (stylistId) {
    query += ' AND stylist_id = ?';
    params.push(stylistId);
  }
  return db.prepare(query).all(...params) as { start_time: string; end_time: string }[];
}

export function _getCustomers(salonId: string = 'demo-salon-001') {
  const db = getDb();
  return db.prepare(`
    SELECT c.*,
      COUNT(a.id) as total_visits,
      MAX(a.start_time) as last_visit_at
    FROM customers c
    LEFT JOIN appointments a ON a.customer_id = c.id
    WHERE c.salon_id = ?
    GROUP BY c.id
    ORDER BY c.name ASC
  `).all(salonId);
}

export function verifyUser(email: string, password: string) {
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!user) return null;
  // Plain text check for demo
  if (user.password_hash !== password) return null;
  return { id: user.id, email: user.email, name: user.name, salonId: user.salon_id };
}

export function getStylists(salonId: string = 'demo-salon-001') {
  const db = getDb();
  return db.prepare('SELECT * FROM stylists WHERE salon_id = ? ORDER BY name ASC').all(salonId);
}

export function createStylist(data: { name: string; avatar_url?: string }) {
  const db = getDb();
  const id = `stylist-${Date.now()}`;
  db.prepare(
    'INSERT INTO stylists (id, salon_id, name, avatar_url, active) VALUES (?, ?, ?, ?, 1)'
  ).run(id, 'demo-salon-001', data.name, data.avatar_url || null);
  return { id, name: data.name, avatar_url: data.avatar_url || null, active: 1 };
}

export function updateStylist(id: string, data: { name?: string; avatar_url?: string; active?: number }) {
  const db = getDb();
  const sets: string[] = [];
  const vals: any[] = [];
  if (data.name !== undefined) { sets.push('name = ?'); vals.push(data.name); }
  if (data.avatar_url !== undefined) { sets.push('avatar_url = ?'); vals.push(data.avatar_url); }
  if (data.active !== undefined) { sets.push('active = ?'); vals.push(data.active); }
  if (sets.length === 0) return db.prepare('SELECT * FROM stylists WHERE id = ?').get(id);
  vals.push(id);
  db.prepare(`UPDATE stylists SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
  return db.prepare('SELECT * FROM stylists WHERE id = ?').get(id);
}

export function deleteStylist(id: string) {
  const db = getDb();
  db.prepare('UPDATE stylists SET active = 0 WHERE id = ?').run(id);
}

// =============================================================================
// NEW TABLES SCHEMA
// =============================================================================

function initNewSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      salon_id TEXT,
      name TEXT NOT NULL,
      sku TEXT,
      description TEXT,
      price_cents INTEGER NOT NULL DEFAULT 0,
      cost_cents INTEGER DEFAULT 0,
      stock_quantity INTEGER DEFAULT 0,
      low_stock_threshold INTEGER DEFAULT 10,
      category TEXT DEFAULT 'other',
      image_url TEXT,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (salon_id) REFERENCES salon(id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      salon_id TEXT,
      customer_id TEXT,
      appointment_id TEXT,
      amount_cents INTEGER NOT NULL,
      method TEXT DEFAULT 'cash',
      status TEXT DEFAULT 'completed',
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (salon_id) REFERENCES salon(id),
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (appointment_id) REFERENCES appointments(id)
    );

    CREATE TABLE IF NOT EXISTS memberships (
      id TEXT PRIMARY KEY,
      salon_id TEXT,
      name TEXT NOT NULL,
      description TEXT,
      price_cents INTEGER NOT NULL,
      duration_days INTEGER NOT NULL,
      benefits TEXT,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (salon_id) REFERENCES salon(id)
    );

    CREATE TABLE IF NOT EXISTS customer_memberships (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      membership_id TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      auto_renew INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (membership_id) REFERENCES memberships(id)
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id TEXT PRIMARY KEY,
      salon_id TEXT,
      code TEXT NOT NULL,
      discount_type TEXT DEFAULT 'percent',
      discount_value INTEGER NOT NULL,
      min_order_cents INTEGER DEFAULT 0,
      max_uses INTEGER,
      used_count INTEGER DEFAULT 0,
      valid_from TEXT,
      valid_until TEXT,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (salon_id) REFERENCES salon(id)
    );

    CREATE TABLE IF NOT EXISTS customer_forms (
      id TEXT PRIMARY KEY,
      salon_id TEXT,
      customer_id TEXT,
      form_type TEXT NOT NULL,
      form_data TEXT,
      submitted_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (salon_id) REFERENCES salon(id),
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY,
      salon_id TEXT,
      customer_id TEXT,
      appointment_id TEXT,
      reminder_type TEXT DEFAULT 'email',
      scheduled_at TEXT NOT NULL,
      sent_at TEXT,
      status TEXT DEFAULT 'pending',
      message TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (salon_id) REFERENCES salon(id),
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (appointment_id) REFERENCES appointments(id)
    );

    CREATE TABLE IF NOT EXISTS membership_plans (
      id TEXT PRIMARY KEY,
      salon_id TEXT,
      name TEXT NOT NULL,
      description TEXT,
      duration_days INTEGER NOT NULL,
      price_cents INTEGER NOT NULL,
      discount_percent INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (salon_id) REFERENCES salon(id)
    );

    CREATE TABLE IF NOT EXISTS commission_plans (
      id TEXT PRIMARY KEY,
      salon_id TEXT,
      name TEXT NOT NULL,
      type TEXT DEFAULT 'percentage',
      value_cents INTEGER NOT NULL,
      service_category TEXT,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (salon_id) REFERENCES salon(id)
    );

    CREATE TABLE IF NOT EXISTS campaigns (
      id TEXT PRIMARY KEY,
      salon_id TEXT,
      name TEXT NOT NULL,
      type TEXT DEFAULT 'winback',
      target_segment TEXT,
      message TEXT NOT NULL,
      sent_count INTEGER DEFAULT 0,
      opened_count INTEGER DEFAULT 0,
      conversion_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'draft',
      scheduled_at TEXT,
      sent_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (salon_id) REFERENCES salon(id)
    );
  `);

  // Lightweight in-place migrations for older SQLite files.
  // CREATE TABLE IF NOT EXISTS does not add missing columns on existing tables.
  const productColumns = (db.prepare('PRAGMA table_info(products)').all() as Array<{ name: string }>).map((c) => c.name);
  if (!productColumns.includes('low_stock_threshold')) {
    db.exec('ALTER TABLE products ADD COLUMN low_stock_threshold INTEGER DEFAULT 10');
  }
  if (!productColumns.includes('image_url')) {
    db.exec('ALTER TABLE products ADD COLUMN image_url TEXT');
  }
  if (!productColumns.includes('created_at')) {
    db.exec('ALTER TABLE products ADD COLUMN created_at TEXT');
  }
}


function seedNewData(db: Database.Database) {
  // Seed products
  const products = [
    { id: 'prod-1', name: 'Pflege-Öl', price: 2500, cost: 1200, stock: 25, threshold: 5, cat: 'care' },
    { id: 'prod-2', name: 'Shampoo Premium', price: 1800, cost: 800, stock: 40, threshold: 10, cat: 'care' },
    { id: 'prod-3', name: 'Haarwachs', price: 1500, cost: 600, stock: 8, threshold: 10, cat: 'styling' },
    { id: 'prod-4', name: 'Conditioner', price: 2000, cost: 900, stock: 30, threshold: 8, cat: 'care' },
    { id: 'prod-5', name: 'Styling-Gel', price: 1200, cost: 500, stock: 3, threshold: 10, cat: 'styling' },
  ];
  const insertProduct = db.prepare(`
    INSERT OR IGNORE INTO products (id, salon_id, name, price_cents, cost_cents, stock_quantity, low_stock_threshold, category, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);
  for (const p of products) {
    insertProduct.run(p.id, 'demo-salon-001', p.name, p.price, p.cost, p.stock, p.threshold, p.cat);
  }

  // Seed memberships
  const memberships = [
    { id: 'mem-1', name: 'Monats-Abo', price: 9900, days: 30, benefits: 'Unbegrenzte Schnitte, 10% Ermäßigung auf Produkte' },
    { id: 'mem-2', name: 'Jahres-Abo', price: 89900, days: 365, benefits: 'Unbegrenzte Schnitte, 15% Ermäßigung auf Produkte, Kostenlose Beratung' },
  ];
  const insertMembership = db.prepare(`
    INSERT OR IGNORE INTO memberships (id, salon_id, name, price_cents, duration_days, benefits, active)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `);
  for (const m of memberships) {
    insertMembership.run(m.id, 'demo-salon-001', m.name, m.price, m.days, m.benefits);
  }

  // Seed customer_memberships
  const custMems = [
    { id: 'cm-1', cust: 'cust-1', mem: 'mem-1', start: '2026-01-01', end: '2026-12-31', status: 'active' },
  ];
  const insertCustMem = db.prepare(`
    INSERT OR IGNORE INTO customer_memberships (id, customer_id, membership_id, start_date, end_date, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const cm of custMems) {
    insertCustMem.run(cm.id, cm.cust, cm.mem, cm.start, cm.end, cm.status);
  }

  // Seed coupons
  const coupons = [
    { id: 'coupon-1', code: 'WILLKOMMEN10', discount_type: 'percent', discount_value: 10, min_order: 0, max_uses: 100 },
    { id: 'coupon-2', code: 'SPAZI20', discount_type: 'percent', discount_value: 20, min_order: 5000, max_uses: 50 },
  ];
  const insertCoupon = db.prepare(`
    INSERT OR IGNORE INTO coupons (id, salon_id, code, discount_type, discount_value, min_order_cents, max_uses, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `);
  for (const c of coupons) {
    insertCoupon.run(c.id, 'demo-salon-001', c.code, c.discount_type, c.discount_value, c.min_order, c.max_uses);
  }

  // Seed payments
  const payments = [
    { id: 'pay-1', cust: 'cust-1', amount: 3500, method: 'cash', status: 'completed' },
    { id: 'pay-2', cust: 'cust-2', amount: 2500, method: 'card', status: 'completed' },
    { id: 'pay-3', cust: 'cust-1', amount: 9900, method: 'card', status: 'completed' },
  ];
  const insertPayment = db.prepare(`
    INSERT OR IGNORE INTO payments (id, salon_id, customer_id, amount_cents, method, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const p of payments) {
    insertPayment.run(p.id, 'demo-salon-001', p.cust, p.amount, p.method, p.status);
  }

  // Seed commission_plans
  const plans = [
    { id: 'plan-1', name: 'Standard Provision', type: 'percentage', value: 3000, cat: null },
    { id: 'plan-2', name: 'Colorist Provision', type: 'percentage', value: 4000, cat: 'color' },
  ];
  const insertPlan = db.prepare(`
    INSERT OR IGNORE INTO commission_plans (id, salon_id, name, type, value_cents, service_category, active)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `);
  for (const pl of plans) {
    insertPlan.run(pl.id, 'demo-salon-001', pl.name, pl.type, pl.value, pl.cat);
  }

  // Seed campaigns (winback)
  const campaigns = [
    { id: 'camp-1', name: 'Frühjahrs-Winback', type: 'winback', segment: 'inactive_60', message: 'Wir vermissen Sie! Kommen Sie vorbei und erhalten Sie 15% Rabatt auf alle Services.', status: 'draft' },
    { id: 'camp-2', name: 'Sommer-Aktion', type: 'promotion', segment: 'all', message: 'Genießen Sie den Sommer mit einem neuen Look! Buchen Sie jetzt.', status: 'draft' },
  ];
  const insertCamp = db.prepare(`
    INSERT OR IGNORE INTO campaigns (id, salon_id, name, type, target_segment, message, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const c of campaigns) {
    insertCamp.run(c.id, 'demo-salon-001', c.name, c.type, c.segment, c.message, c.status);
  }
}

// =============================================================================
// PRODUCT FUNCTIONS
// =============================================================================

export function _getProducts(salonId: string = 'demo-salon-001') {
  const db = getDb();
  return db.prepare('SELECT * FROM products WHERE salon_id = ? AND active = 1 ORDER BY name ASC').all(salonId);
}

export function getProductById(id: string) {
  const db = getDb();
  return db.prepare('SELECT * FROM products WHERE id = ?').get(id);
}

export function createProduct(data: {
  name: string;
  sku?: string;
  description?: string;
  price_cents: number;
  cost_cents?: number;
  stock_quantity?: number;
  low_stock_threshold?: number;
  category?: string;
  image_url?: string;
}) {
  const db = getDb();
  const id = `prod-${Date.now()}`;
  db.prepare(`
    INSERT INTO products (id, salon_id, name, sku, description, price_cents, cost_cents, stock_quantity, low_stock_threshold, category, image_url, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `).run(
    id, 'demo-salon-001', data.name, data.sku || null, data.description || null,
    data.price_cents, data.cost_cents || 0, data.stock_quantity || 0,
    data.low_stock_threshold || 10, data.category || 'other', data.image_url || null
  );
  return getProductById(id);
}

export function updateProduct(id: string, data: Partial<{
  name: string; sku: string; description: string; price_cents: number;
  cost_cents: number; stock_quantity: number; low_stock_threshold: number;
  category: string; image_url: string; active: number
}>) {
  const db = getDb();
  const sets: string[] = [];
  const vals: any[] = [];
  const allowed = ['name','sku','description','price_cents','cost_cents','stock_quantity','low_stock_threshold','category','image_url','active'];
  for (const k of allowed) {
    if ((data as any)[k] !== undefined) { sets.push(`${k} = ?`); vals.push((data as any)[k]); }
  }
  if (sets.length === 0) return getProductById(id);
  vals.push(id);
  db.prepare(`UPDATE products SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
  return getProductById(id);
}

export function updateProductStock(id: string, stock_quantity: number) {
  const db = getDb();
  db.prepare('UPDATE products SET stock_quantity = ? WHERE id = ?').run(stock_quantity, id);
  return getProductById(id);
}

export function deleteProduct(id: string) {
  const db = getDb();
  db.prepare('UPDATE products SET active = 0 WHERE id = ?').run(id);
}

export function getLowStockProducts(threshold?: number, salonId: string = 'demo-salon-001') {
  const db = getDb();
  const t = threshold ?? 10;
  return db.prepare(
    'SELECT * FROM products WHERE salon_id = ? AND active = 1 AND stock_quantity <= low_stock_threshold ORDER BY stock_quantity ASC'
  ).all(salonId);
}

// =============================================================================
// PAYMENT FUNCTIONS
// =============================================================================

export function _getPayments(opts: { salonId?: string; customerId?: string; appointmentId?: string }) {
  const db = getDb();
  const { salonId = 'demo-salon-001', customerId, appointmentId } = opts;
  let query = 'SELECT p.*, c.name as customer_name FROM payments p LEFT JOIN customers c ON p.customer_id = c.id WHERE p.salon_id = ?';
  const params: any[] = [salonId];
  if (customerId) { query += ' AND p.customer_id = ?'; params.push(customerId); }
  if (appointmentId) { query += ' AND p.appointment_id = ?'; params.push(appointmentId); }
  query += ' ORDER BY p.created_at DESC';
  return db.prepare(query).all(...params);
}

export function getPaymentById(id: string) {
  const db = getDb();
  return db.prepare('SELECT * FROM payments WHERE id = ?').get(id);
}

export function createPayment(data: {
  customer_id?: string;
  appointment_id?: string;
  amount_cents: number;
  method?: string;
  status?: string;
  notes?: string;
}) {
  const db = getDb();
  const id = `pay-${Date.now()}`;
  db.prepare(`
    INSERT INTO payments (id, salon_id, customer_id, appointment_id, amount_cents, method, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, 'demo-salon-001', data.customer_id || null, data.appointment_id || null, data.amount_cents, data.method || 'cash', data.status || 'completed', data.notes || null);
  return getPaymentById(id);
}

// CUSTOMER MEMBERSHIP FUNCTIONS — unified below at ~1105
// (old block removed to resolve duplicates)

// =============================================================================
// COUPON FUNCTIONS
// =============================================================================

// =============================================================================
// CAMPAIGN FUNCTIONS
// =============================================================================

export function _getCampaigns(salonId: string = 'demo-salon-001') {
  const db = getDb();
  return db.prepare('SELECT * FROM campaigns WHERE salon_id = ? ORDER BY created_at DESC').all(salonId);
}

export function getCampaignById(id: string) {
  const db = getDb();
  return db.prepare('SELECT * FROM campaigns WHERE id = ?').get(id);
}

export function createCampaign(data: {
  name: string;
  type?: string;
  target_segment?: string;
  message: string;
  status?: string;
  scheduled_at?: string;
}) {
  const db = getDb();
  const id = `camp-${Date.now()}`;
  db.prepare(`
    INSERT INTO campaigns (id, salon_id, name, type, target_segment, message, status, scheduled_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, 'demo-salon-001', data.name, data.type || 'winback', data.target_segment || 'all', data.message, data.status || 'draft', data.scheduled_at || null);
  return getCampaignById(id);
}

export function updateCampaign(id: string, data: Partial<{
  name: string; type: string; target_segment: string; message: string;
  status: string; scheduled_at: string; sent_at: string;
  sent_count: number; opened_count: number; conversion_count: number
}>) {
  const db = getDb();
  const sets: string[] = [];
  const vals: any[] = [];
  const allowed = ['name','type','target_segment','message','status','scheduled_at','sent_at','sent_count','opened_count','conversion_count'];
  for (const k of allowed) {
    if ((data as any)[k] !== undefined) { sets.push(`${k} = ?`); vals.push((data as any)[k]); }
  }
  if (sets.length === 0) return getCampaignById(id);
  vals.push(id);
  db.prepare(`UPDATE campaigns SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
  return getCampaignById(id);
}

export function sendCampaign(id: string) {
  const db = getDb();
  const campaign = getCampaignById(id) as any;
  if (!campaign) throw new Error('Campaign not found');
  if (campaign.status === 'sent') throw new Error('Campaign already sent');

  // Get target customers based on segment
  let customers: any[] = [];
  if (campaign.target_segment === 'all') {
    customers = db.prepare('SELECT * FROM customers WHERE salon_id = ?').all('demo-salon-001') as any[];
  } else if (campaign.target_segment === 'inactive_60') {
    customers = db.prepare(`
      SELECT c.* FROM customers c
      LEFT JOIN appointments a ON a.customer_id = c.id
      WHERE c.salon_id = ?
      GROUP BY c.id
      HAVING MAX(a.start_time) < datetime('now', '-60 days') OR MAX(a.start_time) IS NULL
    `).all('demo-salon-001') as any[];
  }

  // In a real system, would send emails/SMS here
  // For now, just update the campaign as sent
  const now = new Date().toISOString();
  db.prepare('UPDATE campaigns SET status = ?, sent_at = ?, sent_count = ? WHERE id = ?')
    .run('sent', now, customers.length, id);

  return { ...campaign, status: 'sent', sent_at: now, sent_count: customers.length };
}

// =============================================================================
// CUSTOMER FORM FUNCTIONS
// =============================================================================

export function getCustomerForms(opts: { salonId?: string; customerId?: string; form_type?: string }) {
  const db = getDb();
  const { salonId = 'demo-salon-001', customerId, form_type } = opts;
  let query = 'SELECT cf.*, c.name as customer_name FROM customer_forms cf LEFT JOIN customers c ON cf.customer_id = c.id WHERE cf.salon_id = ?';
  const params: any[] = [salonId];
  if (customerId) { query += ' AND cf.customer_id = ?'; params.push(customerId); }
  if (form_type) { query += ' AND cf.form_type = ?'; params.push(form_type); }
  query += ' ORDER BY cf.submitted_at DESC';
  return db.prepare(query).all(...params);
}

export function createCustomerForm(data: {
  customer_id?: string;
  form_type: string;
  form_data?: string;
}) {
  const db = getDb();
  const id = `cf-${Date.now()}`;
  db.prepare(`
    INSERT INTO customer_forms (id, salon_id, customer_id, form_type, form_data)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, 'demo-salon-001', data.customer_id || null, data.form_type, data.form_data || null);
  return db.prepare('SELECT * FROM customer_forms WHERE id = ?').get(id);
}

// =============================================================================
// ANALYTICS FUNCTIONS
// =============================================================================

export function getAnalytics(opts: { salonId?: string; startDate?: string; endDate?: string }) {
  const db = getDb();
  const { salonId = 'demo-salon-001', startDate, endDate } = opts;

  // Revenue
  let revenueQuery = 'SELECT SUM(amount_cents) as total_revenue FROM payments WHERE salon_id = ? AND status = ?';
  const revenueParams: any[] = [salonId, 'completed'];
  if (startDate) { revenueQuery += ' AND date(created_at) >= ?'; revenueParams.push(startDate); }
  if (endDate) { revenueQuery += ' AND date(created_at) <= ?'; revenueParams.push(endDate); }
  const revenue = db.prepare(revenueQuery).get(...revenueParams) as any;

  // Appointment count
  let apptQuery = 'SELECT COUNT(*) as total_appointments FROM appointments WHERE salon_id = ?';
  const apptParams: any[] = [salonId];
  if (startDate) { apptQuery += ' AND date(start_time) >= ?'; apptParams.push(startDate); }
  if (endDate) { apptQuery += ' AND date(start_time) <= ?'; apptParams.push(endDate); }
  const appointments = db.prepare(apptQuery).get(...apptParams) as any;

  // Customer count
  const customers = db.prepare('SELECT COUNT(*) as total_customers FROM customers WHERE salon_id = ?').get(salonId) as any;

  // Low stock count
  const lowStock = db.prepare('SELECT COUNT(*) as low_stock_count FROM products WHERE salon_id = ? AND active = 1 AND stock_quantity <= low_stock_threshold').get(salonId) as any;

  // Membership count
  const memberships = db.prepare('SELECT COUNT(*) as active_memberships FROM customer_memberships WHERE status = ?').get('active') as any;

  return {
    total_revenue_cents: revenue?.total_revenue || 0,
    total_appointments: appointments?.total_appointments || 0,
    total_customers: customers?.total_customers || 0,
    low_stock_count: lowStock?.low_stock_count || 0,
    active_memberships: memberships?.active_memberships || 0,
  };
}

export function updateSalonSettings(id: string, data: { name?: string; phone?: string; email?: string; address?: string; city?: string; description?: string; business_hours?: string }) {
  const db = getDb();
  const sets: string[] = [];
  const vals: any[] = [];
  if (data.name !== undefined) { sets.push('name = ?'); vals.push(data.name); }
  if (data.phone !== undefined) { sets.push('phone = ?'); vals.push(data.phone); }
  if (data.email !== undefined) { sets.push('email = ?'); vals.push(data.email); }
  if (data.address !== undefined) { sets.push('address = ?'); vals.push(data.address); }
  if (data.city !== undefined) { sets.push('city = ?'); vals.push(data.city); }
  if (data.description !== undefined) { sets.push('description = ?'); vals.push(data.description); }
  if (data.business_hours !== undefined) { sets.push('business_hours = ?'); vals.push(data.business_hours); }
  if (sets.length === 0) return db.prepare('SELECT * FROM salon WHERE id = ?').get(id);
  vals.push(id);
  db.prepare(`UPDATE salon SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
  return db.prepare('SELECT * FROM salon WHERE id = ?').get(id);
}

// =============================================================================
// MEMBERSHIP FUNCTIONS
// memberships table = subscription plans (name, price, duration)
// customer_memberships = active customer subscriptions
// =============================================================================

export function _getMemberships(salonId: string = 'demo-salon-001') {
  // Returns subscription PLANS (the memberships table IS the plan)
  const db = getDb();
  return db.prepare('SELECT * FROM memberships WHERE salon_id = ? AND active = 1').all(salonId);
}

export function getMembershipById(id: string) {
  const db = getDb();
  return db.prepare('SELECT * FROM memberships WHERE id = ?').get(id);
}

export function createMembership(data: { name: string; description?: string; price_cents: number; duration_days?: number; benefits?: string }) {
  const db = getDb();
  const id = `mem-${Date.now()}`;
  db.prepare(`
    INSERT INTO memberships (id, salon_id, name, description, price_cents, duration_days, benefits, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `).run(id, 'demo-salon-001', data.name, data.description || null, data.price_cents, data.duration_days || 30, data.benefits || null);
  return getMembershipById(id);
}

export function updateMembership(id: string, data: { name?: string; description?: string; price_cents?: number; duration_days?: number; benefits?: string; active?: number }) {
  const db = getDb();
  const sets: string[] = [];
  const vals: any[] = [];
  if (data.name !== undefined) { sets.push('name = ?'); vals.push(data.name); }
  if (data.description !== undefined) { sets.push('description = ?'); vals.push(data.description); }
  if (data.price_cents !== undefined) { sets.push('price_cents = ?'); vals.push(data.price_cents); }
  if (data.duration_days !== undefined) { sets.push('duration_days = ?'); vals.push(data.duration_days); }
  if (data.benefits !== undefined) { sets.push('benefits = ?'); vals.push(data.benefits); }
  if (data.active !== undefined) { sets.push('active = ?'); vals.push(data.active); }
  if (sets.length === 0) return getMembershipById(id);
  vals.push(id);
  db.prepare(`UPDATE memberships SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
  return getMembershipById(id);
}

export function deleteMembership(id: string) {
  const db = getDb();
  db.prepare('UPDATE memberships SET active = 0 WHERE id = ?').run(id);
}

export function getCustomerMemberships(salonId: string = 'demo-salon-001') {
  // Returns customer SUBSCRIPTIONS (customer_memberships table)
  const db = getDb();
  return db.prepare(`
    SELECT cm.*, m.name as plan_name, m.price_cents as plan_price, m.benefits,
           c.name as customer_name, c.phone as customer_phone, c.email as customer_email
    FROM customer_memberships cm
    LEFT JOIN memberships m ON cm.membership_id = m.id
    LEFT JOIN customers c ON cm.customer_id = c.id
    WHERE m.salon_id = ?
    ORDER BY cm.created_at DESC
  `).all(salonId);
}

export function getCustomerMembershipById(id: string) {
  const db = getDb();
  return db.prepare(`
    SELECT cm.*, m.name as plan_name, m.price_cents as plan_price, m.benefits,
           c.name as customer_name, c.phone as customer_phone
    FROM customer_memberships cm
    LEFT JOIN memberships m ON cm.membership_id = m.id
    LEFT JOIN customers c ON cm.customer_id = c.id
    WHERE cm.id = ?
  `).get(id);
}

export function createCustomerMembership(data: {
  customer_id: string;
  membership_id: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  auto_renew?: number;
}) {
  const db = getDb();
  const membership = getMembershipById(data.membership_id) as any;
  if (!membership) throw new Error('Membership plan not found');
  const id = `cmem-${Date.now()}`;
  const now = data.start_date || new Date().toISOString().split('T')[0];
  let end: string;
  if (data.end_date) {
    end = data.end_date;
  } else {
    const startMs = data.start_date ? new Date(data.start_date).getTime() : Date.now();
    end = new Date(startMs + (membership.duration_days || 30) * 86400000).toISOString().split('T')[0];
  }
  db.prepare(`
    INSERT INTO customer_memberships (id, customer_id, membership_id, start_date, end_date, status, auto_renew)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, data.customer_id, data.membership_id, now, end, data.status || 'active', data.auto_renew ?? 1);
  return getCustomerMembershipById(id);
}

export function updateCustomerMembership(id: string, data: { status?: string; auto_renew?: number }) {
  const db = getDb();
  const sets: string[] = [];
  const vals: any[] = [];
  if (data.status !== undefined) { sets.push('status = ?'); vals.push(data.status); }
  if (data.auto_renew !== undefined) { sets.push('auto_renew = ?'); vals.push(data.auto_renew); }
  if (sets.length === 0) return getCustomerMembershipById(id);
  vals.push(id);
  db.prepare(`UPDATE customer_memberships SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
  return getCustomerMembershipById(id);
}

// Old membership functions removed — replaced with unified schema below
// See: getMemberships, getMembershipById, createMembership, updateMembership, deleteMembership
//     getCustomerMemberships, getCustomerMembershipById, createCustomerMembership, updateCustomerMembership
//     getMembershipByCustomer (lines ~1061-1155)

// =============================================================================
// COUPON FUNCTIONS
// =============================================================================

export function _getCoupons(salonId: string = 'demo-salon-001') {
  const db = getDb();
  return db.prepare('SELECT * FROM coupons WHERE salon_id = ? AND active = 1').all(salonId);
}

export function getCouponById(id: string) {
  const db = getDb();
  return db.prepare('SELECT * FROM coupons WHERE id = ?').get(id);
}

export function getCouponByCode(code: string) {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM coupons WHERE code = ? AND active = 1
    AND (valid_from IS NULL OR valid_from <= date('now'))
    AND (valid_until IS NULL OR valid_until >= date('now'))
    AND (max_uses IS NULL OR used_count < max_uses)
  `).get(code);
}

export function createCoupon(data: { code: string; discount_type?: string; discount_value: number; min_order_cents?: number; max_uses?: number; valid_from?: string; valid_until?: string }) {
  const db = getDb();
  const id = `coupon-${Date.now()}`;
  db.prepare(`
    INSERT INTO coupons (id, salon_id, code, discount_type, discount_value, min_order_cents, max_uses, valid_from, valid_until, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `).run(id, 'demo-salon-001', data.code.toUpperCase(), data.discount_type || 'percent', data.discount_value, data.min_order_cents || 0, data.max_uses || null, data.valid_from || null, data.valid_until || null);
  return getCouponById(id);
}

export function updateCoupon(id: string, data: { code?: string; discount_type?: string; discount_value?: number; min_order_cents?: number; max_uses?: number; valid_from?: string; valid_until?: string; active?: number }) {
  const db = getDb();
  const sets: string[] = [];
  const vals: any[] = [];
  if (data.code !== undefined) { sets.push('code = ?'); vals.push(data.code.toUpperCase()); }
  if (data.discount_type !== undefined) { sets.push('discount_type = ?'); vals.push(data.discount_type); }
  if (data.discount_value !== undefined) { sets.push('discount_value = ?'); vals.push(data.discount_value); }
  if (data.min_order_cents !== undefined) { sets.push('min_order_cents = ?'); vals.push(data.min_order_cents); }
  if (data.max_uses !== undefined) { sets.push('max_uses = ?'); vals.push(data.max_uses); }
  if (data.valid_from !== undefined) { sets.push('valid_from = ?'); vals.push(data.valid_from); }
  if (data.valid_until !== undefined) { sets.push('valid_until = ?'); vals.push(data.valid_until); }
  if (data.active !== undefined) { sets.push('active = ?'); vals.push(data.active); }
  if (sets.length === 0) return getCouponById(id);
  vals.push(id);
  db.prepare(`UPDATE coupons SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
  return getCouponById(id);
}

export function deleteCoupon(id: string) {
  const db = getDb();
  db.prepare('UPDATE coupons SET active = 0 WHERE id = ?').run(id);
}

export function validateCoupon(code: string, orderCents: number = 0) {
  const coupon = getCouponByCode(code);
  if (!coupon) return { valid: false, error: 'Coupon not found or expired' };
  const c = coupon as any;
  if (c.min_order_cents && orderCents < c.min_order_cents) {
    return { valid: false, error: `Minimum order ${c.min_order_cents / 100} required` };
  }
  const discount = c.discount_type === 'percent'
    ? Math.round(orderCents * c.discount_value / 100)
    : c.discount_value;
  return { valid: true, coupon: c, discount_cents: discount };
}

export function redeemCoupon(couponId: string, customerId?: string, appointmentId?: string) {
  const db = getDb();
  const id = `usage-${Date.now()}`;
  db.prepare(`
    INSERT INTO coupon_usage (id, coupon_id, customer_id, appointment_id)
    VALUES (?, ?, ?, ?)
  `).run(id, couponId, customerId || null, appointmentId || null);
  db.prepare('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?').run(couponId);
  return { id };
}

// =============================================================================
// COMMISSION FUNCTIONS
// =============================================================================

export function _getCommissions(salonId: string = 'demo-salon-001') {
  const db = getDb();
  return db.prepare(`
    SELECT c.id, c.salon_id, c.stylist_id, c.service_id, c.commission_percent,
           st.name as stylist_name,
           s.name as service_name
    FROM commissions c
    LEFT JOIN stylists st ON c.stylist_id = st.id
    LEFT JOIN services s ON c.service_id = s.id
    WHERE c.salon_id = ?
    ORDER BY st.name ASC, s.name ASC
  `).all(salonId);
}

export function getCommissionById(id: string) {
  const db = getDb();
  return db.prepare(`
    SELECT c.*, st.name as stylist_name, s.name as service_name
    FROM commissions c
    LEFT JOIN stylists st ON c.stylist_id = st.id
    LEFT JOIN services s ON c.service_id = s.id
    WHERE c.id = ?
  `).get(id);
}

export function getCommissionsByStylist(stylistId: string) {
  const db = getDb();
  return db.prepare(`
    SELECT c.*, s.name as service_name
    FROM commissions c
    LEFT JOIN services s ON c.service_id = s.id
    WHERE c.stylist_id = ?
  `).all(stylistId);
}

export function createCommission(data: { stylist_id: string; service_id?: string; commission_percent: number }) {
  const db = getDb();
  const id = `comm-${Date.now()}`;
  db.prepare(`
    INSERT INTO commissions (id, salon_id, stylist_id, service_id, commission_percent)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, 'demo-salon-001', data.stylist_id, data.service_id || null, data.commission_percent);
  return getCommissionById(id);
}

export function updateCommission(id: string, data: { stylist_id?: string; service_id?: string; commission_percent?: number }) {
  const db = getDb();
  const sets: string[] = [];
  const vals: any[] = [];
  if (data.stylist_id !== undefined) { sets.push('stylist_id = ?'); vals.push(data.stylist_id); }
  if (data.service_id !== undefined) { sets.push('service_id = ?'); vals.push(data.service_id); }
  if (data.commission_percent !== undefined) { sets.push('commission_percent = ?'); vals.push(data.commission_percent); }
  if (sets.length === 0) return getCommissionById(id);
  vals.push(id);
  db.prepare(`UPDATE commissions SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
  return getCommissionById(id);
}

export function deleteCommission(id: string) {
  const db = getDb();
  db.prepare('DELETE FROM commissions WHERE id = ?').run(id);
}

export function calculateCommission(stylistId: string, startDate: string, endDate: string) {
  const db = getDb();
  const results = db.prepare(`
    SELECT
      st.id as stylist_id,
      st.name as stylist_name,
      s.id as service_id,
      s.name as service_name,
      s.price_cents,
      c.commission_percent,
      COUNT(a.id) as appointment_count,
      SUM(s.price_cents) as total_revenue,
      SUM(s.price_cents * c.commission_percent / 100) as commission_due
    FROM appointments a
    JOIN stylists st ON a.stylist_id = st.id
    JOIN services s ON a.service_id = s.id
    LEFT JOIN commissions c ON c.stylist_id = st.id AND (c.service_id = s.id OR c.service_id IS NULL)
    WHERE st.id = ?
      AND date(a.start_time) >= ?
      AND date(a.start_time) <= ?
      AND a.status NOT IN ('cancelled', 'no_show')
    GROUP BY st.id, s.id
  `).all(stylistId, startDate, endDate) as any[];

  const totalCommission = results.reduce((sum: number, r: any) => sum + (r.commission_due || 0), 0);
  return { stylist_id: stylistId, period_start: startDate, period_end: endDate, breakdown: results, total_commission: totalCommission };
}

export function getCommissionPayouts(salonId: string = 'demo-salon-001') {
  const db = getDb();
  return db.prepare(`
    SELECT cp.*, st.name as stylist_name
    FROM commission_payouts cp
    LEFT JOIN stylists st ON cp.stylist_id = st.id
    WHERE cp.salon_id = ?
    ORDER BY cp.created_at DESC
  `).all(salonId);
}

export function createCommissionPayout(data: { stylist_id: string; period_start: string; period_end: string; total_commission: number }) {
  const db = getDb();
  const id = `payout-${Date.now()}`;
  db.prepare(`
    INSERT INTO commission_payouts (id, salon_id, stylist_id, period_start, period_end, total_commission, status)
    VALUES (?, ?, ?, ?, ?, ?, 'pending')
  `).run(id, 'demo-salon-001', data.stylist_id, data.period_start, data.period_end, data.total_commission);
  return db.prepare('SELECT * FROM commission_payouts WHERE id = ?').get(id);
}

export function markPayoutPaid(id: string) {
  const db = getDb();
  db.prepare("UPDATE commission_payouts SET status = 'paid', paid_at = datetime('now') WHERE id = ?").run(id);
  return db.prepare('SELECT * FROM commission_payouts WHERE id = ?').get(id);
}

// =============================================================================
// REMINDER FUNCTIONS
// =============================================================================

export function getReminders(salonId: string = 'demo-salon-001') {
  const db = getDb();
  return db.prepare('SELECT * FROM reminders WHERE salon_id = ? AND active = 1').all(salonId);
}

export function getReminderById(id: string) {
  const db = getDb();
  return db.prepare('SELECT * FROM reminders WHERE id = ?').get(id);
}

export function createReminder(data: { reminder_type: string; timing_days_before: number; message_template: string }) {
  const db = getDb();
  const id = `rem-${Date.now()}`;
  db.prepare(`
    INSERT INTO reminders (id, salon_id, reminder_type, timing_days_before, message_template, active)
    VALUES (?, ?, ?, ?, ?, 1)
  `).run(id, 'demo-salon-001', data.reminder_type, data.timing_days_before, data.message_template);
  return getReminderById(id);
}

export function updateReminder(id: string, data: { reminder_type?: string; timing_days_before?: number; message_template?: string; active?: number }) {
  const db = getDb();
  const sets: string[] = [];
  const vals: any[] = [];
  if (data.reminder_type !== undefined) { sets.push('reminder_type = ?'); vals.push(data.reminder_type); }
  if (data.timing_days_before !== undefined) { sets.push('timing_days_before = ?'); vals.push(data.timing_days_before); }
  if (data.message_template !== undefined) { sets.push('message_template = ?'); vals.push(data.message_template); }
  if (data.active !== undefined) { sets.push('active = ?'); vals.push(data.active); }
  if (sets.length === 0) return getReminderById(id);
  vals.push(id);
  db.prepare(`UPDATE reminders SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
  return getReminderById(id);
}

export function deleteReminder(id: string) {
  const db = getDb();
  db.prepare('UPDATE reminders SET active = 0 WHERE id = ?').run(id);
}

export function processReminders() {
  const db = getDb();
  const reminders = getReminders() as any[];
  const today = new Date();
  const processed: any[] = [];

  for (const rem of reminders) {
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + rem.timing_days_before);
    const dateStr = targetDate.toISOString().slice(0, 10);

    const appointments = db.prepare(`
      SELECT a.*, c.name as customer_name, c.phone as customer_phone
      FROM appointments a
      LEFT JOIN customers c ON a.customer_id = c.id
      WHERE date(a.start_time) = ? AND a.status NOT IN ('cancelled', 'completed')
    `).all(dateStr) as any[];

    for (const appt of appointments) {
      const time = new Date(appt.start_time).toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' });
      const message = rem.message_template
        .replace(/\{\{customer_name\}\}/g, appt.customer_name || 'Customer')
        .replace(/\{\{date\}\}/g, dateStr)
        .replace(/\{\{time\}\}/g, time);

      const logId = `log-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      db.prepare(`
        INSERT INTO reminder_logs (id, reminder_id, customer_id, appointment_id, status)
        VALUES (?, ?, ?, ?, 'sent')
      `).run(logId, rem.id, appt.customer_id, appt.id);

      processed.push({
        reminder_id: rem.id,
        appointment_id: appt.id,
        customer_phone: appt.customer_phone,
        message
      });
    }
  }

  return processed;
}

export function getReminderLogs(reminderId?: string) {
  const db = getDb();
  if (reminderId) {
    return db.prepare(`
      SELECT rl.*, r.reminder_type, c.name as customer_name, a.start_time
      FROM reminder_logs rl
      LEFT JOIN reminders r ON rl.reminder_id = r.id
      LEFT JOIN customers c ON rl.customer_id = c.id
      LEFT JOIN appointments a ON rl.appointment_id = a.id
      WHERE rl.reminder_id = ?
      ORDER BY rl.sent_at DESC
    `).all(reminderId);
  }
  return db.prepare(`
    SELECT rl.*, r.reminder_type, c.name as customer_name, a.start_time
    FROM reminder_logs rl
    LEFT JOIN reminders r ON rl.reminder_id = r.id
    LEFT JOIN customers c ON rl.customer_id = c.id
    LEFT JOIN appointments a ON rl.appointment_id = a.id
    ORDER BY rl.sent_at DESC
  `).all();
}

// =============================================================================
// ANALYTICS FUNCTIONS
// =============================================================================

export function getDashboardAnalytics(salonId: string = 'demo-salon-001') {
  const db = getDb();
  const today = new Date().toISOString().slice(0, 10);

  const totalCustomers = (db.prepare('SELECT COUNT(*) as c FROM customers WHERE salon_id = ?').get(salonId) as any).c;
  const totalAppointments = (db.prepare("SELECT COUNT(*) as c FROM appointments WHERE salon_id = ? AND status NOT IN ('cancelled')").get(salonId) as any).c;
  const todayAppointments = (db.prepare("SELECT COUNT(*) as c FROM appointments WHERE salon_id = ? AND date(start_time) = ? AND status NOT IN ('cancelled')").get(salonId, today) as any).c;
  const activeMemberships = (db.prepare("SELECT COUNT(*) as c FROM customer_memberships cm LEFT JOIN memberships m ON cm.membership_id = m.id WHERE m.salon_id = ? AND cm.status = 'active' AND cm.end_date >= date('now')").get(salonId) as any).c;
  const totalRevenue = (db.prepare(`
    SELECT COALESCE(SUM(s.price_cents), 0) as total
    FROM appointments a
    JOIN services s ON a.service_id = s.id
    WHERE a.salon_id = ? AND a.status NOT IN ('cancelled', 'no_show')
  `).get(salonId) as any).total;

  const appointmentsByStatus = db.prepare(`
    SELECT status, COUNT(*) as count FROM appointments WHERE salon_id = ? GROUP BY status
  `).all(salonId);

  const recentAppointments = db.prepare(`
    SELECT a.*, s.name as service_name, st.name as stylist_name
    FROM appointments a
    LEFT JOIN services s ON a.service_id = s.id
    LEFT JOIN stylists st ON a.stylist_id = st.id
    WHERE a.salon_id = ?
    ORDER BY a.start_time DESC LIMIT 10
  `).all(salonId);

  return {
    total_customers: totalCustomers,
    total_appointments: totalAppointments,
    today_appointments: todayAppointments,
    active_memberships: activeMemberships,
    total_revenue_cents: totalRevenue,
    appointments_by_status: appointmentsByStatus,
    recent_appointments: recentAppointments
  };
}

// Compatibility wrappers for API routes using @/lib/db
// These are the ONLY exports with these names - all originals were renamed to _getXxx
export const getSupabase = () => null;
export async function getAppointments(a1: string | object, a2?: { startDate?: string; endDate?: string }): Promise<any> {
  // Support both call signatures:
  // getAppointments(salonId: string, opts?: {...})  <- our exported API
  // getAppointments({ salonId, date, stylistId })   <- internal compiled form
  let salonId: string;
  let opts: { startDate?: string; endDate?: string } = {};
  if (typeof a1 === 'string') {
    salonId = a1;
    opts = a2 || {};
  } else {
    // Called with options object — used by compiled module
    salonId = (a1 as any).salonId || 'demo-salon-001';
    opts = { startDate: (a1 as any).startDate || (a1 as any).date, endDate: (a1 as any).endDate };
  }
  return getAppointments_({ salonId, ...opts } as any);
}
export async function getCustomers(salonId?: string): Promise<any> {
  return _getCustomers(salonId || 'demo-salon-001');
}
export async function getServices(salonId?: string): Promise<any> {
  return getSalonServices(salonId || 'demo-salon-001');
}
export async function getProducts(salonId?: string): Promise<any> {
  return _getProducts(salonId || 'demo-salon-001');
}
export async function getPayments(salonId?: string): Promise<any> {
  return _getPayments({ salonId: salonId || 'demo-salon-001' });
}
export async function getMembershipPlans(salonId?: string): Promise<any> {
  return _getMemberships(salonId || 'demo-salon-001');
}
export async function getCampaigns(salonId?: string): Promise<any> {
  return _getCampaigns(salonId || 'demo-salon-001');
}
export async function getCoupons(salonId?: string): Promise<any> {
  return _getCoupons(salonId || 'demo-salon-001');
}
export async function getCommissions(salonId?: string): Promise<any> {
  return _getCommissions(salonId || 'demo-salon-001');
}
export async function createAppointment(data: any): Promise<any> {
  return _createAppointment({
    serviceId: data.serviceId || data.service_id,
    stylistId: data.stylistId || data.stylist_id,
    startTime: data.startTime || data.start_time,
    endTime: data.endTime || data.end_time,
    customerName: data.customer_name || data.customerName,
    customerPhone: data.customer_phone || data.customerPhone,
    customerEmail: data.customer_email || data.customerEmail,
    notes: data.notes,
  });
}
export async function updateAppointment(id: string, data: any): Promise<any> {
  if (data.status) updateAppointmentStatus(id, data.status, data.notes);
  return getAppointmentById(id);
}
export async function createMembershipPlan(data: any): Promise<any> {
  return createMembership(data);
}
export function getSalon(slug?: string) { return _getSalon(slug || 'demo-salon'); }
