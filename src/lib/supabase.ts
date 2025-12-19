// src/lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr'

// 确保环境变量存在
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * 升级为 SSR 兼容的客户端
 * 这样处理 Auth Session 会比基础的 createClient 在 Next.js 中更稳定
 */
export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey
)