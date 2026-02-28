import type { Metadata } from 'next'
import { DM_Sans, Fraunces } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
})

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  title: 'CardinKim — Teen Fashion That\'s Actually Affordable',
  description: 'New, used & open-box clothing curated by Cardin Kim. The styles you see on TikTok — at prices that won\'t break the bank.',
  keywords: ['teen fashion', 'affordable clothing', 'TikTok fashion', 'Cardin Kim', 'teen ecommerce'],
  openGraph: {
    title: 'CardinKim — Teen Fashion',
    description: 'Affordable teen fashion curated by Cardin Kim',
    siteName: 'CardinKim',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${fraunces.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
