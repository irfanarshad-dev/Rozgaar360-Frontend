'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/lib/auth';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only protect dashboard routes, not login/register
    if (pathname === '/admin/login' || pathname === '/admin/register') {
      return;
    }

    const user = authService.getUser();
    const hasValidToken = authService.isAuthenticated();

    if (!hasValidToken) {
      router.replace('/admin/login');
      return;
    }

    if (user && user.role !== 'admin') {
      router.replace('/');
    }
  }, [pathname, router]);

  return <>{children}</>;
}
