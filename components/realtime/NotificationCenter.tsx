'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  Check, 
  Clock, 
  Calendar, 
  Star, 
  Gift, 
  Users,
  X,
  MoreVertical
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useSocket } from '@/hooks/useSocket';
import { toast } from '@/components/ui/use-toast';

interface Notification {
  id: string;
  type: 'BOOKING_CONFIRMATION' | 'BOOKING_REMINDER' | 'BOOKING_CANCELLED' | 'WAITLIST_AVAILABLE' | 'PROMOTION' | 'REVIEW_REQUEST';
  title: string;
  message: string;
  status: 'PENDING' | 'SENT' | 'FAILED' | 'READ';
  metadata?: any;
  createdAt: string;
  readAt?: string;
}

interface NotificationCenterProps {
  userId: string;
  className?: string;
}

export default function NotificationCenter({ userId, className }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [userId]);

  useEffect(() => {
    if (socket) {
      socket.on('notification:new', handleNewNotification);
      socket.on('notification:read_confirmed', handleNotificationRead);
      
      return () => {
        socket.off('notification:new');
        socket.off('notification:read_confirmed');
      };
    }
  }, [socket]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/notifications/unread-count');
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleNewNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Show toast notification
    toast({
      title: notification.title,
      description: notification.message,
      duration: 5000,
    });
  };

  const handleNotificationRead = (data: { notificationId: string }) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === data.notificationId 
          ? { ...notification, status: 'READ', readAt: new Date().toISOString() }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
      
      if (response.ok) {
        // Real-time update will be handled by socket event
        if (socket) {
          socket.emit('notification:read', notificationId);
        }
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => ({
            ...notification,
            status: 'read',
            readAt: new Date().toISOString(),
          }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'BOOKING_CONFIRMATION':
      case 'BOOKING_REMINDER':
        return <Calendar className="h-4 w-4" />;
      case 'BOOKING_CANCELLED':
        return <X className="h-4 w-4" />;
      case 'WAITLIST_AVAILABLE':
        return <Users className="h-4 w-4" />;
      case 'PROMOTION':
        return <Gift className="h-4 w-4" />;
      case 'REVIEW_REQUEST':
        return <Star className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'BOOKING_CONFIRMATION':
        return 'text-green-600';
      case 'BOOKING_REMINDER':
        return 'text-blue-600';
      case 'BOOKING_CANCELLED':
        return 'text-red-600';
      case 'WAITLIST_AVAILABLE':
        return 'text-purple-600';
      case 'PROMOTION':
        return 'text-orange-600';
      case 'REVIEW_REQUEST':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return notification.status !== 'read';
      case 'read':
        return notification.status === 'read';
      default:
        return true;
    }
  });

  const NotificationItem = ({ notification }: { notification: Notification }) => {
    const isUnread = notification.status !== 'read';
    
    return (
      <Card className={`transition-all duration-200 ${isUnread ? 'bg-blue-50 border-blue-200' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className={`p-2 rounded-full ${isUnread ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <div className={getNotificationColor(notification.type)}>
                  {getNotificationIcon(notification.type)}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={`font-medium ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                    {notification.title}
                  </h4>
                  <div className="flex items-center space-x-2">
                    {isUnread && (
                      <Badge variant="secondary" className="text-xs">
                        New
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                      disabled={!isUnread}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <p className={`text-sm mt-1 ${isUnread ? 'text-gray-700' : 'text-gray-500'}`}>
                  {notification.message}
                </p>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
                  </div>
                  
                  {notification.metadata && (
                    <Badge variant="outline" className="text-xs">
                      {notification.type.replace('_', ' ').toLowerCase()}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex space-x-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {isConnected ? (
                  <span className="text-green-600">🟢 Real-time updates enabled</span>
                ) : (
                  <span className="text-orange-600">🟡 Connecting...</span>
                )}
              </CardDescription>
            </div>
            
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
              <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
              <TabsTrigger value="read">Read ({notifications.length - unreadCount})</TabsTrigger>
            </TabsList>
            
            <TabsContent value={filter} className="mt-4">
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {filteredNotifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No notifications in this category</p>
                    </div>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <NotificationItem key={notification.id} notification={notification} />
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
