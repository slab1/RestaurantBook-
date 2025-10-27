export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'CUSTOMER' | 'RESTAURANT_OWNER' | 'ADMIN'
  avatar?: string
  phone?: string
  createdAt: string
  loyaltyPoints?: number
  loyaltyTier?: LoyaltyTier
}

export interface Restaurant {
  id: string
  name: string
  description: string
  address: string
  city: string
  state: string
  postalCode: string
  phone: string
  email: string
  website?: string
  cuisine: string[]
  priceRange: '$' | '$$' | '$$$' | '$$$$'
  rating: number
  reviewCount: number
  imageUrl: string
  images: string[]
  openingHours: OpeningHours
  amenities: string[]
  capacity: number
  tables: Table[]
  isActive: boolean
  ownerId: string
  createdAt: string
  updatedAt: string
  distance?: number
  isOpen?: boolean
  nextAvailableTime?: string
}

export interface Table {
  id: string
  restaurantId: string
  tableNumber: string
  capacity: number
  type: string
  isAvailable: boolean
  position?: {
    x: number
    y: number
  }
}

export interface OpeningHours {
  [key: string]: {
    open: string
    close: string
    closed?: boolean
  }
}

export interface Booking {
  id: string
  userId: string
  restaurantId: string
  restaurantName: string
  tableId?: string
  partySize: number
  date: string
  time: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'
  specialRequests?: string
  customerNotes?: string
  confirmationCode: string
  createdAt: string
  updatedAt: string
  totalAmount?: number
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED'
}

export interface MenuItem {
  id: string
  restaurantId: string
  name: string
  description: string
  price: number
  currency: string
  category: string
  imageUrl?: string
  isAvailable: boolean
  isVegetarian: boolean
  isVegan: boolean
  isGlutenFree: boolean
  spiceLevel?: 1 | 2 | 3 | 4 | 5
  allergens: string[]
  nutritionInfo?: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  preparationTime: number
}

export interface LoyaltyTier {
  id: string
  name: string
  minPoints: number
  maxPoints?: number
  benefits: string[]
  discountPercent: number
  priorityReservations: boolean
  exclusiveOffers: boolean
  freeDelivery: boolean
}

export interface LoyaltyTransaction {
  id: string
  userId: string
  type: 'EARN' | 'REDEEM' | 'BONUS'
  points: number
  description: string
  bookingId?: string
  createdAt: string
}

export interface Review {
  id: string
  userId: string
  restaurantId: string
  rating: number
  comment?: string
  images?: string[]
  isAnonymous: boolean
  createdAt: string
  updatedAt: string
  helpfulCount: number
}

export interface Notification {
  id: string
  userId: string
  type: 'BOOKING_CONFIRMED' | 'BOOKING_REMINDER' | 'LOYALTY_REWARD' | 'OFFER' | 'PROMOTION'
  title: string
  message: string
  data?: Record<string, any>
  isRead: boolean
  createdAt: string
}

export interface ARMenuItem {
  id: string
  name: string
  modelUrl: string
  textureUrl?: string
  scale: number
  position: { x: number; y: number; z: number }
}

export interface DeliveryOrder {
  id: string
  userId: string
  restaurantId: string
  restaurantName: string
  items: DeliveryOrderItem[]
  totalAmount: number
  deliveryFee: number
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED'
  deliveryAddress: string
  estimatedDeliveryTime: string
  actualDeliveryTime?: string
  driverId?: string
  trackingInfo?: DeliveryTrackingInfo
  createdAt: string
  updatedAt: string
}

export interface DeliveryOrderItem {
  menuItemId: string
  name: string
  quantity: number
  price: number
  specialRequests?: string
}

export interface DeliveryTrackingInfo {
  currentLocation: { lat: number; lng: number }
  estimatedArrival: string
  driverName: string
  driverPhone: string
  vehicleInfo: string
  statusUpdates: DeliveryStatusUpdate[]
}

export interface DeliveryStatusUpdate {
  status: string
  timestamp: string
  location?: { lat: number; lng: number }
  message: string
}

export interface PaymentMethod {
  id: string
  type: 'CARD' | 'BANK_TRANSFER' | 'WALLET'
  provider: string
  last4?: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
}

export interface SearchFilters {
  query?: string
  location?: string
  cuisine?: string[]
  priceRange?: string[]
  rating?: number
  openNow?: boolean
  hasDelivery?: boolean
  distance?: number
  amenities?: string[]
}

export interface RecommendationEngine {
  getPersonalizedRecommendations(userId: string): Promise<Restaurant[]>
  getSimilarRestaurants(restaurantId: string): Promise<Restaurant[]>
  getTrendingRestaurants(timeframe?: 'day' | 'week' | 'month'): Promise<Restaurant[]>
}

export interface OfflineData {
  restaurants: Restaurant[]
  bookings: Booking[]
  userProfile: User
  lastSync: string
}

export interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
  rtl: boolean
}

export interface Currency {
  code: string
  symbol: string
  name: string
  rate: number
}

export interface I18nConfig {
  languages: Language[]
  currencies: Currency[]
  defaultLanguage: string
  defaultCurrency: string
}

export interface PushNotificationData {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: Record<string, any>
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
}

export interface AnalyticsEvent {
  event: string
  category: string
  action: string
  label?: string
  value?: number
  customProperties?: Record<string, any>
}
