import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';
import { AUTH_CONFIG } from '@/lib/auth-config';

// routes that require authentication
const protectedRoutes = ['/dashboard', '/profile', '/settings', '/plans'];

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // verify if it is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.includes(route));
  
  if (isProtectedRoute) {
    const sessionToken = request.cookies.get(AUTH_CONFIG.ACCESS_COOKIE_NAME);
    
    if (!sessionToken) {
      const loginUrl = new URL('/auth/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  // apply internationalization middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};
