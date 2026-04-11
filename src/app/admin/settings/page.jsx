'use client'

import { useState, useEffect } from 'react'
import { Card } from '@heroui/react/card'
import { CheckCircle, AlertCircle, Settings, Store, MessageCircle, Users, Plus, X } from 'lucide-react'
import { SITE, CONTACT, formatDate } from '../../../config'
import RoleGuard from '../../../components/layout/RoleGuard'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import { useAuth } from '../../../contexts/AuthContext'
import { adminGetTeam, adminCreateTeamMember } from '../../../lib/queries'

function Section({ icon: Icon, title, children }) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-5">
        <Icon size={18} className="text-slate-green" />
        <h2 className="text-base font-semibold text-slate-green">{title}</h2>
      </div>
      {children}
    </Card>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border-light last:border-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-medium text-slate-green">{value}</span>
    </div>
  )
}

const ROLE_BADGE = {
  admin: 'bg-slate-green/10 text-slate-green',
  operations: 'bg-blue-50 text-blue-700',
  support: 'bg-purple-50 text-purple-700',
}

const INPUT_CLASS = 'w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors'

function AddMemberModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', role: 'operations' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { data, error: err } = await adminCreateTeamMember(form)
    setLoading(false)
    if (err) {
      setError(err.message)
      return
    }
    onSuccess(data)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-slate-green">Add Team Member</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted hover:text-slate-green hover:bg-surface transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">First Name</label>
              <input
                type="text"
                value={form.first_name}
                onChange={(e) => set('first_name', e.target.value)}
                className={INPUT_CLASS}
                placeholder="First name"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Last Name</label>
              <input
                type="text"
                value={form.last_name}
                onChange={(e) => set('last_name', e.target.value)}
                className={INPUT_CLASS}
                placeholder="Last name"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              className={INPUT_CLASS}
              placeholder="email@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Phone Number</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              className={INPUT_CLASS}
              placeholder="+234..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Role</label>
            <select
              value={form.role}
              onChange={(e) => set('role', e.target.value)}
              className={INPUT_CLASS}
            >
              <option value="operations">Operations</option>
              <option value="support">Support</option>
            </select>
          </div>

          {error && (
            <p className="text-sm text-danger bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{error}</p>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-green text-white text-sm font-semibold rounded-full hover:bg-slate-dark transition-colors disabled:opacity-50"
            >
              {loading ? <LoadingSpinner size="sm" /> : null}
              Add Member
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-border text-sm font-medium text-muted rounded-full hover:border-slate-green/40 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminSettingsPage() {
  const { isAdmin } = useAuth()
  const supabaseUrlSet = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const supabaseAnonKeySet = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  const [tab, setTab] = useState('general')
  const [team, setTeam] = useState([])
  const [teamLoading, setTeamLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (tab === 'team') {
      setTeamLoading(true)
      adminGetTeam().then(({ data }) => {
        setTeam(data || [])
        setTeamLoading(false)
      })
    }
  }, [tab])

  function handleSuccess(newMember) {
    setShowModal(false)
    setTeam((prev) => [newMember, ...prev])
    setSuccessMessage(`${newMember.full_name} was added to the team.`)
    setTimeout(() => setSuccessMessage(''), 4000)
  }

  return (
    <RoleGuard section="settings">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-green">Settings</h1>
          {/* Tab toggle — same pattern as Metrics/Charts on dashboard */}
          <div className="flex items-center bg-surface border border-border rounded-full p-1">
            <button
              onClick={() => setTab('general')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                tab === 'general'
                  ? 'bg-slate-green text-white shadow-sm'
                  : 'text-muted hover:text-slate-green'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setTab('team')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                tab === 'team'
                  ? 'bg-slate-green text-white shadow-sm'
                  : 'text-muted hover:text-slate-green'
              }`}
            >
              Teams
            </button>
          </div>
        </div>

        {tab === 'general' ? (
          <>
            {/* Store info (read-only — from config) */}
            <Section icon={Store} title="Store Information">
              <InfoRow label="Store name" value={SITE.name} />
              <InfoRow label="Company" value={SITE.company} />
              <InfoRow label="Store URL" value={SITE.url} />
              <InfoRow label="Marketing site" value={SITE.marketingSite} />
              <p className="text-xs text-muted mt-4">
                To update store information, edit <code className="bg-surface px-1 py-0.5 rounded text-slate-green">src/config.js</code>.
              </p>
            </Section>

            {/* Contact info */}
            <Section icon={MessageCircle} title="Contact Information">
              <InfoRow label="Email" value={CONTACT.email} />
              <InfoRow label="Phone" value={CONTACT.phone} />
              <InfoRow label="WhatsApp" value={CONTACT.whatsapp} />
              <p className="text-xs text-muted mt-4">
                To update contact details, edit <code className="bg-surface px-1 py-0.5 rounded text-slate-green">src/config.js</code>.
              </p>
            </Section>

            {/* Environment */}
            <Section icon={Settings} title="Environment">
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-border-light">
                  <span className="text-sm font-mono text-muted">NEXT_PUBLIC_SUPABASE_URL</span>
                  <span
                    className={`flex items-center gap-1.5 text-xs font-semibold ${
                      supabaseUrlSet ? 'text-success' : 'text-danger'
                    }`}
                  >
                    {supabaseUrlSet ? (
                      <><CheckCircle size={13} /> Set</>
                    ) : (
                      <><AlertCircle size={13} /> Missing</>
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border-light last:border-0">
                  <span className="text-sm font-mono text-muted">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
                  <span
                    className={`flex items-center gap-1.5 text-xs font-semibold ${
                      supabaseAnonKeySet ? 'text-success' : 'text-danger'
                    }`}
                  >
                    {supabaseAnonKeySet ? (
                      <><CheckCircle size={13} /> Set</>
                    ) : (
                      <><AlertCircle size={13} /> Missing</>
                    )}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted mt-4">
                Set these in <code className="bg-surface px-1 py-0.5 rounded text-slate-green">.env.local</code> at the project root.
              </p>
            </Section>

            {/* Supabase schema hint */}
            <Section icon={Settings} title="Database Schema">
              <p className="text-sm text-muted mb-4">
                Required tables in your Supabase project:
              </p>
              <div className="space-y-2">
                {['profiles', 'products', 'orders', 'order_items', 'installments', 'messages'].map((table) => (
                  <div key={table} className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-volt-dim rounded-full" />
                    <code className="font-mono text-slate-green">{table}</code>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted mt-4">
                See <code className="bg-surface px-1 py-0.5 rounded text-slate-green">supabase/schema.sql</code> for the full schema.
              </p>
            </Section>
          </>
        ) : (
          <>
            {successMessage && (
              <div className="flex items-center gap-2 px-4 py-3 bg-success/10 border border-success/20 rounded-xl text-sm text-success font-medium">
                <CheckCircle size={15} />
                {successMessage}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-green">Team Members</h2>
                <p className="text-sm text-muted mt-0.5">Admins, operations, and support staff</p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-green text-white text-sm font-semibold rounded-full hover:bg-slate-dark transition-colors"
                >
                  <Plus size={15} /> Add Team Member
                </button>
              )}
            </div>

            {teamLoading ? (
              <div className="flex items-center justify-center py-16">
                <LoadingSpinner size="lg" />
              </div>
            ) : team.length === 0 ? (
              <Card className="p-16 text-center">
                <Users size={40} strokeWidth={1} className="text-muted mx-auto mb-4" />
                <p className="text-slate-green font-semibold">No team members found</p>
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border-light bg-surface/50">
                        <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">Name</th>
                        <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">Email</th>
                        <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">Phone</th>
                        <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">Role</th>
                        <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light">
                      {team.map((member) => (
                        <tr key={member.id} className="hover:bg-surface/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-slate-green text-volt rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                                {(member.full_name || '?')[0].toUpperCase()}
                              </div>
                              <p className="font-medium text-slate-green">{member.full_name || 'Unknown'}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-muted">{member.email || '—'}</td>
                          <td className="px-4 py-4 text-muted">{member.phone || '—'}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${ROLE_BADGE[member.role] || 'bg-gray-100 text-gray-500'}`}>
                              {member.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-muted">{formatDate(member.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {showModal && (
              <AddMemberModal onClose={() => setShowModal(false)} onSuccess={handleSuccess} />
            )}
          </>
        )}
      </div>
    </RoleGuard>
  )
}
