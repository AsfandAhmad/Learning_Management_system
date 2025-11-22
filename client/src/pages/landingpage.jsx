import React from 'react'
import Header from '../components/Header'
import Hero from '../components/Hero'
import Footer from '../components/Footer'
import { features } from '../data/features'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />

      <main>
        <Hero />

        <section id="features" className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">Everything you need to succeed</h2>
            <p className="mt-3 text-base md:text-lg text-slate-600 max-w-2xl mx-auto">Powerful features designed to enhance teaching and learning experiences</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 border border-slate-100 hover:bg-blue-50 hover:border-blue-200"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg overflow-hidden`}>
                  {feature.image ? (
                    <img src={feature.image} alt={feature.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 bg-white/20 rounded" />
                  )}
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="bg-blue-600 rounded-2xl p-10 md:p-14 text-center shadow-xl">
            <h2 className="text-2xl md:text-4xl font-black text-white mb-3">Ready to transform your learning experience?</h2>
            <p className="text-base md:text-lg text-blue-100 mb-6 max-w-2xl mx-auto">Join thousands of students and instructors already using our platform</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="px-7 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:shadow-xl hover:scale-105 transition-all duration-200">
                Get Started Free
              </button>
              <button className="px-7 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 hover:scale-105 transition-all duration-200">
                Watch Demo
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
