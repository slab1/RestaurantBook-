'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Eye, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Info,
  ShoppingCart,
  Heart,
  Star,
  Clock,
  ChefHat,
  Thermometer,
  Leaf
} from 'lucide-react';
import FoodModel3D from './FoodModel3D';
import { getFoodModel } from './NigerianFoodModels';

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

interface ARFoodPreviewProps {
  items: MenuItem[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onAddToCart?: (item: MenuItem) => void;
  onStartAR?: (item: MenuItem) => void;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
}

const ARFoodPreview: React.FC<ARFoodPreviewProps> = ({
  items,
  currentIndex,
  onClose,
  onNext,
  onPrevious,
  onAddToCart,
  onStartAR,
  autoPlay = false,
  autoPlayInterval = 5000,
  className = ''
}) => {
  const [selectedItem, setSelectedItem] = useState<MenuItem>(items[currentIndex]);
  const [isRotating, setIsRotating] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showNutrition, setShowNutrition] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [previewMode, setPreviewMode] = useState<'3d' | 'nutrition' | 'details'>('3d');
  const [rotation, setRotation] = useState(0);

  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const rotationRef = useRef<number>(0);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    setSelectedItem(items[currentIndex]);
    setIsRotating(true);
    setZoomLevel(1);
    setShowNutrition(false);
    setPreviewMode('3d');
    setRotation(0);
  }, [currentIndex, items]);

  useEffect(() => {
    if (autoPlay) {
      autoPlayRef.current = setInterval(() => {
        onNext();
      }, autoPlayInterval);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [autoPlay, autoPlayInterval, onNext]);

  useEffect(() => {
    if (isRotating && previewMode === '3d') {
      startRotation();
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRotating, previewMode]);

  const startRotation = () => {
    const animate = () => {
      rotationRef.current += 1;
      setRotation(rotationRef.current);
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
  };

  const getTemperatureColor = (temperature?: string) => {
    switch (temperature) {
      case 'hot': return 'text-red-500';
      case 'warm': return 'text-orange-500';
      case 'cold': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getTemperatureIcon = (temperature?: string) => {
    switch (temperature) {
      case 'hot': return '🔥';
      case 'warm': return '🌡️';
      case 'cold': return '❄️';
      default: return '🌡️';
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getSpicyLevel = (spicy?: number) => {
    if (!spicy) return null;
    const peppers = '🌶️'.repeat(spicy);
    return peppers;
  };

  if (!selectedItem || items.length === 0) {
    return null;
  }

  return (
    <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 ${className}`}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-white">Food Preview</h1>
          </div>

          <div className="flex items-center space-x-2">
            {/* Preview Mode Toggle */}
            <div className="flex items-center space-x-1 bg-white/10 rounded-lg p-1">
              <Button
                onClick={() => setPreviewMode('3d')}
                variant={previewMode === '3d' ? 'default' : 'ghost'}
                size="sm"
                className="text-white"
              >
                <Eye className="w-4 h-4 mr-1" />
                3D
              </Button>
              <Button
                onClick={() => setPreviewMode('details')}
                variant={previewMode === 'details' ? 'default' : 'ghost'}
                size="sm"
                className="text-white"
              >
                <Info className="w-4 h-4 mr-1" />
                Info
              </Button>
            </div>

            {/* Navigation Counter */}
            <Badge variant="secondary" className="text-white">
              {currentIndex + 1} / {items.length}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-full pt-16">
        {/* 3D Preview / Details Panel */}
        <div className="flex-1 relative">
          <AnimatePresence mode="wait">
            {previewMode === '3d' ? (
              <motion.div
                key="3d-preview"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="h-full flex items-center justify-center p-8"
              >
                <div className="relative w-full max-w-md">
                  {/* 3D Food Model */}
                  <div className="relative">
                    <FoodModel3D
                      item={selectedItem}
                      scale={zoomLevel}
                      autoRotate={false}
                      isARMode={false}
                      className="w-full h-80 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl"
                    />
                    
                    {/* 3D Controls Overlay */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center justify-between bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
                        <Button
                          onClick={() => setIsRotating(!isRotating)}
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20"
                        >
                          <RotateCw className={`w-4 h-4 ${isRotating ? 'animate-spin' : ''}`} />
                        </Button>

                        <Button
                          onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.2))}
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20"
                        >
                          <ZoomOut className="w-4 h-4" />
                        </Button>

                        <span className="text-white text-sm font-medium">
                          {(zoomLevel * 100).toFixed(0)}%
                        </span>

                        <Button
                          onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.2))}
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20"
                        >
                          <ZoomIn className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="details-preview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full overflow-y-auto p-8"
              >
                <div className="max-w-2xl mx-auto space-y-6">
                  {/* Item Header */}
                  <div className="text-center">
                    <h2 className="text-3xl font-bold mb-2">{selectedItem.name}</h2>
                    <p className="text-gray-600 mb-4">{selectedItem.description}</p>
                    
                    <div className="flex items-center justify-center space-x-4">
                      <Badge variant="secondary" className="text-xl font-bold">
                        {selectedItem.currency}{selectedItem.price}
                      </Badge>
                      
                      {selectedItem.rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="w-5 h-5 text-yellow-500 fill-current" />
                          <span className="font-semibold">{selectedItem.rating}</span>
                          {selectedItem.reviews && (
                            <span className="text-gray-500">({selectedItem.reviews})</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    {selectedItem.preparationTime && (
                      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                        <Clock className="w-5 h-5 text-blue-500" />
                        <span>{selectedItem.preparationTime} min prep</span>
                      </div>
                    )}
                    
                    {selectedItem.temperature && (
                      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                        <Thermometer className={`w-5 h-5 ${getTemperatureColor(selectedItem.temperature)}`} />
                        <span className={getTemperatureColor(selectedItem.temperature)}>
                          {getTemperatureIcon(selectedItem.temperature)} {selectedItem.temperature}
                        </span>
                      </div>
                    )}
                    
                    {selectedItem.difficulty && (
                      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                        <ChefHat className={`w-5 h-5 ${getDifficultyColor(selectedItem.difficulty)}`} />
                        <span className={getDifficultyColor(selectedItem.difficulty)}>
                          {selectedItem.difficulty} to make
                        </span>
                      </div>
                    )}
                    
                    {selectedItem.cuisine && (
                      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                        <span className="text-lg">🍽️</span>
                        <span>{selectedItem.cuisine}</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.isVegan && (
                      <Badge className="bg-green-100 text-green-800">
                        <Leaf className="w-3 h-3 mr-1" />
                        Vegan
                      </Badge>
                    )}
                    {selectedItem.isGlutenFree && (
                      <Badge className="bg-blue-100 text-blue-800">
                        🌾 Gluten-Free
                      </Badge>
                    )}
                    {selectedItem.isSpicy && selectedItem.isSpicy > 0 && (
                      <Badge className="bg-red-100 text-red-800">
                        {getSpicyLevel(selectedItem.isSpicy)} {selectedItem.isSpicy}/3 Spicy
                      </Badge>
                    )}
                  </div>

                  {/* Ingredients */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedItem.ingredients.map((ingredient, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full" />
                          <span className="text-sm">{ingredient}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Nutrition */}
                  {selectedItem.nutritionInfo && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold">Nutrition Facts</h3>
                        <Button
                          onClick={() => setShowNutrition(!showNutrition)}
                          variant="outline"
                          size="sm"
                        >
                          {showNutrition ? 'Hide' : 'Show'} Details
                        </Button>
                      </div>

                      <AnimatePresence>
                        {showNutrition ? (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-gray-50 rounded-lg p-4"
                          >
                            <div className="grid grid-cols-2 gap-4 text-sm">
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
                        ) : (
                          <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <span className="text-sm text-gray-600">
                              {selectedItem.nutritionInfo.calories} calories
                            </span>
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Panel */}
        <div className="w-80 bg-white shadow-xl overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Item Info */}
            <div>
              <h3 className="text-lg font-semibold mb-2">{selectedItem.name}</h3>
              <p className="text-gray-600 text-sm mb-3">{selectedItem.restaurant}</p>
              <div className="text-2xl font-bold text-orange-600">
                {selectedItem.currency}{selectedItem.price}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => onStartAR?.(selectedItem)}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Eye className="w-4 h-4 mr-2" />
                View in AR
              </Button>

              <Button
                onClick={() => onAddToCart?.(selectedItem)}
                variant="outline"
                className="w-full"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>

              <Button
                onClick={() => setIsFavorited(!isFavorited)}
                variant="outline"
                className={`w-full ${isFavorited ? 'text-red-500 border-red-200' : ''}`}
              >
                <Heart className={`w-4 h-4 mr-2 ${isFavorited ? 'fill-current' : ''}`} />
                {isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
              </Button>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                onClick={onPrevious}
                disabled={currentIndex === 0}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              
              <div className="flex space-x-1">
                {items.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentIndex ? 'bg-orange-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              <Button
                onClick={onNext}
                disabled={currentIndex === items.length - 1}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ARFoodPreview;