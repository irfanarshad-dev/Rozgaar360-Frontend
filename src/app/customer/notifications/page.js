'use client';
import { useState, useEffect } from 'react';
import { authService } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Bell, CheckCircle2, MailOpen, Sparkles } from 'lucide-react';
import DashboardLayout from '@/app/components/ui/DashboardLayout';

export default function CustomerNotifications() {
  const router = useRouter();
  const { t, i18n } = useTranslation(['customer']);
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
        { id: 1, title: t('customer:notifications.items.bookingConfirmed.title'), message: t('customer:notifications.items.bookingConfirmed.message'), date: '2026-03-05', isRead: false },
        { id: 2, title: t('customer:notifications.items.newMessage.title'), message: t('customer:notifications.items.newMessage.message'), date: '2026-03-04', isRead: true },
        { id: 3, title: t('customer:notifications.items.serviceCompleted.title'), message: t('customer:notifications.items.serviceCompleted.message'), date: '2026-03-01', isRead: true }
      ]);
      setLoading(false);
    };

    init();
  }, [router, t]);

  const markAsRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  if (loading) {
    return (
      <DashboardLayout role="customer">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-lg sm:text-xl font-semibold text-gray-500">{t('customer:notifications.loading')}</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="customer">
      <div className="max-w-6xl mx-auto pb-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8 pt-2 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{t('customer:notifications.title')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('customer:dashboard.messagesHint')}</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 px-3 py-2 text-xs font-bold">
            <Sparkles className="w-4 h-4" />
            {notifications.filter((n) => !n.isRead).length}
          </div>
        </div>

          {notifications.length === 0 ? (
            <div className="text-center py-14 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 mx-auto mb-4 flex items-center justify-center">
                <Bell className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-gray-500">{t('customer:notifications.empty')}</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition ${notification.isRead ? 'bg-white border-gray-100 shadow-sm' : 'bg-blue-50/80 border-blue-200 shadow-sm'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center border ${notification.isRead ? 'bg-gray-50 border-gray-100 text-gray-400' : 'bg-white border-blue-200 text-blue-600'}`}>
                      {notification.isRead ? <MailOpen className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1.5 mb-1">
                        <h3 className={`text-sm sm:text-base font-bold ${notification.isRead ? 'text-gray-800' : 'text-blue-900'}`}>
                          {notification.title}
                        </h3>
                        <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">{new Date(notification.date).toLocaleDateString(i18n.language === 'ur' ? 'ur-PK' : 'en-US')}</span>
                      </div>
                      <p className={`text-sm leading-relaxed ${notification.isRead ? 'text-gray-600' : 'text-blue-800'}`}>
                        {notification.message}
                      </p>
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="inline-flex items-center gap-1.5 text-blue-700 mt-3 text-xs sm:text-sm font-bold hover:text-blue-800"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          {t('customer:notifications.markAsRead')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </DashboardLayout>
  );
}
