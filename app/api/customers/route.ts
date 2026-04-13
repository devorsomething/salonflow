import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { validateAdminAuth } from '@/lib/auth';

// GET /api/customers - List all customers (admin)
export async function GET(request: NextRequest) {
  const { userId, error } = await validateAdminAuth(request);
  
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const salonId = searchParams.get('salon_id');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    let query = supabase
      .from('customers')
      .select(`
        *,
        appointments:appointments(id, start_time, status, service_id),
        preferred_stylist:stylists(id, first_name, last_name)
      `, { count: 'exact' })
      .order('last_name', { ascending: true })
      .order('first_name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (salonId) {
      query = query.eq('salon_id', salonId);
    }

    if (search) {
      // Search by name, email, or phone
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
      );
    }

    const { data, error: dbError, count } = await query;

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 400 });
    }

    return NextResponse.json({
      data,
      total: count ?? data.length,
      offset,
      limit,
    });
  } catch (err) {
    console.error('GET /api/customers error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
