import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SearchBar } from '@/components/restaurant/search-bar'
import { FeaturedRestaurants } from '@/components/restaurant/featured-restaurants'
import { Calendar, MapPin, Star, Users } from 'lucide-react'

export default function HomePage() {
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
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            
            <Card>
              <CardHeader className="text-center">
                <Users className="h-10 w-10 mx-auto mb-2 text-primary" />
                <CardTitle>Group Dining</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Perfect for any group size, from intimate dinners to large parties
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
    </div>
  )
}