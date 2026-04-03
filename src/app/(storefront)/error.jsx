'use client'

import { AlertTriangle } from 'lucide-react'

export default function StorefrontError({ error, reset }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <div className="w-16 h-16 bg-danger/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <AlertTriangle size={32} className="text-danger" />
      </div>
      <h2 className="text-xl font-bold text-slate-green mb-2">Something went wrong</h2>
      <p className="text-sm text-muted mb-6 max-w-md mx-auto">
        {error?.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center px-5 py-2.5 bg-slate-green text-white text-sm font-semibold rounded-full hover:bg-volt hover:text-slate-green transition-colors"
      >
        Try Again
      </button>
    </div>
  )
}
