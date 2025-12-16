// /src/components/ClientEditFormWrapper.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Prompt } from '@/types/prompt';
import AdminPromptForm from './AdminPromptForm'; // 确保路径正确

// ----------------------------------------------------
// 💥 修复类型错误：定义接收 Props 的接口
// ----------------------------------------------------
interface ClientEditFormWrapperProps {
    // 接收服务端获取到的初始数据
    initialPrompt: Prompt; 
}

export default function ClientEditFormWrapper({ initialPrompt }: ClientEditFormWrapperProps) {
    const router = useRouter();
    
    // 提交成功后的回调函数
    const handleSuccess = () => {
        alert('记录更新成功！');
        // 导航回列表页
        router.push('/admin'); 
    };
    
    return (
        <div className="max-w-4xl mx-auto">
            {/* 将初始数据传递给 AdminPromptForm。
              AdminPromptForm 通过判断 initialPrompt 是否存在来确定是新增模式还是编辑模式。
            */}
            <AdminPromptForm 
                initialPrompt={initialPrompt} 
                onSuccess={handleSuccess} 
            />
        </div>
    );
}