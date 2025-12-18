import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { supabaseServiceRole } from '@/lib/supabaseService';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        // 1. 创建带有会话上下文的客户端，用于身份校验
        const cookieStore = cookies();
        const supabaseAuth = createRouteHandlerClient({ cookies: () => cookieStore });

        // 2. 身份校验：拦截非法请求
        const { data: { session }, error: authError } = await supabaseAuth.auth.getSession();
        
        if (authError || !session) {
            console.error('未授权的访问尝试');
            return NextResponse.json({ error: "未经授权，请先登录" }, { status: 401 });
        }

        // 3. 解析前端发来的 JSON 数据
        const body = await request.json();
        const { id, data: recordData } = body;

        // 4. 基础参数校验
        if (!id) {
            return NextResponse.json({ error: "缺少记录 ID" }, { status: 400 });
        }
        if (!recordData) {
            return NextResponse.json({ error: "缺少更新内容" }, { status: 400 });
        }

        // 5. 准备更新数据
        // 移除 recordData 中可能包含的 id 字段，防止违反主键约束
        const { id: _, ...updateFields } = recordData;
        const finalUpdateData = {
            ...updateFields,
            updated_at: new Date().toISOString()
        };

        // 6. 执行更新 (使用 Service Role 确保拥有最高数据库操作权限)
        const { data, error: dbError } = await supabaseServiceRole
            .from('prompts')
            .update(finalUpdateData)
            .eq('id', id)
            .select();

        if (dbError) {
            console.error('数据库更新失败:', dbError.message);
            throw dbError;
        }

        return NextResponse.json({ 
            message: '更新成功', 
            data 
        });

    } catch (e: any) {
        console.error('API 运行错误:', e.message);
        return NextResponse.json(
            { error: e.message || "服务器内部错误" }, 
            { status: 500 }
        );
    }
}

// 兼容 PUT 请求
export const PUT = POST;