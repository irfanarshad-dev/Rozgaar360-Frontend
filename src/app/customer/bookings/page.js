'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { CalendarDays, Clock3, CreditCard, DollarSign, FileText } from 'lucide-react';
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
      case 'in_progress':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'completed':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'cancelled':
        return 'bg-red-50 text-red-600 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const renderBookingsList = (list) => {
    const filteredList = activeTab === 'active'
      ? list.filter((booking) => ['pending', 'confirmed', 'in_progress'].includes(booking.status))
      : list.filter((booking) => ['completed', 'cancelled'].includes(booking.status));

    if (filteredList.length === 0) {
      return (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-500">{t('customer:bookings.empty')}</p>
        </div>
      );
    }

    return (
      <div className="grid gap-4 sm:gap-5">
        {filteredList.map((booking) => (
          <div key={booking._id} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h3 className="truncate text-base font-medium text-gray-900 sm:text-[17px]">{booking.workerId?.name || t('customer:bookings.fallbackWorker')}</h3>
                <p className="truncate text-sm text-blue-600">{booking.service}</p>
              </div>
              <span className={`inline-flex self-start rounded-full px-3 py-1.5 text-xs font-medium capitalize ${getStatusColor(booking.status)}`}>
                {getStatusLabel(booking.status)}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 border-y border-gray-100 py-4 sm:grid-cols-3">
              <div className="rounded-lg bg-gray-50 px-3 py-2.5">
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-gray-400">
                  <CalendarDays className="h-3.5 w-3.5" /> {t('customer:bookings.labels.date')}
                </span>
                <span className="mt-1 block text-sm font-medium text-gray-800">{new Date(booking.date).toLocaleDateString(i18n.language === 'ur' ? 'ur-PK' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="rounded-lg bg-gray-50 px-3 py-2.5">
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-gray-400">
                  <Clock3 className="h-3.5 w-3.5" /> {t('customer:bookings.labels.time')}
                </span>
                <span className="mt-1 block text-sm font-medium text-gray-800">
                  {new Date(`2000-01-01T${booking.time}`).toLocaleTimeString(i18n.language === 'ur' ? 'ur-PK' : 'en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </span>
              </div>
              <div className="rounded-lg bg-gray-50 px-3 py-2.5">
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-gray-400">
                  <CreditCard className="h-3.5 w-3.5" /> {t('customer:bookings.labels.payment')}
                </span>
                <div className="mt-1">
                  {getPaymentBadge(payments[booking._id])}
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/customer/bookings/${booking._id}`} className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 px-4 text-xs font-medium text-gray-700 transition hover:bg-gray-50">
                {t('customer:bookings.actions.viewDetails')}
              </Link>
              {!payments[booking._id] && booking.status !== 'cancelled' && (
                <Link href={`/payment?bookingId=${booking._id}`} className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-xs font-medium text-white transition hover:bg-blue-700">
                  {t('customer:bookings.actions.payNow')}
                </Link>
              )}
              {booking.conversationId && (
                <Link href={`/customer/chat`} className="inline-flex h-9 items-center justify-center rounded-lg px-4 text-xs font-medium text-blue-600 transition hover:bg-blue-50">
                  {t('customer:bookings.actions.chatWithWorker')}
                </Link>
              )}
              {booking.status === 'completed' && (
                <Link href={`/customer/reviews/new/${booking._id}`} className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 px-4 text-xs font-medium text-gray-700 transition hover:bg-gray-50">
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
          <h1 className="text-xl font-medium text-gray-900">{t('customer:bookings.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('customer:dashboard.myBookingsHint')}</p>
        </div>

        <div className="mb-6 sm:mb-8 border-b border-gray-200">
          <div className="flex gap-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('active')}
              className={`whitespace-nowrap border-b-2 px-0 pb-3 text-sm transition ${activeTab === 'active' ? 'border-blue-600 font-medium text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {t('customer:bookings.tabs.active')}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`whitespace-nowrap border-b-2 px-0 pb-3 text-sm transition ${activeTab === 'history' ? 'border-blue-600 font-medium text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {t('customer:bookings.tabs.history')}
            </button>
          </div>
        </div>

        {renderBookingsList(bookings)}
      </div>
    </DashboardLayout>
  );
}
