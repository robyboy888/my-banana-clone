'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminPromptForm from '@/components/AdminPromptForm';
import { Prompt } from '@/types/prompt';
import Link from 'next/link';

export default function EditPromptPage() {
    const params = useParams(); // 获取动态路由中的 id
    const router = useRouter();
    const [prompt, setPrompt] = useState<Prompt | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPrompt = async () => {
            // 确保 params.id 存在，并强制转换为 string 以避免 TS 类型歧义
            const promptId = params.id as string;
            
            if (!promptId) return;

            try {
                const res = await fetch(`/api/prompts/${promptId}`);
                
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || '无法获取 Prompt 详情');
                }
                
                const data = await res.json();
                setPrompt(data);
            } catch (err: any) {
                console.error('Fetch Error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPrompt();
    }, [params.id]);

    const handleSuccess = () => {
        // 修改成功后弹出提示并跳转
        alert('Prompt 记录更新成功！');
        router.push('/admin');
        // 强制刷新页面数据，确保列表显示最新内容
        router.refresh(); 
    };

    // 1. 加载状态 UI
    if (loading) return (
        <div className="flex flex-col justify-center items-center min-h-[400px] space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
            <p className="text-gray-500 font-medium">正在调取数据库详情...</p>
        </div>
    );

    // 2. 错误处理 UI
    if (error || !prompt) return (
        <div className="max-w-xl mx-auto mt-20 p-8 bg-red-50 rounded-2xl border border-red-100 text-center">
            <h2 className="text-red-700 text-xl font-bold mb-2">抱歉，出错了</h2>
            <p className="text-red-500 mb-6">{error || '未找到该 Prompt 记录'}</p>
            <Link 
                href="/admin" 
                className="px-6 py-2 bg-white border border-red-200 text-red-600 rounded-xl hover:bg-red-100 transition shadow-sm"
            >
                返回管理列表
            </Link>
        </div>
    );

    // 3. 正常渲染编辑表单
    return (
        <div className="container mx-auto p-8 max-w-4xl">
            {/* 顶部导航和标题 */}
            <div className="flex justify-between items-center mb-10 border-b pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-800">编辑 Prompt</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        ID: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">{params.id}</span>
                    </p>
                </div>
                <Link 
                    href="/admin" 
                    className="px-6 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition shadow-sm text-sm font-bold"
                >
                    &larr; 放弃修改
                </Link>
            </div>

            {/* 表单组件：传入 initialPrompt 激活编辑模式 */}
            <div className="bg-white rounded-2xl">
                <AdminPromptForm 
                    initialPrompt={prompt} 
                    onSuccess={handleSuccess} 
                />
            </div>
        </div>
    );
}