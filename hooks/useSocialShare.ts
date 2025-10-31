/**
 * React Hook for Social Media Sharing
 * 
 * Provides easy-to-use React hook for integrating social media sharing
 * functionality throughout the application.
 */

'use client';

import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';

export interface ShareContent {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  hashtags?: string[];
  restaurantName?: string;
  bookingDetails?: {
    time: string;
    partySize: number;
    confirmationCode: string;
  };
}

export interface ShareOptions {
  platforms: string[];
  facebookPageId?: string;
  linkedinPersonId?: string;
  pinterestBoardId?: string;
  telegramChatId?: string;
  shortenUrl?: boolean;
}

export interface ShareResult {
  success: boolean;
  platform: string;
  shareUrl?: string;
  postId?: string;
  error?: string;
}

export function useSocialShare() {
  const [isSharing, setIsSharing] = useState(false);
  const [shareResults, setShareResults] = useState<ShareResult[]>([]);

  /**
   * Share content to external social media APIs
   */
  const shareToExternalAPIs = useCallback(
    async (content: ShareContent, options: ShareOptions): Promise<ShareResult[]> => {
      setIsSharing(true);
      setShareResults([]);

      try {
        const response = await fetch('/api/social/share', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content,
            options,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to share content');
        }

        const data = await response.json();
        setShareResults(data.results);

        // Show success/error toasts
        const successCount = data.results.filter((r: ShareResult) => r.success).length;
        const failCount = data.results.length - successCount;

        if (successCount > 0) {
          toast({
            title: 'Shared successfully!',
            description: `Shared to ${successCount} platform${successCount > 1 ? 's' : ''}`,
          });
        }

        if (failCount > 0) {
          toast({
            title: 'Some shares failed',
            description: `${failCount} platform${failCount > 1 ? 's' : ''} failed to share`,
            variant: 'destructive',
          });
        }

        return data.results;
      } catch (error: any) {
        toast({
          title: 'Share failed',
          description: error.message || 'Failed to share content',
          variant: 'destructive',
        });
        return [];
      } finally {
        setIsSharing(false);
      }
    },
    []
  );

  /**
   * Share via Web Share API (native mobile sharing)
   */
  const shareNative = useCallback(
    async (content: ShareContent): Promise<boolean> => {
      if (!navigator.share) {
        toast({
          title: 'Sharing not supported',
          description: 'Your browser does not support native sharing',
          variant: 'destructive',
        });
        return false;
      }

      try {
        await navigator.share({
          title: content.title,
          text: content.description,
          url: content.url,
        });
        
        // Track share
        await trackShare('native_share', content.url);
        
        return true;
      } catch (error: any) {
        // User cancelled or error occurred
        if (error.name !== 'AbortError') {
          console.error('Native share failed:', error);
        }
        return false;
      }
    },
    []
  );

  /**
   * Share via URL-based sharing (opens in new window)
   */
  const shareViaUrl = useCallback(
    (platform: string, content: ShareContent): void => {
      const urls: Record<string, string> = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(content.url)}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(content.description)}&url=${encodeURIComponent(content.url)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(content.url)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(`${content.description} ${content.url}`)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(content.url)}&text=${encodeURIComponent(content.description)}`,
        reddit: `https://reddit.com/submit?url=${encodeURIComponent(content.url)}&title=${encodeURIComponent(content.title)}`,
        email: `mailto:?subject=${encodeURIComponent(content.title)}&body=${encodeURIComponent(`${content.description}\n\n${content.url}`)}`,
      };

      const url = urls[platform.toLowerCase()];
      
      if (url) {
        window.open(url, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
        trackShare(platform, content.url);
      } else {
        toast({
          title: 'Platform not supported',
          description: `Sharing to ${platform} is not supported`,
          variant: 'destructive',
        });
      }
    },
    []
  );

  /**
   * Copy link to clipboard
   */
  const copyLink = useCallback(async (url: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Link copied!',
        description: 'Link copied to clipboard',
      });
      await trackShare('copy_link', url);
      return true;
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Unable to copy link to clipboard',
        variant: 'destructive',
      });
      return false;
    }
  }, []);

  /**
   * Generate QR code for URL
   */
  const generateQRCode = useCallback((url: string, size: number = 300): string => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
  }, []);

  /**
   * Download QR code
   */
  const downloadQRCode = useCallback((url: string, filename: string = 'qr-code.png'): void => {
    const qrUrl = generateQRCode(url, 500);
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = filename;
    link.click();
    
    trackShare('qr_code_download', url);
    
    toast({
      title: 'QR Code downloaded',
      description: 'QR code has been saved to your device',
    });
  }, [generateQRCode]);

  /**
   * Get shortened URL
   */
  const getShortenedUrl = useCallback(async (longUrl: string): Promise<string> => {
    try {
      const response = await fetch('/api/social/shorten-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: longUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to shorten URL');
      }

      const data = await response.json();
      return data.shortUrl || longUrl;
    } catch (error) {
      console.error('URL shortening failed:', error);
      return longUrl;
    }
  }, []);

  /**
   * Check which platforms are available
   */
  const checkPlatformAvailability = useCallback(async (): Promise<Record<string, boolean>> => {
    try {
      const response = await fetch('/api/social/platform-status');
      
      if (!response.ok) {
        throw new Error('Failed to check platform status');
      }

      const data = await response.json();
      return data.platforms;
    } catch (error) {
      console.error('Failed to check platform availability:', error);
      return {};
    }
  }, []);

  return {
    // State
    isSharing,
    shareResults,
    
    // Actions
    shareToExternalAPIs,
    shareNative,
    shareViaUrl,
    copyLink,
    generateQRCode,
    downloadQRCode,
    getShortenedUrl,
    checkPlatformAvailability,
  };
}

/**
 * Track share events for analytics
 */
async function trackShare(platform: string, url: string): Promise<void> {
  try {
    await fetch('/api/analytics/social-share', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        platform,
        url,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error('Failed to track share:', error);
  }
}

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/**
 * Example Component:
 * 
 * import { useSocialShare } from '@/hooks/useSocialShare';
 * 
 * function BookingShareButton({ booking }) {
 *   const { shareToExternalAPIs, shareViaUrl, isSharing } = useSocialShare();
 *   
 *   const handleShare = async () => {
 *     const content = {
 *       title: `Booking at ${booking.restaurantName}`,
 *       description: `I just booked a table!`,
 *       url: `https://example.com/booking/${booking.id}`,
 *       imageUrl: booking.restaurant.imageUrl,
 *       hashtags: ['foodie', 'restaurant'],
 *     };
 *     
 *     // Option 1: Share to external APIs (requires API credentials)
 *     await shareToExternalAPIs(content, {
 *       platforms: ['twitter', 'facebook'],
 *     });
 *     
 *     // Option 2: Share via URL (no API required)
 *     shareViaUrl('twitter', content);
 *   };
 *   
 *   return (
 *     <button onClick={handleShare} disabled={isSharing}>
 *       {isSharing ? 'Sharing...' : 'Share Booking'}
 *     </button>
 *   );
 * }
 */
