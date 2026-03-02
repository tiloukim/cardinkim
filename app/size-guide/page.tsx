'use client'

import Link from 'next/link'

const tips = [
  {
    title: 'Chest / Bust',
    text: 'Measure around the fullest part of your chest, keeping the tape level under your arms and across your shoulder blades.',
  },
  {
    title: 'Waist',
    text: 'Measure around your natural waistline — the narrowest part of your torso, usually just above the belly button.',
  },
  {
    title: 'Hips',
    text: 'Stand with your feet together and measure around the widest part of your hips and glutes.',
  },
  {
    title: 'Inseam',
    text: 'Measure from your inner thigh down to the bottom of your ankle bone. Easiest done with pants that fit you well.',
  },
]

export default function SizeGuidePage() {
  return (
    <div className="auth-page">
      <div className="auth-header" style={{ textAlign: 'center' }}>
        <Link href="/"><img src="/logo.png" alt="Cardin Kim Closet" className="auth-logo-img" style={{ margin: '0 auto' }} /></Link>
      </div>
      <div className="auth-container" style={{ maxWidth: 560 }}>
        <h1 className="auth-title">Size Guide</h1>
        <p className="auth-subtitle" style={{ marginBottom: 28 }}>
          Tips to help you find your perfect fit every time.
        </p>

        <div style={{ textAlign: 'left' }}>
          <div style={{ background: '#f8f8f8', borderRadius: 12, padding: '18px 20px', marginBottom: 28 }}>
            <p style={{ fontSize: 15, color: '#444', lineHeight: 1.7, margin: 0 }}>
              Since we carry a variety of brands, sizing can vary between items. Each product listing includes the brand and size on the label. We recommend checking the brand&apos;s official size chart for the most accurate fit.
            </p>
          </div>

          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111', marginBottom: 18 }}>How to Measure Yourself</h2>

          {tips.map(t => (
            <div key={t.title} style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 6 }}>{t.title}</h3>
              <p style={{ fontSize: 15, color: '#444', lineHeight: 1.7, margin: 0 }}>{t.text}</p>
            </div>
          ))}

          <div style={{ background: '#f8f8f8', borderRadius: 12, padding: '18px 20px', marginTop: 28 }}>
            <p style={{ fontSize: 15, color: '#444', lineHeight: 1.7, margin: 0 }}>
              <strong>Still unsure?</strong> Send us a message with the item you&apos;re interested in and your usual size — we&apos;ll help you figure out the best fit.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          <Link href="/" className="auth-btn" style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}>
            Start Shopping
          </Link>
          <Link href="/contact" className="auth-btn" style={{ flex: 1, textAlign: 'center', textDecoration: 'none', background: '#fff', color: '#111', border: '1.5px solid #ddd' }}>
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  )
}
