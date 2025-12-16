// app/api/admin/[id]/route.ts (最终修正)
import { supabaseServiceRole } from '@/lib/supabaseService';
import { NextResponse, NextRequest } from 'next/server';

// ⚠️ 外部定义 Context 接口，以确保 TypeScript 在内部推断正确。
// 注意：这里我们定义了 params 的结构，但不在函数签名中解构它。
interface RouteContext {
    params: {
        id: string;
    };
}

// GET 请求：获取单个记录用于编辑
// 💥 关键修正：不解构 context，并使用 RouteContext 类型。
export async function GET(request: NextRequest, context: RouteContext) {
    
    // 1. 从 context.params 中安全获取 id
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
            console.error('Supabase fetch error:', error);
            return NextResponse.json({ 
                message: 'Database error fetching record', 
                details: error.message 
            }, { status: 500 });
        }

        if (!promptData) {
            return NextResponse.json({ message: 'Record not found' }, { status: 404 });
        }

        return NextResponse.json(promptData);

    } catch (e: any) {
        return NextResponse.json({ message: 'Internal server error', details: e.message }, { status: 500 });
    }
}