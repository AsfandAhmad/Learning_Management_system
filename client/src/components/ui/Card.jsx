export default function Card({ children, className = '', hover = false, onClick }) {
  const hoverClass = hover ? 'hover:shadow-xl hover:border-primary hover:-translate-y-0.5 transition-all duration-300 cursor-pointer' : '';
  
  return (
    <div 
      className={`bg-white rounded-xl border border-gray-200 shadow-sm p-6 ${hoverClass} ${className}`}
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
    <h3 className={`text-xl font-semibold text-text-dark ${className}`}>
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
