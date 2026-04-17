import { NextRequest, NextResponse } from 'next/server';
import { getMembershipPlans, createMembershipPlan } from '@/lib/db';

function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  return !!authHeader?.startsWith('Bearer ');
}

export async function GET(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const plans = await getMembershipPlans();
    return NextResponse.json({ plans });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, price_cents, duration_days, discount_percent } = body;

    if (!name || price_cents === undefined) {
      return NextResponse.json({ error: 'name and price_cents are required' }, { status: 400 });
    }

    const plan = await createMembershipPlan({
      name,
      description,
      price_cents,
      duration_days,
      discount_percent,
    });

    return NextResponse.json({ plan }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
