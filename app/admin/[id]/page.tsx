// app/admin/[id]/page.tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseServiceRole } from '@/lib/supabaseService';
import { Prompt } from '@/types/prompt'; // 假设类型已创建
import ClientEditFormWrapper from '@/components/ClientEditFormWrapper'; // 💥 新组件

interface EditPageProps {
    params: {
        id: string;
    };
}

// 💥 服务器组件：获取编辑数据
export default async function EditPromptPage({ params }: EditPageProps) {
    
    const promptId = parseInt(params.id);
    
    if (isNaN(promptId)) {
        notFound(); // ID 无效
    }

    // 1. 获取 ID 对应的记录
    const { data: promptData, error } = await supabaseServiceRole
        .from('prompts')
        .select('*')
        .eq('id', promptId)
        .single();

    if (error || !promptData) {
        console.error(`Error fetching prompt ID ${promptId}:`, error);
        notFound(); // 记录不存在或错误
    }

    const initialPrompt = promptData as Prompt;

    return (
        <div className="container mx-auto p-8 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-extrabold text-gray-800">编辑 Prompt 记录 (ID: {promptId})</h1>
                <Link 
                    href="/admin" 
                    className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                >
                    &larr; 返回列表
                </Link>
            </div>

            {/* 💥 重点：使用一个客户端组件来包装 AdminPromptForm，并处理 onSuccess 逻辑 */}
            <ClientEditFormWrapper initialPrompt={initialPrompt} />
        </div>
    );
}