import React from 'react'

export default function Input({ label, type = 'text', placeholder, value, onChange, required = false, name }) {
  return (
    <div className="w-full mb-4">
      {label && (
        <label className="block text-sm font-medium text-text-dark mb-2">
          {label}
          {required && <span className="text-primary ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-text-dark placeholder-text-light focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
      />
    </div>
  )
}
