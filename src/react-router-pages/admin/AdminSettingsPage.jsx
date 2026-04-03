import { useState } from 'react'
import { CheckCircle, AlertCircle, Settings, Store, MessageCircle } from 'lucide-react'
import { SITE, CONTACT } from '../../config'

function Section({ icon: Icon, title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <div className="flex items-center gap-2 mb-5">
        <Icon size={18} className="text-slate-green" />
        <h2 className="text-base font-semibold text-slate-green">{title}</h2>
      </div>
      {children}
    </div>
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

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false)

  function handleSave(e) {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-green">Settings</h1>

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
          {[
            { label: 'VITE_SUPABASE_URL', key: 'VITE_SUPABASE_URL' },
            { label: 'VITE_SUPABASE_ANON_KEY', key: 'VITE_SUPABASE_ANON_KEY' },
          ].map(({ label, key }) => {
            const isSet = Boolean(import.meta.env[key])
            return (
              <div key={key} className="flex items-center justify-between py-3 border-b border-border-light last:border-0">
                <span className="text-sm font-mono text-muted">{label}</span>
                <span
                  className={`flex items-center gap-1.5 text-xs font-semibold ${
                    isSet ? 'text-success' : 'text-danger'
                  }`}
                >
                  {isSet ? (
                    <><CheckCircle size={13} /> Set</>
                  ) : (
                    <><AlertCircle size={13} /> Missing</>
                  )}
                </span>
              </div>
            )
          })}
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
    </div>
  )
}
