'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/app/components/ui/DashboardLayout';
import UploadCNIC from '../../components/UploadCNIC';
import { authService } from '@/lib/auth';
import api from '@/lib/axios';
import { useTranslation } from 'react-i18next';
import {
  Award,
  BadgeCheck,
  Bell,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Clock3,
  DollarSign,
  Loader2,
  MessageCircle,
} from 'lucide-react';

const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEFAULT_SCHEDULE = () => WEEKDAY_NAMES.map((day) => ({
  day,
  enabled: day !== 'Sunday',
  start: '09:00',
  end: '18:00',
}));

const MONEY_FORMATTER = new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency: 'PKR',
  maximumFractionDigits: 0,
});

function formatMoney(value) {
  return MONEY_FORMATTER.format(Number(value) || 0);
}

function safeText(value, fallback = 'N/A') {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text || fallback;
}

function normalizeWeeklySchedule(schedule) {
  const source = Array.isArray(schedule) ? schedule : [];
  return DEFAULT_SCHEDULE().map((dayItem) => {
    const match = source.find((entry) => entry?.day === dayItem.day);
    return {
      day: dayItem.day,
      enabled: typeof match?.enabled === 'boolean' ? match.enabled : dayItem.enabled,
      start: match?.start || dayItem.start,
      end: match?.end || dayItem.end,
    };
  });
}

function getFieldValue(source, keys, fallback = 'N/A') {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== null && value !== undefined && String(value).trim()) return String(value);
  }
  return fallback;
}

function SkeletonLine({ className = 'h-4 w-full' }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`} />;
}

function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <SkeletonLine className="h-4 w-40" />
          <SkeletonLine className="h-8 w-72" />
          <SkeletonLine className="h-4 w-80" />
        </div>
        <SkeletonLine className="h-11 w-44 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <SkeletonLine className="h-3 w-24" />
              <SkeletonLine className="h-11 w-11 rounded-xl" />
            </div>
            <SkeletonLine className="mt-4 h-8 w-20" />
            <SkeletonLine className="mt-3 h-3 w-32" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.9fr] items-start">
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <SkeletonLine className="h-4 w-40" />
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="rounded-xl border border-gray-100 bg-slate-50 p-4">
                  <SkeletonLine className="h-3 w-24" />
                  <SkeletonLine className="mt-3 h-4 w-3/4" />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <SkeletonLine className="h-4 w-28" />
                <SkeletonLine className="mt-3 h-3 w-40" />
                <SkeletonLine className="mt-5 h-10 w-36 rounded-xl" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <SkeletonLine className="h-4 w-44" />
            <div className="mt-4 space-y-4">
              {Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="rounded-xl border border-gray-100 bg-slate-50 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <SkeletonLine className="h-4 w-24" />
                    <SkeletonLine className="h-6 w-10 rounded-full" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <SkeletonLine className="h-10 rounded-lg" />
                    <SkeletonLine className="h-10 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <SkeletonLine className="h-4 w-32" />
            <SkeletonLine className="mt-4 h-2 w-full rounded-full" />
            <SkeletonLine className="mt-4 h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, trend, accent, icon: Icon, iconWrapClass }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 truncate">{label}</p>
          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl shrink-0 ${iconWrapClass}`}>
          <Icon className={`h-5 w-5 ${accent}`} />
        </div>
      </div>
      <p className="mt-3 text-xs font-medium text-slate-500 truncate">{trend}</p>
    </div>
  );
}

function SurfaceCard({ children, className = '' }) {
  return (
    <div className={`rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md ${className}`}>
      {children}
    </div>
  );
}

