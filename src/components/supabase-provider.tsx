'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Session, User, SupabaseClient } from '@supabase/supabase-js'

// コンテキストの型定義
type SupabaseContextType = {
  supabase: SupabaseClient
  session: Session | null
  user: User | null
  loading: boolean
}

// コンテキストの作成
const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

// プロバイダーコンポーネント
export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    // セッションの取得
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      // セッション変更のリスナー設定
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setSession(session)
          setUser(session?.user ?? null)
          setLoading(false)
        }
      )

      return () => {
        subscription.unsubscribe()
      }
    }

    getSession()
  }, [supabase])

  const value = {
    supabase,
    session,
    user,
    loading
  }

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  )
}

// カスタムフック
export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}