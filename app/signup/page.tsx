'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password || !confirm) return
    if (password !== confirm) { setError('Passwords don\'t match'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    setError('')

    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })

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
      <div className="auth-header">
        <Link href="/" className="auth-logo">cardin<span>kim</span></Link>
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
                placeholder="Full name"
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
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                className="auth-input"
              />
              <input
                type="password"
                placeholder="Confirm password"
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setError('') }}
                className="auth-input"
              />
              {error && <div className="auth-error">{error}</div>}
              <button type="submit" className="auth-btn" disabled={loading}>
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
