import React from 'react'

export default function Button({ children, onClick, type = 'button', variant = 'primary', fullWidth = true, disabled = false }) {
  const baseClasses = 'px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
    secondary: 'bg-slate-200 text-slate-700 hover:bg-slate-300'
  }
  
  const widthClass = fullWidth ? 'w-full' : ''
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${widthClass}`}
    >
      {children}
    </button>
  )
}
