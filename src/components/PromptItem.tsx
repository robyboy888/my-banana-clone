'use client';

import Image from 'next/image';
import CopyButton from './CopyButton'; 
import React from 'react';
import Link from 'next/link';
// src/components/PromptItem.tsx
import React, { useState } from 'react';

interface Prompt {
    id: number;
    title: string;
    content: string;
    original_image_url: string; 
    optimized_prompt?: string;
    optimized_image_url?: string;
    user_portrait_url?: string;
    source_x_account?: string;
// 修改这里：允许 tags 为 any 类型，因为 jsonb 在 TS 中比较特殊
    tags?: any;
}

const isExternalUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    return url.includes('supabase.co') || url.startsWith('http');
};

export default function PromptItem({ prompt, isAdmin = false }: { prompt: Prompt, isAdmin?: boolean }) {
    return (
        <div className="group/card bg-white p-5 rounded-[32px] shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-[540px] border border-slate-100 relative">
            
            {/* 1. 标题与信息区 */}
            <div className="mb-4">
                {/* 标题 */}
                <h2 className="text-lg font-bold text-slate-800 truncate leading-tight group-hover/card:text-[#3fc1c0] transition-colors">
                    {prompt.title}
                </h2>

                {/* 分类标签展示 */}
                <div className="flex flex-wrap gap-1.5 mt-2 min-h-[20px]">
                    {Array.isArray(prompt.tags) && prompt.tags.length > 0 ? (
                        prompt.tags.map((tag: string) => (
                            <span 
                                key={tag} 
                                className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-[#3fc1c0]/10 text-[#3fc1c0] border border-[#3fc1c0]/10"
                            >
                                #{tag}
                            </span>
                        ))
                    ) : (
                        <span className="text-[9px] text-slate-300 italic">未分类</span>
                    )}
                </div>

                {/* 作者 X 账号区域 */}
                {prompt.source_x_account && (
                    <div className="text-[11px] mt-2 flex items-center group/author">
                        <span className="bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded mr-2 text-[9px] font-bold shrink-0">
                            作者
                        </span>
                        
                        <a 
                            href={`https://x.com/${prompt.source_x_account.replace(/^@/, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-slate-500 hover:text-[#3fc1c0] transition-colors duration-200"
                        >
                            <svg className="w-3 h-3 mr-1 fill-current" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                            <span className="font-medium truncate max-w-[120px]">
                                @{prompt.source_x_account.replace(/^@/, '')}
                            </span>
                        </a>
                    </div>
                )}
            </div>

            {/* 2. 图片对比区 */}
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

            {/* 3. 提示词内容 */}
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

            {/* 4. 底部按钮 */}
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

            {/* 悬浮头像 */}
            {prompt.user_portrait_url && (
                <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full border-4 border-[#f2f4f6] shadow-sm overflow-hidden z-20">
                    <Image src={prompt.user_portrait_url} fill alt="avatar" className="object-cover" unoptimized={isExternalUrl(prompt.user_portrait_url)} />
                </div>
            )}
        </div>
    );
}

// 1. 内部辅助组件（去掉 default）
function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // 2秒后恢复
    } catch (err) {
      console.error('复制失败', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 active:scale-95 ${
        copied ? 'bg-green-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
      }`}
    >
      {copied ? (
        <><span>✓</span><span>已复制</span></>
      ) : (
        <><span>📋</span><span>复制提示词</span></>
      )}
    </button>
  );
}

// 2. 唯一的默认导出
export default function PromptItem({ prompt }: { prompt: any }) {
  return (
    <div className="border rounded-xl p-4">
      {/* ... 其他展示内容 ... */}
      <div className="mt-4">
        <CopyButton content={prompt.content} />
      </div>
    </div>
  );
}