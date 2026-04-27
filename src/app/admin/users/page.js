'use client';

import { useEffect, useState } from 'react';
import AdminShell from '../_components/AdminShell';
import { Card, ConfirmModal, TableSkeleton, Toast } from '../_components/UiBits';
import { adminRequest } from '../_lib/adminApi';

export default function AdminUsersPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [toast, setToast] = useState(null);
  const [confirmState, setConfirmState] = useState(null);

  const fetchUsers = async (nextPage = page, nextSearch = search) => {
    try {
      setLoading(true);
      const res = await adminRequest('/admin/users', {
        query: { page: nextPage, limit, search: nextSearch },
      });
      setRows(res?.data || []);
      setTotal(res?.total || 0);
      setPage(res?.page || nextPage);
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Failed to load users.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1, '');
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const askSuspend = (user) => {
    setConfirmState({
      type: 'suspend',
      title: user.isActive ? 'Suspend User' : 'Activate User',
      message: `Are you sure you want to ${user.isActive ? 'suspend' : 'activate'} ${user.name}?`,
      user,
    });
  };

  const askDelete = (user) => {
    setConfirmState({
      type: 'delete',
      title: 'Delete User',
      message: `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
      user,
    });
  };

  const executeConfirm = async () => {
    if (!confirmState?.user) return;

    try {
      if (confirmState.type === 'suspend') {
        await adminRequest(`/admin/users/${confirmState.user._id}/suspend`, { method: 'PATCH' });
        setToast({ type: 'success', message: 'User status updated successfully.' });
      }

      if (confirmState.type === 'delete') {
        await adminRequest(`/admin/users/${confirmState.user._id}`, { method: 'DELETE' });
        setToast({ type: 'success', message: 'User deleted successfully.' });
      }

      setConfirmState(null);
      fetchUsers(page, search);
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Action failed.' });
      setConfirmState(null);
    }
  };

  return (
    <AdminShell
      title="Users"
      rightSlot={
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm w-56"
          />
          <button
            type="button"
            onClick={() => fetchUsers(1, search)}
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
        confirmLabel={confirmState?.type === 'delete' ? 'Delete' : 'Confirm'}
        onCancel={() => setConfirmState(null)}
        onConfirm={executeConfirm}
        danger={confirmState?.type === 'delete'}
      />

      <Card>
        {loading ? (
          <TableSkeleton columns={5} rows={5} showActions />
        ) : (
          <div className="p-5 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Email</th>
                  <th className="py-2 pr-3">Phone</th>
                  <th className="py-2 pr-3">Joined Date</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((user) => (
                  <tr key={user._id} className="border-b border-slate-100">
                    <td className="py-2 pr-3 font-medium">{user.name}</td>
                    <td className="py-2 pr-3">{user.email || '-'}</td>
                    <td className="py-2 pr-3">{user.phone || '-'}</td>
                    <td className="py-2 pr-3">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="py-2 pr-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {user.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-2 pr-3">
                      <div className="flex gap-2">
                        <button onClick={() => askSuspend(user)} className="px-2.5 py-1.5 rounded-lg text-xs bg-amber-100 text-amber-700 hover:bg-amber-200">
                          {user.isActive ? 'Suspend' : 'Activate'}
                        </button>
                        <button onClick={() => askDelete(user)} className="px-2.5 py-1.5 rounded-lg text-xs bg-rose-100 text-rose-700 hover:bg-rose-200">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr>
                    <td className="py-3 text-slate-400" colSpan={6}>No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="mt-4 flex items-center justify-between text-sm">
              <p className="text-slate-500">Total: {total}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => fetchUsers(page - 1, search)}
                  className="px-3 py-1.5 rounded border border-slate-300 disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="font-medium">{page} / {totalPages}</span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => fetchUsers(page + 1, search)}
                  className="px-3 py-1.5 rounded border border-slate-300 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </AdminShell>
  );
}
