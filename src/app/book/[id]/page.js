'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { authService } from '@/lib/auth';

export default function BookService() {
  const params = useParams();
  const router = useRouter();
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
        alert('Booking created successfully!');
        router.push('/customer/bookings');
      }
    } catch (error) {
      console.error('Failed to book service:', error);
      console.error('Error details:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl">Worker not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Book Service</h1>
        <p className="text-gray-600 mb-8">You are booking a service with <span className="font-semibold">{worker.name}</span> for <span className="font-semibold text-blue-600">{worker.profile?.skill || worker.skill || 'Service'}</span></p>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Time</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Service Address</label>
            <input 
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Main St, City, Country"
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Issue Description</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe what needs to be done..."
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white font-semibold py-4 rounded-xl hover:bg-blue-700 transition shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting ? 'Confirming Booking...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}
