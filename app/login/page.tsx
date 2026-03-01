'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotMode, setForgotMode] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError('')

    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) {
      setError(err.message)
      setLoading(false)
    } else {
      router.push('/account')
      router.refresh()
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { setError('Enter your email address'); return }
    setLoading(true)
    setError('')
    setMessage('')

    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (err) {
      setError(err.message)
    } else {
      setMessage('Check your email for a password reset link.')
    }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-header">
        <Link href="/" className="auth-logo">cardin<span>kim</span></Link>
      </div>
      <div className="auth-container">
        <h1 className="auth-title">{forgotMode ? 'Reset Password' : 'Welcome Back'}</h1>
        <p className="auth-subtitle">
          {forgotMode
            ? 'Enter your email and we\u2019ll send you a reset link.'
            : 'Sign in to view your orders and manage your account.'}
        </p>

        {forgotMode ? (
          <form onSubmit={handleForgotPassword} className="auth-form">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); setMessage('') }}
              className="auth-input"
            />
            {error && <div className="auth-error">{error}</div>}
            {message && <div className="auth-success">{message}</div>}
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="auth-form">
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
            {error && <div className="auth-error">{error}</div>}
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}

        <p className="auth-switch">
          {forgotMode ? (
            <button onClick={() => { setForgotMode(false); setError(''); setMessage('') }} style={{ background: 'none', border: 'none', color: '#E8453C', fontWeight: 700, cursor: 'pointer', fontSize: 'inherit', fontFamily: 'inherit' }}>
              Back to Sign In
            </button>
          ) : (
            <>
              <button onClick={() => { setForgotMode(true); setError('') }} style={{ background: 'none', border: 'none', color: '#E8453C', fontWeight: 700, cursor: 'pointer', fontSize: 'inherit', fontFamily: 'inherit' }}>
                Forgot password?
              </button>
              <br />
              Don&apos;t have an account? <Link href="/signup">Create one</Link>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
