import { NextRequest, NextResponse } from 'next/server';
import { getSalon, getSalonServices, getSalonStylists } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const salon = await getSalon(slug) as any;

    if (!salon) {
      return NextResponse.json({ error: 'Salon nicht gefunden' }, { status: 404 });
    }

    const services = (await getSalonServices()).map((s: any) => ({
      id: s.id,
      name: s.name,
      duration_min: s.duration_minutes,
      price: s.price_cents / 100,
      category: s.category,
    }));

    const stylists = (await getSalonStylists(salon.id)).map((s: any) => ({
      id: s.id,
      name: s.name,
      avatar_url: s.avatar_url,
    }));

    return NextResponse.json({
      ...salon,
      services,
      stylists,
    });
  } catch (err) {
    console.error('Salon GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
