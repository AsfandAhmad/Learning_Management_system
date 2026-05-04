import React from 'react'
import { Link } from 'react-router-dom'

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col">
      {/* Header - DARK PURPLE GRADIENT BACKGROUND with WHITE TEXT */}
      <header className="w-full py-5 px-6 md:px-12 flex items-center justify-between bg-gradient-to-r from-[#6b00b3] to-black shadow-sm border-b border-[#4a007d]">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-[#6b00b3] text-xl font-bold">N</span>
          </div>
          <span className="font-bold text-3xl md:text-4xl text-white">NexLern</span>
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            {/* Title Section */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-black text-[#6b00b3] mb-2">{title}</h1>
              {subtitle && <p className="text-[#6b7280]">{subtitle}</p>}
            </div>

            {/* Form Content */}
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
