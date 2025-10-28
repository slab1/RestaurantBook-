'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useAuth } from './useAuth';

interface LoyaltyPoints {
  balance: number;
  totalEarned: number;
  totalRedeemed: number;
  pending: number;
  expiringSoon: {
    points: number;
    expiresAt: Date;
  }[];
  lastUpdated: Date;
}

interface LoyaltyTier {
  current: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  next?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  pointsToNextTier: number;
  progress: number; // 0-100
  benefits: string[];
  requirements: {
    minPoints: number;
    minSpend?: number;
    minBookings?: number;
  };
}

interface Achievement {
  id: string;
  type: 'BADGE' | 'STREAK' | 'CHALLENGE' | 'MILESTONE' | 'SPECIAL';
  category: 'BOOKING_STREAK' | 'SPENDING_MILESTONE' | 'REFERRALS' | 'REVIEWS' | 'SOCIAL_SHARING' | 'BIRTHDAY_BONUS' | 'ANNIVERSARY_REWARD' | 'FESTIVAL_BONUS' | 'LOYALTY_DAYS' | 'PREMIUM_CUSTOMER';
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  reward?: {
    points: number;
    badge?: string;
    tier?: string;
  };
}

interface LoyaltyStreak {
  current: number;
  longest: number;
  startDate: Date;
  lastActivityDate: Date;
  type: 'BOOKING' | 'REVIEW' | 'SPEND' | 'VISIT';
  multiplier: number;
  isActive: boolean;
  daysToReset: number;
  nextMilestone: number;
}

interface LoyaltyTransaction {
  id: string;
  type: 'EARNED' | 'REDEEMED' | 'EXPIRED' | 'ADJUSTED' | 'TRANSFERRED' | 'BONUS';
  points: number;
  description: string;
  createdAt: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
  restaurantId?: string;
  restaurantName?: string;
}

interface LoyaltyState {
  points: LoyaltyPoints;
  tier: LoyaltyTier;
  achievements: Achievement[];
  streaks: LoyaltyStreak[];
  transactions: LoyaltyTransaction[];
  loading: boolean;
  error: string | null;
  lastSync: Date | null;
  isOnline: boolean;
}

interface LoyaltyContextType extends LoyaltyState {
  refreshPoints: () => Promise<void>;
  redeemPoints: (points: number, description: string) => Promise<boolean>;
  checkAchievements: () => Promise<void>;
  updateStreaks: (type: LoyaltyStreak['type']) => Promise<void>;
  getTransactionHistory: (page?: number, limit?: number) => Promise<void>;
  syncWithServer: () => Promise<void>;
  startOfflineSync: () => void;
  stopOfflineSync: () => void;
}

const LoyaltyContext = createContext<LoyaltyContextType | undefined>(undefined);

export function useLoyalty(): LoyaltyContextType {
  const context = useContext(LoyaltyContext);
  if (context === undefined) {
    throw new Error('useLoyalty must be used within a LoyaltyProvider');
  }
  return context;
}

const INITIAL_LOYALTY_STATE: LoyaltyState = {
  points: {
    balance: 0,
    totalEarned: 0,
    totalRedeemed: 0,
    pending: 0,
    expiringSoon: [],
    lastUpdated: new Date(),
  },
  tier: {
    current: 'BRONZE',
    pointsToNextTier: 0,
    progress: 0,
    benefits: [],
    requirements: {
      minPoints: 0,
    },
  },
  achievements: [],
  streaks: [],
  transactions: [],
  loading: false,
  error: null,
  lastSync: null,
  isOnline: true,
};

