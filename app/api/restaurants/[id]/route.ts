import { NextRequest, NextResponse } from 'next/server'

// Mock restaurant data - same as the main restaurants API
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
    _count: { reviews: 128 },
    hours: {
      monday: '5:00 PM - 10:00 PM',
      tuesday: '5:00 PM - 10:00 PM',
      wednesday: '5:00 PM - 10:00 PM',
      thursday: '5:00 PM - 10:00 PM',
      friday: '5:00 PM - 11:00 PM',
      saturday: '12:00 PM - 11:00 PM',
      sunday: '12:00 PM - 9:00 PM'
    },
    contact: {
      phone: '(555) 123-4567',
      email: 'info@bellavista.com',
      website: 'www.bellavista.com'
    },
    features: ['Outdoor Seating', 'Wine Bar', 'Private Dining', 'Reservations'],
    menuHighlights: [
      { name: 'Margherita Pizza', price: '$18' },
      { name: 'Spaghetti Carbonara', price: '$22' },
      { name: 'Tiramisu', price: '$8' }
    ]
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
    _count: { reviews: 256 },
    hours: {
      monday: 'Closed',
      tuesday: '12:00 PM - 10:00 PM',
      wednesday: '12:00 PM - 10:00 PM',
      thursday: '12:00 PM - 10:00 PM',
      friday: '12:00 PM - 11:00 PM',
      saturday: '12:00 PM - 11:00 PM',
      sunday: '12:00 PM - 9:00 PM'
    },
    contact: {
      phone: '(555) 234-5678',
      email: 'reservations@sakurasushi.com',
      website: 'www.sakurasushi.com'
    },
    features: ['Omakase', 'Sake Bar', 'Sushi Bar', 'Private Room'],
    menuHighlights: [
      { name: 'Salmon Sashimi', price: '$24' },
      { name: 'Dragon Roll', price: '$28' },
      { name: 'Miso Soup', price: '$6' }
    ]
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
    _count: { reviews: 89 },
    hours: {
      monday: '11:30 AM - 10:00 PM',
      tuesday: '11:30 AM - 10:00 PM',
      wednesday: '11:30 AM - 10:00 PM',
      thursday: '11:30 AM - 10:00 PM',
      friday: '11:30 AM - 11:00 PM',
      saturday: '11:30 AM - 11:00 PM',
      sunday: '11:30 AM - 9:30 PM'
    },
    contact: {
      phone: '(555) 345-6789',
      email: 'info@spiceroute.com',
      website: 'www.spiceroute.com'
    },
    features: ['Vegetarian Options', 'Spice Level Options', 'Buffet', 'Takeout'],
    menuHighlights: [
      { name: 'Chicken Tikka Masala', price: '$16' },
      { name: 'Vegetable Biryani', price: '$14' },
      { name: 'Naan Bread', price: '$4' }
    ]
  },
  // Add more restaurants with similar structure...
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
    _count: { reviews: 167 },
    hours: {
      monday: 'Closed',
      tuesday: '6:00 PM - 10:00 PM',
      wednesday: '6:00 PM - 10:00 PM',
      thursday: '6:00 PM - 10:00 PM',
      friday: '6:00 PM - 11:00 PM',
      saturday: '6:00 PM - 11:00 PM',
      sunday: '6:00 PM - 9:00 PM'
    },
    contact: {
      phone: '(555) 456-7890',
      email: 'reservations@lepetitbistro.com',
      website: 'www.lepetitbistro.com'
    },
    features: ['Wine Pairing', 'Tasting Menu', 'Romantic Setting', 'Fine Dining'],
    menuHighlights: [
      { name: 'Bouillabaisse', price: '$32' },
      { name: 'Coq au Vin', price: '$28' },
      { name: 'Crème Brûlée', price: '$12' }
    ]
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
    _count: { reviews: 203 },
    hours: {
      monday: '11:00 AM - 10:00 PM',
      tuesday: '11:00 AM - 10:00 PM',
      wednesday: '11:00 AM - 10:00 PM',
      thursday: '11:00 AM - 10:00 PM',
      friday: '11:00 AM - 11:00 PM',
      saturday: '11:00 AM - 11:00 PM',
      sunday: '11:00 AM - 9:30 PM'
    },
    contact: {
      phone: '(555) 567-8901',
      email: 'info@goldendragon.com',
      website: 'www.goldendragon.com'
    },
    features: ['Dim Sum', 'Private Dining', 'Delivery', 'Takeout'],
    menuHighlights: [
      { name: 'Peking Duck', price: '$38' },
      { name: 'Kung Pao Chicken', price: '$18' },
      { name: 'Fried Rice', price: '$12' }
    ]
  }
]

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // Find the restaurant by ID
    const restaurant = mockRestaurants.find(r => r.id === id)
    
    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(restaurant)
    
  } catch (error) {
    console.error('Error fetching restaurant:', error)
    return NextResponse.json(
      { error: 'Failed to fetch restaurant' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    // This would typically update the restaurant in the database
    // For now, just return success
    return NextResponse.json({
      message: 'Restaurant update not yet implemented',
      restaurantId: id,
      updates: body
    })
  } catch (error) {
    console.error('Error updating restaurant:', error)
    return NextResponse.json(
      { error: 'Failed to update restaurant' },
      { status: 500 }
    )
  }
}