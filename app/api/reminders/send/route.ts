/**
 * POST /api/reminders/send
 * Trigger sending of SMS/Email reminders for an appointment.
 * Looks up appointment by ID, sends reminders based on customer contact info,
 * and marks the reminder as sent or failed.
 */

import { NextResponse } from 'next/server';
import {
  buildReminderJob,
  sendSmsReminder,
  sendEmailReminder,
  updateReminderStatus,
  formatReminderMessage,
  getReminderByAppointment,
  ReminderType,
} from '@/lib/reminders';

function getToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);
  return null;
}

function verifySession(request: Request): boolean {
  return !!getToken(request);
}

// =============================================================================
// POST /api/reminders/send
// =============================================================================

export async function POST(request: Request) {
  try {
    if (!verifySession(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      appointmentId,
      reminderId,
      type = '24h',
      channel = 'both',
      smsText,
      emailSubject,
      emailBody,
    } = body as {
      appointmentId?: string;
      reminderId?: string;
      type?: ReminderType;
      channel?: 'sms' | 'email' | 'both';
      smsText?: string;
      emailSubject?: string;
      emailBody?: string;
    };

    if (!appointmentId) {
      return NextResponse.json({ error: 'Missing required field: appointmentId' }, { status: 400 });
    }

    // Build the reminder job from appointment data
    const job = await buildReminderJob(appointmentId);
    if (!job) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Resolve reminder ID if not provided (look up by appointment in DB)
    let reminderIdFinal = reminderId;
    if (!reminderIdFinal) {
      const existing = getReminderByAppointment(appointmentId, type || '24h', channel || 'both');
      if (existing) {
        reminderIdFinal = existing.id;
      }
    }

    const results: {
      sms?: { success: boolean; error?: string; messageId?: string };
      email?: { success: boolean; error?: string; messageId?: string };
    } = {};

    // Send SMS if requested and customer has a phone number
    if ((channel === 'sms' || channel === 'both') && job.customerPhone) {
      const msgText = smsText || formatReminderMessage(job, type || '24h').sms;
      results.sms = await sendSmsReminder(job, msgText);
    } else if (channel === 'sms' && !job.customerPhone) {
      results.sms = { success: false, error: 'No phone number on file for this customer' };
    }

    // Send Email if requested and customer has an email address
    if ((channel === 'email' || channel === 'both') && job.customerEmail) {
      const msgEmail = formatReminderMessage(job, type || '24h');
      results.email = await sendEmailReminder(job, emailSubject || msgEmail.subject, emailBody || msgEmail.email, type || '24h');
    } else if (channel === 'email' && !job.customerEmail) {
      results.email = { success: false, error: 'No email address on file for this customer' };
    }

    // Determine overall status
    const allSent = Object.values(results).every((r) => r && r.success);
    const anyFailed = Object.values(results).some((r) => r && !r.success);
    const overallStatus = allSent ? 'sent' : anyFailed ? 'failed' : 'pending';

    // Update reminder record in DB if we have a reminderId and status is resolved
    if (reminderIdFinal && overallStatus !== 'pending') {
      const errorMessage =
        anyFailed
          ? Object.entries(results)
              .filter(([, r]) => r && !r.success)
              .map(([ch, r]) => `${ch}: ${r?.error}`)
              .join('; ')
          : undefined;

      updateReminderStatus(reminderIdFinal, overallStatus as 'sent' | 'failed', errorMessage);
    }

    console.log(`[REMINDERS/SEND] appointment=${appointmentId} sms=${results.sms?.success} email=${results.email?.success} overall=${overallStatus}`);

    return NextResponse.json({
      appointmentId,
      reminderId: reminderIdFinal,
      type: type || '24h',
      channel,
      results,
      overallStatus,
    });
  } catch (err) {
    console.error('[REMINDERS/SEND] POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
