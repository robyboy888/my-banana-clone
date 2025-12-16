// app/admin/new/page.tsx

'use client'; 

import AdminPromptForm from '@/components/AdminPromptForm';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NewPromptPage() {
    
    const router = useRouter();
    
    const handleSuccess = () => {
        alert('Prompt 记录新增成功！');
        // 新增成功后，跳转回列表页
        router.push('/admin'); 
    };

    return (
        <div className="container mx-auto p-8 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-extrabold text-gray-800">新增 Prompt 记录</h1>
                <Link 
                    href="/admin" 
                    className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                >
                    &larr; 返回列表
                </Link>
            </div>

            {/* AdminPromptForm 默认以新增模式启动 */}
            <AdminPromptForm 
                onSuccess={handleSuccess} 
            />
        </div>
    );
}