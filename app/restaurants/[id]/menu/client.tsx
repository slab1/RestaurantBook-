'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Search, Filter, Heart, Star, Clock, Leaf, AlertTriangle, Tag, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: 'appetizers' | 'mains' | 'desserts' | 'drinks'
  dietary: string[]
  allergens: string[]
  isSpecial: boolean
  isPopular: boolean
  cookingTime: number
  calories?: number
  spiceLevel?: number
  tags: string[]
}

interface Restaurant {
  id: string
  name: string
  cuisine: string
  menu: MenuItem[]
  specialOffers: {
    title: string
    description: string
    discount: number
    validUntil: string
  }[]
}

const mockMenuData: Record<string, Restaurant> = {
  '1': {
    id: '1',
    name: 'The Golden Spoon',
    cuisine: 'Fine Dining',
    specialOffers: [
      {
        title: 'Chef\'s Tasting Menu',
        description: '7-course tasting menu with wine pairing',
        discount: 15,
        validUntil: '2025-11-15'
      }
    ],
    menu: [
      {
        id: '1-1',
        name: 'Truffle Arancini',
        description: 'Crispy risotto balls filled with wild mushrooms and black truffle, served with parmesan aioli',
        price: 18,
        image: '/imgs/truffle-arancini.jpg',
        category: 'appetizers',
        dietary: ['vegetarian'],
        allergens: ['gluten', 'dairy', 'eggs'],
        isSpecial: true,
        isPopular: true,
        cookingTime: 15,
        calories: 320,
        tags: ['signature', 'truffle', 'risotto']
      },
      {
        id: '1-2',
        name: 'Pan-Seared Scallops',
        description: 'Fresh diver scallops with cauliflower purée, pancetta crisps, and micro herbs',
        price: 24,
        image: '/imgs/pan-seared-scallops.jpg',
        category: 'appetizers',
        dietary: [],
        allergens: ['shellfish', 'dairy'],
        isSpecial: false,
        isPopular: true,
        cookingTime: 12,
        calories: 280,
        tags: ['seafood', 'premium']
      },
      {
        id: '1-3',
        name: 'Wagyu Beef Tenderloin',
        description: 'Grade A5 Wagyu beef with roasted bone marrow, seasonal vegetables, and red wine jus',
        price: 85,
        image: '/imgs/wagyu-beef.jpg',
        category: 'mains',
        dietary: [],
        allergens: ['gluten'],
        isSpecial: true,
        isPopular: true,
        cookingTime: 25,
        calories: 650,
        tags: ['wagyu', 'premium', 'signature']
      },
      {
        id: '1-4',
        name: 'Lobster Thermidor',
        description: 'Fresh Atlantic lobster in a rich brandy cream sauce, gratinéed with gruyère cheese',
        price: 68,
        image: '/imgs/lobster-thermidor.jpg',
        category: 'mains',
        dietary: [],
        allergens: ['shellfish', 'dairy', 'gluten', 'eggs'],
        isSpecial: false,
        isPopular: true,
        cookingTime: 30,
        calories: 580,
        tags: ['lobster', 'classic', 'rich']
      },
      {
        id: '1-5',
        name: 'Chocolate Soufflé',
        description: 'Warm dark chocolate soufflé with vanilla bean ice cream and berry coulis',
        price: 16,
        image: '/imgs/chocolate-souffle.jpg',
        category: 'desserts',
        dietary: ['vegetarian'],
        allergens: ['dairy', 'eggs', 'gluten'],
        isSpecial: true,
        isPopular: true,
        cookingTime: 20,
        calories: 420,
        tags: ['chocolate', 'warm', 'signature']
      },
      {
        id: '1-6',
        name: 'Dom Pérignon 2012',
        description: 'Vintage champagne with notes of white fruits and brioche',
        price: 95,
        image: '/imgs/dom-perignon.jpg',
        category: 'drinks',
        dietary: ['vegetarian', 'vegan'],
        allergens: ['sulfites'],
        isSpecial: true,
        isPopular: false,
        cookingTime: 0,
        tags: ['champagne', 'vintage', 'luxury']
      }
    ]
  },
  '2': {
    id: '2',
    name: 'Bella Vista',
    cuisine: 'Italian',
    specialOffers: [
      {
        title: 'Pasta Night',
        description: 'All pasta dishes 20% off every Tuesday',
        discount: 20,
        validUntil: '2025-12-31'
      }
    ],
    menu: [
      {
        id: '2-1',
        name: 'Burrata Caprese',
        description: 'Fresh burrata with heirloom tomatoes, basil pesto, and aged balsamic',
        price: 16,
        image: '/imgs/burrata-caprese.jpg',
        category: 'appetizers',
        dietary: ['vegetarian'],
        allergens: ['dairy'],
        isSpecial: false,
        isPopular: true,
        cookingTime: 8,
        calories: 280,
        tags: ['fresh', 'tomatoes', 'cheese']
      },
      {
        id: '2-2',
        name: 'Osso Buco',
        description: 'Slow-braised veal shanks with saffron risotto milanese and gremolata',
        price: 38,
        image: '/imgs/osso-buco.jpg',
        category: 'mains',
        dietary: [],
        allergens: ['dairy', 'gluten'],
        isSpecial: true,
        isPopular: true,
        cookingTime: 45,
        calories: 720,
        tags: ['traditional', 'slow-cooked', 'risotto']
      },
      {
        id: '2-3',
        name: 'Tiramisu',
        description: 'Classic Italian dessert with mascarpone, espresso, and cocoa',
        price: 12,
        image: '/imgs/tiramisu.jpg',
        category: 'desserts',
        dietary: ['vegetarian'],
        allergens: ['dairy', 'eggs', 'gluten'],
        isSpecial: false,
        isPopular: true,
        cookingTime: 5,
        calories: 380,
        tags: ['classic', 'coffee', 'mascarpone']
      },
      {
        id: '2-4',
        name: 'Chianti Classico',
        description: 'Full-bodied red wine from Tuscany with notes of cherry and herbs',
        price: 12,
        image: '/imgs/chianti-classico.jpg',
        category: 'drinks',
        dietary: ['vegetarian', 'vegan'],
        allergens: ['sulfites'],
        isSpecial: false,
        isPopular: true,
        cookingTime: 0,
        tags: ['wine', 'red', 'tuscan']
      }
    ]
  },
  '3': {
    id: '3',
    name: 'Sakura Sushi',
    cuisine: 'Japanese',
    specialOffers: [
      {
        title: 'Omakase Experience',
        description: 'Chef\'s choice sushi selection - 12 pieces',
        discount: 10,
        validUntil: '2025-11-30'
      }
    ],
    menu: [
      {
        id: '3-1',
        name: 'Tuna Tataki',
        description: 'Seared bluefin tuna with ponzu sauce, daikon radish, and wasabi',
        price: 22,
        image: '/imgs/tuna-tataki.jpg',
        category: 'appetizers',
        dietary: [],
        allergens: ['fish', 'soy'],
        isSpecial: true,
        isPopular: true,
        cookingTime: 10,
        calories: 180,
        tags: ['seared', 'raw', 'bluefin']
      },
      {
        id: '3-2',
        name: 'Chirashi Bowl',
        description: 'Assorted sashimi over seasoned sushi rice with tamago and vegetables',
        price: 32,
        image: '/imgs/chirashi-bowl.jpg',
        category: 'mains',
        dietary: [],
        allergens: ['fish', 'eggs', 'soy'],
        isSpecial: false,
        isPopular: true,
        cookingTime: 15,
        calories: 520,
        tags: ['sashimi', 'rice', 'assorted']
      },
      {
        id: '3-3',
        name: 'Mochi Ice Cream',
        description: 'Traditional Japanese rice cake filled with premium ice cream',
        price: 8,
        image: '/imgs/mochi-ice-cream.jpg',
        category: 'desserts',
        dietary: ['vegetarian'],
        allergens: ['dairy'],
        isSpecial: false,
        isPopular: true,
        cookingTime: 2,
        calories: 120,
        tags: ['traditional', 'sweet', 'cold']
      },
      {
        id: '3-4',
        name: 'Sake Junmai',
        description: 'Premium Japanese rice wine with clean, crisp finish',
        price: 14,
        image: '/imgs/sake-junmai.jpg',
        category: 'drinks',
        dietary: ['vegetarian', 'vegan'],
        allergens: [],
        isSpecial: false,
        isPopular: true,
        cookingTime: 0,
        tags: ['sake', 'premium', 'rice wine']
      }
    ]
  },
  '4': {
    id: '4',
    name: 'The Cozy Corner',
    cuisine: 'American',
    specialOffers: [
      {
        title: 'Sunday Brunch',
        description: 'All-day brunch menu with bottomless mimosas',
        discount: 25,
        validUntil: '2025-12-31'
      }
    ],
    menu: [
      {
        id: '4-1',
        name: 'Buffalo Wings',
        description: 'Classic hot wings with blue cheese dressing and celery sticks',
        price: 14,
        image: '/imgs/buffalo-wings.jpg',
        category: 'appetizers',
        dietary: [],
        allergens: ['dairy'],
        isSpecial: false,
        isPopular: true,
        cookingTime: 12,
        calories: 480,
        spiceLevel: 3,
        tags: ['spicy', 'wings', 'classic']
      },
      {
        id: '4-2',
        name: 'BBQ Burger',
        description: 'Angus beef patty with bacon, cheddar, BBQ sauce, and onion rings',
        price: 18,
        image: '/imgs/bbq-burger.jpg',
        category: 'mains',
        dietary: [],
        allergens: ['gluten', 'dairy'],
        isSpecial: true,
        isPopular: true,
        cookingTime: 15,
        calories: 850,
        tags: ['burger', 'bbq', 'bacon']
      },
      {
        id: '4-3',
        name: 'Apple Pie',
        description: 'Homemade apple pie with vanilla ice cream and caramel sauce',
        price: 9,
        image: '/imgs/apple-pie.jpg',
        category: 'desserts',
        dietary: ['vegetarian'],
        allergens: ['gluten', 'dairy', 'eggs'],
        isSpecial: false,
        isPopular: true,
        cookingTime: 5,
        calories: 420,
        tags: ['homemade', 'apple', 'warm']
      },
      {
        id: '4-4',
        name: 'Craft Beer IPA',
        description: 'Local brewery IPA with citrus and pine notes',
        price: 7,
        image: '/imgs/craft-beer-ipa.jpg',
        category: 'drinks',
        dietary: ['vegetarian', 'vegan'],
        allergens: ['gluten'],
        isSpecial: false,
        isPopular: true,
        cookingTime: 0,
        tags: ['beer', 'ipa', 'local']
      }
    ]
  },
  '5': {
    id: '5',
    name: 'Spice Route',
    cuisine: 'Indian',
    specialOffers: [
      {
        title: 'Curry Combo',
        description: 'Any curry with rice and naan bread',
        discount: 15,
        validUntil: '2025-11-20'
      }
    ],
    menu: [
      {
        id: '5-1',
        name: 'Samosa Chaat',
        description: 'Crispy samosas with chutneys, yogurt, and pomegranate seeds',
        price: 10,
        image: '/imgs/samosa-chaat.jpg',
        category: 'appetizers',
        dietary: ['vegetarian'],
        allergens: ['gluten', 'dairy'],
        isSpecial: false,
        isPopular: true,
        cookingTime: 8,
        calories: 320,
        spiceLevel: 2,
        tags: ['vegetarian', 'crispy', 'chaat']
      },
      {
        id: '5-2',
        name: 'Butter Chicken',
        description: 'Tender chicken in rich tomato cream sauce with basmati rice',
        price: 24,
        image: '/imgs/butter-chicken.jpg',
        category: 'mains',
        dietary: [],
        allergens: ['dairy'],
        isSpecial: true,
        isPopular: true,
        cookingTime: 20,
        calories: 680,
        spiceLevel: 1,
        tags: ['creamy', 'tomato', 'mild']
      },
      {
        id: '5-3',
        name: 'Gulab Jamun',
        description: 'Sweet milk dumplings in cardamom syrup with pistachios',
        price: 8,
        image: '/imgs/gulab-jamun.jpg',
        category: 'desserts',
        dietary: ['vegetarian'],
        allergens: ['dairy', 'nuts'],
        isSpecial: false,
        isPopular: true,
        cookingTime: 5,
        calories: 280,
        tags: ['sweet', 'traditional', 'syrup']
      },
      {
        id: '5-4',
        name: 'Mango Lassi',
        description: 'Traditional yogurt drink with fresh mango and cardamom',
        price: 6,
        image: '/imgs/mango-lassi.jpg',
        category: 'drinks',
        dietary: ['vegetarian'],
        allergens: ['dairy'],
        isSpecial: false,
        isPopular: true,
        cookingTime: 3,
        calories: 180,
        tags: ['yogurt', 'mango', 'refreshing']
      }
    ]
  },
  '6': {
    id: '6',
    name: 'Le Petit Bistro',
    cuisine: 'French',
    specialOffers: [
      {
        title: 'Wine Pairing Dinner',
        description: '3-course dinner with expertly paired French wines',
        discount: 20,
        validUntil: '2025-12-15'
      }
    ],
    menu: [
      {
        id: '6-1',
        name: 'Escargot de Bourgogne',
        description: 'Classic Burgundy snails with garlic herb butter and crusty bread',
        price: 16,
        image: '/imgs/escargot.jpg',
        category: 'appetizers',
        dietary: [],
        allergens: ['dairy', 'gluten'],
        isSpecial: true,
        isPopular: true,
        cookingTime: 12,
        calories: 240,
        tags: ['classic', 'garlic', 'butter']
      },
      {
        id: '6-2',
        name: 'Coq au Vin',
        description: 'Braised chicken in red wine sauce with pearl onions and mushrooms',
        price: 32,
        image: '/imgs/coq-au-vin.jpg',
        category: 'mains',
        dietary: [],
        allergens: ['gluten'],
        isSpecial: true,
        isPopular: true,
        cookingTime: 35,
        calories: 620,
        tags: ['braised', 'wine', 'traditional']
      },
      {
        id: '6-3',
        name: 'Crème Brûlée',
        description: 'Classic vanilla custard with caramelized sugar crust',
        price: 11,
        image: '/imgs/creme-brulee.jpg',
        category: 'desserts',
        dietary: ['vegetarian'],
        allergens: ['dairy', 'eggs'],
        isSpecial: false,
        isPopular: true,
        cookingTime: 8,
        calories: 320,
        tags: ['custard', 'vanilla', 'caramelized']
      },
      {
        id: '6-4',
        name: 'Bordeaux Rouge',
        description: 'Full-bodied red wine with blackcurrant and oak notes',
        price: 18,
        image: '/imgs/bordeaux-rouge.jpg',
        category: 'drinks',
        dietary: ['vegetarian', 'vegan'],
        allergens: ['sulfites'],
        isSpecial: false,
        isPopular: true,
        cookingTime: 0,
        tags: ['wine', 'red', 'bordeaux']
      }
    ]
  }
}

