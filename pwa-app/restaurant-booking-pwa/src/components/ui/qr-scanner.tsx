'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from './button'
import { Camera, X, Download, Upload } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog'
import QrScanner from 'qr-scanner'

interface QRScannerProps {
  onScan: (result: string) => void
  onClose: () => void
  isOpen: boolean
  title?: string
}

export function QRScanner({ onScan, onClose, isOpen, title = 'Scan QR Code' }: QRScannerProps) {
  const [qrScanner, setQrScanner] = useState<QrScanner | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt')
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && videoRef.current) {
      startScanner()
    } else {
      stopScanner()
    }

    return () => {
      stopScanner()
    }
  }, [isOpen])

  const startScanner = async () => {
    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(track => track.stop()) // Stop immediately to check permission

      setCameraPermission('granted')
      const scanner = new QrScanner(
        videoRef.current!,
        (result) => {
          onScan(result.data)
          onClose()
        },
        {
          preferredCamera: 'environment',
          highlightScanRegion: true,
          highlightCodeOutline: true,
          maxScansPerSecond: 1,
        }
      )

      setQrScanner(scanner)
      await scanner.start()
      setError(null)
    } catch (err) {
      console.error('Camera access error:', err)
      setCameraPermission('denied')
      setError('Camera access denied. Please allow camera permissions to scan QR codes.')
    }
  }

  const stopScanner = () => {
    if (qrScanner) {
      qrScanner.stop()
      qrScanner.destroy()
      setQrScanner(null)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    QrScanner.scanImage(file)
      .then(result => {
        onScan(result)
        onClose()
      })
      .catch(err => {
        setError('Could not scan QR code from image. Please try again.')
      })
  }

  if (cameraPermission === 'denied') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <Camera className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              Camera access is required to scan QR codes. Please enable camera permissions in your browser settings and try again.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Image
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
          {error && (
            <div className="text-center text-sm text-destructive">
              {error}
            </div>
          )}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle>{title}</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full h-64 bg-black rounded-none"
            playsInline
            muted
          />
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
              <div className="text-center text-white p-4">
                <Camera className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">{error}</p>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 bg-white text-black hover:bg-gray-100"
                >
                  Upload Image Instead
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 pt-4">
          <p className="text-sm text-muted-foreground text-center">
            Position the QR code within the camera view to scan
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}