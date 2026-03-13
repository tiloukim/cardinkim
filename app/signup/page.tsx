'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC']

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [captchaToken, setCaptchaToken] = useState('')
  const turnstileRef = useRef<TurnstileInstance>(null)
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !phone || !address || !city || !state || !zip || !password || !confirm) {
      setError('All fields are required')
      return
    }
    if (password !== confirm) { setError('Passwords don\'t match'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    setError('')

    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, phone, address, city, state, zip }, captchaToken },
    })

    setCaptchaToken('')
    turnstileRef.current?.reset()

    if (err) {
      setError(err.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-header" style={{ textAlign: 'center' }}>
        <Link href="/"><img src="/logo.png" alt="Cardin Kim Closet" className="auth-logo-img" style={{ margin: '0 auto' }} /></Link>
      </div>
      <div className="auth-container">
        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>&#9993;</div>
            <h1 className="auth-title">Check Your Email</h1>
            <p className="auth-subtitle">
              We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
            </p>
            <Link href="/login" className="auth-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: 24 }}>
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Sign up to track orders, save your info, and shop faster.</p>

            <form onSubmit={handleSignup} className="auth-form">
              <input
                type="text"
                placeholder="Full name *"
                value={name}
                onChange={e => { setName(e.target.value); setError('') }}
                className="auth-input"
              />
              <input
                type="email"
                placeholder="Email address *"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                className="auth-input"
              />
              <input
                type="tel"
                placeholder="Phone number *"
                value={phone}
                onChange={e => { setPhone(e.target.value); setError('') }}
                className="auth-input"
              />
              <input
                type="text"
                placeholder="Street address *"
                value={address}
                onChange={e => { setAddress(e.target.value); setError('') }}
                className="auth-input"
              />
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10 }}>
                <input
                  type="text"
                  placeholder="City *"
                  value={city}
                  onChange={e => { setCity(e.target.value); setError('') }}
                  className="auth-input"
                />
                <select
                  value={state}
                  onChange={e => { setState(e.target.value); setError('') }}
                  className="auth-input"
                  style={{ color: state ? undefined : '#999' }}
                >
                  <option value="">State *</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input
                  type="text"
                  placeholder="Zip *"
                  value={zip}
                  onChange={e => { setZip(e.target.value); setError('') }}
                  className="auth-input"
                />
              </div>
              <div style={{ fontSize: 11, color: '#999', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, marginTop: -4 }}>&#127482;&#127480; US shipping only</div>
              <input
                type="password"
                placeholder="Password *"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                className="auth-input"
              />
              <input
                type="password"
                placeholder="Confirm password *"
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setError('') }}
                className="auth-input"
              />
              {error && <div className="auth-error">{error}</div>}
              <Turnstile
                ref={turnstileRef}
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                onSuccess={setCaptchaToken}
                onExpire={() => setCaptchaToken('')}
                options={{ theme: 'light', size: 'flexible' }}
              />
              <button type="submit" className="auth-btn" disabled={loading || !captchaToken}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="auth-switch">
              Already have an account? <Link href="/login">Sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
