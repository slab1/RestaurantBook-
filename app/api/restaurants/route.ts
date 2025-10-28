import { NextRequest, NextResponse } from 'next/server'

// Mock restaurant data - this would typically come from a database
const mockRestaurants = [
  {
    id: '1',
    name: 'Bella Vista',
    description: 'Italian restaurant serving authentic pasta and wood-fired pizzas',
    address: '123 Main Street, New York, NY 10001',
    cuisine: 'Italian',
    priceRange: '$$$',
    rating: 4.5,
    imageUrl: '/imgs/authentic_italian_pasta_dinner_wine_cozy_setting.jpg',
    isOpen: true,
    nextAvailableTime: '7:30 PM',
    distance: 0.8,
    _count: { reviews: 128 }
  },
  {
    id: '2',
    name: 'Sakura Sushi',
    description: 'Fresh sushi and sashimi with traditional Japanese ambiance',
    address: '456 Oak Avenue, New York, NY 10002',
    cuisine: 'Japanese',
    priceRange: '$$$$',
    rating: 4.8,
    imageUrl: '/imgs/modern_japanese_sushi_restaurant_bar_chefs.jpg',
    isOpen: true,
    nextAvailableTime: '8:00 PM',
    distance: 1.2,
    _count: { reviews: 256 }
  },
  {
    id: '3',
    name: 'Spice Route',
    description: 'Authentic Indian cuisine with aromatic spices and traditional flavors',
    address: '789 Pine Street, New York, NY 10003',
    cuisine: 'Indian',
    priceRange: '$$',
    rating: 4.3,
    imageUrl: '/imgs/authentic_indian_chicken_tikka_masala_rice_naan.jpg',
    isOpen: true,
    nextAvailableTime: '7:00 PM',
    distance: 0.5,
    _count: { reviews: 89 }
  },
  {
    id: '4',
    name: 'Le Petit Bistro',
    description: 'French cuisine in an intimate, elegant setting',
    address: '321 Elm Street, New York, NY 10004',
    cuisine: 'French',
    priceRange: '$$$$',
    rating: 4.7,
    imageUrl: '/imgs/classic_french_bistro_elegant_dining_room.jpg',
    isOpen: false,
    nextAvailableTime: 'Closed - Opens Tomorrow 6:00 PM',
    distance: 2.1,
    _count: { reviews: 167 }
  },
  {
    id: '5',
    name: 'Golden Dragon',
    description: 'Traditional Chinese cuisine with modern presentation',
    address: '654 Maple Drive, New York, NY 10005',
    cuisine: 'Chinese',
    priceRange: '$$',
    rating: 4.2,
    imageUrl: '/imgs/elegant_asian_fine_dining_restaurant_interior_luxury_decor.jpg',
    isOpen: true,
    nextAvailableTime: '7:45 PM',
    distance: 1.5,
    _count: { reviews: 203 }
  },
  {
    id: '6',
    name: 'Sunset Grill',
    description: 'American comfort food with a modern twist',
    address: '987 Cedar Lane, New York, NY 10006',
    cuisine: 'American',
    priceRange: '$$$',
    rating: 4.4,
    imageUrl: '/imgs/american_comfort_food_feast_family_restaurant.jpg',
    isOpen: true,
    nextAvailableTime: '6:45 PM',
    distance: 0.9,
    _count: { reviews: 145 }
  },
  {
    id: '7',
    name: 'Mediterranean Delights',
    description: 'Fresh Mediterranean dishes with organic ingredients',
    address: '147 Birch Road, New York, NY 10007',
    cuisine: 'Mediterranean',
    priceRange: '$$',
    rating: 4.6,
    imageUrl: '/imgs/elegant_upscale_fine_dining_restaurant_interior.jpg',
    isOpen: true,
    nextAvailableTime: '8:15 PM',
    distance: 1.8,
    _count: { reviews: 98 }
  },
  {
    id: '8',
    name: 'Taco Fiesta',
    description: 'Authentic Mexican street food and colorful atmosphere',
    address: '258 Walnut Street, New York, NY 10008',
    cuisine: 'Mexican',
    priceRange: '$',
    rating: 4.1,
    imageUrl: '/imgs/luxury_restaurant_interior_golden_chandelier_elegant_setting.jpg',
    isOpen: true,
    nextAvailableTime: '7:30 PM',
    distance: 1.1,
    _count: { reviews: 178 }
  },
  {
    id: '9',
    name: 'Vine & Dine',
    description: 'Wine bar with small plates and extensive wine selection',
    address: '369 Cherry Street, New York, NY 10009',
    cuisine: 'Wine Bar',
    priceRange: '$$$',
    rating: 4.5,
    imageUrl: '/imgs/elegant_french_bistro_wine_bar.jpg',
    isOpen: true,
    nextAvailableTime: '8:30 PM',
    distance: 0.7,
    _count: { reviews: 112 }
  },
  {
    id: '10',
    name: 'Farm Table',
    description: 'Farm-to-table dining with seasonal American cuisine',
    address: '741 Spruce Avenue, New York, NY 10010',
    cuisine: 'American',
    priceRange: '$$$',
    rating: 4.8,
    imageUrl: '/imgs/family_friendly_american_comfort_food_spread.jpg',
    isOpen: true,
    nextAvailableTime: '6:00 PM',
    distance: 1.4,
    _count: { reviews: 234 }
  },
  {
    id: '11',
    name: 'Pasta & Co',
    description: 'Fresh handmade pasta with authentic Italian recipes',
    address: '852 Willow Street, New York, NY 10011',
    cuisine: 'Italian',
    priceRange: '$$',
    rating: 4.4,
    imageUrl: '/imgs/delicious_authentic_italian_spaghetti_pasta_fork.jpg',
    isOpen: true,
    nextAvailableTime: '7:15 PM',
    distance: 1.6,
    _count: { reviews: 156 }
  },
  {
    id: '12',
    name: 'Riverside Steakhouse',
    description: 'Premium steaks with river views and sophisticated ambiance',
    address: '963 Poplar Drive, New York, NY 10012',
    cuisine: 'Steakhouse',
    priceRange: '$$$$',
    rating: 4.7,
    imageUrl: '/imgs/delicious_shrimp_pasta_outdoor_dining_italian.jpg',
    isOpen: true,
    nextAvailableTime: '8:00 PM',
    distance: 2.3,
    _count: { reviews: 189 }
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract search parameters
    const query = searchParams.get('query')?.toLowerCase() || ''
    const cuisine = searchParams.get('cuisine')?.toLowerCase() || ''
    const priceRange = searchParams.get('priceRange') || ''
    const location = searchParams.get('location')?.toLowerCase() || ''
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    
    // Filter restaurants based on search criteria
    let filteredRestaurants = mockRestaurants.filter(restaurant => {
      // Text search (query)
      const matchesQuery = !query || 
        restaurant.name.toLowerCase().includes(query) ||
        restaurant.description.toLowerCase().includes(query) ||
        restaurant.cuisine.toLowerCase().includes(query)
      
      // Cuisine filter
      const matchesCuisine = !cuisine || 
        restaurant.cuisine.toLowerCase() === cuisine.toLowerCase()
      
      // Price range filter
      const matchesPriceRange = !priceRange || 
        restaurant.priceRange === priceRange
      
      // Location filter
      const matchesLocation = !location || 
        restaurant.address.toLowerCase().includes(location)
      
      return matchesQuery && matchesCuisine && matchesPriceRange && matchesLocation
    })
    
    // Sort by rating (highest first) as default
    filteredRestaurants.sort((a, b) => b.rating - a.rating)
    
    // Calculate pagination
    const total = filteredRestaurants.length
    const pages = Math.ceil(total / limit)
    const paginatedRestaurants = filteredRestaurants.slice(startIndex, endIndex)
    
    return NextResponse.json({
      restaurants: paginatedRestaurants,
      pagination: {
        page,
        limit,
        total,
        pages,
        hasNext: page < pages,
        hasPrev: page > 1
      }
    })
    
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return NextResponse.json(
      { error: 'Failed to fetch restaurants' },
      { status: 500 }
    )
  }
}

// Also handle POST requests for creating new restaurants (future feature)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // This would typically validate and save to database
    // For now, just return success
    return NextResponse.json({
      message: 'Restaurant creation not yet implemented',
      restaurant: body
    })
  } catch (error) {
    console.error('Error creating restaurant:', error)
    return NextResponse.json(
      { error: 'Failed to create restaurant' },
      { status: 500 }
    )
  }
}