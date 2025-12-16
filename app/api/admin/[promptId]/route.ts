// app/api/admin/[promptId]/route.ts

import { supabaseServiceRole } from '@/lib/supabaseService';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest, context: any) {
    
    // 💥 关键修正：尝试从 context.params 中获取 id，如果找不到，再获取 promptId
    // 这是为了应对 Next.js 路由解析器可能将 [promptId] 错误地解析为 id 的情况
    const paramId = context.params.id || context.params.promptId;
    
    const promptId = parseInt(paramId);

    if (isNaN(promptId)) {
        console.warn(`INVALID_ID_REQUESTED: ${paramId}`);
        return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    try {
        const { data: promptData, error } = await supabaseServiceRole
            .from('prompt-assets') // <--- 确认这里是 'prompts'
            .select('*')
            .eq('id', promptId)
            .single();
        
        // ... (错误处理逻辑不变)
        
        if (error) {
            console.error('SUPABASE_QUERY_ERROR:', error); 
            return NextResponse.json({ 
                message: 'Database error fetching record', 
                details: error.message 
            }, { status: 500 });
        }

        if (!promptData) {
            console.warn(`RECORD_NOT_FOUND_ID: ${promptId}`);
            return NextResponse.json({ message: 'Record not found' }, { status: 404 });
        }

        return NextResponse.json(promptData);

    } catch (e: any) {
        console.error('UNEXPECTED_API_ERROR:', e);
        return NextResponse.json({ message: 'Internal server error', details: e.message }, { status: 500 });
    }
}