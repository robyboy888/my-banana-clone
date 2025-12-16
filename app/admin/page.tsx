// app/admin/page.tsx

'use client'; // 💥 关键修正：将整个页面标记为 Client Component

import AdminPromptForm from '@/components/AdminPromptForm';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // 导入 useRouter 用于客户端跳转

export default function AdminPage() {
    
    const router = useRouter();
    
    // 💥 关键修正：handleSuccess 现在定义在 Client Component 中
    const handleSuccess = () => {
        alert('Prompt 记录新增成功！');
        
        // 使用 useRouter 进行客户端路由跳转
        router.push('/'); 
    };

    return (
        <div className="container mx-auto p-8 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-extrabold text-gray-800">Prompt 管理中心</h1>
                <Link 
                    href="/" 
                    className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                >
                    &larr; 返回前端列表
                </Link>
            </div>

            {/* 传递 onSuccess 函数给 AdminPromptForm (现在两者都是客户端组件，函数可以传递) */}
            <AdminPromptForm 
                onSuccess={handleSuccess} 
            />
            
            <p className="mt-8 text-sm text-gray-500 text-center">
                请确保您的 SUPABASE_SERVICE_ROLE_KEY 已配置，否则无法进行新增或修改操作。
            </p>
        </div>
    );
}