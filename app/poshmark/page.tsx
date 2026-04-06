'use client'

import { useState, useEffect } from 'react'

const PASS = 'Tirak2005'
const STORAGE_KEY = 'poshmark_auth'

export default function PoshmarkPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === PASS) setAuthed(true)
  }, [])

  const login = () => {
    if (password === PASS) {
      localStorage.setItem(STORAGE_KEY, PASS)
      setAuthed(true)
    } else {
      setError(true)
    }
  }

  if (!authed) {
    return (
      <div style={{
        minHeight: '100vh', background: '#f5f5f0', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}>
        <div style={{
          background: '#fff', borderRadius: 16, padding: 40, maxWidth: 360,
          width: '100%', textAlign: 'center', border: '1px solid #e8e8e8',
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>&#128274;</div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a1a', marginBottom: 6 }}>Poshmark Tracker</h1>
          <p style={{ fontSize: 13, color: '#888', marginBottom: 24 }}>Enter password to access</p>
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(false) }}
            onKeyDown={e => e.key === 'Enter' && login()}
            placeholder="Password"
            style={{
              width: '100%', padding: 12, borderRadius: 8, fontSize: 15,
              border: `1px solid ${error ? '#D85A30' : '#ddd'}`, marginBottom: 12,
              boxSizing: 'border-box', outline: 'none',
            }}
          />
          {error && <div style={{ color: '#D85A30', fontSize: 13, marginBottom: 12 }}>Wrong password</div>}
          <button onClick={login} style={{
            width: '100%', padding: 12, borderRadius: 8, background: '#1a1a1a',
            color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', cursor: 'pointer',
          }}>
            Unlock
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <head>
        <meta name="theme-color" content="#1a1a1a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Poshmark Tracker" />
        <link rel="manifest" href="/poshmark-manifest.json" />
      </head>
      <iframe
        src="/poshmark-app.html"
        style={{
          width: '100%',
          height: '100vh',
          border: 'none',
          display: 'block',
        }}
      />
    </>
  )
}
