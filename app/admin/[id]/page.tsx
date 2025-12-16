// app/admin/[id]/page.tsx (最终版本：不进行数据检查)
import Link from 'next/link';
import { notFound } from 'next/navigation'; // ⚠️ 注意：如果不需要，可以移除
// ⚠️ 确认：没有引入 supabaseServiceRole

import ClientEditFormWrapper from '@/components/ClientEditFormWrapper';

interface EditPageProps {
    params: {
        id: string;
    };
}

export default async function EditPromptPage({ params }: EditPageProps) {
    
    const promptId = params.id;
    
    // 💥 关键点：这是唯一可能触发 notFound() 的地方。
    // 如果您的 ID 格式是纯数字，这个检查可以保留。
    if (isNaN(parseInt(promptId))) {
         notFound(); 
    }

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

            {/* 传递 ID，让客户端处理数据获取和 404 逻辑 */}
            <ClientEditFormWrapper promptId={promptId} />
        </div>
    );
}