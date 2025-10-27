import React from 'react'
import { useNotificationStore } from '../../store'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { useI18n } from '../../contexts/I18nContext'
import { Bell, X, Check } from 'lucide-react'

export function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore()
  const { t } = useI18n()

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 w-80 max-w-sm">
      <Card className="shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <h3 className="font-semibold">{t('notifications.title')}</h3>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <Check className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {notifications.slice(0, 3).map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border ${
                  notification.isRead ? 'bg-muted/50' : 'bg-primary/10 border-primary/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">
                      {notification.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                      className="ml-2 p-1"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
