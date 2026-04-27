'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { LayoutDashboard, Users, UserCog, CalendarDays, Shapes, Star, LogOut } from 'lucide-react';

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

  const activeItem = useMemo(
    () => NAV_ITEMS.find((item) => pathname?.startsWith(item.href)) || NAV_ITEMS[0],
    [pathname],
  );

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiry');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      document.cookie = 'token=; path=/; max-age=0; SameSite=Lax';
    }
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-[1440px] grid grid-cols-1 lg:grid-cols-[260px_1fr] min-h-screen">
        <aside className="bg-white border-r border-slate-200 p-4 lg:p-6">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-widest text-blue-600 font-semibold">Admin Panel</p>
            <h1 className="text-xl font-black mt-1">Rozgaar360</h1>
          </div>

          <nav className="space-y-1.5">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const isActive = pathname?.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                      : 'text-slate-600 hover:bg-slate-100'
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
            className="mt-8 w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </aside>

        <main className="p-4 md:p-6 lg:p-8">
          <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Admin / {activeItem.label}</p>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900">{title}</h2>
            </div>
            {rightSlot}
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}
