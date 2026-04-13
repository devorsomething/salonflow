import { NextRequest, NextResponse } from 'next/server';
import { DEMO_BOOKINGS, DEMO_SERVICES, DEMO_STYLISTS } from '@/lib/demo';

function verifyDemoSession(request: Request): boolean {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split('; ').map(c => {
      const [k, ...v] = c.split('=');
      return [k, v.join('=')];
    })
  );
  return !!cookies['salonflow_session'];
}

export async function GET(request: Request) {
  try {
    if (!verifyDemoSession(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    let bookings = [...DEMO_BOOKINGS];

    if (date) {
      bookings = bookings.filter(b => {
        const bDate = new Date(b.start_time).toISOString().split('T')[0];
        return bDate === date;
      });
    }

    const enriched = bookings.map(b => ({
      id: b.id,
      start_time: b.start_time,
      end_time: b.end_time,
      status: b.status,
      notes: b.notes || null,
      price_cents: DEMO_SERVICES.find(s => s.id === b.service_id)?.price_cents || 0,
      customer: {
        id: 'cust-1',
        name: b.customer_name,
        phone: b.customer_phone,
        email: b.customer_email,
      },
      service: {
        id: b.service_id,
        name: DEMO_SERVICES.find(s => s.id === b.service_id)?.name || 'Unknown',
        duration_min: DEMO_SERVICES.find(s => s.id === b.service_id)?.duration_minutes || 30,
      },
      stylist: {
        id: b.stylist_id,
        name: DEMO_STYLISTS.find(s => s.id === b.stylist_id)?.name || 'Unknown',
      },
    }));

    return NextResponse.json(enriched);
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!verifyDemoSession(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { serviceId, stylistId, startTime, customerName, customerPhone } = body;

    const service = DEMO_SERVICES.find(s => s.id === serviceId);
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    const booking = {
      id: `booking-${Date.now()}`,
      start_time: startTime,
      end_time: new Date(new Date(startTime).getTime() + service.duration_minutes * 60000).toISOString(),
      status: 'pending',
      stylist_id: stylistId || DEMO_STYLISTS[0].id,
      service_id: serviceId,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: '',
      notes: '',
      created_at: new Date().toISOString(),
    };

    DEMO_BOOKINGS.push(booking);

    return NextResponse.json({
      id: booking.id,
      start_time: booking.start_time,
      end_time: booking.end_time,
      status: booking.status,
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
