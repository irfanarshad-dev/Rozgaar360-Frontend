import { NextResponse } from 'next/server';

export function middleware(request) {
  // Check for token in cookies or localStorage (handled client-side)
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Protected routes
  const protectedRoutes = ['/worker/dashboard', '/customer/dashboard'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Note: localStorage check happens client-side in components
  // This middleware only handles cookie-based tokens
  if (isProtectedRoute && !token) {
    // Let client-side handle localStorage token check
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/worker/dashboard/:path*',
    '/customer/dashboard/:path*', 
    '/login',
    '/register'
  ]
};