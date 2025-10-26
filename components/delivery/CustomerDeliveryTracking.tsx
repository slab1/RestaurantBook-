/**
 * Customer Delivery Tracking Interface
 * Real-time delivery tracking with live map and driver updates
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';
import {
  MapPin,
  Truck,
  Clock,
  Phone,
  Star,
  CheckCircle,
  Package,
  Navigation,
  User,
} from 'lucide-react';

interface TrackingInfo {
  orderId: string;
  status: string;
  driver?: {
    name: string;
    phone?: string;
    photo?: string;
    rating?: number;
    vehicleType?: string;
    location?: {
      lat: number;
      lng: number;
      heading?: number;
    };
  };
  estimatedArrival?: Date;
  currentLocation?: {
    lat: number;
    lng: number;
  };
  distance?: number;
  distanceRemaining?: number;
}

interface DeliveryOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  currency: string;
  items: any[];
  deliveryAddress: any;
  estimatedDeliveryTime?: Date;
  restaurant: {
    name: string;
    address: string;
    phone: string;
    images: string[];
  };
  platform: {
    displayName: string;
  };
}

export default function CustomerDeliveryTracking({ orderId }: { orderId: string }) {
  const { data: session } = useSession();
  const [order, setOrder] = useState<DeliveryOrder | null>(null);
  const [tracking, setTracking] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    fetchOrder();
    initializeWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('stop-tracking');
        socketRef.current.disconnect();
      }
    };
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/delivery/orders/${orderId}`);
      const data = await response.json();
      setOrder(data.order);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching order:', error);
      setLoading(false);
    }
  };

  const initializeWebSocket = () => {
    const socket = io({
      path: '/api/socket',
    });

    socket.on('connect', () => {
      console.log('Connected to tracking service');
      socket.emit('track-order', {
        orderId,
        userId: session?.user?.id,
      });
    });

    socket.on('tracking-update', (data: any) => {
      setTracking(data.tracking);
    });

    socket.on('location-update', (data: any) => {
      setTracking((prev) => ({
        ...prev!,
        currentLocation: data.location,
      }));
    });

    socket.on('status-update', (data: any) => {
      setOrder((prev) => ({
        ...prev!,
        status: data.status,
      }));
    });

    socket.on('tracking-error', (data: any) => {
      console.error('Tracking error:', data.error);
    });

    socketRef.current = socket;
  };

  const getStatusSteps = () => {
    const steps = [
      { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle },
      { key: 'preparing', label: 'Preparing', icon: Package },
      { key: 'ready', label: 'Ready', icon: CheckCircle },
      { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
      { key: 'delivered', label: 'Delivered', icon: CheckCircle },
    ];

    const currentIndex = steps.findIndex((s) => s.key === order?.status);

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex,
    }));
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      confirmed: 'text-blue-600',
      preparing: 'text-purple-600',
      ready: 'text-green-600',
      out_for_delivery: 'text-indigo-600',
      delivered: 'text-green-600',
    };
    return colors[status] || 'text-gray-600';
  };

  const formatETA = (date?: Date) => {
    if (!date) return 'Calculating...';
    const eta = new Date(date);
    const now = new Date();
    const diff = eta.getTime() - now.getTime();
    const minutes = Math.round(diff / 60000);

    if (minutes < 0) return 'Arriving soon';
    if (minutes < 60) return `${minutes} min`;
    return `${Math.round(minutes / 60)}h ${minutes % 60}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tracking information...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-xl text-gray-900 mb-2">Order not found</p>
          <p className="text-gray-600">Please check your order number</p>
        </div>
      </div>
    );
  }

  const statusSteps = getStatusSteps();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Order #{order.orderNumber}
              </h1>
              <p className="text-sm text-gray-600">
                via {order.platform.displayName}
              </p>
            </div>
            <span className={`text-lg font-semibold ${getStatusColor(order.status)}`}>
              {order.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Status Progress */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Progress</h2>
          
          <div className="relative">
            <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-200"></div>
            <div className="space-y-6">
              {statusSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.key} className="relative flex items-center">
                    <div
                      className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${
                        step.completed
                          ? 'bg-green-500'
                          : step.active
                          ? 'bg-blue-500'
                          : 'bg-gray-300'
                      }`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p
                        className={`font-medium ${
                          step.completed || step.active
                            ? 'text-gray-900'
                            : 'text-gray-500'
                        }`}
                      >
                        {step.label}
                      </p>
                      {step.active && (
                        <p className="text-sm text-blue-600">In Progress</p>
                      )}
                      {step.completed && !step.active && (
                        <p className="text-sm text-green-600">Completed</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Estimated Arrival */}
        {order.status === 'out_for_delivery' && (
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Estimated Arrival</p>
                <p className="text-3xl font-bold mt-1">
                  {formatETA(tracking?.estimatedArrival || order.estimatedDeliveryTime)}
                </p>
              </div>
              <Clock className="w-16 h-16 opacity-80" />
            </div>
            {tracking?.distanceRemaining && (
              <p className="text-sm mt-4 opacity-90">
                {tracking.distanceRemaining.toFixed(1)} km away
              </p>
            )}
          </div>
        )}

        {/* Driver Information */}
        {tracking?.driver && order.status === 'out_for_delivery' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Your Driver
            </h2>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {tracking.driver.photo ? (
                  <img
                    src={tracking.driver.photo}
                    alt={tracking.driver.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  {tracking.driver.name}
                </p>
                {tracking.driver.vehicleType && (
                  <p className="text-sm text-gray-600">
                    {tracking.driver.vehicleType}
                  </p>
                )}
                {tracking.driver.rating && (
                  <div className="flex items-center mt-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">
                      {tracking.driver.rating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
              {tracking.driver.phone && (
                <a
                  href={`tel:${tracking.driver.phone}`}
                  className="p-3 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Map Placeholder */}
        {tracking?.currentLocation && order.status === 'out_for_delivery' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gray-200 h-64 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Live Map Tracking</p>
                <p className="text-sm text-gray-500 mt-1">
                  Lat: {tracking.currentLocation.lat.toFixed(6)}, 
                  Lng: {tracking.currentLocation.lng.toFixed(6)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Delivery Address */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Delivery Address
          </h2>
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-gray-400 mt-1" />
            <div>
              <p className="text-gray-900">{order.deliveryAddress.street}</p>
              {order.deliveryAddress.apartment && (
                <p className="text-gray-600 text-sm">
                  {order.deliveryAddress.apartment}
                </p>
              )}
              <p className="text-gray-600 text-sm">
                {order.deliveryAddress.city}, {order.deliveryAddress.state}{' '}
                {order.deliveryAddress.zipCode}
              </p>
            </div>
          </div>
        </div>

        {/* Restaurant Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Restaurant
          </h2>
          <div className="flex items-start space-x-4">
            {order.restaurant.images[0] && (
              <img
                src={order.restaurant.images[0]}
                alt={order.restaurant.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div>
              <p className="font-semibold text-gray-900">
                {order.restaurant.name}
              </p>
              <p className="text-sm text-gray-600">{order.restaurant.address}</p>
              <p className="text-sm text-gray-600">{order.restaurant.phone}</p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Order Items
          </h2>
          <div className="space-y-3">
            {order.items.map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">
                    {item.quantity}x {item.name}
                  </p>
                  {item.specialInstructions && (
                    <p className="text-sm text-gray-600">
                      {item.specialInstructions}
                    </p>
                  )}
                </div>
                <p className="font-semibold text-gray-900">
                  {order.currency} {(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-200 mt-4 pt-4">
            <div className="flex justify-between items-center">
              <p className="text-lg font-bold text-gray-900">Total</p>
              <p className="text-lg font-bold text-gray-900">
                {order.currency} {order.totalAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-blue-50 rounded-lg p-6 text-center">
          <p className="text-gray-900 font-medium mb-2">Need Help?</p>
          <p className="text-gray-600 text-sm mb-4">
            Contact restaurant or delivery support
          </p>
          <div className="flex items-center justify-center space-x-4">
            <a
              href={`tel:${order.restaurant.phone}`}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Call Restaurant
            </a>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Get Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
