'use client'

import { Button } from '@heroui/react/button'
import { AlertTriangle } from 'lucide-react'

export default function GlobalError({ error, reset }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle size={32} className="text-danger" />
      </div>
      <h2 className="text-xl font-bold text-slate-green mb-2">Something went wrong</h2>
      <p className="text-sm text-muted mb-6 max-w-md">
        An unexpected error occurred. Please try again or contact support if the problem persists.
      </p>
      <Button
        onPress={() => reset()}
        className="px-6 py-2.5 bg-slate-green text-white font-semibold rounded-full hover:bg-slate-dark transition-colors"
      >
        Try Again
      </Button>
    </div>
  )
}
