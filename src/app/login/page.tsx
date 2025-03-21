'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSupabase } from '@/components/supabase-provider'
import { Mail, Lock, AlertTriangle } from 'lucide-react'
// 開発アカウントのメールアドレス
const DEV_EMAIL = 'otsuka.abun@gmail.com'

// 開発者アカウントかどうかを判断する関数
const isDevAccount = (email: string) => email === DEV_EMAIL

// 開発環境かどうかを判断（参考用に残す）
const isDevelopment = process.env.NODE_ENV === 'development'

export default function LoginPage() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [showDevBypass, setShowDevBypass] = useState(false)

  // 開発環境用のバイパスログイン
  const handleDevBypass = () => {
    console.log('開発環境用のバイパスログインを実行')
    // 開発アカウントとしてログイン
    if (email === DEV_EMAIL) {
      console.log('開発者アカウントとしてバイパスログイン')
      router.push('/')
    } else {
      setError('開発者アカウント（otsuka.abun@gmail.com）のみがバイパスログインを使用できます')
    }
  }

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
        
        // メール確認エラーの場合、開発者アカウントのみバイパスオプションを表示
        if (error.message.includes('Email not confirmed') && isDevAccount(email)) {
          setShowDevBypass(true)
        } else if (error.message.includes('Email not confirmed')) {
          setError(`メールアドレスが確認されていません。確認メールを確認してください。
          
Supabaseダッシュボードの「Authentication」→「Users」からユーザーを選択し、「Verify Email」ボタンをクリックしてメール確認をスキップできます。`)
        }
      } else {
        console.log('ログイン成功:', data)
        // 明示的にホームページにリダイレクト
        router.push('/')
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
        
注意: 開発環境では以下のいずれかの方法でメール確認をスキップできます：

1. Supabaseダッシュボードの「Authentication」→「Providers」→「Email」で「Confirm email」をオフにする
2. Supabaseダッシュボードの「Authentication」→「Users」からユーザーを選択し、「Verify Email」ボタンをクリックする`)
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

          {/* 開発者アカウント用のバイパスオプション */}
          {showDevBypass && isDevAccount(email) && (
            <div className="mt-4 rounded-md bg-yellow-100 p-3">
              <div className="flex items-center">
                <AlertTriangle className="mr-2 h-4 w-4 text-yellow-800" />
                <p className="text-sm font-medium text-yellow-800">開発者アカウント専用</p>
              </div>
              <p className="mt-1 text-xs text-yellow-700">
                開発者アカウント（{DEV_EMAIL}）として認証をバイパスします。
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 bg-yellow-50 text-yellow-800 hover:bg-yellow-100"
                onClick={handleDevBypass}
              >
                開発者モードでログイン
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}