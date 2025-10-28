import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff } from 'lucide-react'

interface FormData {
  email: string
  password: string
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const validateForm = (data: FormData): Partial<FormData> => {
    const newErrors: Partial<FormData> = {}
    
    if (!data.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!data.password) {
      newErrors.password = 'Password is required'
    } else if (data.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    return newErrors
  }

  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    console.log('[Auth] Login attempt for:', email)
    
    // Demo authentication
    if (email === 'demo@restaurantbook.com' && password === 'password123') {
      const demoUser = {
        id: 'demo-user-123',
        email: 'demo@restaurantbook.com',
        firstName: 'Demo',
        lastName: 'User',
        role: 'customer',
      }
      
      console.log('[Auth] Demo login successful')
      localStorage.setItem('demo_user', JSON.stringify(demoUser))
      return true
    }
    
    console.log('[Auth] Login failed - invalid credentials')
    return false
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('[Login Page] Form submitted')
    
    if (loading) {
      console.log('[Login Page] Submission prevented - already in progress')
      return
    }
    
    const validationErrors = validateForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      console.log('[Login Page] Validation errors:', validationErrors)
      setErrors(validationErrors)
      setMessage({ type: 'error', text: 'Please check your input and try again.' })
      return
    }
    
    setErrors({})
    setMessage(null)
    setLoading(true)

    try {
      const currentData = new FormData(formRef.current!)
      const email = currentData.get('email') as string
      const password = currentData.get('password') as string
      
      console.log('[Login Page] Calling login with:', email)
      const success = await handleLogin(email, password)
      console.log('[Login Page] Login result:', success)
      
      if (success) {
        setMessage({ type: 'success', text: 'Welcome back! Login successful.' })
        console.log('[Login Page] Redirecting to homepage...')
        setTimeout(() => {
          navigate('/')
        }, 1000)
      } else {
        console.log('[Login Page] Login failed - showing error')
        setMessage({ 
          type: 'error', 
          text: 'Invalid email or password. Try: demo@restaurantbook.com / password123' 
        })
      }
    } catch (error: any) {
      console.error('[Login Page] Exception during login:', error)
      setMessage({ 
        type: 'error', 
        text: `Error: ${error.message || 'Unknown error occurred'}` 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="container mx-auto max-w-md py-12 px-4">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your account to continue booking amazing restaurants
          </CardDescription>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">Demo Credentials</p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              <span className="font-mono">demo@restaurantbook.com</span>
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <span className="font-mono">password123</span>
            </p>
          </div>
        </CardHeader>
        
        <CardContent>
          {message && (
            <div className={`mb-4 p-3 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {message.text}
            </div>
          )}
          
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={errors.email ? 'border-red-500 focus:border-red-500' : ''}
                autoComplete="email"
                disabled={loading}
                required
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={errors.password ? 'border-red-500 focus:border-red-500' : ''}
                  autoComplete="current-password"
                  disabled={loading}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
