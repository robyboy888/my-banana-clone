'use client';

import Image from 'next/image';
import React, { useState } from 'react';
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
            setTimeout(() => setCopied(false), 1500); // 1.5秒后恢复颜色
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

// --- 3. 辅助函数：判断是否为外部链接 ---
const isExternalUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    return url.includes('supabase.co') || url.startsWith('http');
};

// --- 4. 默认导出主组件 ---
export default function PromptItem({ prompt, isAdmin = false }: { prompt: Prompt, isAdmin?: boolean }) {
    
    // 解析标签
    const tags = Array.isArray(prompt.tags) ? prompt.tags : [];

    return (
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
                            <span className="font-medium truncate max-w-[120px]">
                                @{(() => {
                                    const url = prompt.source_x_account || "";
                                    const match = url.match(/(?:x\.com|twitter\.com)\/([^\/\?\s]+)/);
                                    return match ? match[1] : url.replace(/^@/, '');
                                })()}
                            </span>
                        </a>
                    </div>
                )}
            </div>

            {/* 2. 图片对比区 - 核心修复点 */}
            <div className="flex space-x-2 mb-4">
                {/* 原始图片 */}
                <div className="relative w-1/2 h-32 rounded-2xl overflow-hidden bg-slate-100">
                    <Image 
                        src={prompt.original_image_url} 
                        alt="原图" 
                        fill 
                        className="object-cover" 
                        unoptimized={isExternalUrl(prompt.original_image_url)} 
                    />
                    <span className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-md text-white text-[9px] px-2 py-0.5 rounded-full font-bold">原始</span>
                </div>

                {/* 优化图片：如果没有优化图，则显示带模糊滤镜的原图 */}
                <div className="relative w-1/2 h-32 rounded-2xl overflow-hidden bg-slate-100 border border-[#3fc1c0]/20">
                    <Image 
                        src={prompt.optimized_image_url || prompt.original_image_url} 
                        alt="优化" 
                        fill 
                        className={`object-cover transition-all duration-500 ${!prompt.optimized_image_url ? 'grayscale opacity-40 blur-[2px]' : ''}`} 
                        unoptimized={isExternalUrl(prompt.optimized_image_url || prompt.original_image_url)} 
                    />
                    <div className={`absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold shadow-sm ${
                        prompt.optimized_image_url ? 'bg-[#3fc1c0] text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                        {prompt.optimized_image_url ? 'AI 优化' : '等待优化'}
                    </div>
                </div>
            </div>

            {/* 3. 提示词内容区 */}
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

            {/* 4. 底部按钮区 */}
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
    );
}