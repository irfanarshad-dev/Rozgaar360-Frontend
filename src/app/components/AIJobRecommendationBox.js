'use client';
import { useState } from 'react';
import { Sparkles, MapPin, Briefcase, Loader2, ArrowRight, DollarSign, Clock, User, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { jobsService } from '@/lib/jobs';
import api from '@/lib/axios';
import { authService } from '@/lib/auth';

export default function AIJobRecommendationBox({ workerSkills = [], workerLocation = '' }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [rankedJobs, setRankedJobs] = useState([]);
  const [jobPool, setJobPool] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter();

  const deriveUrgency = (booking) => {
    const rawText = `${booking?.description || ''} ${booking?.service || ''}`.toLowerCase();
    if (rawText.includes('urgent') || rawText.includes('asap') || rawText.includes('immediately')) return 'high';

    const bookingDate = booking?.date ? new Date(booking.date) : null;
    if (bookingDate && !Number.isNaN(bookingDate.getTime())) {
      const hoursUntil = (bookingDate.getTime() - Date.now()) / (1000 * 60 * 60);
      if (hoursUntil <= 24) return 'high';
      if (hoursUntil <= 72) return 'medium';
    }

    return 'low';
  };

  const normalizeJobs = (bookings) => bookings.map((booking) => ({
    id: booking._id,
    title: booking.service || 'Job Request',
    description: booking.description || 'No description provided',
    category: booking.service || 'General',
    requiredSkills: [booking.service].filter(Boolean),
    location: booking.address || booking.customerId?.city || workerLocation || '',
    budget: Number(booking.estimatedCost || booking.totalAmount || 0),
    urgency: deriveUrgency(booking),
    customerName: booking.customerId?.name || 'Customer',
    status: booking.status,
    original: booking,
  }));

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const [profileResponse, pendingBookingsResponse] = await Promise.all([
        authService.getProfile(),
        jobsService.getWorkerJobs('pending'),
      ]);

      // Pending jobs are preferred, but if there are none we still rank all jobs
      // so workers are not blocked by an empty pending queue.
      let bookings = Array.isArray(pendingBookingsResponse) ? pendingBookingsResponse : [];
      if (bookings.length === 0) {
        const allBookingsResponse = await jobsService.getWorkerJobs();
        bookings = Array.isArray(allBookingsResponse) ? allBookingsResponse : [];
      }

      const workerProfile = {
        skills: Array.isArray(workerSkills) && workerSkills.length > 0
          ? workerSkills
          : [profileResponse?.profile?.skill].filter(Boolean),
        location: workerLocation || profileResponse?.city || profileResponse?.profile?.workerAddress || '',
        experienceLevel: profileResponse?.profile?.experience ?? 0,
        rating: profileResponse?.profile?.rating ?? 0,
        availability: profileResponse?.profile?.isAvailableNow ? 'available now' : 'not available now',
      };

      const jobsPayload = normalizeJobs(bookings);

      if (jobsPayload.length === 0) {
        setRankedJobs([]);
        setJobPool([]);
        setError('No jobs available right now. Please check again later.');
        return;
      }

      setJobPool(jobsPayload);

      const response = await api.post(
        '/api/recommendations/jobs/ai',
        {
          workerProfile,
          jobs: jobsPayload,
          preference: query.trim(),
        },
        {
          timeout: 45000,
        },
      );

      const ranked = Array.isArray(response.data) ? response.data : [];
      setRankedJobs(ranked.slice(0, 10));

      if (ranked.length === 0) {
        setError('No matching jobs found for your profile.');
      }
    } catch (err) {
      console.error('AI job search failed:', err);
      if (err?.code === 'ECONNABORTED' || err?.message?.toLowerCase?.().includes('timeout')) {
        setError('AI is taking too long right now. Please try again in a moment.');
      } else {
        setError('Failed to search jobs. Please try again.');
      }
      setRankedJobs([]);
      setJobPool([]);
    } finally {
      setLoading(false);
    }
  };

  const getJobById = (jobId) => jobPool.find((job) => String(job.id) === String(jobId));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-emerald-50 via-white to-cyan-50 rounded-2xl sm:rounded-3xl border-2 border-emerald-100 p-4 sm:p-6 md:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-3 mb-5 sm:mb-6">
          <div className="w-11 sm:w-12 h-11 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-lg flex-shrink-0">
            <Sparkles className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl font-black text-gray-900">AI Job Finder</h3>
            <p className="text-xs sm:text-sm text-gray-500">Find jobs matching your skills instantly</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="mb-5 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by service, location, or customer name..."
              className="flex-1 px-3 sm:px-5 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all text-sm sm:text-[15px]"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-bold px-4 sm:px-8 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 flex-shrink-0"
            >
              {loading ? <Loader2 className="w-4 sm:w-5 h-4 sm:h-5 animate-spin" /> : <Sparkles className="w-4 sm:w-5 h-4 sm:h-5" />}
              <span className="hidden sm:inline">{loading ? 'Searching...' : 'Find Jobs'}</span>
              <span className="sm:hidden">{loading ? '...' : 'Find'}</span>
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl text-red-600 text-xs sm:text-sm">
            {error}
          </div>
        )}

        {rankedJobs.length > 0 && (
          <div className="space-y-2 sm:space-y-3">
            <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Top AI-ranked jobs for you:</p>
            {rankedJobs.map((result) => {
              const job = getJobById(result.jobId) || {};
              return (
              <div
                key={result.jobId}
                onClick={() => router.push(`/worker/bookings/${result.jobId}`)}
                className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-100 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <Briefcase className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-emerald-600 transition-colors truncate">
                          {job.title || job.category || 'Job Recommendation'}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1 line-clamp-1">{job.description || 'No description'}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                  
                  <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${
                    result.priorityTag === 'Urgent' ? 'text-red-600 bg-red-50' :
                    result.priorityTag === 'High Paying' ? 'text-emerald-600 bg-emerald-50' :
                    result.priorityTag === 'Nearby' ? 'text-blue-600 bg-blue-50' :
                    'text-amber-600 bg-amber-50'
                  }`}>
                    {result.priorityTag}
                  </span>
                  
                  <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs text-gray-500">
                    <span className="flex items-center gap-0.5">
                      <User className="w-3 h-3" />
                      <span className="truncate">{job.customerName || 'Customer'}</span>
                    </span>
                    <span className="flex items-center gap-0.5">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{job.location || 'Unknown'}</span>
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs text-gray-500">
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />
                      {job.original?.date ? new Date(job.original.date).toLocaleDateString() : 'Soon'}
                    </span>
                    {job.budget > 0 && (
                      <span className="flex items-center gap-0.5 font-semibold text-emerald-600">
                        <DollarSign className="w-3 h-3" />
                        Rs. {job.budget.toLocaleString()}
                      </span>
                    )}
                    <span className="flex items-center gap-0.5 font-semibold text-gray-600">
                      <Tag className="w-3 h-3" />
                      {result.matchPercentage}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(result.reason || []).map((item, index) => (
                      <span key={index} className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}

        {!loading && rankedJobs.length === 0 && query && (
          <div className="text-center py-6 sm:py-8 text-gray-400">
            <Briefcase className="w-10 sm:w-12 h-10 sm:h-12 mx-auto mb-2 sm:mb-3 text-gray-300" />
            <p className="text-xs sm:text-sm">No AI-ranked jobs found. Try a different preference.</p>
          </div>
        )}
      </div>
    </div>
  );
}
