'use client';

import Image from 'next/image';
import CopyButton from './CopyButton'; 
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// -----------------------------------------------------------------
// 接口定义
// -----------------------------------------------------------------
interface Prompt {
    id: number;
    title: string;
    content: string;
    original_image_url: string; 
    optimized_prompt?: string;
    optimized_image_url?: string;
    user_portrait_url?: string;
    user_background_url?: string;
    source_x_account?: string;
}

const isExternalUrl = (url: string | undefined): boolean => {
    if (!url || typeof url !== 'string') return false;
    return url.includes('supabase.co');
};

/**
 * PromptItem 组件：支持普通查看与管理员操作
 */
export default function PromptItem({ prompt, isAdmin = false }: { prompt: Prompt, isAdmin?: boolean }) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    // 删除逻辑
    const handleDelete = async () => {
        if (!confirm('🚨 确定要永久删除这条提示词吗？')) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/admin/delete?id=${prompt.id}`, { method: 'DELETE' });
            if (res.ok) {
                alert('删除成功');
                router.refresh();
            } else {
                throw new Error('删除失败');
            }
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        /* 💥 修改点：h-[520px] 确保高度足够显示两行内容，rounded-[32px] 统一圆角风格 */
        <div className="bg-white p-6 rounded-[32px] shadow-xl transition duration-300 border border-yellow-300 flex flex-col h-[520px] relative hover:shadow-2xl">
            
            {/* 1. 标题栏 & X 账号链接 */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-yellow-700 leading-tight truncate">{prompt.title}</h2>
                    {/* X (Twitter) 作者链接 */}
                    {prompt.source_x_account && (
                        <a 
                            href={`https://x.com/${prompt.source_x_account.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs text-blue-500 hover:text-blue-600 font-medium mt-1"
                        >
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                            @{prompt.source_x_account.replace('@', '')}
                        </a>
                    )}
                </div>
            </div>

            {/* 2. 用户参考图片 (肖像 + 背景) */}
            {(prompt.user_portrait_url || prompt.user_background_url) && (
                <div className="mb-4 p-2 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex space-x-2">
                        {prompt.user_portrait_url && (
                            <div className="relative w-1/2 h-16 rounded-lg overflow-hidden border border-red-200">
                                <Image 
                                    src={prompt.user_portrait_url}
                                    alt="用户肖像"
                                    fill
                                    className="object-cover"
                                    unoptimized={isExternalUrl(prompt.user_portrait_url)}
                                />
                                <span className="absolute top-0 left-0 bg-red-600 text-white text-[8px] px-1">肖像</span>
                            </div>
                        )}
                        {prompt.user_background_url && (
                            <div className="relative w-1/2 h-16 rounded-lg overflow-hidden border border-green-200">
                                <Image 
                                    src={prompt.user_background_url}
                                    alt="用户背景"
                                    fill
                                    className="object-cover"
                                    unoptimized={isExternalUrl(prompt.user_background_url)}
                                />
                                <span className="absolute top-0 left-0 bg-green-600 text-white text-[8px] px-1">背景</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* 3. 结果图片对比区 */}
            <div className="flex space-x-2 mb-4">
                {prompt.original_image_url && (
                    <div className="relative w-1/2 h-32 rounded-xl overflow-hidden border-2 border-dashed border-gray-200"> 
                        <Image
                            src={prompt.original_image_url}
                            alt="原始"
                            fill
                            className="object-cover"
                            unoptimized={isExternalUrl(prompt.original_image_url)}
                        />
                        <span className="absolute bottom-0 right-0 bg-gray-900 text-white text-[9px] px-1.5 rounded-tl-lg">原始图</span>
                    </div>
                )}
                {prompt.optimized_image_url ? (
                    <div className="relative w-1/2 h-32 rounded-xl overflow-hidden border-2 border-green-500"> 
                        <Image
                            src={prompt.optimized_image_url}
                            alt="优化"
                            fill
                            className="object-cover"
                            unoptimized={isExternalUrl(prompt.optimized_image_url)}
                        />
                        <span className="absolute bottom-0 right-0 bg-green-600 text-white text-[9px] px-1.5 rounded-tl-lg">优化图</span>
                    </div>
                ) : (
                    <div className="w-1/2 h-32 bg-gray-50 flex items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-[10px] text-gray-400 text-center p-2">
                        等待优化图片
                    </div>
                )}
            </div>
            
            {/* 4. 提示词对比区 (限制行数以保证布局) */}
            <div className="flex-grow overflow-hidden space-y-3">
                <div className="relative">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Original Prompt</p>
                    <p className="text-gray-600 text-xs line-clamp-2 mt-0.5">{prompt.content}</p>
                </div>

                <div className="relative">
                    <p className="text-[10px] font-bold text-green-500 uppercase tracking-tighter">Optimized Prompt</p>
                    {prompt.optimized_prompt ? (
                        <p className="text-green-800 text-xs line-clamp-2 mt-0.5">{prompt.optimized_prompt}</p>
                    ) : (
                        <p className="text-gray-300 text-xs italic mt-0.5">Waiting for optimization...</p>
                    )}
                </div>
            </div>

            {/* 5. 底部按钮区 */}
            <div className="mt-4 pt-4 border-t border-gray-50 flex flex-col space-y-3">
                {isAdmin ? (
                    <div className="flex space-x-2">
                        <Link 
                            href={`/admin/edit/${prompt.id}`}
                            className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-center text-xs font-bold hover:bg-indigo-700 transition shadow-sm"
                        >
                            编辑
                        </Link>
                        <button 
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex-1 bg-red-50 text-red-600 py-2.5 rounded-xl text-xs font-bold hover:bg-red-100 transition disabled:opacity-50"
                        >
                            {isDeleting ? '...' : '删除'}
                        </button>
                    </div>
                ) : (
                    <div className="flex space-x-2">
                        <CopyButton
                            textToCopy={prompt.optimized_prompt || prompt.content} 
                            label="复制优化"
                            className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black py-2.5 rounded-xl text-xs font-bold transition shadow-sm"
                        />
                        <CopyButton
                            textToCopy={prompt.content} 
                            label="复制原始"
                            className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-200 transition"
                        />
                    </div>
                )}
            </div>

            {/* 💥 悬浮装饰：如果存在作者头像，显示在标题右上角 */}
            {prompt.user_portrait_url && (
                <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full border-4 border-white shadow-lg overflow-hidden z-20">
                    <Image 
                        src={prompt.user_portrait_url} 
                        fill 
                        alt="author" 
                        className="object-cover"
                        unoptimized={isExternalUrl(prompt.user_portrait_url)}
                    />
                </div>
            )}
        </div>
    );
}