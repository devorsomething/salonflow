import { NextRequest, NextResponse } from 'next/server';
import { validateCoupon } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { code, order_cents } = body;

    if (!code) {
      return NextResponse.json({ error: 'code is required' }, { status: 400 });
    }

    const result = validateCoupon(code, order_cents || 0);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
