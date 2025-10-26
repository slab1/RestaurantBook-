/**
 * MobileTourInterface - Mobile-optimized virtual tour interface
 * Designed for smartphones and tablets with touch gestures and responsive controls
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SceneData, VirtualTourStats, Hotspot } from '@/lib/ar/virtual-tour-system';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Smartphone, 
  Tablet,
  RotateCw, 
  Navigation, 
  ZoomIn, 
  ZoomOut,
  Camera,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  MapPin,
  Heart,
  Share2,
  Download,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Home,
  List,
  Search,
  Filter,
  Star,
  Clock,
  Target
} from 'lucide-react';

interface MobileTourInterfaceProps {
  currentScene?: SceneData;
  scenes: SceneData[];
  stats: VirtualTourStats;
  isPlaying: boolean;
  isMuted: boolean;
  className?: string;
  deviceType?: 'phone' | 'tablet';
  onPlayPause: () => void;
  onPreviousScene: () => void;
  onNextScene: () => void;
  onSceneSelect: (sceneId: string) => void;
  onScreenshot: () => void;
  onMuteToggle: () => void;
  onHotspotClick?: (hotspot: Hotspot) => void;
}

interface MobileControlState {
  showControls: boolean;
  showMenu: boolean;
  showSettings: boolean;
  showSceneList: boolean;
  showHotspotList: boolean;
  isFullscreen: boolean;
  orientation: 'portrait' | 'landscape';
}

interface TouchGesture {
  startX: number;
  startY: number;
  startTime: number;
  initialZoom: number;
  isActive: boolean;
}

export const MobileTourInterface: React.FC<MobileTourInterfaceProps> = ({
  currentScene,
  scenes,
  stats,
  isPlaying,
  isMuted,
  className = '',
  deviceType = 'phone',
  onPlayPause,
  onPreviousScene,
  onNextScene,
  onSceneSelect,
  onScreenshot,
  onMuteToggle,
  onHotspotClick
}) => {
  const [controlState, setControlState] = useState<MobileControlState>({
    showControls: true,
    showMenu: false,
    showSettings: false,
    showSceneList: false,
    showHotspotList: false,
    isFullscreen: false,
    orientation: 'portrait'
  });

  const [touchGesture, setTouchGesture] = useState<TouchGesture>({
    startX: 0,
    startY: 0,
    startTime: 0,
    initialZoom: 1,
    isActive: false
  });

  const [hotspotVisibility, setHotspotVisibility] = useState(true);
  const [favoriteScenes, setFavoriteScenes] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSection, setFilterSection] = useState('all');

  const containerRef = useRef<HTMLDivElement>(null);
  const gestureStartRef = useRef<{ x: number; y: number } | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Detect device orientation
  useEffect(() => {
    const handleOrientationChange = () => {
      const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
      setControlState(prev => ({ ...prev, orientation }));
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);
    handleOrientationChange();

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  // Auto-hide controls
  useEffect(() => {
    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      setControlState(prev => ({ ...prev, showControls: true }));
      
      if (deviceType === 'phone') {
        controlsTimeoutRef.current = setTimeout(() => {
          setControlState(prev => ({ ...prev, showControls: false }));
        }, 3000);
      }
    };

    const handleUserInteraction = () => {
      resetControlsTimeout();
    };

    document.addEventListener('touchstart', handleUserInteraction);
    document.addEventListener('touchmove', handleUserInteraction);
    document.addEventListener('click', handleUserInteraction);

    return () => {
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('touchmove', handleUserInteraction);
      document.removeEventListener('click', handleUserInteraction);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [deviceType]);

  // Touch gesture handlers
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    const touch = event.touches[0];
    gestureStartRef.current = { x: touch.clientX, y: touch.clientY };
    setTouchGesture(prev => ({
      ...prev,
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      isActive: true
    }));
  }, []);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    if (!gestureStartRef.current || !touchGesture.isActive) return;

    const touch = event.touches[0];
    const deltaX = touch.clientX - gestureStartRef.current.x;
    const deltaY = touch.clientY - gestureStartRef.current.y;
    const deltaTime = Date.now() - touchGesture.startTime;

    // Swipe detection
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) && deltaTime < 500) {
      if (deltaX > 0) {
        // Swipe right - previous scene
        onPreviousScene();
      } else {
        // Swipe left - next scene
        onNextScene();
      }
      setTouchGesture(prev => ({ ...prev, isActive: false }));
    }

    // Pinch to zoom (two fingers)
    if (event.touches.length === 2) {
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      // Handle zoom logic here
      event.preventDefault();
    }
  }, [touchGesture, onPreviousScene, onNextScene]);

  const handleTouchEnd = useCallback(() => {
    setTouchGesture(prev => ({ ...prev, isActive: false }));
    gestureStartRef.current = null;
  }, []);

  // Toggle controls visibility
  const toggleControls = useCallback(() => {
    setControlState(prev => ({ ...prev, showControls: !prev.showControls }));
  }, []);

  // Scene filtering
  const filteredScenes = scenes.filter(scene => {
    const matchesSearch = scene.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSection === 'all' || scene.metadata?.restaurantSection === filterSection;
    return matchesSearch && matchesFilter;
  });

  const sections = ['all', ...new Set(scenes.map(scene => scene.metadata?.restaurantSection).filter(Boolean))];

  const toggleFavorite = (sceneId: string) => {
    setFavoriteScenes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sceneId)) {
        newSet.delete(sceneId);
      } else {
        newSet.add(sceneId);
      }
      return newSet;
    });
  };

  const shareCurrentScene = () => {
    if (navigator.share) {
      navigator.share({
        title: currentScene?.name || 'Restaurant Tour',
        text: `Check out ${currentScene?.name} in this virtual restaurant tour!`,
        url: window.location.href
      });
    }
  };

  const renderMobileControls = () => {
    if (!controlState.showControls) return null;

    return (
      <div className="absolute inset-x-0 bottom-0 z-40 bg-gradient-to-t from-black/80 to-transparent p-4">
        {/* Main control bar */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <Button
            size="sm"
            variant="outline"
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            onClick={onPreviousScene}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            onClick={onPlayPause}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            onClick={onNextScene}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          <div className="w-px h-8 bg-white/30 mx-2" />

          <Button
            size="sm"
            variant="outline"
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            onClick={onScreenshot}
          >
            <Camera className="h-5 w-5" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            onClick={onMuteToggle}
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>
        </div>

        {/* Scene info and progress */}
        <Card className="bg-black/40 backdrop-blur-sm text-white p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate text-sm">{currentScene?.name || 'Loading...'}</h3>
              <p className="text-xs text-white/70 truncate">
                {currentScene?.metadata?.restaurantSection || 'Restaurant Tour'}
              </p>
            </div>
            <Badge variant="secondary" className="text-xs">
              {stats.completedScenes.length}/{stats.totalScenes}
            </Badge>
          </div>
          
          <Progress 
            value={(stats.completedScenes.length / stats.totalScenes) * 100} 
            className="mb-2"
          />
          
          <div className="flex items-center justify-between text-xs text-white/70">
            <span>{Math.floor(stats.timeSpent / 60)}m elapsed</span>
            <span>{stats.hotspotsVisited.length} hotspots</span>
          </div>
        </Card>
      </div>
    );
  };

  const renderFloatingActionButtons = () => {
    if (!controlState.showControls) {
      return (
        <Button
          size="sm"
          variant="outline"
          className="absolute top-4 right-4 z-40 bg-black/50 border-white/30 text-white"
          onClick={toggleControls}
        >
          <Menu className="h-5 w-5" />
        </Button>
      );
    }

    return (
      <div className="absolute top-4 right-4 z-40 space-y-2">
        <Button
          size="sm"
          variant="outline"
          className="bg-black/50 border-white/30 text-white hover:bg-black/70"
          onClick={() => setControlState(prev => ({ ...prev, showSceneList: true }))}
        >
          <List className="h-5 w-5" />
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="bg-black/50 border-white/30 text-white hover:bg-black/70"
          onClick={() => setControlState(prev => ({ ...prev, showSettings: true }))}
        >
          <Settings className="h-5 w-5" />
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="bg-black/50 border-white/30 text-white hover:bg-black/70"
          onClick={() => setHotspotVisibility(!hotspotVisibility)}
        >
          {hotspotVisibility ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
        </Button>
      </div>
    );
  };

  const renderSceneList = () => (
    <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/20">
        <h2 className="text-xl font-bold text-white">Scenes</h2>
        <Button
          size="sm"
          variant="outline"
          className="border-white/30 text-white hover:bg-white/10"
          onClick={() => setControlState(prev => ({ ...prev, showSceneList: false }))}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-white/20">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search scenes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto">
          {sections.map(section => (
            <Button
              key={section}
              size="sm"
              variant={filterSection === section ? "default" : "outline"}
              className={filterSection === section ? "" : "border-white/30 text-white hover:bg-white/10"}
              onClick={() => setFilterSection(section)}
            >
              {section === 'all' ? 'All' : section}
            </Button>
          ))}
        </div>
      </div>

      {/* Scene grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 gap-3">
          {filteredScenes.map((scene) => (
            <Card
              key={scene.id}
              className={`p-4 cursor-pointer transition-all ${
                scene.id === currentScene?.id 
                  ? 'bg-blue-500/20 border-blue-500' 
                  : 'bg-white/10 border-white/20 hover:bg-white/20'
              }`}
              onClick={() => {
                onSceneSelect(scene.id);
                setControlState(prev => ({ ...prev, showSceneList: false }));
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white truncate">{scene.name}</h3>
                    {scene.id === currentScene?.id && (
                      <Badge variant="default" className="text-xs">Current</Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-white/70 mb-2">
                    {scene.metadata?.restaurantSection}
                  </p>
                  
                  <div className="flex items-center gap-3 text-xs text-white/60">
                    <span>{scene.hotspots.length} hotspots</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {Math.floor((scene.hotspots.length * 0.5))}min
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white/70 hover:text-white p-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(scene.id);
                    }}
                  >
                    <Heart 
                      className={`h-4 w-4 ${favoriteScenes.has(scene.id) ? 'fill-red-500 text-red-500' : ''}`} 
                    />
                  </Button>
                  
                  {stats.completedScenes.includes(scene.id) && (
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/20">
        <h2 className="text-xl font-bold text-white">Settings</h2>
        <Button
          size="sm"
          variant="outline"
          className="border-white/30 text-white hover:bg-white/10"
          onClick={() => setControlState(prev => ({ ...prev, showSettings: false }))}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Settings content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Quick actions */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 h-16 flex-col"
              onClick={onScreenshot}
            >
              <Camera className="h-6 w-6 mb-1" />
              <span className="text-sm">Screenshot</span>
            </Button>
            
            <Button
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 h-16 flex-col"
              onClick={shareCurrentScene}
            >
              <Share2 className="h-6 w-6 mb-1" />
              <span className="text-sm">Share</span>
            </Button>
          </div>
        </div>

        {/* Audio controls */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Audio</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white">Sound Effects</span>
              <Button
                size="sm"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                onClick={onMuteToggle}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Display options */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Display</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white">Show Hotspots</span>
              <Button
                size="sm"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                onClick={() => setHotspotVisibility(!hotspotVisibility)}
              >
                {hotspotVisibility ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Device info */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Device Info</h3>
          <div className="space-y-2 text-sm text-white/70">
            <div className="flex justify-between">
              <span>Device Type:</span>
              <span className="capitalize">{deviceType}</span>
            </div>
            <div className="flex justify-between">
              <span>Orientation:</span>
              <span className="capitalize">{controlState.orientation}</span>
            </div>
            <div className="flex justify-between">
              <span>Screen Size:</span>
              <span>{window.innerWidth} × {window.innerHeight}</span>
            </div>
          </div>
        </div>

        {/* Tour stats */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Tour Stats</h3>
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3 bg-white/10 border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-white/70">Time</span>
              </div>
              <p className="text-lg font-semibold text-white">{Math.floor(stats.timeSpent / 60)}m</p>
            </Card>
            
            <Card className="p-3 bg-white/10 border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-green-400" />
                <span className="text-sm text-white/70">Hotspots</span>
              </div>
              <p className="text-lg font-semibold text-white">{stats.hotspotsVisited.length}</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div 
      ref={containerRef}
      className={`mobile-tour-interface relative w-full h-full overflow-hidden ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Main content area */}
      <div className="w-full h-full relative">
        {/* Scene content would be rendered here */}
        {/* This is where the panoramic viewer and other content would go */}
        
        {currentScene && hotspotVisibility && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Hotspots would be rendered here with mobile-specific positioning */}
            {currentScene.hotspots.map((hotspot) => (
              <button
                key={hotspot.id}
                className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${50 + Math.sin(hotspot.position.x * Math.PI / 180) * 30}%`,
                  top: `${50 - Math.cos(hotspot.position.x * Math.PI / 180) * 15}%`
                }}
                onClick={() => onHotspotClick?.(hotspot)}
              >
                <div className="bg-white/90 rounded-full p-2 shadow-lg animate-pulse">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mobile controls */}
      {renderMobileControls()}

      {/* Floating action buttons */}
      {renderFloatingActionButtons()}

      {/* Scene list overlay */}
      {controlState.showSceneList && renderSceneList()}

      {/* Settings overlay */}
      {controlState.showSettings && renderSettings()}

      {/* Loading overlay */}
      {!currentScene && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white">Loading scene...</p>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MobileTourInterface;