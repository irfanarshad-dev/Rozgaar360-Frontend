'use client';

const VARIANTS = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  error:   'bg-red-50 text-red-700 border-red-200',
  info:    'bg-blue-50 text-blue-700 border-blue-200',
  neutral: 'bg-gray-100 text-gray-600 border-gray-200',
  purple:  'bg-purple-50 text-purple-700 border-purple-200',
};

const DOTS = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error:   'bg-red-500',
  info:    'bg-blue-500',
  neutral: 'bg-gray-400',
  purple:  'bg-purple-500',
};

/**
 * Badge component
 * @param {'success'|'warning'|'error'|'info'|'neutral'|'purple'} variant
 * @param {boolean} dot - show colored dot
 * @param {string} className
 */
export default function Badge({ children, variant = 'neutral', dot = false, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${VARIANTS[variant]} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${DOTS[variant]}`} />
      )}
      {children}
    </span>
  );
}
