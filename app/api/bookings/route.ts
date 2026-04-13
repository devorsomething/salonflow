import { NextResponse } from 'next/server';
import { DEMO_BOOKINGS, DEMO_SERVICES, DEMO_STYLISTS } from '@/lib/demo';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const salonSlug = searchParams.get('salonSlug');
    const date = searchParams.get('date');

    // Demo mode
    if (!salonSlug || salonSlug.includes('demo')) {
      const dayBookings = DEMO_BOOKINGS.filter(b => {
        const bDate = new Date(b.start_time).toISOString().split('T')[0];
        return bDate === date;
      });

      const enriched = dayBookings.map(b => ({
        ...b,
        service: DEMO_SERVICES.find(s => s.id === b.service_id),
        stylist: DEMO_STYLISTS.find(s => s.id === b.stylist_id),
      }));

      return NextResponse.json({ appointments: enriched });
    }

    return NextResponse.json({ appointments: [] });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { salonSlug, serviceId, stylistId, startTime, customerName, customerEmail, customerPhone, notes } = body;

    if (!salonSlug || !serviceId || !startTime || !customerName || !customerPhone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const service = DEMO_SERVICES.find(s => s.id === serviceId);
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Create booking
    const booking = {
      id: `booking-${Date.now()}`,
      salon_id: salonSlug,
      service_id: serviceId,
      stylist_id: stylistId || DEMO_STYLISTS[0].id,
      start_time: startTime,
      end_time: new Date(new Date(startTime).getTime() + service.duration_minutes * 60000).toISOString(),
      status: 'pending',
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      notes,
      created_at: new Date().toISOString(),
    };

    DEMO_BOOKINGS.push(booking);

    const verifyToken = Buffer.from(`${booking.id}`).toString('base64');

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      verifyToken,
      message: 'Booking created in demo mode'
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
