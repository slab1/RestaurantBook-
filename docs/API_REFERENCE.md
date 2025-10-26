# Restaurant Booking System - API Reference

## Overview
This document provides comprehensive API documentation for the Restaurant Booking System. All APIs follow REST conventions and return JSON responses.

## Authentication
Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

## Base URL
```
http://localhost:3000/api
```

## Response Format
All API responses follow this standard format:

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Optional success message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": {},
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Authentication Endpoints

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "role": "CUSTOMER"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "CUSTOMER"
    },
    "token": "jwt_token_here"
  }
}
```

### POST /api/auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### GET /api/auth/me
Get current user information.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "CUSTOMER",
      "loyaltyPoints": 150
    }
  }
}
```

### POST /api/auth/2fa/setup
Setup two-factor authentication.

**Response:**
```json
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,...",
    "secret": "backup_secret"
  }
}
```

## Restaurant Endpoints

### GET /api/restaurants
Get list of restaurants with filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `cuisine` (string): Filter by cuisine type
- `priceRange` (string): Filter by price range ($, $$, $$$, $$$$)
- `rating` (number): Minimum rating filter
- `location` (string): Location filter

**Response:**
```json
{
  "success": true,
  "data": {
    "restaurants": [
      {
        "id": "restaurant_id",
        "name": "Restaurant Name",
        "description": "Restaurant description",
        "cuisine": ["Italian", "Mediterranean"],
        "priceRange": "$$",
        "rating": 4.5,
        "totalReviews": 120,
        "address": "123 Main St",
        "city": "New York",
        "images": ["image1.jpg", "image2.jpg"]
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  }
}
```

### GET /api/restaurants/[id]
Get detailed restaurant information.

**Response:**
```json
{
  "success": true,
  "data": {
    "restaurant": {
      "id": "restaurant_id",
      "name": "Restaurant Name",
      "description": "Detailed description",
      "cuisine": ["Italian"],
      "priceRange": "$$",
      "rating": 4.5,
      "totalReviews": 120,
      "operatingHours": {
        "monday": { "open": "11:00", "close": "22:00" }
      },
      "amenities": ["wifi", "parking", "outdoor_seating"],
      "tables": [
        {
          "id": "table_id",
          "number": "T1",
          "capacity": 4,
          "isAvailable": true
        }
      ],
      "reviews": [
        {
          "id": "review_id",
          "rating": 5,
          "comment": "Excellent food!",
          "user": {
            "firstName": "Jane",
            "lastName": "D."
          },
          "createdAt": "2024-01-01T00:00:00.000Z"
        }
      ]
    }
  }
}
```

## Enhanced Search Endpoint

### GET /api/search/enhanced
Advanced restaurant search with personalization and caching.

**Query Parameters:**
- `q` (string): Search query
- `location` (string): Location filter
- `cuisine` (string): Comma-separated cuisine types
- `priceRange` (string): Price range filter
- `rating` (number): Minimum rating
- `lat` (number): Latitude for location-based search
- `lng` (number): Longitude for location-based search
- `sortBy` (string): Sort criteria (relevance, rating, price_low, price_high, newest, popular)
- `userId` (string): User ID for personalized results
- `page` (number): Page number
- `limit` (number): Results per page

**Response:**
```json
{
  "success": true,
  "data": {
    "restaurants": [
      {
        "id": "restaurant_id",
        "name": "Restaurant Name",
        "distance": 2.5,
        "isAvailable": true,
        "rating": 4.5,
        "cuisine": ["Italian"],
        "priceRange": "$$"
      }
    ],
    "recommendations": [
      {
        "restaurantId": "restaurant_id",
        "score": 85,
        "reason": ["Matches your cuisine preferences", "Highly rated"]
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 20,
      "totalPages": 2
    },
    "filters": {
      "availableCuisines": ["Italian", "Chinese", "Mexican"],
      "priceRanges": ["$", "$$", "$$$", "$$$$"],
      "avgRating": 4.2
    }
  }
}
```

## Enhanced Booking Endpoints

### GET /api/bookings/enhanced
Get enhanced bookings with analytics and filtering.

**Query Parameters:**
- `restaurantId` (string): Filter by restaurant
- `status` (string): Filter by booking status
- `date` (string): Filter by date (YYYY-MM-DD)
- `userId` (string): Filter by user (admin only)
- `analytics` (boolean): Include analytics data
- `page` (number): Page number
- `limit` (number): Results per page

