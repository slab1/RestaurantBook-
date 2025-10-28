'use client'

import Link from 'next/link'
import { useAuth } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, LogOut, Settings, Calendar, Building2, Zap, ShoppingCart } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { Badge } from '@/components/ui/badge'

export function Navbar() {
  const { user, logout } = useAuth()
  const { getItemCount } = useCart()
  const itemCount = getItemCount()

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Building2 className="h-6 w-6" />
            <span className="text-xl font-bold">RestaurantBook</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link href="/restaurants">
              <Button variant="ghost">Restaurants</Button>
            </Link>

            {user ? (
              <>
                <Link href="/bookings">
                  <Button variant="ghost">
                    <Calendar className="mr-2 h-4 w-4" />
                    My Bookings
                  </Button>
                </Link>

                <Link href="/features">
                  <Button variant="ghost">
                    <Zap className="mr-2 h-4 w-4" />
                    Features
                  </Button>
                </Link>

                <Link href="/cart">
                  <Button variant="ghost" className="relative">
                    <ShoppingCart className="h-4 w-4" />
                    {itemCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {itemCount}
                      </Badge>
                    )}
                  </Button>
                </Link>

                {user.role === 'RESTAURANT_OWNER' && (
                  <Link href="/dashboard">
                    <Button variant="ghost">Dashboard</Button>
                  </Link>
                )}

                {user.role === 'ADMIN' && (
                  <Link href="/admin">
                    <Button variant="ghost">Admin</Button>
                  </Link>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <User className="h-4 w-4" />
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
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/register">
                  <Button>Register</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}