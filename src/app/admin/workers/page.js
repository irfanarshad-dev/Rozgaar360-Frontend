'use client';

import { useCallback, useEffect, useState } from 'react';
import AdminShell from '../_components/AdminShell';
import { Card, ConfirmModal, TableSkeleton, Toast } from '../_components/UiBits';
import { adminRequest } from '../_lib/adminApi';

const STATUS_TABS = ['pending', 'active', 'suspended'];

export default function AdminWorkersPage() {
  const [tab, setTab] = useState('pending');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [confirmState, setConfirmState] = useState(null);

  const fetchWorkers = useCallback(async (status = tab) => {
    try {
      setLoading(true);
      const res = await adminRequest('/admin/workers', { query: { status, page: 1, limit: 50 } });
      setRows(res?.data || []);
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Failed to load workers.' });
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchWorkers(tab);
  }, [fetchWorkers, tab]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const confirmAction = (type, worker) => {
    const map = {
      approve: `Approve ${worker.name}?`,
      suspend: `Suspend ${worker.name}?`,
      delete: `Delete ${worker.name}? This cannot be undone.`,
    };
    setConfirmState({ type, worker, title: 'Confirm Action', message: map[type] });
  };

  const executeAction = async () => {
    if (!confirmState?.worker?._id) return;
    const id = confirmState.worker._id;

    try {
      if (confirmState.type === 'approve') {
        await adminRequest(`/admin/workers/${id}/approve`, { method: 'PATCH' });
        setToast({ type: 'success', message: 'Worker approved successfully.' });
      }
      if (confirmState.type === 'suspend') {
        await adminRequest(`/admin/workers/${id}/suspend`, { method: 'PATCH' });
        setToast({ type: 'success', message: 'Worker suspended successfully.' });
      }
      if (confirmState.type === 'delete') {
        await adminRequest(`/admin/workers/${id}`, { method: 'DELETE' });
        setToast({ type: 'success', message: 'Worker deleted successfully.' });
      }
      setConfirmState(null);
      fetchWorkers(tab);
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Action failed.' });
      setConfirmState(null);
    }
  };

  return (
    <AdminShell title="Workers">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <ConfirmModal
        open={!!confirmState}
        title={confirmState?.title || 'Confirm'}
        message={confirmState?.message || ''}
        onCancel={() => setConfirmState(null)}
        onConfirm={executeAction}
        confirmLabel={confirmState?.type === 'delete' ? 'Delete' : 'Confirm'}
        danger={confirmState?.type === 'delete'}
      />

      <Card>
        <div className="p-5 space-y-4">
          <div className="flex flex-wrap gap-2">
            {STATUS_TABS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setTab(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold capitalize ${tab === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {s}
              </button>
            ))}
          </div>

          {loading ? (
            <TableSkeleton columns={5} rows={5} showActions />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-200">
                    <th className="py-2 pr-3">Name</th>
                    <th className="py-2 pr-3">Email</th>
                    <th className="py-2 pr-3">Skills</th>
                    <th className="py-2 pr-3">Rating</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((worker) => (
                    <tr key={worker._id} className="border-b border-slate-100">
                      <td className="py-2 pr-3 font-medium">{worker.name}</td>
                      <td className="py-2 pr-3">{worker.email || '-'}</td>
                      <td className="py-2 pr-3">{worker.profile?.skill || '-'}</td>
                      <td className="py-2 pr-3">{worker.profile?.rating ? worker.profile.rating.toFixed(1) : '0.0'}</td>
                      <td className="py-2 pr-3 capitalize">{worker.status || '-'}</td>
                      <td className="py-2 pr-3">
                        <div className="flex gap-2">
                          <button onClick={() => confirmAction('approve', worker)} className="px-2.5 py-1.5 rounded-lg text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
                            Approve
                          </button>
                          <button onClick={() => confirmAction('suspend', worker)} className="px-2.5 py-1.5 rounded-lg text-xs bg-amber-100 text-amber-700 hover:bg-amber-200">
                            Suspend
                          </button>
                          <button onClick={() => confirmAction('delete', worker)} className="px-2.5 py-1.5 rounded-lg text-xs bg-rose-100 text-rose-700 hover:bg-rose-200">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!rows.length && (
                    <tr>
                      <td className="py-3 text-slate-400" colSpan={6}>No workers found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </AdminShell>
  );
}
