'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Supabase sets the session from the URL hash automatically
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    // Also check if already in a session (user clicked link)
    const timer = setTimeout(() => setReady(true), 2000)
    return () => clearTimeout(timer)
  }, [supabase])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    setError('')

    const { error: err } = await supabase.auth.updateUser({ password })
    if (err) {
      setError(err.message)
      setLoading(false)
    } else {
      router.push('/account')
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
      </div>
    </div>
  )
}
