// lib/supabaseService.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!; 
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// 💥 使用 Service Role Key 初始化客户端
// Service Role Key 绕过了 Row Level Security (RLS)
export const supabaseServiceRole = createClient(supabaseUrl, supabaseServiceKey);