// app/admin/[id]/page.tsx

import Link from 'next/link';
import { notFound } from 'next/navigation';
// ⚠️ 注意：不再需要引入 supabaseServiceRole 或 Prompt
import ClientEditFormWrapper from '@/components/ClientEditFormWrapper'; 

// 💥 关键修正：强制动态渲染
// 阻止 Vercel 缓存由 notFound() 导致的 404 页面结果，确保每次都执行代码。
export const dynamic = 'force-dynamic'; 

interface EditPageProps {
    params: {
        id: string;
    };
}

// 💥 Server Component：现在只负责校验 ID 格式和渲染客户端包装器
export default async function EditPromptPage({ params }: EditPageProps) {
    
    const promptId = params.id;
    
    // 简单的 ID 格式校验。如果传入的是非数字，则返回 404
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

            {/* 传递 ID，让客户端包装器通过 /api/admin/[id] 获取数据并处理加载/错误状态 */}
            <ClientEditFormWrapper promptId={promptId} />
        </div>
    );
}