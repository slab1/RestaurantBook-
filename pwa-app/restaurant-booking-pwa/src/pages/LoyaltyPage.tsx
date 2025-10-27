import React, { useEffect, useState } from 'react'
import { useAuthStore, useLoyaltyStore } from '../store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Progress } from '../components/ui/progress'
import { useI18n } from '../contexts/I18nContext'
import {
  Award,
  Gift,
  Crown,
  Star,
  TrendingUp,
  Calendar,
  MapPin,
  Users,
  Sparkles,
  Trophy,
  Target,
  Clock,
  ArrowRight,
} from 'lucide-react'

export function LoyaltyPage() {
  const { user } = useAuthStore()
  const { userLoyalty, fetchLoyaltyInfo } = useLoyaltyStore()
  const { t, formatPrice } = useI18n()
  
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (user) {
      fetchLoyaltyInfo()
    }
  }, [user])

  if (!user || !userLoyalty) {
    return (
      <div className="text-center py-12">
        <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">{t('loyalty.notLoggedIn')}</h2>
        <p className="text-muted-foreground mb-4">{t('loyalty.loginRequired')}</p>
        <Button onClick={() => window.location.href = '/login'}>
          {t('auth.login')}
        </Button>
      </div>
    )
  }

  const tierProgress = userLoyalty.tier.maxPoints 
    ? ((userLoyalty.points - userLoyalty.tier.minPoints) / (userLoyalty.tier.maxPoints - userLoyalty.tier.minPoints)) * 100
    : 100

  const nextTierPoints = userLoyalty.tier.maxPoints 
    ? userLoyalty.tier.maxPoints - userLoyalty.points 
    : 0

  const tiers = [
    {
      name: 'Bronze',
      minPoints: 0,
      maxPoints: 499,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      icon: Award,
    },
    {
      name: 'Silver',
      minPoints: 500,
      maxPoints: 999,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      icon: Star,
    },
    {
      name: 'Gold',
      minPoints: 1000,
      maxPoints: 4999,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      icon: Crown,
    },
    {
      name: 'Platinum',
      minPoints: 5000,
      maxPoints: null,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      icon: Trophy,
    },
  ]

  const currentTier = tiers.find(tier => 
    userLoyalty.points >= tier.minPoints && 
    (tier.maxPoints === null || userLoyalty.points <= tier.maxPoints)
  )

  const benefits = [
    {
      icon: Gift,
      title: t('loyalty.benefit1.title'),
      description: t('loyalty.benefit1.description'),
      available: true,
    },
    {
      icon: Clock,
      title: t('loyalty.benefit2.title'),
      description: t('loyalty.benefit2.description'),
      available: userLoyalty.tier.priorityReservations,
    },
    {
      icon: Sparkles,
      title: t('loyalty.benefit3.title'),
      description: t('loyalty.benefit3.description'),
      available: userLoyalty.tier.exclusiveOffers,
    },
    {
      icon: MapPin,
      title: t('loyalty.benefit4.title'),
      description: t('loyalty.benefit4.description'),
      available: userLoyalty.tier.freeDelivery,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {t('loyalty.title')}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t('loyalty.subtitle')}
        </p>
      </div>

      {/* Current Tier Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                {currentTier?.icon && <currentTier.icon className={`h-6 w-6 ${currentTier.color}`} />}
                <span>{t('loyalty.currentTier')}</span>
              </CardTitle>
              <CardDescription>{t('loyalty.tierDescription')}</CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {userLoyalty.tier.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{userLoyalty.points.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">{t('loyalty.pointsEarned')}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">
                {nextTierPoints > 0 
                  ? `${nextTierPoints} ${t('loyalty.pointsToNextTier')}` 
                  : t('loyalty.maxTierReached')}
              </p>
              <p className="text-sm text-muted-foreground">{t('loyalty.nextTier')}</p>
            </div>
          </div>
          
          {nextTierPoints > 0 && (
            <div className="space-y-2">
              <Progress value={tierProgress} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {Math.round(tierProgress)}% {t('loyalty.progressToNextTier')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {[
          { id: 'overview', label: t('loyalty.overview') },
          { id: 'tiers', label: t('loyalty.tiers') },
          { id: 'benefits', label: t('loyalty.benefits') },
          { id: 'history', label: t('loyalty.history') },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                {t('loyalty.quickStats')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{t('loyalty.totalBookings')}</span>
                <span className="text-lg font-bold">24</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{t('loyalty.visitsThisMonth')}</span>
                <span className="text-lg font-bold">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{t('loyalty.favoriteCuisine')}</span>
                <Badge variant="outline">Nigerian</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{t('loyalty.averageSpent')}</span>
                <span className="text-lg font-bold">{formatPrice(12500)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                {t('loyalty.recentActivity')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userLoyalty.transactions.slice(0, 3).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        transaction.type === 'EARN' ? 'bg-green-500' : 
                        transaction.type === 'REDEEM' ? 'bg-red-500' : 'bg-blue-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={
                      transaction.type === 'EARN' ? 'secondary' : 
                      transaction.type === 'REDEEM' ? 'destructive' : 'outline'
                    }>
                      {transaction.type === 'EARN' ? '+' : '-'}{transaction.points}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'tiers' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t('loyalty.tiersTitle')}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {tiers.map((tier, index) => {
              const Icon = tier.icon
              const isCurrentTier = tier.name === userLoyalty.tier.name
              const isUnlocked = userLoyalty.points >= tier.minPoints
              
              return (
                <Card key={tier.name} className={`${isCurrentTier ? 'ring-2 ring-primary' : ''} ${tier.bgColor}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <Icon className={`h-5 w-5 ${tier.color}`} />
                        <span>{tier.name}</span>
                      </CardTitle>
                      {isCurrentTier && <Badge>Current</Badge>}
                      {!isUnlocked && index < tiers.length - 1 && (
                        <Badge variant="outline">Locked</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {tier.minPoints.toLocaleString()} - {tier.maxPoints?.toLocaleString() || '∞'} {t('loyalty.points')}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{t('loyalty.discount')}</span>
                        <span>{index === 0 ? '0%' : index === 1 ? '5%' : index === 2 ? '10%' : '15%'} off</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>{t('loyalty.priorityReservations')}</span>
                        <span>{index >= 1 ? '✓' : '×'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>{t('loyalty.exclusiveOffers')}</span>
                        <span>{index >= 2 ? '✓' : '×'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>{t('loyalty.freeDelivery')}</span>
                        <span>{index >= 3 ? '✓' : '×'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === 'benefits' && (
        <div className="grid md:grid-cols-2 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <Card key={index} className={benefit.available ? '' : 'opacity-60'}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2">
                    <Icon className={`h-5 w-5 ${benefit.available ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span>{benefit.title}</span>
                  </CardTitle>
                  <CardDescription>{benefit.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {benefit.available ? t('loyalty.available') : t('loyalty.locked')}
                    </span>
                    <Badge variant={benefit.available ? 'secondary' : 'outline'}>
                      {benefit.available ? '✓' : '×'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle>{t('loyalty.transactionHistory')}</CardTitle>
            <CardDescription>{t('loyalty.transactionHistoryDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userLoyalty.transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      transaction.type === 'EARN' ? 'bg-green-500' : 
                      transaction.type === 'REDEEM' ? 'bg-red-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      transaction.type === 'EARN' ? 'secondary' : 
                      transaction.type === 'REDEEM' ? 'destructive' : 'outline'
                    }>
                      {transaction.type === 'EARN' ? '+' : '-'}{transaction.points}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CTA Section */}
      <Card className="bg-gradient-to-r from-primary to-purple-600 text-white">
        <CardContent className="p-6 text-center space-y-4">
          <h3 className="text-xl font-bold">{t('loyalty.ctaTitle')}</h3>
          <p className="text-primary-foreground/90">{t('loyalty.ctaDescription')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary">
              <Target className="mr-2 h-4 w-4" />
              {t('loyalty.earnPoints')}
            </Button>
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Gift className="mr-2 h-4 w-4" />
              {t('loyalty.redeemPoints')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
