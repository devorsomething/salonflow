import { NextResponse } from 'next/server';

// POST /api/hooks/sms — called by n8n workflows to send SMS
// Body: { phone, message, booking_id, type: 'confirmation'|'reminder_24h'|'reminder_2h'|'cancelled' }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, message, booking_id, type } = body;

    if (!phone || !message) {
      return NextResponse.json({ error: 'phone and message required' }, { status: 400 });
    }

    // In production this would call an SMS provider (SMS77, Placetel, etc.)
    // For now, log the SMS and return success
    console.log(`[SMS HOOK] type=${type} booking=${booking_id} phone=${phone} message=${message}`);

    // TODO: Integrate real SMS provider here
    // Example with SMS77:
    // const smsRes = await fetch('https://gateway.sms77.io/api/sms', {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${process.env.SMS77_API_KEY}` },
    //   body: JSON.stringify({ to: phone, text: message, from: 'BookCut' }),
    // });

    return NextResponse.json({
      success: true,
      sms_id: `sms-${Date.now()}`,
      provider: 'demo',
      logged: { phone, message, type, booking_id },
    });
  } catch (err) {
    console.error('[SMS HOOK] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Health check
export async function GET() {
  return NextResponse.json({ status: 'ok', endpoint: 'sms-hook' });
}
