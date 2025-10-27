import React from 'react'
import { useAuthStore } from '../store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { useI18n } from '../contexts/I18nContext'
import { User, Calendar, Mail, Phone, MapPin, Edit, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'

export function ProfilePage() {
  const { user } = useAuthStore()
  const { t, formatPrice } = useI18n()

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">{t('profile.notLoggedIn')}</h2>
        <Link to="/login">
          <Button>{t('auth.login')}</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {t('profile.title')}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t('profile.subtitle')}
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  {user.firstName} {user.lastName}
                </CardTitle>
                <CardDescription>{user.email}</CardDescription>
                {user.loyaltyTier && (
                  <Badge variant="secondary" className="mt-1">
                    {user.loyaltyTier.name} Member
                  </Badge>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              {t('profile.edit')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{t('profile.email')}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            
            {user.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t('profile.phone')}</p>
                  <p className="text-sm text-muted-foreground">{user.phone}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{t('profile.memberSince')}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{t('profile.role')}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {user.role.toLowerCase().replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold">24</div>
            <p className="text-sm text-muted-foreground">{t('profile.totalBookings')}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold">{formatPrice(48500)}</div>
            <p className="text-sm text-muted-foreground">{t('profile.totalSpent')}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold">{user.loyaltyPoints || 0}</div>
            <p className="text-sm text-muted-foreground">{t('profile.loyaltyPoints')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">{t('profile.myBookings')}</h3>
                <p className="text-sm text-muted-foreground">{t('profile.myBookingsDesc')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Settings className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">{t('profile.settings')}</h3>
                <p className="text-sm text-muted-foreground">{t('profile.settingsDesc')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
