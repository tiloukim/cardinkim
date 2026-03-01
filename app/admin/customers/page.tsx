'use client'

import { useState, useEffect } from 'react'

interface Customer {
  id: string
  name: string
  email: string
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  created_at: string
  order_count: number
  total_spent: number
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/customers')
        if (!res.ok) return
        const data = await res.json()
        setCustomers(data)
      } catch { /* ignore */ }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="admin-loading">Loading customers...</div>

  return (
    <div>
      <div className="admin-section-header" style={{ marginBottom: 20 }}>
        <div className="admin-sub-text">{customers.length} customers</div>
      </div>

      {customers.length === 0 ? (
        <div className="admin-empty">No customers yet.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Location</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Since</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id} onClick={() => setExpanded(expanded === c.id ? null : c.id)} style={{ cursor: 'pointer' }}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                    <div className="admin-sub-text">{c.email}</div>
                  </td>
                  <td style={{ fontSize: 13 }}>{c.phone || '—'}</td>
                  <td>{[c.city, c.state, c.zip].filter(Boolean).join(', ') || '—'}</td>
                  <td><strong>{c.order_count}</strong></td>
                  <td style={{ color: '#10B981', fontWeight: 700 }}>${c.total_spent.toFixed(2)}</td>
                  <td>{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {expanded && (() => {
            const c = customers.find(x => x.id === expanded)
            if (!c) return null
            return (
              <div style={{ background: '#f9f9f7', border: '1px solid #eee', borderRadius: 12, padding: 20, marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{c.name}</h3>
                  <button onClick={() => setExpanded(null)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#999' }}>&times;</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 32px', fontSize: 13 }}>
                  <div><span style={{ color: '#999', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</span><div style={{ marginTop: 2 }}>{c.email}</div></div>
                  <div><span style={{ color: '#999', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone</span><div style={{ marginTop: 2 }}>{c.phone || '—'}</div></div>
                  <div><span style={{ color: '#999', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Address</span><div style={{ marginTop: 2 }}>{c.address || '—'}</div></div>
                  <div><span style={{ color: '#999', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>City / State / Zip</span><div style={{ marginTop: 2 }}>{[c.city, c.state, c.zip].filter(Boolean).join(', ') || '—'}</div></div>
                  <div><span style={{ color: '#999', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Orders</span><div style={{ marginTop: 2 }}>{c.order_count}</div></div>
                  <div><span style={{ color: '#999', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Spent</span><div style={{ marginTop: 2, color: '#10B981', fontWeight: 700 }}>${c.total_spent.toFixed(2)}</div></div>
                  <div><span style={{ color: '#999', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Member Since</span><div style={{ marginTop: 2 }}>{new Date(c.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div></div>
                  <div><span style={{ color: '#999', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customer ID</span><div style={{ marginTop: 2, fontFamily: 'monospace', fontSize: 11 }}>{c.id}</div></div>
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
