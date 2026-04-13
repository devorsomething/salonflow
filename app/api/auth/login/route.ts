import { NextResponse } from 'next/server';

const DEMO_ADMIN = {
  email: 'demo@salonflow.app',
  password: 'demo123',
  name: 'Demo Admin',
  salonId: 'demo-salon-001',
  salonName: 'Friseur Meisterstück',
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email und Passwort erforderlich' }, { status: 400 });
    }

    // Demo mode hardcoded credentials
    if (email === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
      const response = NextResponse.json({
        success: true,
        user: {
          email: DEMO_ADMIN.email,
          name: DEMO_ADMIN.name,
          salonId: DEMO_ADMIN.salonId,
          salonName: DEMO_ADMIN.salonName,
        }
      });

      // Set session cookie (works on HTTP for demo)
      response.cookies.set('salonflow_session', Buffer.from(JSON.stringify({
        email: DEMO_ADMIN.email,
        salonId: DEMO_ADMIN.salonId,
        salonName: DEMO_ADMIN.salonName,
      })).toString('base64'), {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });

      return response;
    }

    return NextResponse.json({ error: 'Ungültige Anmeldedaten' }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
