'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface Conversation {
  id: string
  customer: { id: string; name: string; email: string }
  lastMessage: string
  lastAt: string
  unread: number
}

interface Message {
  id: string
  customer_id: string
  sender_role: 'customer' | 'admin'
  content: string
  is_read: boolean
  created_at: string
}

export default function AdminMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selected, setSelected] = useState<Conversation | null>(null)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/messages')
      if (res.ok) setConversations(await res.json())
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  const fetchMessages = useCallback(async (customerId: string) => {
    try {
      const res = await fetch(`/api/messages?customer_id=${customerId}`)
      if (res.ok) setMessages(await res.json())
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    fetchConversations()
    const interval = setInterval(fetchConversations, 10000)
    return () => clearInterval(interval)
  }, [fetchConversations])

  useEffect(() => {
    if (!selected) return
    fetchMessages(selected.customer.id)
    // Mark as read
    fetch('/api/messages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_id: selected.customer.id }),
    })
    const interval = setInterval(() => fetchMessages(selected.customer.id), 5000)
    return () => clearInterval(interval)
  }, [selected, fetchMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!text.trim() || !selected || sending) return
    setSending(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text, customer_id: selected.customer.id }),
      })
      if (res.ok) {
        setText('')
        await fetchMessages(selected.customer.id)
      }
    } catch { /* ignore */ }
    setSending(false)
  }

  if (loading) return <div className="admin-loading">Loading messages...</div>

  return (
    <div className="chat-admin-layout">
      {/* Conversation list */}
      <div className="chat-conv-list">
        <div className="chat-conv-header">
          <strong>Conversations</strong>
          <span style={{ fontSize: 12, color: '#999' }}>{conversations.length}</span>
        </div>
        {conversations.length === 0 ? (
          <div className="admin-empty">No messages yet</div>
        ) : (
          conversations.map(conv => (
            <button
              key={conv.id}
              className={`chat-conv-item ${selected?.id === conv.id ? 'active' : ''}`}
              onClick={() => setSelected(conv)}
            >
              <div className="chat-conv-name">
                {conv.customer.name}
                {conv.unread > 0 && <span className="chat-conv-unread">{conv.unread}</span>}
              </div>
              <div className="chat-conv-preview">{conv.lastMessage}</div>
              <div className="chat-conv-time">{new Date(conv.lastAt).toLocaleDateString()}</div>
            </button>
          ))
        )}
      </div>

      {/* Chat area */}
      <div className="chat-area">
        {selected ? (
          <>
            <div className="chat-area-header">
              <strong>{selected.customer.name}</strong>
              <span style={{ fontSize: 12, color: '#999' }}>{selected.customer.email}</span>
            </div>
            <div className="chat-messages">
              {messages.map(msg => (
                <div key={msg.id} className={`chat-msg ${msg.sender_role === 'admin' ? 'chat-msg-admin' : 'chat-msg-customer'}`}>
                  <div className="chat-msg-bubble">
                    {msg.content}
                  </div>
                  <div className="chat-msg-time">
                    {new Date(msg.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div className="chat-input-bar">
              <input
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Type a message..."
                className="chat-input"
              />
              <button onClick={sendMessage} disabled={sending || !text.trim()} className="chat-send-btn">
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="chat-empty">
            <div style={{ fontSize: 48, marginBottom: 12 }}>&#128172;</div>
            <p>Select a conversation to view messages</p>
          </div>
        )}
      </div>
    </div>
  )
}
