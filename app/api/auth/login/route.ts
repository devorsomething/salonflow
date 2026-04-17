import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/index';

function verifyUser(email: string, password: string) {
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!user) return null;
  // Plain text check for demo
  if (user.password_hash !== password) return null;
  return { id: user.id, email: user.email, name: user.name, salonId: user.salon_id };
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }
    const user = verifyUser(email, password);
    if (!user) {
      return NextResponse.json({ error: 'Ungültige Anmeldedaten' }, { status: 401 });
    }
    // Return token in body — frontend stores in localStorage
    return NextResponse.json({ success: true, token: user.id, user: { email: user.email, name: user.name } });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Server error', detail: String(err) }, { status: 500 });
  }
}
