'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { authService } from '@/lib/auth';
import { useLanguage } from '@/lib/i18nProvider';
import NotificationBell from '../NotificationBell';
import ProfilePhotoUpload from '../ProfilePhotoUpload';
import {
  Home, Search, Calendar, Bell, MessageCircle, Briefcase,
  LogOut, Menu, X, ChevronRight, Settings, Camera, User as UserIcon, Globe
} from 'lucide-react';
import { Info } from 'lucide-react';

const CUSTOMER_LINKS = [
  { href: '/customer/dashboard',      labelKey: 'common:dashboard',     fallback: 'Dashboard', icon: Home },
  { href: '/customer/recommendations', labelKey: 'common:findWorkers',   fallback: 'Find Workers', icon: Search },
  { href: '/customer/bookings',       labelKey: 'common:myBookings',    fallback: 'My Bookings', icon: Calendar },
  { href: '/customer/notifications',  labelKey: 'common:notifications', fallback: 'Notifications', icon: Bell },
  { href: '/customer/chat',           labelKey: 'common:messages',      fallback: 'Messages', icon: MessageCircle },
];

const WORKER_LINKS = [
  { href: '/worker/dashboard',  labelKey: 'common:dashboard', icon: Home, fallback: 'Dashboard' },
  { href: '/worker/bookings',   labelKey: 'worker:jobRequests', icon: Briefcase, fallback: 'Job Requests' },
  { href: '/worker/chat',       labelKey: 'common:messages', icon: MessageCircle, fallback: 'Messages' },
];

const HOME_LINKS = [
  { href: '/', labelKey: 'common:home', fallback: 'Home', icon: Home },
  { href: '/#services', labelKey: 'common:services', fallback: 'Services', icon: Briefcase },
  { href: '/#how-it-works', labelKey: 'common:howItWorks', fallback: 'How it works', icon: Search },
  { href: '/#about', labelKey: 'common:about', fallback: 'About', icon: Info },
];

