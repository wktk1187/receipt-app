import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // セッションの確認
  const { data: { session } } = await supabase.auth.getSession()

  // 保護されたルートへのアクセスをチェック
  // ログインしていない場合はログインページにリダイレクト
  if (!session && request.nextUrl.pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // ログイン済みの場合、ログインページにアクセスするとダッシュボードにリダイレクト
  if (session && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return res
}

// 特定のパスのみミドルウェアを適用
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)'],
}