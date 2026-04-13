import { NextResponse } from 'next/server';
import { DEMO_SERVICES } from '@/lib/demo';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const salonSlug = searchParams.get('salonSlug');

    // Demo mode
    if (!salonSlug || salonSlug.includes('demo')) {
      return NextResponse.json({ services: DEMO_SERVICES });
    }

    // Real mode would query Supabase
    return NextResponse.json({ services: DEMO_SERVICES });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
