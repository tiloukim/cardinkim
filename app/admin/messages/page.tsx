'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface Customer {
  id: string
  name: string
  email: string
}

interface Conversation {
  id: string
  customer: Customer
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
  const [customers, setCustomers] = useState<Customer[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selected, setSelected] = useState<Conversation | null>(null)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showNewChat, setShowNewChat] = useState(false)
  const [search, setSearch] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/messages')
      if (res.ok) setConversations(await res.json())
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await fetch('/api/customers')
      if (res.ok) {
        const data = await res.json()
        setCustomers(data.map((c: Customer & { is_admin?: boolean }) => ({ id: c.id, name: c.name, email: c.email })))
      }
    } catch { /* ignore */ }
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

  const startNewChat = (cust: Customer) => {
    // Check if conversation already exists
    const existing = conversations.find(c => c.customer.id === cust.id)
    if (existing) {
      setSelected(existing)
    } else {
      setSelected({
        id: cust.id,
        customer: cust,
        lastMessage: '',
        lastAt: new Date().toISOString(),
        unread: 0,
      })
    }
    setShowNewChat(false)
    setSearch('')
  }

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
        await fetchConversations()
      }
    } catch { /* ignore */ }
    setSending(false)
  }

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  // Customers who already have conversations
  const existingIds = new Set(conversations.map(c => c.customer.id))

  if (loading) return <div className="admin-loading">Loading messages...</div>

  return (
    <div className="chat-admin-layout">
      {/* Conversation list */}
      <div className="chat-conv-list">
        <div className="chat-conv-header">
          <strong>Conversations</strong>
          <button
            onClick={() => { setShowNewChat(!showNewChat); if (!customers.length) fetchCustomers() }}
            style={{
              background: '#1a1a1a',
              color: '#fff',
              border: 'none',
              borderRadius: 50,
              padding: '5px 12px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            + New
          </button>
        </div>

        {/* New chat customer picker */}
        {showNewChat && (
          <div style={{ borderBottom: '1px solid #eee' }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search customer..."
              style={{
                width: '100%',
                padding: '10px 16px',
                border: 'none',
                borderBottom: '1px solid #f0f0f0',
                fontSize: 13,
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              autoFocus
            />
            <div style={{ maxHeight: 200, overflowY: 'auto' }}>
              {filteredCustomers.length === 0 ? (
                <div style={{ padding: 16, fontSize: 12, color: '#999', textAlign: 'center' }}>
                  {customers.length === 0 ? 'Loading customers...' : 'No customers found'}
                </div>
              ) : (
                filteredCustomers.map(c => (
                  <button
                    key={c.id}
                    onClick={() => startNewChat(c)}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '10px 16px',
                      border: 'none',
                      borderBottom: '1px solid #f8f8f6',
                      background: existingIds.has(c.id) ? '#f8f8f6' : '#fff',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: '#999' }}>
                      {c.email}
                      {existingIds.has(c.id) && <span style={{ marginLeft: 6, color: '#E8453C', fontWeight: 700 }}>has chat</span>}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {conversations.length === 0 && !showNewChat ? (
          <div className="admin-empty">
            No messages yet<br />
            <span style={{ fontSize: 12, color: '#bbb' }}>Click + New to start a conversation</span>
          </div>
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
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', color: '#999', fontSize: 13, padding: '40px 16px' }}>
                  No messages yet. Send the first message!
                </div>
              )}
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
            <p>Select a conversation or start a new one</p>
          </div>
        )}
      </div>
    </div>
  )
}
