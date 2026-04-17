/**
 * GET /api/reminders - List reminders, optionally filtered by appointmentId
 * POST /api/reminders - Create a new reminder for an appointment
 */

import { NextResponse } from 'next/server';
import { getReminders, createReminder, buildReminderJob, ReminderType } from '@/lib/reminders';

function getToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);
  return null;
}

function verifySession(request: Request): boolean {
  return !!getToken(request);
}

// =============================================================================
// GET /api/reminders
// =============================================================================

export async function GET(request: Request) {
  try {
    if (!verifySession(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get('appointmentId') || undefined;

    const reminders = getReminders(appointmentId);
    return NextResponse.json(reminders);
  } catch (err) {
    console.error('[REMINDERS] GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// =============================================================================
// POST /api/reminders
// =============================================================================

export async function POST(request: Request) {
  try {
    if (!verifySession(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { appointmentId, type, channel } = body as {
      appointmentId: string;
      type: ReminderType;
      channel: 'sms' | 'email' | 'both';
    };

    if (!appointmentId || !type || !channel) {
      return NextResponse.json({ error: 'Missing required fields: appointmentId, type, channel' }, { status: 400 });
    }

    if (!['24h', '2h', 'confirm'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type. Must be one of: 24h, 2h, confirm' }, { status: 400 });
    }
    if (!['sms', 'email', 'both'].includes(channel)) {
      return NextResponse.json({ error: 'Invalid channel. Must be one of: sms, email, both' }, { status: 400 });
    }

    // Verify appointment exists
    const job = await buildReminderJob(appointmentId);
    if (!job) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const reminder = createReminder({ appointmentId, type, channel });

    console.log(`[REMINDERS] Created reminder ${reminder.id} for appointment ${appointmentId} (${type} via ${channel})`);

    return NextResponse.json({
      id: reminder.id,
      appointmentId,
      type,
      channel,
      status: 'pending',
      created_at: reminder.created_at,
    }, { status: 201 });
  } catch (err) {
    console.error('[REMINDERS] POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
