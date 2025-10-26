'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Info, 
  ShoppingCart,
  Play,
  Pause,
  Maximize2,
  Volume2
} from 'lucide-react';
import FoodModel3D from './FoodModel3D';
import ARInteractionHandler from './ARInteractionHandler';
import ARMobilController from './ARMobilController';
import { useToast } from '@/hooks/use-toast';

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
  isSpicy?: number; // 0-3 scale
  category: string;
  restaurant: string;
}

interface ARMenuViewerProps {
  menuItems: MenuItem[];
  onAddToCart?: (item: MenuItem) => void;
  onClose?: () => void;
  className?: string;
}

const ARMenuViewer: React.FC<ARMenuViewerProps> = ({
  menuItems,
  onAddToCart,
  onClose,
  className = ''
}) => {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isARActive, setIsARActive] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [modelPosition, setModelPosition] = useState({ x: 0, y: 0, z: 0 });
  const [modelRotation, setModelRotation] = useState({ x: 0, y: 0, z: 0 });
  const [modelScale, setModelScale] = useState(1);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [showNutrition, setShowNutrition] = useState(false);
  const { toast } = useToast();

  const arContainerRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setCameraPermission(result.state);
      
      result.addEventListener('change', () => {
        setCameraPermission(result.state);
      });
    } catch (error) {
      console.log('Permission API not supported');
      setCameraPermission('prompt');
    }
  };

  const startARExperience = async () => {
    if (cameraPermission === 'denied') {
      toast({
        title: "Camera Permission Required",
        description: "Please enable camera access in your browser settings to use AR features.",
        variant: "destructive",
      });
      return;
    }

    try {
      await initializeCamera();
      setIsARActive(true);
      toast({
        title: "AR Experience Started",
        description: "Point your camera at a flat surface to place the food model.",
      });
    } catch (error) {
      toast({
        title: "AR Initialization Failed",
        description: "Unable to start AR experience. Please check your camera permissions.",
        variant: "destructive",
      });
    }
  };

  const initializeCamera = async () => {
    if (cameraRef.current) {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      cameraRef.current.srcObject = stream;
      await cameraRef.current.play();
    }
  };

  const stopARExperience = () => {
    setIsARActive(false);
    if (cameraRef.current?.srcObject) {
      const tracks = (cameraRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    toast({
      title: "AR Experience Ended",
      description: "Thank you for using the AR menu!",
    });
  };

  const resetModelPosition = () => {
    setModelPosition({ x: 0, y: 0, z: 0 });
    setModelRotation({ x: 0, y: 0, z: 0 });
    setModelScale(1);
    toast({
      title: "Model Reset",
      description: "Food model position has been reset.",
    });
  };

  return (
    <div className={`relative w-full h-screen bg-black ${className}`}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              ← Back
            </Button>
            <h1 className="text-xl font-bold text-white">AR Menu</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            {isARActive && (
              <>
                <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                  AR Active
                </Badge>
                <Button
                  onClick={() => setIsAutoRotating(!isAutoRotating)}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  {isAutoRotating ? <Pause size={16} /> : <Play size={16} />}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Camera Feed / 3D View */}
      <div 
        ref={arContainerRef}
        className="relative w-full h-full"
      >
        {isARActive ? (
          <>
            {/* Camera Feed */}
            <video
              ref={cameraRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            
            {/* 3D Model Overlay */}
            <FoodModel3D
              item={selectedItem}
              position={modelPosition}
              rotation={modelRotation}
              scale={modelScale}
              autoRotate={isAutoRotating}
              isARMode={true}
              className="absolute inset-0 pointer-events-none"
            />

            {/* AR Interaction Handler */}
            <ARInteractionHandler
              onTap={(position) => {
                // Handle tap to place model
                setModelPosition(position);
              }}
              onPinch={(scale) => {
                setModelScale(scale);
              }}
              onRotate={(rotation) => {
                setModelRotation(rotation);
              }}
              className="absolute inset-0"
            />
          </>
        ) : (
          // Static 3D View
          <div className="w-full h-full bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
            {selectedItem ? (
              <FoodModel3D
                item={selectedItem}
                className="w-96 h-96"
              />
            ) : (
              <div className="text-center p-8">
                <div className="w-24 h-24 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                  <Camera className="w-12 h-12 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Select a Food Item
                </h3>
                <p className="text-gray-600 mb-6">
                  Choose a menu item to view its 3D model and try AR experience
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile AR Controls */}
      {isARActive && (
        <ARMobilController
          onZoomIn={() => setModelScale(prev => Math.min(prev + 0.1, 2))}
          onZoomOut={() => setModelScale(prev => Math.max(prev - 0.1, 0.5))}
          onReset={resetModelPosition}
          onToggleNutrition={() => setShowNutrition(!showNutrition)}
          className="absolute bottom-4 left-4 right-4 z-50"
        />
      )}

      {/* Menu Items Grid */}
      <AnimatePresence>
        {!isARActive && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="absolute bottom-0 left-0 right-0 h-1/2 bg-white rounded-t-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Menu Items</h2>
                <Button
                  onClick={startARExperience}
                  disabled={cameraPermission === 'denied'}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Start AR
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {menuItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all ${
                        selectedItem?.id === item.id 
                          ? 'ring-2 ring-orange-500 shadow-lg' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedItem(item)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-16 h-16 bg-orange-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                            <span className="text-2xl">🍽️</span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                            <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                              {item.description}
                            </p>
                            
                            <div className="flex items-center justify-between mt-2">
                              <span className="font-bold text-orange-600">
                                {item.currency}{item.price}
                              </span>
                              
                              <div className="flex items-center space-x-1">
                                {item.isVegan && (
                                  <Badge variant="secondary" className="text-xs">
                                    🌱 Vegan
                                  </Badge>
                                )}
                                {item.isSpicy && item.isSpicy > 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    🌶️ {item.isSpicy}/3
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {selectedItem?.id === item.id && onAddToCart && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToCart(item);
                            }}
                            className="w-full mt-3 bg-orange-600 hover:bg-orange-700"
                            size="sm"
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Add to Cart
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nutrition Info Overlay */}
      <AnimatePresence>
        {showNutrition && selectedItem?.nutritionInfo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-20 right-4 z-50 bg-white rounded-lg shadow-lg p-4 max-w-xs"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Nutrition Facts</h3>
              <Button
                onClick={() => setShowNutrition(false)}
                variant="ghost"
                size="sm"
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Calories</span>
                <span className="font-semibold">{selectedItem.nutritionInfo.calories}</span>
              </div>
              <div className="flex justify-between">
                <span>Protein</span>
                <span className="font-semibold">{selectedItem.nutritionInfo.protein}g</span>
              </div>
              <div className="flex justify-between">
                <span>Carbs</span>
                <span className="font-semibold">{selectedItem.nutritionInfo.carbs}g</span>
              </div>
              <div className="flex justify-between">
                <span>Fat</span>
                <span className="font-semibold">{selectedItem.nutritionInfo.fat}g</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Panel for non-AR mode */}
      {!isARActive && selectedItem && (
        <div className="absolute top-20 right-4 z-40 bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Button
              onClick={() => setModelScale(prev => Math.min(prev + 0.1, 2))}
              variant="outline"
              size="sm"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setModelScale(prev => Math.max(prev - 0.1, 0.5))}
              variant="outline"
              size="sm"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              onClick={resetModelPosition}
              variant="outline"
              size="sm"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
          
          <Button
            onClick={() => setShowNutrition(!showNutrition)}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Info className="w-4 h-4 mr-2" />
            Nutrition Info
          </Button>
        </div>
      )}

      {/* Camera Permission Modal */}
      {cameraPermission === 'denied' && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <Card className="max-w-md mx-4">
            <CardContent className="p-6 text-center">
              <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Camera Access Required</h3>
              <p className="text-gray-600 mb-4">
                To use AR features, please enable camera access in your browser settings.
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => window.location.reload()}
                  className="w-full"
                >
                  Refresh Page
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="w-full"
                >
                  Continue Without AR
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ARMenuViewer;