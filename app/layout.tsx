import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/ui/toast'
import { Toaster } from '@/components/ui/toaster'
import { Navbar } from '@/components/layout/navbar'
import { MobileBottomNav, MobileHeader } from '@/components/layout/mobile-nav'
import { PWAInstallPrompt } from '@/components/pwa/pwa-install-prompt'
import { OfflineIndicator, OfflineContent } from '@/components/pwa/offline-components'
import { AuthProvider } from '@/components/providers/auth-provider'
import { I18nProvider } from '@/lib/i18n/i18n-context'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RestaurantBook - Table Booking System',
  description: 'Book tables at your favorite restaurants with ease',
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'RestaurantBook',
  },
  applicationName: 'RestaurantBook',
  keywords: ['restaurant', 'booking', 'table', 'reservation', 'food', 'dining'],
  authors: [{ name: 'RestaurantBook Team' }],
  creator: 'RestaurantBook',
  publisher: 'RestaurantBook',
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'RestaurantBook - Table Booking System',
    description: 'Book tables at your favorite restaurants with ease',
    siteName: 'RestaurantBook',
    url: 'https://restaurantbook.com',
    images: [
      {
        url: '/icons/icon-512x512.png',
        width: 512,
        height: 512,
        alt: 'RestaurantBook',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RestaurantBook - Table Booking System',
    description: 'Book tables at your favorite restaurants with ease',
    images: ['/icons/icon-512x512.png'],
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
    other: [
      {
        rel: 'mask-icon',
        url: '/icons/icon-192x192.png',
        color: '#3b82f6',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="RestaurantBook" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <Script
          id="sw-register"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                      console.log('SW registered: ', registration);
                    })
                    .catch(registrationError => {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
        <AuthProvider>
          <I18nProvider>
            <ToastProvider>
              <div className="min-h-screen bg-background relative">
                {/* Desktop Navigation */}
                <div className="hidden md:block">
                  <Navbar />
                </div>
                
                {/* Mobile Header */}
                <div className="md:hidden">
                  <MobileHeader title="RestaurantBook" />
                </div>

                {/* Offline Indicator */}
                <OfflineIndicator />

                {/* Main Content */}
                <main className="container mx-auto px-4 py-8 md:pb-8 pb-20 safe-area-bottom">
                  <OfflineContent>
                    {children}
                  </OfflineContent>
                </main>

                {/* Mobile Bottom Navigation */}
                <MobileBottomNav />

                {/* PWA Install Prompt */}
                <PWAInstallPrompt />
              </div>
              <Toaster />
            </ToastProvider>
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  )
}