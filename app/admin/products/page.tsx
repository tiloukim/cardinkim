'use client'

import { useState, useEffect, useCallback } from 'react'

interface Product {
  id: string
  title: string
  price: number
  compare_price: number | null
  category: string
  collection: string
  image_url: string
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

const EMPTY_FORM = { title: '', price: '', compare_price: '', category: 'tops', collection: 'new', condition: 'New', badge: 'NEW', stock: '1', image_url: '', description: '', sizes: 'clothing' }

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [editStock, setEditStock] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState({ ...EMPTY_FORM })
  const [addError, setAddError] = useState('')
  const [adding, setAdding] = useState(false)

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

  const handleAddProduct = async () => {
    if (!addForm.title || !addForm.price || !addForm.image_url) {
      setAddError('Title, price, and image URL are required')
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
          image_url: addForm.image_url,
          description: addForm.description,
          sizes: SIZES_PRESETS[addForm.sizes] || ['One Size'],
        }),
      })
      if (res.ok) {
        setShowAdd(false)
        setAddForm({ ...EMPTY_FORM })
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
              <label style={labelStyle}>Image URL *</label>
              <input value={addForm.image_url} onChange={e => setAddForm({ ...addForm, image_url: e.target.value })} style={inputStyle} placeholder="https://images.unsplash.com/..." />
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
                <tr key={p.id}>
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
                          onClick={() => updateProduct(p.id, { price: parseFloat(editPrice), stock: parseInt(editStock) })}
                        >Save</button>
                        <button className="admin-btn admin-btn-sm admin-btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="admin-btn admin-btn-sm"
                          onClick={() => { setEditing(p.id); setEditPrice(p.price.toString()); setEditStock(p.stock.toString()) }}
                        >Edit</button>
                        <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => deleteProduct(p.id)}>Remove</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
