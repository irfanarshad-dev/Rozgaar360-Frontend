'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { authService } from '@/lib/auth';
import { useLanguage } from '@/lib/i18nProvider';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const { language, changeLanguage } = useLanguage();
  const { t } = useTranslation('auth');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setUser(authService.getUser());
    const handleStorageChange = () => {
      setUser(authService.getUser());
    };
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(() => {
      setUser(authService.getUser());
    }, 1000);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    authService.logout();
  };

  if (isAdminRoute) {
    return null;
  }

  return (
    <nav className="bg-[#EBF4FC] py-4 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-blue-600 rounded-[8px] p-1.5 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-6 h-6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 20 15 h 16 v 75 h -16 z" fill="white" rx="3" />
                <path d="M 28 23 h 35 a 22 22 0 0 1 0 44 h -8" stroke="white" strokeWidth="16" />
                <polygon points="57,46 39,67 57,88" fill="white" />
                <path d="M 52 67 l 16 28 h 18 l -16 -28 z" fill="white" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-800 tracking-tight">Rozgaar360</span>
          </Link>
          
          {/* Nav Links - Desktop */}
          <div className="hidden md:flex items-center space-x-8 text-[15px] font-medium text-gray-700">
            <Link href="/" className="bg-[#DCEFFE] text-blue-600 px-4 py-1.5 rounded-full">Home</Link>
            <Link href="/#services" className="hover:text-blue-600 transition-colors">Services</Link>
            <Link href="/#how-it-works" className="hover:text-blue-600 transition-colors">How it Works</Link>
            <Link href="/#about" className="hover:text-blue-600 transition-colors">About</Link>
          </div>

          <div className="flex items-center space-x-3">
            {/* Language Toggle */}
            {mounted && (
              <button
                onClick={() => changeLanguage(language === 'en' ? 'ur' : 'en')}
                className="text-gray-500 hover:text-blue-600 px-2 text-sm font-medium transition-colors"
                title="Toggle Language"
              >
                {language === 'en' ? 'اردو' : 'EN'}
              </button>
            )}
            
            {/* Notification Bell */}
            {user && (user.role === 'worker' || user.role === 'customer') && (
              <NotificationBell />
            )}
            
            {user && (user.role === 'worker' || user.role === 'customer') ? (
              <>
                <Link href={
                  user.role === 'worker' ? '/worker/dashboard' : '/customer/dashboard'
                } className="text-blue-600 font-medium hover:text-blue-700 px-3 py-2">
                  {t('dashboard')}
                </Link>
                <button onClick={handleLogout} className="text-gray-600 font-medium hover:text-red-500 px-3 py-2">
                  {t('logout')}
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="bg-white text-blue-600 hover:bg-gray-50 border border-blue-200 font-medium px-6 py-2 rounded-full transition-colors text-sm">
                  Login
                </Link>
                <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-full transition-colors text-sm">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}