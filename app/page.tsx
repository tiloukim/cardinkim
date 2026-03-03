'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { useAuth } from '@/lib/auth-context'

/* ═══════════════════════════════════════════════════
   CARDINKIM.COM — Teen Ecommerce
   • Admin-only listing (Supabase auth)
   • PayPal checkout + Supabase DB
   ═══════════════════════════════════════════════════ */

interface ProductColor {
  n: string
  h: string
}

interface Product {
  id: string
  title: string
  price: number
  compare: number | null
  cat: string
  col: string
  colors: ProductColor[]
  sizes: string[]
  img: string
  desc: string
  cond: string
  badge: string | null
  stock: number
}

interface CartItem {
  key: string
  id: string
  title: string
  price: number
  color: string
  size: string
  qty: number
  img: string
}

const INIT_PRODUCTS: Product[] = [
  { id: '1', title: 'Butterfly Mesh Top', price: 24.99, compare: 39.99, cat: 'tops', col: 'new', colors: [{ n: 'Lilac', h: '#C8A2C8' }, { n: 'Pink', h: '#F4C2C2' }, { n: 'Black', h: '#1a1a1a' }], sizes: ['XS', 'S', 'M', 'L'], img: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=600&h=750&fit=crop', desc: 'Dreamy butterfly mesh overlay. Layer over a cami for the perfect going-out look.', cond: 'New', badge: 'NEW', stock: 12 },
  { id: '2', title: 'Vintage Wide Leg Jeans', price: 48.99, compare: 72, cat: 'bottoms', col: 'best', colors: [{ n: 'Light Wash', h: '#A4C8E1' }, { n: 'Dark Indigo', h: '#2C3E6B' }], sizes: ['24', '25', '26', '27', '28', '29', '30'], img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=750&fit=crop', desc: 'High-waisted wide leg jeans with authentic vintage-inspired wash. Everyone\'s obsessed.', cond: 'Like New', badge: 'BEST', stock: 8 },
  { id: '3', title: 'Oversized Linen Blazer', price: 59.99, compare: 89.99, cat: 'outerwear', col: 'new', colors: [{ n: 'Oat', h: '#D4C5A9' }, { n: 'Charcoal', h: '#444' }], sizes: ['XS', 'S', 'M', 'L', 'XL'], img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=750&fit=crop', desc: 'Effortlessly cool oversized blazer. Throw it over anything for instant cool-girl energy.', cond: 'New', badge: 'NEW', stock: 15 },
  { id: '4', title: 'Platform Canvas Sneakers', price: 54.99, compare: null, cat: 'shoes', col: 'best', colors: [{ n: 'White', h: '#fff' }, { n: 'Black', h: '#1a1a1a' }, { n: 'Sage', h: '#9CAF88' }], sizes: ['6', '6.5', '7', '7.5', '8', '8.5', '9'], img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=750&fit=crop', desc: 'Chunky platform sneakers. The 3-inch lift you didn\'t know you needed.', cond: 'New with Tags', badge: null, stock: 22 },
  { id: '5', title: 'Coquette Bow Mini Skirt', price: 32.99, compare: 45, cat: 'bottoms', col: 'trend', colors: [{ n: 'Ballet Pink', h: '#E8B4B8' }, { n: 'Cream', h: '#FFFDD0' }, { n: 'Black', h: '#1a1a1a' }], sizes: ['XS', 'S', 'M', 'L'], img: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=750&fit=crop', desc: 'Cutest bow-detail mini with a flirty A-line shape. Coquette era essentials.', cond: 'New', badge: 'TREND', stock: 6 },
  { id: '6', title: 'Chunky Gold Hoops', price: 18.99, compare: null, cat: 'accessories', col: 'best', colors: [{ n: 'Gold', h: '#D4AF37' }, { n: 'Silver', h: '#C0C0C0' }], sizes: ['One Size'], img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=750&fit=crop', desc: 'Everyday chunky hoops. Hypoallergenic, lightweight, essential.', cond: 'New', badge: null, stock: 45 },
  { id: '7', title: 'Retro Track Jacket', price: 44.99, compare: 65, cat: 'outerwear', col: 'new', colors: [{ n: 'Red', h: '#CC3333' }, { n: 'Navy', h: '#1B2A4A' }], sizes: ['XS', 'S', 'M', 'L', 'XL'], img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=750&fit=crop', desc: 'Vintage-inspired track jacket with contrast stripes. Y2K throwback.', cond: 'New', badge: 'NEW', stock: 18 },
  { id: '8', title: 'Floral Wrap Midi Dress', price: 42.99, compare: 64, cat: 'dresses', col: 'trend', colors: [{ n: 'Garden', h: '#E8C4D8' }, { n: 'Blue', h: '#7BA7BC' }], sizes: ['XS', 'S', 'M', 'L'], img: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=750&fit=crop', desc: 'Flowy wrap midi with the prettiest floral print. Perfect for brunch or date night.', cond: 'New', badge: 'TREND', stock: 10 },
  { id: '9', title: 'Ribbed Crop Tank 3-Pack', price: 28.99, compare: 45, cat: 'tops', col: 'best', colors: [{ n: 'Basics', h: '#555' }, { n: 'Pastels', h: '#DEB5D3' }], sizes: ['XS', 'S', 'M', 'L'], img: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&h=750&fit=crop', desc: 'Your everyday staple. Three ribbed crop tanks in one pack.', cond: 'New', badge: 'VALUE', stock: 30 },
  { id: '10', title: 'Baggy Cargo Pants', price: 46.99, compare: 68, cat: 'bottoms', col: 'new', colors: [{ n: 'Khaki', h: '#C3B091' }, { n: 'Black', h: '#1a1a1a' }, { n: 'Olive', h: '#708238' }], sizes: ['XS', 'S', 'M', 'L', 'XL'], img: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=750&fit=crop', desc: 'Low-rise baggy cargo with oversized pockets. Streetwear staple.', cond: 'New', badge: 'NEW', stock: 20 },
  { id: '11', title: 'Beaded Phone Charm', price: 12.99, compare: null, cat: 'accessories', col: 'trend', colors: [{ n: 'Rainbow', h: '#E8B4B8' }], sizes: ['One Size'], img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=750&fit=crop', desc: 'Adorable beaded phone charm. As seen in my TikTok hauls!', cond: 'New', badge: 'TIKTOK', stock: 50 },
  { id: '12', title: 'Satin Hair Bow Set', price: 14.99, compare: null, cat: 'accessories', col: 'trend', colors: [{ n: 'Assorted', h: '#E8C4D8' }], sizes: ['One Size'], img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=750&fit=crop', desc: 'Set of 4 oversized satin hair bows in dreamy colors.', cond: 'New', badge: null, stock: 35 },
]

/* Map DB product row to local shape */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProduct(p: any): Product {
  return {
    id: p.id,
    title: p.title,
    price: Number(p.price),
    compare: p.compare_price ? Number(p.compare_price) : null,
    cat: p.category,
    col: p.collection,
    colors: p.colors || [{ n: 'Default', h: '#ccc' }],
    sizes: p.sizes || ['One Size'],
    img: p.image_url,
    desc: p.description || '',
    cond: p.condition || 'New',
    badge: p.badge,
    stock: p.stock,
  }
}

const CATS = [{ k: 'all', l: 'All' }, { k: 'tops', l: 'Tops' }, { k: 'bottoms', l: 'Bottoms' }, { k: 'dresses', l: 'Dresses' }, { k: 'outerwear', l: 'Outerwear' }, { k: 'shoes', l: 'Shoes' }, { k: 'accessories', l: 'Accessories' }]
const COLS_NAV = [{ k: 'all', l: 'All Items' }, { k: 'new', l: 'New Arrivals' }, { k: 'best', l: 'Bestsellers' }, { k: 'trend', l: 'Trending' }]
const CONDITIONS = ['New with Tags', 'New', 'Like New', 'Gently Used', 'Used']

const badgeColor = (b: string) => b === 'NEW' ? '#1a1a1a' : b === 'BEST' ? '#E8453C' : b === 'TREND' ? '#7C3AED' : b === 'TIKTOK' ? '#00C9A7' : b === 'VALUE' ? '#059669' : '#1a1a1a'
const badgeText = (b: string) => b === 'BEST' ? 'BESTSELLER' : b === 'TREND' ? 'TRENDING' : b === 'TIKTOK' ? 'AS SEEN ON TIKTOK' : b === 'VALUE' ? 'VALUE PACK' : b

/* --- ICONS --- */
const IC = {
  Cart: ({ n }: { n: number }) => <div style={{ position: 'relative', cursor: 'pointer' }}><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>{n > 0 && <span style={{ position: 'absolute', top: -8, right: -10, background: '#E8453C', color: '#fff', fontSize: 9, fontWeight: 800, width: 17, height: 17, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n}</span>}</div>,
  Heart: ({ f }: { f: boolean }) => <svg width="17" height="17" viewBox="0 0 24 24" fill={f ? '#E8453C' : 'none'} stroke={f ? '#E8453C' : 'currentColor'} strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>,
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
  X: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  Minus: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  Plus: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  Back: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>,
  Camera: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></svg>,
  Upload: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
  Trash: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>,
  Star: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="#FFB800"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>,
  Truck: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>,
  Shield: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  Refresh: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" /></svg>,
  Menu: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>,
  TikTok: () => <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.87a8.28 8.28 0 004.84 1.56V6.98a4.84 4.84 0 01-1.08-.29z" /></svg>,
  YouTube: () => <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>,
  User: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  Lock: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>,
  PayPal: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7.076 21.337H2.47a.641.641 0 01-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 00-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 00-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 00.554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.81-5.164a.932.932 0 01.92-.789h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.768-4.396z" /></svg>,
  Gear: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" /></svg>,
}

const fb = (t: string) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="530"><rect fill="#f0ede8" width="400" height="530"/><text x="200" y="265" text-anchor="middle" fill="#c4c0b8" font-family="sans-serif" font-size="15">${t.substring(0, 18)}</text></svg>`)}`

/* ═══ MAIN APP ═══ */
export default function Home() {
  const { user, customer } = useAuth()
  const [products, setProducts] = useState<Product[]>(INIT_PRODUCTS)
  const [view, setView] = useState('home')
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return []
    try { const s = localStorage.getItem('ck_cart'); return s ? JSON.parse(s) : [] } catch { return [] }
  })
  const [wish, setWish] = useState<Set<string>>(new Set())
  const [selProd, setSelProd] = useState<Product | null>(null)
  const [selColor, setSelColor] = useState(0)
  const [selSize, setSelSize] = useState<string | null>(null)
  const [cat, setCat] = useState('all')
  const [col, setCol] = useState('all')
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [sort, setSort] = useState('default')
  const [cartOpen, setCartOpen] = useState(false)
  const [mobMenu, setMobMenu] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [promo, setPromo] = useState('')
  const [promoOn, setPromoOn] = useState(false)
  const [annBar, setAnnBar] = useState(true)
  const [followers, setFollowers] = useState('101K')
  const [ytSubs, setYtSubs] = useState('1K')
  const heroVidRef = useRef<HTMLVideoElement>(null)
  const heroVideos = ['/tiktok-video2.mp4', '/tiktok-video.mp4']
  const heroVidIdx = useRef(0)

  // Admin — derived from auth
  const isAdmin = !!customer?.is_admin

  // Sell (admin only)
  const [sellOpen, setSellOpen] = useState(false)
  const [sellStep, setSellStep] = useState(1)
  const [sellImgs, setSellImgs] = useState<string[]>([])
  const [sellForm, setSellForm] = useState({ title: '', price: '', compare: '', cat: 'tops', cond: 'New', sizes: [] as string[], desc: '' })
  const fileRef = useRef<HTMLInputElement>(null)
  const camRef = useRef<HTMLInputElement>(null)

  // Checkout
  const [checkForm, setCheckForm] = useState({ name: '', email: '', address: '', city: '', state: '', zip: '' })
  const [paypalProcessing, setPaypalProcessing] = useState(false)
  const [lastOrderId, setLastOrderId] = useState<string | null>(null)

  // Persist cart to localStorage
  useEffect(() => {
    try { localStorage.setItem('ck_cart', JSON.stringify(cart)) } catch { /* ignore */ }
  }, [cart])

  // Fetch products from DB on mount
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        const data = await res.json()
        if (data.length > 0) setProducts(data.map(mapProduct))
      }
    } catch { /* fallback to INIT_PRODUCTS */ }
  }, [])
  useEffect(() => { fetchProducts() }, [fetchProducts])

  // Fetch TikTok follower count
  useEffect(() => {
    fetch('/api/tiktok').then(r => r.json()).then(d => { if (d.followers) setFollowers(d.followers) }).catch(() => {})
  }, [])

  // Fetch YouTube subscriber count
  useEffect(() => {
    fetch('/api/youtube').then(r => r.json()).then(d => { if (d.subscribers) setYtSubs(d.subscribers) }).catch(() => {})
  }, [])

  // Hero video playlist handler
  const onHeroVideoEnded = useCallback(() => {
    heroVidIdx.current = (heroVidIdx.current + 1) % heroVideos.length
    const vid = heroVidRef.current
    if (vid) { vid.src = heroVideos[heroVidIdx.current]; vid.play() }
  }, [heroVideos])



  // Pre-fill checkout from customer profile
  useEffect(() => {
    if (customer) {
      setCheckForm(f => ({
        name: f.name || customer.name || '',
        email: f.email || customer.email || '',
        address: f.address || customer.address || '',
        city: f.city || customer.city || '',
        state: f.state || customer.state || '',
        zip: f.zip || customer.zip || '',
      }))
    }
  }, [customer])

  const notify = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2800) }
  const F = { head: "var(--font-fraunces), 'Fraunces', serif", body: "var(--font-dm-sans), 'DM Sans', sans-serif" }
  const C = { accent: '#F9A8C9', nav: '#c1d0b5', dark: '#1a1a1a', bg: '#FAF9F6' }

  // Cart calculations
  const cartN = cart.reduce((s, i) => s + i.qty, 0)
  const sub = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const disc = promoOn ? sub * 0.1 : 0
  const ship = sub > 50 ? 0 : 5.99
  const tot = sub - disc + ship

  const addCart = (p: Product, color: string, size: string | null) => {
    if (!size) { notify('Pick a size first!'); return }
    const k = `${p.id}-${color}-${size}`
    setCart(pr => {
      const ex = pr.find(i => i.key === k)
      if (ex) return pr.map(i => i.key === k ? { ...i, qty: i.qty + 1 } : i)
      return [...pr, { key: k, id: p.id, title: p.title, price: p.price, color, size, qty: 1, img: p.img }]
    })
    notify('Added to bag!')
    setCartOpen(true)
  }
  const updQ = (k: string, d: number) => setCart(p => p.map(i => i.key === k ? { ...i, qty: Math.max(0, i.qty + d) } : i).filter(i => i.qty > 0))
  const rmC = (k: string) => setCart(p => p.filter(i => i.key !== k))
  const openP = (p: Product) => { setSelProd(p); setSelColor(0); setSelSize(null); setView('product'); window.scrollTo(0, 0) }
  const goShop = (c?: string, co?: string) => { setView('shop'); if (c) setCat(c); if (co) setCol(co); setSort('default'); window.scrollTo(0, 0) }
  const filt = products.filter(p => (cat === 'all' || p.cat === cat) && (col === 'all' || p.col === col) && (!search || p.title.toLowerCase().includes(search.toLowerCase())))
  const sorted = sort === 'price-asc' ? [...filt].sort((a, b) => a.price - b.price) : sort === 'price-desc' ? [...filt].sort((a, b) => b.price - a.price) : sort === 'newest' ? [...filt].sort((a, b) => Number(b.id) - Number(a.id)) : filt


  // Sell images
  const handleSellImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files || []).forEach(f => {
      const r = new FileReader()
      r.onload = ev => setSellImgs(p => [...p, ev.target?.result as string])
      r.readAsDataURL(f)
    })
    e.target.value = ''
  }
  const toggleSz = (s: string) => setSellForm(p => ({ ...p, sizes: p.sizes.includes(s) ? p.sizes.filter(x => x !== s) : [...p.sizes, s] }))
  const resetSell = () => { setSellOpen(false); setSellStep(1); setSellImgs([]); setSellForm({ title: '', price: '', compare: '', cat: 'tops', cond: 'New', sizes: [], desc: '' }) }

  const submitListing = async () => {
    if (!sellForm.title || !sellForm.price || sellImgs.length === 0) { notify('Need photo, title & price!'); return }
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: sellForm.title,
          price: parseFloat(sellForm.price),
          compare_price: sellForm.compare ? parseFloat(sellForm.compare) : null,
          category: sellForm.cat,
          collection: 'new',
          colors: [{ n: 'As Shown', h: '#ccc' }],
          sizes: sellForm.sizes.length > 0 ? sellForm.sizes : ['One Size'],
          image_url: sellImgs[0],
          description: sellForm.desc || '',
          condition: sellForm.cond,
          badge: 'NEW',
          stock: 1,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setProducts(p => [mapProduct(data), ...p])
        resetSell()
        notify('Item is LIVE!')
      } else {
        // Fallback to local state if API fails
        setProducts(p => [{
          id: crypto.randomUUID(), title: sellForm.title, price: parseFloat(sellForm.price),
          compare: sellForm.compare ? parseFloat(sellForm.compare) : null,
          cat: sellForm.cat, col: 'new', colors: [{ n: 'As Shown', h: '#ccc' }],
          sizes: sellForm.sizes.length > 0 ? sellForm.sizes : ['One Size'],
          img: sellImgs[0], desc: sellForm.desc || '', cond: sellForm.cond, badge: 'NEW', stock: 1,
        }, ...p])
        resetSell()
        notify('Item is LIVE! (local only)')
      }
    } catch {
      setProducts(p => [{
        id: crypto.randomUUID(), title: sellForm.title, price: parseFloat(sellForm.price),
        compare: sellForm.compare ? parseFloat(sellForm.compare) : null,
        cat: sellForm.cat, col: 'new', colors: [{ n: 'As Shown', h: '#ccc' }],
        sizes: sellForm.sizes.length > 0 ? sellForm.sizes : ['One Size'],
        img: sellImgs[0], desc: sellForm.desc || '', cond: sellForm.cond, badge: 'NEW', stock: 1,
      }, ...p])
      resetSell()
      notify('Item is LIVE! (local only)')
    }
  }

  // PayPal checkout — real flow via server API
  const createPayPalOrderHandler = async (): Promise<string> => {
    if (!checkForm.name || !checkForm.email || !checkForm.address || !checkForm.city || !checkForm.state || !checkForm.zip) { notify('Fill in all shipping fields'); throw new Error('Missing info') }
    const res = await fetch('/api/paypal/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: tot.toFixed(2) }),
    })
    const data = await res.json()
    if (!data.id) throw new Error('Failed to create order')
    return data.id
  }

  const onPayPalApprove = async (data: { orderID: string }) => {
    setPaypalProcessing(true)
    try {
      const res = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paypalOrderId: data.orderID,
          cart,
          shipping: checkForm,
          promo: promoOn ? 'CARDIN10' : null,
          totals: { subtotal: sub, discount: disc, shipping: ship, total: tot },
        }),
      })
      const result = await res.json()
      if (result.success) {
        setLastOrderId(result.orderId || null)
        setPaypalProcessing(false); setView('success'); setCart([]); setCartOpen(false)
        fetchProducts() // Refresh stock
      } else {
        setPaypalProcessing(false); notify('Payment issue — please try again')
      }
    } catch {
      setPaypalProcessing(false); notify('Payment error — please try again')
    }
  }

  const btn = (bg: string, col: string, ex: React.CSSProperties = {}): React.CSSProperties => ({ padding: '14px 30px', background: bg, color: col, border: 'none', borderRadius: 50, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: F.body, ...ex })

  /* --- PRODUCT CARD --- */
  const Card = ({ p, i }: { p: Product; i: number }) => (
    <div className="pc" style={{ cursor: 'pointer', borderRadius: 16, overflow: 'hidden', background: '#fff', position: 'relative', animation: `fu .5s ease ${i * .05}s both` }} onClick={() => openP(p)}>
      {p.badge && <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 2, background: badgeColor(p.badge), color: p.badge === 'TIKTOK' ? '#1a1a1a' : '#fff', fontSize: 9, fontWeight: 800, letterSpacing: '1.5px', padding: '4px 11px', borderRadius: 20 }}>{badgeText(p.badge)}</div>}
      <button className="wb" style={{ position: 'absolute', top: 10, right: 10, zIndex: 2, background: 'rgba(255,255,255,.85)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }} onClick={e => { e.stopPropagation(); setWish(pr => { const n = new Set(pr); n.has(p.id) ? n.delete(p.id) : n.add(p.id); return n }) }}><IC.Heart f={wish.has(p.id)} /></button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <div style={{ overflow: 'hidden' }}><img src={p.img} alt={p.title} className="pi" style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block', background: '#f0ede8' }} onError={e => { (e.target as HTMLImageElement).src = fb(p.title) }} /></div>
      <div style={{ padding: '12px 13px 16px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 4, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
        {p.cond !== 'New' && p.cond !== 'New with Tags' && <div style={{ fontSize: 10, fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 3 }}>{p.cond}</div>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: C.accent }}>${p.price.toFixed(2)}</span>
          {p.compare && <span style={{ fontSize: 12, color: '#bbb', textDecoration: 'line-through' }}>${p.compare.toFixed(2)}</span>}
        </div>
      </div>
    </div>
  )

  return (
    <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test', currency: 'USD' }}>
    <div style={{ fontFamily: F.body, background: C.bg, minHeight: '100vh' }}>
      {/* TOAST */}
      {toast && <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: C.dark, color: '#fff', padding: '11px 26px', borderRadius: 50, fontSize: 13, fontWeight: 600, boxShadow: '0 8px 28px rgba(0,0,0,.2)', animation: 'sd .3s ease' }}>{toast}</div>}

      {/* ANNOUNCEMENT */}
      {annBar && <div style={{ background: '#c1d0b5', color: '#fff', textAlign: 'center', padding: '9px 40px', fontSize: 11, fontWeight: 600, letterSpacing: '.5px', position: 'relative' }}>FREE SHIPPING $50+ &middot; CODE <span style={{ color: '#fff', fontWeight: 800 }}>CARDIN10</span> = 10% OFF<button onClick={() => setAnnBar(false)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,.6)', cursor: 'pointer', fontSize: 16 }}>&times;</button></div>}

      {/* HEADER */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: '#fff', borderBottom: '1px solid #e5e5e5' }}>
        {/* Top row: hamburger (mobile) — logo centered — icons right */}
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '10px 24px' }}>
          {/* Left: hamburger (mobile) + search (desktop) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button className="ms" style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: C.nav }} onClick={() => setMobMenu(true)}><IC.Menu /></button>
            <button className="do" onClick={() => setSearchOpen(!searchOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.accent, display: 'flex' }}><IC.Search /></button>
          </div>
          {/* Center: logo */}
          <div onClick={() => { setView('home'); setSearchOpen(false) }} style={{ cursor: 'pointer', textAlign: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Cardin Kim Closet" style={{ height: 64 }} />
          </div>
          {/* Right: icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'flex-end' }}>
            <a href="https://www.tiktok.com/@cardinkiim" target="_blank" rel="noreferrer" className="si do" style={{ color: C.accent, display: 'flex' }}><IC.TikTok /></a>
            <a href="https://www.youtube.com/channel/UCeqF5g_mOasvyYdiKHxe1HQ" target="_blank" rel="noreferrer" className="si do" style={{ color: C.accent, display: 'flex' }}><IC.YouTube /></a>
            <a href={user ? '/account' : '/login'} className="nl" style={{ display: 'flex', alignItems: 'center', gap: 5, color: C.accent, textDecoration: 'none', fontSize: 24, fontWeight: 600 }}><IC.User /><span className="do">{user ? 'Account' : 'Sign In'}</span></a>
            <div onClick={() => setCartOpen(true)} style={{ cursor: 'pointer', color: C.accent }}><IC.Cart n={cartN} /></div>
          </div>
        </div>
        {/* Nav row: centered links */}
        <nav className="do" style={{ display: 'flex', justifyContent: 'center', gap: 32, padding: '0 24px 12px', borderTop: 'none' }}>
          {[{ l: 'Shop All', a: () => goShop('all', 'all') }, { l: 'New In', a: () => goShop('all', 'new') }, { l: 'Trending', a: () => goShop('all', 'trend') }, { l: 'Bestsellers', a: () => goShop('all', 'best') }].map(({ l, a }) => (
            <span key={l} className="nl" onClick={a} style={{ fontSize: 17, fontWeight: 600, color: C.nav, cursor: 'pointer', letterSpacing: '.3px' }}>{l}</span>
          ))}
        </nav>
        {searchOpen && <div style={{ padding: '0 24px 12px', maxWidth: 1280, margin: '0 auto' }}><input autoFocus placeholder="Search items..." value={search} onChange={e => { setSearch(e.target.value); setView('shop'); setCat('all'); setCol('all') }} style={{ width: '100%', padding: '12px 20px', border: '2px solid #eee', borderRadius: 50, fontSize: 14, fontFamily: F.body }} /></div>}
      </header>

      {/* MOBILE MENU */}
      {mobMenu && <div style={{ position: 'fixed', inset: 0, background: 'rgba(250,249,246,.98)', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
        <button onClick={() => setMobMenu(false)} style={{ position: 'absolute', top: 18, right: 18, background: '#f0f0f0', border: 'none', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.accent }}><IC.X /></button>
        {['Shop All', 'New In', 'Trending', 'Bestsellers'].map(l => <span key={l} onClick={() => { goShop('all', l === 'Shop All' ? 'all' : l === 'New In' ? 'new' : l === 'Trending' ? 'trend' : 'best'); setMobMenu(false) }} style={{ fontSize: 22, fontWeight: 700, color: C.accent, cursor: 'pointer' }}>{l}</span>)}
        <a href={user ? '/account' : '/login'} onClick={() => setMobMenu(false)} style={{ fontSize: 22, fontWeight: 700, color: C.accent, cursor: 'pointer', textDecoration: 'none' }}>{user ? 'Account' : 'Sign In'}</a>
        <div style={{ display: 'flex', gap: 18, marginTop: 12 }}>
          <a href="https://www.tiktok.com/@cardinkiim" target="_blank" rel="noreferrer" style={{ color: C.accent }}><IC.TikTok /></a>
          <a href="https://www.youtube.com/channel/UCeqF5g_mOasvyYdiKHxe1HQ" target="_blank" rel="noreferrer" style={{ color: C.accent }}><IC.YouTube /></a>
        </div>
      </div>}


      {/* ADMIN SELL MODAL (3-step) */}
      {sellOpen && isAdmin && <div style={{ position: 'fixed', inset: 0, zIndex: 500 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(4px)' }} onClick={resetSell} />
        <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 'min(520px,100%)', maxHeight: '94vh', background: '#fff', borderRadius: '24px 24px 0 0', overflow: 'auto', animation: 'su .3s ease', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #eee', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {sellStep > 1 && <button onClick={() => setSellStep(s => s - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}><IC.Back /></button>}
              <span style={{ fontFamily: F.head, fontSize: 20, fontWeight: 800 }}>
                {sellStep === 1 ? 'Add Photos' : sellStep === 2 ? 'Item Details' : 'Preview'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: C.accent, background: '#FFF0EF', padding: '4px 10px', borderRadius: 20 }}>ADMIN</span>
              <button onClick={resetSell} style={{ background: '#f5f5f5', border: 'none', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IC.X /></button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4, padding: '12px 22px 0' }}>{[1, 2, 3].map(s => <div key={s} style={{ flex: 1, height: 4, borderRadius: 4, background: s <= sellStep ? C.accent : '#eee', transition: 'background .3s' }} />)}</div>
          <div style={{ fontSize: 11, color: '#999', padding: '6px 22px 0', fontWeight: 600 }}>Step {sellStep} of 3</div>

          <div style={{ flex: 1, overflow: 'auto', padding: '16px 22px 28px' }}>
            {/* STEP 1 */}
            {sellStep === 1 && <>
              <p style={{ fontSize: 14, color: '#666', marginBottom: 18, lineHeight: 1.6 }}>Take pics with your phone or upload from gallery. <strong>Good photos = faster sales!</strong></p>
              {sellImgs.length > 0 && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 18 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {sellImgs.map((img, i) => <div key={i} style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', aspectRatio: '3/4' }}>
                  <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                  {i === 0 && <div style={{ position: 'absolute', bottom: 6, left: 6, background: C.dark, color: '#fff', fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 10, letterSpacing: '1px' }}>COVER</div>}
                  <button onClick={() => setSellImgs(p => p.filter((_, j) => j !== i))} style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,.6)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>&times;</button>
                </div>)}
              </div>}
              <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                <button onClick={() => camRef.current?.click()} style={{ flex: 1, padding: '20px 10px', border: `2px dashed ${C.accent}`, borderRadius: 16, background: '#FFF5F4', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, fontFamily: F.body, color: C.accent, fontWeight: 700, fontSize: 14 }}><IC.Camera /> Take Photo</button>
                <button onClick={() => fileRef.current?.click()} style={{ flex: 1, padding: '20px 10px', border: '2px dashed #ddd', borderRadius: 16, background: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, fontFamily: F.body, color: '#666', fontWeight: 700, fontSize: 14 }}><IC.Upload /> Upload</button>
              </div>
              <input ref={camRef} type="file" accept="image/*" capture="environment" hidden onChange={handleSellImg} />
              <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={handleSellImg} />
              <div style={{ background: '#F5F4F1', borderRadius: 14, padding: '14px 16px', fontSize: 12, color: '#888', lineHeight: 1.6 }}><strong style={{ color: '#555' }}>Photo tips:</strong><br />- Natural lighting near a window<br />- Show front, back & tags<br />- Flat lay or hang — no wrinkles!</div>
              <button disabled={sellImgs.length === 0} onClick={() => setSellStep(2)} className="bp" style={btn(sellImgs.length > 0 ? C.accent : '#ddd', C.dark, { width: '100%', marginTop: 18, opacity: sellImgs.length > 0 ? 1 : .5, fontSize: 15 })}>Next — Add Details &rarr;</button>
            </>}

            {/* STEP 2 */}
            {sellStep === 2 && <>
              <div style={{ marginBottom: 16 }}><label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#999', display: 'block', marginBottom: 6 }}>Title *</label><input value={sellForm.title} onChange={e => setSellForm({ ...sellForm, title: e.target.value })} placeholder='e.g. "Y2K Butterfly Top"' style={{ width: '100%', padding: '13px 16px', border: '2px solid #eee', borderRadius: 12, fontSize: 15, fontFamily: F.body, boxSizing: 'border-box' }} /></div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <div style={{ flex: 1 }}><label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#999', display: 'block', marginBottom: 6 }}>Price *</label><div style={{ position: 'relative' }}><span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, fontWeight: 700, color: '#999' }}>$</span><input type="number" value={sellForm.price} onChange={e => setSellForm({ ...sellForm, price: e.target.value })} placeholder="25.00" style={{ width: '100%', padding: '13px 16px 13px 30px', border: '2px solid #eee', borderRadius: 12, fontSize: 15, fontFamily: F.body, boxSizing: 'border-box' }} /></div></div>
                <div style={{ flex: 1 }}><label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#999', display: 'block', marginBottom: 6 }}>Was Price</label><div style={{ position: 'relative' }}><span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, fontWeight: 700, color: '#999' }}>$</span><input type="number" value={sellForm.compare} onChange={e => setSellForm({ ...sellForm, compare: e.target.value })} placeholder="40.00" style={{ width: '100%', padding: '13px 16px 13px 30px', border: '2px solid #eee', borderRadius: 12, fontSize: 15, fontFamily: F.body, boxSizing: 'border-box' }} /></div></div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <div style={{ flex: 1 }}><label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#999', display: 'block', marginBottom: 6 }}>Category *</label><select value={sellForm.cat} onChange={e => setSellForm({ ...sellForm, cat: e.target.value })} style={{ width: '100%', padding: '13px 16px', border: '2px solid #eee', borderRadius: 12, fontSize: 14, fontFamily: F.body, background: '#fff', cursor: 'pointer', boxSizing: 'border-box', appearance: 'auto' }}>{CATS.filter(c => c.k !== 'all').map(c => <option key={c.k} value={c.k}>{c.l}</option>)}</select></div>
                <div style={{ flex: 1 }}><label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#999', display: 'block', marginBottom: 6 }}>Condition *</label><select value={sellForm.cond} onChange={e => setSellForm({ ...sellForm, cond: e.target.value })} style={{ width: '100%', padding: '13px 16px', border: '2px solid #eee', borderRadius: 12, fontSize: 14, fontFamily: F.body, background: '#fff', cursor: 'pointer', boxSizing: 'border-box', appearance: 'auto' }}>{CONDITIONS.map(c => <option key={c}>{c}</option>)}</select></div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#999', display: 'block', marginBottom: 8 }}>Sizes * <span style={{ color: '#ccc' }}>(tap all available)</span></label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {['XXS', 'XS', 'S', 'M', 'L', 'XL', 'One Size'].map(s => <button key={s} onClick={() => toggleSz(s)} style={{ padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', background: sellForm.sizes.includes(s) ? C.dark : '#fff', color: sellForm.sizes.includes(s) ? '#fff' : '#555', border: sellForm.sizes.includes(s) ? 'none' : '1.5px solid #ddd', fontFamily: F.body, transition: 'all .15s' }}>{s}</button>)}
                </div>
                {sellForm.cat === 'shoes' && <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>{['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10'].map(s => <button key={s} onClick={() => toggleSz(s)} style={{ padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', background: sellForm.sizes.includes(s) ? C.dark : '#fff', color: sellForm.sizes.includes(s) ? '#fff' : '#555', border: sellForm.sizes.includes(s) ? 'none' : '1.5px solid #ddd', fontFamily: F.body }}>{s}</button>)}</div>}
                {sellForm.cat === 'bottoms' && <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>{['24', '25', '26', '27', '28', '29', '30', '31', '32'].map(s => <button key={s} onClick={() => toggleSz(s)} style={{ padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', background: sellForm.sizes.includes(s) ? C.dark : '#fff', color: sellForm.sizes.includes(s) ? '#fff' : '#555', border: sellForm.sizes.includes(s) ? 'none' : '1.5px solid #ddd', fontFamily: F.body }}>{s}</button>)}</div>}
              </div>
              <div style={{ marginBottom: 16 }}><label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#999', display: 'block', marginBottom: 6 }}>Description</label><textarea value={sellForm.desc} onChange={e => setSellForm({ ...sellForm, desc: e.target.value })} placeholder="Tell buyers about this item..." style={{ width: '100%', padding: '13px 16px', border: '2px solid #eee', borderRadius: 12, fontSize: 14, fontFamily: F.body, minHeight: 80, resize: 'vertical', boxSizing: 'border-box' }} /></div>
              <button disabled={!sellForm.title || !sellForm.price || sellForm.sizes.length === 0} onClick={() => setSellStep(3)} className="bp" style={btn(sellForm.title && sellForm.price && sellForm.sizes.length > 0 ? C.accent : '#ddd', C.dark, { width: '100%', opacity: sellForm.title && sellForm.price && sellForm.sizes.length > 0 ? 1 : .5, fontSize: 15 })}>Preview Listing &rarr;</button>
            </>}

            {/* STEP 3 */}
            {sellStep === 3 && <>
              <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>Here&apos;s how buyers will see your listing:</p>
              <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #eee', overflow: 'hidden', marginBottom: 20 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sellImgs[0]} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block' }} alt="" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {sellImgs.length > 1 && <div style={{ display: 'flex', gap: 6, padding: '10px 14px', overflowX: 'auto' }}>{sellImgs.slice(1).map((img, i) => <img key={i} src={img} style={{ width: 56, height: 70, objectFit: 'cover', borderRadius: 8, border: '1.5px solid #eee' }} alt="" />)}</div>}
                <div style={{ padding: '16px 18px 20px' }}>
                  <div style={{ display: 'inline-block', fontSize: 9, fontWeight: 800, letterSpacing: '1.5px', padding: '4px 11px', borderRadius: 20, background: C.dark, color: '#fff', marginBottom: 10 }}>NEW</div>
                  <div style={{ fontFamily: F.head, fontSize: 22, fontWeight: 800, marginBottom: 6 }}>{sellForm.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}><span style={{ fontSize: 22, fontWeight: 800, color: C.accent }}>${parseFloat(sellForm.price || '0').toFixed(2)}</span>{sellForm.compare && <span style={{ fontSize: 14, color: '#bbb', textDecoration: 'line-through' }}>${parseFloat(sellForm.compare).toFixed(2)}</span>}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                    <span style={{ padding: '5px 12px', borderRadius: 20, background: '#f5f5f5', fontSize: 11, fontWeight: 700, color: '#555' }}>{sellForm.cond}</span>
                    <span style={{ padding: '5px 12px', borderRadius: 20, background: '#f5f5f5', fontSize: 11, fontWeight: 700, color: '#555' }}>{CATS.find(c => c.k === sellForm.cat)?.l}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>{sellForm.sizes.map(s => <span key={s} style={{ padding: '5px 12px', borderRadius: 8, border: '1.5px solid #ddd', fontSize: 12, fontWeight: 700 }}>{s}</span>)}</div>
                  {sellForm.desc && <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>{sellForm.desc}</p>}
                </div>
              </div>
              <button onClick={submitListing} className="bp" style={btn(C.accent, C.dark, { width: '100%', fontSize: 16, padding: '18px 32px' })}>Publish — Go Live!</button>
              <button onClick={() => setSellStep(2)} style={{ width: '100%', padding: '12px', background: 'none', border: 'none', color: '#888', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 8, fontFamily: F.body }}>&larr; Edit Details</button>
            </>}
          </div>
        </div>
      </div>}

      {/* CART DRAWER */}
      {cartOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 300 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(4px)' }} onClick={() => setCartOpen(false)} />
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 'min(400px,90vw)', background: '#fff', display: 'flex', flexDirection: 'column', animation: 'si .3s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #eee' }}><span style={{ fontFamily: F.head, fontSize: 18, fontWeight: 800 }}>Your Bag ({cartN})</span><button onClick={() => setCartOpen(false)} style={{ background: '#f5f5f5', border: 'none', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IC.X /></button></div>
          <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px' }}>
            {cart.length === 0 ? <div style={{ textAlign: 'center', padding: '50px 0', color: '#999' }}><div style={{ fontSize: 44, marginBottom: 10 }}>&#128717;</div><div style={{ fontSize: 15, fontWeight: 600 }}>Your bag is empty</div><button onClick={() => { setCartOpen(false); goShop('all', 'all') }} className="bp" style={btn(C.accent, C.dark, { marginTop: 18 })}>Start Shopping</button></div> :
              /* eslint-disable-next-line @next/next/no-img-element */
              cart.map(it => <div key={it.key} style={{ display: 'flex', gap: 12, padding: '14px 0', borderBottom: '1px solid #f5f5f5' }}>
                <img src={it.img} alt="" style={{ width: 66, height: 82, objectFit: 'cover', borderRadius: 10, background: '#f0ede8' }} onError={e => { (e.target as HTMLImageElement).style.background = '#f0ede8' }} />
                <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{it.title}</div><div style={{ fontSize: 11, color: '#888', marginBottom: 7 }}>{it.color} &middot; {it.size}</div><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f5f5f5', borderRadius: 8, padding: '3px 5px' }}><button onClick={() => updQ(it.key, -1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 3 }}><IC.Minus /></button><span style={{ fontSize: 13, fontWeight: 700, minWidth: 14, textAlign: 'center' }}>{it.qty}</span><button onClick={() => updQ(it.key, 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 3 }}><IC.Plus /></button></div><span style={{ fontSize: 14, fontWeight: 800 }}>${(it.price * it.qty).toFixed(2)}</span></div></div>
                <button onClick={() => rmC(it.key)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', alignSelf: 'flex-start', padding: 3 }}><IC.Trash /></button>
              </div>)}
          </div>
          {cart.length > 0 && <div style={{ padding: '18px 22px', borderTop: '1px solid #eee' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}><input placeholder="Promo code" value={promo} onChange={e => setPromo(e.target.value)} style={{ flex: 1, padding: '10px 14px', border: '2px solid #eee', borderRadius: 10, fontSize: 12, fontFamily: F.body }} /><button onClick={() => { if (promo.toUpperCase() === 'CARDIN10') { setPromoOn(true); notify('10% off!') } else notify('Invalid code') }} style={{ padding: '10px 16px', background: C.dark, color: '#fff', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Apply</button></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#666', marginBottom: 5 }}><span>Subtotal</span><span>${sub.toFixed(2)}</span></div>
            {promoOn && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#059669', marginBottom: 5 }}><span>Discount</span><span>-${disc.toFixed(2)}</span></div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#666', marginBottom: 10 }}><span>Shipping</span><span>{ship === 0 ? 'FREE' : `$${ship.toFixed(2)}`}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 800, marginBottom: 14 }}><span>Total</span><span>${tot.toFixed(2)}</span></div>
            <button onClick={() => { setCartOpen(false); setView('checkout') }} className="bp" style={btn(C.accent, C.dark, { width: '100%', fontSize: 15 })}>Checkout &middot; ${tot.toFixed(2)}</button>
          </div>}
        </div>
      </div>}

      {/* HOME */}
      {view === 'home' && <>
        {/* HERO — split layout */}
        <section style={{ background: 'linear-gradient(170deg, #FFF5F3, #FAF9F6)', padding: '45px 24px 55px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(232,69,60,.06)', filter: 'blur(60px)', pointerEvents: 'none' }} />
          <div className="hg" style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center', animation: 'fu .6s ease' }}>
            <div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18, justifyContent: 'center', position: 'relative', zIndex: 5 }}>
                <a href="https://www.tiktok.com/@cardinkiim" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.accent, color: C.dark, padding: '6px 16px', borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: '1px', textDecoration: 'none' }}><IC.TikTok /> {followers}+ FOLLOWERS</a>
                <a href="https://www.youtube.com/channel/UCeqF5g_mOasvyYdiKHxe1HQ" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.accent, color: C.dark, padding: '6px 16px', borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: '1px', textDecoration: 'none' }}><IC.YouTube /> {ytSubs}+ SUBSCRIBERS</a>
              </div>
              <h1 style={{ fontFamily: F.head, fontSize: 'clamp(32px,4.5vw,50px)', fontWeight: 900, lineHeight: 1.08, color: C.dark, marginBottom: 18 }}>Teen Fashion<br />That&apos;s <span style={{ color: C.accent, fontStyle: 'italic' }}>Actually</span><br />Affordable</h1>
              <p style={{ fontSize: 16, color: '#666', lineHeight: 1.7, marginBottom: 30, maxWidth: 440 }}>New, used & open-box clothing curated by Cardin Kim. The styles you see on TikTok — at prices that won&apos;t break the bank.</p>
              <div className="hero-btns" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                <button onClick={() => goShop('all', 'new')} className="bp" style={btn(C.accent, C.dark, { fontSize: 15 })}>Shop New Arrivals</button>
                <button onClick={() => goShop('all', 'all')} className="bp" style={btn(C.accent, C.dark, { fontSize: 15 })}>Browse All</button>
              </div>
            </div>
            <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', aspectRatio: '9/16', maxHeight: 580 }}>
              <video
                ref={heroVidRef}
                src="/tiktok-video2.mp4"
                autoPlay
                muted
                playsInline
                onEnded={onHeroVideoEnded}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
        </section>

        {/* TRUST BADGES */}
        <section style={{ background: '#fff' }}>
          <div className="pg" style={{ maxWidth: 1280, margin: '0 auto', padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
            {[{ i: <IC.Truck />, t: 'Free Shipping $50+', s: 'Fast delivery' }, { i: <IC.Shield />, t: 'Buyer Protection', s: 'Authentic guaranteed' }, { i: <IC.Refresh />, t: 'Easy Returns', s: '14-day returns' }].map(({ i, t, s }) => <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}><div style={{ color: C.accent }}>{i}</div><div><div style={{ fontSize: 12, fontWeight: 700 }}>{t}</div><div style={{ fontSize: 11, color: '#999' }}>{s}</div></div></div>)}
          </div>
        </section>

        {/* SHOP BY CATEGORY — visual tiles */}
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '45px 24px' }}>
          <h2 style={{ fontFamily: F.head, fontSize: 28, fontWeight: 900, marginBottom: 24 }}>Shop by Category</h2>
          <div className="cat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {[
              { k: 'tops', l: 'Tops', img: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500&h=340&fit=crop' },
              { k: 'bottoms', l: 'Bottoms', img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&h=340&fit=crop' },
              { k: 'dresses', l: 'Dresses', img: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&h=340&fit=crop' },
              { k: 'outerwear', l: 'Outerwear', img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=340&fit=crop' },
              { k: 'shoes', l: 'Shoes', img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&h=340&fit=crop' },
              { k: 'accessories', l: 'Accessories', img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&h=340&fit=crop' },
            ].map(c => (
              <div key={c.k} className="cat-tile" onClick={() => goShop(c.k, 'all')} style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', aspectRatio: '3/2' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="cat-img" src={c.img} alt={c.l} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.55), rgba(0,0,0,.1))' }} />
                <div style={{ position: 'absolute', bottom: 16, left: 16, color: '#fff' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, fontFamily: F.head }}>{c.l}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.75)', fontWeight: 600 }}>{products.filter(p => p.cat === c.k).length} items</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PROMOTIONAL BANNER */}
        <section style={{ background: C.accent, padding: '28px 24px', textAlign: 'center' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.dark, letterSpacing: '1px', fontFamily: F.head }}>NEW ARRIVALS JUST DROPPED</div>
            <div style={{ fontSize: 13, color: 'rgba(0,0,0,.55)', fontWeight: 600 }}>Free shipping on orders $50+</div>
            <button onClick={() => goShop('all', 'new')} style={{ marginTop: 6, background: '#fff', color: C.dark, border: 'none', borderRadius: 50, padding: '9px 24px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: F.body }}>Shop Now &rarr;</button>
          </div>
        </section>

        {/* TRENDING NOW */}
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '45px 24px' }}>
          <div className="sec-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 4, height: 28, background: C.accent, borderRadius: 2 }} />
              <h2 style={{ fontFamily: F.head, fontSize: 28, fontWeight: 900 }}>Trending Now</h2>
            </div>
            <button onClick={() => goShop('all', 'trend')} style={{ fontSize: 12, fontWeight: 700, color: C.accent, background: 'none', border: 'none', cursor: 'pointer' }}>View All &rarr;</button>
          </div>
          <div className="gp" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }}>{products.filter(p => p.col === 'trend' || p.col === 'best').slice(0, 4).map((p, i) => <Card key={p.id} p={p} i={i} />)}</div>
        </section>

        {/* JUST DROPPED */}
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '45px 24px 55px' }}>
          <div className="sec-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 4, height: 28, background: C.accent, borderRadius: 2 }} />
              <h2 style={{ fontFamily: F.head, fontSize: 28, fontWeight: 900 }}>Just Dropped</h2>
            </div>
            <button onClick={() => goShop('all', 'new')} style={{ fontSize: 12, fontWeight: 700, color: C.accent, background: 'none', border: 'none', cursor: 'pointer' }}>View All &rarr;</button>
          </div>
          <div className="gp" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }}>{products.filter(p => p.col === 'new').slice(0, 4).map((p, i) => <Card key={p.id} p={p} i={i} />)}</div>
        </section>
      </>}

      {/* SHOP */}
      {view === 'shop' && <section style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 24px 70px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 22 }}>
          <div>
            <h1 style={{ fontFamily: F.head, fontSize: 30, fontWeight: 900, marginBottom: 6 }}>{COLS_NAV.find(c => c.k === col)?.l || 'Shop'}</h1>
            <p style={{ fontSize: 13, color: '#888' }}>{filt.length} items</p>
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)} style={{ padding: '8px 14px', border: '1.5px solid #ddd', borderRadius: 10, fontSize: 12, fontWeight: 600, fontFamily: F.body, background: '#fff', cursor: 'pointer', color: '#555' }}>
            <option value="default">Featured</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="newest">Newest</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 24, paddingBottom: 4 }}>{CATS.map(c => <button key={c.k} className="cp" onClick={() => setCat(c.k)} style={{ padding: '7px 18px', borderRadius: 50, whiteSpace: 'nowrap', background: cat === c.k ? C.dark : '#fff', color: cat === c.k ? '#fff' : '#555', border: cat === c.k ? 'none' : '1.5px solid #ddd', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: F.body }}>{c.l}</button>)}</div>
        <div style={{ display: 'flex', gap: 22, marginBottom: 24, borderBottom: '1px solid #eee', paddingBottom: 10 }}>{COLS_NAV.map(co => <span key={co.k} onClick={() => setCol(co.k)} style={{ fontSize: 12, fontWeight: col === co.k ? 700 : 500, color: col === co.k ? C.dark : '#999', borderBottom: col === co.k ? `2px solid ${C.accent}` : '2px solid transparent', paddingBottom: 8, cursor: 'pointer' }}>{co.l}</span>)}</div>
        {sorted.length === 0 ? <div style={{ textAlign: 'center', padding: '70px 20px', color: '#999' }}><div style={{ fontSize: 44 }}>&#128269;</div><div style={{ fontSize: 16, fontWeight: 600, marginTop: 10 }}>No items found</div></div> :
          <div className="gp" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }}>{sorted.map((p, i) => <Card key={p.id} p={p} i={i} />)}</div>}
      </section>}

      {/* PRODUCT DETAIL */}
      {view === 'product' && selProd && <section style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 24px 70px' }}>
        <button onClick={() => setView('shop')} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 12, fontWeight: 600, marginBottom: 22 }}><IC.Back /> Back</button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 44 }} className="hg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div><img src={selProd.img} alt={selProd.title} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', borderRadius: 18, background: '#f0ede8' }} onError={e => { (e.target as HTMLImageElement).style.background = '#f0ede8' }} /></div>
          <div style={{ paddingTop: 8 }}>
            {selProd.badge && <span style={{ display: 'inline-block', fontSize: 9, fontWeight: 800, letterSpacing: '1.5px', padding: '4px 12px', borderRadius: 20, marginBottom: 12, background: badgeColor(selProd.badge), color: selProd.badge === 'TIKTOK' ? C.dark : '#fff' }}>{badgeText(selProd.badge)}</span>}
            <h1 style={{ fontFamily: F.head, fontSize: 30, fontWeight: 900, marginBottom: 10 }}>{selProd.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 6 }}>{[...Array(5)].map((_, i) => <IC.Star key={i} />)}<span style={{ fontSize: 12, color: '#888', marginLeft: 6 }}>(24 reviews)</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}><span style={{ fontSize: 26, fontWeight: 800, color: C.accent }}>${selProd.price.toFixed(2)}</span>{selProd.compare && <span style={{ fontSize: 16, color: '#bbb', textDecoration: 'line-through' }}>${selProd.compare.toFixed(2)}</span>}</div>
            {selProd.cond !== 'New' && selProd.cond !== 'New with Tags' && <div style={{ fontSize: 12, fontWeight: 700, color: '#7C3AED', marginBottom: 12 }}>Condition: {selProd.cond}</div>}
            <p style={{ fontSize: 14, color: '#666', lineHeight: 1.7, marginBottom: 24, marginTop: 12 }}>{selProd.desc}</p>
            {selProd.colors.length > 1 && <div style={{ marginBottom: 22 }}><div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '1px', color: '#888' }}>Color — {selProd.colors[selColor]?.n}</div><div style={{ display: 'flex', gap: 8 }}>{selProd.colors.map((co, i) => <button key={i} onClick={() => setSelColor(i)} style={{ width: 34, height: 34, borderRadius: '50%', background: co.h, border: selColor === i ? `3px solid ${C.dark}` : co.h === '#fff' ? '2px solid #ddd' : '2px solid transparent', cursor: 'pointer', outline: selColor === i ? '2px solid #fff' : 'none', outlineOffset: '-5px' }} />)}</div></div>}
            <div style={{ marginBottom: 24 }}><div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '1px', color: '#888' }}>Size {selSize && `— ${selSize}`}</div><div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>{selProd.sizes.map(s => <button key={s} onClick={() => setSelSize(s)} style={{ padding: '9px 16px', borderRadius: 10, background: selSize === s ? C.dark : '#fff', color: selSize === s ? '#fff' : C.dark, border: selSize === s ? 'none' : '1.5px solid #ddd', fontSize: 12, fontWeight: 700, cursor: 'pointer', minWidth: 44, fontFamily: F.body, transition: 'all .15s' }}>{s}</button>)}</div></div>
            {selProd.stock < 15 && <div style={{ fontSize: 12, color: C.accent, fontWeight: 600, marginBottom: 14 }}>Only {selProd.stock} left</div>}
            <button onClick={() => addCart(selProd, selProd.colors[selColor]?.n, selSize)} className="bp" style={btn(C.accent, C.dark, { width: '100%', fontSize: 15, padding: '16px' })}>Add to Bag — ${selProd.price.toFixed(2)}</button>
          </div>
        </div>
      </section>}

      {/* CHECKOUT WITH PAYPAL */}
      {view === 'checkout' && <section style={{ maxWidth: 600, margin: '0 auto', padding: '36px 24px 70px' }}>
        <h1 style={{ fontFamily: F.head, fontSize: 30, fontWeight: 900, marginBottom: 28 }}>Checkout</h1>
        <div style={{ background: '#fff', borderRadius: 18, padding: 24, marginBottom: 20, border: '1px solid #eee' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Shipping Info</h3>
          {[{ k: 'name', l: 'Full Name', ph: 'Jane Doe' }, { k: 'email', l: 'Email', ph: 'jane@email.com' }, { k: 'address', l: 'Address', ph: '123 Main St' }].map(f => <div key={f.k} style={{ marginBottom: 14 }}><label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#999', display: 'block', marginBottom: 5 }}>{f.l} *</label><input value={checkForm[f.k as keyof typeof checkForm]} onChange={e => setCheckForm({ ...checkForm, [f.k]: e.target.value })} placeholder={f.ph} style={{ width: '100%', padding: '12px 14px', border: '2px solid #eee', borderRadius: 11, fontSize: 14, fontFamily: F.body, boxSizing: 'border-box' }} /></div>)}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10 }}>
            <div><label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#999', display: 'block', marginBottom: 5 }}>City</label><input value={checkForm.city} onChange={e => setCheckForm({ ...checkForm, city: e.target.value })} style={{ width: '100%', padding: '12px 14px', border: '2px solid #eee', borderRadius: 11, fontSize: 14, fontFamily: F.body, boxSizing: 'border-box' }} /></div>
            <div><label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#999', display: 'block', marginBottom: 5 }}>State</label><select value={checkForm.state} onChange={e => setCheckForm({ ...checkForm, state: e.target.value })} style={{ width: '100%', padding: '12px 10px', border: '2px solid #eee', borderRadius: 11, fontSize: 14, fontFamily: F.body, boxSizing: 'border-box', background: '#fff' }}><option value="">--</option>{['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'].map(s => <option key={s} value={s}>{s}</option>)}</select></div>
            <div><label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#999', display: 'block', marginBottom: 5 }}>Zip</label><input value={checkForm.zip} onChange={e => setCheckForm({ ...checkForm, zip: e.target.value })} style={{ width: '100%', padding: '12px 14px', border: '2px solid #eee', borderRadius: 11, fontSize: 14, fontFamily: F.body, boxSizing: 'border-box' }} /></div>
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: '#999', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>&#127482;&#127480; US shipping only</div>
        </div>

        {/* Order Summary */}
        <div style={{ background: '#fff', borderRadius: 18, padding: 24, marginBottom: 20, border: '1px solid #eee' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Order Summary</h3>
          {cart.map(i => <div key={i.key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', color: '#555' }}><span>{i.title} &times; {i.qty}</span><span style={{ fontWeight: 700 }}>${(i.price * i.qty).toFixed(2)}</span></div>)}
          <div style={{ borderTop: '1px solid #eee', marginTop: 10, paddingTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#666', marginBottom: 5 }}><span>Shipping</span><span>{ship === 0 ? 'FREE' : `$${ship.toFixed(2)}`}</span></div>
            {promoOn && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#059669', marginBottom: 5 }}><span>Promo</span><span>-${disc.toFixed(2)}</span></div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800, marginTop: 8 }}><span>Total</span><span>${tot.toFixed(2)}</span></div>
          </div>
        </div>

        {/* PAYPAL BUTTON */}
        <div style={{ background: '#fff', borderRadius: 18, padding: 24, marginBottom: 20, border: '1px solid #eee' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Payment</h3>
          {paypalProcessing ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24 }}>
              <div style={{ width: 18, height: 18, border: '3px solid rgba(0,0,0,.1)', borderTop: '3px solid #0070BA', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#555' }}>Processing payment...</span>
            </div>
          ) : (
            <PayPalButtons
              style={{ layout: 'vertical', color: 'blue', shape: 'pill', label: 'paypal' }}
              createOrder={createPayPalOrderHandler}
              onApprove={onPayPalApprove}
              onError={() => notify('PayPal error — please try again')}
            />
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14, fontSize: 11, color: '#aaa' }}>
            <IC.Shield /> Secure checkout powered by PayPal
          </div>
        </div>

        <button onClick={() => setView('shop')} style={{ width: '100%', padding: '14px', background: 'none', border: 'none', color: '#888', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: F.body }}>&larr; Continue Shopping</button>
      </section>}

      {/* SUCCESS */}
      {view === 'success' && <section style={{ maxWidth: 480, margin: '0 auto', padding: '70px 24px', textAlign: 'center', animation: 'fu .6s ease' }}>
        <div style={{ fontSize: 60, marginBottom: 18 }}>&#127881;</div>
        <h1 style={{ fontFamily: F.head, fontSize: 34, fontWeight: 900, marginBottom: 14 }}>Order Confirmed!</h1>
        <p style={{ fontSize: 15, color: '#666', lineHeight: 1.7, marginBottom: 10 }}>Thanks for shopping CardinKim!</p>
        {lastOrderId && <div style={{ background: '#f8f8f6', borderRadius: 14, padding: '16px 20px', marginBottom: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>Order ID</div>
          <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 600, color: C.dark, marginBottom: 10 }}>{lastOrderId}</div>
          <a href={`/track?id=${lastOrderId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: C.accent, textDecoration: 'none' }}><IC.Truck /> Track your order &rarr;</a>
        </div>}
        <p style={{ fontSize: 14, color: '#888', marginBottom: 28 }}>Your PayPal receipt is your confirmation. Follow me for styling tips with your new pieces!</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 28 }}>
          <a href="https://www.tiktok.com/@cardinkiim" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: C.accent, color: C.dark, padding: '11px 22px', borderRadius: 50, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}><IC.TikTok /> TikTok</a>
          <a href="https://www.youtube.com/channel/UCeqF5g_mOasvyYdiKHxe1HQ" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: C.accent, color: C.dark, padding: '11px 22px', borderRadius: 50, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}><IC.YouTube /> Subscribe</a>
        </div>
        <button onClick={() => setView('home')} className="bp" style={btn(C.accent, C.dark, { fontSize: 15 })}>Continue Shopping</button>
      </section>}

      {/* ADMIN FLOATING BUTTON */}
      {isAdmin && <button onClick={() => { setSellOpen(true); setSellStep(1) }}
        style={{ position: 'fixed', bottom: 24, right: 24, padding: '14px 24px', background: '#c1d0b5', color: C.dark, border: 'none', borderRadius: 50, fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 24px rgba(193,208,181,.5)', zIndex: 80, display: 'flex', alignItems: 'center', gap: 8, fontFamily: F.body }} className="bp">
        Add Product
      </button>}

      {/* FOOTER */}
      <footer style={{ background: C.dark, color: '#fff', padding: '50px 24px 28px', textAlign: 'center' }}>
        <div className="fg" style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 36, marginBottom: 36 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#666', marginBottom: 14 }}>Shop</div>
            {['New Arrivals', 'Bestsellers', 'Trending', 'All Items'].map(s => <div key={s} className="fl" onClick={() => goShop('all', s === 'All Items' ? 'all' : s === 'New Arrivals' ? 'new' : s.toLowerCase())} style={{ fontSize: 17, color: '#888', marginBottom: 10, cursor: 'pointer' }}>{s}</div>)}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#666', marginBottom: 14 }}>Info</div>
            <a href="/about" className="fl" style={{ fontSize: 17, color: '#888', marginBottom: 10, cursor: 'pointer', display: 'block', textDecoration: 'none' }}>About</a>
            <a href="/shipping" className="fl" style={{ fontSize: 17, color: '#888', marginBottom: 10, cursor: 'pointer', display: 'block', textDecoration: 'none' }}>Shipping</a>
            <a href="/size-guide" className="fl" style={{ fontSize: 17, color: '#888', marginBottom: 10, cursor: 'pointer', display: 'block', textDecoration: 'none' }}>Size Guide</a>
            <a href="/contact" className="fl" style={{ fontSize: 17, color: '#888', marginBottom: 10, cursor: 'pointer', display: 'block', textDecoration: 'none' }}>Contact</a>
            <a href="/track" className="fl" style={{ fontSize: 17, color: '#888', marginBottom: 10, cursor: 'pointer', display: 'block', textDecoration: 'none' }}>Track Order</a>
            <a href="/privacy" className="fl" style={{ fontSize: 17, color: '#888', marginBottom: 10, cursor: 'pointer', display: 'block', textDecoration: 'none' }}>Privacy Policy</a>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#666', marginBottom: 14 }}>Follow</div>
            <a href="https://www.tiktok.com/@cardinkiim" target="_blank" rel="noreferrer" className="fl" style={{ fontSize: 17, color: '#888', marginBottom: 10, display: 'block', textDecoration: 'none' }}>TikTok</a>
            <a href="https://www.youtube.com/channel/UCeqF5g_mOasvyYdiKHxe1HQ" target="_blank" rel="noreferrer" className="fl" style={{ fontSize: 17, color: '#888', marginBottom: 10, display: 'block', textDecoration: 'none' }}>YouTube</a>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginBottom: 24 }}>
          <a href="https://www.tiktok.com/@cardinkiim" target="_blank" rel="noreferrer" className="si" style={{ color: '#888', display: 'flex' }}><IC.TikTok /></a>
          <a href="https://www.youtube.com/channel/UCeqF5g_mOasvyYdiKHxe1HQ" target="_blank" rel="noreferrer" className="si" style={{ color: '#888', display: 'flex' }}><IC.YouTube /></a>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: 20 }}><div style={{ fontSize: 15, color: '#555' }}>&copy; 2026 CardinKim. All rights reserved.</div></div>
      </footer>
    </div>
    </PayPalScriptProvider>
  )
}
