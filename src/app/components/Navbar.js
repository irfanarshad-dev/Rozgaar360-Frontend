'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { authService } from '@/lib/auth';
import { useLanguage } from '@/lib/i18nProvider';
import NotificationBell from './NotificationBell';
import { Menu, X, Home, Briefcase, Info, LogOut, LayoutDashboard, Globe } from 'lucide-react';

const NAV_LINKS = [
  { href: '/', key: 'home', fallback: 'Home', icon: Home },
  { href: '/#services', key: 'services', fallback: 'Services', icon: Briefcase },
  { href: '/#how-it-works', key: 'howItWorks', fallback: 'How it Works', icon: Info },
  { href: '/#about', key: 'about', fallback: 'About', icon: Info },
];

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [activeSection, setActiveSection] = useState('/');
  const pathname = usePathname();
  const { language, changeLanguage, isChangingLanguage } = useLanguage();
  const { t } = useTranslation(['auth', 'common']);
  const menuRef = useRef(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { 
    setMobileOpen(false);
    if (pathname !== '/') setActiveSection(pathname);
  }, [pathname]);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
    }
    if (mobileOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [mobileOpen]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    setUser(authService.getUser());
    const handleStorage = () => setUser(authService.getUser());
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(() => setUser(authService.getUser()), 1000);
    return () => { window.removeEventListener('storage', handleStorage); clearInterval(interval); };
  }, []);

  const handleLogout = () => {
    authService.logout();
    setMobileOpen(false);
  };

  const isDashboardRoute = pathname?.startsWith('/worker') || 
                           pathname?.startsWith('/customer') || 
                           pathname?.startsWith('/admin');

  if (isDashboardRoute) return null;

  const dashboardHref = user?.role === 'worker' ? '/worker/dashboard' : '/customer/dashboard';
  const loginLabel = 'Login';
  const signUpLabel = 'Sign Up';

  return (
    <>
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-nav border-b border-gray-100/80 shadow-sm' : 'bg-white/95 border-b border-gray-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[72px]">

            <Link href="/" className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0" aria-label={t('common:home', { defaultValue: 'Home' })}>
              <Image
                src="/assests/Logo/Rozgaar360-logo.png"
                alt="Rozgaar360"
                width={260}
                height={72}
                priority
                className="h-8 sm:h-9 lg:h-10 w-auto object-contain"
              />
              <span className="text-sm sm:text-base lg:text-lg xl:text-xl font-bold text-gray-900 tracking-tight whitespace-nowrap">Rozgaar<span className="text-blue-600">360</span></span>
            </Link>

            <div className="hidden lg:flex items-center gap-1 xl:gap-2">
              {NAV_LINKS.map(({ href, key, fallback }) => {
                const isActive = pathname === '/' ? activeSection === href : pathname === href;
                const shouldHighlight = hoveredLink === href || (!hoveredLink && isActive);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setActiveSection(href)}
                    onMouseEnter={() => setHoveredLink(href)}
                    onMouseLeave={() => setHoveredLink(null)}
                    className={`inline-flex items-center h-10 px-3 xl:px-4 py-2 rounded-lg xl:rounded-xl text-sm xl:text-base font-medium transition-all duration-150 whitespace-nowrap ${
                      shouldHighlight ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {t(`common:${key}`, { defaultValue: fallback })}
                  </Link>
                );
              })}
            </div>

            <div className="hidden lg:flex items-center gap-2">
              {mounted && (
                <button
                  onClick={() => changeLanguage(language === 'en' ? 'ur' : 'en')}
                  disabled={isChangingLanguage}
                  className="inline-flex items-center h-10 gap-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg xl:rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={t('common:toggleLanguage')}
                >
                  <Globe className={`w-4 h-4 transition-transform duration-300 ${isChangingLanguage ? 'animate-spin' : ''}`} />
                  <span className="hidden xl:inline">
                    {language === 'en' ? t('common:switchToUrdu') : t('common:switchToEnglish')}
                  </span>
                </button>
              )}

              {user && (user.role === 'worker' || user.role === 'customer') && <NotificationBell />}

              {user && (user.role === 'worker' || user.role === 'customer') ? (
                <>
                  <Link
                    href={dashboardHref}
                    className="inline-flex items-center h-10 gap-2 text-blue-600 font-semibold hover:bg-blue-50 px-3 xl:px-4 py-2 rounded-lg xl:rounded-xl text-sm transition-all"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden xl:inline">{t('dashboard')}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center h-10 gap-2 text-gray-500 hover:text-red-500 hover:bg-red-50 px-3 xl:px-4 py-2 rounded-lg xl:rounded-xl text-sm font-medium transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden xl:inline">{t('logout')}</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    id="nav-login-btn"
                    className="inline-flex items-center h-10 text-gray-700 hover:text-blue-600 border border-gray-200 hover:border-blue-300 font-medium px-4 py-2 rounded-lg xl:rounded-xl text-sm transition-all"
                  >
                    <span suppressHydrationWarning>{loginLabel}</span>
                  </Link>
                  <Link
                    href="/register"
                    id="nav-signup-btn"
                    className="inline-flex items-center h-10 btn-primary text-white font-semibold px-4 py-2 rounded-lg xl:rounded-xl text-sm"
                  >
                    <span suppressHydrationWarning>{signUpLabel}</span>
                  </Link>
                </>
              )}
            </div>

            <div className="flex lg:hidden items-center gap-2">
              {user && (user.role === 'worker' || user.role === 'customer') && <NotificationBell />}
              <button
                id="mobile-menu-btn"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mounted ? (mobileOpen ? t('common:closeMenu') : t('common:openMenu')) : (mobileOpen ? 'Close menu' : 'Open menu')}
                aria-expanded={mobileOpen}
                className="inline-flex items-center justify-center h-10 w-10 p-2 rounded-lg text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors"
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity duration-300 ease-out ${
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
        onClick={() => setMobileOpen(false)}
      />

      <div
        ref={menuRef}
        className={`fixed top-0 right-0 bottom-0 z-50 w-[85vw] max-w-[320px] bg-white shadow-2xl flex flex-col lg:hidden will-change-transform ${
          mobileOpen 
            ? 'translate-x-0 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]' 
            : 'translate-x-full transition-transform duration-250 ease-[cubic-bezier(0.4,0,1,1)]'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Image
              src="/assests/Logo/Rozgaar360-logo.png"
              alt="Rozgaar360"
              width={220}
              height={62}
              className="h-9 w-auto object-contain"
            />
            <span className="text-base font-bold text-gray-900">Rozgaar<span className="text-blue-600">360</span></span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors"
            aria-label={mounted ? t('common:closeMenu') : 'Close menu'}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overscroll-contain px-4 py-6 space-y-1.5 -webkit-overflow-scrolling-touch">
          {NAV_LINKS.map(({ href, key, fallback, icon: Icon }) => {
            const isActive = pathname === '/' ? activeSection === href : pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => { setActiveSection(href); setMobileOpen(false); }}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-medium transition-all duration-150 active:scale-[0.97] ${
                  isActive ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                {t(`common:${key}`, { defaultValue: fallback })}
              </Link>
            );
          })}

          {user && (user.role === 'worker' || user.role === 'customer') && (
            <Link
              href={dashboardHref}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-all duration-150 active:scale-[0.97]"
            >
              <LayoutDashboard className="w-5 h-5 text-gray-400" />
              {t('dashboard')}
            </Link>
          )}
        </nav>

        <div className="px-4 py-5 border-t border-gray-100 bg-gray-50/30 space-y-3 flex-shrink-0">
          {mounted && (
            <button
              onClick={() => { changeLanguage(language === 'en' ? 'ur' : 'en'); }}
              disabled={isChangingLanguage}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 active:bg-gray-100 border border-gray-200 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]"
            >
              <Globe className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isChangingLanguage ? 'animate-spin' : ''}`} />
              <span>{language === 'en' ? t('common:switchToUrdu') : t('common:switchToEnglish')}</span>
            </button>
          )}

          {user && (user.role === 'worker' || user.role === 'customer') ? (
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 active:bg-red-200 transition-all duration-150 active:scale-[0.97]"
            >
              <LogOut className="w-5 h-5" />
              {t('logout')}
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex justify-center items-center py-3 rounded-xl text-sm font-semibold text-gray-700 border-2 border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition-all duration-150 active:scale-[0.97]"
              >
                <span suppressHydrationWarning>{loginLabel}</span>
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="flex justify-center items-center btn-primary py-3 rounded-xl text-sm font-semibold text-white transition-all duration-150 active:scale-[0.97]"
              >
                <span suppressHydrationWarning>{signUpLabel}</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
