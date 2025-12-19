'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Copy, ExternalLink, Eye, ImageIcon, User } from 'lucide-react';

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
    
    // 处理大图预览时的滚动锁定
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
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-2xl cursor-zoom-out animate-in fade-in duration-300"
                    onClick={() => setPreviewImage(null)}
                >
                    <div className="relative max-h-screen p-4 flex items-center justify-center">
                        <img 
                            src={previewImage} 
                            alt="Preview" 
                            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300"
                        />
                    </div>
                </div>
            )}

            {/* --- 沉浸式 9:16 卡片主体 --- */}
            <div className="group relative aspect-[9/16] w-full rounded-[40px] overflow-hidden bg-slate-900 shadow-xl transition-all duration-700 hover:shadow-[#3fc1c0]/20 hover:-translate-y-2 border border-white/5">
                
                {/* 1. 背景底层：9:16 图片 */}
                <Image 
                    src={currentImageUrl} 
                    alt={prompt.title} 
                    fill 
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    unoptimized={isExternalUrl(currentImageUrl)}
                />

                {/* 2. 深度渐变遮罩：从底部向上半部分延伸，确保 UI 可见 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />

                {/* 3. 右上角：控制按钮组 (垂直排列) */}
                <div className="absolute top-6 right-6 flex flex-col gap-3 z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowOptimized(true); }}
                        className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-xl border transition-all ${showOptimized ? 'bg-[#3fc1c0] border-[#3fc1c0] text-white shadow-lg shadow-[#3fc1c0]/40' : 'bg-black/20 border-white/10 text-white/50 hover:text-white'}`}
                        title="AI Refined"
                    >
                        <Sparkles className="w-5 h-5" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowOptimized(false); }}
                        className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-xl border transition-all ${!showOptimized ? 'bg-white border-white text-black shadow-lg' : 'bg-black/20 border-white/10 text-white/50 hover:text-white'}`}
                        title="Original"
                    >
                        <ImageIcon className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => setPreviewImage(currentImageUrl)}
                        className="w-11 h-11 rounded-full flex items-center justify-center bg-black/20 border border-white/10 text-white/50 hover:bg-white hover:text-black hover:border-white transition-all shadow-xl"
                    >
                        <Eye className="w-5 h-5" />
                    </button>
                </div>

                {/* 4. 底部文字内容层 */}
                <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col justify-end min-h-[40%] z-10">
                    
                    {/* 作者简讯 (如有) */}
                    {prompt.source_x_account && (
                        <div className="flex items-center gap-2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                            <div className="w-5 h-5 rounded-full overflow-hidden relative border border-white/20 bg-slate-800">
                                {prompt.user_portrait_url ? (
                                    <img src={prompt.user_portrait_url} className="object-cover w-full h-full" alt="" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center"><User size={10} className="text-white"/></div>
                                )}
                            </div>
                            <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                                {getTwitterUsername(prompt.source_x_account)}
                            </span>
                        </div>
                    )}

                    {/* 标题 */}
                    <h2 className="text-white text-xl md:text-2xl font-black tracking-tight leading-tight mb-3 transition-colors group-hover:text-[#3fc1c0]">
                        {prompt.title}
                    </h2>

                    {/* 提示词详情：默认截断，Hover 展开 */}
                    <p className="text-white/50 text-[11px] leading-relaxed italic mb-6 line-clamp-1 group-hover:line-clamp-3 transition-all duration-500">
                        "{prompt.optimized_prompt || prompt.content}"
                    </p>
                    
                    {/* 操作按钮组 */}
                    <div className="flex items-center gap-3 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                        <button 
                            onClick={(e) => handleCopy(e, prompt.optimized_prompt || prompt.content)}
                            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-[11px] font-black tracking-[0.1em] transition-all shadow-xl ${copied ? 'bg-green-500 text-white scale-95' : 'bg-white text-black hover:bg-[#3fc1c0] hover:text-white'}`}
                        >
                            <Copy className="w-4 h-4" />
                            {copied ? 'COPIED' : 'COPY PROMPT'}
                        </button>
                        
                        {prompt.source_x_account && (
                            <a 
                                href={prompt.source_x_account} 
                                target="_blank" 
                                onClick={(e) => e.stopPropagation()}
                                className="p-4 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-white hover:text-black transition-all shadow-xl"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        )}

                        {isAdmin && (
                            <Link 
                                href={`/admin/edit/${prompt.id}`}
                                className="p-4 bg-amber-500 text-white rounded-2xl hover:bg-amber-600 transition-all shadow-xl"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}