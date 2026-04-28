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
  const [user, setUser]               = useState(null);
  const [mounted, setMounted]         = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [scrolled, setScrolled]       = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [activeSection, setActiveSection] = useState('/');
  const pathname                       = usePathname();
  const isAdminRoute                   = pathname?.startsWith('/admin');
  const { language, changeLanguage, isChangingLanguage }  = useLanguage();
  const { t } = useTranslation(['auth', 'common']);
  const menuRef = useRef(null);

  // Scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { 
    setMobileOpen(false);
    if (pathname !== '/') setActiveSection(pathname);
  }, [pathname]);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
    }
    if (mobileOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [mobileOpen]);

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => { setMounted(true); }, []);

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

  return (
    <>
      {/* ΓöÇΓöÇ Main Navbar ΓöÇΓöÇ */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass-nav border-b border-gray-100/80 shadow-sm'
          : 'bg-white/95 border-b border-gray-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0" aria-label={t('common:home', { defaultValue: 'Home' })}>
              <Image
                src="/assests/Logo/Rozgaar360-logo.png"
                alt="Rozgaar360"
                width={260}
                height={72}
                priority
                className="h-11 w-auto object-contain"
              />
              <span className="inline text-base sm:text-xl font-bold text-gray-900 tracking-tight">Rozgaar<span className="text-blue-600">360</span></span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
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
                    className={`px-4 py-2 rounded-xl text-[14px] font-medium transition-all duration-150 ${
                      shouldHighlight
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600'
                    }`}
                  >
                    {t(`common:${key}`, { defaultValue: fallback })}
                  </Link>
                );
              })}
            </div>

            {/* Desktop Right Side */}
            <div className="hidden md:flex items-center gap-2">
              {/* Language Toggle */}
              {mounted && (
                <button
                  onClick={() => changeLanguage(language === 'en' ? 'ur' : 'en')}
                  disabled={isChangingLanguage}
                  className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-xl text-sm font-medium transition-all"
                  title={t('common:toggleLanguage')}
                >
                  <Globe className="w-4 h-4" />
                  {language === 'en' ? t('common:switchToUrdu') : t('common:switchToEnglish')}
                </button>
              )}

              {/* Notification Bell */}
              {user && (user.role === 'worker' || user.role === 'customer') && (
                <NotificationBell />
              )}

              {user && (user.role === 'worker' || user.role === 'customer') ? (
                <>
                  <Link
                    href={dashboardHref}
                    className="flex items-center gap-1.5 text-blue-600 font-semibold hover:bg-blue-50 px-4 py-2 rounded-xl text-[14px] transition-all"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    {t('dashboard')}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl text-[14px] font-medium transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    id="nav-login-btn"
                    className="text-gray-700 hover:text-blue-600 border border-gray-200 hover:border-blue-300 font-medium px-5 py-2 rounded-xl text-sm transition-all"
                  >
                    {t('common:login')}
                  </Link>
                  <Link
                    href="/register"
                    id="nav-signup-btn"
                    className="btn-primary text-white font-semibold px-5 py-2 rounded-xl text-sm"
                  >
                    {t('common:signUp')}
                  </Link>
                </>
              )}
            </div>

            {/* Mobile: right side actions */}
            <div className="flex md:hidden items-center gap-2">
              {user && (user.role === 'worker' || user.role === 'customer') && (
                <NotificationBell />
              )}
              <button
                id="mobile-menu-btn"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? t('common:closeMenu') : t('common:openMenu')}
                aria-expanded={mobileOpen}
                className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ΓöÇΓöÇ Mobile Menu Backdrop ΓöÇΓöÇ */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ΓöÇΓöÇ Mobile Drawer ΓöÇΓöÇ */}
      <div
        ref={menuRef}
        className={`fixed top-0 right-0 bottom-0 z-50 w-[85vw] max-w-xs bg-white shadow-2xl flex flex-col md:hidden transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Image
              src="/assests/Logo/Rozgaar360-logo.png"
              alt="Rozgaar360"
              width={220}
              height={62}
              className="h-10 w-auto object-contain"
            />
            <span className="font-bold text-gray-900">Rozgaar<span className="text-blue-600">360</span></span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label={t('common:closeMenu')}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Drawer Nav Links */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {NAV_LINKS.map(({ href, key, fallback, icon: Icon }) => {
            const isActive = pathname === '/' ? activeSection === href : pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => { setActiveSection(href); setMobileOpen(false); }}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
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
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-medium text-gray-700 hover:bg-gray-50 transition-all"
            >
              <LayoutDashboard className="w-5 h-5 text-gray-400" />
              {t('dashboard')}
            </Link>
          )}
        </nav>

        {/* Drawer Footer */}
        <div className="px-4 py-5 border-t border-gray-100 space-y-3">
          {/* Language Toggle */}
          {mounted && (
            <button
              onClick={() => { changeLanguage(language === 'en' ? 'ur' : 'en'); }}
              disabled={isChangingLanguage}
              className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
            >
              <Globe className="w-4 h-4 text-gray-400" />
              {language === 'en' ? t('common:switchToUrdu') : t('common:switchToEnglish')}
            </button>
          )}

          {user && (user.role === 'worker' || user.role === 'customer') ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-all"
            >
              <LogOut className="w-4 h-4" />
              {t('logout')}
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex justify-center items-center py-3 rounded-xl text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 transition-all"
              >
                {t('common:login')}
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="flex justify-center items-center btn-primary py-3 rounded-xl text-sm font-semibold text-white"
              >
                {t('common:signUp')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
