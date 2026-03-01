'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) setReady(true)
    }
    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setReady(true)
      }
    })

    const timer = setTimeout(() => setReady(true), 3000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timer)
    }
  }, [supabase])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Failed to update password')
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/account'), 2000)
    }
  }

  if (!ready) {
    return (
      <div className="auth-page">
        <div className="auth-header">
          <Link href="/" className="auth-logo">cardin<span>kim</span></Link>
        </div>
        <div className="auth-container" style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ fontSize: 14, color: '#999' }}>Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-header">
        <Link href="/" className="auth-logo">cardin<span>kim</span></Link>
      </div>
      <div className="auth-container">
        <h1 className="auth-title">New Password</h1>
        <p className="auth-subtitle">Enter your new password below.</p>

        {success ? (
          <div className="auth-form">
            <div className="auth-success" style={{ textAlign: 'center', padding: '20px 0' }}>
              Password updated successfully! Redirecting...
            </div>
          </div>
        ) : (
          <form onSubmit={handleReset} className="auth-form">
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              className="auth-input"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirm}
              onChange={e => { setConfirm(e.target.value); setError('') }}
              className="auth-input"
            />
            {error && <div className="auth-error">{error}</div>}
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
