// middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. 创建一个初始响应
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. 初始化 Supabase 服务端客户端
  // 它会自动处理请求中的 Cookie 并更新响应中的 Cookie
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
      },
    }
  )

  // 3. 获取当前用户信息（这不仅是检查，还会刷新过期的 Session）
  const { data: { user } } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const isLoginPage = url.pathname === '/admin/login'
  const isAdminPath = url.pathname.startsWith('/admin')

  // 4. 路由拦截逻辑
  if (isAdminPath) {
    // 情况 A: 访问管理页但未登录 -> 重定向到登录页
    if (!user && !isLoginPage) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    
    // 情况 B: 已登录但尝试访问登录页 -> 重定向到管理主页
    if (user && isLoginPage) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return response
}

// 5. 匹配器：确保对 /admin 及其所有子路径生效
export const config = {
  matcher: [
    '/admin/:path*', 
  ],
}