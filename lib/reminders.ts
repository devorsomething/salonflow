// @ts-nocheck
/**
 * SalonFlow Reminder Module
 * SMS/Email reminder sending with placeholder provider integrations
 */

import { DEMO_BOOKINGS } from './demo';
import { getAppointmentById, getDb, getSupabase } from './db';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface ReminderJob {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceName: string;
  stylistName: string;
  appointmentTime: string; // ISO 8601 datetime string
  salonPhone: string;
  salonEmail: string;
}

export interface ReminderResult {
  success: boolean;
  error?: string;
  messageId?: string;
}

export type ReminderType = '24h' | '2h' | 'confirm';

// =============================================================================
// GERMAN MESSAGE TEMPLATES
// =============================================================================

const TEMPLATES_DE: Record<ReminderType, { sms: (job: ReminderJob) => string; email: (job: ReminderJob) => string; subject: (job: ReminderJob) => string }> = {
  confirm: {
    sms: (job) =>
      `${job.customerName}, ${formatDateDE(job.appointmentTime)} · ${formatTimeDE(job.appointmentTime)} — Ihr Termin bei ${job.stylistName} ist bestätigt. ${job.serviceName}. Fragen? ${job.salonPhone}`,
    email: (job) =>
      `Hallo ${job.customerName},\n\nvielen Dank für Ihre Buchung — Ihr Termin ist hiermit fest eingeplant.\n\nTermindetails:\nDatum:      ${formatDateDE(job.appointmentTime)}\nUhrzeit:    ${formatTimeDE(job.appointmentTime)}\nStylist:    ${job.stylistName}\nService:    ${job.serviceName}\n\nFalls Sie noch etwas anpassen möchten, antworten Sie gerne auf diese E-Mail oder rufen Sie uns an: ${job.salonPhone}\n\nWir freuen uns auf Sie.\nBookCut`,
    subject: () => 'Buchung bestätigt — Wir freuen uns auf Sie',
  },
  '24h': {
    sms: (job) =>
      `${job.customerName}, morgen ${formatTimeDE(job.appointmentTime)} erwarten wir Sie bei ${job.stylistName} — ${job.serviceName}. Fragen? ${job.salonPhone}`,
    email: (job) =>
      `Hallo ${job.customerName},\n\nkurze freundliche Erinnerung: Morgen ist Ihr Termin bei BookCut.\n\nTermindetails:\nDatum:      ${formatDateDE(job.appointmentTime)}\nUhrzeit:    ${formatTimeDE(job.appointmentTime)}\nStylist:    ${job.stylistName}\nService:    ${job.serviceName}\n\nBitte planen Sie ein paar Minuten Vorlauf für Ihre Ankunft ein. Sollten Sie Ihren Termin verschieben müssen, geben Sie uns gerne Bescheid — wir finden immer eine Lösung.\n\nBookCut · ${job.salonPhone} · ${job.salonEmail}`,
    subject: (job) => `Morgen ${formatTimeDE(job.appointmentTime)} — Ihr Termin bei BookCut`,
  },
  '2h': {
    sms: (job) =>
      `${job.customerName}, in ~2 Stunden startet Ihr Termin bei ${job.stylistName}. Wir freuen uns auf Sie! ${job.salonPhone}`,
    email: (job) =>
      `Hallo ${job.customerName},\n\nIhr Termin bei BookCut beginnt in Kürze — machen Sie sich auf den Weg.\n\n${formatTimeDE(job.appointmentTime)} mit ${job.stylistName} — ${job.serviceName}.\n\nFalls kurzfristig etwas dazwischenkommt, informieren Sie uns bitte so schnell wie möglich. Wir sind für Sie da.\n\nBookCut · ${job.salonPhone} · ${job.salonEmail}`,
    subject: (job) => `Heute ${formatTimeDE(job.appointmentTime)} — Ihr Termin bei BookCut startet gleich`,
  },
};

// =============================================================================
// DATE/TIME HELPERS (German locale)
// =============================================================================

