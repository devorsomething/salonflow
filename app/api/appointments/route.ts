import { NextResponse } from 'next/server';
import { getAppointments, createAppointment, updateAppointment, getAppointmentById, getCustomers } from '@/lib/db';

function getToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);
  return null;
}

function verifySession(request: Request): boolean {
  return !!getToken(request);
}

// Demo salon ID for SQLite
const DEMO_SALON_ID = 'demo-salon-001';

async function fetchCustomerById(customerId: string) {
  const customers = await getCustomers(DEMO_SALON_ID);
  const list = Array.isArray(customers) ? customers : (customers as any)?.data || [];
  return list.find((customer: any) => customer.id === customerId) || null;
}

export async function GET(request: Request) {
  try {
    if (!verifySession(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const appointments = await getAppointments(DEMO_SALON_ID, { startDate: startDate || undefined, endDate: endDate || undefined });
    return NextResponse.json(appointments);
  } catch (err) {
    console.error('Appointments GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!verifySession(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { customer_id, service_id, stylist_id, start_time, end_time, customer_name, customer_phone, customer_email, notes, status } = body;

    if (!service_id || !start_time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const selectedCustomer = customer_id ? await fetchCustomerById(customer_id) : null;

    const result = await createAppointment({
      salon_id: DEMO_SALON_ID,
      serviceId: service_id,
      stylistId: stylist_id || null,
      startTime: start_time,
      endTime: end_time,
      customerName: customer_name || selectedCustomer?.name,
      customerPhone: customer_phone || selectedCustomer?.phone,
      customerEmail: customer_email || selectedCustomer?.email,
      notes,
    });

    if (!result) {
      return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
    }

    if (status && status !== 'pending') {
      await updateAppointment(result.id, { status });
    }

    const fullAppointment = getAppointmentById(result.id);
    return NextResponse.json(fullAppointment || {
      id: result.id,
      start_time: result.start_time,
      end_time: result.end_time,
      status: status || 'pending',
    }, { status: 201 });
  } catch (err) {
    console.error('Appointments POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
