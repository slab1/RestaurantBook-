import React from 'react'
import { useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'
import { MobileNav } from './MobileNav'
import { NotificationCenter } from '../realtime/NotificationCenter'
import { OfflineIndicator } from '../pwa/OfflineIndicator'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const isAuthPage = ['/login', '/register'].includes(location.pathname)

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Navbar showLogo />
      </div>

      {/* Offline Indicator */}
      <OfflineIndicator />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 md:pb-8 pb-20">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden">
        <MobileNav />
      </div>

      {/* Notification Center */}
      <NotificationCenter />

      {/* PWA Install Prompt */}
      {/* <PWAInstallPrompt /> */}
    </div>
  )
}
