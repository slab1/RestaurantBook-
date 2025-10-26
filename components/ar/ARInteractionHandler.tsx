'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface TouchPoint {
  x: number;
  y: number;
  identifier: number;
}

interface GestureData {
  scale: number;
  rotation: number;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
}

interface ARInteractionHandlerProps {
  onTap?: (position: { x: number; y: number; z: number }) => void;
  onDoubleTap?: (position: { x: number; y: number; z: number }) => void;
  onPinch?: (scale: number, centerPoint: { x: number; y: number }) => void;
  onRotate?: (rotation: { x: number; y: number; z: number }) => void;
  onDrag?: (position: { x: number; y: number; z: number }, velocity: { x: number; y: number }) => void;
  onShake?: () => void;
  className?: string;
  disabled?: boolean;
}

const ARInteractionHandler: React.FC<ARInteractionHandlerProps> = ({
  onTap,
  onDoubleTap,
  onPinch,
  onRotate,
  onDrag,
  onShake,
  className = '',
  disabled = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [touches, setTouches] = useState<Map<number, TouchPoint>>(new Map());
  const [gestureData, setGestureData] = useState<GestureData>({
    scale: 1,
    rotation: 0,
    position: { x: 0, y: 0, z: 0 },
    velocity: { x: 0, y: 0, z: 0 }
  });

  const [lastTapTime, setLastTapTime] = useState(0);
  const [lastTapPosition, setLastTapPosition] = useState({ x: 0, y: 0 });
  const [shakeDetection, setShakeDetection] = useState({
    lastShake: 0,
    shakeCount: 0
  });

  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || disabled) return;

    let shakeTimeout: NodeJS.Timeout;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      
      const newTouches = new Map();
      Array.from(e.changedTouches).forEach(touch => {
        newTouches.set(touch.identifier, {
          x: touch.clientX,
          y: touch.clientY,
          identifier: touch.identifier
        });
      });
      
      setTouches(newTouches);
      setIsInteracting(true);

      // Detect shake on touch start (for immediate response)
      detectShake('touchStart');
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      
      if (touches.size === 0) return;

      const newTouches = new Map();
      Array.from(e.changedTouches).forEach(touch => {
        newTouches.set(touch.identifier, {
          x: touch.clientX,
          y: touch.clientY,
          identifier: touch.identifier
        });
      });

      // Update gesture data based on touch changes
      updateGestureData(newTouches);
      setTouches(newTouches);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      
      const remainingTouches = new Map();
      Array.from(e.changedTouches).forEach(touch => {
        if (touches.has(touch.identifier)) {
          // Touch ended
          if (touches.size === 1) {
            // Single touch end - handle tap
            handleTap(touches.get(touch.identifier)!);
          }
        } else {
          // Touch continued
          newTouches.set(touch.identifier, {
            x: touch.clientX,
            y: touch.clientY,
            identifier: touch.identifier
          });
        }
      });

      setTouches(newTouches);
      
      if (newTouches.size === 0) {
        setIsInteracting(false);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      const position = { x: e.clientX, y: e.clientY, identifier: -1 };
      
      const newTouches = new Map();
      newTouches.set(-1, position);
      setTouches(newTouches);
      setIsInteracting(true);

      detectShake('mouseDown');
    };

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      
      if (touches.size === 1 && touches.has(-1)) {
        const currentTouch = touches.get(-1)!;
        const newPosition = { x: e.clientX, y: e.clientY, identifier: -1 };
        
        // Calculate velocity
        const velocity = {
          x: (newPosition.x - currentTouch.x) * 0.1,
          y: (newPosition.y - currentTouch.y) * 0.1
        };

        // Update position with velocity
        const updatedGesture = {
          ...gestureData,
          position: {
            x: gestureData.position.x + velocity.x,
            y: gestureData.position.y + velocity.y,
            z: gestureData.position.z
          },
          velocity
        };
        
        setGestureData(updatedGesture);
        onDrag?.(updatedGesture.position, velocity);
        
        // Update touch position
        const newTouches = new Map();
        newTouches.set(-1, newPosition);
        setTouches(newTouches);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      
      if (touches.has(-1)) {
        handleTap(touches.get(-1)!);
      }
      
      setTouches(new Map());
      setIsInteracting(false);
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      const scaleDelta = e.deltaY > 0 ? -0.1 : 0.1;
      const newScale = Math.max(0.5, Math.min(2, gestureData.scale + scaleDelta));
      
      setGestureData(prev => ({ ...prev, scale: newScale }));
      onPinch?.(newScale, { x: e.clientX, y: e.clientY });
    };

    // Add event listeners
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: false });
    
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('wheel', handleWheel, { passive: false });

    // Device motion for shake detection
    if (window.DeviceMotionEvent) {
      const handleDeviceMotion = (e: DeviceMotionEvent) => {
        const acceleration = e.accelerationIncludingGravity;
        if (acceleration) {
          const magnitude = Math.sqrt(
            (acceleration.x || 0) ** 2 + 
            (acceleration.y || 0) ** 2 + 
            (acceleration.z || 0) ** 2
          );
          
          if (magnitude > 20) { // Shake threshold
            detectShake('deviceMotion');
          }
        }
      };
      
      window.addEventListener('devicemotion', handleDeviceMotion);
      
      return () => {
        window.removeEventListener('devicemotion', handleDeviceMotion);
      };
    }

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('wheel', handleWheel);
      
      if (shakeTimeout) {
        clearTimeout(shakeTimeout);
      }
    };
  }, [disabled, touches, gestureData, onTap, onDoubleTap, onPinch, onRotate, onDrag, onShake]);

  const updateGestureData = useCallback((newTouches: Map<number, TouchPoint>) => {
    if (newTouches.size === 2) {
      // Pinch gesture
      const touchArray = Array.from(newTouches.values());
      const touch1 = touchArray[0];
      const touch2 = touchArray[1];
      
      const distance = Math.sqrt(
        (touch2.x - touch1.x) ** 2 + (touch2.y - touch1.y) ** 2
      );
      
      const centerX = (touch1.x + touch2.x) / 2;
      const centerY = (touch1.y + touch2.y) / 2;
      
      if (touches.size === 2) {
        const oldTouchArray = Array.from(touches.values());
        const oldDistance = Math.sqrt(
          (oldTouchArray[1].x - oldTouchArray[0].x) ** 2 + 
          (oldTouchArray[1].y - oldTouchArray[0].y) ** 2
        );
        
        const scaleChange = distance / oldDistance;
        const newScale = Math.max(0.5, Math.min(2, gestureData.scale * scaleChange));
        
        setGestureData(prev => ({ ...prev, scale: newScale }));
        onPinch?.(newScale, { x: centerX, y: centerY });
      }
      
      // Rotation gesture
      const angle = Math.atan2(touch2.y - touch1.y, touch2.x - touch1.x);
      const rotation = (angle * 180) / Math.PI;
      
      setGestureData(prev => ({ 
        ...prev, 
        rotation,
        position: {
          ...prev.position,
          z: rotation * 0.1 // Convert rotation to Z-axis movement for 3D effect
        }
      }));
      onRotate?.({ x: 0, y: 0, z: rotation });
      
    } else if (newTouches.size === 1) {
      // Single touch drag
      const touch = Array.from(newTouches.values())[0];
      const prevTouch = touches.get(touch.identifier);
      
      if (prevTouch) {
        const deltaX = (touch.x - prevTouch.x) * 0.5;
        const deltaY = (touch.y - prevTouch.y) * 0.5;
        
        const velocity = {
          x: deltaX * 0.1,
          y: deltaY * 0.1
        };
        
        setGestureData(prev => ({
          ...prev,
          position: {
            x: prev.position.x + deltaX,
            y: prev.position.y + deltaY,
            z: prev.position.z
          },
          velocity
        }));
        
        onDrag?.(
          {
            x: gestureData.position.x + deltaX,
            y: gestureData.position.y + deltaY,
            z: gestureData.position.z
          },
          velocity
        );
      }
    }
  }, [touches, gestureData, onPinch, onRotate, onDrag]);

  const handleTap = useCallback((touch: TouchPoint) => {
    const currentTime = Date.now();
    const timeDiff = currentTime - lastTapTime;
    const distance = Math.sqrt(
      (touch.x - lastTapPosition.x) ** 2 + 
      (touch.y - lastTapPosition.y) ** 2
    );

    // Convert screen coordinates to 3D space coordinates
    const container = containerRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      const normalizedX = ((touch.x - rect.left) / rect.width - 0.5) * 2;
      const normalizedY = ((touch.y - rect.top) / rect.height - 0.5) * 2;
      
      const position3D = {
        x: normalizedX * 100,
        y: -normalizedY * 100, // Invert Y for 3D space
        z: gestureData.position.z
      };

      if (timeDiff < 300 && distance < 30) {
        // Double tap
        onDoubleTap?.(position3D);
      } else {
        // Single tap
        onTap?.(position3D);
      }
      
      setLastTapTime(currentTime);
      setLastTapPosition({ x: touch.x, y: touch.y });
    }
  }, [lastTapTime, lastTapPosition, gestureData.position, onTap, onDoubleTap]);

  const detectShake = useCallback((source: string) => {
    const now = Date.now();
    
    if (now - shakeDetection.lastShake < 1000) {
      // Increment shake count if shake detected within 1 second
      setShakeDetection(prev => ({ 
        ...prev, 
        shakeCount: prev.shakeCount + 1 
      }));
      
      if (shakeDetection.shakeCount >= 2) {
        onShake?.();
        setShakeDetection({ lastShake: now, shakeCount: 0 });
      }
    } else {
      // Reset shake count
      setShakeDetection({ lastShake: now, shakeCount: 1 });
    }
  }, [shakeDetection.lastShake, shakeDetection.shakeCount, onShake]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 touch-none ${isInteracting ? 'cursor-grabbing' : 'cursor-grab'} ${className}`}
      style={{ 
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      {/* Touch feedback overlay */}
      {isInteracting && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute inset-0 bg-orange-500/10 pointer-events-none"
        />
      )}
      
      {/* Touch point indicators */}
      {Array.from(touches.values()).map((touch, index) => (
        <motion.div
          key={touch.identifier}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className="absolute w-4 h-4 bg-orange-500 rounded-full pointer-events-none transform -translate-x-2 -translate-y-2"
          style={{
            left: touch.x,
            top: touch.y,
            zIndex: 50
          }}
        >
          <div className="absolute inset-0 bg-orange-300 rounded-full animate-ping opacity-75" />
          <div className="absolute inset-1 bg-white rounded-full" />
        </motion.div>
      ))}
      
      {/* Gesture instruction overlay */}
      {!isInteracting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-4 left-4 right-4 text-center"
        >
          <div className="bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg">
            <div className="space-y-1">
              <div>👆 Tap to place food</div>
              <div>✌️ Pinch to scale • Two-finger rotate</div>
              <div>🤳 Shake to reset</div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Gesture debug info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 left-4 bg-black/70 text-white text-xs p-2 rounded font-mono">
          <div>Scale: {gestureData.scale.toFixed(2)}</div>
          <div>Rotation: {gestureData.rotation.toFixed(1)}°</div>
          <div>Position: ({gestureData.position.x.toFixed(1)}, {gestureData.position.y.toFixed(1)})</div>
          <div>Touches: {touches.size}</div>
          <div>Interacting: {isInteracting ? 'Yes' : 'No'}</div>
        </div>
      )}
      
      {/* Invisible interaction zones for better UX */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Corner interaction hints */}
        <div className="absolute top-2 left-2 w-16 h-16 border border-white/20 rounded-lg pointer-events-none" />
        <div className="absolute top-2 right-2 w-16 h-16 border border-white/20 rounded-lg pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-16 h-16 border border-white/20 rounded-lg pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-16 h-16 border border-white/20 rounded-lg pointer-events-none" />
      </div>
    </div>
  );
};

export default ARInteractionHandler;