import { NextRequest, NextResponse } from 'next/server';
import { getSalon, getSalonServices, getSalonStylists } from '@/lib/db';

function getToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);
  return null;
}

export async function GET(request: Request) {
  try {
    const token = getToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const salon = await getSalon('demo-salon') as any;
    if (!salon) {
      return NextResponse.json({ error: 'Salon nicht gefunden' }, { status: 404 });
    }

    const services = (await getSalonServices()).map((s: any) => ({
      id: s.id,
      name: s.name,
      duration_min: s.duration_minutes,
      price_cents: s.price_cents,
      category: s.category,
    }));

    const stylists = await getSalonStylists(salon.id);

    return NextResponse.json({
      ...salon,
      services,
      stylists,
    });
  } catch (err) {
    console.error('Salon API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
