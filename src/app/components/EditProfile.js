'use client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
      const errorMsg = error.response?.data?.message || error.message || t('worker:editProfile.updateFailed');
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-semibold mb-4">{t('worker:editProfile.title')}</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm font-medium">{t('common:error')}:</p>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm">{t('worker:editProfile.success')}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">{t('common:name')}</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">{t('common:city')}</label>
          <select
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          >
            <option value="">{t('worker:editProfile.selectCity')}</option>
            {CITIES.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {profile?.role === 'worker' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">{t('common:skill')}</label>
              <select
                name="skill"
                value={formData.skill}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              >
                <option value="">{t('worker:editProfile.selectSkill')}</option>
                {SKILLS.map(skill => (
                  <option key={skill} value={skill}>{getSkillLabel(skill)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">{t('worker:editProfile.experienceYears')}</label>
              <input
                name="experience"
                type="number"
                value={formData.experience}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                min="0"
              />
            </div>
          </>
        )}

        {profile?.role === 'customer' && (
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t('common:address')}</label>
            <input
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        )}

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={loading || success}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? t('worker:editProfile.updating') : t('worker:editProfile.saveChanges')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 font-medium"
          >
            {t('common:cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}
