import { NextResponse } from 'next/server';
import { getPayments, createPayment } from '@/lib/db';

function getToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);
  return null;
}

export async function GET(request: Request) {
  try {
    const token = getToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customer_id') || undefined;
    const appointmentId = searchParams.get('appointment_id') || undefined;
    const payments = await getPayments();
    return NextResponse.json({ data: payments, total: payments.length });
  } catch (err) {
    console.error('Payments GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = getToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const { customer_id, appointment_id, amount_cents, method, status, notes } = body;

    if (!amount_cents) {
      return NextResponse.json({ error: 'Missing required field: amount_cents' }, { status: 400 });
    }

    const payment = createPayment({ customer_id, appointment_id, amount_cents, method, status, notes });
    return NextResponse.json({ payment }, { status: 201 });
  } catch (err) {
    console.error('Payments POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
