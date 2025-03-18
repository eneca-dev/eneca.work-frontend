import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of paths that require authentication
const protectedPaths = ['/dashboard', '/profile', '/settings'];

// List of paths that are accessible only for non-authenticated users
const authPaths = ['/login', '/register', '/forgot-password'];

/**
 * Middleware to protect routes based on authentication status
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if auth cookie exists
  const authCookie = request.cookies.get('auth-token');
  const isAuthenticated = !!authCookie;

  // Redirect logic for protected routes when not authenticated
  if (protectedPaths.some(path => pathname.startsWith(path)) && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  if (authPaths.some(path => pathname === path) && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all protected routes
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    // Match all auth routes
    '/login',
    '/register',
    '/forgot-password',
  ],
}; 