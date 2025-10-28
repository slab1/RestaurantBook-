'use client'

import { useAuth } from '@/components/providers/auth-provider'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, User, Bell, Lock, Shield, Trash2, Save, AlertTriangle, UtensilsCrossed } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { 
  getUserProfile, 
  updateUserProfile, 
  updatePreferences, 
  updateSettings, 
  deleteAccount,
  type UserProfile 
} from '@/lib/user-profile-service'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'

const CUISINE_OPTIONS = [
  'Italian', 'Japanese', 'Chinese', 'Mexican', 'Indian', 'Thai', 
  'French', 'Greek', 'Spanish', 'American', 'Korean', 'Vietnamese'
]

const DIETARY_OPTIONS = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 
  'Halal', 'Kosher', 'Pescatarian', 'Keto', 'Paleo'
]

export function SettingsClient() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [saving, setSaving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  
  // Form states
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    if (user) {
      const userProfile = getUserProfile(user.id, user.email, user.firstName, user.lastName)
      setProfile(userProfile)
      setPhone(userProfile.phone || '')
      setBio(userProfile.bio || '')
    }
  }, [user])

  if (!user) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="mb-4">Please sign in to access settings</p>
            <Button onClick={() => router.push('/login')}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) return null

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      updateUserProfile({ phone, bio })
      setProfile(prev => prev ? { ...prev, phone, bio } : null)
      toast({
        title: 'Success',
        description: 'Profile information updated successfully'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all password fields',
        variant: 'destructive'
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        variant: 'destructive'
      })
      return
    }

    if (newPassword.length < 8) {
      toast({
        title: 'Error',
        description: 'Password must be at least 8 characters',
        variant: 'destructive'
      })
      return
    }

    // In a real app, this would call an API
    toast({
      title: 'Success',
      description: 'Password changed successfully'
    })
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const handleToggleCuisine = (cuisine: string) => {
    const updated = profile.preferences.cuisinePreferences.includes(cuisine)
      ? profile.preferences.cuisinePreferences.filter(c => c !== cuisine)
      : [...profile.preferences.cuisinePreferences, cuisine]
    
    updatePreferences({ cuisinePreferences: updated })
    setProfile(prev => prev ? {
      ...prev,
      preferences: { ...prev.preferences, cuisinePreferences: updated }
    } : null)
  }

  const handleToggleDietary = (dietary: string) => {
    const updated = profile.preferences.dietaryRestrictions.includes(dietary)
      ? profile.preferences.dietaryRestrictions.filter(d => d !== dietary)
      : [...profile.preferences.dietaryRestrictions, dietary]
    
    updatePreferences({ dietaryRestrictions: updated })
    setProfile(prev => prev ? {
      ...prev,
      preferences: { ...prev.preferences, dietaryRestrictions: updated }
    } : null)
  }

  const handleToggleSetting = (category: keyof typeof profile.settings, key: string, value: boolean) => {
    const updated = { [category]: { ...profile.settings[category], [key]: value } }
    updateSettings(updated as any)
    setProfile(prev => prev ? {
      ...prev,
      settings: { ...prev.settings, ...updated }
    } : null)

    toast({
      title: 'Settings Updated',
      description: 'Your preferences have been saved'
    })
  }

  const handleDeleteAccount = () => {
    if (deleteConfirmation.toLowerCase() !== 'delete') {
      toast({
        title: 'Error',
        description: 'Please type DELETE to confirm',
        variant: 'destructive'
      })
      return
    }

    deleteAccount()
    logout()
    router.push('/')
    toast({
      title: 'Account Deleted',
      description: 'Your account has been permanently deleted'
    })
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Account Settings</h1>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your personal information and profile details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      value={user.firstName} 
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      value={user.lastName} 
                      disabled
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={user.email} 
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio" 
                    placeholder="Tell us a little about yourself..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button onClick={handleSaveProfile} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5" />
                  Cuisine Preferences
                </CardTitle>
                <CardDescription>
                  Select your favorite cuisines to get personalized recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {CUISINE_OPTIONS.map(cuisine => (
                    <div key={cuisine} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cuisine-${cuisine}`}
                        checked={profile.preferences.cuisinePreferences.includes(cuisine)}
                        onCheckedChange={() => handleToggleCuisine(cuisine)}
                      />
                      <label
                        htmlFor={`cuisine-${cuisine}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {cuisine}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dietary Restrictions</CardTitle>
                <CardDescription>
                  Help us filter restaurants and menu items based on your dietary needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {DIETARY_OPTIONS.map(dietary => (
                    <div key={dietary} className="flex items-center space-x-2">
                      <Checkbox
                        id={`dietary-${dietary}`}
                        checked={profile.preferences.dietaryRestrictions.includes(dietary)}
                        onCheckedChange={() => handleToggleDietary(dietary)}
                      />
                      <label
                        htmlFor={`dietary-${dietary}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {dietary}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Price Range Preference</CardTitle>
                <CardDescription>
                  Set your preferred dining price range
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={profile.preferences.priceRange}
                  onValueChange={(value: any) => {
                    updatePreferences({ priceRange: value })
                    setProfile(prev => prev ? {
                      ...prev,
                      preferences: { ...prev.preferences, priceRange: value }
                    } : null)
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="budget">Budget ($)</SelectItem>
                    <SelectItem value="moderate">Moderate ($$)</SelectItem>
                    <SelectItem value="upscale">Upscale ($$$)</SelectItem>
                    <SelectItem value="fine-dining">Fine Dining ($$$$)</SelectItem>
                    <SelectItem value="any">Any Price Range</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Order Updates</Label>
                    <p className="text-sm text-gray-500">
                      Get notified about your order status changes
                    </p>
                  </div>
                  <Switch
                    checked={profile.settings.notifications.orderUpdates}
                    onCheckedChange={(checked) => 
                      handleToggleSetting('notifications', 'orderUpdates', checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Booking Reminders</Label>
                    <p className="text-sm text-gray-500">
                      Receive reminders about upcoming reservations
                    </p>
                  </div>
                  <Switch
                    checked={profile.settings.notifications.bookingReminders}
                    onCheckedChange={(checked) => 
                      handleToggleSetting('notifications', 'bookingReminders', checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Promotions</Label>
                    <p className="text-sm text-gray-500">
                      Get special offers and promotional deals
                    </p>
                  </div>
                  <Switch
                    checked={profile.settings.notifications.promotions}
                    onCheckedChange={(checked) => 
                      handleToggleSetting('notifications', 'promotions', checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Newsletters</Label>
                    <p className="text-sm text-gray-500">
                      Receive our weekly newsletter
                    </p>
                  </div>
                  <Switch
                    checked={profile.settings.notifications.newsletters}
                    onCheckedChange={(checked) => 
                      handleToggleSetting('notifications', 'newsletters', checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Enable browser push notifications
                    </p>
                  </div>
                  <Switch
                    checked={profile.settings.notifications.pushNotifications}
                    onCheckedChange={(checked) => 
                      handleToggleSetting('notifications', 'pushNotifications', checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input 
                    id="currentPassword" 
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input 
                    id="newPassword" 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button onClick={handleChangePassword}>
                  Update Password
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy Settings
                </CardTitle>
                <CardDescription>
                  Control your privacy and data sharing preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Profile</Label>
                    <p className="text-sm text-gray-500">
                      Make your profile visible to other users
                    </p>
                  </div>
                  <Switch
                    checked={profile.settings.privacy.showProfile}
                    onCheckedChange={(checked) => 
                      handleToggleSetting('privacy', 'showProfile', checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Activity</Label>
                    <p className="text-sm text-gray-500">
                      Display your recent activity and reviews
                    </p>
                  </div>
                  <Switch
                    checked={profile.settings.privacy.showActivity}
                    onCheckedChange={(checked) => 
                      handleToggleSetting('privacy', 'showActivity', checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Favorites</Label>
                    <p className="text-sm text-gray-500">
                      Let others see your favorite restaurants
                    </p>
                  </div>
                  <Switch
                    checked={profile.settings.privacy.showFavorites}
                    onCheckedChange={(checked) => 
                      handleToggleSetting('privacy', 'showFavorites', checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Reviews</Label>
                    <p className="text-sm text-gray-500">
                      Enable others to see your reviews
                    </p>
                  </div>
                  <Switch
                    checked={profile.settings.privacy.allowReviews}
                    onCheckedChange={(checked) => 
                      handleToggleSetting('privacy', 'allowReviews', checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <Trash2 className="h-5 w-5" />
                  Delete Account
                </CardTitle>
                <CardDescription>
                  Permanently delete your account and all associated data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                    <div className="flex gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-900 dark:text-red-100">
                          Warning: This action cannot be undone
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                          Deleting your account will permanently remove all your data, including bookings, reviews, and preferences.
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="destructive" 
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account and remove your data from our servers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm">
              To confirm deletion, please type <strong>DELETE</strong> below:
            </p>
            <Input
              placeholder="Type DELETE to confirm"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation.toLowerCase() !== 'delete'}
            >
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
