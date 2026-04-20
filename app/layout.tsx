import type { Metadata, Viewport } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'Digit-Excel5G AI Studio', template: '%s | DE5G AI Studio' },
  description: "Africa's Premier AI Creative Studio. Generate images, treat photos, create flyers and songs. Pay with MTN MoMo or Orange Money.",
  keywords: ['AI studio', 'image generation', 'Cameroon', 'MTN MoMo', 'Orange Money', 'African tech'],
  authors: [{ name: 'Digit-Excel5G', url: 'https://digit-excel5g.com' }],
  openGraph: {
    title: 'Digit-Excel5G AI Studio',
    description: "Africa's Premier AI Creative Studio 🇨🇲",
    type: 'website',
    locale: 'fr_CM',
  },
}

export const viewport: Viewport = {
  themeColor: '#0F4CFF',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#111E35', color: '#e2eaf8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontFamily: 'DM Sans, sans-serif', fontSize: '14px' },
            success: { iconTheme: { primary: '#00C48C', secondary: '#111E35' } },
            error:   { iconTheme: { primary: '#FF4D4F', secondary: '#111E35' } },
          }}
        />
      </body>
    </html>
  )
}
