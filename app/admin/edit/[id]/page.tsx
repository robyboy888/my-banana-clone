'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import AdminPromptForm from '@/src/components/AdminPromptForm';
import { Prompt } from '@/types/prompt';
import Link from 'next/link';

export default function EditPromptPage() {
    const params = useParams();
    const router = useRouter();
    
    const [prompt, setPrompt] = useState<Prompt | null>(null);
    const [user, setUser] = useState<any>(null); // 新增：保存用户信息
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 初始化客户端用于身份检查
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        const initPage = async () => {
            const promptId = params.id as string;
            if (!promptId) return;

            try {
                // 1. 校验管理员身份 (确保用户信息被带出)
                const { data: { session }, error: authError } = await supabase.auth.getSession();
                
                if (authError || !session) {
                    console.log('未登录，跳转至登录页');
                    router.push('/admin/login');
                    return;
                }
                setUser(session.user);

                // 2. 获取业务数据
                const res = await fetch(`/api/prompts/${promptId}`);
                
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || '无法获取 Prompt 详情');
                }
                
                const data = await res.json();
                setPrompt(data);
            } catch (err: any) {
                console.error('Init Error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        initPage();
    }, [params.id, router, supabase.auth]);

    const handleSuccess = () => {
        alert('Prompt 记录更新成功！');
        router.push('/admin');
        router.refresh(); 
    };

    // 1. 加载状态 UI
    if (loading) return (
        <div className="flex flex-col justify-center items-center min-h-screen space-y-4 bg-gray-50">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
            <p className="text-gray-500 font-medium">正在验证身份并调取详情...</p>
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

    // 3. 正常渲染
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* 顶部状态栏：展示管理员信息 */}
            <div className="bg-white border-b mb-8">
                <div className="container mx-auto px-8 h-14 flex items-center justify-end">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-600 font-medium">管理员: {user?.email}</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-8 max-w-4xl">
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

                {/* 表单组件 */}
                <div className="bg-white rounded-3xl shadow-sm border p-2">
                    <AdminPromptForm 
                        initialPrompt={prompt} 
                        onSuccess={handleSuccess} 
                    />
                </div>
            </div>
        </div>
    );
}