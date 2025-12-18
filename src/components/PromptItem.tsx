'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// --- 1. 接口定义 ---
interface Prompt {
    id: number;
    title: string;
    content: string;
    original_image_url: string;
    optimized_prompt?: string;
    optimized_image_url?: string;
    user_portrait_url?: string;
    source_x_account?: string; // 这里存储的是 X 贴文的完整 URL
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

// 提取 X 用户名的增强版：适配个人主页和具体贴文链接
const getTwitterUsername = (url: string | undefined): string => {
    if (!url) return "未知作者";
    const match = url.match(/(?:x\.com|twitter\.com)\/([^\/\?\s]+)/);
    return match ? `@${match[1]}` : "查看原文";
};

// --- 4. 默认导出主组件 ---
export default function PromptItem({ prompt, isAdmin = false }: { prompt: Prompt, isAdmin?: boolean }) {
    // 控制放大预览的状态
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    
    // 解析标签
    const tags = Array.isArray(prompt.tags) ? prompt.tags : [];

    // 当大图打开时，禁止背景页面滚动
    useEffect(() => {
        if (previewImage) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [previewImage]);

    return (
        <>
            {/* --- 全屏大图预览灯箱 --- */}
            {previewImage && (
                <div 
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md cursor-zoom-out animate-in fade-in duration-300"
                    onClick={() => setPreviewImage(null)}
                >
                    <div className="relative w-full h-full flex items-center justify-center p-4 md:p-10">
                        {/* 关闭按钮 */}
                        <button className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-10">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        
                        {/* 大图主体 */}
                        <img 
                            src={previewImage} 
                            alt="Large Preview" 
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
                            onClick={(e) => e.stopPropagation()} 
                        />
                        
                        {/* 底部标题提示 */}
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
                            {prompt.title}
                        </div>
                    </div>
                </div>
            )}

            <div className="group/card bg-white p-5 rounded-[32px] shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-[560px] border border-slate-100 relative">
                
                {/* 1. 标题与作者区 */}
                <div className="mb-4">
                    <h2 className="text-lg font-bold text-slate-800 truncate leading-tight group-hover/card:text-[#3fc1c0] transition-colors">
                        {prompt.title}
                    </h2>

                    <div className="flex flex-wrap gap-1.5 mt-2 min-h-[20px]">
                        {tags.length > 0 ? (
                            tags.map((tag: string) => (
                                <span key={tag} className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-[#3fc1c0]/10 text-[#3fc1c0] border border-[#3fc1c0]/10">
                                    #{tag}
                                </span>
                            ))
                        ) : (
                            <span className="text-[9px] text-slate-300 italic">未分类</span>
                        )}
                    </div>

                    {/* 作者显示与贴文跳转逻辑 */}
                    {prompt.source_x_account && (
                        <div className="text-[11px] mt-2 flex items-center group/author">
                            <span className="bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded mr-2 text-[9px] font-bold shrink-0">作者</span>
                            <a 
                                href={prompt.source_x_account} 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-slate-500 hover:text-[#3fc1c0] transition-colors duration-200"
                            >
                                <svg className="w-3 h-3 mr-1 fill-current" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                                <span className="font-medium truncate max-w-[140px]">
                                    {getTwitterUsername(prompt.source_x_account)}
                                </span>
                            </a>
                        </div>
                    )}
                </div>

                {/* 2. 图片对比区 - 点击预览功能 */}
                <div className="flex space-x-2 mb-4">
                    <div 
                        className="relative w-1/2 h-32 rounded-2xl overflow-hidden bg-slate-100 cursor-zoom-in group/img"
                        onClick={() => setPreviewImage(prompt.original_image_url)}
                    >
                        <Image 
                            src={prompt.original_image_url} 
                            alt="原图" 
                            fill 
                            className="object-cover transition-transform duration-500 group-hover/img:scale-110" 
                            unoptimized={isExternalUrl(prompt.original_image_url)} 
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                        </div>
                        <span className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-md text-white text-[9px] px-2 py-0.5 rounded-full font-bold">原始</span>
                    </div>

                    <div 
                        className={`relative w-1/2 h-32 rounded-2xl overflow-hidden bg-slate-100 border border-[#3fc1c0]/20 ${prompt.optimized_image_url ? 'cursor-zoom-in group/img-opt' : ''}`}
                        onClick={() => prompt.optimized_image_url && setPreviewImage(prompt.optimized_image_url)}
                    >
                        <Image 
                            src={prompt.optimized_image_url || prompt.original_image_url} 
                            alt="优化" 
                            fill 
                            className={`object-cover transition-all duration-500 ${!prompt.optimized_image_url ? 'grayscale opacity-40 blur-[2px]' : 'group-hover/img-opt:scale-110'}`} 
                            unoptimized={isExternalUrl(prompt.optimized_image_url || prompt.original_image_url)} 
                        />
                        {prompt.optimized_image_url && (
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img-opt:opacity-100 transition-opacity flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                </svg>
                            </div>
                        )}
                        <div className={`absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold shadow-sm ${
                            prompt.optimized_image_url ? 'bg-[#3fc1c0] text-white' : 'bg-slate-200 text-slate-500'
                        }`}>
                            {prompt.optimized_image_url ? 'AI 优化' : '等待优化'}
                        </div>
                    </div>
                </div>

                {/* 3. 内容区 */}
                <div className="flex-grow space-y-4 overflow-hidden">
                    <div className="bg-[#f8fafb] p-3 rounded-2xl border border-slate-50">
                        <p className="text-[10px] font-black text-slate-300 uppercase mb-1">我的输入</p>
                        <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed italic">"{prompt.content}"</p>
                    </div>
                    <div className="bg-[#f0f9f9] p-3 rounded-2xl border border-[#3fc1c0]/10">
                        <p className="text-[10px] font-black text-[#3fc1c0] uppercase mb-1">优化后的提示词</p>
                        <p className="text-slate-700 text-xs font-medium line-clamp-3 leading-relaxed">
                            {prompt.optimized_prompt || "AI 正在深度优化中..."}
                        </p>
                    </div>
                </div>

                {/* 4. 底部按钮 */}
                <div className="mt-5 pt-4 border-t border-slate-50 flex gap-2">
                    {!isAdmin ? (
                        <>
                            <InlineCopyButton
                                textToCopy={prompt.optimized_prompt || prompt.content} 
                                label="复制优化词"
                                className="flex-1 bg-[#3fc1c0] text-white py-3 rounded-xl text-xs font-bold hover:bg-[#34a3a2]"
                            />
                            <InlineCopyButton
                                textToCopy={prompt.content} 
                                label="原词"
                                className="w-16 bg-[#2a353a] text-slate-300 py-3 rounded-xl text-[10px] font-bold hover:bg-[#1a2327]"
                            />
                        </>
                    ) : (
                        <Link 
                            href={`/admin/edit/${prompt.id}`} 
                            className="w-full bg-slate-800 text-white py-2.5 rounded-xl text-center text-xs font-bold hover:bg-black transition-colors"
                        >
                            编辑此项目
                        </Link>
                    )}
                </div>

                {/* 悬浮作者头像 */}
                {prompt.user_portrait_url && (
                    <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full border-4 border-[#f2f4f6] shadow-sm overflow-hidden z-20">
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
        </>
    );
}