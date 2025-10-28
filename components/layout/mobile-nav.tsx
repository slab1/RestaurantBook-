'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Calendar, User, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCart } from '@/lib/cart-context'
import { Badge } from '@/components/ui/badge'

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/restaurants', icon: Search, label: 'Search' },
  { href: '/cart', icon: ShoppingCart, label: 'Cart', showBadge: true },
  { href: '/bookings', icon: Calendar, label: 'Bookings' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const { getItemCount } = useCart()
  const cartCount = getItemCount()

  // Hide on desktop
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 md:hidden shadow-lg backdrop-blur-sm bg-white/95 dark:bg-gray-950/95"
      role="navigation"
      aria-label="Mobile Navigation"
      style={{
        zIndex: 9999,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        pointerEvents: 'auto',
        position: 'fixed'
      }}
    >
      <div className="grid grid-cols-5 h-16 pb-safe-bottom" style={{ pointerEvents: 'auto' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-all duration-200 relative',
                'hover:bg-blue-50 dark:hover:bg-blue-950/20',
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              )}
              style={{ 
                WebkitTapHighlightColor: 'rgba(59, 130, 246, 0.3)',
                touchAction: 'manipulation',
                minHeight: '64px',
                minWidth: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'auto',
                cursor: 'pointer',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                position: 'relative',
                zIndex: 1
              }}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              onClick={(e) => {
                console.log(`[MobileNav] Clicked: ${item.label} -> ${item.href}`)
                // Enhanced touch feedback
                const target = e.currentTarget
                target.style.transform = 'scale(0.95)'
                target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'
                setTimeout(() => {
                  target.style.transform = ''
                  target.style.backgroundColor = ''
                }, 150)
              }}
              onTouchStart={(e) => {
                console.log(`[MobileNav] Touch start: ${item.label}`)
                const target = e.currentTarget
                target.style.backgroundColor = 'rgba(59, 130, 246, 0.08)'
              }}
              onTouchEnd={(e) => {
                console.log(`[MobileNav] Touch end: ${item.label}`)
                const target = e.currentTarget
                setTimeout(() => {
                  target.style.backgroundColor = ''
                }, 100)
              }}
            >
              <div className="relative">
                <item.icon 
                  className={cn(
                    'h-5 w-5 transition-colors pointer-events-none', 
                    isActive && 'text-blue-600 dark:text-blue-400'
                  )} 
                  style={{ pointerEvents: 'none' }}
                />
                {item.showBadge && cartCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 text-[10px] pointer-events-none"
                    style={{ pointerEvents: 'none' }}
                  >
                    {cartCount}
                  </Badge>
                )}
              </div>
              <span className="text-xs font-medium leading-none pointer-events-none" style={{ pointerEvents: 'none' }}>
                {item.label}
              </span>
              {/* Active indicator */}
              {isActive && (
                <div 
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full pointer-events-none" 
                  style={{ pointerEvents: 'none' }}
                />
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

