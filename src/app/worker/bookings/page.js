'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import api from '@/lib/axios';
import Link from 'next/link';
import DashboardLayout from '@/app/components/ui/DashboardLayout';
import { useTranslation } from 'react-i18next';
import {
  Calendar, Clock, MapPin, Phone, User, CheckCircle,
  XCircle, Play, CheckCircle2, MessageCircle, MoreHorizontal,
  ChevronRight, Briefcase, Filter, Search, Loader2, DollarSign
} from 'lucide-react';

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

function StatusBadge({ status, t }) {
  const configs = {
    pending:     { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: t('worker:statusPending') },
    confirmed:   { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: t('worker:statusActive', { defaultValue: 'Active' }) },
    in_progress: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: t('worker:statusActive', { defaultValue: 'Active' }) },
    completed:   { bg: 'bg-blue-50',  text: 'text-blue-700',  border: 'border-blue-200',  label: t('worker:statusCompleted') },
    cancelled:   { bg: 'bg-red-50',   text: 'text-red-600',   border: 'border-red-200',   label: t('worker:statusCancelled') },
  };

  const config = configs[status] || configs.pending;

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${config.bg} ${config.text} ${config.border} border`}>
      {config.label}
    </span>
  );
}

function BookingCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4 shadow-sm animate-pulse">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-xl" />
          <div className="space-y-2">
            <div className="h-4 sm:h-5 bg-gray-100 rounded w-24 sm:w-32" />
            <div className="h-3 sm:h-4 bg-gray-100 rounded w-16 sm:w-24" />
          </div>
        </div>
        <div className="w-20 sm:w-24 h-6 sm:h-7 bg-gray-100 rounded-full" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 py-4 border-y border-gray-50">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="h-3 bg-gray-100 rounded w-8" />
            <div className="h-4 sm:h-5 bg-gray-100 rounded w-16 sm:w-20" />
          </div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="h-10 bg-gray-100 rounded-xl flex-1" />
        <div className="h-10 bg-gray-100 rounded-xl flex-1" />
      </div>
    </div>
  );
}

export default function WorkerBookings() {
  const router = useRouter();
  const { t, i18n } = useTranslation(['worker', 'common', 'home', 'recommendations']);
  const [activeTab, setActiveTab] = useState('pending');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    const initData = async () => {
      if (!authService.isAuthenticated()) { router.push('/login'); return; }
      const user = authService.getUser();
      if (user?.role !== 'worker') { router.push('/'); return; }
      
      try {
        const response = await api.get('/api/bookings/my-bookings');
        setBookings(response.data || []);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [router]);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    setUpdating(bookingId);
    try {
      await api.put(`/api/bookings/${bookingId}/status`, { status: newStatus });
      const response = await api.get('/api/bookings/my-bookings');
      setBookings(response.data || []);
    } catch (error) {
      alert(t('worker:updateBookingFailed'));
    } finally {
      setUpdating(null);
    }
  };

  const counts = {
    pending:   bookings.filter(b => b.status === 'pending').length,
    active:    bookings.filter(b => ['confirmed', 'in_progress'].includes(b.status)).length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  const filtered = bookings.filter(b => {
    if (activeTab === 'pending')   return b.status === 'pending';
    if (activeTab === 'active')    return ['confirmed', 'in_progress'].includes(b.status);
    if (activeTab === 'completed') return b.status === 'completed';
    if (activeTab === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  const getSkillLabel = (skillName) => {
    const key = SKILL_TRANSLATION_KEYS[skillName];
    if (!key) return skillName;
    return t(`home:skills.${key}`, { defaultValue: skillName });
  };

  const tabLabels = {
    pending: t('worker:requests'),
    active: t('worker:active'),
    completed: t('worker:pastJobs'),
    cancelled: t('worker:rejected'),
  };

  return (
    <DashboardLayout role="worker">
      <div className="max-w-5xl mx-auto pb-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 pt-4 sm:pt-0">
          <div>
            <h1 className="text-xl font-medium text-gray-900">{t('worker:myBookings', { defaultValue: 'My Bookings' })}</h1>
            <p className="text-sm text-gray-400 mt-1">{t('worker:manageBookings')}</p>
          </div>
          <div className="flex gap-2">
            <button className="w-full sm:w-auto flex justify-center items-center gap-2 px-4 py-2 sm:py-2.5 bg-white border border-gray-100 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-all">
              <Filter className="w-4 h-4 text-gray-400" />
              {t('recommendations:filters', { defaultValue: 'Filter' })}
            </button>
          </div>
        </div>

        {/* Improved Tabs */}
        <div className="flex border-b border-gray-200 mb-6 sm:mb-8 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {[
            { id: 'pending',   label: tabLabels.pending, count: counts.pending },
            { id: 'active',    label: tabLabels.active, count: counts.active },
            { id: 'completed', label: tabLabels.completed, count: counts.completed },
            { id: 'cancelled', label: tabLabels.cancelled, count: counts.cancelled },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {tab.count}
                </span>
              )}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid gap-4 sm:gap-6">
            <BookingCardSkeleton />
            <BookingCardSkeleton />
            <BookingCardSkeleton />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100 px-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <Briefcase className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">{t('worker:noBookingsForTab', { tab: tabLabels[activeTab] || tabLabels.pending })}</h3>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">{t('worker:bookingListEmptyHint')}</p>
            <button
              onClick={() => router.push('/worker/dashboard')}
              className="mt-6 px-5 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/25 hover:-translate-y-0.5 transition-all w-full sm:w-auto"
            >
              {t('worker:backToDashboard')}
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {filtered.map((booking) => (
              <div
                key={booking._id}
                className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
              >
                {/* Top Row */}
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-medium text-gray-900">{booking.customerId?.name}</h3>
                    <p className="truncate text-sm text-blue-600">{getSkillLabel(booking.service)}</p>
                  </div>
                  <StatusBadge status={booking.status} t={t} />
                </div>

                {/* Info Row */}
                <div className="grid grid-cols-1 gap-3 border-y border-gray-100 py-4 sm:grid-cols-3">
                  <div className="rounded-lg bg-gray-50 px-3 py-2">
                    <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-gray-400">
                      <Calendar className="h-3.5 w-3.5" /> {t('worker:jobDate')}
                    </span>
                    <span className="mt-1 block text-sm font-medium text-gray-800">
                      {new Date(booking.date).toLocaleDateString(i18n.language === 'ur' ? 'ur-PK' : 'en-US', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="rounded-lg bg-gray-50 px-3 py-2">
                    <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-gray-400">
                      <Clock className="h-3.5 w-3.5" /> {t('worker:timeSlot')}
                    </span>
                    <span className="mt-1 block text-sm font-medium text-gray-800">{booking.time}</span>
                  </div>
                  <div className="rounded-lg bg-gray-50 px-3 py-2">
                    <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-gray-400">
                      <DollarSign className="h-3.5 w-3.5" /> {t('worker:payment', { defaultValue: 'Payment' })}
                    </span>
                    <span className="mt-1 block text-sm font-medium text-gray-800">
                      {booking.totalAmount
                        ? `$${Number(booking.totalAmount).toFixed(2)}`
                        : t('worker:paymentPending', { defaultValue: 'Pending' })}
                    </span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-gray-50 px-3 py-2">
                    <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-gray-400">
                      <Phone className="h-3.5 w-3.5" /> {t('worker:customerPhone')}
                    </span>
                    <span className="mt-1 block text-sm font-medium text-gray-800">
                      {booking.customerId?.phone || t('worker:contactViaChat')}
                    </span>
                  </div>
                  <div className="rounded-lg bg-gray-50 px-3 py-2">
                    <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-gray-400">
                      <MapPin className="h-3.5 w-3.5" /> {t('worker:location')}
                    </span>
                    <span className="mt-1 block truncate text-sm font-medium text-gray-800" title={booking.address}>
                      {booking.address}
                    </span>
                  </div>
                </div>

                {booking.description && (
                  <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wide text-gray-400">{t('worker:jobRequirement')}</p>
                    <p className="mt-1 text-xs text-gray-600 line-clamp-2 italic">&quot;{booking.description}&quot;</p>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/worker/bookings/${booking._id}`}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 px-4 text-xs text-gray-700 transition hover:bg-gray-50"
                  >
                    {t('worker:viewDetails')}
                  </Link>

                  {booking.conversationId && (
                    <Link
                      href={`/worker/chat?workerId=${booking.workerId._id || booking.workerId}`}
                      className="inline-flex h-9 items-center justify-center rounded-lg px-4 text-xs text-blue-600 transition hover:bg-blue-50"
                    >
                      {t('worker:chatNow')}
                    </Link>
                  )}

                  {updating === booking._id ? (
                    <div className="inline-flex h-9 items-center px-4">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    </div>
                  ) : (
                    <>
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                            className="inline-flex h-9 items-center justify-center rounded-lg bg-green-600 px-4 text-xs text-white transition hover:bg-green-700"
                          >
                            {t('worker:acceptJob')}
                          </button>
                          <button
                            onClick={() => confirm(t('worker:rejectJobConfirm')) && handleStatusUpdate(booking._id, 'cancelled')}
                            className="inline-flex h-9 items-center justify-center rounded-lg border border-red-200 px-4 text-xs text-red-600 transition hover:bg-red-50"
                          >
                            {t('worker:decline')}
                          </button>
                        </>
                      )}

                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusUpdate(booking._id, 'in_progress')}
                          className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-xs text-white transition hover:bg-blue-700"
                        >
                          {t('worker:markInProgress')}
                        </button>
                      )}

                      {booking.status === 'in_progress' && (
                        <button
                          onClick={() => handleStatusUpdate(booking._id, 'completed')}
                          className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-xs text-white transition hover:bg-blue-700"
                        >
                          {t('worker:markFinished')}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
