export default function Card({ children, className = '', hover = false, onClick }) {
  const hoverClass = hover ? 'hover:shadow-lg transition-shadow duration-300 cursor-pointer' : '';
  
  return (
    <div 
      className={`bg-white rounded-lg shadow-md p-6 ${hoverClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-xl font-semibold text-gray-900 ${className}`}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className = '' }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
