'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SearchBar } from '@/components/restaurant/search-bar'
import { FeaturedRestaurants } from '@/components/restaurant/featured-restaurants'
import { Calendar, MapPin, Star, Users, QrCode, Bell, Camera, X } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { useAuth } from '@/components/providers/auth-provider'
import { QrScannerComponent } from '@/components/qr-scanner'

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [lastScannedData, setLastScannedData] = useState<string | null>(null)

  const handleEnableNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setNotificationsEnabled(true)
        toast({
          title: 'Notifications enabled!',
          description: 'You\'ll now receive booking updates and special offers.',
        })
        
        // Send test notification
        new Notification('Welcome to RestaurantBook!', {
          body: 'Notifications are now active.',
          icon: '/icons/icon-192x192.png'
        })
      } else {
        toast({
          title: 'Notifications blocked',
          description: 'Please enable notifications in your browser settings.',
          variant: 'destructive',
        })
      }
    } else {
      toast({
        title: 'Notifications not supported',
        description: 'Your browser doesn\'t support notifications.',
        variant: 'destructive',
      })
    }
  }

  const handleQRScan = () => {
    if ('mediaDevices' in navigator && navigator.mediaDevices.getUserMedia) {
      setShowQRScanner(true)
      setLastScannedData(null)
    } else {
      toast({
        title: 'Camera not available',
        description: 'Camera access is required for QR scanning.',
        variant: 'destructive',
      })
    }
  }

  const handleQRScanResult = (data: string) => {
    setLastScannedData(data)
    
    // Check if it's a restaurant URL
    try {
      const url = new URL(data)
      if (url.hostname.includes('restaurant') || url.pathname.includes('/restaurant/')) {
        toast({
          title: 'Restaurant QR Code!',
          description: 'Redirecting to restaurant page...',
        })
        // Navigate to the restaurant page
        router.push(url.pathname)
      } else {
        toast({
          title: 'QR Code Scanned',
          description: 'Content: ' + data.substring(0, 50) + (data.length > 50 ? '...' : ''),
        })
      }
    } catch {
      // Not a URL, just show the content
      toast({
        title: 'QR Code Scanned',
        description: 'Content: ' + data.substring(0, 50) + (data.length > 50 ? '...' : ''),
      })
    }
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center">
        <div className="mx-auto max-w-4xl space-y-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Discover and Book Amazing Restaurants
          </h1>
          <p className="text-lg text-muted-foreground">
            Find the perfect dining experience for any occasion. Book tables at your
            favorite restaurants with just a few clicks.
          </p>
          <div className="flex justify-center">
            <Link href="/restaurants">
              <Button size="lg" className="mr-4">
                Browse Restaurants
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="mx-auto max-w-4xl">
        <SearchBar />
      </section>

      {/* Features Section */}
      <section>
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Why Choose RestaurantBook?
            </h2>
            <p className="text-lg text-muted-foreground">
              The easiest way to discover and book restaurant tables
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleQRScan}>
              <CardHeader className="text-center">
                <QrCode className="h-10 w-10 mx-auto mb-2 text-primary" />
                <CardTitle>Scan QR Code</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Scan restaurant QR codes to view menus and make instant reservations
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleEnableNotifications}>
              <CardHeader className="text-center">
                <Bell className="h-10 w-10 mx-auto mb-2 text-primary" />
                <CardTitle>
                  {notificationsEnabled ? 'Notifications On' : 'Enable Notifications'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  {notificationsEnabled 
                    ? 'You\'ll receive booking confirmations and special offers'
                    : 'Get notified about bookings and exclusive offers'
                  }
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/nearby')}>
              <CardHeader className="text-center">
                <Camera className="h-10 w-10 mx-auto mb-2 text-primary" />
                <CardTitle>AR Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  View restaurants in augmented reality for immersive dining experiences
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="text-center">
                <MapPin className="h-10 w-10 mx-auto mb-2 text-primary" />
                <CardTitle>Find Nearby</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Discover restaurants near you with our location-based search
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="text-center">
                <Calendar className="h-10 w-10 mx-auto mb-2 text-primary" />
                <CardTitle>Easy Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Book tables instantly with real-time availability
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="text-center">
                <Star className="h-10 w-10 mx-auto mb-2 text-primary" />
                <CardTitle>Reviews & Ratings</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Read authentic reviews from verified diners
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Restaurants Section */}
      <section>
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Featured Restaurants
            </h2>
            <p className="text-lg text-muted-foreground">
              Popular dining destinations in your area
            </p>
          </div>
          
          <FeaturedRestaurants />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted/50 rounded-lg p-12 text-center">
        <div className="mx-auto max-w-2xl space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to Start Dining?
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of food lovers who trust RestaurantBook for their dining reservations.
          </p>
          <Link href="/restaurants">
            <Button size="lg">
              Explore Restaurants
            </Button>
          </Link>
        </div>
      </section>

      {/* QR Scanner Dialog */}
      <Dialog open={showQRScanner} onOpenChange={setShowQRScanner}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Scan QR Code</DialogTitle>
          </DialogHeader>
          <QrScannerComponent
            onResult={handleQRScanResult}
            onClose={() => setShowQRScanner(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}