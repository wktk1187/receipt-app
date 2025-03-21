'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSupabase } from '@/components/supabase-provider'
import { Mail, Lock, AlertTriangle } from 'lucide-react'
// 環境変数
const isDevelopment = process.env.NODE_ENV === 'development'

export default function LoginPage() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  // バイパスログイン機能を削除

  // ログイン処理
  const handleLogin = async () => {
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('ログイン試行中...', { email })
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('ログインエラー:', error)
        setError(error.message)
        
        // メール確認エラーの場合のメッセージ
        if (error.message.includes('Email not confirmed')) {
          setError(`メールアドレスが確認されていません。確認メールを確認してください。`)
        }
      } else {
        console.log('ログイン成功:', data)
        // 明示的にダッシュボードページにリダイレクト
        router.push('/dashboard')
      }
    } catch (err) {
      console.error('予期せぬログインエラー:', err)
      setError('ログイン中にエラーが発生しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  // サインアップ処理
  const handleSignup = async () => {
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('サインアップ試行中...', { email })
      
      // Supabaseの設定でメール確認を無効にする方法
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error('サインアップエラー:', error)
        setError(error.message)
      } else {
        console.log('サインアップ成功:', data)
        
        // Supabaseダッシュボードでユーザーを確認する方法を説明
        setMode('login')
        setError(`アカウントが作成されました。メールアドレス「${email}」でログインしてください。
        
メール確認が必要な場合は、確認メールを確認してください。`)
      }
    } catch (err) {
      console.error('予期せぬサインアップエラー:', err)
      setError('アカウント作成中にエラーが発生しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg border bg-card p-6 shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold">領収書アップロードシステム</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === 'login' ? 'アカウントでログインして、領収書を管理しましょう' : 'アカウントを作成して、領収書を管理しましょう'}
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Button
            className="w-full"
            onClick={mode === 'login' ? handleLogin : handleSignup}
            disabled={loading}
          >
            {loading ? '処理中...' : mode === 'login' ? 'ログイン' : 'アカウント作成'}
          </Button>

          <div className="text-center text-sm">
            {mode === 'login' ? (
              <p>
                アカウントをお持ちでない場合は
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="ml-1 text-primary hover:underline"
                >
                  新規登録
                </button>
              </p>
            ) : (
              <p>
                すでにアカウントをお持ちの場合は
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="ml-1 text-primary hover:underline"
                >
                  ログイン
                </button>
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* バイパスオプションを削除 */}
        </div>
      </div>
    </div>
  )
}