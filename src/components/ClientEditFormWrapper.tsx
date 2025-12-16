// components/ClientEditFormWrapper.tsx
'use client';

import { useRouter } from 'next/navigation';
import AdminPromptForm from '@/components/AdminPromptForm';
import { Prompt } from '@/types/prompt';
import { useState, useEffect } from 'react';

interface ClientEditFormWrapperProps {
    promptId: string; // 💥 传入 ID，而不是数据
}

export default function ClientEditFormWrapper({ promptId }: ClientEditFormWrapperProps) {
    const router = useRouter();
    const [initialPrompt, setInitialPrompt] = useState<Prompt | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 💥 客户端获取数据
    useEffect(() => {
        const fetchPrompt = async () => {
            try {
                const response = await fetch(`/api/admin/${promptId}`);
                const data = await response.json();

                if (!response.ok) {
                    setError(data.message || '获取记录失败');
                    // 如果是 404 错误，可以提示用户或跳转
                    if (response.status === 404) {
                         alert('错误：记录不存在！请返回列表。');
                         router.push('/admin');
                    }
                    return;
                }
                
                setInitialPrompt(data as Prompt);
            } catch (err: any) {
                setError('网络错误：' + err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPrompt();
    }, [promptId, router]); // 依赖 ID

    const handleSuccess = () => {
        alert('Prompt 记录更新成功！');
        router.push('/admin'); 
    };
    
    if (isLoading) {
        return <div className="text-center p-10">加载中...</div>;
    }

    if (error || !initialPrompt) {
        // 如果加载失败或数据不存在，显示错误信息
        return <div className="text-center p-10 text-red-600">错误: {error || '未找到数据。'}</div>;
    }

    return (
        <AdminPromptForm
            initialPrompt={initialPrompt} 
            onSuccess={handleSuccess}
        />
    );
}