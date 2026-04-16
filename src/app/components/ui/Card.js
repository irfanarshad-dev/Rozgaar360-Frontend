export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div 
      className={`bg-white rounded-2xl border border-gray-100 ${hover ? 'transition-all duration-200 hover:shadow-lg hover:-translate-y-1' : 'shadow-sm'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={`px-6 py-4 border-b border-gray-100 ${className}`}>{children}</div>;
}

export function CardBody({ children, className = '' }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return <div className={`px-6 py-4 border-t border-gray-100 ${className}`}>{children}</div>;
}
