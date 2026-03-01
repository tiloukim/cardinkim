'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ADMIN_TOKEN = 'cardin2026'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  order_id: string | null
  is_read: boolean
  created_at: string
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notifOpen, setNotifOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('ck_admin') === 'true') {
      setAuthed(true)
    }
  }, [])

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?unread=true', {
        headers: { 'x-admin-token': ADMIN_TOKEN },
      })
      if (res.ok) setNotifications(await res.json())
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    if (!authed) return
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 30000)
    return () => clearInterval(interval)
  }, [authed, fetchNotifs])

  const markRead = async () => {
    if (notifications.length === 0) return
    const ids = notifications.map(n => n.id)
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': ADMIN_TOKEN },
      body: JSON.stringify({ ids }),
    })
    setNotifications([])
    setNotifOpen(false)
  }

  const handleLogin = () => {
    if (pw === ADMIN_TOKEN) {
      setAuthed(true)
      sessionStorage.setItem('ck_admin', 'true')
      setPw('')
      setError('')
    } else {
      setError('Wrong password')
    }
  }

  if (!authed) {
    return (
      <div className="admin-login-gate">
        <div className="admin-login-card">
          <div className="admin-login-icon">&#128274;</div>
          <h1>Admin Access</h1>
          <p>Enter your password to access the CRM dashboard</p>
          <input
            type="password"
            placeholder="Password"
            value={pw}
            onChange={e => { setPw(e.target.value); setError('') }}
            onKeyDown={e => { if (e.key === 'Enter') handleLogin() }}
          />
          {error && <div className="admin-login-error">{error}</div>}
          <button onClick={handleLogin}>Login</button>
        </div>
      </div>
    )
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '&#128200;' },
    { href: '/admin/orders', label: 'Orders', icon: '&#128230;' },
    { href: '/admin/products', label: 'Products', icon: '&#128085;' },
    { href: '/admin/customers', label: 'Customers', icon: '&#128101;' },
  ]

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <Link href="/">cardin<span>kim</span></Link>
          <div className="admin-badge">CRM</div>
        </div>
        <nav className="admin-nav">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-item ${pathname === item.href ? 'active' : ''}`}
            >
              <span dangerouslySetInnerHTML={{ __html: item.icon }} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <Link href="/" className="admin-nav-item">
            <span>&#127968;</span> Back to Store
          </Link>
          <button onClick={() => { sessionStorage.removeItem('ck_admin'); setAuthed(false) }} className="admin-logout-btn">
            Logout
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <header className="admin-header">
          <h2 className="admin-page-title">
            {pathname === '/admin' ? 'Dashboard' : pathname === '/admin/orders' ? 'Orders' : pathname === '/admin/products' ? 'Products' : pathname === '/admin/customers' ? 'Customers' : pathname.startsWith('/admin/orders/') ? 'Order Detail' : 'Admin'}
          </h2>
          <div className="admin-header-actions">
            <div style={{ position: 'relative' }}>
              <button className="admin-notif-btn" onClick={() => setNotifOpen(!notifOpen)}>
                &#128276;
                {notifications.length > 0 && <span className="admin-notif-badge">{notifications.length}</span>}
              </button>
              {notifOpen && (
                <div className="admin-notif-panel">
                  <div className="admin-notif-header">
                    <strong>Notifications</strong>
                    {notifications.length > 0 && <button onClick={markRead}>Mark all read</button>}
                  </div>
                  {notifications.length === 0 ? (
                    <div className="admin-notif-empty">No new notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="admin-notif-item">
                        <div className="admin-notif-title">{n.title}</div>
                        <div className="admin-notif-msg">{n.message}</div>
                        <div className="admin-notif-time">{new Date(n.created_at).toLocaleString()}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  )
}
