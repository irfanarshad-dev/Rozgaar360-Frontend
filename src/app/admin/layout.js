'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';

export default function AdminLayout({ children }) {
  const router = useRouter();

  useEffect(() => {
    const user = authService.getUser();
    
    if (!user) {
      router.push('/admin/login');
      return;
    }

    if (user.role !== 'admin') {
      router.push('/');
    }
  }, [router]);

  return <>{children}</>;
}
