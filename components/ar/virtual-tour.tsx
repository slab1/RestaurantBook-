/**
 * VirtualTour - Main React component for virtual restaurant tours
 * Provides immersive 360° panoramic viewing with interactive hotspots
 */

'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { VirtualTourSystem, TourConfiguration, Hotspot, SceneData, VirtualTourStats } from '@/lib/ar/virtual-tour-system';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  Camera, 
  Volume2, 
  VolumeX,
  VrIcon,
  Smartphone,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Info,
  Menu as MenuIcon,
  Calendar
} from 'lucide-react';

interface VirtualTourProps {
  configuration: TourConfiguration;
  className?: string;
  showControls?: boolean;
  autoStart?: boolean;
  enableVoiceNavigation?: boolean;
  onSceneChange?: (scene: SceneData) => void;
  onHotspotClick?: (hotspot: Hotspot) => void;
  onTourComplete?: (stats: VirtualTourStats) => void;
}

interface TourState {
  isLoading: boolean;
  currentScene: SceneData | null;
  isPlaying: boolean;
  isMuted: boolean;
  isVRMode: boolean;
  isARMode: boolean;
  progress: number;
  stats: VirtualTourStats;
}

export const VirtualTour: React.FC<VirtualTourProps> = ({
  configuration,
  className = '',
  showControls = true,
  autoStart = true,
  enableVoiceNavigation = false,
  onSceneChange,
  onHotspotClick,
  onTourComplete
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tourSystemRef = useRef<VirtualTourSystem | null>(null);
  
  const [tourState, setTourState] = useState<TourState>({
    isLoading: true,
    currentScene: null,
    isPlaying: autoStart,
    isMuted: false,
    isVRMode: false,
    isARMode: false,
    progress: 0,
    stats: {
      totalScenes: configuration.scenes.length,
      completedScenes: [],
      timeSpent: 0,
      hotspotsVisited: [],
      favoriteScenes: [],
      vrMode: false,
      arMode: false
    }
  });

  const [showHotspotInfo, setShowHotspotInfo] = useState<Hotspot | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize tour system
  useEffect(() => {
    if (!containerRef.current || tourSystemRef.current) return;

    const tourSystem = new VirtualTourSystem(containerRef.current, configuration);
    tourSystemRef.current = tourSystem;

    // Set up event listeners
    tourSystem.on('sceneLoaded', (data: { sceneId: string; sceneData: SceneData }) => {
      setTourState(prev => ({
        ...prev,
        currentScene: data.sceneData,
        isLoading: false
      }));
      onSceneChange?.(data.sceneData);
    });

    tourSystem.on('hotspotClicked', (data: { hotspot: Hotspot }) => {
      setShowHotspotInfo(data.hotspot);
      onHotspotClick?.(data.hotspot);
    });

    tourSystem.on('bookingRequested', (data: { hotspot: Hotspot }) => {
      // Emit booking event or navigate to booking page
      console.log('Booking requested for hotspot:', data.hotspot);
    });

    tourSystem.on('menuRequested', (data: { hotspot: Hotspot }) => {
      // Emit menu event or navigate to menu page
      console.log('Menu requested for hotspot:', data.hotspot);
    });

    tourSystem.on('vrModeEnabled', () => {
      setTourState(prev => ({ ...prev, isVRMode: true }));
    });

    tourSystem.on('arModeEnabled', () => {
      setTourState(prev => ({ ...prev, isARMode: true }));
    });

    // Start the tour
    if (autoStart) {
      tourSystem.start();
    }

    // Clean up
    return () => {
      tourSystem.dispose();
      tourSystemRef.current = null;
    };
  }, [configuration, autoStart, onSceneChange, onHotspotClick]);

  // Calculate progress
  useEffect(() => {
    if (configuration.scenes.length === 0) return;
    
    const progress = (tourState.stats.completedScenes.length / configuration.scenes.length) * 100;
    setTourState(prev => ({ ...prev, progress }));
  }, [tourState.stats.completedScenes, configuration.scenes.length]);

  // Update stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (tourSystemRef.current) {
        const stats = tourSystemRef.current.getStats();
        setTourState(prev => ({ ...prev, stats }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Control handlers
  const togglePlayPause = useCallback(() => {
    if (!tourSystemRef.current) return;
    
    setTourState(prev => {
      const newIsPlaying = !prev.isPlaying;
      if (newIsPlaying) {
        tourSystemRef.current?.start();
      }
      return { ...prev, isPlaying: newIsPlaying };
    });
  }, []);

  const toggleMute = useCallback(() => {
    setTourState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  }, []);

  const enableVR = useCallback(() => {
    if (tourSystemRef.current) {
      tourSystemRef.current.enableVRMode();
    }
  }, []);

  const enableAR = useCallback(() => {
    if (tourSystemRef.current) {
      tourSystemRef.current.enableARMode();
    }
  }, []);

  const takeScreenshot = useCallback(() => {
    if (tourSystemRef.current) {
      const screenshot = tourSystemRef.current.takeScreenshot();
      // Create download link
      const link = document.createElement('a');
      link.href = screenshot;
      link.download = `restaurant-tour-${Date.now()}.png`;
      link.click();
    }
  }, []);

  const resetTour = useCallback(() => {
    if (tourSystemRef.current) {
      const firstScene = configuration.startScene;
      tourSystemRef.current.navigateToScene(firstScene);
      setTourState(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          completedScenes: [],
          hotspotsVisited: [],
          timeSpent: 0
        }
      }));
    }
  }, [configuration.startScene]);

  const nextScene = useCallback(() => {
    if (tourSystemRef.current) {
      const currentSceneId = tourState.currentScene?.id;
      if (currentSceneId) {
        const scenes = Array.from(tourSystemRef.current['scenes']?.keys() || []);
        const currentIndex = scenes.indexOf(currentSceneId);
        const nextIndex = (currentIndex + 1) % scenes.length;
        tourSystemRef.current.navigateToScene(scenes[nextIndex]);
      }
    }
  }, [tourState.currentScene]);

  const previousScene = useCallback(() => {
    if (tourSystemRef.current) {
      const currentSceneId = tourState.currentScene?.id;
      if (currentSceneId) {
        const scenes = Array.from(tourSystemRef.current['scenes']?.keys() || []);
        const currentIndex = scenes.indexOf(currentSceneId);
        const prevIndex = currentIndex === 0 ? scenes.length - 1 : currentIndex - 1;
        tourSystemRef.current.navigateToScene(scenes[prevIndex]);
      }
    }
  }, [tourState.currentScene]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const closeHotspotInfo = useCallback(() => {
    setShowHotspotInfo(null);
  }, []);

  return (
    <div className={`virtual-tour-container relative w-full h-screen bg-black ${className}`}>
      {/* Main viewer container */}
      <div 
        ref={containerRef}
        className="w-full h-full relative overflow-hidden"
      />

      {/* Loading overlay */}
      {tourState.isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg">Loading Virtual Tour...</p>
          </div>
        </div>
      )}

      {/* Scene information overlay */}
      {tourState.currentScene && showControls && (
        <div className="absolute top-4 left-4 z-40">
          <Card className="p-4 bg-black bg-opacity-75 text-white">
            <h3 className="text-xl font-bold mb-2">{tourState.currentScene.name}</h3>
            <div className="flex gap-2 mb-2">
              <Badge variant="secondary">
                Scene {tourState.stats.completedScenes.length} of {tourState.stats.totalScenes}
              </Badge>
              {tourState.currentScene.metadata?.restaurantSection && (
                <Badge variant="outline">
                  {tourState.currentScene.metadata.restaurantSection}
                </Badge>
              )}
            </div>
            <Progress value={tourState.progress} className="w-48" />
          </Card>
        </div>
      )}

      {/* Control panel */}
      {showControls && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-40">
          <Card className="p-4 bg-black bg-opacity-75">
            <div className="flex items-center gap-2">
              {/* Playback controls */}
              <Button
                size="sm"
                variant="outline"
                onClick={previousScene}
                disabled={tourState.isLoading}
                className="text-white border-white hover:bg-white hover:text-black"
              >
                <SkipBack className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={togglePlayPause}
                disabled={tourState.isLoading}
                className="text-white border-white hover:bg-white hover:text-black"
              >
                {tourState.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={nextScene}
                disabled={tourState.isLoading}
                className="text-white border-white hover:bg-white hover:text-black"
              >
                <SkipForward className="h-4 w-4" />
              </Button>

              {/* Separator */}
              <div className="w-px h-6 bg-gray-400 mx-2" />

              {/* Audio controls */}
              <Button
                size="sm"
                variant="outline"
                onClick={toggleMute}
                className="text-white border-white hover:bg-white hover:text-black"
              >
                {tourState.isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>

              {/* VR/AR controls */}
              <Button
                size="sm"
                variant="outline"
                onClick={enableVR}
                disabled={tourState.isVRMode}
                className="text-white border-white hover:bg-white hover:text-black"
              >
                <VrIcon className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={enableAR}
                disabled={tourState.isARMode}
                className="text-white border-white hover:bg-white hover:text-black"
              >
                <Smartphone className="h-4 w-4" />
              </Button>

              {/* Utility controls */}
              <Button
                size="sm"
                variant="outline"
                onClick={takeScreenshot}
                className="text-white border-white hover:bg-white hover:text-black"
              >
                <Camera className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={resetTour}
                className="text-white border-white hover:bg-white hover:text-black"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={toggleFullscreen}
                className="text-white border-white hover:bg-white hover:text-black"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Hotspot information modal */}
      {showHotspotInfo && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">{showHotspotInfo.title}</h3>
              <Button size="sm" variant="ghost" onClick={closeHotspotInfo}>
                ×
              </Button>
            </div>
            <p className="text-gray-600 mb-4">{showHotspotInfo.description}</p>
            
            <div className="flex gap-2">
              {showHotspotInfo.type === 'booking' && (
                <Button className="flex-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Table
                </Button>
              )}
              {showHotspotInfo.type === 'menu' && (
                <Button className="flex-1">
                  <MenuIcon className="h-4 w-4 mr-2" />
                  View Menu
                </Button>
              )}
              {showHotspotInfo.type === 'info' && (
                <Button className="flex-1" variant="outline">
                  <Info className="h-4 w-4 mr-2" />
                  More Info
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Stats overlay */}
      {showControls && tourState.stats.hotspotsVisited.length > 0 && (
        <div className="absolute top-4 right-4 z-40">
          <Card className="p-3 bg-black bg-opacity-75 text-white text-sm">
            <div className="flex gap-4">
              <span>Hotspots: {tourState.stats.hotspotsVisited.length}</span>
              <span>Time: {Math.floor(tourState.stats.timeSpent / 60)}m</span>
              {tourState.stats.vrMode && <Badge variant="secondary">VR</Badge>}
              {tourState.stats.arMode && <Badge variant="secondary">AR</Badge>}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default VirtualTour;