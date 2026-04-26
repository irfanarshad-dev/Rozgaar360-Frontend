'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { authService } from '@/lib/auth';
import api from '@/lib/axios';
import { chatAPI } from '@/lib/chatAPI';
import Link from 'next/link';
import DashboardLayout from '@/app/components/ui/DashboardLayout';

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
  }, [params.id, router]);

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
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'completed': return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

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
      <div className="max-w-5xl mx-auto mt-[5px] pb-2 sm:pb-3">
        <div className="bg-white rounded-none shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-sky-100 to-blue-200 p-3 sm:p-4 text-slate-900">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-black mb-1">{t('customer:bookingDetails.title')}</h1>
                <p className="text-blue-700 text-xs sm:text-sm truncate">{t('customer:bookingDetails.bookingId', { id: booking._id })}</p>
              </div>
              <div className="self-start flex items-center gap-2">
                <span className={`px-2.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold capitalize border ${getStatusColor(booking.status)}`}>
                  {t(`customer:bookings.status.${booking.status}`)}
                </span>
                <button
                  onClick={() => router.push('/customer/bookings')}
                  className="inline-flex items-center gap-1.5 rounded-full border border-blue-300 bg-white/85 hover:bg-white px-2.5 py-1.5 text-[11px] sm:text-xs font-bold text-blue-700 transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>{t('customer:bookingDetails.backToBookings')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.82fr)] gap-3">
            <div className="space-y-3">
              {/* Worker Info */}
              <div className="border border-gray-100 rounded-xl p-3 sm:p-3.5">
                <h2 className="text-[11px] sm:text-xs font-black text-gray-800 mb-2.5 uppercase tracking-wider">{t('customer:bookingDetails.sections.workerInfo')}</h2>
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-sm font-black shrink-0">
                    {booking.workerId?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-black text-gray-900 truncate">{booking.workerId?.name}</h3>
                    <p className="text-blue-600 font-semibold text-xs sm:text-sm truncate">{booking.service}</p>
                    <p className="text-gray-500 text-[11px] sm:text-xs truncate">{booking.workerId?.phone}</p>
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div className="border border-gray-100 rounded-xl p-3 sm:p-3.5">
                <h2 className="text-[11px] sm:text-xs font-black text-gray-800 mb-2.5 uppercase tracking-wider">{t('customer:bookingDetails.sections.serviceDetails')}</h2>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 p-2.5 rounded-lg min-w-0">
                    <p className="text-[9px] text-gray-500 mb-1 font-bold uppercase tracking-wide">{t('customer:bookingDetails.labels.serviceType')}</p>
                    <p className="font-bold text-gray-800 text-xs sm:text-sm truncate">{booking.service}</p>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-lg min-w-0">
                    <p className="text-[9px] text-gray-500 mb-1 font-bold uppercase tracking-wide">{t('customer:bookingDetails.labels.date')}</p>
                    <p className="font-bold text-gray-800 text-xs sm:text-sm truncate">{new Date(booking.date).toLocaleDateString(i18n.language === 'ur' ? 'ur-PK' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-lg min-w-0">
                    <p className="text-[9px] text-gray-500 mb-1 font-bold uppercase tracking-wide">{t('customer:bookingDetails.labels.time')}</p>
                    <p className="font-bold text-gray-800 text-xs sm:text-sm truncate">
                      {new Date(`2000-01-01T${booking.time}`).toLocaleTimeString(i18n.language === 'ur' ? 'ur-PK' : 'en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-lg min-w-0">
                    <p className="text-[9px] text-gray-500 mb-1 font-bold uppercase tracking-wide">{t('customer:bookingDetails.labels.status')}</p>
                    <p className="font-bold text-gray-800 text-xs sm:text-sm capitalize truncate">{t(`customer:bookings.status.${booking.status}`)}</p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="border border-gray-100 rounded-xl p-3 sm:p-3.5">
                <h2 className="text-[11px] sm:text-xs font-black text-gray-800 mb-2.5 uppercase tracking-wider">{t('customer:bookingDetails.sections.serviceLocation')}</h2>
                <div className="bg-gray-50 p-2.5 rounded-lg">
                <div className="flex items-start gap-2.5">
                  <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-blue-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-gray-800 text-xs sm:text-sm leading-relaxed">{booking.address}</p>
                </div>
              </div>
              </div>
            </div>

            <div className="space-y-3 lg:sticky lg:top-20 lg:self-start">
              {/* Payment Details */}
              <div className="border border-gray-100 rounded-xl p-3 sm:p-3.5">
                <h2 className="text-[11px] sm:text-xs font-black text-gray-800 mb-2.5 uppercase tracking-wider">{t('customer:bookingDetails.sections.paymentInfo')}</h2>
                {payment ? (
                  <div className="bg-green-50 border border-green-200 p-2.5 rounded-lg">
                    <div className="space-y-1.5 mb-2.5">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">{t('customer:bookingDetails.labels.serviceCost')}:</span>
                        <span className="font-semibold">${booking.estimatedCost?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">{t('customer:bookingDetails.labels.platformFee')}:</span>
                        <span className="font-semibold">${booking.platformFee?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-sm border-t border-green-300 pt-2">
                        <span className="text-gray-900">{t('customer:bookingDetails.labels.totalPaid')}:</span>
                        <span className="text-green-600">${(payment.amount || booking.totalAmount)?.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2 pt-2 border-t border-green-200">
                      <div>
                        <p className="text-[9px] text-gray-500 mb-0.5">{t('customer:bookingDetails.labels.paymentMethod')}</p>
                        <p className="font-semibold text-gray-800 text-xs sm:text-sm uppercase">{t('customer:bookingDetails.labels.stripe')}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-gray-500 mb-0.5">{t('customer:bookingDetails.labels.status')}</p>
                        <p className={`font-semibold text-sm capitalize ${
                          payment.status === 'completed' ? 'text-green-600' :
                          payment.status === 'failed' ? 'text-red-600' :
                          payment.status === 'processing' ? 'text-blue-600' :
                          'text-yellow-600'
                        }`}>{t(`customer:bookings.payment.status.${payment.status}`)}</p>
                      </div>
                      {payment.transactionId && (
                        <div>
                          <p className="text-[9px] text-gray-500 mb-0.5">{t('customer:bookingDetails.labels.transactionId')}</p>
                          <p className="font-semibold text-[11px] sm:text-sm text-gray-800 break-all">{payment.transactionId}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : booking.totalAmount > 0 ? (
                  <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-lg">
                    <div className="space-y-1.5 mb-2.5">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">{t('customer:bookingDetails.labels.serviceCost')}:</span>
                        <span className="font-semibold">${booking.estimatedCost?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">{t('customer:bookingDetails.labels.platformFee')}:</span>
                        <span className="font-semibold">${booking.platformFee?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-sm border-t border-blue-300 pt-2">
                        <span className="text-gray-900">{t('customer:bookingDetails.labels.totalAmount')}:</span>
                        <span className="text-blue-600">${booking.totalAmount?.toFixed(2)}</span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-blue-700">{t('customer:bookingDetails.readyForStripe')}</p>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 p-2.5 rounded-lg flex items-center gap-2.5">
                    <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-yellow-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-yellow-800 text-xs sm:text-sm">{t('customer:bookingDetails.waitingForWorker.title')}</p>
                      <p className="text-[11px] sm:text-sm text-yellow-700">{t('customer:bookingDetails.waitingForWorker.message')}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Timestamps */}
              <div className="border border-gray-100 rounded-xl p-3 sm:p-3.5">
                <h2 className="text-[11px] sm:text-xs font-black text-gray-800 mb-2.5 uppercase tracking-wider">{t('customer:bookingDetails.sections.timeline')}</h2>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px] sm:text-sm">
                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-500">{t('customer:bookingDetails.timeline.bookedOn')}:</span>
                    <span className="font-semibold text-gray-800">{new Date(booking.createdAt).toLocaleString(i18n.language === 'ur' ? 'ur-PK' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                  </div>
                  {booking.completedAt && (
                    <div className="flex items-center gap-2 text-[11px] sm:text-sm">
                      <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-500">{t('customer:bookingDetails.timeline.completedOn')}:</span>
                      <span className="font-semibold text-gray-800">{new Date(booking.completedAt).toLocaleString(i18n.language === 'ur' ? 'ur-PK' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                    </div>
                  )}
                  {booking.cancelledAt && (
                    <div className="flex items-center gap-2 text-[11px] sm:text-sm">
                      <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-500">{t('customer:bookingDetails.timeline.cancelledOn')}:</span>
                      <span className="font-semibold text-gray-800">{new Date(booking.cancelledAt).toLocaleString(i18n.language === 'ur' ? 'ur-PK' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="px-2.5 sm:px-3 pb-2 sm:pb-2.5 grid grid-cols-1 xl:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.65fr)] gap-2.5">
            <div className="border border-gray-100 rounded-xl p-2.5 sm:p-3">
              <h2 className="text-[11px] sm:text-xs font-black text-gray-800 mb-2.5 uppercase tracking-wider">{t('customer:bookingDetails.sections.issueDescription')}</h2>
              <div className="bg-gray-50 p-2 rounded-lg">
                <p className="text-gray-700 leading-relaxed text-xs sm:text-sm">{booking.description}</p>
              </div>
            </div>

            <div className="border border-gray-100 rounded-xl p-2.5 sm:p-3">
              <h2 className="text-[11px] sm:text-xs font-black text-gray-800 mb-2 uppercase tracking-wider">{t('customer:bookingDetails.sections.quickActions')}</h2>
              <div className="grid grid-cols-1 gap-2.5">
                {booking.conversationId && (
                  <Link
                    href={`/customer/chat?workerId=${booking.workerId?._id || booking.workerId}`}
                    className="relative bg-green-600 text-white py-2.5 px-4 rounded-xl hover:bg-green-700 text-sm font-bold text-center transition shadow-sm"
                  >
                    {t('customer:bookingDetails.actions.chatWithWorker')}
                    {chatUnread > 0 && (
                      <span className="absolute -top-2 -right-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white text-[10px] font-black text-green-700 border border-green-200 px-2 shadow-sm">
                        {chatUnread > 9 ? '9+' : chatUnread}
                      </span>
                    )}
                  </Link>
                )}
                {!payment && booking.totalAmount > 0 && booking.status !== 'cancelled' && (
                  <Link
                    href={`/payment?bookingId=${booking._id}`}
                    className="bg-emerald-600 text-white py-2.5 px-4 rounded-xl hover:bg-emerald-700 text-sm font-bold text-center transition shadow-sm"
                  >
                    {t('customer:bookingDetails.actions.payNowAmount', { amount: booking.totalAmount.toFixed(2) })}
                  </Link>
                )}
                {booking.status === 'completed' && (
                  <Link
                    href={`/customer/reviews/new/${booking._id}`}
                    className="bg-amber-600 text-white py-2.5 px-4 rounded-xl hover:bg-amber-700 text-sm font-bold text-center transition shadow-sm"
                  >
                    {t('customer:bookingDetails.actions.leaveReview')}
                  </Link>
                )}
                {booking.status === 'pending' && (
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
                    className="bg-red-600 text-white py-2.5 px-4 rounded-xl hover:bg-red-700 text-sm font-bold text-center transition shadow-sm"
                  >
                    {t('customer:bookingDetails.actions.cancelBooking')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
