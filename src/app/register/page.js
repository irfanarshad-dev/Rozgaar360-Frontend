'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { authService } from '@/lib/auth';
import { ROLES, SKILLS, CITIES } from '@/lib/constants';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, ShieldCheck, Users, Wrench, ArrowLeft, Briefcase, User as UserIcon, MapPin, Loader2 } from 'lucide-react';
import Button from '../components/ui/Button';

export default function Register() {
  const [mounted, setMounted] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const router = useRouter();
  const { t } = useTranslation('auth');

  useEffect(() => {
    setMounted(true);
  }, []);

  const checkPasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength('');
      return;
    }

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    if (score < 3) setPasswordStrength('weak');
    else if (score < 5) setPasswordStrength('good');
    else setPasswordStrength('strong');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  const captureCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus(t('locationUnsupported'));
      return;
    }

    setLocationLoading(true);
    setLocationStatus('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));

        setFormData((prev) => ({
          ...prev,
          ...(selectedRole === ROLES.WORKER
            ? { workerLatitude: lat, workerLongitude: lng }
            : { customerLatitude: lat, customerLongitude: lng }),
        }));

        setLocationStatus(t('locationSaved'));
        setLocationLoading(false);
      },
      () => {
        setLocationStatus(t('locationDenied'));
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const submitData = { ...formData, role: selectedRole };
      if (selectedRole === ROLES.WORKER && submitData.experience) {
        submitData.experience = parseInt(submitData.experience, 10);
      }
      await authService.register(submitData);
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || t('registrationFailed');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface">
      {/* ── Left Split (Brand/Hero) ── */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 border-r border-white/10 relative overflow-hidden flex-col justify-between p-12 lg:p-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 z-0" />
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl opacity-50 z-0 animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-3xl opacity-50 z-0 animate-blob animation-delay-2000" />
        
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <Image
              src="/assests/Logo/Rozgaar360-logo.png"
              alt="Rozgaar360"
              width={170}
              height={48}
              className="h-10 w-auto object-contain group-hover:scale-105 transition-transform"
            />
            <span className="text-2xl font-bold text-white tracking-tight">Rozgaar<span className="text-blue-400">360</span></span>
          </Link>

          <h1 className="text-4xl xl:text-5xl font-bold text-white mt-16 leading-tight">
            {t('signupHeroTitleLine1')}<br />{t('signupHeroTitleLine2')}
          </h1>
          <p className="text-blue-100/70 text-lg mt-6 max-w-md">
            {t('signupHeroDescription')}
          </p>
        </div>

        <div className="relative z-10 grid gap-6 mt-16">
          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm border border-white/10 p-5 rounded-2xl">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white font-semibold">{t('signupHeroFeatureOneTitle')}</h3>
              <p className="text-white/60 text-sm mt-0.5">{t('signupHeroFeatureOneDescription')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm border border-white/10 p-5 rounded-2xl">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white font-semibold">{t('signupHeroFeatureTwoTitle')}</h3>
              <p className="text-white/60 text-sm mt-0.5">{t('signupHeroFeatureTwoDescription')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Split (Form) ── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 sm:px-12 relative overflow-y-auto">
        <div className="w-full max-w-md mx-auto animate-fadeInUp">
          
          <div className="text-center mb-10">
            <Link href="/" className="lg:hidden inline-flex items-center gap-2 mb-8">
              <Image
                src="/assests/Logo/Rozgaar360-logo.png"
                alt="Rozgaar360"
                width={125}
                height={36}
                className="h-8 w-auto object-contain"
              />
              <span className="text-xl font-bold text-gray-900 tracking-tight">Rozgaar<span className="text-blue-600">360</span></span>
            </Link>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              {mounted ? t('createAccount') : 'Create Account'}
            </h2>
            <p className="text-gray-500 mt-2">
              {mounted ? t('joinRozgaar') : "Join Pakistan's leading job platform"}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 sm:p-10 relative">
            
            {/* Status Messages */}
            {success && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 animate-scaleIn">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-emerald-800 font-semibold text-sm">Account Created!</h4>
                  <p className="text-emerald-700/80 text-sm mt-0.5">Redirecting to login...</p>
                </div>
              </div>
            )}
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-scaleIn">
                <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-red-800 text-sm font-medium leading-snug">{error}</p>
              </div>
            )}

            {/* Step 1: Select Role */}
            {!selectedRole ? (
              <div className="space-y-6 animate-fadeInRight">
                <p className="text-sm font-semibold text-gray-800 text-center uppercase tracking-wide">{t('signupNeedsTitle')}</p>
                <div className="grid gap-4">
                  <button 
                    onClick={() => setSelectedRole(ROLES.WORKER)}
                    className="flex items-start gap-4 p-5 rounded-2xl border-2 border-gray-100 bg-white hover:border-blue-500 hover:bg-blue-50 transition-all group text-left"
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Wrench className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{t('signupWorkerTitle')}</h3>
                      <p className="text-sm text-gray-500 mt-1 leading-snug">{t('signupWorkerDescription')}</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => setSelectedRole(ROLES.CUSTOMER)}
                    className="flex items-start gap-4 p-5 rounded-2xl border-2 border-gray-100 bg-white hover:border-emerald-500 hover:bg-emerald-50 transition-all group text-left"
                  >
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <UserIcon className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">{t('signupCustomerTitle')}</h3>
                      <p className="text-sm text-gray-500 mt-1 leading-snug">{t('signupCustomerDescription')}</p>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              /* Step 2: Form Details */
              <div className="animate-fadeInLeft">
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedRole === ROLES.WORKER ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {selectedRole === ROLES.WORKER ? <Wrench className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                    </div>
                    <h3 className="font-bold text-gray-900 capitalize">{selectedRole === ROLES.WORKER ? t('worker') : t('customer')} {t('registration')}</h3>
                  </div>
                  <button 
                    onClick={() => { setSelectedRole(''); setFormData({}); setError(''); }}
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> {t('back')}
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">{t('fullName')}</label>
                    <input
                      name="name"
                      placeholder="e.g. John Doe"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-gray-900"
                      required
                    />
                  </div>

                  {/* Contact Duo */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">{t('phone')}</label>
                      <input
                        name="phone"
                        placeholder="03001234567"
                        value={formData.phone || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-gray-900"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">{t('email')}</label>
                      <input
                        name="email"
                        type="email"
                        placeholder="you@email.com"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-gray-900"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">{t('password')}</label>
                    <div className="relative">
                      <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formData.password || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-gray-900"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                        tabIndex="-1"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {/* Password Strength Indicator */}
                    {passwordStrength && (
                      <div className="pt-2 flex items-center gap-2">
                        <div className="flex-1 flex gap-1 h-1.5">
                          <div className={`h-full rounded-full w-1/3 transition-colors ${passwordStrength === 'weak' ? 'bg-red-400' : passwordStrength === 'good' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                          <div className={`h-full rounded-full w-1/3 transition-colors ${passwordStrength === 'weak' ? 'bg-gray-200' : passwordStrength === 'good' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                          <div className={`h-full rounded-full w-1/3 transition-colors ${passwordStrength === 'strong' ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                        </div>
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${
                          passwordStrength === 'weak' ? 'text-red-500' : passwordStrength === 'good' ? 'text-amber-500' : 'text-emerald-500'
                        }`}>
                          {t(passwordStrength)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Location */}
                  <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">{t('city')}</label>
                    <select
                      name="city"
                      value={formData.city || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-gray-900 cursor-pointer"
                      required
                    >
                      <option value="" disabled>{t('cityPlaceholder')}</option>
                      {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                    </select>
                  </div>

                  <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3.5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="w-full">
                        <p className="text-sm font-semibold text-blue-800">{t('usePreciseMapLocation')}</p>
                        <p className="text-xs text-blue-700/80 mt-0.5">{t('usePreciseMapLocationDescription')}</p>
                      </div>
                      <button
                        type="button"
                        onClick={captureCurrentLocation}
                        disabled={locationLoading}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-white hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold px-3 py-2 rounded-lg transition-colors disabled:opacity-70"
                      >
                        {locationLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
                        {locationLoading ? t('detectingLocation') : t('useCurrentLocation')}
                      </button>
                    </div>
                    {locationStatus && (
                      <p className="mt-2 text-xs text-blue-700 font-medium">{locationStatus}</p>
                    )}
                  </div>

                  {/* Worker specifics */}
                  {selectedRole === ROLES.WORKER && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">{t('primarySkill')}</label>
                        <select
                          name="skill"
                          value={formData.skill || ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-gray-900 cursor-pointer"
                          required
                        >
                          <option value="" disabled>{t('selectSkill')}</option>
                          {SKILLS.map(skill => <option key={skill} value={skill}>{skill}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">{t('experience')}</label>
                        <input
                          name="experience"
                          type="number"
                          min="0"
                          max="50"
                          placeholder="e.g. 3"
                          value={formData.experience || ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-gray-900"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {selectedRole === ROLES.WORKER && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">{t('workAddressOptional')}</label>
                        <input
                          name="workerAddress"
                          placeholder={t('streetArea')}
                          value={formData.workerAddress || ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-gray-900"
                          required
                        />
                      </div>

                      <label className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 cursor-pointer">
                        <span className="text-sm font-semibold text-gray-700">{t('currentlyAvailableForJobs')}</span>
                        <input
                          type="checkbox"
                          checked={formData.isAvailableNow !== false}
                          onChange={(e) => {
                            setFormData((prev) => ({ ...prev, isAvailableNow: e.target.checked }));
                          }}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300"
                        />
                      </label>
                    </>
                  )}

                  {/* Customer specifics */}
                  {selectedRole === ROLES.CUSTOMER && (
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">{t('fullAddress')}</label>
                      <input
                        name="address"
                        placeholder={t('houseStreetArea')}
                        value={formData.address || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-gray-900"
                        required
                      />
                    </div>
                  )}

                  <div className="pt-4">
                    <Button type="submit" fullWidth loading={loading} size="lg" className="font-bold shadow-lg">
                      {loading ? t('processing') : t('completeRegistration')}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>

          <p className="text-center mt-8 text-gray-600 font-medium">
            {t('alreadyHaveAccount')}{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-bold hover:underline underline-offset-2">
              {t('signInHere')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
