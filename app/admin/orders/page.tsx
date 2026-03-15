'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Order {
  id: string
  total: number
  status: string
  created_at: string
  shipping_name: string
  shipping_email: string
  paypal_order_id: string | null
  ck_customers: { name: string; email: string } | null
  ck_order_items: Array<{ title: string; quantity: number }>
}

const STATUSES = ['all', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'payment_error']

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/orders?status=${filter}`)
      if (res.ok) setOrders(await res.json())
    } catch { /* ignore */ }
    setLoading(false)
  }, [filter])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  return (
    <div>
      <div className="admin-tabs">
        {STATUSES.map(s => (
          <button
            key={s}
            className={`admin-tab ${filter === s ? 'active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s === 'all' ? 'All Orders' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="admin-loading">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="admin-empty">No orders found</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td><Link href={`/admin/orders/${o.id}`} className="admin-order-id" style={{ color: '#D4A574', textDecoration: 'none' }}>#{o.id.slice(0, 8)}</Link></td>
                  <td>
                    <div>{o.ck_customers?.name || o.shipping_name}</div>
                    <div className="admin-sub-text">{o.ck_customers?.email || o.shipping_email}</div>
                  </td>
                  <td>{o.ck_order_items?.length || 0} items</td>
                  <td><strong>${o.total.toFixed(2)}</strong></td>
                  <td><span className={`admin-status admin-status-${o.status}`}>{o.status}</span></td>
                  <td>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td><Link href={`/admin/orders/${o.id}`} className="admin-link">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
