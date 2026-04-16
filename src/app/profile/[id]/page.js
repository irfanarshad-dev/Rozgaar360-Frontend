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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-start space-x-6 mb-8">
            <Image
              src={worker.profilePicture || '/default-avatar.png'}
              alt={worker.name}
              width={128}
              height={128}
              className="w-32 h-32 rounded-full object-cover"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800">{worker.name}</h1>
              <p className="text-xl text-blue-600 font-medium">{worker.profile?.skill || worker.skill}</p>
              <p className="text-gray-600">{worker.city}</p>
              
              <div className="flex items-center mt-4">
                <div className="flex text-yellow-400 text-xl">
                  {'★'.repeat(Math.floor(worker.profile?.rating || worker.rating || 0))}
                  {'☆'.repeat(5 - Math.floor(worker.profile?.rating || worker.rating || 0))}
                </div>
                <span className="ml-3 text-gray-600">
                  {worker.profile?.rating || worker.rating || 0} ({worker.profile?.reviewCount || worker.reviewCount || 0} reviews)
                </span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">About</h2>
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Experience:</span> {worker.profile?.experience || worker.experience || 0} years
                </div>
                <div>
                  <span className="font-medium">Phone:</span> {worker.phone}
                </div>
                <div>
                  <span className="font-medium">Location:</span> {worker.city}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Contact</h2>
              <div className="space-y-3">
                <a href={`tel:${worker.phone}`} className="block w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 text-center font-medium">
                  Call Now
                </a>
                <button
                  onClick={() => router.push(`/book/${params.id}`)}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Book Service
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Availability Schedule</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                <div key={day} className="text-center p-3 border rounded-lg bg-gray-50 flex flex-col justify-center">
                  <p className="font-medium text-gray-800">{day}</p>
                  <p className="text-sm text-green-600 mt-1">9:00 AM - 6:00 PM</p>
                </div>
              ))}
              <div className="text-center p-3 border rounded-lg bg-gray-50 opacity-60 flex flex-col justify-center">
                <p className="font-medium text-gray-800">Sunday</p>
                <p className="text-sm text-red-500 mt-1">Unavailable</p>
              </div>
            </div>
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => router.push(`/book/${params.id}`)}
                className="bg-blue-600 text-white py-3 px-8 rounded-xl font-semibold hover:bg-blue-700 transition shadow-md w-full md:w-auto"
              >
                Book Service
              </button>
            </div>
          </div>

          {reviews && reviews.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Customer Reviews ({reviews.length})</h2>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="bg-white p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400">
                        {'★'.repeat(review.rating)}
                        {'☆'.repeat(5 - review.rating)}
                      </div>
                      <span className="ml-2 font-medium text-gray-800">{review.customerName}</span>
                      <span className="ml-auto text-sm text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
  );
}