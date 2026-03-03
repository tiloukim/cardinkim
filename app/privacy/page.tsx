'use client'

import Link from 'next/link'

const sections = [
  {
    title: 'Information We Collect',
    text: 'We collect information you provide when creating an account, placing an order, or contacting us. This includes your name, email address, shipping address, and payment information. We also collect device information and usage data when you use our app.',
  },
  {
    title: 'How We Use Your Information',
    text: 'We use your information to process orders, provide customer support, send order updates, and improve our services. We may also send promotional emails about new arrivals and deals — you can opt out at any time.',
  },
  {
    title: 'Payment Processing',
    text: 'Payments are processed securely through PayPal. We do not store your credit card or payment details on our servers. All payment transactions are encrypted.',
  },
  {
    title: 'Data Sharing',
    text: 'We do not sell or rent your personal information to third parties. We may share your data with shipping carriers to deliver your orders, and with service providers who help us operate our business (e.g., email delivery, analytics).',
  },
  {
    title: 'Push Notifications',
    text: 'Our app may request permission to send push notifications for order updates, shipping alerts, and promotional offers. You can manage notification preferences in your device settings at any time.',
  },
  {
    title: 'Cookies & Analytics',
    text: 'We use cookies and similar technologies to improve your browsing experience and understand how our app is used. You can disable cookies through your browser or device settings.',
  },
  {
    title: 'Data Security',
    text: 'We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.',
  },
  {
    title: 'Children\u2019s Privacy',
    text: 'Our services are intended for users aged 13 and older. We do not knowingly collect personal information from children under 13. If you believe a child under 13 has provided us with personal data, please contact us.',
  },
  {
    title: 'Your Rights',
    text: 'You may request access to, correction of, or deletion of your personal information at any time by contacting us. We will respond to your request within a reasonable timeframe.',
  },
  {
    title: 'Changes to This Policy',
    text: 'We may update this privacy policy from time to time. We will notify you of any significant changes by posting the updated policy on this page with a new effective date.',
  },
  {
    title: 'Contact Us',
    text: 'If you have any questions about this privacy policy or our data practices, please reach out through our Contact page or email us at support@cardinkim.com.',
  },
]

export default function PrivacyPage() {
  return (
    <div className="auth-page">
      <div className="auth-header" style={{ textAlign: 'center' }}>
        <Link href="/"><img src="/logo.png" alt="Cardin Kim Closet" className="auth-logo-img" style={{ margin: '0 auto' }} /></Link>
      </div>
      <div className="auth-container" style={{ maxWidth: 560 }}>
        <h1 className="auth-title">Privacy Policy</h1>
        <p className="auth-subtitle" style={{ marginBottom: 28 }}>
          Effective date: March 3, 2026
        </p>

        <div style={{ textAlign: 'left' }}>
          <p style={{ fontSize: 15, color: '#444', lineHeight: 1.7, marginBottom: 22 }}>
            Cardin Kim Closet (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information when you use our website and mobile app.
          </p>
          {sections.map(s => (
            <div key={s.title} style={{ marginBottom: 22 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 6 }}>{s.title}</h3>
              <p style={{ fontSize: 15, color: '#444', lineHeight: 1.7, margin: 0 }}>{s.text}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          <Link href="/contact" className="auth-btn" style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}>
            Contact Us
          </Link>
          <Link href="/" className="auth-btn" style={{ flex: 1, textAlign: 'center', textDecoration: 'none', background: '#fff', color: '#111', border: '1.5px solid #ddd' }}>
            Back to Shop
          </Link>
        </div>
      </div>
    </div>
  )
}
