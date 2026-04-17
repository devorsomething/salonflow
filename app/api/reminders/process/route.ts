import { NextRequest, NextResponse } from 'next/server';
import { processScheduledReminders, ReminderType } from '@/lib/reminders';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const type = body?.type as ReminderType | undefined;
    const channel = body?.channel as 'sms' | 'email' | 'both' | undefined;
    const now = body?.now as string | undefined;

    if (!type || !['24h', '2h', 'confirm'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type. Must be one of: 24h, 2h, confirm' }, { status: 400 });
    }

    if (channel && !['sms', 'email', 'both'].includes(channel)) {
      return NextResponse.json({ error: 'Invalid channel. Must be one of: sms, email, both' }, { status: 400 });
    }

    const result = await processScheduledReminders({ type, channel: channel || 'both', now });
    return NextResponse.json(result);
  } catch (error) {
    console.error('[REMINDERS/PROCESS] POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
