'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { authService } from '@/lib/auth';
import { useLanguage } from '@/lib/i18nProvider';
import NotificationBell from '../NotificationBell';
import ProfilePhotoUpload from '../ProfilePhotoUpload';
import EditProfile from '../EditProfile';
import UploadCNIC from '../UploadCNIC';
import {
  Home, Search, Calendar, Bell, MessageCircle, Briefcase,
  LogOut, Menu, X, ChevronRight, Settings, Camera, User as UserIcon, Globe,
  Mail, Phone, MapPin, Award, ChevronDown, Edit3, BadgeCheck, CheckCircle2
} from 'lucide-react';
import { Info } from 'lucide-react';

const CUSTOMER_LINKS = [
  { href: '/customer/dashboard',      labelKey: 'common:dashboard',     fallback: 'Dashboard', icon: Home },
  { href: '/customer/recommendations', labelKey: 'common:findWorkers',   fallback: 'Find Workers', icon: Search },
  { href: '/customer/bookings',       labelKey: 'common:myBookings',    fallback: 'My Bookings', icon: Calendar },
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

function ProfileDropdown({ user, onEditProfile, onLogout, onEditPhoto, onVerify, t, role }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ur';

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const workerProfile = user?.profile || user?.workerProfile || user?.worker || {};
  const displayName = user?.name || 'User';
  const email = user?.email || 'N/A';
  const phone = user?.phone || user?.phoneNumber || user?.mobile || 'N/A';
  const city = user?.city || user?.baseCity || 'N/A';
  const skill = workerProfile?.skill || workerProfile?.primarySkill || 'N/A';
  const address = user?.address || workerProfile?.address || workerProfile?.workerAddress || 'N/A';
  const experience = workerProfile?.experience !== undefined && workerProfile?.experience !== null
    ? `${workerProfile.experience} years`
    : 'N/A';
  const joinedDate = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'N/A';

  const verificationStatus = String(
    workerProfile?.verificationStatus || user?.verificationStatus || ''
  ).trim().toLowerCase();

  const isVerified = Boolean(
    workerProfile?.verified ||
    user?.verified ||
    verificationStatus === 'verified' ||
    verificationStatus === 'approved'
  );

  // Only show verification for workers
  const showVerification = role === 'worker';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 sm:gap-3 p-1 pr-2 sm:pr-3 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200 group"
      >
        <div className="relative">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md ring-2 ring-white group-hover:ring-blue-100 transition-all overflow-hidden">
            {user?.profilePicture ? (
              <Image
                src={user.profilePicture}
                alt={displayName}
                width={36}
                height={36}
                className="w-full h-full object-cover"
              />
            ) : (
              displayName.charAt(0).toUpperCase()
            )}
          </div>
          {showVerification && isVerified && (
            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
              <CheckCircle2 className="h-2 w-2 text-white" />
            </div>
          )}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-black text-gray-900 truncate max-w-[100px]">{displayName.split(' ')[0]}</p>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{t('common:viewProfile')}</p>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
      
      {isOpen && (
        <div 
          className="w-[calc(100vw-2rem)] max-w-sm sm:w-96 rounded-lg border border-gray-200 bg-white shadow-xl z-50 overflow-hidden"
          style={{
            position: 'fixed',
            top: '4.5rem',
            ...(isRTL ? { left: '1rem', right: 'auto' } : { right: '1rem', left: 'auto' })
          }}
          dir="ltr"
        >
          {/* Profile Header */}
          <div className="bg-white border-b border-gray-200 p-5">
            <div className="flex items-start gap-4">
              <div className="relative group/avatar">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden border-2 border-gray-200">
                  {user?.profilePicture ? (
                    <Image
                      src={user.profilePicture}
                      alt={displayName}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-white">{displayName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                {showVerification && isVerified && (
                  <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                    <CheckCircle2 className="h-3 w-3 text-white" />
                  </div>
                )}
                {/* Camera overlay */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                    onEditPhoto();
                  }}
                  className="absolute inset-0 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity"
                >
                  <Camera className="h-6 w-6 text-white" />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium text-gray-900 truncate">{displayName}</h3>
                {role === 'worker' && skill !== 'N/A' && (
                  <p className="text-sm text-gray-600 mt-0.5">{skill}</p>
                )}
                {showVerification && (
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                    isVerified 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }">
                    {isVerified ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        {t('common:verified', { defaultValue: 'Verified' })}
                      </>
                    ) : (
                      <>
                        <BadgeCheck className="h-3 w-3" />
                        {t('common:unverified', { defaultValue: 'Unverified' })}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Verification Alert - Only for unverified workers */}
          {showVerification && !isVerified && (
            <div className="bg-amber-50 border-b border-amber-100 p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <BadgeCheck className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-amber-900">
                    {t('common:verificationRequired', { defaultValue: 'Verification required' })}
                  </h4>
                  <p className="text-xs text-amber-700 mt-1">
                    {t('common:verificationDescription', { defaultValue: 'Complete your verification to unlock all features' })}
                  </p>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onVerify();
                    }}
                    className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-amber-600 text-white text-xs font-medium rounded-md hover:bg-amber-700 transition-colors"
                  >
                    <BadgeCheck className="h-3.5 w-3.5" />
                    {t('common:verifyNow', { defaultValue: 'Verify now' })}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Personal Details */}
          <div className="p-4 space-y-3 border-b border-gray-100">
            <h4 className="text-xs font-medium text-gray-500 mb-3">
              {t('common:personalDetails', { defaultValue: 'Personal Details' })}
            </h4>
            
            <div className="flex items-center gap-3 text-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 shrink-0">
                <Mail className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">{t('common:email', { defaultValue: 'Email' })}</p>
                <p className="text-sm text-gray-900 truncate">{email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 shrink-0">
                <Phone className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">{t('common:phone', { defaultValue: 'Phone' })}</p>
                <p className="text-sm text-gray-900">{phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 shrink-0">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">{t('common:city', { defaultValue: 'City' })}</p>
                <p className="text-sm text-gray-900">{city}</p>
              </div>
            </div>

            {role === 'worker' && experience !== 'N/A' && (
              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 shrink-0">
                  <Award className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">{t('common:experience', { defaultValue: 'Experience' })}</p>
                  <p className="text-sm text-gray-900">{experience}</p>
                </div>
              </div>
            )}

            {role === 'customer' && address !== 'N/A' && (
              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">{t('common:address', { defaultValue: 'Address' })}</p>
                  <p className="text-sm text-gray-900">{address}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 text-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 shrink-0">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">{t('common:memberSince', { defaultValue: 'Member Since' })}</p>
                <p className="text-sm text-gray-900">{joinedDate}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-2 space-y-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onEditProfile();
              }}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              <Edit3 className="h-4 w-4" />
              {t('common:editProfile', { defaultValue: 'Edit Profile' })}
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              {t('common:logout', { defaultValue: 'Logout' })}
            </button>
          </div>
        </div>
      )}
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
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { t, i18n } = useTranslation(['common', 'worker']);
  const { language, changeLanguage, isChangingLanguage } = useLanguage();
  const isRTL = isMounted && i18n.language === 'ur';

  const pageTitle = (() => {
    if (!pathname) return t('common:dashboard');
    if (pathname.startsWith('/worker/dashboard') || pathname.startsWith('/customer/dashboard')) return t('common:dashboard');
    if (pathname.startsWith('/worker/bookings') || pathname.startsWith('/customer/bookings')) return t('common:myBookings');
    if (pathname.startsWith('/recommendations') || pathname.startsWith('/customer/recommendations')) return t('common:findWorkers');
    if (pathname.startsWith('/customer/chat') || pathname.startsWith('/worker/chat')) return t('common:messages');
    return t('common:dashboard');
  })();

  const links = role === 'customer' ? CUSTOMER_LINKS : WORKER_LINKS;

  const fetchUserProfile = async () => {
    try {
      setProfileLoading(true);
      const profile = await authService.getProfile();
      setUser(profile);
      // Update localStorage with fresh data
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(profile));
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    const u = authService.getUser();
    setUser(u);
    // Fetch fresh profile data from database
    if (u) {
      fetchUserProfile();
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = (sidebarOpen || showPhotoModal || showEditProfileModal || showVerificationModal) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen, showPhotoModal, showEditProfileModal, showVerificationModal]);

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  const handlePhotoUpdate = (newUrl) => {
    setUser(prev => ({ ...prev, profilePicture: newUrl }));
    // Update localStorage
    if (typeof window !== 'undefined') {
      const currentUser = authService.getUser();
      const updatedUser = { ...currentUser, profilePicture: newUrl };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    // Refresh profile from database
    fetchUserProfile();
  };

  const handleProfileUpdate = (updatedProfile) => {
    setUser(updatedProfile);
    // Update localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(updatedProfile));
    }
    setShowEditProfileModal(false);
    // Refresh profile from database
    fetchUserProfile();
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

          <div className="flex items-center gap-2 sm:gap-3">
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
            
            <ProfileDropdown 
              user={user}
              onEditProfile={() => setShowEditProfileModal(true)}
              onEditPhoto={() => setShowPhotoModal(true)}
              onVerify={() => setShowVerificationModal(true)}
              onLogout={handleLogout}
              t={t}
              role={role}
            />
          </div>
        </header>

        <main className={`flex-1 min-h-0 ${contentClassName === 'p-4 lg:p-8' ? '' : contentClassName}`}>
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
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setShowPhotoModal(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md animate-scaleIn">
            <button 
              onClick={() => setShowPhotoModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="p-6">
              <ProfilePhotoUpload 
                userId={user?._id}
                currentPhoto={user?.profilePicture}
                onPhotoUpdate={handlePhotoUpdate}
              />
            </div>
          </div>
        </div>
      )}

      {showEditProfileModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setShowEditProfileModal(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md my-8">
            <button 
              onClick={() => setShowEditProfileModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-6">
              <EditProfile 
                profile={user}
                onProfileUpdate={handleProfileUpdate}
                onCancel={() => setShowEditProfileModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {showVerificationModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setShowVerificationModal(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md animate-scaleIn">
            <button 
              onClick={() => setShowVerificationModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-xl font-normal text-gray-900">Verify your account</h3>
                <p className="text-sm text-gray-600 mt-1">Upload your CNIC to complete verification</p>
              </div>
              
              <UploadCNIC 
                userId={user?._id} 
                onUploadSuccess={() => {
                  setShowVerificationModal(false);
                  fetchUserProfile();
                }} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
