'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import api from '@/lib/axios';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Worker not found</div>
      </div>
    );
  }

  const weeklySchedule = worker?.profile?.weeklySchedule || worker?.weeklySchedule || [];

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex items-center gap-4">
              <Image
                src={worker.profilePicture || '/user.png'}
                alt={worker.name}
                width={120}
                height={120}
                className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover border border-gray-100"
              />
              <div>
                <p className="text-sm text-blue-600 font-semibold tracking-wide uppercase">{worker.profile?.skill || worker.skill}</p>
                <h1 className="text-2xl md:text-3xl font-black text-gray-900">{worker.name}</h1>
                <p className="text-gray-500 text-sm mt-1">{worker.city}</p>
              </div>
            </div>

            <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
              <a
                href={`tel:${worker.phone}`}
                className="w-full sm:w-auto bg-emerald-600 text-white py-3 px-6 rounded-xl hover:bg-emerald-700 text-center font-semibold"
              >
                Call Now
              </a>
              <button
                onClick={() => router.push(`/book/${params.id}`)}
                className="w-full sm:w-auto bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 font-semibold"
              >
                Book Service
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {'★'.repeat(Math.floor(worker.profile?.rating || worker.rating || 0))}
                {'☆'.repeat(5 - Math.floor(worker.profile?.rating || worker.rating || 0))}
              </div>
              <span className="text-gray-600 font-medium">
                {worker.profile?.rating || worker.rating || 0} ({worker.profile?.reviewCount || worker.reviewCount || 0} reviews)
              </span>
            </div>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">
              Experience: {worker.profile?.experience || worker.experience || 0} years
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">Phone: {worker.phone}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Availability Schedule</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {weeklySchedule.map((slot) => (
                <div key={slot.day} className={`text-center p-3 border rounded-xl flex flex-col justify-center ${slot.enabled ? 'bg-gray-50' : 'bg-gray-50 opacity-60'}`}>
                  <p className="font-semibold text-gray-800 text-sm">{slot.day}</p>
                  {slot.enabled ? (
                    <p className="text-xs text-emerald-600 mt-1">{slot.start} - {slot.end}</p>
                  ) : (
                    <p className="text-xs text-red-500 mt-1">Unavailable</p>
                  )}
                </div>
              ))}
              {weeklySchedule.length === 0 && (
                <div className="text-center p-3 border rounded-xl bg-gray-50 flex flex-col justify-center col-span-2 sm:col-span-3">
                  <p className="text-sm text-gray-500">Schedule not provided</p>
                </div>
              )}
            </div>
            <div className="mt-6">
              <button
                onClick={() => router.push(`/book/${params.id}`)}
                className="bg-blue-600 text-white py-3 px-8 rounded-xl font-semibold hover:bg-blue-700 transition shadow-md w-full sm:w-auto"
              >
                Book Service
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <span className="font-semibold text-gray-800">Primary Skill:</span> {worker.profile?.skill || worker.skill}
              </div>
              <div>
                <span className="font-semibold text-gray-800">Experience:</span> {worker.profile?.experience || worker.experience || 0} years
              </div>
              <div>
                <span className="font-semibold text-gray-800">Location:</span> {worker.city}
              </div>
              <div>
                <span className="font-semibold text-gray-800">Contact:</span> {worker.phone}
              </div>
            </div>
          </div>
        </div>

        {reviews && reviews.length > 0 && (
          <div className="mt-8 bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Reviews ({reviews.length})</h2>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <div className="flex text-amber-400">
                      {'★'.repeat(review.rating)}
                      {'☆'.repeat(5 - review.rating)}
                    </div>
                    <span className="font-semibold text-gray-800">{review.customerName}</span>
                    <span className="text-xs text-gray-400 sm:ml-auto">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}