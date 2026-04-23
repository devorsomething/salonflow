import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 400 });
    }

    let bookingId = '';
    try {
      bookingId = Buffer.from(token, 'base64').toString('utf-8');
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    // Fetch appointment with service price
    const db = getDb();
    const booking = db.prepare(`
      SELECT a.*, s.name as service_name, s.price_cents, s.duration_minutes,
             st.name as stylist_name
      FROM appointments a
      LEFT JOIN services s ON a.service_id = s.id
      LEFT JOIN stylists st ON a.stylist_id = st.id
      WHERE a.id = ?
    `).get(bookingId) as any;

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({
      booking: {
        id: booking.id,
        serviceName: booking.service_name || '—',
        stylistName: booking.stylist_name || '—',
        date: booking.start_time.split('T')[0],
        time: booking.start_time.split('T')[1]?.slice(0, 5) || '',
        customerName: booking.customer_name,
        customerPhone: booking.customer_phone,
        customerEmail: booking.customer_email,
        price: booking.price_cents ? `€${(booking.price_cents / 100).toFixed(2)}` : '—',
        status: booking.status,
      }
    });
  } catch (err) {
    console.error('Verify error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
