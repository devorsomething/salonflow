import { NextResponse } from 'next/server';
import { getAppointments, createAppointment, getAppointmentById } from '@/lib/db';
import { DEMO_SALON } from '@/lib/demo';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const appointments = await getAppointments(DEMO_SALON.id as string, {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
    return NextResponse.json({ appointments });
  } catch (err) {
    console.error('Bookings GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Support both camelCase (frontend) and snake_case naming
    const service_id = body.service_id || body.serviceId;
    const stylist_id = body.stylist_id || body.stylistId;
    const start_time = body.start_time || body.startTime;
    const end_time = body.end_time || body.endTime;
    const customer_name = body.customer_name || body.customerName;
    const customer_phone = body.customer_phone || body.customerPhone;
    const customer_email = body.customer_email || body.customerEmail;
    const notes = body.notes;

    if (!service_id || !start_time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await createAppointment({
      salon_id: DEMO_SALON.id as string,
      service_id,
      stylist_id: stylist_id || 'stylist-1',
      start_time,
      end_time: end_time || start_time,
      customer_name,
      customer_phone,
      customer_email,
      notes,
    });

    if (!result) {
      return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
    }

    // Trigger booking confirmation email workflow in n8n (best-effort).
    // Booking creation should not fail if the external workflow is temporarily unavailable.
    let confirmationTriggered = false;
    let confirmationError: string | undefined;
    try {
      const appointment = getAppointmentById(result.id) as any;
      const webhookUrl =
        process.env.N8N_BOOKING_CONFIRMATION_WEBHOOK_URL ||
        'https://n8n.devmiro.cloud/webhook/salonflow-email-smtp';

      const payload = {
        type: 'confirm',
        customer_name: customer_name || appointment?.customer_name || 'Kunde',
        customer_phone: customer_phone || appointment?.customer_phone || '',
        customer_email: customer_email || appointment?.customer_email || '',
        service_name: appointment?.service_name || service_id,
        stylist_name: appointment?.stylist_name || stylist_id || 'Stylist',
        start_time: appointment?.start_time || start_time,
        salon_name: DEMO_SALON.name || 'BookCut',
        salon_phone: DEMO_SALON.phone || '',
        salon_email: DEMO_SALON.email || 'termin@bookcut.app',
      };

      const n8nRes = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!n8nRes.ok) {
        throw new Error(`n8n webhook failed with status ${n8nRes.status}`);
      }

      confirmationTriggered = true;
    } catch (err: any) {
      confirmationError = err?.message || 'n8n confirmation webhook failed';
      console.error('[BOOKINGS] Confirmation webhook error:', confirmationError);
    }

    return NextResponse.json({
      success: true,
      bookingId: result.id,
      verifyToken: Buffer.from(result.id).toString('base64'),
      message: 'Termin gebucht',
      confirmationTriggered,
      ...(confirmationError ? { confirmationError } : {}),
    });
  } catch (err) {
    console.error('Bookings POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
