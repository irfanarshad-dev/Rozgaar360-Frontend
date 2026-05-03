'use client';

import { useCallback, useEffect, useState } from 'react';
import AdminShell from '../_components/AdminShell';
import { Card, ConfirmModal, TableSkeleton, Toast } from '../_components/UiBits';
import { adminRequest } from '../_lib/adminApi';

const STATUS_TABS = ['pending', 'active', 'suspended'];

function DocumentsModal({ open, onClose, workerId }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !workerId) return;
    const fetchDocs = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await adminRequest(`/admin/workers/${workerId}/documents`);
        setData(res);
      } catch (err) {
        setError(err.message || 'Failed to load documents');
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, [open, workerId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Worker Verification Documents</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
        </div>
        <div className="p-6">
          {loading && <div className="text-center py-8 text-slate-500">Loading documents...</div>}
          {error && <div className="text-center py-8 text-rose-600">{error}</div>}
          {data && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold text-slate-700 mb-2">Worker Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-slate-500">Name:</span> <span className="font-medium">{data.worker?.name}</span></div>
                  <div><span className="text-slate-500">Email:</span> <span className="font-medium">{data.worker?.email || '-'}</span></div>
                  <div><span className="text-slate-500">Phone:</span> <span className="font-medium">{data.worker?.phone || '-'}</span></div>
                  <div>
                    <span className="text-slate-500">Status:</span>{' '}
                    <span className={`font-medium capitalize ${
                      data.documents?.verificationStatus === 'approved' ? 'text-emerald-600' :
                      data.documents?.verificationStatus === 'rejected' ? 'text-rose-600' :
                      'text-amber-600'
                    }`}>
                      {data.documents?.verificationStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-700 mb-3">CNIC Documents</h3>
                {!data.documents?.cnicFrontUrl && !data.documents?.cnicBackUrl ? (
                  <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg">No documents uploaded yet</div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {data.documents?.cnicFrontUrl && (
                      <div>
                        <p className="text-sm font-medium text-slate-600 mb-2">CNIC Front</p>
                        <a href={data.documents.cnicFrontUrl} target="_blank" rel="noopener noreferrer" className="block">
                          <img
                            src={data.documents.cnicFrontUrl}
                            alt="CNIC Front"
                            className="w-full h-auto rounded-lg border border-slate-200 hover:border-blue-400 transition-colors cursor-pointer"
                          />
                        </a>
                      </div>
                    )}
                    {data.documents?.cnicBackUrl && (
                      <div>
                        <p className="text-sm font-medium text-slate-600 mb-2">CNIC Back</p>
                        <a href={data.documents.cnicBackUrl} target="_blank" rel="noopener noreferrer" className="block">
                          <img
                            src={data.documents.cnicBackUrl}
                            alt="CNIC Back"
                            className="w-full h-auto rounded-lg border border-slate-200 hover:border-blue-400 transition-colors cursor-pointer"
                          />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminWorkersPage() {
  const [tab, setTab] = useState('pending');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [confirmState, setConfirmState] = useState(null);
  const [docsModal, setDocsModal] = useState({ open: false, workerId: null });

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
      <DocumentsModal
        open={docsModal.open}
        onClose={() => setDocsModal({ open: false, workerId: null })}
        workerId={docsModal.workerId}
      />
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
                    <th className="py-2 pr-3">Documents</th>
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
                        <button
                          onClick={() => setDocsModal({ open: true, workerId: worker._id })}
                          className="px-2.5 py-1.5 rounded-lg text-xs bg-blue-100 text-blue-700 hover:bg-blue-200"
                        >
                          View Docs
                        </button>
                      </td>
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
                      <td className="py-3 text-slate-400" colSpan={7}>No workers found.</td>
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
