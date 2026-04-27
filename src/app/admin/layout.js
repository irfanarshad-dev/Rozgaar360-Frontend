'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/lib/auth';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Keep auth pages accessible.
    if (pathname === '/admin/login' || pathname === '/admin/register') {
      return;
    }

    const hasValidToken = authService.isAuthenticated();
    const user = authService.getUser();

    if (!hasValidToken) {
      router.replace('/login');
      return;
    }

    if (user && user.role !== 'admin') {
      router.replace('/login');
    }
  }, [pathname, router]);

  return <>{children}</>;
}
