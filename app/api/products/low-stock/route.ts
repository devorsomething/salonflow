import { NextResponse } from 'next/server';
import { getLowStockProducts } from '@/lib/db';

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
    const threshold = searchParams.get('threshold') ? parseInt(searchParams.get('threshold')!) : undefined;
    const products = await getLowStockProducts(threshold);
    return NextResponse.json({ data: products, total: products.length });
  } catch (err) {
    console.error('Low stock GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
