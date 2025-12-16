// app/admin/[promptId]/page.tsx

import Link from 'next/link';
import { notFound } from 'next/navigation';
import ClientEditFormWrapper from '@/components/ClientEditFormWrapper'; 


// 💥 关键修正：强制动态渲染
// 确保 Vercel 每次都执行代码，防止缓存 404 结果。
export const dynamic = 'force-dynamic'; 

interface EditPageProps {
    params: {
		promptId: string;
        // 添加 id 以防 Next.js 错误解析
        id?: string;
    };
}

// Server Component：只负责校验 ID 格式和渲染客户端包装器
export default async function EditPromptPage({ params }: EditPageProps) {
    
	// 💥 关键修正：优先使用 promptId，否则使用 id
    const rawId = params.promptId || params.id;
    
    const promptId = rawId ? String(rawId) : '';
    
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

            {/* 传递 ID，让客户端包装器通过 /api/admin/[promptId] 获取数据 */}
            <ClientEditFormWrapper promptId={promptId} />
        </div>
    );
}