'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { authService } from '@/lib/auth';
import { ROLES } from '@/lib/constants';
import { useTranslation } from 'react-i18next';
import { Phone, Mail, Eye, EyeOff, ShieldCheck, Star, Users } from 'lucide-react';
import Button from '../components/ui/Button';

export default function Login() {
  const [loginMethod, setLoginMethod] = useState('phone'); // 'phone' or 'email'
  const [formData, setFormData] = useState({ phone: '', email: '', password: '', role: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { t } = useTranslation('auth');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // clear error on typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const loginData = {
        password: formData.password,
        role: formData.role,
      };

      if (loginMethod === 'phone') {
        loginData.phone = formData.phone;
      } else {
        loginData.email = formData.email;
      }

      const response = await authService.login(loginData);
      let redirectPath = '/customer/dashboard';
      if (response.user.role === ROLES.ADMIN) {
        redirectPath = '/admin/dashboard';
      } else if (response.user.role === ROLES.WORKER) {
        redirectPath = '/worker/dashboard';
      }
      
      router.push(redirectPath);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface">
      {/* ── Left Split (Brand/Hero) hidden on mobile ── */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 border-r border-white/10 relative overflow-hidden flex-col justify-between p-12 lg:p-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 z-0" />
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl opacity-50 z-0 animate-blob" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-3xl opacity-50 z-0 animate-blob animation-delay-2000" />
        
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
            Connect with<br />Trusted Professionals.
          </h1>
          <p className="text-blue-100/70 text-lg mt-6 max-w-md">
            Join thousands of users booking verified local workers for their home and business needs.
          </p>
        </div>

        {/* Stats / Trust Badges */}
        <div className="relative z-10 grid gap-6 mt-16">
          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm border border-white/10 p-5 rounded-2xl">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white font-semibold">100% Verified</h3>
              <p className="text-white/60 text-sm mt-0.5">All workers are identity-checked</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm border border-white/10 p-5 rounded-2xl">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Instant Booking</h3>
              <p className="text-white/60 text-sm mt-0.5">Connect and chat immediately</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Split (Form) ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md animate-fadeInUp">
          
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
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{t('welcomeBack')}</h2>
            <p className="text-gray-500 mt-2">{t('signInAccount')}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 sm:p-10">
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-scaleIn">
                <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-red-800 text-sm font-medium leading-snug">{error}</p>
              </div>
            )}

            {/* Login Method Toggle */}
            <div className="flex bg-gray-50 p-1.5 rounded-xl border border-gray-100 mb-8 relative">
              <div 
                className="absolute inset-y-1.5 bg-white shadow-sm border border-gray-200 rounded-lg transition-transform duration-300 ease-in-out"
                style={{
                  width: 'calc(50% - 6px)',
                  transform: loginMethod === 'phone' ? 'translateX(0)' : 'translateX(calc(100% + 12px))'
                }}
              />
              <button
                type="button"
                onClick={() => { setLoginMethod('phone'); setError(''); }}
                className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors z-10 ${
                  loginMethod === 'phone' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Phone className="w-4 h-4" /> Phone
              </button>
              <button
                type="button"
                onClick={() => { setLoginMethod('email'); setError(''); }}
                className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors z-10 ${
                  loginMethod === 'email' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Mail className="w-4 h-4" /> Email
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Account Type */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Account Type</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer font-medium text-gray-900"
                  required
                >
                  <option value="" disabled>{t('selectRole')}</option>
                  <option value={ROLES.WORKER}>{t('worker')} (Service Provider)</option>
                  <option value={ROLES.CUSTOMER}>{t('customer')} (Looking for services)</option>
                  {/* Keep admin hidden or add if needed */}
                </select>
              </div>

              {/* Identifier */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  {loginMethod === 'phone' ? 'Phone Number' : 'Email Address'}
                </label>
                <input
                  name={loginMethod === 'phone' ? 'phone' : 'email'}
                  type={loginMethod === 'phone' ? 'text' : 'email'}
                  placeholder={loginMethod === 'phone' ? '03001234567' : 'you@example.com'}
                  value={loginMethod === 'phone' ? formData.phone : formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700">{t('password')}</label>
                  <Link href="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline underline-offset-2">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
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
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  fullWidth 
                  loading={loading}
                  size="lg"
                  className="font-bold shadow-blue-500/30"
                >
                  {loading ? t('signingIn') : t('signIn')}
                </Button>
              </div>
            </form>

          </div>

          <p className="text-center mt-8 text-gray-600 font-medium">
            {t('noAccount')}{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-bold hover:underline underline-offset-2">
              {t('registerHere')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
