import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeJwtPayload(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = atob(base64);
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const tokenCookie = request.cookies.get('token');
  const token = tokenCookie?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isDashboardPage = pathname.startsWith('/dashboard');

  if (isDashboardPage) {
    if (!token) {
      // Redirect to login if not logged in
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    const payload = decodeJwtPayload(token);
    const isExpired = payload && payload.exp && (Date.now() / 1000 > payload.exp);
    
    if (!payload || isExpired) {
      // Clear invalid/expired token and redirect
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }

    // Role-based route checks
    if (pathname.startsWith('/dashboard/admin') && payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  if (isAuthPage && token) {
    const payload = decodeJwtPayload(token);
    const isExpired = payload && payload.exp && (Date.now() / 1000 > payload.exp);
    
    if (payload && !isExpired) {
      // Redirect logged-in users away from login/signup
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      // Clear invalid/expired token on auth page visits
      const response = NextResponse.next();
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
};
