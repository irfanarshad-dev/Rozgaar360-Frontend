"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/lib/auth";
import DashboardLayout from "@/app/components/ui/DashboardLayout";
import Card, { CardBody } from "@/app/components/ui/Card";

export default function CustomerDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!authService.isAuthenticated()) {
        router.push("/login");
        return;
      }

      const user = authService.getUser();
      if (!user || user.role !== "customer") {
        router.push("/");
        return;
      }

      try {
        const data = await authService.getProfile();
        setProfile(data);
      } catch (error) {
        console.error("Profile fetch failed:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  if (loading) {
    return (
      <DashboardLayout role="customer">
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
    <DashboardLayout role="customer">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back{profile?.name ? `, ${profile.name}` : ''}!
        </h1>
        <p className="text-gray-600 mt-1">Here&apos;s what&apos;s happening with your services today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="overflow-hidden">
          <CardBody className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
                <p className="text-xs text-gray-500 mt-1">View all bookings</p>
              </div>
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="overflow-hidden">
          <CardBody className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Jobs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
                <p className="text-xs text-gray-500 mt-1">Total completed</p>
              </div>
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="overflow-hidden">
          <CardBody className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Messages</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
                <p className="text-xs text-gray-500 mt-1">Unread messages</p>
              </div>
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Profile Card */}
        <Card className="lg:col-span-2">
          <CardBody>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
              <Link href="/profile" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                Edit Profile
              </Link>
            </div>
            {profile && (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Full Name
                  </label>
                  <p className="text-base font-medium text-gray-900">{profile.name}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Phone Number
                  </label>
                  <p className="text-base font-medium text-gray-900">{profile.phone}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    City
                  </label>
                  <p className="text-base font-medium text-gray-900">{profile.city}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Account Type
                  </label>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                    Customer
                  </span>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Quick Action Card */}
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0 text-white">
          <CardBody>
            <div className="flex flex-col h-full">
              <div className="mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Find Workers</h3>
                <p className="text-blue-100 text-sm">Discover skilled professionals near you</p>
              </div>
              <Link
                href="/recommendations"
                className="mt-auto bg-white text-blue-600 py-3 px-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors text-center text-sm"
              >
                Browse Workers
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/customer/bookings" className="group">
            <Card hover>
              <CardBody className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">My Bookings</h3>
                  <p className="text-gray-500 text-xs mt-0.5">View all bookings</p>
                </div>
              </CardBody>
            </Card>
          </Link>

          <Link href="/customer/notifications" className="group">
            <Card hover>
              <CardBody className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                  <p className="text-gray-500 text-xs mt-0.5">Check updates</p>
                </div>
              </CardBody>
            </Card>
          </Link>

          <Link href="/chat" className="group">
            <Card hover>
              <CardBody className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Messages</h3>
                  <p className="text-gray-500 text-xs mt-0.5">Chat with workers</p>
                </div>
              </CardBody>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
