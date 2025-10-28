'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { Eye, EyeOff } from 'lucide-react'

interface FormData {
  email: string
  password: string
}

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const formRef = useRef<HTMLFormElement>(null)
  const submittingRef = useRef(false)

  // Validate form data
  const validateForm = (data: FormData): Partial<FormData> => {
    const newErrors: Partial<FormData> = {}
    
    // Email validation
    if (!data.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    // Password validation
    if (!data.password) {
      newErrors.password = 'Password is required'
    } else if (data.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('[Login Page] Form submitted')
    
    // Prevent multiple submissions
    if (submittingRef.current || loading) {
      console.log('[Login Page] Submission prevented - already in progress')
      return
    }
    
    // Validate form
    const validationErrors = validateForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      console.log('[Login Page] Validation errors:', validationErrors)
      setErrors(validationErrors)
      toast({
        title: 'Validation Error',
        description: 'Please check your input and try again.',
        variant: 'destructive',
      })
      return
    }
    
    // Clear previous errors
    setErrors({})
    setLoading(true)
    submittingRef.current = true

    try {
      // Use current form values to avoid stale state
      const currentData = new FormData(formRef.current!)
      const email = currentData.get('email') as string
      const password = currentData.get('password') as string
      
      console.log('[Login Page] Calling login with:', email)
      const success = await login(email, password)
      console.log('[Login Page] Login result:', success)
      
      if (success) {
        toast({
          title: 'Welcome back!',
          description: 'You have been successfully logged in.',
        })
        console.log('[Login Page] Redirecting to homepage...')
        setTimeout(() => {
          router.push('/')
        }, 500)
      } else {
        console.log('[Login Page] Login failed - showing error')
        toast({
          title: 'Login failed',
          description: 'Invalid email or password. Try: demo@restaurantbook.com / password123',
          variant: 'destructive',
        })
      }
    } catch (error: any) {
      console.error('[Login Page] Exception during login:', error)
      toast({
        title: 'Login failed',
        description: `Error: ${error.message || 'Unknown error occurred'}`,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
      submittingRef.current = false
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleBlur = (field: keyof FormData, value: string) => {
    // Validate individual field on blur
    const fieldErrors = validateForm({ ...formData, [field]: value })
    if (fieldErrors[field]) {
      setErrors(prev => ({ ...prev, [field]: fieldErrors[field] }))
    }
  }

  return (
    <div className="container mx-auto max-w-md py-12">
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
                onBlur={(e) => handleBlur('email', e.target.value)}
                className={errors.email ? 'border-red-500 focus:border-red-500' : ''}
                autoComplete="email"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck="false"
                disabled={loading}
                required
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-red-500" role="alert">
                  {errors.email}
                </p>
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
                  onBlur={(e) => handleBlur('password', e.target.value)}
                  className={errors.password ? 'border-red-500 focus:border-red-500' : ''}
                  autoComplete="current-password"
                  disabled={loading}
                  required
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p id="password-error" className="text-sm text-red-500" role="alert">
                  {errors.password}
                </p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || submittingRef.current}
              aria-disabled={loading || submittingRef.current}
            >
              {(loading || submittingRef.current) ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link href="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
          
          <div className="mt-4 text-center">
            <Link href="/forgot-password" className="text-sm text-muted-foreground hover:underline">
              Forgot your password?
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}