function formatDateDE(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatTimeDE(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', hour12: false });
}

// =============================================================================
// MESSAGE FORMATTING
// =============================================================================

export function formatReminderMessage(job: ReminderJob, type: ReminderType): { sms: string; email: string; subject: string } {
  const t = TEMPLATES_DE[type];
  return {
    sms: t.sms(job),
    email: t.email(job),
    subject: t.subject(job),
  };
}

// =============================================================================
// SMS REMINDER
// =============================================================================

/**
 * Send SMS reminder to customer.
 * 
 * PLACEHOLDER: Integrate one of:
 * - Twilio: twilio.com | npm install twilio
 *   const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
 *   await twilio.messages.create({ body: smsText, from: process.env.TWILIO_PHONE_NUMBER, to: job.customerPhone });
 * 
 * - MessageBird: messagebird.com | npm install messagebird
 *   const messagebird = require('messagebird')(process.env.MESSAGEBIRD_API_KEY);
 *   await messagebird.messages.create({ originator: process.env.MESSAGEBIRD_ORIGINATOR, recipients: [job.customerPhone], body: smsText });
 * 
 * - SMS77: sms77.io | npm install sms77
 *   await fetch('https://gateway.sms77.io/api/sms', { method: 'POST', headers: { ... }, body: JSON.stringify({ to: job.customerPhone, text: smsText, from: 'SalonFlow' }) });
 */
export async function sendSmsReminder(job: ReminderJob, messageText?: string): Promise<ReminderResult> {
  const smsText = messageText || formatReminderMessage(job, '24h').sms;
  const n8nWebhook = process.env.N8N_WEBHOOK_URL || 'https://n8n.devmiro.cloud/webhook/salonflow-reminder-v3';

  try {
    console.log(`[SMS REMINDER] Calling n8n webhook: ${n8nWebhook}`);
    const response = await fetch(n8nWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: 'sms',
        appointmentId: job.id,
        customer_name: job.customerName,
        customer_phone: job.customerPhone,
        customer_email: job.customerEmail,
        service_name: job.serviceName,
        stylist_name: job.stylistName,
        start_time: job.appointmentTime,
        salon_name: job.salonPhone,
        smsText,
      }),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook error: ${response.status}`);
    }

    const result = await response.json();
    console.log(`[SMS REMINDER] ✓ Sent via n8n:`, result);
    return { success: true, messageId: result.messageId || `n8n-${Date.now()}` };
  } catch (err: any) {
    const message = err?.message || 'Unknown n8n error';
    console.error('[SMS REMINDER] n8n error:', message);
    return { success: false, error: message };
  }
}

// =============================================================================
// EMAIL REMINDER
// =============================================================================

/**
 * Send email reminder to customer.
 * 
 * PLACEHOLDER: Integrate one of:
 * - SendGrid: sendgrid.com | npm install @sendgrid/mail
 *   const sgMail = require('@sendgrid/mail');
 *   sgMail.setApiKey(process.env.SENDGRID_API_KEY);
 *   await sgMail.send({ to: job.customerEmail, from: job.salonEmail, subject: emailSubject, text: emailBody });
 * 
 * - Resend: resend.com | npm install resend
 *   const { Resend } = require('resend');
 *   const resend = new Resend(process.env.RESEND_API_KEY);
 *   await resend.emails.send({ from: job.salonEmail, to: job.customerEmail, subject: emailSubject, text: emailBody });
 * 
 * - Nodemailer: nodemailer | npm install nodemailer
 *   const nodemailer = require('nodemailer');
 *   const transporter = nodemailer.createTransport({ ... });
 *   await transporter.sendMail({ from: job.salonEmail, to: job.customerEmail, subject: emailSubject, text: emailBody });
 */
export async function sendEmailReminder(
  job: ReminderJob,
  emailSubject?: string,
  emailBody?: string,
  reminderType: ReminderType = '24h'
): Promise<ReminderResult> {
  const { subject, email } = formatReminderMessage(job, reminderType);
  const emailSubjectFinal = emailSubject || subject;
  const emailBodyFinal = emailBody || email;
  const n8nWebhook = process.env.N8N_EMAIL_WEBHOOK_URL || 'https://n8n.devmiro.cloud/webhook/salonflow-email-smtp';

  try {
    console.log(`[EMAIL REMINDER] Calling n8n webhook`);
    const response = await fetch(n8nWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: 'email',
        type: reminderType,
        appointmentId: job.id,
        customer_name: job.customerName,
        customer_phone: job.customerPhone,
        customer_email: job.customerEmail,
        service_name: job.serviceName,
        stylist_name: job.stylistName,
        start_time: job.appointmentTime,
        salon_phone: job.salonPhone,
        salon_email: job.salonEmail,
        emailSubject: emailSubjectFinal,
        emailBody: emailBodyFinal,
      }),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook error: ${response.status}`);
    }

    const result = await response.json();
    console.log(`[EMAIL REMINDER] ✓ Sent via n8n:`, result);
    return { success: true, messageId: result.messageId || `n8n-${Date.now()}` };
  } catch (err: any) {
    const message = err?.message || 'Unknown n8n error';
    console.error('[EMAIL REMINDER] n8n error:', message);
    return { success: false, error: message };
  }
}

