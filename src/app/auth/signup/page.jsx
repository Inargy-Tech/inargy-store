'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Alert } from '@heroui/react/alert'
import { Button } from '@heroui/react/button'
import { Card } from '@heroui/react/card'
import { Input } from '@heroui/react/input'
import { Mail, Lock, User, Phone, CheckCircle } from 'lucide-react'
import { Logo } from '../../../assets/logo'
import { useAuth } from '../../../contexts/AuthContext'

export default function SignupPage() {
  const { signUp } = useAuth()
  const router = useRouter()

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value })
  }

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
    const { error } = await signUp(form.email, form.password, {
      full_name: form.fullName,
      phone: form.phone,
    })
    setLoading(false)

    if (error) {
      const msg = error.message?.toLowerCase() || ''
      if (msg.includes('already registered') || msg.includes('already been registered')) {
        setError('An account with this email already exists.')
      } else {
        setError('Could not create account. Please try again.')
      }
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <Link href="/" className="flex justify-center mb-8 text-slate-green">
            <Logo height={40} />
          </Link>
          <Card className="p-8">
            <Card.Header>
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-success" />
              </div>
              <h2 className="text-xl font-bold text-slate-green mb-2">Check your email</h2>
              <p className="text-sm text-muted mb-6">
                We sent a confirmation link to <strong>{form.email}</strong>. Click it to activate your account.
              </p>
            </Card.Header>
            <Card.Footer className="justify-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center px-6 py-2.5 bg-slate-green text-white text-sm font-semibold rounded-full hover:bg-slate-dark transition-colors"
              >
                Go to Login
              </Link>
            </Card.Footer>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex justify-center mb-8 text-slate-green">
          <Logo height={40} />
        </Link>

        <Card className="p-8">
          <h1 className="text-2xl font-bold text-slate-green mb-1">Create account</h1>
          <p className="text-sm text-muted mb-8">Join Inargy to start saving on energy</p>

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
              <label className="block text-sm font-medium text-slate-green mb-1.5">Full name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <Input
                  type="text"
                  required
                  variant="bordered"
                  value={form.fullName}
                  onChange={update('fullName')}
                  placeholder="Amara Okafor"
                  className="w-full pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-green mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <Input
                  type="email"
                  required
                  variant="bordered"
                  value={form.email}
                  onChange={update('email')}
                  placeholder="you@example.com"
                  className="w-full pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-green mb-1.5">
                Phone number <span className="text-muted font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <Input
                  type="tel"
                  variant="bordered"
                  value={form.phone}
                  onChange={update('phone')}
                  placeholder="+234 800 000 0000"
                  className="w-full pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-green mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <Input
                  type="password"
                  required
                  minLength={8}
                  variant="bordered"
                  value={form.password}
                  onChange={update('password')}
                  placeholder="Min. 8 characters"
                  className="w-full pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-green mb-1.5">Confirm password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <Input
                  type="password"
                  required
                  variant="bordered"
                  value={form.confirm}
                  onChange={update('confirm')}
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
              Create Account
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-muted mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-semibold text-slate-green hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
