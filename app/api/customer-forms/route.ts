import { NextResponse } from 'next/server';
import { getCustomerForms, createCustomerForm } from '@/lib/db';

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
    const form_type = searchParams.get('form_type') || undefined;
    const forms = await getCustomerForms({ customerId, form_type });
    return NextResponse.json({ data: forms, total: forms.length });
  } catch (err) {
    console.error('Customer forms GET error:', err);
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
    const { customer_id, form_type, form_data } = body;

    if (!form_type) {
      return NextResponse.json({ error: 'Missing required field: form_type' }, { status: 400 });
    }

    const form = await createCustomerForm({ customer_id, form_type, form_data });
    return NextResponse.json(form, { status: 201 });
  } catch (err) {
    console.error('Customer forms POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
