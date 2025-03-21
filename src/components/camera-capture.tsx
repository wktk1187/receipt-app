"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Camera, X, RotateCcw } from "lucide-react"

interface CameraCaptureProps {
  onCapture: (imageBlob: Blob) => void
  onClose: () => void
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isStreamReady, setIsStreamReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment")
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false)

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }, [])

  const setupCamera = useCallback(async () => {
    try {
      stopStream()

      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      }

      try {
        streamRef.current = await navigator.mediaDevices.getUserMedia(constraints)
      } catch (err) {
        console.warn("Preferred camera not available, trying any camera")
        streamRef.current = await navigator.mediaDevices.getUserMedia({ video: true })
      }

      if (videoRef.current && streamRef.current) {
        videoRef.current.srcObject = streamRef.current
        setIsStreamReady(true)
        setError(null)
      }

      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === "videoinput")
      setHasMultipleCameras(videoDevices.length > 1)
    } catch (err) {
      console.error("Error accessing camera:", err)
      setError("カメラへのアクセスに失敗しました。カメラの使用を許可してください。")
      setIsStreamReady(false)
    }
  }, [facingMode, stopStream])

  useEffect(() => {
    setupCamera()
    return () => {
      stopStream()
    }
  }, [setupCamera, stopStream])

  const captureImage = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isStreamReady) return

    try {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")
      
      if (!context) return

      // Set canvas size to match video dimensions
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw the video frame to the canvas
      context.drawImage(video, 0, 0)

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          blob => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error("Failed to convert canvas to blob"))
            }
          },
          "image/jpeg",
          0.95
        )
      })

      onCapture(blob)
    } catch (err) {
      console.error("Error capturing image:", err)
      setError("画像の取得に失敗しました。もう一度お試しください。")
    }
  }, [isStreamReady, onCapture])

  const toggleCamera = useCallback(() => {
    setFacingMode(prev => prev === "environment" ? "user" : "environment")
  }, [])

  const handleClose = useCallback(() => {
    stopStream()
    onClose()
  }, [stopStream, onClose])

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="fixed inset-x-0 top-0 p-4 flex justify-between items-center bg-background/50">
        <h2 className="text-lg font-semibold">カメラで撮影</h2>
        <Button variant="ghost" size="icon" onClick={handleClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex flex-col items-center justify-center h-full">
        {error ? (
          <div className="text-center p-4 bg-destructive/10 rounded-lg">
            <p className="text-destructive">{error}</p>
            <Button onClick={handleClose} className="mt-4">
              閉じる
            </Button>
          </div>
        ) : (
          <>
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="max-w-full max-h-[70vh] rounded-lg shadow-lg"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {hasMultipleCameras && (
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-2 right-2 bg-background/50 backdrop-blur-sm"
                  onClick={toggleCamera}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="fixed bottom-0 inset-x-0 p-4 bg-background/50 backdrop-blur-sm">
              <div className="flex justify-center gap-4 max-w-md mx-auto">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleClose}
                >
                  キャンセル
                </Button>
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={captureImage}
                  disabled={!isStreamReady}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  撮影
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