// =============================================================================
// DATABASE: REMINDER RECORDS
// =============================================================================

export interface ReminderRecord {
  id: string;
  appointment_id: string;
  type: ReminderType;
  channel: 'sms' | 'email' | 'both';
  status: 'pending' | 'sent' | 'failed';
  sent_at: string | null;
  error_message: string | null;
  created_at: string;
}

/**
 * Create a new reminder record in the database.
 */
export function createReminder(data: {
  appointmentId: string;
  type: ReminderType;
  channel: 'sms' | 'email' | 'both';
}): { id: string; created_at: string } {
  // Demo mode: return placeholder
  const id = `rem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  return { id, created_at: new Date().toISOString() };
}

/**
 * Update reminder status after send attempt.
 */
export function updateReminderStatus(
  reminderId: string,
  status: 'sent' | 'failed',
  errorMessage?: string
) {
  // Demo mode: no-op
}

/**
 * Get reminders, optionally filtered by appointment.
 */
export function getReminders(appointmentId?: string): ReminderRecord[] {
  // Demo mode: return empty array
  return [];
}

export function getReminderByAppointment(appointmentId: string, type: string, channel: string): ReminderRecord | null {
  // Demo mode: return null (will create new reminder)
  return null;
}

function formatSqlDateTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function parseBusinessDateInput(input?: string): Date {
  if (!input) {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Vienna',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).formatToParts(new Date());

    const map = Object.fromEntries(parts.filter((p) => p.type !== 'literal').map((p) => [p.type, p.value]));
    return new Date(
      Number(map.year),
      Number(map.month) - 1,
      Number(map.day),
      Number(map.hour),
      Number(map.minute),
      Number(map.second),
    );
  }

  const match = input.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (match) {
    const [, year, month, day, hour, minute, second = '00'] = match;
    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
    );
  }

  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Invalid now timestamp');
  }
  return parsed;
}

export async function processScheduledReminders(opts: {
  type: ReminderType;
  channel?: 'sms' | 'email' | 'both';
  now?: string;
}) {
  const { type, channel = 'both', now } = opts;
  const db = getDb();
  const nowDate = parseBusinessDateInput(now);

  const windowStart = new Date(nowDate);
  const windowEnd = new Date(nowDate);

  if (type === '24h') {
    windowStart.setHours(windowStart.getHours() + 23);
    windowEnd.setHours(windowEnd.getHours() + 25);
  } else if (type === '2h') {
    windowStart.setMinutes(windowStart.getMinutes() + 90);
    windowEnd.setMinutes(windowEnd.getMinutes() + 150);
  } else {
    windowStart.setMinutes(windowStart.getMinutes() - 15);
    windowEnd.setMinutes(windowEnd.getMinutes() + 15);
  }

  const windowStartSql = formatSqlDateTime(windowStart);
  const windowEndSql = formatSqlDateTime(windowEnd);
  const reminderKey = `cron-${type}-${channel}`;

  const appointments = db.prepare(`
    SELECT
      a.id,
      a.customer_id,
      a.customer_name,
      a.customer_phone,
      a.customer_email,
      a.start_time,
      s.name as service_name,
      st.name as stylist_name,
      sa.phone as salon_phone,
      sa.email as salon_email
    FROM appointments a
    LEFT JOIN services s ON a.service_id = s.id
    LEFT JOIN stylists st ON a.stylist_id = st.id
    LEFT JOIN salon sa ON a.salon_id = sa.id
    WHERE a.start_time BETWEEN ? AND ?
      AND a.status IN ('pending', 'confirmed', 'in_progress')
    ORDER BY a.start_time ASC
  `).all(windowStartSql, windowEndSql) as any[];

  const processed: any[] = [];

  for (const appt of appointments) {
    const alreadySent = db.prepare(`
      SELECT id, sent_at
      FROM reminder_logs
      WHERE appointment_id = ? AND reminder_id = ? AND status = 'sent'
      ORDER BY sent_at DESC
      LIMIT 1
    `).get(appt.id, reminderKey) as { id: string; sent_at?: string } | undefined;

    if (alreadySent) {
      processed.push({
        appointmentId: appt.id,
        status: 'skipped',
        reason: 'already_sent',
        previous_log_id: alreadySent.id,
        sent_at: alreadySent.sent_at || null,
      });
      continue;
    }

    const job: ReminderJob = {
      id: appt.id,
      customerName: appt.customer_name || 'Kunde',
      customerPhone: appt.customer_phone || '',
      customerEmail: appt.customer_email || '',
      serviceName: appt.service_name || 'Service',
      stylistName: appt.stylist_name || 'Stylist',
      appointmentTime: appt.start_time,
      salonPhone: appt.salon_phone || '',
      salonEmail: appt.salon_email || '',
    };

    const formatted = formatReminderMessage(job, type);
    const results: Record<string, ReminderResult> = {};

    if (channel === 'sms' || channel === 'both') {
      if (job.customerPhone) {
        results.sms = await sendSmsReminder(job, formatted.sms);
      } else {
        results.sms = { success: false, error: 'No phone number on file' };
      }
    }

    if (channel === 'email' || channel === 'both') {
      if (job.customerEmail) {
        results.email = await sendEmailReminder(job, formatted.subject, formatted.email, type);
      } else {
        results.email = { success: false, error: 'No email address on file' };
      }
    }

    const attempted = Object.keys(results).length;
    const allSent = attempted > 0 && Object.values(results).every((r) => r.success);
    const anyFailed = Object.values(results).some((r) => !r.success);
    const status = allSent ? 'sent' : anyFailed ? 'failed' : 'skipped';

    db.prepare(`
      INSERT INTO reminder_logs (id, reminder_id, customer_id, appointment_id, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      reminderKey,
      appt.customer_id || null,
      appt.id,
      status,
    );

    processed.push({
      appointmentId: appt.id,
      status,
      results,
    });
  }

  return {
    type,
    channel,
    now: formatSqlDateTime(nowDate),
    windowStart: windowStartSql,
    windowEnd: windowEndSql,
    matchedCount: appointments.length,
    processedCount: processed.filter((p) => p.status === 'sent').length,
    skippedCount: processed.filter((p) => p.status === 'skipped').length,
    failedCount: processed.filter((p) => p.status === 'failed').length,
    processed,
  };
}

