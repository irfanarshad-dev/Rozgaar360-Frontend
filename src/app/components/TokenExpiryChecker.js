'use client';
import { useEffect } from 'react';
import { authService } from '@/lib/auth';

export default function TokenExpiryChecker() {
  useEffect(() => {
    // Check immediately
    authService.checkTokenExpiry();

    // Check every minute
    const interval = setInterval(() => {
      authService.checkTokenExpiry();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
