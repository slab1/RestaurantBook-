'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { EnhancedBookingForm, EnhancedBookingFormData } from '@/components/booking/enhanced-booking-form'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/components/providers/auth-provider'
import { 
  MapPin, 
  Clock, 
  Phone, 
  Globe, 
  Star, 
  Calendar,
  Share2, 
  Heart,
  ArrowLeft,
  Camera,
  Users,
  ChefHat,
  Wifi,
  Car,
  CreditCard,
  CheckCircle,
  MessageCircle,
  DollarSign,
  Clock3,
  MapIcon,
  ExternalLink
} from 'lucide-react'
import { motion } from 'framer-motion'
import axios from 'axios'

// Extended restaurant interface with detailed information
interface RestaurantDetail {
  id: string
  name: string
  description: string
  address: string
  cuisine: string
  priceRange: string
  rating: number
  imageUrl: string
  gallery: string[]
  phone: string
  website: string
  email: string
  hours: {
    [key: string]: { open: string; close: string; closed?: boolean }
  }
  features: string[]
  popularDishes: {
    id: string
    name: string
    description: string
    price: number
    image: string
    category: string
  }[]
  reviews: {
    id: string
    user: string
    rating: number
    comment: string
    date: string
    verified: boolean
  }[]
  location: {
    lat: number
    lng: number
  }
  _count: {
    reviews: number
  }
  isOpen?: boolean
  nextAvailableTime?: string
  averageWaitTime?: number
  bookingPolicy?: string
}

