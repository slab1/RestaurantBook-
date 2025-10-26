# AR Menu System

A comprehensive Augmented Reality (AR) menu system designed specifically for Nigerian restaurant applications. This system provides immersive 3D food visualization, interactive AR experiences, and mobile-optimized controls for an enhanced dining experience.

## 🌟 Features

### Core Functionality
- **3D Food Visualization**: Realistic 3D models of Nigerian dishes
- **AR Interaction**: Touch and gesture-based interactions in AR mode
- **Mobile Optimization**: Responsive controls and performance optimization
- **Camera Integration**: Real-time camera feed for AR placement
- **Food Preview**: Quick preview system for menu items
- **Nutrition Information**: Detailed nutritional data display
- **Social Features**: Sharing, favorites, and recommendations

### Nigerian Cuisine Support
- **Authentic 3D Models**: Detailed 3D representations of popular Nigerian dishes
- **Cultural Accuracy**: Proper representation of traditional foods
- **Category Organization**: Rice dishes, soups, swallow, grilled items, snacks
- **Ingredient Mapping**: Authentic Nigerian ingredients and preparation methods

### Technical Features
- **Device Compatibility**: Works on modern mobile and desktop devices
- **Performance Optimization**: Automatic quality adjustment based on device capabilities
- **Error Handling**: Comprehensive error handling and fallback systems
- **Analytics Integration**: Built-in usage analytics and performance monitoring
- **Accessibility**: Screen reader support and keyboard navigation

## 🏗️ Architecture

### Component Structure

```
components/ar/
├── ARMenuViewer.tsx          # Main AR menu interface
├── FoodModel3D.tsx           # 3D food model rendering
├── ARInteractionHandler.tsx  # Touch and gesture handling
├── ARMobilController.tsx     # Mobile-specific controls
├── ARUIBridge.tsx            # UI state management
├── ARCameraControls.tsx      # Camera and recording controls
├── ARFoodPreview.tsx         # Quick food preview system
├── ARVisualization.tsx       # Main AR visualization wrapper
├── NigerianFoodModels.tsx    # 3D model definitions
├── ar-menu-index.ts          # Component exports
└── README.md                 # This file
```

### Data Flow

```
ARVisualization (Main)
├── ARMenuViewer (Menu Interface)
│   ├── FoodModel3D (3D Rendering)
│   └── ARInteractionHandler (Input Processing)
├── ARUIBridge (State Management)
├── ARCameraControls (Camera Management)
└── ARFoodPreview (Quick Preview)
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { ARVisualization, generateNigerianMenuItems } from '@/components/ar';

function MyApp() {
  const menuItems = generateNigerianMenuItems();

  const handleAddToCart = (item: MenuItem, quantity: number) => {
    console.log(`Added ${quantity}x ${item.name} to cart`);
  };

  return (
    <ARVisualization
      menuItems={menuItems}
      onAddToCart={handleAddToCart}
      enableAnalytics={true}
    />
  );
}
```

### Advanced Configuration

```typescript
import { 
  ARMenuViewer, 
  createMenuItem,
  ARCameraControls 
} from '@/components/ar';

function CustomARMenu() {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isARActive, setIsARActive] = useState(false);

  const customMenuItems = [
    createMenuItem({
      name: 'Jollof Rice with Chicken',
      description: 'Premium jollof rice served with grilled chicken',
      price: 3500,
      category: 'Rice Dishes',
      restaurant: 'My Restaurant',
      nutritionInfo: {
        calories: 650,
        protein: 35,
        carbs: 85,
        fat: 18
      },
      isSpicy: 1,
      rating: 4.8,
      preparationTime: 45
    })
  ];

  return (
    <div className="h-screen">
      <ARMenuViewer
        menuItems={customMenuItems}
        onAddToCart={(item) => console.log('Add to cart:', item)}
        onClose={() => console.log('Close AR menu')}
      />
    </div>
  );
}
```

## 🎮 AR Interaction Guide

### Touch Gestures

- **Single Tap**: Place 3D model in AR space
- **Double Tap**: Reset model position
- **Pinch**: Scale model (zoom in/out)
- **Two-finger Rotate**: Rotate model
- **Drag**: Move model position
- **Shake**: Reset all transformations

### Mobile Controls

- **Zoom Controls**: Pinch-to-zoom or use zoom buttons
- **Rotation**: Auto-rotate toggle or manual rotation
- **Reset**: Return model to original position and scale
- **Nutrition**: Toggle nutrition information overlay
- **Fullscreen**: Enter/exit fullscreen AR mode

