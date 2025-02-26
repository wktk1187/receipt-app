import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ExternalLink, FileText, Database, Wallet, Receipt, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* オーバーレイ（モバイルのみ） */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* サイドバー本体 */}
      <div
        className={cn(
          "fixed md:static inset-y-0 left-0 bg-card transition-transform duration-300 shadow-lg h-screen z-50 md:z-0 w-80",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="h-full flex flex-col">
          {/* モバイル版のみ閉じるボタンを表示 */}
          <div className="p-4 flex justify-end md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-4">
              <div className="text-center pb-2 border-b">
                <h2 className="text-lg font-semibold">連携サービス</h2>
              </div>
              
              {/* Notion */}
              <div className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors">
                <a
                  href={process.env.NEXT_PUBLIC_NOTION_PAGE_URL || "https://www.notion.so"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-gray-600" />
                    <div>
                      <div className="font-medium">Notion Database</div>
                      <div className="text-sm text-gray-500">領収書データの管理</div>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </a>
              </div>

              {/* Google Drive */}
              <div className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors">
                <a
                  href={process.env.NEXT_PUBLIC_GOOGLE_DRIVE_URL || "https://drive.google.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-600" />
                    <div>
                      <div className="font-medium">Google Drive</div>
                      <div className="text-sm text-gray-500">PDFファイルの保存</div>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </a>
              </div>

              {/* マネーフォワード */}
              <div className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors">
                <a
                  href="https://moneyforward.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">マネーフォワード</div>
                      <div className="text-sm text-gray-500">家計簿・経費管理</div>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </a>
              </div>

              {/* freee */}
              <div className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors">
                <a
                  href="https://www.freee.co.jp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Receipt className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">freee</div>
                      <div className="text-sm text-gray-500">会計・確定申告</div>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </a>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  )
}
