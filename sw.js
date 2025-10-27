// RestaurantBook PWA Service Worker - Enhanced with Loyalty Support
const CACHE_NAME = 'restaurantbook-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/points-icon.png',
  '/icons/tier-icon.png',
  '/icons/achievement-icon.png',
  '/icons/streak-icon.png',
  '/icons/expiring-icon.png',
  '/icons/loyalty-icon.png'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle offline booking sync
      console.log('🔄 Background sync triggered for offline bookings')
    );
  }

  // Loyalty-specific background sync
  if (event.tag === 'loyalty-sync') {
    event.waitUntil(
      syncLoyaltyData()
    );
  }
});

// Sync loyalty data when back online
async function syncLoyaltyData() {
  try {
    console.log('🔄 Syncing loyalty data...');
    
    // Get cached loyalty actions from IndexedDB
    const db = await openDB();
    const tx = db.transaction(['loyaltyQueue'], 'readonly');
    const store = tx.objectStore('loyaltyQueue');
    const actions = await store.getAll();
    
    // Process each action
    for (const action of actions) {
      try {
        const response = await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body,
        });
        
        if (response.ok) {
          // Remove from queue on success
          const deleteTx = db.transaction(['loyaltyQueue'], 'readwrite');
          const deleteStore = deleteTx.objectStore('loyaltyQueue');
          await deleteStore.delete(action.id);
          console.log('✅ Synced loyalty action:', action.type);
        }
      } catch (error) {
        console.error('❌ Failed to sync loyalty action:', error);
      }
    }
    
    await tx.complete;
  } catch (error) {
    console.error('❌ Loyalty sync failed:', error);
  }
}

