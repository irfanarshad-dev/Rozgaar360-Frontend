'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { authService } from '@/lib/auth';
import api from '@/lib/axios';
import { chatAPI } from '@/lib/chatAPI';
import Link from 'next/link';
import DashboardLayout from '@/app/components/ui/DashboardLayout';
import Badge from '@/app/components/ui/Badge';
import { AlertTriangle, CreditCard, MapPin, MessageCircle } from 'lucide-react';

export default function BookingDetails() {
  const params = useParams();
  const router = useRouter();
  const { t, i18n } = useTranslation(['customer']);
  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatUnread, setChatUnread] = useState(0);

  useEffect(() => {
    const init = async () => {
      await new Promise(r => setTimeout(r, 100));
      if (!authService.isAuthenticated()) {
        router.push('/login');
        return;
      }

      try {
        console.log('Fetching booking:', params.id);
        const response = await api.get(`/api/bookings/${params.id}`);
        console.log('Booking response:', response.data);
        setBooking(response.data);
        
        // Fetch payment details
        try {
          const paymentRes = await api.get(`/api/payments/booking/${params.id}`);
          setPayment(paymentRes.data?.[0] || null);
        } catch (err) {
          console.log('No payment found');
        }
      } catch (error) {
        console.error('Failed to fetch booking:', error);
        console.error('Error response:', error.response?.data);
        alert(t('customer:bookingDetails.errors.notFoundOrDenied'));
        router.push('/customer/bookings');
      } finally {
        setLoading(false);
      }
    };
    init();
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
        console.warn('[CustomerBookingDetails] Failed to load chat unread count:', err.message || err);
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

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed':
      case 'in_progress':
        return 'success';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'neutral';
    }
  };

  const bookingDateLabel = booking
    ? new Date(booking.date).toLocaleDateString(i18n.language === 'ur' ? 'ur-PK' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  const bookingTimeLabel = booking
    ? new Date(`2000-01-01T${booking.time}`).toLocaleTimeString(i18n.language === 'ur' ? 'ur-PK' : 'en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    : '';

  const timelineEvents = booking ? [
    {
      key: 'booked',
      label: t('customer:bookingDetails.timeline.bookedOn'),
      value: new Date(booking.createdAt).toLocaleString(i18n.language === 'ur' ? 'ur-PK' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }),
      tone: 'bg-green-500',
    },
    ...(booking.completedAt ? [{
      key: 'completed',
      label: t('customer:bookingDetails.timeline.completedOn'),
      value: new Date(booking.completedAt).toLocaleString(i18n.language === 'ur' ? 'ur-PK' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }),
      tone: 'bg-green-500',
    }] : []),
    ...(booking.cancelledAt ? [{
      key: 'cancelled',
      label: t('customer:bookingDetails.timeline.cancelledOn'),
      value: new Date(booking.cancelledAt).toLocaleString(i18n.language === 'ur' ? 'ur-PK' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }),
      tone: 'bg-red-500',
    }] : []),
  ] : [];

  const paymentBadgeVariant = payment
    ? payment.status === 'completed'
      ? 'success'
      : payment.status === 'failed'
        ? 'error'
        : payment.status === 'processing'
          ? 'info'
          : 'warning'
    : 'warning';

  if (loading) {
    return (
      <DashboardLayout role="customer">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-lg sm:text-xl font-semibold text-gray-500">{t('customer:bookingDetails.loading')}</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <DashboardLayout role="customer" contentClassName="pt-0 px-3 pb-3 sm:pt-0 sm:px-4 sm:pb-4 lg:pt-0 lg:px-5 lg:pb-5">
      <div className="mx-auto max-w-6xl px-3 pb-8 sm:px-6 lg:px-8">
        <div className="sticky top-0 z-10 -mx-3 mb-5 border-b border-gray-100 bg-white px-3 py-3 sm:-mx-6 sm:px-6 sm:py-4 lg:-mx-8 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
            <div>
              <h1 className="text-lg font-medium text-gray-900 sm:text-xl">{t('customer:bookingDetails.title')}</h1>
              <p className="mt-1 font-mono text-xs text-gray-400">{t('customer:bookingDetails.bookingId', { id: booking._id })}</p>
            </div>

            <div className="flex flex-col items-start gap-2 sm:items-end">
              <Badge variant={getStatusColor(booking.status)} className="rounded-full px-3 py-1 text-xs font-medium capitalize">
                {t(`customer:bookings.status.${booking.status}`)}
              </Badge>
              <button
                onClick={() => router.push('/customer/bookings')}
                className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
              >
                ← {t('customer:bookingDetails.backToBookings')}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.78fr)] lg:gap-6">
          <div className="rounded-xl border border-gray-200 bg-white p-4 pb-4 shadow-sm sm:p-5">
            <div className="space-y-4 sm:space-y-6">
              <section>
                <h2 className="mb-3 text-xs uppercase tracking-wide text-gray-400">{t('customer:bookingDetails.sections.workerInfo')}</h2>
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
                    {booking.workerId?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-gray-900">{booking.workerId?.name}</h3>
                    <p className="text-xs text-blue-600">{booking.service}</p>
                    <p className="text-xs text-gray-400">{booking.workerId?.phone}</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="mb-3 text-xs uppercase tracking-wide text-gray-400">{t('customer:bookingDetails.sections.serviceDetails')}</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-[10px] uppercase tracking-wide text-gray-400">{t('customer:bookingDetails.labels.serviceType')}</p>
                    <p className="mt-1 text-sm font-medium text-gray-800">{booking.service}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-[10px] uppercase tracking-wide text-gray-400">{t('customer:bookingDetails.labels.date')}</p>
                    <p className="mt-1 text-sm font-medium text-gray-800">{bookingDateLabel}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-[10px] uppercase tracking-wide text-gray-400">{t('customer:bookingDetails.labels.time')}</p>
                    <p className="mt-1 text-sm font-medium text-gray-800">{bookingTimeLabel}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-[10px] uppercase tracking-wide text-gray-400">{t('customer:bookingDetails.labels.status')}</p>
                    <p className={`mt-1 text-sm font-medium capitalize ${booking.status === 'cancelled' ? 'text-red-600' : booking.status === 'completed' ? 'text-green-600' : 'text-gray-800'}`}>
                      {t(`customer:bookings.status.${booking.status}`)}
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="mb-3 text-xs uppercase tracking-wide text-gray-400">{t('customer:bookingDetails.sections.serviceLocation')}</h2>
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
                    <p className="text-sm text-gray-700">{booking.address}</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="mb-3 text-xs uppercase tracking-wide text-gray-400">{t('customer:bookingDetails.sections.issueDescription')}</h2>
                <textarea
                  rows={3}
                  placeholder="Describe your issue..."
                  value={booking.description || ''}
                  readOnly
                  className="min-h-[96px] w-full resize-none rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                />
              </section>
            </div>
          </div>

          <div className="flex h-full flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 lg:sticky lg:top-6 lg:self-start lg:gap-4">
            <section>
              <h2 className="mb-3 text-xs uppercase tracking-wide text-gray-400">{t('customer:bookingDetails.sections.paymentInfo')}</h2>
              {payment ? (
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="mb-4 flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900">{t('customer:bookingDetails.labels.stripe')}</p>
                      <Badge variant={paymentBadgeVariant} className="mt-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize">
                        {t(`customer:bookings.payment.status.${payment.status}`)}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="rounded-lg bg-white p-3">
                      <p className="text-[10px] uppercase tracking-wide text-gray-400">{t('customer:bookingDetails.labels.serviceCost')}</p>
                      <p className="mt-1 text-sm font-medium text-gray-800">${booking.estimatedCost?.toFixed(2)}</p>
                    </div>
                    <div className="rounded-lg bg-white p-3">
                      <p className="text-[10px] uppercase tracking-wide text-gray-400">{t('customer:bookingDetails.labels.platformFee')}</p>
                      <p className="mt-1 text-sm font-medium text-gray-800">${booking.platformFee?.toFixed(2)}</p>
                    </div>
                    <div className="rounded-lg bg-white p-3">
                      <p className="text-[10px] uppercase tracking-wide text-gray-400">{t('customer:bookingDetails.labels.totalPaid')}</p>
                      <p className="mt-1 text-sm font-medium text-green-600">${(payment.amount || booking.totalAmount)?.toFixed(2)}</p>
                    </div>
                    {payment.transactionId && (
                      <div className="rounded-lg bg-white p-3">
                        <p className="text-[10px] uppercase tracking-wide text-gray-400">{t('customer:bookingDetails.labels.transactionId')}</p>
                        <p className="mt-1 break-all text-sm font-medium text-gray-800">{payment.transactionId}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : booking.totalAmount > 0 ? (
                <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-amber-800">{t('customer:bookingDetails.waitingForWorker.title')}</p>
                      <p className="mt-1 text-xs text-amber-600">{t('customer:bookingDetails.waitingForWorker.message')}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3">
                    <div className="rounded-lg bg-white p-3">
                      <p className="text-[10px] uppercase tracking-wide text-gray-400">{t('customer:bookingDetails.labels.serviceCost')}</p>
                      <p className="mt-1 text-sm font-medium text-gray-800">${booking.estimatedCost?.toFixed(2)}</p>
                    </div>
                    <div className="rounded-lg bg-white p-3">
                      <p className="text-[10px] uppercase tracking-wide text-gray-400">{t('customer:bookingDetails.labels.platformFee')}</p>
                      <p className="mt-1 text-sm font-medium text-gray-800">${booking.platformFee?.toFixed(2)}</p>
                    </div>
                    <div className="rounded-lg bg-white p-3">
                      <p className="text-[10px] uppercase tracking-wide text-gray-400">{t('customer:bookingDetails.labels.totalAmount')}</p>
                      <p className="mt-1 text-sm font-medium text-amber-700">${booking.totalAmount?.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-amber-800">{t('customer:bookingDetails.waitingForWorker.title')}</p>
                      <p className="mt-1 text-xs text-amber-600">{t('customer:bookingDetails.waitingForWorker.message')}</p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section>
              <h2 className="mb-3 text-xs uppercase tracking-wide text-gray-400">{t('customer:bookingDetails.sections.timeline')}</h2>
              <div className="space-y-3">
                {timelineEvents.map((event, index) => (
                  <div key={event.key} className="relative pl-6">
                    <span className={`absolute left-0 top-1.5 h-3 w-3 rounded-full ${event.tone}`} />
                    {index !== timelineEvents.length - 1 && (
                      <span className="absolute left-[5px] top-4 h-full w-px bg-gray-200" />
                    )}
                    <p className="text-xs text-gray-500">{event.label}</p>
                    <p className="mt-0.5 text-xs font-medium text-gray-700">{event.value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-auto pt-0">
              <h2 className="mb-3 text-xs uppercase tracking-wide text-gray-400">{t('customer:bookingDetails.sections.quickActions')}</h2>
              <div className="space-y-2">
                {booking.conversationId && (
                  <Link
                    href={`/customer/chat?workerId=${booking.workerId?._id || booking.workerId}`}
                    className="relative inline-flex w-full items-center justify-start rounded-lg border border-blue-200 px-4 py-2 text-sm text-blue-600 transition hover:bg-blue-50"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    {t('customer:bookingDetails.actions.chatWithWorker')}
                    {chatUnread > 0 && (
                      <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full border border-blue-200 bg-white px-2 text-[10px] font-medium text-blue-600 shadow-sm">
                        {chatUnread > 9 ? '9+' : chatUnread}
                      </span>
                    )}
                  </Link>
                )}
                {!payment && booking.totalAmount > 0 && booking.status !== 'cancelled' && (
                  <Link
                    href={`/payment?bookingId=${booking._id}`}
                    className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700"
                  >
                    {t('customer:bookingDetails.actions.payNowAmount', { amount: booking.totalAmount.toFixed(2) })}
                  </Link>
                )}
                {booking.status === 'completed' && (
                  <Link
                    href={`/customer/reviews/new/${booking._id}`}
                    className="inline-flex w-full items-center justify-center rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                  >
                    {t('customer:bookingDetails.actions.leaveReview')}
                  </Link>
                )}
                {booking.status === 'pending' && (
                  <div>
                    <button
                      onClick={async () => {
                        if (confirm(t('customer:bookingDetails.actions.cancelConfirm'))) {
                          try {
                            await api.put(`/api/bookings/${booking._id}/status`, {
                              status: 'cancelled',
                              cancellationReason: 'Cancelled by customer'
                            });
                            router.push('/customer/bookings');
                          } catch (error) {
                            alert(t('customer:bookingDetails.errors.cancelFailed'));
                          }
                        }
                      }}
                      className="inline-flex w-full items-center justify-center rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 transition hover:bg-red-50"
                    >
                      {t('customer:bookingDetails.actions.cancelBooking')}
                    </button>
                    <p className="mt-1 text-center text-xs text-gray-400">This action cannot be undone</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
