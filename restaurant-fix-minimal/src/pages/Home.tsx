import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Home() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('demo_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('demo_user')
    setUser(null)
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto max-w-4xl py-12 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">RestaurantBook</h1>
          <p className="text-gray-600 dark:text-gray-400">Authentication System Fixed</p>
        </div>

        {user ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Welcome, {user.firstName} {user.lastName}!
              </CardTitle>
              <CardDescription>You are successfully logged in</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">Authentication Status: Active</p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">User ID: {user.id}</p>
                <p className="text-xs text-green-700 dark:text-green-300">Email: {user.email}</p>
                <p className="text-xs text-green-700 dark:text-green-300">Role: {user.role}</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">Features Available:</h3>
                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
                  <li>Demo credentials working correctly</li>
                  <li>localStorage-based session persistence</li>
                  <li>Proper error handling and user feedback</li>
                  <li>Loading states during authentication</li>
                  <li>Console logging for debugging</li>
                </ul>
              </div>

              <Button onClick={handleLogout} variant="destructive" className="w-full">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Welcome to RestaurantBook</CardTitle>
              <CardDescription>Please log in to continue</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You need to be logged in to access booking features.
              </p>
              <Button onClick={() => navigate('/login')} className="w-full">
                Go to Login
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Testing Instructions</h2>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <p><strong>Demo Credentials:</strong></p>
            <p className="font-mono ml-4">Email: demo@restaurantbook.com</p>
            <p className="font-mono ml-4">Password: password123</p>
            <p className="mt-2"><strong>Open Browser Console to see:</strong></p>
            <ul className="list-disc list-inside ml-4">
              <li>Authentication flow logs</li>
              <li>Login attempt tracking</li>
              <li>Success/failure messages</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
