'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import api from '@/lib/axios';
import Link from 'next/link';

export default function CustomerBookings() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('active');
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await new Promise(r => setTimeout(r, 100));
      if (!authService.isAuthenticated()) {
        router.push('/login');
        return;
      }
      
      try {
        const response = await api.get('/api/bookings/my-bookings');
        const bookingsData = response.data || [];
        setBookings(bookingsData);
        
        // Fetch payment details for each booking
        const paymentPromises = bookingsData.map(b => 
          api.get(`/api/payments/booking/${b._id}`).catch(() => [])
        );
        const paymentResults = await Promise.all(paymentPromises);
        const paymentMap = {};
        bookingsData.forEach((b, i) => {
          paymentMap[b._id] = paymentResults[i].data?.[0] || null;
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl">Loading your bookings...</div>
      </div>
    );
  }

  const getPaymentBadge = (payment) => {
    if (!payment) return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">No Payment</span>;
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      processing: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[payment.status] || 'bg-gray-100 text-gray-600'}`}>
        Stripe - {payment.status}
      </span>
    );
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const renderBookingsList = (list) => {
    const filteredList = activeTab === 'active' 
      ? list.filter(b => ['pending', 'confirmed', 'in_progress'].includes(b.status))
      : list.filter(b => ['completed', 'cancelled'].includes(b.status));

    if (filteredList.length === 0) {
      return (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500">No bookings found in this category.</p>
        </div>
      );
    }
    return (
      <div className="grid gap-6">
        {filteredList.map((booking) => (
          <div key={booking._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{booking.workerId?.name || 'Worker'}</h3>
                <p className="text-blue-600 font-medium">{booking.service}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${
                getStatusColor(booking.status)
              }`}>
                {booking.status.replace('_', ' ')}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-gray-600 mb-6 border-t border-b py-4">
              <div>
                <span className="block text-sm text-gray-400">Date</span>
                <span className="font-medium text-gray-800">{new Date(booking.date).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="block text-sm text-gray-400">Time</span>
                <span className="font-medium text-gray-800">
                  {new Date(`2000-01-01T${booking.time}`).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit', 
                    hour12: true 
                  })}
                </span>
              </div>
              <div>
                <span className="block text-sm text-gray-400">Payment</span>
                {getPaymentBadge(payments[booking._id])}
              </div>
              {payments[booking._id]?.amount && (
                <div>
                  <span className="block text-sm text-gray-400">Amount</span>
                  <span className="font-medium text-gray-800">${payments[booking._id].amount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex space-x-4">
              <Link href={`/customer/bookings/${booking._id}`} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition text-center flex-1 shadow-sm">
                View Details
              </Link>
              {!payments[booking._id] && booking.status !== 'cancelled' && (
                <Link href={`/payment?bookingId=${booking._id}`} className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 font-medium transition text-center flex-1 shadow-sm">
                  Pay Now
                </Link>
              )}
              {booking.conversationId && (
                <Link href={`/chat/${typeof booking.conversationId === 'object' ? booking.conversationId._id : booking.conversationId}`} className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium transition text-center flex-1 shadow-sm">
                  Chat with Worker
                </Link>
              )}
              {booking.status === 'completed' && (
                <Link href={`/customer/reviews/new/${booking._id}`} className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 font-medium transition text-center flex-1 shadow-sm">
                  Leave Review
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Bookings</h1>

        <div className="flex mb-8 bg-gray-200 p-1 rounded-xl w-fit">
          <button 
            onClick={() => setActiveTab('active')}
            className={`px-8 py-3 rounded-lg font-semibold transition ${activeTab === 'active' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
          >
            Active Bookings
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-8 py-3 rounded-lg font-semibold transition ${activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
          >
            Booking History
          </button>
        </div>

        {renderBookingsList(bookings)}
      </div>
    </div>
  );
}
