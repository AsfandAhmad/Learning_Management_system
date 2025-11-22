import React from 'react'
import { Link } from 'react-router-dom'

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      {/* Header */}
      <header className="w-full py-5 px-6 md:px-12 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-slate-200">
        <Link to="/" className="flex items-center">
          <span className="font-bold text-3xl md:text-4xl text-blue-600">Parhayi Likhai</span>
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
            {/* Title Section */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-black text-slate-900 mb-2">{title}</h1>
              {subtitle && <p className="text-slate-600">{subtitle}</p>}
            </div>

            {/* Form Content */}
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
