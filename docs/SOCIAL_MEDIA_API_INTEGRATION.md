# External Social Media API Integration Guide

## Overview

This guide explains how to integrate external social media APIs into your restaurant booking application for advanced sharing functionality beyond simple URL-based sharing.

## Features

- ✅ **Direct API Integration** - Post directly to social media platforms
- ✅ **Multi-Platform Support** - Twitter, Facebook, LinkedIn, Instagram, Pinterest, Telegram
- ✅ **URL Shortening** - Bitly and TinyURL integration
- ✅ **Analytics Tracking** - Track share performance across platforms
- ✅ **Open Graph Tags** - Rich preview cards for shares
- ✅ **QR Code Generation** - Generate shareable QR codes
- ✅ **Native Sharing** - Web Share API for mobile devices

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Platform Setup](#platform-setup)
3. [API Credentials](#api-credentials)
4. [Usage Examples](#usage-examples)
5. [API Routes](#api-routes)
6. [Components](#components)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

### 1. Install Dependencies

All required dependencies are already included in the project. No additional installation needed.

### 2. Configure Environment Variables

Copy the social media API section from `.env.example` to your `.env.local`:

```bash
# Add to your .env.local file
TWITTER_BEARER_TOKEN=your_token_here
FACEBOOK_ACCESS_TOKEN=your_token_here
# ... (see .env.example for all variables)
```

### 3. Use in Your Components

```typescript
import { useSocialShare } from '@/hooks/useSocialShare';

function MyComponent() {
  const { shareToExternalAPIs, isSharing } = useSocialShare();

  const handleShare = async () => {
    await shareToExternalAPIs(
      {
        title: 'My Booking',
        description: 'Just booked a table!',
        url: 'https://example.com/booking/123',
        imageUrl: 'https://example.com/image.jpg',
        hashtags: ['foodie', 'restaurant'],
      },
      {
        platforms: ['twitter', 'facebook'],
      }
    );
  };

  return (
    <button onClick={handleShare} disabled={isSharing}>
      Share
    </button>
  );
}
```

---

## Platform Setup

### Twitter API v2

**Requirements:**
- Twitter Developer Account
- App with Read and Write permissions

**Steps:**
1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new App (or use existing)
3. Go to "Keys and tokens" tab
4. Generate API Key, API Secret, Bearer Token, Access Token, and Access Token Secret
5. Add to `.env.local`

**Permissions Needed:**
- Read and Write Tweets
- Read and Write Direct Messages (optional)

**Rate Limits:**
- 300 tweets per 3 hours
- 50 tweets per 24 hours (free tier)

---

### Facebook Graph API

**Requirements:**
- Facebook Developer Account
- Facebook App
- Page Access Token (for posting to pages)

**Steps:**
1. Go to [Facebook Developers](https://developers.facebook.com/apps/)
2. Create a new App (type: Business)
3. Add "Facebook Login" product
4. Go to "Tools" > "Graph API Explorer"
5. Generate Access Token with permissions: `pages_manage_posts`, `pages_read_engagement`
6. For long-lived tokens, use the Access Token Debugger

**Permissions Needed:**
- `pages_manage_posts` - Post to pages
- `pages_read_engagement` - Read engagement metrics
- `publish_to_groups` - Post to groups (optional)

**Rate Limits:**
- 200 calls per hour per user
- 4800 calls per day per app

---

### LinkedIn API

**Requirements:**
- LinkedIn Developer Account
- LinkedIn App

**Steps:**
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps/)
2. Create a new App
3. Add "Share on LinkedIn" product
4. Request access to "Marketing Developer Platform" (for company pages)
5. Generate Access Token with OAuth 2.0

**Permissions Needed:**
- `w_member_social` - Share on personal profile
- `w_organization_social` - Share on company page

**Rate Limits:**
- 100,000 API calls per day per app
- 500 API calls per app per user per day

---

### Instagram Graph API

**Requirements:**
- Facebook Business Account
- Instagram Business or Creator Account
- Facebook App

**Steps:**
1. Convert Instagram account to Business/Creator account
2. Link to Facebook Page
3. Use Facebook Graph API Explorer
4. Generate Access Token with permissions: `instagram_basic`, `instagram_content_publish`

**Permissions Needed:**
- `instagram_basic` - Read profile info
- `instagram_content_publish` - Publish posts
- `pages_read_engagement` - Read insights

**Limitations:**
- Only Business/Creator accounts can use API
- Cannot publish Stories via API (manual only)
- Cannot publish Reels via API

**Rate Limits:**
- 25 posts per 24 hours per Instagram account

---

### Pinterest API

**Requirements:**
- Pinterest Business Account
- Pinterest App

**Steps:**
1. Go to [Pinterest Developers](https://developers.pinterest.com/apps/)
2. Create a new App
3. Generate Access Token
4. Get Board ID for posting

**Permissions Needed:**
- `boards:read` - Read board info
- `pins:read` - Read pins
- `pins:write` - Create pins

**Rate Limits:**
- 10,000 requests per hour per app
- 200 requests per minute per user

---

### Telegram Bot API

**Requirements:**
- Telegram Account
- Bot created via BotFather

**Steps:**
1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow instructions to create bot
4. Copy the Bot Token
5. Get your Chat ID (send a message to bot, then call `https://api.telegram.org/bot<token>/getUpdates`)

**Permissions Needed:**
- Send messages
- Send photos
- Send inline keyboards

**Rate Limits:**
- 30 messages per second per bot
- 20 messages per minute per chat

---

### Bitly URL Shortener

**Requirements:**
- Bitly Account

**Steps:**
1. Go to [Bitly](https://bitly.com/)
2. Sign up or log in
3. Go to Settings > API
4. Generate Generic Access Token
5. Add to `.env.local`

**Rate Limits:**
- 100 requests per hour (free tier)
- 1,000 requests per hour (paid tiers)

---

## API Credentials

### Environment Variables Structure

```bash
# Twitter
TWITTER_API_KEY=abc123
TWITTER_API_SECRET=def456
TWITTER_BEARER_TOKEN=ghi789
TWITTER_ACCESS_TOKEN=jkl012
TWITTER_ACCESS_TOKEN_SECRET=mno345

# Facebook
FACEBOOK_APP_ID=123456789
FACEBOOK_APP_SECRET=abcdef123456
FACEBOOK_ACCESS_TOKEN=EAABc123456...

# LinkedIn
LINKEDIN_CLIENT_ID=abc123def
LINKEDIN_CLIENT_SECRET=456ghi789
LINKEDIN_ACCESS_TOKEN=AQV123...

# Instagram
INSTAGRAM_APP_ID=123456789
INSTAGRAM_APP_SECRET=abcdef123
INSTAGRAM_ACCESS_TOKEN=IGQVJXa...
INSTAGRAM_BUSINESS_ACCOUNT_ID=17841401234567890

# Pinterest
PINTEREST_APP_ID=1234567
PINTEREST_APP_SECRET=abc123def
PINTEREST_ACCESS_TOKEN=pina_ABC123...

# Telegram
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...

# Bitly
BITLY_ACCESS_TOKEN=abc123def456...
```

---

## Usage Examples

### Example 1: Share Booking to Twitter

```typescript
import { useSocialShare } from '@/hooks/useSocialShare';

function BookingConfirmation({ booking }) {
  const { shareToExternalAPIs } = useSocialShare();

  const handleTwitterShare = async () => {
    await shareToExternalAPIs(
      {
        title: `Booking at ${booking.restaurantName}`,
        description: `🍽️ Just booked a table at ${booking.restaurantName} for ${booking.partySize} people on ${booking.time}!`,
        url: `${window.location.origin}/booking/${booking.id}`,
        imageUrl: booking.restaurant.imageUrl,
        hashtags: ['foodie', 'restaurant', booking.restaurantName.replace(/\s/g, '')],
      },
      {
        platforms: ['twitter'],
      }
    );
  };

  return (
    <button onClick={handleTwitterShare}>
      Share on Twitter
    </button>
  );
}
```

### Example 2: Share to Multiple Platforms

```typescript
const handleMultiShare = async () => {
  const results = await shareToExternalAPIs(
    {
      title: 'Amazing Restaurant Experience',
      description: 'Had an incredible dining experience at The Gourmet Kitchen!',
      url: 'https://example.com/restaurant/123',
      imageUrl: 'https://example.com/restaurant-photo.jpg',
      hashtags: ['foodie', 'restaurant', 'finedining'],
    },
    {
      platforms: ['twitter', 'facebook', 'linkedin'],
      facebookPageId: 'your-page-id', // Optional: share to page instead of profile
      linkedinPersonId: 'your-person-id', // Required for LinkedIn
    }
  );

  console.log('Share results:', results);
};
```

### Example 3: URL-Based Sharing (No API Credentials Needed)

```typescript
import { useSocialShare } from '@/hooks/useSocialShare';

function QuickShare({ restaurant }) {
  const { shareViaUrl } = useSocialShare();

  const content = {
    title: restaurant.name,
    description: `Check out ${restaurant.name}!`,
    url: `${window.location.origin}/restaurant/${restaurant.id}`,
  };

  return (
    <div className="flex gap-2">
      <button onClick={() => shareViaUrl('twitter', content)}>Twitter</button>
      <button onClick={() => shareViaUrl('facebook', content)}>Facebook</button>
      <button onClick={() => shareViaUrl('whatsapp', content)}>WhatsApp</button>
      <button onClick={() => shareViaUrl('linkedin', content)}>LinkedIn</button>
    </div>
  );
}
```

### Example 4: Native Mobile Sharing

```typescript
import { useSocialShare } from '@/hooks/useSocialShare';

function MobileShareButton({ content }) {
  const { shareNative } = useSocialShare();

  const handleShare = async () => {
    const success = await shareNative(content);
    if (!success) {
      // Fallback to URL-based sharing
      console.log('Native share not available');
    }
  };

  return (
    <button onClick={handleShare}>
      Share
    </button>
  );
}
```

### Example 5: Copy Link and Generate QR Code

```typescript
import { useSocialShare } from '@/hooks/useSocialShare';

function ShareOptions({ url }) {
  const { copyLink, downloadQRCode, generateQRCode } = useSocialShare();

  return (
    <div>
      <button onClick={() => copyLink(url)}>
        Copy Link
      </button>
      
      <button onClick={() => downloadQRCode(url, 'booking-qr.png')}>
        Download QR Code
      </button>

      <img src={generateQRCode(url, 200)} alt="QR Code" />
    </div>
  );
}
```

### Example 6: Shorten URL Before Sharing

```typescript
const { getShortenedUrl, shareToExternalAPIs } = useSocialShare();

const handleShare = async () => {
  const longUrl = 'https://example.com/restaurant/123?ref=share&source=twitter';
  const shortUrl = await getShortenedUrl(longUrl);

  await shareToExternalAPIs(
    {
      title: 'Check this out!',
      description: 'Amazing restaurant',
      url: shortUrl, // Use shortened URL
    },
    {
      platforms: ['twitter'],
    }
  );
};
```

---

## API Routes

### POST /api/social/share

Share content to multiple platforms.

**Request:**
```json
{
  "content": {
    "title": "My Booking",
    "description": "Just booked a table!",
    "url": "https://example.com/booking/123",
    "imageUrl": "https://example.com/image.jpg",
    "hashtags": ["foodie", "restaurant"]
  },
  "options": {
    "platforms": ["twitter", "facebook"],
    "shortenUrl": true,
    "facebookPageId": "optional-page-id",
    "linkedinPersonId": "required-for-linkedin"
  }
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "success": true,
      "platform": "twitter",
      "postId": "1234567890",
      "shareUrl": "https://twitter.com/user/status/1234567890"
    },
    {
      "success": true,
      "platform": "facebook",
      "postId": "123456_789012",
      "shareUrl": "https://www.facebook.com/123456_789012"
    }
  ]
}
```

### POST /api/social/shorten-url

Shorten a URL using Bitly or TinyURL.

**Request:**
```json
{
  "url": "https://example.com/very-long-url-here"
}
```

**Response:**
```json
{
  "success": true,
  "shortUrl": "https://bit.ly/abc123"
}
```

### GET /api/social/platform-status

Check which platforms are configured.

**Response:**
```json
{
  "success": true,
  "platforms": {
    "twitter": true,
    "facebook": true,
    "linkedin": false,
    "instagram": false,
    "pinterest": false,
    "telegram": true,
    "bitly": true
  }
}
```

---

## Components

### Enhanced Social Share Card

Use the pre-built component with external API integration:

```typescript
import { SocialShareCard } from '@/components/social/SocialShare';
import { EnhancedSocialShareCard } from '@/components/social/EnhancedSocialShare';

// Basic URL-based sharing
<SocialShareCard
  bookingId="123"
  restaurantName="The Gourmet Kitchen"
  bookingTime="2024-12-01 19:00"
  partySize={4}
  confirmationCode="BOOK123"
/>

// Enhanced with external API support
<EnhancedSocialShareCard
  bookingId="123"
  restaurantName="The Gourmet Kitchen"
  bookingTime="2024-12-01 19:00"
  partySize={4}
  confirmationCode="BOOK123"
  enableExternalAPIs={true}
  platforms={['twitter', 'facebook', 'linkedin']}
/>
```

---

## Troubleshooting

### Common Issues

#### 1. "Not configured" errors

**Problem:** Platform shows as "Not configured" when trying to share.

**Solution:**
- Check `.env.local` has all required variables for that platform
- Restart your development server after adding environment variables
- Verify credentials are correct in developer portals

#### 2. Twitter API "Forbidden" error

**Problem:** 403 Forbidden when posting tweets.

**Solution:**
- Ensure your Twitter App has "Read and Write" permissions
- Regenerate access tokens after changing permissions
- Check if you've exceeded rate limits (300 tweets per 3 hours)

#### 3. Facebook "Invalid access token"

**Problem:** Facebook returns invalid access token error.

**Solution:**
- Tokens expire! Generate a long-lived token (60 days)
- Use Facebook's Access Token Debugger to check status
- For permanent access, implement OAuth flow

#### 4. Instagram posting fails

**Problem:** Cannot post to Instagram.

**Solution:**
- Verify account is Business or Creator (not Personal)
- Ensure Instagram account is linked to Facebook Page
- Check image meets Instagram requirements (min 320px, max 1080px)
- Wait for container creation (can take up to 30 seconds)

#### 5. LinkedIn "Person ID required"

**Problem:** LinkedIn share fails without person ID.

**Solution:**
- Get your person ID from LinkedIn API: `GET https://api.linkedin.com/v2/me`
- Store person ID in user profile or environment variable
- Pass `linkedinPersonId` in options when sharing

#### 6. URL shortening not working

**Problem:** URLs not getting shortened.

**Solution:**
- Check Bitly access token is valid
- Verify you haven't exceeded rate limits
- Falls back to TinyURL if Bitly fails (no auth required)

### Rate Limit Handling

```typescript
// Example: Implement retry with backoff
async function shareWithRetry(content, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const results = await shareToExternalAPIs(content, options);
      return results;
    } catch (error) {
      if (error.message.includes('rate limit')) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}
```

### Debug Mode

Enable detailed logging:

```typescript
// In your .env.local
DEBUG_SOCIAL_APIS=true

// Check browser console for detailed API responses
```

---

## Security Best Practices

1. **Never expose API credentials in client-side code**
   - Always use server-side API routes
   - Store credentials in `.env.local` (gitignored)

2. **Validate user input**
   - Sanitize content before posting
   - Check URL validity before sharing

3. **Implement rate limiting**
   - Add rate limiting to your API routes
   - Track user share counts

4. **Use HTTPS only**
   - All API calls use HTTPS
   - Validate SSL certificates

5. **Rotate tokens regularly**
   - Refresh access tokens before expiry
   - Implement OAuth refresh flow for long-term access

---

## Performance Optimization

1. **Parallel sharing**
   - Already implemented: shares to multiple platforms simultaneously
   - Uses Promise.all() for parallel execution

2. **Caching**
   - Cache shortened URLs to avoid redundant API calls
   - Store platform status to reduce API checks

3. **Lazy loading**
   - Load social share components only when needed
   - Use dynamic imports for heavy components

4. **Image optimization**
   - Compress images before uploading to social media
   - Use appropriate image sizes for each platform

---

## Support

For issues or questions:
1. Check this documentation
2. Review platform-specific documentation links above
3. Check environment variables are correctly set
4. Enable debug mode for detailed logs

---

## License

This integration code is part of your Restaurant Booking Platform and follows your project's license.
