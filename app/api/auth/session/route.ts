import { NextResponse } from 'next/server';

function getToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);
  return null;
}

export async function GET(request: Request) {
  const token = getToken(request);
  if (token) {
    return NextResponse.json({ authenticated: true });
  }
  return NextResponse.json({ authenticated: false }, { status: 401 });
}
