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

// 辅助函数：判断是否需要禁用优化 (针对 Supabase/外部 URL)
const isExternalUrl = (url: string | undefined): boolean => {
    if (!url || typeof url !== 'string') {
        return false;
    }
    // 假设您的 Supabase URL 包含 'supabase.co'
    return url.includes('supabase.co');
};


/**
 * PromptItem 组件：用于网格视图中展示单个 Prompt 的卡片 (简化样式修复版)
 */
export default function PromptItem({ prompt }: { prompt: Prompt }) {
    return (
        // 💥 样式修正 1：简化卡片主体样式，使其更轻量化
        <div 
            className="bg-white p-4 rounded-lg shadow-md transition duration-300 border border-gray-200 flex flex-col"
        >
            <h2 className="text-xl font-bold text-gray-800 mb-3 line-clamp-1">{prompt.title}</h2>

            {/* 图片区域 - 仅展示原始图片，并简化布局 */}
            <div className="flex space-x-2 mb-3">
                
                {/* 原始图片容器 */}
                <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-300 flex-shrink-0"> 
                    {prompt.original_image_url ? (
                        <Image
                            src={prompt.original_image_url}
                            alt={`${prompt.title} - 原始`}
                            fill
                            sizes="100vw"
                            className="object-cover" // 使用 object-cover 填充满容器
                            unoptimized={isExternalUrl(prompt.original_image_url)}
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                            等待图片
                        </div>
                    )}
                </div>

                {/* 优化图片容器 (可选，如果前端不展示优化图，可以移除此块) */}
                {prompt.optimized_image_url && (
                    <div className="relative w-full h-40 rounded-lg overflow-hidden border border-green-400 flex-shrink-0">
                        <Image
                            src={prompt.optimized_image_url}
                            alt={`${prompt.title} - 优化`}
                            fill
                            sizes="100vw"
                            className="object-cover"
                            unoptimized={isExternalUrl(prompt.optimized_image_url)}
                        />
                    </div>
                )}
            </div>

            {/* 提示词内容区 */}
            <div className="flex-grow">
                <h3 className="font-semibold text-sm text-gray-600">原始提示词:</h3>
                <p className="text-sm line-clamp-2 mb-2 p-1 bg-gray-50 rounded-md">{prompt.content}</p>

                {prompt.optimized_prompt && (
                    <>
                        <h3 className="font-semibold text-sm text-gray-600 mt-2">优化后提示词:</h3>
                        <p className="text-sm line-clamp-2 p-1 bg-green-50 rounded-md">{prompt.optimized_prompt}</p>
                    </>
                )}
            </div>

            {/* 复制按钮区 - 简化样式 */}
            <div className="mt-4 flex space-x-2">
                <CopyButton
                    textToCopy={prompt.optimized_prompt || prompt.content} 
                    label="复制提示词"
                    // 💥 样式修正 2：使用更中性的颜色
                    className="flex-1 bg-blue-500 text-white py-2 rounded-md text-sm hover:bg-blue-600 transition"
                />
            </div>
        </div>
    );
}