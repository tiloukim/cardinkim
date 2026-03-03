import type { Metadata } from 'next'
import { DM_Sans, Fraunces } from 'next/font/google'
import { AuthProvider } from '@/lib/auth-context'
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
  title: 'CardinKim | Trendy Teen Fashion & Affordable Styles — Shop Now',
  description: 'Shop the cutest trendy outfits handpicked by Cardin Kim. New arrivals, bestsellers & TikTok-viral styles starting at $12.99. Free shipping on orders $50+. Tops, jeans, dresses, accessories & more.',
  keywords: [
    'teen fashion', 'affordable teen clothing', 'TikTok fashion', 'Cardin Kim',
    'trendy outfits', 'cute clothes for teens', 'teen online store', 'Y2K fashion',
    'coquette style', 'teen girl outfits', 'cheap trendy clothes', 'aesthetic clothing',
    'wide leg jeans', 'crop tops', 'teen accessories', 'free shipping clothing',
  ],
  metadataBase: new URL('https://www.cardinkim.com'),
  alternates: { canonical: '/' },
  openGraph: {
    title: 'CardinKim | Trendy Teen Fashion & Affordable Styles',
    description: 'The cutest outfits handpicked by Cardin Kim. TikTok-viral styles starting at $12.99. Free shipping $50+.',
    siteName: 'CardinKim',
    url: 'https://www.cardinkim.com',
    type: 'website',
    locale: 'en_US',
    images: [{ url: '/logo.png', width: 512, height: 512, alt: 'CardinKim — Teen Fashion' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CardinKim | Trendy Teen Fashion & Affordable Styles',
    description: 'Shop TikTok-viral outfits starting at $12.99. Free shipping $50+.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' as const },
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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
