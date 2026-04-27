'use client';

import { useEffect, useMemo, useState } from 'react';
import { Users, UserCog, CalendarCheck2, Wallet } from 'lucide-react';
import AdminShell from '../_components/AdminShell';
import { DashboardSkeleton, Card, Toast } from '../_components/UiBits';
import { adminRequest } from '../_lib/adminApi';

function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <Card>
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">{label}</p>
            <p className="text-2xl font-black mt-1">{value}</p>
          </div>
          <div className={`w-11 h-11 rounded-xl ${accent} flex items-center justify-center`}>
            <Icon className="w-5 h-5" />
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
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
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
              <div className="p-5">
                <h3 className="text-lg font-bold mb-4">Recent Bookings</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-500 border-b border-slate-200">
                        <th className="py-2 pr-3">Customer</th>
                        <th className="py-2 pr-3">Worker</th>
                        <th className="py-2 pr-3">Category</th>
                        <th className="py-2 pr-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(stats?.recentBookings || []).map((booking) => (
                        <tr key={booking._id} className="border-b border-slate-100">
                          <td className="py-2 pr-3">{booking.customerId?.name || '-'}</td>
                          <td className="py-2 pr-3">{booking.workerId?.name || '-'}</td>
                          <td className="py-2 pr-3">{booking.service || '-'}</td>
                          <td className="py-2 pr-3 capitalize">{booking.status || '-'}</td>
                        </tr>
                      ))}
                      {!stats?.recentBookings?.length && (
                        <tr>
                          <td className="py-3 text-slate-400" colSpan={4}>No bookings found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-5">
                <h3 className="text-lg font-bold mb-4">Bookings By Category</h3>
                <div className="space-y-3">
                  {(stats?.bookingsByCategory || []).map((item) => (
                    <div key={item.category || 'unknown'}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-slate-700">{item.category || 'Uncategorized'}</span>
                        <span className="text-slate-500">{item.count}</span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${Math.max(8, (item.count / maxBar) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {!stats?.bookingsByCategory?.length && (
                    <p className="text-sm text-slate-400">No category data available.</p>
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
