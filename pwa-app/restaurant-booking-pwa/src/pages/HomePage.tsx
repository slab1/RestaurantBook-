import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore, useRestaurantStore, useLoyaltyStore } from '../store'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { useI18n } from '../contexts/I18nContext'
import {
  Search,
  MapPin,
  Calendar,
  Star,
  Users,
  Smartphone,
  QrCode,
  Heart,
  Gift,
  Award,
  ArrowRight,
  Camera,
  Truck,
  Zap,
} from 'lucide-react'
import { RestaurantCard } from '../components/restaurant/RestaurantCard'

export function HomePage() {
  const { user, isAuthenticated } = useAuthStore()
  const { restaurants, fetchRestaurants } = useRestaurantStore()
  const { fetchLoyaltyInfo } = useLoyaltyStore()
  const { t } = useI18n()
  const navigate = useNavigate()

  useEffect(() => {
    fetchRestaurants()
    if (isAuthenticated) {
      fetchLoyaltyInfo()
    }
  }, [isAuthenticated])

  const featuredRestaurants = restaurants.slice(0, 3)

  const features = [
    {
      icon: Search,
      title: t('features.discover.title'),
      description: t('features.discover.description'),
      color: 'text-blue-500',
    },
    {
      icon: Calendar,
      title: t('features.booking.title'),
      description: t('features.booking.description'),
      color: 'text-green-500',
    },
    {
      icon: QrCode,
      title: t('features.ar.title'),
      description: t('features.ar.description'),
      color: 'text-purple-500',
    },
    {
      icon: Truck,
      title: t('features.delivery.title'),
      description: t('features.delivery.description'),
      color: 'text-orange-500',
    },
  ]

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <div className="mx-auto max-w-4xl space-y-4">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            {t('hero.title')}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
          
          {/* Quick Search */}
          <div className="mx-auto max-w-2xl">
            <Button 
              size="lg" 
              className="w-full md:w-auto"
              onClick={() => navigate('/restaurants')}
            >
              <Search className="mr-2 h-5 w-5" />
              {t('hero.ctaSearch')}
            </Button>
          </div>
        </div>

        {/* Quick Actions for authenticated users */}
        {isAuthenticated && user && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-8">
            <Link to="/restaurants">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <MapPin className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <p className="text-sm font-medium">{t('hero.nearbyRestaurants')}</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/profile">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-sm font-medium">{t('hero.myBookings')}</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/loyalty">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Heart className="h-8 w-8 mx-auto mb-2 text-red-500" />
                  <p className="text-sm font-medium">{t('hero.loyaltyRewards')}</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/language">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Smartphone className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <p className="text-sm font-medium">{t('hero.languageSettings')}</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section>
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
              {t('features.title')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('features.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <Icon className={`h-12 w-12 mx-auto mb-4 ${feature.color}`} />
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Loyalty Program Highlight */}
      {isAuthenticated && (
        <section className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg p-8">
          <div className="mx-auto max-w-4xl text-center space-y-6">
            <div className="flex items-center justify-center space-x-2">
              <Gift className="h-8 w-8 text-primary" />
              <h2 className="text-2xl font-bold">{t('loyalty.hero.title')}</h2>
            </div>
            <p className="text-lg text-muted-foreground">
              {t('loyalty.hero.subtitle')}
            </p>
            {user?.loyaltyTier && (
              <div className="flex items-center justify-center space-x-4">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  <Award className="mr-2 h-5 w-5" />
                  {user.loyaltyTier.name} {t('loyalty.tier')}
                </Badge>
                <Badge variant="outline" className="text-lg px-4 py-2">
                  {user.loyaltyPoints} {t('loyalty.points')}
                </Badge>
              </div>
            )}
            <Link to="/loyalty">
              <Button size="lg">
                {t('loyalty.hero.cta')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Featured Restaurants */}
      <section>
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
                {t('restaurants.featured')}
              </h2>
              <p className="text-lg text-muted-foreground">
                {t('restaurants.featuredSubtitle')}
              </p>
            </div>
            <Link to="/restaurants">
              <Button variant="outline">
                {t('common.viewAll')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted/50 rounded-lg p-8 md:p-12 text-center">
        <div className="mx-auto max-w-2xl space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            {t('cta.title')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link to="/restaurants">
                <Button size="lg" className="w-full sm:w-auto">
                  <Search className="mr-2 h-5 w-5" />
                  {t('cta.exploreRestaurants')}
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    {t('cta.getStarted')}
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    {t('cta.signIn')}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
