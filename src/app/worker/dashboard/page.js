'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import DashboardLayout from '@/app/components/ui/DashboardLayout';
import Card, { CardBody } from '@/app/components/ui/Card';
import UploadCNIC from '../../components/UploadCNIC';
import ProfilePhotoUpload from '../../components/ProfilePhotoUpload';
import EditProfile from '../../components/EditProfile';

export default function WorkerDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      await new Promise(resolve => setTimeout(resolve, 100));

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

  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
    setIsEditing(false);
  };

  const handlePhotoUpdate = (newPhotoUrl) => {
    setProfile(prev => ({ ...prev, profilePicture: newPhotoUrl }));
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
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600 font-medium">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="worker">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back{profile?.name ? `, ${profile.name}` : ''}!
        </h1>
        <p className="text-gray-600 mt-1">Manage your profile and job requests</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="overflow-hidden">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
                <p className="text-xs text-gray-500 mt-1">Awaiting response</p>
              </div>
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="overflow-hidden">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
                <p className="text-xs text-gray-500 mt-1">In progress</p>
              </div>
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="overflow-hidden">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
                <p className="text-xs text-gray-500 mt-1">Total jobs</p>
              </div>
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Profile Photo */}
        <div>
          {profile && (
            <ProfilePhotoUpload
              userId={profile._id}
              currentPhoto={profile.profilePicture}
              onPhotoUpdate={handlePhotoUpdate}
            />
          )}
        </div>

        {/* Profile Information */}
        <div className="lg:col-span-2">
          {isEditing ? (
            <EditProfile
              profile={profile}
              onProfileUpdate={handleProfileUpdate}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <Card>
              <CardBody>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Edit Profile
                  </button>
                </div>
                {profile ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Name</label>
                      <p className="text-base font-medium text-gray-900">{profile.name}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Phone</label>
                      <p className="text-base font-medium text-gray-900">{profile.phone}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">City</label>
                      <p className="text-base font-medium text-gray-900">{profile.city}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Skill</label>
                      <p className="text-base font-medium text-gray-900">{profile.skill}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Experience</label>
                      <p className="text-base font-medium text-gray-900">{profile.experience} years</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Verification</label>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        profile.verificationStatus === 'approved' ? 'bg-green-50 text-green-700' :
                        profile.verificationStatus === 'pending' ? 'bg-amber-50 text-amber-700' :
                        'bg-gray-50 text-gray-700'
                      }`}>
                        {profile.verificationStatus || 'Not Submitted'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Failed to load profile</p>
                )}
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {/* CNIC Upload */}
      <div className="mb-8">
        {profile && <UploadCNIC userId={profile._id} onUploadSuccess={handleCNICUploadSuccess} />}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => router.push('/worker/bookings')}
            className="group"
          >
            <Card hover>
              <CardBody className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Job Requests</h3>
                  <p className="text-gray-500 text-sm mt-0.5">View and manage bookings</p>
                </div>
              </CardBody>
            </Card>
          </button>

          <button
            onClick={() => router.push('/chat')}
            className="group"
          >
            <Card hover>
              <CardBody className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-green-700 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Messages</h3>
                  <p className="text-gray-500 text-sm mt-0.5">Chat with customers</p>
                </div>
              </CardBody>
            </Card>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
