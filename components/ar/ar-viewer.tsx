/**
 * ARViewer - WebXR-based AR viewer for virtual restaurant tours
 * Enables augmented reality features like 3D model placement and interactive overlays
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Smartphone, 
  Camera, 
  RotateCw, 
  Move, 
  Maximize2,
  Minimize2,
  Save,
  Share2,
  X,
  Zap,
  Target,
  Layers,
  Settings,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Grid,
  Hand,
  Monitor,
  Wifi,
  Battery,
  Signal
} from 'lucide-react';

interface ARModel {
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
}

interface ARMarker {
  id: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  type: 'table' | 'chair' | 'plant' | 'decoration' | 'menu';
  data: any;
}

interface ARSession {
  isActive: boolean;
  isSupported: boolean;
  isLoading: boolean;
  error: string | null;
  mode: 'ar' | 'vr' | 'mixed';
  devices: {
    hasCamera: boolean;
    hasGyroscope: boolean;
    hasAccelerometer: boolean;
    hasWebXR: boolean;
  };
}

interface ARViewerProps {
  models?: ARModel[];
  markers?: ARMarker[];
  initialModelId?: string;
  className?: string;
  autoStart?: boolean;
  showControls?: boolean;
  enablePlacement?: boolean;
  onModelSelect?: (model: ARModel) => void;
  onPlacement?: (position: { x: number; y: number; z: number }) => void;
  onSessionEnd?: () => void;
}

export const ARViewer: React.FC<ARViewerProps> = ({
  models = [],
  markers = [],
  initialModelId,
  className = '',
  autoStart = false,
  showControls = true,
  enablePlacement = true,
  onModelSelect,
  onPlacement,
  onSessionEnd
}) => {
  const [session, setSession] = useState<ARSession>({
    isActive: false,
    isSupported: false,
    isLoading: false,
    error: null,
    mode: 'ar',
    devices: {
      hasCamera: false,
      hasGyroscope: false,
      hasAccelerometer: false,
      hasWebXR: false
    }
  });

  const [currentModel, setCurrentModel] = useState<ARModel | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(initialModelId || null);
  const [placementMode, setPlacementMode] = useState(false);
  const [placedModels, setPlacedModels] = useState<Array<{ id: string; model: ARModel; position: { x: number; y: number; z: number } }>>([]);
  const [showGrid, setShowGrid] = useState(false);
  const [showPlacedModels, setShowPlacedModels] = useState(true);
  const [handTracking, setHandTracking] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    duration: 0,
    modelsPlaced: 0,
    interactions: 0,
    batteryLevel: 0,
    signalStrength: 0
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const arSceneRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);
  const batteryCheckRef = useRef<NodeJS.Timeout | null>(null);

  // Check device capabilities
  useEffect(() => {
    const checkCapabilities = async () => {
      const capabilities = {
        hasCamera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
        hasGyroscope: 'DeviceOrientationEvent' in window,
        hasAccelerometer: 'DeviceMotionEvent' in window,
        hasWebXR: 'xr' in navigator
      };

      let isSupported = false;
      
      // Check for WebXR AR support
      if ('xr' in navigator) {
        try {
          isSupported = await (navigator as any).xr.isSessionSupported('immersive-ar');
        } catch (error) {
          console.warn('WebXR not supported:', error);
        }
      }

      setSession(prev => ({
        ...prev,
        devices: capabilities,
        isSupported
      }));

      // Set initial model
      if (selectedModelId && models.length > 0) {
        const model = models.find(m => m.id === selectedModelId);
        if (model) {
          setCurrentModel(model);
          onModelSelect?.(model);
        }
      }
    };

    checkCapabilities();

    // Battery and network monitoring
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setSessionStats(prev => ({ ...prev, batteryLevel: battery.level * 100 }));
        
        battery.addEventListener('levelchange', () => {
          setSessionStats(prev => ({ ...prev, batteryLevel: battery.level * 100 }));
        });
      });
    }

    // Network strength monitoring
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setSessionStats(prev => ({ 
        ...prev, 
        signalStrength: connection.effectiveType === '4g' ? 100 : connection.effectiveType === '3g' ? 60 : 30 
      }));
    }

    return () => {
      if (batteryCheckRef.current) {
        clearInterval(batteryCheckRef.current);
      }
    };
  }, [models, selectedModelId, onModelSelect]);

  // Session timer
  useEffect(() => {
    if (session.isActive) {
      startTimeRef.current = Date.now();
      batteryCheckRef.current = setInterval(() => {
        setSessionStats(prev => ({
          ...prev,
          duration: Math.floor((Date.now() - startTimeRef.current) / 1000)
        }));
      }, 1000);
    } else {
      if (batteryCheckRef.current) {
        clearInterval(batteryCheckRef.current);
      }
    }

    return () => {
      if (batteryCheckRef.current) {
        clearInterval(batteryCheckRef.current);
      }
    };
  }, [session.isActive]);

  // Start AR session
  const startARSession = useCallback(async () => {
    if (!session.isSupported) {
      setSession(prev => ({ 
        ...prev, 
        error: 'AR not supported on this device' 
      }));
      return;
    }

    setSession(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Request AR session
      const xrSession = await (navigator as any).xr.requestSession('immersive-ar', {
        requiredFeatures: ['local'],
        optionalFeatures: ['hit-test', 'dom-overlay', 'hand-tracking'],
        domOverlay: { root: document.body }
      });

      // Set up session
      setSession(prev => ({ 
        ...prev, 
        isActive: true, 
        isLoading: false,
        mode: 'ar'
      }));

      // Initialize AR scene
      await initializeARScene(xrSession);
      
    } catch (error) {
      console.error('Failed to start AR session:', error);
      setSession(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to start AR session'
      }));
    }
  }, [session.isSupported]);

  // End AR session
  const endARSession = useCallback(() => {
    setSession(prev => ({ 
      ...prev, 
      isActive: false,
      error: null 
    }));

    // Clean up AR scene
    if (arSceneRef.current) {
      arSceneRef.current.dispose();
      arSceneRef.current = null;
    }

    onSessionEnd?.();
  }, [onSessionEnd]);

  // Initialize AR scene
  const initializeARScene = async (session: any) => {
    // This would integrate with the Three.js WebXR setup
    // For now, we'll simulate the initialization
    try {
      const THREE = await import('three');
      
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera();
      
      // Set up lighting for AR
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
      directionalLight.position.set(0, 1, 0);
      scene.add(directionalLight);

      // Set up hit test for model placement
      if (session.requestReferenceSpace && session.requestHitTestSource) {
        // WebXR hit test implementation would go here
        console.log('Hit test available for model placement');
      }

      arSceneRef.current = { scene, camera, session, THREE };
      
      console.log('AR scene initialized');
    } catch (error) {
      console.error('Failed to initialize AR scene:', error);
      throw error;
    }
  };

  // Place model in AR space
  const placeModel = useCallback((position: { x: number; y: number; z: number }) => {
    if (!currentModel || !placementMode) return;

    const placedModel = {
      id: `placed-${Date.now()}`,
      model: currentModel,
      position
    };

    setPlacedModels(prev => [...prev, placedModel]);
    setSessionStats(prev => ({ 
      ...prev, 
      modelsPlaced: prev.modelsPlaced + 1 
    }));

    onPlacement?.(position);
    setPlacementMode(false);
  }, [currentModel, placementMode, onPlacement]);

  // Remove placed model
  const removePlacedModel = useCallback((id: string) => {
    setPlacedModels(prev => prev.filter(pm => pm.id !== id));
  }, []);

  // Select model for placement
  const selectModel = useCallback((model: ARModel) => {
    setCurrentModel(model);
    setSelectedModelId(model.id);
    setPlacementMode(true);
    onModelSelect?.(model);
  }, [onModelSelect]);

  // Handle model interaction
  const interactWithModel = useCallback((modelId: string) => {
    setSessionStats(prev => ({ 
      ...prev, 
      interactions: prev.interactions + 1 
    }));

    // Emit interaction event
    console.log(`Interacted with model: ${modelId}`);
  }, []);

  // Take AR screenshot
  const takeARScreenshot = useCallback(() => {
    if (canvasRef.current) {
      const dataURL = canvasRef.current.toDataURL('image/png');
      
      // Create download link
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `ar-screenshot-${Date.now()}.png`;
      link.click();
    }
  }, []);

  // Save AR layout
  const saveARLayout = useCallback(() => {
    const layout = {
      models: placedModels,
      timestamp: new Date().toISOString(),
      sessionDuration: sessionStats.duration
    };

    // Save to localStorage
    localStorage.setItem(`ar-layout-${Date.now()}`, JSON.stringify(layout));
    
    console.log('AR layout saved');
  }, [placedModels, sessionStats.duration]);

  // Load AR layout
  const loadARLayout = useCallback((layoutData: string) => {
    try {
      const layout = JSON.parse(layoutData);
      setPlacedModels(layout.models || []);
      console.log('AR layout loaded');
    } catch (error) {
      console.error('Failed to load AR layout:', error);
    }
  }, []);

  if (!session.isSupported) {
    return (
      <div className={`ar-viewer flex items-center justify-center ${className}`}>
        <Card className="p-8 text-center max-w-md">
          <Smartphone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">AR Not Supported</h3>
          <p className="text-gray-600 mb-4">
            Your device doesn't support augmented reality features.
          </p>
          <div className="space-y-2 text-sm text-left">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${session.devices.hasWebXR ? 'bg-green-500' : 'bg-red-500'}`} />
              <span>WebXR Support</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${session.devices.hasCamera ? 'bg-green-500' : 'bg-red-500'}`} />
              <span>Camera Access</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${session.devices.hasGyroscope ? 'bg-green-500' : 'bg-red-500'}`} />
              <span>Gyroscope</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={`ar-viewer relative w-full h-full bg-black overflow-hidden ${className}`}>
      {/* AR Video/Canvas Container */}
      <div className="absolute inset-0">
        {/* Camera feed or AR canvas would go here */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
          style={{ display: session.isActive ? 'block' : 'none' }}
        />
        
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ display: session.isActive ? 'block' : 'none' }}
        />
        
        {!session.isActive && (
          <div className="flex items-center justify-center h-full bg-gray-900 text-white">
            <Card className="p-8 text-center">
              <h3 className="text-xl font-semibold mb-4">Ready for AR Experience</h3>
              <p className="text-gray-300 mb-6">
                Place virtual restaurant items in your real environment
              </p>
              
              {showControls && (
                <Button 
                  onClick={startARSession} 
                  disabled={session.isLoading}
                  className="w-full mb-4"
                >
                  {session.isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Starting AR...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-5 w-5" />
                      <span>Start AR Experience</span>
                    </div>
                  )}
                </Button>
              )}
              
              {session.error && (
                <p className="text-red-400 text-sm">{session.error}</p>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* AR Controls Overlay */}
      {session.isActive && showControls && (
        <>
          {/* Top Status Bar */}
          <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/50 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  AR Active
                </Badge>
                <Badge variant="outline" className="text-white border-white/30">
                  {Math.floor(sessionStats.duration / 60)}:{(sessionStats.duration % 60).toString().padStart(2, '0')}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-white">
                <div className="flex items-center gap-1 text-xs">
                  <Battery className="h-3 w-3" />
                  <span>{Math.round(sessionStats.batteryLevel)}%</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Signal className="h-3 w-3" />
                  <span>{sessionStats.signalStrength}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Model Selection Panel */}
          {models.length > 0 && (
            <div className="absolute top-16 left-4 right-4 z-40">
              <Card className="p-4 bg-black/80 backdrop-blur-sm text-white">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Select Item to Place</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                    onClick={() => setPlacementMode(!placementMode)}
                  >
                    {placementMode ? <Target className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {models.map((model) => (
                    <button
                      key={model.id}
                      className={`flex-shrink-0 p-2 rounded-lg border transition-colors ${
                        selectedModelId === model.id
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-white/30 hover:bg-white/10'
                      }`}
                      onClick={() => selectModel(model)}
                    >
                      <div className="w-12 h-12 bg-gray-700 rounded mb-1 flex items-center justify-center">
                        <Layers className="h-6 w-6 text-white/70" />
                      </div>
                      <div className="text-xs text-center">{model.name}</div>
                    </button>
                  ))}
                </div>
                
                {currentModel && (
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{currentModel.name}</p>
                        <p className="text-xs text-white/70">{currentModel.category}</p>
                      </div>
                      {currentModel.price && (
                        <Badge variant="secondary">${currentModel.price}</Badge>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Bottom Control Bar */}
          <div className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black/50 to-transparent p-4">
            <Card className="p-4 bg-black/80 backdrop-blur-sm">
              <div className="flex items-center justify-between text-white">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                    onClick={() => setShowGrid(!showGrid)}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                    onClick={() => setHandTracking(!handTracking)}
                  >
                    <Hand className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                    onClick={() => setShowPlacedModels(!showPlacedModels)}
                  >
                    {showPlacedModels ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                    onClick={saveARLayout}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                    onClick={takeARScreenshot}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                    onClick={endARSession}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Stats */}
              <div className="flex items-center justify-between mt-3 text-xs text-white/70">
                <span>Placed: {sessionStats.modelsPlaced}</span>
                <span>Interactions: {sessionStats.interactions}</span>
                <span>Models: {placedModels.length}</span>
              </div>
            </Card>
          </div>

          {/* Placement Instructions */}
          {placementMode && currentModel && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40">
              <Card className="p-4 bg-blue-500/90 backdrop-blur-sm text-white text-center max-w-xs">
                <Target className="h-8 w-8 mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Place {currentModel.name}</h4>
                <p className="text-sm">Tap on a surface to place the item</p>
              </Card>
            </div>
          )}
        </>
      )}

      {/* Placed Models Management */}
      {placedModels.length > 0 && showPlacedModels && (
        <div className="absolute top-4 right-4 z-30">
          <Card className="p-3 bg-black/80 backdrop-blur-sm text-white">
            <h4 className="font-semibold mb-2 text-sm">Placed Items ({placedModels.length})</h4>
            <div className="space-y-1">
              {placedModels.slice(0, 3).map((placedModel) => (
                <div key={placedModel.id} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="flex-1 truncate">{placedModel.model.name}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="p-0 h-auto text-red-400 hover:text-red-300"
                    onClick={() => removePlacedModel(placedModel.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {placedModels.length > 3 && (
                <p className="text-xs text-white/50">+{placedModels.length - 3} more</p>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ARViewer;