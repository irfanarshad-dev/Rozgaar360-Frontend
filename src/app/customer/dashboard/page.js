'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/auth';
import DashboardLayout from '@/app/components/ui/DashboardLayout';
import Card, { CardBody } from '@/app/components/ui/Card';
import { SkeletonStatCard } from '@/app/components/ui/SkeletonCard';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Calendar, MessageCircle, Search, LayoutDashboard } from 'lucide-react';

export default function CustomerDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { t } = useTranslation(['customer', 'common']);

  const featureCards = [
    {
      key: 'discover',
      label: t('customer:dashboard.stats.discover'),
      title: t('customer:dashboard.stats.findBestPros'),
      icon: Search,
      tone: 'bg-blue-50 text-blue-600',
    },
    {
      key: 'bookings',
      label: t('customer:dashboard.stats.bookings'),
      title: t('customer:dashboard.stats.trackJobs'),
      icon: Calendar,
      tone: 'bg-emerald-50 text-emerald-600',
    },
    {
      key: 'conversations',
      label: t('customer:dashboard.stats.conversations'),
      title: t('customer:dashboard.stats.chatWithWorkers'),
      icon: MessageCircle,
      tone: 'bg-violet-50 text-violet-600',
    },
  ];

  const quickActions = [
    {
      key: 'browse-workers',
      label: t('customer:dashboard.browseWorkers'),
      hint: t('customer:dashboard.browseWorkersHint'),
      icon: Search,
      tone: 'bg-blue-50 text-blue-600',
      href: '/customer/recommendations',
    },
    {
      key: 'my-bookings',
      label: t('customer:dashboard.myBookingsAction'),
      hint: t('customer:dashboard.myBookingsHint'),
      icon: Calendar,
      tone: 'bg-emerald-50 text-emerald-600',
      href: '/customer/bookings',
    },
    {
      key: 'messages',
      label: t('customer:dashboard.messagesAction'),
      hint: t('customer:dashboard.messagesHint'),
      icon: MessageCircle,
      tone: 'bg-violet-50 text-violet-600',
      href: '/customer/chat',
    },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      if (!authService.isAuthenticated()) {
        router.push('/login');
        return;
      }

      const user = authService.getUser();
      if (!user || user.role !== 'customer') {
        router.push('/');
        return;
      }

      try {
        const data = await authService.getProfile();
        setProfile(data);
      } catch (error) {
        console.error('Profile fetch failed:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  if (loading) {
    return (
      <DashboardLayout role="customer" contentClassName="">
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gray-200 skeleton" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-48 rounded skeleton" />
                <div className="h-3 w-32 rounded skeleton" />
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8 pt-6">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="h-5 w-56 rounded-lg skeleton" />
              <div className="mt-2 h-4 w-72 max-w-full rounded-lg skeleton" />
            </div>
            <div className="h-10 w-full rounded-lg skeleton md:w-36" />
          </div>

          <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="rounded-2xl border border-gray-100 bg-white p-6">
                <div className="h-4 w-40 rounded-lg skeleton" />
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="h-20 rounded-xl skeleton" />
                  <div className="h-20 rounded-xl skeleton" />
                  <div className="h-20 rounded-xl skeleton" />
                  <div className="h-20 rounded-xl skeleton" />
                </div>
              </div>
            </div>
            <div className="lg:col-span-4">
              <div className="rounded-2xl border border-gray-100 bg-white p-5">
                <div className="h-4 w-32 rounded-lg skeleton" />
                <div className="mt-4 space-y-3">
                  <div className="h-14 rounded-xl skeleton" />
                  <div className="h-14 rounded-xl skeleton" />
                  <div className="h-14 rounded-xl skeleton" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const firstName = profile?.name ? profile.name.split(' ')[0] : '';

  return (
    <DashboardLayout role="customer" contentClassName="">
      <div className="relative isolate min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
        {/* Background Decorations */}
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 overflow-hidden">
          <div className="absolute left-1/4 top-0 h-48 w-48 sm:h-64 sm:w-64 rounded-full bg-blue-100/40 blur-3xl" />
          <div className="absolute right-1/4 top-12 h-40 w-40 sm:h-56 sm:w-56 rounded-full bg-violet-100/30 blur-3xl" />
        </div>

        {/* Modern Clean Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <LayoutDashboard className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg font-bold text-gray-900 truncate">
                      {t('customer:dashboard.welcome', { name: firstName || t('customer:dashboard.defaultName') })} 👋
                  </h1>
                  <p className="text-xs text-gray-500 truncate">
                    {t('customer:dashboard.subtitle', { defaultValue: 'Find skilled professionals today' })}
                  </p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => {
                  if (!authService.isAuthenticated()) {
                    router.push('/register');
                    return;
                  }
                  router.push('/customer/recommendations');
                }}
                className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                <Search className="h-4 w-4" />
                <span>{t('customer:findWorkers', { defaultValue: 'Find Workers' })}</span>
              </button>
            </div>
            
            {/* Mobile CTA */}
            <div className="sm:hidden pb-4">
              <button
                type="button"
                onClick={() => {
                  if (!authService.isAuthenticated()) {
                    router.push('/register');
                    return;
                  }
                  router.push('/customer/recommendations');
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors"
              >
                <Search className="h-4 w-4" />
                <span>{t('customer:findWorkers', { defaultValue: 'Find Workers' })}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">

          {/* Feature Cards - First 3 in single row on mobile */}
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-3 sm:gap-4">
            {featureCards.map((card, index) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.key}
                  className="group relative overflow-hidden rounded-lg sm:rounded-xl bg-white p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'slideUp 0.5s ease-out forwards'
                  }}
                >
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br opacity-5 rounded-full blur-xl" 
                    style={{ background: `linear-gradient(135deg, ${card.tone})` }}></div>
                  
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.tone}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="text-[9px] sm:text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1 line-clamp-1">
                      {card.label}
                    </p>
                    <p className="text-sm sm:text-base font-bold text-slate-900 line-clamp-2">{card.title}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions - Full Width Modern Card */}
          <div className="rounded-xl sm:rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {t('customer:dashboard.quickFlow', { defaultValue: 'Quick Actions' })}
              </h2>
            </div>

            <div className="divide-y divide-gray-100">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                const isBrowseWorkers = action.key === 'browse-workers';

                return (
                  <button
                    key={action.key}
                    type="button"
                    onClick={() => {
                      if (isBrowseWorkers && !authService.isAuthenticated()) {
                        router.push('/register');
                        return;
                      }
                      router.push(action.href);
                    }}
                    className="group flex w-full items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 text-left transition-all duration-200 hover:bg-slate-50"
                    style={{
                      animationDelay: `${(index + 3) * 100}ms`,
                      animation: 'slideUp 0.5s ease-out forwards'
                    }}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg ${action.tone} transition-transform group-hover:scale-110`}>
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-base font-semibold text-gray-800 truncate">{action.label}</p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{action.hint}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-gray-300 transition-all duration-200 group-hover:translate-x-1 group-hover:text-gray-400" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <style jsx global>{`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
}
