import { Navbar } from '@/components/layout/navbar'
import { MobileBottomNav, MobileHeader } from '@/components/layout/mobile-nav'
import { PWAInstallPrompt } from '@/components/pwa/pwa-install-prompt'
import { OfflineIndicator, OfflineContent } from '@/components/pwa/offline-components'
import { AuthProvider } from '@/components/providers/auth-provider'
import { I18nProvider } from '@/lib/i18n/i18n-context'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <I18nProvider>
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
          <div className="md:hidden">
            <MobileBottomNav />
          </div>

          {/* PWA Install Prompt */}
          <PWAInstallPrompt />
        </div>
      </I18nProvider>
    </AuthProvider>
  )
}
