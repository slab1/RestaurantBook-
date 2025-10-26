'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Move3D, 
  RotateCw,
  Info,
  Maximize2,
  Minimize2,
  Smartphone,
  Camera,
  Settings,
  Home,
  Grid3X3
} from 'lucide-react';

interface ARMobilControllerProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onReset?: () => void;
  onToggleNutrition?: () => void;
  onToggleFullscreen?: () => void;
  onToggleGrid?: () => void;
  onToggleCamera?: () => void;
  onHome?: () => void;
  currentScale?: number;
  isFullscreen?: boolean;
  showGrid?: boolean;
  cameraEnabled?: boolean;
  className?: string;
}

const ARMobilController: React.FC<ARMobilControllerProps> = ({
  onZoomIn,
  onZoomOut,
  onReset,
  onToggleNutrition,
  onToggleFullscreen,
  onToggleGrid,
  onToggleCamera,
  onHome,
  currentScale = 1,
  isFullscreen = false,
  showGrid = false,
  cameraEnabled = true,
  className = ''
}) => {
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hapticFeedback, setHapticFeedback] = useState(true);

  // Haptic feedback function
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (hapticFeedback && 'vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      navigator.vibrate(patterns[type]);
    }
  };

  const handleZoomIn = () => {
    triggerHaptic('light');
    onZoomIn?.();
  };

  const handleZoomOut = () => {
    triggerHaptic('light');
    onZoomOut?.();
  };

  const handleReset = () => {
    triggerHaptic('medium');
    onReset?.();
  };

  const handleToggleNutrition = () => {
    triggerHaptic('light');
    onToggleNutrition?.();
  };

  const handleToggleFullscreen = () => {
    triggerHaptic('medium');
    onToggleFullscreen?.();
  };

  const handleToggleGrid = () => {
    triggerHaptic('light');
    onToggleGrid?.();
  };

  const handleToggleCamera = () => {
    triggerHaptic('light');
    onToggleCamera?.();
  };

  const handleHome = () => {
    triggerHaptic('medium');
    onHome?.();
  };

  // Scale indicator
  const getScaleLevel = (scale: number): { level: string; color: string } => {
    if (scale < 0.7) return { level: 'Far', color: 'text-blue-400' };
    if (scale < 1.0) return { level: 'Normal', color: 'text-green-400' };
    if (scale < 1.3) return { level: 'Close', color: 'text-yellow-400' };
    return { level: 'Very Close', color: 'text-red-400' };
  };

  const scaleInfo = getScaleLevel(currentScale);

  return (
    <>
      {/* Main Control Bar */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`bg-black/80 backdrop-blur-lg rounded-2xl p-4 ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-orange-400" />
            <span className="text-white font-medium">AR Controls</span>
            <Badge variant="secondary" className="text-xs">
              {scaleInfo.level}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Camera Status */}
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${cameraEnabled ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-xs text-white/70">Camera</span>
            </div>
            
            <Button
              onClick={() => setIsCollapsed(!isCollapsed)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              {isCollapsed ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-4"
            >
              {/* Scale Indicator */}
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-sm">View Scale</span>
                  <span className={`text-sm font-medium ${scaleInfo.color}`}>
                    {(currentScale * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <motion.div
                    className={`h-2 rounded-full ${scaleInfo.color.replace('text-', 'bg-')}`}
                    style={{ width: `${Math.min(currentScale * 50, 100)}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(currentScale * 50, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-white/60 mt-1">
                  <span>0.5x</span>
                  <span>1.0x</span>
                  <span>2.0x</span>
                </div>
              </div>

              {/* Primary Controls */}
              <div className="flex items-center justify-center space-x-3">
                <Button
                  onClick={handleZoomOut}
                  variant="outline"
                  size="lg"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex-1"
                >
                  <ZoomOut className="w-5 h-5 mr-2" />
                  Zoom Out
                </Button>

                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="lg"
                  className="bg-orange-600 border-orange-500 text-white hover:bg-orange-700 flex-1"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reset
                </Button>

                <Button
                  onClick={handleZoomIn}
                  variant="outline"
                  size="lg"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex-1"
                >
                  <ZoomIn className="w-5 h-5 mr-2" />
                  Zoom In
                </Button>
              </div>

              {/* Secondary Controls */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleToggleNutrition}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Info className="w-4 h-4 mr-2" />
                  Nutrition
                </Button>

                <Button
                  onClick={() => setShowAdvancedControls(!showAdvancedControls)}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  More
                </Button>
              </div>

              {/* Advanced Controls */}
              <AnimatePresence>
                {showAdvancedControls && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-3 pt-3 border-t border-white/20"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={handleToggleGrid}
                        variant="outline"
                        size="sm"
                        className={`${showGrid ? 'bg-blue-600 border-blue-500' : 'bg-white/10 border-white/20'} text-white hover:bg-white/20`}
                      >
                        <Grid3X3 className="w-4 h-4 mr-2" />
                        Grid
                      </Button>

                      <Button
                        onClick={handleToggleCamera}
                        variant="outline"
                        size="sm"
                        className={`${!cameraEnabled ? 'bg-red-600 border-red-500' : 'bg-white/10 border-white/20'} text-white hover:bg-white/20`}
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Camera
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      <Button
                        onClick={handleToggleFullscreen}
                        variant="outline"
                        size="sm"
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        <Move3D className="w-4 h-4 mr-2" />
                        Fullscreen Mode
                      </Button>
                    </div>

                    {/* Haptic Feedback Toggle */}
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm">Haptic Feedback</span>
                      <Button
                        onClick={() => setHapticFeedback(!hapticFeedback)}
                        variant="ghost"
                        size="sm"
                        className={`${hapticFeedback ? 'text-green-400' : 'text-white/60'}`}
                      >
                        {hapticFeedback ? 'On' : 'Off'}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quick Actions */}
              <div className="flex justify-center space-x-2 pt-2 border-t border-white/20">
                <Button
                  onClick={handleHome}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Menu
                </Button>
                
                <Button
                  onClick={() => setShowAdvancedControls(false)}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  Done
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Floating Action Buttons (when collapsed) */}
      <AnimatePresence>
        {isCollapsed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-20 right-4 z-50 flex flex-col space-y-3"
          >
            {/* Primary Action - Reset */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                onClick={handleReset}
                className="w-14 h-14 rounded-full bg-orange-600 hover:bg-orange-700 shadow-lg"
                size="lg"
              >
                <RotateCcw className="w-6 h-6" />
              </Button>
            </motion.div>

            {/* Secondary Actions */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col space-y-2"
            >
              <Button
                onClick={handleZoomIn}
                variant="outline"
                className="w-12 h-12 rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                size="lg"
              >
                <ZoomIn className="w-5 h-5" />
              </Button>

              <Button
                onClick={handleZoomOut}
                variant="outline"
                className="w-12 h-12 rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                size="lg"
              >
                <ZoomOut className="w-5 h-5" />
              </Button>

              <Button
                onClick={() => setShowAdvancedControls(!showAdvancedControls)}
                variant="outline"
                className="w-12 h-12 rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                size="lg"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gesture Hints Overlay */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
        className="absolute bottom-32 left-4 right-4 text-center pointer-events-none"
      >
        <div className="bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-white/60 rounded-full" />
              <span>Tap</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-white/60 rounded-full" />
              <span>Pinch</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-white/60 rounded-full" />
              <span>Drag</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-white/60 rounded-full" />
              <span>Shake</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Performance Monitor (Development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 right-4 bg-black/70 text-white text-xs p-2 rounded font-mono">
          <div>Scale: {currentScale.toFixed(2)}</div>
          <div>Controls: {isCollapsed ? 'Collapsed' : 'Expanded'}</div>
          <div>Advanced: {showAdvancedControls ? 'Open' : 'Closed'}</div>
          <div>Haptics: {hapticFeedback ? 'Enabled' : 'Disabled'}</div>
        </div>
      )}

      {/* Accessibility Announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {`AR controls ${isCollapsed ? 'collapsed' : 'expanded'}. Current scale: ${(currentScale * 100).toFixed(0)} percent. ${showAdvancedControls ? 'Advanced controls visible' : 'Advanced controls hidden'}.`}
      </div>
    </>
  );
};

export default ARMobilController;