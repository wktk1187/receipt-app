import { CheckCircle, Clock, XCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface ProcessingStatusProps {
  status?: "idle" | "processing" | "completed" | "error";
  progress?: number;
}

export function ProcessingStatus({
  status = "idle",
  progress = 0
}: ProcessingStatusProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "completed":
        return (
          <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-1.5 flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
        )
      case "processing":
        return (
          <div className="bg-primary/10 rounded-full p-1.5 flex items-center justify-center">
            <Clock className="h-5 w-5 text-primary animate-pulse" />
          </div>
        )
      case "error":
        return (
          <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-1.5 flex items-center justify-center">
            <XCircle className="h-5 w-5 text-red-500" />
          </div>
        )
      default:
        return (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-1.5 flex items-center justify-center">
            <Clock className="h-5 w-5 text-muted-foreground" />
          </div>
        )
    }
  }

  const getStatusText = () => {
    switch (status) {
      case "completed":
        return "完了"
      case "processing":
        return "処理中"
      case "error":
        return "エラー"
      default:
        return "待機中"
    }
  }

  const getProgressValue = () => {
    if (status === "completed") return 100;
    if (status === "error") return 100;
    return progress;
  }

  const getProgressColor = () => {
    if (status === "error") return "bg-red-500";
    if (status === "completed") return "bg-green-500";
    if (status === "processing") return "bg-primary";
    return "bg-primary/30";
  }

  // ステータスに応じたクラスを取得
  const getStatusClass = () => {
    switch (status) {
      case "completed":
        return "text-green-600 dark:text-green-400 font-medium";
      case "processing":
        return "text-primary font-medium";
      case "error":
        return "text-red-600 dark:text-red-400 font-medium";
      default:
        return "text-muted-foreground";
    }
  }

  if (status === "idle") return null;

  return (
    <div className="card p-4 space-y-3 animate-fade-in">
      <div className="flex items-center gap-3">
        {getStatusIcon()}
        <span className={cn("text-base", getStatusClass())}>
          処理状態: {getStatusText()}
        </span>
      </div>
      <Progress
        value={getProgressValue()}
        className={`h-3 rounded-full ${getProgressColor()}`}
      />
    </div>
  )
}

