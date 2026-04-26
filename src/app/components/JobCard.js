'use client';
import { useRouter } from 'next/navigation';
import { MapPin, DollarSign, Clock, Briefcase, AlertCircle, User } from 'lucide-react';
import { useState } from 'react';
import { jobsService } from '@/lib/jobs';

export default function JobCard({ job, workerId, onJobAccepted }) {
  const router = useRouter();
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState(null);

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const handleAcceptJob = async (e) => {
    e.stopPropagation();
    if (!workerId) {
      router.push('/login');
      return;
    }

    setAccepting(true);
    setError(null);

    try {
      await jobsService.acceptJob(job._id);
      console.log('Job accepted:', job._id);
      if (onJobAccepted) onJobAccepted(job);
      router.push(`/worker/bookings/${job._id}`);
    } catch (err) {
      setError('Failed to accept job. Please try again.');
      console.error('Accept job error:', err);
    } finally {
      setAccepting(false);
    }
  };

  const handleViewDetails = () => {
    router.push(`/worker/bookings/${job._id}`);
  };

  // Extract customer info
  const customerName = job.customerId?.name || 'Customer';
  const customerPhone = job.customerId?.phone || '';
  
  return (
    <div 
      onClick={handleViewDetails}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.15)] hover:-translate-y-1.5 transition-all duration-300 p-5 flex flex-col relative overflow-hidden group cursor-pointer"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-cyan-500/0 group-hover:from-emerald-500/5 group-hover:to-cyan-500/5 transition-all duration-500 opacity-0 group-hover:opacity-100 pointer-events-none" />

      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md">
          <Briefcase className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            job.status === 'pending' ? 'text-amber-600 bg-amber-50' :
            job.status === 'confirmed' ? 'text-blue-600 bg-blue-50' :
            job.status === 'in_progress' ? 'text-purple-600 bg-purple-50' :
            job.status === 'completed' ? 'text-emerald-600 bg-emerald-50' :
            'text-gray-600 bg-gray-50'
          }`}>
            {job.status === 'pending' ? 'New' : 
             job.status === 'confirmed' ? 'Confirmed' :
             job.status === 'in_progress' ? 'In Progress' :
             job.status === 'completed' ? 'Completed' : job.status}
          </span>
        </div>
      </div>

      <h3 className="font-bold text-[17px] text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors line-clamp-1">
        {job.service}
      </h3>
      
      <p className="text-gray-500 text-[13px] mb-3 line-clamp-2 leading-relaxed">
        {job.description || 'No description provided'}
      </p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-[12px] text-gray-500">
          <User className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <span className="truncate">{customerName}</span>
        </div>

        <div className="flex items-center gap-2 text-[12px] text-gray-500">
          <MapPin className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          <span className="truncate">{job.address}</span>
        </div>

        <div className="flex items-center gap-2 text-[12px] text-gray-500">
          <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <span>{new Date(job.date).toLocaleDateString()} at {job.time}</span>
        </div>
      </div>

      {job.estimatedCost && (
        <div className="flex items-center gap-2 mb-4 text-emerald-600 font-bold text-[16px]">
          <DollarSign className="w-4 h-4" />
          <span>Rs. {job.estimatedCost.toLocaleString()}</span>
        </div>
      )}

      {error && (
        <div className="mb-3 flex items-center gap-2 text-red-600 text-xs bg-red-50 px-3 py-2 rounded-lg">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        onClick={handleAcceptJob}
        disabled={accepting || job.status !== 'pending'}
        className="mt-auto w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-bold py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {accepting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Accepting...
          </>
        ) : job.status === 'pending' ? (
          'Accept Job'
        ) : job.status === 'confirmed' ? (
          'View Details'
        ) : (
          'View Details'
        )}
      </button>
    </div>
  );
}
