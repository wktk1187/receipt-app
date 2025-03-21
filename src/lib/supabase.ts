import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

// サーバーコンポーネント用のSupabaseクライアント
export const createServerClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// クライアントコンポーネント用のSupabaseクライアント
export const createClientClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}