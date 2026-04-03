import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Mail, Lock, User, Phone, AlertCircle, CheckCircle } from 'lucide-react'
import { Logo } from '../../assets/logo'
import { useAuth } from '../../contexts/AuthContext'

export default function SignupPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

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
      setError(error.message || 'Could not create account.')
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <Link to="/" className="flex justify-center mb-8 text-slate-green">
            <Logo height={32} />
          </Link>
          <div className="bg-white rounded-2xl border border-border p-8">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-success" />
            </div>
            <h2 className="text-xl font-bold text-slate-green mb-2">Check your email</h2>
            <p className="text-sm text-muted mb-6">
              We sent a confirmation link to <strong>{form.email}</strong>. Click it to activate your account.
            </p>
            <Link
              to="/auth/login"
              className="inline-flex items-center px-6 py-2.5 bg-slate-green text-white text-sm font-semibold rounded-full hover:bg-slate-dark transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex justify-center mb-8 text-slate-green">
          <Logo height={32} />
        </Link>

        <div className="bg-white rounded-2xl border border-border p-8">
          <h1 className="text-2xl font-bold text-slate-green mb-1">Create account</h1>
          <p className="text-sm text-muted mb-8">Join Inargy to start saving on energy</p>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-6 bg-danger/5 border border-danger/20 rounded-xl text-sm text-danger">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-green mb-1.5">Full name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={update('fullName')}
                  placeholder="Amara Okafor"
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-green mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={update('email')}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-green mb-1.5">
                Phone number <span className="text-muted font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={update('phone')}
                  placeholder="+234 800 000 0000"
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-green mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={update('password')}
                  placeholder="Min. 8 characters"
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-green mb-1.5">Confirm password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="password"
                  required
                  value={form.confirm}
                  onChange={update('confirm')}
                  placeholder="Repeat password"
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-slate-green text-white font-semibold rounded-full hover:bg-slate-dark transition-colors disabled:opacity-60"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted mt-6">
          Already have an account?{' '}
          <Link to="/auth/login" className="font-semibold text-slate-green hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
