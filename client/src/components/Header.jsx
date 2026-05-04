import React from 'react'
import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="w-full py-5 px-6 md:px-12 flex items-center justify-between bg-gradient-to-r from-[#6b00b3] to-black shadow-sm sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
          <span className="text-[#6b00b3] text-xl font-bold">N</span>
        </div>
        <span className="font-bold text-3xl md:text-4xl text-white">NexLern</span>
      </Link>
      <nav className="flex items-center gap-3 md:gap-4">
        <a href="#features" className="text-base font-medium text-white/85 hover:text-white transition-colors hidden md:inline">Features</a>
        <a href="#pricing" className="text-base font-medium text-white/85 hover:text-white transition-colors hidden lg:inline">Pricing</a>
        <Link to="/student/register" className="px-4 md:px-5 py-2.5 text-sm md:text-base font-semibold border-2 border-white text-white rounded-lg hover:bg-white hover:text-[#6b00b3] transition-all duration-200">Sign Up</Link>
        <Link to="/student/login" className="px-4 md:px-5 py-2.5 text-sm md:text-base font-semibold bg-white text-[#6b00b3] rounded-lg hover:bg-white/90 hover:shadow-lg transition-all duration-200">Sign In</Link>
      </nav>
    </header>
  )
}
