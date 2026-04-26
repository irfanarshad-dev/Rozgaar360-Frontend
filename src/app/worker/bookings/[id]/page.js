'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import api from '@/lib/axios';
import { chatAPI } from '@/lib/chatAPI';
import Link from 'next/link';
import DashboardLayout from '@/app/components/ui/DashboardLayout';
import { useTranslation } from 'react-i18next';
import {
  Calendar, Clock, MapPin, Phone, User, CheckCircle,
  XCircle, Play, CheckCircle2, MessageCircle, DollarSign,
  Info, ArrowLeft, ExternalLink, ShieldCheck, CreditCard,
  ChevronRight, AlertCircle, Loader2
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
    <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black border ${config.bg} ${config.text} ${config.border} shadow-sm`}>
      <Icon className="w-4 h-4" />
      {config.label}
    </span>
  );
}

export default function WorkerBookingDetails() {
  const params = useParams();
  const router = useRouter();
  const { t, i18n } = useTranslation(['worker', 'common', 'home']);
  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAmountModal, setShowAmountModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [updating, setUpdating] = useState(false);
  const [chatUnread, setChatUnread] = useState(0);

  useEffect(() => {
    const initData = async () => {
      if (!authService.isAuthenticated()) { router.push('/login'); return; }
      const user = authService.getUser();
      if (user?.role !== 'worker') { router.push('/'); return; }

      try {
        const response = await api.get(`/api/bookings/${params.id}`);
        setBooking(response.data);
        try {
          const paymentRes = await api.get(`/api/payments/booking/${params.id}`);
          setPayment(paymentRes.data?.[0] || null);
        } catch (err) { console.log(t('worker:bookingDetails.noPaymentFoundLog')); }
      } catch (error) {
        console.error('Failed to fetch booking:', error);
        router.push('/worker/bookings');
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [params.id, router, t]);

  useEffect(() => {
    let cancelled = false;

    const loadUnreadCount = async () => {
      if (!booking?.conversationId) {
        setChatUnread(0);
        return;
      }

      const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
      const userId = currentUserId || authService.getUser()?._id;
      if (!userId) return;

      try {
        const response = await chatAPI.getConversations();
        const conv = (response.data || []).find((item) => String(item._id) === String(booking.conversationId));
        const unread = conv?.unreadCount?.[userId] || 0;
        if (!cancelled) setChatUnread(unread);
      } catch (err) {
        console.warn('[WorkerBookingDetails] Failed to load chat unread count:', err.message || err);
      }
    };

    loadUnreadCount();

    const handleConversationUpdated = (event) => {
      if (!event?.detail?.conversationId) return;
      if (String(event.detail.conversationId) !== String(booking?.conversationId)) return;
      loadUnreadCount();
    };

    window.addEventListener('chat:conversation-updated', handleConversationUpdated);
    return () => {
      cancelled = true;
      window.removeEventListener('chat:conversation-updated', handleConversationUpdated);
    };
  }, [booking?.conversationId]);

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      const response = await api.put(`/api/bookings/${params.id}/status`, { status: newStatus });
      setBooking(response.data);
    } catch (error) {
      alert(t('worker:updateBookingFailed'));
    } finally {
      setUpdating(false);
    }
  };

  const handleSetAmount = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert(t('worker:bookingDetails.validAmountRequired'));
      return;
    }
    setUpdating(true);
    try {
      await api.put(`/api/bookings/${params.id}`, { estimatedCost: Number(amount) });
      setBooking({ ...booking, estimatedCost: Number(amount) });
      setShowAmountModal(false);
      setAmount('');
    } catch (error) {
      alert(t('worker:bookingDetails.setAmountFailed'));
    } finally {
      setUpdating(false);
    }
  };

  const getSkillLabel = (skillName) => {
    const key = SKILL_TRANSLATION_KEYS[skillName];
    if (!key) return skillName;
    return t(`home:skills.${key}`, { defaultValue: skillName });
  };

  const formatCurrency = (value) => new Intl.NumberFormat(i18n.language === 'ur' ? 'ur-PK' : 'en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value || 0);

  if (loading) {
    return (
      <DashboardLayout role="worker">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-500 font-medium">{t('worker:bookingDetails.fetchingJobDetails')}</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!booking) return null;

  return (
    <DashboardLayout role="worker">
      <div className="relative">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 right-6 h-56 w-56 rounded-full bg-blue-200/40 blur-[90px]" />
          <div className="absolute top-1/3 -left-16 h-64 w-64 rounded-full bg-emerald-200/40 blur-[120px]" />
          <div className="absolute bottom-0 right-1/3 h-48 w-48 rounded-full bg-sky-200/30 blur-[100px]" />
        </div>
        <div className="relative max-w-6xl mx-auto pb-8 px-3 sm:px-4 lg:px-5">
        
        {/* Navigation & Header */}
        <div className="mb-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('worker:bookingDetails.backToRequestList')}
          </button>

          <div className="mt-3 rounded-[24px] border border-slate-100/80 bg-white/90 backdrop-blur-xl p-4 sm:p-5 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.45)]">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {t('worker:bookingDetails.title')}
                  </h1>
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300">#{booking._id.slice(-6)}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-600">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    {new Date(booking.date).toLocaleDateString(i18n.language === 'ur' ? 'ur-PK' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {booking.time}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 max-w-[220px]">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span className="truncate" title={booking.address}>{booking.address}</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <StatusBadge status={booking.status} t={t} />
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1.5 text-[10px] font-black">
                  <ShieldCheck className="w-4 h-4" />
                  {t('worker:bookingDetails.escrowProtectedService')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          
          {/* Main Info Card */}
          <div className="bg-white/90 rounded-[28px] border border-slate-100/80 shadow-[0_20px_60px_-48px_rgba(15,23,42,0.45)] overflow-hidden backdrop-blur">
            <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-white to-indigo-50/50 border-b border-slate-100/70">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex gap-5">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-[0_16px_26px_-18px_rgba(37,99,235,0.9)] ring-6 ring-blue-50">
                    {booking.customerId?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 leading-tight mb-1">{booking.customerId?.name}</h2>
                    <p className="text-blue-700 font-black bg-blue-50 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-[0.25em] inline-block">
                      {getSkillLabel(booking.service)}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <a href={`tel:${booking.customerId?.phone}`} className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 hover:underline">
                        <Phone className="w-4 h-4" />
                        {booking.customerId?.phone}
                      </a>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:items-end gap-2 text-sm">
                  <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[9px]">{t('worker:bookingDetails.jobScheduledFor')}</p>
                  <div className="flex items-center gap-2 font-black text-slate-800 text-base">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    {new Date(booking.date).toLocaleDateString(i18n.language === 'ur' ? 'ur-PK' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {booking.time}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-5">
              {/* Cost & Payment Section */}
              <div className="grid lg:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-600 rounded-3xl p-4 text-white shadow-[0_18px_40px_-30px_rgba(37,99,235,0.9)]">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-blue-100 font-black text-[9px] uppercase tracking-[0.3em]">{t('worker:bookingDetails.financialSummary')}</p>
                    <DollarSign className="w-5 h-5 text-blue-100" />
                  </div>
                  {booking.estimatedCost ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-blue-400/50">
                        <span className="text-blue-100 text-xs">{t('worker:bookingDetails.serviceRate')}</span>
                        <span className="text-lg font-bold">{formatCurrency(booking.estimatedCost)}</span>
                      </div>
                      <div className="flex justify-between items-center opacity-80">
                        <span className="text-xs">{t('worker:bookingDetails.platformFee')}</span>
                        <span className="text-sm font-bold">{formatCurrency(booking.platformFee || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-sm font-bold">{t('worker:bookingDetails.totalCustomerCharge')}</span>
                        <span className="text-xl font-black">{formatCurrency(booking.totalAmount || 0)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-3 gap-3 text-center">
                      <p className="text-xs text-blue-100 font-semibold">{t('worker:bookingDetails.budgetNotSet')}</p>
                      {booking.status !== 'cancelled' && (
                        <button
                          onClick={() => setShowAmountModal(true)}
                          className="bg-white text-blue-700 px-6 py-2 rounded-xl text-sm font-black shadow-lg hover:scale-105 transition-transform"
                        >
                          {t('worker:bookingDetails.sendPriceOffer')}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-[0_18px_40px_-40px_rgba(15,23,42,0.4)]">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-slate-400 font-black text-[9px] uppercase tracking-[0.3em]">{t('worker:bookingDetails.paymentStatus')}</p>
                    <CreditCard className="w-5 h-5 text-slate-300" />
                  </div>
                  {payment ? (
                    <div className="flex flex-col h-full justify-center gap-2">
                      <div className={`text-center py-2 px-4 rounded-xl text-sm font-black capitalize ${
                        payment.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {t('worker:bookingDetails.paymentViaStripe', { status: payment.status })}
                      </div>
                      <p className="text-[9px] text-center text-slate-400 font-black uppercase tracking-[0.25em] mt-2 px-6">{t('worker:bookingDetails.transactionId')}: {payment.stripePaymentIntentId?.slice(0, 15)}...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-4 gap-2 opacity-50">
                      <AlertCircle className="w-8 h-8 text-slate-300" />
                      <p className="text-xs font-bold text-slate-500">{t('worker:bookingDetails.noPaymentTransaction')}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Requirements & Location */}
              <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-500" />
                    <h3 className="text-base font-black text-slate-900 tracking-tight">{t('worker:jobDescription')}</h3>
                  </div>
                  <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-[0_14px_30px_-34px_rgba(15,23,42,0.5)]">
                    <p className="text-slate-700 leading-relaxed italic text-sm">
                      &quot;{booking.description || t('worker:bookingDetails.noAdditionalDetails')}&quot;
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                   <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    <h3 className="text-base font-black text-slate-900 tracking-tight">{t('worker:bookingDetails.meetingLocation')}</h3>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-50/70 via-white to-white rounded-3xl p-4 border border-indigo-100/60 flex flex-col gap-4 group shadow-[0_16px_38px_-40px_rgba(79,70,229,0.6)]">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-md">
                        <MapPin className="w-5 h-5 text-rose-500" />
                      </div>
                      <div>
                        <p className="text-slate-900 font-black text-sm">{booking.address}</p>
                        <p className="text-indigo-600 text-xs font-bold mt-1">{t('worker:bookingDetails.locationFallback')}</p>
                      </div>
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 bg-white px-4 py-2.5 rounded-2xl text-xs font-black text-slate-900 shadow-sm border border-slate-100 hover:shadow-lg transition-all group-hover:border-indigo-200"
                    >
                        {t('worker:bookingDetails.openInMaps')}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Sticky-like Action Bar */}
            <div className="p-4 sm:p-6 bg-slate-50/80 border-t border-slate-100/70 flex flex-wrap items-center gap-3 backdrop-blur">
              {booking.conversationId && (
                <Link
                  href={`/worker/chat?workerId=${booking.workerId._id || booking.workerId}`}
                  className="relative flex-1 min-w-[180px] inline-flex items-center justify-center gap-2 bg-white border-2 border-emerald-500 text-emerald-700 px-6 py-3 rounded-2xl text-sm font-black hover:bg-emerald-50 transition-all shadow-md active:scale-95"
                >
                  <MessageCircle className="w-5 h-5 animate-pulse" />
                  {t('worker:chatNow')}
                  {chatUnread > 0 && (
                    <span className="absolute top-2 right-3 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-600 px-2 text-[10px] font-black text-white shadow-sm">
                      {chatUnread > 9 ? '9+' : chatUnread}
                    </span>
                  )}
                </Link>
              )}

              {updating ? (
                <div className="flex-1 flex justify-center">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              ) : (
                <div className="flex flex-wrap gap-4 flex-1">
                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate('confirmed')}
                        className="flex-1 min-w-[140px] bg-emerald-600 text-white px-6 py-3 rounded-2xl text-sm font-black hover:bg-emerald-700 shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
                      >
                        {t('worker:acceptRequest')}
                      </button>
                      <button
                        onClick={() => confirm(t('worker:rejectJobConfirm')) && handleStatusUpdate('cancelled')}
                        className="flex-1 min-w-[140px] bg-white text-rose-600 border-2 border-rose-100 px-6 py-3 rounded-2xl text-sm font-black hover:bg-rose-50 transition-all"
                      >
                        {t('worker:decline')}
                      </button>
                    </>
                  )}

                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusUpdate('in_progress')}
                      className="flex-1 min-w-[180px] bg-blue-600 text-white px-6 py-3 rounded-2xl text-sm font-black hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all active:scale-95"
                    >
                      {t('worker:markInProgress')}
                    </button>
                  )}

                  {booking.status === 'in_progress' && (
                    <button
                      onClick={() => handleStatusUpdate('completed')}
                      className="flex-1 min-w-[180px] bg-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-black hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
                    >
                      {t('worker:bookingDetails.completeAndAskReview')}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Modern Amount Modal */}
      {showAmountModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white/95 rounded-[2rem] shadow-[0_30px_80px_-45px_rgba(15,23,42,0.8)] max-w-md w-full p-8 border border-slate-100 animate-scaleIn">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">{t('worker:bookingDetails.jobPricing')}</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">{t('worker:bookingDetails.defineServiceRate')}</p>
              </div>
            </div>

            <p className="text-gray-500 text-sm mb-6 font-medium">{t('worker:bookingDetails.pricingHint')}</p>
            
            <div className="mb-6 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-gray-300">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={t('worker:bookingDetails.amountPlaceholder')}
                className="w-full pl-10 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xl font-black text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all placeholder-slate-200"
              />
            </div>

            {amount && !isNaN(amount) && Number(amount) > 0 && (
              <div className="mb-8 p-5 bg-gradient-to-br from-blue-50 to-indigo-50/30 rounded-2xl border border-blue-100/50 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-500">{t('worker:bookingDetails.yourEarning')}</span>
                  <span className="text-lg font-black text-gray-900">{formatCurrency(Number(amount))}</span>
                </div>
                <div className="flex justify-between items-center text-xs opacity-60">
                   <span className="font-bold">{t('worker:bookingDetails.platformManagement')}</span>
                   <span className="font-black">{formatCurrency(Number(amount) * 0.15)}</span>
                </div>
                <div className="h-px bg-blue-200/50 w-full" />
                <div className="flex justify-between items-center pt-1 group">
                   <div className="flex items-center gap-1.5">
                     <span className="text-xs font-black text-blue-600 uppercase tracking-widest">{t('worker:bookingDetails.totalPrice')}</span>
                     <Info className="w-3 h-3 text-blue-400 animate-pulse" />
                   </div>
                   <span className="text-2xl font-black text-blue-600">{formatCurrency(Number(amount) * 1.15)}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setShowAmountModal(false); setAmount(''); }}
                className="flex-1 bg-slate-50 text-slate-500 py-4 rounded-2xl font-black hover:bg-slate-100 transition-all"
              >
                {t('common:cancel')}
              </button>
              <button
                onClick={handleSetAmount}
                disabled={!amount || isNaN(amount) || Number(amount) <= 0}
                className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0"
              >
                {t('worker:bookingDetails.postOffer')}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
