'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Gift, 
  Star, 
  Crown, 
  Zap, 
  Clock, 
  MapPin, 
  Phone, 
  ExternalLink,
  Share2,
  Heart,
  Filter,
  Search,
  Calendar,
  CreditCard,
  Users,
  TrendingUp,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle
} from 'lucide-react'
import {
  VIPTier,
  VIPExclusiveOffer,
  CrossPromotion,
  NigerianPartner,
  LoyaltyPointsSystem,
  DiscountType
} from '@/lib/partner-integration'

interface CustomerOffersProps {
  userId: string
  vipTier: VIPTier
  loyaltyPoints: number
  location?: string
}

export default function CustomerOffers({ userId, vipTier, loyaltyPoints, location }: CustomerOffersProps) {
  const [vipOffers, setVipOffers] = useState<VIPExclusiveOffer[]>([])
  const [crossPromotions, setCrossPromotions] = useState<CrossPromotion[]>([])
  const [partners, setPartners] = useState<NigerianPartner[]>([])
  const [loyaltySystem, setLoyaltySystem] = useState<LoyaltyPointsSystem | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [showRedeemModal, setShowRedeemModal] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState<VIPExclusiveOffer | null>(null)

  useEffect(() => {
    loadCustomerOffers()
    loadLoyaltySystem()
  }, [userId, vipTier])

  const loadCustomerOffers = async () => {
    setLoading(true)
    try {
      // Load VIP offers for customer's tier
      const vipOffersResponse = await fetch(`/api/customers/${userId}/vip-offers?tier=${vipTier}`)
      if (vipOffersResponse.ok) {
        const data = await vipOffersResponse.json()
        setVipOffers(data)
      }

      // Load cross-promotions
      const promotionsResponse = await fetch(`/api/customers/${userId}/cross-promotions`)
      if (promotionsResponse.ok) {
        const data = await promotionsResponse.json()
        setCrossPromotions(data)
      }

      // Load available partners
      const partnersResponse = await fetch('/api/partners/available')
      if (partnersResponse.ok) {
        const data = await partnersResponse.json()
        setPartners(data)
      }
    } catch (error) {
      console.error('Failed to load customer offers:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadLoyaltySystem = async () => {
    try {
      const response = await fetch(`/api/customers/${userId}/loyalty`)
      if (response.ok) {
        const data = await response.json()
        setLoyaltySystem(data)
      }
    } catch (error) {
      console.error('Failed to load loyalty system:', error)
    }
  }

  const redeemOffer = async (offerId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/customers/${userId}/redeem-offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId })
      })

      if (response.ok) {
        // Refresh offers and loyalty system
        await loadCustomerOffers()
        await loadLoyaltySystem()
        setShowRedeemModal(false)
        setSelectedOffer(null)
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to redeem offer')
      }
    } catch (error) {
      console.error('Failed to redeem offer:', error)
      alert('Failed to redeem offer')
    } finally {
      setLoading(false)
    }
  }

  const shareOffer = (offer: VIPExclusiveOffer) => {
    if (navigator.share) {
      navigator.share({
        title: offer.title,
        text: offer.description,
        url: window.location.href
      })
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(`${offer.title} - ${offer.description} ${window.location.href}`)
      alert('Offer copied to clipboard!')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount)
  }

  const getVIPTierIcon = (tier: VIPTier) => {
    const icons = {
      [VIPTier.BRONZE_VIP]: '🥉',
      [VIPTier.SILVER_VIP]: '🥈',
      [VIPTier.GOLD_VIP]: '🥇',
      [VIPTier.PLATINUM_VIP]: '💎',
      [VIPTier.DIAMOND_VIP]: '👑',
      [VIPTier.BLACK_CARD]: '🖤'
    }
    return icons[tier] || '⭐'
  }

  const getVIPTierColor = (tier: VIPTier) => {
    const colors = {
      [VIPTier.BRONZE_VIP]: 'bg-orange-100 text-orange-800 border-orange-200',
      [VIPTier.SILVER_VIP]: 'bg-gray-100 text-gray-800 border-gray-200',
      [VIPTier.GOLD_VIP]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      [VIPTier.PLATINUM_VIP]: 'bg-purple-100 text-purple-800 border-purple-200',
      [VIPTier.DIAMOND_VIP]: 'bg-blue-100 text-blue-800 border-blue-200',
      [VIPTier.BLACK_CARD]: 'bg-gray-900 text-white border-gray-700'
    }
    return colors[tier] || 'bg-gray-100 text-gray-800'
  }

  const getDiscountDisplay = (discount: any) => {
    if (discount.type === DiscountType.PERCENTAGE) {
      return `${discount.value}% OFF`
    } else if (discount.type === DiscountType.FIXED_AMOUNT) {
      return `${formatCurrency(discount.value)} OFF`
    } else if (discount.type === DiscountType.BUY_ONE_GET_ONE) {
      return 'Buy 1 Get 1 FREE'
    }
    return 'Special Offer'
  }

  const filteredOffers = vipOffers.filter(offer => {
    const matchesCategory = selectedCategory === 'all' || 
      offer.partnerId.toLowerCase().includes(selectedCategory.toLowerCase())
    const matchesSearch = offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const activePromotions = crossPromotions.filter(p => p.status === 'ACTIVE')
  const loyaltyTier = loyaltySystem?.tier || 'BRONZE'

  return (
    <div className="space-y-6">
      {/* VIP Status Header */}
      <Card className={`border-2 ${getVIPTierColor(vipTier)}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{getVIPTierIcon(vipTier)}</div>
              <div>
                <h2 className="text-2xl font-bold capitalize">{vipTier.replace('_', ' ')} Member</h2>
                <p className="text-sm opacity-80">Premium benefits and exclusive offers</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">Loyalty Points</p>
              <p className="text-3xl font-bold">{loyaltyPoints.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Gift className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Available Offers</p>
                <p className="text-2xl font-bold">{filteredOffers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Partner Brands</p>
                <p className="text-2xl font-bold">{partners.length}+</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Active Promotions</p>
                <p className="text-2xl font-bold">{activePromotions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Loyalty Tier</p>
                <p className="text-2xl font-bold">{loyaltyTier}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search offers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('all')}
              >
                All Offers
              </Button>
              <Button 
                variant={selectedCategory === 'bank' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('bank')}
              >
                Banks
              </Button>
              <Button 
                variant={selectedCategory === 'telecom' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('telecom')}
              >
                Telecom
              </Button>
              <Button 
                variant={selectedCategory === 'retail' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('retail')}
              >
                Retail
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Offers Sections */}
      <Tabs defaultValue="vip-offers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vip-offers">
            <Crown className="w-4 h-4 mr-2" />
            VIP Exclusive
          </TabsTrigger>
          <TabsTrigger value="promotions">
            <Zap className="w-4 h-4 mr-2" />
            Cross-Promotions
          </TabsTrigger>
          <TabsTrigger value="partners">
            <Users className="w-4 h-4 mr-2" />
            Partner Network
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vip-offers" className="space-y-6">
          {filteredOffers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOffers.map((offer) => (
                <Card key={offer.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Discount Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-red-500 text-white">
                      {getDiscountDisplay(offer.discount)}
                    </Badge>
                  </div>

                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg">
                        <Gift className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{offer.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {offer.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Offer Details */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">VIP Tier Required:</span>
                        <Badge variant="outline" className={getVIPTierColor(offer.vipTier)}>
                          {offer.vipTier.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Availability:</span>
                        <span className="font-medium">
                          {offer.availability.currentUsage} / {offer.availability.maxUsage}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Min. Booking:</span>
                        <span className="font-medium">{formatCurrency(offer.bookingRequirement)}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Usage</span>
                        <span>{Math.round((offer.availability.currentUsage / offer.availability.maxUsage) * 100)}%</span>
                      </div>
                      <Progress 
                        value={(offer.availability.currentUsage / offer.availability.maxUsage) * 100} 
                        className="h-2"
                      />
                    </div>

                    {/* Rating */}
                    {offer.usage.averageRating > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < offer.usage.averageRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">({offer.usage.totalRedeemed} reviews)</span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        className="flex-1"
                        onClick={() => {
                          setSelectedOffer(offer)
                          setShowRedeemModal(true)
                        }}
                        disabled={offer.availability.currentUsage >= offer.availability.maxUsage}
                      >
                        <Gift className="w-4 h-4 mr-2" />
                        Redeem
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => shareOffer(offer)}>
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No VIP offers available</h3>
                <p className="text-gray-500 mb-4">Check back later for exclusive offers</p>
                <Button variant="outline">
                  Browse All Offers
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="promotions" className="space-y-6">
          {activePromotions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activePromotions.map((promotion) => (
                <Card key={promotion.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                        <Zap className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{promotion.title}</CardTitle>
                        <CardDescription>{promotion.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Promotion Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Impressions</p>
                        <p className="font-bold">{promotion.metrics.impressions.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Conversions</p>
                        <p className="font-bold">{promotion.metrics.conversions}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Revenue</p>
                        <p className="font-bold">{formatCurrency(promotion.metrics.revenue)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Conversion Rate</p>
                        <p className="font-bold">{promotion.metrics.conversionRate.toFixed(1)}%</p>
                      </div>
                    </div>

                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Engagement</span>
                        <span>{promotion.metrics.engagementRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={promotion.metrics.engagementRate} className="h-2" />
                    </div>

                    {/* Validity */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>
                        Valid until {new Date(promotion.validityPeriod.endDate).toLocaleDateString()}
                      </span>
                    </div>

                    <Button className="w-full">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Explore Promotion
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No active promotions</h3>
                <p className="text-gray-500">New promotions will appear here when available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="partners" className="space-y-6">
          {/* Partner Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Our Partner Network</h3>
            
            {/* Nigerian Banks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🏦 Banking Partners
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {NIGERIAN_BANKS.map((bank) => (
                    <div key={bank.id} className="text-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="text-2xl mb-2">{getPartnerTypeIcon(bank.type)}</div>
                      <p className="font-medium text-sm">{bank.name}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {bank.partnershipTerms.commission * 100}% Cashback
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Nigerian Telecom */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📱 Telecom Partners
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {NIGERIAN_TELECOMS.map((telecom) => (
                    <div key={telecom.id} className="text-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="text-2xl mb-2">{getPartnerTypeIcon(telecom.type)}</div>
                      <p className="font-medium text-sm">{telecom.name}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {telecom.partnershipTerms.commission * 100}% Discount
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Nigerian Retail */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🛒 Retail Partners
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {NIGERIAN_RETAIL.map((retail) => (
                    <div key={retail.id} className="text-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="text-2xl mb-2">{getPartnerTypeIcon(retail.type)}</div>
                      <p className="font-medium text-sm">{retail.name}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {retail.partnershipTerms.commission * 100}% Rewards
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Nigerian Entertainment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎬 Entertainment Partners
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {NIGERIAN_ENTERTAINMENT.map((entertainment) => (
                    <div key={entertainment.id} className="text-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="text-2xl mb-2">{getPartnerTypeIcon(entertainment.type)}</div>
                      <p className="font-medium text-sm">{entertainment.name}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {entertainment.partnershipTerms.commission * 100}% Bundle
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Redeem Offer Modal */}
      {showRedeemModal && selectedOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Redeem Offer</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">{selectedOffer.title}</h4>
                <p className="text-sm text-gray-600">{selectedOffer.description}</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Discount</span>
                  <span className="font-bold">{getDiscountDisplay(selectedOffer.discount)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Min. Booking</span>
                  <span className="font-medium">{formatCurrency(selectedOffer.bookingRequirement)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Your Points</span>
                  <span className="font-medium">{loyaltyPoints.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowRedeemModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={() => redeemOffer(selectedOffer.id)} className="flex-1" disabled={loading}>
                  {loading ? 'Redeeming...' : 'Confirm Redeem'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function getPartnerTypeIcon(type: string) {
  const icons = {
    bank: '🏦',
    telecom: '📱',
    retail: '🛒',
    entertainment: '🎬',
    restaurant: '🍽️'
  }
  return icons[type as keyof typeof icons] || '🏢'
}