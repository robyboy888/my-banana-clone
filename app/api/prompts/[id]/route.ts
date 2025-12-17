import { NextRequest, NextResponse } from 'next/server';
import { supabaseServiceRole } from '@/lib/supabaseService';

// 💥 修正点：context 里的 params 现在必须定义为 Promise 类型
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        // 💥 关键点：必须先 await params
        const { id } = await context.params;

        if (!id) {
            return NextResponse.json({ error: '缺少 ID' }, { status: 400 });
        }

        const { data, error } = await supabaseServiceRole
            .from('prompts')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: '数据库查询失败' }, { status: 500 });
        }
        
        if (!data) {
            return NextResponse.json({ error: '未找到该记录' }, { status: 404 });
        }

        return NextResponse.json(data);
    } catch (e: any) {
        console.error('API Error:', e);
        return NextResponse.json({ error: e.message || '内部服务器错误' }, { status: 500 });
    }
}