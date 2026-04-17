import { NextResponse } from 'next/server';
import { getCustomerMemberships, createCustomerMembership } from '@/lib/db';
import { DEMO_SALON } from '@/lib/demo';

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
    const customerId = searchParams.get('customer_id');
    if (customerId) {
      const memberships = await getCustomerMemberships(customerId);
      return NextResponse.json({ data: memberships, total: memberships.length });
    } else {
      const memberships = await getCustomerMemberships(DEMO_SALON.id as string);
      return NextResponse.json({ data: memberships, total: memberships.length });
    }
  } catch (err) {
    console.error('Customer memberships GET error:', err);
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
    const { customer_id, membership_id, start_date, end_date, status, auto_renew } = body;

    if (!customer_id || !membership_id || !start_date || !end_date) {
      return NextResponse.json({ error: 'Missing required fields: customer_id, membership_id, start_date, end_date' }, { status: 400 });
    }

    const membership = await createCustomerMembership({ customer_id, membership_id, start_date, end_date, status: status || 'active', auto_renew: auto_renew ? 1 : 0 });
    return NextResponse.json(membership, { status: 201 });
  } catch (err) {
    console.error('Customer memberships POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
