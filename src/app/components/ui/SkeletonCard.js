'use client';

/**
 * SkeletonCard — animated shimmer placeholder for worker cards during loading
 */
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
      {/* Avatar placeholder */}
      <div className="w-full aspect-[4/3] rounded-xl skeleton" />

      {/* Name */}
      <div className="h-4 w-3/4 rounded-lg skeleton" />

      {/* Skill & city */}
      <div className="h-3 w-1/2 rounded-lg skeleton" />

      {/* Stars */}
      <div className="flex gap-1 mt-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-3.5 h-3.5 rounded-sm skeleton" />
        ))}
      </div>

      {/* Button */}
      <div className="h-10 rounded-xl skeleton mt-auto" />
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
