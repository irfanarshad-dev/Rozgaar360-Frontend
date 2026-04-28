'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { LayoutDashboard, Users, UserCog, CalendarDays, Shapes, Star, LogOut, Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/workers', label: 'Workers', icon: UserCog },
  { href: '/admin/bookings', label: 'Bookings', icon: CalendarDays },
  { href: '/admin/categories', label: 'Categories', icon: Shapes },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
];

export default function AdminShell({ title, children, rightSlot }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeItem = useMemo(
    () => NAV_ITEMS.find((item) => pathname?.startsWith(item.href)) || NAV_ITEMS[0],
    [pathname],
  );

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiry');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      document.cookie = 'token=; path=/; max-age=0; SameSite=Lax';
    }
    router.replace('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-blue-600 font-semibold">Admin Panel</p>
          <h1 className="text-lg font-black">Rozgaar360</h1>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="mx-auto max-w-[1440px] lg:grid lg:grid-cols-[260px_1fr] min-h-screen">
        {/* Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:static top-0 left-0 bottom-0 z-50 w-[280px] bg-white border-r border-slate-200 p-4 lg:p-6 transition-transform duration-300 ease-out lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Desktop Logo */}
          <div className="hidden lg:block mb-8">
            <p className="text-xs uppercase tracking-widest text-blue-600 font-semibold">Admin Panel</p>
            <h1 className="text-xl font-black mt-1">Rozgaar360</h1>
          </div>

          {/* Mobile Header in Sidebar */}
          <div className="lg:hidden flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
            <div>
              <p className="text-xs uppercase tracking-widest text-blue-600 font-semibold">Admin Panel</p>
              <h1 className="text-lg font-black mt-1">Rozgaar360</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1.5">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const isActive = pathname?.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                      : 'text-slate-600 hover:bg-slate-100 active:bg-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-8 w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </aside>

        <main className="p-4 md:p-6 lg:p-8">
          <header className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold truncate">
                Admin / {activeItem.label}
              </p>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 truncate">{title}</h2>
            </div>
            {rightSlot && <div className="flex-shrink-0">{rightSlot}</div>}
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}
