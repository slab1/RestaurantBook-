'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Gift, 
  TrendingUp, 
  Share2, 
  Copy,
  Mail,
  MessageCircle,
  Trophy,
  Calendar,
  Star,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  pendingReferrals: number;
  conversionRate: number;
  totalPointsEarned: number;
  referralCode: string;
  isActive: boolean;
  recentReferrals: any[];
}

export function ReferralDashboard() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferralStats();
  }, []);

  const fetchReferralStats = async () => {
    try {
      const response = await fetch('/api/referrals/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
        setReferralCode(data.data.referralCode || '');
      }
    } catch (error) {
      console.error('Failed to fetch referral stats:', error);
      toast({
        title: "Error",
        description: "Failed to load referral statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = async () => {
    if (!referralCode) return;

    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy referral code",
        variant: "destructive",
      });
    }
  };

  const shareReferralCode = (platform: string) => {
    if (!referralCode) return;

    const referralUrl = `${window.location.origin}/register?ref=${referralCode}`;
    const message = `Join me on RestaurantBook! Get $25 off your first booking. Use my code: ${referralCode}`;

    const urls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(message + ' ' + referralUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(referralUrl)}`,
      email: `mailto:?subject=🍽️ Restaurant Booking Referral&body=${encodeURIComponent(message + '\n\n' + referralUrl)}`,
    };

    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'CANCELLED':
      case 'EXPIRED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      COMPLETED: "default",
      PENDING: "secondary",
      CANCELLED: "destructive",
      EXPIRED: "destructive",
    };

    return (
      <Badge variant={variants[status] || "secondary"}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>Unable to load referral statistics</p>
          <Button onClick={fetchReferralStats} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                <p className="text-3xl font-bold">{stats.totalReferrals}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Successful</p>
                <p className="text-3xl font-bold text-green-600">{stats.successfulReferrals}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-3xl font-bold">{stats.conversionRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Points Earned</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.totalPointsEarned}</p>
              </div>
              <Gift className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Code Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Your Referral Code
          </CardTitle>
          <CardDescription>
            Share this code with friends to earn rewards when they sign up and make their first booking.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {referralCode ? (
            <>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Your Referral Code</p>
                  <p className="text-2xl font-mono font-bold text-blue-600">{referralCode}</p>
                </div>
                <Button 
                  onClick={copyReferralCode}
                  variant={copied ? "default" : "outline"}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Share your code:</p>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    className="bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => shareReferralCode('whatsapp')}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => shareReferralCode('facebook')}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Facebook
                  </Button>
                  <Button
                    size="sm"
                    className="bg-sky-500 hover:bg-sky-600 text-white"
                    onClick={() => shareReferralCode('twitter')}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Twitter
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => shareReferralCode('email')}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Generate Your Referral Code</h3>
              <p className="text-gray-600 mb-4">
                Get started by generating your unique referral code to start earning rewards.
              </p>
              <Button onClick={generateReferralCode}>
                Generate Code
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Referral History */}
      <Card>
        <CardHeader>
          <CardTitle>Referral History</CardTitle>
          <CardDescription>
            Track your referral progress and rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentReferrals && stats.recentReferrals.length > 0 ? (
            <div className="space-y-4">
              {stats.recentReferrals.map((referral, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(referral.status)}
                    <div>
                      <p className="font-medium">
                        {referral.referee?.firstName} {referral.referee?.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        Joined {new Date(referral.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(referral.status)}
                    {referral.pointsAwarded > 0 && (
                      <p className="text-sm text-yellow-600 mt-1">
                        +{referral.pointsAwarded} points
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No referrals yet</h3>
              <p className="text-gray-600">
                Start sharing your referral code to see your progress here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rewards Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Referral Rewards
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">For Referrer</h4>
              <p className="text-yellow-700">
                Earn 50 points when someone signs up with your code
              </p>
              <p className="text-yellow-700">
                Earn 50 points when they complete their first booking
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">For Friend</h4>
              <p className="text-green-700">
                Get 25 points for signing up with a referral code
              </p>
              <p className="text-green-700">
                Receive a bonus for completing first booking
              </p>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>* Points can be redeemed for restaurant bookings and other rewards</p>
            <p>* Referrals are tracked and points awarded after successful completion</p>
            <p>* Maximum 100 active referrals per user</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to generate referral code
async function generateReferralCode() {
  try {
    const response = await fetch('/api/referrals/generate', {
      method: 'POST',
    });
    const data = await response.json();
    
    if (data.success) {
      toast({
        title: "Success!",
        description: "Referral code generated successfully",
      });
      window.location.reload();
    } else {
      toast({
        title: "Error",
        description: data.error || "Failed to generate referral code",
        variant: "destructive",
      });
    }
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to generate referral code",
      variant: "destructive",
    });
  }
}
