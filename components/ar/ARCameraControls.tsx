'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  CameraOff, 
  RotateCcw, 
  Camera as CameraIcon,
  Flashlight,
  FlashlightOff,
  Settings,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Monitor,
  Smartphone
} from 'lucide-react';

interface CameraSettings {
  quality: 'low' | 'medium' | 'high' | 'ultra';
  resolution: '480p' | '720p' | '1080p' | '4k';
  frameRate: 24 | 30 | 60;
  format: 'jpeg' | 'png' | 'webp';
  flash: 'off' | 'on' | 'auto';
  whiteBalance: 'auto' | 'daylight' | 'cloudy' | 'tungsten';
  exposure: number;
  zoom: number;
  focus: number;
}

interface ARCameraControlsProps {
  isActive: boolean;
  onToggle: () => void;
  onSettingsChange: (settings: Partial<CameraSettings>) => void;
  onCapture: () => void;
  onRecord?: () => void;
  onStopRecord?: () => void;
  isRecording?: boolean;
  className?: string;
}

const ARCameraControls: React.FC<ARCameraControlsProps> = ({
  isActive,
  onToggle,
  onSettingsChange,
  onCapture,
  onRecord,
  onStopRecord,
  isRecording = false,
  className = ''
}) => {
  const [cameraSettings, setCameraSettings] = useState<CameraSettings>({
    quality: 'high',
    resolution: '1080p',
    frameRate: 30,
    format: 'jpeg',
    flash: 'auto',
    whiteBalance: 'auto',
    exposure: 0,
    zoom: 1,
    focus: 0
  });

  const [showSettings, setShowSettings] = useState(false);
  const [cameraInfo, setCameraInfo] = useState({
    devices: [] as MediaDeviceInfo[],
    currentDevice: '',
    permissions: 'unknown' as PermissionState,
    streamActive: false
  });

  const [uiState, setUiState] = useState({
    isFullscreen: false,
    showPreview: false,
    lastCapture: null as string | null,
    recordingTime: 0
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    enumerateCameras();
    checkPermissions();
    
    return () => {
      stopCamera();
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isActive && cameraSettings) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [isActive, cameraSettings]);

  const enumerateCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      setCameraInfo(prev => ({
        ...prev,
        devices: cameras,
        currentDevice: cameras[0]?.deviceId || ''
      }));
    } catch (error) {
      console.error('Failed to enumerate cameras:', error);
    }
  };

  const checkPermissions = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setCameraInfo(prev => ({ ...prev, permissions: permission.state }));
      
      permission.addEventListener('change', () => {
        setCameraInfo(prev => ({ ...prev, permissions: permission.state }));
      });
    } catch (error) {
      console.error('Failed to check camera permissions:', error);
    }
  };

  const startCamera = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: cameraInfo.currentDevice ? { exact: cameraInfo.currentDevice } : undefined,
          width: getResolutionValue(cameraSettings.resolution),
          height: getResolutionHeight(cameraSettings.resolution),
          frameRate: { ideal: cameraSettings.frameRate },
          facingMode: 'environment' // Use back camera for AR
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setCameraInfo(prev => ({ ...prev, streamActive: true }));

      // Apply camera settings
      applyCameraSettings(stream);
    } catch (error) {
      console.error('Failed to start camera:', error);
      setCameraInfo(prev => ({ ...prev, streamActive: false }));
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraInfo(prev => ({ ...prev, streamActive: false }));
  };

  const applyCameraSettings = (stream: MediaStream) => {
    // Apply focus, exposure, and other settings to the camera stream
    // This would typically involve more complex camera API usage
    // For now, we'll focus on basic controls
  };

  const getResolutionValue = (resolution: string): number => {
    switch (resolution) {
      case '480p': return 854;
      case '720p': return 1280;
      case '1080p': return 1920;
      case '4k': return 3840;
      default: return 1280;
    }
  };

  const getResolutionHeight = (resolution: string): number => {
    switch (resolution) {
      case '480p': return 480;
      case '720p': return 720;
      case '1080p': return 1080;
      case '4k': return 2160;
      default: return 720;
    }
  };

  const handleSettingsChange = useCallback((newSettings: Partial<CameraSettings>) => {
    const updatedSettings = { ...cameraSettings, ...newSettings };
    setCameraSettings(updatedSettings);
    onSettingsChange(updatedSettings);
  }, [cameraSettings, onSettingsChange]);

  const handleCapture = useCallback(() => {
    if (videoRef.current && cameraInfo.streamActive) {
      // Create canvas and capture frame
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        
        // Convert to base64 and store as preview
        const dataURL = canvas.toDataURL(`image/${cameraSettings.format}`);
        setUiState(prev => ({ ...prev, lastCapture: dataURL, showPreview: true }));
      }
      
      onCapture();
    }
  }, [cameraInfo.streamActive, cameraSettings.format, onCapture]);

  const handleRecord = useCallback(() => {
    if (isRecording) {
      // Stop recording
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      onStopRecord?.();
    } else {
      // Start recording
      setUiState(prev => ({ ...prev, recordingTime: 0 }));
      recordingTimerRef.current = setInterval(() => {
        setUiState(prev => ({ ...prev, recordingTime: prev.recordingTime + 1 }));
      }, 1000);
      onRecord?.();
    }
  }, [isRecording, onRecord, onStopRecord]);

  const switchCamera = () => {
    const currentIndex = cameraInfo.devices.findIndex(
      device => device.deviceId === cameraInfo.currentDevice
    );
    const nextIndex = (currentIndex + 1) % cameraInfo.devices.length;
    const nextDevice = cameraInfo.devices[nextIndex];
    
    if (nextDevice) {
      setCameraInfo(prev => ({ ...prev, currentDevice: nextDevice.deviceId }));
    }
  };

  const toggleFullscreen = () => {
    setUiState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }));
  };

  const formatRecordingTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (cameraInfo.permissions === 'denied') {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2 text-red-600">
          <CameraOff className="w-5 h-5" />
          <span className="font-medium">Camera Access Denied</span>
        </div>
        <p className="text-sm text-red-600 mt-2">
          Please enable camera permissions in your browser settings to use AR features.
        </p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Main Camera Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/80 backdrop-blur-lg rounded-2xl p-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-white" />
            <span className="text-white font-medium">Camera Controls</span>
            <Badge 
              variant="secondary" 
              className={cameraInfo.streamActive ? 'bg-green-500' : 'bg-gray-500'}
            >
              {cameraInfo.streamActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowSettings(!showSettings)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <Settings className="w-4 h-4" />
            </Button>

            <Button
              onClick={toggleFullscreen}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              {uiState.isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Camera Preview */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-4">
          <video
            ref={videoRef}
            className="w-full h-48 object-cover"
            playsInline
            muted
          />
          
          {/* Recording Indicator */}
          <AnimatePresence>
            {isRecording && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-4 left-4 flex items-center space-x-2 bg-red-500 px-3 py-1 rounded-full"
              >
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-white text-sm font-medium">
                  {formatRecordingTime(uiState.recordingTime)}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Zoom Indicator */}
          {cameraSettings.zoom !== 1 && (
            <div className="absolute top-4 right-4 bg-black/50 px-2 py-1 rounded text-white text-xs">
              {cameraSettings.zoom.toFixed(1)}x
            </div>
          )}
        </div>

        {/* Primary Controls */}
        <div className="flex items-center justify-center space-x-4 mb-4">
          <Button
            onClick={switchCamera}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            disabled={cameraInfo.devices.length <= 1}
          >
            <RotateCcw className="w-5 h-5" />
          </Button>

          <Button
            onClick={handleCapture}
            variant="default"
            size="lg"
            className="w-16 h-16 rounded-full bg-white text-black hover:bg-gray-100"
            disabled={!cameraInfo.streamActive}
          >
            <CameraIcon className="w-8 h-8" />
          </Button>

          <Button
            onClick={handleRecord}
            variant="outline"
            className={`${isRecording 
              ? 'bg-red-600 border-red-500 text-white hover:bg-red-700' 
              : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
            }`}
          >
            {isRecording ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
        </div>

        {/* Secondary Controls */}
        <div className="flex items-center justify-center space-x-2">
          <Button
            onClick={() => handleSettingsChange({ 
              flash: cameraSettings.flash === 'off' ? 'on' : 'off' 
            })}
            variant="ghost"
            size="sm"
            className={`${cameraSettings.flash === 'on' 
              ? 'text-yellow-400' 
              : 'text-white hover:bg-white/20'
            }`}
          >
            {cameraSettings.flash === 'on' ? <Flashlight className="w-4 h-4" /> : <FlashlightOff className="w-4 h-4" />}
          </Button>

          <Button
            onClick={onToggle}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            {isActive ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
          </Button>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-white/20 space-y-3"
            >
              {/* Quality */}
              <div>
                <label className="block text-white text-sm mb-2">Quality</label>
                <select
                  value={cameraSettings.quality}
                  onChange={(e) => handleSettingsChange({ quality: e.target.value as any })}
                  className="w-full bg-white/10 border border-white/20 rounded px-3 py-1 text-white text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="ultra">Ultra</option>
                </select>
              </div>

              {/* Resolution */}
              <div>
                <label className="block text-white text-sm mb-2">Resolution</label>
                <select
                  value={cameraSettings.resolution}
                  onChange={(e) => handleSettingsChange({ resolution: e.target.value as any })}
                  className="w-full bg-white/10 border border-white/20 rounded px-3 py-1 text-white text-sm"
                >
                  <option value="480p">480p</option>
                  <option value="720p">720p</option>
                  <option value="1080p">1080p</option>
                  <option value="4k">4K</option>
                </select>
              </div>

              {/* Zoom */}
              <div>
                <label className="block text-white text-sm mb-2">
                  Zoom: {cameraSettings.zoom.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={cameraSettings.zoom}
                  onChange={(e) => handleSettingsChange({ zoom: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Device Information */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 bg-black/70 text-white text-xs p-2 rounded font-mono">
          <div>Devices: {cameraInfo.devices.length}</div>
          <div>Active: {cameraInfo.streamActive ? 'Yes' : 'No'}</div>
          <div>Permissions: {cameraInfo.permissions}</div>
          <div>Quality: {cameraSettings.quality}</div>
          <div>Resolution: {cameraSettings.resolution}</div>
          <div>Zoom: {cameraSettings.zoom.toFixed(1)}x</div>
        </div>
      )}
    </div>
  );
};

export default ARCameraControls;