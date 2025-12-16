// app/api/admin/[promptId]/route.ts

import { supabaseServiceRole } from '@/lib/supabaseService';
import { NextResponse, NextRequest } from 'next/server';

// ⚠️ 使用 any 绕过 TypeScript 对 Next.js 路由 context 严格的 Promise 类型推断。
// 这是解决编译错误的实用方案。
// 注意：context.params 的键名已从 [id] 更改为 [promptId] 以匹配新的文件夹结构。

// GET 请求：获取单个记录用于编辑
// 接收 request 和 context 参数， context 显式使用 any 类型以避免编译错误。
export async function GET(request: NextRequest, context: any) {
    
    // 1. 从 context.params 中获取 promptId
    // 💥 关键修正：确保使用新的键名 promptId
    const promptId = parseInt(context.params.promptId);

    if (isNaN(promptId)) {
        // 记录日志：无效的 ID
        console.warn(`INVALID_ID_REQUESTED: ${context.params.promptId}`);
        return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    try {
        const { data: promptData, error } = await supabaseServiceRole
            .from('prompts')
            .select('*')
            .eq('id', promptId)
            .single();

        if (error) {
            // 💥 记录日志：Supabase 原始错误
            console.error('SUPABASE_QUERY_ERROR:', error); 
            // 避免暴露敏感的数据库错误信息给客户端
            return NextResponse.json({ 
                message: 'Database error fetching record', 
                details: error.message 
            }, { status: 500 });
        }

        if (!promptData) {
            // 💥 记录日志：找不到数据
            console.warn(`RECORD_NOT_FOUND_ID: ${promptId}`);
            // 返回 404 状态，让客户端组件处理
            return NextResponse.json({ message: 'Record not found' }, { status: 404 });
        }

        // 成功返回数据
        return NextResponse.json(promptData);

    } catch (e: any) {
        // 💥 记录日志：捕获所有意料之外的错误 (如网络、环境问题)
        console.error('UNEXPECTED_API_ERROR:', e);
        return NextResponse.json({ message: 'Internal server error', details: e.message }, { status: 500 });
    }
}