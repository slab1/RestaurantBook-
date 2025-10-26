/**
 * PanoramicViewer - Advanced 360° panoramic viewer component
 * Optimized for immersive restaurant tour experiences
 */

'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Home, 
  Navigation,
  Info,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';

interface PanoramicImage {
  url: string;
  width: number;
  height: number;
  format: 'equirectangular' | 'cube' | 'sphere';
  quality: number;
}

interface ViewPoint {
  yaw: number; // Horizontal rotation (-180 to 180 degrees)
  pitch: number; // Vertical rotation (-90 to 90 degrees)
  fov: number; // Field of view (30-120 degrees)
  zoom: number; // Zoom level (1-10)
}

interface NavigationPoint {
  id: string;
  name: string;
  viewPoint: ViewPoint;
  thumbnail?: string;
  description?: string;
}

interface PanoramicViewerProps {
  image: PanoramicImage;
  navigationPoints?: NavigationPoint[];
  initialViewPoint?: Partial<ViewPoint>;
  className?: string;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  showNavigation?: boolean;
  showZoomControls?: boolean;
  showResetButton?: boolean;
  onViewPointChange?: (viewPoint: ViewPoint) => void;
  onNavigationPointClick?: (point: NavigationPoint) => void;
  onLoadComplete?: () => void;
  onError?: (error: Error) => void;
}

interface ViewerState {
  isLoading: boolean;
  currentViewPoint: ViewPoint;
  isDragging: boolean;
  showNavigationPoints: boolean;
  error: string | null;
  texture: any;
  mesh: any;
}

