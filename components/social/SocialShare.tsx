'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Share2, 
  Facebook, 
  Twitter, 
  Instagram, 
  MessageCircle,
  Mail,
  Copy,
  QrCode,
  Download
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface SocialShareProps {
  bookingId: string;
  restaurantName: string;
  bookingTime: string;
  partySize: number;
  confirmationCode: string;
  className?: string;
}

interface SharePlatform {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  getUrl: (params: any) => string;
  getMessage: (params: any) => string;
}

export function SocialShareCard({ 
  bookingId, 
  restaurantName, 
  bookingTime, 
  partySize, 
  confirmationCode,
  className 
}: SocialShareProps) {
  const [showOptions, setShowOptions] = useState(false);

  const shareData = {
    restaurantName,
    bookingTime,
    partySize,
    confirmationCode,
    bookingUrl: `${window.location.origin}/booking/${bookingId}`,
  };

  const sharePlatforms: SharePlatform[] = [
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      getUrl: (data) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.bookingUrl)}`,
      getMessage: (data) => `🍽️ I just booked a table at ${data.restaurantName}! Time: ${data.bookingTime}, Party: ${data.partySize} people`,
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      getUrl: (data) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(data.shareMessage)}&url=${encodeURIComponent(data.bookingUrl)}`,
      getMessage: (data) => `🍽️ Just booked at ${data.restaurantName}! ${data.partySize} people, ${data.bookingTime} 📅`,
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-500 hover:bg-green-600',
      getUrl: (data) => `https://wa.me/?text=${encodeURIComponent(data.shareMessage + ' ' + data.bookingUrl)}`,
      getMessage: (data) => `🍽️ Great news! I just booked a table at ${data.restaurantName} for ${data.partySize} people on ${data.bookingTime}`,
    },
    {
      id: 'email',
      name: 'Email',
      icon: Mail,
      color: 'bg-gray-600 hover:bg-gray-700',
      getUrl: (data) => `mailto:?subject=🍽️ Restaurant Booking&body=${encodeURIComponent(data.shareMessage)}`,
      getMessage: (data) => `I'd love to share my restaurant booking with you!\n\n🍽️ Restaurant: ${data.restaurantName}\n📅 Time: ${data.bookingTime}\n👥 Party Size: ${data.partySize} people\n🎫 Confirmation: ${data.confirmationCode}\n\nBook your table at: ${data.bookingUrl}`,
    },
  ];

  const handlePlatformShare = (platform: SharePlatform) => {
    const shareMessage = platform.getMessage(shareData);
    const shareUrl = platform.getUrl({ ...shareData, shareMessage });
    
    // Open in new window for social platforms
    window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
    
    // Track social share event
    trackSocialShare(platform.id, bookingId);
    
    toast({
      title: "Shared successfully!",
      description: `Shared on ${platform.name}`,
    });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareData.bookingUrl);
      toast({
        title: "Link copied!",
        description: "Booking link copied to clipboard",
      });
      trackSocialShare('copy_link', bookingId);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const generateQRCode = () => {
    // Generate QR code for the booking URL
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareData.bookingUrl)}`;
    window.open(qrUrl, '_blank');
    trackSocialShare('qr_code', bookingId);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Booking at ${restaurantName}`,
          text: `I just booked a table at ${restaurantName}!`,
          url: shareData.bookingUrl,
        });
        trackSocialShare('native_share', bookingId);
      } catch (error) {
        // User cancelled sharing
        console.log('Share cancelled');
      }
    } else {
      // Fallback to showing options
      setShowOptions(true);
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Share Your Booking</h3>
          <Share2 className="h-5 w-5 text-gray-500" />
        </div>

        <div className="space-y-3">
          {/* Quick Share Buttons */}
          <div className="flex gap-2 flex-wrap">
            {sharePlatforms.slice(0, 3).map((platform) => {
              const Icon = platform.icon;
              return (
                <Button
                  key={platform.id}
                  size="sm"
                  className={`${platform.color} text-white flex items-center gap-2`}
                  onClick={() => handlePlatformShare(platform)}
                >
                  <Icon className="h-4 w-4" />
                  {platform.name}
                </Button>
              );
            })}
          </div>

          {/* Additional Options */}
          <div className="flex gap-2">
            {sharePlatforms.slice(3).map((platform) => {
              const Icon = platform.icon;
              return (
                <Button
                  key={platform.id}
                  size="sm"
                  variant="outline"
                  className={platform.color.replace('hover:bg-', 'hover:border-')}
                  onClick={() => handlePlatformShare(platform)}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {platform.name}
                </Button>
              );
            })}
          </div>

          {/* More Options */}
          <div className="flex gap-2 pt-2 border-t">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyLink}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy Link
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={generateQRCode}
              className="flex items-center gap-2"
            >
              <QrCode className="h-4 w-4" />
              QR Code
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleNativeShare}
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              More
            </Button>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm space-y-1">
            <div><strong>Restaurant:</strong> {restaurantName}</div>
            <div><strong>Time:</strong> {bookingTime}</div>
            <div><strong>Party:</strong> {partySize} people</div>
            <div><strong>Code:</strong> {confirmationCode}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to track social shares
async function trackSocialShare(platform: string, bookingId: string) {
  try {
    await fetch('/api/analytics/social-share', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        platform,
        bookingId,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error('Failed to track social share:', error);
  }
}

// Share Widget Component for embedding on restaurant pages
export function ShareWidget({ 
  restaurantId, 
  restaurantName, 
  className 
}: { 
  restaurantId: string; 
  restaurantName: string;
  className?: string;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  const restaurantUrl = `${window.location.origin}/restaurants/${restaurantId}`;

  const handleQuickShare = (platform: string) => {
    const messages = {
      facebook: `Check out ${restaurantName}! Great food and atmosphere.`,
      twitter: `Visiting ${restaurantName} soon! 🍽️`,
      whatsapp: `Let's go to ${restaurantName} together!`,
    };

    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(restaurantUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(messages.twitter)}&url=${encodeURIComponent(restaurantUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(messages.whatsapp + ' ' + restaurantUrl)}`,
    };

    window.open(urls[platform], '_blank', 'width=600,height=400');
    trackSocialShare(platform, restaurantId);
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="flex items-center gap-2"
      >
        <Share2 className="h-4 w-4" />
        Share
      </Button>

      {showTooltip && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px]">
          <div className="text-sm font-medium mb-2">Share this restaurant</div>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white p-2"
              onClick={() => handleQuickShare('facebook')}
            >
              <Facebook className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              className="bg-sky-500 hover:bg-sky-600 text-white p-2"
              onClick={() => handleQuickShare('twitter')}
            >
              <Twitter className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              className="bg-green-500 hover:bg-green-600 text-white p-2"
              onClick={() => handleQuickShare('whatsapp')}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