// Mock detailed restaurant data based on featured restaurants
const mockRestaurantDetails: { [key: string]: RestaurantDetail } = {
  '1': {
    id: '1',
    name: 'The Golden Spoon',
    description: 'The Golden Spoon offers an exceptional fine dining experience with contemporary cuisine that celebrates both local and international flavors. Our award-winning chef crafts each dish with precision and passion, using only the finest ingredients sourced from local farms and premium suppliers.',
    address: '123 Main Street, Downtown',
    cuisine: 'Contemporary',
    priceRange: '$$$',
    rating: 4.8,
    imageUrl: '/imgs/elegant_fine_dining_restaurant_interior_wooden_decor.jpg',
    gallery: [
      '/imgs/elegant_fine_dining_restaurant_interior_wooden_decor.jpg',
      '/imgs/elegant_upscale_fine_dining_restaurant_interior.jpg',
      '/imgs/luxury_restaurant_interior_golden_chandelier_elegant_setting.jpg',
      '/imgs/elegant_asian_fine_dining_restaurant_interior_luxury_decor.jpg'
    ],
    phone: '+1 (555) 123-4567',
    website: 'https://thegoldenspoon.com',
    email: 'reservations@thegoldenspoon.com',
    hours: {
      monday: { open: '17:00', close: '22:00' },
      tuesday: { open: '17:00', close: '22:00' },
      wednesday: { open: '17:00', close: '22:00' },
      thursday: { open: '17:00', close: '22:30' },
      friday: { open: '17:00', close: '23:00' },
      saturday: { open: '16:30', close: '23:00' },
      sunday: { open: '16:30', close: '21:30' }
    },
    features: ['Fine Dining', 'Wine Bar', 'Private Dining', 'Valet Parking', 'Wheelchair Accessible', 'WiFi'],
    popularDishes: [
      {
        id: '1',
        name: 'Wagyu Beef Tenderloin',
        description: 'Premium wagyu beef with truffle mashed potatoes and seasonal vegetables',
        price: 85,
        image: '/imgs/elegant_fine_dining_restaurant_interior_wooden_decor.jpg',
        category: 'Main Course'
      },
      {
        id: '2', 
        name: 'Pan-Seared Scallops',
        description: 'Fresh diver scallops with cauliflower purée and pancetta',
        price: 42,
        image: '/imgs/elegant_upscale_fine_dining_restaurant_interior.jpg',
        category: 'Appetizer'
      },
      {
        id: '3',
        name: 'Chocolate Soufflé',
        description: 'Dark chocolate soufflé with vanilla ice cream and berry compote',
        price: 18,
        image: '/imgs/luxury_restaurant_interior_golden_chandelier_elegant_setting.jpg',
        category: 'Dessert'
      }
    ],
    reviews: [
      {
        id: '1',
        user: 'Sarah M.',
        rating: 5,
        comment: 'Absolutely outstanding! The wagyu beef was perfectly cooked and the service was impeccable. Will definitely return for special occasions.',
        date: '2025-10-20',
        verified: true
      },
      {
        id: '2',
        user: 'Michael R.',
        rating: 5,
        comment: 'The Golden Spoon exceeded all expectations. Every course was a masterpiece. The wine pairing was perfect too.',
        date: '2025-10-18',
        verified: true
      },
      {
        id: '3',
        user: 'Jennifer L.',
        rating: 4,
        comment: 'Beautiful atmosphere and excellent food. The chocolate soufflé was divine. Slightly pricey but worth it for the experience.',
        date: '2025-10-15',
        verified: true
      }
    ],
    location: { lat: 40.7128, lng: -74.0060 },
    _count: { reviews: 127 },
    isOpen: true,
    nextAvailableTime: '7:00 PM',
    averageWaitTime: 15,
    bookingPolicy: 'Reservations recommended. 24-hour cancellation policy. Smart casual dress code required.'
  },
  '2': {
    id: '2',
    name: 'Bella Vista',
    description: 'Bella Vista brings authentic Italian cuisine to the heart of Little Italy. Our family recipes have been passed down through generations, creating traditional dishes with a modern presentation that honors our Italian heritage.',
    address: '456 Oak Avenue, Little Italy',
    cuisine: 'Italian',
    priceRange: '$$',
    rating: 4.6,
    imageUrl: '/imgs/delicious_authentic_italian_spaghetti_pasta_fork.jpg',
    gallery: [
      '/imgs/delicious_authentic_italian_spaghetti_pasta_fork.jpg',
      '/imgs/authentic_italian_pasta_dinner_wine_cozy_setting.jpg',
      '/imgs/gourmet_italian_pasta_dish_white_wine_restaurant.jpg',
      '/imgs/delicious_shrimp_pasta_outdoor_dining_italian.jpg'
    ],
    phone: '+1 (555) 234-5678',
    website: 'https://bellavista.com',
    email: 'info@bellavista.com',
    hours: {
      monday: { closed: true },
      tuesday: { open: '11:30', close: '22:00' },
      wednesday: { open: '11:30', close: '22:00' },
      thursday: { open: '11:30', close: '22:00' },
      friday: { open: '11:30', close: '23:00' },
      saturday: { open: '11:30', close: '23:00' },
      sunday: { open: '12:00', close: '21:00' }
    },
    features: ['Outdoor Seating', 'Wine Selection', 'Family-Friendly', 'Takeout', 'WiFi', 'Live Music'],
    popularDishes: [
      {
        id: '1',
        name: 'Spaghetti Carbonara',
        description: 'Traditional Roman pasta with eggs, pancetta, and Pecorino Romano',
        price: 18,
        image: '/imgs/delicious_authentic_italian_spaghetti_pasta_fork.jpg',
        category: 'Pasta'
      },
      {
        id: '2',
        name: 'Osso Buco',
        description: 'Braised veal shanks with risotto Milanese and gremolata',
        price: 32,
        image: '/imgs/authentic_italian_pasta_dinner_wine_cozy_setting.jpg',
        category: 'Main Course'
      },
      {
        id: '3',
        name: 'Tiramisu',
        description: 'Classic Italian dessert with espresso-soaked ladyfingers and mascarpone',
        price: 12,
        image: '/imgs/gourmet_italian_pasta_dish_white_wine_restaurant.jpg',
        category: 'Dessert'
      }
    ],
    reviews: [
      {
        id: '1',
        user: 'Marco T.',
        rating: 5,
        comment: 'As an Italian, I can say this is authentic! The carbonara was exactly like my nonna used to make. Bellissimo!',
        date: '2025-10-22',
        verified: true
      },
      {
        id: '2',
        user: 'Lisa K.',
        rating: 4,
        comment: 'Lovely atmosphere and delicious food. The outdoor seating is perfect for a romantic dinner. Great wine selection.',
        date: '2025-10-19',
        verified: true
      }
    ],
    location: { lat: 40.7189, lng: -74.0021 },
    _count: { reviews: 89 },
    isOpen: true,
    nextAvailableTime: '6:30 PM',
    averageWaitTime: 20
  },
  '3': {
    id: '3',
    name: 'Sakura Sushi',
    description: 'Sakura Sushi offers an authentic Japanese dining experience with the freshest fish and traditional preparation methods. Our master sushi chef brings decades of experience from Tokyo to create exquisite sushi and sashimi.',
    address: '789 Cherry Blossom Road',
    cuisine: 'Japanese',
    priceRange: '$$',
    rating: 4.7,
    imageUrl: '/imgs/modern_japanese_sushi_restaurant_bar_chefs.jpg',
    gallery: [
      '/imgs/modern_japanese_sushi_restaurant_bar_chefs.jpg',
      '/imgs/modern_japanese_sushi_restaurant_chef_counter.jpg',
      '/imgs/modern_japanese_sushi_restaurant_chef_presentation.jpg'
    ],
    phone: '+1 (555) 345-6789',
    website: 'https://sakurasushi.com',
    email: 'reservations@sakurasushi.com',
    hours: {
      monday: { open: '17:00', close: '22:00' },
      tuesday: { open: '17:00', close: '22:00' },
      wednesday: { open: '17:00', close: '22:00' },
      thursday: { open: '17:00', close: '22:30' },
      friday: { open: '17:00', close: '23:00' },
      saturday: { open: '16:00', close: '23:00' },
      sunday: { open: '16:00', close: '21:00' }
    },
    features: ['Sushi Bar', 'Private Rooms', 'Sake Selection', 'Fresh Fish Daily', 'Chef\'s Omakase', 'WiFi'],
    popularDishes: [
      {
        id: '1',
        name: 'Omakase Experience',
        description: 'Chef\'s choice selection of the finest seasonal sushi and sashimi',
        price: 75,
        image: '/imgs/modern_japanese_sushi_restaurant_chef_presentation.jpg',
        category: 'Tasting Menu'
      },
      {
        id: '2',
        name: 'Chirashi Bowl',
        description: 'Assorted fresh sashimi over seasoned sushi rice',
        price: 28,
        image: '/imgs/modern_japanese_sushi_restaurant_bar_chefs.jpg',
        category: 'Rice Bowls'
      },
      {
        id: '3',
        name: 'Miso Black Cod',
        description: 'Marinated black cod with sweet miso glaze',
        price: 35,
        image: '/imgs/modern_japanese_sushi_restaurant_chef_counter.jpg',
        category: 'Hot Dishes'
      }
    ],
    reviews: [
      {
        id: '1',
        user: 'David W.',
        rating: 5,
        comment: 'The omakase was incredible! Each piece was a work of art. Chef Tanaka is truly a master of his craft.',
        date: '2025-10-21',
        verified: true
      },
      {
        id: '2',
        user: 'Amanda S.',
        rating: 5,
        comment: 'Fresh, authentic, and beautifully presented. The atmosphere at the sushi bar is amazing to watch the chefs work.',
        date: '2025-10-17',
        verified: true
      }
    ],
    location: { lat: 40.7282, lng: -73.9942 },
    _count: { reviews: 156 },
    isOpen: true,
    nextAvailableTime: '8:00 PM',
    averageWaitTime: 25
  },
  '4': {
    id: '4',
    name: 'The Cozy Corner',
    description: 'The Cozy Corner is your neighborhood comfort food destination, serving hearty American classics in a warm, family-friendly atmosphere. From our famous fried chicken to homemade pies, every dish is made with love.',
    address: '321 Elm Street, Residential District',
    cuisine: 'American',
    priceRange: '$',
    rating: 4.4,
    imageUrl: '/imgs/american_comfort_food_feast_family_restaurant.jpg',
    gallery: [
      '/imgs/american_comfort_food_feast_family_restaurant.jpg',
      '/imgs/american_comfort_food_fried_chicken_mac_n_cheese_biscuits_family_meal.jpg',
      '/imgs/family_friendly_american_comfort_food_spread.jpg'
    ],
    phone: '+1 (555) 456-7890',
    website: 'https://thecozycorner.com',
    email: 'hello@thecozycorner.com',
    hours: {
      monday: { open: '07:00', close: '21:00' },
      tuesday: { open: '07:00', close: '21:00' },
      wednesday: { open: '07:00', close: '21:00' },
      thursday: { open: '07:00', close: '21:00' },
      friday: { open: '07:00', close: '22:00' },
      saturday: { open: '08:00', close: '22:00' },
      sunday: { open: '08:00', close: '20:00' }
    },
    features: ['Family-Friendly', 'Kids Menu', 'Takeout', 'Delivery', 'Parking', 'WiFi', 'Breakfast All Day'],
    popularDishes: [
      {
        id: '1',
        name: 'Southern Fried Chicken',
        description: 'Crispy fried chicken with mashed potatoes, gravy, and corn bread',
        price: 16,
        image: '/imgs/american_comfort_food_fried_chicken_mac_n_cheese_biscuits_family_meal.jpg',
        category: 'Main Course'
      },
      {
        id: '2',
        name: 'Classic Cheeseburger',
        description: 'Juicy beef patty with cheese, lettuce, tomato, and our secret sauce',
        price: 14,
        image: '/imgs/american_comfort_food_feast_family_restaurant.jpg',
        category: 'Burgers'
      },
      {
        id: '3',
        name: 'Apple Pie à la Mode',
        description: 'Homemade apple pie with vanilla ice cream and caramel drizzle',
        price: 8,
        image: '/imgs/family_friendly_american_comfort_food_spread.jpg',
        category: 'Dessert'
      }
    ],
    reviews: [
      {
        id: '1',
        user: 'Jessica P.',
        rating: 5,
        comment: 'Perfect family spot! The kids loved the chicken and the service was so friendly. The apple pie is to die for!',
        date: '2025-10-23',
        verified: true
      },
      {
        id: '2',
        user: 'Tom B.',
        rating: 4,
        comment: 'Great comfort food at reasonable prices. The portions are generous and everything tastes homemade.',
        date: '2025-10-20',
        verified: true
      }
    ],
    location: { lat: 40.7451, lng: -73.9903 },
    _count: { reviews: 203 },
    isOpen: true,
    nextAvailableTime: '5:30 PM',
    averageWaitTime: 10
  },
  '5': {
    id: '5',
    name: 'Spice Route',
    description: 'Spice Route takes you on a culinary journey through India with authentic recipes and traditional cooking methods. Our spices are imported directly from India, and our chefs bring generations of family knowledge to every dish.',
    address: '654 Curry Lane, Spice District',
    cuisine: 'Indian',
    priceRange: '$$',
    rating: 4.5,
    imageUrl: '/imgs/authentic_indian_chicken_tikka_masala_rice_naan.jpg',
    gallery: [
      '/imgs/authentic_indian_chicken_tikka_masala_rice_naan.jpg',
      '/imgs/authentic_indian_fish_curry_spices_rice_naan.jpg',
      '/imgs/six_most_popular_indian_curry_types_infographic_little_india.jpg'
    ],
    phone: '+1 (555) 567-8901',
    website: 'https://spiceroute.com',
    email: 'orders@spiceroute.com',
    hours: {
      monday: { open: '11:30', close: '22:00' },
      tuesday: { open: '11:30', close: '22:00' },
      wednesday: { open: '11:30', close: '22:00' },
      thursday: { open: '11:30', close: '22:00' },
      friday: { open: '11:30', close: '22:30' },
      saturday: { open: '11:30', close: '22:30' },
      sunday: { open: '12:00', close: '21:30' }
    },
    features: ['Vegetarian Options', 'Vegan Options', 'Spice Levels', 'Tandoor Oven', 'Takeout', 'Delivery', 'Catering'],
    popularDishes: [
      {
        id: '1',
        name: 'Chicken Tikka Masala',
        description: 'Tender chicken in creamy tomato curry sauce with basmati rice and naan',
        price: 18,
        image: '/imgs/authentic_indian_chicken_tikka_masala_rice_naan.jpg',
        category: 'Curry'
      },
      {
        id: '2',
        name: 'Fish Curry',
        description: 'Fresh fish in coconut curry with aromatic spices, rice, and naan',
        price: 20,
        image: '/imgs/authentic_indian_fish_curry_spices_rice_naan.jpg',
        category: 'Curry'
      },
      {
        id: '3',
        name: 'Tandoori Mixed Grill',
        description: 'Assorted meats marinated in yogurt and spices, cooked in tandoor oven',
        price: 24,
        image: '/imgs/six_most_popular_indian_curry_types_infographic_little_india.jpg',
        category: 'Tandoori'
      }
    ],
    reviews: [
      {
        id: '1',
        user: 'Priya S.',
        rating: 5,
        comment: 'Authentic Indian flavors! The tikka masala reminded me of home. Great vegetarian options too.',
        date: '2025-10-22',
        verified: true
      },
      {
        id: '2',
        user: 'John D.',
        rating: 4,
        comment: 'Excellent spices and very flavorful. The staff helped me choose the right spice level. Will be back!',
        date: '2025-10-19',
        verified: true
      }
    ],
    location: { lat: 40.7359, lng: -73.9911 },
    _count: { reviews: 98 },
    isOpen: true,
    nextAvailableTime: '7:30 PM',
    averageWaitTime: 15
  },
  '6': {
    id: '6',
    name: 'Le Petit Bistro',
    description: 'Le Petit Bistro offers an intimate French dining experience with classic dishes prepared using traditional techniques. Our wine selection features carefully curated French vintages to complement every meal.',
    address: '987 Wine Street, French Quarter',
    cuisine: 'French',
    priceRange: '$$$',
    rating: 4.9,
    imageUrl: '/imgs/elegant_french_bistro_wine_atmosphere.jpg',
    gallery: [
      '/imgs/elegant_french_bistro_wine_atmosphere.jpg',
      '/imgs/classic_french_bistro_elegant_dining_room.jpg',
      '/imgs/elegant_french_bistro_wine_bar.jpg',
      '/imgs/intimate_french_wine_tasting_bistro_atmosphere.jpg'
    ],
    phone: '+1 (555) 678-9012',
    website: 'https://lepetitbistro.com',
    email: 'reservations@lepetitbistro.com',
    hours: {
      monday: { closed: true },
      tuesday: { open: '17:30', close: '22:00' },
      wednesday: { open: '17:30', close: '22:00' },
      thursday: { open: '17:30', close: '22:00' },
      friday: { open: '17:30', close: '22:30' },
      saturday: { open: '17:30', close: '22:30' },
      sunday: { open: '17:00', close: '21:00' }
    },
    features: ['Wine Cellar', 'Sommelier', 'Private Dining', 'French Cheese Selection', 'Romantic Setting', 'WiFi'],
    popularDishes: [
      {
        id: '1',
        name: 'Coq au Vin',
        description: 'Classic braised chicken in red wine with pearl onions and mushrooms',
        price: 32,
        image: '/imgs/classic_french_bistro_elegant_dining_room.jpg',
        category: 'Main Course'
      },
      {
        id: '2',
        name: 'Escargots de Bourgogne',
        description: 'Traditional Burgundy snails with garlic herb butter',
        price: 16,
        image: '/imgs/elegant_french_bistro_wine_bar.jpg',
        category: 'Appetizer'
      },
      {
        id: '3',
        name: 'Crème Brûlée',
        description: 'Vanilla custard with caramelized sugar crust',
        price: 12,
        image: '/imgs/intimate_french_wine_tasting_bistro_atmosphere.jpg',
        category: 'Dessert'
      }
    ],
    reviews: [
      {
        id: '1',
        user: 'Marie L.',
        rating: 5,
        comment: 'Magnifique! The coq au vin was perfection and the wine pairing was exceptional. Très authentique!',
        date: '2025-10-21',
        verified: true
      },
      {
        id: '2',
        user: 'Robert M.',
        rating: 5,
        comment: 'Incredible French cuisine and ambiance. The sommelier\'s recommendations were spot on. A true gem.',
        date: '2025-10-18',
        verified: true
      }
    ],
    location: { lat: 40.7505, lng: -73.9934 },
    _count: { reviews: 76 },
    isOpen: false,
    nextAvailableTime: '5:30 PM Tomorrow',
    averageWaitTime: 30,
    bookingPolicy: 'Reservations required. Smart casual dress code. Wine corkage fee $25.'
  }
}

