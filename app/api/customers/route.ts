import { NextResponse } from 'next/server';
import { getCustomers } from '@/lib/db';

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

    const customers = await getCustomers();
    return NextResponse.json({
      data: customers,
      total: customers.length,
    });
  } catch (err) {
    console.error('Customers GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
