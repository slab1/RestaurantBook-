'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Calendar, User, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/restaurants', icon: Search, label: 'Search' },
  { href: '/bookings', icon: Calendar, label: 'Bookings' },
  { href: '/nearby', icon: MapPin, label: 'Nearby' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  // Hide on desktop
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-[100] bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 md:hidden safe-area-bottom shadow-lg backdrop-blur-sm bg-white/95 dark:bg-gray-950/95"
      role="navigation"
      aria-label="Mobile Navigation"
      style={{
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}
    >
      <div className="grid grid-cols-5 h-16 pb-safe-bottom">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-all duration-200 min-h-[64px] touch-manipulation mobile-nav-link relative user-select-none',
                'hover:bg-blue-50 dark:hover:bg-blue-950/20 active:scale-95 active:bg-blue-100 dark:active:bg-blue-900/30',
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              )}
              style={{ 
                WebkitTapHighlightColor: 'rgba(59, 130, 246, 0.3)',
                tapHighlightColor: 'rgba(59, 130, 246, 0.3)',
                touchAction: 'manipulation',
                minHeight: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                userSelect: 'none',
                WebkitUserSelect: 'none'
              }}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              onClick={(e) => {
                // Enhanced touch feedback with haptic-like response
                const target = e.currentTarget
                target.style.transform = 'scale(0.95)'
                target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'
                setTimeout(() => {
                  target.style.transform = ''
                  target.style.backgroundColor = ''
                }, 200)
              }}
              onTouchStart={(e) => {
                // Additional touch feedback for mobile devices
                const target = e.currentTarget
                target.style.backgroundColor = 'rgba(59, 130, 246, 0.05)'
              }}
              onTouchEnd={(e) => {
                // Clean up touch feedback
                const target = e.currentTarget
                setTimeout(() => {
                  target.style.backgroundColor = ''
                }, 100)
              }}
            >
              <item.icon 
                className={cn(
                  'h-5 w-5 transition-colors', 
                  isActive && 'text-blue-600 dark:text-blue-400'
                )} 
              />
              <span className="text-xs font-medium leading-none">
                {item.label}
              </span>
              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export function MobileHeader({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 md:hidden">
      <div className="flex items-center justify-center h-14">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h1>
      </div>
    </header>
  )
}