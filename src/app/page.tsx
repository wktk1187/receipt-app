'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// ルートページは直接ログインページにリダイレクト
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // ページ読み込み時に自動的にログインページにリダイレクト
    router.push('/login');
  }, [router]);

  // リダイレクト中は何も表示しない
  return null;
}

/*
// Supabase認証を使用したホームページ（Supabaseプロジェクト設定後に有効化）
import { useSupabase } from '@/components/supabase-provider';

export default function Home() {
  const router = useRouter();
  const { supabase, user, loading } = useSupabase();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);

  // ログアウト処理
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

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
