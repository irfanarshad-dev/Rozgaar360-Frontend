import { NextResponse } from 'next/server';

export function proxy(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const protectedRoutes = ['/worker/dashboard', '/customer/dashboard', '/admin/dashboard'];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !token) {
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
    '/register',
  ],
};