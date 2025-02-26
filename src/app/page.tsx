'use client';

import { useState, useEffect } from 'react';
import { FileUpload } from '@/components/file-upload';
import { Sidebar } from '@/components/sidebar';
import { LogDisplay } from '@/components/log-display';
import { Menu, X, Sun, Moon, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

export default function Home() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const { theme, setTheme } = useTheme();
  
  // テーマ切替のマウント後のみ実行
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // ログを更新する関数
  const updateLogs = (newLogs: any[]) => {
    setLogs(newLogs);
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* サイドバー */}
      <div className="hidden md:block">
        <Sidebar isOpen={true} onClose={() => {}} />
      </div>
      
      {/* モバイル用サイドバー */}
      <div className="md:hidden">
        <Sidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          <header className="flex justify-between items-center p-4 bg-card">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="md:hidden"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-semibold">領収書アップロードシステム</h1>
            </div>
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="text-primary hover:text-primary/80"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            )}
          </header>
          
          <div className="flex-1 overflow-auto">
            <div className="h-full grid grid-cols-1 md:grid-cols-[1fr,2fr] gap-4 md:gap-6 p-4 md:p-6">
              {/* 左側: ファイルアップロード */}
              <div className="flex flex-col min-h-[300px] md:min-h-0">
                <FileUpload onImageSelect={setSelectedImage} onLogsUpdate={updateLogs} />
              </div>
              
              {/* 右側: 処理ログ */}
              <div className="flex flex-col h-full min-h-[400px] md:min-h-0">
                <div className="flex-1 bg-background/50 backdrop-blur-sm rounded-lg border shadow-sm">
                  <div className="flex items-center gap-2 p-4">
                    <FileText className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-medium">処理ログ</h2>
                  </div>
                  <LogDisplay logs={logs} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
