import { NextRequest, NextResponse } from 'next/server';
import { getCustomerMembershipById, updateCustomerMembership } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const membership = getCustomerMembershipById(id);
    if (!membership) {
      return NextResponse.json({ error: 'Customer membership not found' }, { status: 404 });
    }
    return NextResponse.json(membership);
  } catch (err) {
    console.error('Customer membership GET error:', err);
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
    const membership = updateCustomerMembership(id, body);
    if (!membership) {
      return NextResponse.json({ error: 'Customer membership not found' }, { status: 404 });
    }
    return NextResponse.json(membership);
  } catch (err) {
    console.error('Customer membership PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
