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
  Loader2,
  ArrowLeft,
  FileText,
  CreditCard,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

  const getStatusVariant = (status) => {
    switch (status) {
      case 'cancelled':
        return 'destructive';
      case 'pending':
        return 'outline';
      case 'completed':
        return 'default';
      default:
        return 'secondary';
    }
  };

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
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-6 -ml-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('worker:bookingDetails.backToRequestList')}
        </Button>

        {/* Header Section */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('worker:bookingDetails.title')}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {t('worker:bookingDetails.workerAccount', { defaultValue: 'WORKER ACCOUNT' })}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge 
              variant={getStatusVariant(booking.status)} 
              className="h-7 px-3 text-xs font-semibold capitalize"
            >
              {t(`worker:bookings.status.${booking.status}`, { defaultValue: booking.status })}
            </Badge>
            <Badge variant="secondary" className="h-7 gap-1.5 px-3 text-xs font-semibold">
              <Shield className="h-3.5 w-3.5" />
              {t('worker:bookingDetails.escrowProtected', { defaultValue: 'Escrow Protected' })}
            </Badge>
          </div>
        </div>

        {/* Job Details Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(booking.date).toLocaleDateString(i18n.language === 'ur' ? 'ur-PK' : 'en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <Clock className="ml-4 h-4 w-4" />
              <span>{booking.time}</span>
              <MapPin className="ml-4 h-4 w-4" />
              <span className="truncate">{booking.address}</span>
            </div>

            {/* Customer Info */}
            <div className="flex items-center gap-4 border-t pt-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                {booking.customerId?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900">{booking.customerId?.name}</h2>
                <p className="text-sm text-gray-600">{getSkillLabel(booking.service)}</p>
                <p className="text-sm font-medium text-gray-700">{booking.customerId?.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  {t('worker:bookingDetails.jobScheduledFor')}
                </p>
                <p className="mt-1 text-base font-bold text-gray-900">
                  {new Date(booking.date).toLocaleDateString(i18n.language === 'ur' ? 'ur-PK' : 'en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
                <p className="text-sm text-gray-600">{booking.time}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary & Payment Status */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Financial Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="rounded-lg bg-purple-100 p-2">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                </div>
                {t('worker:bookingDetails.financialSummary')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {booking.estimatedCost ? (
                <div>
                  <div className="mb-4 text-center">
                    <div className="text-5xl font-bold text-gray-900">$</div>
                    <p className="mt-2 text-sm text-gray-600">
                      {t('worker:bookingDetails.budgetNotSet', { defaultValue: 'Budget not set for this job yet.' })}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {t('worker:bookingDetails.budgetNotSetHint', { defaultValue: 'The worker will set the amount after reviewing' })}
                    </p>
                  </div>
                  {booking.status !== 'cancelled' && (
                    <Button 
                      onClick={() => setShowAmountModal(true)} 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {t('worker:bookingDetails.sendPriceOffer')}
                    </Button>
                  )}
                </div>
              ) : (
                <div>
                  <div className="mb-4 text-center">
                    <div className="text-5xl font-bold text-gray-900">$</div>
                    <p className="mt-2 text-sm text-gray-600">
                      {t('worker:bookingDetails.budgetNotSet', { defaultValue: 'Budget not set for this job yet.' })}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {t('worker:bookingDetails.budgetNotSetHint', { defaultValue: 'The worker will set the amount after reviewing' })}
                    </p>
                  </div>
                  {booking.status !== 'cancelled' && (
                    <Button 
                      onClick={() => setShowAmountModal(true)} 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {t('worker:bookingDetails.sendPriceOffer')}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="rounded-lg bg-green-100 p-2">
                  <CreditCard className="h-4 w-4 text-green-600" />
                </div>
                {t('worker:bookingDetails.paymentStatus')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {payment ? (
                <div>
                  <div className="mb-4 text-center">
                    <div className="mb-2 flex items-center justify-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <p className="text-sm font-semibold text-green-700">
                        {t('worker:bookingDetails.paymentReceived', { defaultValue: 'Payment Received' })}
                      </p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{formatCurrency(payment.amount || booking.totalAmount || 0)}</p>
                    {paymentDateLabel && (
                      <p className="mt-2 text-xs text-gray-500">
                        {t('worker:bookingDetails.receivedOn', { defaultValue: 'Received on' })} {paymentDateLabel}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2 rounded-lg bg-gray-50 p-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('worker:bookingDetails.paymentMethod', { defaultValue: 'Method' })}</span>
                      <span className="font-semibold text-gray-900">{payment.paymentMethod || 'Card'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('worker:bookingDetails.transactionId', { defaultValue: 'Transaction ID' })}</span>
                      <span className="font-mono text-gray-900">{payment._id?.slice(-8) || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="mb-4 flex items-center justify-center">
                    <div className="rounded-full bg-gray-100 p-4">
                      <CreditCard className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-600">
                    {t('worker:bookingDetails.noTransactionsYet', { defaultValue: 'No transactions yet' })}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {t('worker:bookingDetails.paymentWillAppear', { defaultValue: 'Payment will be shown here once processed.' })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Job Description & Meeting Location */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Job Description */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="rounded-lg bg-yellow-100 p-2">
                  <FileText className="h-4 w-4 text-yellow-600" />
                </div>
                {t('worker:jobDescription')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-gray-50 p-4">
                {hasDescription ? (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                    {descriptionText}
                  </p>
                ) : (
                  <p className="text-sm italic text-gray-400">
                    {t('worker:bookingDetails.noDescription', { defaultValue: 'No description provided' })}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Meeting Location */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="rounded-lg bg-red-100 p-2">
                  <MapPin className="h-4 w-4 text-red-600" />
                </div>
                {t('worker:bookingDetails.meetingLocation')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="mb-2 text-sm font-medium text-gray-900">{booking.address}</p>
                <p className="mb-3 text-xs text-gray-500">
                  {booking.address.split(',')[1] || t('worker:bookingDetails.locationFallback')}
                </p>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-blue-600"
                  asChild
                >
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {t('worker:bookingDetails.openInMaps')}
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-3">
              {booking.conversationId && (
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="relative border-gray-300"
                  asChild
                >
                  <Link href={`/worker/chat?workerId=${booking.workerId._id || booking.workerId}`}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    {t('worker:bookingDetails.chatWithCustomer', { defaultValue: 'Chat with customer' })}
                    {chatUnread > 0 && (
                      <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white">
                        {chatUnread > 9 ? '9+' : chatUnread}
                      </span>
                    )}
                  </Link>
                </Button>
              )}

              {updating ? (
                <Button disabled size="lg" className="bg-blue-600">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('common:updating', { defaultValue: 'Updating...' })}
                </Button>
              ) : (
                <>
                  {booking.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleStatusUpdate('confirmed')}
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        {t('worker:bookingDetails.acceptJob', { defaultValue: 'Accept Job' })}
                      </Button>
                      <Button
                        onClick={() => confirm(t('worker:rejectJobConfirm')) && handleStatusUpdate('cancelled')}
                        variant="destructive"
                        size="lg"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        {t('worker:bookingDetails.declineJob', { defaultValue: 'Decline Job' })}
                      </Button>
                    </>
                  )}

                  {booking.status === 'confirmed' && (
                    <Button
                      onClick={() => handleStatusUpdate('in_progress')}
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {t('worker:markInProgress')}
                    </Button>
                  )}

                  {booking.status === 'in_progress' && (
                    <Button
                      onClick={() => handleStatusUpdate('completed')}
                      size="lg"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {t('worker:bookingDetails.completeAndAskReview')}
                    </Button>
                  )}

                  {booking.status !== 'cancelled' && booking.status !== 'pending' && booking.status !== 'in_progress' && (
                    <Button
                      onClick={() => handleStatusUpdate('completed')}
                      size="lg"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {t('worker:bookingDetails.markAsComplete', { defaultValue: 'Mark as Complete' })}
                    </Button>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Amount Modal */}
      {showAmountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{t('worker:bookingDetails.jobPricing')}</h3>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    {t('worker:bookingDetails.defineServiceRate')}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-gray-600">{t('worker:bookingDetails.pricingHint')}</p>

              <div className="relative mb-4">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-400">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={t('worker:bookingDetails.amountPlaceholder')}
                  className="w-full rounded-lg border-2 border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-xl font-bold text-gray-900 placeholder-gray-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {amount && !isNaN(amount) && Number(amount) > 0 && (
                <div className="mb-6 space-y-2 rounded-lg border border-blue-100 bg-blue-50/50 p-4">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{t('worker:bookingDetails.yourEarning')}</span>
                    <span className="font-bold text-gray-900">{formatCurrency(Number(amount))}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{t('worker:bookingDetails.platformManagement')}</span>
                    <span className="font-semibold">{formatCurrency(Number(amount) * 0.15)}</span>
                  </div>
                  <div className="h-px bg-blue-200" />
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold uppercase tracking-wide text-blue-600">
                        {t('worker:bookingDetails.totalPrice')}
                      </span>
                      <Info className="h-3 w-3 text-blue-500" />
                    </div>
                    <span className="text-xl font-bold text-blue-600">{formatCurrency(Number(amount) * 1.15)}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAmountModal(false);
                    setAmount('');
                  }}
                  className="flex-1"
                >
                  {t('common:cancel')}
                </Button>
                <Button
                  onClick={handleSetAmount}
                  disabled={!amount || isNaN(amount) || Number(amount) <= 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {t('worker:bookingDetails.postOffer')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
