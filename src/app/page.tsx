'use client';

import { useState, useEffect } from 'react';
import { FileUpload } from '@/components/file-upload';
import { Sidebar } from '@/components/sidebar';
import { LogDisplay } from '@/components/log-display';
import { Menu, X, FileText, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

// ホームページ
export default function Home() {
  const router = useRouter();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>('ユーザー');
  const [logs, setLogs] = useState<any[]>([]);
  
  // モックユーザー
  const mockUser = {
    id: 'mock-user-id',
    email: 'dev@example.com'
  };
  
  // ローカルストレージから表示名を取得
  useEffect(() => {
    const storedName = localStorage.getItem('mockDisplayName');
    if (storedName) {
      setDisplayName(storedName);
    }
  }, []);

  // ログアウト処理
  const handleLogout = async () => {
    router.push('/login');
  };
  
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
          <header className="flex items-center p-4 bg-card relative">
            {/* 左側のメニューボタン */}
            <div className="absolute left-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="md:hidden"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
            
            {/* 中央のタイトル */}
            <h1 className="text-xl font-semibold mx-auto text-center">領収書アップロードシステム</h1>
            
            {/* 右側のユーザー情報とログアウトボタン */}
            <div className="absolute right-4 flex items-center gap-2">
              <span className="hidden text-sm md:inline-block">
                {displayName || mockUser.email}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="ログアウト"
              >
                <LogOut className="h-4 w-4" />
              </Button>
              {/* 開発モード表示を削除 */}
            </div>
          </header>
          
          <div className="flex-1 overflow-auto">
            <div className="h-full flex flex-col md:grid md:grid-cols-[1fr,2fr] gap-4 md:gap-6 p-2 md:p-6">
              {/* モバイル表示時は順序を入れ替え */}
              
              {/* ファイルアップロード部分 */}
              <div className="flex flex-col order-2 md:order-1">
                <FileUpload onImageSelect={setSelectedImage} onLogsUpdate={updateLogs} />
              </div>
              
              {/* 処理ログ部分 */}
              <div className="flex flex-col order-1 md:order-2 mb-4 md:mb-0">
                <div className="flex-1 bg-background/50 backdrop-blur-sm rounded-lg border shadow-sm">
                  <div className="flex items-center gap-2 p-2 md:p-4">
                    <FileText className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    <h2 className="text-base md:text-lg font-medium">処理ログ</h2>
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

/*
// Supabase認証を使用したホームページ（Supabaseプロジェクト設定後に有効化）
import { useSupabase } from '@/components/supabase-provider';

export default function Home() {
  const router = useRouter();
  const { supabase, user, loading } = useSupabase();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const [logs, setLogs] = useState<any[]>([]);
  
  // ユーザープロフィールの取得
  useEffect(() => {
    const getProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }

        if (data) {
          setDisplayName(data.display_name || '');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    getProfile();
  }, [user, supabase]);

  // ログアウト処理
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };
  
  // 初回ログイン時にプロフィール設定ページにリダイレクト
  useEffect(() => {
    if (user && !displayName) {
      router.push('/profile');
    }
  }, [user, displayName, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg">読み込み中...</p>
        </div>
      </div>
    );
  }
  
  // ...残りのコンポーネント
}
*/
