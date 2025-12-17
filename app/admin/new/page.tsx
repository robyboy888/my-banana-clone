'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AdminPromptForm from '@/components/AdminPromptForm';
import Link from 'next/link';

export default function NewPromptPage() {
    const router = useRouter();

    const handleSuccess = () => {
        alert('记录新增成功！');
        router.push('/admin');
        router.refresh(); // 确保列表页数据刷新
    };

    return (
        <div className="container mx-auto p-8 max-w-4xl">
            <div className="flex justify-between items-center mb-8 border-b pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-800">新增 Prompt 记录</h1>
                    <p className="text-gray-400 text-sm mt-1">创建一个新的 AI 提示词展示案例</p>
                </div>
                <Link 
                    href="/admin" 
                    className="px-6 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition shadow-sm text-sm font-bold"
                >
                    返回列表
                </Link>
            </div>

            {/* 直接使用全能表单，不传 initialPrompt 默认就是新增模式 */}
            <AdminPromptForm onSuccess={handleSuccess} />
        </div>
    );
}