/**
 * Build a ReminderJob from an appointment ID by fetching all related data.
 */
export async function buildReminderJob(appointmentId: string): Promise<ReminderJob | null> {
  // Primary path: local SQLite demo/prod DB used by the current app
  try {
    const appt = getAppointmentById(appointmentId) as any;
    if (appt) {
      const db = getDb();
      const salon = db
        .prepare('SELECT phone, email FROM salon WHERE id = ?')
        .get(appt.salon_id || 'demo-salon-001') as { phone?: string; email?: string } | undefined;

      return {
        id: appt.id,
        customerName: appt.customer_name || 'Kunde',
        customerPhone: appt.customer_phone || '',
        customerEmail: appt.customer_email || '',
        serviceName: appt.service_name || 'Service',
        stylistName: appt.stylist_name || 'Stylist',
        appointmentTime: appt.start_time,
        salonPhone: salon?.phone || '',
        salonEmail: salon?.email || '',
      };
    }
  } catch (err) {
    console.log('[buildReminderJob] SQLite lookup failed, trying legacy fallback:', err);
  }

  // Legacy fallback: Supabase bookings schema
  try {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not configured');

    const { data: appt, error } = await supabase
      .from('bookings')
      .select('*, services(name), stylists(name), salons(name, phone, email)')
      .eq('id', appointmentId)
      .single();

    if (error || !appt) {
      console.log('[buildReminderJob] Appointment not found in legacy DB, falling back to demo');
    } else {
      const service = Array.isArray(appt.services) ? appt.services[0] : appt.services;
      const stylist = Array.isArray(appt.stylists) ? appt.stylists[0] : appt.stylists;
      const salon = Array.isArray(appt.salons) ? appt.salons[0] : appt.salons;
      return {
        id: appt.id,
        customerName: appt.customer_name || 'Kunde',
        customerPhone: appt.customer_phone || '',
        customerEmail: appt.customer_email || '',
        serviceName: service?.name || 'Service',
        stylistName: stylist?.name || 'Stylist',
        appointmentTime: appt.start_time,
        salonPhone: salon?.phone || '',
        salonEmail: salon?.email || '',
      };
    }
  } catch (err) {
    console.log('[buildReminderJob] Legacy DB lookup failed, falling back to demo:', err);
  }

  // Demo mode fallback
  const appt = (DEMO_BOOKINGS as any).find((b: any) => b.id === appointmentId);
  if (!appt) return null;
  return {
    id: appt.id,
    customerName: appt.customer_name || 'Demo Customer',
    customerPhone: appt.customer_phone || '+43 664 0000000',
    customerEmail: appt.customer_email || 'demo@example.at',
    serviceName: 'Service',
    stylistName: 'Stylist',
    appointmentTime: appt.start_time,
    salonPhone: '+43 1 234 5678',
    salonEmail: 'demo@salonflow.app',
  };
}
