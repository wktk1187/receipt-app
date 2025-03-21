'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// 開発モード用のモックプロフィールページ
export default function ProfilePage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('開発ユーザー')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // モックのプロフィール保存処理
  const saveProfile = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(false)

      // 開発モードではローカルストレージに保存するだけ
      localStorage.setItem('mockDisplayName', displayName)
      
      // 成功メッセージを表示
      setSuccess(true)
      
      // ホームページにリダイレクト
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } catch (err) {
      setError('予期せぬエラーが発生しました')
      console.error('Error saving profile:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg border bg-card p-6 shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold">プロフィール設定</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            表示名を設定して、アプリを使い始めましょう
          </p>
          <p className="mt-2 text-xs text-blue-500">
            （開発モード: Supabase認証なしで動作中）
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">表示名</Label>
            <Input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="表示名を入力してください"
            />
          </div>

          <Button
            className="w-full"
            onClick={saveProfile}
            disabled={saving || !displayName.trim()}
          >
            {saving ? '保存中...' : '保存'}
          </Button>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-100 p-3 text-sm text-green-800">
              プロフィールを保存しました。ホームページにリダイレクトします...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/*
// 本番環境用のプロフィールページ（Supabaseプロジェクト設定後に有効化）
import { useEffect } from 'react'
import { useSupabase } from '@/components/supabase-provider'

export default function ProfilePage() {
  const router = useRouter()
  const { supabase, user, loading } = useSupabase()
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // ユーザープロフィールの取得
  useEffect(() => {
    const getProfile = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching profile:', error)
          return
        }

        if (data) {
          setDisplayName(data.display_name || '')
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
      }
    }

    getProfile()
  }, [user, supabase])

  // プロフィールの保存
  const saveProfile = async () => {
    if (!user) return

    try {
      setSaving(true)
      setError(null)
      setSuccess(false)

      // プロフィールテーブルの更新または作成
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: displayName,
          updated_at: new Date().toISOString(),
        })

      if (error) {
        setError('プロフィールの保存中にエラーが発生しました')
        console.error('Error saving profile:', error)
        return
      }

      setSuccess(true)
      
      // ホームページにリダイレクト
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } catch (err) {
      setError('予期せぬエラーが発生しました')
      console.error('Error saving profile:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  // ...残りのコンポーネント
}
*/