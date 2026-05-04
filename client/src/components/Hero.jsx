import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Hero.css'

export default function Hero() {
  const navigate = useNavigate()
  
  const handleStudent = () => {
    navigate('/student/login')
  }
  
  const handleInstructor = () => {
    navigate('/instructor/login')
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12 bg-white">
      <div className="max-w-7xl mx-auto w-full">
        {/* SOLID DARKER PURPLE CONTAINER with WHITE TEXT and 3D Scene */}
        <div className="hero-container bg-[#4a007d] rounded-2xl px-8 md:px-16 py-12 md:py-20 shadow-2xl relative overflow-hidden">
          {/* Decorative background circles */}
          <div className="hero-bg-circle-1"></div>
          <div className="hero-bg-circle-2"></div>
          
          <div className="flex items-center justify-between gap-8">
            {/* LEFT: Text content */}
            <div className="flex-1 z-10 text-center md:text-left">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-6">
                Learn Without<br />Limits
              </h1>
              
              <p className="text-base md:text-xl text-white/90 max-w-lg mx-auto md:mx-0 leading-relaxed mb-10">
                Master new skills, build your future, and grow with NexLern — the modern learning platform designed for ambitious learners.
              </p>

              {/* BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button 
                  onClick={handleStudent} 
                  className="group px-10 md:px-12 py-4 rounded-lg bg-white text-[#6b00b3] font-semibold text-lg hover:bg-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-200 active:scale-95"
                >
                  <span className="flex items-center justify-center gap-2">
                    I'm a Student
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
                <button 
                  onClick={handleInstructor} 
                  className="group px-10 md:px-12 py-4 rounded-lg bg-transparent text-white border-2 border-white font-semibold text-lg hover:bg-white/10 hover:scale-105 transition-all duration-200 active:scale-95"
                >
                  <span className="flex items-center justify-center gap-2">
                    I'm an Instructor
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>

            {/* RIGHT: 3D floating scene */}
            <div className="hero-3d-scene hidden lg:block">
              {/* Book 1 - Blue */}
              <div className="book-3d book-1" style={{ top: '20px', left: '40px' }}>
                <div className="book-cover" style={{ background: '#2980b9' }}>
                  <span className="book-icon">📘</span>
                </div>
                <div className="book-spine" style={{ background: '#1f6391' }}>
                  <span className="book-spine-text">IT</span>
                </div>
                <div className="book-pages"></div>
              </div>

              {/* Book 2 - Green */}
              <div className="book-3d book-2" style={{ top: '80px', left: '140px' }}>
                <div className="book-cover" style={{ background: '#27ae60' }}>
                  <span className="book-icon">📗</span>
                </div>
                <div className="book-spine" style={{ background: '#1e8449' }}>
                  <span className="book-spine-text">CS</span>
                </div>
                <div className="book-pages"></div>
              </div>

              {/* Book 3 - Purple */}
              <div className="book-3d book-3" style={{ top: '140px', left: '70px' }}>
                <div className="book-cover" style={{ background: '#8e44ad' }}>
                  <span className="book-icon">📕</span>
                </div>
                <div className="book-spine" style={{ background: '#6c3483' }}>
                  <span className="book-spine-text">AI</span>
                </div>
                <div className="book-pages"></div>
              </div>

              {/* Graduation Cap */}
              <div className="grad-cap" style={{ top: '30px', right: '60px' }}>
                <div className="cap-top"></div>
                <div className="cap-base"></div>
                <div className="cap-tassel"></div>
              </div>

              {/* Floating Badge Card */}
              <div className="floating-badge" style={{ top: '120px', right: '40px' }}>
                <div className="badge-text-main">95% Pass Rate</div>
                <div className="badge-text-sub">Top Courses</div>
              </div>

              {/* Gold Star */}
              <div className="gold-star star-1" style={{ top: '10px', right: '140px' }}></div>
              <div className="gold-star star-2" style={{ top: '180px', right: '120px' }}></div>
            </div>
          </div>
        </div>

        {/* Stats Section - OUTSIDE purple container, on WHITE background with DARK text */}
        <div className="pt-16 flex flex-wrap items-center justify-center gap-8 md:gap-12">
          <div className="text-center">
            <p className="text-4xl font-black text-[#6b00b3]">1000+</p>
            <p className="text-sm text-gray-600 mt-1">Active Students</p>
          </div>
          <div className="hidden md:block w-px h-16 bg-gray-300"></div>
          <div className="text-center">
            <p className="text-4xl font-black text-[#6b00b3]">50+</p>
            <p className="text-sm text-gray-600 mt-1">Expert Instructors</p>
          </div>
          <div className="hidden md:block w-px h-16 bg-gray-300"></div>
          <div className="text-center">
            <p className="text-4xl font-black text-[#6b00b3]">200+</p>
            <p className="text-sm text-gray-600 mt-1">Courses</p>
          </div>
        </div>
      </div>
    </section>
  )
}
