# Frontend Integration Guide
## Migrating from localStorage to Supabase

This guide shows how to integrate the Supabase backend with your existing frontend code.

## Overview

Your current frontend uses localStorage for:
- User profiles and preferences
- Shopping cart
- Restaurant browsing
- User authentication

We'll migrate these to use Supabase while maintaining the same user experience.

## Step 1: Install Dependencies

```bash
npm install @supabase/supabase-js @stripe/stripe-js
npm install lucide-react date-fns
```

## Step 2: Create Supabase Client

Create `/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface Profile {
  id: string
  email: string
  full_name: string
  phone?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Restaurant {
  id: string
  name: string
  description: string
  cuisine_type: string
  price_range: string
  address: string
  phone: string
  image_url?: string
  rating: number
  review_count: number
  is_active: boolean
}

export interface MenuItem {
  id: string
  restaurant_id: string
  category_id: string
  name: string
  description: string
  price: number
  image_url?: string
  allergens: string[]
  dietary_info: string[]
  is_available: boolean
}

export interface Order {
  id: string
  user_id: string
  restaurant_id: string
  order_number: string
  status: string
  subtotal: number
  tax_amount: number
  service_fee: number
  tip_amount: number
  total_amount: number
  created_at: string
}

export interface Booking {
  id: string
  user_id: string
  restaurant_id: string
  booking_date: string
  booking_time: string
  party_size: number
  status: string
  booking_reference: string
  deposit_amount: number
}
```

## Step 3: Update Authentication

Replace the current auth logic in `/lib/auth-context.tsx`:

```typescript
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })
    if (error) throw error

    // Create profile record
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: email,
          full_name: fullName
        })
      if (profileError) console.error('Profile creation error:', profileError)
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in')
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
    
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signOut,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

## Step 4: Update Restaurant Service

Replace `/lib/restaurant-service.ts`:

```typescript
import { supabase, Restaurant, MenuItem } from './supabase'

export async function getRestaurants() {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('is_active', true)
    .order('rating', { ascending: false })

  if (error) throw error
  return data as Restaurant[]
}

export async function getRestaurant(id: string) {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error) throw error
  return data as Restaurant
}

export async function getRestaurantMenu(restaurantId: string) {
  // Get categories with menu items
  const { data, error } = await supabase
    .from('menu_categories')
    .select(`
      *,
      menu_items (
        *,
        restaurants (*)
      )
    `)
    .eq('restaurant_id', restaurantId)
    .eq('is_active', true)
    .order('sort_order')

  if (error) throw error
  return data
}

export async function searchRestaurants(query: string, cuisine?: string, location?: string) {
  let queryBuilder = supabase
    .from('restaurants')
    .select('*')
    .eq('is_active', true)

  if (query) {
    queryBuilder = queryBuilder.or(
      `name.ilike.%${query}%,description.ilike.%${query}%,cuisine_type.ilike.%${query}%`
    )
  }

  if (cuisine) {
    queryBuilder = queryBuilder.eq('cuisine_type', cuisine)
  }

  if (location) {
    queryBuilder = queryBuilder.ilike('address', `%${location}%`)
  }

  const { data, error } = await queryBuilder
    .order('rating', { ascending: false })

  if (error) throw error
  return data as Restaurant[]
}
```

## Step 5: Update Cart Context

Replace `/lib/cart-context.tsx` with Supabase integration:

```typescript
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

export interface CartItem {
  menu_item_id: string
  quantity: number
  special_instructions?: string
  menu_item?: {
    id: string
    name: string
    price: number
    image_url?: string
    restaurant_id: string
  }
}

interface CartContextType {
  items: CartItem[]
  loading: boolean
  addToCart: (item: CartItem) => void
  removeFromCart: (menuItemId: string) => void
  updateQuantity: (menuItemId: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  placeOrder: (orderData: any) => Promise<any>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error loading cart:', error)
        localStorage.removeItem('cart')
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const addToCart = (newItem: CartItem) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(
        item => item.menu_item_id === newItem.menu_item_id
      )

      if (existingItem) {
        // Update quantity if item already exists
        return currentItems.map(item =>
          item.menu_item_id === newItem.menu_item_id
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        )
      } else {
        // Add new item
        return [...currentItems, newItem]
      }
    })
  }

  const removeFromCart = (menuItemId: string) => {
    setItems(currentItems => 
      currentItems.filter(item => item.menu_item_id !== menuItemId)
    )
  }

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId)
      return
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.menu_item_id === menuItemId
          ? { ...item, quantity }
          : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
    localStorage.removeItem('cart')
  }

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      const price = item.menu_item?.price || 0
      return total + (price * item.quantity)
    }, 0)
  }

  const placeOrder = async (orderData: {
    restaurant_id: string
    order_type: 'dine_in' | 'takeout' | 'delivery'
    special_instructions?: string
    delivery_address?: string
    tip_amount?: number
  }) => {
    if (!user) throw new Error('User must be logged in')
    if (items.length === 0) throw new Error('Cart is empty')

    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('create-order', {
        body: {
          ...orderData,
          cart_items: items.map(item => ({
            menu_item_id: item.menu_item_id,
            quantity: item.quantity,
            special_instructions: item.special_instructions
          }))
        }
      })

      if (error) throw error

      // Clear cart on successful order
      clearCart()
      
      return data
    } finally {
      setLoading(false)
    }
  }

  return (
    <CartContext.Provider value={{
      items,
      loading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice,
      placeOrder
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
```

## Step 6: Update Profile Service

Replace `/lib/user-profile-service.ts` with Supabase:

```typescript
import { supabase, Profile } from './supabase'
import { useAuth } from './auth-context'

export async function getUserProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data
}

export async function updateUserProfile(
  userId: string, 
  updates: Partial<Profile>
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)

  if (error) throw error
}

export async function getUserPreferences(userId: string) {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw error
  }

  return data
}

