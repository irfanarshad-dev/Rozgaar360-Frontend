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
  ChevronRight, Briefcase, Filter, Search, Loader2
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
    pending:     { bg: 'bg-amber-50',  text: 'text-amber-700', border: 'border-amber-200', icon: Clock, label: t('worker:statusPending') },
    confirmed:   { bg: 'bg-blue-50',   text: 'text-blue-700',  border: 'border-blue-200',  icon: CheckCircle, label: t('worker:statusConfirmed') },
    in_progress: { bg: 'bg-indigo-50', text: 'text-indigo-700',border: 'border-indigo-200',icon: Play, label: t('worker:statusInProgress') },
    completed:   { bg: 'bg-emerald-50',text: 'text-emerald-700',border: 'border-emerald-200',icon: CheckCircle2, label: t('worker:statusCompleted') },
    cancelled:   { bg: 'bg-rose-50',   text: 'text-rose-700',   border: 'border-rose-200',  icon: XCircle, label: t('worker:statusCancelled') },
  };

  const config = configs[status] || configs.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.bg} ${config.text} ${config.border} shadow-sm`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}

function BookingCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 space-y-4 shadow-sm animate-pulse">
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
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">{t('worker:jobRequests')}</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">{t('worker:manageBookings')}</p>
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
          <div className="text-center py-16 sm:py-20 bg-white rounded-2xl sm:rounded-3xl border border-dashed border-gray-200 px-4 sm:px-0">
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
                className="group bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 overflow-hidden animate-scaleIn"
              >
                <div className="p-4 sm:p-6">
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                      <div className="relative">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white text-lg sm:text-xl font-black shadow-lg shadow-blue-200 ring-4 ring-blue-50/50">
                          {booking.customerId?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-black text-gray-900 leading-tight truncate">{booking.customerId?.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] sm:text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md sm:rounded-lg uppercase tracking-wider whitespace-nowrap">
                            {getSkillLabel(booking.service)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="self-end sm:self-auto">
                      <StatusBadge status={booking.status} t={t} />
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 py-4 sm:py-5 border-y border-gray-50 mb-4 sm:mb-6">
                    <div className="flex flex-col gap-0.5 sm:gap-1">
                      <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('worker:jobDate')}</p>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-gray-700">
                        <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-blue-500" />
                        <span className="truncate">{new Date(booking.date).toLocaleDateString(i18n.language === 'ur' ? 'ur-PK' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-0.5 sm:gap-1">
                      <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('worker:timeSlot')}</p>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-gray-700">
                        <Clock className="w-3.5 h-3.5 flex-shrink-0 text-blue-500" />
                        <span className="truncate">{booking.time}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-0.5 sm:gap-1 sm:col-span-1 md:col-span-1">
                      <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('worker:customerPhone')}</p>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-gray-700">
                        <Phone className="w-3.5 h-3.5 flex-shrink-0 text-emerald-500" />
                        <span className="truncate">{booking.customerId?.phone || t('worker:contactViaChat')}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-0.5 sm:gap-1 sm:col-span-1 md:col-span-1">
                      <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('worker:location')}</p>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-gray-700">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-rose-500" />
                        <span className="truncate" title={booking.address}>{booking.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description Section */}
                  {booking.description && (
                    <div className="mb-4 sm:mb-6 bg-gray-50/50 rounded-lg sm:rounded-xl p-3 border border-gray-100/50">
                      <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 sm:mb-1.5 px-0.5">{t('worker:jobRequirement')}</p>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 sm:line-clamp-2 italic">&quot;{booking.description}&quot;</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:gap-3">
                    <Link
                      href={`/worker/bookings/${booking._id}`}
                      className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-900 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold hover:bg-black transition-all hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto flex-1 sm:min-w-[140px]"
                    >
                      {t('worker:viewDetails')}
                      <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Link>

                    {booking.conversationId && (
                      <Link
                        href={`/worker/chat?workerId=${booking.workerId._id || booking.workerId}`}
                        className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white border-2 border-green-600 text-green-700 rounded-lg sm:rounded-xl text-xs sm:text-sm font-black hover:bg-green-50 transition-all w-full sm:w-auto flex-1 sm:min-w-[140px]"
                      >
                        <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        {t('worker:chatNow')}
                      </Link>
                    )}

                    {updating === booking._id ? (
                      <div className="flex-1 flex justify-center py-2.5 sm:py-3 w-full sm:w-auto">
                        <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 animate-spin" />
                      </div>
                    ) : (
                      <>
                        {booking.status === 'pending' && (
                          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:min-w-[280px] flex-1">
                            <button
                              onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                              className="flex-1 w-full bg-emerald-600 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold hover:bg-emerald-700 transition-all hover:scale-[1.02]"
                            >
                              {t('worker:acceptJob')}
                            </button>
                            <button
                              onClick={() => confirm(t('worker:rejectJobConfirm')) && handleStatusUpdate(booking._id, 'cancelled')}
                              className="flex-1 w-full bg-rose-50 text-rose-600 border border-rose-100 px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold hover:bg-rose-100 transition-all"
                            >
                              {t('worker:decline')}
                            </button>
                          </div>
                        )}

                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => handleStatusUpdate(booking._id, 'in_progress')}
                            className="flex-1 w-full sm:w-auto bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
                          >
                            {t('worker:markInProgress')}
                          </button>
                        )}

                        {booking.status === 'in_progress' && (
                          <button
                            onClick={() => handleStatusUpdate(booking._id, 'completed')}
                            className="flex-1 w-full sm:w-auto bg-indigo-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5"
                          >
                            {t('worker:markFinished')}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
