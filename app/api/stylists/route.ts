import { NextRequest, NextResponse } from 'next/server';
import { getStylists, createStylist, updateStylist, deleteStylist } from '@/lib/db';

function getToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);
  return null;
}

export async function GET(request: Request) {
  try {
    const token = getToken(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const stylists = getStylists();
    return NextResponse.json({ stylists });
  } catch (err) {
    console.error('Stylists GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = getToken(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    if (!body.name) return NextResponse.json({ error: 'Name ist erforderlich' }, { status: 400 });
    const stylist = createStylist({ name: body.name, avatar_url: body.avatar_url });
    return NextResponse.json({ stylist }, { status: 201 });
  } catch (err) {
    console.error('Stylists POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const token = getToken(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    if (!body.id) return NextResponse.json({ error: 'ID ist erforderlich' }, { status: 400 });
    const stylist = updateStylist(body.id, { name: body.name, avatar_url: body.avatar_url, active: body.active });
    return NextResponse.json({ stylist });
  } catch (err) {
    console.error('Stylists PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const token = getToken(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID ist erforderlich' }, { status: 400 });
    deleteStylist(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Stylists DELETE error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
