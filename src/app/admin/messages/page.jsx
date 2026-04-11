'use client'

import { useState, useEffect, useCallback } from 'react'
import { MessageCircle, Send, Mail } from 'lucide-react'
import { Button } from '@heroui/react/button'
import { Card } from '@heroui/react/card'
import { adminGetMessages, sendMessage, markMessageRead } from '../../../lib/queries'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import Pagination from '../../../components/ui/Pagination'
import { formatDate } from '../../../config'
import RoleGuard from '../../../components/layout/RoleGuard'

const PAGE_SIZE = 20

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const load = useCallback(async (unread, p) => {
    setLoading(true)
    const { data, error, count } = await adminGetMessages({ unreadOnly: unread, page: p })
    if (error) console.error('Failed to load messages:', error.message)
    setMessages(data || [])
    setTotal(count || 0)
    setLoading(false)
  }, [])

  useEffect(() => {
    setPage(1)
    load(unreadOnly, 1)
  }, [unreadOnly, load])

  useEffect(() => {
    load(unreadOnly, page)
  }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

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
    setSelected(null)
  }

  const unreadCount = messages.filter((m) => !m.read).length

  return (
    <RoleGuard section="messages">
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
        <Card className="p-16 text-center">
          <MessageCircle size={40} strokeWidth={1} className="text-muted mx-auto mb-4" />
          <p className="text-slate-green font-semibold">No messages</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Message list */}
            <div className="space-y-2">
              {messages.map((msg) => (
                <Button
                  key={msg.id}
                  onPress={() => openMessage(msg)}
                  className={`w-full text-left p-4 rounded-xl border transition-all min-w-0 h-auto justify-start ${
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
                </Button>
              ))}

              <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
            </div>

            {/* Message detail + reply */}
            {selected ? (
              <Card className="p-6">
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
                  <Button
                    type="submit"
                    isLoading={sending}
                    isDisabled={!reply.trim() || sending}
                    className="mt-3 flex items-center gap-2 px-5 py-2.5 bg-slate-green text-white text-sm font-semibold rounded-full hover:bg-slate-dark transition-colors disabled:opacity-60 min-w-0 h-auto"
                  >
                    <Send size={14} />
                    Send Reply
                  </Button>
                </form>
              </Card>
            ) : (
              <Card className="p-12 flex flex-col items-center justify-center text-center">
                <Mail size={32} strokeWidth={1} className="text-muted mb-3" />
                <p className="text-sm text-muted">Select a message to read and reply</p>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
    </RoleGuard>
  )
}
