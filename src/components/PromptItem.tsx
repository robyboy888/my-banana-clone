// /src/components/PromptItem.tsx
'use client';

import Image from 'next/image';
import CopyButton from './CopyButton'; 
import React from 'react';

// 确保 Prompt 接口定义与 PromptList 中的定义一致
interface Prompt {
    id: number;
    title: string;
    content: string;
    original_image_url: string; 
    optimized_prompt?: string;
    optimized_image_url?: string;
    user_portrait_url?: string;
    user_background_url?: string;
}

// -----------------------------------------------------------------
// 💥 关键修复点 1：确保函数返回严格的 boolean 类型
// -----------------------------------------------------------------
const isExternalUrl = (url: string | undefined): boolean => {
    if (!url || typeof url !== 'string') {
        return false;
    }
    return url.includes('supabase.co');
};


/**
 * PromptItem 组件：用于网格视图中展示单个 Prompt 的大卡片 (样式恢复版)
 */
export default function PromptItem({ prompt }: { prompt: Prompt }) {
    
    // 这是您原先在 app/page.tsx 中循环渲染的全部 JSX 逻辑
    return (
        <div 
            // 样式恢复到您满意的版本：p-6, shadow-xl, border-yellow-300
            className="bg-white p-6 rounded-xl shadow-xl transition duration-300 border border-yellow-300 flex flex-col"
        >
            <h2 className="text-2xl font-bold text-yellow-700 mb-4">{prompt.title}</h2>

            {/* 用户参考图片 (肖像 + 背景) */}
            {(prompt.user_portrait_url || prompt.user_background_url) && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-bold text-blue-700 mb-2 text-sm">用户参考输入：</h3>
                    <div className="flex space-x-2">
                        {/* 个人肖像 */}
                        {prompt.user_portrait_url && (
                            <div className="relative w-1/2 h-20 rounded-lg overflow-hidden border border-red-400">
                                <Image 
                                    src={prompt.user_portrait_url}
                                    alt="用户肖像"
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    // 💥 关键修复点 2：添加 unoptimized 属性
                                    unoptimized={isExternalUrl(prompt.user_portrait_url)}
                                />
                                <span className="absolute top-0 left-0 bg-red-600 text-white text-xs px-1">肖像</span>
                            </div>
                        )}
                        {/* 背景风景 */}
                        {prompt.user_background_url && (
                            <div className="relative w-1/2 h-20 rounded-lg overflow-hidden border border-green-400">
                                <Image 
                                    src={prompt.user_background_url}
                                    alt="用户背景"
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    // 💥 关键修复点 2：添加 unoptimized 属性
                                    unoptimized={isExternalUrl(prompt.user_background_url)}
                                />
                                <span className="absolute top-0 left-0 bg-green-600 text-white text-xs px-1">背景</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* 原始图片与优化图片对比区 */}
            <div className="flex space-x-2 mb-4">
                
                {/* 原始图片 */}
                {prompt.original_image_url && (
                    <div className="relative w-1/2 h-36 rounded-lg overflow-hidden border-2 border-dashed border-gray-300"> 
                        <Image
                            src={prompt.original_image_url}
                            alt={`${prompt.title} - 原始`}
                            fill
                            sizes="33vw"
                            style={{ objectFit: 'cover' }}
                            // 💥 关键修复点 2：添加 unoptimized 属性
                            unoptimized={isExternalUrl(prompt.original_image_url)}
                        />
                        <span className="absolute bottom-0 right-0 bg-gray-900 text-white text-xs px-1 rounded-tl-lg">原始图</span>
                    </div>
                )}

                {/* 优化后图片 (如果存在) */}
                {prompt.optimized_image_url ? (
                    <div className="relative w-1/2 h-36 rounded-lg overflow-hidden border-2 border-green-500"> 
                        <Image
                            src={prompt.optimized_image_url}
                            alt={`${prompt.title} - 优化`}
                            fill
                            sizes="33vw"
                            style={{ objectFit: 'cover' }}
                            // 💥 关键修复点 2：添加 unoptimized 属性
                            unoptimized={isExternalUrl(prompt.optimized_image_url)}
                        />
                        <span className="absolute bottom-0 right-0 bg-green-600 text-white text-xs px-1 rounded-tl-lg">优化图</span>
                    </div>
                ) : (
                    // 优化图片占位符
                    <div className="w-1/2 h-36 bg-gray-100 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-400 text-xs text-gray-500">
                        等待优化图片
                    </div>
                )}
            </div>
            
            {/* 提示词对比区 */}
            <div className="flex-grow">
                <h3 className="font-semibold text-gray-800 mt-2">原始提示词:</h3>
                <p className="text-gray-600 text-sm line-clamp-3 mb-2 p-2 bg-yellow-50 rounded-md border">{prompt.content}</p>

                <h3 className="font-semibold text-gray-800 mt-2">优化后提示词:</h3>
                {prompt.optimized_prompt ? (
                    <p className="text-green-700 text-sm line-clamp-3 p-2 bg-green-50 rounded-md border border-green-200">{prompt.optimized_prompt}</p>
                ) : (
                    <p className="text-gray-500 text-sm italic p-2 bg-gray-50 rounded-md border">暂无优化提示词。</p>
                )}
            </div>

            {/* 复制按钮区 */}
            <div className="mt-4 flex space-x-2">
                {/* 1. 复制优化提示词 */}
                <CopyButton
                    textToCopy={prompt.optimized_prompt || prompt.content} 
                    label="复制优化提示词"
                    className="flex-1 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition"
                />
                
                {/* 2. 复制原始提示词 */}
                <CopyButton
                    textToCopy={prompt.content} 
                    label="复制原始提示词"
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
                />
            </div>
        </div>
    );
}