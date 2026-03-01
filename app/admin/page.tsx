'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Stats {
  totalRevenue: number
  todayRevenue: number
  totalOrders: number
  paidOrders: number
  processingOrders: number
  shippedOrders: number
  deliveredOrders: number
  customerCount: number
  productCount: number
  recentOrders: Array<{
    id: string
    total: number
    status: string
    created_at: string
    shipping_name: string
    ck_customers: { name: string; email: string } | null
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="admin-loading">Loading dashboard...</div>
  if (!stats) return <div className="admin-empty">Failed to load stats</div>

  const statCards = [
    { label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, color: '#10B981' },
    { label: "Today's Revenue", value: `$${stats.todayRevenue.toFixed(2)}`, color: '#3B82F6' },
    { label: 'Total Orders', value: stats.totalOrders, color: '#8B5CF6' },
    { label: 'Customers', value: stats.customerCount, color: '#F59E0B' },
    { label: 'Active Products', value: stats.productCount, color: '#EC4899' },
  ]

  const statusCards = [
    { label: 'Paid', value: stats.paidOrders, color: '#FBBF24' },
    { label: 'Processing', value: stats.processingOrders, color: '#3B82F6' },
    { label: 'Shipped', value: stats.shippedOrders, color: '#8B5CF6' },
    { label: 'Delivered', value: stats.deliveredOrders, color: '#10B981' },
  ]

  return (
    <div>
      <div className="admin-stats-grid">
        {statCards.map(s => (
          <div key={s.label} className="admin-stat-card">
            <div className="admin-stat-label">{s.label}</div>
            <div className="admin-stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="admin-section">
        <h3>Order Pipeline</h3>
        <div className="admin-pipeline">
          {statusCards.map(s => (
            <div key={s.label} className="admin-pipeline-item">
              <div className="admin-pipeline-count" style={{ color: s.color }}>{s.value}</div>
              <div className="admin-pipeline-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-section">
        <div className="admin-section-header">
          <h3>Recent Orders</h3>
          <Link href="/admin/orders" className="admin-link">View all &rarr;</Link>
        </div>
        {stats.recentOrders.length === 0 ? (
          <div className="admin-empty">No orders yet</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map(o => (
                  <tr key={o.id}>
                    <td>{o.ck_customers?.name || o.shipping_name || 'Unknown'}</td>
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
    </div>
  )
}
