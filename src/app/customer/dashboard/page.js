'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/auth';
import DashboardLayout from '@/app/components/ui/DashboardLayout';
import Card, { CardBody } from '@/app/components/ui/Card';
import { SkeletonStatCard } from '@/app/components/ui/SkeletonCard';
import EditProfile from '../../components/EditProfile';
import { useTranslation } from 'react-i18next';
import { UserCircle, Search, Calendar, MessageCircle, MapPin, Phone, Briefcase, Mail } from 'lucide-react';

export default function CustomerDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const { t } = useTranslation(['customer', 'common']);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!authService.isAuthenticated()) {
        router.push('/login');
        return;
      }

      const user = authService.getUser();
      if (!user || user.role !== 'customer') {
        router.push('/');
        return;
      }

      try {
        const data = await authService.getProfile();
        setProfile(data);
      } catch (error) {
        console.error('Profile fetch failed:', error);
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

  if (loading) {
    return (
      <DashboardLayout role="customer">
        <div className="mb-8">
          <div className="h-8 w-64 rounded-lg skeleton mb-2" />
          <div className="h-4 w-48 rounded-lg skeleton" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <SkeletonStatCard />
          <SkeletonStatCard />
        </div>
        <div className="h-[300px] rounded-2xl skeleton mb-8" />
        <div className="grid md:grid-cols-3 gap-4">
          <div className="h-[120px] rounded-2xl skeleton" />
          <div className="h-[120px] rounded-2xl skeleton" />
          <div className="h-[120px] rounded-2xl skeleton" />
        </div>
      </DashboardLayout>
    );
  }

  const firstName = profile?.name ? profile.name.split(' ')[0] : '';

  return (
    <DashboardLayout role="customer">
      <div className="max-w-6xl mx-auto pb-12 px-4">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <h1 className="text-3xl md:text-[34px] font-black text-gray-900 tracking-tight">
              {t('customer:dashboard.welcomeBack', { name: firstName ? `, ${firstName}` : '' })}
            </h1>
            <p className="text-sm md:text-[15px] text-gray-500 mt-1.5 max-w-2xl">{t('customer:dashboard.subtitle')}</p>
          </div>

          <Link href="/customer/recommendations" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all hover:-translate-y-0.5 w-full md:w-auto justify-center text-sm">
            <Search className="w-5 h-5" /> {t('customer:findWorkers')}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
          <div className="lg:col-span-8 flex flex-col gap-7">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <Card hover className="group flex flex-col justify-center">
                <CardBody className="relative overflow-hidden p-5 sm:p-6">
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 z-0" />
                  <div className="relative z-10 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{t('customer:dashboard.stats.discover')}</p>
                      <p className="text-base sm:text-[18px] font-black text-gray-900 leading-tight mt-1.5 group-hover:text-blue-600 transition-colors">{t('customer:dashboard.stats.findBestPros')}</p>
                    </div>
                    <div className="w-11 h-11 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                      <Search className="w-5 h-5" />
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card hover className="group flex flex-col justify-center">
                <CardBody className="relative overflow-hidden p-5 sm:p-6">
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500 z-0" />
                  <div className="relative z-10 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{t('customer:dashboard.stats.bookings')}</p>
                      <p className="text-base sm:text-[18px] font-black text-gray-900 leading-tight mt-1.5 group-hover:text-emerald-600 transition-colors">{t('customer:dashboard.stats.trackJobs')}</p>
                    </div>
                    <div className="w-11 h-11 sm:w-12 sm:h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                      <Calendar className="w-5 h-5" />
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card hover className="group flex flex-col justify-center">
                <CardBody className="relative overflow-hidden p-5 sm:p-6">
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-violet-50 rounded-full group-hover:scale-150 transition-transform duration-500 z-0" />
                  <div className="relative z-10 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{t('customer:dashboard.stats.conversations')}</p>
                      <p className="text-base sm:text-[18px] font-black text-gray-900 leading-tight mt-1.5 group-hover:text-violet-600 transition-colors">{t('customer:dashboard.stats.chatWithWorkers')}</p>
                    </div>
                    <div className="w-11 h-11 sm:w-12 sm:h-12 bg-violet-100 rounded-xl flex items-center justify-center text-violet-600 shadow-inner group-hover:bg-violet-600 group-hover:text-white transition-all duration-300">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            <div className="flex-1">
              {isEditing ? (
                <EditProfile
                  profile={profile}
                  onProfileUpdate={handleProfileUpdate}
                  onCancel={() => setIsEditing(false)}
                />
              ) : (
                <Card className="h-full flex flex-col">
                  <CardBody className="p-6 sm:p-7 flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-100">
                      <h2 className="text-xl md:text-[22px] font-bold text-gray-900 flex items-center gap-2">
                        <UserCircle className="w-5 h-5 text-blue-600" /> {t('customer:dashboard.accountInfo')}
                      </h2>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-50 text-blue-600 text-sm font-bold rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        {t('customer:dashboard.editProfile')}
                      </button>
                    </div>

                    {profile ? (
                      <div className="grid sm:grid-cols-2 gap-y-6 gap-x-8 flex-1">
                        <div className="flex gap-2.5">
                          <UserCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-0.5">{t('customer:dashboard.fullName')}</p>
                            <p className="text-base font-bold text-gray-900">{profile.name}</p>
                          </div>
                        </div>

                        <div className="flex gap-2.5">
                          <Phone className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-0.5">{t('customer:dashboard.phoneNumber')}</p>
                            <p className="text-base font-bold text-gray-900">{profile.phone}</p>
                          </div>
                        </div>

                        <div className="flex gap-2.5">
                          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-0.5">{t('customer:dashboard.city')}</p>
                            <p className="text-base font-bold text-gray-900">{profile.city || '-'}</p>
                          </div>
                        </div>

                        <div className="flex gap-2.5">
                          <Mail className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-0.5">{t('customer:dashboard.address')}</p>
                            <p className="text-base font-bold text-gray-900">{profile.address || t('customer:dashboard.noAddressProvided')}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-xs text-center m-auto">{t('customer:dashboard.noProfileData')}</p>
                    )}
                  </CardBody>
                </Card>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-7">
            <Card className="flex flex-col flex-1 shrink-0">
              <CardBody className="p-6 sm:p-7 h-full flex flex-col justify-center">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-gray-400" /> {t('customer:dashboard.quickFlow')}
                </h2>
                <div className="flex flex-col gap-5">
                  <button onClick={() => router.push('/customer/recommendations')} className="text-left group relative outline-none w-full">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl opacity-90 group-hover:opacity-100 transition-opacity" />
                    <div className="relative p-5 flex items-center gap-4">
                      <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-white backdrop-blur-sm group-hover:scale-110 transition-transform duration-300 shadow-inner">
                        <Search className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-sm">{t('customer:dashboard.browseWorkers')}</h3>
                        <p className="text-blue-100 text-[10px] tracking-wide mt-0.5 line-clamp-1">{t('customer:dashboard.browseWorkersHint')}</p>
                      </div>
                    </div>
                  </button>

                  <button onClick={() => router.push('/customer/bookings')} className="text-left group relative outline-none w-full">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl opacity-90 group-hover:opacity-100 transition-opacity" />
                    <div className="relative p-5 flex items-center gap-4">
                      <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-white backdrop-blur-sm group-hover:scale-110 transition-transform duration-300 shadow-inner">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-sm">{t('customer:dashboard.myBookingsAction')}</h3>
                        <p className="text-emerald-100 text-[10px] tracking-wide mt-0.5 line-clamp-1">{t('customer:dashboard.myBookingsHint')}</p>
                      </div>
                    </div>
                  </button>

                  <button onClick={() => router.push('/customer/chat')} className="text-left group relative outline-none w-full">
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-600 rounded-xl opacity-90 group-hover:opacity-100 transition-opacity" />
                    <div className="relative p-5 flex items-center gap-4">
                      <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-white backdrop-blur-sm group-hover:scale-110 transition-transform duration-300 shadow-inner">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-sm">{t('customer:dashboard.messagesAction')}</h3>
                        <p className="text-violet-100 text-[10px] tracking-wide mt-0.5 line-clamp-1">{t('customer:dashboard.messagesHint')}</p>
                      </div>
                    </div>
                  </button>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
