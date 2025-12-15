// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// Next.js 会在运行时自动从 .env.local 中加载这些以 NEXT_PUBLIC_ 开头的环境变量
// ! 是 TypeScript 语法，表示我们确保这些变量一定存在
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 创建 Supabase 客户端实例
export const supabase = createClient(supabaseUrl, supabaseAnonKey)