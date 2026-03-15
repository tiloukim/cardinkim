'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const CARRIERS = [
  { value: 'usps', label: 'USPS' },
  { value: 'ups', label: 'UPS' },
  { value: 'fedex', label: 'FedEx' },
  { value: 'dhl', label: 'DHL' },
  { value: 'other', label: 'Other' },
]

interface OrderDetail {
  id: string
  status: string
  subtotal: number
  discount: number
  shipping: number
  total: number
  promo_code: string | null
  paypal_order_id: string | null
  paypal_capture_id: string | null
  shipping_name: string
  shipping_email: string
  shipping_address: string | null
  shipping_city: string | null
  shipping_state: string | null
  shipping_zip: string | null
  tracking_number: string | null
  carrier: string | null
  shipped_at: string | null
  delivered_at: string | null
  created_at: string
  updated_at: string
  ck_customers: { name: string; email: string } | null
  ck_order_items: Array<{
    id: string
    title: string
    price: number
    color: string
    size: string
    quantity: number
    image_url: string
  }>
}

const STATUS_FLOW = ['paid', 'processing', 'shipped', 'delivered']

export default function AdminOrderDetail() {
  const params = useParams()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  // Shipping modal state
  const [shipModalOpen, setShipModalOpen] = useState(false)
  const [shipCarrier, setShipCarrier] = useState('usps')
  const [shipTracking, setShipTracking] = useState('')

  useEffect(() => {
    fetch(`/api/orders/${params.id}`)
      .then(r => r.json())
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [params.id])

  const updateStatus = async (newStatus: string, extra?: { tracking_number?: string; carrier?: string }) => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/orders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, ...extra }),
      })
      if (res.ok) {
        const updated = await res.json()
        setOrder(prev => prev ? { ...prev, ...updated } : prev)
      }
    } catch { /* ignore */ }
    setUpdating(false)
  }

  const handleShipSubmit = async () => {
    if (!shipTracking.trim()) return
    await updateStatus('shipped', { tracking_number: shipTracking.trim(), carrier: shipCarrier })
    setShipModalOpen(false)
    setShipTracking('')
    setShipCarrier('usps')
  }

  if (loading) return <div className="admin-loading">Loading order...</div>
  if (!order) return <div className="admin-empty">Order not found</div>

  const currentIdx = STATUS_FLOW.indexOf(order.status)
  const nextStatus = currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null

  const carrierLabel = CARRIERS.find(c => c.value === order.carrier)?.label || order.carrier

  return (
    <div>
      <Link href="/admin/orders" className="admin-back">&larr; Back to Orders</Link>

      <div className="admin-detail-header">
        <div>
          <h3>Order #{order.id.slice(0, 8)}</h3>
          <div className="admin-sub-text">{new Date(order.created_at).toLocaleString()}</div>
        </div>
        <span className={`admin-status admin-status-${order.status}`}>{order.status}</span>
      </div>

      {/* Status Progress */}
      <div className="admin-status-progress">
        {STATUS_FLOW.map((s, i) => (
          <div key={s} className={`admin-progress-step ${i <= currentIdx ? 'active' : ''}`}>
            <div className="admin-progress-dot" />
            <span>{s}</span>
          </div>
        ))}
      </div>

      {/* Status Change */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', margin: '16px 0', flexWrap: 'wrap' }}>
        <label style={{ fontSize: 13, fontWeight: 700, color: '#666' }}>Change Status:</label>
        <select
          value={order.status}
          onChange={e => {
            const newStatus = e.target.value
            if (newStatus === 'shipped') {
              setShipModalOpen(true)
            } else {
              updateStatus(newStatus)
            }
          }}
          disabled={updating}
          style={{ padding: '8px 14px', border: '2px solid #eee', borderRadius: 10, fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-dm-sans), sans-serif', cursor: 'pointer', textTransform: 'capitalize' }}
        >
          {STATUS_FLOW.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {nextStatus && nextStatus !== 'shipped' && (
          <button
            className="admin-action-btn"
            onClick={() => updateStatus(nextStatus)}
            disabled={updating}
            style={{ margin: 0 }}
          >
            {updating ? 'Updating...' : `Mark as ${nextStatus}`}
          </button>
        )}

        {nextStatus === 'shipped' && (
          <button
            className="admin-action-btn"
            onClick={() => setShipModalOpen(true)}
            disabled={updating}
            style={{ margin: 0 }}
          >
            Mark as Shipped
          </button>
        )}
      </div>

      <div className="admin-detail-grid">
        {/* Items */}
        <div className="admin-card">
          <h4>Items ({order.ck_order_items?.length || 0})</h4>
          {order.ck_order_items?.map(item => (
            <div key={item.id} className="admin-order-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image_url} alt={item.title} className="admin-item-img" />
              <div className="admin-item-info">
                <div className="admin-item-title">{item.title}</div>
                <div className="admin-sub-text">{item.color} &middot; {item.size} &middot; Qty: {item.quantity}</div>
              </div>
              <div className="admin-item-price">${(item.price * item.quantity).toFixed(2)}</div>
            </div>
          ))}
          <div className="admin-order-totals">
            <div><span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
            {order.discount > 0 && <div><span>Discount{order.promo_code && ` (${order.promo_code})`}</span><span>-${order.discount.toFixed(2)}</span></div>}
            <div><span>Shipping</span><span>{order.shipping === 0 ? 'FREE' : `$${order.shipping.toFixed(2)}`}</span></div>
            <div className="admin-order-total"><span>Total</span><span>${order.total.toFixed(2)}</span></div>
          </div>
        </div>

        {/* Customer & Shipping & Tracking */}
        <div>
          <div className="admin-card">
            <h4>Customer</h4>
            <div>{order.ck_customers?.name || order.shipping_name}</div>
            <div className="admin-sub-text">{order.ck_customers?.email || order.shipping_email}</div>
          </div>
          <div className="admin-card" style={{ marginTop: 16 }}>
            <h4>Shipping Address</h4>
            <div>{order.shipping_name}</div>
            {order.shipping_address && <div>{order.shipping_address}</div>}
            <div>{[order.shipping_city, order.shipping_state, order.shipping_zip].filter(Boolean).join(', ')}</div>
          </div>

          {/* Tracking Info Card */}
          {order.tracking_number && (
            <div className="admin-card" style={{ marginTop: 16 }}>
              <h4>Tracking</h4>
              <div style={{ fontSize: 13 }}><strong>Carrier:</strong> {carrierLabel}</div>
              <div style={{ fontSize: 13, marginTop: 4 }}><strong>Tracking #:</strong> <span style={{ fontFamily: 'monospace' }}>{order.tracking_number}</span></div>
              {order.shipped_at && <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>Shipped: {new Date(order.shipped_at).toLocaleString()}</div>}
              {order.delivered_at && <div style={{ fontSize: 12, color: '#059669', marginTop: 4 }}>Delivered: {new Date(order.delivered_at).toLocaleString()}</div>}
            </div>
          )}

          {order.paypal_order_id && (
            <div className="admin-card" style={{ marginTop: 16 }}>
              <h4>Payment</h4>
              <div className="admin-sub-text">PayPal Order: {order.paypal_order_id}</div>
              {order.paypal_capture_id && <div className="admin-sub-text">Capture: {order.paypal_capture_id}</div>}
            </div>
          )}
        </div>
      </div>

      {/* Shipping Modal */}
      {shipModalOpen && (
        <div className="modal-overlay">
          <div className="modal-backdrop" onClick={() => setShipModalOpen(false)} />
          <div className="modal-content" style={{ maxWidth: 420 }}>
            <h3 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Ship Order</h3>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>Enter tracking information for this order.</p>

            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Carrier</label>
            <select
              value={shipCarrier}
              onChange={e => setShipCarrier(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', border: '2px solid #eee', borderRadius: 12, fontSize: 14, fontFamily: 'var(--font-dm-sans), sans-serif', marginBottom: 16, boxSizing: 'border-box', appearance: 'auto' }}
            >
              {CARRIERS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>

            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Tracking Number</label>
            <input
              type="text"
              value={shipTracking}
              onChange={e => setShipTracking(e.target.value)}
              placeholder="e.g. 9400111899223033005282"
              style={{ width: '100%', padding: '12px 14px', border: '2px solid #eee', borderRadius: 12, fontSize: 14, fontFamily: 'var(--font-dm-sans), sans-serif', marginBottom: 20, boxSizing: 'border-box' }}
            />

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleShipSubmit}
                disabled={!shipTracking.trim() || updating}
                className="admin-action-btn"
                style={{ flex: 1, margin: 0 }}
              >
                {updating ? 'Saving...' : 'Mark as Shipped'}
              </button>
              <button
                onClick={() => setShipModalOpen(false)}
                className="admin-btn admin-btn-ghost"
                style={{ padding: '12px 20px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
