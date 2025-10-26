/**
 * Virtual Restaurant Tour System - Component Index
 * Exports all AR/VR components and types for easy importing
 */

// Core system types and utilities
export type {
  Hotspot,
  Vector3D,
  SceneData,
  SceneMetadata,
  AccessibilityInfo,
  LightingConfig,
  TourConfiguration,
  VirtualTourStats
} from '@/lib/ar/virtual-tour-system';

export { VirtualTourSystem, VirtualTourUtils } from '@/lib/ar/virtual-tour-system';

// Main components
export { VirtualTour } from './virtual-tour';
export { PanoramicViewer } from './panoramic-viewer';
export { HotspotOverlay } from './hotspot-overlay';
export { TourControls } from './tour-controls';
export { MobileTourInterface } from './mobile-tour-interface';
export { ARViewer } from './ar-viewer';

// Default exports
export { default as VirtualTourDefault } from './virtual-tour';
export { default as PanoramicViewerDefault } from './panoramic-viewer';
export { default as HotspotOverlayDefault } from './hotspot-overlay';
export { default as TourControlsDefault } from './tour-controls';
export { default as MobileTourInterfaceDefault } from './mobile-tour-interface';
export { default as ARViewerDefault } from './ar-viewer';

// Component interfaces for TypeScript support
export interface VirtualTourComponentProps {
  configuration: TourConfiguration;
  className?: string;
  showControls?: boolean;
  autoStart?: boolean;
  enableVoiceNavigation?: boolean;
  onSceneChange?: (scene: SceneData) => void;
  onHotspotClick?: (hotspot: Hotspot) => void;
  onTourComplete?: (stats: VirtualTourStats) => void;
}

export interface PanoramicViewerComponentProps {
  image: {
    url: string;
    width: number;
    height: number;
    format: 'equirectangular' | 'cube' | 'sphere';
    quality: number;
  };
  navigationPoints?: Array<{
    id: string;
    name: string;
    viewPoint: {
      yaw: number;
      pitch: number;
      fov: number;
      zoom: number;
    };
    thumbnail?: string;
    description?: string;
  }>;
  initialViewPoint?: Partial<{
    yaw: number;
    pitch: number;
    fov: number;
    zoom: number;
  }>;
  className?: string;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  showNavigation?: boolean;
  showZoomControls?: boolean;
  showResetButton?: boolean;
  onViewPointChange?: (viewPoint: any) => void;
  onNavigationPointClick?: (point: any) => void;
  onLoadComplete?: () => void;
  onError?: (error: Error) => void;
}

export interface HotspotOverlayComponentProps {
  hotspots: Hotspot[];
  onHotspotClick: (hotspot: Hotspot) => void;
  onHotspotHover?: (hotspot: Hotspot | null) => void;
  showLabels?: boolean;
  showCategories?: boolean;
  enableAnimations?: boolean;
  className?: string;
}

export interface TourControlsComponentProps {
  currentScene?: SceneData;
  scenes: SceneData[];
  stats: VirtualTourStats;
  isPlaying: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  className?: string;
  position?: 'bottom' | 'top' | 'left' | 'right';
  variant?: 'minimal' | 'standard' | 'detailed';
  onPlayPause: () => void;
  onPreviousScene: () => void;
  onNextScene: () => void;
  onSceneSelect: (sceneId: string) => void;
  onReset: () => void;
  onScreenshot: () => void;
  onMuteToggle: () => void;
  onFullscreenToggle: () => void;
  onVoiceToggle?: () => void;
  onSettingsChange?: (settings: any) => void;
}

export interface MobileTourInterfaceComponentProps {
  currentScene?: SceneData;
  scenes: SceneData[];
  stats: VirtualTourStats;
  isPlaying: boolean;
  isMuted: boolean;
  className?: string;
  deviceType?: 'phone' | 'tablet';
  onPlayPause: () => void;
  onPreviousScene: () => void;
  onNextScene: () => void;
  onSceneSelect: (sceneId: string) => void;
  onScreenshot: () => void;
  onMuteToggle: () => void;
  onHotspotClick?: (hotspot: Hotspot) => void;
}

export interface ARViewerComponentProps {
  models?: Array<{
    id: string;
    name: string;
    url: string;
    type: 'gltf' | 'fbx' | 'obj';
    scale: number;
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    thumbnail?: string;
    description?: string;
    price?: number;
    category: 'furniture' | 'decoration' | 'food' | 'equipment';
  }>;
  markers?: Array<{
    id: string;
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    type: 'table' | 'chair' | 'plant' | 'decoration' | 'menu';
    data: any;
  }>;
  initialModelId?: string;
  className?: string;
  autoStart?: boolean;
  showControls?: boolean;
  enablePlacement?: boolean;
  onModelSelect?: (model: any) => void;
  onPlacement?: (position: { x: number; y: number; z: number }) => void;
  onSessionEnd?: () => void;
}