export const PanoramicViewer: React.FC<PanoramicViewerProps> = ({
  image,
  navigationPoints = [],
  initialViewPoint = {},
  className = '',
  autoRotate = false,
  autoRotateSpeed = 0.5,
  showNavigation = true,
  showZoomControls = true,
  showResetButton = true,
  onViewPointChange,
  onNavigationPointClick,
  onLoadComplete,
  onError
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const threeRef = useRef<any>(null);
  
  const [viewerState, setViewerState] = useState<ViewerState>({
    isLoading: true,
    currentViewPoint: {
      yaw: initialViewPoint.yaw || 0,
      pitch: initialViewPoint.pitch || 0,
      fov: initialViewPoint.fov || 75,
      zoom: initialViewPoint.zoom || 1,
    },
    isDragging: false,
    showNavigationPoints: true,
    error: null,
    texture: null,
    mesh: null
  });

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current) return;

    const initializeScene = async () => {
      try {
        // Dynamically import Three.js to avoid SSR issues
        const THREE = await import('three');
        
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
          viewerState.currentViewPoint.fov,
          canvasRef.current!.clientWidth / canvasRef.current!.clientHeight,
          0.1,
          1000
        );
        const renderer = new THREE.WebGLRenderer({ 
          canvas: canvasRef.current!,
          antialias: true
        });

        // Configure renderer
        renderer.setSize(canvasRef.current!.clientWidth, canvasRef.current!.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Set up camera position
        camera.position.set(0, 0, 0);

        // Load panoramic texture
        const textureLoader = new THREE.TextureLoader();
        const texture = await new Promise((resolve, reject) => {
          textureLoader.load(
            image.url,
            resolve,
            undefined,
            reject
          );
        });

        // Create panoramic sphere
        const geometry = new THREE.SphereGeometry(500, 60, 40);
        geometry.scale(-1, 1, 1); // Invert the sphere for interior view

        const material = new THREE.MeshBasicMaterial({ 
          map: texture,
          side: THREE.BackSide
        });

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        threeRef.current = { scene, camera, renderer, THREE, mesh, texture };
        setViewerState(prev => ({ ...prev, texture, mesh, isLoading: false }));

        // Start rendering loop
        animate();

        onLoadComplete?.();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load panorama';
        setViewerState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
        onError?.(error instanceof Error ? error : new Error(errorMessage));
      }
    };

    initializeScene();

    return () => {
      if (threeRef.current) {
        threeRef.current.renderer.dispose();
        threeRef.current.geometry?.dispose?.();
        threeRef.current.material?.dispose?.();
      }
    };
  }, [image.url, onLoadComplete, onError]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !threeRef.current) return;
      
      const { camera, renderer } = threeRef.current;
      camera.aspect = canvasRef.current.clientWidth / canvasRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    if (!threeRef.current) return;

    const { camera, renderer, scene } = threeRef.current;

    // Auto-rotate if enabled
    if (autoRotate && !viewerState.isDragging) {
      setViewerState(prev => ({
        ...prev,
        currentViewPoint: {
          ...prev.currentViewPoint,
          yaw: prev.currentViewPoint.yaw + autoRotateSpeed * 0.01
        }
      }));
    }

    // Apply current view point to camera
    applyViewPoint();

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }, [autoRotate, autoRotateSpeed, viewerState.isDragging]);

  // Apply view point changes to camera
  const applyViewPoint = useCallback(() => {
    if (!threeRef.current) return;

    const { camera } = threeRef.current;
    const { yaw, pitch, fov } = viewerState.currentViewPoint;

    // Apply rotation
    camera.rotation.set(pitch * Math.PI / 180, yaw * Math.PI / 180, 0);
    
    // Apply field of view
    camera.fov = fov;
    camera.updateProjectionMatrix();

    onViewPointChange?.(viewerState.currentViewPoint);
  }, [viewerState.currentViewPoint, onViewPointChange]);

  // Mouse event handlers
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (!viewerState.isLoading) {
      setViewerState(prev => ({ ...prev, isDragging: true }));
      setLastMousePosition({ x: event.clientX, y: event.clientY });
    }
  }, [viewerState.isLoading]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!viewerState.isDragging || !threeRef.current) return;

    const deltaX = event.clientX - lastMousePosition.x;
    const deltaY = event.clientY - lastMousePosition.y;

    setViewerState(prev => ({
      ...prev,
      currentViewPoint: {
        ...prev.currentViewPoint,
        yaw: prev.currentViewPoint.yaw + deltaX * 0.5,
        pitch: Math.max(-90, Math.min(90, prev.currentViewPoint.pitch + deltaY * 0.5))
      }
    }));

    setLastMousePosition({ x: event.clientX, y: event.clientY });
  }, [viewerState.isDragging, lastMousePosition]);

  const handleMouseUp = useCallback(() => {
    setViewerState(prev => ({ ...prev, isDragging: false }));
  }, []);

  const handleWheel = useCallback((event: React.WheelEvent) => {
    event.preventDefault();
    
    setViewerState(prev => ({
      ...prev,
      currentViewPoint: {
        ...prev.currentViewPoint,
        fov: Math.max(30, Math.min(120, prev.currentViewPoint.fov + event.deltaY * 0.05))
      }
    }));
  }, []);

  // Touch event handlers for mobile
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      setLastMousePosition({ x: touch.clientX, y: touch.clientY });
      setViewerState(prev => ({ ...prev, isDragging: true }));
    }
  }, []);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    if (event.touches.length === 1 && viewerState.isDragging) {
      event.preventDefault();
      const touch = event.touches[0];
      const deltaX = touch.clientX - lastMousePosition.x;
      const deltaY = touch.clientY - lastMousePosition.y;

      setViewerState(prev => ({
        ...prev,
        currentViewPoint: {
          ...prev.currentViewPoint,
          yaw: prev.currentViewPoint.yaw + deltaX * 0.5,
          pitch: Math.max(-90, Math.min(90, prev.currentViewPoint.pitch + deltaY * 0.5))
        }
      }));

      setLastMousePosition({ x: touch.clientX, y: touch.clientY });
    }
  }, [viewerState.isDragging, lastMousePosition]);

  const handleTouchEnd = useCallback(() => {
    setViewerState(prev => ({ ...prev, isDragging: false }));
  }, []);

  // Control handlers
  const zoomIn = useCallback(() => {
    setViewerState(prev => ({
      ...prev,
      currentViewPoint: {
        ...prev.currentViewPoint,
        fov: Math.max(30, prev.currentViewPoint.fov - 10)
      }
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setViewerState(prev => ({
      ...prev,
      currentViewPoint: {
        ...prev.currentViewPoint,
        fov: Math.min(120, prev.currentViewPoint.fov + 10)
      }
    }));
  }, []);

  const resetView = useCallback(() => {
    setViewerState(prev => ({
      ...prev,
      currentViewPoint: {
        yaw: initialViewPoint.yaw || 0,
        pitch: initialViewPoint.pitch || 0,
        fov: initialViewPoint.fov || 75,
        zoom: initialViewPoint.zoom || 1,
      }
    }));
  }, [initialViewPoint]);

  const rotateView = useCallback((degrees: number) => {
    setViewerState(prev => ({
      ...prev,
      currentViewPoint: {
        ...prev.currentViewPoint,
        yaw: prev.currentViewPoint.yaw + degrees
      }
    }));
  }, []);

  const goToNavigationPoint = useCallback((point: NavigationPoint) => {
    setViewerState(prev => ({
      ...prev,
      currentViewPoint: point.viewPoint
    }));
    onNavigationPointClick?.(point);
  }, [onNavigationPointClick]);

  const toggleNavigationPoints = useCallback(() => {
    setViewerState(prev => ({
      ...prev,
      showNavigationPoints: !prev.showNavigationPoints
    }));
  }, []);

  return (
    <div ref={containerRef} className={`panoramic-viewer relative w-full h-full ${className}`}>
      {/* Canvas container */}
      <div className="relative w-full h-full overflow-hidden">
        {viewerState.error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-100 text-red-700">
            <div className="text-center">
              <p className="text-lg font-semibold mb-2">Error Loading Panorama</p>
              <p>{viewerState.error}</p>
            </div>
          </div>
        )}
        
        {viewerState.isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Loading panorama...</p>
            </div>
          </div>
        )}

        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: 'none' }}
        />
      </div>

      {/* Navigation points overlay */}
      {showNavigation && navigationPoints.length > 0 && viewerState.showNavigationPoints && (
        <div className="absolute inset-0 pointer-events-none">
          {navigationPoints.map((point) => (
            <div
              key={point.id}
              className="absolute pointer-events-auto cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${50 + Math.sin(point.viewPoint.yaw * Math.PI / 180) * 30}%`,
                top: `${50 - Math.cos(point.viewPoint.yaw * Math.PI / 180) * 15}%`
              }}
              onClick={() => goToNavigationPoint(point)}
            >
              <div className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors">
                <Navigation className="h-4 w-4" />
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2">
                <Badge variant="secondary" className="whitespace-nowrap">
                  {point.name}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Control panel */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2">
        {/* Zoom controls */}
        {showZoomControls && (
          <Card className="p-2">
            <div className="flex flex-col gap-1">
              <Button size="sm" variant="outline" onClick={zoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={zoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* View controls */}
        <Card className="p-2">
          <div className="flex flex-col gap-1">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => rotateView(-90)}
              title="Rotate Left"
            >
              ←
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => rotateView(90)}
              title="Rotate Right"
            >
              →
            </Button>
          </div>
        </Card>

        {/* Reset and toggle controls */}
        <Card className="p-2">
          <div className="flex flex-col gap-1">
            {showResetButton && (
              <Button size="sm" variant="outline" onClick={resetView}>
                <Home className="h-4 w-4" />
              </Button>
            )}
            <Button 
              size="sm" 
              variant="outline" 
              onClick={toggleNavigationPoints}
              title="Toggle Navigation Points"
            >
              {viewerState.showNavigationPoints ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </Card>
      </div>

      {/* View information panel */}
      <div className="absolute top-4 right-4">
        <Card className="p-3 bg-white/90">
          <div className="text-sm space-y-1">
            <div>Yaw: {viewerState.currentViewPoint.yaw.toFixed(1)}°</div>
            <div>Pitch: {viewerState.currentViewPoint.pitch.toFixed(1)}°</div>
            <div>FOV: {viewerState.currentViewPoint.fov.toFixed(0)}°</div>
            <Badge variant="outline" className="text-xs">
              {image.width} × {image.height}
            </Badge>
          </div>
        </Card>
      </div>

      {/* Navigation points list */}
      {showNavigation && navigationPoints.length > 0 && (
        <div className="absolute top-4 left-4">
          <Card className="p-3 bg-white/90 max-w-xs">
            <h3 className="font-semibold mb-2 text-sm">Navigation Points</h3>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {navigationPoints.map((point) => (
                <button
                  key={point.id}
                  className="w-full text-left p-2 text-sm hover:bg-gray-100 rounded transition-colors"
                  onClick={() => goToNavigationPoint(point)}
                >
                  <div className="font-medium">{point.name}</div>
                  {point.description && (
                    <div className="text-gray-600 text-xs">{point.description}</div>
                  )}
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PanoramicViewer;