'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Alert } from '@heroui/react/alert'
import { Button } from '@heroui/react/button'
import { Card } from '@heroui/react/card'
import { Input } from '@heroui/react/input'
import { Lock, CheckCircle } from 'lucide-react'
import { Logo } from '../../../assets/logo'
import { supabase } from '../../../lib/supabase'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: form.password })
    setLoading(false)
    if (error) {
      setError(error.message || 'Could not update password.')
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/auth/login'), 2500)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex justify-center mb-8 text-slate-green">
          <Logo height={40} />
        </Link>

        <Card className="p-8">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-success" />
              </div>
              <h2 className="text-xl font-bold text-slate-green mb-2">Password updated</h2>
              <p className="text-sm text-muted">Redirecting you to login…</p>
            </div>
          ) : (
            <>
              <Card.Header>
                <h1 className="text-2xl font-bold text-slate-green mb-1">Set new password</h1>
                <p className="text-sm text-muted mb-8">Choose a strong password for your account.</p>
              </Card.Header>
              <Card.Content>
                {error && (
                  <Alert status="danger" className="mb-6">
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Description>{error}</Alert.Description>
                    </Alert.Content>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-green mb-1.5">
                      New password
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                      <Input
                        type="password"
                        required
                        minLength={8}
                        variant="bordered"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="Min. 8 characters"
                        className="w-full pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-green mb-1.5">
                      Confirm new password
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                      <Input
                        type="password"
                        required
                        variant="bordered"
                        value={form.confirm}
                        onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                        placeholder="Repeat password"
                        className="w-full pl-10"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    isDisabled={loading}
                    isLoading={loading}
                    className="w-full py-3 bg-slate-green text-white font-semibold rounded-full hover:bg-slate-dark transition-colors disabled:opacity-60"
                  >
                    Update Password
                  </Button>
                </form>
              </Card.Content>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
