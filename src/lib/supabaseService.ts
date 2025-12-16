// lib/supabaseService.ts

import { createClient } from '@supabase/supabase-js';

// 确保在运行时，这些变量是存在的，否则抛出错误
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; 
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    // 💥 抛出明确错误，帮助诊断是哪个 key 缺失
    throw new Error('Supabase configuration error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.');
}

// 💥 使用 Service Role Key 初始化客户端
// 绕过了 Row Level Security (RLS)
export const supabaseServiceRole = createClient(supabaseUrl, supabaseServiceKey);
