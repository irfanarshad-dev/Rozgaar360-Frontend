'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import api from '@/lib/axios';
import { SKILLS, CITIES } from '@/lib/constants';
import { authService } from '@/lib/auth';
import { useLanguage } from '@/lib/i18nProvider';
import {
  Search, Wrench, Zap, Hammer, Scissors, Paintbrush, SprayCan, Fan, Leaf,
  CalendarDays, Handshake, Star, ArrowRight, CheckCircle2, Shield,
  MapPin, ChevronRight, Play, TrendingUp, Award, Clock, Phone, Mail,
  Facebook, Twitter, Linkedin, Instagram, ChevronDown, Sparkles,
  Loader2, AlertCircle, User as UserIcon, RefreshCw, Briefcase
} from 'lucide-react';

const WorkerMap = dynamic(() => import('./components/WorkerMap'), { ssr: false });
import AIRecommendationBox from './components/AIRecommendationBox';
import AIJobRecommendationBox from './components/AIJobRecommendationBox';
import JobCard from './components/JobCard';
import { jobsService } from '@/lib/jobs';

// ΓöÇΓöÇΓöÇ Skill ΓåÆ icon + color map ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const SKILL_META = {
  Plumber:      { icon: Wrench,     color: 'from-blue-500 to-blue-600',     bg: 'bg-blue-50'     },
  Electrician:  { icon: Zap,        color: 'from-yellow-500 to-orange-500', bg: 'bg-yellow-50'   },
  Carpenter:    { icon: Hammer,     color: 'from-amber-600 to-amber-700',   bg: 'bg-amber-50'    },
  Tailor:       { icon: Scissors,   color: 'from-pink-500 to-rose-500',     bg: 'bg-pink-50'     },
  Painter:      { icon: Paintbrush, color: 'from-purple-500 to-violet-600', bg: 'bg-purple-50'   },
  Cleaner:      { icon: SprayCan,   color: 'from-teal-500 to-cyan-500',     bg: 'bg-teal-50'     },
  Mechanic:     { icon: Wrench,     color: 'from-gray-600 to-gray-700',     bg: 'bg-gray-100'    },
  Cook:         { icon: Fan,        color: 'from-orange-500 to-red-500',    bg: 'bg-orange-50'   },
  Driver:       { icon: Leaf,       color: 'from-indigo-500 to-blue-600',   bg: 'bg-indigo-50'   },
  'AC Repair':  { icon: Fan,        color: 'from-sky-500 to-blue-500',      bg: 'bg-sky-50'      },
};

const SKILL_TRANSLATION_KEYS = {
  Plumber: 'plumber',
  Electrician: 'electrician',
  Carpenter: 'carpenter',
  Tailor: 'tailor',
  Painter: 'painter',
  Cleaner: 'cleaner',
  Mechanic: 'mechanic',
  Cook: 'cook',
  Driver: 'driver',
  'AC Repair': 'acRepair',
};

const DEFAULT_META = { icon: Wrench, color: 'from-slate-500 to-slate-600', bg: 'bg-slate-50' };

const SERVICE_ICON_AVATARS = {
  Electrician: '/assests/Services-icons/Electrician.png',
  Plumber: '/assests/Services-icons/Plumber.png',
  Carpenter: '/assests/Services-icons/Carpanter.png',
  Cook: '/assests/Services-icons/Chef.png',
  Cleaner: '/assests/Services-icons/Cleaner.png',
  Driver: '/assests/Services-icons/Driver.png',
  Mechanic: '/assests/Services-icons/Mechanic.png',
  Painter: '/assests/Services-icons/Painter.png',
};

const HOW_IT_WORKS = [
  { num: '01', icon: Search,       titleKey: 'home:howItWorks.step1.title', descKey: 'home:howItWorks.step1.description', color: 'text-blue-500',    ring: 'ring-blue-100',    bg: 'bg-blue-50'    },
  { num: '02', icon: CalendarDays, titleKey: 'home:howItWorks.step2.title', descKey: 'home:howItWorks.step2.description', color: 'text-violet-500', ring: 'ring-violet-100',  bg: 'bg-violet-50'  },
  { num: '03', icon: Handshake,    titleKey: 'home:howItWorks.step3.title', descKey: 'home:howItWorks.step3.description', color: 'text-emerald-500', ring: 'ring-emerald-100', bg: 'bg-emerald-50' },
];

// ΓöÇΓöÇΓöÇ Sub-components ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

function Stars({ rating = 0 }) {
  const full = Math.floor(rating);
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i < full ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />
      ))}
    </div>
  );
}

