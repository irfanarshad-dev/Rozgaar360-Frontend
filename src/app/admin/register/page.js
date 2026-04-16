'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/auth';
import { ROLES, CITIES } from '@/lib/constants';

export default function AdminRegister() {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const router = useRouter();

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

    if (score < 3) {
      setPasswordStrength('weak');
    } else if (score < 5) {
      setPasswordStrength('good');
    } else {
      setPasswordStrength('strong');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.register({ ...formData, role: ROLES.ADMIN });
      alert('Admin registration successful! Please login.');
      router.push('/admin/login');
    } catch (error) {
      console.error('Admin registration failed:', error);
      alert(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950" />
      
      <div className="relative w-full max-w-lg">
        <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl shadow-xl border border-white/10 p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Admin Registration</h1>
            <p className="text-gray-400 text-sm">Create admin account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
              <input
                name="name"
                type="text"
                placeholder="Enter your full name"
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-slate-900/60 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/10 transition-all duration-200"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone Number</label>
              <input
                name="phone"
                type="tel"
                placeholder="03xxxxxxxxx"
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-slate-900/60 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/10 transition-all duration-200"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 pr-10 bg-slate-900/60 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/10 transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors duration-200"
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
              {passwordStrength && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    <div className={`h-1 flex-1 rounded ${
                      passwordStrength === 'weak' ? 'bg-red-400' :
                      passwordStrength === 'good' ? 'bg-yellow-400' :
                      'bg-green-400'
                    }`} />
                    <div className={`h-1 flex-1 rounded ${
                      passwordStrength === 'good' ? 'bg-yellow-400' :
                      passwordStrength === 'strong' ? 'bg-green-400' :
                      'bg-white/20'
                    }`} />
                    <div className={`h-1 flex-1 rounded ${
                      passwordStrength === 'strong' ? 'bg-green-400' : 'bg-white/20'
                    }`} />
                  </div>
                  <p className={`text-xs mt-1 ${
                    passwordStrength === 'weak' ? 'text-red-400' :
                    passwordStrength === 'good' ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {passwordStrength === 'weak' ? 'Weak' :
                     passwordStrength === 'good' ? 'Good' : 'Strong'} password
                  </p>
                </div>
              )}
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">City</label>
              <select
                name="city"
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-slate-900/60 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/10 transition-all duration-200 cursor-pointer"
                required
              >
                <option value="" className="bg-slate-900">Select City</option>
                {CITIES.map(city => (
                  <option key={city} value={city} className="bg-slate-900">{city}</option>
                ))}
              </select>
            </div>

            {/* Warning */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 hover:bg-yellow-500/15 transition-colors duration-200">
              <div className="flex gap-2 text-xs">
                <span className="text-yellow-400">⚠️</span>
                <p className="text-yellow-400">Admin registration requires approval</p>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-2.5 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center space-y-3">
            <p className="text-gray-400 text-sm">
              Already have access?{' '}
              <Link href="/admin/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
            <div className="pt-3 border-t border-white/10">
              <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors">
                ← Back to main site
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
