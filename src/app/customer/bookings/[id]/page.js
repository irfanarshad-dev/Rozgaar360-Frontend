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
import { 
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaComments,
  FaCreditCard,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimes,
  FaStar,
  FaShieldAlt,
  FaTrophy,
  FaBell,
  FaPhone,
  FaEnvelope
} from 'react-icons/fa';

export default function BookingDetails() {
  const params = useParams();
  const router = useRouter();
  const { t, i18n } = useTranslation(['customer', 'common']);
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
        const response = await api.get(`/api/bookings/${params.id}`);
        setBooking(response.data);
        
        try {
          const paymentRes = await api.get(`/api/payments/booking/${params.id}`);
          setPayment(paymentRes.data?.[0] || null);
        } catch (err) {
          console.log('No payment found');
        }
      } catch (error) {
        console.error('Failed to fetch booking:', error);
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
    <DashboardLayout role="customer">
      <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        {/* Modern Header */}
        <div className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/customer/bookings')}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                    <FaArrowLeft className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">{t('customer:bookingDetails.backToBookings')}</span>
                  <span className="text-sm font-medium sm:hidden">{t('common:back')}</span>
                </button>
                <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-gray-900">{t('customer:bookingDetails.title')}</h1>
                  <p className="text-xs text-gray-500 font-mono">{t('customer:bookingDetails.bookingId', { id: booking._id })}</p>
                </div>
              </div>
              <Badge 
                variant={getStatusColor(booking.status)} 
                className="px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm self-start sm:self-auto"
              >
                {t(`customer:bookings.status.${booking.status}`)}
              </Badge>
            </div>
            <div className="sm:hidden mt-2">
              <h1 className="text-lg font-bold text-gray-900">{t('customer:bookingDetails.title')}</h1>
              <p className="text-xs text-gray-500 font-mono">{t('customer:bookingDetails.bookingId', { id: booking._id })}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
            {/* Left Column */}
            <div className="xl:col-span-2 space-y-4 sm:space-y-6">
              {/* Worker Info Card */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                      {booking.workerId?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <FaCheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">{booking.workerId?.name}</h3>
                        <p className="text-blue-600 font-semibold text-sm">{booking.service}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                            <FaPhone className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{booking.workerId?.phone}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                            <FaEnvelope className="w-3 h-3 flex-shrink-0" />
                            <span>Verified</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg self-start">
                        <FaStar className="w-3 h-3 text-yellow-500" />
                        <span className="text-xs font-semibold text-yellow-700">4.8</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3 sm:mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <FaCalendarAlt className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Schedule</h3>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Date</p>
                      <p className="text-sm font-semibold text-gray-900">{bookingDateLabel}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Time</p>
                      <p className="text-sm font-semibold text-gray-900">{bookingTimeLabel}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3 sm:mb-4">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                      <FaMapMarkerAlt className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Location</h3>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{booking.address}</p>
                </div>
              </div>

              {/* Service Description */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  Service Description
                </h3>
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {booking.description || 'No description provided'}
                  </p>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  Timeline
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {timelineEvents.map((event, index) => (
                    <div key={event.key} className="relative flex items-start gap-3 sm:gap-4">
                      <div className={`w-3 h-3 rounded-full ${event.tone} relative z-10 flex-shrink-0 mt-0.5`}></div>
                      {index !== timelineEvents.length - 1 && (
                        <div className="absolute left-[5px] top-3 w-px h-6 sm:h-8 bg-gray-200"></div>
                      )}
                      <div className="flex-1 pb-3 sm:pb-4 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{event.label}</p>
                        <p className="text-xs text-gray-500 mt-1 break-words">{event.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4 sm:space-y-6">
              {/* Payment Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4 sm:mb-5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <FaCreditCard className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Payment Details</h3>
                </div>

                {payment ? (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-green-50 rounded-lg border border-green-100">
                      <div className="flex items-center gap-2">
                        <FaCheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm font-medium text-green-800">{t('customer:bookingDetails.paymentCompleted')}</span>
                      </div>
                      <Badge variant="success" className="text-xs px-2 py-1 rounded-full self-start sm:self-auto">
                          {t(`customer:bookings.payment.status.${payment.status}`, { defaultValue: payment.status })}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">{t('customer:bookingDetails.labels.serviceCost')}</span>
                        <span className="font-semibold text-gray-900 text-sm">${booking.estimatedCost?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">{t('customer:bookingDetails.labels.platformFee')}</span>
                        <span className="font-semibold text-gray-900 text-sm">${booking.platformFee?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-semibold text-gray-900">{t('customer:bookingDetails.labels.totalPaid')}</span>
                        <span className="font-bold text-green-600 text-base sm:text-lg">${(payment.amount || booking.totalAmount)?.toFixed(2)}</span>
                      </div>
                    </div>

                    {payment.transactionId && (
                      <div className="bg-gray-50 rounded-lg p-3 mt-3 sm:mt-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('customer:bookingDetails.labels.transactionId')}</p>
                        <p className="text-xs font-mono text-gray-700 break-all">{payment.transactionId}</p>
                      </div>
                    )}
                  </div>
                ) : booking.totalAmount > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                      <FaExclamationTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-yellow-800">{t('customer:bookingDetails.waitingForWorker.title')}</p>
                        <p className="text-xs text-yellow-600 mt-1">{t('customer:bookingDetails.waitingForWorker.message')}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">{t('customer:bookingDetails.labels.serviceCost')}</span>
                        <span className="font-semibold text-gray-900 text-sm">${booking.estimatedCost?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">{t('customer:bookingDetails.labels.platformFee')}</span>
                        <span className="font-semibold text-gray-900 text-sm">${booking.platformFee?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-semibold text-gray-900">{t('customer:bookingDetails.labels.totalAmount')}</span>
                        <span className="font-bold text-yellow-600 text-base sm:text-lg">${booking.totalAmount?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <FaBell className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-blue-800">{t('customer:bookingDetails.waitingForWorker.title')}</p>
                      <p className="text-xs text-blue-600 mt-1">{t('customer:bookingDetails.waitingForWorker.message')}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  {t('customer:bookingDetails.sections.quickActions')}
                </h3>
                
                <div className="space-y-2.5 sm:space-y-3">
                  {booking.conversationId && (
                    <Link
                      href={`/customer/chat?workerId=${booking.workerId?._id || booking.workerId}`}
                      className="relative w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] text-sm"
                    >
                      <FaComments className="w-4 h-4" />
                      <span>{t('customer:bookingDetails.actions.chatWithWorker')}</span>
                      {chatUnread > 0 && (
                        <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                          {chatUnread > 9 ? '9+' : chatUnread}
                        </span>
                      )}
                    </Link>
                  )}

                  {!payment && booking.totalAmount > 0 && booking.status !== 'cancelled' && (
                    <Link
                      href={`/payment?bookingId=${booking._id}`}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] text-sm"
                    >
                      <FaCreditCard className="w-4 h-4" />
                      <span className="truncate">{t('customer:bookingDetails.actions.payNowAmount', { amount: booking.totalAmount.toFixed(2) })}</span>
                    </Link>
                  )}

                  {booking.status === 'completed' && (
                    <Link
                      href={`/customer/reviews/new/${booking._id}`}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] text-sm"
                    >
                      <FaStar className="w-4 h-4" />
                      <span>{t('customer:bookingDetails.actions.leaveReview')}</span>
                    </Link>
                  )}

                  {booking.status === 'pending' && (
                    <div className="space-y-2">
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
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] text-sm"
                      >
                        <FaTimes className="w-4 h-4" />
                        <span>{t('customer:bookingDetails.actions.cancelBooking')}</span>
                      </button>
                      <p className="text-center text-xs text-gray-500">{t('customer:bookingDetails.actions.cancelWarning')}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Trust Badges */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  {t('customer:bookingDetails.trust.title')}
                </h3>
                
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                    <FaShieldAlt className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-blue-800">{t('customer:bookingDetails.trust.badges.secure')}</p>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                    <FaCheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-green-800">{t('customer:bookingDetails.trust.badges.verified')}</p>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                    <FaClock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-purple-800">{t('customer:bookingDetails.trust.badges.onTime')}</p>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg">
                    <FaTrophy className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-yellow-800">{t('customer:bookingDetails.trust.badges.quality')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
