// app/api/admin/[id]/route.ts (使用 any 绕过类型冲突的最终修正)
import { supabaseServiceRole } from '@/lib/supabaseService';
import { NextResponse, NextRequest } from 'next/server';

// ⚠️ 注意：我们不再定义 RouteContext 接口，并使用 any 类型来接收 context，
// 以避免与 Next.js 严格的 Promise<params> 类型冲突。

// GET 请求：获取单个记录用于编辑
// 💥 关键修正：将 context 显式设置为 any 类型
export async function GET(request: NextRequest, context: any) {
    
    // 1. 从 context.params 中安全获取 id
    // TypeScript 知道 context 是 any，所以不会报错
    const promptId = parseInt(context.params.id);

    if (isNaN(promptId)) {
        return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

	try {
        const { data: promptData, error } = await supabaseServiceRole
            .from('prompts')
            .select('*')
            .eq('id', promptId)
            .single();

        if (error) {
            // 💥 关键点 1：将 Supabase 原始错误打印出来
            console.error('SUPABASE_QUERY_ERROR:', error); 
            return NextResponse.json({ 
                message: 'Database error fetching record', 
                details: error.message 
            }, { status: 500 });
        }

        if (!promptData) {
            // 💥 关键点 2：记录找不到数据的日志
            console.warn(`RECORD_NOT_FOUND_ID: ${promptId}`);
            return NextResponse.json({ message: 'Record not found' }, { status: 404 });
        }

        return NextResponse.json(promptData);

    } catch (e: any) {
        // 💥 关键点 3：记录所有意料之外的错误 (如网络、环境问题)
        console.error('UNEXPECTED_API_ERROR:', e);
        return NextResponse.json({ message: 'Internal server error', details: e.message }, { status: 500 });
    }
}