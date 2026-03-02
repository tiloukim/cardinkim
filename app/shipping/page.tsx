'use client'

import Link from 'next/link'

const sections = [
  {
    title: 'Shipping Rates',
    text: 'We offer free standard shipping on all orders over $50. Orders under $50 ship for a flat rate of $5.99.',
  },
  {
    title: 'Processing Time',
    text: 'Orders are processed within 1\u20132 business days. You\u2019ll receive a confirmation email with tracking info once your order ships.',
  },
  {
    title: 'Delivery Time',
    text: 'Standard shipping typically takes 5\u20137 business days after processing. Delivery times may vary depending on your location.',
  },
  {
    title: 'Carriers',
    text: 'We ship via USPS and UPS. The carrier is selected based on package size and destination to ensure the fastest delivery.',
  },
  {
    title: 'Order Tracking',
    text: 'Once your order ships, you\u2019ll receive a tracking number by email. You can also track your order anytime on our Track Order page.',
  },
  {
    title: 'Questions?',
    text: 'If you have any shipping questions or concerns, don\u2019t hesitate to reach out through our Contact page. We\u2019re happy to help!',
  },
]

export default function ShippingPage() {
  return (
    <div className="auth-page">
      <div className="auth-header" style={{ textAlign: 'center' }}>
        <Link href="/"><img src="/logo.png" alt="Cardin Kim Closet" className="auth-logo-img" style={{ margin: '0 auto' }} /></Link>
      </div>
      <div className="auth-container" style={{ maxWidth: 560 }}>
        <h1 className="auth-title">Shipping</h1>
        <p className="auth-subtitle" style={{ marginBottom: 28 }}>
          Free shipping on orders over $50. Flat rate $5.99 under that.
        </p>

        <div style={{ textAlign: 'left' }}>
          {sections.map(s => (
            <div key={s.title} style={{ marginBottom: 22 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 6 }}>{s.title}</h3>
              <p style={{ fontSize: 15, color: '#444', lineHeight: 1.7, margin: 0 }}>{s.text}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          <Link href="/track" className="auth-btn" style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}>
            Track Order
          </Link>
          <Link href="/contact" className="auth-btn" style={{ flex: 1, textAlign: 'center', textDecoration: 'none', background: '#fff', color: '#111', border: '1.5px solid #ddd' }}>
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  )
}
