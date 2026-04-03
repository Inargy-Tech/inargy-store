import { useState, useEffect } from 'react'
import { MessageCircle, Send, Mail } from 'lucide-react'
import { adminGetMessages, sendMessage, markMessageRead } from '../../lib/queries'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { formatDate } from '../../config'

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [unreadOnly, setUnreadOnly] = useState(false)

  useEffect(() => {
    load()
  }, [unreadOnly])

  async function load() {
    setLoading(true)
    const { data } = await adminGetMessages({ unreadOnly })
    setMessages(data || [])
    setLoading(false)
  }

  async function openMessage(msg) {
    setSelected(msg)
    setReply('')
    if (!msg.read) {
      await markMessageRead(msg.id)
      setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, read: true } : m))
    }
  }

  async function handleReply(e) {
    e.preventDefault()
    if (!reply.trim() || !selected) return
    setSending(true)
    await sendMessage({
      userId: selected.user_id,
      subject: `Re: ${selected.subject}`,
      body: reply.trim(),
      fromAdmin: true,
      parentId: selected.id,
    })
    setSending(false)
    setReply('')
    // Optimistic: close thread
    setSelected(null)
  }

  const unreadCount = messages.filter((m) => !m.read).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-green">Messages</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted mt-1">{unreadCount} unread</p>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
            className="accent-slate-green"
          />
          Unread only
        </label>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-16 text-center">
          <MessageCircle size={40} strokeWidth={1} className="text-muted mx-auto mb-4" />
          <p className="text-slate-green font-semibold">No messages</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Message list */}
          <div className="space-y-2">
            {messages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => openMessage(msg)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selected?.id === msg.id
                    ? 'border-slate-green bg-slate-green/5'
                    : msg.read
                    ? 'border-border bg-white hover:bg-surface/50'
                    : 'border-slate-green/30 bg-volt/5 hover:bg-volt/10'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {!msg.read && (
                      <span className="w-2 h-2 bg-volt-dim rounded-full shrink-0" />
                    )}
                    <p className={`text-sm truncate ${msg.read ? 'text-muted' : 'font-semibold text-slate-green'}`}>
                      {msg.profiles?.full_name || 'Customer'}
                    </p>
                  </div>
                  <p className="text-xs text-muted shrink-0">{formatDate(msg.created_at)}</p>
                </div>
                <p className="text-sm font-medium text-slate-green mt-0.5 truncate">{msg.subject}</p>
                <p className="text-xs text-muted mt-0.5 truncate">{msg.body}</p>
              </button>
            ))}
          </div>

          {/* Message detail + reply */}
          {selected ? (
            <div className="bg-white rounded-2xl border border-border p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 bg-slate-green text-volt rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                  {(selected.profiles?.full_name || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-green">
                    {selected.profiles?.full_name || 'Customer'}
                  </p>
                  <p className="text-xs text-muted">{formatDate(selected.created_at)}</p>
                </div>
              </div>
              <h3 className="text-base font-semibold text-slate-green mb-3">{selected.subject}</h3>
              <p className="text-sm text-muted leading-relaxed whitespace-pre-line mb-6">{selected.body}</p>

              <form onSubmit={handleReply} className="border-t border-border-light pt-5">
                <label className="block text-sm font-medium text-slate-green mb-2">Reply</label>
                <textarea
                  rows={4}
                  required
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type your reply…"
                  className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors resize-none"
                />
                <button
                  type="submit"
                  disabled={sending || !reply.trim()}
                  className="mt-3 flex items-center gap-2 px-5 py-2.5 bg-slate-green text-white text-sm font-semibold rounded-full hover:bg-slate-dark transition-colors disabled:opacity-60"
                >
                  <Send size={14} />
                  {sending ? 'Sending…' : 'Send Reply'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-border p-12 flex flex-col items-center justify-center text-center">
              <Mail size={32} strokeWidth={1} className="text-muted mb-3" />
              <p className="text-sm text-muted">Select a message to read and reply</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
