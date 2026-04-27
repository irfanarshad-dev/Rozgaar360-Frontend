'use client';

import { useEffect, useState } from 'react';
import AdminShell from '../_components/AdminShell';
import { Card, ConfirmModal, TableSkeleton, Toast } from '../_components/UiBits';
import { adminRequest } from '../_lib/adminApi';

export default function AdminCategoriesPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [confirmState, setConfirmState] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', icon: '', description: '' });
  const [editingId, setEditingId] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await adminRequest('/admin/categories', { query: { page: 1, limit: 100 } });
      setRows(res?.data || []);
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Failed to load categories.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({ name: '', icon: '', description: '' });
    setEditingId(null);
    setModalOpen(true);
  };

  const openEditModal = (category) => {
    setIsEditing(true);
    setFormData({ name: category.name, icon: category.icon || '', description: category.description || '' });
    setEditingId(category._id);
    setModalOpen(true);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const submitForm = async () => {
    if (!formData.name.trim()) {
      setToast({ type: 'error', message: 'Category name is required.' });
      return;
    }

    try {
      if (isEditing && editingId) {
        await adminRequest(`/admin/categories/${editingId}`, {
          method: 'PATCH',
          data: formData,
        });
        setToast({ type: 'success', message: 'Category updated successfully.' });
      } else {
        await adminRequest('/admin/categories', {
          method: 'POST',
          data: formData,
        });
        setToast({ type: 'success', message: 'Category created successfully.' });
      }
      setModalOpen(false);
      fetchCategories();
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Failed to save category.' });
    }
  };

  const askDelete = (category) => {
    setConfirmState({
      type: 'delete',
      title: 'Delete Category',
      message: `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      category,
    });
  };

  const executeDelete = async () => {
    if (!confirmState?.category?._id) return;

    try {
      await adminRequest(`/admin/categories/${confirmState.category._id}`, { method: 'DELETE' });
      setToast({ type: 'success', message: 'Category deleted successfully.' });
      setConfirmState(null);
      fetchCategories();
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Failed to delete category.' });
      setConfirmState(null);
    }
  };

  return (
    <AdminShell
      title="Categories"
      rightSlot={
        <button
          type="button"
          onClick={openAddModal}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
        >
          + Add Category
        </button>
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

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">{isEditing ? 'Edit Category' : 'Add New Category'}</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="e.g., Plumbing"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Icon (Emoji or name)</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => handleFormChange('icon', e.target.value)}
                  placeholder="e.g., 🔧 or wrench"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  placeholder="Brief description of this category..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitForm}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
              >
                {isEditing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Card>
        {loading ? (
          <TableSkeleton columns={3} rows={5} showActions />
        ) : (
          <div className="p-5 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-2 pr-3">Icon</th>
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Description</th>
                  <th className="py-2 pr-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((category) => (
                  <tr key={category._id} className="border-b border-slate-100">
                    <td className="py-2 pr-3 text-lg">{category.icon || '-'}</td>
                    <td className="py-2 pr-3 font-medium">{category.name}</td>
                    <td className="py-2 pr-3 text-slate-600">{category.description || '-'}</td>
                    <td className="py-2 pr-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(category)}
                          className="px-2.5 py-1.5 rounded-lg text-xs bg-blue-100 text-blue-700 hover:bg-blue-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => askDelete(category)}
                          className="px-2.5 py-1.5 rounded-lg text-xs bg-rose-100 text-rose-700 hover:bg-rose-200"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr>
                    <td className="py-3 text-slate-400" colSpan={4}>
                      No categories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AdminShell>
  );
}
