'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import api from '@/lib/axios';
import DashboardLayout from '@/app/components/ui/DashboardLayout';
import Card, { CardBody } from '@/app/components/ui/Card';
import Badge from '@/app/components/ui/Badge';
import { SkeletonStatCard } from '@/app/components/ui/SkeletonCard';
import UploadCNIC from '../../components/UploadCNIC';
import EditProfile from '../../components/EditProfile';
import { CalendarClock, CheckCircle, Briefcase, ChevronRight, UserCircle, Phone, MapPin, Wrench, ShieldCheck } from 'lucide-react';

export default function WorkerDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    isAvailableNow: true,
    serviceRadiusKm: 10,
    responseRate: 100,
    weeklySchedule: [
      { day: 'Monday', enabled: true, start: '09:00', end: '18:00' },
      { day: 'Tuesday', enabled: true, start: '09:00', end: '18:00' },
      { day: 'Wednesday', enabled: true, start: '09:00', end: '18:00' },
      { day: 'Thursday', enabled: true, start: '09:00', end: '18:00' },
      { day: 'Friday', enabled: true, start: '09:00', end: '18:00' },
      { day: 'Saturday', enabled: true, start: '09:00', end: '18:00' },
      { day: 'Sunday', enabled: false, start: '09:00', end: '18:00' },
    ],
  });
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [scheduleMessage, setScheduleMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!authService.isAuthenticated()) {
        router.push('/login');
        return;
      }

      const user = authService.getUser();
      if (!user || user.role !== 'worker') {
        router.push('/');
        return;
      }

      try {
        const data = await authService.getProfile();
        setProfile(data);
      } catch (error) {
        console.error('Profile fetch failed:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  useEffect(() => {
    if (!profile?.profile) return;
    setScheduleForm({
      isAvailableNow: profile.profile.isAvailableNow ?? true,
      serviceRadiusKm: profile.profile.serviceRadiusKm ?? 10,
      responseRate: profile.profile.responseRate ?? 100,
      weeklySchedule: Array.isArray(profile.profile.weeklySchedule) && profile.profile.weeklySchedule.length > 0
        ? profile.profile.weeklySchedule
        : [
            { day: 'Monday', enabled: true, start: '09:00', end: '18:00' },
            { day: 'Tuesday', enabled: true, start: '09:00', end: '18:00' },
            { day: 'Wednesday', enabled: true, start: '09:00', end: '18:00' },
            { day: 'Thursday', enabled: true, start: '09:00', end: '18:00' },
            { day: 'Friday', enabled: true, start: '09:00', end: '18:00' },
            { day: 'Saturday', enabled: true, start: '09:00', end: '18:00' },
            { day: 'Sunday', enabled: false, start: '09:00', end: '18:00' },
          ],
    });
  }, [profile]);

  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
    setIsEditing(false);
  };

  const handleScheduleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setScheduleForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleWeeklyScheduleChange = (index, field, value) => {
    setScheduleForm((prev) => {
      const updated = [...prev.weeklySchedule];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, weeklySchedule: updated };
    });
  };

  const applySameTimeToAllDays = () => {
    const firstEnabledDay = scheduleForm.weeklySchedule.find((day) => day.enabled);
    if (!firstEnabledDay) return;

    setScheduleForm((prev) => ({
      ...prev,
      weeklySchedule: prev.weeklySchedule.map((day) => (
        day.enabled
          ? { ...day, start: firstEnabledDay.start, end: firstEnabledDay.end }
          : day
      )),
    }));
  };

  const handleScheduleSave = async () => {
    if (!profile?._id) return;
    setScheduleSaving(true);
    setScheduleMessage('');

    try {
      const payload = {
        isAvailableNow: scheduleForm.isAvailableNow,
        serviceRadiusKm: Number(scheduleForm.serviceRadiusKm) || 10,
        responseRate: Number(scheduleForm.responseRate) || 100,
        weeklySchedule: scheduleForm.weeklySchedule,
      };

      await api.put(`/api/users/${profile._id}`, payload);
      const refreshedProfile = await authService.getProfile();
      setProfile(refreshedProfile);
      setScheduleMessage('Schedule updated successfully.');
    } catch (error) {
      console.error('Schedule update failed:', error);
      setScheduleMessage('Schedule update failed. Please try again.');
    } finally {
      setScheduleSaving(false);
    }
  };



  const handleCNICUploadSuccess = async () => {
    try {
      const data = await authService.getProfile();
      setProfile(data);
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="worker">
        <div className="mb-8">
          <div className="h-8 w-64 rounded-lg skeleton mb-2" />
          <div className="h-4 w-48 rounded-lg skeleton" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <SkeletonStatCard />
          <SkeletonStatCard />
          <SkeletonStatCard />
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="h-[400px] rounded-2xl skeleton" />
          <div className="lg:col-span-2 h-[400px] rounded-2xl skeleton" />
        </div>
      </DashboardLayout>
    );
  }

  // Determine Badge colors based on status
  const rawVerificationStatus = profile?.profile?.verificationStatus || profile?.verificationStatus;
  const vStatus = String(rawVerificationStatus || '').trim().toLowerCase();
  const isVerified = Boolean(profile?.profile?.verified || profile?.verified || vStatus === 'approved' || vStatus === 'verified');
  const showVerificationPrompt = !isVerified;
  const badgeVariant = (vStatus === 'approved' || vStatus === 'verified') ? 'success' : vStatus === 'rejected' ? 'error' : vStatus === 'pending' ? 'warning' : 'neutral';
  const verificationLabel = isVerified
    ? 'Verified'
    : vStatus === 'pending'
      ? 'Pending'
      : vStatus === 'rejected'
        ? 'Rejected'
        : 'Unverified';
  const userData = profile || {};
  const workerData = profile?.profile || {};
  const detailText = (value, fallback = 'N/A') => {
    if (value === null || value === undefined) return fallback;
    const text = String(value).trim();
    return text ? text : fallback;
  };
  const experienceText = workerData.experience !== undefined && workerData.experience !== null
    ? `${workerData.experience} years total`
    : 'N/A';

  return (
    <DashboardLayout role="worker">
      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 lg:px-5 py-3 lg:py-4 min-h-[calc(100vh-4rem)]">
        
        {/* ── Header ── */}
        <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Welcome back{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''}!
            </h1>
            <p className="text-xs text-gray-500 mt-1">Manage your profile and track your business</p>
          </div>
          
          {showVerificationPrompt && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2 rounded-lg flex items-start gap-2 w-full md:w-auto shadow-sm">
              <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <span className="font-bold">Verification {vStatus || 'Not Submitted'}</span>
                <p className="opacity-90">Please {vStatus === 'pending' ? 'wait for admin approval' : 'submit your CNIC below'}.</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Main Grid Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,520px)] gap-2 xl:gap-2.5 items-start">
          
          {/* Main Left Column (Stats + Profile) */}
          <div className="flex flex-col gap-2.5 lg:pr-1">
            
            {/* ── Stats Grid ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <Card hover className="group max-h-[85px] sm:max-h-none flex flex-col justify-center">
                <CardBody className="relative overflow-hidden p-3.5 sm:p-4.5">
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-50 rounded-full group-hover:scale-150 transition-transform duration-500 z-0" />
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Pending</p>
                      <p className="text-2xl font-black text-gray-900 leading-none mt-1 group-hover:text-amber-600 transition-colors">0</p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shadow-inner group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                      <CalendarClock className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card hover className="group max-h-[85px] sm:max-h-none flex flex-col justify-center">
                <CardBody className="relative overflow-hidden p-3.5 sm:p-4.5">
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 z-0" />
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Active Jobs</p>
                      <p className="text-2xl font-black text-gray-900 leading-none mt-1 group-hover:text-blue-600 transition-colors">0</p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                      <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card hover className="group max-h-[85px] sm:max-h-none flex flex-col justify-center">
                <CardBody className="relative overflow-hidden p-3.5 sm:p-4.5">
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500 z-0" />
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Completed</p>
                      <p className="text-2xl font-black text-gray-900 leading-none mt-1 group-hover:text-emerald-600 transition-colors">{profile?.reviewCount || 0}</p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* ── Profile Info ── */}
            <div className="flex-1">
              {isEditing ? (
                <EditProfile
                  profile={profile}
                  onProfileUpdate={handleProfileUpdate}
                  onCancel={() => setIsEditing(false)}
                />
              ) : (
                <Card className="h-full overflow-hidden border border-slate-200/80 bg-white/90 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.35)] backdrop-blur-sm">
                  <div className="h-1.5 bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500" />
                  <CardBody className="p-4 sm:p-5 flex-1 flex flex-col">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                      <div>
                        <div>
                          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Professional Details</h2>
                          <p className="text-xs text-slate-500 mt-1">Your identity and service profile</p>
                        </div>
                      </div>

                      <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        Edit Profile
                      </button>
                    </div>

                    {profile ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5 flex-1">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-3.5 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-white text-slate-500 flex items-center justify-center shadow-sm">
                              <UserCircle className="w-4.5 h-4.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Full Name</p>
                              <p className="mt-1 text-[13px] font-bold text-slate-900 truncate">{detailText(userData.name)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-3.5 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-white text-slate-500 flex items-center justify-center shadow-sm">
                              <Phone className="w-4.5 h-4.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Phone Number</p>
                              <p className="mt-1 text-[13px] font-bold text-slate-900 truncate">{detailText(userData.phone)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-3.5 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-white text-slate-500 flex items-center justify-center shadow-sm">
                              <MapPin className="w-4.5 h-4.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Base City</p>
                              <p className="mt-1 text-[13px] font-bold text-slate-900 truncate">{detailText(userData.city)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-3.5 transition-all hover:-translate-y-0.5 hover:border-blue-200">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-white text-blue-600 flex items-center justify-center shadow-sm">
                              <Wrench className="w-4.5 h-4.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-500">Primary Skill</p>
                              <p className="mt-1 text-[13px] font-bold text-blue-800 truncate">{detailText(workerData.skill)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-3.5 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-white text-slate-500 flex items-center justify-center shadow-sm">
                              <Briefcase className="w-4.5 h-4.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Experience</p>
                              <p className="mt-1 text-[13px] font-bold text-slate-900 truncate">{experienceText}</p>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-3.5 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-white text-slate-500 flex items-center justify-center shadow-sm">
                              <MapPin className="w-4.5 h-4.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Service Address</p>
                              <p className="mt-1 text-[13px] font-bold text-slate-900 truncate">{detailText(workerData.workerAddress)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-3.5 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-white text-slate-500 flex items-center justify-center shadow-sm">
                                <ShieldCheck className="w-4.5 h-4.5" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Account Status</p>
                                <p className="mt-1 text-[13px] font-bold text-slate-900 truncate">Verification</p>
                              </div>
                            </div>
                            <Badge variant={badgeVariant} className="shrink-0 text-[9px] py-1 px-2 uppercase tracking-wide">
                              {verificationLabel}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 grid place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center">
                        <p className="text-sm font-medium text-slate-500">No profile data available.</p>
                      </div>
                    )}
                  </CardBody>
                </Card>
              )}
            </div>

            <Card className="overflow-hidden border border-slate-200/80 bg-white/90 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.30)] backdrop-blur-sm">
              <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600" />
              <CardBody className="p-4 sm:p-4.5">
                <div className="flex items-start justify-between gap-2.5 mb-3.5">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 tracking-tight">Quick Flow</h3>
                    <p className="text-xs text-slate-500 mt-1">Jump straight to your daily actions</p>
                  </div>
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Actions
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button onClick={() => router.push('/worker/bookings')} className="group relative overflow-hidden rounded-2xl text-left outline-none transition-transform hover:-translate-y-0.5">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900" />
                    <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.35),_transparent_35%)]" />
                    <div className="relative p-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-white/15 text-white flex items-center justify-center backdrop-blur-md ring-1 ring-white/15">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-white">Job Requests</h3>
                        <p className="mt-1 text-[11px] leading-4 text-blue-100/90 line-clamp-2">Manage incoming bookings and job updates from one place.</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/60 transition-transform group-hover:translate-x-1" />
                    </div>
                  </button>

                  <button onClick={() => router.push('/worker/chat')} className="group relative overflow-hidden rounded-2xl text-left outline-none transition-transform hover:-translate-y-0.5">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-700" />
                    <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.32),_transparent_35%)]" />
                    <div className="relative p-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-white/15 text-white flex items-center justify-center backdrop-blur-md ring-1 ring-white/15">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-white">Messages</h3>
                        <p className="mt-1 text-[11px] leading-4 text-emerald-100/90 line-clamp-2">Reply to clients and keep conversations moving.</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/60 transition-transform group-hover:translate-x-1" />
                    </div>
                  </button>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right Column (Quick Actions + CNIC) */}
          <div className="w-full lg:w-[520px] lg:sticky lg:top-20 flex flex-col gap-3">
            
            {/* ── Availability Schedule ── */}
            <Card className="flex flex-col shrink-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_20px_50px_-24px_rgba(15,23,42,0.28)] lg:min-h-[760px]">
              <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600" />
              <CardBody className="p-4 sm:p-4.5 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2.5 mb-3.5">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">Availability Schedule</h2>
                    <p className="text-xs text-slate-500 mt-1">Set working hours for each day</p>
                  </div>
                  <Badge variant={scheduleForm.isAvailableNow ? 'success' : 'warning'} className="w-fit text-[10px] px-2.5 py-1 rounded-full">
                    {scheduleForm.isAvailableNow ? 'Available Now' : 'Not Available'}
                  </Badge>
                </div>

                <button
                  type="button"
                  onClick={applySameTimeToAllDays}
                  className="mb-3.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 transition-all hover:bg-white hover:border-gray-300"
                >
                  Apply same time to all days
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 flex-1">
                  {scheduleForm.weeklySchedule.map((item, index) => (
                    <div key={item.day} className="rounded-2xl border border-gray-200 bg-white p-3.5 transition-all duration-300 hover:border-gray-300 hover:shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-bold text-gray-900">{item.day}</p>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            checked={item.enabled}
                            onChange={(e) => handleWeeklyScheduleChange(index, 'enabled', e.target.checked)}
                            className="peer sr-only"
                          />
                          <span className="h-6 w-11 rounded-full bg-gray-300 transition-colors duration-300 peer-checked:bg-emerald-500" />
                          <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 peer-checked:translate-x-5" />
                        </label>
                      </div>

                        <div className={`overflow-hidden transition-all duration-300 ${item.enabled ? 'max-h-32 opacity-100 mt-2' : 'max-h-10 opacity-100 mt-2'}`}>
                        {item.enabled ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <input
                              type="time"
                              value={item.start}
                              onChange={(e) => handleWeeklyScheduleChange(index, 'start', e.target.value)}
                              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                            />
                            <input
                              type="time"
                              value={item.end}
                              onChange={(e) => handleWeeklyScheduleChange(index, 'end', e.target.value)}
                              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                            />
                          </div>
                        ) : (
                          <p className="text-xs font-medium text-gray-400">Closed</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3.5 mt-4">
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3.5">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <p className="text-xs font-semibold text-gray-800">Service Radius ({scheduleForm.serviceRadiusKm} km)</p>
                      <span className="text-[11px] font-medium text-gray-500">0-50 km</span>
                    </div>
                    <input
                      type="range"
                      name="serviceRadiusKm"
                      min="0"
                      max="50"
                      value={scheduleForm.serviceRadiusKm}
                      onChange={handleScheduleChange}
                      className="w-full accent-emerald-500"
                    />
                    <p className="mt-2 text-[11px] text-gray-500">How far you are willing to travel</p>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3.5">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <p className="text-xs font-semibold text-gray-800">Response Rate ({scheduleForm.responseRate}%)</p>
                      <span className="text-[11px] font-medium text-gray-500">0-100%</span>
                    </div>
                    <input
                      type="range"
                      name="responseRate"
                      min="0"
                      max="100"
                      value={scheduleForm.responseRate}
                      onChange={handleScheduleChange}
                      className="w-full accent-blue-500"
                    />
                    <div className="mt-3 h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                        style={{ width: `${Math.max(0, Math.min(100, Number(scheduleForm.responseRate) || 0))}%` }}
                      />
                    </div>
                    <p className="mt-2 text-[11px] text-gray-500">Your average reply performance</p>
                  </div>
                </div>

                {scheduleMessage && (
                  <p className="mt-3 text-xs font-semibold text-blue-600">{scheduleMessage}</p>
                )}

                <button
                  type="button"
                  onClick={handleScheduleSave}
                  disabled={scheduleSaving}
                  className="mt-4 w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-sm font-bold text-white shadow-lg transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {scheduleSaving ? 'Saving...' : 'Save Schedule'}
                </button>
              </CardBody>
            </Card>

            {/* ── CNIC Section ── */}
            {showVerificationPrompt && (
              <Card className="overflow-hidden border border-slate-200/80 bg-white/90 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.28)]">
                <div className="h-1.5 bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500" />
                <CardBody className="p-4 sm:p-4.5">
                  <div className="space-y-3">
                    <div>
                      <h2 className="text-lg font-black text-slate-900 tracking-tight">CNIC Verification</h2>
                      <p className="mt-2 text-sm text-slate-500">Upload your CNIC to complete profile verification and access more bookings.</p>
                    </div>
                    <UploadCNIC userId={profile?._id} onUploadSuccess={handleCNICUploadSuccess} />
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
