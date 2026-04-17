import { NextRequest, NextResponse } from 'next/server';
import { calculateCommission } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const stylistId = searchParams.get('stylist_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (!stylistId || !startDate || !endDate) {
      return NextResponse.json({ error: 'stylist_id, start_date, and end_date are required' }, { status: 400 });
    }

    const result = calculateCommission(stylistId, startDate, endDate);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
