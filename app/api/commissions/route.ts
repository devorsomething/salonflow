import { NextRequest, NextResponse } from 'next/server';
import {
  getPartnerCommissions,
  getPartnerEarningsSummary,
  createPartnerCommission,
  markCommissionPaid,
  recalculatePartnerEarnings,
} from '@/lib/db/marketplace';
import { getCommissions as getSalonCommissions, createCommission } from '@/lib/db';

const DEMO_SALON_ID = 'demo-salon-001';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const partnerId = searchParams.get('partner_id');
    const summary = searchParams.get('summary') === 'true';

    // Partner portal mode
    if (partnerId) {
      if (summary) {
        const earnings = getPartnerEarningsSummary(partnerId);
        return NextResponse.json(earnings);
      }

      const commissions = getPartnerCommissions(partnerId);
      return NextResponse.json(commissions);
    }

    // Salon admin mode
    const commissions = await getSalonCommissions(DEMO_SALON_ID);
    return NextResponse.json({ commissions });
  } catch (error: any) {
    console.error('Commissions GET error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { partner_id, referred_salon_id, application_id, amount_cents, mark_as_paid } = body;
    const { stylist_id, service_id, commission_percent } = body;

    // Salon admin mode
    if (stylist_id && commission_percent !== undefined) {
      const commission = createCommission({
        stylist_id,
        service_id: service_id || undefined,
        commission_percent,
      });
      return NextResponse.json({ commission }, { status: 201 });
    }

    // Partner portal mode
    if (!partner_id || amount_cents === undefined) {
      return NextResponse.json({ error: 'partner_id and amount_cents are required' }, { status: 400 });
    }

    if (mark_as_paid && (referred_salon_id || application_id)) {
      const commission = createPartnerCommission({
        partner_id,
        referred_salon_id,
        application_id,
        amount_cents,
        status: 'paid',
      });
      return NextResponse.json(commission, { status: 201 });
    }

    const commission = createPartnerCommission({
      partner_id,
      referred_salon_id,
      application_id,
      amount_cents,
    });

    return NextResponse.json(commission, { status: 201 });
  } catch (error: any) {
    console.error('Commissions POST error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { commission_id, action } = body;

    if (!commission_id) {
      return NextResponse.json({ error: 'commission_id is required' }, { status: 400 });
    }

    if (action === 'mark_paid') {
      const commission = markCommissionPaid(commission_id);
      return NextResponse.json(commission);
    }

    if (action === 'recalculate') {
      const result = recalculatePartnerEarnings(body.partner_id);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Commissions PATCH error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
