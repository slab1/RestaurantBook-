'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Star,
  Info,
  Plus,
  Minus,
  Eye,
  Camera,
  Maximize2,
  Minimize2
} from 'lucide-react';
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
  isSpicy?: number;
  category: string;
  restaurant: string;
  rating?: number;
  reviews?: number;
  preparationTime?: number;
}

interface ARUIBridgeProps {
  isVisible: boolean;
  onClose: () => void;
  selectedItem?: MenuItem | null;
  onAddToCart?: (item: MenuItem, quantity: number) => void;
  onToggleFavorite?: (itemId: string) => void;
  onShare?: (item: MenuItem) => void;
  onStartAR?: (item: MenuItem) => void;
  onQuickView?: (item: MenuItem) => void;
  className?: string;
}

interface ARUIContextType {
  showItemDetails: (item: MenuItem) => void;
  showNutrition: (item: MenuItem) => void;
  showSharing: (item: MenuItem) => void;
  showComparison: (items: MenuItem[]) => void;
  showQuickAdd: (item: MenuItem) => void;
  hideAll: () => void;
  isAnyModalOpen: boolean;
}

const ARUIContext = createContext<ARUIContextType | null>(null);

export const useARUI = () => {
  const context = useContext(ARUIContext);
  if (!context) {
    throw new Error('useARUI must be used within an ARUIBridge');
  }
  return context;
};