interface RestaurantDetailClientProps {
  restaurantId: string
}

export default function RestaurantDetailClient({ restaurantId }: RestaurantDetailClientProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showGallery, setShowGallery] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)

  useEffect(() => {
    // Simulate API call with mock data
    const timer = setTimeout(() => {
      const restaurantData = mockRestaurantDetails[restaurantId]
      if (restaurantData) {
        setRestaurant(restaurantData)
      }
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [restaurantId])

  const handleBooking = async (bookingData: EnhancedBookingFormData) => {
    try {
      // Handle booking submission
      const response = await axios.post('/api/bookings', {
        ...bookingData,
        restaurantId: restaurant?.id,
      })
      
      setShowBookingForm(false)
      
      toast({
        title: 'Booking Confirmed!',
        description: `Your table has been booked at ${restaurant?.name}`,
      })
      
      router.push('/bookings')
    } catch (error) {
      throw new Error('Booking failed')
    }
  }

  const handleShare = async () => {
    if (restaurant) {
      if (navigator.share) {
        try {
          await navigator.share({
            title: restaurant.name,
            text: `Check out ${restaurant.name} - ${restaurant.cuisine} cuisine`,
            url: `${window.location.origin}/restaurants/${restaurantId}`,
          })
        } catch (error) {
          // Share canceled or failed
        }
      } else {
        // Fallback to copying URL
        await navigator.clipboard.writeText(`${window.location.origin}/restaurants/${restaurantId}`)
        toast({
          title: 'Link Copied',
          description: 'Restaurant link has been copied to clipboard',
        })
      }
    }
  }

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited)
    toast({
      title: isFavorited ? 'Removed from Favorites' : 'Added to Favorites',
      description: isFavorited 
        ? `${restaurant?.name} removed from your favorites` 
        : `${restaurant?.name} added to your favorites`,
    })
  }

  const getCurrentDay = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    return days[new Date().getDay()]
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const openMap = () => {
    if (restaurant?.location) {
      const { lat, lng } = restaurant.location
      const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
      window.open(url, '_blank')
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'fill-yellow-400 text-yellow-400' 
            : i < rating 
            ? 'fill-yellow-200 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse">
          <div className="h-64 md:h-80 bg-muted" />
          <div className="container mx-auto px-4 py-8">
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-1/2" />
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Restaurant Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The restaurant you're looking for doesn't exist.
          </p>
          <Button onClick={() => router.push('/restaurants')}>
            Browse All Restaurants
          </Button>
        </div>
      </div>
    )
  }

  const currentDay = getCurrentDay()
  const todayHours = restaurant.hours[currentDay]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Image Gallery */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <Image
          src={restaurant.gallery[selectedImageIndex]}
          alt={restaurant.name}
          fill
          className="object-cover"
          unoptimized
          priority
        />
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Navigation Controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="bg-white/90 hover:bg-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFavorite}
              className="bg-white/90 hover:bg-white"
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="bg-white/90 hover:bg-white"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Gallery Navigation */}
        {restaurant.gallery.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {restaurant.gallery.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === selectedImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Gallery Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowGallery(true)}
          className="absolute bottom-4 right-4 bg-white/90 hover:bg-white"
        >
          <Camera className="w-4 h-4 mr-2" />
          View Gallery ({restaurant.gallery.length})
        </Button>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Restaurant Header */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{restaurant.name}</h1>
                  <div className="flex items-center gap-4 text-muted-foreground mb-2">
                    <Badge variant="secondary">{restaurant.cuisine}</Badge>
                    <span className="text-lg font-semibold text-green-600">{restaurant.priceRange}</span>
                    <div className="flex items-center gap-1">
                      {renderStars(restaurant.rating)}
                      <span className="font-medium">{restaurant.rating}</span>
                      <span>({restaurant._count.reviews} reviews)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${restaurant.isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className={restaurant.isOpen ? 'text-green-600' : 'text-red-600'}>
                      {restaurant.isOpen ? 'Open now' : 'Closed'}
                    </span>
                    {restaurant.nextAvailableTime && (
                      <span className="text-muted-foreground">
                        • Next available: {restaurant.nextAvailableTime}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <p className="text-muted-foreground leading-relaxed">
                {restaurant.description}
              </p>
            </div>

            {/* Quick Info Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Clock3 className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Average Wait</p>
                      <p className="text-sm text-muted-foreground">
                        {restaurant.averageWaitTime} minutes
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">Price Range</p>
                      <p className="text-sm text-muted-foreground">
                        {restaurant.priceRange === '$' && '$10-25 per person'}
                        {restaurant.priceRange === '$$' && '$25-50 per person'}
                        {restaurant.priceRange === '$$$' && '$50-100 per person'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Popular Dishes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="w-5 h-5" />
                  Popular Dishes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {restaurant.popularDishes.map((dish) => (
                    <div key={dish.id} className="flex gap-3 p-3 border rounded-lg">
                      <Image
                        src={dish.image}
                        alt={dish.name}
                        width={80}
                        height={80}
                        className="rounded-lg object-cover"
                        unoptimized
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{dish.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {dish.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline" className="text-xs">
                            {dish.category}
                          </Badge>
                          <span className="font-semibold">${dish.price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => router.push(`/restaurants/${restaurantId}/menu`)}
                >
                  View Full Menu
                </Button>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Customer Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {restaurant.reviews
                    .slice(0, showAllReviews ? restaurant.reviews.length : 3)
                    .map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{review.user}</span>
                            {review.verified && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>
                
                {restaurant.reviews.length > 3 && (
                  <Button
                    variant="outline"
                    onClick={() => setShowAllReviews(!showAllReviews)}
                    className="w-full mt-4"
                  >
                    {showAllReviews ? 'Show Less' : `View All ${restaurant.reviews.length} Reviews`}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Make a Reservation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => setShowBookingForm(true)}
                  className="w-full"
                  size="lg"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book a Table
                </Button>
                
                {restaurant.bookingPolicy && (
                  <p className="text-xs text-muted-foreground">
                    {restaurant.bookingPolicy}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Contact & Hours */}
            <Card>
              <CardHeader>
                <CardTitle>Contact & Hours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Address */}
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm">{restaurant.address}</p>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0 h-auto text-xs"
                      onClick={openMap}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View on Map
                    </Button>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <a href={`tel:${restaurant.phone}`} className="text-sm hover:underline">
                    {restaurant.phone}
                  </a>
                </div>

                {/* Website */}
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                  <a 
                    href={restaurant.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm hover:underline"
                  >
                    Visit Website
                  </a>
                </div>

                <Separator />

                {/* Hours */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">Hours</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    {Object.entries(restaurant.hours).map(([day, hours]) => (
                      <div 
                        key={day} 
                        className={`flex justify-between ${
                          day === currentDay ? 'font-medium text-primary' : 'text-muted-foreground'
                        }`}
                      >
                        <span className="capitalize">{day}</span>
                        <span>
                          {hours.closed ? 'Closed' : `${formatTime(hours.open)} - ${formatTime(hours.close)}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>Features & Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {restaurant.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Form Dialog */}
      <Dialog open={showBookingForm} onOpenChange={setShowBookingForm}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <EnhancedBookingForm
            restaurantName={restaurant.name}
            restaurantId={restaurant.id}
            onSubmit={handleBooking}
            onCancel={() => setShowBookingForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Gallery Dialog */}
      <Dialog open={showGallery} onOpenChange={setShowGallery}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="relative">
            <Image
              src={restaurant.gallery[selectedImageIndex]}
              alt={`${restaurant.name} - Image ${selectedImageIndex + 1}`}
              width={800}
              height={600}
              className="w-full h-auto object-cover rounded-lg"
              unoptimized
            />
            
            {/* Gallery Navigation */}
            <div className="flex justify-center gap-2 mt-4">
              {restaurant.gallery.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    index === selectedImageIndex ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <Image
                    src={restaurant.gallery[index]}
                    alt={`Gallery ${index + 1}`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}