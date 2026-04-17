import { NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/lib/db';

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
    const products = await getProducts();
    return NextResponse.json({ data: products, total: products.length });
  } catch (err) {
    console.error('Products GET error:', err);
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
    const { name, sku, description, price_cents, cost_cents, stock_quantity, low_stock_threshold, category, image_url } = body;

    if (!name || price_cents === undefined) {
      return NextResponse.json({ error: 'Missing required fields: name, price_cents' }, { status: 400 });
    }

    const product = createProduct({ name, sku, description, price_cents, cost_cents, stock_quantity, low_stock_threshold, category, image_url });
    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    console.error('Products POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
