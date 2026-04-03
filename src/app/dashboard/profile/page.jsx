'use client'

import { useState, useEffect } from 'react'
import { Button } from '@heroui/react'
import { User, Phone, MapPin, Lock, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'
import { updateProfile } from '../../../lib/queries'
import { supabase } from '../../../lib/supabase'

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <h2 className="text-base font-semibold text-slate-green mb-5">{title}</h2>
      {children}
    </div>
  )
}

function Alert({ type, message }) {
  if (!message) return null
  const styles = type === 'success'
    ? 'bg-success/5 border-success/20 text-success'
    : 'bg-danger/5 border-danger/20 text-danger'
  const Icon = type === 'success' ? CheckCircle : AlertCircle
  return (
    <div className={`flex items-center gap-2 p-3 mb-5 rounded-xl border text-sm ${styles}`}>
      <Icon size={16} className="shrink-0" />
      {message}
    </div>
  )
}

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth()

  const [profileForm, setProfileForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
  })
  const [profileStatus, setProfileStatus] = useState({ type: '', msg: '' })
  const [profileLoading, setProfileLoading] = useState(false)

  const [pwForm, setPwForm] = useState({ password: '', confirm: '' })
  const [pwStatus, setPwStatus] = useState({ type: '', msg: '' })
  const [pwLoading, setPwLoading] = useState(false)

  useEffect(() => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
      })
    }
  }, [profile])

  async function handleProfileSave(e) {
    e.preventDefault()
    setProfileStatus({ type: '', msg: '' })
    setProfileLoading(true)
    const { error } = await updateProfile(user.id, profileForm)
    setProfileLoading(false)
    if (error) {
      setProfileStatus({ type: 'error', msg: error.message || 'Could not update profile.' })
    } else {
      await refreshProfile()
      setProfileStatus({ type: 'success', msg: 'Profile updated successfully.' })
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault()
    setPwStatus({ type: '', msg: '' })
    if (pwForm.password !== pwForm.confirm) {
      setPwStatus({ type: 'error', msg: 'Passwords do not match.' })
      return
    }
    if (pwForm.password.length < 8) {
      setPwStatus({ type: 'error', msg: 'Password must be at least 8 characters.' })
      return
    }
    setPwLoading(true)
    const { error } = await supabase.auth.updateUser({ password: pwForm.password })
    setPwLoading(false)
    if (error) {
      setPwStatus({ type: 'error', msg: error.message || 'Could not update password.' })
    } else {
      setPwStatus({ type: 'success', msg: 'Password updated successfully.' })
      setPwForm({ password: '', confirm: '' })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-green">Profile</h1>
        <p className="text-sm text-muted mt-1">{user.email}</p>
      </div>

      {/* Profile details */}
      <Section title="Personal Details">
        <Alert type={profileStatus.type} message={profileStatus.msg} />
        <form onSubmit={handleProfileSave} className="space-y-5">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-slate-green mb-1.5">Full name</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                id="fullName"
                type="text"
                value={profileForm.full_name}
                onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                placeholder="Your full name"
                className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-green mb-1.5">Phone number</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                id="phone"
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                placeholder="+234 800 000 0000"
                className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-slate-green mb-1.5">Address</label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3.5 top-3.5 text-muted" />
              <textarea
                id="address"
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                rows={3}
                placeholder="Your delivery address"
                className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors resize-none"
              />
            </div>
          </div>

          <Button
            type="submit"
            isDisabled={profileLoading}
            isLoading={profileLoading}
            className="px-6 py-2.5 bg-slate-green text-white text-sm font-semibold rounded-full hover:bg-volt hover:text-slate-green transition-colors disabled:opacity-60"
          >
            Save Changes
          </Button>
        </form>
      </Section>

      {/* Change password */}
      <Section title="Change Password">
        <Alert type={pwStatus.type} message={pwStatus.msg} />
        <form onSubmit={handlePasswordChange} className="space-y-5">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-slate-green mb-1.5">New password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                id="newPassword"
                type="password"
                required
                minLength={8}
                value={pwForm.password}
                onChange={(e) => setPwForm({ ...pwForm, password: e.target.value })}
                placeholder="Min. 8 characters"
                className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-slate-green mb-1.5">Confirm new password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                id="confirmNewPassword"
                type="password"
                required
                value={pwForm.confirm}
                onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                placeholder="Repeat password"
                className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors"
              />
            </div>
          </div>

          <Button
            type="submit"
            isDisabled={pwLoading}
            isLoading={pwLoading}
            className="px-6 py-2.5 bg-slate-green text-white text-sm font-semibold rounded-full hover:bg-volt hover:text-slate-green transition-colors disabled:opacity-60"
          >
            Update Password
          </Button>
        </form>
      </Section>

      {/* Account info */}
      <Section title="Account">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-green">Email address</p>
            <p className="text-sm text-muted">{user.email}</p>
          </div>
          {user.email_confirmed_at ? (
            <span className="text-xs bg-success/10 text-success px-2.5 py-1 rounded-full font-medium">
              Verified
            </span>
          ) : (
            <span className="text-xs bg-warning/10 text-warning px-2.5 py-1 rounded-full font-medium">
              Unverified
            </span>
          )}
        </div>
      </Section>
    </div>
  )
}
