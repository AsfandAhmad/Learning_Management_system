import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Hero() {
  const navigate = useNavigate()
  
  const handleStudent = () => {
    navigate('/student/login')
  }
  
  const handleInstructor = () => {
    navigate('/instructor/login')
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-tight">
          Teach, Learn, and 
          <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent"> Grow</span> — all in one platform
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">A modern learning management system built for instructors and students. Create courses, track progress, and collaborate seamlessly.</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <button onClick={handleStudent} className="group px-8 md:px-10 py-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 hover:shadow-xl hover:scale-105 transition-all duration-200 active:scale-95 text-base md:text-lg">
            <span className="flex items-center justify-center gap-2">
              I'm a Student
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
          <button onClick={handleInstructor} className="group px-8 md:px-10 py-4 rounded-xl border-2 border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 hover:scale-105 transition-all duration-200 active:scale-95 text-base md:text-lg">
            <span className="flex items-center justify-center gap-2">
              I'm an Instructor
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}
