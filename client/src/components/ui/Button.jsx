import React from 'react'

export default function Button({ children, onClick, type = 'button', variant = 'primary', fullWidth = false, disabled = false, className = '', size = 'md' }) {
  const baseClasses = 'rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-[#6b00b3] text-white hover:bg-[#4a007d] hover:shadow-lg',
    outline: 'border-2 border-[#6b00b3] text-[#6b00b3] hover:bg-[#f3e6ff]',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300'
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-lg'
  }
  
  const widthClass = fullWidth ? 'w-full' : ''
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
    >
      {children}
    </button>
  )
}
