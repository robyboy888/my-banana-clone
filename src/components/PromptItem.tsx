'use client';

import Image from 'next/image';
import CopyButton from './CopyButton'; 
import React from 'react';
import Link from 'next/link';

interface Prompt {
    id: number;
    title: string;
    content: string;
    original_image_url: string; 
    optimized_prompt?: string;
    optimized_image_url?: string;
    user_portrait_url?: string;
    source_x_account?: string;
}

const isExternalUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    return url.includes('supabase.co') || url.startsWith('http');
};

export default function PromptItem({ prompt, isAdmin = false }: { prompt: Prompt, isAdmin?: boolean }) {
    return (
        <div className="group/card bg-white p-5 rounded-[32px] shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-[540px] border border-slate-100 relative">
            
            {/* 1. 标题区 */}
            <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-800 truncate leading-tight group-hover/card:text-[#3fc1c0] transition-colors">
                    {prompt.title}
                </h2>
                {prompt.source_x_account && (
                    <p className="text-[11px] text-slate-400 mt-0.5">@{prompt.source_x_account}</p>
                )}
            </div>

            {/* 2. 图片对比区：Admin 风格圆角 */}
            <div className="flex space-x-2 mb-4">
                <div className="relative w-1/2 h-32 rounded-2xl overflow-hidden bg-slate-100">
                    <Image src={prompt.original_image_url} alt="原图" fill className="object-cover" unoptimized={isExternalUrl(prompt.original_image_url)} />
                    <span className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-md text-white text-[9px] px-2 py-0.5 rounded-full font-bold">原始</span>
                </div>
                <div className="relative w-1/2 h-32 rounded-2xl overflow-hidden bg-slate-100 border border-[#3fc1c0]/30">
                    {prompt.optimized_image_url && (
                        <Image src={prompt.optimized_image_url} alt="优化" fill className="object-cover" unoptimized={isExternalUrl(prompt.optimized_image_url)} />
                    )}
                    <span className="absolute bottom-2 left-2 bg-[#3fc1c0] text-white text-[9px] px-2 py-0.5 rounded-full font-bold">AI 优化</span>
                </div>
            </div>

            {/* 3. 提示词内容：低疲劳感灰色区域 */}
            <div className="flex-grow space-y-4 overflow-hidden">
                <div className="bg-[#f8fafb] p-3 rounded-2xl border border-slate-50">
                    <p className="text-[10px] font-black text-slate-300 uppercase mb-1">我的输入</p>
                    <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">{prompt.content}</p>
                </div>
                <div className="bg-[#f0f9f9] p-3 rounded-2xl border border-[#3fc1c0]/10">
                    <p className="text-[10px] font-black text-[#3fc1c0] uppercase mb-1">优化后的提示词</p>
                    <p className="text-slate-700 text-xs font-medium line-clamp-3 leading-relaxed">
                        {prompt.optimized_prompt || "AI 正在优化中..."}
                    </p>
                </div>
            </div>

            {/* 4. 底部按钮：Admin 同款配色 */}
            <div className="mt-5 pt-4 border-t border-slate-50 flex gap-2">
                {!isAdmin ? (
                    <>
                        <CopyButton
                            textToCopy={prompt.optimized_prompt || prompt.content} 
                            label="复制优化词"
                            className="flex-1 bg-[#3fc1c0] text-white py-3 rounded-xl text-xs font-bold hover:bg-[#34a3a2] transition-all"
                        />
                        <CopyButton
                            textToCopy={prompt.content} 
                            label="原词"
                            className="w-16 bg-[#2a353a] text-slate-300 py-3 rounded-xl text-[10px] font-bold hover:bg-[#1a2327] transition-all"
                        />
                    </>
                ) : (
                    <Link href={`/admin/edit/${prompt.id}`} className="w-full bg-[#3fc1c0] text-white py-2.5 rounded-xl text-center text-xs font-bold">编辑</Link>
                )}
            </div>

            {/* 头像 */}
            {prompt.user_portrait_url && (
                <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full border-4 border-[#f2f4f6] shadow-sm overflow-hidden z-20">
                    <Image src={prompt.user_portrait_url} fill alt="avatar" className="object-cover" unoptimized={isExternalUrl(prompt.user_portrait_url)} />
                </div>
            )}
        </div>
    );
}