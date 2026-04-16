'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RoleCard from '../components/RoleCard';
import { authService } from '@/lib/auth';
import { ROLES, SKILLS, CITIES } from '@/lib/constants';
import { useTranslation } from 'react-i18next';

export default function Register() {
  const [selectedRole, setSelectedRole] = useState('');
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { t } = useTranslation('auth');

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
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">{t('createAccount')}</h1>
          <p className="text-gray-600 mt-2">{t('joinRozgaar')}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
              <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-green-800 text-sm">Registration successful! Redirecting to login...</p>
            </div>
          )}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
          {!selectedRole ? (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-center">{t('chooseRole')}</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <RoleCard
                  role={ROLES.WORKER}
                  title={t('worker')}
                  description={t('offerSkills')}
                  icon="🔧"
                  onClick={() => setSelectedRole(ROLES.WORKER)}
                />
                <RoleCard
                  role={ROLES.CUSTOMER}
                  title={t('customer')}
                  description={t('findWorkers')}
                  icon="👤"
                  onClick={() => setSelectedRole(ROLES.CUSTOMER)}
                />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold">
                  {selectedRole === ROLES.WORKER ? t('workerRegistration') : t('customerRegistration')}
                </h2>
                <button
                  type="button"
                  onClick={() => setSelectedRole('')}
                  className="text-blue-600 text-sm mt-2"
                >
                  {t('changeRole')}
                </button>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <input
                  name="name"
                  placeholder={t('fullName')}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-teal-100"
                  required
                />

                {/* Dual Auth: Phone + Email */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <input
                      name="phone"
                      placeholder={t('phoneNumberPlaceholder')}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-teal-100"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Required for login</p>
                  </div>
                  <div>
                    <input
                      name="email"
                      type="email"
                      placeholder="Email (optional)"
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-teal-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">For password reset</p>
                  </div>
                </div>

                {/* Password */}
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('password')}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl outline-teal-100"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
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
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-600">{t('passwordStrength')}</span>
                      <span className={`text-xs font-medium ${
                        passwordStrength === 'weak' ? 'text-red-500' :
                        passwordStrength === 'good' ? 'text-yellow-500' :
                        'text-green-500'
                      }`}>
                        {passwordStrength === 'weak' ? t('weak') :
                         passwordStrength === 'good' ? t('good') : t('strong')}
                      </span>
                    </div>
                    <div className="flex space-x-1 mt-1">
                      <div className={`h-1 w-1/3 rounded ${
                        passwordStrength === 'weak' ? 'bg-red-500' :
                        passwordStrength === 'good' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}></div>
                      <div className={`h-1 w-1/3 rounded ${
                        passwordStrength === 'good' ? 'bg-yellow-500' :
                        passwordStrength === 'strong' ? 'bg-green-500' :
                        'bg-gray-200'
                      }`}></div>
                      <div className={`h-1 w-1/3 rounded ${
                        passwordStrength === 'strong' ? 'bg-green-500' : 'bg-gray-200'
                      }`}></div>
                    </div>
                  </div>
                )}

                {/* City */}
                <select
                  name="city"
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-teal-100 cursor-pointer"
                  required
                >
                  <option value="">{t('selectCity')}</option>
                  {CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>

                {/* Worker-specific fields */}
                {selectedRole === ROLES.WORKER && (
                  <>
                    <select
                      name="skill"
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-teal-100"
                      required
                    >
                      <option value="">{t('selectSkill')}</option>
                      {SKILLS.map(skill => (
                        <option key={skill} value={skill}>{skill}</option>
                      ))}
                    </select>
                    <input
                      name="experience"
                      placeholder={t('yearsExperience')}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-teal-100"
                    />
                  </>
                )}

                {/* Customer-specific fields */}
                {selectedRole === ROLES.CUSTOMER && (
                  <input
                    name="address"
                    placeholder={t('address')}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-teal-100"
                  />
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? t('creatingAccount') : t('createAccount')}
              </button>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>📱 Phone:</strong> Required for login<br />
                  <strong>📧 Email:</strong> Optional (for password reset via email)
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
