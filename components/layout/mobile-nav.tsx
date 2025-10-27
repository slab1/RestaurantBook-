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
      className="fixed bottom-0 left-0 right-0 z-[100] bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 md:hidden safe-area-bottom shadow-lg"
      role="navigation"
      aria-label="Mobile Navigation"
    >
      <div className="grid grid-cols-5 h-16 pb-safe-bottom">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-colors min-h-[64px] touch-manipulation mobile-nav-link relative',
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              )}
              style={{ 
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
                minHeight: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              onClick={(e) => {
                // Enhanced touch feedback
                const target = e.currentTarget
                target.style.transform = 'scale(0.95)'
                setTimeout(() => {
                  target.style.transform = ''
                }, 150)
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