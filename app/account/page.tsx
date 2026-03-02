'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

interface OrderWithItems {
  id: string
  status: string
  total: number
  subtotal: number
  discount: number
  shipping: number
  tracking_number: string | null
  carrier: string | null
  shipping_name: string
  shipping_address: string | null
  shipping_city: string | null
  shipping_state: string | null
  shipping_zip: string | null
  created_at: string
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

const STATUS_LABELS: Record<string, string> = { paid: 'Paid', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered' }
const CARRIER_URLS: Record<string, string> = {
  usps: 'https://tools.usps.com/go/TrackConfirmAction?tLabels=',
  ups: 'https://www.ups.com/track?tracknum=',
  fedex: 'https://www.fedex.com/fedextrack/?trknbr=',
  dhl: 'https://www.dhl.com/en/express/tracking.html?AWB=',
}
const CARRIER_LABELS: Record<string, string> = { usps: 'USPS', ups: 'UPS', fedex: 'FedEx', dhl: 'DHL' }

export default function AccountPage() {
  const { user, customer, signOut, refreshCustomer, supabase } = useAuth()
  const router = useRouter()

  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  // Profile edit
  const [editing, setEditing] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', address: '', city: '', state: '', zip: '' })
  const [saving, setSaving] = useState(false)

  // Wait for auth — max 2 seconds then show page regardless
  useEffect(() => {
    if (user) { setReady(true); return }
    const t = setTimeout(() => setReady(true), 2000)
    return () => clearTimeout(t)
  }, [user])

  const fetchOrders = useCallback(async () => {
    if (!customer) { setLoadingOrders(false); return }
    const { data } = await supabase
      .from('ck_orders')
      .select('*, ck_order_items(*)')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoadingOrders(false)
  }, [customer, supabase])

  useEffect(() => {
    if (customer) {
      setProfileForm({
        name: customer.name || '',
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        zip: customer.zip || '',
      })
      fetchOrders()
    }
  }, [customer, fetchOrders])

  const handleSaveProfile = async () => {
    if (!customer) return
    setSaving(true)
    await supabase
      .from('ck_customers')
      .update({
        name: profileForm.name,
        phone: profileForm.phone || null,
        address: profileForm.address || null,
        city: profileForm.city || null,
        state: profileForm.state || null,
        zip: profileForm.zip || null,
      })
      .eq('id', customer.id)
    await refreshCustomer()
    setEditing(false)
    setSaving(false)
  }

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/'
  }

  if (!ready) {
    return (
      <div className="auth-page">
        <div className="auth-header" style={{ textAlign: 'center' }}>
          <Link href="/"><img src="/logo.png" alt="Cardin Kim Closet" className="auth-logo-img" style={{ margin: '0 auto' }} /></Link>
        </div>
        <div className="auth-container" style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ fontSize: 14, color: '#999' }}>Loading...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <div className="account-page">
      <div className="auth-header" style={{ textAlign: 'center' }}>
        <Link href="/"><img src="/logo.png" alt="Cardin Kim Closet" className="auth-logo-img" style={{ margin: '0 auto' }} /></Link>
      </div>

      <div className="account-container">
        <h1 className="account-title">My Account</h1>

        {/* Admin CRM Button */}
        {customer?.is_admin && (
          <Link href="/admin" style={{ display: 'block', textAlign: 'center', background: '#F9A8C9', color: '#1a1a1a', padding: '14px 30px', borderRadius: 50, fontSize: 14, fontWeight: 700, textDecoration: 'none', marginBottom: 20 }}>
            Admin Dashboard &rarr;
          </Link>
        )}

        {/* Profile Card */}
        <div className="account-card">
          <div className="account-card-header">
            <h2>Profile</h2>
            {!editing && (
              <button onClick={() => setEditing(true)} className="account-edit-btn">Edit</button>
            )}
          </div>

          {editing ? (
            <div className="account-form">
              <div className="account-field">
                <label>Name</label>
                <input value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} className="auth-input" />
              </div>
              <div className="account-field">
                <label>Email</label>
                <input value={user.email || ''} disabled className="auth-input" style={{ opacity: 0.6 }} />
              </div>
              <div className="account-field">
                <label>Phone</label>
                <input value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} className="auth-input" placeholder="(555) 123-4567" type="tel" />
              </div>
              <div className="account-field">
                <label>Address</label>
                <input value={profileForm.address} onChange={e => setProfileForm({ ...profileForm, address: e.target.value })} className="auth-input" placeholder="123 Main St" />
              </div>
              <div className="account-row">
                <div className="account-field" style={{ flex: 2 }}>
                  <label>City</label>
                  <input value={profileForm.city} onChange={e => setProfileForm({ ...profileForm, city: e.target.value })} className="auth-input" />
                </div>
                <div className="account-field" style={{ flex: 1 }}>
                  <label>State</label>
                  <input value={profileForm.state} onChange={e => setProfileForm({ ...profileForm, state: e.target.value })} className="auth-input" />
                </div>
                <div className="account-field" style={{ flex: 1 }}>
                  <label>Zip</label>
                  <input value={profileForm.zip} onChange={e => setProfileForm({ ...profileForm, zip: e.target.value })} className="auth-input" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button onClick={handleSaveProfile} className="auth-btn" disabled={saving} style={{ flex: 1 }}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => setEditing(false)} className="account-cancel-btn">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="account-info">
              <div className="account-info-row">
                <span className="account-info-label">Name</span>
                <span>{customer?.name || '—'}</span>
              </div>
              <div className="account-info-row">
                <span className="account-info-label">Email</span>
                <span>{user.email}</span>
              </div>
              {customer?.phone && (
                <div className="account-info-row">
                  <span className="account-info-label">Phone</span>
                  <span>{customer.phone}</span>
                </div>
              )}
              {customer?.address && (
                <div className="account-info-row">
                  <span className="account-info-label">Address</span>
                  <span>{[customer.address, customer.city, customer.state, customer.zip].filter(Boolean).join(', ')}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Order History */}
        <div className="account-card">
          <div className="account-card-header">
            <h2>Order History</h2>
          </div>

          {loadingOrders ? (
            <div className="account-empty">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="account-empty">
              <div style={{ fontSize: 36, marginBottom: 10 }}>&#128722;</div>
              <div>No orders yet</div>
              <Link href="/" style={{ color: '#E8453C', fontSize: 13, fontWeight: 700, textDecoration: 'none', marginTop: 8, display: 'inline-block' }}>Start Shopping &rarr;</Link>
            </div>
          ) : (
            <div className="account-orders">
              {orders.map(order => {
                const expanded = expandedOrder === order.id
                const trackUrl = order.carrier && order.tracking_number && CARRIER_URLS[order.carrier]
                  ? `${CARRIER_URLS[order.carrier]}${order.tracking_number}`
                  : null
                return (
                  <div key={order.id} className="account-order">
                    <button className="account-order-summary" onClick={() => setExpandedOrder(expanded ? null : order.id)}>
                      <div className="account-order-left">
                        <div className="account-order-date">{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        <div className="account-order-id">{order.id.slice(0, 8)}...</div>
                      </div>
                      <div className="account-order-right">
                        <span className={`ck-status ck-status-${order.status}`}>{STATUS_LABELS[order.status] || order.status}</span>
                        <span className="account-order-total">${Number(order.total).toFixed(2)}</span>
                        <span className="account-order-chevron" style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}>&#9660;</span>
                      </div>
                    </button>

                    {expanded && (
                      <div className="account-order-detail">
                        {/* Items */}
                        {order.ck_order_items?.map(item => (
                          <div key={item.id} className="account-order-item">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.image_url} alt={item.title} className="account-item-img" />
                            <div className="account-item-info">
                              <div className="account-item-title">{item.title}</div>
                              <div className="account-item-meta">{item.color} &middot; {item.size} &middot; Qty: {item.quantity}</div>
                            </div>
                            <div className="account-item-price">${(Number(item.price) * item.quantity).toFixed(2)}</div>
                          </div>
                        ))}

                        {/* Totals */}
                        <div className="account-order-totals">
                          <div><span>Subtotal</span><span>${Number(order.subtotal).toFixed(2)}</span></div>
                          {Number(order.discount) > 0 && <div><span>Discount</span><span>-${Number(order.discount).toFixed(2)}</span></div>}
                          <div><span>Shipping</span><span>{Number(order.shipping) === 0 ? 'FREE' : `$${Number(order.shipping).toFixed(2)}`}</span></div>
                          <div className="account-order-total-line"><span>Total</span><span>${Number(order.total).toFixed(2)}</span></div>
                        </div>

                        {/* Tracking */}
                        {order.tracking_number && (
                          <div className="account-tracking">
                            <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{order.tracking_number}</span>
                            {trackUrl && (
                              <a href={trackUrl} target="_blank" rel="noreferrer" className="account-track-link">
                                Track on {CARRIER_LABELS[order.carrier!] || order.carrier} &rarr;
                              </a>
                            )}
                          </div>
                        )}

                        {/* Shipping Address */}
                        {order.shipping_address && (
                          <div className="account-shipping">
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>Ship To</div>
                            <div style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>
                              {order.shipping_name}<br />
                              {order.shipping_address}<br />
                              {[order.shipping_city, order.shipping_state, order.shipping_zip].filter(Boolean).join(', ')}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Sign Out */}
        <button onClick={handleSignOut} className="account-signout-btn">Sign Out</button>
      </div>
    </div>
  )
}
