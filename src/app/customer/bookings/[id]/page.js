'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import api from '@/lib/axios';
import Link from 'next/link';

export default function BookingDetails() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await new Promise(r => setTimeout(r, 100));
      if (!authService.isAuthenticated()) {
        router.push('/login');
        return;
      }

      try {
        console.log('Fetching booking:', params.id);
        const response = await api.get(`/api/bookings/${params.id}`);
        console.log('Booking response:', response.data);
        setBooking(response.data);
        
        // Fetch payment details
        try {
          const paymentRes = await api.get(`/api/payments/booking/${params.id}`);
          setPayment(paymentRes.data?.[0] || null);
        } catch (err) {
          console.log('No payment found');
        }
      } catch (error) {
        console.error('Failed to fetch booking:', error);
        console.error('Error response:', error.response?.data);
        alert(error.response?.data?.message || 'Booking not found or access denied');
        router.push('/customer/bookings');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [params.id, router]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'completed': return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl">Loading booking details...</div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Bookings
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold mb-2">Booking Details</h1>
                <p className="text-blue-100">Booking ID: {booking._id}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold capitalize border ${getStatusColor(booking.status)}`}>
                {booking.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Worker Info */}
            <div className="border-b pb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Worker Information</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {booking.workerId?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{booking.workerId?.name}</h3>
                  <p className="text-blue-600 font-medium">{booking.service}</p>
                  <p className="text-gray-500 text-sm">{booking.workerId?.phone}</p>
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="border-b pb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Service Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Service Type</p>
                  <p className="font-semibold text-gray-800">{booking.service}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Date</p>
                  <p className="font-semibold text-gray-800">{new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Time</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(`2000-01-01T${booking.time}`).toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit', 
                      hour12: true 
                    })}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <p className="font-semibold text-gray-800 capitalize">{booking.status.replace('_', ' ')}</p>
                </div>
                {booking.estimatedCost && (
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-600 mb-1">Service Cost</p>
                    <p className="font-bold text-blue-800 text-xl">${booking.estimatedCost.toFixed(2)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="border-b pb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Service Location</h2>
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-gray-800">{booking.address}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="border-b pb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Issue Description</h2>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-gray-700 leading-relaxed">{booking.description}</p>
              </div>
            </div>

            {/* Payment Details */}
            <div className="border-b pb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Payment Information</h2>
              {payment ? (
                <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Service Cost:</span>
                      <span className="font-semibold">${booking.estimatedCost?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Platform Fee (15%):</span>
                      <span className="font-semibold">${booking.platformFee?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base border-t border-green-300 pt-2">
                      <span className="text-gray-900">Total Paid:</span>
                      <span className="text-green-600">${(payment.amount || booking.totalAmount)?.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3 mt-4 pt-4 border-t border-green-200">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                      <p className="font-semibold text-gray-800 uppercase">Stripe</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Status</p>
                      <p className={`font-semibold capitalize ${
                        payment.status === 'completed' ? 'text-green-600' :
                        payment.status === 'failed' ? 'text-red-600' :
                        payment.status === 'processing' ? 'text-blue-600' :
                        'text-yellow-600'
                      }`}>{payment.status}</p>
                    </div>
                    {payment.transactionId && (
                      <div className="md:col-span-2">
                        <p className="text-xs text-gray-500 mb-1">Transaction ID</p>
                        <p className="font-semibold text-gray-800 text-sm break-all">{payment.transactionId}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : booking.totalAmount > 0 ? (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Service Cost:</span>
                      <span className="font-semibold">${booking.estimatedCost?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Platform Fee (15%):</span>
                      <span className="font-semibold">${booking.platformFee?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base border-t border-blue-300 pt-2">
                      <span className="text-gray-900">Total Amount:</span>
                      <span className="text-blue-600">${booking.totalAmount?.toFixed(2)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-blue-700">Ready for payment via Stripe</p>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex items-center gap-3">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-yellow-800">Waiting for Worker</p>
                    <p className="text-sm text-yellow-700">Worker needs to accept and set the amount</p>
                  </div>
                </div>
              )}
            </div>

            {/* Timestamps */}
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4">Timeline</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-500">Booked on:</span>
                  <span className="font-medium text-gray-800">{new Date(booking.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                </div>
                {booking.completedAt && (
                  <div className="flex items-center gap-3 text-sm">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-500">Completed on:</span>
                    <span className="font-medium text-gray-800">{new Date(booking.completedAt).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                  </div>
                )}
                {booking.cancelledAt && (
                  <div className="flex items-center gap-3 text-sm">
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-500">Cancelled on:</span>
                    <span className="font-medium text-gray-800">{new Date(booking.cancelledAt).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 p-6 flex gap-4">
            {!payment && booking.totalAmount > 0 && booking.status !== 'cancelled' && (
              <Link
                href={`/payment?bookingId=${booking._id}`}
                className="flex-1 bg-emerald-600 text-white py-3 px-6 rounded-xl hover:bg-emerald-700 font-semibold text-center transition shadow-md"
              >
                Pay Now - ${booking.totalAmount.toFixed(2)}
              </Link>
            )}
            {booking.conversationId && (
              <Link
                href={`/chat/${typeof booking.conversationId === 'object' ? booking.conversationId._id : booking.conversationId}`}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-xl hover:bg-green-700 font-semibold text-center transition shadow-md"
              >
                Chat with Worker
              </Link>
            )}
            {booking.status === 'completed' && (
              <Link
                href={`/customer/reviews/new/${booking._id}`}
                className="flex-1 bg-amber-600 text-white py-3 px-6 rounded-xl hover:bg-amber-700 font-semibold text-center transition shadow-md"
              >
                Leave Review
              </Link>
            )}
            {booking.status === 'pending' && (
              <button
                onClick={async () => {
                  if (confirm('Are you sure you want to cancel this booking?')) {
                    try {
                      await api.put(`/api/bookings/${booking._id}/status`, {
                        status: 'cancelled',
                        cancellationReason: 'Cancelled by customer'
                      });
                      router.push('/customer/bookings');
                    } catch (error) {
                      alert('Failed to cancel booking');
                    }
                  }
                }}
                className="flex-1 bg-red-600 text-white py-3 px-6 rounded-xl hover:bg-red-700 font-semibold text-center transition shadow-md"
              >
                Cancel Booking
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