export async function updateUserPreferences(
  userId: string, 
  preferences: any
) {
  const { error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: userId,
      ...preferences
    })

  if (error) throw error
}

export async function getUserStatistics(userId: string) {
  const { data, error } = await supabase
    .from('user_statistics')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw error
  }

  return data
}

export async function uploadProfileImage(
  userId: string, 
  file: File
): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}-${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('profile-avatars')
    .upload(fileName, file, { upsert: true })

  if (uploadError) throw uploadError

  const { data } = supabase.storage
    .from('profile-avatars')
    .getPublicUrl(fileName)

  // Update profile with new avatar URL
  await updateUserProfile(userId, { avatar_url: data.publicUrl })

  return data.publicUrl
}

export async function getUserActivity(userId: string) {
  // Get recent bookings and orders
  const [bookingsResult, ordersResult] = await Promise.all([
    supabase
      .from('bookings')
      .select(`
        *,
        restaurants (name, image_url)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('orders')
      .select(`
        *,
        restaurants (name, image_url)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)
  ])

  return {
    bookings: bookingsResult.data || [],
    orders: ordersResult.data || []
  }
}
```

## Step 7: Create Booking Service

New file `/lib/booking-service.ts`:

```typescript
import { supabase } from './supabase'
import { useAuth } from './auth-context'

export async function createBooking(bookingData: {
  restaurant_id: string
  booking_date: string
  booking_time: string
  party_size: number
  special_requests?: string
}) {
  const { data, error } = await supabase.functions.invoke('create-booking', {
    body: bookingData
  })

  if (error) throw error
  return data
}

export async function getUserBookings(userId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      restaurants (name, address, phone, image_url),
      restaurant_tables (table_number, capacity, location)
    `)
    .eq('user_id', userId)
    .order('booking_date', { ascending: false })

  if (error) throw error
  return data
}

export async function cancelBooking(bookingId: string) {
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)

  if (error) throw error
}

export async function getAvailableTimeSlots(
  restaurantId: string, 
  date: string, 
  partySize: number
) {
  // This would typically come from a dedicated endpoint
  // For now, we'll query existing bookings and available tables
  const { data: tables } = await supabase
    .from('restaurant_tables')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('is_available', true)
    .gte('capacity', partySize)

  if (!tables) return []

  const { data: bookings } = await supabase
    .from('bookings')
    .select('booking_time')
    .eq('restaurant_id', restaurantId)
    .eq('booking_date', date)
    .eq('status', 'confirmed')

  // Generate available slots (simplified logic)
  const timeSlots = []
  for (let hour = 17; hour <= 22; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      const isBooked = bookings?.some(b => b.booking_time === timeString)
      
      if (!isBooked && tables.length > 0) {
        timeSlots.push(timeString)
      }
    }
  }

  return timeSlots
}
```

## Step 8: Update App Layout

Wrap your app with the Supabase providers in `/app/layout.tsx`:

```tsx
import { AuthProvider } from '@/lib/auth-context'
import { CartProvider } from '@/lib/cart-context'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
```

## Step 9: Payment Integration

For payment processing, install Stripe and create payment components:

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

Create `/components/PaymentForm.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function CheckoutForm({ clientSecret, onSuccess }: { 
  clientSecret: string
  onSuccess: () => void 
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) return

    setProcessing(true)
    setError(null)

    const { error: submitError } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!
      }
    })

    if (submitError) {
      setError(submitError.message || 'Payment failed')
    } else {
      onSuccess()
    }

    setProcessing(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <CardElement 
        options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
          },
        }}
      />
      <button 
        type="submit" 
        disabled={!stripe || processing}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {processing ? 'Processing...' : 'Pay Now'}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  )
}

export function PaymentForm({ clientSecret, onSuccess }: {
  clientSecret: string
  onSuccess: () => void
}) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm clientSecret={clientSecret} onSuccess={onSuccess} />
    </Elements>
  )
}
```

## Step 10: Testing Your Integration

1. **Test Authentication:**
   - Sign up a new user
   - Log in/out
   - Check profile creation

2. **Test Database Operations:**
   - Browse restaurants
   - View menu items
   - Add items to cart

3. **Test Booking System:**
   - Create a booking
   - Process payment
   - View booking history

4. **Test Order System:**
   - Add items to cart
   - Place order
   - Process payment
   - View order history

## Migration Checklist

- [ ] Install Supabase and Stripe dependencies
- [ ] Create Supabase client configuration
- [ ] Update authentication context
- [ ] Migrate restaurant service
- [ ] Update cart context with Supabase
- [ ] Replace profile service
- [ ] Create booking service
- [ ] Add payment form components
- [ ] Test all functionality
- [ ] Remove localStorage dependencies
- [ ] Update error handling
- [ ] Add loading states

## Performance Considerations

1. **Caching:** Implement proper caching for restaurant data
2. **Pagination:** Add pagination for large lists
3. **Real-time:** Use Supabase real-time for live updates
4. **Image Optimization:** Optimize images and use Supabase storage
5. **Database Queries:** Optimize queries with proper indexing

Your frontend is now fully integrated with the Supabase backend!