// Open IndexedDB for offline storage
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('RestaurantBookDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create loyalty queue store
      if (!db.objectStoreNames.contains('loyaltyQueue')) {
        const store = db.createObjectStore('loyaltyQueue', { keyPath: 'id' });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

// Push notifications
self.addEventListener('push', (event) => {
  let notificationData = {
    title: 'RestaurantBook',
    body: 'New notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/close-icon.png'
      }
    ]
  };

  // Parse loyalty-specific notification data
  if (event.data) {
    try {
      const payload = event.data.json();
      
      // Loyalty notification types
      if (payload.type === 'LOYALTY_NOTIFICATION') {
        const loyaltyType = payload.data?.loyaltyType;
        
        switch (loyaltyType) {
          case 'POINTS_EARNED':
            notificationData = {
              ...notificationData,
              title: '🎉 Points Earned!',
              body: payload.data.message || 'You earned loyalty points!',
              icon: '/icons/points-icon.png',
              vibrate: [200, 100, 200],
              tag: 'loyalty-points',
            };
            break;
            
          case 'POINTS_REDEEMED':
            notificationData = {
              ...notificationData,
              title: '🎁 Points Redeemed!',
              body: payload.data.message || 'You redeemed loyalty points!',
              icon: '/icons/redeem-icon.png',
              vibrate: [150, 75, 150],
              tag: 'loyalty-redeem',
            };
            break;
            
          case 'TIER_UPGRADE':
            notificationData = {
              ...notificationData,
              title: '⭐ Tier Upgrade!',
              body: payload.data.message || 'Congratulations on your tier upgrade!',
              icon: '/icons/tier-icon.png',
              vibrate: [300, 100, 300, 100, 300],
              tag: 'loyalty-tier',
            };
            break;
            
          case 'ACHIEVEMENT_UNLOCKED':
            notificationData = {
              ...notificationData,
              title: '🏆 Achievement Unlocked!',
              body: payload.data.message || 'You unlocked a new achievement!',
              icon: '/icons/achievement-icon.png',
              vibrate: [200, 100, 200, 100, 200],
              tag: 'loyalty-achievement',
            };
            break;
            
          case 'POINTS_EXPIRING':
            notificationData = {
              ...notificationData,
              title: '⏰ Points Expiring Soon!',
              body: payload.data.message || 'Your points are about to expire!',
              icon: '/icons/expiring-icon.png',
              vibrate: [100, 50, 100, 50, 100],
              tag: 'loyalty-expiring',
              requireInteraction: true,
            };
            break;
            
          case 'STREAK_BONUS':
            notificationData = {
              ...notificationData,
              title: '🔥 Streak Bonus!',
              body: payload.data.message || 'You earned a streak bonus!',
              icon: '/icons/streak-icon.png',
              vibrate: [150, 75, 150],
              tag: 'loyalty-streak',
            };
            break;
            
          case 'STREAK_MILESTONE':
            notificationData = {
              ...notificationData,
              title: '🎯 Streak Milestone!',
              body: payload.data.message || 'You reached a new streak milestone!',
              icon: '/icons/milestone-icon.png',
              vibrate: [200, 100, 200],
              tag: 'loyalty-milestone',
            };
            break;
            
          case 'BONUS_CAMPAIGN':
            notificationData = {
              ...notificationData,
              title: '🎊 Bonus Campaign!',
              body: payload.data.message || 'Special bonus points available!',
              icon: '/icons/bonus-icon.png',
              vibrate: [250, 125, 250],
              tag: 'loyalty-bonus',
            };
            break;
            
          case 'WELCOME_BONUS':
            notificationData = {
              ...notificationData,
              title: '👋 Welcome Bonus!',
              body: payload.data.message || 'Welcome to our loyalty program!',
              icon: '/icons/welcome-icon.png',
              vibrate: [200, 100, 200, 100, 200],
              tag: 'loyalty-welcome',
            };
            break;
            
          case 'REFERRAL_REWARD':
            notificationData = {
              ...notificationData,
              title: '👥 Referral Reward!',
              body: payload.data.message || 'You earned points from a referral!',
              icon: '/icons/referral-icon.png',
              vibrate: [180, 90, 180],
              tag: 'loyalty-referral',
            };
            break;
            
          default:
            notificationData = {
              ...notificationData,
              title: payload.title || 'Loyalty Update',
              body: payload.body || payload.data?.message || 'You have a loyalty update',
              icon: '/icons/loyalty-icon.png',
            };
        }
        
        // Add loyalty-specific actions
        notificationData.actions = [
          {
            action: 'view',
            title: 'View Details',
            icon: '/icons/view-icon.png'
          },
          {
            action: 'redeem',
            title: 'Redeem Points',
            icon: '/icons/redeem-icon.png'
          },
          {
            action: 'dismiss',
            title: 'Dismiss',
            icon: '/icons/close-icon.png'
          }
        ];
        
        // Add additional data
        notificationData.data = {
          ...notificationData.data,
          ...payload.data,
          loyaltyType,
          type: 'LOYALTY_NOTIFICATION'
        };
      } else {
        // Regular notification
        notificationData = {
          ...notificationData,
          title: payload.title || 'RestaurantBook',
          body: payload.body || payload.message || 'New notification',
          data: {
            ...notificationData.data,
            ...payload.data
          }
        };
      }
    } catch (error) {
      console.error('Error parsing push notification:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const notificationData = event.notification.data;
  let urlToOpen = '/';

  // Handle loyalty-specific actions
  if (notificationData?.type === 'LOYALTY_NOTIFICATION') {
    const loyaltyType = notificationData.loyaltyType;
    
    switch (event.action) {
      case 'view':
        urlToOpen = '/loyalty';
        break;
      case 'redeem':
        urlToOpen = '/loyalty/redeem';
        break;
      case 'dismiss':
        return; // Just close the notification
      default:
        // Default click - open loyalty dashboard
        urlToOpen = '/loyalty';
    }
  } else if (event.action === 'explore') {
    urlToOpen = '/';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window/tab open with the target URL
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If not, open a new window/tab
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
        
      case 'GET_VERSION':
        event.ports[0].postMessage({ version: CACHE_NAME });
        break;
        
      case 'CACHE_URLS':
        event.waitUntil(
          caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(event.data.urls))
        );
        break;
        
      case 'PROCESS_QUEUED_NOTIFICATIONS':
        event.waitUntil(processQueuedNotifications());
        break;
        
      default:
        console.log('Unknown message type:', event.data.type);
    }
  }
});

// Process queued notifications when back online
async function processQueuedNotifications() {
  try {
    const db = await openDB();
    const tx = db.transaction(['notificationQueue'], 'readonly');
    const store = tx.objectStore('notificationQueue');
    const notifications = await store.getAll();
    
    for (const notification of notifications) {
      try {
        await self.registration.showNotification(notification.title, notification.options);
        
        // Remove from queue after showing
        const deleteTx = db.transaction(['notificationQueue'], 'readwrite');
        const deleteStore = deleteTx.objectStore('notificationQueue');
        await deleteStore.delete(notification.id);
      } catch (error) {
        console.error('Failed to show queued notification:', error);
      }
    }
  } catch (error) {
    console.error('Failed to process queued notifications:', error);
  }
}

// Handle background sync registration
self.addEventListener('message', (event) => {
  if (event.data === 'register-loyalty-sync') {
    self.registration.sync.register('loyalty-sync');
  }
});

console.log('🚀 RestaurantBook Service Worker loaded successfully with loyalty support!');