// Version information
export const VERSION = '1.0.0';
export const COMPONENT_VERSION = '1.0.0';

// Utility functions for component setup
export const createTourConfiguration = (scenes: SceneData[], options: {
  startScene?: string;
  autoAdvance?: boolean;
  enableVR?: boolean;
  enableAR?: boolean;
  mobileOptimized?: boolean;
  offlineSupport?: boolean;
  voiceNavigation?: boolean;
} = {}): TourConfiguration => {
  return {
    scenes,
    startScene: options.startScene || scenes[0]?.id || '',
    autoAdvance: options.autoAdvance || false,
    pauseBetweenScenes: 5,
    showProgress: true,
    enableVR: options.enableVR || false,
    enableAR: options.enableAR || false,
    mobileOptimized: options.mobileOptimized || false,
    offlineSupport: options.offlineSupport || false,
    voiceNavigation: options.voiceNavigation || false
  };
};

export const createHotspot = (data: {
  id?: string;
  position: Vector3D;
  type: Hotspot['type'];
  title: string;
  description: string;
  icon?: string;
  action?: () => void;
  targetScene?: string;
  arModelUrl?: string;
  audioUrl?: string;
  metadata?: Record<string, any>;
}): Hotspot => {
  return {
    id: data.id || VirtualTourUtils.generateHotspotId(),
    position: data.position,
    type: data.type,
    title: data.title,
    description: data.description,
    icon: data.icon,
    action: data.action,
    targetScene: data.targetScene,
    arModelUrl: data.arModelUrl,
    audioUrl: data.audioUrl,
    metadata: data.metadata
  };
};

export const createSceneData = (data: {
  id: string;
  name: string;
  panoramaUrl: string;
  hotspots?: Hotspot[];
  audioTrack?: string;
  ambientMusic?: string;
  lighting?: {
    ambient: number;
    directional: Vector3D;
    shadows: boolean;
    intensity: number;
  };
  metadata?: SceneMetadata;
}): SceneData => {
  return {
    id: data.id,
    name: data.name,
    panoramaUrl: data.panoramaUrl,
    hotspots: data.hotspots || [],
    audioTrack: data.audioTrack,
    ambientMusic: data.ambientMusic,
    lighting: data.lighting,
    metadata: data.metadata
  };
};

// Sample data generators for testing
export const generateSampleScenes = (): SceneData[] => {
  return [
    createSceneData({
      id: 'main-dining',
      name: 'Main Dining Room',
      panoramaUrl: '/panoramas/main-dining.jpg',
      hotspots: [
        createHotspot({
          position: { x: 0, y: 0, z: -50 },
          type: 'navigation',
          title: 'Private Dining',
          description: 'Intimate dining area for special occasions',
          targetScene: 'private-dining'
        }),
        createHotspot({
          position: { x: 30, y: 10, z: -40 },
          type: 'info',
          title: 'Wine Cellar',
          description: 'Our curated selection of fine wines',
          metadata: { capacity: 20, featured: true }
        }),
        createHotspot({
          position: { x: -25, y: 5, z: -45 },
          type: 'booking',
          title: 'Reserve Table',
          description: 'Book a table in the main dining area',
          metadata: { capacity: 4, priceRange: '$$$' }
        })
      ],
      metadata: {
        restaurantSection: 'Dining',
        timeOfDay: 'evening',
        capacity: 120,
        specialFeatures: ['Live Music', 'Bar Service', 'View']
      }
    }),
    createSceneData({
      id: 'private-dining',
      name: 'Private Dining Room',
      panoramaUrl: '/panoramas/private-dining.jpg',
      hotspots: [
        createHotspot({
          position: { x: 0, y: 0, z: -50 },
          type: 'navigation',
          title: 'Back to Main',
          description: 'Return to main dining area',
          targetScene: 'main-dining'
        }),
        createHotspot({
          position: { x: 20, y: 0, z: -30 },
          type: 'menu',
          title: 'Chef\'s Menu',
          description: 'Exclusive tasting menu for private dining',
          metadata: { courses: 7, duration: '2.5 hours', price: 150 }
        }),
        createHotspot({
          position: { x: -15, y: 10, z: -40 },
          type: 'booking',
          title: 'Book Private Room',
          description: 'Reserve the entire private dining room',
          metadata: { capacity: 12, minimumSpend: 500 }
        })
      ],
      metadata: {
        restaurantSection: 'Private',
        timeOfDay: 'evening',
        capacity: 12,
        specialFeatures: ['Exclusive Service', 'Custom Menu', 'Privacy']
      }
    }),
    createSceneData({
      id: 'bar-lounge',
      name: 'Bar & Lounge',
      panoramaUrl: '/panoramas/bar-lounge.jpg',
      hotspots: [
        createHotspot({
          position: { x: 0, y: 0, z: -50 },
          type: 'navigation',
          title: 'Return to Restaurant',
          description: 'Go back to main areas',
          targetScene: 'main-dining'
        }),
        createHotspot({
          position: { x: 35, y: 0, z: -35 },
          type: 'info',
          title: 'Signature Cocktails',
          description: 'Award-winning cocktail creations',
          metadata: { signature: true, awards: 3 }
        }),
        createHotspot({
          position: { x: -30, y: 5, z: -40 },
          type: 'ar-model',
          title: '3D Bar Setup',
          description: 'View our bar equipment in AR',
          arModelUrl: '/models/bar-setup.gltf'
        })
      ],
      metadata: {
        restaurantSection: 'Bar',
        timeOfDay: 'evening',
        capacity: 40,
        specialFeatures: ['Craft Cocktails', 'Live DJ', 'Happy Hour']
      }
    })
  ];
};

