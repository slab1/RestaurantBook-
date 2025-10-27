'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  Building2, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Star, 
  FileText, 
  Settings, 
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Gift,
  CreditCard,
  BarChart3
} from 'lucide-react'
import {
  PartnerType,
  PartnerTier,
  NigerianPartner,
  MerchantAnalytics,
  CrossPromotion,
  VIPExclusiveOffer,
  RevenueMetrics,
  AnalyticsPeriod
} from '@/lib/partner-integration'

interface PartnerManagementProps {
  userId: string
  userRole: 'ADMIN' | 'PARTNER_MANAGER' | 'PARTNER'
}

export default function PartnerManagement({ userId, userRole }: PartnerManagementProps) {
  const [partners, setPartners] = useState<NigerianPartner[]>([])
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<MerchantAnalytics | null>(null)
  const [crossPromotions, setCrossPromotions] = useState<CrossPromotion[]>([])
  const [vipOffers, setVipOffers] = useState<VIPExclusiveOffer[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<PartnerType | 'ALL'>('ALL')
  const [loading, setLoading] = useState(false)
  const [showOnboardingForm, setShowOnboardingForm] = useState(false)

  useEffect(() => {
    loadPartners()
    if (selectedPartner) {
      loadPartnerData(selectedPartner)
    }
  }, [selectedPartner])

  const loadPartners = async () => {
    setLoading(true)
    try {
      // Load Nigerian partners
      const allPartners = [
        ...NIGERIAN_BANKS,
        ...NIGERIAN_TELECOMS,
        ...NIGERIAN_RETAIL,
        ...NIGERIAN_ENTERTAINMENT
      ]
      setPartners(allPartners)
    } catch (error) {
      console.error('Failed to load partners:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPartnerData = async (partnerId: string) => {
    setLoading(true)
    try {
      // Load analytics
      const analyticsData = await fetch(`/api/partners/${partnerId}/analytics?period=MONTHLY`)
      if (analyticsData.ok) {
        const data = await analyticsData.json()
        setAnalytics(data)
      }

      // Load cross-promotions
      const promotionsData = await fetch(`/api/partners/${partnerId}/promotions`)
      if (promotionsData.ok) {
        const data = await promotionsData.json()
        setCrossPromotions(data)
      }

      // Load VIP offers
      const offersData = await fetch(`/api/partners/${partnerId}/vip-offers`)
      if (offersData.ok) {
        const data = await offersData.json()
        setVipOffers(data)
      }
    } catch (error) {
      console.error('Failed to load partner data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'ALL' || partner.type === filterType
    return matchesSearch && matchesFilter
  })

  const getTierColor = (tier: PartnerTier) => {
    const colors = {
      [PartnerTier.BRONZE]: 'bg-orange-100 text-orange-800',
      [PartnerTier.SILVER]: 'bg-gray-100 text-gray-800',
      [PartnerTier.GOLD]: 'bg-yellow-100 text-yellow-800',
      [PartnerTier.PLATINUM]: 'bg-purple-100 text-purple-800',
      [PartnerTier.DIAMOND]: 'bg-blue-100 text-blue-800'
    }
    return colors[tier] || 'bg-gray-100 text-gray-800'
  }

  const getPartnerTypeIcon = (type: PartnerType) => {
    const icons = {
      [PartnerType.BANK]: '🏦',
      [PartnerType.TELECOM]: '📱',
      [PartnerType.RETAIL]: '🛒',
      [PartnerType.ENTERTAINMENT]: '🎬',
      [PartnerType.RESTAURANT]: '🍽️',
      [PartnerType.TRANSPORT]: '🚗',
      [PartnerType.REAL_ESTATE]: '🏠',
      [PartnerType.HOSPITALITY]: '🏨'
    }
    return icons[type] || '🏢'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Partner Management</h1>
          <p className="text-gray-600">Manage partnerships, analytics, and integrations</p>
        </div>
        <div className="flex gap-2">
          {(userRole === 'ADMIN' || userRole === 'PARTNER_MANAGER') && (
            <>
              <Button onClick={() => setShowOnboardingForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Partner
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Partners</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Label htmlFor="filter">Filter by Type</Label>
              <Select value={filterType} onValueChange={(value) => setFilterType(value as PartnerType | 'ALL')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="BANK">Banks</SelectItem>
                  <SelectItem value="TELECOM">Telecoms</SelectItem>
                  <SelectItem value="RETAIL">Retail</SelectItem>
                  <SelectItem value="ENTERTAINMENT">Entertainment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Partner Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPartners.map((partner) => (
          <Card key={partner.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedPartner(partner.id)}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getPartnerTypeIcon(partner.type)}</div>
                  <div>
                    <CardTitle className="text-lg">{partner.name}</CardTitle>
                    <CardDescription>{partner.type}</CardDescription>
                  </div>
                </div>
                <Badge className={getTierColor(partner.partnershipTerms.commission >= 0.05 ? PartnerTier.GOLD : PartnerTier.SILVER)}>
                  {partner.partnershipTerms.commission * 100}% Commission
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Min. Booking:</span>
                  <span className="font-medium">{formatCurrency(partner.partnershipTerms.minBookingValue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Loyalty Program:</span>
                  <span className="font-medium">{partner.integration.loyaltyProgram}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">VIP Tier:</span>
                  <span className="font-medium">{partner.integration.vipTier}</span>
                </div>
                <div className="flex gap-2">
                  {partner.partnershipTerms.exclusiveOffers && (
                    <Badge variant="secondary" className="text-xs">Exclusive Offers</Badge>
                  )}
                  <Badge variant="outline" className="text-xs">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Partner Details Modal/Drawer */}
      {selectedPartner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Partner Details</h2>
                <Button variant="outline" onClick={() => setSelectedPartner(null)}>
                  Close
                </Button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="promotions">Promotions</TabsTrigger>
                  <TabsTrigger value="offers">VIP Offers</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-600">Total Revenue</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{analytics ? formatCurrency(analytics.revenue.total) : '₦0'}</div>
                        <p className="text-xs text-green-600 flex items-center">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +12.5%
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-600">Bookings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{analytics ? analytics.bookings.total : 0}</div>
                        <p className="text-xs text-blue-600 flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          +8.2%
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-600">Active Customers</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{analytics ? analytics.customers.total : 0}</div>
                        <p className="text-xs text-purple-600 flex items-center">
                          <Star className="w-3 h-3 mr-1" />
                          +15.3%
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-600">Conversion Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{analytics ? `${analytics.bookings.conversionRate}%` : '0%'}</div>
                        <Progress value={analytics ? analytics.bookings.conversionRate : 0} className="mt-2" />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="font-medium">Payment Integration Verified</p>
                            <p className="text-sm text-gray-600">Paystack integration is working properly</p>
                          </div>
                          <span className="text-xs text-gray-500 ml-auto">2 hours ago</span>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                          <Target className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="font-medium">New Cross-Promotion Created</p>
                            <p className="text-sm text-gray-600">With Guaranty Trust Bank</p>
                          </div>
                          <span className="text-xs text-gray-500 ml-auto">1 day ago</span>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                          <Gift className="w-5 h-5 text-orange-600" />
                          <div>
                            <p className="font-medium">VIP Offer Created</p>
                            <p className="text-sm text-gray-600">20% discount for Diamond VIP members</p>
                          </div>
                          <span className="text-xs text-gray-500 ml-auto">2 days ago</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                  {analytics && (
                    <>
                      {/* Revenue Breakdown */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Revenue Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span>Gross Revenue</span>
                              <span className="font-bold">{formatCurrency(analytics.revenue.total)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Commission ({analytics.revenue.commission}%)</span>
                              <span className="text-red-600">-{formatCurrency(analytics.revenue.total * analytics.revenue.commission)}</span>
                            </div>
                            <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                              <span>Net Revenue</span>
                              <span>{formatCurrency(analytics.revenue.net)}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Booking Metrics */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Booking Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">Total Bookings</p>
                              <p className="text-2xl font-bold">{analytics.bookings.total}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Completion Rate</p>
                              <p className="text-2xl font-bold">{((analytics.bookings.completed / analytics.bookings.total) * 100).toFixed(1)}%</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Average Booking Value</p>
                              <p className="text-2xl font-bold">{formatCurrency(analytics.bookings.averageBookingValue)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Repeat Rate</p>
                              <p className="text-2xl font-bold">{analytics.bookings.repeatBookingRate}%</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="promotions" className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Cross-Promotions</h3>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      New Promotion
                    </Button>
                  </div>
                  
                  {crossPromotions.length > 0 ? (
                    <div className="space-y-4">
                      {crossPromotions.map((promotion) => (
                        <Card key={promotion.id}>
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle>{promotion.title}</CardTitle>
                                <CardDescription>{promotion.description}</CardDescription>
                              </div>
                              <Badge variant={promotion.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                {promotion.status}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600">Impressions</p>
                                <p className="font-bold">{promotion.metrics.impressions.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Clicks</p>
                                <p className="font-bold">{promotion.metrics.clicks.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Conversions</p>
                                <p className="font-bold">{promotion.metrics.conversions.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Revenue</p>
                                <p className="font-bold">{formatCurrency(promotion.metrics.revenue)}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="text-center py-8">
                        <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No cross-promotions yet</p>
                        <Button className="mt-4">
                          <Plus className="w-4 h-4 mr-2" />
                          Create First Promotion
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="offers" className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">VIP Exclusive Offers</h3>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      New VIP Offer
                    </Button>
                  </div>
                  
                  {vipOffers.length > 0 ? (
                    <div className="space-y-4">
                      {vipOffers.map((offer) => (
                        <Card key={offer.id}>
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle>{offer.title}</CardTitle>
                                <CardDescription>{offer.description}</CardDescription>
                              </div>
                              <Badge variant="outline">{offer.vipTier}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-600">Discount</p>
                                <p className="text-lg font-bold">
                                  {offer.discount.type === 'PERCENTAGE' ? `${offer.discount.value}%` : formatCurrency(offer.discount.value)}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Usage</p>
                                <p className="text-lg font-bold">
                                  {offer.usage.totalClaimed} / {offer.availability.maxUsage}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Avg. Rating</p>
                                <p className="text-lg font-bold">{offer.usage.averageRating}/5</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Status</p>
                                <Badge variant={offer.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                  {offer.status}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="text-center py-8">
                        <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No VIP offers yet</p>
                        <Button className="mt-4">
                          <Plus className="w-4 h-4 mr-2" />
                          Create First VIP Offer
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Partner Settings</CardTitle>
                      <CardDescription>Manage integration settings and preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="commission">Commission Rate (%)</Label>
                          <Input id="commission" type="number" defaultValue="5" />
                        </div>
                        
                        <div>
                          <Label htmlFor="minBooking">Minimum Booking Value</Label>
                          <Input id="minBooking" type="number" defaultValue="5000" />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="exclusive" defaultChecked />
                          <Label htmlFor="exclusive">Enable exclusive offers</Label>
                        </div>
                        
                        <div>
                          <Label htmlFor="paymentProvider">Payment Provider</Label>
                          <Select defaultValue="paystack">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="paystack">Paystack</SelectItem>
                              <SelectItem value="flutterwave">Flutterwave</SelectItem>
                              <SelectItem value="monnify">Monnify</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="pt-4 border-t">
                          <Button className="w-full">
                            <Settings className="w-4 h-4 mr-2" />
                            Update Settings
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Integration Status */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Integration Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          <span>Payment Integration</span>
                        </div>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          <span>Loyalty Program</span>
                        </div>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" />
                          <span>Analytics Tracking</span>
                        </div>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}