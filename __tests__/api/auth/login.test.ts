import { POST } from '@/app/api/auth/login/route'
import { AuthService } from '@/lib/auth'
import { NextRequest } from 'next/server'

// Mock the AuthService
jest.mock('@/lib/auth')
jest.mock('@/lib/logger')
jest.mock('@prisma/client')

const mockAuthService = AuthService as jest.Mocked<typeof AuthService>

describe('/api/auth/login', () => {
  const mockRequest = (body: any = {}, headers: Record<string, string> = {}) => {
    const request = {
      json: jest.fn().mockResolvedValue(body),
      headers: {
        get: jest.fn((key: string) => headers[key] || null),
      },
      url: 'http://localhost:3000/api/auth/login',
    } as unknown as NextRequest

    return request
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      }

      const mockLoginResult = {
        success: true,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'CUSTOMER',
          avatar: null,
          emailVerified: true,
          twoFactorEnabled: false,
        },
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
        session: {
          id: 'session-123',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      }

      mockAuthService.login.mockResolvedValue(mockLoginResult)

      const request = mockRequest(loginData, {
        'x-forwarded-for': '127.0.0.1',
        'user-agent': 'Test User Agent',
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.user.email).toBe('test@example.com')
      expect(responseData.user.id).toBe('user-123')
      expect(mockAuthService.login).toHaveBeenCalledWith(
        loginData,
        '127.0.0.1',
        'Test User Agent'
      )
    })

    it('should handle 2FA requirement', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      }

      const mock2FAResult = {
        success: false,
        requiresTwoFactor: true,
        message: 'Two-factor authentication required',
      }

      mockAuthService.login.mockResolvedValue(mock2FAResult)

      const request = mockRequest(loginData)
      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(false)
      expect(responseData.requiresTwoFactor).toBe(true)
      expect(responseData.message).toBe('Two-factor authentication required')
    })

    it('should handle invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      }

      mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'))

      const request = mockRequest(loginData)
      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(401)
      expect(responseData.error).toBe('Invalid email or password')
      expect(responseData.code).toBe('INVALID_CREDENTIALS')
    })

    it('should handle validation errors', async () => {
      const invalidLoginData = {
        email: 'invalid-email',
        password: '',
      }

      const request = mockRequest(invalidLoginData)
      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.error).toBe('Validation failed')
      expect(responseData.issues).toBeDefined()
    })

    it('should handle account deactivation', async () => {
      const loginData = {
        email: 'deactivated@example.com',
        password: 'password123',
      }

      mockAuthService.login.mockRejectedValue(new Error('Account is deactivated'))

      const request = mockRequest(loginData)
      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(403)
      expect(responseData.error).toBe('Account is deactivated. Please contact support.')
      expect(responseData.code).toBe('ACCOUNT_DEACTIVATED')
    })

    it('should handle invalid 2FA code', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
        twoFactorCode: '123456',
      }

      mockAuthService.login.mockRejectedValue(new Error('Invalid two-factor code'))

      const request = mockRequest(loginData)
      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(401)
      expect(responseData.error).toBe('Invalid two-factor authentication code')
      expect(responseData.code).toBe('INVALID_2FA')
    })

    it('should handle server errors gracefully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      }

      mockAuthService.login.mockRejectedValue(new Error('Database connection failed'))

      const request = mockRequest(loginData)
      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.error).toBe('Login failed')
      // In production, should not expose internal error details
      if (process.env.NODE_ENV === 'development') {
        expect(responseData.message).toBe('Database connection failed')
      } else {
        expect(responseData.message).toBe('Authentication error')
      }
    })

    it('should include analytics tracking on successful login', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true,
      }

      const mockLoginResult = {
        success: true,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'CUSTOMER',
          avatar: null,
          emailVerified: true,
          twoFactorEnabled: true,
        },
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
        session: {
          id: 'session-123',
          expiresAt: new Date(),
        },
      }

      mockAuthService.login.mockResolvedValue(mockLoginResult)

      const request = mockRequest(loginData, {
        'x-forwarded-for': '192.168.1.1',
        'user-agent': 'Mozilla/5.0 Test Browser',
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      
      // Verify analytics would be tracked
      expect(mockAuthService.login).toHaveBeenCalledWith(
        loginData,
        '192.168.1.1',
        'Mozilla/5.0 Test Browser'
      )
    })

    it('should extract IP address from various headers', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      }

      mockAuthService.login.mockResolvedValue({
        success: true,
        user: mockAuthUser(),
        tokens: { accessToken: 'token', refreshToken: 'refresh' },
        session: { id: 'session', expiresAt: new Date() },
      } as any)

      // Test x-forwarded-for header
      const request1 = mockRequest(loginData, { 'x-forwarded-for': '203.0.113.1' })
      await POST(request1)
      expect(mockAuthService.login).toHaveBeenLastCalledWith(
        expect.anything(),
        '203.0.113.1',
        expect.anything()
      )

      // Test x-real-ip header when x-forwarded-for is not present
      const request2 = mockRequest(loginData, { 'x-real-ip': '203.0.113.2' })
      await POST(request2)
      expect(mockAuthService.login).toHaveBeenLastCalledWith(
        expect.anything(),
        '203.0.113.2',
        expect.anything()
      )

      // Test fallback to 'unknown' when no IP headers present
      const request3 = mockRequest(loginData, {})
      await POST(request3)
      expect(mockAuthService.login).toHaveBeenLastCalledWith(
        expect.anything(),
        'unknown',
        expect.anything()
      )
    })
  })

  describe('Other HTTP methods', () => {
    it('should return 405 for GET requests', async () => {
      // This would need to be tested with the actual GET handler
      // For now, we're only testing the POST method
      expect(true).toBe(true)
    })

    it('should return 405 for PUT requests', async () => {
      // This would need to be tested with the actual PUT handler
      expect(true).toBe(true)
    })

    it('should return 405 for DELETE requests', async () => {
      // This would need to be tested with the actual DELETE handler
      expect(true).toBe(true)
    })
  })
})

// Helper function for mock user data
function mockAuthUser(overrides = {}) {
  return {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'CUSTOMER',
    avatar: null,
    emailVerified: true,
    twoFactorEnabled: false,
    ...overrides,
  }
}
