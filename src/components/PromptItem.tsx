'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Copy, ExternalLink, Eye } from 'lucide-react';

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

// --- 2. 辅助函数 ---
const isExternalUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    return url.includes('supabase.co') || url.startsWith('http');
};

const getTwitterUsername = (url: string | undefined): string => {
    if (!url) return "未知作者";
    const match = url.match(/(?:x\.com|twitter\.com)\/([^\/\?\s]+)/);
    return match ? `@${match[1]}` : "查看原文";
};

// --- 3. 默认导出主组件 ---
export default function PromptItem({ prompt, isAdmin = false }: { prompt: Prompt, isAdmin?: boolean }) {
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [showOptimized, setShowOptimized] = useState(true);
    const [copied, setCopied] = useState(false);
    
    useEffect(() => {
        if (previewImage) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [previewImage]);

    const handleCopy = async (e: React.MouseEvent, text: string) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("复制失败:", err);
        }
    };

    const currentImageUrl = (showOptimized && prompt.optimized_image_url) 
        ? prompt.optimized_image_url 
        : prompt.original_image_url;

    return (
        <>
            {/* --- 全屏大图预览灯箱 --- */}
            {previewImage && (
                <div 
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-xl cursor-zoom-out animate-in fade-in duration-300"
                    onClick={() => setPreviewImage(null)}
                >
                    <div className="relative max-w-7xl w-full h-full flex items-center justify-center p-5">
                        <img 
                            src={previewImage} 
                            alt="Preview" 
                            className="max-w-full max-h-full object-contain shadow-2xl animate-in zoom-in-95 duration-300"
                        />
                    </div>
                </div>
            )}

            {/* --- 沉浸式 16:9 卡片主体 --- */}
            <div className="group relative aspect-video w-full rounded-[32px] overflow-hidden bg-slate-900 shadow-xl transition-all duration-700 hover:shadow-2xl hover:scale-[1.01] border border-white/5">
                
                {/* 1. 背景底层：16:9 图片 */}
                <Image 
                    src={currentImageUrl} 
                    alt={prompt.title} 
                    fill 
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    unoptimized={isExternalUrl(currentImageUrl)}
                />

                {/* 2. 渐变遮罩层：确保文字清晰可读 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />

                {/* 3. 右上角：图片切换器 (RAW/AI) */}
                <div className="absolute top-4 right-4 flex p-1 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-[-10px] group-hover:translate-y-0">
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowOptimized(false); }}
                        className={`px-3 py-1 text-[8px] font-black rounded-full transition-all ${!showOptimized ? 'bg-white text-black' : 'text-white/50 hover:text-white'}`}
                    >
                        ORIGINAL
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowOptimized(true); }}
                        className={`px-3 py-1 text-[8px] font-black rounded-full transition-all ${showOptimized ? 'bg-[#3fc1c0] text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
                    >
                        AI REFINED
                    </button>
                </div>

                {/* 4. 左上角：预览按钮 */}
                <button 
                    onClick={() => setPreviewImage(currentImageUrl)}
                    className="absolute top-4 left-4 p-2 bg-black/40 backdrop-blur-xl rounded-full text-white/70 hover:text-white opacity-0 group-hover:opacity-100 transition-all z-20"
                >
                    <Eye className="w-4 h-4" />
                </button>

                {/* 5. 悬浮文字内容层 */}
                <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end min-h-[50%] z-10">
                    {/* 标题 */}
                    <h2 className="text-white text-lg md:text-xl font-black tracking-tighter mb-1 truncate drop-shadow-lg">
                        {prompt.title}
                    </h2>

                    {/* 提示词详情 (平滑展开) */}
                    <div className="max-h-0 opacity-0 group-hover:max-h-32 group-hover:opacity-100 transition-all duration-700 ease-in-out">
                        <p className="text-white/60 text-xs truncate italic mb-3">
                            "{prompt.content}"
                        </p>
                        
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={(e) => handleCopy(e, prompt.optimized_prompt || prompt.content)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black tracking-widest transition-all ${copied ? 'bg-green-500 text-white' : 'bg-white text-black hover:bg-[#3fc1c0] hover:text-white'}`}
                            >
                                <Copy className="w-3 h-3" />
                                {copied ? 'COPIED' : 'COPY PROMPT'}
                            </button>
                            
                            {prompt.source_x_account && (
                                <a 
                                    href={prompt.source_x_account} 
                                    target="_blank" 
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            )}

                            {isAdmin && (
                                <Link 
                                    href={`/admin/edit/${prompt.id}`}
                                    className="ml-auto p-2 bg-amber-500 rounded-full text-white hover:scale-110 transition-all"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* 6. 作者头像 (悬浮显示) */}
                {prompt.user_portrait_url && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20">
                        <div className="w-8 h-8 rounded-full border-2 border-white/20 overflow-hidden shadow-2xl">
                            <Image src={prompt.user_portrait_url} fill className="object-cover" alt="user" unoptimized />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}