import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route requires authentication
  // Routes that require auth: /admin, /profile (and any future protected routes)
  const isProtectedRoute = pathname.startsWith('/admin') || 
                          pathname.startsWith('/profile');

  // Get auth token from cookies
  const authToken = request.cookies.get('auth-token');
  const userId = request.cookies.get('userId');

  // If accessing protected route without auth, redirect to login
  if (isProtectedRoute && (!authToken || !userId)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If accessing login page while authenticated, redirect to admin
  if (pathname === '/login' && authToken && userId) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
