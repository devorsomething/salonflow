import { NextRequest, NextResponse } from 'next/server';
import { createCustomerMembership } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id: membership_id } = await params;
    const body = await req.json();
    const { customer_id } = body;
    if (!customer_id) {
      return NextResponse.json({ error: 'customer_id is required' }, { status: 400 });
    }
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const subscription = await createCustomerMembership({ customer_id, membership_id, start_date: startDate, end_date: endDate, status: 'active', auto_renew: 0 });
    return NextResponse.json(subscription, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
