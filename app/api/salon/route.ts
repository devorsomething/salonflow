import { NextRequest, NextResponse } from 'next/server';
import { DEMO_SALON, DEMO_SERVICES, DEMO_STYLISTS } from '@/lib/demo';

function verifyDemoSession(request: Request): { valid: boolean; salonSlug?: string } {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split('; ').map(c => {
      const [k, ...v] = c.split('=');
      return [k, v.join('=')];
    })
  );

  const sessionCookie = cookies['salonflow_session'];
  if (!sessionCookie) return { valid: false };

  try {
    const session = JSON.parse(Buffer.from(sessionCookie, 'base64').toString());
    if (session.email && session.salonId) {
      return { valid: true, salonSlug: session.salonId };
    }
  } catch {
    // Invalid session
  }
  return { valid: false };
}

export async function GET(request: Request) {
  try {
    // Verify session
    const { valid } = verifyDemoSession(request);
    if (!valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return demo salon data with services and stylists
    return NextResponse.json({
      ...DEMO_SALON,
      services: DEMO_SERVICES.map(s => ({
        id: s.id,
        name: s.name,
        duration_min: s.duration_minutes,
        price_cents: s.price_cents,
      })),
      stylists: DEMO_STYLISTS,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
