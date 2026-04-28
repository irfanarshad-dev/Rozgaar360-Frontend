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
  Calendar,
  Clock,
  MapPin,
  MessageCircle,
  DollarSign,
  Shield,
  Info,
  ExternalLink,
  AlertCircle,
  Loader2,
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
      if (!authService.isAuthenticated()) {
        router.push('/login');
        return;
      }
      const user = authService.getUser();
      if (user?.role !== 'worker') {
        router.push('/');
        return;
      }

      try {
        const response = await api.get(`/api/bookings/${params.id}`);
        setBooking(response.data);
        try {
          const paymentRes = await api.get(`/api/payments/booking/${params.id}`);
          setPayment(paymentRes.data?.[0] || null);
        } catch (err) {
          console.log(t('worker:bookingDetails.noPaymentFoundLog'));
        }
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

  const formatCurrency = (value) =>
    new Intl.NumberFormat(i18n.language === 'ur' ? 'ur-PK' : 'en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value || 0);

  if (loading) {
    return (
      <DashboardLayout role="worker">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="font-medium text-gray-500">{t('worker:bookingDetails.fetchingJobDetails')}</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!booking) return null;

  const statusClass =
    booking.status === 'cancelled'
      ? 'bg-red-50 text-red-600 border-red-200'
      : booking.status === 'pending'
        ? 'bg-amber-50 text-amber-700 border-amber-200'
        : booking.status === 'completed'
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-blue-50 text-blue-700 border-blue-200';

  const paymentDateLabel = payment?.createdAt
    ? new Date(payment.createdAt).toLocaleDateString(i18n.language === 'ur' ? 'ur-PK' : 'en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const descriptionText = [booking.description, booking.issueDescription, booking.notes].find(
    (value) => typeof value === 'string' && value.trim().length > 0,
  ) || '';
  const hasDescription = descriptionText.trim().length > 0;

  return (
    <DashboardLayout role="worker">
      <div className="mx-auto w-full max-w-5xl px-3 py-4 sm:px-4 sm:py-5 lg:px-5">
        <div className="mb-4">
          <button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">
            ← {t('worker:bookingDetails.backToRequestList')}
          </button>
        </div>

        <div className="mb-3 rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">{t('worker:bookingDetails.title')}</h1>
                <span className="ml-2 font-mono text-xs text-gray-400">#{booking._id.slice(-6)}</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(booking.date).toLocaleDateString(i18n.language === 'ur' ? 'ur-PK' : 'en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                  <Clock className="h-3.5 w-3.5" />
                  {booking.time}
                </span>
                <span className="inline-flex max-w-[280px] items-center gap-1.5 rounded-md bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="truncate">{booking.address}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass}`}>
                {t(`worker:bookings.status.${booking.status}`, { defaultValue: booking.status })}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
                <Shield size={12} />
                {t('worker:bookingDetails.escrowProtected', { defaultValue: 'Escrow protected' })}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-3 rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                {booking.customerId?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{booking.customerId?.name}</h2>
                <span className="mt-1 inline-flex rounded-md bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                  {getSkillLabel(booking.service)}
                </span>
                <p className="mt-2 text-sm font-medium text-gray-600">{booking.customerId?.phone}</p>
              </div>
            </div>

            <div className="border-gray-200 pt-1 text-left sm:text-right md:ml-auto md:border-l md:pl-4 md:pt-0">
              <p className="text-xs uppercase text-gray-400">{t('worker:bookingDetails.jobScheduledFor')}</p>
              <p className="mt-1 text-base font-semibold text-gray-800">
                {new Date(booking.date).toLocaleDateString(i18n.language === 'ur' ? 'ur-PK' : 'en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <p className="mt-1 text-xs text-gray-500">{booking.time}</p>
            </div>
          </div>
        </div>

        <div className="mb-3 grid grid-cols-1 items-stretch gap-3 sm:gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-gray-400">{t('worker:bookingDetails.financialSummary')}</p>
              <DollarSign className="h-4 w-4 text-gray-400" />
            </div>

            {booking.estimatedCost ? (
              <div>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(booking.estimatedCost)}</p>
                <div className="mt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>{t('worker:bookingDetails.platformFee')}</span>
                    <span className="font-semibold">{formatCurrency(booking.platformFee || 0)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-gray-800">
                    <span>{t('worker:bookingDetails.totalCustomerCharge')}</span>
                    <span>{formatCurrency(booking.totalAmount || 0)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-3 text-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-base font-semibold text-gray-600">
                  {t('worker:bookingDetails.budgetNotSet', { defaultValue: 'Budget not set yet' })}
                </p>
                <p className="mt-1 text-xs font-medium text-gray-400">
                  {t('worker:bookingDetails.budgetNotSetHint', { defaultValue: 'The worker will set the amount after reviewing' })}
                </p>
                {booking.status !== 'cancelled' && (
                  <button onClick={() => setShowAmountModal(true)} className="mt-3 text-sm font-semibold text-blue-600 hover:underline">
                    {t('worker:bookingDetails.sendPriceOffer')}
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
            <p className="mb-4 text-xs uppercase tracking-wide text-gray-400">{t('worker:bookingDetails.paymentStatus')}</p>
            {payment ? (
              <div className="flex flex-1 flex-col justify-center">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  <p className="text-sm font-semibold text-green-700">{t('worker:bookingDetails.paymentReceived', { defaultValue: 'Payment Received' })}</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(payment.amount || booking.totalAmount || 0)}</p>
                {paymentDateLabel && <p className="mt-2 text-xs text-gray-400">{t('worker:bookingDetails.receivedOn', { defaultValue: 'Received on' })} {paymentDateLabel}</p>}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{t('worker:bookingDetails.paymentMethod', { defaultValue: 'Method' })}</span>
                    <span className="font-semibold">{payment.paymentMethod || 'Card'}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{t('worker:bookingDetails.transactionId', { defaultValue: 'Transaction ID' })}</span>
                    <span className="font-mono text-[10px]">{payment._id?.slice(-8) || 'N/A'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 items-center">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-gray-400" />
                  <p className="text-sm font-medium text-gray-400">{t('worker:bookingDetails.noTransactionsYet', { defaultValue: 'No transactions yet' })}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-3 grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
            <p className="mb-2 text-xs uppercase text-gray-400">{t('worker:jobDescription')}</p>
            <div className="min-h-[80px] rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
              {hasDescription ? (
                <p className="whitespace-pre-wrap break-words text-[15px] leading-6">{descriptionText}</p>
              ) : (
                <p className="text-sm italic text-gray-400">{t('worker:bookingDetails.noDescription', { defaultValue: 'No description provided' })}</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
            <p className="mb-2 text-xs uppercase text-gray-400">{t('worker:bookingDetails.meetingLocation')}</p>
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-3.5 w-3.5 text-red-500" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800">{booking.address}</p>
                <p className="mt-1 text-xs text-gray-400">{t('worker:bookingDetails.locationFallback')}</p>
              </div>
            </div>
            <div className="mt-3 text-right">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 underline"
              >
                {t('worker:bookingDetails.openInMaps')}
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 pt-1.5 sm:gap-3 sm:pt-2">
          {booking.conversationId && (
            <Link
              href={`/worker/chat?workerId=${booking.workerId._id || booking.workerId}`}
              className="relative inline-flex h-10 items-center gap-2 rounded-lg border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <MessageCircle className="h-4 w-4" />
              {t('worker:bookingDetails.chatWithCustomer', { defaultValue: 'Chat with customer' })}
              {chatUnread > 0 && (
                <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-2 text-[10px] font-semibold text-white">
                  {chatUnread > 9 ? '9+' : chatUnread}
                </span>
              )}
            </Link>
          )}

          {booking.status !== 'cancelled' && !updating && (
            <button
              onClick={() => handleStatusUpdate('completed')}
              className="h-10 rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700"
            >
              {t('worker:bookingDetails.markAsComplete', { defaultValue: 'Mark as Complete' })}
            </button>
          )}

          {updating ? (
            <div className="inline-flex items-center px-4">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              {booking.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleStatusUpdate('confirmed')}
                    className="h-10 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                  >
                    {t('worker:bookingDetails.acceptJob', { defaultValue: 'Accept Job' })}
                  </button>
                  <button
                    onClick={() => confirm(t('worker:rejectJobConfirm')) && handleStatusUpdate('cancelled')}
                    className="h-10 rounded-lg border border-red-200 px-5 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    {t('worker:bookingDetails.declineJob', { defaultValue: 'Decline Job' })}
                  </button>
                </>
              )}

              {booking.status === 'confirmed' && (
                <button
                  onClick={() => handleStatusUpdate('in_progress')}
                  className="h-10 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                  {t('worker:markInProgress')}
                </button>
              )}

              {booking.status === 'in_progress' && (
                <button
                  onClick={() => handleStatusUpdate('completed')}
                  className="h-10 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                  {t('worker:bookingDetails.completeAndAskReview')}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {showAmountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-[2rem] border border-slate-100 bg-white/95 p-8 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.8)] animate-scaleIn">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">{t('worker:bookingDetails.jobPricing')}</h3>
                <p className="mt-0.5 text-xs font-bold uppercase tracking-widest text-gray-400">{t('worker:bookingDetails.defineServiceRate')}</p>
              </div>
            </div>

            <p className="mb-6 text-sm font-medium text-gray-500">{t('worker:bookingDetails.pricingHint')}</p>

            <div className="relative mb-6">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-gray-300">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={t('worker:bookingDetails.amountPlaceholder')}
                className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 py-4 pl-10 pr-4 text-xl font-black text-slate-900 placeholder-slate-200 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            {amount && !isNaN(amount) && Number(amount) > 0 && (
              <div className="mb-8 space-y-3 rounded-2xl border border-blue-100/50 bg-gradient-to-br from-blue-50 to-indigo-50/30 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-500">{t('worker:bookingDetails.yourEarning')}</span>
                  <span className="text-lg font-black text-gray-900">{formatCurrency(Number(amount))}</span>
                </div>
                <div className="flex items-center justify-between text-xs opacity-60">
                  <span className="font-bold">{t('worker:bookingDetails.platformManagement')}</span>
                  <span className="font-black">{formatCurrency(Number(amount) * 0.15)}</span>
                </div>
                <div className="h-px w-full bg-blue-200/50" />
                <div className="group flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black uppercase tracking-widest text-blue-600">{t('worker:bookingDetails.totalPrice')}</span>
                    <Info className="h-3 w-3 animate-pulse text-blue-400" />
                  </div>
                  <span className="text-2xl font-black text-blue-600">{formatCurrency(Number(amount) * 1.15)}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAmountModal(false);
                  setAmount('');
                }}
                className="flex-1 rounded-2xl bg-slate-50 py-4 font-black text-slate-500 transition-all hover:bg-slate-100"
              >
                {t('common:cancel')}
              </button>
              <button
                onClick={handleSetAmount}
                disabled={!amount || isNaN(amount) || Number(amount) <= 0}
                className="flex-1 rounded-2xl bg-blue-600 py-4 font-black text-white shadow-xl shadow-blue-500/30 transition-all hover:-translate-y-1 hover:bg-blue-700 disabled:translate-y-0 disabled:opacity-50"
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
