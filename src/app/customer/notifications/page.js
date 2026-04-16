'use client';
import { useState, useEffect } from 'react';
import { authService } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function CustomerNotifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await new Promise(r => setTimeout(r, 100));
      if (!authService.isAuthenticated()) {
        router.push('/login');
        return;
      }

      // Mock data for notifications
      setNotifications([
        { id: 1, title: 'Booking Confirmed', message: 'Your booking with John for Plumbing has been confirmed for Mar 12, 10:00 AM.', date: '2026-03-05', isRead: false },
        { id: 2, title: 'New Message', message: 'John sent you a new message regarding your service request.', date: '2026-03-04', isRead: true },
        { id: 3, title: 'Service Completed', message: 'Please leave a review for Electrical works completed by Sarah.', date: '2026-03-01', isRead: true }
      ]);
      setLoading(false);
    };

    init();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Notifications</h1>
        
        {notifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-100">
            <p className="text-gray-500">You have no notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-6 rounded-xl border transition ${notification.isRead ? 'bg-white border-gray-100 shadow-sm' : 'bg-blue-50 border-blue-200 shadow-md'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`text-lg font-semibold ${notification.isRead ? 'text-gray-800' : 'text-blue-900'}`}>
                    {notification.title}
                  </h3>
                  <span className="text-sm text-gray-500">{notification.date}</span>
                </div>
                <p className={`${notification.isRead ? 'text-gray-600' : 'text-blue-800'}`}>
                  {notification.message}
                </p>
                {!notification.isRead && (
                  <button className="text-blue-600 mt-4 text-sm font-medium hover:underline">
                    Mark as read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
