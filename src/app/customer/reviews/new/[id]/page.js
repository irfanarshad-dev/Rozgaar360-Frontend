'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import api from '@/lib/axios';

export default function SubmitReview() {
  const router = useRouter();
  const params = useParams();
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
        alert('Booking not found');
        router.push('/customer/bookings');
      }
    };
    init();
  }, [router, params.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return alert('Please select a rating');
    setSubmitting(true);
    try {
      await api.post('/api/reviews', {
        bookingId: params.id,
        rating,
        comment
      });
      alert('Review submitted successfully!');
      router.push('/customer/bookings');
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Rate Your Experience</h1>
        {booking && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-gray-600 text-center">Service by <span className="font-semibold text-blue-600">{booking.workerId?.name}</span></p>
            <p className="text-gray-500 text-sm text-center">{booking.service}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="flex justify-center mb-8">
            {[...Array(5)].map((star, index) => {
              index += 1;
              return (
                <button
                  type="button"
                  key={index}
                  className={`text-5xl bg-transparent border-none outline-none cursor-pointer transition ${
                    index <= (hover || rating) ? "text-yellow-400" : "text-gray-300"
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
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Leave a Comment</label>
            <textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="5"
              placeholder="Describe your experience with the worker..."
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting Review...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
}
