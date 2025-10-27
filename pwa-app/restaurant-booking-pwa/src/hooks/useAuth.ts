import { useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  isVerified: boolean
  avatar?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  return {
    user,
    isAuthenticated,
    isLoading,
    login: async (email: string, password: string) => {
      setIsLoading(true)
      try {
        // Mock login for demo
        const mockUser: User = {
          id: '1',
          email,
          firstName: email.split('@')[0],
          lastName: 'User',
          role: 'CUSTOMER',
          isVerified: true,
        }
        setUser(mockUser)
        setIsAuthenticated(true)
        setIsLoading(false)
        return true
      } catch (error) {
        setIsLoading(false)
        return false
      }
    },
    register: async (userData: any) => {
      setIsLoading(true)
      try {
        // Mock registration
        const mockUser: User = {
          id: '1',
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: 'CUSTOMER',
          isVerified: false,
        }
        setUser(mockUser)
        setIsAuthenticated(true)
        setIsLoading(false)
        return true
      } catch (error) {
        setIsLoading(false)
        return false
      }
    },
    logout: () => {
      setUser(null)
      setIsAuthenticated(false)
    },
    updateProfile: (data: Partial<User>) => {
      if (user) {
        setUser({ ...user, ...data })
      }
    },
  }
}
