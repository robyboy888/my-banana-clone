// /src/components/ListItem.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import CopyButton from './CopyButton'; 
// 确保 Prompt 类型被正确导入
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

interface ListItemProps {
    prompt: Prompt;
    // 列表视图需要接收 index
    index: number; 
}

// 辅助函数：判断是否需要禁用优化 (针对 Supabase/外部 URL)
const isExternalUrl = (url: string | undefined): boolean => {
    if (!url || typeof url !== 'string') {
        return false;
    }
    return url.includes('supabase.co');
};


/**
 * ListItem 组件：用于列表视图中展示单个 Prompt 的行 (最终样式修正版)
 */
export default function ListItem({ prompt, index }: ListItemProps) {
    const [isHovered, setIsHovered] = useState(false);
    const previewImageUrl = prompt.original_image_url;

    return (
        // 💥 修正 1：将 max-w-4xl 增大到 max-w-6xl 或 max-w-7xl (这里使用 6xl)
        // 增加垂直内边距 (py-5) 使其更高
        <div className="flex items-start space-x-6 border-b border-gray-200 py-5 max-w-6xl mx-auto">
            
            {/* 0. 行号显示 */}
            <div className="flex-shrink-0 w-8 pt-1 text-lg font-bold text-gray-400">
                {index}.
            </div>

            {/* 1. 悬浮图片触发区域 (Title & Content) */}
            <div 
                className="flex-1 min-w-0 relative"
                onMouseEnter={() => previewImageUrl && setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* 标题 */}
                <h3 className="text-lg font-bold text-gray-800 truncate mb-2">
                    {prompt.title}
                </h3>
                
                {/* 原始提示词 - 使用 line-clamp-2 */}
                <div className="text-sm text-gray-600 space-y-1">
                    <p className="font-semibold">原始提示词:</p>
                    {/* h-10 保证了行高 */}
                    <p className="line-clamp-2 h-10 overflow-hidden text-gray-700">{prompt.content}</p> 
                </div>

                {/* 优化提示词 (如果存在) */}
                {prompt.optimized_prompt && (
                    <div className="text-sm mt-3 space-y-1">
                        <p className="font-semibold text-gray-600">优化后提示词:</p>
                        <p className="line-clamp-2 h-10 overflow-hidden text-green-700">{prompt.optimized_prompt}</p>
                    </div>
                )}

                {/* 悬浮图片预览 (Tooltip/Popover) */}
                {isHovered && previewImageUrl && (
                    <div 
                        className="absolute top-0 z-50 p-2 bg-white border border-gray-300 rounded-lg shadow-xl"
                        style={{ 
                            left: '100%', 
                            // 增加 marginLeft 保证悬浮框和文本区有更多间隔
                            marginLeft: '40px', 
                            width: '280px', 
                            height: 'auto'
                        }}
                    >
                        <p className="text-sm font-semibold mb-1 text-gray-700">图片预览:</p>
                        <div className="relative w-full h-40 overflow-hidden rounded-md">
                            <Image
                                src={previewImageUrl}
                                alt={`${prompt.title} 预览`}
                                fill
                                sizes="280px"
                                className="object-contain"
                                unoptimized={isExternalUrl(previewImageUrl)}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* 2. 复制按钮区域 */}
            {/* 💥 修正 2：增加按钮区域的宽度 (w-48) 和按钮间的空间 (space-y-4) */}
            <div className="flex flex-col space-y-4 flex-shrink-0 w-48 ml-6">
                <CopyButton
                    textToCopy={prompt.optimized_prompt || prompt.content} 
                    label="复制优化提示词"
                    className="bg-yellow-500 text-white py-2 rounded-md text-sm hover:bg-yellow-600 transition"
                />
                <CopyButton
                    textToCopy={prompt.content} 
                    label="复制原始提示词"
                    className="bg-gray-200 text-gray-800 py-2 rounded-md text-sm hover:bg-gray-300 transition"
                />
            </div>
        </div>
    );
}