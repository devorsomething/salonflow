import { NextRequest, NextResponse } from 'next/server';
import {
  getMarketplacePartners,
  createPartnerApplication,
  getPartnerApplications,
} from '@/lib/db/marketplace';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const featured = searchParams.get('featured');

    let featuredBool: boolean | undefined;
    if (featured === 'true') featuredBool = true;
    if (featured === 'false') featuredBool = false;

    const partners = getMarketplacePartners({ category, featured: featuredBool });
    return NextResponse.json(partners);
  } catch (error: any) {
    console.error('Marketplace GET error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Application endpoint - no auth required for public submissions
    const body = await req.json();
    const { salon_name, contact_name, contact_email, contact_phone, website, message, referral_code } = body;

    if (!salon_name || !contact_name || !contact_email) {
      return NextResponse.json(
        { error: 'salon_name, contact_name and contact_email are required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contact_email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const application = createPartnerApplication({
      salon_name,
      contact_name,
      contact_email,
      contact_phone,
      website,
      message,
      referral_code,
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error: any) {
    console.error('Marketplace POST error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
