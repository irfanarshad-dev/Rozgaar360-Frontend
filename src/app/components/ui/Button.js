'use client';

const BASE = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

const VARIANTS = {
  primary:   'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 focus-visible:ring-blue-500',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 focus-visible:ring-gray-400',
  ghost:     'hover:bg-gray-100 text-gray-700 focus-visible:ring-gray-300',
  outline:   'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus-visible:ring-blue-500',
  danger:    'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25 focus-visible:ring-red-500',
  white:     'bg-white text-blue-700 hover:bg-blue-50 shadow-md focus-visible:ring-blue-300',
};

const SIZES = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2 min-h-[44px]',
  lg: 'h-12 px-6 text-base gap-2.5 min-h-[48px]',
  xl: 'h-14 px-8 text-lg gap-3',
  icon: 'h-10 w-10 rounded-xl p-0',
};

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

/**
 * Button component
 * @param {'primary'|'secondary'|'ghost'|'outline'|'danger'|'white'} variant
 * @param {'sm'|'md'|'lg'|'xl'|'icon'} size
 * @param {boolean} loading
 * @param {boolean} fullWidth
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className = '',
  ...props
}) {
  return (
    <button
      className={`
        ${BASE}
        ${VARIANTS[variant]}
        ${SIZES[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}
