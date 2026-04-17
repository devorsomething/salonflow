import { NextRequest, NextResponse } from 'next/server';
import { getCoupons, createCoupon } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const coupons = await getCoupons();
    return NextResponse.json(coupons);
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
    const { code, discount_type, discount_value, min_order_cents, max_uses, valid_from, valid_until } = body;

    if (!code || !discount_value) {
      return NextResponse.json({ error: 'code and discount_value are required' }, { status: 400 });
    }

    const coupon = createCoupon({
      code,
      discount_type: discount_type || 'percent',
      discount_value,
      min_order_cents,
      max_uses,
      valid_from,
      valid_until
    });
    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
