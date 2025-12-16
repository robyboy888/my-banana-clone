// /app/admin/edit/page.tsx
import { supabaseServiceRole } from '@/lib/supabaseService';
import ClientEditFormWrapper from '@/components/ClientEditFormWrapper'; 
import { Prompt } from '@/types/prompt';
import { notFound } from 'next/navigation';

// ----------------------------------------------------
// 💥 修复 P1：强制动态渲染，解决顽固的 404 缓存问题
// ----------------------------------------------------
export const dynamic = 'force-dynamic';

interface EditPageProps {
    searchParams: {
        id?: string; // 接收 ?id=123 这样的查询参数
    };
}

export default async function AdminEditPage({ searchParams }: EditPageProps) {
    const promptId = searchParams.id;

    // 1. 验证 ID
    if (!promptId || isNaN(Number(promptId))) {
        notFound();
    }

    const numericId = Number(promptId);

    // 2. 服务端获取单个记录
    const { data: prompt, error } = await supabaseServiceRole
        .from('prompts')
        .select('*')
        .eq('id', numericId)
        .single(); 

    // 3. 错误处理
    if (error || !prompt) {
        console.error(`Failed to fetch prompt ${promptId} for editing:`, error);
        // 如果找不到记录或查询失败，返回 404
        notFound(); 
    }

    // 4. 渲染客户端组件
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">编辑记录 (ID: {numericId})</h1>
            <ClientEditFormWrapper initialPrompt={prompt as Prompt} />
        </div>
    );
}