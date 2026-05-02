'use client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, X, User, MapPin, Briefcase, Award, Home } from 'lucide-react';
import { SKILLS, CITIES } from '@/lib/constants';
import api from '@/lib/axios';

const SKILL_TRANSLATION_KEYS = {
  Plumber: 'plumber',
  Electrician: 'electrician',
  Carpenter: 'carpenter',
  Tailor: 'tailor',
  Painter: 'painter',
  Cleaner: 'cleaner',
  Mechanic: 'mechanic',
  Cook: 'cook',
  Driver: 'driver',
  'AC Repair': 'acRepair',
};

export default function EditProfile({ profile, onProfileUpdate, onCancel }) {
  const { t } = useTranslation(['worker', 'common', 'home']);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    city: profile?.city || '',
    skill: profile?.skill || profile?.profile?.skill || '',
    experience: profile?.experience || profile?.profile?.experience || '',
    address: profile?.address || profile?.profile?.address || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const getSkillLabel = (skillName) => {
    const key = SKILL_TRANSLATION_KEYS[skillName];
    if (!key) return skillName;
    return t(`home:skills.${key}`, { defaultValue: skillName });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      const updateData = { ...formData };
      
      // Convert experience to number for workers
      if (profile?.role === 'worker' && updateData.experience) {
        updateData.experience = parseInt(updateData.experience, 10);
      }
      
      console.log('Sending update:', updateData);
      
      const response = await api.put(`/api/users/${profile?._id}`, updateData);
      
      console.log('Update response:', response.data);
      
      onProfileUpdate(response.data);
      setSuccess(true);
      setTimeout(() => onCancel(), 1500);
    } catch (error) {
      console.error('Full error:', error);
      const errorMsg = error.response?.data?.message || error.message || t('worker:editProfile.updateFailed', { defaultValue: 'Failed to update profile' });
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-normal text-gray-900">
          {t('worker:editProfile.title', { defaultValue: 'Edit profile' })}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {t('worker:editProfile.subtitle', { defaultValue: 'Update your personal information' })}
        </p>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mb-4 flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
          <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Success Message */}
      {success && (
        <div className="mb-4 flex items-start gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md p-3">
          <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{t('worker:editProfile.success', { defaultValue: 'Profile updated successfully' })}</span>
        </div>
      )}
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name Field */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 text-gray-500" />
            {t('common:name', { defaultValue: 'Name' })}
          </label>
          <input
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* City Field */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            {t('common:city', { defaultValue: 'City' })}
          </label>
          <select
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">{t('worker:editProfile.selectCity', { defaultValue: 'Select city' })}</option>
            {CITIES.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Worker-specific fields */}
        {profile?.role === 'worker' && (
          <>
            {/* Skill Field */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="w-4 h-4 text-gray-500" />
                {t('common:skill', { defaultValue: 'Skill' })}
              </label>
              <select
                name="skill"
                value={formData.skill}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">{t('worker:editProfile.selectSkill', { defaultValue: 'Select skill' })}</option>
                {SKILLS.map(skill => (
                  <option key={skill} value={skill}>{getSkillLabel(skill)}</option>
                ))}
              </select>
            </div>

            {/* Experience Field */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Award className="w-4 h-4 text-gray-500" />
                {t('worker:editProfile.experienceYears', { defaultValue: 'Experience (years)' })}
              </label>
              <input
                name="experience"
                type="number"
                value={formData.experience}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                placeholder="0"
              />
            </div>
          </>
        )}

        {/* Customer-specific fields */}
        {profile?.role === 'customer' && (
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Home className="w-4 h-4 text-gray-500" />
              {t('common:address', { defaultValue: 'Address' })}
            </label>
            <input
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('common:enterAddress', { defaultValue: 'Enter your address' })}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || success}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {loading 
              ? t('worker:editProfile.updating', { defaultValue: 'Updating...' }) 
              : t('worker:editProfile.saveChanges', { defaultValue: 'Save changes' })}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
          >
            {t('common:cancel', { defaultValue: 'Cancel' })}
          </button>
        </div>
      </form>
    </div>
  );
}