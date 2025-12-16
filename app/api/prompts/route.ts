// app/api/prompts/route.ts
export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// 确保您的变量名与 .env.local 和 Vercel 中设置的名称完全一致！
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!; 
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; 

// 初始化 Supabase 客户端 (只在服务器端运行)
const supabase = createClient(supabaseUrl, supabaseKey);

// 默认页面大小
const DEFAULT_PAGE_SIZE = 50;

// 处理 GET 请求 (对应客户端的 loadMore 请求和 fetchFullDataset 请求)
export async function GET(request: Request) {
    
    // 1. 从请求 URL 中解析 offset 和 limit 参数
    const { searchParams } = new URL(request.url);
    const offsetParam = searchParams.get('offset');
    const limitParam = searchParams.get('limit'); // 💥 新增：解析 limit 参数
    
    const offset = parseInt(offsetParam || '0', 10);
    
    // 💥 关键修正 1: 动态计算当前请求的页面大小
    // 如果 URL 中提供了 limit，则使用它；否则使用默认值 (50)
    const currentLimit = parseInt(limitParam || `${DEFAULT_PAGE_SIZE}`, 10);

    // 2. 计算 Supabase 的 range [start, end]
    const start = offset;
    // 💥 关键修正 2: range 的结束点现在使用 currentLimit 来计算
    const end = offset + currentLimit - 1; 

    try {
        // 3. 安全地执行 Supabase 查询
        const { data, error } = await supabase
            .from('prompt-assets')
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