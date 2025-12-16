// app/api/admin/[id]/route.ts (修正后的代码)
import { supabaseServiceRole } from '@/lib/supabaseService';
import { NextResponse, NextRequest } from 'next/server'; // 引入 NextRequest

// ⚠️ 删除了自定义的 Context 接口，让 TypeScript 使用 Next.js 提供的隐式类型

// GET 请求：获取单个记录用于编辑
// 💥 关键修正：直接在参数中解构 { params }
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    
    // 1. 从解构后的 params 中安全获取 id
    const promptId = parseInt(params.id);

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