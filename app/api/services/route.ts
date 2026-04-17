import { NextResponse } from 'next/server';
import { getSalonServices } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const services = getSalonServices();
    return NextResponse.json({ services });
  } catch (err) {
    console.error('Services GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
