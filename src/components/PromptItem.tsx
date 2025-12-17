'use client';

import Image from 'next/image';
import CopyButton from './CopyButton'; 
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
    return url.includes('supabase.co') || url.startsWith('http');
};

export default function PromptItem({ prompt, isAdmin = false }: { prompt: Prompt, isAdmin?: boolean }) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm('🚨 确定要永久删除这条提示词吗？')) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/admin/delete?id=${prompt.id}`, { method: 'DELETE' });
            if (res.ok) router.refresh();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="group/card relative flex flex-col h-[560px] p-5 rounded-[28px] bg-slate-800/40 backdrop-blur-md border border-slate-700/50 hover:border-indigo-500/50 transition-all duration-500 overflow-hidden shadow-xl">
            
            {/* 1. 标题区域 */}
            <div className="relative z-10 mb-4">
                <h2 className="text-lg font-bold text-slate-100 truncate group-hover/card:text-indigo-400 transition-colors">
                    {prompt.title}
                </h2>
                {prompt.source_x_account && (
                    <div className="text-[11px] text-slate-500 mt-1">
                        <span className="bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded mr-2">作者</span>
                        @{prompt.source_x_account.replace('@', '')}
                    </div>
                )}
            </div>

            {/* 2. 图片展示：中文标注 */}
            <div className="relative z-10 flex space-x-2 mb-5">
                <div className="relative w-1/2 h-36 rounded-2xl overflow-hidden bg-slate-900 border border-slate-700">
                    <Image src={prompt.original_image_url} alt="原始" fill className="object-cover opacity-80" unoptimized={isExternalUrl(prompt.original_image_url)} />
                    <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-md">原始效果</span>
                </div>
                <div className="relative w-1/2 h-36 rounded-2xl overflow-hidden bg-slate-900 border border-indigo-500/30">
                    {prompt.optimized_image_url ? (
                        <>
                            <Image src={prompt.optimized_image_url} alt="优化" fill className="object-cover" unoptimized={isExternalUrl(prompt.optimized_image_url)} />
                            <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white bg-indigo-600 px-2 py-0.5 rounded-md">AI 优化后</span>
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-600 italic">生成中...</div>
                    )}
                </div>
            </div>

            {/* 3. 提示词内容 */}
            <div className="relative z-10 flex-grow space-y-4 overflow-hidden text-[13px]">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/40">
                    <p className="text-[10px] font-bold text-slate-500 mb-1">我的输入</p>
                    <p className="text-slate-400 line-clamp-2 leading-relaxed italic">"{prompt.content}"</p>
                </div>
                <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
                    <p className="text-[10px] font-bold text-indigo-400 mb-1">优化后的提示词</p>
                    <p className="text-slate-200 font-medium line-clamp-3 leading-relaxed">
                        {prompt.optimized_prompt || "AI 正在思考更佳表达..."}
                    </p>
                </div>
            </div>

            {/* 4. 操作按钮：改回中文 */}
            <div className="relative z-10 mt-5 pt-4 border-t border-slate-700/50 flex flex-col space-y-3">
                {isAdmin ? (
                    <div className="flex space-x-2">
                        <Link href={`/admin/edit/${prompt.id}`} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-center text-xs font-bold hover:bg-indigo-500 transition-colors">编辑</Link>
                        <button onClick={handleDelete} className="flex-1 bg-slate-700 text-slate-300 py-2.5 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all">删除</button>
                    </div>
                ) : (
                    <div className="flex space-x-2">
                        <CopyButton textToCopy={prompt.optimized_prompt || prompt.content} label="复制优化词" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl text-xs font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/40" />
                        <CopyButton textToCopy={prompt.content} label="原始词" className="w-20 bg-slate-700 text-slate-400 py-3 rounded-xl text-[10px] font-bold hover:bg-slate-600 transition-all" />
                    </div>
                )}
            </div>

            {/* 作者头像 */}
            {prompt.user_portrait_url && (
                <div className="absolute -top-1 -right-1 w-12 h-12 rounded-full border-2 border-slate-900 shadow-2xl overflow-hidden z-20">
                    <Image src={prompt.user_portrait_url} fill alt="author" className="object-cover" unoptimized={isExternalUrl(prompt.user_portrait_url)} />
                </div>
            )}
        </div>
    );
}