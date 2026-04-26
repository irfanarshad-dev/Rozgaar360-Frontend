'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { Loader2, CreditCard, ShieldCheck, Lock } from 'lucide-react';
import DashboardLayout from '@/app/components/ui/DashboardLayout';

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, i18n } = useTranslation(['customer']);
  const bookingId = searchParams.get('bookingId');
  
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!bookingId) {
      router.push('/customer/bookings');
      return;
    }

    const fetchBooking = async () => {
      try {
        const res = await api.get(`/api/bookings/${bookingId}`);
        setBooking(res.data);
      } catch (err) {
        setError(t('customer:paymentPage.errors.loadBookingFailed'));
      }
    };

    fetchBooking();
  }, [bookingId, router, t]);

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get(`/api/payment/checkout?bookingId=${bookingId}`);
      
      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error(t('customer:paymentPage.errors.noCheckoutUrl'));
      }
    } catch (err) {
      setError(err.response?.data?.message || t('customer:paymentPage.errors.initFailed'));
      setLoading(false);
    }
  };

  if (!booking) {
    return (
      <DashboardLayout role="customer" contentClassName="pt-0 px-3 pb-3 sm:pt-0 sm:px-4 sm:pb-4 lg:pt-0 lg:px-5 lg:pb-5" showFooter={false}>
        <div className="max-w-5xl mx-auto mt-[5px] min-h-[60vh] flex items-center justify-center bg-white border border-gray-100 rounded-none">
          <div className="flex items-center gap-3 text-blue-700">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm sm:text-base font-bold text-gray-700">{t('customer:paymentPage.loading')}</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const amount = booking.totalAmount || booking.estimatedCost || 50;

  return (
    <DashboardLayout role="customer" contentClassName="pt-0 px-3 pb-3 sm:pt-0 sm:px-4 sm:pb-4 lg:pt-0 lg:px-5 lg:pb-5" showFooter={false}>
      <div className="max-w-5xl mx-auto mt-[5px] pb-2 sm:pb-3">
        <div className="bg-white rounded-none shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-sky-100 to-blue-200 p-3 sm:p-4 text-slate-900">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-black mb-1">{t('customer:paymentPage.title')}</h1>
                <p className="text-blue-700 text-xs sm:text-sm break-all">{t('customer:paymentPage.bookingId', { id: bookingId })}</p>
              </div>
              <button
                onClick={() => router.push('/customer/bookings')}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-blue-300 bg-white/85 hover:bg-white px-2.5 py-1.5 text-[11px] sm:text-xs font-bold text-blue-700 transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>{t('customer:paymentPage.backToBookings')}</span>
              </button>
            </div>
          </div>

          <div className="p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.82fr)] gap-3">
            <div className="space-y-3">
              <div className="border border-gray-100 rounded-xl p-3 sm:p-3.5">
                <h2 className="text-[11px] sm:text-xs font-black text-gray-800 mb-2.5 uppercase tracking-wider">{t('customer:paymentPage.sections.summary')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="bg-gray-50 p-2.5 rounded-lg min-w-0">
                    <p className="text-[9px] text-gray-500 mb-1 font-bold uppercase tracking-wide">{t('customer:paymentPage.labels.service')}</p>
                    <p className="font-bold text-gray-800 text-xs sm:text-sm truncate">{booking.service}</p>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-lg min-w-0">
                    <p className="text-[9px] text-gray-500 mb-1 font-bold uppercase tracking-wide">{t('customer:paymentPage.labels.worker')}</p>
                    <p className="font-bold text-gray-800 text-xs sm:text-sm truncate">{booking.workerId?.name || t('customer:bookings.fallbackWorker')}</p>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-lg min-w-0">
                    <p className="text-[9px] text-gray-500 mb-1 font-bold uppercase tracking-wide">{t('customer:paymentPage.labels.date')}</p>
                    <p className="font-bold text-gray-800 text-xs sm:text-sm truncate">
                      {new Date(booking.date).toLocaleDateString(i18n.language === 'ur' ? 'ur-PK' : 'en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-lg min-w-0">
                    <p className="text-[9px] text-gray-500 mb-1 font-bold uppercase tracking-wide">{t('customer:paymentPage.labels.currency')}</p>
                    <p className="font-bold text-gray-800 text-xs sm:text-sm">USD</p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-100 rounded-xl p-3 sm:p-3.5">
                <h2 className="text-[11px] sm:text-xs font-black text-gray-800 mb-2.5 uppercase tracking-wider">{t('customer:paymentPage.sections.breakdown')}</h2>
                <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-lg">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-700">{t('customer:paymentPage.labels.serviceCost')}:</span>
                      <span className="font-semibold">${(booking.estimatedCost || amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-700">{t('customer:paymentPage.labels.platformFee')}:</span>
                      <span className="font-semibold">${(booking.platformFee || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm border-t border-blue-300 pt-2">
                      <span className="text-gray-900">{t('customer:paymentPage.labels.total')}:</span>
                      <span className="text-blue-700">${(booking.totalAmount || amount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-yellow-200 bg-yellow-50 rounded-xl p-3 sm:p-3.5">
                <h2 className="text-[11px] sm:text-xs font-black text-yellow-900 mb-2 uppercase tracking-wider">{t('customer:paymentPage.sections.testMode')}</h2>
                <div className="space-y-1.5 text-[11px] sm:text-xs text-yellow-800">
                  <p>{t('customer:paymentPage.testCards.success')}</p>
                  <p>{t('customer:paymentPage.testCards.failed')}</p>
                  <p className="text-yellow-700 pt-1">{t('customer:paymentPage.testCards.note')}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 lg:sticky lg:top-20 lg:self-start">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2.5">
                  <svg className="w-4.5 h-4.5 text-red-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-800 text-xs sm:text-sm">{error}</p>
                </div>
              )}

              <div className="border border-gray-100 rounded-xl p-3 sm:p-3.5">
                <h2 className="text-[11px] sm:text-xs font-black text-gray-800 mb-2.5 uppercase tracking-wider">{t('customer:paymentPage.sections.security')}</h2>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center bg-gray-50 rounded-lg p-2">
                    <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1.5">
                      <ShieldCheck className="w-4.5 h-4.5 text-green-600" />
                    </div>
                    <p className="text-[10px] text-gray-600 leading-tight">{t('customer:paymentPage.security.securePayment')}</p>
                  </div>
                  <div className="text-center bg-gray-50 rounded-lg p-2">
                    <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1.5">
                      <Lock className="w-4.5 h-4.5 text-blue-600" />
                    </div>
                    <p className="text-[10px] text-gray-600 leading-tight">{t('customer:paymentPage.security.sslEncrypted')}</p>
                  </div>
                  <div className="text-center bg-gray-50 rounded-lg p-2">
                    <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-1.5">
                      <CreditCard className="w-4.5 h-4.5 text-indigo-600" />
                    </div>
                    <p className="text-[10px] text-gray-600 leading-tight">{t('customer:paymentPage.security.stripePowered')}</p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-100 rounded-xl p-3 sm:p-3.5 space-y-2.5">
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2.5 px-4 rounded-xl text-xs sm:text-sm leading-tight font-bold text-center transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                      {t('customer:paymentPage.actions.redirecting')}
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4.5 h-4.5" />
                      {t('customer:paymentPage.actions.payNowAmount', { amount: amount.toFixed(2) })}
                    </>
                  )}
                </button>
                <button
                  onClick={() => router.push('/customer/bookings')}
                  className="w-full border border-gray-200 bg-white text-gray-700 py-2.5 px-4 rounded-xl hover:bg-gray-50 text-xs sm:text-sm leading-tight font-bold text-center transition"
                >
                  {t('customer:paymentPage.actions.cancelPayment')}
                </button>
                <p className="text-[11px] text-gray-500 text-center">
                  {t('customer:paymentPage.poweredBy')} <span className="font-semibold text-blue-700">Stripe</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center">
        <div className="flex items-center gap-3 text-blue-700">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-sm sm:text-base font-bold text-gray-700">Loading...</span>
        </div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
