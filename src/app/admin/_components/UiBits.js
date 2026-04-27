'use client';

import { AlertTriangle, CheckCircle2, Loader2, XCircle } from 'lucide-react';

function SkeletonBlock({ className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`} />;
}

export function TableSkeleton({ columns = 4, rows = 5, showActions = false }) {
  return (
    <div className="p-5 space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index} className="py-2 pr-3">
                  <SkeletonBlock className="h-4 w-24" />
                </th>
              ))}
              {showActions && (
                <th className="py-2 pr-3">
                  <SkeletonBlock className="h-4 w-20" />
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b border-slate-100">
                {Array.from({ length: columns }).map((__, colIndex) => (
                  <td key={colIndex} className="py-3 pr-3">
                    <SkeletonBlock className={`h-4 ${colIndex === 0 ? 'w-28' : colIndex === 1 ? 'w-36' : 'w-20'}`} />
                  </td>
                ))}
                {showActions && (
                  <td className="py-3 pr-3">
                    <div className="flex gap-2">
                      <SkeletonBlock className="h-8 w-16 rounded-lg" />
                      <SkeletonBlock className="h-8 w-16 rounded-lg" />
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <div className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-3">
                  <SkeletonBlock className="h-4 w-24" />
                  <SkeletonBlock className="h-8 w-20" />
                </div>
                <SkeletonBlock className="w-11 h-11 rounded-xl" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <div className="p-5 space-y-4">
            <SkeletonBlock className="h-6 w-40" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <SkeletonBlock className="h-4 w-32" />
                    <SkeletonBlock className="h-4 w-12" />
                  </div>
                  <SkeletonBlock className="h-2.5 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-5 space-y-4">
            <SkeletonBlock className="h-6 w-44" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <SkeletonBlock className="h-4 w-32" />
                  <SkeletonBlock className="h-2.5 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-8 text-slate-500">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

export function Toast({ toast, onClose }) {
  if (!toast) return null;

  const styles =
    toast.type === 'success'
      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
      : 'bg-rose-50 border-rose-200 text-rose-700';

  return (
    <div className={`fixed top-4 right-4 z-50 border rounded-xl px-4 py-3 shadow-lg ${styles}`}>
      <div className="flex items-center gap-2 text-sm font-semibold">
        {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
        <span>{toast.message}</span>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-500 text-xs"
      >
        x
      </button>
    </div>
  );
}

export function ConfirmModal({ open, title, message, confirmLabel = 'Confirm', onCancel, onConfirm, danger = true }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold">{title}</h3>
        </div>
        <p className="text-sm text-slate-600 mb-5">{message}</p>
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border border-slate-300 hover:bg-slate-100">
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-sm rounded-lg text-white ${danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Card({ children }) {
  return <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">{children}</div>;
}
