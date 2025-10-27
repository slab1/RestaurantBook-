'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { Camera, X, CameraOff } from 'lucide-react'

interface QrScannerProps {
  onResult?: (result: string) => void
  onClose?: () => void
}

export function QrScannerComponent({ onResult, onClose }: QrScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [hasCamera, setHasCamera] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const startScanning = useCallback(async () => {
    if (!videoRef.current) return

    try {
      setError(null)
      
      // Request camera permission
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      
      setHasCamera(true)
      setIsScanning(true)
      
      videoRef.current.srcObject = mediaStream
      videoRef.current.play()
      
      toast({
        title: 'Camera Active',
        description: 'Demo mode: QR code detection will be implemented with full library.',
      })
    } catch (err) {
      console.error('Camera error:', err)
      setError('Failed to access camera. Please check permissions.')
      setIsScanning(false)
    }
  }, [])

  const stopScanning = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setIsScanning(false)
  }, [])

  const simulateScan = useCallback(() => {
    const demoQR = 'https://restaurantbook.com/restaurant/demo'
    handleScanResult(demoQR)
  }, [])

  const handleScanResult = useCallback((data: string) => {
    stopScanning()
    
    toast({
      title: 'QR Code Scanned!',
      description: 'Processing...',
    })

    // Call the onResult callback with the scanned data
    if (onResult) {
      onResult(data)
    }

    // Close scanner after successful scan
    if (onClose) {
      onClose()
    }
  }, [stopScanning, onResult, onClose])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">QR Code Scanner</h3>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
        
        {!isScanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
            <div className="text-center space-y-4">
              {hasCamera ? (
                <Camera className="h-16 w-16 mx-auto text-white/70" />
              ) : (
                <CameraOff className="h-16 w-16 mx-auto text-white/70" />
              )}
              <div className="space-y-2">
                <p className="text-white font-medium">
                  {error || 'Ready to scan'}
                </p>
                <div className="space-x-2">
                  <Button onClick={startScanning} disabled={!!error}>
                    Start Camera
                  </Button>
                  <Button variant="outline" onClick={simulateScan}>
                    Simulate Scan
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isScanning && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
            <Button
              variant="destructive"
              onClick={stopScanning}
              className="opacity-90 hover:opacity-100"
            >
              Stop Scanning
            </Button>
            <Button
              variant="outline"
              onClick={simulateScan}
              className="bg-white/10 hover:bg-white/20 text-white"
            >
              Simulate QR Code
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="text-sm text-muted-foreground">
          <p>To scan QR codes:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Ensure your browser has camera permissions</li>
            <li>Use a device with a camera</li>
            <li>Use "Simulate QR Code" for demo</li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default QrScannerComponent