## 📱 Device Compatibility

### Minimum Requirements
- **Camera**: Back-facing camera with at least 720p resolution
- **WebGL**: WebGL 1.0 support
- **JavaScript**: ES2018+ support
- **Memory**: At least 2GB RAM recommended

### Supported Platforms
- **iOS**: Safari 14+, iOS 14+
- **Android**: Chrome 80+, Android 8+
- **Desktop**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Performance Levels

```typescript
const deviceCapabilities = {
  LOW: { maxPolygons: 1000, textureSize: 512 },
  MEDIUM: { maxPolygons: 5000, textureSize: 1024 },
  HIGH: { maxPolygons: 20000, textureSize: 2048 },
  ULTRA: { maxPolygons: 50000, textureSize: 4096 }
};
```

## 🍽️ Nigerian Food Models

### Available Dishes

#### Rice Dishes
- **Jollof Rice**: Classic tomato-based rice
- **Fried Rice**: Stir-fried rice with vegetables
- **Coconut Rice**: Rice cooked in coconut milk
- **Party Jollof**: Premium jollof for special occasions

#### Soups
- **Egusi Soup**: Melon seed soup with vegetables
- **Ogbono Soup**: Wild mango seed soup
- **Pepper Soup**: Spicy soup with meat or fish
- **Okra Soup**: Okra-based soup
- **Banga Soup**: Palm nut soup
- **Afang Soup**: Waterleaf and spinach soup

#### Swallow (Starch-based)
- **Fufu**: Cassava-based swallow
- **Pounded Yam**: Traditional pounded yam
- **Semovita**: Wheat-based swallow
- **Eba**: Cassava flour swallow
- **Amala**: Yam flour swallow

#### Grilled Items
- **Suya**: Spiced grilled meat skewers
- **Grilled Fish**: Fresh fish grilled with spices
- **Grilled Chicken**: Seasoned grilled chicken
- **Assorted Meat**: Mix of different grilled meats

#### Snacks
- **Chin Chin**: Sweet fried dough cubes
- **Puff Puff**: Sweet fried dough balls
- **Samosa**: Triangular fried pastries
- **Meat Pie**: Savory pastry with meat filling

### Custom Food Models

```typescript
import { getFoodModel, validateFoodModel } from '@/components/ar';

// Check if a food model exists
if (validateFoodModel('custom dish')) {
  const model = getFoodModel('custom dish');
  console.log('Model properties:', model);
}

// Add custom food model
NigerianFoodModels['custom dish'] = {
  shape: 'bowl',
  primaryColor: '#D2691E',
  borderColor: '#8B4513',
  texture: 'grainy',
  garnish: {
    color: '#228B22',
    elements: [
      { type: 'pepper', x: -10, y: -5, size: 6 }
    ]
  }
};
```

## 🔧 Configuration Options

### ARVisualization Props

```typescript
interface ARVisualizationProps {
  menuItems: MenuItem[];
  onAddToCart?: (item: MenuItem, quantity: number) => void;
  onClose?: () => void;
  initialMode?: 'menu' | 'preview' | 'fullscreen';
  enableAnalytics?: boolean;
  className?: string;
}
```

### ARMenuViewer Props

```typescript
interface ARMenuViewerProps {
  menuItems: MenuItem[];
  onAddToCart?: (item: MenuItem) => void;
  onClose?: () => void;
  className?: string;
}
```

### Camera Settings

```typescript
interface CameraSettings {
  quality: 'low' | 'medium' | 'high' | 'ultra';
  resolution: '480p' | '720p' | '1080p' | '4k';
  frameRate: 24 | 30 | 60;
  format: 'jpeg' | 'png' | 'webp';
  flash: 'off' | 'on' | 'auto';
  whiteBalance: 'auto' | 'daylight' | 'cloudy' | 'tungsten';
  exposure: number;
  zoom: number;
  focus: number;
}
```

## 📊 Analytics and Monitoring

### Built-in Analytics

The system automatically tracks:
- AR session duration and frequency
- Most viewed food items
- User interaction patterns
- Performance metrics
- Error rates and types

### Performance Monitoring

```typescript
import { createARMenuPerformanceMonitor } from '@/components/ar';

const monitor = createARMenuPerformanceMonitor();

// Track various metrics
monitor.measureModelLoad(loadTime);
monitor.measureRenderTime();
monitor.trackARSession();
monitor.trackPlacement(success);

// Get current metrics
const metrics = monitor.getMetrics();
console.log('Current performance metrics:', metrics);
```

### Custom Analytics

