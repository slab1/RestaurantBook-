/**
 * HotspotOverlay - Interactive hotspot overlay for virtual tours
 * Displays clickable hotspots with rich information and actions
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Hotspot } from '@/lib/ar/virtual-tour-system';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Info, 
  Navigation, 
  Menu as MenuIcon, 
  Calendar, 
  Smartphone,
  MapPin,
  ExternalLink,
  Volume2,
  Star,
  Heart,
  Share2,
  Clock,
  Users,
  Wifi,
  Car
} from 'lucide-react';

interface HotspotOverlayProps {
  hotspots: Hotspot[];
  onHotspotClick: (hotspot: Hotspot) => void;
  onHotspotHover?: (hotspot: Hotspot | null) => void;
  showLabels?: boolean;
  showCategories?: boolean;
  enableAnimations?: boolean;
  className?: string;
}

interface HotspotStyle {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  icon: React.ReactNode;
}

const HOTSPOT_STYLES: Record<string, HotspotStyle> = {
  navigation: {
    backgroundColor: 'bg-blue-500',
    borderColor: 'border-blue-600',
    textColor: 'text-blue-600',
    icon: <Navigation className="h-4 w-4" />
  },
  info: {
    backgroundColor: 'bg-yellow-500',
    borderColor: 'border-yellow-600',
    textColor: 'text-yellow-600',
    icon: <Info className="h-4 w-4" />
  },
  menu: {
    backgroundColor: 'bg-orange-500',
    borderColor: 'border-orange-600',
    textColor: 'text-orange-600',
    icon: <MenuIcon className="h-4 w-4" />
  },
  booking: {
    backgroundColor: 'bg-red-500',
    borderColor: 'border-red-600',
    textColor: 'text-red-600',
    icon: <Calendar className="h-4 w-4" />
  },
  'ar-model': {
    backgroundColor: 'bg-cyan-500',
    borderColor: 'border-cyan-600',
    textColor: 'text-cyan-600',
    icon: <Smartphone className="h-4 w-4" />
  }
};

interface InteractiveHotspotProps {
  hotspot: Hotspot;
  onClick: (hotspot: Hotspot) => void;
  onHover: (hotspot: Hotspot | null) => void;
  showLabel: boolean;
  enableAnimations: boolean;
  position: { x: number; y: number; z: number };
}

const InteractiveHotspot: React.FC<InteractiveHotspotProps> = ({
  hotspot,
  onClick,
  onHover,
  showLabel,
  enableAnimations,
  position
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const style = HOTSPOT_STYLES[hotspot.type] || HOTSPOT_STYLES.info;

  // Convert 3D position to 2D screen coordinates
  const projectToScreen = useCallback((pos: { x: number; y: number; z: number }) => {
    // This would typically use camera projection matrix
    // For simplicity, we'll use a basic projection
    const distance = Math.sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z);
    const scale = 1000 / distance;
    
    return {
      x: (pos.x * scale) + window.innerWidth / 2,
      y: (pos.y * scale) + window.innerHeight / 2,
      visible: distance < 1000 && pos.z > 0
    };
  }, []);

  const screenPos = projectToScreen(position);

  // Pulse animation
  useEffect(() => {
    if (!enableAnimations) return;

    intervalRef.current = setInterval(() => {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 1000);
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enableAnimations]);

  const handleClick = () => {
    onClick(hotspot);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHover(hotspot);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHover(null);
  };

  if (!screenPos.visible) return null;

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30"
      style={{
        left: screenPos.x,
        top: screenPos.y,
      }}
    >
      {/* Main hotspot button */}
      <button
        className={`
          relative group ${style.backgroundColor} ${style.borderColor} 
          text-white rounded-full p-3 shadow-lg
          transition-all duration-300 ease-in-out
          ${isHovered ? 'scale-125 shadow-xl' : 'scale-100'}
          ${isPulsing ? 'animate-pulse' : ''}
          hover:brightness-110
        `}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title={hotspot.title}
      >
        {/* Pulse ring effect */}
        {enableAnimations && (
          <div className="absolute inset-0 rounded-full bg-white opacity-30 animate-ping" />
        )}
        
        {/* Icon */}
        <div className="relative z-10">
          {style.icon}
        </div>

        {/* Badge indicator */}
        {hotspot.metadata?.priority === 'high' && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-bounce" />
        )}
      </button>

      {/* Floating label */}
      {showLabel && (
        <div className={`
          absolute top-full left-1/2 transform -translate-x-1/2 mt-2 
          transition-opacity duration-200 z-40
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `}>
          <Card className="p-2 shadow-lg max-w-xs">
            <div className="text-center">
              <h4 className="font-semibold text-sm">{hotspot.title}</h4>
              {hotspot.description && (
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {hotspot.description}
                </p>
              )}
              <Badge variant="outline" className="mt-2 text-xs">
                {hotspot.type}
              </Badge>
            </div>
          </Card>
        </div>
      )}

      {/* Accessibility tooltip */}
      <div className="sr-only">
        {hotspot.title}: {hotspot.description}
      </div>
    </div>
  );
};

