'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminPromptForm from '@/components/AdminPromptForm';
import { Prompt } from '@/types/prompt';
import Link from 'next/link';

export default function EditPromptPage() {
    const params = useParams(); // 自动获取文件夹 [id] 对应的变量
    const router = useRouter();
    const [prompt, setPrompt] = useState<Prompt | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPrompt = async () => {
            try {
                const res = await fetch(`/api/prompts/${params.id}`);
                if (!res.ok) throw new Error('无法获取 Prompt 详情，可能记录已被删除');
                const data = await res.json();
                setPrompt(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) fetchPrompt();
    }, [params.id]);

    const handleSuccess = () => {
        // 修改成功后跳转
        router.push('/admin');
        router.refresh(); 
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-500">正在加载数据...</span>
        </div>
    );

    if (error || !prompt) return (
        <div className="text-center py-20">
            <p className="text-red-500 font-bold">{error || '未找到该记录'}</p>
            <Link href="/admin" className="mt-4 text-indigo-600 underline text-sm">返回列表</Link>
        </div>
    );

    return (
        <div className="container mx-auto p-8 max-w-4xl">
            <div className="flex justify-between items-center mb-8 border-b pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-800">编辑 Prompt 记录</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        您正在修改 ID 为 <code className="bg-gray-100 px-1 rounded">{params.id}</code> 的条目
                    </p>
                </div>
                <Link 
                    href="/admin" 
                    className="px-6 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition shadow-sm text-sm font-bold"
                >
                    &larr; 取消并返回
                </Link>
            </div>

            {/* 💥 核心逻辑：initialPrompt 会让 AdminPromptForm 切换到编辑状态 */}
            <AdminPromptForm 
                initialPrompt={prompt} 
                onSuccess={handleSuccess} 
            />
        </div>
    );
}