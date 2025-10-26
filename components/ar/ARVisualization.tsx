'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  X, 
  Zap, 
  Smartphone, 
  Globe, 
  Eye,
  Settings,
  Maximize2,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Battery,
  Signal
} from 'lucide-react';
import ARMenuViewer from './ARMenuViewer';
import ARUIBridge from './ARUIBridge';
import ARCameraControls from './ARCameraControls';
import ARFoodPreview from './ARFoodPreview';
import { getAllFoodNames } from './NigerianFoodModels';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  model3d?: string;
  nutritionInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  ingredients: string[];
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isSpicy?: number;
  category: string;
  restaurant: string;
  rating?: number;
  reviews?: number;
  preparationTime?: number;
  temperature?: 'hot' | 'warm' | 'cold';
  difficulty?: 'easy' | 'medium' | 'hard';
  cuisine?: string;
}

interface DeviceCapabilities {
  camera: boolean;
  webgl: boolean;
  webxr: boolean;
  webassembly: boolean;
  serviceWorker: boolean;
  deviceOrientation: boolean;
  vibration: boolean;
  notifications: boolean;
  geolocation: boolean;
}

interface ARVisualizationProps {
  menuItems: MenuItem[];
  onAddToCart?: (item: MenuItem, quantity: number) => void;
  onClose?: () => void;
  initialMode?: 'menu' | 'preview' | 'fullscreen';
  enableAnalytics?: boolean;
  className?: string;
}

