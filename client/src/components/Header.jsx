import React from 'react'
import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="w-full py-5 px-6 md:px-12 flex items-center justify-between bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <Link to="/" className="flex items-center">
        <span className="font-bold text-3xl md:text-4xl text-blue-600">Parhayi Likhai</span>
      </Link>
      <nav className="flex items-center gap-3 md:gap-4">
        <a href="#features" className="text-base font-medium text-slate-700 hover:text-blue-600 transition-colors hidden md:inline">Features</a>
        <a href="#pricing" className="text-base font-medium text-slate-700 hover:text-blue-600 transition-colors hidden lg:inline">Pricing</a>
        <Link to="/student/register" className="px-4 md:px-5 py-2.5 text-sm md:text-base font-semibold border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200">Sign Up</Link>
        <Link to="/student/login" className="px-4 md:px-5 py-2.5 text-sm md:text-base font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-lg transition-all duration-200">Sign In</Link>
      </nav>
    </header>
  )
}
