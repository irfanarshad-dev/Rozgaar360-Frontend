'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/axios';
import { Loader2, CreditCard, ShieldCheck, Lock } from 'lucide-react';

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
        setError('Failed to load booking details');
      }
    };

    fetchBooking();
  }, [bookingId, router]);

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get(`/api/payment/checkout?bookingId=${bookingId}`);
      
      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment initialization failed');
      setLoading(false);
    }
  };

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const amount = booking.totalAmount || booking.estimatedCost || 50;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <h1 className="text-2xl font-bold mb-2">Complete Your Payment</h1>
            <p className="text-blue-100">Secure checkout powered by Stripe</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Product Card */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-6 border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Service Booking Payment</h2>
                  <p className="text-gray-600 text-sm">Booking ID: {bookingId?.slice(-8)}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-600">${amount}</p>
                  <p className="text-gray-500 text-sm">USD</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium text-gray-900">{booking.service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Worker:</span>
                  <span className="font-medium text-gray-900">{booking.workerId?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium text-gray-900">{new Date(booking.date).toLocaleDateString()}</span>
                </div>
                {booking.estimatedCost > 0 && (
                  <>
                    <div className="border-t border-gray-300 pt-2 mt-2"></div>
                    <div className="flex justify-between text-gray-700">
                      <span>Service Cost:</span>
                      <span className="font-medium">${booking.estimatedCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Platform Fee (15%):</span>
                      <span className="font-medium">${(booking.platformFee || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-900 text-base">
                      <span>Total:</span>
                      <span className="text-blue-600">${(booking.totalAmount || 0).toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Security Features */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-xs text-gray-600">Secure Payment</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Lock className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-xs text-gray-600">SSL Encrypted</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CreditCard className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-xs text-gray-600">Stripe Powered</p>
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Redirecting to Stripe...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Pay ${amount} Now
                </>
              )}
            </button>

            {/* Test Cards Info */}
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-yellow-800 mb-2">🧪 Test Mode - Use Test Cards:</p>
              <div className="space-y-1 text-xs text-yellow-700">
                <p>✅ Success: <code className="bg-yellow-100 px-2 py-0.5 rounded">4242 4242 4242 4242</code></p>
                <p>❌ Declined: <code className="bg-yellow-100 px-2 py-0.5 rounded">4000 0000 0000 0002</code></p>
                <p className="text-yellow-600 mt-2">Use any future expiry date and any 3-digit CVC</p>
              </div>
            </div>

            {/* Cancel */}
            <button
              onClick={() => router.push('/customer/bookings')}
              className="w-full mt-4 text-gray-600 hover:text-gray-800 font-medium py-2 transition-colors"
            >
              Cancel Payment
            </button>
          </div>
        </div>

        {/* Powered by Stripe */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Powered by <span className="font-semibold text-blue-600">Stripe</span>
          </p>
        </div>
      </div>
    </div>
  );
}