function SidebarContent({ links, pathname, onLogout, onClose, t }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between h-16 px-5 border-b border-gray-100 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2.5" onClick={onClose}>
          <Image
            src="/assests/Logo/Rozgaar360-logo.png"
            alt="Rozgaar360"
            width={110}
            height={32}
            className="h-8 w-auto object-contain"
          />
          <span className="text-base font-bold text-gray-900">Rozgaar<span className="text-blue-600">360</span></span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 lg:hidden" aria-label={t('common:closeMenu')}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto scrollbar-thin">
        {links.map(({ href, labelKey, fallback, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 shadow-sm shadow-blue-500/10'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
              }`} />
              <span className="truncate">{t(labelKey, { defaultValue: fallback })}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-blue-400" />}
            </Link>
          );
        })}

        <div className="px-4 pt-4 pb-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">{t('common:navigation', { defaultValue: 'Navigation' })}</p>
        </div>

        {HOME_LINKS.map(({ href, labelKey, fallback, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname?.startsWith(href.replace(/#.*$/, ''));
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 shadow-sm shadow-blue-500/10'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
              }`} />
              <span className="truncate">{t(labelKey, { defaultValue: fallback })}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-blue-400" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-100 flex-shrink-0">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-gray-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('common:logoutSystem')}</span>
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
  role = 'customer',
  contentClassName = 'p-4 lg:p-8',
  showFooter = true,
  isFixedHeight = false,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { t, i18n } = useTranslation(['common', 'worker']);
  const { language, changeLanguage, isChangingLanguage } = useLanguage();
  const isRTL = isMounted && i18n.language === 'ur';

  const pageTitle = (() => {
    if (!pathname) return t('common:dashboard');
    if (pathname.startsWith('/worker/dashboard') || pathname.startsWith('/customer/dashboard')) return t('common:dashboard');
    if (pathname.startsWith('/worker/bookings') || pathname.startsWith('/customer/bookings')) return t('common:myBookings');
    if (pathname.startsWith('/customer/notifications')) return t('common:notifications');
    if (pathname.startsWith('/recommendations') || pathname.startsWith('/customer/recommendations')) return t('common:findWorkers');
    if (pathname.startsWith('/customer/chat') || pathname.startsWith('/worker/chat')) return t('common:messages');
    return t('common:dashboard');
  })();

  const links = role === 'customer' ? CUSTOMER_LINKS : WORKER_LINKS;

  useEffect(() => {
    const u = authService.getUser();
    setUser(u);
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = (sidebarOpen || showPhotoModal) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen, showPhotoModal]);

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  const handlePhotoUpdate = (newUrl) => {
    setUser(prev => ({ ...prev, profilePicture: newUrl }));
    const u = authService.getUser();
    authService.saveUser({ ...u, profilePicture: newUrl });
  };

  if (!isMounted) {
    return <div className="min-h-screen bg-gray-50" suppressHydrationWarning />;
  }

  return (
    <div className={`${isFixedHeight ? 'h-screen overflow-hidden' : 'min-h-screen'} bg-gray-50 flex`}>

      <aside className={`hidden lg:flex lg:w-64 lg:flex-col fixed inset-y-0 z-30 ${isRTL ? 'right-0' : 'left-0'}`}>
        <div className={`flex flex-col flex-grow bg-white shadow-sm ${isRTL ? 'border-l border-gray-100' : 'border-r border-gray-100'}`}>
          <SidebarContent
            links={links}
            pathname={pathname}
            onLogout={handleLogout}
            onClose={null}
            t={t}
          />
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`fixed inset-y-0 w-72 bg-white z-50 shadow-2xl lg:hidden transition-transform duration-300 ${isRTL ? 'right-0' : 'left-0'} ${sidebarOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'}`}>
        <SidebarContent
          links={links}
          pathname={pathname}
          onLogout={handleLogout}
          onClose={() => setSidebarOpen(false)}
          t={t}
        />
      </aside>

      <div className={`flex-1 flex flex-col ${isFixedHeight ? 'h-screen' : 'min-h-screen'} ${isRTL ? 'lg:mr-64' : 'lg:ml-64'}`}>
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm pl-4 pr-6 sm:pr-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100" aria-label={t('common:openMenu')}>
               <Menu className="w-5 h-5" />
             </button>
             <div>
               <h1 className="text-sm font-black text-gray-900 leading-tight">{pageTitle}</h1>
               <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">{t('common:roleAccount', { role: t(`common:role.${role}`) })}</span>
               </div>
             </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />

            <button
              type="button"
              onClick={() => changeLanguage(language === 'en' ? 'ur' : 'en')}
              disabled={isChangingLanguage}
              className="flex items-center gap-2 px-3 py-2 rounded-2xl border border-gray-100 text-sm font-semibold text-gray-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-100 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              title={t('common:toggleLanguage')}
              aria-label={t('common:toggleLanguage')}
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'en' ? 'اردو' : 'EN'}</span>
            </button>
            
            <button 
              onClick={() => setShowPhotoModal(true)}
              className="flex items-center gap-3 p-1 pr-3 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 group"
            >
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md ring-2 ring-white group-hover:ring-blue-100 transition-all overflow-hidden">
                  {user?.profilePicture ? (
                    <Image
                      src={user.profilePicture}
                      alt={user?.name || 'Avatar'}
                      width={36}
                      height={36}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.name?.charAt(0).toUpperCase() || '?'
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                  <Camera className="w-2.5 h-2.5 text-blue-600" />
                </div>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-black text-gray-900 truncate max-w-[100px]">{user?.name || t('common:user')}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{t('common:editPhoto')}</p>
              </div>
            </button>
          </div>
        </header>

        <main className={`flex-1 min-h-0 ${contentClassName}`}>
          {children}
        </main>

        {showFooter && (
          <footer className="p-6 border-t border-gray-100 text-center">
              <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{t('common:copyrightLine', { year: new Date().getFullYear() })}</p>
          </footer>
        )}
      </div>

      {showPhotoModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setShowPhotoModal(false)} />
          <div className="relative bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-sm animate-scaleIn border border-gray-100">
            <button 
              onClick={() => setShowPhotoModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UserIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">{t('common:profileIdentity')}</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">{t('common:uploadBestPhoto')}</p>
            </div>

            <ProfilePhotoUpload 
              userId={user?._id}
              currentPhoto={user?.profilePicture}
              onPhotoUpdate={handlePhotoUpdate}
            />

            <button 
              onClick={() => setShowPhotoModal(false)}
              className="w-full mt-6 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200"
            >
              {t('common:closeWindow')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
