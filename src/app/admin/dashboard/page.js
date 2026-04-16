'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import api from '@/lib/axios';

export default function AdminDashboard() {
  const [profile, setProfile]   = useState(null);
  const [stats, setStats]       = useState(null);
  const [pending, setPending]   = useState([]);
  const [allWorkers, setAllWorkers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState('verifications');
  const [toast, setToast]       = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const router = useRouter();

  // ── Auth guard ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const user = authService.getUser();
    if (!user || user.role !== 'admin') {
      router.replace('/admin/login');
      return;
    }
    setAuthChecked(true);
  }, [router]);

  // ── Fetch data (only after auth check passes) ────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [profileRes, statsRes, pendingRes, workersRes, usersRes] = await Promise.all([
        api.get('/api/users/me'),
        api.get('/api/admin/dashboard'),
        api.get('/api/admin/verifications/pending'),
        api.get('/api/admin/workers'),
        api.get('/api/admin/users'),
      ]);
      setProfile(profileRes.data);
      setStats(statsRes.data);
      console.log('[Frontend] Pending verifications data:', pendingRes.data);
      setPending(pendingRes.data || []);
      setAllWorkers(workersRes.data || []);
      setAllUsers(usersRes.data || []);
    } catch (err) {
      console.error('Admin data fetch failed:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.replace('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (authChecked) fetchData();
  }, [authChecked, fetchData]);

  // ── Actions ──────────────────────────────────────────────────────────────────
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleVerification = async (userId, status) => {
    console.log('[Frontend] Verifying user:', userId, 'Status:', status);
    try {
      await api.put(`/api/admin/verify/${userId}`, { status });
      setPending(prev => prev.filter(u => u.userId?._id !== userId && u._id !== userId));
      setStats(prev => prev ? { ...prev, pendingVerifications: Math.max(0, prev.pendingVerifications - 1) } : prev);
      showToast(`Worker ${status} successfully!`, status === 'approved' ? 'success' : 'error');
      // Refresh data to update counts
      fetchData();
    } catch (err) {
      console.error('Verification error:', err);
      console.error('Error response:', err.response?.data);
      showToast(err.response?.data?.message || 'Action failed. Please try again.', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/api/admin/users/${userId}`);
      setAllUsers(prev => prev.filter(u => u._id !== userId));
      setStats(prev => {
        if (!prev) return prev;
        const deletedUser = allUsers.find(u => u._id === userId);
        return {
          ...prev,
          totalUsers: Math.max(0, prev.totalUsers - 1),
          totalWorkers: deletedUser?.role === 'worker' ? Math.max(0, prev.totalWorkers - 1) : prev.totalWorkers,
          totalCustomers: deletedUser?.role === 'customer' ? Math.max(0, prev.totalCustomers - 1) : prev.totalCustomers,
        };
      });
      setDeleteConfirm(null);
      showToast('User deleted successfully!', 'success');
    } catch (err) {
      console.error('Delete error:', err);
      showToast(err.response?.data?.message || 'Delete failed. Please try again.', 'error');
      setDeleteConfirm(null);
    }
  };

  const handleLogout = () => {
    authService.clearTokens();
    router.replace('/admin/login');
  };

  // ── Loading / unauthed ────────────────────────────────────────────────────────
  if (!authChecked || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950" />
        <div className="relative flex flex-col items-center gap-4 text-white">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl flex items-center justify-center animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <svg className="animate-spin h-10 w-10 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-lg font-medium text-white/70">
            {!authChecked ? 'Checking authentication…' : 'Loading dashboard…'}
          </p>
        </div>
      </div>
    );
  }

  const StatCard = ({ label, value, icon, color }) => (
    <div className="group relative bg-slate-900/40 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-200 overflow-hidden hover:scale-[1.02]">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative">
        <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-3 transform group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">{label}</p>
        <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 pointer-events-none" />

      {/* Compact Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg font-medium text-white shadow-lg backdrop-blur-sm border transition-all ${
          toast.type === 'success' 
            ? 'bg-emerald-500/90 border-emerald-400/50' 
            : 'bg-red-500/90 border-red-400/50'
        }`}>
          <div className="flex items-center gap-2 text-sm">
            {toast.type === 'success' ? '✓' : '⚠'}
            {toast.msg}
          </div>
        </div>
      )}

      <div className="bg-slate-900/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">Rozgaar360</h1>
                <p className="text-blue-400 text-xs">Admin</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 text-white/70 text-sm">
                <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                {profile?.name}
              </div>
              <button onClick={fetchData} title="Refresh"
                className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-white/70 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button onClick={handleLogout}
                className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm font-medium">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 relative">

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          <StatCard label="Users" value={stats?.totalUsers} color="bg-gradient-to-br from-blue-500 to-blue-600" 
            icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" /></svg>} />
          <StatCard label="Workers" value={stats?.totalWorkers} color="bg-gradient-to-br from-green-500 to-emerald-600" 
            icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01" /></svg>} />
          <StatCard label="Customers" value={stats?.totalCustomers} color="bg-gradient-to-br from-blue-500 to-cyan-600" 
            icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} />
          <StatCard label="Verified" value={stats?.verifiedWorkers} color="bg-gradient-to-br from-emerald-500 to-teal-600" 
            icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
          <StatCard label="Pending" value={stats?.pendingVerifications} color="bg-gradient-to-br from-orange-500 to-red-600" 
            icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'verifications', label: 'Pending', count: pending.length, icon: '⏳' },
            { id: 'workers', label: 'Workers', count: allWorkers.length, icon: '👷' },
            { id: 'users', label: 'Users', count: allUsers.length, icon: '👥' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                  : 'bg-slate-900/40 text-white/60 hover:text-white hover:bg-slate-900/60'
              }`}>
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
              <span className="text-xs opacity-75">({tab.count})</span>
            </button>
          ))}
        </div>

        {activeTab === 'verifications' && (
          <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl border border-white/10 p-4 md:p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Workers Awaiting Verification
            </h2>

            {pending.length === 0 ? (
              <div className="text-center py-16">
                <svg className="w-16 h-16 text-emerald-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-white font-semibold text-lg">All clear!</p>
                <p className="text-gray-400 text-sm mt-1">No pending verifications at the moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pending.map((item) => {
                  const user = item.userId || item;
                  const profileData = item.userId ? item : null;
                  return (
                    <div key={item._id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-lg">{user.name?.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-bold text-[16px]">{user.name}</h3>
                            <div className="flex flex-wrap gap-3 mt-2 text-sm">
                              <span className="text-gray-400">📞 {user.phone}</span>
                              <span className="text-gray-400">📍 {user.city}</span>
                              {profileData?.skill && <span className="text-gray-400">🔧 {profileData.skill}</span>}
                              {profileData?.experience != null && <span className="text-gray-400">⏱ {profileData.experience} yrs exp</span>}
                            </div>

                            {/* CNIC Images */}
                            {(profileData?.cnicFrontUrl || profileData?.cnicBackUrl) && (
                              <div className="flex gap-3 mt-3">
                                {profileData.cnicFrontUrl && (
                                  <a href={profileData.cnicFrontUrl} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs border border-blue-400/30 px-2 py-1 rounded-lg transition-colors">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    CNIC Front
                                  </a>
                                )}
                                {profileData.cnicBackUrl && (
                                  <a href={profileData.cnicBackUrl} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs border border-blue-400/30 px-2 py-1 rounded-lg transition-colors">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    CNIC Back
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-3 flex-shrink-0">
                          <button onClick={() => handleVerification(user._id, 'approved')}
                            className="bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-500/30 px-5 py-2.5 rounded-xl font-semibold transition-all text-sm flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            Approve
                          </button>
                          <button onClick={() => handleVerification(user._id, 'rejected')}
                            className="bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/30 px-5 py-2.5 rounded-xl font-semibold transition-all text-sm flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'workers' && (
          <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl border border-white/10 p-4 md:p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
              </svg>
              All Registered Workers
            </h2>

            {allWorkers.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-400">No workers registered yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-white/10">
                      <th className="text-left py-3 px-4 font-semibold">Name</th>
                      <th className="text-left py-3 px-4 font-semibold">Phone</th>
                      <th className="text-left py-3 px-4 font-semibold">City</th>
                      <th className="text-left py-3 px-4 font-semibold">Skill</th>
                      <th className="text-left py-3 px-4 font-semibold">Rating</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {allWorkers.map((w) => (
                      <tr key={w._id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {w.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-white font-medium truncate max-w-[120px]">{w.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-300">{w.phone}</td>
                        <td className="py-3 px-4 text-gray-300">{w.city}</td>
                        <td className="py-3 px-4 text-gray-300">{w.profile?.skill || '—'}</td>
                        <td className="py-3 px-4">
                          <span className="text-amber-400 font-semibold">
                            {w.profile?.rating > 0 ? `⭐ ${w.profile.rating.toFixed(1)}` : '—'}
                          </span>
                          {w.profile?.reviewCount > 0 && (
                            <span className="text-gray-500 text-xs ml-1">({w.profile.reviewCount})</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            w.profile?.verified
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : w.profile?.verificationStatus === 'rejected'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                          }`}>
                            {w.profile?.verified ? '✓ Verified' : w.profile?.verificationStatus || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl border border-white/10 p-4 md:p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              All Registered Users
            </h2>

            {allUsers.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-400">No users registered yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-white/10">
                      <th className="text-left py-3 px-4 font-semibold">Name</th>
                      <th className="text-left py-3 px-4 font-semibold">Phone</th>
                      <th className="text-left py-3 px-4 font-semibold">Role</th>
                      <th className="text-left py-3 px-4 font-semibold">City</th>
                      <th className="text-left py-3 px-4 font-semibold">Details</th>
                      <th className="text-left py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {allUsers.map((u) => (
                      <tr key={u._id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                              u.role === 'admin' ? 'bg-gradient-to-r from-blue-600 to-blue-500' :
                              u.role === 'worker' ? 'bg-gradient-to-r from-blue-500 to-violet-500' :
                              'bg-gradient-to-r from-green-500 to-teal-500'
                            }`}>
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-white font-medium truncate max-w-[120px]">{u.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-300">{u.phone}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            u.role === 'admin' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                            u.role === 'worker' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                            'bg-green-500/20 text-green-300 border border-green-500/30'
                          }`}>
                            {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-300">{u.city}</td>
                        <td className="py-3 px-4 text-gray-300 text-xs">
                          {u.role === 'worker' && u.profile && (
                            <div className="flex flex-col gap-1">
                              <span>🔧 {u.profile.skill}</span>
                              {u.profile.experience && <span>⏱ {u.profile.experience} yrs</span>}
                              {u.profile.rating > 0 && <span>⭐ {u.profile.rating.toFixed(1)}</span>}
                            </div>
                          )}
                          {u.role === 'customer' && u.profile?.address && (
                            <span>📍 {u.profile.address}</span>
                          )}
                          {u.role === 'admin' && <span className="text-blue-400">Admin User</span>}
                        </td>
                        <td className="py-3 px-4">
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => setDeleteConfirm(u)}
                              className="bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/30 px-3 py-1.5 rounded-lg font-semibold transition-all text-xs flex items-center gap-1.5"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 border border-white/20 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Confirm Delete</h3>
                <p className="text-gray-400 text-sm">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete <strong className="text-white">{deleteConfirm.name}</strong>?
              <br />
              <span className="text-sm text-gray-400">Role: {deleteConfirm.role} • Phone: {deleteConfirm.phone}</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(deleteConfirm._id)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl font-semibold transition-colors"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}