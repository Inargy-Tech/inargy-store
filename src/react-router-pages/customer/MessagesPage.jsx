import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Send } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getMessages, sendMessage, markMessageRead } from '../../lib/queries'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import { formatDate } from '../../config'

export default function MessagesPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [showCompose, setShowCompose] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    load()
  }, [user.id])

  async function load() {
    const { data } = await getMessages(user.id)
    const msgs = data || []
    setMessages(msgs)
    setLoading(false)
    // Mark unread as read
    msgs.filter((m) => !m.read && m.from_admin).forEach((m) => markMessageRead(m.id))
  }

  async function handleSend(e) {
    e.preventDefault()
    if (!body.trim()) return
    setSending(true)
    const { data } = await sendMessage({
      userId: user.id,
      subject: subject || 'General Enquiry',
      body: body.trim(),
    })
    setSending(false)
    if (data) {
      setMessages((prev) => [data, ...prev])
      setBody('')
      setSubject('')
      setShowCompose(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-green">Messages</h1>
          <p className="text-sm text-muted mt-1">Chat with the Inargy support team.</p>
        </div>
        <button
          onClick={() => setShowCompose(!showCompose)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-green text-white text-sm font-semibold rounded-full hover:bg-slate-dark transition-colors"
        >
          <Send size={15} /> New Message
        </button>
      </div>

      {/* Compose form */}
      {showCompose && (
        <form
          onSubmit={handleSend}
          className="bg-white rounded-2xl border border-volt/30 p-5 mb-6 animate-fade-up"
        >
          <h2 className="text-sm font-semibold text-slate-green mb-4">New Message</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-green mb-1.5">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Question about my order"
                className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-green mb-1.5">Message *</label>
              <textarea
                required
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Type your message here…"
                className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={sending || !body.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-green text-white text-sm font-semibold rounded-full hover:bg-slate-dark transition-colors disabled:opacity-60"
              >
                <Send size={15} />
                {sending ? 'Sending…' : 'Send Message'}
              </button>
              <button
                type="button"
                onClick={() => setShowCompose(false)}
                className="px-5 py-2.5 text-sm font-medium text-muted hover:bg-surface rounded-full transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {messages.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title="No messages yet"
          description="Send us a message and our team will respond as soon as possible."
        />
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`bg-white rounded-2xl border p-5 ${
                msg.from_admin ? 'border-volt/30' : 'border-border'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-2">
                  {msg.from_admin && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-green text-volt px-2 py-0.5 rounded-md">
                      Inargy
                    </span>
                  )}
                  <h3 className="text-sm font-semibold text-slate-green">{msg.subject}</h3>
                </div>
                <p className="text-xs text-muted shrink-0">{formatDate(msg.created_at)}</p>
              </div>
              <p className="text-sm text-muted leading-relaxed whitespace-pre-line">{msg.body}</p>
            </div>
          ))}
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}
