'use client';

import { useEffect, useState, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/useAuth';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connectionError: string | null;
}

export function useSocket(): SocketContextType {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const { user, token } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user || !token) {
      // Disconnect if user is not authenticated
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Initialize socket connection
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    // Connection event handlers
    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      setIsConnected(true);
      setConnectionError(null);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, attempt reconnection
        socketInstance.connect();
      }
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
      setConnectionError(error.message || 'Socket error occurred');
    });

    // Cleanup on unmount
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [user, token]);

  return {
    socket,
    isConnected,
    connectionError,
  };
}

// Hook for real-time booking updates
export function useBookingUpdates(restaurantId?: string) {
  const { socket } = useSocket();
  const [bookingUpdates, setBookingUpdates] = useState<any[]>([]);

  useEffect(() => {
    if (!socket) return;

    const handleBookingNew = (data: any) => {
      setBookingUpdates(prev => [{ type: 'new', data, timestamp: new Date() }, ...prev.slice(0, 9)]);
    };

    const handleBookingStatusUpdate = (data: any) => {
      setBookingUpdates(prev => [{ type: 'status_update', data, timestamp: new Date() }, ...prev.slice(0, 9)]);
    };

    socket.on('booking:new', handleBookingNew);
    socket.on('booking:status_updated', handleBookingStatusUpdate);

    return () => {
      socket.off('booking:new', handleBookingNew);
      socket.off('booking:status_updated', handleBookingStatusUpdate);
    };
  }, [socket]);

  return bookingUpdates;
}

// Hook for waitlist updates
export function useWaitlistUpdates() {
  const { socket } = useSocket();
  const [waitlistUpdates, setWaitlistUpdates] = useState<any[]>([]);

  useEffect(() => {
    if (!socket) return;

    const handleWaitlistNew = (data: any) => {
      setWaitlistUpdates(prev => [{ type: 'new', data, timestamp: new Date() }, ...prev.slice(0, 9)]);
    };

    const handleTableAvailable = (data: any) => {
      setWaitlistUpdates(prev => [{ type: 'table_available', data, timestamp: new Date() }, ...prev.slice(0, 9)]);
    };

    socket.on('waitlist:new', handleWaitlistNew);
    socket.on('waitlist:table_available', handleTableAvailable);

    return () => {
      socket.off('waitlist:new', handleWaitlistNew);
      socket.off('waitlist:table_available', handleTableAvailable);
    };
  }, [socket]);

  return waitlistUpdates;
}

// Hook for notifications
export function useNotifications() {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (data: any) => {
      setNotifications(prev => [data, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    const handleNotificationRead = (data: any) => {
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === data.notificationId 
            ? { ...notification, status: 'read' }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    };

    socket.on('notification:new', handleNewNotification);
    socket.on('notification:read_confirmed', handleNotificationRead);

    return () => {
      socket.off('notification:new', handleNewNotification);
      socket.off('notification:read_confirmed', handleNotificationRead);
    };
  }, [socket]);

  return {
    notifications,
    unreadCount,
  };
}
