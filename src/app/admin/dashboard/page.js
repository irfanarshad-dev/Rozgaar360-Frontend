'use client';

import { useEffect, useMemo, useState } from 'react';
import { Users, UserCog, CalendarCheck2, Wallet } from 'lucide-react';
import AdminShell from '../_components/AdminShell';
import { DashboardSkeleton, Card, Toast } from '../_components/UiBits';
import { adminRequest } from '../_lib/adminApi';

function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <Card>
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">{label}</p>
            <p className="text-xl sm:text-2xl font-black mt-1 truncate">{value}</p>
          </div>
          <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${accent} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await adminRequest('/admin/stats');
      setStats(data);
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Failed to load dashboard.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const maxBar = useMemo(() => {
    if (!stats?.bookingsByCategory?.length) return 1;
    return Math.max(...stats.bookingsByCategory.map((x) => x.count), 1);
  }, [stats]);

  return (
    <AdminShell
      title="Admin Dashboard"
      rightSlot={
        <button
          type="button"
          onClick={fetchStats}
          className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors"
        >
          Refresh
        </button>
      }
    >
      <Toast toast={toast} onClose={() => setToast(null)} />

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard label="Total Users" value={stats?.totalUsers || 0} icon={Users} accent="bg-blue-100 text-blue-700" />
            <StatCard label="Total Workers" value={stats?.totalWorkers || 0} icon={UserCog} accent="bg-emerald-100 text-emerald-700" />
            <StatCard label="Active Bookings" value={stats?.activeBookings || 0} icon={CalendarCheck2} accent="bg-amber-100 text-amber-700" />
            <StatCard label="Total Revenue" value={`Rs. ${(stats?.totalRevenue || 0).toLocaleString()}`} icon={Wallet} accent="bg-violet-100 text-violet-700" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Card>
              <div className="p-4 sm:p-5">
                <h3 className="text-base sm:text-lg font-bold mb-4">Recent Bookings</h3>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full text-xs sm:text-sm">
                      <thead>
                        <tr className="text-left text-slate-500 border-b border-slate-200">
                          <th className="py-2 px-2 sm:px-0 sm:pr-3">Customer</th>
                          <th className="py-2 px-2 sm:px-0 sm:pr-3">Worker</th>
                          <th className="py-2 px-2 sm:px-0 sm:pr-3">Category</th>
                          <th className="py-2 px-2 sm:px-0 sm:pr-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(stats?.recentBookings || []).map((booking) => (
                          <tr key={booking._id} className="border-b border-slate-100">
                            <td className="py-2 px-2 sm:px-0 sm:pr-3 truncate max-w-[100px]">{booking.customerId?.name || '-'}</td>
                            <td className="py-2 px-2 sm:px-0 sm:pr-3 truncate max-w-[100px]">{booking.workerId?.name || '-'}</td>
                            <td className="py-2 px-2 sm:px-0 sm:pr-3 truncate max-w-[80px]">{booking.service || '-'}</td>
                            <td className="py-2 px-2 sm:px-0 sm:pr-3 capitalize">{booking.status || '-'}</td>
                          </tr>
                        ))}
                        {!stats?.recentBookings?.length && (
                          <tr>
                            <td className="py-3 px-2 sm:px-0 text-slate-400" colSpan={4}>No bookings found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-4 sm:p-5">
                <h3 className="text-base sm:text-lg font-bold mb-4">Bookings By Category</h3>
                <div className="space-y-3">
                  {(stats?.bookingsByCategory || []).map((item) => (
                    <div key={item.category || 'unknown'}>
                      <div className="flex justify-between text-xs sm:text-sm mb-1 gap-2">
                        <span className="font-medium text-slate-700 truncate">{item.category || 'Uncategorized'}</span>
                        <span className="text-slate-500 flex-shrink-0">{item.count}</span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-300"
                          style={{ width: `${Math.max(8, (item.count / maxBar) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {!stats?.bookingsByCategory?.length && (
                    <p className="text-xs sm:text-sm text-slate-400">No category data available.</p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