export const HotspotOverlay: React.FC<HotspotOverlayProps> = ({
  hotspots,
  onHotspotClick,
  onHotspotHover,
  showLabels = true,
  showCategories = true,
  enableAnimations = true,
  className = ''
}) => {
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<Hotspot | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [favoriteHotspots, setFavoriteHotspots] = useState<Set<string>>(new Set());

  const handleHotspotClick = (hotspot: Hotspot) => {
    setSelectedHotspot(hotspot);
    onHotspotClick(hotspot);
    setShowInfoModal(true);
  };

  const handleHotspotHover = (hotspot: Hotspot | null) => {
    setHoveredHotspot(hotspot);
    onHotspotHover?.(hotspot);
  };

  const toggleFavorite = (hotspotId: string) => {
    setFavoriteHotspots(prev => {
      const newSet = new Set(prev);
      if (newSet.has(hotspotId)) {
        newSet.delete(hotspotId);
      } else {
        newSet.add(hotspotId);
      }
      return newSet;
    });
  };

  const shareHotspot = (hotspot: Hotspot) => {
    if (navigator.share) {
      navigator.share({
        title: hotspot.title,
        text: hotspot.description,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(
        `${hotspot.title}: ${hotspot.description} - ${window.location.href}`
      );
    }
  };

  const renderHotspotDetails = (hotspot: Hotspot) => {
    const style = HOTSPOT_STYLES[hotspot.type] || HOTSPOT_STYLES.info;

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${style.backgroundColor} ${style.borderColor} text-white`}>
              {style.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold">{hotspot.title}</h2>
              <Badge variant="outline" className="mt-1">
                {hotspot.type.replace('-', ' ')}
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => toggleFavorite(hotspot.id)}
              className={favoriteHotspots.has(hotspot.id) ? 'text-red-500' : ''}
            >
              <Heart className={`h-4 w-4 ${favoriteHotspots.has(hotspot.id) ? 'fill-current' : ''}`} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => shareHotspot(hotspot)}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Description */}
        {hotspot.description && (
          <p className="text-gray-600">{hotspot.description}</p>
        )}

        {/* Metadata */}
        {hotspot.metadata && (
          <div className="space-y-3">
            <h3 className="font-semibold">Details</h3>
            <div className="grid grid-cols-2 gap-3">
              {hotspot.metadata.capacity && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>Capacity: {hotspot.metadata.capacity}</span>
                </div>
              )}
              {hotspot.metadata.duration && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>Duration: {hotspot.metadata.duration}</span>
                </div>
              )}
              {hotspot.metadata.accessibility && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>Accessible</span>
                </div>
              )}
              {hotspot.metadata.wifi && (
                <div className="flex items-center gap-2 text-sm">
                  <Wifi className="h-4 w-4 text-gray-500" />
                  <span>WiFi Available</span>
                </div>
              )}
              {hotspot.metadata.parking && (
                <div className="flex items-center gap-2 text-sm">
                  <Car className="h-4 w-4 text-gray-500" />
                  <span>Parking</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Audio option */}
        {hotspot.audioUrl && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Volume2 className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Audio Guide</span>
            </div>
            <audio controls className="w-full">
              <source src={hotspot.audioUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          {hotspot.type === 'booking' && (
            <Button className="flex-1">
              <Calendar className="h-4 w-4 mr-2" />
              Book Now
            </Button>
          )}
          {hotspot.type === 'menu' && (
            <Button className="flex-1">
              <MenuIcon className="h-4 w-4 mr-2" />
              View Menu
            </Button>
          )}
          {hotspot.type === 'navigation' && hotspot.targetScene && (
            <Button className="flex-1">
              <Navigation className="h-4 w-4 mr-2" />
              Go Here
            </Button>
          )}
          {hotspot.type === 'ar-model' && hotspot.arModelUrl && (
            <Button className="flex-1">
              <Smartphone className="h-4 w-4 mr-2" />
              View in AR
            </Button>
          )}
          <Button variant="outline" className="flex-1">
            <ExternalLink className="h-4 w-4 mr-2" />
            More Info
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className={`hotspot-overlay relative w-full h-full ${className}`}>
      {/* Hotspot markers */}
      {hotspots.map((hotspot) => (
        <InteractiveHotspot
          key={hotspot.id}
          hotspot={hotspot}
          onClick={handleHotspotClick}
          onHover={handleHotspotHover}
          showLabel={showLabels}
          enableAnimations={enableAnimations}
          position={hotspot.position}
        />
      ))}

      {/* Category legend */}
      {showCategories && (
        <div className="absolute top-4 right-4 z-40">
          <Card className="p-3 bg-white/90">
            <h4 className="font-semibold mb-2 text-sm">Hotspot Types</h4>
            <div className="space-y-1">
              {Object.entries(HOTSPOT_STYLES).map(([type, style]) => {
                const count = hotspots.filter(h => h.type === type).length;
                if (count === 0) return null;
                
                return (
                  <div key={type} className="flex items-center gap-2 text-xs">
                    <div className={`w-3 h-3 rounded-full ${style.backgroundColor}`} />
                    <span className="capitalize">{type.replace('-', ' ')}</span>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {count}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Active hotspot indicator */}
      {hoveredHotspot && (
        <div className="absolute bottom-4 left-4 z-40">
          <Card className="p-3 bg-white/90">
            <div className="flex items-center gap-2">
              {HOTSPOT_STYLES[hoveredHotspot.type]?.icon}
              <div>
                <p className="font-medium text-sm">{hoveredHotspot.title}</p>
                <p className="text-xs text-gray-600">Click to interact</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Hotspot details modal */}
      <Dialog open={showInfoModal} onOpenChange={setShowInfoModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Hotspot Details</DialogTitle>
          </DialogHeader>
          {selectedHotspot && renderHotspotDetails(selectedHotspot)}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HotspotOverlay;