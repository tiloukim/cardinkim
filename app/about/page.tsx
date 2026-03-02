'use client'

import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="auth-page">
      <div className="auth-header" style={{ textAlign: 'center' }}>
        <Link href="/"><img src="/logo.png" alt="Cardin Kim Closet" className="auth-logo-img" style={{ margin: '0 auto' }} /></Link>
      </div>
      <div className="auth-container" style={{ maxWidth: 560 }}>
        <h1 className="auth-title">About Us</h1>
        <p className="auth-subtitle" style={{ marginBottom: 28 }}>
          Trending brands. Real prices. Made for teens.
        </p>

        <div style={{ fontSize: 15, color: '#444', lineHeight: 1.8, textAlign: 'left' }}>
          <p style={{ marginBottom: 18 }}>
            CardinKim was created with one simple goal: to make trending, brand-name clothing accessible to every teenager — without the crazy price tags.
          </p>
          <p style={{ marginBottom: 18 }}>
            We know how important style is when you&apos;re growing up. You shouldn&apos;t have to choose between looking great and staying on budget. That&apos;s why we curate a mix of <strong>new</strong>, <strong>open-box</strong>, and <strong>gently used</strong> pieces from the brands you actually want to wear — all at prices that make sense.
          </p>
          <p style={{ marginBottom: 18 }}>
            Every item we sell is hand-picked and quality-checked, so you can shop with confidence. Whether it&apos;s the latest streetwear drop or a wardrobe staple, we&apos;ve got you covered.
          </p>
          <p>
            Style should be for everyone. Welcome to CardinKim.
          </p>
        </div>

        <Link href="/" className="auth-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: 32 }}>
          Start Shopping
        </Link>
      </div>
    </div>
  )
}
