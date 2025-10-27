import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { User, Restaurant, Booking, LoyaltyTier, Notification } from '../types'
import { persist } from 'zustand/middleware'
import { apiClient, type LoginRequest, type RegisterRequest } from '../lib/api-client'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => void
}

interface RestaurantState {
  restaurants: Restaurant[]
  selectedRestaurant: Restaurant | null
  searchFilters: SearchFilters
  isLoading: boolean
  fetchRestaurants: (filters?: SearchFilters) => Promise<void>
  setSelectedRestaurant: (restaurant: Restaurant | null) => void
  setSearchFilters: (filters: SearchFilters) => void
}

interface BookingState {
  bookings: Booking[]
  currentBooking: Booking | null
  isLoading: boolean
  fetchBookings: () => Promise<void>
  createBooking: (data: CreateBookingData) => Promise<Booking>
  updateBooking: (id: string, data: Partial<Booking>) => Promise<void>
  cancelBooking: (id: string) => Promise<void>
}

interface LoyaltyState {
  userLoyalty: {
    tier: LoyaltyTier
    points: number
    transactions: LoyaltyTransaction[]
  } | null
  isLoading: boolean
  fetchLoyaltyInfo: () => Promise<void>
  redeemPoints: (points: number, description: string) => Promise<void>
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  fetchNotifications: () => Promise<void>
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
}

interface UIState {
  isOffline: boolean
  showInstallPrompt: boolean
  showPWAUpdate: boolean
  currentPage: string
  theme: 'light' | 'dark' | 'system'
  setOfflineStatus: (status: boolean) => void
  setInstallPrompt: (show: boolean) => void
  setPWAUpdate: (show: boolean) => void
  setCurrentPage: (page: string) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

// Data interfaces
interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}

interface SearchFilters {
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

interface CreateBookingData {
  restaurantId: string
  date: string
  time: string
  partySize: number
  specialRequests?: string
}

interface LoyaltyTransaction {
  id: string
  type: 'EARN' | 'REDEEM' | 'BONUS'
  points: number
  description: string
  createdAt: string
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,

        login: async (email: string, password: string) => {
          set({ isLoading: true })
          try {
            const loginData: LoginRequest = { email, password, rememberMe: false }
            const result = await apiClient.login(loginData)
            
            if (result.success && result.user) {
              set({ 
                user: {
                  ...result.user,
                  loyaltyPoints: result.user.loyaltyPoints || 0,
                  loyaltyTier: {
                    id: '1',
                    name: 'Bronze',
                    minPoints: 0,
                    maxPoints: 999,
                    benefits: ['Basic features'],
                    discountPercent: 0,
                    priorityReservations: false,
                    exclusiveOffers: false,
                    freeDelivery: false,
                  }
                },
                isAuthenticated: true, 
                isLoading: false 
              })
              console.log('Login successful:', result.user)
            } else {
              throw new Error(result.error || 'Login failed')
            }
          } catch (error: any) {
            console.error('Login error:', error)
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false 
            })
            throw error
          }
        },

        register: async (data: RegisterData) => {
          set({ isLoading: true })
          try {
            const registerData: RegisterRequest = {
              email: data.email,
              password: data.password,
              firstName: data.firstName,
              lastName: data.lastName,
              phone: data.phone
            }
            
            const result = await apiClient.register(registerData)
            
            if (result.success && result.user) {
              set({ 
                user: {
                  ...result.user,
                  loyaltyPoints: 0,
                  loyaltyTier: {
                    id: '1',
                    name: 'Bronze',
                    minPoints: 0,
                    maxPoints: 999,
                    benefits: ['Basic features'],
                    discountPercent: 0,
                    priorityReservations: false,
                    exclusiveOffers: false,
                    freeDelivery: false,
                  }
                }, 
                isAuthenticated: true, 
                isLoading: false 
              })
              console.log('Registration successful:', result.user)
            } else {
              throw new Error(result.error || 'Registration failed')
            }
          } catch (error: any) {
            console.error('Registration error:', error)
            set({ isLoading: false })
            throw error
          }
        },

        logout: async () => {
          try {
            await apiClient.logout()
          } catch (error) {
            console.error('Logout error:', error)
          }
          set({ user: null, isAuthenticated: false })
          localStorage.removeItem('auth-storage')
        },

        updateProfile: (data: Partial<User>) => {
          const currentUser = get().user
          if (currentUser) {
            const updatedUser = { ...currentUser, ...data }
            set({ user: updatedUser })
          }
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      }
    )
  )
)

