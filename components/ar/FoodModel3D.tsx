'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { NigerianFoodModels } from './NigerianFoodModels';

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
}

interface FoodModel3DProps {
  item: MenuItem | null;
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  scale?: number;
  autoRotate?: boolean;
  isARMode?: boolean;
  className?: string;
  onLoad?: () => void;
  onError?: (error: string) => void;
}

const FoodModel3D: React.FC<FoodModel3DProps> = ({
  item,
  position = { x: 0, y: 0, z: 0 },
  rotation = { x: 0, y: 0, z: 0 },
  scale = 1,
  autoRotate = false,
  isARMode = false,
  className = '',
  onLoad,
  onError
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [animationFrame, setAnimationFrame] = useState<number | null>(null);

  useEffect(() => {
    if (item && canvasRef.current) {
      initialize3DModel();
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [item]);

  useEffect(() => {
    if (autoRotate && isLoaded) {
      startAutoRotation();
    } else if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      setAnimationFrame(null);
    }
  }, [autoRotate, isLoaded]);

  const initialize3DModel = () => {
    if (!item || !canvasRef.current) return;

    try {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) {
        onError?.('Canvas context not available');
        return;
      }

      // Set canvas size
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }

      // Draw the food model
      drawFoodModel(context, item);
      setIsLoaded(true);
      onLoad?.();
    } catch (error) {
      console.error('Error initializing 3D model:', error);
      onError?.('Failed to load 3D model');
    }
  };

  const drawFoodModel = (ctx: CanvasRenderingContext2D, menuItem: MenuItem) => {
    const { width, height } = ctx.canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Create gradient background
    const gradient = ctx.createRadialGradient(
      width * 0.5, height * 0.5, 0,
      width * 0.5, height * 0.5, Math.max(width, height) * 0.5
    );
    gradient.addColorStop(0, '#fff9f0');
    gradient.addColorStop(1, '#f3e8d0');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Apply transformations
    ctx.save();
    ctx.translate(width / 2 + position.x * 10, height / 2 + position.y * 10);
    ctx.rotate((rotation.y * Math.PI) / 180);
    ctx.scale(scale, scale);

    // Draw 3D representation based on food type
    drawNigerianFood(ctx, menuItem, width, height);

    ctx.restore();

    // Add shadow
    if (!isARMode) {
      drawShadow(ctx, width, height, position);
    }
  };

  const drawShadow = (ctx: CanvasRenderingContext2D, width: number, height: number, pos: { x: number; y: number; z: number }) => {
    const shadowY = height * 0.8 + pos.y * 5;
    const shadowScale = Math.max(0.5, 1 - pos.z * 0.1);
    const shadowAlpha = Math.max(0.1, 0.3 - pos.z * 0.05);
    
    ctx.save();
    ctx.globalAlpha = shadowAlpha;
    ctx.fillStyle = '#000';
    ctx.scale(shadowScale, shadowScale);
    ctx.beginPath();
    ctx.ellipse(width / 2, shadowY, 60, 20, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  };

  const drawNigerianFood = (ctx: CanvasRenderingContext2D, item: MenuItem, width: number, height: number) => {
    const centerX = 0;
    const centerY = 0;

    // Get the specific Nigerian food model
    const foodModel = NigerianFoodModels[item.name.toLowerCase()] || NigerianFoodModels.default;

    // Draw main food item
    drawFoodItem(ctx, foodModel, centerX, centerY, width, height, item);

    // Add garnish and details
    drawGarnish(ctx, foodModel, centerX, centerY, width, height);

    // Add steam effect for hot foods
    if (foodModel.isHot) {
      drawSteamEffect(ctx, centerX, centerY, width, height);
    }
  };

  const drawFoodItem = (ctx: CanvasRenderingContext2D, model: any, x: number, y: number, width: number, height: number, item: MenuItem) => {
    ctx.save();
    
    // Main food shape
    ctx.fillStyle = model.primaryColor || '#D2691E';
    ctx.strokeStyle = model.borderColor || '#8B4513';
    ctx.lineWidth = 3;

    // Draw based on food shape type
    switch (model.shape) {
      case 'bowl':
        drawBowl(ctx, x, y, model.size || 80);
        break;
      case 'plate':
        drawPlate(ctx, x, y, model.size || 90);
        break;
      case 'cylinder':
        drawCylinder(ctx, x, y, model.size || 70);
        break;
      case 'irregular':
        drawIrregularShape(ctx, x, y, model.size || 75, model.path);
        break;
      default:
        drawBowl(ctx, x, y, 80);
    }

    // Add texture overlay
    if (model.texture) {
      drawTexture(ctx, model.texture, x, y, model.size || 80);
    }

    // Add highlights and shadows for 3D effect
    draw3DLighting(ctx, x, y, model.size || 80);

    ctx.restore();
  };

  const drawBowl = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    // Bowl base
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.2, size, size * 0.3, 0, 0, Math.PI, true);
    ctx.fill();
    ctx.stroke();

    // Bowl content
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.1, size * 0.9, size * 0.25, 0, 0, Math.PI);
    ctx.fill();
    ctx.stroke();
  };

  const drawPlate = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    // Plate rim
    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Plate inner
    ctx.beginPath();
    ctx.arc(x, y, size * 0.8, 0, 2 * Math.PI);
    ctx.fillStyle = '#f5f5f5';
    ctx.fill();
    ctx.stroke();
  };

  const drawCylinder = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    const radius = size * 0.4;
    const height = size * 0.6;

    // Top ellipse
    ctx.beginPath();
    ctx.ellipse(x, y - height / 2, radius, radius * 0.3, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Sides
    ctx.beginPath();
    ctx.moveTo(x - radius, y - height / 2);
    ctx.lineTo(x - radius, y + height / 2);
    ctx.lineTo(x + radius, y + height / 2);
    ctx.lineTo(x + radius, y - height / 2);
    ctx.lineTo(x - radius, y - height / 2);
    ctx.stroke();

    // Bottom
    ctx.beginPath();
    ctx.ellipse(x, y + height / 2, radius, radius * 0.3, 0, 0, 2 * Math.PI);
    ctx.stroke();
  };

  const drawIrregularShape = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, path: string | null) => {
    if (path) {
      // Custom path-based drawing
      ctx.beginPath();
      ctx.translate(x, y);
      // Path implementation would go here based on the specific shape
      ctx.fill();
      ctx.stroke();
    } else {
      // Default irregular shape
      ctx.beginPath();
      ctx.moveTo(x - size * 0.8, y);
      ctx.bezierCurveTo(x - size * 0.6, y - size * 0.6, x + size * 0.6, y - size * 0.6, x + size * 0.8, y);
      ctx.bezierCurveTo(x + size * 0.6, y + size * 0.6, x - size * 0.6, y + size * 0.6, x - size * 0.8, y);
      ctx.fill();
      ctx.stroke();
    }
  };

  const drawTexture = (ctx: CanvasRenderingContext2D, texture: string, x: number, y: number, size: number) => {
    ctx.save();
    ctx.globalAlpha = 0.3;
    
    switch (texture) {
      case 'grainy':
        drawGrainyTexture(ctx, x, y, size);
        break;
      case 'smooth':
        drawSmoothTexture(ctx, x, y, size);
        break;
      case 'bumpy':
        drawBumpyTexture(ctx, x, y, size);
        break;
    }
    
    ctx.restore();
  };

  const drawGrainyTexture = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.fillStyle = '#8B4513';
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const radius = (Math.random() * 0.6 + 0.4) * size;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius * 0.6;
      
      ctx.beginPath();
      ctx.arc(px, py, Math.random() * 3 + 1, 0, 2 * Math.PI);
      ctx.fill();
    }
  };

  const drawSmoothTexture = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.8, 0, 2 * Math.PI);
    ctx.fill();
  };

  const drawBumpyTexture = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.fillStyle = '#A0522D';
    for (let i = 0; i < 15; i++) {
      const angle = (i / 15) * Math.PI * 2;
      const radius = (Math.random() * 0.4 + 0.3) * size;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius * 0.6;
      const bumpSize = Math.random() * 8 + 4;
      
      ctx.beginPath();
      ctx.arc(px, py, bumpSize, 0, 2 * Math.PI);
      ctx.fill();
    }
  };

  const draw3DLighting = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    // Highlight
    const highlightGradient = ctx.createRadialGradient(
      x - size * 0.3, y - size * 0.3, 0,
      x - size * 0.3, y - size * 0.3, size * 0.5
    );
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = highlightGradient;
    ctx.beginPath();
    ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.4, 0, 2 * Math.PI);
    ctx.fill();

    // Shadow
    const shadowGradient = ctx.createRadialGradient(
      x + size * 0.3, y + size * 0.3, 0,
      x + size * 0.3, y + size * 0.3, size * 0.5
    );
    shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
    shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = shadowGradient;
    ctx.beginPath();
    ctx.arc(x + size * 0.3, y + size * 0.3, size * 0.4, 0, 2 * Math.PI);
    ctx.fill();
  };

  const drawGarnish = (ctx: CanvasRenderingContext2D, model: any, x: number, y: number, width: number, height: number) => {
    if (model.garnish) {
      model.garnish.forEach((garnish: any) => {
        ctx.save();
        ctx.fillStyle = garnish.color;
        ctx.strokeStyle = garnish.borderColor;
        ctx.lineWidth = 1;
        
        garnish.elements.forEach((element: any) => {
          const gx = x + element.x;
          const gy = y + element.y;
          const gSize = element.size || 8;
          
          switch (element.type) {
            case 'circle':
              ctx.beginPath();
              ctx.arc(gx, gy, gSize, 0, 2 * Math.PI);
              ctx.fill();
              ctx.stroke();
              break;
            case 'leaf':
              drawLeaf(ctx, gx, gy, gSize, garnish.color);
              break;
            case 'pepper':
              drawPepper(ctx, gx, gy, gSize);
              break;
          }
        });
        
        ctx.restore();
      });
    }
  };

  const drawLeaf = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + size * 0.5, y - size * 0.3, x + size, y);
    ctx.quadraticCurveTo(x + size * 0.5, y + size * 0.3, x, y);
    ctx.fill();
  };

  const drawPepper = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.fillStyle = '#FF4500';
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.6, size, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Pepper stem
    ctx.strokeStyle = '#228B22';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x, y - size * 1.5);
    ctx.stroke();
  };

  const drawSteamEffect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.strokeStyle = '#E6E6FA';
    ctx.lineWidth = 3;
    
    for (let i = 0; i < 3; i++) {
      const offsetX = (i - 1) * 15;
      ctx.beginPath();
      ctx.moveTo(x + offsetX, y - 50);
      ctx.bezierCurveTo(
        x + offsetX + 10, y - 70,
        x + offsetX - 10, y - 90,
        x + offsetX, y - 110
      );
      ctx.stroke();
    }
    
    ctx.restore();
  };

  const startAutoRotation = () => {
    const animate = () => {
      setAnimationFrame(requestAnimationFrame(animate));
    };
    const frameId = requestAnimationFrame(animate);
    setAnimationFrame(frameId);
  };

  if (!item) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <span className="text-gray-500">Select a menu item to view 3D model</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ 
          background: 'transparent',
          filter: isARMode ? 'drop-shadow(0 0 20px rgba(255, 165, 0, 0.3))' : 'none'
        }}
      />
      
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      )}
      
      {/* Model info overlay */}
      {!isARMode && (
        <div className="absolute bottom-2 left-2 right-2 text-center">
          <p className="text-xs text-white bg-black/50 px-2 py-1 rounded">
            Drag to rotate • Pinch to zoom
          </p>
        </div>
      )}
    </div>
  );
};

export default FoodModel3D;