// Feature detection utilities
export const detectDeviceCapabilities = async () => {
  return {
    webgl: !!window.WebGLRenderingContext,
    webxr: 'xr' in navigator,
    webxrAR: 'xr' in navigator ? await (navigator as any).xr.isSessionSupported('immersive-ar').catch(() => false) : false,
    webxrVR: 'xr' in navigator ? await (navigator as any).xr.isSessionSupported('immersive-vr').catch(() => false) : false,
    camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
    gyroscope: 'DeviceOrientationEvent' in window,
    accelerometer: 'DeviceMotionEvent' in window,
    deviceOrientation: 'DeviceOrientationEvent' in window,
    ambientLight: 'AmbientLightSensor' in window,
    geolocation: 'geolocation' in navigator,
    localStorage: 'localStorage' in window,
    indexedDB: 'indexedDB' in window,
    serviceWorker: 'serviceWorker' in navigator,
    webShare: 'share' in navigator,
    webAudio: 'AudioContext' in window || 'webkitAudioContext' in window,
    webSpeech: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
  };
};

// Performance monitoring
export const createPerformanceMonitor = () => {
  const metrics = {
    fps: 0,
    memoryUsage: 0,
    loadTime: 0,
    renderTime: 0,
    sceneTransitions: 0,
    hotspotInteractions: 0,
    screenshots: 0,
    errors: 0
  };

  const startTime = performance.now();
  let frameCount = 0;
  let lastFrameTime = performance.now();

  const measureFPS = () => {
    frameCount++;
    const now = performance.now();
    if (now - lastFrameTime >= 1000) {
      metrics.fps = Math.round((frameCount * 1000) / (now - lastFrameTime));
      frameCount = 0;
      lastFrameTime = now;
    }
  };

  const measureMemory = () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      metrics.memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024);
    }
  };

  const recordSceneTransition = () => {
    metrics.sceneTransitions++;
  };

  const recordHotspotInteraction = () => {
    metrics.hotspotInteractions++;
  };

  const recordScreenshot = () => {
    metrics.screenshots++;
  };

  const recordError = () => {
    metrics.errors++;
  };

  const getMetrics = () => ({
    ...metrics,
    loadTime: performance.now() - startTime
  });

  return {
    measureFPS,
    measureMemory,
    recordSceneTransition,
    recordHotspotInteraction,
    recordScreenshot,
    recordError,
    getMetrics
  };
};

// Error handling utilities
export const createErrorHandler = (componentName: string) => {
  const logError = (error: Error, context?: string) => {
    console.error(`[${componentName}] Error:`, error);
    
    // Send to analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        custom_map: {
          component: componentName,
          context: context || 'unknown'
        }
      });
    }
  };

  const handleError = (error: unknown, context?: string) => {
    if (error instanceof Error) {
      logError(error, context);
    } else {
      logError(new Error(String(error)), context);
    }
  };

  return { logError, handleError };
};

// Export constants
export const TOUR_CONSTANTS = {
  SUPPORTED_IMAGE_FORMATS: ['jpg', 'jpeg', 'png', 'webp', 'avif'] as const,
  SUPPORTED_VIDEO_FORMATS: ['mp4', 'webm', 'ogg'] as const,
  SUPPORTED_AUDIO_FORMATS: ['mp3', 'wav', 'ogg', 'm4a'] as const,
  MAX_TEXTURE_SIZE: 4096,
  DEFAULT_FOV: 75,
  MIN_FOV: 30,
  MAX_FOV: 120,
  AUTO_ROTATE_SPEED: 0.5,
  DEFAULT_ZOOM: 1,
  MIN_ZOOM: 0.1,
  MAX_ZOOM: 10,
  HOTSPOT_SIZE: 2,
  HOTSPOT_DISTANCE: 50,
  SCENE_TRANSITION_DURATION: 1000,
  CONTROLS_AUTO_HIDE_DELAY: 3000,
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024
} as const;