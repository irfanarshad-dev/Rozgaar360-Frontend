'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { authService } from '@/lib/auth';
import api from '@/lib/axios';
import DashboardLayout from '@/app/components/ui/DashboardLayout';
import { useLanguage } from '@/lib/i18nProvider';
import { 
  FaClock, 
  FaCheckCircle, 
  FaCalendarAlt,
  FaUser,
  FaShieldAlt,
  FaTrophy,
  FaComments,
  FaBell
} from 'react-icons/fa';

export default function BookingConfirmation() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

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
      } catch (error) {
        console.error('Failed to fetch booking:', error);
      } finally {
        setLoading(false);
      }
    };
    init();

    // Poll for updates every 5 seconds
    const interval = setInterval(async () => {
      try {
        const response = await api.get(`/api/bookings/${params.id}`);
        setBooking(response.data);
      } catch (error) {
        console.error('Failed to refresh booking:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [params.id, router]);

  const locale = language === 'ur' ? 'ur-PK' : 'en-US';

  const bookingStatus = booking?.status
    ? t(`customer:bookingDetails.status.${booking.status}`, { defaultValue: booking.status })
    : t('customer:bookingDetails.status.pending');

  if (loading) {
    return (
      <DashboardLayout role="customer">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!booking) {
    return (
      <DashboardLayout role="customer">
        <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 px-3 sm:px-6 lg:px-8 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 text-center">
              <FaCheckCircle className="text-red-500 text-4xl mx-auto mb-3" />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('customer:confirmation.notFoundTitle')}</h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600">{t('customer:confirmation.notFoundMessage')}</p>
              <button
                onClick={() => router.push('/customer/bookings')}
                className="mt-5 inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                {t('customer:confirmation.backToBookings')}
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="customer">
      <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        {/* Modern Header Banner */}
        <div className="w-full px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-lg">
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-white flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <FaClock className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold">{t('customer:confirmation.header.title')}</h1>
                    <p className="text-blue-50 text-xs sm:text-sm mt-1">{t('customer:confirmation.header.subtitle')}</p>
                  </div>
                </div>
                {/* Illustration */}
                <div className="hidden md:block">
                  <div className="relative w-24 h-24">
                    <div className="absolute inset-0 bg-white/10 rounded-full animate-pulse"></div>
                    <div className="absolute inset-3 bg-white/20 rounded-full flex items-center justify-center">
                      <div className="text-center">
                        <FaCalendarAlt className="w-10 h-10 text-white/90 mx-auto mb-1" />
                        <FaClock className="w-5 h-5 text-white/70 mx-auto" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16"></div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full px-3 sm:px-6 lg:px-8 pb-6 sm:pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              {/* Left Column - Booking Details */}
              <div className="space-y-4 sm:space-y-5">
                {/* Booking Details Card */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <FaCalendarAlt className="text-blue-600 text-lg" />
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-gray-900">{t('customer:confirmation.details.title')}</h2>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between py-2 sm:py-2.5 border-b border-gray-100">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <FaTrophy className="text-gray-400 text-sm sm:text-base" />
                        <span className="text-xs sm:text-sm text-gray-600">{t('customer:confirmation.details.service')}</span>
                      </div>
                      <span className="font-semibold text-sm sm:text-base text-gray-900">{booking?.service || t('customer:confirmation.placeholders.defaultService')}</span>
                    </div>

                    <div className="flex items-center justify-between py-2 sm:py-2.5 border-b border-gray-100">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <FaUser className="text-gray-400 text-sm sm:text-base" />
                        <span className="text-xs sm:text-sm text-gray-600">{t('customer:confirmation.details.worker')}</span>
                      </div>
                      <span className="font-semibold text-sm sm:text-base text-gray-900">{booking?.workerId?.name || t('customer:confirmation.placeholders.defaultWorker')}</span>
                    </div>

                    <div className="flex items-center justify-between py-2 sm:py-2.5 border-b border-gray-100">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <FaCalendarAlt className="text-gray-400 text-sm sm:text-base" />
                        <span className="text-xs sm:text-sm text-gray-600">{t('customer:confirmation.details.date')}</span>
                      </div>
                      <span className="font-semibold text-sm sm:text-base text-gray-900">
                        {booking?.date ? new Date(booking.date).toLocaleDateString(locale, { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        }) : t('customer:confirmation.placeholders.defaultDate')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2 sm:py-2.5 border-b border-gray-100">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <FaClock className="text-gray-400 text-sm sm:text-base" />
                        <span className="text-xs sm:text-sm text-gray-600">{t('customer:confirmation.details.time')}</span>
                      </div>
                      <span className="font-semibold text-sm sm:text-base text-gray-900">
                        {booking?.time ? new Date(`2000-01-01T${booking.time}`).toLocaleTimeString(locale, { 
                          hour: 'numeric', 
                          minute: '2-digit', 
                          hour12: true 
                        }) : t('customer:confirmation.placeholders.defaultTime')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2 sm:py-2.5">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <FaCheckCircle className="text-gray-400 text-sm sm:text-base" />
                        <span className="text-xs sm:text-sm text-gray-600">{t('customer:confirmation.details.status')}</span>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        booking?.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        booking?.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {bookingStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* What Happens Next */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                      <FaBell className="text-white text-base" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">{t('customer:confirmation.next.title')}</h3>
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                        {t('customer:confirmation.next.message')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Status & Actions */}
              <div className="space-y-4 sm:space-y-5">
                {/* Please Wait Card */}
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                      <FaClock className="text-white text-base" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">{t('customer:confirmation.wait.title')}</h3>
                      <p className="text-xs sm:text-sm text-gray-700 mb-3 leading-relaxed">
                        {t('customer:confirmation.wait.message')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-700 bg-yellow-200/50 rounded-lg p-3">
                    <FaBell className="text-yellow-700 mt-0.5 flex-shrink-0" />
                    <span>{t('customer:confirmation.wait.note')}</span>
                  </div>
                </div>

                {/* Action Buttons with Gradients */}
                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/customer/bookings')}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 sm:py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <FaCalendarAlt className="text-base" />
                    {t('customer:confirmation.actions.goToBookings')}
                  </button>

                  <button
                    onClick={() => router.push('/customer/chat')}
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 sm:py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <FaComments className="text-base" />
                    {t('customer:confirmation.actions.chatWithWorker')}
                  </button>

                  <p className="text-center text-xs text-gray-500 flex items-center justify-center gap-2 mt-3">
                    <FaClock className="text-gray-400 animate-spin" style={{ animationDuration: '3s' }} />
                    {t('customer:confirmation.actions.refreshing')}
                  </p>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl shadow-sm border border-emerald-200 p-4 sm:p-5 text-center hover:shadow-md transition-shadow">
                <FaShieldAlt className="text-emerald-600 text-3xl sm:text-4xl mx-auto mb-2 sm:mb-3" />
                <p className="font-bold text-gray-900 text-xs sm:text-sm mb-1">{t('customer:confirmation.trust.secure.title')}</p>
                <p className="text-xs text-gray-600">{t('customer:confirmation.trust.secure.description')}</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-4 sm:p-5 text-center hover:shadow-md transition-shadow">
                <FaCheckCircle className="text-blue-600 text-3xl sm:text-4xl mx-auto mb-2 sm:mb-3" />
                <p className="font-bold text-gray-900 text-xs sm:text-sm mb-1">{t('customer:confirmation.trust.verified.title')}</p>
                <p className="text-xs text-gray-600">{t('customer:confirmation.trust.verified.description')}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm border border-purple-200 p-4 sm:p-5 text-center hover:shadow-md transition-shadow">
                <FaClock className="text-purple-600 text-3xl sm:text-4xl mx-auto mb-2 sm:mb-3" />
                <p className="font-bold text-gray-900 text-xs sm:text-sm mb-1">{t('customer:confirmation.trust.onTime.title')}</p>
                <p className="text-xs text-gray-600">{t('customer:confirmation.trust.onTime.description')}</p>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-sm border border-yellow-200 p-4 sm:p-5 text-center hover:shadow-md transition-shadow">
                <FaTrophy className="text-yellow-600 text-3xl sm:text-4xl mx-auto mb-2 sm:mb-3" />
                <p className="font-bold text-gray-900 text-xs sm:text-sm mb-1">{t('customer:confirmation.trust.satisfaction.title')}</p>
                <p className="text-xs text-gray-600">{t('customer:confirmation.trust.satisfaction.description')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