export function useLoyaltyProvider(): LoyaltyContextType {
  const [loyaltyState, setLoyaltyState] = useState<LoyaltyState>(INITIAL_LOYALTY_STATE);
  const [offlineQueue, setOfflineQueue] = useState<Array<() => Promise<any>>>([]);
  const [syncInterval, setSyncInterval] = useState<NodeJS.Timeout | null>(null);
  const { user, token } = useAuth();

  // Load cached data from localStorage
  useEffect(() => {
    if (user) {
      const cachedData = localStorage.getItem(`loyalty-${user.id}`);
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          setLoyaltyState(prev => ({
            ...prev,
            ...parsed,
            isOnline: navigator.onLine,
          }));
        } catch (error) {
          console.error('Failed to parse cached loyalty data:', error);
        }
      }
    }
  }, [user]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setLoyaltyState(prev => ({ ...prev, isOnline: true }));
      processOfflineQueue();
    };

    const handleOffline = () => {
      setLoyaltyState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cache data to localStorage whenever state changes
  useEffect(() => {
    if (user && loyaltyState) {
      localStorage.setItem(`loyalty-${user.id}`, JSON.stringify(loyaltyState));
    }
  }, [loyaltyState, user]);

  // Start auto-sync when online
  const startOfflineSync = useCallback(() => {
    if (syncInterval) return;

    const interval = setInterval(() => {
      if (loyaltyState.isOnline) {
        syncWithServer();
      }
    }, 30000); // Sync every 30 seconds

    setSyncInterval(interval);
  }, [syncInterval, loyaltyState.isOnline]);

  const stopOfflineSync = useCallback(() => {
    if (syncInterval) {
      clearInterval(syncInterval);
      setSyncInterval(null);
    }
  }, [syncInterval]);

  // Process offline queue
  const processOfflineQueue = useCallback(async () => {
    if (offlineQueue.length === 0) return;

    const queue = [...offlineQueue];
    setOfflineQueue([]);

    for (const action of queue) {
      try {
        await action();
      } catch (error) {
        console.error('Failed to process offline action:', error);
      }
    }
  }, [offlineQueue]);

  // Fetch loyalty data from server
  const fetchLoyaltyData = useCallback(async () => {
    if (!token || !user) return;

    try {
      const response = await fetch('/api/loyalty/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch loyalty data');
      }

      const data = await response.json();
      
      setLoyaltyState(prev => ({
        ...prev,
        points: {
          ...prev.points,
          ...data.points,
          lastUpdated: new Date(),
        },
        tier: data.tier,
        achievements: data.achievements || [],
        streaks: data.streaks || [],
        lastSync: new Date(),
        loading: false,
        error: null,
      }));
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
      setLoyaltyState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }, [token, user]);

  const refreshPoints = useCallback(async () => {
    if (!loyaltyState.isOnline) {
      // Queue for later processing
      setOfflineQueue(prev => [...prev, refreshPoints]);
      return;
    }

    setLoyaltyState(prev => ({ ...prev, loading: true }));
    await fetchLoyaltyData();
  }, [loyaltyState.isOnline, fetchLoyaltyData]);

  const redeemPoints = useCallback(async (points: number, description: string): Promise<boolean> => {
    if (!token || !user || !loyaltyState.isOnline) {
      // Queue for later processing
      const action = async () => {
        await redeemPoints(points, description);
      };
      setOfflineQueue(prev => [...prev, action]);
      return false;
    }

    try {
      const response = await fetch('/api/loyalty/redeem', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ points, description }),
      });

      if (!response.ok) {
        throw new Error('Failed to redeem points');
      }

      const data = await response.json();
      
      setLoyaltyState(prev => ({
        ...prev,
        points: {
          ...prev.points,
          balance: data.newBalance,
          totalRedeemed: prev.points.totalRedeemed + points,
        },
        transactions: [data.transaction, ...prev.transactions],
        lastSync: new Date(),
      }));

      return true;
    } catch (error) {
      console.error('Error redeeming points:', error);
      setLoyaltyState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Redemption failed',
      }));
      return false;
    }
  }, [token, user, loyaltyState.isOnline]);

  const checkAchievements = useCallback(async () => {
    if (!token || !user || !loyaltyState.isOnline) return;

    try {
      const response = await fetch('/api/loyalty/achievements/check', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to check achievements');
      }

      const data = await response.json();
      
      if (data.newAchievements && data.newAchievements.length > 0) {
        setLoyaltyState(prev => ({
          ...prev,
          achievements: [...prev.achievements, ...data.newAchievements],
          points: {
            ...prev.points,
            balance: prev.points.balance + data.bonusPoints,
            totalEarned: prev.points.totalEarned + data.bonusPoints,
          },
        }));
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  }, [token, user, loyaltyState.isOnline]);

  const updateStreaks = useCallback(async (type: LoyaltyStreak['type']) => {
    if (!token || !user || !loyaltyState.isOnline) return;

    try {
      const response = await fetch('/api/loyalty/streaks/update', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) {
        throw new Error('Failed to update streaks');
      }

      const data = await response.json();
      
      setLoyaltyState(prev => ({
        ...prev,
        streaks: prev.streaks.map(streak => 
          streak.type === type ? { ...streak, ...data.streak } : streak
        ),
      }));

      // Award streak bonus points
      if (data.bonusPoints > 0) {
        setLoyaltyState(prev => ({
          ...prev,
          points: {
            ...prev.points,
            balance: prev.points.balance + data.bonusPoints,
            totalEarned: prev.points.totalEarned + data.bonusPoints,
          },
        }));
      }
    } catch (error) {
      console.error('Error updating streaks:', error);
    }
  }, [token, user, loyaltyState.isOnline]);

  const getTransactionHistory = useCallback(async (page: number = 1, limit: number = 20) => {
    if (!token || !user || !loyaltyState.isOnline) return;

    try {
      const response = await fetch(`/api/loyalty/transactions?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      
      setLoyaltyState(prev => ({
        ...prev,
        transactions: page === 1 ? data.transactions : [...prev.transactions, ...data.transactions],
      }));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setLoyaltyState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load transactions',
      }));
    }
  }, [token, user, loyaltyState.isOnline]);

  const syncWithServer = useCallback(async () => {
    if (!token || !user || !loyaltyState.isOnline) return;

    setLoyaltyState(prev => ({ ...prev, loading: true }));
    await fetchLoyaltyData();
  }, [token, user, loyaltyState.isOnline, fetchLoyaltyData]);

  // Initial load
  useEffect(() => {
    if (user && token) {
      refreshPoints();
      startOfflineSync();
    }

    return () => {
      stopOfflineSync();
    };
  }, [user, token]);

  // Calculate points expiring soon (within 30 days)
  useEffect(() => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringSoon = loyaltyState.transactions
      .filter(t => 
        t.expiresAt && 
        new Date(t.expiresAt) <= thirtyDaysFromNow && 
        new Date(t.expiresAt) > new Date()
      )
      .map(t => ({
        points: t.points,
        expiresAt: new Date(t.expiresAt!),
      }))
      .sort((a, b) => a.expiresAt.getTime() - b.expiresAt.getTime());

    setLoyaltyState(prev => ({
      ...prev,
      points: {
        ...prev.points,
        expiringSoon,
      },
    }));
  }, [loyaltyState.transactions]);

  return {
    ...loyaltyState,
    refreshPoints,
    redeemPoints,
    checkAchievements,
    updateStreaks,
    getTransactionHistory,
    syncWithServer,
    startOfflineSync,
    stopOfflineSync,
  };
}

// Loyalty Provider Component
export function LoyaltyProvider({ children }: { children: React.ReactNode }) {
  const loyalty = useLoyaltyProvider();
  return <LoyaltyContext.Provider value={loyalty}>{children}</LoyaltyContext.Provider>;
}

// Utility hooks for specific loyalty features
export function useLoyaltyPoints() {
  const { points, refreshPoints, redeemPoints } = useLoyalty();
  return { points, refreshPoints, redeemPoints };
}

export function useLoyaltyTier() {
  const { tier } = useLoyalty();
  return { tier };
}

export function useAchievements() {
  const { achievements, checkAchievements } = useLoyalty();
  return { achievements, checkAchievements };
}

export function useLoyaltyStreaks() {
  const { streaks, updateStreaks } = useLoyalty();
  return { streaks, updateStreaks };
}

export function useLoyaltyTransactions() {
  const { transactions, getTransactionHistory } = useLoyalty();
  return { transactions, getTransactionHistory };
}
