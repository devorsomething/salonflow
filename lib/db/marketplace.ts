import Database from 'better-sqlite3';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';
// Use /app/data/marketplace (nextjs user has write perms here via docker exec workaround)
const IS_DOCKER = existsSync('/.dockerenv');
const DB_SUBDIR = IS_DOCKER ? '/app/data/marketplace' : (process.env.NODE_ENV === 'production' ? '/data/marketplace' : path.join(process.cwd(), 'data'));
const DB_PATH = path.join(DB_SUBDIR, 'salonflow.db');

// Ensure data directory exists
if (!existsSync(DB_SUBDIR)) {
  mkdirSync(DB_SUBDIR, { recursive: true });
}

let _db: Database.Database | null = null;

export function getMarketplaceDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
    initMarketplaceSchema(_db);
    seedMarketplaceDemo(_db);
  }
  return _db;
}

function initMarketplaceSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS marketplace_partners (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      logo_url TEXT,
      cover_url TEXT,
      website TEXT,
      email TEXT,
      phone TEXT,
      city TEXT,
      country TEXT DEFAULT 'AT',
      category TEXT DEFAULT 'salon',
      commission_percent INTEGER DEFAULT 15,
      referral_code TEXT UNIQUE,
      total_referrals INTEGER DEFAULT 0,
      total_earnings_cents INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      featured INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      verified_at TEXT
    );

    CREATE TABLE IF NOT EXISTS partner_applications (
      id TEXT PRIMARY KEY,
      partner_id TEXT,
      salon_name TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      contact_email TEXT NOT NULL,
      contact_phone TEXT,
      website TEXT,
      message TEXT,
      referral_code TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now')),
      processed_at TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS partner_commissions (
      id TEXT PRIMARY KEY,
      partner_id TEXT NOT NULL,
      referred_salon_id TEXT,
      application_id TEXT,
      amount_cents INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      paid_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (partner_id) REFERENCES marketplace_partners(id)
    );
  `);
}

function seedMarketplaceDemo(db: Database.Database) {
  const count = db.prepare('SELECT COUNT(*) as c FROM marketplace_partners').get() as { c: number };
  if (count.c > 0) return;

  const partners = [
    {
      id: 'partner-1',
      name: 'Beauty Lounge Wien',
      slug: 'beauty-lounge-wien',
      description: 'Premium Beauty Salon im Herzen Wiens. Wir spezialisieren uns auf Coloration, Haarschnitte und stylische Umstylings.',
      logo_url: null,
      cover_url: null,
      website: 'https://beautylounge.wien',
      email: 'hallo@beautylounge.wien',
      phone: '+43 1 555 1234',
      city: 'Wien',
      country: 'AT',
      category: 'salon',
      commission_percent: 20,
      referral_code: 'BEAUTY20',
      total_referrals: 12,
      total_earnings_cents: 34500,
      status: 'active',
      featured: 1,
    },
    {
      id: 'partner-2',
      name: 'Friseur am Ring',
      slug: 'friseur-am-ring',
      description: 'Tradition trifft Moderne. Unser Team aus erfahrenen Friseuren bietet erstklassige Haarpflege für alle Altersgruppen.',
      logo_url: null,
      cover_url: null,
      website: 'https://friseur-am-ring.at',
      email: 'info@friseur-am-ring.at',
      phone: '+43 1 234 5678',
      city: 'Wien',
      country: 'AT',
      category: 'salon',
      commission_percent: 15,
      referral_code: 'RING15',
      total_referrals: 8,
      total_earnings_cents: 18200,
      status: 'active',
      featured: 0,
    },
    {
      id: 'partner-3',
      name: 'Haarwerk Salzburg',
      slug: 'haarwerk-salzburg',
      description: 'Kreative Haarkunst in Salzburg. Coloration, Balayage und Cutting-Edge-Styles sind unsere Spezialitäten.',
      logo_url: null,
      cover_url: null,
      website: 'https://haarwerk-salzburg.at',
      email: 'kontakt@haarwerk-salzburg.at',
      phone: '+43 662 123 456',
      city: 'Salzburg',
      country: 'AT',
      category: 'salon',
      commission_percent: 18,
      referral_code: 'SALZ18',
      total_referrals: 5,
      total_earnings_cents: 9900,
      status: 'active',
      featured: 1,
    },
    {
      id: 'partner-4',
      name: 'Barber King Graz',
      slug: 'barber-king-graz',
      description: 'Der beste Barbershop in Graz. Klassische Rasuren, moderne Schnitte und eine entspannte Atmosphäre.',
      logo_url: null,
      cover_url: null,
      website: null,
      email: 'info@barberking.at',
      phone: '+43 316 789 012',
      city: 'Graz',
      country: 'AT',
      category: 'barbershop',
      commission_percent: 15,
      referral_code: 'KING15',
      total_referrals: 3,
      total_earnings_cents: 5400,
      status: 'active',
      featured: 0,
    },
    {
      id: 'partner-5',
      name: 'Nail Art Studio Linz',
      slug: 'nail-art-linz',
      description: 'Kreative Nagelkunst und professionelle Maniküre. Wir lieben es, deine Nägel zum Kunstwerk zu machen.',
      logo_url: null,
      cover_url: null,
      website: 'https://nailartlinz.at',
      email: 'hello@nailartlinz.at',
      phone: '+43 732 456 789',
      city: 'Linz',
      country: 'AT',
      category: 'nails',
      commission_percent: 20,
      referral_code: 'NAIL20',
      total_referrals: 7,
      total_earnings_cents: 16800,
      status: 'active',
      featured: 0,
    },
    {
      id: 'partner-6',
      name: 'Kosmetikparadies Innsbruck',
      slug: 'kosmetikparadies-innsbruck',
      description: 'Ganzheitliche Kosmetikbehandlungen und Wellness. Entspannung und Schönheit in den Tiroler Bergen.',
      logo_url: null,
      cover_url: null,
      website: 'https://kosmetikparadies.at',
      email: 'termin@kosmetikparadies.at',
      phone: '+43 512 345 678',
      city: 'Innsbruck',
      country: 'AT',
      category: 'cosmetics',
      commission_percent: 18,
      referral_code: 'TIROL18',
      total_referrals: 4,
      total_earnings_cents: 8160,
      status: 'active',
      featured: 0,
    },
  ];

  const insert = db.prepare(`
    INSERT INTO marketplace_partners (id, name, slug, description, logo_url, cover_url, website, email, phone, city, country, category, commission_percent, referral_code, total_referrals, total_earnings_cents, status, featured, verified_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  for (const p of partners) {
    insert.run(
      p.id, p.name, p.slug, p.description, p.logo_url, p.cover_url,
      p.website, p.email, p.phone, p.city, p.country, p.category,
      p.commission_percent, p.referral_code, p.total_referrals,
      p.total_earnings_cents, p.status, p.featured
    );
  }
}

// =============================================================================
// PARTNER FUNCTIONS
// =============================================================================

export function getMarketplacePartners(opts?: { category?: string; featured?: boolean }) {
  const db = getMarketplaceDb();
  let query = 'SELECT * FROM marketplace_partners WHERE status = ?';
  const params: any[] = ['active'];

  if (opts?.category) {
    query += ' AND category = ?';
    params.push(opts.category);
  }
  if (opts?.featured !== undefined) {
    query += ' AND featured = ?';
    params.push(opts.featured ? 1 : 0);
  }

  query += ' ORDER BY featured DESC, total_referrals DESC, name ASC';
  return db.prepare(query).all(...params);
}

export function getMarketplacePartnerById(id: string) {
  const db = getMarketplaceDb();
  return db.prepare('SELECT * FROM marketplace_partners WHERE id = ? OR slug = ?').get(id, id);
}

export function getMarketplacePartnerByReferralCode(code: string) {
  const db = getMarketplaceDb();
  return db.prepare('SELECT * FROM marketplace_partners WHERE referral_code = ?').get(code);
}

export function createPartnerApplication(data: {
  salon_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  website?: string;
  message?: string;
  referral_code?: string;
}) {
  const db = getMarketplaceDb();
  const id = `app-${Date.now()}`;
  db.prepare(`
    INSERT INTO partner_applications (id, salon_name, contact_name, contact_email, contact_phone, website, message, referral_code, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
  `).run(id, data.salon_name, data.contact_name, data.contact_email, data.contact_phone || null, data.website || null, data.message || null, data.referral_code || null);
  return db.prepare('SELECT * FROM partner_applications WHERE id = ?').get(id);
}

export function getPartnerApplications(partnerId?: string) {
  const db = getMarketplaceDb();
  let query = 'SELECT * FROM partner_applications WHERE 1=1';
  const params: any[] = [];
  if (partnerId) {
    query += ' AND partner_id = ?';
    params.push(partnerId);
  }
  query += ' ORDER BY created_at DESC';
  return db.prepare(query).all(...params);
}

export function updatePartnerApplication(id: string, data: { status?: string; partner_id?: string; notes?: string }) {
  const db = getMarketplaceDb();
  const sets: string[] = ['processed_at = datetime(\'now\')'];
  const vals: any[] = [];
  if (data.status) { sets.push('status = ?'); vals.push(data.status); }
  if (data.partner_id) { sets.push('partner_id = ?'); vals.push(data.partner_id); }
  if (data.notes) { sets.push('notes = ?'); vals.push(data.notes); }
  vals.push(id);
  db.prepare(`UPDATE partner_applications SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
  return db.prepare('SELECT * FROM partner_applications WHERE id = ?').get(id);
}

export function createMarketplacePartner(data: {
  name: string;
  slug: string;
  description?: string;
  email: string;
  phone?: string;
  website?: string;
  city?: string;
  category?: string;
  referral_code: string;
  commission_percent?: number;
}) {
  const db = getMarketplaceDb();
  const id = `partner-${Date.now()}`;
  db.prepare(`
    INSERT INTO marketplace_partners (id, name, slug, description, email, phone, website, city, category, referral_code, commission_percent, status, featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 0)
  `).run(
    id, data.name, data.slug, data.description || null,
    data.email, data.phone || null, data.website || null,
    data.city || null, data.category || 'salon',
    data.referral_code, data.commission_percent || 15
  );
  return db.prepare('SELECT * FROM marketplace_partners WHERE id = ?').get(id);
}

// =============================================================================
// AFFILIATE COMMISSION FUNCTIONS
// =============================================================================

export function getPartnerCommissions(partnerId: string) {
  const db = getMarketplaceDb();
  return db.prepare(`
    SELECT pc.*, pa.salon_name as referred_salon_name
    FROM partner_commissions pc
    LEFT JOIN partner_applications pa ON pc.application_id = pa.id
    WHERE pc.partner_id = ?
    ORDER BY pc.created_at DESC
  `).all(partnerId);
}

export function getPartnerEarningsSummary(partnerId: string) {
  const db = getMarketplaceDb();

  const pending = db.prepare(`
    SELECT COALESCE(SUM(amount_cents), 0) as total
    FROM partner_commissions WHERE partner_id = ? AND status = 'pending'
  `).get(partnerId) as any;

  const paid = db.prepare(`
    SELECT COALESCE(SUM(amount_cents), 0) as total
    FROM partner_commissions WHERE partner_id = ? AND status = 'paid'
  `).get(partnerId) as any;

  const total = db.prepare(`
    SELECT COALESCE(SUM(amount_cents), 0) as total
    FROM partner_commissions WHERE partner_id = ?
  `).get(partnerId) as any;

  return {
    pending_cents: pending?.total || 0,
    paid_cents: paid?.total || 0,
    total_cents: total?.total || 0,
  };
}

export function createPartnerCommission(data: {
  partner_id: string;
  referred_salon_id?: string;
  application_id?: string;
  amount_cents: number;
  status?: string;
}) {
  const db = getMarketplaceDb();
  const id = `pcomm-${Date.now()}`;
  db.prepare(`
    INSERT INTO partner_commissions (id, partner_id, referred_salon_id, application_id, amount_cents, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, data.partner_id, data.referred_salon_id || null, data.application_id || null, data.amount_cents, data.status || 'pending');

  // Update partner total earnings
  db.prepare(`
    UPDATE marketplace_partners
    SET total_earnings_cents = total_earnings_cents + ?, total_referrals = total_referrals + 1
    WHERE id = ?
  `).run(data.amount_cents, data.partner_id);

  return db.prepare('SELECT * FROM partner_commissions WHERE id = ?').get(id);
}

export function markCommissionPaid(id: string) {
  const db = getMarketplaceDb();
  db.prepare("UPDATE partner_commissions SET status = 'paid', paid_at = datetime('now') WHERE id = ?").run(id);
  return db.prepare('SELECT * FROM partner_commissions WHERE id = ?').get(id);
}

export function recalculatePartnerEarnings(partnerId: string) {
  const db = getMarketplaceDb();

  // Sum all commissions for partner
  const result = db.prepare(`
    SELECT SUM(amount_cents) as total, COUNT(*) as count
    FROM partner_commissions WHERE partner_id = ?
  `).get(partnerId) as any;

  const totalEarnings = result?.total || 0;
  const totalReferrals = result?.count || 0;

  db.prepare(`
    UPDATE marketplace_partners
    SET total_earnings_cents = ?, total_referrals = ?
    WHERE id = ?
  `).run(totalEarnings, totalReferrals, partnerId);

  return { total_earnings_cents: totalEarnings, total_referrals: totalReferrals };
}
