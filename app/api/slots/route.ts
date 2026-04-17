import { NextResponse } from 'next/server';
import { getBookedSlots, getSalonServices, getSalonStylists } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId') || searchParams.get('service_id');
    const stylistId = searchParams.get('stylistId') || searchParams.get('stylist_id');
    const date = searchParams.get('date');

    if (!date || !serviceId) {
      return NextResponse.json({ slots: [] });
    }

    const services = await getSalonServices() as { id: string; duration_minutes: number }[];
    const service = services.find((s) => s.id === serviceId);
    if (!service) {
      return NextResponse.json({ slots: [] });
    }

    const duration = service.duration_minutes;
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();

    // Closed on Sunday
    if (dayOfWeek === 0) return NextResponse.json({ slots: [] });

    // Business hours: Mon-Fri 9-18, Sat 9-14
    const endHour = dayOfWeek === 6 ? 14 : 18;
    const startHour = 9;

    // Get booked slots
    const booked = await getBookedSlots(date, stylistId || undefined);

    // Generate all possible slots
    const slots: { time: string; available: boolean }[] = [];
    for (let hour = startHour; hour < endHour; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const slotStart = new Date(dateObj);
        slotStart.setHours(hour, min, 0, 0);
        const slotEnd = new Date(slotStart.getTime() + duration * 60000);

        // Don't go past end hour
        if (slotEnd.getHours() > endHour || (slotEnd.getHours() === endHour && slotEnd.getMinutes() > 0)) {
          continue;
        }

        // Check if slot conflicts with booked appointments
        const slotStartISO = slotStart.toISOString();
        const slotEndISO = slotEnd.toISOString();

        const isBooked = booked.some((b: { start_time: string; end_time: string }) => {
          const bStart = new Date(b.start_time);
          const bEnd = new Date(b.end_time);
          return slotStart < bEnd && slotEnd > bStart;
        });

        slots.push({
          time: `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`,
          available: !isBooked,
        });
      }
    }

    return NextResponse.json({ slots });
  } catch (err) {
    console.error('Slots error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
