// app/api/prompts/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// 💥 关键点：使用 Vercel/Next.js 的运行时环境变量
// Supabase URL 可以是公开的，但 Key 必须是 Service Role Key 或 Anon Key
// 且必须确保 key 是通过 Vercel 的环境变量配置的，而不是硬编码！
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!; // 通常是公开的，使用 NEXT_PUBLIC
// 🚨 安全警告：对于后端 API 调用，最好使用 SERVICE ROLE KEY (如果需要写权限)
// 对于纯读取操作，可以使用 Anon Key，但我们演示使用 Server-side 的环境变量
const supabaseKey = process.env.SUPABASE_ANON_KEY!; // 推荐使用非 PUBLIC 环境变量

// 初始化 Supabase 客户端 (只在服务器端运行)
const supabase = createClient(supabaseUrl, supabaseKey);

const PAGE_SIZE = 50;

// 处理 GET 请求 (对应客户端的 loadMore 请求)
export async function GET(request: Request) {
    
    // 1. 从请求 URL 中解析 offset 参数
    const { searchParams } = new URL(request.url);
    const offsetParam = searchParams.get('offset');
    const offset = parseInt(offsetParam || '0', 10);

    // 2. 计算 Supabase 的 range [start, end]
    const start = offset;
    const end = offset + PAGE_SIZE - 1;

    try {
        // 3. 安全地执行 Supabase 查询
        const { data, error } = await supabase
            .from('prompts')
            .select('*')
            .order('created_at', { ascending: false })
            .range(start, end);

        if (error) {
            console.error('Supabase fetch error in API route:', error);
            return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 });
        }
        
        // 4. 返回 JSON 数据
        return NextResponse.json(data);

    } catch (e) {
        console.error('General API error:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}