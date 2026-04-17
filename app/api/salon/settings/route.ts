import { NextRequest, NextResponse } from 'next/server';
import { updateSalonSettings, getSalon } from '@/lib/db';

function getToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);
  return null;
}

export async function GET(request: Request) {
  try {
    const token = getToken(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const salon = await getSalon('demo-salon') as any;
    if (!salon) return NextResponse.json({ error: 'Salon nicht gefunden' }, { status: 404 });
    return NextResponse.json({ salon });
  } catch (err) {
    console.error('Settings GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const token = getToken(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    const salon = updateSalonSettings('demo-salon-001', {
      name: body.name,
      phone: body.phone,
      email: body.email,
      address: body.address,
      city: body.city,
      description: body.description,
      business_hours: body.business_hours,
    });
    return NextResponse.json({ salon });
  } catch (err) {
    console.error('Settings PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
