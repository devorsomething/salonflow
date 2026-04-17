import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const DATA_FILE = path.join(process.cwd(), 'data', 'registrations.json');

interface SalonInfo {
  salon_name: string;
  owner_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  password: string;
  confirm_password?: string;
}

interface PlanSelection {
  plan: 'starter' | 'business' | 'premium';
  planName: string;
  planPrice: number;
}

interface PaymentInfo {
  cardNumber: string;
  expiry: string;
  cvv: string;
}

interface RegistrationData {
  salon: SalonInfo;
  plan: PlanSelection;
  payment: PaymentInfo;
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\+\(\)]{8,}$/;
  return phoneRegex.test(phone);
}

function validateCardNumber(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\s/g, '');
  return /^\d{13,19}$/.test(cleaned);
}

function validateExpiry(expiry: string): boolean {
  const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  if (!expiryRegex.test(expiry)) return false;
  
  const [month, year] = expiry.split('/');
  const expDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
  return expDate > new Date();
}

function validateCVV(cvv: string): boolean {
  return /^\d{3,4}$/.test(cvv);
}

export async function POST(request: Request) {
  try {
    const data: RegistrationData = await request.json();
    
    const { salon, plan, payment } = data;

    // Validate salon info
    if (!salon.salon_name || !salon.owner_name || !salon.email || !salon.phone || 
        !salon.address || !salon.city || !salon.password || !salon.confirm_password) {
      return NextResponse.json({ error: 'Alle Felder sind erforderlich' }, { status: 400 });
    }

    if (!validateEmail(salon.email)) {
      return NextResponse.json({ error: 'Ungültige E-Mail-Adresse' }, { status: 400 });
    }

    if (!validatePhone(salon.phone)) {
      return NextResponse.json({ error: 'Ungültige Telefonnummer' }, { status: 400 });
    }

    if (salon.password !== salon.confirm_password) {
      return NextResponse.json({ error: 'Passwörter stimmen nicht überein' }, { status: 400 });
    }

    if (salon.password.length < 6) {
      return NextResponse.json({ error: 'Passwort muss mindestens 6 Zeichen haben' }, { status: 400 });
    }

    // Validate plan
    if (!plan || !['starter', 'business', 'premium'].includes(plan.plan)) {
      return NextResponse.json({ error: 'Ungültiger Plan ausgewählt' }, { status: 400 });
    }

    // Validate payment info
    if (!validateCardNumber(payment.cardNumber)) {
      return NextResponse.json({ error: 'Ungültige Kartennummer' }, { status: 400 });
    }

    if (!validateExpiry(payment.expiry)) {
      return NextResponse.json({ error: 'Ungültiges Ablaufdatum' }, { status: 400 });
    }

    if (!validateCVV(payment.cvv)) {
      return NextResponse.json({ error: 'Ungültige CVV' }, { status: 400 });
    }

    // Read existing registrations
    let registrations: any[] = [];
    try {
      const fileContent = await fs.readFile(DATA_FILE, 'utf-8');
      registrations = JSON.parse(fileContent);
    } catch {
      // File doesn't exist or is invalid, start with empty array
      registrations = [];
    }

    // Check if email already exists
    if (registrations.some((r: any) => r.salon.email === salon.email)) {
      return NextResponse.json({ error: 'Diese E-Mail-Adresse ist bereits registriert' }, { status: 400 });
    }

    // Generate token and create registration
    const token = randomUUID();
    const now = new Date().toISOString();

    const newRegistration = {
      id: randomUUID(),
      token,
      salon: {
        name: salon.salon_name,
        owner_name: salon.owner_name,
        email: salon.email,
        phone: salon.phone,
        address: salon.address,
        city: salon.city,
        password_hash: salon.password, // In production, hash this!
      },
      plan: {
        name: plan.planName,
        type: plan.plan,
        price: plan.planPrice,
        currency: 'EUR',
      },
      payment: {
        card_last4: payment.cardNumber.replace(/\s/g, '').slice(-4),
        expiry: payment.expiry,
      },
      created_at: now,
      updated_at: now,
    };

    registrations.push(newRegistration);

    // Write back to file
    await fs.writeFile(DATA_FILE, JSON.stringify(registrations, null, 2), 'utf-8');

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      salon: {
        name: salon.salon_name,
        email: salon.email,
        plan: plan.planName,
      },
      token,
    });

    response.cookies.set('salonflow_session', token, {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Registration error:', err);
    return NextResponse.json({ error: 'Serverfehler', detail: String(err) }, { status: 500 });
  }
}
