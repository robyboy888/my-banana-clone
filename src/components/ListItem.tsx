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
    // 💥 修正：新增 index 属性的定义
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
 * ListItem 组件：用于列表视图中展示单个 Prompt 的行
 */
export default function ListItem({ prompt, index }: ListItemProps) {
    const [isHovered, setIsHovered] = useState(false);
    const previewImageUrl = prompt.original_image_url;

    return (
        // 限制最大宽度，增加垂直内边距，居中
        <div className="flex items-start space-x-4 border-b border-gray-200 py-4 max-w-4xl mx-auto">
            
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
                <h3 className="text-lg font-bold text-gray-800 truncate mb-1">
                    {prompt.title}
                </h3>
                
                {/* 原始提示词 - 使用 line-clamp-2 */}
                <div className="text-sm text-gray-600 space-y-1">
                    <p className="font-semibold">原始提示词:</p>
                    <p className="line-clamp-2 h-10 overflow-hidden text-gray-700">{prompt.content}</p> 
                </div>

                {/* 优化提示词 (如果存在) */}
                {prompt.optimized_prompt && (
                    <div className="text-sm mt-2 space-y-1">
                        <p className="font-semibold text-gray-600">优化后提示词:</p>
                        <p className="line-clamp-2 h-10 overflow-hidden text-green-700">{prompt.optimized_prompt}</p>
                    </div>
                )}

                {/* 悬浮图片预览 (Tooltip/Popover) */}
                {isHovered && previewImageUrl && (
                    <div 
                        className="absolute top-0 z-50 p-2 bg-white border border-gray-300 rounded-lg shadow-xl"
                        style={{ 
                            // 强制悬浮框在触发元素的右侧显示，避免左侧出框
                            left: '100%', 
                            marginLeft: '15px', // 增加一些间距
                            width: '280px', // 稍微调大一点
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
            <div className="flex flex-col space-y-2 flex-shrink-0 w-36 ml-6">
                <CopyButton
                    textToCopy={prompt.optimized_prompt || prompt.content} 
                    label="复制优化"
                    className="bg-yellow-500 text-white py-2 rounded-md text-sm hover:bg-yellow-600 transition"
                />
                <CopyButton
                    textToCopy={prompt.content} 
                    label="复制原始"
                    className="bg-gray-200 text-gray-800 py-2 rounded-md text-sm hover:bg-gray-300 transition"
                />
            </div>
        </div>
    );
}