import { NextRequest, NextResponse } from 'next/server';
import { getMembershipPlans, createMembershipPlan } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // GET returns membership PLANS
    const plans = await getMembershipPlans();
    return NextResponse.json(plans);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const { name, description, price_cents, duration_days, services_included: benefits, discount_percent = 0 } = body;
    if (!name || !price_cents) {
      return NextResponse.json({ error: 'name and price_cents are required' }, { status: 400 });
    }
    const membership = await createMembershipPlan({ name, description, price_cents, duration_days, services_included: benefits, discount_percent: 0 });
    return NextResponse.json(membership, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
