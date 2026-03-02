import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch('https://www.tiktok.com/@cardinkiim', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 3600 }, // cache for 1 hour
    })
    const html = await res.text()

    // Try multiple patterns TikTok uses for follower count in page source
    let followers: string | null = null

    // Pattern: "followerCount":123456
    const countMatch = html.match(/"followerCount"\s*:\s*(\d+)/)
    if (countMatch) {
      const num = parseInt(countMatch[1])
      if (num >= 1_000_000) followers = `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
      else if (num >= 1_000) followers = `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K`
      else followers = `${num}`
    }

    // Fallback: look for "fans":123456
    if (!followers) {
      const fansMatch = html.match(/"fans"\s*:\s*(\d+)/)
      if (fansMatch) {
        const num = parseInt(fansMatch[1])
        if (num >= 1_000_000) followers = `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
        else if (num >= 1_000) followers = `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K`
        else followers = `${num}`
      }
    }

    return NextResponse.json({ followers: followers || '101K' })
  } catch {
    return NextResponse.json({ followers: '101K' })
  }
}
