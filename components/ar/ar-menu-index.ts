// AR Menu System - Component Exports
// Comprehensive 3D AR menu system for Nigerian restaurant applications

export { default as ARMenuViewer } from './ARMenuViewer';
export { default as FoodModel3D } from './FoodModel3D';
export { default as ARInteractionHandler } from './ARInteractionHandler';
export { default as ARMobilController } from './ARMobilController';
export { default as ARUIBridge } from './ARUIBridge';
export { default as ARCameraControls } from './ARCameraControls';
export { default as ARFoodPreview } from './ARFoodPreview';
export { default as ARVisualization } from './ARVisualization';

// 3D Models
export { 
  NigerianFoodModels, 
  getFoodModel, 
  getAllFoodNames, 
  getFoodsByCategory,
  validateFoodModel,
  type FoodModel 
} from './NigerianFoodModels';

// Types
export type { MenuItem } from './ARMenuViewer';
export type { CameraSettings } from './ARCameraControls';
export type { DeviceCapabilities } from './ARVisualization';

// Feature flags
export const AR_MENU_FEATURES = {
  FOOD_MODELS: true,
  INTERACTION_HANDLER: true,
  MOBILE_CONTROLS: true,
  CAMERA_CONTROLS: true,
  UI_BRIDGE: true,
  FOOD_PREVIEW: true,
  VISUALIZATION: true,
  NIGERIAN_FOODS: true,
  NUTRITION_INFO: true,
  FAVORITES: true,
  SHARING: true,
  ANALYTICS: true,
  HAPTIC_FEEDBACK: true,
  FULLSCREEN: true,
  PERFORMANCE_MONITORING: process.env.NODE_ENV === 'development'
};

// Component status
export const AR_MENU_COMPONENT_STATUS = {
  'ARMenuViewer': 'Production Ready',
  'FoodModel3D': 'Production Ready', 
  'ARInteractionHandler': 'Production Ready',
  'ARMobilController': 'Production Ready',
  'ARUIBridge': 'Production Ready',
  'ARCameraControls': 'Production Ready',
  'ARFoodPreview': 'Production Ready',
  'ARVisualization': 'Production Ready',
  'NigerianFoodModels': 'Production Ready'
};

