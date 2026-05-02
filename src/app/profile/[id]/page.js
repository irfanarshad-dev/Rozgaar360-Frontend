'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import api from '@/lib/axios';
import { 
  FaStar, 
  FaPhone, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaShieldAlt, 
  FaClock, 
  FaTrophy, 
  FaCalendarCheck,
  FaCheckCircle,
  FaLock,
  FaChevronRight
} from 'react-icons/fa';

export default function WorkerProfile() {
  const params = useParams();
  const router = useRouter();
  const [worker, setWorker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorker = async () => {
      try {
        const response = await api.get(`/api/users/workers/${params.id}`);
        setWorker(response.data);
        
        // Fetch reviews
        const reviewsResponse = await api.get(`/api/reviews/worker/${params.id}`);
        setReviews(reviewsResponse.data || []);
      } catch (error) {
        console.error('Failed to fetch worker:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWorker();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl text-gray-600">Worker not found</p>
        </div>
      </div>
    );
  }

  const weeklySchedule = worker?.profile?.weeklySchedule || worker?.weeklySchedule || [];
  const rating = worker.profile?.rating || worker.rating || 0;
  const reviewCount = worker.profile?.reviewCount || worker.reviewCount || 0;
  const experience = worker.profile?.experience || worker.experience || 0;
  const skill = worker.profile?.skill || worker.skill;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop View */}
      <div className="hidden lg:block h-screen overflow-auto">
        <div className="w-full px-8 py-3 h-full flex flex-col">
          {/* Header Card */}
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-3 flex-shrink-0">
            <div className="flex items-start justify-between">
              {/* Left: Profile Info */}
              <div className="flex items-start gap-4">
                {/* Profile Picture with Status */}
                <div className="relative flex-shrink-0">
                  <Image
                    src={worker.profilePicture || '/user.png'}
                    alt={worker.name}
                    width={120}
                    height={120}
                    className="w-32 h-32 rounded-full object-cover shadow-md"
                  />
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 bg-white px-2.5 py-0.5 rounded-full shadow-md">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                      <span className="text-xs font-semibold text-gray-700">Available</span>
                    </div>
                  </div>
                </div>

                {/* Name and Details */}
                <div className="pt-0.5">
                  <p className="text-xs text-blue-600 font-bold tracking-wider uppercase mb-0.5">{skill}</p>
                  <h1 className="text-2xl font-bold text-gray-900 mb-0.5 flex items-center gap-2">
                    {worker.name}
                    <FaCheckCircle className="text-blue-500 text-lg" title="Verified" />
                  </h1>
                  <p className="text-gray-600 flex items-center gap-1.5 text-sm mb-3">
                    <FaMapMarkerAlt className="text-gray-400" />
                    {worker.city}
                  </p>

                  {/* Stats Row */}
                  <div className="flex items-center gap-6">
                    {/* Rating */}
                    <div className="flex items-start gap-1.5">
                      <FaStar className="text-yellow-400 text-base mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900 text-xs">New Professional</p>
                        <p className="text-xs text-gray-500">No reviews yet</p>
                      </div>
                    </div>

                    {/* Experience */}
                    <div className="flex items-start gap-1.5">
                      <FaShieldAlt className="text-emerald-500 text-base mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900 text-xs">Experience</p>
                        <p className="text-xs text-gray-500">{experience} years</p>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-start gap-1.5">
                      <FaPhone className="text-blue-500 text-base mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900 text-xs">Phone</p>
                        <p className="text-xs text-gray-500">{worker.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Action Buttons */}
              <div className="flex flex-col gap-2.5 min-w-[170px]">
                <a
                  href={`tel:${worker.phone}`}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
                >
                  <FaPhone className="text-sm" />
                  Call Now
                </a>
                <button
                  onClick={() => router.push(`/book/${params.id}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
                >
                  <FaCalendarAlt className="text-sm" />
                  Book Service
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-3 gap-4 flex-shrink-0">
            {/* Left Column: Availability Schedule */}
            <div className="col-span-2 bg-white rounded-2xl shadow-sm p-4">
              <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FaCalendarCheck className="text-blue-600" />
                Availability Schedule
              </h2>

              <div className="grid grid-cols-3 gap-2.5 mb-4">
                {weeklySchedule.length > 0 ? (
                  weeklySchedule.map((slot) => (
                    <div
                      key={slot.day}
                      className={`p-2.5 rounded-xl border-2 transition-all ${
                        slot.enabled
                          ? 'bg-white border-gray-200'
                          : 'bg-gray-50 border-gray-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${slot.enabled ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                        <p className="font-semibold text-gray-900 text-xs">{slot.day}</p>
                      </div>
                      {slot.enabled ? (
                        <p className="text-xs text-emerald-600 font-medium ml-3">{slot.start} - {slot.end}</p>
                      ) : (
                        <p className="text-xs text-red-500 font-medium ml-3">Unavailable</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                    <p className="text-xs text-gray-500">Schedule not provided</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => router.push(`/book/${params.id}`)}
                className="w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
              >
                <FaCalendarAlt className="text-sm" />
                Book Service
              </button>

              <p className="text-center text-gray-500 text-xs mt-2 flex items-center justify-center gap-1.5">
                <FaLock className="text-gray-400 text-xs" />
                Secure booking & 100% satisfaction
              </p>
            </div>

            {/* Right Column: About */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <h2 className="text-base font-bold text-gray-900 mb-3">About</h2>

              <div className="space-y-3">
                {/* Primary Skill */}
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaTrophy className="text-gray-600 text-xs" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-0.5">Primary Skill</p>
                    <p className="font-semibold text-gray-900 text-xs">{skill}</p>
                  </div>
                </div>

                {/* Experience */}
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaClock className="text-gray-600 text-xs" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-0.5">Experience</p>
                    <p className="font-semibold text-gray-900 text-xs">{experience} years</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaMapMarkerAlt className="text-gray-600 text-xs" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-0.5">Location</p>
                    <p className="font-semibold text-gray-900 text-xs">{worker.city}</p>
                  </div>
                </div>

                {/* Contact */}
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaPhone className="text-gray-600 text-xs" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-0.5">Contact</p>
                    <p className="font-semibold text-gray-900 text-xs">{worker.phone}</p>
                  </div>
                </div>

                {/* Why Choose Me */}
                <div className="mt-2 p-2.5 bg-emerald-50 rounded-xl border-2 border-emerald-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <FaCheckCircle className="text-emerald-600 text-xs" />
                    <p className="font-semibold text-gray-900 text-xs">Why choose me?</p>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Quality work, on-time delivery, and customer satisfaction is my top priority.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-4 gap-3 mt-3 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <FaShieldAlt className="text-emerald-500 text-2xl mx-auto mb-2" />
              <p className="font-semibold text-gray-900 text-sm">Verified Professional</p>
              <p className="text-xs text-gray-500 mt-1">Background verified</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <FaClock className="text-blue-500 text-2xl mx-auto mb-2" />
              <p className="font-semibold text-gray-900 text-sm">On-time Service</p>
              <p className="text-xs text-gray-500 mt-1">Punctual & reliable</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <FaTrophy className="text-yellow-500 text-2xl mx-auto mb-2" />
              <p className="font-semibold text-gray-900 text-sm">Quality Work</p>
              <p className="text-xs text-gray-500 mt-1">Satisfaction guaranteed</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <FaCalendarCheck className="text-blue-500 text-2xl mx-auto mb-2" />
              <p className="font-semibold text-gray-900 text-sm">Easy Booking</p>
              <p className="text-xs text-gray-500 mt-1">Quick & secure</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden">
        <div className="max-w-md mx-auto px-4 py-8">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
            {/* Profile Picture */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4">
                <Image
                  src={worker.profilePicture || '/user.png'}
                  alt={worker.name}
                  width={120}
                  height={120}
                  className="w-32 h-32 rounded-full object-cover shadow-md"
                />
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-md">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    <span className="text-xs font-semibold text-gray-700">Available</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-blue-600 font-bold tracking-wider uppercase mb-1">{skill}</p>
              <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                {worker.name}
                <FaCheckCircle className="text-blue-500 text-lg" title="Verified" />
              </h1>
              <p className="text-gray-600 flex items-center gap-1.5 text-sm">
                <FaMapMarkerAlt className="text-gray-400 text-xs" />
                {worker.city}
              </p>
            </div>

            {/* Stats */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaStar className="text-yellow-400 text-sm" />
                  <span className="text-gray-700 text-sm">New Professional</span>
                </div>
                <span className="text-gray-500 text-xs">No reviews yet</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaShieldAlt className="text-emerald-500 text-sm" />
                  <span className="text-gray-700 text-sm">Experience</span>
                </div>
                <span className="text-gray-900 font-semibold text-sm">{experience} years</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaPhone className="text-blue-500 text-sm" />
                  <span className="text-gray-700 text-sm">Phone</span>
                </div>
                <span className="text-gray-900 font-semibold text-sm">{worker.phone}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <a
                href={`tel:${worker.phone}`}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
              >
                <FaPhone className="text-sm" />
                Call Now
              </a>
              <button
                onClick={() => router.push(`/book/${params.id}`)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
              >
                <FaCalendarAlt className="text-sm" />
                Book Service
              </button>
            </div>
          </div>

          {/* Availability Schedule */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaCalendarCheck className="text-blue-600" />
              Availability Schedule
            </h2>

            <div className="space-y-2 mb-6">
              {weeklySchedule.length > 0 ? (
                weeklySchedule.map((slot) => (
                  <div
                    key={slot.day}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 ${
                      slot.enabled
                        ? 'bg-white border-gray-200'
                        : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${slot.enabled ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                      <p className="font-semibold text-gray-900 text-sm">{slot.day}</p>
                    </div>
                    {slot.enabled ? (
                      <p className="text-xs text-emerald-600 font-medium">{slot.start} - {slot.end}</p>
                    ) : (
                      <p className="text-xs text-red-500 font-medium">Unavailable</p>
                    )}
                    <FaChevronRight className="text-gray-400 text-xs" />
                  </div>
                ))
              ) : (
                <div className="text-center p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
                  <p className="text-sm text-gray-500">Schedule not provided</p>
                </div>
              )}
            </div>

            <button
              onClick={() => router.push(`/book/${params.id}`)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
            >
              <FaCalendarAlt />
              Book Service
            </button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <FaShieldAlt className="text-emerald-500 text-xl mx-auto mb-2" />
              <p className="font-semibold text-gray-900 text-xs">Verified Professional</p>
              <p className="text-xs text-gray-500 mt-1">Background verified</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <FaClock className="text-blue-500 text-xl mx-auto mb-2" />
              <p className="font-semibold text-gray-900 text-xs">On-time Service</p>
              <p className="text-xs text-gray-500 mt-1">Punctual & reliable</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <FaTrophy className="text-yellow-500 text-xl mx-auto mb-2" />
              <p className="font-semibold text-gray-900 text-xs">Quality Work</p>
              <p className="text-xs text-gray-500 mt-1">Satisfaction guaranteed</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <FaCalendarCheck className="text-blue-500 text-xl mx-auto mb-2" />
              <p className="font-semibold text-gray-900 text-xs">Easy Booking</p>
              <p className="text-xs text-gray-500 mt-1">Quick & secure</p>
            </div>
          </div>

          {/* Reviews Section */}
          {reviews && reviews.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Customer Reviews ({reviews.length})
              </h2>
              <div className="space-y-3">
                {reviews.map((review) => (
                  <div key={review._id} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex text-yellow-400 text-sm">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'} />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm mb-1">{review.customerName}</p>
                    <p className="text-xs text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
