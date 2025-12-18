import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseServiceRole } from '@/lib/supabaseService'; // 注意路径，确保与你项目一致

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        
        // 1. 创建 SSR 客户端校验登录态
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

        // 3. 核心修复：解析请求数据并保持高兼容性
        const body = await request.json();
        
        /**
         * 兼容性解析逻辑：
         * 如果前端传了 { id, data: { ... } }，我们取 body.data
         * 如果前端传了展平的 { id, title, ... }，我们取除 id 外的所有字段
         */
        const id = body.id;
        const recordData = body.data ? body.data : body;

        if (!id) {
            return NextResponse.json({ error: "缺少必要参数 ID" }, { status: 400 });
        }

        // 4. 准备更新数据 (剔除干扰字段)
        // 从解析出的内容中移除可能存在的 id 字段，避免主键更新冲突
        const { id: _, created_at: __, ...updateFields } = recordData;
        
        if (!updateFields.title) {
            return NextResponse.json({ error: "标题不能为空" }, { status: 400 });
        }

        const finalUpdateData = {
            ...updateFields,
            updated_at: new Date().toISOString()
        };

        // 5. 执行更新
        const { data, error: dbError } = await supabaseServiceRole
            .from('prompts')
            .update(finalUpdateData)
            .eq('id', id)
            .select();

        if (dbError) throw dbError;

        return NextResponse.json({ message: '更新成功', data });

    } catch (e: any) {
        console.error('Update API Error:', e.message);
        return NextResponse.json({ error: e.message || "服务器内部错误" }, { status: 500 });
    }
}

export const PUT = POST;