export const useRestaurantStore = create<RestaurantState>()(
  devtools((set, get) => ({
    restaurants: [],
    selectedRestaurant: null,
    searchFilters: {},
    isLoading: false,

    fetchRestaurants: async (filters?: SearchFilters) => {
      set({ isLoading: true })
      try {
        const result = await apiClient.getRestaurants(filters)
        
        if (result.success) {
          set({ 
            restaurants: result.data || [], 
            isLoading: false 
          })
        } else {
          throw new Error(result.error || 'Failed to fetch restaurants')
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error)
        // Fallback to mock data if API fails
        const mockRestaurants: Restaurant[] = [
          {
            id: '1',
            name: 'Bella Vista',
            description: 'Authentic Italian cuisine with a modern twist',
            address: '123 Main Street',
            city: 'Lagos',
            state: 'Lagos',
            postalCode: '10001',
            phone: '+234 801 234 5678',
            email: 'info@bellavista.com',
            website: 'https://bellavista.com',
            cuisine: ['Italian', 'Mediterranean'],
            priceRange: '$$$',
            rating: 4.5,
            reviewCount: 234,
            imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
            images: [],
            openingHours: {
              monday: { open: '11:00', close: '22:00' },
              tuesday: { open: '11:00', close: '22:00' },
              wednesday: { open: '11:00', close: '22:00' },
              thursday: { open: '11:00', close: '22:00' },
              friday: { open: '11:00', close: '23:00' },
              saturday: { open: '11:00', close: '23:00' },
              sunday: { open: '12:00', close: '21:00' },
            },
            amenities: ['WiFi', 'Parking', 'Air Conditioning'],
            capacity: 80,
            tables: [],
            isActive: true,
            ownerId: 'owner1',
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z',
            distance: 0.5,
            isOpen: true,
            nextAvailableTime: '19:00',
          },
          {
            id: '2',
            name: 'Spice Garden',
            description: 'Authentic Nigerian cuisine with traditional flavors',
            address: '456 Victoria Island',
            city: 'Lagos',
            state: 'Lagos',
            postalCode: '10002',
            phone: '+234 802 345 6789',
            email: 'hello@spicegarden.com',
            cuisine: ['Nigerian', 'African'],
            priceRange: '$$',
            rating: 4.8,
            reviewCount: 156,
            imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',
            images: [],
            openingHours: {
              monday: { open: '08:00', close: '20:00' },
              tuesday: { open: '08:00', close: '20:00' },
              wednesday: { open: '08:00', close: '20:00' },
              thursday: { open: '08:00', close: '20:00' },
              friday: { open: '08:00', close: '22:00' },
              saturday: { open: '08:00', close: '22:00' },
              sunday: { open: '08:00', close: '21:00' },
            },
            amenities: ['WiFi', 'Parking', 'Outdoor Seating', 'Live Music'],
            capacity: 120,
            tables: [],
            isActive: true,
            ownerId: 'owner2',
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z',
            distance: 1.2,
            isOpen: true,
            nextAvailableTime: '18:30',
          },
          {
            id: '3',
            name: 'Sushi Zen',
            description: 'Fresh sushi and authentic Japanese dining experience',
            address: '789 Ikoyi Road',
            city: 'Lagos',
            state: 'Lagos',
            postalCode: '10003',
            phone: '+234 803 456 7890',
            email: 'info@sushizen.com',
            cuisine: ['Japanese', 'Asian'],
            priceRange: '$$$$',
            rating: 4.7,
            reviewCount: 189,
            imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
            images: [],
            openingHours: {
              monday: { open: '17:00', close: '23:00' },
              tuesday: { open: '17:00', close: '23:00' },
              wednesday: { open: '17:00', close: '23:00' },
              thursday: { open: '17:00', close: '23:00' },
              friday: { open: '17:00', close: '23:30' },
              saturday: { open: '17:00', close: '23:30' },
              sunday: { open: '17:00', close: '22:00' },
            },
            amenities: ['WiFi', 'Valet Parking', 'Bar', 'Omakase'],
            capacity: 60,
            tables: [],
            isActive: true,
            ownerId: 'owner3',
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z',
            distance: 2.1,
            isOpen: true,
            nextAvailableTime: '20:00',
          },
        ]
        set({ restaurants: mockRestaurants, isLoading: false })
      }
    },

    setSelectedRestaurant: (restaurant: Restaurant | null) => {
      set({ selectedRestaurant: restaurant })
    },

    setSearchFilters: (filters: SearchFilters) => {
      set({ searchFilters: filters })
      get().fetchRestaurants(filters)
    },
  }))
)

