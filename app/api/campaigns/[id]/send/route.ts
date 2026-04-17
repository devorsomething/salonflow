import { NextRequest, NextResponse } from 'next/server';
import { sendCampaign } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const campaign = sendCampaign(id);
    return NextResponse.json({ campaign });
  } catch (err: any) {
    console.error('Campaign send POST error:', err);
    if (err.message === 'Campaign not found') {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }
    if (err.message === 'Campaign already sent') {
      return NextResponse.json({ error: 'Campaign already sent' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
