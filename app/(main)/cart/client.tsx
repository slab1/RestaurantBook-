'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Minus, Plus, Trash2, ShoppingCart, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/components/providers/auth-provider'

export function CartClient() {
  const router = useRouter()
  const { items, removeItem, updateQuantity, clearCart, getSubtotal, getTax, getTotal } = useCart()
  const { user } = useAuth()

  const subtotal = getSubtotal()
  const tax = getTax()
  const total = getTotal()

  const handleCheckout = () => {
    if (!user) {
      // Redirect to login if not authenticated
      router.push('/login?redirect=/cart')
      return
    }
    
    // In a real app, this would navigate to checkout page
    alert('Checkout functionality would be implemented here')
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-gray-100 rounded-full p-6">
                <ShoppingCart className="h-16 w-16 text-gray-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Add items from restaurant menus to get started
            </p>
            <Button onClick={() => router.push('/restaurants')}>
              Browse Restaurants
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Group items by restaurant
  const itemsByRestaurant = items.reduce((acc, item) => {
    if (!acc[item.restaurantId]) {
      acc[item.restaurantId] = {
        restaurantName: item.restaurantName,
        items: []
      }
    }
    acc[item.restaurantId].items.push(item)
    return acc
  }, {} as Record<string, { restaurantName: string; items: typeof items }>)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
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
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          </div>
          {items.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearCart}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Cart
            </Button>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(itemsByRestaurant).map(([restaurantId, { restaurantName, items: restaurantItems }]) => (
              <Card key={restaurantId}>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {restaurantName}
                  </h2>
                  <div className="space-y-4">
                    {restaurantItems.map(item => (
                      <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0 last:pb-0">
                        {/* Item Image */}
                        <div className="relative w-24 h-24 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>

                        {/* Item Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-600 capitalize mb-2">
                            {item.category}
                          </p>
                          <p className="text-lg font-bold text-orange-600">
                            ${item.price.toFixed(2)}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex flex-col items-end justify-between">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-700 p-1 h-8 w-8"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <p className="text-sm font-semibold text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (8%)</span>
                    <span className="font-medium text-gray-900">
                      ${tax.toFixed(2)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-orange-600">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button 
                  onClick={handleCheckout} 
                  className="w-full mb-3"
                  size="lg"
                >
                  Proceed to Checkout
                </Button>

                <Button 
                  variant="outline" 
                  onClick={() => router.push('/restaurants')}
                  className="w-full"
                >
                  Continue Shopping
                </Button>

                {/* Cart Summary */}
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Total Items</span>
                    <span className="font-medium">{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
                    <span>Restaurants</span>
                    <span className="font-medium">{Object.keys(itemsByRestaurant).length}</span>
                  </div>
                </div>

                {/* Info */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong> Orders from multiple restaurants will be processed separately.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
