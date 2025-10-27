'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { useLoyalty } from './useLoyalty';

interface LoyaltyNotification {
  id: string;
  type: 'POINTS_EARNED' | 'POINTS_REDEEMED' | 'TIER_UPGRADE' | 'ACHIEVEMENT_UNLOCKED' | 'STREAK_BONUS' | 'POINTS_EXPIRING' | 'STREAK_MILESTONE' | 'BONUS_CAMPAIGN' | 'WELCOME_BONUS' | 'REFERRAL_REWARD';
  title: string;
  message: string;
  icon?: string;
  badge?: string;
  data?: Record<string, any>;
  timestamp: Date;
  isRead: boolean;
  isPersistent: boolean;
  expiresAt?: Date;
  actionUrl?: string;
  actionText?: string;
}

interface LoyaltyNotificationSettings {
  pointsEarned: boolean;
  pointsRedeemed: boolean;
  tierUpgrades: boolean;
  achievements: boolean;
  streakBonuses: boolean;
  pointsExpiring: boolean;
  streakMilestones: boolean;
  bonusCampaigns: boolean;
  welcomeBonus: boolean;
  referralRewards: boolean;
  sound: boolean;
  vibration: boolean;
  badge: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
  };
  timezone: string;
}

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

const DEFAULT_NOTIFICATION_SETTINGS: LoyaltyNotificationSettings = {
  pointsEarned: true,
  pointsRedeemed: true,
  tierUpgrades: true,
  achievements: true,
  streakBonuses: true,
  pointsExpiring: true,
  streakMilestones: true,
  bonusCampaigns: true,
  welcomeBonus: true,
  referralRewards: true,
  sound: true,
  vibration: true,
  badge: true,
  quietHours: {
    enabled: false,
    startTime: '22:00',
    endTime: '08:00',
  },
  timezone: 'UTC',
};

