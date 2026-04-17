import { NextRequest, NextResponse } from 'next/server';
import { getCommissionById, updateCommission, deleteCommission } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const commission = getCommissionById(id);
    if (!commission) {
      return NextResponse.json({ error: 'Commission not found' }, { status: 404 });
    }

    return NextResponse.json(commission);
  } catch (err) {
    console.error('Commission GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const commission = updateCommission(id, body);
    if (!commission) {
      return NextResponse.json({ error: 'Commission not found' }, { status: 404 });
    }

    return NextResponse.json(commission);
  } catch (err) {
    console.error('Commission PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    deleteCommission(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Commission DELETE error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
