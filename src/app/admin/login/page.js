'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/auth';
import { ROLES } from '@/lib/constants';

export default function AdminLogin() {
  const [formData, setFormData] = useState({ phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      authService.clearTokens();
      
      const response = await authService.login({ ...formData, role: ROLES.ADMIN });
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      document.cookie = `token=${response.token}; path=/; max-age=86400; SameSite=Lax`;
      
      router.push('/admin/dashboard');
    } catch (error) {
      console.error('Admin login failed:', error);
      alert(error.response?.data?.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950" />
      
      <div className="relative w-full max-w-md">
        <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl shadow-xl border border-white/10 p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Admin Portal</h1>
            <p className="text-gray-400 text-sm">Rozgaar360 Management</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone Number</label>
              <input
                name="phone"
                type="tel"
                placeholder="03xxxxxxxxx"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-slate-900/60 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/10 transition-all duration-200"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
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
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-2.5 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign In
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-3">
            <p className="text-gray-400 text-sm">
              Need admin access?{' '}
              <Link href="/admin/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Register here
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
    </main>
  );
}