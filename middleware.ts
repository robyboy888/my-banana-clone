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
        // ✅ 已修正：移除了多余的 options: 标签
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        // ✅ 已修正：删除操作时明确 value 为空字符串
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

  // 3. 💥 关键部分：检查 API 脚本请求 (GitHub Actions)
  // 如果请求头包含 Bearer Token，则直接允许，不检查 Cookie
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return response;
  }

  // 4. 获取当前用户信息 (普通浏览器用户路径)
  // 此操作会自动刷新过期的 Session
  const { data: { user } } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const isLoginPage = url.pathname === '/admin/login'
  const isAdminPath = url.pathname.startsWith('/admin')

  // 5. 路由拦截逻辑
  if (isAdminPath) {
    // 未登录且访问管理页 -> 跳转登录
    if (!user && !isLoginPage) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    
    // 已登录状态禁止访问登录页
    if (user && isLoginPage) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return response
}

// 6. 匹配器：确保对 /admin 及其所有子路径生效
export const config = {
  matcher: ['/admin/:path*'],
}