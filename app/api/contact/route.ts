import { NextResponse } from 'next/server'
import { Resend } from 'resend'

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export async function POST(req: Request) {
  try {
    const { name, email, subject, message, captchaToken } = await req.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
    }

    // Verify Turnstile CAPTCHA
    if (captchaToken && process.env.TURNSTILE_SECRET_KEY) {
      const cfRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: process.env.TURNSTILE_SECRET_KEY, response: captchaToken }),
      })
      const cfData = await cfRes.json()
      if (!cfData.success) {
        return NextResponse.json({ error: 'CAPTCHA verification failed.' }, { status: 400 })
      }
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }

    const safeName = escapeHtml(name)
    const safeEmail = escapeHtml(email)
    const safeSubject = escapeHtml(subject)
    const safeMessage = escapeHtml(message)

    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error } = await resend.emails.send({
      from: 'CardinKim <contact@cardinkim.com>',
      to: 'contact@cardinkim.com',
      replyTo: email,
      subject: `[Contact] ${safeSubject} — from ${safeName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
          <h2 style="margin: 0 0 24px; font-size: 20px; color: #111;">New Contact Form Submission</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 10px 0; color: #666; width: 90px; vertical-align: top;">Name</td><td style="padding: 10px 0; color: #111;">${safeName}</td></tr>
            <tr><td style="padding: 10px 0; color: #666; vertical-align: top;">Email</td><td style="padding: 10px 0; color: #111;"><a href="mailto:${safeEmail}" style="color: #E8453C;">${safeEmail}</a></td></tr>
            <tr><td style="padding: 10px 0; color: #666; vertical-align: top;">Subject</td><td style="padding: 10px 0; color: #111;">${safeSubject}</td></tr>
            <tr><td style="padding: 10px 0; color: #666; vertical-align: top;">Message</td><td style="padding: 10px 0; color: #111; white-space: pre-wrap;">${safeMessage}</td></tr>
          </table>
        </div>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Contact API error:', e)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
