import { NextResponse } from 'next/server';

// POST /api/hooks/reminder — called by n8n workflows to send appointment reminders
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { booking_id, customer_name, phone, service_name, stylist_name, appointment_time, reminder_type } = body;

    if (!booking_id || !phone) {
      return NextResponse.json({ error: 'booking_id and phone required' }, { status: 400 });
    }

    console.log(`[REMINDER HOOK] type=${reminder_type} booking=${booking_id} phone=${phone}`);

    return NextResponse.json({
      success: true,
      reminder_id: `rem-${Date.now()}`,
      type: reminder_type,
      booking_id,
    });
  } catch (err) {
    console.error('[REMINDER HOOK] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
