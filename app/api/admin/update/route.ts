import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseServiceRole } from '@/src/lib/supabaseService';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        
        // 1. 创建 SSR 客户端，必须包含 get/set/remove 才能维持登录态
        const supabaseAuth = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) { return cookieStore.get(name)?.value },
                    set(name: string, value: string, options: any) {
                        cookieStore.set({ name, value, ...options });
                    },
                    remove(name: string, options: any) {
                        cookieStore.set({ name, value: '', ...options });
                    },
                },
            }
        );

        // 2. 身份校验
        const { data: { session }, error: authError } = await supabaseAuth.auth.getSession();
        if (authError || !session) {
            console.error('API 校验失败，无有效 Session:', authError);
            return NextResponse.json({ error: "管理员身份失效，请重新登录" }, { status: 401 });
        }

        // 3. 解析请求数据
        const body = await request.json();
        const { id, data: recordData } = body;

        if (!id || !recordData) {
            return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
        }

        // 4. 准备更新数据
        const { id: _, ...updateFields } = recordData;
        const finalUpdateData = {
            ...updateFields,
            updated_at: new Date().toISOString()
        };

        // 5. 使用 Service Role 执行更新 (绕过数据库 RLS)
        const { data, error: dbError } = await supabaseServiceRole
            .from('prompts')
            .update(finalUpdateData)
            .eq('id', id)
            .select();

        if (dbError) throw dbError;

        return NextResponse.json({ message: '更新成功', data });

    } catch (e: any) {
        console.error('API Error:', e.message);
        return NextResponse.json({ error: e.message || "服务器内部错误" }, { status: 500 });
    }
}

export const PUT = POST;