const ARUIBridge: React.FC<ARUIBridgeProps> = ({
  isVisible,
  onClose,
  selectedItem,
  onAddToCart,
  onToggleFavorite,
  onShare,
  onStartAR,
  onQuickView,
  className = ''
}) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);
  const [comparisonItems, setComparisonItems] = useState<MenuItem[]>([]);
  const [showNutrition, setShowNutrition] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedItem) {
      setQuantity(1);
      // Check if item is favorited (this would normally come from a state management system)
      setIsFavorited(false);
    }
  }, [selectedItem]);

  const showItemDetails = useCallback((item: MenuItem) => {
    setActiveModal('details');
  }, []);

  const showNutritionModal = useCallback((item: MenuItem) => {
    setActiveModal('nutrition');
  }, []);

  const showSharing = useCallback((item: MenuItem) => {
    setActiveModal('share');
  }, []);

  const showComparison = useCallback((items: MenuItem[]) => {
    setComparisonItems(items);
    setActiveModal('comparison');
  }, []);

  const showQuickAdd = useCallback((item: MenuItem) => {
    setActiveModal('quick-add');
  }, []);

  const hideAll = useCallback(() => {
    setActiveModal(null);
    setComparisonItems([]);
    setShowNutrition(false);
  }, []);

  const handleAddToCart = useCallback((item: MenuItem, qty: number) => {
    onAddToCart?.(item, qty);
    toast({
      title: "Added to Cart",
      description: `${qty}x ${item.name} added to your cart.`,
    });
    hideAll();
  }, [onAddToCart, toast, hideAll]);

  const handleToggleFavorite = useCallback((item: MenuItem) => {
    setIsFavorited(!isFavorited);
    onToggleFavorite?.(item.id);
    toast({
      title: isFavorited ? "Removed from Favorites" : "Added to Favorites",
      description: `${item.name} ${isFavorited ? 'removed from' : 'added to'} your favorites.`,
    });
  }, [isFavorited, onToggleFavorite, toast]);

  const handleShare = useCallback(async (item: MenuItem) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out ${item.name}`,
          text: item.description,
          url: window.location.href
        });
        onShare?.(item);
        toast({
          title: "Shared Successfully",
          description: `${item.name} has been shared.`,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      const shareText = `Check out ${item.name} - ${item.description}`;
      navigator.clipboard.writeText(shareText).then(() => {
        onShare?.(item);
        toast({
          title: "Link Copied",
          description: "Item details copied to clipboard.",
        });
      });
    }
  }, [onShare, toast]);

  const contextValue: ARUIContextType = {
    showItemDetails,
    showNutrition: showNutritionModal,
    showSharing,
    showComparison,
    showQuickAdd,
    hideAll,
    isAnyModalOpen: activeModal !== null
  };

  if (!selectedItem) return null;

  return (
    <ARUIContext.Provider value={contextValue}>
      <div className={`fixed inset-0 z-50 ${className}`}>
        {/* Overlay */}
        <AnimatePresence>
          {(activeModal || isVisible) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={hideAll}
            />
          )}
        </AnimatePresence>

        {/* Quick Actions Bar */}
        {isVisible && !activeModal && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute bottom-4 left-4 right-4"
          >
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedItem.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {selectedItem.description}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-lg font-bold">
                    {selectedItem.currency}{selectedItem.price}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {selectedItem.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{selectedItem.rating}</span>
                        {selectedItem.reviews && (
                          <span className="text-sm text-gray-500">
                            ({selectedItem.reviews})
                          </span>
                        )}
                      </div>
                    )}
                    {selectedItem.preparationTime && (
                      <Badge variant="outline" className="text-xs">
                        {selectedItem.preparationTime} min
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => handleToggleFavorite(selectedItem)}
                      variant="outline"
                      size="sm"
                      className={isFavorited ? 'text-red-500 border-red-200' : ''}
                    >
                      <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                    </Button>

                    <Button
                      onClick={() => onQuickView?.(selectedItem)}
                      variant="outline"
                      size="sm"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>

                    <Button
                      onClick={() => onStartAR?.(selectedItem)}
                      variant="default"
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      View in AR
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Item Details Modal */}
        <AnimatePresence>
          {activeModal === 'details' && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="absolute inset-4 md:inset-8 lg:inset-16 bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedItem.name}</h2>
                    <p className="text-gray-600">{selectedItem.restaurant}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-lg">
                      {selectedItem.currency}{selectedItem.price}
                    </Badge>
                    <Button onClick={hideAll} variant="ghost" size="sm">
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-6">
                    <p className="text-gray-700 leading-relaxed">
                      {selectedItem.description}
                    </p>

                    {/* Ingredients */}
                    <div>
                      <h3 className="font-semibold mb-3">Ingredients</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.ingredients.map((ingredient, index) => (
                          <Badge key={index} variant="outline">
                            {ingredient}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.isVegan && (
                        <Badge className="bg-green-100 text-green-800">🌱 Vegan</Badge>
                      )}
                      {selectedItem.isGlutenFree && (
                        <Badge className="bg-blue-100 text-blue-800">🌾 Gluten-Free</Badge>
                      )}
                      {selectedItem.isSpicy && selectedItem.isSpicy > 0 && (
                        <Badge className="bg-red-100 text-red-800">
                          🌶️ {selectedItem.isSpicy}/3 Spicy
                        </Badge>
                      )}
                    </div>

                    {/* Rating and Reviews */}
                    {selectedItem.rating && (
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Star className="w-5 h-5 text-yellow-500 fill-current" />
                          <span className="font-semibold">{selectedItem.rating}</span>
                        </div>
                        {selectedItem.reviews && (
                          <span className="text-gray-600">
                            {selectedItem.reviews} reviews
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button
                        onClick={() => showNutritionModal(selectedItem)}
                        variant="outline"
                        size="sm"
                      >
                        <Info className="w-4 h-4 mr-2" />
                        Nutrition
                      </Button>
                      <Button
                        onClick={() => handleShare(selectedItem)}
                        variant="outline"
                        size="sm"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>

                    <Button
                      onClick={() => onStartAR?.(selectedItem)}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      View in AR
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nutrition Modal */}
        <AnimatePresence>
          {activeModal === 'nutrition' && selectedItem.nutritionInfo && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="absolute inset-4 md:inset-8 lg:inset-16 bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b">
                  <h2 className="text-2xl font-bold">Nutrition Facts</h2>
                  <Button onClick={hideAll} variant="ghost" size="sm">
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold">{selectedItem.name}</h3>
                      <p className="text-gray-600">Serving Size: 1 plate</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b-2 border-gray-800">
                        <span className="font-bold text-lg">Calories</span>
                        <span className="font-bold text-lg">
                          {selectedItem.nutritionInfo.calories}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total Fat</span>
                          <span>{selectedItem.nutritionInfo.fat}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Carbohydrates</span>
                          <span>{selectedItem.nutritionInfo.carbs}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Protein</span>
                          <span>{selectedItem.nutritionInfo.protein}g</span>
                        </div>
                      </div>

                      <div className="text-xs text-gray-600 mt-4">
                        * Percent Daily Values are based on a 2,000 calorie diet
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Add Modal */}
        <AnimatePresence>
          {activeModal === 'quick-add' && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="absolute inset-4 md:inset-8 bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b">
                  <h2 className="text-2xl font-bold">Add to Cart</h2>
                  <Button onClick={hideAll} variant="ghost" size="sm">
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold">{selectedItem.name}</h3>
                    <p className="text-gray-600 mb-4">{selectedItem.description}</p>
                    <div className="text-2xl font-bold text-orange-600">
                      {selectedItem.currency}{selectedItem.price}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-3">Quantity</label>
                      <div className="flex items-center justify-center space-x-4">
                        <Button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          variant="outline"
                          size="sm"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="text-xl font-semibold w-12 text-center">
                          {quantity}
                        </span>
                        <Button
                          onClick={() => setQuantity(quantity + 1)}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span>Subtotal:</span>
                        <span className="text-lg font-bold">
                          {selectedItem.currency}{(selectedItem.price * quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t p-6">
                  <Button
                    onClick={() => handleAddToCart(selectedItem, quantity)}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-lg py-6"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add {quantity} to Cart
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ARUIContext.Provider>
  );
};

export default ARUIBridge;