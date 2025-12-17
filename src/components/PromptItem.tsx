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
    source_x_account?: string; // 新增字段
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
        <div className="bg-white p-6 rounded-xl shadow-xl transition duration-300 border border-yellow-300 flex flex-col h-full relative">
            
            {/* 标题栏 & X 账号链接 */}
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-yellow-700 leading-tight flex-1">{prompt.title}</h2>
                {prompt.source_x_account && (
                    <a 
                        href={`https://x.com/${prompt.source_x_account.replace('@', '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-2 flex-shrink-0 text-gray-400 hover:text-black transition"
                        title="查看作者 X 账号"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </a>
                )}
            </div>

            {/* 用户参考图片 (肖像 + 背景) */}
            {(prompt.user_portrait_url || prompt.user_background_url) && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-bold text-blue-700 mb-2 text-sm">用户参考输入：</h3>
                    <div className="flex space-x-2">
                        {prompt.user_portrait_url && (
                            <div className="relative w-1/2 h-20 rounded-lg overflow-hidden border border-red-400">
                                <Image 
                                    src={prompt.user_portrait_url}
                                    alt="用户肖像"
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    unoptimized={isExternalUrl(prompt.user_portrait_url)}
                                />
                                <span className="absolute top-0 left-0 bg-red-600 text-white text-[10px] px-1">肖像</span>
                            </div>
                        )}
                        {prompt.user_background_url && (
                            <div className="relative w-1/2 h-20 rounded-lg overflow-hidden border border-green-400">
                                <Image 
                                    src={prompt.user_background_url}
                                    alt="用户背景"
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    unoptimized={isExternalUrl(prompt.user_background_url)}
                                />
                                <span className="absolute top-0 left-0 bg-green-600 text-white text-[10px] px-1">背景</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* 原始图片与优化图片对比区 */}
            <div className="flex space-x-2 mb-4">
                {prompt.original_image_url && (
                    <div className="relative w-1/2 h-36 rounded-lg overflow-hidden border-2 border-dashed border-gray-300"> 
                        <Image
                            src={prompt.original_image_url}
                            alt="原始"
                            fill
                            sizes="33vw"
                            style={{ objectFit: 'cover' }}
                            unoptimized={isExternalUrl(prompt.original_image_url)}
                        />
                        <span className="absolute bottom-0 right-0 bg-gray-900 text-white text-[10px] px-1 rounded-tl-lg">原始图</span>
                    </div>
                )}
                {prompt.optimized_image_url ? (
                    <div className="relative w-1/2 h-36 rounded-lg overflow-hidden border-2 border-green-500"> 
                        <Image
                            src={prompt.optimized_image_url}
                            alt="优化"
                            fill
                            sizes="33vw"
                            style={{ objectFit: 'cover' }}
                            unoptimized={isExternalUrl(prompt.optimized_image_url)}
                        />
                        <span className="absolute bottom-0 right-0 bg-green-600 text-white text-[10px] px-1 rounded-tl-lg">优化图</span>
                    </div>
                ) : (
                    <div className="w-1/2 h-36 bg-gray-100 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-400 text-[10px] text-gray-500 text-center p-2">
                        等待优化图片
                    </div>
                )}
            </div>
            
            {/* 提示词对比区 */}
            <div className="flex-grow">
                <h3 className="font-semibold text-gray-800 mt-2 text-sm">原始提示词:</h3>
                <p className="text-gray-600 text-xs line-clamp-3 mb-2 p-2 bg-yellow-50 rounded-md border">{prompt.content}</p>

                <h3 className="font-semibold text-gray-800 mt-2 text-sm">优化后提示词:</h3>
                {prompt.optimized_prompt ? (
                    <p className="text-green-700 text-xs line-clamp-3 p-2 bg-green-50 rounded-md border border-green-200">{prompt.optimized_prompt}</p>
                ) : (
                    <p className="text-gray-400 text-xs italic p-2 bg-gray-50 rounded-md border border-dashed text-center">暂无优化提示词</p>
                )}
            </div>

            {/* 底部按钮区 */}
            <div className="mt-6 flex flex-col space-y-3">
                {/* 1. 管理员操作 (仅在管理后台显示) */}
                {isAdmin ? (
                    <div className="flex space-x-2 border-t pt-4 border-gray-100">
                        <Link 
                            href={`/admin/edit/${prompt.id}`}
                            className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-center text-xs font-bold hover:bg-blue-700 transition"
                        >
                            编辑
                        </Link>
                        <button 
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-xs font-bold hover:bg-red-100 transition disabled:opacity-50"
                        >
                            {isDeleting ? '...' : '删除'}
                        </button>
                    </div>
                ) : (
                    /* 2. 普通用户操作 (复制按钮) */
                    <div className="flex space-x-2">
                        <CopyButton
                            textToCopy={prompt.optimized_prompt || prompt.content} 
                            label="复制优化"
                            className="flex-1 bg-yellow-500 text-white py-2 rounded-lg text-xs font-bold hover:bg-yellow-600 transition"
                        />
                        <CopyButton
                            textToCopy={prompt.content} 
                            label="复制原始"
                            className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg text-xs font-bold hover:bg-gray-300 transition"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}