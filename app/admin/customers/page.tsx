'use client'

import { useState, useEffect } from 'react'

const TOKEN = 'cardin2026'

interface Customer {
  id: string
  name: string
  email: string
  city: string | null
  state: string | null
  created_at: string
  order_count: number
  total_spent: number
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        // Fetch orders which include customer data, then aggregate
        const res = await fetch('/api/orders?status=all', {
          headers: { 'x-admin-token': TOKEN },
        })
        if (!res.ok) return

        const orders = await res.json()
        const customerMap = new Map<string, Customer>()

        for (const order of orders) {
          const cust = order.ck_customers
          if (!cust) continue

          if (customerMap.has(cust.id)) {
            const existing = customerMap.get(cust.id)!
            existing.order_count += 1
            existing.total_spent += order.total
          } else {
            customerMap.set(cust.id, {
              id: cust.id,
              name: cust.name,
              email: cust.email,
              city: cust.city || order.shipping_city,
              state: cust.state || order.shipping_state,
              created_at: cust.created_at || order.created_at,
              order_count: 1,
              total_spent: order.total,
            })
          }
        }

        setCustomers(Array.from(customerMap.values()).sort((a, b) => b.total_spent - a.total_spent))
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
        <div className="admin-empty">No customers yet. Orders will populate this page.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Location</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Since</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                    <div className="admin-sub-text">{c.email}</div>
                  </td>
                  <td>{[c.city, c.state].filter(Boolean).join(', ') || '—'}</td>
                  <td><strong>{c.order_count}</strong></td>
                  <td style={{ color: '#10B981', fontWeight: 700 }}>${c.total_spent.toFixed(2)}</td>
                  <td>{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