// Animated scroll counter
function Counter({ end, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let cur = 0;
        const duration = 1600;
        const step = 16;
        const inc = end / (duration / step);
        const timer = setInterval(() => {
          cur += inc;
          if (cur >= end) { setCount(end); clearInterval(timer); }
          else setCount(Math.floor(cur));
        }, step);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// Worker card using real backend data
function WorkerCard({ worker, t, getSkillLabel, onViewProfile, mounted }) {
  const cardRouter = useRouter();
  const translatedSkill = getSkillLabel(worker.skill);
  const avatarSrc = worker.profilePicture && worker.profilePicture !== '/user.png'
    ? worker.profilePicture
    : null;
  const initials = (worker.name || 'W')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-gray-300 transition-all duration-300">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative flex-shrink-0">
            <div className="relative h-14 w-14 rounded-xl overflow-hidden ring-2 ring-gray-100 group-hover:ring-blue-200 transition-all">
              {avatarSrc ? (
                <Image
                  src={avatarSrc}
                  alt={worker.name}
                  width={56}
                  height={56}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-blue-50 text-blue-700 flex items-center justify-center text-lg font-bold">
                  {initials || 'W'}
                </div>
              )}
            </div>
            {worker.verified && (
              <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-blue-600 rounded-full flex items-center justify-center ring-2 ring-white">
                <CheckCircle2 className="h-3 w-3 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 truncate mb-1">
              {worker.name}
            </h3>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-100">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              <span className="text-xs font-medium text-blue-700">
                {translatedSkill}
              </span>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span>{worker.city}</span>
        </div>

        {/* Rating */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-1">
            <Stars rating={worker.rating} />
          </div>
          <span className="text-sm text-gray-500" suppressHydrationWarning>
            {worker.reviewCount || 0} {t('home:featured.reviews')}
          </span>
        </div>

        {/* Experience */}
        {worker.experience != null && (
          <div className="mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 text-xs font-medium text-gray-700" suppressHydrationWarning>
              {worker.experience === 1
                ? t('home:featured.experienceOne', { count: worker.experience })
                : t('home:featured.experienceOther', { count: worker.experience })}
            </span>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={() => {
            if (onViewProfile) {
              onViewProfile(worker.id);
              return;
            }
            cardRouter.push(`/profile/${worker.id}`);
          }}
          className="w-full px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all active:scale-95 shadow-sm"
          suppressHydrationWarning
        >
          {t('home:featured.viewProfile')}
        </button>
      </div>
    </div>
  );
}

// ΓöÇΓöÇΓöÇ Main Page ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
export default function Home() {
  const { t } = useTranslation(['home', 'common']);
  const { language, changeLanguage } = useLanguage();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Search state
  const [query,     setQuery]     = useState('');
  const [city,      setCity]      = useState('');
  const [skill,     setSkill]     = useState('');
  const [cityOpen,  setCityOpen]  = useState(false);
  const [showMap,   setShowMap]   = useState(false);
  const [sharedLocation, setSharedLocation] = useState(null);

  const [workers, setWorkers] = useState([]);
  const [workersLoading, setWorkersLoading] = useState(true);
  const [workersError,   setWorkersError]   = useState(false);

  // Jobs for workers
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [workerStats, setWorkerStats] = useState(null);
  const [jobsError, setJobsError] = useState(null);

  // Skill-filtered search workers
  const [searchWorkers,  setSearchWorkers]  = useState([]);
  const [searchLoading,  setSearchLoading]  = useState(false);
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);

  // Auth banner
  const [user, setUser] = useState(null);
  useEffect(() => { setUser(authService.getUser()); }, []);
  const isWorker = user?.role === 'worker';
  const isCustomer = user?.role === 'customer';
  const hasRegisteredRole = isWorker || isCustomer;
  const isRTL = language === 'ur';

  const ensureRegistered = useCallback(() => {
    if (hasRegisteredRole) return true;
    setShowRegisterPrompt(true);
    return false;
  }, [hasRegisteredRole]);

  const handleViewProfile = useCallback((workerId) => {
    if (!ensureRegistered()) return;
    router.push(`/profile/${workerId}`);
  }, [ensureRegistered, router]);

  const getSkillLabel = useCallback((skillName) => {
    const key = SKILL_TRANSLATION_KEYS[skillName];
    if (!key) return skillName;
    return t(`home:skills.${key}`, { defaultValue: skillName });
  }, [t]);

  const requestSharedLocation = useCallback(async () => {
    if (sharedLocation) return sharedLocation;

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return null;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const location = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setSharedLocation(location);
          resolve(location);
        },
        () => resolve(null),
      );
    });
  }, [sharedLocation]);

  // ΓöÇΓöÇ Fetch top-rated workers on mount ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  const loadFeatured = useCallback(async () => {
    setWorkersLoading(true);
    setWorkersError(false);
    try {
      const params = { limit: 4 };
      if (sharedLocation?.lat && sharedLocation?.lng) {
        params.lat = sharedLocation.lat;
        params.lng = sharedLocation.lng;
        params.radiusKm = 20;
      }
      const res = await api.get('/api/recommendations', { params });
      setWorkers(res.data || []);
    } catch (err) {
      setWorkersError(true);
    } finally {
      setWorkersLoading(false);
    }
  }, [sharedLocation]);

  useEffect(() => { loadFeatured(); }, [loadFeatured]);

  // Load jobs for workers from bookings API
  const loadJobs = useCallback(async () => {
    if (!isWorker) return;
    setJobsLoading(true);
    setJobsError(null);

    try {
      const jobsData = await jobsService.getWorkerJobs();
      setJobs(jobsData);
    } catch (err) {
      console.error('Failed to load jobs:', err);
      setJobsError('Failed to load jobs');
    } finally {
      setJobsLoading(false);
    }
  }, [isWorker]);

  // Load worker stats from bookings
  const loadWorkerStats = useCallback(async () => {
    if (!isWorker) return;

    try {
      const statsData = await jobsService.getWorkerStats();
      setWorkerStats(statsData);
    } catch (err) {
      console.error('Failed to load worker stats:', err);
    }
  }, [isWorker]);

  useEffect(() => { 
    loadJobs();
    loadWorkerStats();
  }, [loadJobs, loadWorkerStats]);

  // ΓöÇΓöÇ Handle search ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!ensureRegistered()) return;
    const searchSkill = skill || query;
    if (!searchSkill && !city) {
      router.push('/recommendations');
      return;
    }
    router.push(`/recommendations?skill=${encodeURIComponent(searchSkill)}&city=${encodeURIComponent(city)}`);
  };

  const handleSkillFilter = async (s) => {
    if (!ensureRegistered()) return;
    setSkill(s);
    setSearchLoading(true);
    try {
      const params = { skill: s, limit: 4 };
      if (sharedLocation?.lat && sharedLocation?.lng) {
        params.lat = sharedLocation.lat;
        params.lng = sharedLocation.lng;
        params.radiusKm = 20;
      }
      const res = await api.get('/api/recommendations', { params });
      setSearchWorkers(res.data || []);
    } catch {
      setSearchWorkers([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const displayWorkers = skill ? searchWorkers : workers;
  const displayLoading = skill ? searchLoading : workersLoading;

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ΓöÇΓöÇΓöÇΓöÇ LOGGED-IN BANNER ΓöÇΓöÇΓöÇΓöÇ */}
      {user && hasRegisteredRole && (
        <div className={`text-white text-center py-2.5 px-4 text-sm font-medium ${
          isWorker ? 'bg-emerald-600' : 'bg-blue-600'
        }`}>
          {isWorker
            ? t('home:banner.workerWelcomeBack', { name: user.name })
            : t('home:banner.welcomeBack', { name: user.name })
          }<br />
          <Link href={user.role === 'worker' ? '/worker/dashboard' : '/customer/dashboard'}
            className="font-bold hover:opacity-90">
            {t('home:banner.goToDashboard')}
          </Link>
        </div>
      )}

      {user && !hasRegisteredRole && (
        <div className="bg-amber-500 text-white text-center py-2.5 px-4 text-sm font-medium">
          Complete registration as Worker or Customer to use home actions.
        </div>
      )}

      {/* ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ HERO ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
      <section className="hero-gradient relative min-h-[82vh] md:min-h-[88vh] flex items-center overflow-hidden">
        {/* Blobs */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full opacity-20 animate-blob"
             style={{ background: 'radial-gradient(circle, #3b82f6, #6366f1)' }} />
        <div className="absolute bottom-[-15%] left-[-8%] w-[500px] h-[500px] rounded-full opacity-15 animate-blob delay-400"
             style={{ background: 'radial-gradient(circle, #06b6d4, #2563eb)' }} />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.04]"
             style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 md:py-20">
          <div className="max-w-3xl mx-auto lg:mx-0 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 rounded-full px-4 py-1.5 text-sm font-medium mb-6 animate-fadeInUp" suppressHydrationWarning>
              <Sparkles className="w-4 h-4 text-cyan-400" />
              {mounted ? t('home:hero.badge') : "Pakistan's #1 Skilled Workers Platform"}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-[52px] font-black text-white leading-tight md:leading-[1.05] tracking-tight mb-5 sm:mb-6 animate-fadeInUp delay-100 max-w-[16ch] sm:max-w-[18ch] mx-auto sm:mx-0" suppressHydrationWarning>
              {mounted ? (
                isWorker ? (
                  <>
                    {t('home:worker.hero.line1')}<br />
                    <span className="gradient-text">{t('home:worker.hero.line2')}</span><br />
                    {t('home:worker.hero.line3')}
                  </>
                ) : (
                  <>
                    {t('home:hero.line1')}<br />
                    <span className="gradient-text">{t('home:hero.line2')}</span><br />
                    {t('home:hero.line3')}
                  </>
                )
              ) : (
                <>
                  Find Skilled<br />
                  <span className="gradient-text">Workers</span><br />
                  Near You
                </>
              )}
            </h1>

            <p className="text-white/80 text-[15px] sm:text-lg leading-relaxed max-w-lg mx-auto sm:mx-0 mb-8 sm:mb-10 animate-fadeInUp delay-200" suppressHydrationWarning>
              {mounted ? (
                isWorker 
                  ? t('home:worker.hero.description')
                  : t('home:hero.description')
              ) : (
                'Connect with verified skilled workers in your area for all your home service needs'
              )}
            </p>

            {/* Search bar - Hidden for workers */}
            {!isWorker && (
            <form onSubmit={handleSearch} className="animate-fadeInUp delay-300">
              <div className="w-full max-w-4xl mx-0 px-4 sm:px-0">
                <div className="bg-white rounded-2xl p-1.5 flex items-center gap-1 shadow-lg shadow-blue-900/30 border border-white/20 w-full md:flex-nowrap md:overflow-visible overflow-x-auto">
                  {/* Skill input */}
                  <div className="flex flex-1 items-center gap-2 px-3 py-2.5 min-w-0">
                    <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <input
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      type="text"
                      placeholder={mounted ? (isWorker ? 'Search for jobs...' : t('home:hero.searchPlaceholder')) : 'e.g. Plumber, Electrician...'}
                      className="w-full border-0 outline-none bg-transparent text-gray-800 text-sm placeholder-gray-400"
                    />
                  </div>

                  <div className="w-px h-5 bg-gray-200 flex-shrink-0" />

                  {/* City picker - Map Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      if (!ensureRegistered()) return;
                      setShowMap(true);
                      requestSharedLocation();
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-blue-600 transition-colors flex-shrink-0"
                  >
                    <MapPin className="w-[14px] h-[14px] text-blue-500" />
                    <span className="hidden sm:inline" suppressHydrationWarning>{mounted ? t('home:hero.viewMap') : 'View Map'}</span>
                  </button>

                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 sm:px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-200 flex-shrink-0"
                  >
                    <span suppressHydrationWarning>{mounted ? t('home:hero.findButton') : 'Find Workers'}</span>
                    <ArrowRight className="w-[14px] h-[14px]" />
                  </button>
                </div>

              {/* Quick skill tags from SKILLS constants */}
                <div className="mt-3 hidden md:flex flex-nowrap gap-2 justify-start overflow-x-auto pb-1">
                  {SKILLS.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => { setQuery(s); handleSkillFilter(s); }}
                      className={`bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded-full border border-white/20 cursor-pointer transition backdrop-blur-sm ${
                        skill === s
                          ? 'bg-white text-blue-600 border-white font-medium'
                          : ''
                      }`}
                    >
                      {getSkillLabel(s)}
                    </button>
                  ))}
                </div>

                <div className="mt-3 flex md:hidden flex-wrap justify-center gap-2 overflow-hidden">
                  {SKILLS.slice(0, 4).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => { setQuery(s); handleSkillFilter(s); }}
                      className={`border text-sm px-3.5 py-2 rounded-full transition-all ${
                        skill === s
                          ? 'bg-white text-blue-700 border-blue-200 font-semibold shadow-sm'
                          : 'bg-white/10 hover:bg-white/20 border-gray-100 text-white/85 hover:border-blue-100'
                      }`}
                    >
                      {getSkillLabel(s)}
                    </button>
                  ))}
                  {SKILLS.length > 4 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!ensureRegistered()) return;
                        router.push('/recommendations');
                      }}
                      className="bg-white/10 hover:bg-white/20 border border-gray-100 text-white/85 text-sm px-3.5 py-2 rounded-full transition-all"
                    >
                      {`+ ${SKILLS.length - 4} more`}
                    </button>
                  )}
                </div>
              </div>
            </form>
            )}

            {/* Worker Quick Actions */}
            {isWorker && (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-fadeInUp delay-300 w-full sm:w-auto">
                <Link href="/worker/dashboard" className="btn-primary text-white font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-[15px] flex items-center justify-center gap-2 w-full sm:w-auto">
                  <Briefcase className="w-5 h-5" /> {t('home:worker.hero.dashboardButton')}
                </Link>
                <Link href="/worker/bookings" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-[15px] flex items-center justify-center gap-2 transition-all w-full sm:w-auto">
                  <CalendarDays className="w-5 h-5" /> {t('home:worker.hero.bookingsButton')}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 72" preserveAspectRatio="none" className="w-full h-14" fill="white">
            <path d="M0,36 C360,72 1080,0 1440,36 L1440,72 L0,72 Z" />
          </svg>
        </div>
      </section>

      {/* ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ AI ASSISTANT (Customer Only) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
      {!isWorker && (
      <section className="py-16 sm:py-20 bg-slate-50/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-10 sm:mb-12">
            <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3" suppressHydrationWarning>
              <Sparkles className="w-3 h-3" /> {mounted ? t('home:ai.badge') : 'New AI Feature'}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight" suppressHydrationWarning>
              {mounted ? t('home:ai.titlePrefix') : 'Get'} <span className="text-blue-600">{mounted ? t('home:ai.titleHighlight') : 'AI-Powered'}</span> {mounted ? '' : 'Recommendations'}
            </h2>
            <p className="text-gray-500 mt-4 text-[15px] sm:text-[17px] max-w-2xl mx-auto leading-relaxed" suppressHydrationWarning>
              {mounted ? t('home:ai.description') : 'Let our AI assistant help you find the perfect worker for your needs'}
            </p>
          </div>
          
          {hasRegisteredRole ? (
            <AIRecommendationBox
              sharedLocation={sharedLocation}
              requestSharedLocation={requestSharedLocation}
            />
          ) : (
            <div className="max-w-3xl mx-auto bg-white border border-blue-100 rounded-2xl p-6 text-center shadow-sm">
              <p className="text-gray-700 font-semibold mb-2" suppressHydrationWarning>{mounted ? t('home:ai.accessCard.title') : 'Register to Access AI Recommendations'}</p>
              <p className="text-sm text-gray-500 mb-4" suppressHydrationWarning>{mounted ? t('home:ai.accessCard.description') : 'Create an account to get personalized worker recommendations'}</p>
              <Link href="/register" className="btn-primary text-white font-semibold px-6 py-2.5 rounded-xl inline-flex items-center gap-2" suppressHydrationWarning>
                {mounted ? t('home:ai.accessCard.cta') : 'Register Now'}
              </Link>
            </div>
          )}
        </div>
      </section>
      )}

      {/* ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ AI JOB FINDER (Worker Only) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
      {isWorker && (
      <section className="py-16 sm:py-20 bg-slate-50/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-8 sm:mb-12">
            <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3" suppressHydrationWarning>
              <Sparkles className="w-3 h-3" /> {mounted ? t('home:worker.ai.badge') : 'AI Job Finder'}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight" suppressHydrationWarning>
              {mounted ? t('home:worker.ai.titlePrefix') : 'Find'} <span className="text-emerald-600">{mounted ? t('home:worker.ai.titleHighlight') : 'Perfect Jobs'}</span> {mounted ? t('home:worker.ai.titleSuffix') : 'For You'}
            </h2>
            <p className="text-gray-500 mt-4 text-[15px] sm:text-[17px] max-w-2xl mx-auto leading-relaxed" suppressHydrationWarning>
              {mounted ? t('home:worker.ai.description') : 'AI-powered job matching based on your skills and location'}
            </p>
          </div>
          
          <AIJobRecommendationBox 
            workerSkills={user?.profile?.skill ? [user.profile.skill] : []}
            workerLocation={user?.city || user?.profile?.city || ''}
          />
        </div>
      </section>
      )}

      {/* ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ MAP MODAL ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
      {showMap && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-7xl h-[90vh] sm:h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-3 sm:p-4 border-b">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">{t('home:map.title')}</h2>
              <button onClick={() => setShowMap(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <WorkerMap
                workers={displayWorkers}
                userLocation={sharedLocation}
                onRequestLocation={requestSharedLocation}
                onWorkerClick={(id) => {
                  setShowMap(false);
                  handleViewProfile(id);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ SERVICES (Customer) / STATS (Worker) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
      <section id="services" className="py-16 sm:py-20 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {isWorker ? (
            <>
              <div className="text-center mb-10 sm:mb-12">
                <span className="text-emerald-600 font-semibold text-sm tracking-widest uppercase mb-2 block">{t('home:worker.performance.badge')}</span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
                  {t('home:worker.performance.titlePrefix')} <span className="gradient-text">{t('home:worker.performance.titleHighlight')}</span>
                </h2>
                <p className="text-gray-500 text-[15px] sm:text-[16px] max-w-xl mx-auto leading-relaxed">
                  {t('home:worker.performance.description')}
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
                {[
                  { icon: Briefcase, label: 'Total Jobs', value: workerStats?.totalJobs || '0', bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
                  { icon: Clock, label: 'Pending', value: workerStats?.pendingJobs || '0', bgColor: 'bg-amber-100', textColor: 'text-amber-600' },
                  { icon: CheckCircle2, label: 'Completed', value: workerStats?.completedJobs || '0', bgColor: 'bg-emerald-100', textColor: 'text-emerald-600' },
                  { icon: Star, label: 'Rating', value: workerStats?.rating?.toFixed(1) || '0.0', bgColor: 'bg-purple-100', textColor: 'text-purple-600' },
                ].map(({ icon: Icon, label, value, bgColor, textColor }) => (
                  <div key={label} className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl ${bgColor} flex items-center justify-center mb-4`}>
                      <Icon className={`w-6 h-6 ${textColor}`} />
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-gray-900 mb-1">{value}</p>
                    <p className="text-sm text-gray-500 font-medium">{t(`home:worker.performance.stats.${label === 'Total Jobs' ? 'totalJobs' : label === 'Pending' ? 'pending' : label === 'Completed' ? 'completed' : 'rating'}`)}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
          <div className="text-center mb-10 sm:mb-12">
            <span className="text-blue-600 font-semibold text-sm tracking-widest uppercase mb-2 block" suppressHydrationWarning>{mounted ? t('home:services.badge') : 'Browse by Skill'}</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4" suppressHydrationWarning>
              {mounted ? t('home:services.titlePrefix') : 'Popular'} <span className="gradient-text">{mounted ? t('home:services.titleHighlight') : 'Services'}</span>
            </h2>
            <p className="text-gray-500 text-[15px] sm:text-[16px] max-w-xl mx-auto leading-relaxed" suppressHydrationWarning>
              {mounted ? t('home:services.description') : 'Browse our most requested services and find skilled workers'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {SKILLS.map((s) => {
              const meta = SKILL_META[s] || DEFAULT_META;
              const Icon = meta.icon;
              const active = skill === s;
              const avatarSrc = SERVICE_ICON_AVATARS[s];
              return (
                <button
                  key={s}
                  onClick={() => {
                    if (active) { setSkill(''); setSearchWorkers([]); }
                    else handleSkillFilter(s);
                  }}
                  className={`group relative rounded-2xl p-4 sm:p-5 cursor-pointer border-2 text-left overflow-hidden transition-all duration-300 ${
                    active
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg shadow-blue-500/20'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-indigo-50/0 group-hover:from-blue-50/50 group-hover:to-indigo-50/30 transition-all duration-300 pointer-events-none" />
                  
                  <div className="relative">
                    {/* Icon/Avatar */}
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl mb-3 sm:mb-4 shadow-sm overflow-hidden transition-all duration-300 group-hover:scale-105 ${
                      avatarSrc ? 'bg-white ring-2 ring-gray-100 group-hover:ring-blue-200' : `bg-gradient-to-br ${meta.color} flex items-center justify-center`
                    }`}>
                      {avatarSrc ? (
                        <Image
                          src={avatarSrc}
                          alt={getSkillLabel(s)}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" strokeWidth={2} />
                      )}
                    </div>
                    
                    {/* Title */}
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1 truncate">
                      {getSkillLabel(s)}
                    </h3>
                    
                    {/* Status/Action */}
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-medium transition-colors ${
                        active ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600'
                      }`}>
                        {active ? (mounted ? t('home:services.showingWorkers') : 'Showing') : (mounted ? t('home:services.browseWorkers') : 'Browse')}
                      </p>
                      <ChevronRight className={`w-4 h-4 transition-all duration-300 ${
                        active ? 'text-blue-500 rotate-90' : 'text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1'
                      }`} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
            </>
          )}
        </div>
      </section>

      {/* ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ TOP WORKERS (Customer) / AVAILABLE JOBS (Worker) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
      {!isWorker ? (
      <section className="pb-20 sm:pb-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight" suppressHydrationWarning>
                {mounted ? (skill ? t('home:featured.filteredTitle', { skill: getSkillLabel(skill) }) : t('home:featured.title')) : 'Top rated professionals'}
              </h2>
              <p className="text-sm sm:text-[15px] text-gray-400 mt-1 leading-relaxed" suppressHydrationWarning>
                {mounted ? (
                  skill
                    ? t('home:featured.filteredSubtitle', { skill: getSkillLabel(skill), city: city || t('home:featured.allCities') })
                    : t('home:featured.subtitle')
                ) : (
                  'Verified workers with excellent ratings'
                )}
              </p>
            </div>
            {skill && (
              <button onClick={() => { setSkill(''); setSearchWorkers([]); }}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 border border-gray-200 hover:border-blue-300 px-3 py-1.5 rounded-full transition-all"
                suppressHydrationWarning
              >
                <RefreshCw className="w-3.5 h-3.5" /> {mounted ? t('home:featured.clearFilter') : 'Clear filter'}
              </button>
            )}
          </div>

          {displayLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2 className="w-10 h-10 animate-spin mb-3 text-blue-500" />
              <p className="text-sm" suppressHydrationWarning>{mounted ? t('home:messages.loadingWorkers') : 'Loading workers...'}</p>
            </div>
          )}

          {workersError && !displayLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-4">
              <AlertCircle className="w-10 h-10 text-red-400" />
              <p className="text-sm text-red-500" suppressHydrationWarning>{mounted ? t('home:messages.workersLoadError') : 'Failed to load workers'}</p>
              <button onClick={loadFeatured} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm border border-blue-200 px-4 py-2 rounded-full" suppressHydrationWarning>
                <RefreshCw className="w-4 h-4" /> {mounted ? t('home:messages.retry') : 'Retry'}
              </button>
            </div>
          )}

          {!displayLoading && !workersError && displayWorkers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
              <UserIcon className="w-14 h-14 text-gray-200" />
              <p className="text-lg font-semibold text-gray-500" suppressHydrationWarning>
                {mounted ? (skill ? t('home:messages.noSkillWorkersTitle', { skill: getSkillLabel(skill) }) : t('home:messages.noWorkersTitle')) : 'No workers found'}
              </p>
              <p className="text-sm text-center max-w-xs" suppressHydrationWarning>
                {mounted ? (skill ? t('home:messages.noSkillWorkersDescription', { skill: getSkillLabel(skill) }) : t('home:messages.noWorkersDescription')) : 'Try adjusting your search criteria'}
              </p>
              <Link href="/register" className="btn-primary text-white font-semibold px-6 py-2.5 rounded-full text-sm mt-2" suppressHydrationWarning>
                {mounted ? t('home:cta.registerWorker') : 'Register as Worker'}
              </Link>
            </div>
          )}

          {!displayLoading && displayWorkers.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
                {displayWorkers.map(w => (
                  <WorkerCard
                    key={w.id}
                    worker={w}
                    t={t}
                    getSkillLabel={getSkillLabel}
                    onViewProfile={handleViewProfile}
                    mounted={mounted}
                  />
                ))}
              </div>

              {/* Shadcn-Style Modern Button */}
              <div className="mt-12 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    if (!ensureRegistered()) return;
                    router.push('/recommendations');
                  }}
                  className="group relative inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-b from-blue-600 to-blue-700 text-white font-semibold text-sm shadow-[0_1px_0_0_rgba(255,255,255,0.2)_inset,0_1px_2px_0_rgba(0,0,0,0.05)] hover:shadow-[0_1px_0_0_rgba(255,255,255,0.2)_inset,0_4px_8px_0_rgba(0,0,0,0.1)] active:shadow-[0_0_0_0_rgba(255,255,255,0.2)_inset,0_1px_2px_0_rgba(0,0,0,0.05)_inset] transition-all duration-150 active:translate-y-[1px] border border-blue-700/50"
                >
                  <span className="relative" suppressHydrationWarning>
                    {mounted ? t('home:featured.seeAllWorkers') : 'Browse All Workers'}
                  </span>
                  <ArrowRight className="relative w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-150" />
                </button>
              </div>
            </>
          )}
        </div>
      </section>
      ) : (
      <>
        {!jobsLoading && !jobsError && jobs.length > 0 && (
        <section className="pb-20 sm:pb-24 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                  {t('home:worker.bookings.titlePrefix')} <span className="gradient-text">{t('home:worker.bookings.titleHighlight')}</span>
                </h2>
                <p className="text-gray-500 mt-1 text-[14px] sm:text-[15px] leading-relaxed">
                  {t('home:worker.bookings.subtitle')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
              {jobs.map(job => (
                <JobCard 
                  key={job._id} 
                  job={job} 
                  workerId={user?._id}
                  onJobAccepted={(job) => {
                    console.log('Job accepted:', job);
                    loadJobs();
                    loadWorkerStats();
                  }}
                />
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/worker/bookings"
                className="inline-flex items-center gap-2 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white font-semibold px-8 py-3 rounded-full transition-all duration-300">
                {t('home:worker.bookings.viewAll')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
        )}
      </>
      )}

      {showRegisterPrompt && (
        <div className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 animate-scale-in">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Sign Up Required</h3>
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                Please create an account as a <span className="font-semibold text-blue-600">Worker</span> or <span className="font-semibold text-blue-600">Customer</span> to access this feature and enjoy all platform benefits.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Link 
                  href="/register" 
                  className="flex-1 btn-primary text-white font-bold px-6 py-3 rounded-xl inline-flex items-center justify-center gap-2 transition-all active:scale-95" 
                  onClick={() => setShowRegisterPrompt(false)}
                >
                  <UserIcon className="w-4 h-4" />
                  Register Now
                </Link>
                <button
                  type="button"
                  onClick={() => setShowRegisterPrompt(false)}
                  className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 active:bg-gray-100 transition-all active:scale-95"
                >
                  Maybe Later
                </button>
              </div>
              <Link 
                href="/login" 
                className="mt-4 text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors"
                onClick={() => setShowRegisterPrompt(false)}
              >
                Already have an account? <span className="font-bold">Login</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ HOW IT WORKS (Customer) / TIPS (Worker) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
      <section id="how-it-works" className="py-24 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-60" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          {isWorker ? (
            <>
              <div className="text-center mb-12 sm:mb-16">
                <span className="text-emerald-600 font-semibold text-sm tracking-widest uppercase mb-2 block">SUCCESS TIPS</span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
                  Maximize Your <span className="gradient-text">Earnings</span>
                </h2>
                <p className="text-gray-500 text-[15px] sm:text-[16px] max-w-xl mx-auto leading-relaxed">Follow these tips to get more bookings</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8 sm:gap-10 relative">
                <div className="hidden md:block absolute top-[40px] left-[calc(16.66%+28px)] right-[calc(16.66%+28px)] h-0.5 bg-gradient-to-r from-emerald-200 via-blue-200 to-purple-200" />
                {[
                  { icon: Shield, title: 'Complete Verification', desc: 'Upload CNIC to gain customer trust', color: 'text-emerald-500', bg: 'bg-emerald-50' },
                  { icon: Clock, title: 'Stay Available', desc: 'Update your schedule regularly', color: 'text-blue-500', bg: 'bg-blue-50' },
                  { icon: Star, title: 'Deliver Quality', desc: 'Great service leads to 5-star reviews', color: 'text-purple-500', bg: 'bg-purple-50' },
                ].map(({ icon: Icon, title, desc, color, bg }, i) => (
                  <div key={i} className="flex flex-col items-center text-center relative z-10">
                    <div className={`w-20 h-20 ${bg} ring-8 ring-white rounded-full flex items-center justify-center mb-6`}>
                      <Icon className={`w-9 h-9 ${color}`} strokeWidth={1.75} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
                    <p className="text-gray-500 text-[15px] leading-relaxed max-w-[230px]">{desc}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
          <div className="text-center mb-12 sm:mb-16">
            <span className="text-blue-600 font-semibold text-sm tracking-widest uppercase mb-2 block" suppressHydrationWarning>{mounted ? t('home:howItWorks.badge') : 'The Process'}</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4" suppressHydrationWarning>
              {mounted ? t('home:howItWorks.titlePrefix') : 'How It'} <span className="gradient-text">{mounted ? t('home:howItWorks.titleHighlight') : 'Works'}</span>
            </h2>
            <p className="text-gray-500 text-[15px] sm:text-[16px] max-w-xl mx-auto leading-relaxed" suppressHydrationWarning>{mounted ? t('home:howItWorks.subtitle') : 'Get started in three simple steps'}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 sm:gap-10 relative">
            {/* Desktop Connector Line */}
            <div className="hidden md:block absolute top-[40px] left-[calc(16.66%+28px)] right-[calc(16.66%+28px)] h-0.5 bg-gradient-to-r from-blue-200 via-violet-200 to-emerald-200" />
            {/* Mobile Connector Line */}
            <div className="md:hidden absolute top-10 bottom-10 left-[40px] w-0.5 bg-gradient-to-b from-blue-200 via-violet-200 to-emerald-200" />
            
            {HOW_IT_WORKS.map(({ num, icon: Icon, titleKey, descKey, color, ring, bg }) => (
              <div key={num} className="flex flex-row md:flex-col items-start md:items-center text-left md:text-center animate-fadeInUp gap-4 sm:gap-5 md:gap-0 relative z-10 pl-4 md:pl-0">
                <div className={`relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 ${bg} ${ring} ring-4 md:ring-8 rounded-full flex items-center justify-center md:mb-6`}>
                  <Icon className={`w-7 h-7 md:w-9 md:h-9 ${color}`} strokeWidth={1.75} />
                  <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-white border border-gray-100 text-gray-400 text-[10px] md:text-xs font-black w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center shadow-sm">
                    {num}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3" suppressHydrationWarning>{mounted ? t(titleKey) : (num === '01' ? 'Search & Browse' : num === '02' ? 'Book Service' : 'Get Work Done')}</h3>
                  <p className="text-gray-500 text-[14px] md:text-[15px] leading-relaxed max-w-[280px] md:max-w-[230px]" suppressHydrationWarning>{mounted ? t(descKey) : (num === '01' ? 'Find skilled workers in your area' : num === '02' ? 'Schedule and confirm booking' : 'Quality service delivered')}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <button
              type="button"
              onClick={() => {
                if (!ensureRegistered()) return;
                router.push('/recommendations');
              }}
              className="inline-flex items-center gap-3 text-gray-600 hover:text-blue-600 font-medium transition-colors cursor-pointer"
              suppressHydrationWarning
            >
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-300 animate-pulse-ring">
                <Play className="w-4 h-4 text-white ml-0.5 fill-white" />
              </div>
              {mounted ? t('home:howItWorks.browseNow') : 'Browse Workers Now'}
            </button>
          </div>
            </>
          )}
        </div>
      </section>

      {/* ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ WHY CHOOSE US (Customer Only) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
      {!isWorker && (
      <section id="about" className="py-20 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-10 lg:gap-16 items-start lg:items-center">
          <div className="animate-fadeInLeft">
            <span className="text-blue-600 font-semibold text-sm tracking-widest uppercase mb-2 block" suppressHydrationWarning>{mounted ? t('home:about.badge') : 'Why Rozgaar360'}</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-5 sm:mb-6" suppressHydrationWarning>
              {mounted ? t('home:about.titlePrefix') : 'Why Choose'} <span className="gradient-text">{mounted ? t('home:about.titleHighlight') : 'Us'}</span>
            </h2>
            <p className="text-gray-500 text-[15px] sm:text-[16px] leading-relaxed mb-6 sm:mb-8" suppressHydrationWarning>
              {mounted ? t('home:about.description') : 'We connect you with verified skilled workers across Pakistan'}
            </p>
            <div className="space-y-3 sm:space-y-4">
              {[
                { icon: Shield,       title: mounted ? t('home:about.features.cnic.title') : 'CNIC Verified Workers',       desc: mounted ? t('home:about.features.cnic.description') : 'All workers verified with CNIC' },
                { icon: Star,         title: mounted ? t('home:about.features.reviews.title') : 'Ratings & Reviews',    desc: mounted ? t('home:about.features.reviews.description') : 'Real customer reviews and ratings' },
                { icon: Clock,        title: mounted ? t('home:about.features.connect.title') : '24/7 Support',    desc: mounted ? t('home:about.features.connect.description') : 'Connect anytime, anywhere' },
                { icon: CheckCircle2, title: mounted ? t('home:about.features.profile.title') : 'Detailed Profiles',    desc: mounted ? t('home:about.features.profile.description') : 'View complete worker profiles' },
              ].map(({ icon: Icon, title, desc }, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-xl hover:bg-blue-50/60 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-[15px]">{title}</h4>
                    <p className="text-gray-500 text-[14px] mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel ΓÇö Ad video (same size as stats panel) */}
          <div className="animate-fadeInRight">
            <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-[28px] sm:rounded-[32px] p-5 sm:p-8 shadow-[0_32px_80px_rgba(0,0,0,0.25)] overflow-hidden relative">
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-500 opacity-20 rounded-full blur-3xl" />
              <span className="inline-flex items-center gap-1.5 bg-blue-100/10 text-blue-100 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" suppressHydrationWarning>
                <Play className="w-3 h-3" /> {mounted ? t('home:ad.badge') : 'Watch Video'}
              </span>
              <h2 className="text-white text-base sm:text-lg font-black mt-3 leading-tight" suppressHydrationWarning>{mounted ? t('home:ad.title') : 'See How It Works'}</h2>
              <p className="text-white/60 text-xs sm:text-sm mt-1 leading-relaxed" suppressHydrationWarning>{mounted ? t('home:ad.subtitle') : 'Watch our platform demo'}</p>

              <div className="mt-5 relative rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                <video
                  src="/Rozgaar360-ad.mp4"
                  className="w-full h-full aspect-video object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  preload="metadata"
                />
              </div>

              <Link
                href="/recommendations"
                className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-blue-200 hover:text-blue-100"
                suppressHydrationWarning
              >
                {mounted ? t('home:ad.cta') : 'Explore Now'} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ CTA (Role-based) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
      <section className="py-20 sm:py-24 md:py-28 relative overflow-hidden">
        <div className="hero-gradient absolute inset-0" />
        <div className="absolute inset-0 opacity-[0.05]"
             style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 rounded-full px-4 py-1.5 text-sm mb-6" suppressHydrationWarning>
            <Sparkles className="w-4 h-4 text-yellow-300" />
            {mounted ? (isWorker ? 'GROW YOUR BUSINESS' : t('home:cta.badge')) : "Join Pakistan's fastest growing labor platform"}
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white tracking-tight mb-5 sm:mb-6" suppressHydrationWarning>
            {mounted ? (
              isWorker ? (
                <>Start Getting <span className="gradient-text">More Bookings</span></>
              ) : (
                <>{t('home:cta.titleLine1')}<br /><span className="gradient-text">{t('home:cta.titleLine2')}</span></>
              )
            ) : (
              <>Ready to Get Started?<br /><span className="gradient-text">Find Workers Today</span></>
            )}
          </h2>
          <p className="text-white/70 text-[15px] sm:text-lg mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed" suppressHydrationWarning>
            {mounted ? (
              isWorker 
                ? 'Complete your profile, stay available, and deliver quality service to grow your reputation.'
                : t('home:cta.description')
            ) : (
              'Connect with verified skilled workers for all your service needs'
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            {isWorker ? (
              <>
                <Link href="/recommendations" className="btn-primary text-white font-bold px-8 sm:px-10 py-3.5 sm:py-4 rounded-full text-[16px] inline-flex items-center gap-2 justify-center" suppressHydrationWarning>
                  {mounted ? t('home:cta.findWorkerNow') : 'Find Workers Now'} <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/worker/bookings" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-8 sm:px-10 py-3.5 sm:py-4 rounded-full text-[16px] transition-all">
                  <CalendarDays className="w-5 h-5" /> View Bookings
                </Link>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    if (!ensureRegistered()) return;
                    router.push('/recommendations');
                  }}
                  className="btn-primary text-white font-bold px-8 sm:px-10 py-3.5 sm:py-4 rounded-full text-[16px] inline-flex items-center gap-2 justify-center"
                  suppressHydrationWarning
                >
                  {mounted ? t('home:cta.findWorkerNow') : 'Find Workers Now'} <ArrowRight className="w-5 h-5" />
                </button>
                <Link href="/register" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-8 sm:px-10 py-3.5 sm:py-4 rounded-full text-[16px] transition-all text-center" suppressHydrationWarning>
                  {mounted ? t('home:cta.registerWorker') : 'Register as Worker'}
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ FOOTER ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
      <footer className="bg-[#0b1120] text-white pt-10 lg:pt-16 pb-6 lg:pb-8">
        <div className="lg:hidden max-w-7xl mx-auto px-4 space-y-4 mb-8">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#111a2f] to-[#0e1527] p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <Image
                src="/assests/Logo/Rozgaar360-logo.png"
                alt="Rozgaar360"
                width={120}
                height={35}
                className="h-8 w-auto object-contain"
              />
              <span className="text-lg font-black tracking-tight">Rozgaar360</span>
            </div>
            <p className="text-gray-300 text-[13px] leading-relaxed mb-3" suppressHydrationWarning>
              {mounted ? t('home:footer.brandDescription') : "Pakistan's trusted platform for finding skilled local workers quickly and safely."}
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <button key={i} className="h-10 rounded-xl bg-white/8 hover:bg-blue-600 border border-white/10 flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          <details className="group rounded-2xl border border-white/10 bg-white/5 p-3">
            <summary className="list-none flex items-center justify-between cursor-pointer">
              <span className="font-bold text-[14px] text-white/90" suppressHydrationWarning>{mounted ? t('home:footer.ourSkills') : 'Our Services'}</span>
              <ChevronDown className="w-4 h-4 text-blue-400 transition-transform group-open:rotate-180" />
            </summary>
            <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-300 text-[13px]">
              {SKILLS.map(s => (
                <li key={s}>
                  <button
                    onClick={() => {
                      if (!ensureRegistered()) return;
                      router.push(`/recommendations?skill=${encodeURIComponent(s)}`);
                    }}
                    className="block rounded-lg px-2.5 py-2 bg-white/5 hover:bg-white/10 transition-colors truncate text-left w-full"
                  >
                    {getSkillLabel(s)}
                  </button>
                </li>
              ))}
            </ul>
          </details>

          <details className="group rounded-2xl border border-white/10 bg-white/5 p-3">
            <summary className="list-none flex items-center justify-between cursor-pointer">
              <span className="font-bold text-[14px] text-white/90" suppressHydrationWarning>{mounted ? t('home:footer.company') : 'Company'}</span>
              <ChevronDown className="w-4 h-4 text-blue-400 transition-transform group-open:rotate-180" />
            </summary>
            <ul className="mt-3 space-y-2 text-gray-300 text-[13px]">
              {[
                { label: mounted ? t('home:footer.links.aboutUs') : 'About Us', href: '#about', requireAuth: false },
                { label: mounted ? t('home:footer.links.registerWorker') : 'Register as Worker', href: '/register', requireAuth: false },
                { label: mounted ? t('home:footer.links.findWorkers') : 'Find Workers', href: '/recommendations', requireAuth: true },
                { label: mounted ? t('home:footer.links.login') : 'Login', href: '/login', requireAuth: false },
              ].map(({ label, href, requireAuth }, index) => (
                <li key={index}>
                  {requireAuth ? (
                    <button
                      onClick={() => {
                        if (!ensureRegistered()) return;
                        router.push(href);
                      }}
                      className="block rounded-lg px-2.5 py-2 bg-white/5 hover:bg-white/10 transition-colors text-left w-full"
                    >
                      {label}
                    </button>
                  ) : (
                    <Link href={href} className="block rounded-lg px-2.5 py-2 bg-white/5 hover:bg-white/10 transition-colors">
                      {label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </details>

          <details className="group rounded-2xl border border-white/10 bg-white/5 p-3">
            <summary className="list-none flex items-center justify-between cursor-pointer">
              <span className="font-bold text-[14px] text-white/90" suppressHydrationWarning>{mounted ? t('home:footer.contact') : 'Contact'}</span>
              <ChevronDown className="w-4 h-4 text-blue-400 transition-transform group-open:rotate-180" />
            </summary>
            <ul className="mt-3 space-y-3 text-gray-300 text-[13px]">
              <li className="flex items-center gap-2.5" suppressHydrationWarning><Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />{mounted ? t('home:footer.email') : 'support@rozgaar360.com'}</li>
              <li className="flex items-center gap-2.5" suppressHydrationWarning><Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />{mounted ? t('home:footer.phone') : '+92 300 1234567'}</li>
              <li className="flex items-start gap-2.5" suppressHydrationWarning><MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>{mounted ? `${t('home:footer.coveragePrefix')} ${CITIES.slice(0, 3).join(', ')} ${t('home:footer.coverageSuffix')}` : 'Available in Karachi, Lahore, Islamabad and more'}</span>
              </li>
            </ul>
          </details>
        </div>

        <div className="hidden lg:grid max-w-7xl mx-auto px-4 grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <Image
                src="/assests/Logo/Rozgaar360-logo.png"
                alt="Rozgaar360"
                width={138}
                height={40}
                className="h-10 w-auto object-contain"
              />
              <span className="text-xl font-black tracking-tight">Rozgaar360</span>
            </div>
            <p className="text-gray-400 text-[14px] leading-relaxed mb-6" suppressHydrationWarning>
              {mounted ? t('home:footer.brandDescription') : "Pakistan's trusted platform for finding skilled local workers quickly and safely."}
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <button key={i} className="w-9 h-9 rounded-xl bg-white/8 hover:bg-blue-600 border border-white/10 flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Skills from constants */}
          <div>
            <h4 className="font-bold text-[15px] mb-5 text-white/90" suppressHydrationWarning>{mounted ? t('home:footer.ourSkills') : 'Our Services'}</h4>
            <ul className="space-y-3 text-gray-400 text-[14px]">
              {SKILLS.map(s => (
                <li key={s}>
                  <button
                    onClick={() => {
                      if (!ensureRegistered()) return;
                      router.push(`/recommendations?skill=${encodeURIComponent(s)}`);
                    }}
                    className="hover:text-white transition-colors flex items-center gap-2 text-left w-full"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-blue-500" />{getSkillLabel(s)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-[15px] mb-5 text-white/90" suppressHydrationWarning>{mounted ? t('home:footer.company') : 'Company'}</h4>
            <ul className="space-y-3 text-gray-400 text-[14px]">
              {[
                { label: mounted ? t('home:footer.links.aboutUs') : 'About Us', href: '#about', requireAuth: false },
                { label: mounted ? t('home:footer.links.registerWorker') : 'Register as Worker', href: '/register', requireAuth: false },
                { label: mounted ? t('home:footer.links.findWorkers') : 'Find Workers', href: '/recommendations', requireAuth: true },
                { label: mounted ? t('home:footer.links.login') : 'Login', href: '/login', requireAuth: false },
              ].map(({ label, href, requireAuth }, index) => (
                <li key={index}>
                  {requireAuth ? (
                    <button
                      onClick={() => {
                        if (!ensureRegistered()) return;
                        router.push(href);
                      }}
                      className="hover:text-white transition-colors flex items-center gap-2 text-left w-full"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-blue-500" />{label}
                    </button>
                  ) : (
                    <Link href={href} className="hover:text-white transition-colors flex items-center gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-blue-500" />{label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-[15px] mb-5 text-white/90" suppressHydrationWarning>{mounted ? t('home:footer.contact') : 'Contact'}</h4>
            <ul className="space-y-4 text-gray-400 text-[14px]">
              <li className="flex items-center gap-3" suppressHydrationWarning><Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />{mounted ? t('home:footer.email') : 'support@rozgaar360.com'}</li>
              <li className="flex items-center gap-3" suppressHydrationWarning><Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />{mounted ? t('home:footer.phone') : '+92 300 1234567'}</li>
              <li className="flex items-start gap-3" suppressHydrationWarning><MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>{mounted ? `${t('home:footer.coveragePrefix')} ${CITIES.slice(0, 3).join(', ')} ${t('home:footer.coverageSuffix')}` : 'Available in Karachi, Lahore, Islamabad and more'}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 border-t border-white/8 pt-5 lg:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 lg:gap-4 text-gray-500 text-[12px] lg:text-[13px] text-center sm:text-left">
          <p suppressHydrationWarning>{mounted ? t('home:footer.copyright', { year: new Date().getFullYear() }) : `© ${new Date().getFullYear()} Rozgaar360. All rights reserved.`}</p>
          <p className="flex items-center gap-1" suppressHydrationWarning>{mounted ? t('home:footer.madeWith') : 'Made with'} <span className="text-red-400">♥</span> {mounted ? t('home:footer.inPakistan') : 'in Pakistan'}</p>
        </div>
      </footer>
    </div>
  );
}