```typescript
// Custom event tracking
if (typeof window !== 'undefined' && (window as any).gtag) {
  (window as any).gtag('event', 'ar_interaction', {
    item_name: 'Jollof Rice',
    interaction_type: 'tap',
    placement_success: true
  });
}
```

## 🎨 Customization

### Styling

The system uses Tailwind CSS classes and can be customized:

```css
/* Custom AR menu styling */
.ar-menu-container {
  @apply bg-gradient-to-br from-orange-50 to-red-50;
}

.food-model-3d {
  @apply shadow-lg rounded-xl;
  filter: drop-shadow(0 0 20px rgba(255, 165, 0, 0.3));
}
```

### Theme Customization

```typescript
// Customize food model colors
NigerianFoodModels['jollof rice'].primaryColor = '#FF6B35';
NigerianFoodModels['jollof rice'].borderColor = '#D32F2F';
```

### Language Localization

```typescript
// Add translations for UI text
const translations = {
  en: {
    'AR Menu': 'AR Menu',
    'View in AR': 'View in AR',
    'Add to Cart': 'Add to Cart'
  },
  ha: {
    'AR Menu': 'AR Menu',
    'View in AR': 'Duba a AR',
    'Add to Cart': 'Saka a cikin Keəewa'
  }
};
```

## 🛠️ Troubleshooting

### Common Issues

#### Camera Permission Denied
```typescript
// Check camera permissions
const checkCameraPermission = async () => {
  try {
    const result = await navigator.permissions.query({ name: 'camera' });
    if (result.state === 'denied') {
      // Show instructions to enable camera
      showCameraInstructions();
    }
  } catch (error) {
    console.error('Permission API not supported');
  }
};
```

#### Poor Performance
```typescript
// Automatically adjust quality based on device
const adjustQuality = (deviceInfo) => {
  if (deviceInfo.performanceLevel === 'low') {
    return {
      quality: 'low',
      maxPolygons: 1000,
      textureSize: 512
    };
  }
  return {
    quality: 'high',
    maxPolygons: 20000,
    textureSize: 2048
  };
};
```

#### Model Loading Errors
```typescript
// Fallback for failed model loading
const handleModelError = (error) => {
  console.error('Model loading failed:', error);
  
  // Show fallback image or placeholder
  setShowFallbackImage(true);
  
  // Retry loading after delay
  setTimeout(() => {
    retryModelLoad();
  }, 2000);
};
```

### Debug Mode

Enable debug mode for detailed logging:

```typescript
// Development environment
if (process.env.NODE_ENV === 'development') {
  window.AR_MENU_DEBUG = true;
  console.log('AR Menu debug mode enabled');
}
```

## 🔒 Privacy and Security

### Data Collection
- No personal data is collected without explicit consent
- Usage analytics are anonymized
- Camera feed is not stored or transmitted

### Camera Privacy
- Camera access is only requested when AR mode is activated
- Users can revoke camera permissions at any time
- Camera feed is not recorded or stored

### Data Storage
- All data processing happens client-side when possible
- User preferences are stored locally
- No sensitive data is transmitted to servers

## 🚀 Deployment

### Production Checklist

- [ ] Enable HTTPS (required for camera access)
- [ ] Configure Content Security Policy
- [ ] Test on target devices
- [ ] Optimize 3D models for performance
- [ ] Set up analytics tracking
- [ ] Implement error reporting
- [ ] Test accessibility features
- [ ] Validate internationalization

### Performance Optimization

```typescript
// Lazy load AR components
const ARVisualization = lazy(() => import('./ARVisualization'));

// Preload critical food models
const preloadModels = async () => {
  const models = ['jollof rice', 'egusi soup', 'chicken suya'];
  await Promise.all(
    models.map(model => preloadFoodModel(model))
  );
};
```

## 🤝 Contributing

### Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Open browser and navigate to the AR menu demo

### Adding New Food Models

1. Add model definition to `NigerianFoodModels.tsx`
2. Include proper colors, textures, and garnish
3. Test the model in AR mode
4. Update documentation

### Code Style

- Use TypeScript for all new files
- Follow existing component patterns
- Add JSDoc comments for public APIs
- Include error handling for all async operations

## 📄 License

This AR Menu System is part of the Nigerian Restaurant Booking Platform and follows the same licensing terms.

## 🆘 Support

For support and questions:
- Check the troubleshooting section above
- Review the component documentation
- Test on supported devices and browsers
- Enable debug mode for detailed error information

---

**Built with ❤️ for Nigerian cuisine and restaurant experiences**