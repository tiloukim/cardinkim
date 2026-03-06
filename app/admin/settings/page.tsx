'use client'

import { useState, useEffect } from 'react'

const CATEGORIES = [
  { key: 'tops', label: 'Tops' },
  { key: 'bottoms', label: 'Bottoms' },
  { key: 'dresses', label: 'Dresses' },
  { key: 'outerwear', label: 'Outerwear' },
  { key: 'shoes', label: 'Shoes' },
  { key: 'accessories', label: 'Accessories' },
]

const DEFAULT_IMAGES: Record<string, string> = {
  tops: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500&h=340&fit=crop',
  bottoms: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&h=340&fit=crop',
  dresses: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&h=340&fit=crop',
  outerwear: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=340&fit=crop',
  shoes: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&h=340&fit=crop',
  accessories: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&h=340&fit=crop',
}

export default function SettingsPage() {
  const [images, setImages] = useState<Record<string, string>>(DEFAULT_IMAGES)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        const updated = { ...DEFAULT_IMAGES }
        for (const cat of CATEGORIES) {
          const k = `cat_img_${cat.key}`
          if (data[k]) updated[cat.key] = data[k]
        }
        setImages(updated)
      })
      .catch(() => {})
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    const body: Record<string, string> = {}
    for (const cat of CATEGORIES) {
      body[`cat_img_${cat.key}`] = images[cat.key]
    }
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        setMessage('Saved!')
      } else {
        const data = await res.json()
        setMessage(`Error: ${data.error}`)
      }
    } catch {
      setMessage('Failed to save')
    }
    setSaving(false)
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Category Images</h3>
        <p style={{ fontSize: 13, color: '#888' }}>Change the images shown in the &quot;Shop by Category&quot; section on the homepage.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
        {CATEGORIES.map(cat => (
          <div key={cat.key} style={{ border: '1px solid #e5e5e5', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
            <div style={{ aspectRatio: '3/2', overflow: 'hidden', background: '#f5f5f5' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[cat.key]}
                alt={cat.label}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            </div>
            <div style={{ padding: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>{cat.label}</label>
              <input
                type="text"
                value={images[cat.key]}
                onChange={e => setImages(prev => ({ ...prev, [cat.key]: e.target.value }))}
                placeholder="Image URL..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  fontSize: 13,
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '10px 32px',
            background: '#1a1a1a',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        {message && (
          <span style={{ fontSize: 13, color: message.startsWith('Error') ? '#ef4444' : '#10B981', fontWeight: 600 }}>
            {message}
          </span>
        )}
      </div>
    </div>
  )
}
