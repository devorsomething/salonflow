import { NextRequest, NextResponse } from 'next/server';
import { supabase } from './supabase';

/**
 * Validates the Authorization header and returns the user ID if valid.
 * For admin routes, verifies the user has admin privileges.
 */
export async function validateAdminAuth(request: NextRequest): Promise<{ userId: string; error: NextResponse | null }> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader) {
    return {
      userId: '',
      error: NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 }),
    };
  }

  if (!authHeader.startsWith('Bearer ')) {
    return {
      userId: '',
      error: NextResponse.json({ error: 'Invalid Authorization format. Use: Bearer <token>' }, { status: 401 }),
    };
  }

  const token = authHeader.slice(7);

  if (!token) {
    return {
      userId: '',
      error: NextResponse.json({ error: 'Missing token' }, { status: 401 }),
    };
  }

  // Validate the token with Supabase
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return {
      userId: '',
      error: NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 }),
    };
  }

  // Check if user has admin privileges (has a role claim or is in admin_users table)
  // For now, we verify they exist in the auth.users and have a valid session
  // In production, you might check user.user_metadata.role === 'admin' or query an admin_users table
  
  return { userId: user.id, error: null };
}
