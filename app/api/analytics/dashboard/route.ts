import { NextRequest, NextResponse } from 'next/server';
import { getAppointments, getCustomers, getServices } from '@/lib/db';
import { DEMO_SALON, DEMO_BOOKINGS } from '@/lib/demo';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const salonId = DEMO_SALON.id as string;
    const appointments = await getAppointments(salonId);
    const customers = await getCustomers(salonId);
    const services = await getServices(salonId);

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

    const todayAppts = appointments.filter((a: any) => a.start_time.split('T')[0] === today && a.status !== 'cancelled');
    const weekAppts = appointments.filter((a: any) => a.start_time.split('T')[0] >= weekAgo && a.status !== 'cancelled');
    const monthAppts = appointments.filter((a: any) => a.start_time.split('T')[0] >= monthStart && a.status !== 'cancelled');

    const todayRevenue = todayAppts.filter((a: any) => a.status === 'completed').reduce((sum: number, a: any) => sum + (a.price_cents || 0), 0) / 100;
    const weekRevenue = weekAppts.filter((a: any) => a.status === 'completed').reduce((sum: number, a: any) => sum + (a.price_cents || 0), 0) / 100;
    const monthRevenue = monthAppts.filter((a: any) => a.status === 'completed').reduce((sum: number, a: any) => sum + (a.price_cents || 0), 0) / 100;

    // Service breakdown
    const serviceRevenue: Record<string, number> = {};
    monthAppts.filter((a: any) => a.status === 'completed').forEach((a: any) => {
      const svcName = a.service?.name || 'Unknown';
      serviceRevenue[svcName] = (serviceRevenue[svcName] || 0) + (a.price_cents || 0) / 100;
    });

    // Daily breakdown for last 7 days
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayAppts = appointments.filter((a: any) => a.start_time.split('T')[0] === dateStr && a.status !== 'cancelled');
      dailyData.push({
        date: dateStr,
        appointments: dayAppts.length,
        revenue: dayAppts.filter((a: any) => a.status === 'completed').reduce((sum: number, a: any) => sum + (a.price_cents || 0), 0) / 100,
      });
    }

    return NextResponse.json({
      todayAppointments: todayAppts.length,
      todayRevenue,
      weekAppointments: weekAppts.length,
      weekRevenue,
      monthAppointments: monthAppts.length,
      monthRevenue,
      totalCustomers: customers.length,
      totalServices: services.length,
      serviceRevenue,
      dailyData,
      pendingAppointments: appointments.filter((a: any) => a.status === 'pending').length,
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
