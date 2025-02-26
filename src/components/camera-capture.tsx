"use client"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera, X, RotateCcw } from "lucide-react"

interface CameraCaptureProps {
  onCapture: (imageData: string) => void
  onClose: () => void
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isStreamReady, setIsStreamReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment")
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false)

  useEffect(() => {
    let stream: MediaStream | null = null

    async function setupCamera() {
      try {
        if (stream) {
          stream.getTracks().forEach((track) => track.stop())
        }

        // Try to get the preferred camera first
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: facingMode } },
          })
        } catch (err) {
          // If preferred camera is not available, try any camera
          console.warn("Preferred camera not available, trying any camera")
          stream = await navigator.mediaDevices.getUserMedia({ video: true })
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setIsStreamReady(true)
        }

        // Check if the device has multiple cameras
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter((device) => device.kind === "videoinput")
        setHasMultipleCameras(videoDevices.length > 1)
      } catch (err) {
        console.error("Error accessing camera:", err)
        setError("カメラへのアクセスに失敗しました。カメラの使用を許可してください。")
      }
    }

    setupCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [facingMode])

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d")
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        context.drawImage(videoRef.current, 0, 0)
        const imageData = canvasRef.current.toDataURL("image/jpeg")
        onCapture(imageData)
      }
    }
  }

  const toggleCamera = () => {
    setFacingMode((prevMode) => (prevMode === "environment" ? "user" : "environment"))
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="fixed inset-x-0 top-0 p-4 flex justify-between items-center bg-background/50">
        <h2 className="text-lg font-semibold">カメラで撮影</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-col items-center justify-center h-full">
        {error ? (
          <div className="text-center p-4 bg-destructive/10 rounded-lg">
            <p className="text-destructive">{error}</p>
            <Button onClick={onClose} className="mt-4">
              閉じる
            </Button>
          </div>
        ) : (
          <>
            <div className="relative">
              <video ref={videoRef} autoPlay playsInline className="max-w-full max-h-[70vh] rounded-lg shadow-lg" />
              {hasMultipleCameras && (
                <Button variant="secondary" size="icon" className="absolute top-2 right-2" onClick={toggleCamera}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
            <canvas ref={canvasRef} style={{ display: "none" }} />
            <div className="mt-4">
              <Button onClick={captureImage} disabled={!isStreamReady}>
                <Camera className="mr-2 h-4 w-4" />
                撮影
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

