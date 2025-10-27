import { useState, useEffect } from 'react'

interface PushNotificationState {
  permission: NotificationPermission
  isSubscribed: boolean
  subscription: PushSubscription | null
}

export function usePushNotifications() {
  const [notificationState, setNotificationState] = useState<PushNotificationState>({
    permission: Notification.permission,
    isSubscribed: false,
    subscription: null,
  })

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return 'denied'
    }

    const permission = await Notification.requestPermission()
    setNotificationState(prev => ({ ...prev, permission }))
    return permission
  }

  const subscribeToPush = async (userId: string): Promise<boolean> => {
    if (notificationState.permission !== 'granted') {
      const permission = await requestPermission()
      if (permission !== 'granted') return false
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      })

      setNotificationState(prev => ({
        ...prev,
        isSubscribed: true,
        subscription,
      }))

      // Send subscription to server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription, userId }),
      })

      return true
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error)
      return false
    }
  }

  const unsubscribeFromPush = async (): Promise<boolean> => {
    if (!notificationState.subscription) return false

    try {
      await notificationState.subscription.unsubscribe()
      setNotificationState(prev => ({
        ...prev,
        isSubscribed: false,
        subscription: null,
      }))

      // Notify server
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: notificationState.subscription }),
      })

      return true
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error)
      return false
    }
  }

  const sendNotification = async (title: string, options: NotificationOptions = {}) => {
    if (!('Notification' in window)) return

    if (notificationState.permission === 'granted') {
      new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        ...options,
      })
    }
  }

  return {
    ...notificationState,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    sendNotification,
  }
}