import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useI18n } from '../../contexts/I18nContext'
import { Home, Search, Calendar, Heart, User } from 'lucide-react'
import { cn } from '../../lib/utils'

export function MobileNav() {
  const location = useLocation()
  const { t } = useI18n()

  const navItems = [
    { path: '/', icon: Home, label: t('nav.home') },
    { path: '/restaurants', icon: Search, label: t('nav.restaurants') },
    { path: '/profile', icon: Calendar, label: t('nav.myBookings') },
    { path: '/loyalty', icon: Heart, label: t('nav.loyalty') },
    { path: '/profile', icon: User, label: t('nav.profile') },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