export function useLoyaltyNotifications() {
  const [notifications, setNotifications] = useState<LoyaltyNotification[]>([]);
  const [settings, setSettings] = useState<LoyaltyNotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const { user, token } = useAuth();
  const { points, tier, achievements, streaks } = useLoyalty();
  const notificationQueueRef = useRef<LoyaltyNotification[]>([]);
  const lastCheckRef = useRef<Date>(new Date());

  // Load settings from localStorage
  useEffect(() => {
    if (user) {
      const savedSettings = localStorage.getItem(`loyalty-notification-settings-${user.id}`);
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings));
        } catch (error) {
          console.error('Failed to parse notification settings:', error);
        }
      }
    }
  }, [user]);

  // Save settings to localStorage
  useEffect(() => {
    if (user && settings) {
      localStorage.setItem(
        `loyalty-notification-settings-${user.id}`,
        JSON.stringify(settings)
      );
    }
  }, [settings, user]);

  // Initialize service worker
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(reg => {
          setRegistration(reg);
          console.log('Service Worker registered:', reg);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
          setError('Failed to register service worker');
        });
    }
  }, []);

  // Check for existing subscription
  useEffect(() => {
    if (registration) {
      registration.pushManager.getSubscription().then(sub => {
        setSubscription(sub);
        setIsRegistered(!!sub);
      });
    }
  }, [registration]);

  // Monitor loyalty state changes for notifications
  useEffect(() => {
    if (!user || !isRegistered) return;

    checkForNewNotifications();
  }, [points, tier, achievements, streaks, user, isRegistered]);

  // Mark notifications as read when app comes to foreground
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        markAllAsRead();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Load initial notifications
  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = useCallback(async () => {
    if (!token || !user) return;

    try {
      setLoading(true);
      const response = await fetch('/api/loyalty/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load notifications');
      }

      const data = await response.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setError(error instanceof Error ? error.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  const registerForPush = useCallback(async (): Promise<boolean> => {
    if (!registration || !user) return false;

    try {
      setLoading(true);

      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setError('Notification permission denied');
        return false;
      }

      // Create push subscription
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      setSubscription(sub);
      setIsRegistered(true);

      // Send subscription to server
      await fetch('/api/loyalty/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: sub.toJSON(),
          userId: user.id,
        }),
      });

      return true;
    } catch (error) {
      console.error('Failed to register for push notifications:', error);
      setError(error instanceof Error ? error.message : 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, [registration, user, token]);

  const unregisterFromPush = useCallback(async (): Promise<boolean> => {
    if (!subscription || !user) return false;

    try {
      setLoading(true);

      // Unsubscribe from push
      await subscription.unsubscribe();
      setSubscription(null);
      setIsRegistered(false);

      // Notify server
      await fetch('/api/loyalty/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          body: JSON.stringify({ subscription: subscription.toJSON() }),
        },
      });

      return true;
    } catch (error) {
      console.error('Failed to unregister from push notifications:', error);
      setError(error instanceof Error ? error.message : 'Unregistration failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, [subscription, user, token]);

  const sendLocalNotification = useCallback(async (
    title: string,
    options: NotificationOptions = {}
  ): Promise<boolean> => {
    if (!isRegistered || Notification.permission !== 'granted') {
      return false;
    }

    try {
      // Check quiet hours
      if (settings.quietHours.enabled && isInQuietHours()) {
        // Add to queue for later
        notificationQueueRef.current.push({
          id: Date.now().toString(),
          type: 'POINTS_EARNED',
          title,
          message: options.body as string || '',
          timestamp: new Date(),
          isRead: false,
          isPersistent: false,
          ...options.data,
        });
        return true;
      }

      const registration = await navigator.serviceWorker.ready;

      await registration.showNotification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: settings.vibration ? [200, 100, 200] : [],
        sound: settings.sound ? '/sounds/notification.mp3' : undefined,
        ...options,
      });

      return true;
    } catch (error) {
      console.error('Failed to send local notification:', error);
      return false;
    }
  }, [isRegistered, settings]);

  const isInQuietHours = useCallback((): boolean => {
    if (!settings.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = settings.quietHours.startTime.split(':').map(Number);
    const [endHour, endMin] = settings.quietHours.endTime.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    if (startTime < endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Quiet hours cross midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  }, [settings.quietHours]);

  const checkForNewNotifications = useCallback(async () => {
    if (!user) return;

    try {
      // Check for new points
      if (points.lastUpdated > lastCheckRef.current) {
        // This would trigger when points are updated elsewhere
      }

      // Check for tier upgrades
      // Check for new achievements
      // Check for streak milestones
      // Check for points expiring soon

      lastCheckRef.current = new Date();
    } catch (error) {
      console.error('Error checking for new notifications:', error);
    }
  }, [user, points.lastUpdated]);

  const createNotification = useCallback((
    type: LoyaltyNotification['type'],
    title: string,
    message: string,
    data?: Record<string, any>
  ): LoyaltyNotification => {
    return {
      id: `loyalty-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      timestamp: new Date(),
      isRead: false,
      isPersistent: type === 'POINTS_EXPIRING' || type === 'ACHIEVEMENT_UNLOCKED',
      ...data,
    };
  }, []);

  const checkSettings = useCallback((type: LoyaltyNotification['type']): boolean => {
    switch (type) {
      case 'POINTS_EARNED':
        return settings.pointsEarned;
      case 'POINTS_REDEEMED':
        return settings.pointsRedeemed;
      case 'TIER_UPGRADE':
        return settings.tierUpgrades;
      case 'ACHIEVEMENT_UNLOCKED':
        return settings.achievements;
      case 'STREAK_BONUS':
      case 'STREAK_MILESTONE':
        return settings.streakBonuses;
      case 'POINTS_EXPIRING':
        return settings.pointsExpiring;
      case 'BONUS_CAMPAIGN':
        return settings.bonusCampaigns;
      case 'WELCOME_BONUS':
        return settings.welcomeBonus;
      case 'REFERRAL_REWARD':
        return settings.referralRewards;
      default:
        return true;
    }
  }, [settings]);

  const showNotification = useCallback(async (
    notification: LoyaltyNotification
  ): Promise<boolean> => {
    if (!checkSettings(notification.type)) {
      return false;
    }

    // Add to local state
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Show push notification if registered
    if (isRegistered) {
      const success = await sendLocalNotification(notification.title, {
        body: notification.message,
        icon: notification.icon || '/icons/icon-192x192.png',
        badge: notification.badge || '/icons/badge-72x72.png',
        data: notification.data,
        tag: notification.type,
        requireInteraction: notification.isPersistent,
        timestamp: notification.timestamp.getTime(),
        actions: notification.actionUrl ? [
          {
            action: 'view',
            title: notification.actionText || 'View',
          },
          {
            action: 'dismiss',
            title: 'Dismiss',
          },
        ] : [],
      });

      return success;
    }

    return true;
  }, [checkSettings, isRegistered, sendLocalNotification]);

  const markAsRead = useCallback(async (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId
          ? { ...notif, isRead: true }
          : notif
      )
    );

    setUnreadCount(prev => Math.max(0, prev - 1));

    if (token && user) {
      try {
        await fetch(`/api/loyalty/notifications/${notificationId}/read`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
  }, [token, user]);

  const markAllAsRead = useCallback(async () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );
    setUnreadCount(0);

    if (token && user) {
      try {
        await fetch('/api/loyalty/notifications/read-all', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error('Failed to mark all notifications as read:', error);
      }
    }
  }, [token, user]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));

    if (token && user) {
      try {
        await fetch(`/api/loyalty/notifications/${notificationId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error('Failed to delete notification:', error);
      }
    }
  }, [token, user]);

  const clearAllNotifications = useCallback(async () => {
    setNotifications([]);
    setUnreadCount(0);

    if (token && user) {
      try {
        await fetch('/api/loyalty/notifications/clear-all', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error('Failed to clear all notifications:', error);
      }
    }
  }, [token, user]);

  const updateSettings = useCallback((newSettings: Partial<LoyaltyNotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const triggerNotification = useCallback((
    type: LoyaltyNotification['type'],
    title: string,
    message: string,
    data?: Record<string, any>
  ) => {
    const notification = createNotification(type, title, message, data);
    return showNotification(notification);
  }, [createNotification, showNotification]);

  // Predefined notification triggers
  const notifyPointsEarned = useCallback(async (points: number, source: string) => {
    return triggerNotification(
      'POINTS_EARNED',
      'Points Earned!',
      `You earned ${points} points from ${source}`,
      { points, source }
    );
  }, [triggerNotification]);

  const notifyTierUpgrade = useCallback(async (newTier: string, benefits: string[]) => {
    return triggerNotification(
      'TIER_UPGRADE',
      'Tier Upgrade!',
      `Congratulations! You've reached ${newTier} tier`,
      { newTier, benefits }
    );
  }, [triggerNotification]);

  const notifyAchievement = useCallback(async (achievement: any) => {
    return triggerNotification(
      'ACHIEVEMENT_UNLOCKED',
      'Achievement Unlocked!',
      achievement.title,
      { achievement }
    );
  }, [triggerNotification]);

  const notifyPointsExpiring = useCallback(async (points: number, daysLeft: number) => {
    return triggerNotification(
      'POINTS_EXPIRING',
      'Points Expiring Soon!',
      `${points} points will expire in ${daysLeft} days`,
      { points, daysLeft }
    );
  }, [triggerNotification]);

  return {
    notifications,
    settings,
    isRegistered,
    registration,
    subscription,
    loading,
    error,
    unreadCount,
    registerForPush,
    unregisterFromPush,
    showNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    updateSettings,
    triggerNotification,
    notifyPointsEarned,
    notifyTierUpgrade,
    notifyAchievement,
    notifyPointsExpiring,
    loadNotifications,
  };
}

// Service Worker message handler integration
export function useLoyaltyServiceWorker() {
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        setSwRegistration(reg);
      });
    }
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (swRegistration && swRegistration.active) {
      swRegistration.active.postMessage(message);
    }
  }, [swRegistration]);

  const processQueuedNotifications = useCallback(async () => {
    const reg = await navigator.serviceWorker.ready;
    reg.active?.postMessage({ type: 'PROCESS_QUEUED_NOTIFICATIONS' });
  }, []);

  return {
    swRegistration,
    sendMessage,
    processQueuedNotifications,
  };
}
