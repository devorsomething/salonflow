import { NextRequest, NextResponse } from 'next/server';
import { getProductById, updateProductStock } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const body = await req.json();
    const { stock_quantity } = body;

    if (stock_quantity === undefined) {
      return NextResponse.json({ error: 'Missing field: stock_quantity' }, { status: 400 });
    }

    const product = updateProductStock(id, stock_quantity);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (err) {
    console.error('Product stock PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
