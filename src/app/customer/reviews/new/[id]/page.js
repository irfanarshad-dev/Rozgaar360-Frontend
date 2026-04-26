'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import api from '@/lib/axios';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '@/app/components/ui/DashboardLayout';

export default function SubmitReview() {
  const router = useRouter();
  const params = useParams();
  const { t } = useTranslation(['customer', 'common']);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [booking, setBooking] = useState(null);

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
        alert(t('customer:bookingNotFound'));
        router.push('/customer/bookings');
      }
    };
    init();
  }, [router, params.id, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return alert(t('customer:selectRatingPrompt'));
    setSubmitting(true);
    try {
      await api.post('/api/reviews', {
        bookingId: params.id,
        rating,
        comment
      });
      alert(t('customer:reviewSubmittedSuccess'));
      router.push('/customer/bookings');
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert(error.response?.data?.message || t('customer:reviewSubmitFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="customer">
      <div className="max-w-3xl mx-auto pb-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-5 text-center tracking-tight">{t('customer:rateExperience')}</h1>
          {booking && (
            <div className="mb-5 p-3.5 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-gray-700 text-center font-semibold">{t('customer:serviceBy', { name: booking.workerId?.name || '' })}</p>
              <p className="text-blue-600 text-sm text-center font-medium">{booking.service}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="flex justify-center mb-6">
              {[...Array(5)].map((star, index) => {
                index += 1;
                return (
                  <button
                    type="button"
                    key={index}
                    className={`text-4xl sm:text-5xl bg-transparent border-none outline-none cursor-pointer transition ${
                      index <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                    onClick={() => setRating(index)}
                    onMouseEnter={() => setHover(index)}
                    onMouseLeave={() => setHover(rating)}
                  >
                    <span className="star">&#9733;</span>
                  </button>
                );
              })}
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t('customer:leaveComment')}</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="4"
                placeholder={t('customer:reviewCommentPlaceholder')}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none text-sm"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? t('customer:submittingReview') : t('customer:submitReview')}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
