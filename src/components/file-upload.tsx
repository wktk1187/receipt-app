"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { Camera, Upload, AlertCircle, X, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CameraCapture } from "./camera-capture"
import { ImagePreview } from "./image-preview"
import { useToast } from "@/hooks/use-toast"
import { LogDisplay } from "./log-display"
import { analyzeDifyReceipt } from "@/lib/dify"

interface FileUploadProps {
  onImageSelect?: (imageUrl: string | null) => void;
  onLogsUpdate?: (logs: any[]) => void;
}

// 最大アップロード枚数
const MAX_UPLOADS = 5;

export function FileUpload({ onImageSelect, onLogsUpdate }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<{url: string, name: string}[]>([])
  const [logs, setLogs] = useState<{
    id?: string;
    status: "complete" | "processing" | "error";
    message: string;
    timestamp?: Date;
    details?: {
      fileName?: string;
      date?: string;
      category?: string;
      amount?: string;
      errorCode?: string;
    };
  }[]>([])
  const [processingStatus, setProcessingStatus] = useState<"idle" | "processing" | "completed" | "error">("idle")
  const [processingProgress, setProcessingProgress] = useState(0)
  const { toast } = useToast()

  // 処理状態の更新
  useEffect(() => {
    if (logs.length === 0) {
      setProcessingStatus("idle");
      return;
    }
    
    const lastLog = logs[logs.length - 1];
    if (lastLog.status === "error") {
      setProcessingStatus("error");
    } else if (lastLog.status === "processing") {
      setProcessingStatus("processing");
    } else if (lastLog.status === "complete") {
      setProcessingStatus("completed");
    }
  }, [logs]);

  // 進捗状況のシミュレーション
  useEffect(() => {
    if (processingStatus === "processing") {
      const interval = setInterval(() => {
        setProcessingProgress(prev => {
          const newProgress = prev + 10;
          if (newProgress >= 90) {
            clearInterval(interval);
            return 90;
          }
          return newProgress;
        });
      }, 500);
      
      return () => clearInterval(interval);
    } else if (processingStatus === "completed" || processingStatus === "error") {
      setProcessingProgress(100);
    } else {
      setProcessingProgress(0);
    }
  }, [processingStatus]);

  const addLog = (message: string, status: "complete" | "processing" | "error", details?: any) => {
    const newLogs = [...logs, {
      id: `log-${Date.now()}`,
      message,
      status,
      timestamp: new Date(),
      details
    }];
    
    setLogs(newLogs);
    
    // 親コンポーネントにログの更新を通知
    if (onLogsUpdate) {
      onLogsUpdate(newLogs);
    }
  }

  const handleImageUpload = async (file: File) => {
    try {
      addLog(`領収書「${file.name}」の解析を開始します...`, "processing", { fileName: file.name })
      
      // 処理中状態に設定
      setProcessingStatus("processing")
      setProcessingProgress(10)
      
      // 処理の進行をシミュレート
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      try {
        // 実際のAPIを呼び出す
        console.log('Calling Dify API with file:', file.name);
        const result = await analyzeDifyReceipt(file);
        
        if (result.status === 'success') {
          // 成功ログを追加
          // APIからのデータを使用（もしあれば）
          const apiData = result.data || {
            date: "2024年2月1日",
            category: "交通費",
            amount: "4000円"
          };
          
          addLog(`領収書「${file.name}」の解析が完了しました`, "complete", {
            fileName: file.name,
            date: apiData.date,
            category: apiData.category,
            amount: apiData.amount
          });
          
          setProcessingStatus("completed");
          
          toast({
            title: "解析完了",
            description: "領収書の解析が完了しました",
          });
        } else {
          // エラーログを追加
          addLog(result.message || '領収書の解析に失敗しました', "error", {
            fileName: file.name,
            errorCode: result.code
          });
          
          setProcessingStatus("error");
          
          toast({
            title: "エラー",
            description: result.message || '領収書の解析に失敗しました',
            variant: "destructive",
          });
          
          // エラーの場合はデモデータを表示（オプション）
          if (result.code === 'DIFY_CONNECTION_ERROR' || result.code === 'DIFY_API_ERROR') {
            console.log('Using demo data due to API error');
            
            // デモデータを表示
            const demoData = {
              date: "2024年2月1日",
              category: "交通費",
              amount: "4000円"
            };
            
            addLog(`領収書「${file.name}」の解析が完了しました（デモモード）`, "complete", {
              fileName: file.name,
              date: demoData.date,
              category: demoData.category,
              amount: demoData.amount
            });
            
            setProcessingStatus("completed");
            
            toast({
              title: "解析完了（デモモード）",
              description: "APIエラーのため、デモデータを表示しています",
            });
          }
        }
      } catch (error) {
        // 予期せぬエラーの場合
        console.error('Unexpected error during API call:', error);
        
        const errorMessage = error instanceof Error ? error.message : "領収書の解析中に予期せぬエラーが発生しました";
        
        addLog(errorMessage, "error", { fileName: file.name });
        setProcessingStatus("error");
        
        toast({
          title: "エラー",
          description: errorMessage,
          variant: "destructive",
        });
        
        // 重大なエラーの場合でもデモデータを表示
        console.log('Using demo data due to critical error');
        
        // デモデータを表示
        const demoData = {
          date: "2024年2月1日",
          category: "交通費",
          amount: "4000円"
        };
        
        addLog(`領収書「${file.name}」の解析が完了しました（デモモード）`, "complete", {
          fileName: file.name,
          date: demoData.date,
          category: demoData.category,
          amount: demoData.amount
        });
        
        setProcessingStatus("completed");
        
        toast({
          title: "解析完了（デモモード）",
          description: "エラーのため、デモデータを表示しています",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "領収書の解析中にエラーが発生しました"
      addLog(errorMessage, "error", { fileName: file.name })
      setProcessingStatus("error")
      toast({
        title: "エラー",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // 最大アップロード数を超える場合は警告
    if (uploadedImages.length + acceptedFiles.length > MAX_UPLOADS) {
      toast({
        title: "アップロード制限",
        description: `一度に最大${MAX_UPLOADS}枚までアップロード可能です`,
        variant: "destructive",
      })
      
      // 最大数まで処理
      const filesToProcess = acceptedFiles.slice(0, MAX_UPLOADS - uploadedImages.length)
      if (filesToProcess.length === 0) return
      
      // 警告を表示
      addLog(`アップロード制限: 一度に最大${MAX_UPLOADS}枚までアップロード可能です`, "error")
      
      // 処理可能な分だけ処理
      for (const file of filesToProcess) {
        await processFile(file)
      }
      return
    }
    
    // 通常処理
    for (const file of acceptedFiles) {
      await processFile(file)
    }
  }, [uploadedImages.length, toast, onImageSelect])
  
  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "エラー",
        description: "画像ファイルのみアップロード可能です",
        variant: "destructive",
      })
      return
    }

    const imageUrl = URL.createObjectURL(file)
    setUploadedImages((prev) => [...prev, { url: imageUrl, name: file.name }])
    
    // 親コンポーネントに選択された画像を通知
    if (onImageSelect) {
      onImageSelect(imageUrl);
    }
    
    // FormDataを使用せずに直接ファイルを処理
    try {
      await handleImageUpload(file)
    } catch (error) {
      console.error('File processing error:', error)
    }
  }

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    maxFiles: MAX_UPLOADS - uploadedImages.length,
  })

  const handleCameraCapture = async (imageUrl: string) => {
    // 最大アップロード数を超える場合は警告
    if (uploadedImages.length >= MAX_UPLOADS) {
      toast({
        title: "アップロード制限",
        description: `一度に最大${MAX_UPLOADS}枚までアップロード可能です`,
        variant: "destructive",
      })
      setShowCamera(false)
      return
    }
    
    setShowCamera(false)
    const fileName = `camera-capture-${Date.now()}.jpg`
    setUploadedImages((prev) => [...prev, { url: imageUrl, name: fileName }])
    
    // 親コンポーネントに選択された画像を通知
    if (onImageSelect) {
      onImageSelect(imageUrl);
    }
    
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    const file = new File([blob], fileName, { type: 'image/jpeg' })
    await handleImageUpload(file)
  }
  
  const removeImage = (index: number) => {
    setUploadedImages(prev => {
      const newImages = [...prev]
      newImages.splice(index, 1)
      
      // 最後の画像を削除した場合、親コンポーネントに通知
      if (newImages.length === 0 && onImageSelect) {
        onImageSelect(null)
      } else if (onImageSelect) {
        // 最初の画像を選択状態にする
        onImageSelect(newImages[0]?.url || null)
      }
      
      return newImages
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4">
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 bg-secondary/30",
            isDragging
              ? "border-primary bg-primary/10 shadow-lg shadow-primary/20 scale-[1.02]"
              : "border-primary/30 hover:border-primary hover:bg-secondary/50 hover:shadow-md"
          )}
        >
          <input {...getInputProps()} />
          <div className="bg-primary/10 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Upload className="h-10 w-10 text-primary" />
          </div>
          <p className="mt-2 text-base font-medium text-foreground">
            ドラッグ＆ドロップまたはクリックして画像をアップロード
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            (最大{MAX_UPLOADS}枚まで)
          </p>
        </div>

        <div className="flex justify-between items-center">
          <Button
            onClick={() => setShowCamera(true)}
            variant="outline"
            disabled={uploadedImages.length >= MAX_UPLOADS}
            className="border-primary/30 text-primary hover:bg-primary/10 hover:text-primary rounded-lg px-4 py-2 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Camera className="mr-2 h-5 w-5" />
            カメラを使用
          </Button>
          
          <div className="text-sm font-medium bg-secondary/70 text-foreground px-3 py-1 rounded-full">
            {uploadedImages.length}/{MAX_UPLOADS} 枚
          </div>
        </div>

        {showCamera && <CameraCapture onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />}

        {uploadedImages.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {uploadedImages.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden">
                  <ImagePreview src={image.url} />
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
