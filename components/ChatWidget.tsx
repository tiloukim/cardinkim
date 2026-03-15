'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'

interface Message {
  id: string
  customer_id: string
  sender_role: 'customer' | 'admin'
  content: string
  is_read: boolean
  created_at: string
}

export default function ChatWidget() {
  const { user, customer } = useAuth()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [unread, setUnread] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Don't show for admins (they use the admin panel) or logged out users
  if (!user || !customer || customer.is_admin) return null

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch('/api/messages')
      if (res.ok) {
        const data: Message[] = await res.json()
        setMessages(data)
        setUnread(data.filter(m => m.sender_role === 'admin' && !m.is_read).length)
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 10000)
    return () => clearInterval(interval)
  }, [fetchMessages])

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      // Mark admin messages as read
      if (unread > 0) {
        fetch('/api/messages', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }).then(() => setUnread(0))
      }
    }
  }, [open, messages, unread])

  const sendMessage = async () => {
    if (!text.trim() || sending) return
    setSending(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      })
      if (res.ok) {
        setText('')
        await fetchMessages()
      }
    } catch { /* ignore */ }
    setSending(false)
  }

  return (
    <>
      {/* Chat bubble button */}
      <button
        onClick={() => setOpen(!open)}
        className="chat-widget-btn"
      >
        {open ? '✕' : '💬'}
        {!open && unread > 0 && <span className="chat-widget-badge">{unread}</span>}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="chat-widget-panel">
          <div className="chat-widget-header">
            <strong>Chat with us</strong>
            <span style={{ fontSize: 12, opacity: 0.7 }}>We usually reply within a few hours</span>
          </div>
          <div className="chat-widget-messages">
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#999', fontSize: 13, padding: '40px 16px' }}>
                No messages yet. Say hello!
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`chat-msg ${msg.sender_role === 'customer' ? 'chat-msg-right' : 'chat-msg-left'}`}>
                  <div className={`chat-msg-bubble ${msg.sender_role === 'customer' ? 'chat-bubble-mine' : 'chat-bubble-theirs'}`}>
                    {msg.content}
                  </div>
                  <div className="chat-msg-time" style={{ fontSize: 10 }}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>
          <div className="chat-widget-input">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Type a message..."
            />
            <button onClick={sendMessage} disabled={sending || !text.trim()}>
              &#10148;
            </button>
          </div>
        </div>
      )}
    </>
  )
}
