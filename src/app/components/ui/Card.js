'use client';

/**
 * Card component
 * @param {boolean} hover - enable hover lift effect
 * @param {boolean} loading - show skeleton shimmer
 * @param {'default'|'gradient'|'dark'|'flat'} variant
 * @param {string} className
 */
export default function Card({ children, className = '', hover = false, loading = false, variant = 'default', ...props }) {
  const base = 'rounded-2xl overflow-hidden transition-all duration-200';

  const variants = {
    default:  'bg-white border border-gray-100 shadow-sm',
    gradient: 'bg-gradient-to-br from-blue-600 to-blue-700 border-0 text-white',
    dark:     'bg-slate-900 border border-white/10 text-white',
    flat:     'bg-gray-50 border border-gray-100',
  };

  const hoverClass = hover ? 'hover:-translate-y-1 hover:shadow-lg cursor-pointer' : '';

  if (loading) {
    return (
      <div className={`${base} ${variants[variant]} ${className}`} {...props}>
        <div className="p-6 space-y-3">
          <div className="h-4 w-3/4 rounded skeleton" />
          <div className="h-3 w-1/2 rounded skeleton" />
          <div className="h-3 w-2/3 rounded skeleton" />
        </div>
      </div>
    );
  }

  return (
    <div className={`${base} ${variants[variant]} ${hoverClass} ${className}`} {...props}>
      {children}
    </div>
  );
}

/**
 * CardBody — adds consistent padding inside a Card
 */
export function CardBody({ children, className = '', ...props }) {
  return (
    <div className={`p-5 sm:p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

/**
 * CardHeader — card header with border bottom
 */
export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between ${className}`} {...props}>
      {children}
    </div>
  );
}
