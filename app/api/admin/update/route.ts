import { NextResponse } from 'next/server';
import { supabaseServiceRole } from '@/lib/supabaseService';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        // 1. 解析前端发来的 JSON 数据
        const body = await request.json();
        const { id, data: recordData } = body;

        // 2. 基础校验
        if (!id) {
            return NextResponse.json({ error: "缺少记录 ID" }, { status: 400 });
        }
        if (!recordData) {
            return NextResponse.json({ error: "缺少更新内容" }, { status: 400 });
        }

        // 3. 准备更新到数据库的数据
        // 注意：此时 recordData 里的图片字段已经是上传好的 URL 字符串了
        const finalUpdateData = {
            ...recordData,
            updated_at: new Date().toISOString()
        };

        // 4. 执行 Supabase 数据库更新
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