// Demo data for SalonFlow MVP - hardcoded, no Supabase needed

export const DEMO_SALON = {
  id: 'demo-salon-001',
  name: 'Friseur Meisterstück',
  slug: 'demo-salon',
  email: 'info@meisterstueck.at',
  phone: '+43 1 234 5678',
  address: 'Kärntner Straße 42, 1010 Wien',
  city: 'Wien',
  businessHours: 'Mo-Fr: 9:00-18:00, Sa: 9:00-14:00',
  description: 'Ihr Friseur in Wien mit über 20 Jahren Erfahrung',
};

export const DEMO_SERVICES = [
  { id: 'svc-1', name: 'Damenschnitt', duration_minutes: 45, price_cents: 3500, category: 'cut' },
  { id: 'svc-2', name: 'Herrenschnitt', duration_minutes: 30, price_cents: 2500, category: 'cut' },
  { id: 'svc-3', name: 'Coloring', duration_minutes: 90, price_cents: 6500, category: 'color' },
  { id: 'svc-4', name: 'Augenbrauen zupfen', duration_minutes: 15, price_cents: 1000, category: 'other' },
  { id: 'svc-5', name: 'Bart schneiden', duration_minutes: 20, price_cents: 1500, category: 'other' },
];

export const DEMO_STYLISTS = [
  { id: 'stylist-1', name: 'Maria', avatar_url: null, active: true },
  { id: 'stylist-2', name: 'Thomas', avatar_url: null, active: true },
  { id: 'stylist-3', name: 'Lisa', avatar_url: null, active: true },
];

export const DEMO_BOOKINGS: Array<{
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  stylist_id: string;
  service_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  notes?: string;
}> = [];

export function generateTimeSlots(serviceId: string, stylistId: string | null, date: string) {
  const service = DEMO_SERVICES.find(s => s.id === serviceId);
  if (!service) return [];

  const duration = service.duration_minutes;
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getDay();

  // Closed on Sunday
  if (dayOfWeek === 0) return [];

  // Business hours: Mon-Fri 9-18, Sat 9-14
  const endHour = dayOfWeek === 6 ? 14 : 18;
  const startHour = 9;

  const bookedSlots: Array<{ start: string; end: string }> = DEMO_BOOKINGS
    .filter(b => {
      const bDate = new Date(b.start_time).toISOString().split('T')[0];
      return bDate === date && b.stylist_id === (stylistId || b.stylist_id) && b.status !== 'cancelled';
    })
    .map(b => ({
      start: new Date(b.start_time).toTimeString().slice(0, 5),
      end: new Date(b.end_time).toTimeString().slice(0, 5),
    }));

  const slots: Array<{ time: string; available: boolean }> = [];

  for (let hour = startHour; hour < endHour; hour++) {
    for (let min = 0; min < 60; min += 30) {
      const slotStart = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      const slotEndMin = min + duration;
      const slotEndHour = hour + Math.floor(slotEndMin / 60);
      const slotEndMinRem = slotEndMin % 60;

      if (slotEndHour > endHour || (slotEndHour === endHour && slotEndMinRem > 0)) continue;

      const slotEnd = `${slotEndHour.toString().padStart(2, '0')}:${slotEndMinRem.toString().padStart(2, '0')}`;

      // Check if slot conflicts with existing bookings
      const isBooked = bookedSlots.some(booked => {
        return (slotStart < booked.end && slotEnd > booked.start);
      });

      slots.push({
        time: slotStart,
        available: !isBooked,
      });
    }
  }

  return slots;
}