function SwitchButton({
  checked,
  onChange,
  label,
  className = '',
  showStateText = true,
  onText = 'On',
  offText = 'Off',
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      dir="ltr"
      className={`inline-flex flex-row max-w-full items-center gap-2 ${className}`}
    >
      <span className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${checked ? 'bg-emerald-500' : 'bg-slate-300'}`}>
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </span>
      {showStateText && (
        <span className="text-xs sm:text-sm font-semibold text-slate-700 whitespace-nowrap min-w-[2.25rem] text-center">
          {checked ? onText : offText}
        </span>
      )}
    </button>
  );
}

function Toast({ toast, onClose, closeLabel }) {
  if (!toast) return null;

  const tone =
    toast.type === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : toast.type === 'warning'
        ? 'border-amber-200 bg-amber-50 text-amber-800'
        : 'border-rose-200 bg-rose-50 text-rose-800';

  return (
    <div className="fixed right-4 top-4 z-50 max-w-sm">
      <div className={`rounded-xl border px-4 py-3 shadow-lg ${tone}`}>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white/70">
            {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">{toast.message}</p>
          </div>
          <button type="button" onClick={onClose} className="text-xs font-semibold opacity-70 hover:opacity-100">
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function ScheduleDayRow({ item, dayLabel, index, onToggle, onTimeChange, closedLabel }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 transition-shadow duration-200 hover:shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-900 truncate">{dayLabel || item.day}</p>
        <SwitchButton
          checked={item.enabled}
          onChange={() => onToggle(index)}
          label={`${item.day} availability`}
          showStateText={false}
          className="shrink-0"
        />
      </div>

      {item.enabled ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <input
            type="time"
            value={item.start}
            onChange={(event) => onTimeChange(index, 'start', event.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <input
            type="time"
            value={item.end}
            onChange={(event) => onTimeChange(index, 'end', event.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      ) : (
        <p className="mt-3 text-sm font-medium text-slate-400">{closedLabel}</p>
      )}
    </div>
  );
}

export default function WorkerDashboard() {
  const router = useRouter();
  const { t } = useTranslation(['worker', 'common']);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [toast, setToast] = useState(null);
  const [stats, setStats] = useState({ pending: 0, active: 0, completed: 0, monthlyEarnings: 0 });
  const [jobRequestsCount, setJobRequestsCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [schedule, setSchedule] = useState({
    isAvailableNow: true,
    serviceRadiusKm: 10,
    responseRate: 100,
    weeklySchedule: DEFAULT_SCHEDULE(),
  });

  const workerProfile = useMemo(() => profile?.profile || profile?.workerProfile || profile?.worker || {}, [profile]);
  const userProfile = useMemo(() => profile || {}, [profile]);

  const verificationStatus = String(
    workerProfile?.verificationStatus || userProfile?.verificationStatus || ''
  ).trim().toLowerCase();

  const isVerified = Boolean(
    workerProfile?.verified ||
    userProfile?.verified ||
    verificationStatus === 'verified' ||
    verificationStatus === 'approved'
  );

  const displayName = safeText(userProfile?.name, 'Worker');
  const firstName = displayName.split(' ')[0] || 'Worker';

  const loadDashboard = useCallback(
    async ({ silent = false } = {}) => {
      if (!authService.isAuthenticated()) {
        router.push('/login');
        return;
      }

      const currentUser = authService.getUser();
      if (!currentUser || currentUser.role !== 'worker') {
        router.push('/');
        return;
      }

      if (!silent) setLoading(true);

      try {
        const [profileResult, bookingsResult, conversationsResult, notificationsResult] = await Promise.allSettled([
          authService.getProfile(),
          api.get('/api/bookings/my-bookings').then((response) => response.data),
          api.get('/api/chat/conversations').then((response) => response.data),
          api.get('/api/notifications/unread-count').then((response) => response.data),
        ]);

        const resolvedProfile = profileResult.status === 'fulfilled' ? profileResult.value : null;
        if (!resolvedProfile) {
          throw new Error('Failed to load profile.');
        }

        setProfile(resolvedProfile);

        const profileWorker = resolvedProfile?.profile || resolvedProfile?.workerProfile || resolvedProfile?.worker || {};
        const savedWeeklySchedule = profileWorker?.weeklySchedule;

        setSchedule({
          isAvailableNow: profileWorker?.isAvailableNow ?? true,
          serviceRadiusKm: Number(profileWorker?.serviceRadiusKm ?? 10) || 10,
          responseRate: Number(profileWorker?.responseRate ?? 100) || 100,
          weeklySchedule: normalizeWeeklySchedule(savedWeeklySchedule),
        });

        const bookings = bookingsResult.status === 'fulfilled' && Array.isArray(bookingsResult.value)
          ? bookingsResult.value
          : [];

        const now = new Date();
        const monthlyEarnings = bookings
          .filter((booking) => booking?.status === 'completed')
          .filter((booking) => {
            const stamp = booking?.completedAt || booking?.updatedAt || booking?.date;
            if (!stamp) return false;
            const bookingDate = new Date(stamp);
            return bookingDate.getMonth() === now.getMonth() && bookingDate.getFullYear() === now.getFullYear();
          })
          .reduce((sum, booking) => sum + Number(booking?.estimatedCost ?? booking?.totalAmount ?? 0), 0);

        setStats({
          pending: bookings.filter((booking) => booking?.status === 'pending').length,
          active: bookings.filter((booking) => ['confirmed', 'in_progress'].includes(booking?.status)).length,
          completed: bookings.filter((booking) => booking?.status === 'completed').length,
          monthlyEarnings,
        });

        setJobRequestsCount(bookings.filter((booking) => booking?.status === 'pending').length);

        const notificationCount = notificationsResult.status === 'fulfilled'
          ? Number(notificationsResult.value?.count ?? notificationsResult.value?.unreadCount ?? 0)
          : 0;

        if (notificationCount > 0) {
          setUnreadCount(notificationCount);
        } else {
          const userId = currentUser?._id?.toString();
          const conversations = conversationsResult.status === 'fulfilled' && Array.isArray(conversationsResult.value)
            ? conversationsResult.value
            : [];
          const unreadFromConversations = conversations.reduce((sum, conversation) => {
            const unreadMap = conversation?.unreadCount;
            const raw = unreadMap && userId ? unreadMap[userId] ?? unreadMap?.[String(userId)] : 0;
            return sum + (Number(raw) || 0);
          }, 0);
          setUnreadCount(unreadFromConversations);
        }
      } catch (error) {
        setToast({
          type: 'warning',
          message: error.message || t('common:errorLoading', { defaultValue: 'Dashboard data could not be loaded completely.' }),
        });
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [router, t]
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const statCards = [
    {
      label: 'Pending Jobs',
      labelKey: 'worker:dashboard.stats.pending',
      value: stats.pending,
      trend: t('common:fromLastWeek', { defaultValue: '+2 from last week' }),
      icon: Briefcase,
      accent: 'text-amber-600',
      iconWrapClass: 'bg-amber-50',
    },
    {
      label: 'Active Jobs',
      labelKey: 'worker:dashboard.stats.activeJobs',
      value: stats.active,
      trend: t('common:sameAsLastWeek', { defaultValue: 'same as last week' }),
      icon: Clock3,
      accent: 'text-blue-600',
      iconWrapClass: 'bg-blue-50',
    },
    {
      label: 'Completed Jobs',
      labelKey: 'worker:dashboard.stats.completed',
      value: stats.completed,
      trend: t('common:fromLastWeek', { defaultValue: '+4 from last week' }),
      icon: CheckCircle2,
      accent: 'text-emerald-600',
      iconWrapClass: 'bg-emerald-50',
    },
    {
      label: 'Total Earnings',
      labelKey: 'worker:dashboard.stats.totalEarnings',
      value: formatMoney(stats.monthlyEarnings),
      trend: t('common:thisMonth', { defaultValue: 'This month earnings' }),
      icon: DollarSign,
      accent: 'text-indigo-600',
      iconWrapClass: 'bg-indigo-50',
    },
  ];

  const scheduleRadius = Math.max(0, Math.min(50, Number(schedule.serviceRadiusKm) || 0));
  const responseRate = Math.max(0, Math.min(100, Number(schedule.responseRate) || 0));

  const handleDayToggle = (index) => {
    setSchedule((prev) => ({
      ...prev,
      weeklySchedule: prev.weeklySchedule.map((item, currentIndex) => (
        currentIndex === index ? { ...item, enabled: !item.enabled } : item
      )),
    }));
  };

  const handleDayTimeChange = (index, field, value) => {
    setSchedule((prev) => ({
      ...prev,
      weeklySchedule: prev.weeklySchedule.map((item, currentIndex) => (
        currentIndex === index ? { ...item, [field]: value } : item
      )),
    }));
  };

  const applySameTimeToAllDays = () => {
    const firstEnabledDay = schedule.weeklySchedule.find((item) => item.enabled);
    if (!firstEnabledDay) return;

    setSchedule((prev) => ({
      ...prev,
      weeklySchedule: prev.weeklySchedule.map((item) => (
        item.enabled
          ? { ...item, start: firstEnabledDay.start, end: firstEnabledDay.end }
          : item
      )),
    }));
    setToast({ type: 'success', message: 'Times copied to all active days.' });
  };

  const saveSchedule = async () => {
    setSavingSchedule(true);
    try {
      await api.put(`/api/users/${profile?._id}`, {
        isAvailableNow: schedule.isAvailableNow,
        serviceRadiusKm: scheduleRadius,
        responseRate,
        weeklySchedule: schedule.weeklySchedule,
      });
      setToast({ type: 'success', message: t('worker:dashboard.scheduleUpdated', { defaultValue: 'Schedule saved successfully.' }) });
      await loadDashboard({ silent: true });
    } catch (error) {
      setToast({
        type: 'warning',
        message: error.response?.data?.message || error.message || t('worker:dashboard.scheduleUpdateFailed', { defaultValue: 'Unable to save schedule.' }),
      });
    } finally {
      setSavingSchedule(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="worker" contentClassName="p-0" showFooter={false} isFixedHeight={false}>
        <div className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-7xl">
            <SkeletonDashboard />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="worker" contentClassName="p-0" showFooter={false} isFixedHeight={false}>
      <Toast toast={toast} onClose={() => setToast(null)} closeLabel={t('common:close', { defaultValue: 'Close' })} />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-3 sm:py-6 space-y-3 sm:space-y-6">
          
          {/* Hero Header - Mobile Optimized */}
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-4 sm:p-6 lg:p-8 shadow-lg shadow-blue-500/20 mx-0.5">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xMiAxNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptMCAyNGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
            
            <div className="relative">
              {/* Top Section */}
              <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="text-[10px] sm:text-xs font-semibold text-blue-100 uppercase tracking-wider">
                      {t('worker:workerDashboard', { defaultValue: 'Dashboard' })}
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight">
                    {t('worker:dashboard.welcomeBack', { name: `, ${firstName}`, defaultValue: `Hi, ${firstName}!` })}
                  </h1>
                </div>

                {/* Availability Toggle - Always Show Text */}
                <button
                  onClick={() => setSchedule((prev) => ({ ...prev, isAvailableNow: !prev.isAvailableNow }))}
                  className={`flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold transition-all duration-200 shadow-lg shrink-0 ${
                    schedule.isAvailableNow
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white/10 backdrop-blur-sm border border-white/20 text-white'
                  }`}
                >
                  <div className={`h-1.5 w-1.5 rounded-full ${
                    schedule.isAvailableNow ? 'bg-white' : 'bg-white/60'
                  }`}></div>
                  <span>{schedule.isAvailableNow ? t('worker:available', { defaultValue: 'Available' }) : t('worker:dashboard.notAvailable', { defaultValue: 'Away' })}</span>
                </button>
              </div>

              {/* Quick Actions - Mobile Optimized */}
              <div className="flex gap-2">
                <Link
                  href="/worker/bookings"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-white/20 transition-all duration-200"
                >
                  <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>{t('worker:jobRequests', { defaultValue: 'Jobs' })}</span>
                  <span className="inline-flex items-center justify-center min-w-[1.125rem] h-4 rounded-full bg-white/20 px-1 text-[10px] font-bold">
                    {jobRequestsCount}
                  </span>
                </Link>

                <Link
                  href="/worker/chat"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-white/20 transition-all duration-200"
                >
                  <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>{t('common:messages', { defaultValue: 'Chat' })}</span>
                  <span className="inline-flex items-center justify-center min-w-[1.125rem] h-4 rounded-full bg-white/20 px-1 text-[10px] font-bold">
                    {unreadCount}
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Grid - Compact Mobile */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 px-0.5">
            {statCards.map((card, index) => (
              <div
                key={card.label}
                className="group relative overflow-hidden rounded-lg sm:rounded-xl bg-white p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'slideUp 0.5s ease-out forwards'
                }}
              >
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br opacity-5 rounded-full blur-xl" 
                  style={{ background: `linear-gradient(135deg, ${card.accent.replace('text-', '')})` }}></div>
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg ${card.iconWrapClass}`}>
                      <card.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${card.accent}`} />
                    </div>
                  </div>
                  <p className="text-[9px] sm:text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1 line-clamp-1">
                    {t(card.labelKey, { defaultValue: card.label })}
                  </p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 mb-0.5">{card.value}</p>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 line-clamp-1">{card.trend}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Availability Schedule - Modern Card */}
          <div className="space-y-4">
            <div className="rounded-2xl sm:rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                      {t('worker:dashboard.availabilitySchedule', { defaultValue: 'Availability Schedule' })}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      {t('worker:dashboard.availabilitySchedule', { defaultValue: 'Manage your working hours' })}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                    schedule.isAvailableNow 
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                      : 'bg-amber-100 text-amber-700 border border-amber-200'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      schedule.isAvailableNow ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}></span>
                    {schedule.isAvailableNow
                      ? t('worker:dashboard.availableNow', { defaultValue: 'Available Now' })
                      : t('worker:dashboard.notAvailable', { defaultValue: 'Away' })}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Quick Apply Button */}
                <button
                  type="button"
                  onClick={applySameTimeToAllDays}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all"
                >
                  <Clock3 className="h-4 w-4" />
                  {t('common:applySame', { defaultValue: 'Apply same time to all days' })}
                </button>

                {/* Days Grid - Mobile Optimized */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
                  {schedule.weeklySchedule.map((item, index) => (
                    <div 
                      key={item.day} 
                      className={`group relative rounded-xl border-2 p-3 transition-all duration-200 ${
                        item.enabled 
                          ? 'border-blue-200 bg-blue-50/50 hover:border-blue-300 hover:bg-blue-50' 
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <p className={`text-xs font-bold uppercase tracking-wide truncate ${
                            item.enabled ? 'text-blue-900' : 'text-slate-500'
                          }`}>
                            {t(`worker:dashboard.days.${item.day.toLowerCase()}`, { defaultValue: item.day.slice(0, 3) })}
                          </p>
                          <button
                            onClick={() => handleDayToggle(index)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                              item.enabled ? 'bg-blue-600' : 'bg-slate-300'
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                              item.enabled ? 'translate-x-4' : 'translate-x-0.5'
                            }`} />
                          </button>
                        </div>
                        
                        {item.enabled ? (
                          <div className="space-y-1.5">
                            <input
                              type="time"
                              value={item.start}
                              onChange={(event) => handleDayTimeChange(index, 'start', event.target.value)}
                              className="h-8 w-full rounded-lg border border-blue-200 bg-white px-2 text-xs font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                            <input
                              type="time"
                              value={item.end}
                              onChange={(event) => handleDayTimeChange(index, 'end', event.target.value)}
                              className="h-8 w-full rounded-lg border border-blue-200 bg-white px-2 text-xs font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                          </div>
                        ) : (
                          <p className="text-xs font-medium text-slate-400 text-center py-2">
                            {t('common:closed', { defaultValue: 'Closed' })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Service Settings */}
                <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-100">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-slate-700">
                        {t('worker:dashboard.serviceRadius', { defaultValue: 'Service Radius' })}
                      </label>
                      <span className="text-sm font-bold text-blue-600">{scheduleRadius} km</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={scheduleRadius}
                      onChange={(event) => setSchedule((prev) => ({ ...prev, serviceRadiusKm: Number(event.target.value) }))}
                      className="h-2 w-full cursor-pointer accent-blue-600 rounded-full"
                    />
                    <div className="flex items-center justify-between mt-1.5 text-xs text-slate-400">
                      <span>0 km</span>
                      <span>50 km</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-slate-700">
                        {t('worker:dashboard.responseRate', { defaultValue: 'Response Rate' })}
                      </label>
                      <span className="text-sm font-bold text-emerald-600">{responseRate}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300 rounded-full" 
                        style={{ width: `${responseRate}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1.5 text-xs text-slate-400">
                      <span>{t('worker:dashboard.responseRateHint', { defaultValue: 'Average reply performance' })}</span>
                      <span>{t('common:readOnly', { defaultValue: 'Read only' })}</span>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  type="button"
                  onClick={saveSchedule}
                  disabled={savingSchedule}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-0.5"
                >
                  {savingSchedule ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t('worker:dashboard.saving', { defaultValue: 'Saving...' })}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      {t('worker:dashboard.saveSchedule', { defaultValue: 'Save Schedule' })}
                    </>
                  )}
                </button>
              </div>
            </div>
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
        
        @media (min-width: 475px) {
          .xs\:inline {
            display: inline;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
