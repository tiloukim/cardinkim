import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Poshmark Business Tracker — CardinKim',
  description: 'Track your Poshmark sales, shipments, costs, and profit',
  manifest: '/poshmark-manifest.json',
}

export default function PoshmarkPage() {
  return (
    <>
      <head>
        <meta name="theme-color" content="#1a1a1a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Poshmark Tracker" />
      </head>
      <iframe
        src="/poshmark-app.html"
        style={{
          width: '100%',
          height: '100vh',
          border: 'none',
          display: 'block',
        }}
      />
    </>
  )
}
