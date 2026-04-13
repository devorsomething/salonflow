import { NextResponse } from 'next/server';
import { DEMO_SERVICES, DEMO_STYLISTS, generateTimeSlots } from '@/lib/demo';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const salonSlug = searchParams.get('salonSlug') || searchParams.get('salon_id');
    const serviceId = searchParams.get('serviceId') || searchParams.get('service_id');
    const stylistId = searchParams.get('stylistId') || searchParams.get('stylist_id');
    const date = searchParams.get('date');

    // Demo mode
    if (!date || !serviceId) {
      return NextResponse.json({ slots: [] });
    }

    const service = DEMO_SERVICES.find(s => s.id === serviceId);
    if (!service) {
      return NextResponse.json({ slots: [] });
    }

    const slots = generateTimeSlots(serviceId, stylistId, date);

    return NextResponse.json({ slots });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
