// components/ClientEditFormWrapper.tsx
'use client';

import { useRouter } from 'next/navigation';
import AdminPromptForm from '@/components/AdminPromptForm';
import { Prompt } from '@/types/prompt'; // 确保您的 Prompt 类型定义已正确导入
import { useState, useEffect } from 'react';
    // import { Spinner } from '@/components/ui/spinner'; // 假设您有一个加载 Spinner 组件

interface ClientEditFormWrapperProps {
    promptId: string; // 从 Server Component 接收的 ID
}

export default function ClientEditFormWrapper({ promptId }: ClientEditFormWrapperProps) {
    const router = useRouter();
    const [initialPrompt, setInitialPrompt] = useState<Prompt | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 客户端获取数据逻辑
    useEffect(() => {
        const fetchPrompt = async () => {
            setIsLoading(true); // 开始加载
            setError(null); // 清除旧错误

            try {
                // 💥 访问我们创建的 API 路由
                const response = await fetch(`/api/admin/${promptId}`);
                const data = await response.json();

                if (!response.ok) {
                    // 如果 API 返回非 2xx 状态码 (如 404, 500)
                    const errorMessage = data.message || `API 错误，状态码: ${response.status}`;
                    setError(errorMessage);
                    console.error('Failed to fetch prompt:', errorMessage, data);
                    
                    // ⚠️ 关键修正：不进行任何路由跳转，直接在组件内渲染错误
                    return;
                }
                
                // 成功获取数据
                setInitialPrompt(data as Prompt);

            } catch (err: any) {
                // 捕获网络错误或 JSON 解析错误
                console.error('Network or parsing error:', err);
                setError('网络连接错误或数据格式不正确。');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPrompt();
    }, [promptId]); // 依赖 ID 变化

    const handleSuccess = () => {
        alert('Prompt 记录更新成功！');
        router.push('/admin'); // 成功后跳转回列表页
    };
    
    // 渲染逻辑：处理加载和错误状态

    if (isLoading) {
        // 使用 Spinner 或简单的文本提示
        return (
            <div className="flex justify-center items-center h-40">
                <p className="text-gray-600">正在加载记录...</p>
            </div>
        );
    }

    if (error || !initialPrompt) {
        // 渲染错误信息，告知用户问题所在
        return (
            <div className="p-8 border border-red-300 bg-red-50 rounded-lg text-center">
                <h2 className="text-xl font-bold text-red-700 mb-2">加载失败</h2>
                <p className="text-red-600">错误详情: {error || '未找到该记录 (ID 不存在或已被删除)。'}</p>
                <button
                    onClick={() => router.push('/admin')}
                    className="mt-4 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                    返回列表页
                </button>
            </div>
        );
    }

    // 成功加载数据，渲染表单
    return (
        <AdminPromptForm
            initialPrompt={initialPrompt} 
            onSuccess={handleSuccess}
        />
    );
}