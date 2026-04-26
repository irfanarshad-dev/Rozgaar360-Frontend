import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Protected routes
  const protectedRoutes = ['/worker/dashboard', '/customer/dashboard', '/admin/dashboard'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

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
    '/admin/dashboard/:path*',
    '/login',
    '/register'
  ]
};