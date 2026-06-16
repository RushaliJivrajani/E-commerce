import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'rush-fashion-super-secret-key-987654321';

// Synchronous or lightweight verification for proxy runtime
function isTokenValid(token: string): boolean {
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch (e) {
    return false;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('admin_token')?.value;

  const isAdminRoute = pathname.startsWith('/admin') || pathname === '/admin';
  const isLoginRoute = pathname === '/login';

  if (isAdminRoute) {
    if (!token || !isTokenValid(token)) {
      const url = new URL('/login', request.url);
      // Pass the original path so we can redirect back after login
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  if (isLoginRoute && token && isTokenValid(token)) {
    const url = new URL('/admin/dashboard', request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/login'
  ],
};
