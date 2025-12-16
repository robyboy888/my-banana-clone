// app/admin/page.tsx

import AdminPromptForm from '@/components/AdminPromptForm';
import Link from 'next/link';

// 这个页面将默认是 Server Component，但内部使用了 Client Component (AdminPromptForm)

export default function AdminPage() {
    
    // 成功处理函数：新增成功后，可以跳转回主页
    const handleSuccess = () => {
        // 实际应用中，您可能需要使用 next/navigation 的 useRouter().push('/')
        // 为了保持这个文件是 Server Component (如果需要)，我们只进行简单的 console log
        console.log('Prompt record added successfully. Navigating to home page is recommended.');
        alert('Prompt 记录新增成功！');
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

            {/* 放置新增/编辑表单组件 */}
            {/* 默认以新增模式启动，不传入 initialPrompt */}
            <AdminPromptForm 
                onSuccess={handleSuccess} 
            />
            
            {/* ⚠️ 注意：未来如果您要实现编辑功能，需要根据 URL 参数获取 ID，并传递 initialPrompt */}
            
            <p className="mt-8 text-sm text-gray-500 text-center">
                请确保您的 SUPABASE_SERVICE_ROLE_KEY 已配置，否则无法进行新增或修改操作。
            </p>
        </div>
    );
}