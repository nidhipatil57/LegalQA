import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, UserTokenPayload } from './auth';

export function getAuthenticatedUser(req: NextRequest): UserTokenPayload | null {
  const tokenCookie = req.cookies.get('token');
  const token = tokenCookie?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function authResponseError() {
  const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  response.cookies.set('token', '', { maxAge: 0, path: '/' });
  return response;
}