// Utility functions for menu system setup
export const createMenuItem = (data: {
  name: string;
  description: string;
  price: number;
  currency?: string;
  category: string;
  restaurant: string;
  ingredients?: string[];
  nutritionInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isSpicy?: number;
  rating?: number;
  reviews?: number;
  preparationTime?: number;
  temperature?: 'hot' | 'warm' | 'cold';
  difficulty?: 'easy' | 'medium' | 'hard';
  cuisine?: string;
}): MenuItem => {
  return {
    id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: data.name,
    description: data.description,
    price: data.price,
    currency: data.currency || '$',
    category: data.category,
    restaurant: data.restaurant,
    image: `/images/menu/${data.name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
    ingredients: data.ingredients || [],
    nutritionInfo: data.nutritionInfo,
    isVegan: data.isVegan || false,
    isGlutenFree: data.isGlutenFree || false,
    isSpicy: data.isSpicy || 0,
    rating: data.rating,
    reviews: data.reviews,
    preparationTime: data.preparationTime,
    temperature: data.temperature,
    difficulty: data.difficulty,
    cuisine: data.cuisine
  };
};

// Generate sample Nigerian menu items
export const generateNigerianMenuItems = (): MenuItem[] => {
  return [
    createMenuItem({
      name: 'Jollof Rice',
      description: 'Classic Nigerian jollof rice cooked with tomatoes, peppers, and aromatic spices',
      price: 2500,
      category: 'Rice Dishes',
      restaurant: 'Nigerian Kitchen',
      ingredients: ['Rice', 'Tomatoes', 'Peppers', 'Onions', 'Spices', 'Chicken Stock'],
      nutritionInfo: {
        calories: 450,
        protein: 12,
        carbs: 78,
        fat: 8
      },
      isVegan: false,
      isSpicy: 1,
      rating: 4.5,
      reviews: 156,
      preparationTime: 45,
      temperature: 'hot',
      cuisine: 'Nigerian'
    }),
    createMenuItem({
      name: 'Egusi Soup',
      description: 'Rich soup made with ground melon seeds, vegetables, and assorted meats',
      price: 3200,
      category: 'Soups',
      restaurant: 'Nigerian Kitchen',
      ingredients: ['Egusi', 'Spinach', 'Palm Oil', 'Beef', 'Fish', 'Crayfish'],
      nutritionInfo: {
        calories: 380,
        protein: 25,
        carbs: 15,
        fat: 22
      },
      isVegan: false,
      isSpicy: 1,
      rating: 4.7,
      reviews: 203,
      preparationTime: 60,
      temperature: 'hot',
      cuisine: 'Nigerian'
    }),
    createMenuItem({
      name: 'Chicken Suya',
      description: 'Grilled chicken skewers coated in spicy peanut spice mixture',
      price: 2800,
      category: 'Grilled',
      restaurant: 'Nigerian Kitchen',
      ingredients: ['Chicken', 'Peanuts', 'Spices', 'Ginger', 'Garlic'],
      nutritionInfo: {
        calories: 320,
        protein: 35,
        carbs: 8,
        fat: 18
      },
      isVegan: false,
      isSpicy: 2,
      rating: 4.6,
      reviews: 178,
      preparationTime: 25,
      temperature: 'hot',
      cuisine: 'Nigerian'
    }),
    createMenuItem({
      name: 'Pounded Yam',
      description: 'Smooth, stretchy yam served with soup of your choice',
      price: 1800,
      category: 'Swallow',
      restaurant: 'Nigerian Kitchen',
      ingredients: ['Yam', 'Water', 'Salt'],
      nutritionInfo: {
        calories: 220,
        protein: 3,
        carbs: 52,
        fat: 0.5
      },
      isVegan: true,
      isGlutenFree: true,
      isSpicy: 0,
      rating: 4.2,
      reviews: 92,
      preparationTime: 30,
      temperature: 'warm',
      cuisine: 'Nigerian'
    }),
    createMenuItem({
      name: 'Fish Pepper Soup',
      description: 'Spicy fish soup with traditional Nigerian spices and herbs',
      price: 3500,
      category: 'Soups',
      restaurant: 'Nigerian Kitchen',
      ingredients: ['Fish', 'Pepper Soup Spices', 'Uziza', 'Calabash Nutmeg', 'Crayfish'],
      nutritionInfo: {
        calories: 280,
        protein: 28,
        carbs: 6,
        fat: 15
      },
      isVegan: false,
      isSpicy: 2,
      rating: 4.8,
      reviews: 145,
      preparationTime: 40,
      temperature: 'hot',
      cuisine: 'Nigerian'
    }),
    createMenuItem({
      name: 'Chin Chin',
      description: 'Sweet, crunchy Nigerian pastry cubes perfect as a snack',
      price: 1200,
      category: 'Snacks',
      restaurant: 'Nigerian Kitchen',
      ingredients: ['Flour', 'Sugar', 'Butter', 'Eggs', 'Nutmeg'],
      nutritionInfo: {
        calories: 380,
        protein: 6,
        carbs: 68,
        fat: 12
      },
      isVegan: false,
      isSpicy: 0,
      rating: 4.4,
      reviews: 87,
      preparationTime: 20,
      temperature: 'cold',
      cuisine: 'Nigerian'
    })
  ];
};

// Performance monitoring for AR menu system
export const createARMenuPerformanceMonitor = () => {
  const metrics = {
    modelLoadTime: 0,
    renderTime: 0,
    interactionLatency: 0,
    memoryUsage: 0,
    batteryUsage: 0,
    arSessions: 0,
    successfulPlacements: 0,
    failedPlacements: 0,
    mostViewedItems: [] as string[],
    userEngagement: 0
  };

  const startTime = performance.now();
  let frameCount = 0;
  let lastFrameTime = performance.now();

  const measureModelLoad = (loadTime: number) => {
    metrics.modelLoadTime = loadTime;
  };

  const measureRenderTime = () => {
    const now = performance.now();
    metrics.renderTime = now - lastFrameTime;
    lastFrameTime = now;
    
    frameCount++;
    if (frameCount % 60 === 0) {
      // Calculate FPS every 60 frames
      const fps = 60000 / (now - (lastFrameTime - 60000));
      metrics.renderTime = fps;
    }
  };

  const measureInteractionLatency = (latency: number) => {
    metrics.interactionLatency = latency;
  };

  const measureMemory = () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      metrics.memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024);
    }
  };

  const trackARSession = () => {
    metrics.arSessions++;
  };

  const trackPlacement = (success: boolean) => {
    if (success) {
      metrics.successfulPlacements++;
    } else {
      metrics.failedPlacements++;
    }
  };

  const trackItemView = (itemName: string) => {
    const existingIndex = metrics.mostViewedItems.indexOf(itemName);
    if (existingIndex >= 0) {
      metrics.mostViewedItems.splice(existingIndex, 1);
    }
    metrics.mostViewedItems.unshift(itemName);
    metrics.mostViewedItems = metrics.mostViewedItems.slice(0, 10);
  };

  const measureBatteryUsage = (level: number) => {
    metrics.batteryUsage = level;
  };

  const getMetrics = () => ({
    ...metrics,
    loadTime: performance.now() - startTime
  });

  return {
    measureModelLoad,
    measureRenderTime,
    measureInteractionLatency,
    measureMemory,
    trackARSession,
    trackPlacement,
    trackItemView,
    measureBatteryUsage,
    getMetrics
  };
};

// Error handling for AR menu system
export const createARMenuErrorHandler = (componentName: string) => {
  const logError = (error: Error, context?: string) => {
    console.error(`[AR Menu - ${componentName}] Error:`, error);
    
    // Send to analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        custom_map: {
          component: componentName,
          context: context || 'unknown',
          system: 'AR Menu'
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

// AR Menu System Constants
export const AR_MENU_CONSTANTS = {
  SUPPORTED_FOOD_MODELS: [
    'jollof rice',
    'egusi soup',
    'chicken suya',
    'pounded yam',
    'fish pepper soup',
    'chin chin'
  ],
  DEFAULT_MODEL_SCALE: 1.0,
  MIN_MODEL_SCALE: 0.5,
  MAX_MODEL_SCALE: 2.0,
  DEFAULT_ROTATION_SPEED: 1.0,
  INTERACTION_TIMEOUT: 5000,
  MODEL_LOAD_TIMEOUT: 10000,
  CAMERA_RESOLUTIONS: {
    LOW: { width: 640, height: 480 },
    MEDIUM: { width: 1280, height: 720 },
    HIGH: { width: 1920, height: 1080 },
    ULTRA: { width: 3840, height: 2160 }
  },
  PERFORMANCE_LEVELS: {
    LOW: { maxPolygons: 1000, textureSize: 512 },
    MEDIUM: { maxPolygons: 5000, textureSize: 1024 },
    HIGH: { maxPolygons: 20000, textureSize: 2048 },
    ULTRA: { maxPolygons: 50000, textureSize: 4096 }
  }
};

export default {
  ARMenuViewer,
  FoodModel3D,
  ARInteractionHandler,
  ARMobilController,
  ARUIBridge,
  ARCameraControls,
  ARFoodPreview,
  ARVisualization,
  NigerianFoodModels,
  FEATURES: AR_MENU_FEATURES,
  STATUS: AR_MENU_COMPONENT_STATUS,
  CONSTANTS: AR_MENU_CONSTANTS,
  UTILS: {
    createMenuItem,
    generateNigerianMenuItems,
    createPerformanceMonitor: createARMenuPerformanceMonitor,
    createErrorHandler: createARMenuErrorHandler
  }
};