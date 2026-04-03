import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router'
import { Mail, Lock, AlertCircle } from 'lucide-react'
import { Logo } from '../../assets/logo'
import { useAuth } from '../../contexts/AuthContext'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(form.email, form.password)
    setLoading(false)
    if (error) {
      setError(error.message || 'Invalid email or password.')
    } else {
      navigate(from, { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex justify-center mb-8 text-slate-green">
          <Logo height={32} />
        </Link>

        <div className="bg-white rounded-2xl border border-border p-8">
          <h1 className="text-2xl font-bold text-slate-green mb-1">Welcome back</h1>
          <p className="text-sm text-muted mb-8">Sign in to your Inargy account</p>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-6 bg-danger/5 border border-danger/20 rounded-xl text-sm text-danger">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-green mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-green">Password</label>
                <Link
                  to="/auth/reset-password"
                  className="text-xs text-muted hover:text-slate-green transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-slate-green text-white font-semibold rounded-full hover:bg-slate-dark transition-colors disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted mt-6">
          Don't have an account?{' '}
          <Link to="/auth/signup" className="font-semibold text-slate-green hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  )
}
