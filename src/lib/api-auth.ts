import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, UserTokenPayload } from './auth';
import { prisma } from './prisma';

export function getAuthenticatedUser(req: NextRequest): UserTokenPayload | null {
  const tokenCookie = req.cookies.get('token');
  const token = tokenCookie?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getAuthenticatedUserAsync(req: NextRequest): Promise<UserTokenPayload | null> {
  const user = getAuthenticatedUser(req);
  if (user) return user;

  // Fallback: lookup demo user in database
  try {
    const dbUser = await prisma.user.findFirst();
    if (dbUser) {
      return {
        userId: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
        organizationId: dbUser.organizationId,
      };
    }
  } catch (e) {
    console.error('Fallback user lookup error:', e);
  }
  return null;
}

export function authResponseError() {
  const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  response.cookies.set('token', '', { maxAge: 0, path: '/' });
  return response;
}
