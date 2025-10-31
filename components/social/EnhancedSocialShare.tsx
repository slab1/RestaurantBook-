/**
 * Enhanced Social Share Component with External API Integration
 * 
 * Provides a comprehensive sharing interface with:
 * - External API integration (Twitter, Facebook, LinkedIn, etc.)
 * - URL-based sharing (fallback)
 * - Native sharing (mobile)
 * - QR code generation
 * - URL shortening
 * - Platform availability detection
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Share2, 
  Facebook, 
  Twitter, 
  Linkedin,
  Instagram, 
  MessageCircle,
  Mail,
  Copy,
  QrCode,
  Download,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { useSocialShare, ShareContent } from '@/hooks/useSocialShare';

interface EnhancedSocialShareProps {
  bookingId?: string;
  restaurantId?: string;
  restaurantName: string;
  bookingTime?: string;
  partySize?: number;
  confirmationCode?: string;
  imageUrl?: string;
  className?: string;
  enableExternalAPIs?: boolean;
  defaultPlatforms?: string[];
}

export function EnhancedSocialShareCard({ 
  bookingId,
  restaurantId,
  restaurantName, 
  bookingTime, 
  partySize, 
  confirmationCode,
  imageUrl,
  className,
  enableExternalAPIs = false,
  defaultPlatforms = ['twitter', 'facebook', 'linkedin'],
}: EnhancedSocialShareProps) {
  const [activeTab, setActiveTab] = useState<'quick' | 'api' | 'advanced'>('quick');
  const [platformStatus, setPlatformStatus] = useState<Record<string, boolean>>({});
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [shortUrl, setShortUrl] = useState<string>('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(defaultPlatforms);

  const {
    isSharing,
    shareResults,
    shareToExternalAPIs,
    shareViaUrl,
    shareNative,
    copyLink,
    generateQRCode,
    downloadQRCode,
    getShortenedUrl,
    checkPlatformAvailability,
  } = useSocialShare();

  const shareUrl = bookingId 
    ? `${window.location.origin}/booking/${bookingId}`
    : `${window.location.origin}/restaurant/${restaurantId}`;

  const shareContent: ShareContent = {
    title: bookingId ? `Booking at ${restaurantName}` : restaurantName,
    description: bookingId
      ? `🍽️ I just booked a table at ${restaurantName}${bookingTime ? ` for ${bookingTime}` : ''}${partySize ? ` (${partySize} people)` : ''}!`
      : `Check out ${restaurantName}! Great food and atmosphere. 🍽️`,
    url: shortUrl || shareUrl,
    imageUrl: imageUrl,
    hashtags: ['foodie', 'restaurant', restaurantName.replace(/\s+/g, '')],
    restaurantName,
    ...(bookingId && bookingTime && partySize && confirmationCode && {
      bookingDetails: {
        time: bookingTime,
        partySize,
        confirmationCode,
      }
    }),
  };

  // Check platform availability on mount
  useEffect(() => {
    if (enableExternalAPIs) {
      checkPlatformAvailability().then(setPlatformStatus);
    }
  }, [enableExternalAPIs, checkPlatformAvailability]);

  // Generate QR code on mount
  useEffect(() => {
    setQrCodeUrl(generateQRCode(shareUrl, 300));
  }, [shareUrl, generateQRCode]);

  // Get shortened URL
  const handleGetShortUrl = async () => {
    const short = await getShortenedUrl(shareUrl);
    setShortUrl(short);
  };

  // Share via external APIs
  const handleAPIShare = async () => {
    await shareToExternalAPIs(shareContent, {
      platforms: selectedPlatforms,
      shortenUrl: !!shortUrl,
    });
  };

  // Toggle platform selection
  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const platformConfig = [
    {
      id: 'twitter',
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      available: true,
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      available: true,
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-700 hover:bg-blue-800',
      available: true,
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-500 hover:bg-green-600',
      available: true,
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      color: 'bg-pink-500 hover:bg-pink-600',
      available: false, // Requires image
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: Send,
      color: 'bg-blue-500 hover:bg-blue-600',
      available: true,
    },
    {
      id: 'email',
      name: 'Email',
      icon: Mail,
      color: 'bg-gray-600 hover:bg-gray-700',
      available: true,
    },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share {bookingId ? 'Your Booking' : 'This Restaurant'}
          </span>
          {enableExternalAPIs && (
            <Badge variant="secondary">
              API Enabled
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="quick">Quick Share</TabsTrigger>
            {enableExternalAPIs && (
              <TabsTrigger value="api">API Share</TabsTrigger>
            )}
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* Quick Share Tab (URL-based) */}
          <TabsContent value="quick" className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {platformConfig.slice(0, 6).map((platform) => {
                const Icon = platform.icon;
                return (
                  <Button
                    key={platform.id}
                    size="sm"
                    className={`${platform.color} text-white`}
                    onClick={() => shareViaUrl(platform.id, shareContent)}
                    disabled={platform.id === 'instagram' && !imageUrl}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {platform.name}
                  </Button>
                );
              })}
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyLink(shareUrl)}
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => shareNative(shareContent)}
                className="flex-1"
              >
                <Share2 className="h-4 w-4 mr-2" />
                More
              </Button>
            </div>
          </TabsContent>

          {/* API Share Tab (External APIs) */}
          {enableExternalAPIs && (
            <TabsContent value="api" className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Select platforms to share via API (posts directly to your accounts):
                </p>
                
                <div className="grid grid-cols-2 gap-2">
                  {['twitter', 'facebook', 'linkedin', 'instagram'].map((platform) => {
                    const config = platformConfig.find(p => p.id === platform);
                    if (!config) return null;
                    
                    const Icon = config.icon;
                    const isAvailable = platformStatus[platform];
                    const isSelected = selectedPlatforms.includes(platform);
                    
                    return (
                      <Button
                        key={platform}
                        size="sm"
                        variant={isSelected ? 'default' : 'outline'}
                        className={isSelected ? config.color : ''}
                        onClick={() => togglePlatform(platform)}
                        disabled={!isAvailable}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {config.name}
                        {!isAvailable && (
                          <AlertCircle className="h-3 w-3 ml-1 text-yellow-500" />
                        )}
                        {isSelected && (
                          <CheckCircle2 className="h-3 w-3 ml-1" />
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleAPIShare}
                disabled={isSharing || selectedPlatforms.length === 0}
              >
                {isSharing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sharing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Share to {selectedPlatforms.length} Platform{selectedPlatforms.length > 1 ? 's' : ''}
                  </>
                )}
              </Button>

              {/* Share Results */}
              {shareResults.length > 0 && (
                <div className="space-y-2 pt-2 border-t">
                  <p className="text-sm font-medium">Share Results:</p>
                  {shareResults.map((result, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-2 rounded text-sm ${
                        result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <AlertCircle className="h-4 w-4" />
                        )}
                        {result.platform}
                      </span>
                      {result.shareUrl && (
                        <a
                          href={result.shareUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:underline"
                        >
                          View <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          )}

          {/* Advanced Tab (QR Code, URL Shortening) */}
          <TabsContent value="advanced" className="space-y-4">
            {/* URL Shortening */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Shortened URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shortUrl || shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border rounded text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGetShortUrl}
                  disabled={!!shortUrl}
                >
                  {shortUrl ? 'Shortened' : 'Shorten'}
                </Button>
              </div>
            </div>

            {/* QR Code */}
            <div className="space-y-2">
              <label className="text-sm font-medium">QR Code</label>
              <div className="flex flex-col items-center gap-3 p-4 bg-gray-50 rounded">
                {qrCodeUrl && (
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    className="w-48 h-48 border-4 border-white rounded shadow-md"
                  />
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadQRCode(shareUrl, `${restaurantName}-qr.png`)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyLink(shareUrl)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy URL
                  </Button>
                </div>
              </div>
            </div>

            {/* Email Share with Custom Message */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Share</label>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => shareViaUrl('email', shareContent)}
              >
                <Mail className="h-4 w-4 mr-2" />
                Open Email Client
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Booking Summary (if applicable) */}
        {bookingId && bookingTime && partySize && confirmationCode && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs font-medium text-blue-900 mb-2">Booking Details</p>
            <div className="text-xs space-y-1 text-blue-800">
              <div><strong>Restaurant:</strong> {restaurantName}</div>
              <div><strong>Time:</strong> {bookingTime}</div>
              <div><strong>Party:</strong> {partySize} people</div>
              <div><strong>Code:</strong> {confirmationCode}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// COMPACT VERSION (For inline use)
// ============================================================================

export function CompactShareButtons({
  restaurantId,
  restaurantName,
  imageUrl,
  className,
}: {
  restaurantId: string;
  restaurantName: string;
  imageUrl?: string;
  className?: string;
}) {
  const { shareViaUrl, copyLink } = useSocialShare();

  const shareUrl = `${window.location.origin}/restaurant/${restaurantId}`;
  const shareContent: ShareContent = {
    title: restaurantName,
    description: `Check out ${restaurantName}!`,
    url: shareUrl,
    imageUrl,
    hashtags: ['foodie', 'restaurant'],
  };

  return (
    <div className={`flex gap-1 ${className}`}>
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8"
        onClick={() => shareViaUrl('twitter', shareContent)}
        title="Share on Twitter"
      >
        <Twitter className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8"
        onClick={() => shareViaUrl('facebook', shareContent)}
        title="Share on Facebook"
      >
        <Facebook className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8"
        onClick={() => shareViaUrl('whatsapp', shareContent)}
        title="Share on WhatsApp"
      >
        <MessageCircle className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8"
        onClick={() => copyLink(shareUrl)}
        title="Copy Link"
      >
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  );
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example 1: Full card on booking confirmation page
 * 
 * <EnhancedSocialShareCard
 *   bookingId="123"
 *   restaurantName="The Gourmet Kitchen"
 *   bookingTime="2024-12-01 19:00"
 *   partySize={4}
 *   confirmationCode="BOOK123"
 *   imageUrl="https://example.com/restaurant.jpg"
 *   enableExternalAPIs={true}
 *   defaultPlatforms={['twitter', 'facebook']}
 * />
 */

/**
 * Example 2: Compact buttons on restaurant card
 * 
 * <CompactShareButtons
 *   restaurantId="456"
 *   restaurantName="Italian Bistro"
 *   imageUrl="https://example.com/bistro.jpg"
 *   className="absolute top-2 right-2"
 * />
 */
