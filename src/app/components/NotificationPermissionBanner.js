'use client';
import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';

export default function NotificationPermissionBanner() {
  const [show, setShow] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    // iOS Safari: no Notification API — skip entirely
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    const alreadyGranted =
      Notification.permission === 'granted' ||
      localStorage.getItem('chatNotifPermission') === 'granted';

    if (!alreadyGranted && Notification.permission !== 'denied') {
      setShow(true);
    }
  }, []);

  const handleAllow = async () => {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      localStorage.setItem('chatNotifPermission', 'granted');
      setShow(false);
    } else {
      setDenied(true);
      setShow(false);
    }
  };

  const handleLater = () => setShow(false);

  if (denied) {
    return (
      <div className="mx-4 mb-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-2">
        <span className="text-xs text-gray-500 flex-1">
          Chat works without notifications, but you won&apos;t get alerts for new messages.
        </span>
        <button onClick={() => setDenied(false)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  if (!show) return null;

  return (
    <div className="mx-4 mb-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3 shadow-sm">
      <Bell className="w-5 h-5 text-blue-500 flex-shrink-0" />
      <span className="text-sm text-blue-800 flex-1">
        Allow notifications to receive chat messages
      </span>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={handleAllow}
          style={{ minHeight: '44px', minWidth: '64px' }}
          className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 active:scale-95 transition-all"
        >
          Allow
        </button>
        <button
          onClick={handleLater}
          style={{ minHeight: '44px', minWidth: '64px' }}
          className="px-3 py-2 bg-white text-gray-600 text-sm font-medium rounded-xl border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all"
        >
          Later
        </button>
      </div>
    </div>
  );
}
