// components/ClientEditFormWrapper.tsx
'use client';

import { useRouter } from 'next/navigation';
import AdminPromptForm from '@/components/AdminPromptForm';
import { Prompt } from '@/types/prompt';

interface ClientEditFormWrapperProps {
    initialPrompt: Prompt;
}

export default function ClientEditFormWrapper({ initialPrompt }: ClientEditFormWrapperProps) {
    const router = useRouter();

    const handleSuccess = () => {
        alert('Prompt 记录更新成功！');
        // 更新成功后，跳转回列表页
        router.push('/admin'); 
    };

    return (
        <AdminPromptForm
            initialPrompt={initialPrompt} // 传递初始数据，AdminPromptForm 将进入编辑模式
            onSuccess={handleSuccess}
        />
    );
}