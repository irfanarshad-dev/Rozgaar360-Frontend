'use client';

/**
 * SkeletonCard — animated shimmer placeholder for worker cards during loading
 */
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      {/* Header Section */}
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar */}
        <div className="h-14 w-14 rounded-xl skeleton flex-shrink-0" />
        
        {/* Name and Skill */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-4 w-32 rounded skeleton" />
          <div className="h-6 w-20 rounded-lg skeleton" />
        </div>
      </div>

      {/* Location */}
      <div className="flex items-center gap-2 mb-3">
        <div className="h-4 w-4 rounded skeleton" />
        <div className="h-3 w-24 rounded skeleton" />
      </div>

      {/* Rating Section */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-4 h-4 rounded skeleton" />
          ))}
        </div>
        <div className="h-3 w-16 rounded skeleton" />
      </div>

      {/* Experience Badge */}
      <div className="mb-4">
        <div className="h-7 w-32 rounded-lg skeleton" />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <div className="flex-1 h-10 rounded-xl skeleton" />
        <div className="flex-1 h-10 rounded-xl skeleton" />
      </div>
    </div>
  );
}

/**
 * SkeletonText — inline text placeholder
 */
export function SkeletonText({ className = 'h-4 w-full' }) {
  return <div className={`rounded-lg skeleton ${className}`} />;
}

/**
 * SkeletonAvatar — circular avatar placeholder
 */
export function SkeletonAvatar({ size = 10 }) {
  return (
    <div
      className="rounded-full skeleton flex-shrink-0"
      style={{ width: `${size * 4}px`, height: `${size * 4}px` }}
    />
  );
}

/**
 * SkeletonStatCard — dashboard stat card placeholder
 */
export function SkeletonStatCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="h-3 w-24 rounded skeleton" />
        <div className="w-12 h-12 rounded-2xl skeleton" />
      </div>
      <div className="h-8 w-16 rounded skeleton" />
      <div className="h-3 w-20 rounded skeleton" />
    </div>
  );
}

export default SkeletonCard;
