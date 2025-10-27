import React, { useEffect } from 'react'
import { useNotificationStore } from '../../store'

export function NotificationManager() {
  const { fetchNotifications } = useNotificationStore()

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          console.log('Notification permission granted')
          fetchNotifications()
        }
      })
    }

    // Set up push notification listener
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('push', (event) => {
          if (event.data) {
            const data = event.data.json()
            new Notification(data.title, {
              body: data.body,
              icon: data.icon || '/icons/icon-192x192.png',
              badge: data.badge || '/icons/icon-72x72.png',
              tag: data.tag,
            })
          }
        })
      })
    }
  }, [fetchNotifications])

  return null
}
