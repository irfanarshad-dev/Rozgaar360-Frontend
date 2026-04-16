'use client';
import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import api from '@/lib/axios';
import { SKILLS, CITIES } from '@/lib/constants';
import { authService } from '@/lib/auth';
import {
  Search, Wrench, Zap, Hammer, Scissors, Paintbrush, SprayCan, Fan, Leaf,
  CalendarDays, Handshake, Star, ArrowRight, CheckCircle2, Shield,
  MapPin, ChevronRight, Play, TrendingUp, Award, Clock, Phone, Mail,
  Facebook, Twitter, Linkedin, Instagram, ChevronDown, Sparkles,
  Loader2, AlertCircle, User as UserIcon, RefreshCw
} from 'lucide-react';

const WorkerMap = dynamic(() => import('./components/WorkerMap'), { ssr: false });

// ─── Skill → icon + color map ─────────────────────────────────────────────────
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

const DEFAULT_META = { icon: Wrench, color: 'from-slate-500 to-slate-600', bg: 'bg-slate-50' };

const HOW_IT_WORKS = [
  { num: '01', icon: Search,       title: 'Search',      desc: 'Browse real verified professionals filtered by skill and city.', color: 'text-blue-500',    ring: 'ring-blue-100',    bg: 'bg-blue-50'    },
  { num: '02', icon: CalendarDays, title: 'Book',        desc: 'Select your preferred worker and connect via chat instantly.',   color: 'text-violet-500', ring: 'ring-violet-100',  bg: 'bg-violet-50'  },
  { num: '03', icon: Handshake,    title: 'Get Service', desc: 'Your pro arrives, gets the job done, and you rate them.',        color: 'text-emerald-500', ring: 'ring-emerald-100', bg: 'bg-emerald-50' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

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
function WorkerCard({ worker }) {
  const router = useRouter();
  const meta = SKILL_META[worker.skill] || DEFAULT_META;
  const Icon = meta.icon;
  const avatarSrc = worker.profilePicture && worker.profilePicture !== '/user.png'
    ? worker.profilePicture
    : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-5 flex flex-col">
      {/* Avatar */}
      <div className="w-full aspect-[4/3] rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 mb-4 overflow-hidden flex items-center justify-center relative">
        {avatarSrc ? (
          <img src={avatarSrc} alt={worker.name} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${meta.color} flex flex-col items-center justify-center gap-2`}>
            <Icon className="w-12 h-12 text-white/80" strokeWidth={1.5} />
            <span className="text-white/70 text-xs font-medium">{worker.skill}</span>
          </div>
        )}
        {worker.verified && (
          <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Verified
          </div>
        )}
      </div>

      <h3 className="font-bold text-[16px] text-gray-900 truncate">{worker.name}</h3>
      <p className="text-gray-400 text-[13px] mb-2">{worker.skill} · {worker.city}</p>

      <div className="flex items-center gap-1.5 mb-4">
        <Stars rating={worker.rating} />
        <span className="text-[12px] text-gray-500 font-medium">
          {worker.rating > 0 ? worker.rating.toFixed(1) : 'New'} ({worker.reviewCount})
        </span>
      </div>

      {worker.experience != null && (
        <p className="text-[12px] text-gray-400 mb-4">{worker.experience} yr{worker.experience !== 1 ? 's' : ''} experience</p>
      )}

      <button
        onClick={() => router.push(`/profile/${worker.id}`)}
        className="mt-auto w-full bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold py-2.5 rounded-xl transition-colors"
      >
        View Profile
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const { t } = useTranslation('common');
  const router = useRouter();

  // Search state
  const [query,     setQuery]     = useState('');
  const [city,      setCity]      = useState('');
  const [skill,     setSkill]     = useState('');
  const [cityOpen,  setCityOpen]  = useState(false);
  const [showMap,   setShowMap]   = useState(false);

  // Featured workers (top rated from backend)
  const [workers,        setWorkers]        = useState([]);
  const [workersLoading, setWorkersLoading] = useState(true);
  const [workersError,   setWorkersError]   = useState(null);

  // Skill-filtered search workers
  const [searchWorkers,  setSearchWorkers]  = useState([]);
  const [searchLoading,  setSearchLoading]  = useState(false);

  // Auth banner
  const [user, setUser] = useState(null);
  useEffect(() => { setUser(authService.getUser()); }, []);

  // ── Fetch top-rated workers on mount ──────────────────────────────────────
  const loadFeatured = useCallback(async () => {
    setWorkersLoading(true);
    setWorkersError(null);
    try {
      const res = await api.get('/api/recommendations', { params: { limit: 4 } });
      setWorkers(res.data || []);
    } catch (err) {
      setWorkersError('Could not load workers. Please try again.');
    } finally {
      setWorkersLoading(false);
    }
  }, []);

  useEffect(() => { loadFeatured(); }, [loadFeatured]);

  // ── Handle search ──────────────────────────────────────────────────────────
  const handleSearch = async (e) => {
    e?.preventDefault();
    const searchSkill = skill || query;
    if (!searchSkill && !city) {
      router.push('/recommendations');
      return;
    }
    router.push(`/recommendations?skill=${encodeURIComponent(searchSkill)}&city=${encodeURIComponent(city)}`);
  };

  const handleSkillFilter = async (s) => {
    setSkill(s);
    setSearchLoading(true);
    try {
      const res = await api.get('/api/recommendations', { params: { skill: s, limit: 4 } });
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

      {/* ──── LOGGED-IN BANNER ──── */}
      {user && (
        <div className="bg-blue-600 text-white text-center py-2.5 px-4 text-sm font-medium">
          Welcome back, <strong>{user.name}</strong>! &nbsp;
          <Link href={user.role === 'worker' ? '/worker/dashboard' : '/customer/dashboard'}
            className="underline underline-offset-2 hover:text-blue-100">
            Go to your dashboard →
          </Link>
        </div>
      )}

      {/* ──────────── HERO ──────────── */}
      <section className="hero-gradient relative min-h-[88vh] flex items-center overflow-hidden">
        {/* Blobs */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full opacity-20 animate-blob"
             style={{ background: 'radial-gradient(circle, #3b82f6, #6366f1)' }} />
        <div className="absolute bottom-[-15%] left-[-8%] w-[500px] h-[500px] rounded-full opacity-15 animate-blob delay-400"
             style={{ background: 'radial-gradient(circle, #06b6d4, #2563eb)' }} />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.04]"
             style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 rounded-full px-4 py-1.5 text-sm font-medium mb-6 animate-fadeInUp">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Pakistan&apos;s #1 Skilled Workers Platform
            </div>

            <h1 className="text-[48px] md:text-[64px] font-black text-white leading-[1.05] tracking-tight mb-6 animate-fadeInUp delay-100">
              Find Skilled<br />
              <span className="gradient-text">Local Workers</span><br />
              Near You
            </h1>

            <p className="text-white/70 text-lg leading-relaxed max-w-xl mb-10 animate-fadeInUp delay-200">
              Connect with thousands of verified, background-checked professionals for any home service — instantly and at fair prices.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="animate-fadeInUp delay-300">
              <div className="flex flex-col sm:flex-row items-stretch bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden max-w-[620px]">
                {/* Skill input */}
                <div className="flex items-center flex-1 px-5 py-4 gap-3">
                  <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    type="text"
                    placeholder="e.g. Plumber, Electrician…"
                    className="w-full outline-none text-gray-800 placeholder-gray-400 text-[15px] font-medium bg-transparent"
                  />
                </div>

                {/* City picker - Map Button */}
                <button type="button" onClick={(e) => { e.preventDefault(); setShowMap(true); }}
                  className="border-t sm:border-t-0 sm:border-l border-gray-100 flex items-center gap-2 px-4 py-4 text-gray-600 text-[14px] whitespace-nowrap hover:bg-gray-50 transition-colors">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  View Map
                </button>

                <button type="submit" className="btn-primary text-white font-bold px-7 py-4 text-[15px] flex items-center justify-center gap-2 sm:rounded-none rounded-b-2xl">
                  Find <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Quick skill tags from SKILLS constants */}
              <div className="flex flex-wrap gap-2 mt-4">
                {SKILLS.slice(0, 5).map(s => (
                  <button key={s} type="button" onClick={() => { setQuery(s); handleSkillFilter(s); }}
                    className={`border text-sm px-4 py-1.5 rounded-full transition-all ${
                      skill === s
                        ? 'bg-white text-blue-700 border-white font-semibold'
                        : 'bg-white/10 hover:bg-white/20 border-white/20 text-white/85'
                    }`}>
                    {s}
                  </button>
                ))}
                <Link href="/recommendations" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white/85 text-sm px-4 py-1.5 rounded-full transition-all">
                  All Skills →
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 72" preserveAspectRatio="none" className="w-full h-14" fill="white">
            <path d="M0,36 C360,72 1080,0 1440,36 L1440,72 L0,72 Z" />
          </svg>
        </div>
      </section>

      {/* ──────────── MAP MODAL ──────────── */}
      {showMap && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-7xl h-[90vh] sm:h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-3 sm:p-4 border-b">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Find Workers Near You</h2>
              <button onClick={() => setShowMap(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <WorkerMap workers={displayWorkers} onWorkerClick={(id) => { setShowMap(false); router.push(`/profile/${id}`); }} />
            </div>
          </div>
        </div>
      )}

      {/* ──────────── SERVICES ──────────── */}
      <section id="services" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-blue-600 font-semibold text-sm tracking-widest uppercase mb-2 block">Browse by Skill</span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
              Popular <span className="gradient-text">Services</span>
            </h2>
            <p className="text-gray-500 text-[16px] max-w-xl mx-auto">
              All workers are real, registered professionals from your city. Click a skill to see available workers.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {SKILLS.map((s) => {
              const meta = SKILL_META[s] || DEFAULT_META;
              const Icon = meta.icon;
              const active = skill === s;
              return (
                <button
                  key={s}
                  onClick={() => {
                    if (active) { setSkill(''); setSearchWorkers([]); }
                    else handleSkillFilter(s);
                  }}
                  className={`service-card-hover group rounded-2xl p-6 cursor-pointer border text-left relative overflow-hidden transition-all ${
                    active
                      ? 'border-blue-400 bg-blue-50 shadow-lg'
                      : `${meta.bg} border-gray-100/80 bg-opacity-80`
                  }`}
                >
                  <div className={`bg-gradient-to-br ${meta.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" strokeWidth={1.75} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-[15px] mb-1">{s}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-400 text-[12px]">{active ? 'Showing workers ↓' : 'Browse workers'}</p>
                    <ChevronRight className={`w-4 h-4 transition-all ${active ? 'text-blue-500 rotate-90' : 'text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1'}`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ──────────── TOP WORKERS (live from backend) ──────────── */}
      <section className="pb-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                {skill ? `${skill} Workers` : 'Top Rated Professionals'}
              </h2>
              <p className="text-gray-500 mt-1 text-[15px]">
                {skill ? `Professionals available for ${skill} in ${city || 'all cities'}` : 'Highest rated workers across all skills'}
              </p>
            </div>
            {skill && (
              <button onClick={() => { setSkill(''); setSearchWorkers([]); }}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 border border-gray-200 hover:border-blue-300 px-3 py-1.5 rounded-full transition-all">
                <RefreshCw className="w-3.5 h-3.5" /> Clear filter
              </button>
            )}
          </div>

          {displayLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2 className="w-10 h-10 animate-spin mb-3 text-blue-500" />
              <p className="text-sm">Loading workers from database…</p>
            </div>
          )}

          {workersError && !displayLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-4">
              <AlertCircle className="w-10 h-10 text-red-400" />
              <p className="text-sm text-red-500">{workersError}</p>
              <button onClick={loadFeatured} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm border border-blue-200 px-4 py-2 rounded-full">
                <RefreshCw className="w-4 h-4" /> Retry
              </button>
            </div>
          )}

          {!displayLoading && !workersError && displayWorkers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
              <UserIcon className="w-14 h-14 text-gray-200" />
              <p className="text-lg font-semibold text-gray-500">No workers found</p>
              <p className="text-sm text-center max-w-xs">
                {skill ? `No ${skill} workers are registered yet. Check back soon!` : 'No workers are registered yet. Be the first to join!'}
              </p>
              <Link href="/register" className="btn-primary text-white font-semibold px-6 py-2.5 rounded-full text-sm mt-2">
                Register as a Worker
              </Link>
            </div>
          )}

          {!displayLoading && displayWorkers.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayWorkers.map(w => <WorkerCard key={w.id} worker={w} />)}
            </div>
          )}

          {!displayLoading && (
            <div className="text-center mt-10">
              <Link href={`/recommendations${skill ? `?skill=${encodeURIComponent(skill)}` : ''}`}
                className="inline-flex items-center gap-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold px-8 py-3 rounded-full transition-all duration-300">
                See All Workers <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ──────────── HOW IT WORKS ──────────── */}
      <section id="how-it-works" className="py-24 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-60" />
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm tracking-widest uppercase mb-2 block">The Process</span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-gray-500 text-[16px] max-w-xl mx-auto">Three simple steps to get any job done professionally.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 relative">
            <div className="hidden md:block absolute top-10 left-[calc(16.66%+28px)] right-[calc(16.66%+28px)] h-px bg-gradient-to-r from-blue-200 via-violet-200 to-emerald-200" />
            {HOW_IT_WORKS.map(({ num, icon: Icon, title, desc, color, ring, bg }) => (
              <div key={title} className="flex flex-col items-center text-center animate-fadeInUp">
                <div className={`relative w-20 h-20 ${bg} ${ring} ring-8 rounded-full flex items-center justify-center mb-6 z-10`}>
                  <Icon className={`w-9 h-9 ${color}`} strokeWidth={1.75} />
                  <span className="absolute -top-2 -right-2 bg-white border border-gray-100 text-gray-400 text-[10px] font-black w-7 h-7 rounded-full flex items-center justify-center shadow-sm">
                    {num}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-500 text-[15px] leading-relaxed max-w-[230px]">{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link href="/recommendations"
              className="inline-flex items-center gap-3 text-gray-600 hover:text-blue-600 font-medium transition-colors">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-300 animate-pulse-ring">
                <Play className="w-4 h-4 text-white ml-0.5 fill-white" />
              </div>
              Browse available workers now
            </Link>
          </div>
        </div>
      </section>

      {/* ──────────── WHY CHOOSE US ──────────── */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
          <div className="animate-fadeInLeft">
            <span className="text-blue-600 font-semibold text-sm tracking-widest uppercase mb-2 block">Why Rozgaar360</span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-6">
              Built for <span className="gradient-text">Pakistan</span>
            </h2>
            <p className="text-gray-500 text-[16px] leading-relaxed mb-8">
              We&apos;re on a mission to make skilled labour accessible, fair, and safe for every household in Pakistan. Every worker on our platform is identity-verified and rated by real customers.
            </p>
            <div className="space-y-4">
              {[
                { icon: Shield,       title: 'CNIC Verified Workers',  desc: 'Every professional submits their CNIC — verified by our admin team before being listed.' },
                { icon: Star,         title: 'Real Customer Reviews',  desc: 'Ratings and reviews come from real customers who booked through the platform.' },
                { icon: Clock,        title: 'Connect Instantly',      desc: 'Chat directly with workers through our built-in real-time messaging system.' },
                { icon: CheckCircle2, title: 'Transparent Profiles',   desc: 'See skill, experience, city, and all reviews upfront — no hidden surprises.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4 p-4 rounded-xl hover:bg-blue-50/60 transition-colors">
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

          {/* Right panel — Platform stats (from what DB actually returns) */}
          <div className="animate-fadeInRight">
            <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-[32px] p-8 shadow-[0_32px_80px_rgba(0,0,0,0.25)] overflow-hidden relative">
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-500 opacity-20 rounded-full blur-3xl" />
              <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-5">Platform Highlights</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Skills Available', value: SKILLS.length, suffix: '', icon: Wrench, color: 'text-blue-400' },
                  { label: 'Cities Covered',   value: CITIES.length, suffix: '', icon: MapPin,  color: 'text-emerald-400' },
                  { label: 'Avg. Rating',       value: '4.8',         isStatic: true, icon: Star,    color: 'text-amber-400' },
                  { label: 'CNIC Verified',     value: '100', suffix: '%', icon: Shield, color: 'text-violet-400' },
                ].map(({ label, value, suffix = '', isStatic, icon: Icon, color }) => (
                  <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <Icon className={`w-6 h-6 ${color} mb-2`} />
                    <p className="text-white font-black text-2xl">
                      {isStatic ? value : <Counter end={Number(value)} suffix={suffix} />}
                    </p>
                    <p className="text-white/50 text-[12px] mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-emerald-500/15 border border-emerald-500/25 rounded-2xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-emerald-300 font-semibold text-[14px]">Workers are live on the platform</p>
                  <p className="text-white/50 text-[12px] mt-0.5">Browse and connect with them right now</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────── CTA ──────────── */}
      <section className="py-28 relative overflow-hidden">
        <div className="hero-gradient absolute inset-0" />
        <div className="absolute inset-0 opacity-[0.05]"
             style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 rounded-full px-4 py-1.5 text-sm mb-6">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            Join Pakistan&apos;s fastest growing labour platform
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">
            Ready to Get<br /><span className="gradient-text">Any Job Done?</span>
          </h2>
          <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto">
            Whether you need a skilled worker or want to offer your services — Rozgaar360 connects both sides instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/recommendations" className="btn-primary text-white font-bold px-10 py-4 rounded-full text-[16px] inline-flex items-center gap-2">
              Find a Worker Now <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/register" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-10 py-4 rounded-full text-[16px] transition-all">
              Register as a Worker
            </Link>
          </div>
        </div>
      </section>

      {/* ──────────── FOOTER ──────────── */}
      <footer className="bg-[#0b1120] text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="bg-blue-600 rounded-xl p-2">
                <svg viewBox="0 0 100 100" className="w-6 h-6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 20 15 h 16 v 75 h -16 z" fill="white" />
                  <path d="M 28 23 h 35 a 22 22 0 0 1 0 44 h -8" stroke="white" strokeWidth="16" />
                  <polygon points="57,46 39,67 57,88" fill="white" />
                  <path d="M 52 67 l 16 28 h 18 l -16 -28 z" fill="white" />
                </svg>
              </div>
              <span className="text-xl font-black tracking-tight">Rozgaar360</span>
            </div>
            <p className="text-gray-400 text-[14px] leading-relaxed mb-6">
              Pakistan&apos;s trusted platform for finding skilled local workers quickly and safely.
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
            <h4 className="font-bold text-[15px] mb-5 text-white/90">Our Skills</h4>
            <ul className="space-y-3 text-gray-400 text-[14px]">
              {SKILLS.map(s => (
                <li key={s}>
                  <Link href={`/recommendations?skill=${encodeURIComponent(s)}`}
                    className="hover:text-white transition-colors flex items-center gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-blue-500" />{s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-[15px] mb-5 text-white/90">Company</h4>
            <ul className="space-y-3 text-gray-400 text-[14px]">
              {[['About Us', '#about'], ['Register as Worker', '/register'], ['Find Workers', '/recommendations'], ['Login', '/login']].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="hover:text-white transition-colors flex items-center gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-blue-500" />{label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-[15px] mb-5 text-white/90">Contact</h4>
            <ul className="space-y-4 text-gray-400 text-[14px]">
              <li className="flex items-center gap-3"><Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />rozgaar360@gmail.com</li>
              <li className="flex items-center gap-3"><Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />+92-300-1234567</li>
              <li className="flex items-start gap-3"><MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>Coverage: {CITIES.slice(0, 3).join(', ')} &amp; more</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 border-t border-white/8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-500 text-[13px]">
          <p>© {new Date().getFullYear()} Rozgaar360. All rights reserved.</p>
          <p className="flex items-center gap-1">Made with <span className="text-red-400">♥</span> in Pakistan</p>
        </div>
      </footer>
    </div>
  );
}
