'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import api from '@/lib/axios';
import Link from 'next/link';

export default function WorkerBookings() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('pending');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

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
        const response = await api.get('/api/bookings/my-bookings');
        setBookings(response.data || []);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await api.put(`/api/bookings/${bookingId}/status`, { status: newStatus });
      // Refresh bookings
      const response = await api.get('/api/bookings/my-bookings');
      setBookings(response.data || []);
    } catch (error) {
      alert('Failed to update booking status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl">Loading bookings...</div>
      </div>
    );
  }

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

  const filterBookings = () => {
    switch(activeTab) {
      case 'pending':
        return bookings.filter(b => b.status === 'pending');
      case 'active':
        return bookings.filter(b => ['confirmed', 'in_progress'].includes(b.status));
      case 'completed':
        return bookings.filter(b => b.status === 'completed');
      case 'cancelled':
        return bookings.filter(b => b.status === 'cancelled');
      default:
        return bookings;
    }
  };

  const filteredBookings = filterBookings();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Job Requests</h1>
          <p className="text-gray-600 mt-2">Manage your bookings and communicate with customers</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-xl shadow-sm">
          {[
            { id: 'pending', label: 'New Requests', count: bookings.filter(b => b.status === 'pending').length },
            { id: 'active', label: 'Active Jobs', count: bookings.filter(b => ['confirmed', 'in_progress'].includes(b.status)).length },
            { id: 'completed', label: 'Completed', count: bookings.filter(b => b.status === 'completed').length },
            { id: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-white/20' : 'bg-gray-200'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-500 text-lg">No bookings in this category</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredBookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                        {booking.customerId?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{booking.customerId?.name}</h3>
                        <p className="text-blue-600 font-medium">{booking.service}</p>
                        <p className="text-gray-500 text-sm">{booking.customerId?.phone}</p>
                      </div>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold capitalize border ${getStatusColor(booking.status)}`}>
                      {booking.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Date</p>
                      <p className="font-semibold text-gray-800">{new Date(booking.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Time</p>
                      <p className="font-semibold text-gray-800">{booking.time}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Location</p>
                      <p className="font-semibold text-gray-800 truncate">{booking.address}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Job Description:</p>
                    <p className="text-gray-700">{booking.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/worker/bookings/${booking._id}`}
                      className="flex-1 min-w-[150px] bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 font-medium text-center transition"
                    >
                      View Details
                    </Link>
                    
                    {booking.conversationId && (
                      <Link
                        href={`/chat/${typeof booking.conversationId === 'object' ? booking.conversationId._id : booking.conversationId}`}
                        className="flex-1 min-w-[150px] bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 font-medium text-center transition"
                      >
                        Chat with Customer
                      </Link>
                    )}

                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                          className="flex-1 min-w-[150px] bg-emerald-600 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-700 font-medium transition"
                        >
                          Accept Job
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to reject this job?')) {
                              handleStatusUpdate(booking._id, 'cancelled');
                            }
                          }}
                          className="flex-1 min-w-[150px] bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 font-medium transition"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => handleStatusUpdate(booking._id, 'in_progress')}
                        className="flex-1 min-w-[150px] bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 font-medium transition"
                      >
                        Start Job
                      </button>
                    )}

                    {booking.status === 'in_progress' && (
                      <button
                        onClick={() => handleStatusUpdate(booking._id, 'completed')}
                        className="flex-1 min-w-[150px] bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 font-medium transition"
                      >
                        Mark as Completed
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
