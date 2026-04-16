'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import api from '@/lib/axios';
import Link from 'next/link';

export default function WorkerBookingDetails() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAmountModal, setShowAmountModal] = useState(false);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    const init = async () => {
      await new Promise(r => setTimeout(r, 100));
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
        
        // Fetch payment details
        try {
          const paymentRes = await api.get(`/api/payments/booking/${params.id}`);
          setPayment(paymentRes.data?.[0] || null);
        } catch (err) {
          console.log('No payment found');
        }
      } catch (error) {
        console.error('Failed to fetch booking:', error);
        alert('Booking not found or access denied');
        router.push('/worker/bookings');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [params.id, router]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      const response = await api.put(`/api/bookings/${params.id}/status`, { status: newStatus });
      setBooking(response.data);
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const handleSetAmount = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    try {
      await api.put(`/api/bookings/${params.id}`, { estimatedCost: Number(amount) });
      setBooking({ ...booking, estimatedCost: Number(amount) });
      setShowAmountModal(false);
      setAmount('');
      alert('Amount set successfully! Customer will be notified.');
    } catch (error) {
      alert('Failed to set amount');
    }
  };

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
        <div className="text-xl">Loading job details...</div>
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
            Back to Jobs
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold mb-2">Job Request Details</h1>
                <p className="text-blue-100">Job ID: {booking._id}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold capitalize border ${getStatusColor(booking.status)}`}>
                {booking.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Customer Info */}
            <div className="border-b pb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Customer Information</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {booking.customerId?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{booking.customerId?.name}</h3>
                  <p className="text-gray-500">{booking.customerId?.phone}</p>
                  <a href={`tel:${booking.customerId?.phone}`} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    📞 Call Customer
                  </a>
                </div>
              </div>
            </div>

            {/* Job Details */}
            <div className="border-b pb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Job Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Service Type</p>
                  <p className="font-semibold text-gray-800">{booking.service}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Scheduled Date</p>
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
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Estimated Cost</p>
                  <div className="flex items-center justify-between">
                    <div>
                      {booking.estimatedCost ? (
                        <>
                          <p className="font-semibold text-gray-800">Service: ${booking.estimatedCost.toFixed(2)}</p>
                          <p className="text-xs text-gray-600">Platform Fee: ${(booking.platformFee || 0).toFixed(2)}</p>
                          <p className="text-sm font-bold text-green-600 mt-1">Total: ${(booking.totalAmount || 0).toFixed(2)}</p>
                        </>
                      ) : (
                        <p className="font-semibold text-gray-800">Not Set</p>
                      )}
                    </div>
                    {!booking.estimatedCost && booking.status !== 'cancelled' && (
                      <button
                        onClick={() => setShowAmountModal(true)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Set Amount
                      </button>
                    )}
                  </div>
                </div>
                {payment && (
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Payment Status</p>
                    <p className={`font-semibold capitalize ${
                      payment.status === 'completed' ? 'text-green-600' :
                      payment.status === 'failed' ? 'text-red-600' :
                      payment.status === 'processing' ? 'text-blue-600' :
                      'text-yellow-600'
                    }`}>
                      Stripe - {payment.status}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="border-b pb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Job Location</h2>
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-gray-800 font-medium">{booking.address}</p>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.address)}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 text-sm mt-1 inline-block">
                      Open in Google Maps →
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="border-b pb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Job Description</h2>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-gray-700 leading-relaxed">{booking.description}</p>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4">Timeline</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-500">Requested on:</span>
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
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 p-6 flex flex-wrap gap-4">
            {booking.conversationId && (
              <Link
                href={`/chat/${typeof booking.conversationId === 'object' ? booking.conversationId._id : booking.conversationId}`}
                className="flex-1 min-w-[200px] bg-green-600 text-white py-3 px-6 rounded-xl hover:bg-green-700 font-semibold text-center transition shadow-md"
              >
                💬 Chat with Customer
              </Link>
            )}

            {booking.status === 'pending' && (
              <>
                <button
                  onClick={() => handleStatusUpdate('confirmed')}
                  className="flex-1 min-w-[200px] bg-emerald-600 text-white py-3 px-6 rounded-xl hover:bg-emerald-700 font-semibold transition shadow-md"
                >
                  ✓ Accept Job
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to reject this job?')) {
                      handleStatusUpdate('cancelled');
                    }
                  }}
                  className="flex-1 min-w-[200px] bg-red-600 text-white py-3 px-6 rounded-xl hover:bg-red-700 font-semibold transition shadow-md"
                >
                  ✗ Reject Job
                </button>
              </>
            )}

            {booking.status === 'confirmed' && (
              <button
                onClick={() => handleStatusUpdate('in_progress')}
                className="flex-1 min-w-[200px] bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 font-semibold transition shadow-md"
              >
                🚀 Start Job
              </button>
            )}

            {booking.status === 'in_progress' && (
              <button
                onClick={() => handleStatusUpdate('completed')}
                className="flex-1 min-w-[200px] bg-green-600 text-white py-3 px-6 rounded-xl hover:bg-green-700 font-semibold transition shadow-md"
              >
                ✓ Mark as Completed
              </button>
            )}
          </div>
        </div>

        {/* Amount Modal */}
        {showAmountModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Set Job Amount</h3>
              <p className="text-gray-600 mb-4">Enter the service cost. A 15% platform fee will be added automatically.</p>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Cost ($)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  min="0"
                  step="0.01"
                />
                {amount && (
                  <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">Service Cost:</span>
                      <span className="font-semibold">${parseFloat(amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">Platform Fee (15%):</span>
                      <span className="font-semibold">${(parseFloat(amount) * 0.15).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-blue-300 font-bold">
                      <span className="text-gray-900">Customer Pays:</span>
                      <span className="text-blue-600">${(parseFloat(amount) * 1.15).toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">💡 You will receive ${parseFloat(amount).toFixed(2)} after service completion</p>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAmountModal(false);
                    setAmount('');
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSetAmount}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                >
                  Set Amount
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
