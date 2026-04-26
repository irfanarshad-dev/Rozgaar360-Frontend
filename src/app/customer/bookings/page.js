'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { CalendarDays, Clock3, CreditCard, DollarSign, FileText, History } from 'lucide-react';
import DashboardLayout from '@/app/components/ui/DashboardLayout';
import { authService } from '@/lib/auth';
import api from '@/lib/axios';

export default function CustomerBookings() {
  const router = useRouter();
  const { t, i18n } = useTranslation(['customer']);
  const [activeTab, setActiveTab] = useState('active');
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (!authService.isAuthenticated()) {
        router.push('/login');
        return;
      }

      try {
        const response = await api.get('/api/bookings/my-bookings');
        const bookingsData = response.data || [];
        setBookings(bookingsData);

        const paymentPromises = bookingsData.map((booking) =>
          api.get(`/api/payments/booking/${booking._id}`).catch(() => ([]))
        );
        const paymentResults = await Promise.all(paymentPromises);
        const paymentMap = {};

        bookingsData.forEach((booking, index) => {
          paymentMap[booking._id] = paymentResults[index].data?.[0] || null;
        });

        setPayments(paymentMap);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  const getPaymentBadge = (payment) => {
    if (!payment) {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">{t('customer:bookings.payment.none')}</span>;
    }

    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      processing: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[payment.status] || 'bg-gray-100 text-gray-600'}`}>
        {t('customer:bookings.payment.stripeStatus', { status: t(`customer:bookings.payment.status.${payment.status}`, { defaultValue: payment.status }) })}
      </span>
    );
  };

  const getStatusLabel = (status) => t(`customer:bookings.status.${status}`, { defaultValue: status.replace('_', ' ') });

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-gray-100 text-gray-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const renderBookingsList = (list) => {
    const filteredList = activeTab === 'active'
      ? list.filter((booking) => ['pending', 'confirmed', 'in_progress'].includes(booking.status))
      : list.filter((booking) => ['completed', 'cancelled'].includes(booking.status));

    if (filteredList.length === 0) {
      return (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500">{t('customer:bookings.empty')}</p>
        </div>
      );
    }

    return (
      <div className="grid gap-4 sm:gap-5">
        {filteredList.map((booking) => (
          <div key={booking._id} className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-black text-gray-900 truncate">{booking.workerId?.name || t('customer:bookings.fallbackWorker')}</h3>
                <p className="text-blue-600 font-semibold text-sm truncate">{booking.service}</p>
              </div>
              <span className={`self-start px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold capitalize ${getStatusColor(booking.status)}`}>
                {getStatusLabel(booking.status)}
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-gray-600 mb-4 border-y border-gray-100 py-4">
              <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" /> {t('customer:bookings.labels.date')}
                </span>
                <span className="font-bold text-gray-900 text-sm mt-1 block">{new Date(booking.date).toLocaleDateString(i18n.language === 'ur' ? 'ur-PK' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Clock3 className="w-3.5 h-3.5" /> {t('customer:bookings.labels.time')}
                </span>
                <span className="font-bold text-gray-900 text-sm mt-1 block">
                  {new Date(`2000-01-01T${booking.time}`).toLocaleTimeString(i18n.language === 'ur' ? 'ur-PK' : 'en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </span>
              </div>
              <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" /> {t('customer:bookings.labels.payment')}
                </span>
                <div className="mt-1">
                {getPaymentBadge(payments[booking._id])}
                </div>
              </div>
              {payments[booking._id]?.amount && (
                <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" /> {t('customer:bookings.labels.amount')}
                  </span>
                  <span className="font-bold text-gray-900 text-sm mt-1 block">${payments[booking._id].amount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Link href={`/customer/bookings/${booking._id}`} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 text-sm font-bold transition text-center shadow-sm inline-flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                {t('customer:bookings.actions.viewDetails')}
              </Link>
              {!payments[booking._id] && booking.status !== 'cancelled' && (
                <Link href={`/payment?bookingId=${booking._id}`} className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl hover:bg-emerald-700 text-sm font-bold transition text-center shadow-sm inline-flex items-center justify-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  {t('customer:bookings.actions.payNow')}
                </Link>
              )}
              {booking.conversationId && (
                <Link href={`/customer/chat`} className="bg-green-600 text-white px-4 py-2.5 rounded-xl hover:bg-green-700 text-sm font-bold transition text-center shadow-sm inline-flex items-center justify-center gap-2">
                  {t('customer:bookings.actions.chatWithWorker')}
                </Link>
              )}
              {booking.status === 'completed' && (
                <Link href={`/customer/reviews/new/${booking._id}`} className="bg-amber-600 text-white px-4 py-2.5 rounded-xl hover:bg-amber-700 text-sm font-bold transition text-center shadow-sm inline-flex items-center justify-center gap-2">
                  {t('customer:bookings.actions.leaveReview')}
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <DashboardLayout role="customer">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-lg sm:text-xl font-semibold text-gray-500">{t('customer:bookings.loading')}</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="customer">
      <div className="max-w-6xl mx-auto pb-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8 pt-2">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{t('customer:bookings.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('customer:dashboard.myBookingsHint')}</p>
        </div>

          <div className="inline-flex flex-wrap gap-1.5 mb-6 sm:mb-8 bg-gray-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 sm:px-6 py-2.5 rounded-xl text-sm font-bold transition ${activeTab === 'active' ? 'bg-white text-blue-600 shadow-sm border border-blue-100' : 'text-gray-600 hover:text-gray-900'}`}
            >
              {t('customer:bookings.tabs.active')}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 sm:px-6 py-2.5 rounded-xl text-sm font-bold transition ${activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm border border-blue-100' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <span className="inline-flex items-center gap-1.5">
                <History className="w-4 h-4" />
              {t('customer:bookings.tabs.history')}
              </span>
            </button>
          </div>

          {renderBookingsList(bookings)}
      </div>
    </DashboardLayout>
  );
}