export const useBookingStore = create<BookingState>()(
  devtools((set, get) => ({
    bookings: [],
    currentBooking: null,
    isLoading: false,

    fetchBookings: async () => {
      set({ isLoading: true })
      try {
        // Mock data for demo
        const mockBookings: Booking[] = [
          {
            id: '1',
            userId: '1',
            restaurantId: '1',
            restaurantName: 'Bella Vista',
            partySize: 4,
            date: '2025-10-28',
            time: '19:00',
            status: 'CONFIRMED',
            specialRequests: 'Window table if available',
            confirmationCode: 'BV2025-001',
            createdAt: '2025-10-27T09:00:00Z',
            updatedAt: '2025-10-27T09:00:00Z',
            totalAmount: 15000,
            paymentStatus: 'PAID',
          },
          {
            id: '2',
            userId: '1',
            restaurantId: '2',
            restaurantName: 'Spice Garden',
            partySize: 2,
            date: '2025-11-15',
            time: '18:30',
            status: 'PENDING',
            confirmationCode: 'SG2025-002',
            createdAt: '2025-10-27T10:30:00Z',
            updatedAt: '2025-10-27T10:30:00Z',
            totalAmount: 8000,
            paymentStatus: 'PENDING',
          },
        ]
        set({ bookings: mockBookings, isLoading: false })
      } catch (error) {
        set({ isLoading: false })
      }
    },

    createBooking: async (data: CreateBookingData) => {
      const newBooking: Booking = {
        id: Date.now().toString(),
        userId: '1', // Get from auth store
        restaurantId: data.restaurantId,
        restaurantName: 'Selected Restaurant', // Get from restaurant store
        partySize: data.partySize,
        date: data.date,
        time: data.time,
        status: 'CONFIRMED',
        specialRequests: data.specialRequests,
        confirmationCode: `BK${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalAmount: 0,
        paymentStatus: 'PENDING',
      }
      
      set((state) => ({
        bookings: [...state.bookings, newBooking],
        currentBooking: newBooking,
      }))
      
      return newBooking
    },

    updateBooking: async (id: string, data: Partial<Booking>) => {
      set((state) => ({
        bookings: state.bookings.map((booking) =>
          booking.id === id ? { ...booking, ...data, updatedAt: new Date().toISOString() } : booking
        ),
      }))
    },

    cancelBooking: async (id: string) => {
      await get().updateBooking(id, { status: 'CANCELLED' })
    },
  }))
)

export const useLoyaltyStore = create<LoyaltyState>()(
  devtools((set) => ({
    userLoyalty: null,
    isLoading: false,

    fetchLoyaltyInfo: async () => {
      set({ isLoading: true })
      try {
        // Mock data for demo
        const mockLoyalty = {
          tier: {
            id: '1',
            name: 'Gold',
            minPoints: 1000,
            maxPoints: 5000,
            benefits: ['10% discount', 'Priority reservations', 'Free delivery'],
            discountPercent: 10,
            priorityReservations: true,
            exclusiveOffers: true,
            freeDelivery: true,
          },
          points: 2500,
          transactions: [
            {
              id: '1',
              type: 'EARN',
              points: 500,
              description: 'Booking at Bella Vista',
              createdAt: '2025-10-27T09:00:00Z',
            },
            {
              id: '2',
              type: 'REDEEM',
              points: 100,
              description: 'Discount applied',
              createdAt: '2025-10-26T15:30:00Z',
            },
          ],
        }
        set({ userLoyalty: mockLoyalty, isLoading: false })
      } catch (error) {
        set({ isLoading: false })
      }
    },

    redeemPoints: async (points: number, description: string) => {
      set((state) => {
        if (state.userLoyalty) {
          return {
            userLoyalty: {
              ...state.userLoyalty,
              points: state.userLoyalty.points - points,
              transactions: [
                {
                  id: Date.now().toString(),
                  type: 'REDEEM',
                  points,
                  description,
                  createdAt: new Date().toISOString(),
                },
                ...state.userLoyalty.transactions,
              ],
            },
          }
        }
        return state
      })
    },
  }))
)

export const useNotificationStore = create<NotificationState>()(
  devtools((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,

    fetchNotifications: async () => {
      set({ isLoading: true })
      try {
        // Mock data for demo
        const mockNotifications: Notification[] = [
          {
            id: '1',
            userId: '1',
            type: 'BOOKING_CONFIRMED',
            title: 'Booking Confirmed',
            message: 'Your table at Bella Vista has been confirmed for tomorrow at 7:00 PM',
            isRead: false,
            createdAt: '2025-10-27T09:00:00Z',
          },
          {
            id: '2',
            userId: '1',
            type: 'LOYALTY_REWARD',
            title: 'Loyalty Points Earned',
            message: 'You earned 500 points from your recent booking!',
            isRead: false,
            createdAt: '2025-10-27T09:30:00Z',
          },
        ]
        set({
          notifications: mockNotifications,
          unreadCount: mockNotifications.filter(n => !n.isRead).length,
          isLoading: false,
        })
      } catch (error) {
        set({ isLoading: false })
      }
    },

    markAsRead: (id: string) => {
      set((state) => ({
        notifications: state.notifications.map((notification) =>
          notification.id === id ? { ...notification, isRead: true } : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }))
    },

    markAllAsRead: () => {
      set((state) => ({
        notifications: state.notifications.map((notification) => ({ ...notification, isRead: true })),
        unreadCount: 0,
      }))
    },

    deleteNotification: (id: string) => {
      set((state) => ({
        notifications: state.notifications.filter((notification) => notification.id !== id),
        unreadCount: state.notifications.find(n => n.id === id && !n.isRead)
          ? state.unreadCount - 1
          : state.unreadCount,
      }))
    },
  }))
)

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        isOffline: false,
        showInstallPrompt: false,
        showPWAUpdate: false,
        currentPage: '/',
        theme: 'system',

        setOfflineStatus: (status: boolean) => set({ isOffline: status }),
        setInstallPrompt: (show: boolean) => set({ showInstallPrompt: show }),
        setPWAUpdate: (show: boolean) => set({ showPWAUpdate: show }),
        setCurrentPage: (page: string) => set({ currentPage: page }),
        setTheme: (theme: 'light' | 'dark' | 'system') => set({ theme }),
      }),
      {
        name: 'ui-storage',
        partialize: (state) => ({ theme: state.theme }),
      }
    )
  )
)
