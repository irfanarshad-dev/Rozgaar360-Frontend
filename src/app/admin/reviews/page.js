'use client';

import { useCallback, useEffect, useState } from 'react';
import AdminShell from '../_components/AdminShell';
import { Card, ConfirmModal, TableSkeleton, Toast } from '../_components/UiBits';
import { adminRequest } from '../_lib/adminApi';

export default function AdminReviewsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [toast, setToast] = useState(null);
  const [confirmState, setConfirmState] = useState(null);

  const fetchReviews = useCallback(async (nextPage = page, nextSearch = search) => {
    try {
      setLoading(true);
      const res = await adminRequest('/admin/reviews', {
        query: { page: nextPage, limit, search: nextSearch },
      });
      setRows(res?.data || []);
      setTotal(res?.total || 0);
      setPage(res?.page || nextPage);
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Failed to load reviews.' });
    } finally {
      setLoading(false);
    }
  }, [page, search, limit]);

  useEffect(() => {
    fetchReviews(1, '');
  }, [fetchReviews]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const askDelete = (review) => {
    setConfirmState({
      type: 'delete',
      title: 'Delete Review',
      message: `Are you sure you want to delete this review? This action cannot be undone.`,
      review,
    });
  };

  const executeDelete = async () => {
    if (!confirmState?.review?._id) return;

    try {
      await adminRequest(`/admin/reviews/${confirmState.review._id}`, { method: 'DELETE' });
      setToast({ type: 'success', message: 'Review deleted successfully.' });
      setConfirmState(null);
      fetchReviews(page, search);
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Action failed.' });
      setConfirmState(null);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchReviews(1, search);
  };

  const renderStars = (rating) => {
    if (!rating) return '-';
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className={i < Math.round(rating) ? 'text-amber-500' : 'text-slate-300'}>
          ★
        </span>
      );
    }
    return <div className="flex gap-0.5">{stars}</div>;
  };

  return (
    <AdminShell
      title="Reviews"
      rightSlot={
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviews..."
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
        confirmLabel="Delete"
        onCancel={() => setConfirmState(null)}
        onConfirm={executeDelete}
        danger={true}
      />

      <Card>
        {loading ? (
          <TableSkeleton columns={5} rows={5} showActions />
        ) : (
          <>
            <div className="p-5 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-200">
                    <th className="py-2 pr-3">Customer</th>
                    <th className="py-2 pr-3">Worker</th>
                    <th className="py-2 pr-3">Rating</th>
                    <th className="py-2 pr-3">Comment</th>
                    <th className="py-2 pr-3">Date</th>
                    <th className="py-2 pr-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((review) => (
                    <tr key={review._id} className="border-b border-slate-100">
                      <td className="py-2 pr-3 font-medium">{review.customerId?.name || '-'}</td>
                      <td className="py-2 pr-3">{review.workerId?.name || '-'}</td>
                      <td className="py-2 pr-3">{renderStars(review.rating)}</td>
                      <td className="py-2 pr-3 max-w-xs text-slate-600 truncate">{review.comment || '-'}</td>
                      <td className="py-2 pr-3">{new Date(review.createdAt).toLocaleDateString()}</td>
                      <td className="py-2 pr-3">
                        <button
                          onClick={() => askDelete(review)}
                          className="px-2.5 py-1.5 rounded-lg text-xs bg-rose-100 text-rose-700 hover:bg-rose-200"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!rows.length && (
                    <tr>
                      <td className="py-3 text-slate-400" colSpan={6}>
                        No reviews found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-4 pb-5">
                <button
                  type="button"
                  onClick={() => {
                    setPage(Math.max(1, page - 1));
                    fetchReviews(Math.max(1, page - 1), search);
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
                    fetchReviews(Math.min(totalPages, page + 1), search);
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
      </Card>
    </AdminShell>
  );
}
