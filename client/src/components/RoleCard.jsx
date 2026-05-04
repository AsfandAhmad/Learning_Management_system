import React from 'react'

export default function RoleCard({ title, description, cta, onClick, variant = 'indigo' }) {
  const base = 'w-full max-w-sm p-8 rounded-2xl shadow-lg flex flex-col gap-4 transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-translate-y-1'
  const colors = {
    indigo: 'bg-gradient-to-br from-white to-indigo-50/30 border-2 border-indigo-100/60',
    slate: 'bg-gradient-to-br from-slate-50 to-purple-50/30 border-2 border-slate-200/60',
  }

  return (
    <div className={`${base} ${colors[variant]}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <div className="px-3 py-1 text-xs font-semibold text-indigo-600 bg-indigo-100 rounded-full">Free trial</div>
      </div>
      <p className="text-sm text-slate-600 flex-1 leading-relaxed">{description}</p>
      <div className="pt-2">
        <button
          onClick={onClick}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:shadow-xl hover:scale-105 transition-all duration-200 active:scale-95"
          aria-label={cta}
        >
          {cta}
        </button>
      </div>
    </div>
  )
}