**Response:**
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "booking_id",
        "bookingTime": "2024-01-15T19:00:00.000Z",
        "partySize": 4,
        "status": "CONFIRMED",
        "confirmationCode": "ABC123",
        "specialRequests": "Window seat please",
        "eventType": "DATE_NIGHT",
        "loyaltyPointsUsed": 50,
        "loyaltyPointsEarned": 20,
        "user": {
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com"
        },
        "restaurant": {
          "name": "Restaurant Name",
          "address": "123 Main St"
        },
        "table": {
          "number": "T1",
          "capacity": 4
        }
      }
    ],
    "analytics": {
      "totalBookings": 150,
      "statusBreakdown": {
        "CONFIRMED": 100,
        "PENDING": 30,
        "COMPLETED": 20
      },
      "avgPartySize": 3.2,
      "completionRate": 95.5
    }
  }
}
```

### POST /api/bookings/enhanced
Create enhanced booking with advanced features.

**Request Body:**
```json
{
  "restaurantId": "restaurant_id",
  "tableId": "table_id",
  "bookingTime": "2024-01-15T19:00:00.000Z",
  "partySize": 4,
  "specialRequests": "Window seat please",
  "eventType": "DATE_NIGHT",
  "dietaryRestrictions": ["vegetarian", "gluten-free"],
  "seatingPreference": "window",
  "loyaltyPointsToUse": 50,
  "isRecurring": false
}
```

### PUT /api/bookings/enhanced?id={bookingId}
Update booking with enhanced features.

**Request Body:**
```json
{
  "status": "CONFIRMED",
  "notes": "Confirmed for window seat",
  "actualPartySize": 4
}
```

## Waitlist Endpoints

### GET /api/waitlist
Get waitlist entries.

**Query Parameters:**
- `restaurantId` (string): Filter by restaurant
- `status` (string): Filter by status
- `page` (number): Page number
- `limit` (number): Results per page

### POST /api/waitlist
Join restaurant waitlist.

**Request Body:**
```json
{
  "restaurantId": "restaurant_id",
  "partySize": 4,
  "preferredTime": "2024-01-15T19:00:00.000Z",
  "notes": "Celebrating anniversary",
  "notifyByPhone": true,
  "notifyByEmail": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "entry": {
      "id": "waitlist_id",
      "partySize": 4,
      "preferredTime": "2024-01-15T19:00:00.000Z",
      "estimatedWait": 45,
      "status": "WAITING"
    },
    "position": 3,
    "estimatedWait": 45
  }
}
```

### PUT /api/waitlist?id={entryId}
Update waitlist entry status.

**Request Body:**
```json
{
  "status": "SEATED",
  "estimatedWait": 30
}
```

## Analytics Dashboard Endpoint

### GET /api/analytics/dashboard
Get comprehensive dashboard analytics.

**Query Parameters:**
- `restaurantId` (string): Filter by restaurant
- `period` (string): Time period (1d, 7d, 30d, 90d)
- `comparison` (boolean): Include comparison data

**Response:**
```json
{
  "success": true,
  "data": {
    "current": {
      "bookings": {
        "total": 150,
        "statusBreakdown": {
          "CONFIRMED": 100,
          "PENDING": 30,
          "COMPLETED": 20
        },
        "avgPartySize": 3.2,
        "completionRate": 95.5
      },
      "revenue": {
        "total": 15000.00,
        "avgOrderValue": 75.50,
        "revenuePerGuest": 25.00,
        "transactionCount": 200
      },
      "customers": {
        "unique": 120,
        "new": 30,
        "returning": 90,
        "retentionRate": 75.0
      },
      "tables": {
        "overall": 85.5,
        "byTable": [
          {
            "tableId": "table_1",
            "tableNumber": "T1",
            "capacity": 4,
            "bookingCount": 25,
            "avgOccupancy": 90
          }
        ]
      }
    },
    "comparison": {
      "bookings": {
        "total": 15.5,
        "completionRate": 2.1
      },
      "revenue": {
        "total": 12.8,
        "avgOrderValue": 5.2
      }
    }
  }
}
```

## Payment Endpoints

### POST /api/payments/create-intent
Create Stripe payment intent.

**Request Body:**
```json
{
  "bookingId": "booking_id",
  "amount": 10000,
  "currency": "usd",
  "paymentMethod": "card"
}
```

### POST /api/payments/webhook
Handle Stripe webhook events.

**Headers:** `stripe-signature: webhook_signature`

## Notification Endpoints

### GET /api/notifications
Get user notifications.

**Query Parameters:**
- `limit` (number): Number of notifications
- `status` (string): Filter by status

### PUT /api/notifications/{id}/read
Mark notification as read.

### GET /api/notifications/unread-count
Get unread notification count.

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

## Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | INVALID_REQUEST | Invalid request data |
| 401 | UNAUTHORIZED | Authentication required |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource conflict (e.g., table not available) |
| 429 | RATE_LIMITED | Too many requests |
| 500 | INTERNAL_ERROR | Server error |

## Rate Limiting

API endpoints are rate limited:
- **General endpoints**: 100 requests per 15 minutes per IP
- **Authentication endpoints**: 10 requests per 15 minutes per IP
- **Search endpoints**: 60 requests per minute per user
- **Booking endpoints**: 30 requests per minute per user

## WebSocket Events

Real-time events via Socket.IO:

### Client → Server Events
```javascript
// Join waitlist
socket.emit('waitlist:join', {
  restaurantId: 'restaurant_id',
  partySize: 4,
  preferredTime: '2024-01-15T19:00:00.000Z'
});

// Update booking status
socket.emit('booking:status_update', {
  bookingId: 'booking_id',
  status: 'CONFIRMED'
});
```

### Server → Client Events
```javascript
// New booking notification
socket.on('booking:new', (data) => {
  console.log('New booking:', data.booking);
});

// Waitlist update
socket.on('waitlist:table_available', (data) => {
  console.log('Table available:', data.message);
});

// Real-time notification
socket.on('notification:new', (notification) => {
  console.log('New notification:', notification);
});
```

## SDK Examples

### JavaScript/TypeScript
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Search restaurants
const searchRestaurants = async (query: string) => {
  const response = await api.get('/search/enhanced', {
    params: { q: query, limit: 10 }
  });
  return response.data.data;
};

// Create booking
const createBooking = async (bookingData: any) => {
  const response = await api.post('/bookings/enhanced', bookingData);
  return response.data.data;
};
```

### cURL Examples
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Search restaurants
curl -X GET "http://localhost:3000/api/search/enhanced?q=pizza&limit=5" \
  -H "Authorization: Bearer $TOKEN"

# Create booking
curl -X POST http://localhost:3000/api/bookings/enhanced \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "restaurantId": "restaurant_id",
    "tableId": "table_id",
    "bookingTime": "2024-01-15T19:00:00.000Z",
    "partySize": 4
  }'
```

---

*For more detailed examples and integration guides, please refer to the implementation files and test suites.*
