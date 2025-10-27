import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore, useNotificationStore, useUIStore } from '../../store'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback } from '../ui/avatar'
import {
  Building2,
  User,
  Calendar,
  Settings,
  Bell,
  LogOut,
  Search,
  MapPin,
  Heart,
} from 'lucide-react'
import { useI18n } from '../../contexts/I18nContext'

interface NavbarProps {
  showLogo?: boolean
}

export function Navbar({ showLogo = false }: NavbarProps) {
  const { user, logout } = useAuthStore()
  const { unreadCount } = useNotificationStore()
  const navigate = useNavigate()
  const { t } = useI18n()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          {(showLogo || !user) && (
            <Link to="/" className="flex items-center space-x-2">
              <Building2 className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">RestaurantBook</span>
            </Link>
          )}

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/restaurants">
                <Button variant="ghost">
                  <Search className="mr-2 h-4 w-4" />
                  {t('nav.restaurants')}
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="ghost">
                  <Calendar className="mr-2 h-4 w-4" />
                  {t('nav.myBookings')}
                </Button>
              </Link>
              <Link to="/loyalty">
                <Button variant="ghost">
                  <Heart className="mr-2 h-4 w-4" />
                  {t('nav.loyalty')}
                </Button>
              </Link>
            </div>
          )}

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Notifications */}
                <Link to="/notifications">
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </Link>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                        {user.loyaltyPoints !== undefined && (
                          <p className="text-xs text-primary">
                            {user.loyaltyPoints} {t('loyalty.points')}
                          </p>
                        )}
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>{t('nav.profile')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/loyalty')}>
                      <Heart className="mr-2 h-4 w-4" />
                      <span>{t('nav.loyalty')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>{t('nav.settings')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t('auth.logout')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost">{t('auth.login')}</Button>
                </Link>
                <Link to="/register">
                  <Button>{t('auth.register')}</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
