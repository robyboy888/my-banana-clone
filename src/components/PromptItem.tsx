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
            if (res.ok) {
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
           1. 背景改为深色透明 bg-slate-900/40 配合磨砂 backdrop-blur。
           2. 边框使用微亮的 slate-800，Hover 时触发 indigo-500 霓虹发光。
           3. 移除白影，改为深色投影。
        */
        <div className="group/card relative flex flex-col h-[560px] p-5 rounded-[28px] bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(79,70,229,0.2)] transition-all duration-500 overflow-hidden">
            
            {/* 卡片装饰微光 */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/10 blur-[60px] rounded-full group-hover/card:bg-indigo-600/20 transition-colors" />

            {/* 1. 标题区域 */}
            <div className="relative z-10 mb-4">
                <h2 className="text-lg font-bold text-white leading-tight truncate group-hover/card:text-indigo-400 transition-colors">
                    {prompt.title}
                </h2>
                {prompt.source_x_account && (
                    <a 
                        href={`https://x.com/${prompt.source_x_account.replace('@', '')}`}
                        target="_blank"
                        className="inline-flex items-center text-[11px] text-slate-500 hover:text-indigo-400 mt-1 transition-colors"
                    >
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        @{prompt.source_x_account.replace('@', '')}
                    </a>
                )}
            </div>

            {/* 2. 图片展示区：深色玻璃容器 */}
            <div className="relative z-10 flex space-x-2 mb-5">
                <div className="relative w-1/2 h-36 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700/50">
                    <Image
                        src={prompt.original_image_url}
                        alt="Original"
                        fill
                        className="object-cover opacity-80 group-hover/card:opacity-100 transition-opacity"
                        unoptimized={isExternalUrl(prompt.original_image_url)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                    <span className="absolute bottom-2 left-2 text-[9px] font-bold text-slate-300 uppercase bg-slate-900/60 px-2 py-0.5 rounded-md">Raw</span>
                </div>

                <div className="relative w-1/2 h-36 rounded-2xl overflow-hidden bg-slate-800 border border-indigo-500/30">
                    {prompt.optimized_image_url ? (
                        <Image
                            src={prompt.optimized_image_url}
                            alt="Optimized"
                            fill
                            className="object-cover"
                            unoptimized={isExternalUrl(prompt.optimized_image_url)}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-indigo-400/50 font-medium italic">Refining...</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/40 via-transparent to-transparent" />
                    <span className="absolute bottom-2 left-2 text-[9px] font-bold text-white uppercase bg-indigo-600 px-2 py-0.5 rounded-md">Magic</span>
                </div>
            </div>

            {/* 3. 提示词对比：深色卡片配色 */}
            <div className="relative z-10 flex-grow space-y-4 overflow-hidden">
                <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/50">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Concept</p>
                    <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed italic">"{prompt.content}"</p>
                </div>

                <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Master Prompt</p>
                    {prompt.optimized_prompt ? (
                        <p className="text-slate-200 text-xs font-medium line-clamp-3 leading-relaxed">
                            {prompt.optimized_prompt}
                        </p>
                    ) : (
                        <p className="text-slate-600 text-xs animate-pulse font-medium">Synthesizing perfect prompt...</p>
                    )}
                </div>
            </div>

            {/* 4. 操作按钮 */}
            <div className="relative z-10 mt-5 pt-4 border-t border-slate-800 flex flex-col space-y-3">
                {isAdmin ? (
                    <div className="flex space-x-2">
                        <Link href={`/admin/edit/${prompt.id}`} className="flex-1 bg-white text-slate-900 py-2.5 rounded-xl text-center text-xs font-black hover:bg-indigo-400 transition-colors">EDIT</Link>
                        <button onClick={handleDelete} className="flex-1 bg-slate-800 text-rose-500 py-2.5 rounded-xl text-xs font-black hover:bg-rose-500 hover:text-white transition-all uppercase">Delete</button>
                    </div>
                ) : (
                    <div className="flex space-x-2">
                        <CopyButton
                            textToCopy={prompt.optimized_prompt || prompt.content} 
                            label="COPY MAGIC"
                            className="flex-1 bg-indigo-600 text-white py-3 rounded-xl text-xs font-black hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/20 uppercase tracking-wider"
                        />
                        <CopyButton
                            textToCopy={prompt.content} 
                            label="RAW"
                            className="w-20 bg-slate-800 text-slate-400 py-3 rounded-xl text-[10px] font-black hover:bg-slate-700 transition-all uppercase"
                        />
                    </div>
                )}
            </div>

            {/* 作者头像：保持大师级悬浮感 */}
            {prompt.user_portrait_url && (
                <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full border-4 border-[#020617] shadow-2xl overflow-hidden z-20 transition-all duration-500 group-hover/card:scale-110 group-hover/card:rotate-12">
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