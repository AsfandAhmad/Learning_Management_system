export default function Badge({ children, variant = 'default', size = 'md', className = '' }) {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary-light text-primary',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    // Course badge colors (EduAdmin style) - funky & distinct
    blue: 'bg-badge-blue text-white',      // IT & Software
    orange: 'bg-badge-orange text-white',  // Programming
    coral: 'bg-badge-coral text-white',    // Networking
    teal: 'bg-badge-teal text-white',      // Network Security
    purple: 'bg-badge-purple text-white',  // Design
    green: 'bg-badge-green text-white',    // Business
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <span className={`inline-flex items-center rounded-md font-semibold ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}
