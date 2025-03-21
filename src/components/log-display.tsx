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
  // ステータスアイコンを取得する関数
  const getStatusIcon = (status: Log["status"]) => {
    switch (status) {
      case "complete":
        return (
          <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-full p-2 flex items-center justify-center shadow-sm">
            <CheckCircle className="h-5 w-5 text-white" />
          </div>
        )
      case "processing":
        return (
          <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-full p-2 flex items-center justify-center shadow-sm">
            <Clock className="h-5 w-5 text-white animate-pulse" />
          </div>
        )
      case "error":
        return (
          <div className="bg-gradient-to-br from-red-400 to-red-500 rounded-full p-2 flex items-center justify-center shadow-sm">
            <XCircle className="h-5 w-5 text-white" />
          </div>
        )
    }
  }

  // ステータスに応じたテキストカラーを取得する関数
  const getStatusClass = (status: Log["status"]) => {
    switch (status) {
      case "complete":
        return "text-green-600 dark:text-green-400"
      case "processing":
        return "text-blue-600"
      case "error":
        return "text-red-600 dark:text-red-400"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <div className="h-[calc(100%-4rem)]">
      <ScrollArea className="h-full px-4 pb-4">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <Clock className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-lg font-medium text-gray-500">ログはまだありません</p>
            <p className="text-sm text-gray-400 mt-2">領収書をアップロードすると、ここに処理ログが表示されます</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log, index) => (
              <div
                key={log.id || index}
                className={cn(
                  "relative p-4 rounded-xl border transition-all shadow-sm hover:shadow-md",
                  log.status === "complete" ? "bg-gradient-to-r from-green-50 to-white border-green-200" :
                  log.status === "error" ? "bg-gradient-to-r from-red-50 to-white border-red-200" :
                  "bg-gradient-to-r from-blue-50 to-white border-blue-200",
                  "animate-fade-in"
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {getStatusIcon(log.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className={cn(
                        "font-semibold text-lg break-words",
                        getStatusClass(log.status)
                      )}>
                        {log.message}
                      </p>
                      {log.timestamp && (
                        <span className="text-xs text-gray-400">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                    
                    {log.details && (
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-3">
                          {log.details.fileName && (
                            <div className="w-full flex items-center gap-2 mb-2">
                              <div className="bg-gray-100 p-1.5 rounded-full">
                                <FileText className="h-4 w-4 text-gray-600" />
                              </div>
                              <span className="text-xs text-gray-600 truncate max-w-[200px]">{log.details.fileName}</span>
                            </div>
                          )}
                          
                          {/* 日付、金額、カテゴリを一列で3つ横に並べる - レスポンシブ対応 */}
                          <div className="flex flex-row gap-1 w-full mt-3">
                            {log.details.date && (
                              <div className="flex-1 flex items-center justify-center bg-blue-50 rounded-lg py-2 px-0 md:py-2 md:px-0">
                                <div className="bg-blue-500 p-0.5 md:p-1 rounded-full mr-0.5 md:mr-1">
                                  <Calendar className="h-2.5 w-2.5 md:h-3 md:w-3 text-white" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[8px] md:text-[9px] text-blue-600 uppercase font-semibold tracking-wider">日付</span>
                                  <span className="text-[10px] md:text-xs font-medium text-blue-800">{log.details.date}</span>
                                </div>
                              </div>
                            )}
                            
                            {log.details.amount && (
                              <div className="flex-1 flex items-center justify-center bg-red-50 rounded-lg py-2 px-0 md:py-2 md:px-0">
                                <div className="bg-red-500 p-0.5 md:p-1 rounded-full mr-0.5 md:mr-1">
                                  <DollarSign className="h-2.5 w-2.5 md:h-3 md:w-3 text-white" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[8px] md:text-[9px] text-red-600 uppercase font-semibold tracking-wider">金額</span>
                                  <span className="text-[10px] md:text-xs font-medium text-red-800">{log.details.amount}</span>
                                </div>
                              </div>
                            )}
                            
                            {log.details.category && (
                              <div className="flex-1 flex items-center justify-center bg-yellow-50 rounded-lg py-2 px-0 md:py-2 md:px-0">
                                <div className="bg-yellow-500 p-0.5 md:p-1 rounded-full mr-0.5 md:mr-1">
                                  <Tag className="h-2.5 w-2.5 md:h-3 md:w-3 text-white" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[8px] md:text-[9px] text-yellow-600 uppercase font-semibold tracking-wider">カテゴリ</span>
                                  <span className="text-[10px] md:text-xs font-medium text-yellow-800">{log.details.category}</span>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {log.details.errorCode && (
                            <div className="w-full flex items-center gap-2 mt-2 bg-gradient-to-r from-red-50 to-red-100 px-3 py-2 rounded-lg shadow-sm">
                              <div className="bg-red-500 p-1.5 rounded-full">
                                <AlertTriangle className="h-3.5 w-3.5 text-white" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] text-red-600 uppercase font-semibold tracking-wider">エラー</span>
                                <span className="text-sm font-medium text-red-800">コード: {log.details.errorCode}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
