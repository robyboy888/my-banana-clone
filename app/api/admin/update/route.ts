import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseServiceRole } from '@/lib/supabaseService';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const cookieStore = cookies();
        
        // 1. 创建 SSR 客户端校验身份
        const supabaseAuth = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) { return cookieStore.get(name)?.value },
                },
            }
        );

        // 2. 身份校验
        const { data: { session } } = await supabaseAuth.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "未经授权，请登录" }, { status: 401 });
        }

        const body = await request.json();
        const { id, data: recordData } = body;

        if (!id || !recordData) {
            return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
        }

        // 3. 准备数据并更新
        const { id: _, ...updateFields } = recordData;
        const finalUpdateData = {
            ...updateFields,
            updated_at: new Date().toISOString()
        };

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

export const PUT = POST;