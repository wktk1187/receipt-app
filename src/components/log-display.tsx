"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle, Clock, XCircle, FileText, Calendar, DollarSign, Tag, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Log {
  id?: string
  status: "complete" | "processing" | "error"
  message: string
  timestamp?: Date
  details?: {
    fileName?: string
    date?: string
    category?: string
    amount?: string
    errorCode?: string
  }
}

interface LogDisplayProps {
  logs?: Log[]
}

export function LogDisplay({ logs = [] }: LogDisplayProps) {
  const getStatusIcon = (status: Log["status"]) => {
    switch (status) {
      case "complete":
        return (
          <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-1.5 flex items-center justify-center">
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
        )
      case "processing":
        return (
          <div className="bg-primary/10 rounded-full p-1.5 flex items-center justify-center">
            <Clock className="h-4 w-4 text-primary animate-pulse" />
          </div>
        )
      case "error":
        return (
          <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-1.5 flex items-center justify-center">
            <XCircle className="h-4 w-4 text-red-500" />
          </div>
        )
    }
  }

  const getStatusClass = (status: Log["status"]) => {
    switch (status) {
      case "complete":
        return "text-green-500 dark:text-green-400"
      case "processing":
        return "text-primary"
      case "error":
        return "text-red-500 dark:text-red-400"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <div className="h-[calc(100%-4rem)]">
      <ScrollArea className="h-full px-4 pb-4">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Clock className="h-8 w-8 mb-2" />
            ログはまだありません
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log, index) => (
              <div
                key={log.id || index}
                className={cn(
                  "relative flex items-start gap-3 p-3 rounded-lg border transition-colors",
                  log.status === "complete" ? "bg-green-50/50 dark:bg-green-950/30 border-green-100 dark:border-green-900" :
                  log.status === "error" ? "bg-red-50/50 dark:bg-red-950/30 border-red-100 dark:border-red-900" :
                  "bg-blue-50/50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900",
                  "animate-fade-in hover:bg-card/50"
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(log.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-medium mb-1 break-words",
                    getStatusClass(log.status)
                  )}>
                    {log.message}
                  </p>
                  {log.details && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                      {log.details.fileName && (
                        <div className="flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5 text-primary/60 flex-shrink-0" />
                          <span className="truncate">{log.details.fileName}</span>
                        </div>
                      )}
                      {log.details.date && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-primary/60 flex-shrink-0" />
                          <span>{log.details.date}</span>
                        </div>
                      )}
                      {log.details.category && (
                        <div className="flex items-center gap-1.5">
                          <Tag className="h-3.5 w-3.5 text-primary/60 flex-shrink-0" />
                          <span>{log.details.category}</span>
                        </div>
                      )}
                      {log.details.amount && (
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="h-3.5 w-3.5 text-primary/60 flex-shrink-0" />
                          <span className="font-medium">{log.details.amount}</span>
                        </div>
                      )}
                      {log.details.errorCode && (
                        <div className="col-span-2 flex items-center gap-1.5 mt-1 text-red-500 bg-red-50 dark:bg-red-950/50 px-2 py-1 rounded">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span>エラーコード: {log.details.errorCode}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
