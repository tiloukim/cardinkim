'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'

const SUBJECTS = ['General Inquiry', 'Order Issue', 'Returns', 'Shipping', 'Other']

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [captchaToken, setCaptchaToken] = useState('')
  const turnstileRef = useRef<TurnstileInstance>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !subject || !message) {
      setError('All fields are required.')
      return
    }
    if (!captchaToken) {
      setError('Please complete the CAPTCHA.')
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message, captchaToken }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong.')
        setLoading(false)
        return
      }
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-header" style={{ textAlign: 'center' }}>
        <Link href="/"><img src="/logo.png" alt="Cardin Kim Closet" className="auth-logo-img" style={{ margin: '0 auto' }} /></Link>
      </div>
      <div className="auth-container">
        {sent ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ margin: '0 auto' }}>
                <circle cx="24" cy="24" r="24" fill="#E8453C" />
                <path d="M15 25l6 6 12-12" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="auth-title">Message Sent</h1>
            <p className="auth-subtitle">Thank you for reaching out. We&apos;ll get back to you as soon as possible.</p>
            <Link href="/" className="auth-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: 24 }}>
              Back to Shop
            </Link>
          </>
        ) : (
          <>
            <h1 className="auth-title">Contact Us</h1>
            <p className="auth-subtitle">Have a question or need help? Send us a message and we&apos;ll get back to you shortly.</p>
            <form onSubmit={handleSubmit} className="auth-form">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={e => { setName(e.target.value); setError('') }}
                className="auth-input"
              />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                className="auth-input"
              />
              <select
                value={subject}
                onChange={e => { setSubject(e.target.value); setError('') }}
                className="auth-input"
                style={{ color: subject ? undefined : '#999' }}
              >
                <option value="" disabled>Select a subject</option>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <textarea
                placeholder="Your message"
                value={message}
                onChange={e => { setMessage(e.target.value); setError('') }}
                className="auth-input"
                rows={5}
                style={{ resize: 'vertical' }}
              />
              <Turnstile
                ref={turnstileRef}
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                onSuccess={setCaptchaToken}
                onExpire={() => setCaptchaToken('')}
              />
              {error && <div className="auth-error">{error}</div>}
              <button type="submit" className="auth-btn" disabled={loading || !captchaToken}>
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
