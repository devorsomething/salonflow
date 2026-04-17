import { NextRequest, NextResponse } from 'next/server';
import {
  getMarketplacePartnerById,
  getMarketplacePartnerByReferralCode,
  getPartnerCommissions,
  getPartnerEarningsSummary,
} from '@/lib/db/marketplace';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Partner ID is required' }, { status: 400 });
    }

    // Try to find by ID or slug or referral code
    let partner = getMarketplacePartnerById(id);
    if (!partner && id.length <= 20) {
      // Might be a referral code
      partner = getMarketplacePartnerByReferralCode(id.toUpperCase());
    }

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Check for ?commissions=true query param
    const { searchParams } = new URL(req.url);
    const includeCommissions = searchParams.get('commissions') === 'true';
    const includeEarnings = searchParams.get('earnings') === 'true';

    const partnerAny = partner as any;

    if (includeEarnings) {
      const earnings = getPartnerEarningsSummary(partnerAny.id);
      return NextResponse.json({ ...partnerAny, earnings });
    }

    if (includeCommissions) {
      const commissions = getPartnerCommissions(partnerAny.id);
      return NextResponse.json({ ...partnerAny, commissions });
    }

    return NextResponse.json(partner);
  } catch (error: any) {
    console.error('Partner GET error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
