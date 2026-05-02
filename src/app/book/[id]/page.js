'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import api from '@/lib/axios';
import { authService } from '@/lib/auth';
import { useTranslation } from 'react-i18next';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaMapMarkerAlt, 
  FaShieldAlt,
  FaCheckCircle,
  FaHeadset,
  FaLock,
  FaArrowLeft
} from 'react-icons/fa';

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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common:loading')}</p>
        </div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">{t('customer:workerNotFound')}</div>
      </div>
    );
  }

  const weeklySchedule = worker?.profile?.weeklySchedule || worker?.weeklySchedule || [];
  const experience = worker.profile?.experience || worker.experience || 0;
  const skill = worker.profile?.skill || worker.skill;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop View */}
      <div className="hidden xl:block">
        <div className="w-full px-8 py-4">
          {/* Header */}
          <div className="mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
            >
              <FaArrowLeft className="text-sm" />
              <span className="font-medium text-sm">Book Service</span>
            </button>
            <p className="text-xs text-gray-500">Home &gt; Book Service</p>
          </div>

          <div className="grid grid-cols-3 gap-5">
            {/* Left Column - Form */}
            <div className="col-span-2 space-y-3">
              {/* Availability Schedule */}
              <div className="bg-white rounded-2xl shadow-sm p-3.5">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-xs">1</span>
                  </div>
                  <h2 className="text-sm font-bold text-gray-900">Availability Schedule</h2>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {weeklySchedule.length > 0 ? (
                    weeklySchedule.map((slot) => (
                      <div
                        key={slot.day}
                        className={`p-2 rounded-xl border-2 transition-all ${
                          slot.enabled
                            ? 'bg-emerald-50 border-emerald-200'
                            : 'bg-gray-50 border-gray-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-1 mb-0.5">
                          <FaCalendarAlt className={`text-xs ${slot.enabled ? 'text-emerald-600' : 'text-gray-400'}`} />
                          <p className="font-semibold text-gray-900 text-xs">{slot.day}</p>
                        </div>
                        {slot.enabled ? (
                          <p className="text-xs text-emerald-600 font-medium">{slot.start} - {slot.end}</p>
                        ) : (
                          <p className="text-xs text-red-500 font-medium">Unavailable</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center p-3 bg-gray-50 rounded-xl border-2 border-gray-200">
                      <p className="text-xs text-gray-500">Schedule not provided</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Select Date & Time */}
              <div className="bg-white rounded-2xl shadow-sm p-3.5">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-xs">2</span>
                  </div>
                  <h2 className="text-sm font-bold text-gray-900">Select Date & Time</h2>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Select Date</label>
                    <input 
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Select Time</label>
                    <input 
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div className="bg-white rounded-2xl shadow-sm p-3.5">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-xs">3</span>
                  </div>
                  <h2 className="text-sm font-bold text-gray-900">Service Details</h2>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Service Address</label>
                    <div className="relative">
                      <input 
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="123 Main St, City, Country"
                        required
                        className="w-full px-3 py-2 pl-9 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                      />
                      <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Issue Description</label>
                    <textarea 
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={2}
                      placeholder="Describe what needs to be done..."
                      required
                      maxLength={500}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none text-sm"
                    ></textarea>
                    <p className="text-xs text-gray-500 mt-1 text-right">{formData.description.length}/500</p>
                  </div>
                </div>
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 active:scale-[0.98]"
              >
                <FaCalendarAlt className="text-base" />
                <span>{submitting ? 'Confirming Booking...' : 'Confirm Booking'}</span>
              </button>
              <p className="text-center text-xs text-gray-500 flex items-center justify-center gap-1.5 mt-1.5">
                <FaLock className="text-gray-400 text-xs" />
                You can review your booking details before confirming
              </p>
            </div>

            {/* Right Column - Summary */}
            <div className="space-y-4">
              {/* Worker Info */}
              <div className="bg-white rounded-2xl shadow-sm p-4">
                <p className="text-xs text-gray-500 mb-2.5">You are booking a service with</p>
                <div className="flex items-center gap-2.5 mb-3">
                  <Image
                    src={worker.profilePicture || '/user.png'}
                    alt={worker.name}
                    width={45}
                    height={45}
                    className="w-11 h-11 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900 flex items-center gap-1.5 text-sm">
                      {worker.name}
                      <FaCheckCircle className="text-blue-500 text-xs" />
                    </h3>
                    <p className="text-xs text-blue-600 font-semibold">{skill}</p>
                  </div>
                </div>
              </div>

              {/* Booking Summary */}
              <div className="bg-white rounded-2xl shadow-sm p-4">
                <h3 className="font-bold text-gray-900 mb-3 text-sm">Booking Summary</h3>
                
                <div className="space-y-2.5 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs mb-0.5">Service</p>
                    <p className="font-semibold text-gray-900 text-xs">{skill}</p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs mb-0.5">Professional</p>
                    <p className="font-semibold text-gray-900 flex items-center gap-1 text-xs">
                      {worker.name}
                      <FaCheckCircle className="text-blue-500 text-xs" />
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs mb-0.5">Experience</p>
                    <p className="font-semibold text-gray-900 text-xs">{experience} Years</p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs mb-0.5">Location</p>
                    <p className="font-semibold text-gray-900 text-xs">{worker.city}</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                  <div className="flex items-start gap-2 text-xs">
                    <FaShieldAlt className="text-blue-500 mt-0.5 flex-shrink-0 text-xs" />
                    <div>
                      <p className="font-semibold text-gray-900">Verified Professional</p>
                      <p className="text-gray-500">Background verified</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-xs">
                    <FaCheckCircle className="text-emerald-500 mt-0.5 flex-shrink-0 text-xs" />
                    <div>
                      <p className="font-semibold text-gray-900">Secure & Safe</p>
                      <p className="text-gray-500">Your information is protected</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-xs">
                    <FaClock className="text-blue-500 mt-0.5 flex-shrink-0 text-xs" />
                    <div>
                      <p className="font-semibold text-gray-900">On-time Service</p>
                      <p className="text-gray-500">Prompt and reliable</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-xs">
                    <FaCheckCircle className="text-emerald-500 mt-0.5 flex-shrink-0 text-xs" />
                    <div>
                      <p className="font-semibold text-gray-900">100% Satisfaction</p>
                      <p className="text-gray-500">We care about your satisfaction</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Need Help */}
              <div className="bg-blue-50 rounded-2xl border-2 border-blue-100 p-4">
                <h3 className="font-bold text-gray-900 mb-1.5 flex items-center gap-2 text-sm">
                  <FaHeadset className="text-blue-600" />
                  Need Help?
                </h3>
                <p className="text-xs text-gray-600 mb-2">Our support team is here to help you</p>
                <p className="text-xs text-gray-500 mb-2.5">Monday - Saturday (10AM - 6PM)</p>
                <button className="w-full bg-white border-2 border-blue-200 text-blue-600 font-semibold py-2 rounded-xl hover:bg-blue-50 transition text-xs flex items-center justify-center gap-2">
                  <FaHeadset />
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* iPad/Tablet View */}
      <div className="hidden lg:block xl:hidden">
        <div className="max-w-4xl mx-auto px-6 py-5">
          {/* Header */}
          <div className="mb-5">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3"
            >
              <FaArrowLeft className="text-sm" />
              <span className="font-medium text-sm">Book Service</span>
            </button>
            <p className="text-xs text-gray-500">Home &gt; Book Service</p>
          </div>

          {/* Worker Info */}
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
            <p className="text-xs text-gray-500 mb-3">You are booking a service with</p>
            <div className="flex items-center gap-3">
              <Image
                src={worker.profilePicture || '/user.png'}
                alt={worker.name}
                width={60}
                height={60}
                className="w-14 h-14 rounded-full object-cover"
              />
              <div>
                <h3 className="font-bold text-gray-900 flex items-center gap-1.5 text-base">
                  {worker.name}
                  <FaCheckCircle className="text-blue-500 text-sm" />
                </h3>
                <p className="text-sm text-blue-600 font-semibold">{skill}</p>
              </div>
            </div>
          </div>

          {/* Availability Schedule */}
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xs">1</span>
              </div>
              <h2 className="text-base font-bold text-gray-900">Availability Schedule</h2>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {weeklySchedule.length > 0 ? (
                weeklySchedule.map((slot) => (
                  <div
                    key={slot.day}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      slot.enabled
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FaCalendarAlt className={`text-xs ${slot.enabled ? 'text-emerald-600' : 'text-gray-400'}`} />
                      <p className="font-semibold text-gray-900 text-sm">{slot.day}</p>
                    </div>
                    {slot.enabled ? (
                      <p className="text-xs text-emerald-600 font-medium">{slot.start} - {slot.end}</p>
                    ) : (
                      <p className="text-xs text-red-500 font-medium">Unavailable</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center p-5 bg-gray-50 rounded-xl border-2 border-gray-200">
                  <p className="text-sm text-gray-500">Schedule not provided</p>
                </div>
              )}
            </div>
          </div>

          {/* Select Date & Time */}
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xs">2</span>
              </div>
              <h2 className="text-base font-bold text-gray-900">Select Date & Time</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
          </div>

          {/* Service Details */}
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xs">3</span>
              </div>
              <h2 className="text-base font-bold text-gray-900">Service Details</h2>
            </div>

            <div className="space-y-4">
              <div>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Issue Description</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe what needs to be done..."
                  required
                  maxLength={500}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                ></textarea>
                <p className="text-xs text-gray-500 mt-1 text-right">{formData.description.length}/500</p>
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
            <h3 className="font-bold text-gray-900 mb-4">Booking Summary</h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs mb-1">Service</p>
                <p className="font-semibold text-gray-900">{skill}</p>
              </div>

              <div>
                <p className="text-gray-500 text-xs mb-1">Professional</p>
                <p className="font-semibold text-gray-900 flex items-center gap-1">
                  {worker.name}
                  <FaCheckCircle className="text-blue-500 text-xs" />
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-xs mb-1">Experience</p>
                <p className="font-semibold text-gray-900">{experience} Years</p>
              </div>

              <div>
                <p className="text-gray-500 text-xs mb-1">Location</p>
                <p className="font-semibold text-gray-900">{worker.city}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-3">
              <div className="flex items-start gap-2 text-xs">
                <FaShieldAlt className="text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Verified Professional</p>
                  <p className="text-gray-500">Background verified</p>
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs">
                <FaCheckCircle className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Secure & Safe</p>
                  <p className="text-gray-500">Information protected</p>
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs">
                <FaClock className="text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">On-time Service</p>
                  <p className="text-gray-500">Prompt and reliable</p>
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs">
                <FaCheckCircle className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">100% Satisfaction</p>
                  <p className="text-gray-500">We care about you</p>
                </div>
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-blue-600 text-white font-semibold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 active:scale-[0.98] mb-3"
          >
            <FaCalendarAlt className="text-base" />
            <span>{submitting ? 'Confirming Booking...' : 'Confirm Booking'}</span>
          </button>
          <p className="text-center text-xs text-gray-500 flex items-center justify-center gap-1.5">
            <FaLock className="text-gray-400 text-xs" />
            You can review your booking details before confirming
          </p>
        </div>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden">
        <div className="px-4 py-6">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3"
            >
              <FaArrowLeft />
              <span className="font-semibold">Book Service</span>
            </button>
            <p className="text-xs text-gray-500">Home &gt; Book Service</p>
          </div>

          {/* Worker Info */}
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
            <p className="text-xs text-gray-500 mb-3">You are booking a service with</p>
            <div className="flex items-center gap-3">
              <Image
                src={worker.profilePicture || '/user.png'}
                alt={worker.name}
                width={50}
                height={50}
                className="w-14 h-14 rounded-full object-cover"
              />
              <div>
                <h3 className="font-bold text-gray-900 flex items-center gap-1.5">
                  {worker.name}
                  <FaCheckCircle className="text-blue-500 text-sm" />
                </h3>
                <p className="text-sm text-blue-600 font-semibold">{skill}</p>
              </div>
            </div>
          </div>

          {/* Availability Schedule */}
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xs">1</span>
              </div>
              <h2 className="text-base font-bold text-gray-900">Availability Schedule</h2>
            </div>

            <div className="space-y-2">
              {weeklySchedule.length > 0 ? (
                weeklySchedule.map((slot) => (
                  <div
                    key={slot.day}
                    className={`p-3 rounded-xl border-2 flex items-center justify-between ${
                      slot.enabled
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className={`text-xs ${slot.enabled ? 'text-emerald-600' : 'text-gray-400'}`} />
                      <p className="font-semibold text-gray-900 text-sm">{slot.day}</p>
                    </div>
                    {slot.enabled ? (
                      <p className="text-xs text-emerald-600 font-medium">{slot.start} - {slot.end}</p>
                    ) : (
                      <p className="text-xs text-red-500 font-medium">Unavailable</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
                  <p className="text-sm text-gray-500">Schedule not provided</p>
                </div>
              )}
            </div>
          </div>

          {/* Select Date & Time */}
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xs">2</span>
              </div>
              <h2 className="text-base font-bold text-gray-900">Select Date & Time</h2>
            </div>

            <div className="space-y-3">
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
          </div>

          {/* Service Details */}
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xs">3</span>
              </div>
              <h2 className="text-base font-bold text-gray-900">Service Details</h2>
            </div>

            <div className="space-y-3">
              <div>
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

              <div>
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
            </div>
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-blue-600 text-white font-semibold py-4 rounded-xl hover:bg-blue-700 transition shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-3"
          >
            <FaCalendarAlt />
            {submitting ? 'Confirming...' : 'Confirm Booking'}
          </button>
          <p className="text-center text-xs text-gray-500 flex items-center justify-center gap-1.5">
            <FaLock className="text-gray-400" />
            You can review your booking details before confirming
          </p>
        </div>
      </div>
    </div>
  );
}
