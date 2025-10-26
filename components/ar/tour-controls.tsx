/**
 * TourControls - Advanced tour management and control interface
 * Provides comprehensive controls for navigating virtual restaurant tours
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { SceneData, VirtualTourStats, Hotspot } from '@/lib/ar/virtual-tour-system';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  Settings,
  Volume2, 
  VolumeX,
  Maximize2, 
  Minimize2,
  Camera,
  Download,
  Share2,
  Star,
  Clock,
  MapPin,
  Navigation,
  Headphones,
  Mic,
  MicOff,
  Eye,
  EyeOff,
  Home,
  List,
  Grid,
  Filter,
  Search,
  Bookmark,
  TrendingUp,
  Award,
  Target
} from 'lucide-react';

interface TourControlsProps {
  currentScene?: SceneData;
  scenes: SceneData[];
  stats: VirtualTourStats;
  isPlaying: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  className?: string;
  position?: 'bottom' | 'top' | 'left' | 'right';
  variant?: 'minimal' | 'standard' | 'detailed';
  onPlayPause: () => void;
  onPreviousScene: () => void;
  onNextScene: () => void;
  onSceneSelect: (sceneId: string) => void;
  onReset: () => void;
  onScreenshot: () => void;
  onMuteToggle: () => void;
  onFullscreenToggle: () => void;
  onVoiceToggle?: () => void;
  onSettingsChange?: (settings: TourSettings) => void;
}

interface TourSettings {
  autoAdvance: boolean;
  autoAdvanceDelay: number;
  showHotspots: boolean;
  showNavigation: boolean;
  enableVoiceNavigation: boolean;
  enableGestureControls: boolean;
  quality: 'low' | 'medium' | 'high';
  volume: number;
  brightness: number;
  contrast: number;
  accessibilityMode: boolean;
  vrMode: boolean;
  arMode: boolean;
}

interface SceneProgress {
  sceneId: string;
  visited: boolean;
  timeSpent: number;
  hotspotsViewed: number;
  screenshots: number;
  rating?: number;
}

export const TourControls: React.FC<TourControlsProps> = ({
  currentScene,
  scenes,
  stats,
  isPlaying,
  isMuted,
  isFullscreen,
  className = '',
  position = 'bottom',
  variant = 'standard',
  onPlayPause,
  onPreviousScene,
  onNextScene,
  onSceneSelect,
  onReset,
  onScreenshot,
  onMuteToggle,
  onFullscreenToggle,
  onVoiceToggle,
  onSettingsChange
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showSceneList, setShowSceneList] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [settings, setSettings] = useState<TourSettings>({
    autoAdvance: false,
    autoAdvanceDelay: 5,
    showHotspots: true,
    showNavigation: true,
    enableVoiceNavigation: false,
    enableGestureControls: true,
    quality: 'high',
    volume: 0.7,
    brightness: 1,
    contrast: 1,
    accessibilityMode: false,
    vrMode: false,
    arMode: false
  });

  const [sceneProgress, setSceneProgress] = useState<SceneProgress[]>(
    scenes.map(scene => ({
      sceneId: scene.id,
      visited: stats.completedScenes.includes(scene.id),
      timeSpent: 0,
      hotspotsViewed: 0,
      screenshots: 0
    }))
  );

  // Update scene progress when stats change
  useEffect(() => {
    setSceneProgress(prev => prev.map(progress => ({
      ...progress,
      visited: stats.completedScenes.includes(progress.sceneId),
      hotspotsViewed: progress.sceneId === currentScene?.id ? stats.hotspotsVisited.length : progress.hotspotsViewed
    })));
  }, [stats, currentScene]);

  const filteredScenes = scenes.filter(scene => {
    const matchesSearch = scene.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scene.metadata?.restaurantSection?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCategory === 'all' || 
                         scene.metadata?.restaurantSection === filterCategory;
    return matchesSearch && matchesFilter;
  });

  const categories = ['all', ...new Set(scenes.map(scene => scene.metadata?.restaurantSection).filter(Boolean))];

  const handleSettingChange = (key: keyof TourSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const getPositionClasses = () => {
    const positions = {
      bottom: 'bottom-4 left-1/2 transform -translate-x-1/2',
      top: 'top-4 left-1/2 transform -translate-x-1/2',
      left: 'left-4 top-1/2 transform -translate-y-1/2',
      right: 'right-4 top-1/2 transform -translate-y-1/2'
    };
    return positions[position];
  };

  const getVariantClasses = () => {
    const variants = {
      minimal: 'p-2',
      standard: 'p-4',
      detailed: 'p-6'
    };
    return variants[variant];
  };

  const renderSceneProgress = (sceneId: string) => {
    const progress = sceneProgress.find(p => p.sceneId === sceneId);
    if (!progress) return null;

    return (
      <div className="flex items-center gap-2 text-xs">
        {progress.visited && <div className="w-2 h-2 bg-green-500 rounded-full" />}
        {progress.rating && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
        <span className="text-gray-500">{Math.floor(progress.timeSpent / 60)}m</span>
      </div>
    );
  };

  const renderSceneGrid = () => (
    <div className="grid grid-cols-2 gap-4">
      {filteredScenes.map((scene) => (
        <Card 
          key={scene.id}
          className={`p-3 cursor-pointer transition-all hover:shadow-lg ${
            scene.id === currentScene?.id ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => {
            onSceneSelect(scene.id);
            setShowSceneList(false);
          }}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm truncate">{scene.name}</h4>
              {scene.id === currentScene?.id && <Badge variant="default">Current</Badge>}
            </div>
            
            {scene.metadata?.restaurantSection && (
              <Badge variant="outline" className="text-xs">
                {scene.metadata.restaurantSection}
              </Badge>
            )}
            
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                {scene.hotspots.length} hotspots
              </Badge>
              {renderSceneProgress(scene.id)}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderSceneList = () => (
    <div className="space-y-2">
      {filteredScenes.map((scene) => (
        <Card 
          key={scene.id}
          className={`p-3 cursor-pointer transition-all hover:shadow-lg ${
            scene.id === currentScene?.id ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => {
            onSceneSelect(scene.id);
            setShowSceneList(false);
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{scene.name}</h4>
                {scene.id === currentScene?.id && <Badge variant="default">Current</Badge>}
              </div>
              <p className="text-sm text-gray-600">{scene.metadata?.restaurantSection}</p>
            </div>
            <div className="flex items-center gap-2">
              {renderSceneProgress(scene.id)}
              <Badge variant="outline">{scene.hotspots.length}</Badge>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <>
      {/* Main control panel */}
      <div className={`absolute ${getPositionClasses()} z-40 ${getVariantClasses()}`}>
        <Card className="bg-black/75 text-white backdrop-blur-sm">
          {/* Progress indicator */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Scene {stats.completedScenes.length} of {stats.totalScenes}
              </span>
              <Badge variant="secondary" className="text-xs">
                {Math.round((stats.completedScenes.length / stats.totalScenes) * 100)}%
              </Badge>
            </div>
            <Progress 
              value={(stats.completedScenes.length / stats.totalScenes) * 100} 
              className="w-64"
            />
          </div>

          {/* Playback controls */}
          <div className="flex items-center gap-2 mb-4">
            <Button size="sm" variant="outline" onClick={onPreviousScene}>
              <SkipBack className="h-4 w-4" />
            </Button>
            
            <Button size="sm" variant="outline" onClick={onPlayPause}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <Button size="sm" variant="outline" onClick={onNextScene}>
              <SkipForward className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-gray-400 mx-2" />

            <Button size="sm" variant="outline" onClick={onScreenshot}>
              <Camera className="h-4 w-4" />
            </Button>

            <Button size="sm" variant="outline" onClick={onMuteToggle}>
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>

            <div className="w-px h-6 bg-gray-400 mx-2" />

            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Tour Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Playback settings */}
                  <div>
                    <h3 className="font-semibold mb-3">Playback</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Auto Advance</label>
                        <Switch
                          checked={settings.autoAdvance}
                          onCheckedChange={(checked) => handleSettingChange('autoAdvance', checked)}
                        />
                      </div>
                      {settings.autoAdvance && (
                        <div>
                          <label className="text-sm font-medium">Delay (seconds)</label>
                          <Slider
                            value={[settings.autoAdvanceDelay]}
                            onValueChange={([value]) => handleSettingChange('autoAdvanceDelay', value)}
                            min={3}
                            max={30}
                            step={1}
                            className="mt-2"
                          />
                          <span className="text-xs text-gray-500">{settings.autoAdvanceDelay}s</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Audio settings */}
                  <div>
                    <h3 className="font-semibold mb-3">Audio</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Volume</label>
                        <Slider
                          value={[settings.volume * 100]}
                          onValueChange={([value]) => handleSettingChange('volume', value / 100)}
                          min={0}
                          max={100}
                          step={5}
                          className="mt-2"
                        />
                        <span className="text-xs text-gray-500">{Math.round(settings.volume * 100)}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Voice Navigation</label>
                        <Switch
                          checked={settings.enableVoiceNavigation}
                          onCheckedChange={(checked) => handleSettingChange('enableVoiceNavigation', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Display settings */}
                  <div>
                    <h3 className="font-semibold mb-3">Display</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Show Hotspots</label>
                        <Switch
                          checked={settings.showHotspots}
                          onCheckedChange={(checked) => handleSettingChange('showHotspots', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Show Navigation</label>
                        <Switch
                          checked={settings.showNavigation}
                          onCheckedChange={(checked) => handleSettingChange('showNavigation', checked)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Quality</label>
                        <Select value={settings.quality} onValueChange={(value: any) => handleSettingChange('quality', value)}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Accessibility */}
                  <div>
                    <h3 className="font-semibold mb-3">Accessibility</h3>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Accessibility Mode</label>
                      <Switch
                        checked={settings.accessibilityMode}
                        onCheckedChange={(checked) => handleSettingChange('accessibilityMode', checked)}
                      />
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button size="sm" variant="outline" onClick={onFullscreenToggle}>
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>

          {/* Scene selector */}
          <Dialog open={showSceneList} onOpenChange={setShowSceneList}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full mb-2">
                <List className="h-4 w-4 mr-2" />
                Scenes ({scenes.length})
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Select Scene</DialogTitle>
              </DialogHeader>
              
              {/* Search and filter */}
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search scenes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category === 'all' ? 'All Sections' : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                </Button>
              </div>

              {/* Scene list/grid */}
              {viewMode === 'grid' ? renderSceneGrid() : renderSceneList()}
            </DialogContent>
          </Dialog>

          {/* Quick actions */}
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onReset} className="flex-1">
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            
            <Dialog open={showStats} onOpenChange={setShowStats}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <TrendingUp className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tour Statistics</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Time Spent</span>
                      </div>
                      <p className="text-lg font-semibold">{Math.floor(stats.timeSpent / 60)} minutes</p>
                    </Card>
                    
                    <Card className="p-3">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Hotspots</span>
                      </div>
                      <p className="text-lg font-semibold">{stats.hotspotsVisited.length}</p>
                    </Card>
                    
                    <Card className="p-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-purple-500" />
                        <span className="text-sm">Scenes</span>
                      </div>
                      <p className="text-lg font-semibold">
                        {stats.completedScenes.length}/{stats.totalScenes}
                      </p>
                    </Card>
                    
                    <Card className="p-3">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">Completion</span>
                      </div>
                      <p className="text-lg font-semibold">
                        {Math.round((stats.completedScenes.length / stats.totalScenes) * 100)}%
                      </p>
                    </Card>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </Card>
      </div>
    </>
  );
};

export default TourControls;