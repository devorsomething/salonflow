import { NextResponse } from 'next/server';
import { getCampaigns, createCampaign } from '@/lib/db';

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
    const campaigns = await getCampaigns();
    return NextResponse.json({ data: campaigns, total: campaigns.length });
  } catch (err) {
    console.error('Campaigns GET error:', err);
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
    const { name, type, target_segment, message, status, scheduled_at } = body;

    if (!name || !message) {
      return NextResponse.json({ error: 'Missing required fields: name, message' }, { status: 400 });
    }

    const campaign = createCampaign({ name, type, target_segment, message, status, scheduled_at });
    return NextResponse.json({ campaign }, { status: 201 });
  } catch (err) {
    console.error('Campaigns POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
