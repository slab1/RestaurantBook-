/**
 * Health Check API Endpoint
 * 
 * GET /api/health
 * 
 * Returns status of all external services and configuration
 * Useful for monitoring, debugging, and deployment verification
 */

import { NextResponse } from 'next/server'
import { features } from '@/lib/feature-flags'
import { rateLimiter } from '@/lib/rate-limiter'

interface ServiceStatus {
  name: string
  status: 'healthy' | 'warning' | 'down' | 'not_configured'
  message?: string
  details?: any
}

export async function GET() {
  const services: ServiceStatus[] = []
  let overallStatus: 'healthy' | 'degraded' | 'down' = 'healthy'

  // ==========================================================================
  // CORE SERVICES (Tier 1)
  // ==========================================================================

  // Database Check
  try {
    const { prisma } = await import('@/lib/prisma')
    await prisma.$queryRaw`SELECT 1`
    services.push({
      name: 'Database (PostgreSQL)',
      status: 'healthy',
      message: 'Connection successful',
    })
  } catch (error: any) {
    services.push({
      name: 'Database (PostgreSQL)',
      status: 'down',
      message: `Connection failed: ${error.message}`,
    })
    overallStatus = 'down'
  }

  // Authentication Check
  const hasAuth = Boolean(process.env.JWT_SECRET && process.env.NEXTAUTH_SECRET)
  services.push({
    name: 'Authentication',
    status: hasAuth ? 'healthy' : 'not_configured',
    message: hasAuth ? 'Configured' : 'Missing JWT/NextAuth secrets',
  })

  // ==========================================================================
  // BASIC SERVICES (Tier 2)
  // ==========================================================================

  // Redis Check
  if (features.cache.redis) {
    try {
      const Redis = (await import('ioredis')).default
      const redis = new Redis(process.env.REDIS_URL!)
      await redis.ping()
      await redis.quit()
      services.push({
        name: 'Redis Cache',
        status: 'healthy',
        message: 'Connected',
      })
    } catch (error: any) {
      services.push({
        name: 'Redis Cache',
        status: 'warning',
        message: `Connection issue: ${error.message}`,
      })
      overallStatus = overallStatus === 'healthy' ? 'degraded' : overallStatus
    }
  } else {
    services.push({
      name: 'Redis Cache',
      status: 'not_configured',
      message: 'REDIS_URL not set (rate limiting and caching disabled)',
    })
  }

  // Payment Gateway Checks
  if (features.payments.stripe) {
    const hasWebhook = Boolean(process.env.STRIPE_WEBHOOK_SECRET)
    services.push({
      name: 'Stripe Payments',
      status: hasWebhook ? 'healthy' : 'warning',
      message: hasWebhook 
        ? 'Configured with webhook' 
        : 'Missing STRIPE_WEBHOOK_SECRET (webhooks won\'t work)',
    })
  }

  if (features.payments.paystack) {
    const hasWebhook = Boolean(process.env.PAYSTACK_WEBHOOK_SECRET)
    services.push({
      name: 'Paystack Payments',
      status: hasWebhook ? 'healthy' : 'warning',
      message: hasWebhook 
        ? 'Configured with webhook' 
        : 'Missing PAYSTACK_WEBHOOK_SECRET',
    })
  }

  // Google Maps Check
  if (features.maps.google) {
    try {
      // Simple check: verify API key format
      const apiKey = process.env.GOOGLE_MAPS_API_KEY!
      if (apiKey.length < 20) throw new Error('Invalid API key format')
      
      services.push({
        name: 'Google Maps API',
        status: 'healthy',
        message: 'API key configured',
      })
    } catch (error: any) {
      services.push({
        name: 'Google Maps API',
        status: 'warning',
        message: error.message,
      })
    }
  } else {
    services.push({
      name: 'Google Maps API',
      status: 'not_configured',
      message: 'Location features limited without API key',
    })
  }

  // Email Service Check
  if (features.email.sendgrid) {
    services.push({
      name: 'SendGrid Email',
      status: 'healthy',
      message: 'Configured',
    })
  } else if (features.email.smtp) {
    services.push({
      name: 'SMTP Email',
      status: 'healthy',
      message: 'Configured',
    })
  } else {
    services.push({
      name: 'Email Service',
      status: 'not_configured',
      message: 'Email notifications disabled',
    })
  }

  // ==========================================================================
  // ADVANCED SERVICES (Tier 3)
  // ==========================================================================

  // Social Media Platforms
  const socialPlatforms = [
    { flag: features.social.twitter, name: 'Twitter API', envVar: 'TWITTER_BEARER_TOKEN' },
    { flag: features.social.facebook, name: 'Facebook API', envVar: 'FACEBOOK_ACCESS_TOKEN' },
    { flag: features.social.linkedin, name: 'LinkedIn API', envVar: 'LINKEDIN_ACCESS_TOKEN' },
    { flag: features.social.instagram, name: 'Instagram API', envVar: 'INSTAGRAM_ACCESS_TOKEN' },
    { flag: features.social.pinterest, name: 'Pinterest API', envVar: 'PINTEREST_ACCESS_TOKEN' },
    { flag: features.social.telegram, name: 'Telegram Bot', envVar: 'TELEGRAM_BOT_TOKEN' },
    { flag: features.social.bitly, name: 'Bitly Shortener', envVar: 'BITLY_ACCESS_TOKEN' },
  ]

  for (const platform of socialPlatforms) {
    if (platform.flag) {
      // Check rate limits
      try {
        const usage = await rateLimiter.getUsage(
          platform.name.toLowerCase().split(' ')[0], 
          'post' in platform.name.toLowerCase() ? 'post_feed' : 'post_tweet'
        )
        
        const status = usage.percentage >= 90 
          ? 'warning' 
          : usage.percentage >= 80 
            ? 'warning' 
            : 'healthy'

        services.push({
          name: platform.name,
          status,
          message: `Configured | Quota: ${usage.remaining}/${usage.limit} remaining (${Math.round(usage.percentage)}% used)`,
          details: usage,
        })
      } catch {
        services.push({
          name: platform.name,
          status: 'healthy',
          message: 'Configured',
        })
      }
    }
  }

  // Delivery Platforms
  const deliveryPlatforms = [
    { flag: features.delivery.uberEats, name: 'Uber Eats' },
    { flag: features.delivery.doorDash, name: 'DoorDash' },
    { flag: features.delivery.grubhub, name: 'Grubhub' },
  ]

  for (const platform of deliveryPlatforms) {
    if (platform.flag) {
      services.push({
        name: platform.name,
        status: 'healthy',
        message: 'Configured',
      })
    }
  }

  // ==========================================================================
  // RATE LIMIT STATUS
  // ==========================================================================

  let rateLimitWarnings: any[] = []
  if (features.cache.redis) {
    try {
      rateLimitWarnings = await rateLimiter.getWarnings(80)
    } catch (error) {
      // Rate limit check failed (non-critical)
    }
  }

  // ==========================================================================
  // RESPONSE
  // ==========================================================================

  const configuredCount = services.filter(s => s.status === 'healthy' || s.status === 'warning').length
  const totalServices = services.length
  const healthyCount = services.filter(s => s.status === 'healthy').length

  return NextResponse.json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    summary: {
      total: totalServices,
      healthy: healthyCount,
      warnings: services.filter(s => s.status === 'warning').length,
      down: services.filter(s => s.status === 'down').length,
      notConfigured: services.filter(s => s.status === 'not_configured').length,
      coverage: `${Math.round((configuredCount / totalServices) * 100)}%`,
    },
    services,
    rateLimits: {
      warnings: rateLimitWarnings.length,
      details: rateLimitWarnings.slice(0, 5), // Top 5 warnings
    },
    features: {
      tier: features.booking ? 'configured' : 'unknown', // Features are always available through feature-flags
      core: 4, // booking, auth, profiles, search
      basic: Object.values(features.payments).filter(Boolean).length +
             (features.maps.enabled ? 1 : 0) +
             (features.email.enabled ? 1 : 0),
      advanced: Object.values(features.social).filter(Boolean).length +
                Object.values(features.delivery).filter(Boolean).length,
    },
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: Math.floor(process.uptime()),
    },
  })
}
