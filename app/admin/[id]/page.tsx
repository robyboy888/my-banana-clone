// app/admin/[id]/page.tsx (修正后的 Server Component)
import Link from 'next/link';
import { notFound } from 'next/navigation';
// ⚠️ 注意：不再需要引入 supabaseServiceRole 或 Prompt

import ClientEditFormWrapper from '@/components/ClientEditFormWrapper';

interface EditPageProps {
    params: {
        id: string;
    };
}

// 💥 Server Component：现在只负责校验 ID 并渲染客户端包装器
export default async function EditPromptPage({ params }: EditPageProps) {
    
    const promptId = params.id;
    
    if (isNaN(parseInt(promptId))) {
         // 理论上 Next.js 路由不会传入非数字，但做个校验
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

            {/* 💥 重点：传入 ID，让客户端包装器通过 API 获取数据 */}
            <ClientEditFormWrapper promptId={promptId} />
        </div>
    );
}