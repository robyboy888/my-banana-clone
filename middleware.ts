// middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. 创建初始响应
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. 初始化 Supabase 服务端客户端
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // --- 💥 关键合并部分开始 ---
  
  // A. 检查是否为 API 脚本请求 (GitHub Actions)
  // 如果请求头包含有效的 Authorization Bearer Token，则直接允许，不检查 Cookie
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return response;
  }

  // B. 获取当前用户信息 (普通浏览器用户路径)
  const { data: { user } } = await supabase.auth.getUser()

  // --- 💥 关键合并部分结束 ---

  const url = request.nextUrl.clone()
  const isLoginPage = url.pathname === '/admin/login'
  const isAdminPath = url.pathname.startsWith('/admin')

  // 3. 路由拦截逻辑
  if (isAdminPath) {
    // 如果没有 user (说明既不是合法的脚本，也没在浏览器登录)
    if (!user && !isLoginPage) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    
    // 已登录状态下禁止去登录页
    if (user && isLoginPage) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}