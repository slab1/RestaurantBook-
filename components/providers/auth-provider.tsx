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
  const [mounted, setMounted] = useState(false)

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Only check auth after component is mounted on client
    if (mounted) {
      checkAuth()
    }
  }, [mounted])

  const checkAuth = async () => {
    try {
      // For static export: Check localStorage for demo authentication
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('demo_user')
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser))
            setLoading(false)
            return
          } catch (e) {
            console.error('[Auth] Failed to parse stored user:', e)
            localStorage.removeItem('demo_user')
          }
        }
      }
    } catch (error) {
      // Silently handle auth check failure
      console.debug('[Auth] Auth check skipped:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      
      console.log('[Auth] Login attempt for:', email)
      
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
        
        console.log('[Auth] Demo login successful')
        if (typeof window !== 'undefined') {
          localStorage.setItem('demo_user', JSON.stringify(demoUser))
        }
        setUser(demoUser)
        return true
      }

      // Admin demo credentials
      if (email === 'admin@restaurantbook.com' && password === 'admin123') {
        const adminUser: User = {
          id: 'admin-user-123',
          email: 'admin@restaurantbook.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          avatar: '',
          emailVerified: true,
          twoFactorEnabled: false,
        }
        
        console.log('[Auth] Admin login successful')
        if (typeof window !== 'undefined') {
          localStorage.setItem('demo_user', JSON.stringify(adminUser))
        }
        setUser(adminUser)
        return true
      }
      
      console.log('[Auth] Login failed - invalid credentials')
      return false
    } catch (error) {
      console.error('[Auth] Login error:', error)
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
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('demo_user', JSON.stringify(newUser))
      }
      setUser(newUser)
      return true
    } catch (error) {
      console.error('[Auth] Registration error:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      // For static export: Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('demo_user')
      }
    } catch (error) {
      console.debug('[Auth] Logout error:', error)
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