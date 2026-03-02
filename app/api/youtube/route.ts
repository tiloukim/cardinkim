import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch('https://www.youtube.com/channel/UCeqF5g_mOasvyYdiKHxe1HQ', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 3600 },
    })
    const html = await res.text()

    let subs: string | null = null

    // Pattern: "subscriberCountText":"1.23K subscribers"
    const subTextMatch = html.match(/"subscriberCountText"\s*:\s*\{\s*"simpleText"\s*:\s*"([\d.]+[KMB]?) subscribers?"/)
    if (subTextMatch) {
      subs = subTextMatch[1]
    }

    // Fallback: "subscriberCount":"12345"
    if (!subs) {
      const countMatch = html.match(/"subscriberCount"\s*:\s*"?(\d+)"?/)
      if (countMatch) {
        const num = parseInt(countMatch[1])
        if (num >= 1_000_000) subs = `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
        else if (num >= 1_000) subs = `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K`
        else subs = `${num}`
      }
    }

    return NextResponse.json({ subscribers: subs || '1K' })
  } catch {
    return NextResponse.json({ subscribers: '1K' })
  }
}
