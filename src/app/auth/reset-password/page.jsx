'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@heroui/react'
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import { Logo } from '../../../assets/logo'
import { useAuth } from '../../../contexts/AuthContext'

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await resetPassword(email)
    setLoading(false)
    if (error) {
      setError(error.message || 'Could not send reset email.')
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex justify-center mb-8 text-slate-green">
          <Logo height={32} />
        </Link>

        <div className="bg-white rounded-2xl border border-border p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-success" />
              </div>
              <h2 className="text-xl font-bold text-slate-green mb-2">Email sent</h2>
              <p className="text-sm text-muted mb-6">
                Check <strong>{email}</strong> for a password reset link.
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-green hover:underline"
              >
                <ArrowLeft size={16} /> Back to login
              </Link>
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-slate-green transition-colors mb-6"
              >
                <ArrowLeft size={15} /> Back to login
              </Link>
              <h1 className="text-2xl font-bold text-slate-green mb-1">Reset password</h1>
              <p className="text-sm text-muted mb-8">
                Enter your email and we&apos;ll send you a reset link.
              </p>

              {error && (
                <div id="form-error" role="alert" className="flex items-center gap-2 p-3 mb-6 bg-danger/5 border border-danger/20 rounded-xl text-sm text-danger">
                  <AlertCircle size={16} className="shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5" aria-describedby={error ? 'form-error' : undefined}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-green mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      aria-invalid={error ? 'true' : undefined}
                      className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  isDisabled={loading}
                  isLoading={loading}
                  className="w-full py-3 bg-slate-green text-white font-semibold rounded-full hover:bg-volt hover:text-slate-green transition-colors disabled:opacity-60"
                >
                  Send Reset Link
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
