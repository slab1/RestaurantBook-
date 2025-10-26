import { NextRequest } from 'next/server';
import { GET, POST, PUT } from '@/app/api/bookings/enhanced/route';
import { prisma } from '@/lib/prisma';
import { authenticateToken } from '@/lib/middleware';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    booking: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    restaurant: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    loyaltyTransaction: {
      create: jest.fn(),
    },
  },
}));

jest.mock('@/lib/middleware', () => ({
  authenticateToken: jest.fn(),
  apiResponse: jest.fn((data, status = 200) => 
    new Response(JSON.stringify({ success: true, data }), { status })
  ),
  errorResponse: jest.fn((error, status = 400) => 
    new Response(JSON.stringify({ success: false, error }), { status })
  ),
}));

jest.mock('@/lib/notifications');
jest.mock('@/lib/socket');
jest.mock('@/lib/redis');
jest.mock('@/lib/logger');

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockAuthenticateToken = authenticateToken as jest.MockedFunction<typeof authenticateToken>;

describe('/api/bookings/enhanced', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return bookings for authenticated customer', async () => {
      const mockUser = {
        authenticated: true,
        user: { userId: 'user-1', role: 'CUSTOMER' }
      };
      
      const mockBookings = [
        {
          id: 'booking-1',
          userId: 'user-1',
          restaurantId: 'restaurant-1',
          bookingTime: new Date(),
          partySize: 2,
          status: 'CONFIRMED',
        }
      ];

      mockAuthenticateToken.mockResolvedValue(mockUser);
      mockPrisma.booking.findMany.mockResolvedValue(mockBookings as any);
      mockPrisma.booking.count.mockResolvedValue(1);

      const request = new NextRequest('http://localhost/api/bookings/enhanced');
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      expect(mockPrisma.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1' },
        })
      );
    });

    it('should return 401 for unauthenticated request', async () => {
      mockAuthenticateToken.mockResolvedValue({
        authenticated: false,
        user: null
      });

      const request = new NextRequest('http://localhost/api/bookings/enhanced');
      const response = await GET(request);
      
      expect(response.status).toBe(400); // errorResponse default
    });

    it('should filter by restaurant for restaurant owner', async () => {
      const mockUser = {
        authenticated: true,
        user: { userId: 'owner-1', role: 'RESTAURANT_OWNER' }
      };
      
      const mockRestaurants = [{ id: 'restaurant-1' }];
      const mockBookings = [];

      mockAuthenticateToken.mockResolvedValue(mockUser);
      mockPrisma.restaurant.findMany.mockResolvedValue(mockRestaurants as any);
      mockPrisma.booking.findMany.mockResolvedValue(mockBookings as any);
      mockPrisma.booking.count.mockResolvedValue(0);

      const request = new NextRequest('http://localhost/api/bookings/enhanced');
      const response = await GET(request);
      
      expect(mockPrisma.restaurant.findMany).toHaveBeenCalledWith({
        where: { ownerId: 'owner-1' },
        select: { id: true },
      });
    });
  });

  describe('POST', () => {
    const mockBookingData = {
      restaurantId: 'restaurant-1',
      tableId: 'table-1',
      bookingTime: new Date().toISOString(),
      partySize: 2,
      specialRequests: 'Window seat please',
      eventType: 'DATE_NIGHT',
      dietaryRestrictions: ['vegetarian'],
      loyaltyPointsToUse: 0,
    };

    it('should create booking successfully', async () => {
      const mockUser = {
        authenticated: true,
        user: { userId: 'user-1', role: 'CUSTOMER' }
      };
      
      const mockRestaurant = {
        id: 'restaurant-1',
        name: 'Test Restaurant',
        isActive: true,
        depositRequired: false,
        tables: [{
          id: 'table-1',
          capacity: 4,
        }]
      };
      
      const mockCreatedBooking = {
        id: 'booking-1',
        ...mockBookingData,
        userId: 'user-1',
        confirmationCode: 'ABC123',
        status: 'CONFIRMED',
      };

      mockAuthenticateToken.mockResolvedValue(mockUser);
      mockPrisma.restaurant.findFirst.mockResolvedValue(mockRestaurant as any);
      mockPrisma.booking.findFirst.mockResolvedValue(null); // No conflicting booking
      mockPrisma.booking.create.mockResolvedValue(mockCreatedBooking as any);

      const request = new NextRequest('http://localhost/api/bookings/enhanced', {
        method: 'POST',
        body: JSON.stringify(mockBookingData),
      });
      
      const response = await POST(request);
      
      expect(response.status).toBe(200); // apiResponse default
      expect(mockPrisma.booking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-1',
            restaurantId: 'restaurant-1',
            tableId: 'table-1',
            partySize: 2,
          })
        })
      );
    });

    it('should reject booking if table not available', async () => {
      const mockUser = {
        authenticated: true,
        user: { userId: 'user-1', role: 'CUSTOMER' }
      };
      
      const mockRestaurant = {
        id: 'restaurant-1',
        isActive: true,
        tables: [{ id: 'table-1', capacity: 4 }]
      };
      
      const conflictingBooking = {
        id: 'existing-booking',
        tableId: 'table-1',
        status: 'CONFIRMED',
      };

      mockAuthenticateToken.mockResolvedValue(mockUser);
      mockPrisma.restaurant.findFirst.mockResolvedValue(mockRestaurant as any);
      mockPrisma.booking.findFirst.mockResolvedValue(conflictingBooking as any);

      const request = new NextRequest('http://localhost/api/bookings/enhanced', {
        method: 'POST',
        body: JSON.stringify(mockBookingData),
      });
      
      const response = await POST(request);
      
      expect(response.status).toBe(400);
    });

    it('should reject booking if party size exceeds table capacity', async () => {
      const mockUser = {
        authenticated: true,
        user: { userId: 'user-1', role: 'CUSTOMER' }
      };
      
      const mockRestaurant = {
        id: 'restaurant-1',
        isActive: true,
        tables: [{ id: 'table-1', capacity: 1 }] // Capacity too small
      };

      mockAuthenticateToken.mockResolvedValue(mockUser);
      mockPrisma.restaurant.findFirst.mockResolvedValue(mockRestaurant as any);

      const request = new NextRequest('http://localhost/api/bookings/enhanced', {
        method: 'POST',
        body: JSON.stringify({ ...mockBookingData, partySize: 4 }),
      });
      
      const response = await POST(request);
      
      expect(response.status).toBe(400);
    });

    it('should handle loyalty points usage', async () => {
      const mockUser = {
        authenticated: true,
        user: { userId: 'user-1', role: 'CUSTOMER' }
      };
      
      const mockUserWithPoints = {
        id: 'user-1',
        loyaltyPoints: 100,
      };
      
      const mockRestaurant = {
        id: 'restaurant-1',
        name: 'Test Restaurant',
        isActive: true,
        depositRequired: false,
        tables: [{ id: 'table-1', capacity: 4 }]
      };

      mockAuthenticateToken.mockResolvedValue(mockUser);
      mockPrisma.user.findUnique.mockResolvedValue(mockUserWithPoints as any);
      mockPrisma.restaurant.findFirst.mockResolvedValue(mockRestaurant as any);
      mockPrisma.booking.findFirst.mockResolvedValue(null);
      mockPrisma.booking.create.mockResolvedValue({} as any);
      mockPrisma.user.update.mockResolvedValue({} as any);
      mockPrisma.loyaltyTransaction.create.mockResolvedValue({} as any);

      const request = new NextRequest('http://localhost/api/bookings/enhanced', {
        method: 'POST',
        body: JSON.stringify({ ...mockBookingData, loyaltyPointsToUse: 50 }),
      });
      
      await POST(request);
      
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { loyaltyPoints: { decrement: 50 } }
      });
      
      expect(mockPrisma.loyaltyTransaction.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          type: 'REDEEMED',
          points: -50,
          description: 'Used for booking at Test Restaurant',
        }
      });
    });
  });

  describe('PUT', () => {
    it('should update booking status', async () => {
      const mockUser = {
        authenticated: true,
        user: { userId: 'owner-1', role: 'RESTAURANT_OWNER' }
      };
      
      const mockBooking = {
        id: 'booking-1',
        userId: 'user-1',
        status: 'PENDING',
        loyaltyPointsUsed: 0,
        loyaltyPointsEarned: 20,
        restaurant: {
          ownerId: 'owner-1',
          name: 'Test Restaurant',
        },
        user: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        }
      };
      
      const updateData = { status: 'CONFIRMED' };

      mockAuthenticateToken.mockResolvedValue(mockUser);
      mockPrisma.booking.findUnique.mockResolvedValue(mockBooking as any);
      mockPrisma.booking.update.mockResolvedValue({ ...mockBooking, ...updateData } as any);

      const request = new NextRequest('http://localhost/api/bookings/enhanced?id=booking-1', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      
      const response = await PUT(request);
      
      expect(response.status).toBe(200);
      expect(mockPrisma.booking.update).toHaveBeenCalledWith({
        where: { id: 'booking-1' },
        data: updateData,
        include: expect.any(Object),
      });
    });

    it('should handle completion and award loyalty points', async () => {
      const mockUser = {
        authenticated: true,
        user: { userId: 'owner-1', role: 'RESTAURANT_OWNER' }
      };
      
      const mockBooking = {
        id: 'booking-1',
        userId: 'user-1',
        status: 'CONFIRMED',
        loyaltyPointsEarned: 20,
        partySize: 2,
        restaurant: {
          ownerId: 'owner-1',
          name: 'Test Restaurant',
        },
        user: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        }
      };
      
      const updateData = { status: 'COMPLETED' };

      mockAuthenticateToken.mockResolvedValue(mockUser);
      mockPrisma.booking.findUnique.mockResolvedValue(mockBooking as any);
      mockPrisma.booking.update.mockResolvedValue({ ...mockBooking, ...updateData } as any);
      mockPrisma.user.update.mockResolvedValue({} as any);
      mockPrisma.loyaltyTransaction.create.mockResolvedValue({} as any);

      const request = new NextRequest('http://localhost/api/bookings/enhanced?id=booking-1', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      
      await PUT(request);
      
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          loyaltyPoints: { increment: 20 },
          totalSpent: { increment: 100 }, // 2 * 50
        }
      });
    });

    it('should reject unauthorized update attempts', async () => {
      const mockUser = {
        authenticated: true,
        user: { userId: 'other-user', role: 'CUSTOMER' }
      };
      
      const mockBooking = {
        id: 'booking-1',
        userId: 'user-1', // Different user
        restaurant: {
          ownerId: 'owner-1', // Different owner
        }
      };

      mockAuthenticateToken.mockResolvedValue(mockUser);
      mockPrisma.booking.findUnique.mockResolvedValue(mockBooking as any);

      const request = new NextRequest('http://localhost/api/bookings/enhanced?id=booking-1', {
        method: 'PUT',
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      
      const response = await PUT(request);
      
      expect(response.status).toBe(400); // errorResponse default
    });
  });
});
