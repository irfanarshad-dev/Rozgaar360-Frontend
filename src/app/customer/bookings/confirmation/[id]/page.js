'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import api from '@/lib/axios';
import { Loader2, Clock, CheckCircle, XCircle } from 'lucide-react';
import DashboardLayout from '@/app/components/ui/DashboardLayout';

export default function BookingConfirmation() {
  const params = useParams();
  const router = useRouter();
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

  if (loading) {
    return (
      <DashboardLayout role="customer">
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  const canPay = booking?.status === 'confirmed' && booking?.totalAmount > 0;

  return (
    <DashboardLayout role="customer">
      <div className="max-w-4xl mx-auto pb-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 sm:p-6 text-center text-white">
            {booking?.status === 'pending' && (
              <>
                <Clock className="w-12 h-12 mx-auto mb-3 animate-pulse" />
                <h1 className="text-2xl font-black mb-1.5">Booking Submitted!</h1>
                <p className="text-blue-100 text-sm">Waiting for worker response...</p>
              </>
            )}
            {booking?.status === 'confirmed' && !canPay && (
              <>
                <CheckCircle className="w-12 h-12 mx-auto mb-3" />
                <h1 className="text-2xl font-black mb-1.5">Booking Confirmed!</h1>
                <p className="text-blue-100 text-sm">Waiting for worker to set the price...</p>
              </>
            )}
            {canPay && (
              <>
                <CheckCircle className="w-12 h-12 mx-auto mb-3" />
                <h1 className="text-2xl font-black mb-1.5">Ready for Payment!</h1>
                <p className="text-blue-100 text-sm">Worker has set the service amount</p>
              </>
            )}
            {booking?.status === 'cancelled' && (
              <>
                <XCircle className="w-12 h-12 mx-auto mb-3" />
                <h1 className="text-2xl font-black mb-1.5">Booking Cancelled</h1>
                <p className="text-blue-100 text-sm">This booking was cancelled</p>
              </>
            )}
          </div>

          {/* Content */}
          <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Booking Details */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <h2 className="text-sm font-black text-gray-900 mb-3 uppercase tracking-wider">Booking Details</h2>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-bold text-gray-900">{booking?.service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Worker:</span>
                  <span className="font-bold text-gray-900">{booking?.workerId?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-bold text-gray-900 text-right">
                    {new Date(booking?.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-bold text-gray-900">
                    {new Date(`2000-01-01T${booking?.time}`).toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit', 
                      hour12: true 
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-bold capitalize ${
                    booking?.status === 'confirmed' ? 'text-green-600' :
                    booking?.status === 'pending' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {booking?.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Price Breakdown */}
              {booking?.estimatedCost > 0 && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <h2 className="text-sm font-black text-gray-900 mb-3 uppercase tracking-wider">Price Breakdown</h2>
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-sm text-gray-700">
                      <span>Service Cost:</span>
                      <span className="font-semibold">${booking.estimatedCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-700">
                      <span>Platform Fee (15%):</span>
                      <span className="font-semibold">${(booking.platformFee || 0).toFixed(2)}</span>
                    </div>
                    <div className="border-t border-green-300 pt-2 flex justify-between text-base font-bold text-gray-900">
                      <span>Total Amount:</span>
                      <span className="text-green-600">${(booking.totalAmount || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Messages */}
              {booking?.status === 'pending' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-black text-yellow-900 mb-1.5">Please Wait</h3>
                      <p className="text-yellow-800 text-sm mb-2">
                        Your booking request has been sent to the worker. Please wait for them to accept and set the service amount.
                      </p>
                      <p className="text-yellow-700 text-xs">
                        You will receive a notification once the worker responds.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {booking?.status === 'confirmed' && !canPay && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-black text-blue-900 mb-1.5">Booking Confirmed!</h3>
                      <p className="text-blue-800 text-sm">
                        The worker has accepted your booking. Waiting for them to set the service price.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2.5">
                {canPay && (
                  <button
                    onClick={() => router.push(`/payment?bookingId=${params.id}`)}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-md"
                  >
                    Proceed to Payment - ${(booking.totalAmount || 0).toFixed(2)}
                  </button>
                )}

                <button
                  onClick={() => router.push('/customer/bookings')}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl transition-colors"
                >
                  Go to My Bookings
                </button>

                {booking?.conversationId && (
                  <button
                    onClick={() => router.push('/customer/chat')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors"
                  >
                    Chat with Worker
                  </button>
                )}
              </div>

              {/* Auto-refresh indicator */}
              <p className="text-center text-xs text-gray-400 mt-1">
                Auto-refreshing every 5 seconds...
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
