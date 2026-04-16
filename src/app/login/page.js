'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/auth';
import { ROLES } from '@/lib/constants';
import { useTranslation } from 'react-i18next';
import { Phone, Mail } from 'lucide-react';

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

      // Add phone or email based on selected method
      if (loginMethod === 'phone') {
        loginData.phone = formData.phone;
      } else {
        loginData.email = formData.email;
      }

      const response = await authService.login(loginData);
      
      const redirectPath = response.user.role === ROLES.WORKER ? '/worker/dashboard' : '/customer/dashboard';
      router.push(redirectPath);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">{t('welcomeBack')}</h1>
          <p className="text-gray-600 mt-2">{t('signInAccount')}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Login Method Toggle */}
          <div className="flex mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setLoginMethod('phone')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all ${
                loginMethod === 'phone'
                  ? 'bg-white text-blue-600 shadow-sm font-semibold'
                  : 'text-gray-600'
              }`}
            >
              <Phone className="w-4 h-4" />
              Phone
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod('email')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all ${
                loginMethod === 'email'
                  ? 'bg-white text-blue-600 shadow-sm font-semibold'
                  : 'text-gray-600'
              }`}
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone or Email Input */}
            {loginMethod === 'phone' ? (
              <input
                name="phone"
                placeholder={t('phoneNumber')}
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-teal-100"
                required
              />
            ) : (
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-teal-100"
                required
              />
            )}

            {/* Password */}
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('password')}
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl outline-teal-100"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Role Selection */}
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-teal-100 cursor-pointer"
              required
            >
              <option value="">{t('selectRole')}</option>
              <option value={ROLES.WORKER}>{t('worker')}</option>
              <option value={ROLES.CUSTOMER}>{t('customer')}</option>
            </select>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? t('signingIn') : t('signIn')}
            </button>
          </form>

          <div className="text-center mt-6 space-y-3">
            <p className="text-gray-600">
              {t('noAccount')}{' '}
              <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium ml-1 cursor-pointer">
                {t('registerHere')}
              </Link>
            </p>
            <Link href="/forgot-password" className="text-blue-600 hover:text-blue-700 text-sm inline-block cursor-pointer">
              Forgot Password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
