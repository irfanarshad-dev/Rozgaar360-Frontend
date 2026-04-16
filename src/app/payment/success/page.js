'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { CheckCircle2, Loader2, Package, Calendar, User } from 'lucide-react';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const bookingId = searchParams.get('booking_id');
  
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId || !bookingId) {
        setVerifying(false);
        return;
      }

      try {
        await api.post('/api/payment/verify', { sessionId, bookingId });
        const res = await api.get(`/api/bookings/${bookingId}`);
        setBooking(res.data);
        setVerified(true);
      } catch (err) {
        console.error('Verification failed:', err);
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, bookingId]);

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
            <p className="text-green-100">Your booking has been confirmed</p>
          </div>

          <div className="p-8">
            {verified && booking ? (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Service</p>
                        <p className="font-semibold text-gray-900">{booking.service}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Worker</p>
                        <p className="font-semibold text-gray-900">{booking.workerId?.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Scheduled Date</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(booking.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Service Cost</span>
                          <span className="font-medium text-gray-900">
                            ${booking.estimatedCost || 50} USD
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Platform Fee (15%)</span>
                          <span className="font-medium text-gray-900">
                            ${((booking.platformFee || 0)).toFixed(2)} USD
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-gray-300">
                        <span className="text-gray-600 font-semibold">Total Amount</span>
                        <span className="text-2xl font-bold text-green-600">
                          ${(booking.totalAmount || booking.estimatedCost || 50).toFixed(2)} USD
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">✓</span>
                      <span>The worker has been notified of your booking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">✓</span>
                      <span>You can track the status in your bookings dashboard</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">✓</span>
                      <span>Chat with the worker directly through our platform</span>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Completed</h2>
                <p className="text-gray-600">Your transaction was successful</p>
              </div>
            )}

            <div className="mt-8 space-y-3">
              <Link
                href="/customer/bookings"
                className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl text-center transition-all shadow-lg hover:shadow-xl"
              >
                View My Bookings
              </Link>
              
              <Link
                href="/customer/dashboard"
                className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl text-center transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">A receipt has been sent to your email</p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
