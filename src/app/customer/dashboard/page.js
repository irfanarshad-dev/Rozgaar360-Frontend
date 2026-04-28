'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/auth';
import DashboardLayout from '@/app/components/ui/DashboardLayout';
import Card, { CardBody } from '@/app/components/ui/Card';
import { SkeletonStatCard } from '@/app/components/ui/SkeletonCard';
import EditProfile from '../../components/EditProfile';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Calendar, MessageCircle, Search } from 'lucide-react';

export default function CustomerDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
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

  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <DashboardLayout role="customer">
        <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
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

  const accountRows = [
    [
      {
        label: t('customer:dashboard.fullName'),
        value: profile?.name || '-',
      },
      {
        label: t('customer:dashboard.phoneNumber'),
        value: profile?.phone || '-',
      },
    ],
    [
      {
        label: t('customer:dashboard.city'),
        value: profile?.city || '-',
      },
      {
        label: t('customer:dashboard.address'),
        value: profile?.address || t('customer:dashboard.noAddressProvided'),
      },
    ],
  ];

  return (
    <DashboardLayout role="customer">
      <div className="relative isolate mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 overflow-hidden">
          <div className="mx-auto h-64 w-64 rounded-full bg-blue-100/40 blur-3xl sm:h-80 sm:w-80" />
          <div className="absolute right-0 top-8 h-56 w-56 rounded-full bg-violet-100/30 blur-3xl sm:h-72 sm:w-72" />
        </div>

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between lg:mb-8">
          <div className="animate-[dashboardFadeUp_0.5s_ease-out_both]">
            <h1 className="text-[22px] font-semibold tracking-tight text-gray-900 sm:text-[24px]">
              Good morning, {firstName || 'Bilal'} 👋
            </h1>
            <p className="mt-1 text-sm text-gray-500 sm:text-[15px]">Ready to hire skilled professionals today?</p>
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
            className="inline-flex w-full items-center justify-center rounded-lg border border-blue-600 px-4 py-2.5 text-sm font-medium text-blue-600 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-600 hover:text-white md:w-auto animate-[dashboardFadeUp_0.55s_ease-out_0.05s_both]"
          >
            {t('customer:findWorkers')}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {featureCards.map((card) => {
            const Icon = card.icon;

            return (
              <Card
                key={card.key}
                className="group border border-gray-100 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-sm animate-[dashboardFadeUp_0.55s_ease-out_both]"
              >
                <CardBody className="!p-5 sm:!p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400">{card.label}</p>
                      <p className="mt-1 text-[15px] font-semibold text-gray-800 sm:text-base">{card.title}</p>
                    </div>
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${card.tone}`}>
                      <Icon className="h-[17px] w-[17px]" />
                    </div>
                  </div>
                  <div className="mt-5 flex justify-end text-gray-300 transition duration-200 group-hover:translate-x-0.5 group-hover:text-blue-400">
                    <ArrowRight className="h-[18px] w-[18px]" />
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {isEditing ? (
              <EditProfile profile={profile} onProfileUpdate={handleProfileUpdate} onCancel={() => setIsEditing(false)} />
            ) : (
              <Card className="border border-gray-100 bg-white shadow-sm animate-[dashboardFadeUp_0.6s_ease-out_0.08s_both]">
                <CardBody className="!p-0">
                  <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6 lg:px-7 lg:py-5">
                    <h2 className="text-sm font-semibold text-gray-900 sm:text-[15px]">{t('customer:dashboard.accountInfo')}</h2>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-xs text-blue-600 underline decoration-blue-300 underline-offset-2 transition hover:text-blue-700"
                    >
                      {t('customer:dashboard.editProfile')}
                    </button>
                  </div>

                  {profile ? (
                    <div>
                      {accountRows.map((row, rowIndex) => (
                        <div key={rowIndex} className={rowIndex === 0 ? '' : 'border-t border-gray-100'}>
                          <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
                            {row.map((field) => (
                              <div key={field.label} className="px-5 py-4 sm:px-6 lg:px-7 lg:py-5">
                                <p className="mb-1 text-[11px] uppercase tracking-[0.18em] text-gray-400">{field.label}</p>
                                <p className="text-[15px] font-semibold text-gray-800">{field.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-5 py-12 text-center sm:px-6 lg:px-7 lg:py-14">
                      <p className="text-sm text-gray-500">{t('customer:dashboard.noProfileData')}</p>
                    </div>
                  )}
                </CardBody>
              </Card>
            )}
          </div>

          <div className="lg:col-span-4">
            <Card className="border border-gray-100 bg-white shadow-sm animate-[dashboardFadeUp_0.65s_ease-out_0.12s_both]">
              <CardBody className="!p-0">
                <div className="border-b border-gray-100 px-5 py-4 sm:px-6 lg:px-7 lg:py-5">
                  <h2 className="text-sm font-semibold text-gray-900 sm:text-[15px]">{t('customer:dashboard.quickFlow')}</h2>
                </div>

                <div>
                  {quickActions.map((action) => {
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
                        className="group flex w-full items-center justify-between gap-4 border-b border-gray-100 px-5 py-4 text-left transition duration-200 last:border-b-0 hover:bg-gray-50 sm:px-6 lg:px-7 lg:py-5"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${action.tone}`}>
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="truncate text-[15px] font-semibold text-gray-800">{action.label}</span>
                        </div>

                        <div className="flex min-w-0 items-center gap-2 text-right">
                          <span className="max-w-[12rem] text-xs leading-5 text-gray-400 sm:max-w-[14rem]">{action.hint}</span>
                          <ArrowRight className="h-4 w-4 shrink-0 text-gray-300 transition duration-200 group-hover:translate-x-0.5 group-hover:text-gray-400" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
        <style jsx>{`
          @keyframes dashboardFadeUp {
            from {
              opacity: 0;
              transform: translateY(10px);
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
