'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  avatar?: string
  emailVerified?: boolean
  twoFactorEnabled?: boolean
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (data: RegisterData) => Promise<boolean>
  logout: () => void
  loading: boolean
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  role?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // For static export: Check localStorage for demo authentication
      const storedUser = localStorage.getItem('demo_user')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
        setLoading(false)
        return
      }

      // Fallback: Try API route if available (for server deployment)
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      // Silently handle auth check failure (e.g., when API routes don't exist yet)
      console.debug('Auth check skipped:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      
      // For static export: Client-side demo authentication
      if (email === 'demo@restaurantbook.com' && password === 'password123') {
        const demoUser: User = {
          id: 'demo-user-123',
          email: 'demo@restaurantbook.com',
          firstName: 'Demo',
          lastName: 'User',
          role: 'customer',
          avatar: '',
          emailVerified: true,
          twoFactorEnabled: false,
        }
        
        localStorage.setItem('demo_user', JSON.stringify(demoUser))
        setUser(demoUser)
        return true
      }

      // Fallback: Try API route if available (for server deployment)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          setUser(data.user)
          return true
        }
      }
      return false
    } catch (error) {
      console.debug('Login error:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      setLoading(true)
      
      // For static export: Client-side demo registration
      const newUser: User = {
        id: `user-${Date.now()}`,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || 'customer',
        avatar: '',
        emailVerified: false,
        twoFactorEnabled: false,
      }
      
      localStorage.setItem('demo_user', JSON.stringify(newUser))
      setUser(newUser)
      return true
    } catch (error) {
      console.debug('Registration error:', error)
      
      // Fallback: Try API route if available (for server deployment)
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
          credentials: 'include',
        })

        if (response.ok) {
          const result = await response.json()
          if (result.user) {
            setUser(result.user)
            return true
          }
        }
      } catch (apiError) {
        console.debug('API registration failed:', apiError)
      }
      
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      // For static export: Clear localStorage
      localStorage.removeItem('demo_user')
      
      // Fallback: Try API route if available (for server deployment)
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.debug('Logout not available:', error)
    }
    setUser(null)
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}