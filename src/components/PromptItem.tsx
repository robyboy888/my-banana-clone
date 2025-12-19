'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ImageIcon, Sparkles, Copy, ExternalLink, ChevronRight } from 'lucide-react';

// --- 1. 接口定义 ---
interface Prompt {
    id: number;
    title: string;
    content: string;
    original_image_url: string;
    optimized_prompt?: string;
    optimized_image_url?: string;
    user_portrait_url?: string;
    source_x_account?: string;
    tags?: any;
}

// --- 2. 内部组件：带变色动画的静默复制按钮 ---
function InlineCopyButton({ textToCopy, label, className }: { textToCopy: string, label: string, className: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (!textToCopy) return;
        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500); 
        } catch (err) {
            console.error("复制失败:", err);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className={`${className} transition-all duration-300 flex items-center justify-center gap-1 active:scale-95 ${
                copied ? '!bg-green-500 !text-white border-transparent' : ''
            }`}
        >
            {copied ? (
                <>
                    <svg className="w-3 h-3 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>已复制</span>
                </>
            ) : (
                <span>{label}</span>
            )}
        </button>
    );
}

// --- 3. 辅助函数 ---
const isExternalUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    return url.includes('supabase.co') || url.startsWith('http');
};

const getTwitterUsername = (url: string | undefined): string => {
    if (!url) return "未知作者";
    const match = url.match(/(?:x\.com|twitter\.com)\/([^\/\?\s]+)/);
    return match ? `@${match[1]}` : "查看原文";
};

// --- 4. 默认导出主组件 ---
export default function PromptItem({ prompt, isAdmin = false }: { prompt: Prompt, isAdmin?: boolean }) {
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [showOptimized, setShowOptimized] = useState(true); // 控制显示哪张图
    
    useEffect(() => {
        if (previewImage) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [previewImage]);

    // 当前应该显示的图片地址
    const currentImageUrl = (showOptimized && prompt.optimized_image_url) 
        ? prompt.optimized_image_url 
        : prompt.original_image_url;

    return (
        <>
            {/* --- 全屏大图预览灯箱 --- */}
            {previewImage && (
                <div 
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md cursor-zoom-out animate-in fade-in duration-300"
                    onClick={() => setPreviewImage(null)}
                >
                    <div className="relative w-full h-full flex items-center justify-center p-4 md:p-10 text-white">
                        <button className="absolute top-6 right-6 hover:scale-110 transition-transform">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <img 
                            src={previewImage} 
                            alt="Large Preview" 
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
                            onClick={(e) => e.stopPropagation()} 
                        />
                    </div>
                </div>
            )}

            {/* --- 卡片主体 --- */}
            <div className="group/card bg-white rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden flex flex-col relative">
                
                {/* 1. 图片展示区 (二选一) */}
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                    <Image 
                        src={currentImageUrl} 
                        alt={prompt.title} 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover/card:scale-110 cursor-zoom-in"
                        unoptimized={isExternalUrl(currentImageUrl)}
                        onClick={() => setPreviewImage(currentImageUrl)}
                    />

                    {/* 图片类型切换控制 (右上角毛玻璃效果) */}
                    <div className="absolute top-4 right-4 flex p-1 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 z-10">
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowOptimized(false); }}
                            className={`px-3 py-1.5 text-[9px] font-black rounded-xl transition-all ${!showOptimized ? 'bg-white text-slate-900 shadow-lg' : 'text-white/60 hover:text-white'}`}
                        >
                            ORIGINAL
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowOptimized(true); }}
                            className={`px-3 py-1.5 text-[9px] font-black rounded-xl transition-all ${showOptimized ? 'bg-[#3fc1c0] text-white shadow-lg' : 'text-white/60 hover:text-white'}`}
                        >
                            OPTIMIZED
                        </button>
                    </div>
                </div>

                {/* 2. 内容区域 */}
                <div className="p-6 space-y-4">
                    {/* 标题 */}
                    <h2 className="text-base font-black text-slate-800 truncate tracking-tight group-hover/card:text-[#3fc1c0] transition-colors">
                        {prompt.title}
                    </h2>

                    {/* 原始输入 - 只显示一行 */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                            <ImageIcon className="w-3 h-3" />
                            My Input
                        </div>
                        <p className="text-xs text-slate-500 truncate italic border-l-2 border-slate-100 pl-3">
                            "{prompt.content}"
                        </p>
                    </div>

                    {/* 优化词 - 只显示一行 */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-[#3fc1c0] uppercase tracking-widest">
                            <Sparkles className="w-3 h-3" />
                            AI Refined
                        </div>
                        <p className="text-xs text-slate-800 font-bold truncate tracking-tight">
                            {prompt.optimized_prompt || "AI 正在深度优化中..."}
                        </p>
                    </div>

                    {/* 作者与作者头像 (整合到一行) */}
                    <div className="flex items-center justify-between pt-2">
                        {prompt.source_x_account && (
                            <a 
                                href={prompt.source_x_account} 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-slate-400 hover:text-[#3fc1c0] transition-colors"
                            >
                                <svg className="w-3 h-3 mr-1 fill-current" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                                <span className="text-[10px] font-bold truncate max-w-[100px]">
                                    {getTwitterUsername(prompt.source_x_account)}
                                </span>
                            </a>
                        )}
                        {prompt.user_portrait_url && (
                            <div className="w-6 h-6 rounded-full border border-slate-100 overflow-hidden relative">
                                <Image 
                                    src={prompt.user_portrait_url} 
                                    fill 
                                    alt="avatar" 
                                    className="object-cover" 
                                    unoptimized={isExternalUrl(prompt.user_portrait_url)} 
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. 底部操作按钮 */}
                <div className="px-6 pb-6 flex gap-2">
                    {!isAdmin ? (
                        <>
                            <InlineCopyButton
                                textToCopy={prompt.optimized_prompt || prompt.content} 
                                label="复制优化词"
                                className="flex-1 bg-[#3fc1c0] text-white py-3 rounded-2xl text-[11px] font-black hover:bg-[#34a3a2] shadow-lg shadow-[#3fc1c0]/10"
                            />
                            <InlineCopyButton
                                textToCopy={prompt.content} 
                                label="原词"
                                className="w-16 bg-slate-100 text-slate-400 py-3 rounded-2xl text-[10px] font-bold hover:bg-slate-200"
                            />
                        </>
                    ) : (
                        <Link 
                            href={`/admin/edit/${prompt.id}`} 
                            className="w-full bg-slate-900 text-white py-3 rounded-2xl text-center text-xs font-black hover:bg-black transition-colors"
                        >
                            编辑项目
                        </Link>
                    )}
                </div>
            </div>
        </>
    );
}