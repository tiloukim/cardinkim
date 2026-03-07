'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'

interface Product {
  id: string
  title: string
  price: number
  compare_price: number | null
  category: string
  collection: string
  image_url: string
  image_urls: string[]
  stock: number
  is_active: boolean
  badge: string | null
  condition: string
  created_at: string
}

const CATEGORIES = ['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories']
const COLLECTIONS = ['new', 'best', 'trend']
const CONDITIONS = ['New with Tags', 'New', 'Like New', 'Gently Used', 'Used']
const BADGES = ['NEW', 'BEST', 'TREND', 'TIKTOK', 'VALUE']
const SIZES_PRESETS: Record<string, string[]> = {
  clothing: ['XS', 'S', 'M', 'L', 'XL'],
  jeans: ['24', '25', '26', '27', '28', '29', '30'],
  shoes: ['6', '6.5', '7', '7.5', '8', '8.5', '9'],
  onesize: ['One Size'],
}

const EMPTY_FORM = { title: '', price: '', compare_price: '', category: 'tops', collection: 'new', condition: 'New', badge: 'NEW', stock: '1', description: '', sizes: 'clothing' }

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [editStock, setEditStock] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editImages, setEditImages] = useState<string[]>([])
  const [editUploading, setEditUploading] = useState(false)
  const editFileRef = useRef<HTMLInputElement>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState({ ...EMPTY_FORM })
  const [addImages, setAddImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [addError, setAddError] = useState('')
  const [adding, setAdding] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products')
      if (res.ok) setProducts(await res.json())
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const updateProduct = async (id: string, updates: Record<string, unknown>) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (res.ok) {
        fetchProducts()
        setEditing(null)
      }
    } catch { /* ignore */ }
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Deactivate this product?')) return
    try {
      await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      })
      fetchProducts()
    } catch { /* ignore */ }
  }

  const handleEditFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    setEditUploading(true)
    for (const file of Array.from(files)) {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('prefix', 'products')
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        if (res.ok) {
          const { url } = await res.json()
          setEditImages(prev => [...prev, url])
        }
      } catch { /* ignore */ }
    }
    setEditUploading(false)
    e.target.value = ''
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    setUploading(true)
    for (const file of Array.from(files)) {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('prefix', 'products')
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        if (res.ok) {
          const { url } = await res.json()
          setAddImages(prev => [...prev, url])
        }
      } catch { /* ignore */ }
    }
    setUploading(false)
    e.target.value = ''
  }

  const handleAddProduct = async () => {
    if (!addForm.title || !addForm.price || addImages.length === 0) {
      setAddError('Title, price, and at least one image are required')
      return
    }
    setAddError('')
    setAdding(true)
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: addForm.title,
          price: parseFloat(addForm.price),
          compare_price: addForm.compare_price ? parseFloat(addForm.compare_price) : null,
          category: addForm.category,
          collection: addForm.collection,
          condition: addForm.condition,
          badge: addForm.badge || null,
          stock: parseInt(addForm.stock) || 1,
          image_url: addImages[0],
          image_urls: addImages,
          description: addForm.description,
          sizes: SIZES_PRESETS[addForm.sizes] || ['One Size'],
        }),
      })
      if (res.ok) {
        setShowAdd(false)
        setAddForm({ ...EMPTY_FORM })
        setAddImages([])
        fetchProducts()
      } else {
        const data = await res.json()
        setAddError(data.error || 'Failed to add product')
      }
    } catch {
      setAddError('Failed to add product')
    }
    setAdding(false)
  }

  if (loading) return <div className="admin-loading">Loading products...</div>

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '2px solid #eee', borderRadius: 10, fontSize: 13, fontFamily: 'var(--font-dm-sans), sans-serif', boxSizing: 'border-box' }
  const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#999', display: 'block', marginBottom: 4 }

  return (
    <div>
      <div className="admin-section-header" style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="admin-sub-text">{products.length} active products</div>
        <button className="admin-btn" style={{ background: '#c1d0b5', color: '#1a1a1a' }} onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {showAdd && (
        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 14, padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>New Product</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Title *</label>
              <input value={addForm.title} onChange={e => setAddForm({ ...addForm, title: e.target.value })} style={inputStyle} placeholder="Butterfly Mesh Top" />
            </div>
            <div>
              <label style={labelStyle}>Price *</label>
              <input type="number" step="0.01" value={addForm.price} onChange={e => setAddForm({ ...addForm, price: e.target.value })} style={inputStyle} placeholder="24.99" />
            </div>
            <div>
              <label style={labelStyle}>Compare Price</label>
              <input type="number" step="0.01" value={addForm.compare_price} onChange={e => setAddForm({ ...addForm, compare_price: e.target.value })} style={inputStyle} placeholder="39.99" />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select value={addForm.category} onChange={e => setAddForm({ ...addForm, category: e.target.value })} style={inputStyle}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Collection</label>
              <select value={addForm.collection} onChange={e => setAddForm({ ...addForm, collection: e.target.value })} style={inputStyle}>
                {COLLECTIONS.map(c => <option key={c} value={c}>{c === 'new' ? 'New Arrivals' : c === 'best' ? 'Bestsellers' : 'Trending'}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Condition</label>
              <select value={addForm.condition} onChange={e => setAddForm({ ...addForm, condition: e.target.value })} style={inputStyle}>
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Badge</label>
              <select value={addForm.badge} onChange={e => setAddForm({ ...addForm, badge: e.target.value })} style={inputStyle}>
                <option value="">None</option>
                {BADGES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Sizes</label>
              <select value={addForm.sizes} onChange={e => setAddForm({ ...addForm, sizes: e.target.value })} style={inputStyle}>
                <option value="clothing">Clothing (XS–XL)</option>
                <option value="jeans">Jeans (24–30)</option>
                <option value="shoes">Shoes (6–9)</option>
                <option value="onesize">One Size</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Stock</label>
              <input type="number" value={addForm.stock} onChange={e => setAddForm({ ...addForm, stock: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Images * {addImages.length > 0 && `(${addImages.length})`}</label>
              {addImages.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 10 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {addImages.map((url, i) => (
                    <div key={i} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', aspectRatio: '3/4' }}>
                      <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      {i === 0 && <div style={{ position: 'absolute', bottom: 4, left: 4, background: '#1a1a1a', color: '#fff', fontSize: 8, fontWeight: 800, padding: '2px 6px', borderRadius: 6, letterSpacing: '1px' }}>COVER</div>}
                      <button onClick={() => setAddImages(prev => prev.filter((_, j) => j !== i))} style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,.6)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>&times;</button>
                    </div>
                  ))}
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={handleFileSelect} />
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{ ...inputStyle, cursor: 'pointer', background: '#fafafa', textAlign: 'center', color: uploading ? '#999' : '#666', fontWeight: 600 }}>
                {uploading ? 'Uploading...' : '+ Upload Images'}
              </button>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Description</label>
              <textarea value={addForm.description} onChange={e => setAddForm({ ...addForm, description: e.target.value })} style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} placeholder="Dreamy butterfly mesh overlay..." />
            </div>
          </div>
          {addError && <div style={{ color: '#DC2626', fontSize: 13, fontWeight: 600, marginTop: 12 }}>{addError}</div>}
          <button className="admin-btn" style={{ background: '#c1d0b5', color: '#1a1a1a', marginTop: 16, padding: '12px 28px' }} onClick={handleAddProduct} disabled={adding}>
            {adding ? 'Adding...' : 'Add Product'}
          </button>
        </div>
      )}

      {products.length === 0 ? (
        <div className="admin-empty">No products found. Add products from the storefront.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Badge</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <React.Fragment key={p.id}>
                <tr>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image_url} alt={p.title} style={{ width: 44, height: 55, objectFit: 'cover', borderRadius: 8 }} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.title}</div>
                        <div className="admin-sub-text">{p.condition}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {editing === p.id ? (
                      <input
                        type="number"
                        value={editPrice}
                        onChange={e => setEditPrice(e.target.value)}
                        className="admin-inline-input"
                        style={{ width: 80 }}
                      />
                    ) : (
                      <div>
                        <strong>${p.price.toFixed(2)}</strong>
                        {p.compare_price && <div className="admin-sub-text" style={{ textDecoration: 'line-through' }}>${p.compare_price.toFixed(2)}</div>}
                      </div>
                    )}
                  </td>
                  <td>{p.category}</td>
                  <td>
                    {editing === p.id ? (
                      <input
                        type="number"
                        value={editStock}
                        onChange={e => setEditStock(e.target.value)}
                        className="admin-inline-input"
                        style={{ width: 60 }}
                      />
                    ) : (
                      <span style={{ color: p.stock < 5 ? '#EF4444' : p.stock < 15 ? '#F59E0B' : '#10B981', fontWeight: 700 }}>
                        {p.stock}
                      </span>
                    )}
                  </td>
                  <td>{p.badge && <span className="admin-badge">{p.badge}</span>}</td>
                  <td>
                    {editing === p.id ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="admin-btn admin-btn-sm"
                          onClick={() => updateProduct(p.id, { price: parseFloat(editPrice), stock: parseInt(editStock), image_urls: editImages, image_url: editImages[0] || p.image_url })}
                        >Save</button>
                        <button className="admin-btn admin-btn-sm admin-btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="admin-btn admin-btn-sm"
                          onClick={() => { setEditing(p.id); setEditPrice(p.price.toString()); setEditStock(p.stock.toString()); setEditImages(p.image_urls?.length > 0 ? [...p.image_urls] : [p.image_url]) }}
                        >Edit</button>
                        <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => deleteProduct(p.id)}>Remove</button>
                      </div>
                    )}
                  </td>
                </tr>
                {editing === p.id && (
                  <tr>
                    <td colSpan={6} style={{ padding: '12px 16px', background: '#fafafa' }}>
                      <label style={labelStyle}>Images ({editImages.length})</label>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {editImages.map((url, i) => (
                          <div key={i} style={{ position: 'relative', width: 64, height: 80, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                            <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            {i === 0 && <div style={{ position: 'absolute', bottom: 2, left: 2, background: '#1a1a1a', color: '#fff', fontSize: 7, fontWeight: 800, padding: '1px 4px', borderRadius: 4, letterSpacing: '0.5px' }}>COVER</div>}
                            <button onClick={() => setEditImages(prev => prev.filter((_, j) => j !== i))} style={{ position: 'absolute', top: 2, right: 2, width: 16, height: 16, borderRadius: '50%', background: 'rgba(0,0,0,.6)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, lineHeight: 1 }}>&times;</button>
                          </div>
                        ))}
                        <input ref={editFileRef} type="file" accept="image/*" multiple hidden onChange={handleEditFileSelect} />
                        <button onClick={() => editFileRef.current?.click()} disabled={editUploading} style={{ width: 64, height: 80, borderRadius: 8, border: '2px dashed #ccc', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#999', flexShrink: 0 }}>
                          {editUploading ? '...' : '+'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
