'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const user = authService.getUser();

      if (!token || !user) {
        router.push('/login');
        return;
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        router.push('/');
        return;
      }

      setAuthorized(true);
      setLoading(false);
    };

    checkAuth();
  }, [router, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return children;
}