const categoryDisplayNames = {
  appetizers: 'Appetizers',
  mains: 'Main Courses',
  desserts: 'Desserts',
  drinks: 'Beverages'
}

const dietaryIcons = {
  vegetarian: '🌱',
  vegan: '🌿',
  'gluten-free': '🌾',
  'dairy-free': '🥛',
  keto: '🥑',
  paleo: '🍖'
}

const spiceLevelIndicator = (level?: number) => {
  if (!level) return null
  return '🌶️'.repeat(level)
}

export function RestaurantMenuClient({ restaurantId }: { restaurantId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')
  const [showFilters, setShowFilters] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [selectedDietary, setSelectedDietary] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<string>('all')
  const [showSpecialOnly, setShowSpecialOnly] = useState(false)
  const [cart, setCart] = useState<{ id: string; quantity: number }[]>([])

  useEffect(() => {
    const loadRestaurant = async () => {
      setLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const restaurantData = mockMenuData[restaurantId]
      if (restaurantData) {
        setRestaurant(restaurantData)
      }
      setLoading(false)
    }

    loadRestaurant()
  }, [restaurantId])

  useEffect(() => {
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('menu-favorites')
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  const toggleFavorite = (itemId: string) => {
    const newFavorites = favorites.includes(itemId)
      ? favorites.filter(id => id !== itemId)
      : [...favorites, itemId]
    
    setFavorites(newFavorites)
    localStorage.setItem('menu-favorites', JSON.stringify(newFavorites))
    
    toast({
      title: favorites.includes(itemId) ? 'Removed from favorites' : 'Added to favorites',
      description: favorites.includes(itemId) 
        ? 'Item removed from your favorites' 
        : 'Item added to your favorites',
    })
  }

  const addToCart = (itemId: string) => {
    const existingItem = cart.find(item => item.id === itemId)
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === itemId 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { id: itemId, quantity: 1 }])
    }
    
    toast({
      title: 'Added to cart',
      description: 'Item has been added to your cart',
    })
  }

  const filteredAndSortedMenu = useMemo(() => {
    if (!restaurant) return []

    let filtered = restaurant.menu.filter(item => {
      // Search filter
      if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !item.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false
      }

      // Dietary filter
      if (selectedDietary.length > 0 && !selectedDietary.some(diet => item.dietary.includes(diet))) {
        return false
      }

      // Price range filter
      if (priceRange === 'under-15' && item.price >= 15) return false
      if (priceRange === '15-30' && (item.price < 15 || item.price > 30)) return false
      if (priceRange === 'over-30' && item.price <= 30) return false

      // Special offers filter
      if (showSpecialOnly && !item.isSpecial) return false

      return true
    })

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'popular':
          return b.isPopular ? 1 : -1
        case 'cooking-time':
          return a.cookingTime - b.cookingTime
        default:
          return a.name.localeCompare(b.name)
      }
    })

    return filtered
  }, [restaurant, searchQuery, selectedCategory, selectedDietary, priceRange, showSpecialOnly, sortBy])

  const groupedMenu = useMemo(() => {
    const grouped: Record<string, MenuItem[]> = {}
    filteredAndSortedMenu.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = []
      }
      grouped[item.category].push(item)
    })
    return grouped
  }, [filteredAndSortedMenu])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Restaurant not found</h1>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
                <p className="text-gray-600">{restaurant.cuisine} • Menu</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Special Offers */}
      {restaurant.specialOffers.length > 0 && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex items-center space-x-2">
              <Tag className="h-4 w-4" />
              <span className="font-medium">Special Offers:</span>
              <span className="text-orange-100">
                {restaurant.specialOffers.map(offer => offer.title).join(' • ')}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="md:w-auto"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="appetizers">Appetizers</SelectItem>
                      <SelectItem value="mains">Main Courses</SelectItem>
                      <SelectItem value="desserts">Desserts</SelectItem>
                      <SelectItem value="drinks">Beverages</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name A-Z</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="cooking-time">Cooking Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="under-15">Under $15</SelectItem>
                      <SelectItem value="15-30">$15 - $30</SelectItem>
                      <SelectItem value="over-30">Over $30</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Filters</label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="special-only"
                      checked={showSpecialOnly}
                      onCheckedChange={setShowSpecialOnly}
                    />
                    <label htmlFor="special-only" className="text-sm text-gray-600">
                      Special offers only
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Preferences</label>
                <div className="flex flex-wrap gap-2">
                  {['vegetarian', 'vegan', 'gluten-free', 'dairy-free'].map(diet => (
                    <div key={diet} className="flex items-center space-x-2">
                      <Checkbox
                        id={diet}
                        checked={selectedDietary.includes(diet)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedDietary([...selectedDietary, diet])
                          } else {
                            setSelectedDietary(selectedDietary.filter(d => d !== diet))
                          }
                        }}
                      />
                      <label htmlFor={diet} className="text-sm text-gray-600 capitalize">
                        {dietaryIcons[diet as keyof typeof dietaryIcons]} {diet.replace('-', ' ')}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Menu Categories */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All Items ({filteredAndSortedMenu.length})</TabsTrigger>
            {Object.entries(categoryDisplayNames).map(([key, label]) => (
              <TabsTrigger key={key} value={key}>
                {label} ({groupedMenu[key]?.length || 0})
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {Object.entries(groupedMenu).map(([category, items]) => (
              <div key={category} className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  {categoryDisplayNames[category as keyof typeof categoryDisplayNames]}
                  <Badge variant="secondary" className="ml-2">{items.length}</Badge>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map(item => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      isFavorite={favorites.includes(item.id)}
                      onToggleFavorite={() => toggleFavorite(item.id)}
                      onAddToCart={() => addToCart(item.id)}
                    />
                  ))}
                </div>
                {category !== Object.keys(groupedMenu)[Object.keys(groupedMenu).length - 1] && (
                  <Separator className="mt-8" />
                )}
              </div>
            ))}
          </TabsContent>

          {Object.entries(categoryDisplayNames).map(([key, label]) => (
            <TabsContent key={key} value={key} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedMenu[key]?.map(item => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    isFavorite={favorites.includes(item.id)}
                    onToggleFavorite={() => toggleFavorite(item.id)}
                    onAddToCart={() => addToCart(item.id)}
                  />
                )) || (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500">No items found in this category</p>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {filteredAndSortedMenu.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
                setSelectedDietary([])
                setPriceRange('all')
                setShowSpecialOnly(false)
              }}
              className="mt-4"
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function MenuItemCard({
  item,
  isFavorite,
  onToggleFavorite,
  onAddToCart
}: {
  item: MenuItem
  isFavorite: boolean
  onToggleFavorite: () => void
  onAddToCart: () => void
}) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="relative">
        <div className="aspect-video relative bg-gray-200">
          <Image
            src={item.image}
            alt={item.name}
            fill
            unoptimized
            className="object-cover"
          />
          {item.isSpecial && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white">
              Special
            </Badge>
          )}
          {item.isPopular && (
            <Badge className="absolute top-2 right-2 bg-orange-500 text-white">
              <Star className="h-3 w-3 mr-1" />
              Popular
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleFavorite}
          className={`absolute bottom-2 right-2 ${
            isFavorite ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500'
          }`}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
        </Button>
      </div>

      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
          <span className="font-bold text-orange-600 text-lg">${item.price}</span>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>

        {/* Dietary and Allergen Info */}
        <div className="space-y-2 mb-3">
          {item.dietary.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.dietary.map(diet => (
                <Badge key={diet} variant="secondary" className="text-xs">
                  {dietaryIcons[diet as keyof typeof dietaryIcons]} {diet}
                </Badge>
              ))}
            </div>
          )}

          {item.allergens.length > 0 && (
            <div className="flex items-start space-x-1">
              <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-gray-500">
                Contains: {item.allergens.join(', ')}
              </span>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{item.cookingTime} min</span>
            </div>
            {item.calories && (
              <div className="flex items-center space-x-1">
                <Leaf className="h-3 w-3" />
                <span>{item.calories} cal</span>
              </div>
            )}
            {item.spiceLevel && (
              <div className="flex items-center space-x-1">
                <span>{spiceLevelIndicator(item.spiceLevel)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <Button onClick={onAddToCart} className="w-full">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  )
}