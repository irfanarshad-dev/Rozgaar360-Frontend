'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { authService } from '@/lib/auth';
import { useTranslation } from 'react-i18next';

export default function BookService() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation(['customer', 'common']);
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    description: '',
    address: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    /* Wait briefly for local storage */
    const init = async () => {
      await new Promise(r => setTimeout(r, 100));
      if (!authService.isAuthenticated()) {
        router.push('/login');
        return;
      }

      try {
        const response = await api.get(`/api/users/workers/${params.id}`);
        setWorker(response.data);
      } catch (error) {
        console.error('Failed to fetch worker:', error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [params.id, router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const service = worker.profile?.skill || worker.skill || 'General Service';
      
      console.log('Creating booking with data:', {
        workerId: params.id,
        service,
        date: formData.date,
        time: formData.time,
        address: formData.address,
        description: formData.description
      });
      
      const response = await api.post('/api/bookings', {
        workerId: params.id,
        service: service,
        date: formData.date,
        time: formData.time,
        address: formData.address,
        description: formData.description
      });
      
      console.log('Booking created:', response.data);
      
      if (response.data && response.data._id) {
        router.push(`/customer/bookings/confirmation/${response.data._id}`);
      } else {
        alert(t('customer:bookingCreatedSuccess'));
        router.push('/customer/bookings');
      }
    } catch (error) {
      console.error('Failed to book service:', error);
      console.error('Error details:', error.response?.data);
      alert(error.response?.data?.message || t('customer:bookingCreateFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl">{t('common:loading')}</div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl">{t('customer:workerNotFound')}</div>
      </div>
    );
  }

  const weeklySchedule = worker?.profile?.weeklySchedule || worker?.weeklySchedule || [];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('customer:bookService')}</h1>
        <p className="text-gray-600 mb-8">{t('customer:bookingWith', { name: worker.name, service: worker.profile?.skill || worker.skill || t('customer:bookService') })}</p>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">{t('customer:schedule.title')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {weeklySchedule.map((slot) => (
              <div key={slot.day} className={`text-center p-3 border rounded-xl flex flex-col justify-center ${slot.enabled ? 'bg-gray-50' : 'bg-gray-50 opacity-60'}`}>
                <p className="font-semibold text-gray-800 text-xs sm:text-sm">{t(`customer:schedule.days.${slot.day.toLowerCase()}`)}</p>
                {slot.enabled ? (
                  <p className="text-[11px] text-emerald-600 mt-1">{slot.start} - {slot.end}</p>
                ) : (
                  <p className="text-[11px] text-red-500 mt-1">{t('customer:schedule.unavailable')}</p>
                )}
              </div>
            ))}
            {weeklySchedule.length === 0 && (
              <div className="text-center p-3 border rounded-xl bg-gray-50 flex flex-col justify-center col-span-2 sm:col-span-3">
                <p className="text-sm text-gray-500">{t('customer:schedule.notProvided')}</p>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('customer:selectDate')}</label>
              <input 
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('customer:selectTime')}</label>
              <input 
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('customer:serviceAddress')}</label>
            <input 
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder={t('customer:addressPlaceholder')}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('customer:issueDescription')}</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder={t('customer:issueDescriptionPlaceholder')}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white font-semibold py-4 rounded-xl hover:bg-blue-700 transition shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting ? t('customer:confirmingBooking') : t('customer:confirmBooking')}
          </button>
        </form>
      </div>
    </div>
  );
}