const ARVisualization: React.FC<ARVisualizationProps> = ({
  menuItems,
  onAddToCart,
  onClose,
  initialMode = 'menu',
  enableAnalytics = true,
  className = ''
}) => {
  const [currentMode, setCurrentMode] = useState(initialMode);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [uiState, setUiState] = useState({
    isFullscreen: false,
    isARActive: false,
    showCameraControls: false,
    showPreview: false,
    showUIBridge: false,
    audioEnabled: true,
    notificationsEnabled: true,
    analyticsEnabled: enableAnalytics
  });

  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isIOS: false,
    isAndroid: false,
    isSupported: false,
    performanceLevel: 'unknown' as 'low' | 'medium' | 'high' | 'ultra',
    batteryLevel: null as number | null
  });

  const [deviceCapabilities, setDeviceCapabilities] = useState<DeviceCapabilities>({
    camera: false,
    webgl: false,
    webxr: false,
    webassembly: false,
    serviceWorker: false,
    deviceOrientation: false,
    vibration: false,
    notifications: false,
    geolocation: false
  });

  const [networkInfo, setNetworkInfo] = useState({
    isOnline: navigator.onLine,
    connectionType: 'unknown' as string,
    downlink: 0,
    rtt: 0
  });

  const [analytics, setAnalytics] = useState({
    arSessions: 0,
    averageSessionTime: 0,
    totalViews: 0,
    mostViewedItems: [] as string[]
  });

  useEffect(() => {
    checkDeviceCapabilities();
    checkNetworkInfo();
    detectDevice();
    setupEventListeners();

    return () => {
      removeEventListeners();
    };
  }, []);

  const checkDeviceCapabilities = async () => {
    const capabilities: DeviceCapabilities = {
      camera: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      webgl: !!document.createElement('canvas').getContext('webgl'),
      webxr: 'xr' in navigator,
      webassembly: typeof WebAssembly === 'object',
      serviceWorker: 'serviceWorker' in navigator,
      deviceOrientation: 'DeviceOrientationEvent' in window,
      vibration: 'vibrate' in navigator,
      notifications: 'Notification' in window,
      geolocation: 'geolocation' in navigator
    };

    setDeviceCapabilities(capabilities);

    // Check if device is supported
    const isSupported = capabilities.camera && capabilities.webgl;
    setDeviceInfo(prev => ({ ...prev, isSupported }));

    // Determine performance level
    const cores = navigator.hardwareConcurrency || 4;
    const memory = (navigator as any).deviceMemory || 4;
    let performanceLevel: 'low' | 'medium' | 'high' | 'ultra' = 'medium';

    if (cores >= 8 && memory >= 8) performanceLevel = 'ultra';
    else if (cores >= 6 && memory >= 6) performanceLevel = 'high';
    else if (cores <= 2 || memory <= 2) performanceLevel = 'low';

    setDeviceInfo(prev => ({ ...prev, performanceLevel }));
  };

  const checkNetworkInfo = () => {
    setNetworkInfo(prev => ({
      ...prev,
      isOnline: navigator.onLine
    }));

    // Check connection API if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setNetworkInfo(prev => ({
        ...prev,
        connectionType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0
      }));
    }
  };

  const detectDevice = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isIOS = /iphone|ipad|ipod/i.test(userAgent);
    const isAndroid = /android/i.test(userAgent);

    setDeviceInfo(prev => ({
      ...prev,
      isMobile,
      isIOS,
      isAndroid
    }));
  };

  const setupEventListeners = () => {
    window.addEventListener('online', checkNetworkInfo);
    window.addEventListener('offline', checkNetworkInfo);
    
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setDeviceInfo(prev => ({ ...prev, batteryLevel: battery.level * 100 }));
        
        battery.addEventListener('levelchange', () => {
          setDeviceInfo(prev => ({ ...prev, batteryLevel: battery.level * 100 }));
        });
      });
    }

    // Fullscreen change events
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
  };

  const removeEventListeners = () => {
    window.removeEventListener('online', checkNetworkInfo);
    window.removeEventListener('offline', checkNetworkInfo);
    
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
  };

  const handleFullscreenChange = () => {
    const isFullscreen = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );
    
    setUiState(prev => ({ ...prev, isFullscreen }));
  };

  const handleModeChange = useCallback((mode: 'menu' | 'preview' | 'fullscreen') => {
    setCurrentMode(mode);
    if (enableAnalytics) {
      setAnalytics(prev => ({
        ...prev,
        arSessions: prev.arSessions + 1,
        totalViews: prev.totalViews + 1
      }));
    }
  }, [enableAnalytics]);

  const handleItemSelect = useCallback((item: MenuItem) => {
    setSelectedItem(item);
    setUiState(prev => ({ ...prev, showUIBridge: true }));
    
    if (enableAnalytics) {
      setAnalytics(prev => ({
        ...prev,
        mostViewedItems: [...prev.mostViewedItems.slice(-9), item.name]
      }));
    }
  }, [enableAnalytics]);

  const handleStartAR = useCallback((item: MenuItem) => {
    setSelectedItem(item);
    setCurrentMode('fullscreen');
    setUiState(prev => ({ ...prev, isARActive: true }));
    
    if (enableAnalytics) {
      setAnalytics(prev => ({
        ...prev,
        arSessions: prev.arSessions + 1
      }));
    }
  }, [enableAnalytics]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen not supported:', error);
    }
  };

  const toggleAudio = () => {
    setUiState(prev => ({ ...prev, audioEnabled: !prev.audioEnabled }));
  };

  const toggleNotifications = () => {
    setUiState(prev => ({ ...prev, notificationsEnabled: !prev.notificationsEnabled }));
  };

  // Check if device can handle AR
  const canHandleAR = deviceInfo.isSupported && deviceCapabilities.camera && deviceCapabilities.webgl;

  if (!canHandleAR) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center p-4 ${className}`}>
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-orange-600" />
            </div>
            
            <h2 className="text-2xl font-bold mb-4">AR Not Supported</h2>
            
            <div className="space-y-3 text-sm text-gray-600 mb-6">
              <div className="flex items-center justify-between">
                <span>Camera Access</span>
                <div className={`w-2 h-2 rounded-full ${deviceCapabilities.camera ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
              <div className="flex items-center justify-between">
                <span>WebGL Support</span>
                <div className={`w-2 h-2 rounded-full ${deviceCapabilities.webgl ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
              <div className="flex items-center justify-between">
                <span>Mobile Device</span>
                <div className={`w-2 h-2 rounded-full ${deviceInfo.isMobile ? 'bg-green-500' : 'bg-yellow-500'}`} />
              </div>
            </div>
            
            <p className="text-gray-600 mb-6">
              Your device doesn't meet the minimum requirements for AR features. 
              Please try using a modern mobile device with camera support.
            </p>
            
            <Button onClick={onClose} className="w-full">
              Continue Without AR
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`relative ${uiState.isFullscreen ? 'h-screen' : 'min-h-screen'} ${className}`}>
      {/* System Status Bar (Development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 text-white text-xs p-2 font-mono">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span>Mode: {currentMode}</span>
              <span>Device: {deviceInfo.performanceLevel}</span>
              <span>AR: {uiState.isARActive ? 'Active' : 'Inactive'}</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {networkInfo.isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                <span>{networkInfo.connectionType}</span>
              </div>
              
              {deviceInfo.batteryLevel && (
                <div className="flex items-center space-x-1">
                  <Battery className="w-3 h-3" />
                  <span>{Math.round(deviceInfo.batteryLevel)}%</span>
                </div>
              )}
              
              <span>{deviceInfo.isMobile ? 'Mobile' : 'Desktop'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main AR Interface */}
      <AnimatePresence mode="wait">
        {currentMode === 'menu' && (
          <motion.div
            key="menu-mode"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="h-full"
          >
            <ARMenuViewer
              menuItems={menuItems}
              onAddToCart={(item) => {
                setSelectedItem(item);
                onAddToCart?.(item, 1);
              }}
              onClose={onClose}
              className="h-full"
            />
          </motion.div>
        )}

        {currentMode === 'fullscreen' && selectedItem && (
          <motion.div
            key="fullscreen-mode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full bg-black"
          >
            <ARMenuViewer
              menuItems={[selectedItem]}
              onAddToCart={(item) => onAddToCart?.(item, 1)}
              onClose={() => {
                setCurrentMode('menu');
                setUiState(prev => ({ ...prev, isARActive: false }));
              }}
              className="h-full"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Overlay */}
      {currentMode !== 'menu' && (
        <div className="absolute top-4 right-4 z-40 flex items-center space-x-2">
          <Button
            onClick={toggleAudio}
            variant="ghost"
            size="sm"
            className="bg-black/50 text-white hover:bg-black/70"
          >
            {uiState.audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>

          <Button
            onClick={() => setUiState(prev => ({ ...prev, showCameraControls: !prev.showCameraControls }))}
            variant="ghost"
            size="sm"
            className="bg-black/50 text-white hover:bg-black/70"
          >
            <Camera className="w-4 h-4" />
          </Button>

          <Button
            onClick={toggleFullscreen}
            variant="ghost"
            size="sm"
            className="bg-black/50 text-white hover:bg-black/70"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Camera Controls */}
      <AnimatePresence>
        {uiState.showCameraControls && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute top-4 right-4 z-30 w-80"
          >
            <ARCameraControls
              isActive={uiState.isARActive}
              onToggle={() => setUiState(prev => ({ ...prev, isARActive: !prev.isARActive }))}
              onSettingsChange={(settings) => {
                // Handle camera settings changes
                console.log('Camera settings updated:', settings);
              }}
              onCapture={() => {
                // Handle photo capture
                console.log('Photo captured');
              }}
              onRecord={() => {
                // Handle video recording start
                console.log('Recording started');
              }}
              onStopRecord={() => {
                // Handle video recording stop
                console.log('Recording stopped');
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* UI Bridge */}
      <ARUIBridge
        isVisible={uiState.showUIBridge}
        onClose={() => setUiState(prev => ({ ...prev, showUIBridge: false }))}
        selectedItem={selectedItem}
        onAddToCart={onAddToCart}
        onToggleFavorite={(itemId) => {
          console.log('Toggle favorite:', itemId);
        }}
        onShare={(item) => {
          console.log('Share item:', item);
        }}
        onStartAR={handleStartAR}
        onQuickView={(item) => {
          setSelectedItem(item);
          setCurrentMode('preview');
        }}
      />

      {/* Performance Monitor */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs p-3 rounded font-mono">
          <div className="space-y-1">
            <div>Performance: {deviceInfo.performanceLevel}</div>
            <div>Capabilities:</div>
            <div className="pl-2">
              <div>Camera: {deviceCapabilities.camera ? '✓' : '✗'}</div>
              <div>WebGL: {deviceCapabilities.webgl ? '✓' : '✗'}</div>
              <div>WebXR: {deviceCapabilities.webxr ? '✓' : '✗'}</div>
            </div>
            <div>Analytics:</div>
            <div className="pl-2">
              <div>Sessions: {analytics.arSessions}</div>
              <div>Views: {analytics.totalViews}</div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      <AnimatePresence>
        {!canHandleAR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 flex items-center justify-center z-50"
          >
            <Card className="p-8">
              <CardContent className="text-center">
                <div className="animate-spin w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-600">Initializing AR...</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ARVisualization;