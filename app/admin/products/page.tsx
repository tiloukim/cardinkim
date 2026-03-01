'use client'

import { useState, useEffect, useCallback } from 'react'

const TOKEN = 'cardin2026'

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

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [editStock, setEditStock] = useState('')
  const [editPrice, setEditPrice] = useState('')

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
        headers: { 'Content-Type': 'application/json', 'x-admin-token': TOKEN },
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
        headers: { 'x-admin-token': TOKEN },
      })
      fetchProducts()
    } catch { /* ignore */ }
  }

  if (loading) return <div className="admin-loading">Loading products...</div>

  return (
    <div>
      <div className="admin-section-header" style={{ marginBottom: 20 }}>
        <div className="admin-sub-text">{products.length} active products</div>
      </div>

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
