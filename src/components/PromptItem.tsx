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
 * 视觉风格：极简大师级，低疲劳感设计
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
        /* 💥 视觉升级点：
           1. h-[520px] 固定高度确保网格整齐。
           2. bg-white 配合非常淡的 border-slate-100。
           3. 阴影使用了极其细腻的扩散阴影 (shadow-[0_8px_30px_rgb(0,0,0,0.04)])，Hover 时变为 Indigo 调。
        */
        <div className="group/card bg-white p-6 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(79,70,229,0.15)] transition-all duration-500 border border-slate-100 flex flex-col h-[520px] relative">
            
            {/* 卡片内部渐变背景装饰 (仅 Hover 显示) */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-indigo-50/30 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 rounded-[32px] pointer-events-none" />

            {/* 1. 标题栏 & X 账号链接 */}
            <div className="relative z-10 flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-slate-800 leading-tight truncate group-hover/card:text-indigo-600 transition-colors">
                        {prompt.title}
                    </h2>
                    {/* X (Twitter) 作者链接 */}
                    {prompt.source_x_account && (
                        <a 
                            href={`https://x.com/${prompt.source_x_account.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs text-slate-400 hover:text-blue-500 font-medium mt-1 transition-colors"
                        >
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                            @{prompt.source_x_account.replace('@', '')}
                        </a>
                    )}
                </div>
            </div>

            {/* 2. 用户参考图片区域 */}
            {(prompt.user_portrait_url || prompt.user_background_url) && (
                <div className="relative z-10 mb-4 p-2 bg-slate-50/50 rounded-2xl border border-slate-100 backdrop-blur-sm">
                    <div className="flex space-x-2">
                        {prompt.user_portrait_url && (
                            <div className="relative w-1/2 h-16 rounded-xl overflow-hidden grayscale-[0.3] hover:grayscale-0 transition-all duration-300">
                                <Image 
                                    src={prompt.user_portrait_url}
                                    alt="Portrait"
                                    fill
                                    className="object-cover"
                                    unoptimized={isExternalUrl(prompt.user_portrait_url)}
                                />
                                <div className="absolute inset-0 bg-black/10" />
                                <span className="absolute top-1 left-1 bg-white/80 backdrop-blur-md text-slate-800 text-[8px] px-1.5 py-0.5 rounded-md font-bold uppercase">Portrait</span>
                            </div>
                        )}
                        {prompt.user_background_url && (
                            <div className="relative w-1/2 h-16 rounded-xl overflow-hidden grayscale-[0.3] hover:grayscale-0 transition-all duration-300">
                                <Image 
                                    src={prompt.user_background_url}
                                    alt="Background"
                                    fill
                                    className="object-cover"
                                    unoptimized={isExternalUrl(prompt.user_background_url)}
                                />
                                <div className="absolute inset-0 bg-black/10" />
                                <span className="absolute top-1 left-1 bg-white/80 backdrop-blur-md text-slate-800 text-[8px] px-1.5 py-0.5 rounded-md font-bold uppercase">Scene</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* 3. 结果图片对比区 */}
            <div className="relative z-10 flex space-x-2 mb-4">
                {prompt.original_image_url && (
                    <div className="relative w-1/2 h-32 rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 bg-slate-50 transition-transform duration-500 group-hover/card:scale-[0.98]"> 
                        <Image
                            src={prompt.original_image_url}
                            alt="Original"
                            fill
                            className="object-cover"
                            unoptimized={isExternalUrl(prompt.original_image_url)}
                        />
                        <span className="absolute bottom-2 left-2 bg-slate-900/60 backdrop-blur-md text-white text-[9px] px-2 py-0.5 rounded-full font-medium">Original</span>
                    </div>
                )}
                {prompt.optimized_image_url ? (
                    <div className="relative w-1/2 h-32 rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-lg shadow-indigo-100 transition-transform duration-500 group-hover/card:scale-[1.02]"> 
                        <Image
                            src={prompt.optimized_image_url}
                            alt="Optimized"
                            fill
                            className="object-cover"
                            unoptimized={isExternalUrl(prompt.optimized_image_url)}
                        />
                        <span className="absolute bottom-2 left-2 bg-indigo-600 backdrop-blur-md text-white text-[9px] px-2 py-0.5 rounded-full font-bold">Optimized</span>
                    </div>
                ) : (
                    <div className="w-1/2 h-32 bg-slate-50 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 text-[10px] text-slate-400 text-center p-2">
                        <span className="animate-pulse">Analyzing...</span>
                    </div>
                )}
            </div>
            
            {/* 4. 提示词对比区 (低疲劳配色) */}
            <div className="relative z-10 flex-grow overflow-hidden space-y-3">
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Input context</p>
                    <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">{prompt.content}</p>
                </div>

                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Enhanced Prompt</p>
                    {prompt.optimized_prompt ? (
                        <p className="text-slate-700 text-xs font-medium line-clamp-2 leading-relaxed">{prompt.optimized_prompt}</p>
                    ) : (
                        <p className="text-slate-300 text-xs italic">Awaiting AI enhancement...</p>
                    )}
                </div>
            </div>

            {/* 5. 底部按钮区 */}
            <div className="relative z-10 mt-4 pt-4 border-t border-slate-50 flex flex-col space-y-3">
                {isAdmin ? (
                    <div className="flex space-x-2">
                        <Link 
                            href={`/admin/edit/${prompt.id}`}
                            className="flex-1 bg-slate-900 text-white py-2.5 rounded-2xl text-center text-xs font-bold hover:bg-indigo-600 transition-all duration-300 shadow-sm"
                        >
                            Edit Record
                        </Link>
                        <button 
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex-1 bg-rose-50 text-rose-600 py-2.5 rounded-2xl text-xs font-bold hover:bg-rose-100 transition-all duration-300 disabled:opacity-50"
                        >
                            {isDeleting ? '...' : 'Remove'}
                        </button>
                    </div>
                ) : (
                    <div className="flex space-x-2">
                        <CopyButton
                            textToCopy={prompt.optimized_prompt || prompt.content} 
                            label="Copy Optimized"
                            className="flex-1 bg-indigo-600 text-white py-2.5 rounded-2xl text-xs font-bold hover:bg-indigo-700 transition-all duration-300 shadow-md shadow-indigo-100"
                        />
                        <CopyButton
                            textToCopy={prompt.content} 
                            label="Original"
                            className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-2xl text-xs font-bold hover:bg-slate-200 transition-all duration-300"
                        />
                    </div>
                )}
            </div>

            {/* 💥 悬浮作者头像：大师级交互 (Hover 时会有放大和微旋动画) */}
            {prompt.user_portrait_url && (
                <div className="absolute -top-3 -right-3 w-14 h-14 rounded-full border-4 border-white shadow-xl shadow-slate-200/50 overflow-hidden z-20 transition-all duration-500 group-hover/card:scale-110 group-hover/card:rotate-6">
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