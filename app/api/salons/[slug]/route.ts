import { NextResponse } from 'next/server';
import { DEMO_SALON, DEMO_SERVICES, DEMO_STYLISTS } from '@/lib/demo';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Demo mode
    if (slug === 'demo-salon' || slug === DEMO_SALON.slug) {
      return NextResponse.json({
        ...DEMO_SALON,
        // Transform to frontend format
        services: DEMO_SERVICES.map(s => ({
          id: s.id,
          name: s.name,
          duration_min: s.duration_minutes,
          price: s.price_cents / 100,
          category: s.category,
        })),
        stylists: DEMO_STYLISTS.map(s => ({
          id: s.id,
          name: s.name,
          avatar_url: s.avatar_url,
        })),
      });
    }

    // Check Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseKey) {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase
        .from('salons')
        .select('*, services(*), stylists(*)')
        .eq('slug', slug)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: 'Salon nicht gefunden' }, { status: 404 });
      }
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Salon nicht gefunden' }, { status: 404 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
