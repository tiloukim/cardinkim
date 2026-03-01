'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface TrackOrder {
  id: string
  status: string
  subtotal: number
  discount: number
  shipping: number
  total: number
  tracking_number: string | null
  carrier: string | null
  shipped_at: string | null
  delivered_at: string | null
  shipping_name: string
  shipping_address: string | null
  shipping_city: string | null
  shipping_state: string | null
  shipping_zip: string | null
  created_at: string
  updated_at: string
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
const STATUS_LABELS: Record<string, string> = { paid: 'Order Placed', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered' }

const CARRIER_URLS: Record<string, string> = {
  usps: 'https://tools.usps.com/go/TrackConfirmAction?tLabels=',
  ups: 'https://www.ups.com/track?tracknum=',
  fedex: 'https://www.fedex.com/fedextrack/?trknbr=',
  dhl: 'https://www.dhl.com/en/express/tracking.html?AWB=',
}
const CARRIER_LABELS: Record<string, string> = { usps: 'USPS', ups: 'UPS', fedex: 'FedEx', dhl: 'DHL', other: 'Carrier' }

export default function TrackPage() {
  return (
    <Suspense>
      <TrackPageInner />
    </Suspense>
  )
}

function TrackPageInner() {
  const searchParams = useSearchParams()
  const [orderId, setOrderId] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    const id = searchParams.get('id')
    if (id) setOrderId(id)
  }, [searchParams])
  const [order, setOrder] = useState<TrackOrder | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderId.trim() || !email.trim()) return
    setLoading(true)
    setError('')
    setOrder(null)
    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderId.trim(), email: email.trim().toLowerCase() }),
      })
      if (res.ok) {
        setOrder(await res.json())
      } else {
        const data = await res.json()
        setError(data.error || 'Order not found')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  const currentIdx = order ? STATUS_FLOW.indexOf(order.status) : -1
  const carrierLabel = order?.carrier ? (CARRIER_LABELS[order.carrier] || order.carrier) : ''
  const trackingUrl = order?.carrier && order?.tracking_number && CARRIER_URLS[order.carrier]
    ? `${CARRIER_URLS[order.carrier]}${order.tracking_number}`
    : null

  return (
    <div className="track-page">
      <div className="track-header">
        <Link href="/" className="track-logo">cardin<span>kim</span></Link>
      </div>

      <div className="track-container">
        <h1 className="track-title">Track Your Order</h1>
        <p className="track-subtitle">Enter your order ID and email address to check your order status.</p>

        <form onSubmit={handleTrack} className="track-form">
          <input
            type="text"
            placeholder="Order ID"
            value={orderId}
            onChange={e => { setOrderId(e.target.value); setError('') }}
            className="track-input"
            style={{ fontFamily: 'monospace' }}
          />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => { setEmail(e.target.value); setError('') }}
            className="track-input"
          />
          {error && <div className="track-error">{error}</div>}
          <button type="submit" className="track-btn" disabled={loading}>
            {loading ? 'Looking up...' : 'Track Order'}
          </button>
        </form>

        {order && (
          <div className="track-result" style={{ animation: 'fu .5s ease' }}>
            {/* Status Timeline */}
            <div className="track-timeline">
              {STATUS_FLOW.map((s, i) => {
                const isActive = i <= currentIdx
                const timestamp = s === 'paid' ? order.created_at
                  : s === 'shipped' ? order.shipped_at
                  : s === 'delivered' ? order.delivered_at
                  : null
                return (
                  <div key={s} className={`track-timeline-step ${isActive ? 'active' : ''}`}>
                    <div className="track-timeline-dot">
                      {isActive && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                    </div>
                    <div className="track-timeline-info">
                      <div className="track-timeline-label">{STATUS_LABELS[s]}</div>
                      {timestamp && <div className="track-timeline-time">{new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>}
                    </div>
                    {i < STATUS_FLOW.length - 1 && <div className={`track-timeline-line ${i < currentIdx ? 'active' : ''}`} />}
                  </div>
                )
              })}
            </div>

            {/* Tracking Card */}
            {order.tracking_number && (
              <div className="track-card">
                <h3>Tracking Information</h3>
                <div className="track-detail-row">
                  <span>Carrier</span>
                  <span style={{ fontWeight: 700 }}>{carrierLabel}</span>
                </div>
                <div className="track-detail-row">
                  <span>Tracking Number</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{order.tracking_number}</span>
                </div>
                {trackingUrl && (
                  <a href={trackingUrl} target="_blank" rel="noreferrer" className="track-carrier-link">
                    Track on {carrierLabel} &rarr;
                  </a>
                )}
              </div>
            )}

            {/* Items */}
            <div className="track-card">
              <h3>Items ({order.ck_order_items?.length || 0})</h3>
              {order.ck_order_items?.map(item => (
                <div key={item.id} className="track-item">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image_url} alt={item.title} className="track-item-img" />
                  <div className="track-item-info">
                    <div className="track-item-title">{item.title}</div>
                    <div className="track-item-meta">{item.color} &middot; {item.size} &middot; Qty: {item.quantity}</div>
                  </div>
                  <div className="track-item-price">${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
              <div className="track-totals">
                <div><span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
                {order.discount > 0 && <div><span>Discount</span><span>-${order.discount.toFixed(2)}</span></div>}
                <div><span>Shipping</span><span>{order.shipping === 0 ? 'FREE' : `$${order.shipping.toFixed(2)}`}</span></div>
                <div className="track-total-line"><span>Total</span><span>${order.total.toFixed(2)}</span></div>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shipping_address && (
              <div className="track-card">
                <h3>Shipping Address</h3>
                <div style={{ fontSize: 14, lineHeight: 1.6, color: '#555' }}>
                  <div>{order.shipping_name}</div>
                  <div>{order.shipping_address}</div>
                  <div>{[order.shipping_city, order.shipping_state, order.shipping_zip].filter(Boolean).join(', ')}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
