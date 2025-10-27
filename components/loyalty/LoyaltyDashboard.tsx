'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useI18n } from '@/lib/i18n/i18n-context';
import { CurrencyService } from '@/lib/i18n/currency-service';
import { useToast } from '@/hooks/use-toast';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import {
  Crown,
  Gift,
  Star,
  Trophy,
  Calendar,
  Users,
  MapPin,
  Clock,
  Bell,
  Sparkles,
  Zap,
  Target,
  Award,
  ChevronRight,
  ChevronDown,
  Coins,
  TrendingUp,
  Flame,
  Heart,
  Crown as DiamondIcon,
  PartyPopper,
  Gift as PresentIcon,
  Wallet,
  ShoppingBag,
  Eye,
  Share2,
} from 'lucide-react';

// Types
interface LoyaltyUser {
  id: string;
  name: string;
  email: string;
  memberSince: Date;
  birthday: Date;
  currentTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  pointsBalance: number;
  lifetimePoints: number;
  streakCount: number;
  nextBirthday: Date;
  avatar?: string;
}

interface LoyaltyTransaction {
  id: string;
  type: 'earned' | 'redeemed' | 'bonus' | 'expired';
  points: number;
  description: string;
  restaurant?: string;
  date: Date;
  orderId?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  reward: {
    points: number;
    badge?: string;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface TierInfo {
  name: string;
  minPoints: number;
  maxPoints: number;
  color: string;
  gradient: string;
  benefits: string[];
  perks: string[];
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  avatar?: string;
  points: number;
  tier: string;
  badge?: string;
}

interface RedemptionItem {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  image: string;
  category: 'discount' | 'free_item' | 'experience' | 'partner';
  available: boolean;
  limited: boolean;
  quantity?: number;
}

interface PartnerOffer {
  id: string;
  partnerName: string;
  offerTitle: string;
  description: string;
  discount: string;
  validUntil: Date;
  logo: string;
  category: string;
  location?: string;
  terms: string;
}

interface SpecialEvent {
  id: string;
  title: string;
  description: string;
  type: 'birthday' | 'holiday' | 'promotion' | 'milestone';
  startDate: Date;
  endDate: Date;
  icon: React.ReactNode;
  multiplier: number;
  available: boolean;
}

const LoyaltyDashboard: React.FC = () => {
  // Hooks
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const { isInstalled } = usePWAInstall();

  // State
  const [user, setUser] = useState<LoyaltyUser | null>(null);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [redemptionItems, setRedemptionItems] = useState<RedemptionItem[]>([]);
  const [partnerOffers, setPartnerOffers] = useState<PartnerOffer[]>([]);
  const [specialEvents, setSpecialEvents] = useState<SpecialEvent[]>([]);
  const [selectedTier, setSelectedTier] = useState<string>('current');
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'rewards' | 'history' | 'leaderboard' | 'offers'>('overview');

  // Tier Configuration
  const tiers: Record<string, TierInfo> = {
    Bronze: {
      name: 'Bronze',
      minPoints: 0,
      maxPoints: 999,
      color: 'text-amber-700',
      gradient: 'from-amber-600 to-amber-800',
      benefits: ['5% points on orders', 'Birthday reward'],
      perks: ['Basic support', 'Monthly newsletter']
    },
    Silver: {
      name: 'Silver',
      minPoints: 1000,
      maxPoints: 4999,
      color: 'text-gray-400',
      gradient: 'from-gray-400 to-gray-600',
      benefits: ['10% points on orders', 'Free appetizer monthly', 'Priority support'],
      perks: ['Exclusive offers', 'Early access to events']
    },
    Gold: {
      name: 'Gold',
      minPoints: 5000,
      maxPoints: 14999,
      color: 'text-yellow-500',
      gradient: 'from-yellow-400 to-yellow-600',
      benefits: ['15% points on orders', 'Free main course monthly', 'VIP support'],
      perks: ['Partner discounts', 'Reserved seating']
    },
    Platinum: {
      name: 'Platinum',
      minPoints: 15000,
      maxPoints: 49999,
      color: 'text-purple-500',
      gradient: 'from-purple-500 to-purple-700',
      benefits: ['20% points on orders', 'Free dining monthly', 'Personal concierge'],
      perks: ['Exclusive events', 'Complimentary upgrades']
    },
    Diamond: {
      name: 'Diamond',
      minPoints: 50000,
      maxPoints: Infinity,
      color: 'text-blue-400',
      gradient: 'from-blue-400 to-blue-600',
      benefits: ['25% points on orders', 'All-you-can-eat annual', 'Dedicated manager'],
      perks: ['Global partner access', 'Luxury experiences']
    }
  };

  // Haptic feedback helper
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  // Mock data initialization
  useEffect(() => {
    const mockUser: LoyaltyUser = {
      id: '1',
      name: 'Adebayo Johnson',
      email: 'adebayo@example.com',
      memberSince: new Date('2023-03-15'),
      birthday: new Date('1990-11-15'),
      currentTier: 'Gold',
      pointsBalance: 8750,
      lifetimePoints: 24500,
      streakCount: 23,
      nextBirthday: new Date('2025-11-15')
    };

    const mockTransactions: LoyaltyTransaction[] = [
      {
        id: '1',
        type: 'earned',
        points: 250,
        description: 'Order at Jollof Palace',
        restaurant: 'Jollof Palace',
        date: new Date('2025-10-25'),
        orderId: 'ORD-12345'
      },
      {
        id: '2',
        type: 'bonus',
        points: 500,
        description: 'Welcome back bonus',
        date: new Date('2025-10-20'),
      },
      {
        id: '3',
        type: 'earned',
        points: 180,
        description: 'Order at Suya Spot',
        restaurant: 'Suya Spot',
        date: new Date('2025-10-18'),
        orderId: 'ORD-12344'
      },
      {
        id: '4',
        type: 'redeemed',
        points: -1000,
        description: 'Free appetizer reward',
        date: new Date('2025-10-15'),
      }
    ];

    const mockAchievements: Achievement[] = [
      {
        id: '1',
        title: 'First Order',
        description: 'Complete your first order',
        icon: <Gift className="w-6 h-6" />,
        progress: 1,
        maxProgress: 1,
        unlocked: true,
        reward: { points: 100 },
        rarity: 'common'
      },
      {
        id: '2',
        title: 'Loyal Customer',
        description: 'Place 10 orders',
        icon: <Heart className="w-6 h-6" />,
        progress: 7,
        maxProgress: 10,
        unlocked: false,
        reward: { points: 500 },
        rarity: 'rare'
      },
      {
        id: '3',
        title: 'Foodie Explorer',
        description: 'Try 5 different cuisines',
        icon: <Sparkles className="w-6 h-6" />,
        progress: 3,
        maxProgress: 5,
        unlocked: false,
        reward: { points: 300 },
        rarity: 'epic'
      },
      {
        id: '4',
        title: 'Streak Master',
        description: 'Maintain a 30-day ordering streak',
        icon: <Flame className="w-6 h-6" />,
        progress: 23,
        maxProgress: 30,
        unlocked: false,
        reward: { points: 1000, badge: 'Fire' },
        rarity: 'legendary'
      }
    ];

    const mockLeaderboard: LeaderboardEntry[] = [
      { rank: 1, userId: '2', userName: 'Fatima Ahmed', points: 45000, tier: 'Diamond', badge: '👑' },
      { rank: 2, userId: '3', userName: 'Chinedu Okoro', points: 38900, tier: 'Diamond', badge: '🔥' },
      { rank: 3, userId: '4', userName: 'Zainab Musa', points: 32100, tier: 'Platinum', badge: '⭐' },
      { rank: 4, userId: '5', userName: 'Ibrahim Bello', points: 28900, tier: 'Platinum', badge: '💎' },
      { rank: 5, userId: '6', userName: 'Folake Adeyemi', points: 24500, tier: 'Gold', badge: '🎯' },
    ];

    const mockRedemptionItems: RedemptionItem[] = [
      {
        id: '1',
        name: 'Free Appetizer',
        description: 'Choose any appetizer from our menu',
        pointsCost: 1000,
        image: '/api/placeholder/300/200',
        category: 'free_item',
        available: true,
        limited: false
      },
      {
        id: '2',
        name: '20% Off Next Order',
        description: 'Get 20% discount on your next order over ₦5,000',
        pointsCost: 2500,
        image: '/api/placeholder/300/200',
        category: 'discount',
        available: true,
        limited: true,
        quantity: 50
      },
      {
        id: '3',
        name: 'VIP Table Reservation',
        description: 'Reserved seating at premium restaurants',
        pointsCost: 5000,
        image: '/api/placeholder/300/200',
        category: 'experience',
        available: true,
        limited: true,
        quantity: 10
      },
      {
        id: '4',
        name: 'Free Main Course',
        description: 'Complimentary main course at partner restaurants',
        pointsCost: 3000,
        image: '/api/placeholder/300/200',
        category: 'free_item',
        available: true,
        limited: false
      }
    ];

    const mockPartnerOffers: PartnerOffer[] = [
      {
        id: '1',
        partnerName: 'GTBank',
        offerTitle: '15% Cashback',
        description: 'Get 15% cashback on all restaurant orders paid with GTBank cards',
        validUntil: new Date('2025-12-31'),
        logo: '/api/placeholder/100/100',
        category: 'Banking',
        terms: 'Minimum order ₦2,000. Maximum cashback ₦5,000 per transaction.'
      },
      {
        id: '2',
        partnerName: 'MTN',
        offerTitle: 'Free Data',
        description: 'Earn 1GB free data for every 5 restaurant orders',
        validUntil: new Date('2025-11-30'),
        logo: '/api/placeholder/100/100',
        category: 'Telecom',
        terms: 'Valid for MTN subscribers only. Data expires after 30 days.'
      },
      {
        id: '3',
        partnerName: 'Access Bank',
        offerTitle: 'Double Points',
        description: 'Earn double loyalty points when you pay with Access Bank',
        validUntil: new Date('2025-12-15'),
        logo: '/api/placeholder/100/100',
        category: 'Banking',
        terms: 'Valid for Access Bank debit card holders only.'
      }
    ];

    const mockSpecialEvents: SpecialEvent[] = [
      {
        id: '1',
        title: 'Birthday Celebration',
        description: 'It\'s almost your birthday! Enjoy triple points this week',
        type: 'birthday',
        startDate: new Date('2025-10-27'),
        endDate: new Date('2025-11-03'),
        icon: <Cake className="w-6 h-6" />,
        multiplier: 3,
        available: true
      },
      {
        id: '2',
        title: 'Nigeria Independence Day',
        description: 'Celebrate with 2x points on all orders',
        type: 'holiday',
        startDate: new Date('2025-10-01'),
        endDate: new Date('2025-10-07'),
        icon: <PartyPopper className="w-6 h-6" />,
        multiplier: 2,
        available: true
      },
      {
        id: '3',
        title: 'Weekend Warrior',
        description: 'Weekend orders earn 1.5x points',
        type: 'promotion',
        startDate: new Date('2025-10-25'),
        endDate: new Date('2025-10-27'),
        icon: <Zap className="w-6 h-6" />,
        multiplier: 1.5,
        available: true
      }
    ];

    setUser(mockUser);
    setTransactions(mockTransactions);
    setAchievements(mockAchievements);
    setLeaderboard(mockLeaderboard);
    setRedemptionItems(mockRedemptionItems);
    setPartnerOffers(mockPartnerOffers);
    setSpecialEvents(mockSpecialEvents);
  }, []);

  // Calculate days until birthday
  const daysUntilBirthday = user ? Math.ceil((user.nextBirthday.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

  // Format currency with Naira
  const formatCurrency = useCallback((amount: number, compact = false) => {
    return CurrencyService.formatNaira(amount, compact);
  }, []);

  // Get progress to next tier
  const getProgressToNextTier = useCallback(() => {
    if (!user) return { progress: 0, nextTier: null, pointsNeeded: 0 };
    
    const currentTierInfo = tiers[user.currentTier];
    if (user.currentTier === 'Diamond') return { progress: 100, nextTier: null, pointsNeeded: 0 };

    const tierKeys = Object.keys(tiers);
    const currentIndex = tierKeys.indexOf(user.currentTier);
    const nextTierKey = tierKeys[currentIndex + 1];
    const nextTier = tiers[nextTierKey];

    const pointsInCurrentTier = user.pointsBalance - currentTierInfo.minPoints;
    const pointsNeededForNextTier = nextTier.minPoints - user.pointsBalance;
    const progress = (pointsInCurrentTier / (nextTier.minPoints - currentTierInfo.minPoints)) * 100;

    return { progress, nextTier, pointsNeeded: pointsNeededForNextTier };
  }, [user, tiers]);

  // Handle redemption
  const handleRedeem = useCallback(async (itemId: string) => {
    const item = redemptionItems.find(i => i.id === itemId);
    if (!user || !item) return;

    if (user.pointsBalance < item.pointsCost) {
      toast({
        title: 'Insufficient Points',
        description: 'You need more points to redeem this item.',
        variant: 'destructive'
      });
      triggerHaptic('heavy');
      return;
    }

    setRefreshing(true);
    triggerHaptic('medium');

    // Simulate API call
    setTimeout(() => {
      setUser(prev => prev ? { ...prev, pointsBalance: prev.pointsBalance - item.pointsCost } : null);
      setTransactions(prev => [{
        id: Date.now().toString(),
        type: 'redeemed',
        points: -item.pointsCost,
        description: `Redeemed: ${item.name}`,
        date: new Date(),
      }, ...prev]);

      toast({
        title: 'Redemption Successful!',
        description: `You've successfully redeemed ${item.name}`,
      });

      setRefreshing(false);
      triggerHaptic('light');
    }, 1000);
  }, [user, redemptionItems, toast, triggerHaptic]);

  // Share achievements
  const handleShare = useCallback((achievement: Achievement) => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out my achievement!',
        text: `I just unlocked "${achievement.title}" in the restaurant loyalty app!`,
        url: window.location.href
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`I just unlocked "${achievement.title}" in the restaurant loyalty app!`);
      toast({
        title: 'Copied to Clipboard',
        description: 'Share text copied to clipboard',
      });
    }
    triggerHaptic('light');
  }, [toast, triggerHaptic]);

  const progressInfo = getProgressToNextTier();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-purple-900 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Loyalty Hub
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Welcome back, {user.name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="relative"
                onClick={() => {
                  toast({
                    title: 'Notifications',
                    description: 'You have 3 new notifications',
                  });
                  triggerHaptic('light');
                }}
              >
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs">
                  3
                </Badge>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card 
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white cursor-pointer transform transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => {
              setActiveTab('overview');
              triggerHaptic('light');
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Points Balance</p>
                  <p className="text-2xl font-bold">{user.pointsBalance.toLocaleString()}</p>
                </div>
                <Coins className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white cursor-pointer transform transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => {
              setActiveTab('overview');
              triggerHaptic('light');
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Current Tier</p>
                  <p className="text-xl font-bold">{user.currentTier}</p>
                </div>
                <Crown className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-orange-500 to-red-500 text-white cursor-pointer transform transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => {
              setActiveTab('overview');
              triggerHaptic('light');
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Streak</p>
                  <p className="text-2xl font-bold">{user.streakCount}</p>
                  <p className="text-xs text-orange-200">days</p>
                </div>
                <Flame className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-green-500 to-emerald-600 text-white cursor-pointer transform transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => {
              setActiveTab('offers');
              triggerHaptic('light');
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Partner Offers</p>
                  <p className="text-2xl font-bold">{partnerOffers.length}</p>
                  <p className="text-xs text-green-200">active</p>
                </div>
                <Gift className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'overview', label: 'Overview', icon: <Star className="w-4 h-4" /> },
            { id: 'rewards', label: 'Rewards', icon: <Gift className="w-4 h-4" /> },
            { id: 'history', label: 'History', icon: <Clock className="w-4 h-4" /> },
            { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="w-4 h-4" /> },
            { id: 'offers', label: 'Offers', icon: <MapPin className="w-4 h-4" /> },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              size="sm"
              className="flex items-center gap-2 whitespace-nowrap"
              onClick={() => {
                setActiveTab(tab.id as any);
                triggerHaptic('light');
              }}
            >
              {tab.icon}
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* VIP Tier Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DiamondIcon className="w-5 h-5" />
                  VIP Tier Progress
                </CardTitle>
                <CardDescription>
                  You're currently a {user.currentTier} member
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {progressInfo.nextTier ? `Next: ${progressInfo.nextTier.name}` : 'Highest tier achieved!'}
                    </p>
                    {progressInfo.nextTier && (
                      <p className="text-xs text-gray-500">
                        {progressInfo.pointsNeeded.toLocaleString()} points needed
                      </p>
                    )}
                  </div>
                  <Badge className={`${tiers[user.currentTier].gradient} text-white`}>
                    {user.currentTier}
                  </Badge>
                </div>
                <Progress 
                  value={progressInfo.progress} 
                  className="h-3"
                />
                {progressInfo.nextTier && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p className="font-medium">Next Tier Benefits:</p>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                      {progressInfo.nextTier.benefits.map((benefit, idx) => (
                        <li key={idx}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Birthday Countdown */}
            {daysUntilBirthday <= 30 && (
              <Card className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-full">
                      <Calendar className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">Birthday Special!</h3>
                      <p className="text-pink-100">
                        {daysUntilBirthday > 0 
                          ? `${daysUntilBirthday} days until your special day` 
                          : 'Happy Birthday! Enjoy your rewards'}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge className="bg-white/20 text-white">
                          3x Points
                        </Badge>
                        <Badge className="bg-white/20 text-white">
                          Free Meal
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Active Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PartyPopper className="w-5 h-5" />
                  Active Events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {specialEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-blue-500">
                        {event.icon}
                      </div>
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {event.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">
                        {event.multiplier}x Points
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        Until {event.endDate.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {achievements.slice(0, 4).map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        achievement.unlocked
                          ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20'
                          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={achievement.unlocked ? 'text-yellow-500' : 'text-gray-400'}>
                          {achievement.icon}
                        </div>
                        <Badge 
                          variant={achievement.rarity === 'legendary' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {achievement.rarity}
                        </Badge>
                      </div>
                      <p className="font-medium text-sm">{achievement.title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {achievement.description}
                      </p>
                      <div className="mt-2">
                        <Progress 
                          value={(achievement.progress / achievement.maxProgress) * 100}
                          className="h-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {achievement.progress}/{achievement.maxProgress}
                        </p>
                      </div>
                      {achievement.unlocked && (
                        <div className="flex items-center justify-between mt-2">
                          <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            +{achievement.reward.points} pts
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => handleShare(achievement)}
                          >
                            <Share2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => {
                    // Navigate to achievements page
                    triggerHaptic('light');
                  }}
                >
                  View All Achievements
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Redemption Store</h2>
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-gray-500" />
                <span className="text-lg font-bold">{user.pointsBalance.toLocaleString()} pts</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {redemptionItems.map((item) => (
                <Card 
                  key={item.id}
                  className={`overflow-hidden transition-all duration-200 hover:shadow-lg ${
                    !item.available || user.pointsBalance < item.pointsCost
                      ? 'opacity-60'
                      : 'hover:scale-105'
                  }`}
                >
                  <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ShoppingBag className="w-16 h-16 text-gray-400" />
                    </div>
                    {item.limited && item.quantity && (
                      <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                        Only {item.quantity} left
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold">{item.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.description}
                        </p>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {item.category}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <span className="font-bold text-lg">{item.pointsCost.toLocaleString()}</span>
                      </div>
                      <Button
                        size="sm"
                        disabled={!item.available || user.pointsBalance < item.pointsCost || refreshing}
                        onClick={() => handleRedeem(item.id)}
                        className="transform transition-all duration-200 active:scale-95"
                      >
                        {refreshing ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : user.pointsBalance < item.pointsCost ? (
                          'Insufficient Points'
                        ) : (
                          'Redeem'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Points History</h2>

            <div className="space-y-3">
              {transactions.map((transaction) => (
                <Card key={transaction.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'earned' ? 'bg-green-100 text-green-600' :
                          transaction.type === 'bonus' ? 'bg-purple-100 text-purple-600' :
                          transaction.type === 'redeemed' ? 'bg-red-100 text-red-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {transaction.type === 'earned' && <TrendingUp className="w-4 h-4" />}
                          {transaction.type === 'bonus' && <Gift className="w-4 h-4" />}
                          {transaction.type === 'redeemed' && <ShoppingBag className="w-4 h-4" />}
                          {transaction.type === 'expired' && <Clock className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {transaction.restaurant && `${transaction.restaurant} • `}
                            {transaction.date.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className={`font-bold ${
                        transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.points > 0 ? '+' : ''}{transaction.points.toLocaleString()} pts
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Top Members</h2>

            <div className="space-y-2">
              {leaderboard.map((entry, index) => (
                <Card 
                  key={entry.userId}
                  className={`transition-all duration-200 hover:shadow-md ${
                    index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        entry.rank === 1 ? 'bg-yellow-500 text-white' :
                        entry.rank === 2 ? 'bg-gray-400 text-white' :
                        entry.rank === 3 ? 'bg-orange-600 text-white' :
                        'bg-gray-200 dark:bg-gray-700'
                      }`}>
                        {entry.rank <= 3 ? (
                          <Trophy className="w-4 h-4" />
                        ) : (
                          entry.rank
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{entry.userName}</p>
                          <Badge variant="outline" className="text-xs">
                            {entry.tier}
                          </Badge>
                          {entry.badge && (
                            <span className="text-lg">{entry.badge}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{entry.points.toLocaleString()}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">points</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* User's position */}
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                      ?
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-blue-700 dark:text-blue-300">
                        Your Position: Top 20%
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        Keep ordering to climb the leaderboard!
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-blue-700 dark:text-blue-300">
                        {user.pointsBalance.toLocaleString()}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">points</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'offers' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Partner Offers</h2>

            <div className="space-y-4">
              {partnerOffers.map((offer) => (
                <Card key={offer.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg flex items-center justify-center">
                          <PresentIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-bold">{offer.offerTitle}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {offer.partnerName}
                              </p>
                            </div>
                            <Badge variant="outline">{offer.category}</Badge>
                          </div>
                          <p className="text-sm mb-3">{offer.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                              Valid until {offer.validUntil.toLocaleDateString()}
                            </div>
                            <Button size="sm">
                              Learn More
                              <ChevronRight className="w-3 h-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        <strong>Terms:</strong> {offer.terms}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* PWA Install Prompt */}
        {!isInstalled && (
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">Install Our App</h3>
                  <p className="text-blue-100">
                    Get faster access to your rewards and exclusive mobile offers
                  </p>
                </div>
                <Button 
                  variant="secondary"
                  onClick={() => {
                    // Trigger PWA install
                    triggerHaptic('light');
                  }}
                >
                  Install
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

// Cake icon component (since it's not in lucide-react)
const Cake: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
    />
  </svg>
);

export default LoyaltyDashboard;
