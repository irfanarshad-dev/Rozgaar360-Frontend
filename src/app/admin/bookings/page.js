'use client';

import { useCallback, useEffect, useState } from 'react';
import AdminShell from '../_components/AdminShell';
import { Card, ConfirmModal, TableSkeleton, Toast } from '../_components/UiBits';
import { adminRequest } from '../_lib/adminApi';

const STATUS_TABS = ['pending', 'confirmed', 'completed', 'cancelled'];

export default function AdminBookingsPage() {
  const [tab, setTab] = useState('pending');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [toast, setToast] = useState(null);
  const [confirmState, setConfirmState] = useState(null);

  const fetchBookings = useCallback(async (nextPage = page, nextSearch = search, status = tab) => {
    try {
      setLoading(true);
      const res = await adminRequest('/admin/bookings', {
        query: { page: nextPage, limit, search: nextSearch, status },
      });
      setRows(res?.data || []);
      setTotal(res?.total || 0);
      setPage(res?.page || nextPage);
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Failed to load bookings.' });
    } finally {
      setLoading(false);
    }
  }, [page, search, tab, limit]);

  useEffect(() => {
    setPage(1);
    fetchBookings(1, search, tab);
  }, [fetchBookings, search, tab]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const askCancel = (booking) => {
    setConfirmState({
      type: 'cancel',
      title: 'Cancel Booking',
      message: `Are you sure you want to cancel this booking? Customer: ${booking.customerId?.name || 'Unknown'}`,
      booking,
    });
  };

  const executeConfirm = async () => {
    if (!confirmState?.booking?._id) return;

    try {
      if (confirmState.type === 'cancel') {
        await adminRequest(`/admin/bookings/${confirmState.booking._id}/cancel`, { method: 'PATCH' });
        setToast({ type: 'success', message: 'Booking cancelled successfully.' });
      }
      setConfirmState(null);
      fetchBookings(page, search, tab);
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Action failed.' });
      setConfirmState(null);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchBookings(1, search, tab);
  };

  return (
    <AdminShell
      title="Bookings"
      rightSlot={
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bookings..."
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm w-56"
          />
          <button
            type="button"
            onClick={handleSearch}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
          >
            Search
          </button>
        </div>
      }
    >
      <Toast toast={toast} onClose={() => setToast(null)} />

      <ConfirmModal
        open={!!confirmState}
        title={confirmState?.title || 'Confirm'}
        message={confirmState?.message || ''}
        confirmLabel="Cancel"
        onCancel={() => setConfirmState(null)}
        onConfirm={executeConfirm}
        danger={true}
      />

      <Card>
        <div className="p-5 space-y-4">
          <div className="flex flex-wrap gap-2">
            {STATUS_TABS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setTab(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold capitalize ${
                  tab === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {loading ? (
            <TableSkeleton columns={6} rows={5} showActions />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500 border-b border-slate-200">
                      <th className="py-2 pr-3">Customer</th>
                      <th className="py-2 pr-3">Worker</th>
                      <th className="py-2 pr-3">Category</th>
                      <th className="py-2 pr-3">Date</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2 pr-3">Amount</th>
                      <th className="py-2 pr-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((booking) => (
                      <tr key={booking._id} className="border-b border-slate-100">
                        <td className="py-2 pr-3 font-medium">{booking.customerId?.name || '-'}</td>
                        <td className="py-2 pr-3">{booking.workerId?.name || '-'}</td>
                        <td className="py-2 pr-3">{booking.categoryId?.name || '-'}</td>
                        <td className="py-2 pr-3">{new Date(booking.date).toLocaleDateString()}</td>
                        <td className="py-2 pr-3 capitalize">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              booking.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-700'
                                : booking.status === 'cancelled'
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="py-2 pr-3">PKR {booking.amount || 0}</td>
                        <td className="py-2 pr-3">
                          {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                            <button
                              onClick={() => askCancel(booking)}
                              className="px-2.5 py-1.5 rounded-lg text-xs bg-rose-100 text-rose-700 hover:bg-rose-200"
                            >
                              Cancel
                            </button>
                          )}
                          {(booking.status === 'completed' || booking.status === 'cancelled') && (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {!rows.length && (
                      <tr>
                        <td className="py-3 text-slate-400" colSpan={7}>
                          No bookings found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setPage(Math.max(1, page - 1));
                      fetchBookings(Math.max(1, page - 1), search, tab);
                    }}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg text-sm bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-slate-600">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setPage(Math.min(totalPages, page + 1));
                      fetchBookings(Math.min(totalPages, page + 1), search, tab);
                    }}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 rounded-lg text-sm bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </AdminShell>
  );
}
