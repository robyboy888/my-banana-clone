import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
// 修正点：根据你的截图，lib 在 src/lib 下
import { supabaseServiceRole } from '@/src/lib/supabaseService';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const cookieStore = cookies();
        
        // 1. 创建 SSR 客户端校验身份 (基于浏览器 Cookie)
        const supabaseAuth = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) { return cookieStore.get(name)?.value },
                },
            }
        );

        // 2. 核心校验：如果没登录 session 为空，直接拦截
        const { data: { session } } = await supabaseAuth.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "未经授权，请登录" }, { status: 401 });
        }

        const body = await request.json();
        const { id, data: recordData } = body;

        if (!id || !recordData) {
            return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
        }

        // 3. 准备数据：剔除 id 字段并增加更新时间
        const { id: _, ...updateFields } = recordData;
        const finalUpdateData = {
            ...updateFields,
            updated_at: new Date().toISOString()
        };

        // 4. 执行更新：使用 Service Role 确保能修改受 RLS 保护的表
        const { data, error: dbError } = await supabaseServiceRole
            .from('prompts')
            .update(finalUpdateData)
            .eq('id', id)
            .select();

        if (dbError) throw dbError;

        return NextResponse.json({ message: '更新成功', data });

    } catch (e: any) {
        console.error('API Error:', e.message);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// 支持 PUT 请求
export const PUT = POST;