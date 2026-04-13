import { NextResponse } from 'next/server';
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!verifyDemoSession(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const bookingIndex = DEMO_BOOKINGS.findIndex(b => b.id === id);
    if (bookingIndex === -1) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Update booking
    if (body.status) DEMO_BOOKINGS[bookingIndex].status = body.status;
    if (body.start_time) DEMO_BOOKINGS[bookingIndex].start_time = body.start_time;
    if (body.end_time) DEMO_BOOKINGS[bookingIndex].end_time = body.end_time;
    if (body.notes !== undefined) DEMO_BOOKINGS[bookingIndex].notes = body.notes;

    const b = DEMO_BOOKINGS[bookingIndex];
    return NextResponse.json({
      id: b.id,
      start_time: b.start_time,
      end_time: b.end_time,
      status: b.status,
      notes: b.notes,
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
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
