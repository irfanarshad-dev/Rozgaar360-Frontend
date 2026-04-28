'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/app/components/ui/DashboardLayout';
import UploadCNIC from '../../components/UploadCNIC';
import EditProfile from '../../components/EditProfile';
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
  Edit3,
  Loader2,
  MapPin,
  MessageCircle,
  Navigation2,
  Phone,
  ShieldCheck,
  User,
  Wrench,
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
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconWrapClass}`}>
          <Icon className={`h-5 w-5 ${accent}`} />
        </div>
      </div>
      <p className="mt-3 text-xs font-medium text-slate-500">{trend}</p>
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
        <p className="text-sm font-semibold text-slate-900">{dayLabel || item.day}</p>
        <SwitchButton
          checked={item.enabled}
          onChange={() => onToggle(index)}
          label={`${item.day} availability`}
          showStateText={false}
          className="shrink-0"
        />
      </div>

      {item.enabled ? (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            type="time"
            value={item.start}
            onChange={(event) => onTimeChange(index, 'start', event.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 [appearance:textfield]"
          />
          <input
            type="time"
            value={item.end}
            onChange={(event) => onTimeChange(index, 'end', event.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 [appearance:textfield]"
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
  const [showEditProfile, setShowEditProfile] = useState(false);
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

  const accountBadge = isVerified
    ? { label: t('common:approved', { defaultValue: 'Verified' }), className: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
    : verificationStatus === 'pending'
      ? { label: t('common:pending', { defaultValue: 'Pending' }), className: 'bg-amber-50 text-amber-700 border-amber-200' }
      : verificationStatus === 'rejected'
        ? { label: t('common:rejected', { defaultValue: 'Rejected' }), className: 'bg-rose-50 text-rose-700 border-rose-200' }
        : { label: t('worker:dashboard.unverified', { defaultValue: 'Unverified' }), className: 'bg-slate-100 text-slate-600 border-slate-200' };

  const displayName = safeText(userProfile?.name, 'Arshad');
  const firstName = displayName.split(' ')[0] || 'Arshad';

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

  const fullName = safeText(userProfile?.name, 'Your Name');
  const phoneNumber = getFieldValue(userProfile, ['phone', 'phoneNumber', 'mobile'], 'N/A');
  const baseCity = getFieldValue(userProfile, ['city', 'baseCity'], 'N/A');
  const primarySkill = getFieldValue(workerProfile, ['skill', 'primarySkill'], 'Not set');
  const experience = workerProfile?.experience !== undefined && workerProfile?.experience !== null
    ? `${workerProfile.experience} years`
    : 'Not set';
  const serviceAddress = getFieldValue(workerProfile, ['workerAddress', 'address', 'serviceAddress'], 'Not set');

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

  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
    setShowEditProfile(false);
    setToast({ type: 'success', message: t('worker:editProfile.success', { defaultValue: 'Profile updated successfully.' }) });
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

      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white px-6 py-5 shadow-sm lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{t('worker:workerDashboard', { defaultValue: 'Worker Dashboard' })}</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {t('worker:dashboard.welcomeBack', { name: `, ${firstName}`, defaultValue: `Welcome back, ${firstName}!` })} 👋
              </h1>
              <p className="mt-2 text-sm text-slate-500">{t('worker:dashboard.subtitle', { defaultValue: 'Manage your profile and track your business' })}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 whitespace-nowrap">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-300" />
                {t('worker:available', { defaultValue: 'Available' })}
              </div>
              <SwitchButton
                checked={schedule.isAvailableNow}
                onChange={() => setSchedule((prev) => ({ ...prev, isAvailableNow: !prev.isAvailableNow }))}
                label={t('worker:dashboard.availableNow', { defaultValue: 'Available for Work' })}
                onText={t('common:on', { defaultValue: 'On' })}
                offText={t('common:off', { defaultValue: 'Off' })}
                className={`rounded-full border px-3 sm:px-4 py-2 text-sm font-semibold transition-all duration-200 whitespace-nowrap shrink-0 ${
                  schedule.isAvailableNow
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => (
              <StatCard key={card.label} {...card} label={t(card.labelKey, { defaultValue: card.label })} />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.9fr] items-start">
            <div className="space-y-6">
              <SurfaceCard>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{t('worker:dashboard.professionalDetails', { defaultValue: 'Professional Details' })}</p>
                    <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900">{t('worker:dashboard.professionalDetails', { defaultValue: 'Professional Details' })}</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEditProfile(true)}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <Edit3 className="mr-2 h-4 w-4" />
                    {t('worker:dashboard.editProfile', { defaultValue: 'Edit Profile' })}
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{t('worker:dashboard.fullName', { defaultValue: 'Full Name' })}</p>
                        <p className="mt-1 truncate text-sm font-semibold text-slate-900">{fullName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{t('worker:dashboard.phoneNumber', { defaultValue: 'Phone Number' })}</p>
                        <p className="mt-1 truncate text-sm font-semibold text-slate-900">{phoneNumber}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{t('worker:dashboard.baseCity', { defaultValue: 'Base City' })}</p>
                        <p className="mt-1 truncate text-sm font-semibold text-slate-900">{baseCity}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                        <Wrench className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-500">{t('worker:dashboard.primarySkill', { defaultValue: 'Primary Skill' })}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="truncate text-sm font-semibold text-blue-800">{primarySkill}</span>
                          <span className="inline-flex items-center rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
                        <Award className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{t('worker:dashboard.experience', { defaultValue: 'Experience' })}</p>
                        <p className="mt-1 truncate text-sm font-semibold text-slate-900">{experience}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
                        <Navigation2 className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{t('common:address', { defaultValue: 'Service Address' })}</p>
                        <p className="mt-1 truncate text-sm font-semibold text-slate-900">{serviceAddress}</p>
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-2 rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
                          <ShieldCheck className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{t('worker:dashboard.accountStatus', { defaultValue: 'Account Status' })}</p>
                          <p className="mt-1 truncate text-sm font-semibold text-slate-900">{t('worker:verificationStatus', { defaultValue: 'Verification Status' })}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${accountBadge.className}`}>
                        {isVerified ? <CheckCircle2 className="h-3.5 w-3.5" /> : <BadgeCheck className="h-3.5 w-3.5" />}
                        {accountBadge.label}
                      </span>
                    </div>
                  </div>
                </div>
              </SurfaceCard>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Link
                  href="/worker/bookings"
                  className="group relative overflow-hidden rounded-xl border border-transparent bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur-sm">
                        <Briefcase className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-blue-100">{t('worker:jobRequests', { defaultValue: 'Job Requests' })}</p>
                        <h3 className="mt-1 text-xl font-bold tracking-tight">
                          {t('worker:dashboard.quickActions.jobRequestsTitle', { defaultValue: 'New work is waiting' })}
                        </h3>
                        <p className="mt-2 max-w-sm text-sm text-blue-100/90">
                          {t('worker:dashboard.quickActions.jobRequestsSubtitle', { defaultValue: 'Review new job requests and manage your active bookings from one place.' })}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex shrink-0 items-center rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white ring-1 ring-white/20">
                      {jobRequestsCount} {t('worker:newRequests', { defaultValue: 'New' })}
                    </span>
                  </div>
                  <div className="mt-8 flex items-center justify-between text-sm font-semibold text-white/90">
                    <span>{t('common:viewAll', { defaultValue: 'View All' })}</span>
                    <ChevronRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                </Link>

                <Link
                  href="/worker/chat"
                  className="group relative overflow-hidden rounded-xl border border-transparent bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur-sm">
                        <MessageCircle className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-emerald-100">{t('common:messages', { defaultValue: 'Messages' })}</p>
                        <h3 className="mt-1 text-xl font-bold tracking-tight">
                          {t('worker:dashboard.quickActions.messagesTitle', { defaultValue: 'Stay connected with customers' })}
                        </h3>
                        <p className="mt-2 max-w-sm text-sm text-emerald-100/90">
                          {t('worker:dashboard.quickActions.messagesSubtitle', { defaultValue: 'Keep conversations moving and respond faster to new customers.' })}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex shrink-0 items-center rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white ring-1 ring-white/20">
                      {unreadCount} {t('common:messages', { defaultValue: 'Unread' })}
                    </span>
                  </div>
                  <div className="mt-8 flex items-center justify-between text-sm font-semibold text-white/90">
                    <span>{t('common:messages', { defaultValue: 'Open Messages' })}</span>
                    <ChevronRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                </Link>
              </div>

              {!isVerified && (
                <SurfaceCard>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{t('worker:verificationStatus', { defaultValue: 'Verification' })}</p>
                      <h3 className="mt-2 text-lg font-bold tracking-tight text-slate-900">
                        {t('worker:dashboard.verificationCta.title', { defaultValue: 'Complete your worker verification' })}
                      </h3>
                      <p className="mt-2 text-sm text-slate-500">
                        {t('worker:dashboard.verificationCta.subtitle', {
                          defaultValue: 'Upload your CNIC so customers and admins can trust your profile and unlock more bookings.',
                        })}
                      </p>
                    </div>
                    <UploadCNIC userId={profile?._id} onUploadSuccess={() => loadDashboard({ silent: true })} />
                  </div>
                </SurfaceCard>
              )}
            </div>

            <div className="space-y-6">
              <SurfaceCard>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{t('worker:dashboard.availabilitySchedule', { defaultValue: 'Availability Schedule' })}</p>
                    <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900">{t('worker:dashboard.availabilitySchedule', { defaultValue: 'Manage your working hours' })}</h2>
                  </div>
                  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${schedule.isAvailableNow ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                    {schedule.isAvailableNow
                      ? t('worker:dashboard.availableNow', { defaultValue: 'Available Now' })
                      : t('worker:dashboard.notAvailable', { defaultValue: 'Away' })}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={applySameTimeToAllDays}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  {t('common:applySame', { defaultValue: 'Apply same time to all days' })}
                </button>

                <div className="mt-5 grid grid-cols-1 gap-3">
                  {schedule.weeklySchedule.map((item, index) => (
                    <ScheduleDayRow
                      key={item.day}
                      item={item}
                      dayLabel={t(`worker:dashboard.days.${item.day.toLowerCase()}`, { defaultValue: item.day })}
                      index={index}
                      onToggle={handleDayToggle}
                      onTimeChange={handleDayTimeChange}
                      closedLabel={t('common:closed', { defaultValue: 'Closed' })}
                    />
                  ))}
                </div>

                <div className="mt-5 space-y-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-800">{t('worker:dashboard.serviceRadius', { defaultValue: 'Service Radius' })}</p>
                      <span className="text-sm font-semibold text-slate-500">{scheduleRadius} km</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={scheduleRadius}
                      onChange={(event) => setSchedule((prev) => ({ ...prev, serviceRadiusKm: Number(event.target.value) }))}
                      className="mt-3 h-2 w-full cursor-pointer accent-blue-600"
                    />
                    <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-slate-400">
                      <span>0 km</span>
                      <span>50 km</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-800">{t('worker:dashboard.responseRate', { defaultValue: 'Response Rate' })}</p>
                      <span className="text-sm font-semibold text-slate-500">{responseRate}%</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-slate-200">
                      <div className="h-2 rounded-full bg-emerald-500 transition-all duration-300" style={{ width: `${responseRate}%` }} />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-slate-400">
                      <span>{t('worker:dashboard.responseRateHint', { defaultValue: 'Average reply performance' })}</span>
                      <span>{t('common:readOnly', { defaultValue: 'Read only' })}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={saveSchedule}
                  disabled={savingSchedule}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {savingSchedule ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {savingSchedule
                    ? t('worker:dashboard.saving', { defaultValue: 'Saving...' })
                    : t('worker:dashboard.saveSchedule', { defaultValue: 'Save Schedule' })}
                </button>
              </SurfaceCard>
            </div>
          </div>
        </div>
      </div>

      {showEditProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-4 shadow-2xl sm:p-6">
            <button
              type="button"
              onClick={() => setShowEditProfile(false)}
              className="absolute right-4 top-4 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              {t('common:close', { defaultValue: 'Close' })}
            </button>
            <EditProfile profile={profile} onProfileUpdate={handleProfileUpdate} onCancel={() => setShowEditProfile(false)} />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
